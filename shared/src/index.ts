import { z } from 'zod';

// ==========================================
// 1. Enums and Constants
// ==========================================
export const ENTRY_CATEGORIES = [
  'هندسة الشبكات وتراسل البيانات',
  'شبكات النفاذ والألياف الضوئية (FTTH)',
  'شبكات الاتصالات اللاسلكية والجيل الخامس (5G)',
  'إدارة الأعطال والتشغيل ومراقبة الأنظمة (NOC)',
  'أمن المعلومات والأمن السيبراني',
  'الدعم الفني الميداني وصيانة النظم',
  'تطوير وهندسة البرمجيات والأنظمة',
  'الحوسبة السحابية وإدارة الخوادم',
  'الاجتماعات الفنية والتخطيط التشغيلي',
  'التوثيق الهندسي وضبط الجودة',
  'تطوير / برمجة',
  'دعم فني',
  'اجتماعات',
  'تدريب وتعلّم',
  'توثيق',
  'أخرى'
] as const;

export type EntryCategory = (typeof ENTRY_CATEGORIES)[number] | (string & {});

export const USER_ROLES = ['trainee', 'supervisor'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ==========================================
// 2. Zod Validation Schemas
// ==========================================
export const registerSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل').max(50),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  role: z.enum(USER_ROLES).default('trainee')
});

export const loginSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة')
});

export const entrySchema = z.object({
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'صيغة التاريخ غير صحيحة (YYYY-MM-DD)'),
  timeFrom: z.string().regex(/^\d{2}:\d{2}$/, 'صيغة الوقت غير صحيحة (HH:MM)'),
  timeTo: z.string().regex(/^\d{2}:\d{2}$/, 'صيغة الوقت غير صحيحة (HH:MM)'),
  title: z.string().min(2, 'العنوان مطلوب').max(150, 'العنوان طويل جداً'),
  category: z.string().min(1, 'التصنيف مطلوب').max(50).default('أخرى'),
  description: z.string().min(5, 'تفاصيل الإنجاز يجب ألا تقل عن 5 أحرف')
});

export const profileSchema = z.object({
  studentName: z.string().max(100).default(''),
  trainingNumber: z.string().max(50).default(''),
  department: z.string().max(100).default(''),
  trainingUnit: z.string().max(150).default(''),
  supervisorName: z.string().max(100).default(''),
  responsibleName: z.string().max(100).default(''),
  entityAddress: z.string().max(200).default(''),
  employeesCount: z.string().max(50).default(''),
  trainingWeeks: z.number().int().min(1).max(30).default(14),
  courseHours: z.number().int().min(1).max(2000).default(280),
  startDate: z.string().max(20).default(''),
  companyLogo: z.string().optional().default(''),
  institutionLogo: z.string().optional().default(''),
  reportTemplate: z.enum(['royal', 'modern', 'executive', 'tvtc']).default('royal'),
  executiveSummary: z.string().optional().default(''),
  challengesText: z.string().optional().default(''),
  recommendationsText: z.string().optional().default(''),
  introText: z.string().default(''),
  entityIntroText: z.string().default(''),
  skillsText: z.string().default(''),
  conclusionText: z.string().default(''),
  status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'changes_requested']).optional(),
  verificationHash: z.string().optional(),
  tenantId: z.string().optional()
});

export const aiProcessSchema = z.object({
  text: z.string().min(1, 'النص مطلوب للتحسين'),
  action: z.enum(['polish', 'spellcheck', 'summarize', 'translate', 'audit_all', 'academic_rewrite']),
  targetLang: z.enum(['ar', 'en']).optional(),
  context: z.string().optional(),
  apiKey: z.string().optional(),
  model: z.string().optional()
});

export const batchRewriteEntriesSchema = z.object({
  weekNumber: z.number().int().positive().optional(),
  apiKey: z.string().optional(),
  model: z.string().optional()
});

export const organizationLookupSchema = z.object({
  organizationName: z.string().min(1, 'اسم جهة التدريب مطلوب للبحث'),
  department: z.string().optional().default(''),
  targetField: z.enum(['all', 'entityIntroText', 'introText', 'skillsText', 'conclusionText']).optional().default('all')
});

export const linkSupervisorSchema = z.object({
  supervisorUsernameOrCode: z.string().min(2, 'رمز أو اسم مستخدم المشرف مطلوب')
});

// ==========================================
// 3. TypeScript Interfaces
// ==========================================
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EntryInput = z.infer<typeof entrySchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AIProcessInput = z.infer<typeof aiProcessSchema>;
export type BatchRewriteEntriesInput = z.infer<typeof batchRewriteEntriesSchema>;
export type OrganizationLookupInput = z.infer<typeof organizationLookupSchema>;

export interface OrganizationLookupResult {
  organizationName: string;
  foundName: string;
  source: string;
  entityOverview: string;
  suggestedIntro: string;
  suggestedSkills: string;
  suggestedConclusion: string;
  keyFacts?: string[];
  departmentFocus?: string;
}

export interface EntryDTO {
  id: number;
  userId: number;
  entryDate: string;
  timeFrom: string;
  timeTo: string;
  title: string;
  category: EntryCategory;
  description: string;
  createdAt: string;
}

export interface ReportProfileDTO {
  userId: number;
  studentName: string;
  trainingNumber: string;
  department: string;
  trainingUnit: string;
  supervisorName: string;
  responsibleName: string;
  entityAddress: string;
  employeesCount: string;
  trainingWeeks: number;
  courseHours: number;
  startDate: string;
  companyLogo?: string;
  institutionLogo?: string;
  reportTemplate?: 'royal' | 'modern' | 'executive' | 'tvtc';
  executiveSummary?: string;
  challengesText?: string;
  recommendationsText?: string;
  introText: string;
  entityIntroText: string;
  skillsText: string;
  conclusionText: string;
  supervisorNotes?: string;
  supervisorRating?: string;
  supervisorApproved?: boolean;
  supervisorApprovedAt?: string | null;
  status?: ReportStatus;
  verificationHash?: string | null;
  tenantId?: string;
}

export type ReportStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'changes_requested';

export interface ReportStatusHistoryDTO {
  id: number;
  reportId: number;
  actorId: number;
  fromStatus: string;
  toStatus: string;
  note?: string | null;
  createdAt: string;
  actorName?: string;
}

export interface ReportSectionCommentDTO {
  id: number;
  reportId: number;
  supervisorId: number;
  sectionKey: string;
  comment: string;
  resolved: boolean;
  createdAt: string;
  supervisorName?: string;
}

export interface AuditLogDTO {
  id: number;
  tenantId: string;
  userId?: number | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: any;
  ipAddress?: string | null;
  createdAt: string;
  username?: string;
}

export interface AiUsageLogDTO {
  id: number;
  tenantId: string;
  userId: number;
  provider: string;
  action: string;
  tokensIn: number;
  tokensOut: number;
  costEstimate: number;
  createdAt: string;
}

export interface ReportVerificationDTO {
  valid: boolean;
  reportId: number;
  studentNameMasked: string;
  trainingUnit: string;
  entityAddress: string;
  trainingWeeks: number;
  courseHours: number;
  approvedAt: string | null;
  supervisorName: string;
  status: string;
}

export interface ExportJobStatusDTO {
  jobId: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  error?: string;
}

export const REPORT_TEMPLATES = [
  {
    id: 'royal',
    nameAr: 'الأكاديمي الملكي',
    nameEn: 'Royal Academic',
    primaryColor: '#8B0000',
    secondaryColor: '#2F6B4F',
    badge: 'معتمد',
    descriptionAr: 'الطابع الأكاديمي الكلاسيكي المعتمد للجامعات بلمسات العنابي والخطوط الرصينة'
  },
  {
    id: 'modern',
    nameAr: 'الهندسي العصري',
    nameEn: 'Modern Engineering',
    primaryColor: '#0284C7',
    secondaryColor: '#0F172A',
    badge: 'تقني',
    descriptionAr: 'تصميم تقني متطور بلون كحلي وسماوي مع بطاقات إنجاز بصرية عصرية'
  },
  {
    id: 'executive',
    nameAr: 'المؤسسي التنفيذي',
    nameEn: 'Executive Institutional',
    primaryColor: '#1E293B',
    secondaryColor: '#D97706',
    badge: 'إداري',
    descriptionAr: 'تصميم تنفيذي يركز على مؤشرات الإنجاز، الملخص التنفيذي، وجداول الأعمال'
  },
  {
    id: 'tvtc',
    nameAr: 'نموذج الكليات التقنية',
    nameEn: 'TVTC Standard',
    primaryColor: '#065F46',
    secondaryColor: '#1F2937',
    badge: 'رسمي',
    descriptionAr: 'مطابق للكليشات ونماذج التدريب الميداني المعتمدة بالمؤسسة العامة للتدريب التقني والمهني'
  }
] as const;

export type ReportTemplateId = (typeof REPORT_TEMPLATES)[number]['id'];

export interface WeeklyEvidenceDTO {
  id: number;
  userId: number;
  weekIndex: number;
  caption: string;
  imageData: string;
  createdAt: string;
}

export interface WeekGroup {
  weekIndex: number;
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  totalDays: number;
  entries: EntryDTO[];
  evidence?: WeeklyEvidenceDTO[];
  status?: 'completed' | 'in_progress' | 'pending' | 'postponed';
}

export interface FinalReportData {
  profile: ReportProfileDTO;
  weeks: WeekGroup[];
  totalHours: number;
  totalEntries: number;
  totalDays: number;
  estimatedPages: number;
  wordCount: number;
}

// ==========================================
// 4. Pure Calculation & Utility Functions
// ==========================================

/**
 * Calculates accurate hours between two time strings formatted as HH:MM.
 * Handles normal daytime spans as well as shifts spanning past midnight.
 */
export function calculateHoursBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  if (isNaN(fh) || isNaN(fm) || isNaN(th) || isNaN(tm)) return 0;
  let diffMinutes = (th * 60 + tm) - (fh * 60 + fm);
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // Crosses midnight
  }
  return Number((diffMinutes / 60).toFixed(2));
}

/**
 * Saudi Arabia business week starts on Sunday and ends on Saturday.
 * Given a date (YYYY-MM-DD), returns the ISO date string of that week's Sunday.
 */
export function getWeekStart(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = dt.getUTCDay(); // 0 is Sunday
  dt.setUTCDate(dt.getUTCDate() - dayOfWeek);
  return dt.toISOString().slice(0, 10);
}

/**
 * Given the week start (Sunday), returns the week end (Saturday).
 */
export function getWeekEnd(startStr: string): string {
  const [year, month, day] = startStr.split('-').map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day));
  dt.setUTCDate(dt.getUTCDate() + 6);
  return dt.toISOString().slice(0, 10);
}

/**
 * Accurately formats a date to Arabic (Saudi Arabia) locale using Latin numerals.
 */
export function formatDateArabic(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day));
  const raw = new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC'
  }).format(dt);
  return raw.replace(/[\u200E\u200F\u202A-\u202E]/g, '');
}

export const ARABIC_ORDINAL_DAYS = [
  'الأول',
  'الثاني',
  'الثالث',
  'الرابع',
  'الخامس',
  'السادس',
  'السابع',
  'الثامن',
  'التاسع',
  'العاشر'
];

/**
 * Returns a precise academic training period string based on actual logged entries.
 * If 3 days are logged, it reports "من اليوم الأول (...) إلى اليوم الثالث (...)".
 * It never claims or prints that the trainee worked up to Day 7 if only 3 days were done.
 */
export function formatWeekPeriod(
  w: { weekStart?: string; weekEnd?: string; entries?: Array<{ entryDate: string }> },
  isAr: boolean = true
): string {
  const entries = w.entries || [];
  if (entries.length === 0) {
    const startFormatted = w.weekStart ? (isAr ? formatDateArabic(w.weekStart) : formatDateEnglish(w.weekStart)) : '';
    const endFormatted = w.weekEnd ? (isAr ? formatDateArabic(w.weekEnd) : formatDateEnglish(w.weekEnd)) : '';
    if (startFormatted && endFormatted) {
      return isAr
        ? `الفترة المجدولة: من ${startFormatted} إلى ${endFormatted} (أسبوع مؤجل / متاح للتوثيق)`
        : `Scheduled: From ${startFormatted} to ${endFormatted} (Pending documentation)`;
    }
    return isAr ? 'أسبوع مؤجل / متاح للتوثيق' : 'Pending documentation';
  }

  const sorted = [...entries].sort((a, b) => (a.entryDate || '').localeCompare(b.entryDate || ''));
  const count = sorted.length;
  const firstDate = sorted[0].entryDate;
  const lastDate = sorted[count - 1].entryDate;

  const firstFormatted = isAr ? formatDateArabic(firstDate) : formatDateEnglish(firstDate);
  const lastFormatted = isAr ? formatDateArabic(lastDate) : formatDateEnglish(lastDate);

  if (count === 1) {
    return isAr
      ? `اليوم الأول: ${firstFormatted} (يوم عمل موثق)`
      : `Day 1: ${firstFormatted} (1 documented day)`;
  }

  const lastOrdinalAr = ARABIC_ORDINAL_DAYS[count - 1] || `الـ ${count}`;
  return isAr
    ? `من اليوم الأول (${firstFormatted}) إلى اليوم ${lastOrdinalAr} (${lastFormatted}) — [${count} أيام عمل منجزة]`
    : `From Day 1 (${firstFormatted}) to Day ${count} (${lastFormatted}) — [${count} documented days]`;
}

/**
 * Formats a date to English locale.
 */
export function formatDateEnglish(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC'
  }).format(dt);
}

/**
 * Counts total words in a string (supports Arabic and English words).
 */
export function countWords(text: string): number {
  if (!text) return 0;
  const matches = text.trim().match(/[\p{L}\p{N}_\-]+/gu);
  return matches ? matches.length : 0;
}

/**
 * Estimates academic report page count based on word count.
 * ~350 words per academic A4 page (Traditional Arabic 14pt / Times New Roman, 1.5 line spacing).
 */
export function estimatePageCount(wordCount: number): number {
  if (wordCount <= 0) return 1;
  return Math.max(1, Math.round(wordCount / 350));
}

export interface DiffChunk {
  type: 'same' | 'added' | 'removed';
  value: string;
}

/**
 * Simple word-level diff algorithm for before/after comparison.
 */
export function computeWordDiff(original: string, modified: string): DiffChunk[] {
  const origWords = original.trim().split(/(\s+)/);
  const modWords = modified.trim().split(/(\s+)/);

  // If identical
  if (original === modified) {
    return [{ type: 'same', value: original }];
  }

  // Basic diff algorithm: find longest common elements or group
  const chunks: DiffChunk[] = [];
  let i = 0;
  let j = 0;

  while (i < origWords.length || j < modWords.length) {
    if (i < origWords.length && j < modWords.length && origWords[i] === modWords[j]) {
      chunks.push({ type: 'same', value: origWords[i] });
      i++;
      j++;
    } else {
      // Look ahead for matches
      let matchFound = false;
      for (let lookahead = 1; lookahead <= 4; lookahead++) {
        if (i + lookahead < origWords.length && j < modWords.length && origWords[i + lookahead] === modWords[j]) {
          for (let k = 0; k < lookahead; k++) {
            chunks.push({ type: 'removed', value: origWords[i + k] });
          }
          i += lookahead;
          matchFound = true;
          break;
        } else if (j + lookahead < modWords.length && i < origWords.length && origWords[i] === modWords[j + lookahead]) {
          for (let k = 0; k < lookahead; k++) {
            chunks.push({ type: 'added', value: modWords[j + k] });
          }
          j += lookahead;
          matchFound = true;
          break;
        }
      }
      if (!matchFound) {
        if (i < origWords.length) {
          chunks.push({ type: 'removed', value: origWords[i] });
          i++;
        }
        if (j < modWords.length) {
          chunks.push({ type: 'added', value: modWords[j] });
          j++;
        }
      }
    }
  }

  return chunks;
}

// ==========================================
// 8. Expert Academic Weekly Report Synthesis Engine
// ==========================================

export interface WeeklySynthesisResult {
  executiveSummary: string;
  technicalPillars: string[];
  toolsAndTech: string[];
  acquiredCompetencies: string[];
  fullNarrative: string;
}

/**
 * Expert Academic Weekly Report Synthesis Engine
 * Generates elite executive report summaries with rich lexical variety and authoritative engineering diction.
 */
export function generateAcademicWeeklySynthesis(
  entries: EntryDTO[] = [],
  weekIndexOrTitle: number | string = 1,
  totalHours: number = 0,
  isAr: boolean = true
): WeeklySynthesisResult {
  if (!entries || entries.length === 0) {
    return {
      executiveSummary: isAr ? 'لم تُسجل مهام ميدانية لهذه الفترة بعد.' : 'No field tasks recorded for this period yet.',
      technicalPillars: [],
      toolsAndTech: [],
      acquiredCompetencies: [],
      fullNarrative: ''
    };
  }

  // 1. Build Truthful Pillars Directly from Actual Elevated Task Titles (NO hallucinated domains!)
  const rawPillars = entries.map(e => elevateTaskTitle(e.title, e.description, isAr));
  const technicalPillars = Array.from(new Set(rawPillars)).slice(0, 5);

  // 2. Extract Specific Acquired Competencies Strictly Matching the Real Entries
  const combinedText = entries.map(e => `${e.title} ${e.category} ${e.description}`).join(' ');
  const dynamicCompetencies: string[] = [];

  if (/hr|موارد بشرية|مقابلة|بيئة العمل|أنظمة|تهيئة/i.test(combinedText)) {
    dynamicCompetencies.push(
      isAr
        ? 'استيعاب الهيكل التنظيمي واللوائح الإدارية وسياسات الأمن والسلامة المهنية المعتمدة لدى المنشأة.'
        : 'Understanding enterprise organization, operational policies, and occupational safety guidelines.'
    );
  }

  if (/خطة|مشرف|فريق|مهندس|اجتماع|تعرف|أهداف/i.test(combinedText)) {
    dynamicCompetencies.push(
      isAr
        ? 'مواءمة أهداف الخطة التدريبية الميدانية مع مهام فرق العمل التشغيلية وتحديد مؤشرات الإنجاز الدورية.'
        : 'Aligning co-op training plan milestones with operational team objectives and supervisor criteria.'
    );
  }

  if (/ftth|ألياف|ont|olt|odn|odb|fiber|بوكسية|لحام|splice/i.test(combinedText)) {
    dynamicCompetencies.push(
      isAr
        ? 'الفحص والمعاينة الميدانية لمكونات شبكات النفاذ الضوئي (FTTH) ومسارات كوابل الألياف الضوئية.'
        : 'Inspecting physical optical access infrastructure (FTTH) and fiber distribution points.'
    );
  }

  if (/trouble ticket|إنذار|alarm|صيانة|عطل|link down|تذاكر/i.test(combinedText)) {
    dynamicCompetencies.push(
      isAr
        ? 'تطبيق آليات تصنيف بلاغات الأعطال ومتابعة مؤشرات الاستجابة ومعالجة الإنذارات التشغيلية وفق المعايير.'
        : 'Applying trouble ticket classification, alarm handling, and service escalation workflows.'
    );
  }

  if (/access team|صلاحيات|نفاذ|تحكم|vlan|switch|router/i.test(combinedText)) {
    dynamicCompetencies.push(
      isAr
        ? 'إدارة وضبط صلاحيات النفاذ والتحكم الشبكي والتحقق من سلامة الربط البيني للأجهزة والمواقع.'
        : 'Configuring network access permissions and validating site interconnection parameters.'
    );
  }

  if (/5g|جيل خامس|fwa|cpe|أبراج|google earth/i.test(combinedText)) {
    dynamicCompetencies.push(
      isAr
        ? 'تحليل مؤشرات تغطية شبكات الجيل الخامس (5G) وإجراءات المسح الميداني عبر الخرائط الجغرافية.'
        : 'Analyzing 5G network performance indicators and GIS-based field site verification.'
    );
  }

  // Always include foundational baseline competency
  dynamicCompetencies.push(
    isAr
      ? 'الالتزام الصارم بمعايير الانضباط المهني ومطابقة التوجيهات الفنية والإجرائية للمشرف الميداني.'
      : 'Strict adherence to professional standards and field supervisor operational guidelines.'
  );

  const acquiredCompetencies = Array.from(new Set(dynamicCompetencies));

  // 3. Extract Technical Tools & Acronyms ONLY If Explicitly Mentioned
  const acronyms = combinedText.match(/\b(FTTH|ONT|OLT|ODN|ODB|UTP|AAA|SLA|VLAN|5G|IP|DNS|DHCP|ITIL|SOC|Trouble Ticket|Access Team|Google Earth)\b/gi) || [];
  const uniqueTools = Array.from(new Set(acronyms.map(a => {
    if (/access team/i.test(a)) return 'Access Team';
    if (/trouble ticket/i.test(a)) return 'Trouble Ticket';
    if (/google earth/i.test(a)) return 'Google Earth';
    return a.toUpperCase();
  })));

  // 4. Build Dynamic Executive Narrative Reflecting Exactly What Was Done
  const hoursText = totalHours > 0 ? (isAr ? `${totalHours} ساعة تدريبية` : `${totalHours} training hours`) : '';
  const tasksCountText = entries.length > 0 ? (isAr ? `${entries.length} مهام ميدانية نوعية` : `${entries.length} specialized field tasks`) : '';

  const mainFocus = technicalPillars.slice(0, 2).join(isAr ? ' و ' : ' and ');

  const executiveSummary = isAr
    ? `تم خلال هذه الفترة التدريبية إنجاز ${tasksCountText}${hoursText ? ` عبر ${hoursText}` : ''}، حيث تركّز العمل الميداني على (${mainFocus})، مع الالتزام التام بإجراءات المنشأة وضوابط الجودة المعتمدة.`
    : `During this training timeframe, ${tasksCountText} were successfully accomplished${hoursText ? ` over ${hoursText}` : ''}, focusing primarily on (${mainFocus}), ensuring strict adherence to host entity quality workflows.`;

  // 5. Build Full Synthesis Narrative
  const toolsFormatted = uniqueTools.length > 0
    ? (isAr ? `التقنيات والأدوات الموظفة: ${uniqueTools.join(', ')}.` : `Utilized Tools & Technologies: ${uniqueTools.join(', ')}.`)
    : '';

  const fullNarrative = isAr
    ? `${executiveSummary}\n\n• أبرز المحاور التشغيلية المنفذة:\n  - ${technicalPillars.join('\n  - ')}\n\n• الكفايات والمخرجات المكتسبة:\n  - ${acquiredCompetencies.join('\n  - ')}\n\n${toolsFormatted}`.trim()
    : `${executiveSummary}\n\n• Core Operational Pillars:\n  - ${technicalPillars.join('\n  - ')}\n\n• Acquired Competencies & Outcomes:\n  - ${acquiredCompetencies.join('\n  - ')}\n\n${toolsFormatted}`.trim();

  return {
    executiveSummary,
    technicalPillars,
    toolsAndTech: uniqueTools,
    acquiredCompetencies,
    fullNarrative
  };
}

/**
 * Normalizes trainee student name cleanly without hardcoding personal data.
 */
export function normalizeStudentName(name?: string): string {
  if (!name) return '';
  return name.trim();
}

/**
 * Intelligent Professional Engineering Categorizer
 * Infers accurate technical domain from task text and title rather than generic "تدريب وتعلّم"
 */
export function inferProfessionalCategory(text: string = '', title: string = ''): string {
  const combined = `${title} ${text}`.toLowerCase();
  
  if (/(5g|cpe|fwa|mvno|جيل خامس|ترددات|محطات|أبراج|b2b|b2c|خلوي|لاسلكي)/i.test(combined)) {
    return 'شبكات الاتصالات اللاسلكية والجيل الخامس (5G)';
  }
  if (/(ftth|ont|olt|odn|odb|utp|ألياف|ضوئيات|بوكسية|نفاذ ضوئي|كوابل|تراسل ضوئي)/i.test(combined)) {
    return 'شبكات النفاذ والألياف الضوئية (FTTH)';
  }
  if (/(cyber|security|red team|blue team|mitre|socket|أمن سيبراني|اختراق|ثغرات|جدار حماية|firewall)/i.test(combined)) {
    return 'أمن المعلومات والأمن السيبراني';
  }
  if (/(alarm|alarms|trouble ticket|noc|انقطاع|حرارة|رطوبة|تذاكر صيانة|بلاغات أعطال|مراقبة)/i.test(combined)) {
    return 'إدارة الأعطال والتشغيل ومراقبة الأنظمة (NOC)';
  }
  if (/(router|switch|vlan|ip|routing|subnet|موجّه|سويتش|توجيه|تراسل)/i.test(combined)) {
    return 'هندسة الشبكات وتراسل البيانات';
  }
  if (/(برمجة|تطوير|كود|api|frontend|backend|database|sql|react|node|python)/i.test(combined)) {
    return 'تطوير وهندسة البرمجيات والأنظمة';
  }
  if (/(سيرفر|خادم|cloud|aws|azure|vmware|docker|active directory)/i.test(combined)) {
    return 'الحوسبة السحابية وإدارة الخوادم';
  }
  if (/(دعم فني|صيانة|طابعة|أجهزة|تهيئة حاسب|فورمات|مستخدمين)/i.test(combined)) {
    return 'الدعم الفني الميداني وصيانة النظم';
  }
  return 'هندسة الشبكات وتراسل البيانات';
}

/**
 * Elevates informal or diary-style student task titles into formal executive engineering titles (bilingual AR/EN)
 */
export function elevateTaskTitle(title: string = '', description: string = '', isAr: boolean = true): string {
  let t = title.trim();
  const desc = description.toLowerCase();

  // Contextual targeted elevations based on actual trainee cases
  if (
    /بداية اليوم.*access/i.test(t) ||
    /team access|access team/i.test(t) ||
    (/access/i.test(t) && /ftth/i.test(desc)) ||
    /مباشرة الأعمال التشغيلية مع فريق.*access/i.test(t)
  ) {
    return isAr
      ? 'التهيئة التشغيلية وإدارة صلاحيات النفاذ والتحكم مع فريق (Access Team)'
      : 'Operational Onboarding & Network Access Control Administration with Access Team';
  }
  if (/اليوم بيكون عن 5g/i.test(t) || (/5g/i.test(t) && /(fwa|cpe|mvno|earth)/i.test(desc))) {
    return isAr
      ? 'الفحص الفني لمؤشرات أداء شبكات 5G والمسح الجغرافي للمحطات عبر أنظمة Google Earth'
      : 'Technical 5G KPI Verification & Geographic Site Survey via Google Earth Systems';
  }
  if (/العمل مع قسم 5g/i.test(t) || (/5g/i.test(t) && /(patching|configuration|cyber)/i.test(desc))) {
    return isAr
      ? 'ضبط تكوينات ومحددات شبكات الجيل الخامس (5G Patching) وإجراءات الاستجابة السيبرانية'
      : '5G Network Parameter Configurations (5G Patching) & Cyber Incident Response Workflows';
  }
  if (/ftth|ألياف|ont|olt|odn|odb|fiber|بوكسية|لحام|splice/i.test(t) || /ftth/i.test(desc)) {
    return isAr
      ? 'الفحص والمعاينة الميدانية لمكونات شبكات النفاذ الضوئي (FTTH) ومسارات التوزيع'
      : 'Optical Access Network (FTTH) Field Inspection & Distribution Path Verification';
  }
  if (/trouble ticket|إنذار|alarm|صيانة|عطل|link down|تذاكر/i.test(t) || /alarm/i.test(desc)) {
    return isAr
      ? 'تصنيف ومعالجة بلاغات الأعطال ومتابعة الإنذارات التشغيلية (Trouble Tickets)'
      : 'Trouble Ticket Classification & Operational Network Alarm Remediation';
  }
  if (/اول يوم عمل.*(hr|مقابلة|موارد)/i.test(t) || /مقابلة hr/i.test(t) || /اول يوم عمل/i.test(t)) {
    return isAr
      ? 'التهيئة المؤسسية ومقابلة الموارد البشرية (HR) والتعريف ببيئة العمل والأنظمة'
      : 'Enterprise Onboarding, HR Orientation & Workplace Systems Familiarization';
  }

  if (!isAr) {
    if (/^[A-Za-z0-9\s\-_\.,:\(\)]+$/.test(t)) {
      return t;
    }
    if (/شبك|راوتر|سويتش|vlan/i.test(t)) return 'Network Infrastructure Configuration & Switch Port Administration';
    if (/سيرفر|خادم|نظام/i.test(t)) return 'Enterprise Server Administration & System Maintenance';
    if (/أمن|حماية|أمان|ثغرة/i.test(t)) return 'Cybersecurity Analysis, Threat Mitigation & Access Governance';
    if (/دعم|صيانة|طابعة|مستخدم/i.test(t)) return 'Field Technical Support & End-User Workplace Troubleshooting';
    if (/برمج|تطوير|كود|قاعدة/i.test(t)) return 'Software Engineering, Code Optimization & Database Operations';
    return 'Field Technical Engineering Operations & Core Activities';
  }

  // Remove colloquial or raw journal phrasing in Arabic
  t = t.replace(/^اليوم بيكون عن\s*/gi, 'دراسة وتطبيق تقنيات ');
  t = t.replace(/^بداية اليوم\s*(الأول|الثاني|الثالث|الرابع|الخامس)?\s*و?توجهي الى\s*/gi, 'مباشرة الأعمال التشغيلية مع فريق ');
  t = t.replace(/^العمل مع قسم\s*/gi, 'إنجاز المهام الميدانية في قسم ');
  t = t.replace(/\s*في اليوم\s*(الأول|الثاني|الثالث|الرابع|الخامس)\s*$/gi, '');
  t = t.replace(/^سويت\s*/gi, 'تهيئة وبرمجة ');
  t = t.replace(/^شفت\s*/gi, 'معاينة وفحص ');
  t = t.replace(/^جلسة تعريفية\s*و?التعريف بـ\s*/gi, 'التهيئة الفنية لمنظومة ');
  t = t.replace(/^اول يوم عمل\s*(و|مع)?\s*/gi, 'مباشرة العمل و');
  t = t.replace(/مقابلة\s*hr/gi, 'إجراءات الموارد البشرية (HR)');
  t = t.replace(/team access/gi, 'Access Team');

  return t || 'المهام التشغيلية والهندسية الميدانية';
}

/**
 * Converts raw bullet lists or colloquial fragments into structured professional technical prose
 */
export function polishAcademicNarrative(text: string = ''): string {
  if (!text.trim()) return '';
  let s = text.trim();

  // 1. Remove raw colloquialisms and typos
  s = s.replace(/وكتابة وما للدخول/giu, 'وكتابة أوامر منح صلاحيات النفاذ والتحكم للدخول (Access Control Commands)');
  s = s.replace(/ضوضيات\s*-\s*FIBS|ضوئيات\s*-\s*FIBS/giu, 'ضوئيات - شبكات الألياف البصرية (FTTH)');
  s = s.replace(/team access/giu, 'Access Team');
  s = s.replace(/سويت\s+/gu, 'تمت تهيئة وتكوين ');
  s = s.replace(/سوينا\s+/gu, 'تم تنفيذ وإنجاز ');
  s = s.replace(/بيكون\s+/gu, 'تم التركيز على ');
  s = s.replace(/بعد الـ\s*break/giu, 'خلال الفترة التشغيلية الثانية');
  s = s.replace(/الـ\s*break/giu, 'فترة الاستراحة المقررة');
  s = s.replace(/بعد الـ\s*alarm/giu, 'عقب رصد الإنذار التشغيلي');
  s = s.replace(/الـ\s*alarm/giu, 'الإنذارات التشغيلية');
  s = s.replace(/الـ\s*access/giu, 'صلاحيات النفاذ والتحكم');

  // 2. Synthesize consecutive raw acronym blocks into clean professional sentences
  const fiberRegex = /ONT\s*[\n\r]+\s*الألياف الضوئية\s*[\n\r]+\s*البوكسية\s*[\n\r]+\s*UTP\s*[\n\r]+\s*OLT\s*[\n\r]+\s*ODN\s*[\n\r]+\s*ODB/gi;
  s = s.replace(fiberRegex, '• الفحص والمعاينة الميدانية لمكونات شبكة النفاذ الضوئي وتشمل: أجهزة المشتركين (ONT)، كبائن التوزيع السكنية (البوكسية)، كوابل النقل النحاسية (UTP)، مقاسم النفاذ الضوئي (OLT)، وشبكات التوزيع الضوئي السلبية (ODN / ODB).');

  const cyberRegex = /Red Team\s*[\n\r]+\s*Blue Team\s*[\n\r]+\s*Socket/gi;
  s = s.replace(cyberRegex, '• دراسة مهام وتكامل فرق العمليات السيبرانية: فريق الاختراق والاختبار المتقدم (Red Team)، وفريق الدفاع والرصد والاستجابة للحوادث (Blue Team)، ومنافذ الاتصال الشبكي (Sockets).');

  const casesRegex = /Link Down\s*[\n\r]+\s*(\.\.\.)?Equipment Dis\s*[\n\r]+\s*Internet Slowness\s*[\n\r]+\s*No Browsing/gi;
  s = s.replace(casesRegex, '• تصنيف ومعالجة الحالات الميدانية لبلاغات الأعطال الفنية وتشمل: انقطاع المسارات (Link Down)، أعطال وفصل المعدات (Equipment Disconnect)، بطء النفاذ للخدمة (Internet Slowness)، وحالات توقف التصفح الكامل (No Browsing).');

  return s;
}
