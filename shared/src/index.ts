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

export type EntryCategory = (typeof ENTRY_CATEGORIES)[number];

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
  introText: z.string().default(''),
  entityIntroText: z.string().default(''),
  skillsText: z.string().default(''),
  conclusionText: z.string().default('')
});

export const aiProcessSchema = z.object({
  text: z.string().min(1, 'النص مطلوب للتحسين'),
  action: z.enum(['polish', 'spellcheck', 'summarize', 'translate', 'audit_all']),
  targetLang: z.enum(['ar', 'en']).optional(),
  context: z.string().optional()
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
  introText: string;
  entityIntroText: string;
  skillsText: string;
  conclusionText: string;
}

export interface WeekGroup {
  weekIndex: number;
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  totalDays: number;
  entries: EntryDTO[];
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
