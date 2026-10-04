import crypto from 'node:crypto';
import { prisma } from '../db.js';
import { logger } from '../logger.js';
import {
  EntryInsightDTO,
  EntryInsightRelatedRef,
  LearningStatus,
  RewriteStyleId,
  parseStructuredDailyNarrative
} from '@coop/shared';
import { runLLMChain, applyArabicSpellCorrections, translateWithWebAPI } from './aiService.js';

/**
 * Daily-entry analysis agent.
 *
 * For one entry it: (1) corrects the language without changing facts, (2) extracts the goal,
 * what the trainee actually did and what was learned, and (3) decides whether the learning is
 * new, a reinforcement of something earlier, or a routine repeat — by reading every earlier
 * entry of the same trainee and the analyses already produced for them.
 *
 * The result is stored in `entry_insights`; the entry itself is never modified here.
 */

interface EntryRow {
  id: number;
  entryDate: string;
  title: string;
  category: string;
  description: string;
}

interface PriorKnowledge {
  entry: EntryRow;
  learnedWhat?: string;
  tools?: string[];
}

export interface AnalyzeOptions {
  apiKey?: string;
  model?: string;
  /** Background jobs wait for the built-in model to finish loading instead of falling back */
  waitForLocal?: boolean;
}

// ---------------------------------------------------------------------------
// Text normalisation & similarity (deterministic signals fed to the agent)
// ---------------------------------------------------------------------------

const AR_STOPWORDS = new Set(
  [
    'في', 'من', 'على', 'الى', 'إلى', 'عن', 'مع', 'ثم', 'او', 'أو', 'ان', 'أن', 'إن', 'كان', 'كانت', 'تم', 'هذا', 'هذه',
    'ذلك', 'تلك', 'التي', 'الذي', 'الذين', 'وقد', 'قد', 'كما', 'حيث', 'بعد', 'قبل', 'خلال', 'عند', 'بين', 'حول', 'لدى',
    'جميع', 'كل', 'بعض', 'غير', 'ايضا', 'أيضا', 'أيضاً', 'اليوم', 'يوم', 'وتم', 'وكذلك', 'كذلك', 'هناك', 'هو', 'هي',
    'نحن', 'انا', 'أنا', 'لقد', 'بها', 'فيها', 'منها', 'عليها', 'لها', 'له', 'به', 'فيه', 'منه', 'عليه', 'الي', 'علي',
    'جرى', 'قمت', 'قمنا', 'وقمت', 'وقمنا', 'باستخدام', 'بواسطة', 'عملية', 'العمل', 'عمل', 'المهمة', 'مهمة', 'مهام',
    'المهام', 'الفريق', 'فريق', 'تنفيذ', 'التدريب', 'المتدرب', 'الموقع', 'الفترة', 'صباحا', 'مساء', 'ساعة', 'ساعات'
  ].map(normalizeArabic)
);

const EN_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'was', 'were', 'are', 'has', 'have', 'had', 'into', 'onto', 'our',
  'their', 'then', 'than', 'also', 'using', 'used', 'use', 'day', 'today', 'task', 'tasks', 'work', 'team', 'did', 'done'
]);

function normalizeArabic(text: string): string {
  return text
    .replace(/[ً-ٰٟـ]/g, '') // tashkeel + tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .toLowerCase();
}

function lightStem(word: string): string {
  if (/^[a-z0-9]/.test(word)) return word;
  let w = word;
  for (const p of ['وبال', 'وال', 'بال', 'كال', 'فال', 'لل', 'ال']) {
    if (w.startsWith(p) && w.length - p.length >= 3) {
      w = w.slice(p.length);
      break;
    }
  }
  if (w.length > 4 && /^[وفب]/.test(w)) w = w.slice(1);
  for (const s of ['ات', 'ون', 'ين', 'ها', 'هم', 'يه', 'ه']) {
    if (w.endsWith(s) && w.length - s.length >= 3) {
      w = w.slice(0, -s.length);
      break;
    }
  }
  return w;
}

/** Weighted term bag: technical Latin terms weigh more than common Arabic words */
function termBag(text: string): Map<string, number> {
  const bag = new Map<string, number>();
  const norm = normalizeArabic(text);
  const tokens = norm.match(/[a-z][a-z0-9+#./-]{1,}|[0-9]+[a-z]+[a-z0-9]*|[ء-ي]{3,}/g) || [];
  for (const raw of tokens) {
    const t = raw.replace(/[./-]+$/, '');
    if (t.length < 2) continue;
    const isLatin = /^[a-z0-9]/.test(t);
    if (isLatin ? EN_STOPWORDS.has(t) : AR_STOPWORDS.has(t)) continue;
    const key = lightStem(t);
    if (!isLatin && (key.length < 3 || AR_STOPWORDS.has(key))) continue;
    const weight = isLatin ? 2.5 : 1;
    bag.set(key, Math.max(bag.get(key) || 0, weight));
  }
  return bag;
}

function bagWeight(bag: Map<string, number>): number {
  let sum = 0;
  for (const w of bag.values()) sum += w;
  return sum;
}

/** Share of the current entry's weighted terms that also occur in the other entry */
function containment(current: Map<string, number>, other: Map<string, number>): number {
  const total = bagWeight(current);
  if (total === 0) return 0;
  let shared = 0;
  for (const [term, w] of current) if (other.has(term)) shared += w;
  return shared / total;
}

/** Technical terms written in Latin script (tools, protocols, products) */
export function extractTechTerms(text: string): string[] {
  const found = text.match(/\b[A-Za-z][A-Za-z0-9+#.\-/]*[A-Za-z0-9+#]\b/g) || [];
  const seen = new Map<string, string>();
  for (const f of found) {
    const key = f.toLowerCase();
    if (EN_STOPWORDS.has(key) || key.length < 2) continue;
    if (!seen.has(key)) seen.set(key, f);
  }
  return Array.from(seen.values()).slice(0, 15);
}

interface NoveltySignals {
  maxSimilarity: number;
  novelRatio: number;
  novelTechTerms: string[];
  topMatches: Array<{ prior: PriorKnowledge; score: number }>;
  heuristicStatus: LearningStatus;
}

export function computeNovelty(entry: EntryRow, priors: PriorKnowledge[]): NoveltySignals {
  const currentText = `${entry.title}\n${entry.description}`;
  const current = termBag(currentText);
  const currentTech = extractTechTerms(currentText);

  if (priors.length === 0 || current.size === 0) {
    return { maxSimilarity: 0, novelRatio: 1, novelTechTerms: currentTech, topMatches: [], heuristicStatus: 'new' };
  }

  const seenAll = new Map<string, number>();
  const seenTech = new Set<string>();
  const scored = priors.map((prior) => {
    const text = `${prior.entry.title}\n${prior.entry.description}\n${prior.learnedWhat || ''}`;
    const bag = termBag(text);
    for (const [k, w] of bag) seenAll.set(k, w);
    for (const t of extractTechTerms(text)) seenTech.add(t.toLowerCase());
    for (const t of prior.tools || []) seenTech.add(t.toLowerCase());
    return { prior, score: containment(current, bag) };
  });
  scored.sort((a, b) => b.score - a.score);

  const total = bagWeight(current);
  let novelWeight = 0;
  for (const [term, w] of current) if (!seenAll.has(term)) novelWeight += w;
  const novelRatio = total ? novelWeight / total : 1;
  const novelTechTerms = currentTech.filter((t) => !seenTech.has(t.toLowerCase()));
  const maxSimilarity = scored[0]?.score || 0;

  let heuristicStatus: LearningStatus;
  if (maxSimilarity >= 0.6 && novelRatio < 0.15 && novelTechTerms.length === 0) {
    heuristicStatus = 'routine';
  } else if (maxSimilarity < 0.25 || novelRatio >= 0.65 || (novelTechTerms.length >= 2 && maxSimilarity < 0.45)) {
    // Mostly unseen material; partial overlap with a new angle counts as reinforcement instead
    heuristicStatus = 'new';
  } else {
    heuristicStatus = 'reinforced';
  }

  return {
    maxSimilarity,
    novelRatio,
    novelTechTerms,
    topMatches: scored.filter((s) => s.score >= 0.15).slice(0, 8),
    heuristicStatus
  };
}

export function hashEntrySource(title: string, description: string): string {
  return crypto.createHash('sha256').update(`${title}\n${description}`).digest('hex');
}

// ---------------------------------------------------------------------------
// Diary phrasing -> report phrasing (used by the rule-based path when no model is available)
// ---------------------------------------------------------------------------

const DIALECT_TO_FORMAL: Array<[string, string]> = [
  ['سويت', 'نفّذت'], ['سوينا', 'نفّذنا'], ['سوّيت', 'نفّذت'], ['نسوي', 'ننفّذ'], ['اسوي', 'أنفّذ'],
  ['رحت', 'توجّهت'], ['رحنا', 'توجّهنا'], ['جيت', 'حضرت'], ['جينا', 'حضرنا'],
  ['شفت', 'لاحظت'], ['شفنا', 'لاحظنا'], ['عشان', 'بهدف'], ['علشان', 'بهدف'],
  ['خلصت', 'أنهيت'], ['خلصنا', 'أنهينا'], ['زبطت', 'ضبطت'], ['زبطنا', 'ضبطنا'], ['ظبطت', 'ضبطت'],
  ['حطيت', 'وضعت'], ['حطينا', 'وضعنا'], ['ركبت', 'ركّبت'], ['شغلت', 'شغّلت'], ['طفيت', 'أوقفت'],
  ['وبعدين', 'ثم'], ['بعدين', 'ثم'],
  ['وايد', 'كثيراً'], ['واجد', 'كثيراً'],
  ['مافيه', 'لا يوجد'], ['ما فيه', 'لا يوجد'], ['ماكان', 'لم يكن'],
  ['يبي', 'يتطلب'], ['نبي', 'نحتاج'], ['ابي', 'أحتاج'], ['قالي', 'وجّهني'], ['قال لي', 'وجّهني'],
  ['علمني', 'شرح لي'], ['وريته', 'عرضت عليه'], ['ورانا', 'عرض علينا'], ['اشوف', 'أتحقق من'], ['نشوف', 'نتحقق من'],
  ['خربان', 'معطّل'], ['خربانه', 'معطّلة'], ['انحل', 'تمت معالجته'], ['انحلت', 'تمت معالجتها'], ['حليت', 'عالجت'], ['حلينا', 'عالجنا']
];

export const DIALECT_EXTRA: Array<[string, string]> = [
  ['جربنا', 'اختبرنا'], ['جربت', 'اختبرت'], ['كيبل', 'كابل'], ['الكيبل', 'الكابل'], ['بدلته', 'استبدلته'], ['بدلت', 'استبدلت'],
  ['شغال', 'يعمل بشكل سليم'], ['شغاله', 'تعمل بشكل سليم'], ['صار', 'حدث'], ['الاجهزة', 'الأجهزة'], ['الاجهزه', 'الأجهزة']
];
DIALECT_TO_FORMAL.push(...DIALECT_EXTRA);

/**
 * Rule-based restructuring of a diary entry into a report (used when no model is available).
 * Sorts clauses by role — purpose, actions, results, learning — and only writes sections that
 * the text actually supports; it never adds generic claims.
 */
export function structureDiaryOffline(rawText: string, title: string, style: RewriteStyleId): string {
  const text = applyArabicSpellCorrections(formalizeDialect(rawText));
  const clauses = text
    // Split at purpose / learning / result markers so one long diary sentence feeds the right sections
    .replace(/\s+(بهدف|لغرض|من أجل|لضمان|للتأكد)\s+/g, '\n$1 ')
    .replace(/\s+و(تعرفت|تعرّفت|تعلمت|تعلّمت|اكتسبت|فهمت|طبقت|طبّقت)\s+/g, '\n$1 ')
    .replace(/\s+و(رجعت|عادت|تأكدت|نجح|استقر)\s+/g, '\n$1 ')
    .split(/[.؟!\n؛]+|،\s*|\s+(?:ثم|وبعدها|وبعد ذلك)\s+/)
    .map((c) => c.replace(/^\s*(?:و|ثم|وثم)\s+/, '').replace(/[\s،,.]+$/, '').trim())
    .filter((c) => c.length > 3);

  const isPurpose = (c: string) => /(بهدف|لغرض|من أجل|لضمان|للتأكد|لتمكين|لفصل|لتحسين)/.test(c);
  const isResult = (c: string) => /(عادت|رجعت الخدمة|نجح|تأكدت|تم التأكد|يعمل بشكل سليم|تعمل بشكل سليم|اكتمل|استقر|تحسن|أنهيت)/.test(c);
  const isLearning = (c: string) => /(تعرفت|تعرّفت|تعلمت|تعلّمت|اكتسبت|فهمت|شرح)/.test(c);

  const purpose = clauses.filter(isPurpose);
  const results = clauses.filter((c) => !isPurpose(c) && isResult(c));
  const learning = clauses.filter((c) => !isPurpose(c) && !isResult(c) && isLearning(c));
  const actions = clauses.filter((c) => !isPurpose(c) && !isResult(c) && !isLearning(c));
  const tools = extractTechTerms(rawText);

  const sentence = (parts: string[]) => (parts.length ? `${parts.join('، ثم ')}.` : '');
  // "بهدف ..." alone is a fragment; anchor it to the task title
  const goal = purpose.length ? `${title.replace(/[.\s]+$/, '')} ${purpose.join('، و')}.` : '';
  const actionText = sentence(actions.length ? actions : clauses);
  const toolsText = tools.length ? `${tools.join('، ')}.` : '';
  const resultText = results.length ? `${results.join('، و')}.` : '';
  const learnText = learning.length ? `${learning.join('، و')}.` : '';

  if (style === 'concise_executive') {
    return [goal, actionText, resultText, learnText].filter(Boolean).join(' ');
  }

  const [h1, h2, h3, h4] = STYLE_SECTIONS[style];
  const first = style === 'procedural' ? goal : style === 'star_impact' ? [`${title}.`, goal].filter(Boolean).join(' ') : `${title}.`;
  const last = style === 'academic_competency' ? learnText || resultText : resultText;
  const sections: [string, string][] = [
    [h1, first],
    [h2, style === 'academic_competency' ? actionText : [actionText, style === 'star_impact' ? '' : learnText].filter(Boolean).join(' ')],
    [h3, toolsText],
    [h4, last]
  ];
  const seen = new Set<string>();
  return sections
    .filter(([, body]) => {
      const key = body.trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(([h, body]) => `${h}:\n${body}`)
    .join('\n\n');
}

export function formalizeDialect(text: string): string {
  let out = text;
  for (const [colloquial, formal] of DIALECT_TO_FORMAL) {
    const escaped = colloquial.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Allow the attached conjunctions و / ف (وسويت -> ونفّذت)
    out = out.replace(new RegExp(`(?<![\\u0600-\\u06FF])([وف]?)${escaped}(?![\\u0600-\\u06FF])`, 'gu'), `$1${formal}`);
  }
  // Diary openers that do not belong in a report
  return out.replace(/(^|\n)\s*(اليوم|في هذا اليوم|بداية اليوم)\s*[،,:]?\s*/g, '$1');
}

// ---------------------------------------------------------------------------
// Writing style: each entry gets the structure that fits its content best
// ---------------------------------------------------------------------------

const STYLE_SECTIONS: Record<RewriteStyleId, string[]> = {
  procedural: ['الهدف التشغيلي', 'الإجراءات والخطوات الميدانية', 'الأنظمة والأدوات المستخدمة', 'المخرجات والنتائج الفنية'],
  star_impact: ['نطاق التكليف والمهمة الميدانية', 'الإجراءات والحلول الفنية', 'الأنظمة والتقنيات المستخدمة', 'الأثر والقيمة المضافة'],
  academic_competency: [
    'الجدارة والمهارة المستهدفة',
    'الممارسة والتطبيق الميداني',
    'الأدوات والمفاهيم التقنية المطبقة',
    'مخرجات التعلم والتقييم الذاتي'
  ],
  concise_executive: []
};

export function chooseRewriteStyle(entry: { title: string; category: string; description: string }): RewriteStyleId {
  const text = normalizeArabic(`${entry.title} ${entry.category} ${entry.description}`);
  const has = (re: RegExp) => re.test(text);
  if (has(/(مشكل|عطل|اعطال|خطا|اخطا|خلل|انقطاع|تعذر|حل |حلول|استكشاف|troubleshoot|issue|error|fault|bug|fix|outage|incident)/)) {
    return 'star_impact';
  }
  if (has(/(تعلم|ورشه|دوره|شرح|تعرف|محاضره|تدريب نظري|اطلاع|دراسه|learn|workshop|course|training session|tutorial|onboarding)/)) {
    return 'academic_competency';
  }
  if (entry.description.trim().length < 220 || has(/(اجتماع|meeting|توثيق|محضر|عرض تقديمي|presentation|report)/)) {
    return 'concise_executive';
  }
  return 'procedural';
}

function styleInstruction(style: RewriteStyleId): string {
  const reportVoice =
    'اكتب correctedText كتقرير مهني منظم للقارئ وليس كيوميات: لا تبدأ بـ (اليوم) ولا تسرد الأحداث بترتيب حدوثها، بل رتّبها منطقياً وجمّع المتشابه منها.';
  if (style === 'concise_executive') {
    return `${reportVoice}\nاجعله فقرة تنفيذية واحدة مترابطة (3 إلى 5 أسطر) توجز الغاية والعمل المنفذ والأدوات والنتيجة.`;
  }
  const headers = STYLE_SECTIONS[style];
  return `${reportVoice}
قسّمه إلى الأقسام الأربعة التالية بالترتيب، كل عنوان في سطر مستقل متبوعاً بنقطتين ثم فقرة متصلة تحته:
${headers
    .map((h) => `${h}:`)
    .join('\n')}
إن لم يذكر النص معلومة لقسم ما فاكتب فيه ما يمكن استنتاجه مباشرة من النص فقط دون اختلاق.`;
}

const INSIGHT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    correctedTitle: { type: 'string' },
    correctedText: { type: 'string' },
    learningStatus: { enum: ['new', 'reinforced', 'routine'] },
    goal: { type: 'string' },
    actionsDone: { type: 'string' },
    learnedWhat: { type: 'string' },
    tools: { type: 'array', items: { type: 'string' } },
    relatedEntryIds: { type: 'array', items: { type: 'integer' } },
    relationNote: { type: 'string' }
  }
} as const;

const TRANSLATION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    text: { type: 'string' },
    goal: { type: 'string' },
    actionsDone: { type: 'string' },
    learnedWhat: { type: 'string' },
    relationNote: { type: 'string' }
  }
} as const;

// ---------------------------------------------------------------------------
// Prompting
// ---------------------------------------------------------------------------

const AGENT_SYSTEM_PROMPT = `أنت وكيل ذكاء اصطناعي متخصص في مراجعة سجلات التدريب التعاوني اليومية (Daily Training Logs) لطلاب الجامعات والكليات التقنية.
مهمتك لكل سجل يومي:
1. تحويل ما كتبه المتدرب من يوميات عفوية (وش صار، وش سويت، رحت، بعدين...) إلى تقرير مهني واضح موجّه لقارئ لم يكن حاضراً (مشرف أو لجنة تقييم)، لا إلى يوميات:
   - أعد ترتيب المحتوى حسب المنطق لا حسب تسلسل الكتابة: السياق والغاية أولاً، ثم العمل المنفذ مجمّعاً حسب الموضوع، ثم الأدوات، ثم النتيجة.
   - ادمج النقاط المكررة أو المتفرقة التي تخص العمل نفسه في فقرة واحدة، واحذف الحشو والعبارات الزمنية العفوية (بعدين، وبعدها، ورحت، وجلست) دون حذف أي معلومة.
   - حوّل اللهجة العامية إلى عربية فصحى مهنية (سويت ← نفّذت، شفت ← لاحظت، عشان ← بهدف، خلصت ← أنهيت، زبطت ← ضبطت).
   - صحّح الإملاء والهمزات والنحو وعلامات الترقيم، واكتب المصطلحات التقنية بصيغتها الصحيحة.
   - وضّح للقارئ ما يحتاجه لفهم العمل (ما النظام أو الجهاز، ولماذا نُفذ الإجراء) إذا كان مفهوماً من النص نفسه، دون اختلاق.
   - حافظ على كل معلومة وأداة ورقم وخطوة ذكرها المتدرب. ممنوع إضافة أي واقعة غير مذكورة وممنوع حذف أي معلومة.
2. استخراج الهدف من المهمة (لماذا نُفذت)، وماذا نفّذ المتدرب فعلياً، وما الذي تعلّمه.
3. مقارنة السجل بالسجلات السابقة لنفس المتدرب وتحديد التصنيف بدقة:
   - "new": معرفة أو مهارة أو أداة أو مفهوم لم يظهر في أي سجل سابق.
   - "reinforced": امتداد لمعرفة سابقة مع إضافة حقيقية (عمق أكبر، سياق مختلف، حالة جديدة، أداة إضافية).
   - "routine": تكرار لمهمة سبق تنفيذها دون تعلم جديد يُذكر.
   اعتمد على المقارنة الفعلية بالسجلات السابقة المرفقة فقط، ولا تفترض وجود سجلات غير مرفقة.
قواعد صارمة: لا إيموجي، لا تعداد نقطي داخل الفقرات، لا تستخدم كلمة (معتمد) أو مشتقاتها، ولا تختلق أي وقائع.
أعد الإجابة بصيغة JSON صالحة فقط (json object) دون أي نص قبلها أو بعدها.`;

function truncate(text: string, max: number): string {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

function buildAgentPrompt(entry: EntryRow, priors: PriorKnowledge[], signals: NoveltySignals, style: RewriteStyleId): string {
  const topIds = new Set(signals.topMatches.map((m) => m.prior.entry.id));

  const detailed = signals.topMatches
    .slice(0, 6)
    .map(
      (m) =>
        `[#${m.prior.entry.id} | ${m.prior.entry.entryDate} | تشابه ${(m.score * 100).toFixed(0)}%] ${m.prior.entry.title}\nالنص: ${truncate(
          m.prior.entry.description,
          400
        )}${m.prior.learnedWhat ? `\nما تعلّمه حينها: ${truncate(m.prior.learnedWhat, 200)}` : ''}`
    )
    .join('\n\n');

  // Compact memory of the remaining history so the agent sees the whole training path
  const memory = priors
    .filter((p) => !topIds.has(p.entry.id))
    .slice(-50)
    .map(
      (p) =>
        `#${p.entry.id} ${p.entry.entryDate}: ${truncate(p.entry.title, 80)}${
          p.learnedWhat ? ` — تعلّم: ${truncate(p.learnedWhat, 90)}` : ''
        }`
    )
    .join('\n');

  return `السجل اليومي المطلوب تحليله:
- المعرّف: #${entry.id}
- التاريخ: ${entry.entryDate}
- المجال: ${entry.category}
- العنوان: ${entry.title}
- النص الأصلي:
${entry.description}

عدد السجلات السابقة لهذا المتدرب: ${priors.length}

السجلات السابقة الأكثر تشابهاً (للمقارنة الدقيقة):
${detailed || '(لا توجد سجلات سابقة متشابهة)'}

ذاكرة مختصرة لبقية المسار التدريبي السابق:
${memory || '(لا توجد)'}

مؤشرات تحليل آلي مساعدة (استرشادية وليست ملزمة):
- أعلى نسبة تشابه مع سجل سابق: ${(signals.maxSimilarity * 100).toFixed(0)}%
- نسبة المفردات الجديدة كلياً: ${(signals.novelRatio * 100).toFixed(0)}%
- مصطلحات تقنية لم تظهر سابقاً: ${signals.novelTechTerms.join(', ') || 'لا يوجد'}

أسلوب إعادة الكتابة المختار لهذا اليوم: ${style}
${styleInstruction(style)}

أعد كائن JSON بهذه المفاتيح حصراً:
{
  "correctedTitle": "العنوان بعد التصحيح اللغوي (قصير وواضح، دون تغيير المعنى)",
  "correctedText": "النص بعد التدقيق اللغوي وإعادة الكتابة بالأسلوب المختار أعلاه، محافظاً على جميع الحقائق والأدوات والأرقام دون إضافة أو حذف",
  "learningStatus": "new | reinforced | routine",
  "goal": "جملة أو جملتان: الهدف من هذه المهمة ولماذا نُفذت، استناداً للنص فقط",
  "actionsDone": "فقرة واحدة متصلة: ماذا نفّذ المتدرب فعلياً خطوة بخطوة كما ورد في النص",
  "learnedWhat": "فقرة قصيرة: ما الجديد الذي تعلّمه؛ وإن كان تعزيزاً فاذكر ما أضيف على المعرفة السابقة؛ وإن كان روتينياً فاذكر المهارة التي تمت ممارستها",
  "tools": ["الأدوات والأنظمة والتقنيات المذكورة في النص فقط"],
  "relatedEntryIds": [أرقام السجلات السابقة المرتبطة فعلياً من القائمة أعلاه فقط],
  "relationNote": "جملة توضح علاقة هذا اليوم بالسجلات السابقة وسبب التصنيف"
}`;
}

// ---------------------------------------------------------------------------
// Output validation
// ---------------------------------------------------------------------------

function parseJsonObject(raw: string): any | null {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function asText(v: unknown, max = 4000): string {
  return typeof v === 'string' ? v.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim().slice(0, max) : '';
}

/**
 * Rejects a corrected text that drifted from the source: lost technical terms or numbers,
 * or a length change that signals invented / dropped content.
 */
function isFaithfulCorrection(original: string, corrected: string, style: RewriteStyleId): boolean {
  if (!corrected) return false;
  const ratio = corrected.length / Math.max(original.length, 1);
  // Structured styles add four headings; the executive style condenses
  const [minRatio, maxRatio] = style === 'concise_executive' ? [0.3, 2.2] : [0.6, original.length < 300 ? 4.5 : 3];
  if (ratio < minRatio || ratio > maxRatio) return false;
  const lowerCorrected = corrected.toLowerCase();
  const lostTerms = extractTechTerms(original).filter((t) => !lowerCorrected.includes(t.toLowerCase()));
  if (lostTerms.length > 1) return false;
  // Compare numbers ignoring leading zeros and Arabic-Indic digits (08:00 vs ٨:٠٠)
  const numSet = (t: string) =>
    new Set(
      (t.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).match(/\d+/g) || []).map((n) =>
        n.replace(/^0+(?=\d)/, '')
      )
    );
  const correctedNums = numSet(corrected);
  const lostNumbers = [...numSet(original)].filter((n) => !correctedNums.has(n));
  return lostNumbers.length <= 1;
}

// ---------------------------------------------------------------------------
// Deterministic fallback (no LLM key configured / provider down)
// ---------------------------------------------------------------------------

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!؟?])\s+|\n+/)
    .map((s) => s.replace(/^[\s•\-*\d.)]+/, '').trim())
    .filter((s) => s.length > 4);
}

function buildFallbackInsight(entry: EntryRow, signals: NoveltySignals, correctedText: string) {
  const parsed = parseStructuredDailyNarrative(correctedText);
  const sentences = splitSentences(parsed.activities || correctedText);

  const purposeSentence = splitSentences(correctedText).find((s) =>
    /(بهدف|لغرض|من أجل|لضمان|للتأكد|لتحسين|لتمكين|in order to|to ensure|so that|aim)/i.test(s)
  );
  const goal = purposeSentence || `إنجاز مهمة «${entry.title}» ضمن مجال ${entry.category}.`;

  const actionsDone = structureDiaryOffline(entry.description, entry.title, 'concise_executive') || sentences.slice(0, 4).join(' ') || correctedText;

  const learnSentence = splitSentences(correctedText).find((s) =>
    /(تعلمت|تعلّمت|تعرفت|تعرّفت|اكتسبت|فهمت|أتقنت|learned|learnt|understood)/i.test(s)
  );
  const top = signals.topMatches[0]?.prior.entry;
  let learnedWhat: string;
  if (parsed.newLearnings) {
    learnedWhat = parsed.newLearnings;
  } else if (learnSentence) {
    learnedWhat = learnSentence;
  } else if (signals.heuristicStatus === 'new') {
    learnedWhat = signals.novelTechTerms.length
      ? `التعرف عملياً على: ${signals.novelTechTerms.join('، ')}.`
      : `اكتساب خبرة عملية جديدة في: ${entry.title}.`;
  } else if (signals.heuristicStatus === 'reinforced') {
    learnedWhat = `تعميق ممارسة سابقة${top ? ` («${top.title}»)` : ''} وتطبيقها في سياق جديد.`;
  } else {
    learnedWhat = `ممارسة متكررة لمهارة سبق تنفيذها${top ? ` في «${top.title}»` : ''} ورفع سرعة الإنجاز ودقته.`;
  }

  const relationNote =
    signals.topMatches.length === 0
      ? 'لا يوجد سجل سابق مشابه؛ يُعد هذا اليوم أول ظهور لهذا الموضوع في مسار التدريب.'
      : `أقرب سجل سابق: ${top?.entryDate} «${top?.title}» بنسبة تشابه ${(signals.maxSimilarity * 100).toFixed(0)}%، ونسبة المحتوى الجديد ${(signals.novelRatio * 100).toFixed(0)}%.`;

  return {
    correctedTitle: entry.title,
    correctedText,
    learningStatus: signals.heuristicStatus,
    goal,
    actionsDone,
    learnedWhat,
    tools: extractTechTerms(`${entry.title} ${entry.description}`),
    relatedEntryIds: signals.topMatches.slice(0, 3).map((m) => m.prior.entry.id),
    relationNote
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

async function loadPriors(userId: number, entry: EntryRow): Promise<PriorKnowledge[]> {
  const rows = await prisma.entry.findMany({
    where: {
      userId,
      deletedAt: null,
      OR: [{ entryDate: { lt: entry.entryDate } }, { entryDate: entry.entryDate, id: { lt: entry.id } }]
    },
    orderBy: [{ entryDate: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      entryDate: true,
      title: true,
      category: true,
      description: true,
      insight: { select: { learnedWhat: true, tools: true } }
    }
  });
  return rows.map((r) => ({
    entry: { id: r.id, entryDate: r.entryDate, title: r.title, category: r.category, description: r.description },
    learnedWhat: r.insight?.learnedWhat,
    tools: safeJsonArray(r.insight?.tools).map(String)
  }));
}

function safeJsonArray(raw?: string | null): unknown[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export async function analyzeEntry(
  userId: number,
  entryId: number,
  tenantId = 'default_tenant',
  opts: AnalyzeOptions = {}
): Promise<EntryInsightDTO> {
  const entry = await prisma.entry.findFirst({
    where: { id: entryId, userId, deletedAt: null },
    select: { id: true, entryDate: true, title: true, category: true, description: true }
  });
  if (!entry) {
    throw Object.assign(new Error('الإدخال غير موجود أو لا تملك صلاحية تحليله'), { status: 404 });
  }

  const priors = await loadPriors(userId, entry);
  const signals = computeNovelty(entry, priors);
  const priorIds = new Set(priors.map((p) => p.entry.id));
  const style = chooseRewriteStyle(entry);
  const offlineRewrite = structureDiaryOffline(entry.description, entry.title, style);

  let result = buildFallbackInsight(entry, signals, offlineRewrite);
  let mode: 'llm' | 'fallback' = 'fallback';

  try {
    const raw = await runLLMChain(AGENT_SYSTEM_PROMPT, buildAgentPrompt(entry, priors, signals, style), {
      apiKey: opts.apiKey,
      model: opts.model,
      maxTokens: 2400,
      temperature: 0.1,
      timeoutMs: 30000,
      jsonMode: true,
      jsonSchema: INSIGHT_JSON_SCHEMA as unknown as Record<string, unknown>,
      waitForLocal: opts.waitForLocal,
      localTimeoutMs: 240000
    });
    const parsed = raw ? parseJsonObject(raw) : null;
    if (parsed) {
      const status: LearningStatus = ['new', 'reinforced', 'routine'].includes(parsed.learningStatus)
        ? parsed.learningStatus
        : signals.heuristicStatus;
      const correctedText = asText(parsed.correctedText, 20000);
      const correctedTitle = asText(parsed.correctedTitle, 150);
      const related = (Array.isArray(parsed.relatedEntryIds) ? parsed.relatedEntryIds : [])
        .map((v: unknown) => Number(String(v).replace('#', '')))
        .filter((id: number) => priorIds.has(id))
        .slice(0, 5);

      result = {
        correctedTitle: correctedTitle || entry.title,
        correctedText: isFaithfulCorrection(entry.description, correctedText, style) ? correctedText : offlineRewrite,
        // Without any earlier entry nothing can be a repeat
        learningStatus: priors.length === 0 ? 'new' : status,
        goal: asText(parsed.goal, 1500) || result.goal,
        actionsDone: asText(parsed.actionsDone, 4000) || result.actionsDone,
        learnedWhat: asText(parsed.learnedWhat, 2000) || result.learnedWhat,
        tools: (Array.isArray(parsed.tools) ? parsed.tools : [])
          .map((t: unknown) => asText(t, 60))
          .filter(Boolean)
          .slice(0, 15),
        relatedEntryIds: related.length ? related : status === 'new' ? [] : result.relatedEntryIds,
        relationNote: asText(parsed.relationNote, 1500) || result.relationNote
      };
      mode = 'llm';
    }
  } catch (err: any) {
    logger.warn({ err: err?.message, entryId }, 'Insight agent LLM call failed, using deterministic analysis');
  }

  const data = {
    tenantId,
    userId,
    correctedTitle: result.correctedTitle.slice(0, 150),
    correctedText: result.correctedText,
    learningStatus: result.learningStatus,
    rewriteStyle: style,
    goal: result.goal,
    actionsDone: result.actionsDone,
    learnedWhat: result.learnedWhat,
    tools: JSON.stringify(result.tools),
    relatedEntryIds: JSON.stringify(result.relatedEntryIds).slice(0, 500),
    relationNote: result.relationNote,
    similarityScore: Number(signals.maxSimilarity.toFixed(3)),
    sourceHash: hashEntrySource(entry.title, entry.description),
    mode
  };

  // 1. Arabic edition is saved first and on its own
  let saved = await prisma.entryInsight.upsert({
    where: { entryId: entry.id },
    create: { entryId: entry.id, ...data },
    update: data
  });

  // 2. English edition is produced separately; a translation failure never touches the Arabic one
  try {
    const en = await translateInsightToEnglish(result, opts);
    if (en) {
      saved = await prisma.entryInsight.update({
        where: { entryId: entry.id },
        data: {
          titleEn: en.title.slice(0, 200),
          textEn: en.text,
          goalEn: en.goal,
          actionsEn: en.actionsDone,
          learnedEn: en.learnedWhat,
          relationNoteEn: en.relationNote,
          translationMode: en.mode
        }
      });
    }
  } catch (err: any) {
    logger.warn({ err: err?.message, entryId }, 'English edition of insight could not be produced');
  }

  const refMap = new Map<number, EntryInsightRelatedRef>(
    priors.map((p) => [p.entry.id, { entryId: p.entry.id, entryDate: p.entry.entryDate, title: p.entry.title }])
  );
  return toInsightDTO(saved, entry, refMap);
}

interface InsightTexts {
  correctedTitle: string;
  correctedText: string;
  goal: string;
  actionsDone: string;
  learnedWhat: string;
  relationNote: string | null;
}

const TRANSLATE_SYSTEM_PROMPT = `You are a professional Arabic-to-English translator for engineering and IT cooperative-training (co-op) reports.
Translate faithfully and completely into formal academic English. Keep every fact, number, tool name and acronym exactly.
Keep section headings as headings (translate them) and keep paragraph breaks. No emojis, no additions, no omissions.
Return a valid json object only.`;

/** Translates the Arabic insight into English: local model first, then the free web translator */
async function translateInsightToEnglish(
  t: InsightTexts,
  opts: AnalyzeOptions
): Promise<{ title: string; text: string; goal: string; actionsDone: string; learnedWhat: string; relationNote: string; mode: string } | null> {
  const payload = {
    title: t.correctedTitle,
    text: t.correctedText,
    goal: t.goal,
    actionsDone: t.actionsDone,
    learnedWhat: t.learnedWhat,
    relationNote: t.relationNote || ''
  };

  const raw = await runLLMChain(
    TRANSLATE_SYSTEM_PROMPT,
    `Translate every value of this JSON object from Arabic to English and return the same keys:\n${JSON.stringify(payload, null, 1)}`,
    {
      apiKey: opts.apiKey,
      model: opts.model,
      maxTokens: 2600,
      temperature: 0.1,
      timeoutMs: 30000,
      jsonMode: true,
      jsonSchema: TRANSLATION_JSON_SCHEMA as unknown as Record<string, unknown>,
      waitForLocal: opts.waitForLocal,
      localTimeoutMs: 240000
    }
  ).catch(() => null);
  const parsed = raw ? parseJsonObject(raw) : null;
  const looksEnglish = (s: string) => !!s && (s.match(/[؀-ۿ]/g) || []).length < s.length * 0.1;
  if (parsed && looksEnglish(asText(parsed.text, 20000))) {
    return {
      title: asText(parsed.title, 200),
      text: asText(parsed.text, 20000),
      goal: asText(parsed.goal, 2000),
      actionsDone: asText(parsed.actionsDone, 5000),
      learnedWhat: asText(parsed.learnedWhat, 3000),
      relationNote: asText(parsed.relationNote, 2000),
      mode: 'llm'
    };
  }

  // Free web translation fallback, field by field
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(payload)) {
    out[k] = v ? (await translateWithWebAPI(v, 'en')) || '' : '';
  }
  if (!out.text) return null;
  return {
    title: out.title,
    text: out.text,
    goal: out.goal,
    actionsDone: out.actionsDone,
    learnedWhat: out.learnedWhat,
    relationNote: out.relationNote,
    mode: 'web'
  };
}

/**
 * Analyses many entries in chronological order, so every entry is compared with the analyses
 * of the days before it. scope: 'missing' = never analysed or edited since; 'all' = everything.
 */
export async function analyzeAllEntries(
  userId: number,
  tenantId: string,
  scope: 'missing' | 'all',
  opts: AnalyzeOptions,
  onProgress: (done: number, total: number, label: string) => void,
  /** Restrict the run to these entries (e.g. one week); they are analysed in chronological order */
  onlyEntryIds?: number[]
): Promise<{ analyzed: number; failed: number }> {
  const entries = await prisma.entry.findMany({
    where: { userId, deletedAt: null },
    orderBy: [{ entryDate: 'asc' }, { id: 'asc' }],
    select: { id: true, entryDate: true, title: true, description: true, insight: { select: { sourceHash: true } } }
  });
  const idFilter = onlyEntryIds && onlyEntryIds.length ? new Set(onlyEntryIds) : null;
  const pool = idFilter ? entries.filter((e) => idFilter.has(e.id)) : entries;
  const targets =
    scope === 'all'
      ? pool
      : pool.filter((e) => !e.insight || e.insight.sourceHash !== hashEntrySource(e.title, e.description));

  let analyzed = 0;
  let failed = 0;
  for (let i = 0; i < targets.length; i++) {
    const e = targets[i];
    onProgress(i, targets.length, `${e.entryDate} — ${e.title}`);
    try {
      await analyzeEntry(userId, e.id, tenantId, opts);
      analyzed++;
    } catch (err: any) {
      failed++;
      logger.warn({ err: err?.message, entryId: e.id }, 'Batch insight analysis failed for entry');
    }
  }
  onProgress(targets.length, targets.length, '');
  return { analyzed, failed };
}

export function toInsightDTO(
  row: {
    entryId: number;
    correctedTitle: string;
    correctedText: string;
    learningStatus: string;
    rewriteStyle: string;
    goal: string;
    actionsDone: string;
    learnedWhat: string;
    tools: string;
    relatedEntryIds: string;
    relationNote: string | null;
    similarityScore: number;
    sourceHash: string;
    mode: string;
    titleEn: string | null;
    textEn: string | null;
    goalEn: string | null;
    actionsEn: string | null;
    learnedEn: string | null;
    relationNoteEn: string | null;
    updatedAt: Date;
  },
  entry: { title: string; description: string },
  refMap?: Map<number, EntryInsightRelatedRef>
): EntryInsightDTO {
  const relatedEntryIds = safeJsonArray(row.relatedEntryIds).map(Number).filter(Number.isFinite);
  const styles: RewriteStyleId[] = ['procedural', 'star_impact', 'academic_competency', 'concise_executive'];
  return {
    entryId: row.entryId,
    correctedTitle: row.correctedTitle,
    correctedText: row.correctedText,
    learningStatus: (['new', 'reinforced', 'routine'].includes(row.learningStatus) ? row.learningStatus : 'new') as LearningStatus,
    rewriteStyle: (styles.includes(row.rewriteStyle as RewriteStyleId) ? row.rewriteStyle : 'procedural') as RewriteStyleId,
    goal: row.goal,
    actionsDone: row.actionsDone,
    learnedWhat: row.learnedWhat,
    tools: safeJsonArray(row.tools).map(String),
    relatedEntryIds,
    related: refMap ? relatedEntryIds.map((id) => refMap.get(id)).filter((r): r is EntryInsightRelatedRef => !!r) : undefined,
    relationNote: row.relationNote,
    similarityScore: row.similarityScore,
    mode: row.mode === 'llm' ? 'llm' : 'fallback',
    en: row.textEn
      ? {
          title: row.titleEn || '',
          text: row.textEn,
          goal: row.goalEn || '',
          actionsDone: row.actionsEn || '',
          learnedWhat: row.learnedEn || '',
          relationNote: row.relationNoteEn || ''
        }
      : null,
    isStale: row.sourceHash !== hashEntrySource(entry.title, entry.description),
    updatedAt: row.updatedAt.toISOString()
  };
}

/** All insights of a user keyed by entry id, with related-entry references resolved */
export async function loadInsightsForUser(userId: number): Promise<Map<number, EntryInsightDTO>> {
  const [rows, entries] = await Promise.all([
    prisma.entryInsight.findMany({ where: { userId } }),
    prisma.entry.findMany({
      where: { userId },
      select: { id: true, entryDate: true, title: true, description: true, deletedAt: true }
    })
  ]);
  const entryMap = new Map(entries.map((e) => [e.id, e]));
  const refMap = new Map<number, EntryInsightRelatedRef>(
    entries.filter((e) => !e.deletedAt).map((e) => [e.id, { entryId: e.id, entryDate: e.entryDate, title: e.title }])
  );
  const out = new Map<number, EntryInsightDTO>();
  for (const row of rows) {
    const entry = entryMap.get(row.entryId);
    if (!entry) continue;
    out.set(row.entryId, toInsightDTO(row, entry, refMap));
  }
  return out;
}
