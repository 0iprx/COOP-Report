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
  return new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC'
  }).format(dt);
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
