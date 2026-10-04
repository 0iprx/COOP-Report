import { prisma } from '../db.js';
import { logger } from '../logger.js';
import {
  EntryDTO,
  PeriodDescriptor,
  PeriodReportActivityRow,
  PeriodReportContent,
  PeriodReportSection,
  PeriodReportStats,
  PeriodReportVersionDTO,
  PeriodSectionKey,
  PeriodType,
  calculateHoursBetween,
  formatDateArabic,
  formatDateEnglish,
  generateAcademicWeeklySynthesis,
  parseStructuredDailyNarrative
} from '@coop/shared';
import { buildFinalReportData } from './reportService.js';
import { analyzeEntry, AnalyzeOptions } from './entryInsightService.js';
import { runLLMChain, translateWithWebAPI } from './aiService.js';
import { JobReporter } from './agentJobService.js';

/**
 * Weekly and monthly cooperative-training (COOP) reports.
 *
 * Structure follows the common university / TVTC co-op progress-report template:
 * executive summary, objectives, (monthly: week-by-week breakdown), tasks performed, knowledge and skills
 * acquired (new vs reinforced, from the analysis agent), challenges and how they were handled, tools and
 * technologies, (monthly: progress against the training plan), self-assessment, plan for the next period,
 * followed by the supervisor sign-off block rendered by the templates.
 *
 * Facts (dates, hours, tasks, skills, tools) are assembled deterministically from the daily log and its
 * analyses; the language model only writes the narrative around them, and is told to stay inside them.
 */

const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const AR_ORDINALS = [
  'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر',
  'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر', 'السادس عشر', 'السابع عشر', 'الثامن عشر',
  'التاسع عشر', 'العشرون'
];

const HEADINGS: Record<PeriodSectionKey, { ar: string; en: string; arMonthly?: string; enMonthly?: string }> = {
  executive_summary: { ar: 'الملخص التنفيذي', en: 'Executive Summary' },
  objectives: { ar: 'أهداف الأسبوع', en: 'Objectives of the Week', arMonthly: 'أهداف الشهر', enMonthly: 'Objectives of the Month' },
  weekly_breakdown: { ar: 'ملخص الأسابيع', en: 'Week-by-Week Breakdown' },
  activities: { ar: 'المهام والأنشطة المنفذة', en: 'Tasks and Activities Performed' },
  skills: { ar: 'المعارف والمهارات المكتسبة', en: 'Knowledge and Skills Acquired' },
  challenges: { ar: 'التحديات وطرق التعامل معها', en: 'Challenges and How They Were Addressed' },
  tools: { ar: 'الأدوات والتقنيات المستخدمة', en: 'Tools and Technologies Used' },
  progress: { ar: 'التقدم مقارنة بخطة التدريب', en: 'Progress Against the Training Plan' },
  reflection: { ar: 'التقييم الذاتي والتأمل', en: 'Self-Assessment and Reflection' },
  next_plan: { ar: 'خطة الأسبوع القادم', en: 'Plan for Next Week', arMonthly: 'خطة الشهر القادم', enMonthly: 'Plan for Next Month' }
};

const WEEKLY_ORDER: PeriodSectionKey[] = [
  'executive_summary', 'objectives', 'activities', 'skills', 'challenges', 'tools', 'reflection', 'next_plan'
];
const MONTHLY_ORDER: PeriodSectionKey[] = [
  'executive_summary', 'objectives', 'weekly_breakdown', 'activities', 'skills', 'challenges', 'tools', 'progress',
  'reflection', 'next_plan'
];

function heading(key: PeriodSectionKey, type: PeriodType, lang: 'ar' | 'en'): string {
  const h = HEADINGS[key];
  if (type === 'monthly') return (lang === 'ar' ? h.arMonthly : h.enMonthly) || h[lang];
  return h[lang];
}

function monthLabel(key: string, lang: 'ar' | 'en'): string {
  const [y, m] = key.split('-').map(Number);
  return lang === 'ar' ? `شهر ${AR_MONTHS[m - 1]} ${y}` : `${EN_MONTHS[m - 1]} ${y}`;
}

function weekLabel(index: number, lang: 'ar' | 'en'): string {
  return lang === 'ar' ? `الأسبوع ${AR_ORDINALS[index - 1] || index}` : `Week ${index}`;
}

function lastDayOfMonth(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, m, 0));
  return d.toISOString().split('T')[0];
}

interface PeriodData {
  type: PeriodType;
  key: string;
  start: string;
  end: string;
  entries: EntryDTO[];
  weekIndexOf: (date: string) => number;
  nextEntries: EntryDTO[];
  cumulativeHours: number;
  plannedHours: number;
  profile: Awaited<ReturnType<typeof buildFinalReportData>>['profile'];
}

async function loadPeriodData(userId: number, type: PeriodType, key: string): Promise<PeriodData> {
  const report = await buildFinalReportData(userId);
  const all = report.weeks.flatMap((w) => w.entries);
  const weekIndexOf = (date: string) => report.weeks.find((w) => date >= w.weekStart && date <= w.weekEnd)?.weekIndex || 0;

  let start: string;
  let end: string;
  let entries: EntryDTO[];
  if (type === 'weekly') {
    const week = report.weeks.find((w) => String(w.weekIndex) === key);
    if (!week) throw Object.assign(new Error('الأسبوع المطلوب غير موجود في خطة التدريب'), { status: 404 });
    start = week.weekStart;
    end = week.weekEnd;
    entries = week.entries;
  } else {
    if (!/^\d{4}-\d{2}$/.test(key)) throw Object.assign(new Error('صيغة الشهر غير صحيحة'), { status: 400 });
    start = `${key}-01`;
    end = lastDayOfMonth(key);
    entries = all.filter((e) => e.entryDate.startsWith(key));
  }
  if (entries.length === 0) {
    throw Object.assign(new Error('لا توجد يوميات مسجلة في هذه الفترة لإنشاء تقرير عنها'), { status: 400 });
  }

  const nextEntries = all.filter((e) => e.entryDate > end).slice(0, 8);
  const cumulativeHours = all
    .filter((e) => e.entryDate <= end)
    .reduce((s, e) => s + calculateHoursBetween(e.timeFrom, e.timeTo), 0);

  return {
    type,
    key,
    start,
    end,
    entries,
    weekIndexOf,
    nextEntries,
    cumulativeHours: Number(cumulativeHours.toFixed(1)),
    plannedHours: report.profile.courseHours || 280,
    profile: report.profile
  };
}

export async function listPeriods(userId: number): Promise<{ weekly: PeriodDescriptor[]; monthly: PeriodDescriptor[] }> {
  const report = await buildFinalReportData(userId);
  const versions = await prisma.periodReport.groupBy({
    by: ['periodType', 'periodKey'],
    where: { userId },
    _max: { version: true }
  });
  const latest = new Map(versions.map((v) => [`${v.periodType}:${v.periodKey}`, v._max.version ?? null]));

  const weekly: PeriodDescriptor[] = report.weeks
    .filter((w) => w.entries.length > 0)
    .map((w) => ({
      periodType: 'weekly',
      periodKey: String(w.weekIndex),
      label: weekLabel(w.weekIndex, 'ar'),
      labelEn: weekLabel(w.weekIndex, 'en'),
      periodStart: w.weekStart,
      periodEnd: w.weekEnd,
      entryCount: w.entries.length,
      hours: w.totalHours,
      latestVersion: latest.get(`weekly:${w.weekIndex}`) ?? null
    }));

  const months = new Map<string, EntryDTO[]>();
  for (const w of report.weeks) {
    for (const e of w.entries) {
      const k = e.entryDate.slice(0, 7);
      if (!months.has(k)) months.set(k, []);
      months.get(k)!.push(e);
    }
  }
  const monthly: PeriodDescriptor[] = Array.from(months.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, es]) => ({
      periodType: 'monthly',
      periodKey: k,
      label: monthLabel(k, 'ar'),
      labelEn: monthLabel(k, 'en'),
      periodStart: `${k}-01`,
      periodEnd: lastDayOfMonth(k),
      entryCount: es.length,
      hours: Number(es.reduce((s, e) => s + calculateHoursBetween(e.timeFrom, e.timeTo), 0).toFixed(1)),
      latestVersion: latest.get(`monthly:${k}`) ?? null
    }));

  return { weekly, monthly };
}

// ---------------------------------------------------------------------------
// Narrative generation
// ---------------------------------------------------------------------------

const NARRATIVE_SYSTEM_PROMPT = `أنت خبير أكاديمي في كتابة تقارير التدريب التعاوني (COOP) الأسبوعية والشهرية للجامعات والكليات التقنية في المملكة العربية السعودية.
تكتب بلغة عربية فصحى رسمية دقيقة، بصيغة المتكلم المهنية للمتدرب (نفّذتُ، تعلّمتُ) أو المبني للمجهول المؤسسي، وبفقرات متصلة مترابطة.
قواعد صارمة: التزم حصراً بالوقائع المرفقة (المهام، الأدوات، الساعات، المهارات)، ولا تختلق أي رقم أو أداة أو حدث. لا إيموجي. لا تستخدم كلمة (معتمد) أو مشتقاتها.
التقرير ليس يوميات: لا تسرد الأيام يوماً بيوم ولا تبدأ الفقرات بالتواريخ. اجمع أعمال الفترة في محاور عمل (مثل: تهيئة الشبكات، دعم المستخدمين، التوثيق) واكتب كل محور كوحدة واحدة توضح الغاية وما أُنجز والنتيجة، بحيث يفهم القارئ صورة العمل كاملة دون الرجوع لليوميات. جدول المهام اليومية مرفق آلياً في التقرير فلا تكرره.
نوّع الأسلوب بين الأقسام: الملخص التنفيذي موجز ومباشر يبرز أهم ما تحقق، الأنشطة سرد إجرائي مجمّع حسب المحاور، التحديات بمنهجية (الموقف ثم الإجراء ثم النتيجة)، والتقييم الذاتي تأملي صادق.
أعد الإجابة بصيغة JSON صالحة فقط (json object).`;

function shortText(text: string, max: number): string {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

function buildDigest(data: PeriodData): string {
  const perEntry = data.type === 'monthly' ? 240 : 520;
  return data.entries
    .map((e) => {
      const ins = e.insight;
      const parsed = parseStructuredDailyNarrative(e.description);
      const hours = calculateHoursBetween(e.timeFrom, e.timeTo);
      const parts = [
        `- ${e.entryDate} (${hours} ساعة) [${ins ? ins.learningStatus : 'غير مصنف'}] ${ins?.correctedTitle || e.title}`,
        ins?.goal ? `  الهدف: ${shortText(ins.goal, perEntry / 3)}` : '',
        `  ما نُفّذ: ${shortText(ins?.actionsDone || e.description, perEntry / 2)}`,
        ins?.learnedWhat ? `  ما تُعلّم: ${shortText(ins.learnedWhat, perEntry / 3)}` : '',
        parsed.challenges ? `  تحدٍّ مذكور: ${shortText(parsed.challenges, 160)}` : ''
      ];
      return parts.filter(Boolean).join('\n');
    })
    .join('\n');
}

const NARRATIVE_SCHEMA_WEEKLY = {
  type: 'object',
  properties: {
    executiveSummary: { type: 'string' },
    objectives: { type: 'array', items: { type: 'string' } },
    activitiesNarrative: { type: 'string' },
    skillsNarrative: { type: 'string' },
    challenges: { type: 'string' },
    reflection: { type: 'string' },
    nextPlan: { type: 'array', items: { type: 'string' } }
  }
} as const;

const NARRATIVE_SCHEMA_MONTHLY = {
  type: 'object',
  properties: {
    ...NARRATIVE_SCHEMA_WEEKLY.properties,
    weeklyBreakdown: { type: 'array', items: { type: 'string' } },
    progress: { type: 'string' }
  }
} as const;

interface Narrative {
  executiveSummary: string;
  objectives: string[];
  activitiesNarrative: string;
  skillsNarrative: string;
  challenges: string;
  reflection: string;
  nextPlan: string[];
  weeklyBreakdown?: string[];
  progress?: string;
}

function strArr(v: unknown, max = 8): string[] {
  return (Array.isArray(v) ? v : [])
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter(Boolean)
    .slice(0, max);
}

function parseJson(raw: string | null): any | null {
  if (!raw) return null;
  const s = raw.indexOf('{');
  const e = raw.lastIndexOf('}');
  if (s === -1 || e <= s) return null;
  try {
    return JSON.parse(raw.slice(s, e + 1));
  } catch {
    return null;
  }
}

/** One paragraph per work area (category), merging the days that belong to it */
function thematicActivities(entries: EntryDTO[]): string {
  const groups = new Map<string, EntryDTO[]>();
  for (const e of entries) {
    const k = e.category || 'أخرى';
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(e);
  }
  return Array.from(groups.entries())
    .map(([area, es]) => {
      const tasks = Array.from(new Set(es.map((e) => e.insight?.correctedTitle || e.title))).join('، ');
      const results = es
        .map((e) => e.insight?.actionsDone)
        .filter(Boolean)
        .map((t) => shortText(t!, 220))
        .slice(0, 2)
        .join(' ');
      return `${area}: شمل هذا المحور ${tasks}.${results ? ` ${results}` : ''}`;
    })
    .join('\n\n');
}

function fallbackNarrative(data: PeriodData, stats: PeriodReportStats, newSkills: string[], tools: string[]): Narrative {
  const label = data.type === 'weekly' ? weekLabel(Number(data.key), 'ar') : monthLabel(data.key, 'ar');
  const synthesis = generateAcademicWeeklySynthesis(data.entries, label, stats.hours, true);
  const titles = data.entries.map((e) => e.insight?.correctedTitle || e.title);
  const challenges = data.entries
    .map((e) => parseStructuredDailyNarrative(e.description).challenges)
    .filter(Boolean) as string[];

  const weeks = new Map<number, EntryDTO[]>();
  for (const e of data.entries) {
    const w = data.weekIndexOf(e.entryDate);
    if (!weeks.has(w)) weeks.set(w, []);
    weeks.get(w)!.push(e);
  }

  return {
    executiveSummary: synthesis.executiveSummary,
    objectives: Array.from(new Set(data.entries.map((e) => e.insight?.goal).filter(Boolean) as string[])).slice(0, 5),
    activitiesNarrative: thematicActivities(data.entries) || synthesis.fullNarrative || titles.join('، '),
    skillsNarrative: newSkills.length
      ? `اكتسبتُ خلال هذه الفترة ${newSkills.length} معرفة جديدة، إلى جانب تعزيز مهارات سبق التعرف عليها من خلال الممارسة المتكررة.`
      : 'تركزت هذه الفترة على تعزيز المهارات التي سبق اكتسابها وتطبيقها في مهام ميدانية متنوعة.',
    challenges: challenges.length
      ? challenges.join(' ')
      : 'لم تُسجَّل تحديات جوهرية في اليوميات خلال هذه الفترة، وجرى تنفيذ المهام وفق الإجراءات المتبعة.',
    reflection: `أسهمت هذه الفترة في رفع جاهزيتي المهنية، إذ نفّذتُ ${stats.entries} مهمة على مدى ${stats.days} أيام عمل بإجمالي ${stats.hours} ساعة${
      tools.length ? `، مع توظيف ${tools.slice(0, 5).join('، ')}` : ''
    }.`,
    nextPlan: data.nextEntries.length
      ? Array.from(new Set(data.nextEntries.map((e) => e.insight?.correctedTitle || e.title))).slice(0, 4)
      : ['مواصلة تنفيذ المهام الموكلة وتعميق المهارات المكتسبة في هذه الفترة.'],
    weeklyBreakdown: Array.from(weeks.entries()).map(
      ([w, es]) => `${weekLabel(w, 'ar')}: ${Array.from(new Set(es.map((e) => e.insight?.correctedTitle || e.title))).slice(0, 3).join('، ')}.`
    ),
    progress: `بلغ إجمالي الساعات المنجزة حتى نهاية هذه الفترة ${stats.cumulativeHours} ساعة من أصل ${stats.plannedHours} ساعة مخططة (${Math.min(
      100,
      Math.round((stats.cumulativeHours / Math.max(stats.plannedHours, 1)) * 100)
    )}%).`
  };
}

async function writeNarrative(
  data: PeriodData,
  stats: PeriodReportStats,
  newSkills: string[],
  reinforcedSkills: string[],
  tools: string[],
  opts: AnalyzeOptions
): Promise<{ narrative: Narrative; mode: 'llm' | 'fallback' }> {
  const fallback = fallbackNarrative(data, stats, newSkills, tools);
  const label = data.type === 'weekly' ? weekLabel(Number(data.key), 'ar') : monthLabel(data.key, 'ar');
  const monthly = data.type === 'monthly';

  const prompt = `اكتب محتوى التقرير ${monthly ? 'الشهري' : 'الأسبوعي'} للتدريب التعاوني عن (${label}) من ${data.start} إلى ${data.end}.
جهة التدريب: ${data.profile.entityAddress || 'غير محددة'} | القسم: ${data.profile.trainingUnit || data.profile.department || 'غير محدد'}
الإحصاءات: ${stats.entries} مهمة، ${stats.days} أيام عمل، ${stats.hours} ساعة. المعارف الجديدة: ${stats.newCount}، التعزيز: ${stats.reinforcedCount}، المتكرر: ${stats.routineCount}.
الساعات التراكمية: ${stats.cumulativeHours} من ${stats.plannedHours}.

اليوميات المحللة:
${buildDigest(data)}

المعارف الجديدة المستخلصة: ${newSkills.map((s) => shortText(s, 120)).join(' | ') || 'لا يوجد'}
المهارات المعززة: ${reinforcedSkills.map((s) => shortText(s, 100)).join(' | ') || 'لا يوجد'}
الأدوات: ${tools.join('، ') || 'غير مذكورة'}
${data.nextEntries.length ? `المهام المسجلة في الفترة التالية (استخدمها لخطة الفترة القادمة): ${data.nextEntries.map((e) => e.title).join(' | ')}` : 'لا توجد يوميات للفترة التالية بعد؛ اجعل الخطة امتداداً منطقياً للمهام الحالية دون اختلاق تفاصيل.'}

أعد JSON بالمفاتيح:
executiveSummary: فقرة من 4-6 أسطر.
objectives: من 3 إلى 5 أهداف قصيرة مستنبطة من أهداف المهام.
activitiesNarrative: من 2 إلى 4 فقرات، كل فقرة تمثل محور عمل واحداً تبدأ باسم المحور ثم نقطتين، وتجمع كل ما يخصه من أيام مختلفة (الغاية، ما أُنجز، النتيجة).
skillsNarrative: فقرة تميّز بين المعارف الجديدة وما تم تعزيزه.
challenges: فقرة (الموقف، الإجراء، النتيجة) للتحديات المذكورة فقط، وإن لم توجد فاذكر ذلك بوضوح.
reflection: فقرة تأملية صادقة عن التطور المهني.
nextPlan: من 2 إلى 4 بنود.${monthly ? '\nweeklyBreakdown: بند لكل أسبوع يبدأ باسم الأسبوع ويوجز أعماله.\nprogress: فقرة عن التقدم مقارنة بخطة التدريب والساعات.' : ''}`;

  const raw = await runLLMChain(NARRATIVE_SYSTEM_PROMPT, prompt, {
    apiKey: opts.apiKey,
    model: opts.model,
    maxTokens: monthly ? 2600 : 2000,
    temperature: 0.3,
    timeoutMs: 45000,
    jsonMode: true,
    jsonSchema: (monthly ? NARRATIVE_SCHEMA_MONTHLY : NARRATIVE_SCHEMA_WEEKLY) as unknown as Record<string, unknown>,
    waitForLocal: opts.waitForLocal,
    localTimeoutMs: 360000
  }).catch(() => null);
  const p = parseJson(raw);
  if (!p) return { narrative: fallback, mode: 'fallback' };

  const txt = (v: unknown, fb: string) => (typeof v === 'string' && v.trim().length > 20 ? v.trim() : fb);
  return {
    narrative: {
      executiveSummary: txt(p.executiveSummary, fallback.executiveSummary),
      objectives: strArr(p.objectives).length ? strArr(p.objectives) : fallback.objectives,
      activitiesNarrative: txt(p.activitiesNarrative, fallback.activitiesNarrative),
      skillsNarrative: txt(p.skillsNarrative, fallback.skillsNarrative),
      challenges: txt(p.challenges, fallback.challenges),
      reflection: txt(p.reflection, fallback.reflection),
      nextPlan: strArr(p.nextPlan).length ? strArr(p.nextPlan) : fallback.nextPlan,
      weeklyBreakdown: monthly ? (strArr(p.weeklyBreakdown, 6).length ? strArr(p.weeklyBreakdown, 6) : fallback.weeklyBreakdown) : undefined,
      progress: monthly ? txt(p.progress, fallback.progress!) : undefined
    },
    mode: 'llm'
  };
}

function assembleContent(
  data: PeriodData,
  lang: 'ar' | 'en',
  n: Narrative,
  activities: PeriodReportActivityRow[],
  newSkills: string[],
  reinforcedSkills: string[],
  tools: string[]
): PeriodReportContent {
  const type = data.type;
  const sectionBody: Record<PeriodSectionKey, { body: string; items?: string[] }> = {
    executive_summary: { body: n.executiveSummary },
    objectives: { body: '', items: n.objectives },
    weekly_breakdown: { body: '', items: n.weeklyBreakdown || [] },
    activities: { body: n.activitiesNarrative },
    skills: { body: n.skillsNarrative },
    challenges: { body: n.challenges },
    tools: { body: '', items: tools },
    progress: { body: n.progress || '' },
    reflection: { body: n.reflection },
    next_plan: { body: '', items: n.nextPlan }
  };
  const order = type === 'monthly' ? MONTHLY_ORDER : WEEKLY_ORDER;
  const sections: PeriodReportSection[] = order.map((key) => ({ key, heading: heading(key, type, lang), ...sectionBody[key] }));

  const periodName = type === 'weekly' ? weekLabel(Number(data.key), lang) : monthLabel(data.key, lang);
  const range =
    lang === 'ar'
      ? `من ${formatDateArabic(data.start)} إلى ${formatDateArabic(data.end)}`
      : `${formatDateEnglish(data.start)} – ${formatDateEnglish(data.end)}`;
  return {
    title:
      lang === 'ar'
        ? `تقرير التدريب التعاوني ${type === 'weekly' ? 'الأسبوعي' : 'الشهري'} — ${periodName}`
        : `Cooperative Training ${type === 'weekly' ? 'Weekly' : 'Monthly'} Report — ${periodName}`,
    subtitle: range,
    sections,
    activities,
    newSkills,
    reinforcedSkills,
    tools
  };
}

// ---------------------------------------------------------------------------
// English edition
// ---------------------------------------------------------------------------

const TRANSLATE_SYSTEM = `You are a professional Arabic-to-English translator for cooperative-training (co-op) progress reports.
Translate faithfully into formal academic English in first person where the source uses first person. Keep every fact, number,
tool name and acronym exactly. No additions, no omissions, no emojis. Return a valid json object only.`;

async function translateNarrative(n: Narrative, opts: AnalyzeOptions): Promise<Narrative | null> {
  const raw = await runLLMChain(
    TRANSLATE_SYSTEM,
    `Translate every string in this JSON object from Arabic to English, keeping the same keys and array lengths:\n${JSON.stringify(n)}`,
    {
      apiKey: opts.apiKey,
      model: opts.model,
      maxTokens: 3000,
      temperature: 0.1,
      timeoutMs: 45000,
      jsonMode: true,
      jsonSchema: (n.weeklyBreakdown ? NARRATIVE_SCHEMA_MONTHLY : NARRATIVE_SCHEMA_WEEKLY) as unknown as Record<string, unknown>,
      waitForLocal: opts.waitForLocal,
      localTimeoutMs: 360000
    }
  ).catch(() => null);
  const p = parseJson(raw);
  const isEnglish = (s: unknown) => typeof s === 'string' && s.length > 10 && (s.match(/[؀-ۿ]/g) || []).length < s.length * 0.1;
  if (p && isEnglish(p.executiveSummary) && isEnglish(p.activitiesNarrative)) {
    return {
      executiveSummary: p.executiveSummary,
      objectives: strArr(p.objectives),
      activitiesNarrative: p.activitiesNarrative,
      skillsNarrative: String(p.skillsNarrative || ''),
      challenges: String(p.challenges || ''),
      reflection: String(p.reflection || ''),
      nextPlan: strArr(p.nextPlan),
      weeklyBreakdown: n.weeklyBreakdown ? strArr(p.weeklyBreakdown, 6) : undefined,
      progress: n.progress !== undefined ? String(p.progress || '') : undefined
    };
  }

  // Free web translation fallback
  const t = async (s?: string) => (s ? (await translateWithWebAPI(s, 'en')) || '' : '');
  const ta = async (arr?: string[]) => Promise.all((arr || []).map((s) => t(s)));
  const out: Narrative = {
    executiveSummary: await t(n.executiveSummary),
    objectives: await ta(n.objectives),
    activitiesNarrative: await t(n.activitiesNarrative),
    skillsNarrative: await t(n.skillsNarrative),
    challenges: await t(n.challenges),
    reflection: await t(n.reflection),
    nextPlan: await ta(n.nextPlan),
    weeklyBreakdown: n.weeklyBreakdown ? await ta(n.weeklyBreakdown) : undefined,
    progress: n.progress !== undefined ? await t(n.progress) : undefined
  };
  return out.executiveSummary && out.activitiesNarrative ? out : null;
}

async function translateList(items: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const s of items) {
    out.push(/[؀-ۿ]/.test(s) ? (await translateWithWebAPI(s, 'en')) || s : s);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Generation entry point
// ---------------------------------------------------------------------------

export async function generatePeriodReport(
  userId: number,
  tenantId: string,
  type: PeriodType,
  key: string,
  opts: AnalyzeOptions,
  r: JobReporter
): Promise<PeriodReportVersionDTO> {
  r.progress(2, 'جارٍ تجميع يوميات الفترة');
  let data = await loadPeriodData(userId, type, key);

  // 1. Make sure every day of the period has a fresh analysis (classification, goal, learning)
  const pending = data.entries.filter((e) => !e.insight || e.insight.isStale);
  for (let i = 0; i < pending.length; i++) {
    r.progress(5 + (i / pending.length) * 45, `تحليل اليوميات ${i + 1}/${pending.length}: ${pending[i].title}`);
    try {
      await analyzeEntry(userId, pending[i].id, tenantId, opts);
    } catch (err: any) {
      logger.warn({ err: err?.message, entryId: pending[i].id }, 'Entry analysis failed during period report');
    }
  }
  if (pending.length) data = await loadPeriodData(userId, type, key);

  // 2. Facts assembled deterministically
  const activities: PeriodReportActivityRow[] = data.entries.map((e) => ({
    entryId: e.id,
    date: e.entryDate,
    dateLabel: formatDateArabic(e.entryDate),
    title: e.insight?.correctedTitle || e.title,
    summary: shortText(e.insight?.actionsDone || e.description, 260),
    hours: calculateHoursBetween(e.timeFrom, e.timeTo),
    learningStatus: e.insight?.learningStatus
  }));
  const newSkills = data.entries.filter((e) => e.insight?.learningStatus === 'new').map((e) => e.insight!.learnedWhat).filter(Boolean);
  const reinforcedSkills = data.entries
    .filter((e) => e.insight?.learningStatus === 'reinforced')
    .map((e) => e.insight!.learnedWhat)
    .filter(Boolean);
  const tools = Array.from(new Set(data.entries.flatMap((e) => e.insight?.tools || []))).slice(0, 24);
  const stats: PeriodReportStats = {
    hours: Number(activities.reduce((s, a) => s + a.hours, 0).toFixed(1)),
    days: new Set(data.entries.map((e) => e.entryDate)).size,
    entries: data.entries.length,
    newCount: data.entries.filter((e) => e.insight?.learningStatus === 'new').length,
    reinforcedCount: data.entries.filter((e) => e.insight?.learningStatus === 'reinforced').length,
    routineCount: data.entries.filter((e) => e.insight?.learningStatus === 'routine').length,
    cumulativeHours: data.cumulativeHours,
    plannedHours: data.plannedHours
  };

  // 3. Arabic narrative
  r.progress(55, 'كتابة التقرير بالعربية');
  const { narrative, mode } = await writeNarrative(data, stats, newSkills, reinforcedSkills, tools, opts);
  const contentAr = assembleContent(data, 'ar', narrative, activities, newSkills, reinforcedSkills, tools);

  // 4. Save a new version with the Arabic edition before attempting English
  const last = await prisma.periodReport.aggregate({ where: { userId, periodType: type, periodKey: key }, _max: { version: true } });
  const row = await prisma.periodReport.create({
    data: {
      tenantId,
      userId,
      periodType: type,
      periodKey: key,
      version: (last._max.version || 0) + 1,
      periodStart: data.start,
      periodEnd: data.end,
      contentAr: JSON.stringify(contentAr),
      statusAr: 'ready',
      statusEn: 'pending',
      mode,
      stats: JSON.stringify(stats)
    }
  });

  // 5. English edition (independent)
  r.progress(78, 'إعداد النسخة الإنجليزية');
  await buildEnglishEdition(row.id, data, narrative, activities, newSkills, reinforcedSkills, tools, opts);

  r.progress(100, 'اكتمل التقرير');
  return (await getPeriodReport(userId, row.id))!;
}

async function buildEnglishEdition(
  reportId: number,
  data: PeriodData,
  narrative: Narrative,
  activities: PeriodReportActivityRow[],
  newSkills: string[],
  reinforcedSkills: string[],
  tools: string[],
  opts: AnalyzeOptions
): Promise<void> {
  try {
    const en = await translateNarrative(narrative, opts);
    if (!en) throw new Error('translation unavailable');
    const byId = new Map(data.entries.map((e) => [e.id, e]));
    const enActivities: PeriodReportActivityRow[] = [];
    for (const a of activities) {
      const ins = byId.get(a.entryId)?.insight?.en;
      enActivities.push({
        ...a,
        dateLabel: formatDateEnglish(a.date),
        title: ins?.title || (await translateWithWebAPI(a.title, 'en')) || a.title,
        summary: shortText(ins?.actionsDone || (await translateWithWebAPI(a.summary, 'en')) || a.summary, 260)
      });
    }
    const enNew = data.entries.filter((e) => e.insight?.learningStatus === 'new').map((e) => e.insight?.en?.learnedWhat || '');
    const enReinforced = data.entries
      .filter((e) => e.insight?.learningStatus === 'reinforced')
      .map((e) => e.insight?.en?.learnedWhat || '');
    const contentEn = assembleContent(
      data,
      'en',
      en,
      enActivities,
      enNew.every(Boolean) ? enNew : await translateList(newSkills),
      enReinforced.every(Boolean) ? enReinforced : await translateList(reinforcedSkills),
      tools
    );
    await prisma.periodReport.update({ where: { id: reportId }, data: { contentEn: JSON.stringify(contentEn), statusEn: 'ready' } });
  } catch (err: any) {
    logger.warn({ err: err?.message, reportId }, 'English edition of period report failed; Arabic edition kept');
    await prisma.periodReport.update({ where: { id: reportId }, data: { statusEn: 'failed' } });
  }
}

/** Re-runs only the English edition of an existing version (the Arabic edition is untouched) */
export async function retryEnglishEdition(userId: number, reportId: number, opts: AnalyzeOptions): Promise<PeriodReportVersionDTO> {
  const row = await prisma.periodReport.findFirst({ where: { id: reportId, userId } });
  if (!row || !row.contentAr) throw Object.assign(new Error('التقرير غير موجود'), { status: 404 });
  const ar: PeriodReportContent = JSON.parse(row.contentAr);
  const data = await loadPeriodData(userId, row.periodType as PeriodType, row.periodKey);
  const get = (k: PeriodSectionKey) => ar.sections.find((s) => s.key === k);
  const narrative: Narrative = {
    executiveSummary: get('executive_summary')?.body || '',
    objectives: get('objectives')?.items || [],
    activitiesNarrative: get('activities')?.body || '',
    skillsNarrative: get('skills')?.body || '',
    challenges: get('challenges')?.body || '',
    reflection: get('reflection')?.body || '',
    nextPlan: get('next_plan')?.items || [],
    weeklyBreakdown: row.periodType === 'monthly' ? get('weekly_breakdown')?.items || [] : undefined,
    progress: row.periodType === 'monthly' ? get('progress')?.body || '' : undefined
  };
  await buildEnglishEdition(row.id, data, narrative, ar.activities, ar.newSkills, ar.reinforcedSkills, ar.tools, opts);
  return (await getPeriodReport(userId, row.id))!;
}

function toDTO(row: any, withContent: boolean): PeriodReportVersionDTO {
  const parse = (s?: string | null) => {
    if (!s) return null;
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };
  return {
    id: row.id,
    periodType: row.periodType,
    periodKey: row.periodKey,
    version: row.version,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    statusAr: row.statusAr,
    statusEn: row.statusEn,
    mode: row.mode,
    stats: parse(row.stats) || {},
    createdAt: row.createdAt.toISOString(),
    ...(withContent ? { contentAr: parse(row.contentAr), contentEn: parse(row.contentEn) } : {})
  };
}

export async function listVersions(userId: number, type: PeriodType, key: string): Promise<PeriodReportVersionDTO[]> {
  const rows = await prisma.periodReport.findMany({
    where: { userId, periodType: type, periodKey: key },
    orderBy: { version: 'desc' },
    select: {
      id: true, periodType: true, periodKey: true, version: true, periodStart: true, periodEnd: true,
      statusAr: true, statusEn: true, mode: true, stats: true, createdAt: true
    }
  });
  return rows.map((r) => toDTO(r, false));
}

export async function getPeriodReport(userId: number, id: number): Promise<PeriodReportVersionDTO | null> {
  const row = await prisma.periodReport.findFirst({ where: { id, userId } });
  return row ? toDTO(row, true) : null;
}
