import { z } from 'zod';

// ==========================================
// 1. Enums and Constants
// ==========================================
export const ENTRY_CATEGORIES = [
  'تطوير / برمجة',
  'اجتماعات',
  'تدريب وتعلّم',
  'توثيق',
  'دعم فني',
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
  action: z.enum(['polish', 'spellcheck', 'summarize', 'translate', 'audit_all']),
  targetLang: z.enum(['ar', 'en']).optional(),
  context: z.string().optional()
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
  weekIndex: number = 1,
  totalHours: number = 0,
  isAr: boolean = true
): WeeklySynthesisResult {
  const combinedText = entries.map(e => `${e.title} ${e.category} ${e.description}`).join(' ');

  // 1. Detect Core Engineering Domains
  const domainCandidates: Array<{ pattern: RegExp; titleAr: string; titleEn: string; competencyAr: string; competencyEn: string }> = [
    {
      pattern: /FTTH|ألياف|fiber|ONT|OLT|ODN|ODB|splice/i,
      titleAr: 'هندسة شبكات الألياف الضوئية (FTTH) ومكونات التراسل',
      titleEn: 'Fiber to the Home (FTTH) & Optical Transmission Infrastructure',
      competencyAr: 'إتقان الفحص العيني والتقني لمكونات شبكات التراسل الضوئي وتمديدات الألياف (ONT/OLT/ODN)',
      competencyEn: 'Mastering physical and logical inspection of optical transmission components (ONT/OLT/ODN)'
    },
    {
      pattern: /Alarm|إنذار|حرارة|رطوبة|تذكرة|Trouble|SLA|صيانة/i,
      titleAr: 'إدارة إنذارات الشبكة ومصفوفة تصعيد بلاغات الصيانة',
      titleEn: 'Network Alarms Management & Trouble Ticket Escalation',
      competencyAr: 'تطبيق معايير تصنيف الإنذارات التشغيلية وآليات الاستجابة السريعة وتصعيد التذاكر الفنية وفق اتفاقيات مستوى الخدمة (SLA)',
      competencyEn: 'Applying operational alarm classification and fast-response escalation workflows under SLAs'
    },
    {
      pattern: /Access|نفاذ|VLAN|سويتش|switch|راوتر|router|شبك/i,
      titleAr: 'هندسة شبكات النفاذ وضبط تكوينات الربط الميداني',
      titleEn: 'Access Networks Engineering & Field Interconnection Configurations',
      competencyAr: 'المشاركة الميدانية في اختبار كفاءة الربط الشبكي وإدارة تصاريح النفاذ للمواقع الحيوية',
      competencyEn: 'Hands-on participation in validating network connectivity and critical site access permissions'
    },
    {
      pattern: /AAA|Authentication|توثيق|مشترك|رسوم/i,
      titleAr: 'منظومات التوثيق والتحكم بنفاذ المشتركين (AAA)',
      titleEn: 'Subscriber Management & Authentication Architectures (AAA)',
      competencyAr: 'استيعاب البنية التشغيلية لخوادم التوثيق وضوابط التحقق من استحقاق وجودة الخدمة للمشتركين',
      competencyEn: 'Understanding authentication server workflows and subscriber service entitlement verification'
    },
    {
      pattern: /5G|جيل خامس|لاسلكي|تغطية|أبراج/i,
      titleAr: 'شبكات الاتصالات اللاسلكية والجيل الخامس (5G)',
      titleEn: '5G Mobile & Wireless Telecommunication Infrastructure',
      competencyAr: 'تحليل مؤشرات تغطية شبكات 5G ومتابعة إجراءات الترقيع والضبط الفني للمحطات',
      competencyEn: 'Analyzing 5G coverage metrics and participating in station configuration patching'
    },
    {
      pattern: /أمن|security|Red Team|Blue Team|ثغر|firewall/i,
      titleAr: 'ضوابط الأمن السيبراني وتقييم الجاهزية الدفاعية',
      titleEn: 'Cybersecurity Controls & Defense Readiness Assessment',
      competencyAr: 'فهم مصفوفة التهديدات السيبرانية وتطبيق الضوابط الوقائية لحماية الأنظمة والبنى التحتية',
      competencyEn: 'Understanding threat matrices and applying protective controls across enterprise assets'
    },
    {
      pattern: /سيرفر|خادم|لينكس|linux|windows|vmware|docker|قاعدة بيانات|database/i,
      titleAr: 'إدارة الخوادم الافتراضية والبيئات التشغيلية',
      titleEn: 'Virtual Server Administration & Infrastructure Platforms',
      competencyAr: 'التحقق من استقرار البيئات التشغيلية وإدارة الموارد والنسخ الاحتياطي الدوري',
      competencyEn: 'Verifying platform stability, resource utilization, and automated backup routines'
    }
  ];

  const matchedDomains = domainCandidates.filter(d => d.pattern.test(combinedText));
  const activeDomains = matchedDomains.length > 0 ? matchedDomains : [
    {
      pattern: /.*/,
      titleAr: 'العمليات الميدانية والدعم الفني التخصصي',
      titleEn: 'Field Operations & Technical Specialized Support',
      competencyAr: 'تنفيذ وتوثيق المهام الميدانية وفق الأدلة الإجرائية المعتمدة لدى المنشأة',
      competencyEn: 'Executing and documenting operational tasks compliant with standard host entity procedures'
    }
  ];

  // 2. Extract Technical Tools & Acronyms
  const acronyms = combinedText.match(/\b(FTTH|ONT|OLT|ODN|ODB|UTP|AAA|SLA|VLAN|5G|IP|DNS|DHCP|ITIL|SOC|Trouble Ticket|High Temp|Access Team|Red Team|Blue Team)\b/gi) || [];
  const uniqueTools = Array.from(new Set(acronyms.map(a => a.toUpperCase())));

  // 3. Dynamic Academic Phrasing (Rotating variety for expert freshness)
  const arabicOpeners = [
    `تمحورت الأنشطة التشغيلية والهندسية لهذا الأسبوع حول مباشرة المهام التخصصية ومتابعة جودة الأداء الميداني`,
    `تركّزت الأعمال الميدانية خلال هذه الفترة التدريبية على التنفيذ الفعلي لحزمة من الإجراءات التقنية المتقدمة`,
    `شهد الأسبوع التدريبي إنجاز سلسلة من المهام التشغيلية النوعية شملت المعاينة والفحص وتطبيق المعايير المعتمدة`,
    `تنوّعت مجالات العمل الميداني لتغطي محاور تقنية حيوية بالغة الأهمية في استقرار واستدامة المنظومة`,
    `انصبت الجهود الهندسية خلال هذه الفترة على المتابعة الدقيقة للأنظمة الميدانية وتطبيق أفضل الممارسات التشغيلية`
  ];

  const englishOpeners = [
    `Operational and engineering activities this week centered on specialized field execution and quality monitoring`,
    `Field tasks during this training timeframe focused on hands-on deployment of advanced technical workflows`,
    `This training week encompassed a comprehensive set of mission-critical tasks including inspection, testing, and standards verification`,
    `Operational efforts spanned strategic technical pillars vital to systems resilience and service continuity`,
    `Engineering activities were directed toward precision monitoring of field infrastructure and adherence to industry best practices`
  ];

  const seed = (weekIndex * 7 + entries.length * 13) % 5;
  const chosenOpener = isAr ? arabicOpeners[seed] : englishOpeners[seed];

  // 4. Build Pillars & Competencies Lists
  const technicalPillars = activeDomains.map(d => isAr ? d.titleAr : d.titleEn);
  const acquiredCompetencies = [
    ...activeDomains.map(d => isAr ? d.competencyAr : d.competencyEn),
    isAr
      ? `الالتزام الصارم بمعايير السلامة المهنية ومطابقة التوجيهات الفنية للمشرف الميداني بالمنشأة.`
      : `Strict compliance with occupational safety protocols and direct field supervisory guidelines.`
  ];

  // 5. Build Executive Summary
  const hoursText = totalHours > 0 ? (isAr ? `${totalHours} ساعة تدريبية` : `${totalHours} training hours`) : '';
  const tasksCountText = entries.length > 0 ? (isAr ? `${entries.length} مهام ميدانية نوعية` : `${entries.length} specialized field tasks`) : '';

  const executiveSummary = isAr
    ? `${chosenOpener}؛ حيث تم إنجاز ${tasksCountText} عبر ${hoursText}، مع التركيز على (${technicalPillars.slice(0, 2).join(' و')}).`
    : `${chosenOpener}, successfully accomplishing ${tasksCountText} over ${hoursText}, with a core focus on (${technicalPillars.slice(0, 2).join(' and ')}).`;

  // 6. Build Full Synthesis Narrative
  const toolsFormatted = uniqueTools.length > 0
    ? (isAr ? `التقنيات والأدوات الموظفة: ${uniqueTools.join(', ')}.` : `Utilized Tools & Technologies: ${uniqueTools.join(', ')}.`)
    : '';

  const fullNarrative = isAr
    ? `${executiveSummary}\n\n• أبرز المحاور التشغيلية:\n  - ${technicalPillars.join('\n  - ')}\n\n• الكفايات والمخرجات المكتسبة:\n  - ${acquiredCompetencies.join('\n  - ')}\n\n${toolsFormatted}`.trim()
    : `${executiveSummary}\n\n• Core Operational Pillars:\n  - ${technicalPillars.join('\n  - ')}\n\n• Acquired Competencies & Outcomes:\n  - ${acquiredCompetencies.join('\n  - ')}\n\n${toolsFormatted}`.trim();

  return {
    executiveSummary,
    technicalPillars,
    toolsAndTech: uniqueTools,
    acquiredCompetencies,
    fullNarrative
  };
}
