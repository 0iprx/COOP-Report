import { ENTRY_SECTIONS, EXAGGERATION, FILLER, SPELLING, STOPWORDS } from './rules.js';

/**
 * Lightweight writing checker for Arabic co-op reports.
 * Pure TypeScript, no model, no network: runs in milliseconds on any server.
 * It never invents content. Safe fixes (spelling, punctuation, the trainee's
 * own glossary) are applied to `fixed`; everything else is reported as an issue
 * with an explanation, and gaps become questions for the trainee.
 */

export type IssueKind = 'spelling' | 'punctuation' | 'glossary' | 'filler' | 'exaggeration' | 'repetition' | 'long_sentence' | 'voice' | 'tam' | 'consistency' | 'structure' | 'avoid';

export interface Issue {
  kind: IssueKind;
  message: string;
  /** Text the issue is about, as it appears in the source. */
  excerpt?: string;
  /** Replacement when the fix is mechanical; applied in `fixed` when autoFixed. */
  replacement?: string;
  autoFixed: boolean;
}

export interface Analysis {
  fixed: string;
  issues: Issue[];
  questions: string[];
  stats: { words: number; sentences: number; avgSentenceWords: number; fixesApplied: number };
}

export interface AnalyzeOptions {
  kind: 'entry' | 'section' | 'free';
  glossary?: { term: string; preferred: string }[];
  avoidPhrases?: string[];
}

const AR = '؀-ۿ';
const wordRe = (w: string) => new RegExp(`(?<![${AR}A-Za-z0-9])${escapeRe(w)}(?![${AR}A-Za-z0-9])`, 'g');
function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const isArabicContext = (s: string) => (s.match(new RegExp(`[${AR}]`, 'g')) || []).length > (s.match(/[A-Za-z]/g) || []).length;

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!؟?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.replace(/[^\p{L}]/gu, '').length > 2);
}

export function analyzeText(input: string, opts: AnalyzeOptions): Analysis {
  const issues: Issue[] = [];
  let fixed = input.replace(/\r\n/g, '\n');
  let fixesApplied = 0;
  const arabic = isArabicContext(fixed);

  // ── 1. Spelling (unambiguous list) ─────────────────────────
  const spellingSeen = new Set<string>();
  for (const [wrong, right] of Object.entries(SPELLING)) {
    if (wrong === right) continue;
    const re = wordRe(wrong);
    if (re.test(fixed)) {
      fixed = fixed.replace(wordRe(wrong), right);
      fixesApplied++;
      if (!spellingSeen.has(wrong)) {
        spellingSeen.add(wrong);
        issues.push({ kind: 'spelling', message: `«${wrong}» تُكتب «${right}»`, excerpt: wrong, replacement: right, autoFixed: true });
      }
    }
  }

  // ── 2. The trainee's own glossary ─────────────────────────
  for (const g of opts.glossary || []) {
    if (!g.term || !g.preferred || g.term === g.preferred) continue;
    if (wordRe(g.term).test(fixed)) {
      fixed = fixed.replace(wordRe(g.term), g.preferred);
      fixesApplied++;
      issues.push({ kind: 'glossary', message: `استُبدل «${g.term}» بمصطلحك المفضّل «${g.preferred}»`, excerpt: g.term, replacement: g.preferred, autoFixed: true });
    }
  }

  // ── 3. Punctuation and spacing (mechanical) ───────────────
  const punct: [RegExp, string, string][] = [
    [/[ \t]{2,}/g, ' ', 'مسافات زائدة'],
    [/\s+([،؛:.!؟,;?)])/g, '$1', 'مسافة قبل علامة الترقيم'],
    [/\(\s+/g, '(', 'مسافة بعد القوس'],
    [/([،؛])(?=[^\s\d])/g, '$1 ', 'لا مسافة بعد الفاصلة'],
    [/([.!؟?]){2,}/g, '$1', 'علامة ترقيم مكررة']
  ];
  for (const [re, rep, label] of punct) {
    const before = fixed;
    fixed = fixed.replace(re, rep);
    if (before !== fixed) {
      fixesApplied++;
      issues.push({ kind: 'punctuation', message: `صُحّح: ${label}`, autoFixed: true });
    }
  }
  if (arabic) {
    // Latin comma / question mark between Arabic words
    const before = fixed;
    fixed = fixed.replace(new RegExp(`([${AR}])\\s*,\\s*(?=[${AR}])`, 'g'), '$1، ').replace(new RegExp(`([${AR}])\\s*\\?`, 'g'), '$1؟');
    if (before !== fixed) {
      fixesApplied++;
      issues.push({ kind: 'punctuation', message: 'صُحّحت الفاصلة وعلامة الاستفهام إلى الشكل العربي', autoFixed: true });
    }
  }

  // ── 4. Style flags (not auto-fixed) ───────────────────────
  for (const phrase of FILLER) {
    if (fixed.includes(phrase)) issues.push({ kind: 'filler', message: `عبارة إنشائية لا تضيف معلومة؛ احذفها أو استبدلها بمعلومة محددة`, excerpt: phrase, autoFixed: false });
  }
  for (const phrase of EXAGGERATION) {
    if (fixed.includes(phrase)) issues.push({ kind: 'exaggeration', message: 'وصف مبالغ فيه؛ اذكر الدليل (رقم أو نتيجة) أو خفّف الوصف', excerpt: phrase, autoFixed: false });
  }
  for (const phrase of opts.avoidPhrases || []) {
    if (phrase && fixed.includes(phrase)) issues.push({ kind: 'avoid', message: 'عبارة سبق أن حذفتها من اقتراحات سابقة', excerpt: phrase, autoFixed: false });
  }

  const sentences = splitSentences(fixed);
  const wordsOf = (s: string) => s.split(/\s+/).filter(Boolean);
  const words = wordsOf(fixed).length;

  for (const s of sentences) {
    const n = wordsOf(s).length;
    if (n > 45) issues.push({ kind: 'long_sentence', message: `جملة طويلة (${n} كلمة)؛ قسّمها إلى جملتين أو ثلاث`, excerpt: s.slice(0, 80) + '…', autoFixed: false });
  }

  if (arabic && sentences.length >= 4) {
    const startsTam = sentences.filter((s) => /^(و?تم|و?تمت)\s/.test(s)).length;
    if (startsTam / sentences.length >= 0.4) {
      issues.push({ kind: 'tam', message: `${startsTam} من ${sentences.length} جمل تبدأ بـ«تم»؛ استخدم الفعل مباشرة (مثل: «فحصتُ» أو «جرى فحص») لتنويع الأسلوب`, autoFixed: false });
    }
  }

  if (arabic) {
    const third = (fixed.match(/(?<![؀-ۿ])(قام|قامت) المتدرب|المتدرب/g) || []).length;
    const first = (fixed.match(/(?<![؀-ۿ])(قمتُ?|عملتُ?|أنجزتُ?|تعلمتُ?|تعلّمتُ?|واجهتُ?|استخدمتُ?|راجعتُ?|فحصتُ?|شاركتُ?|حضرتُ?|تابعتُ?|أجريتُ?|نفذتُ?|نفّذتُ?|اكتسبتُ?|لاحظتُ?|كتبتُ?)(?![؀-ۿ])/g) || []).length;
    if (third > 0 && first > 0) {
      issues.push({ kind: 'voice', message: 'النص يخلط بين صيغة المتكلم و«المتدرب» بصيغة الغائب؛ وحّد الصيغة', autoFixed: false });
    }
  }

  // Repeated content word within a short window
  const tokens = fixed.split(/\s+/).map((t) => t.replace(/[^\p{L}\p{N}]/gu, ''));
  const reported = new Set<string>();
  tokens.forEach((t, i) => {
    // Arabic words only: repeated English technical terms (Battery, site, ONT) are usually legitimate.
    if (t.length < 4 || !/^[؀-ۿ]+$/.test(t) || STOPWORDS.has(t) || reported.has(t)) return;
    const window = tokens.slice(i + 1, i + 7);
    if (window.includes(t)) {
      reported.add(t);
      issues.push({ kind: 'repetition', message: `تكررت كلمة «${t}» في موضع متقارب`, excerpt: t, autoFixed: false });
    }
  });

  // Same English term written differently (FTTH / ftth / Ftth)
  const latin = fixed.match(/[A-Za-z][A-Za-z0-9-]{1,}/g) || [];
  const byLower = new Map<string, Set<string>>();
  for (const t of latin) {
    const k = t.toLowerCase();
    if (!byLower.has(k)) byLower.set(k, new Set());
    byLower.get(k)!.add(t);
  }
  for (const [, forms] of byLower) {
    // Only acronyms/product names: at least one form is written in capitals (FTTH vs ftth), not The/the.
    const ENGLISH_COMMON = new Set(['or', 'and', 'not', 'the', 'in', 'on', 'to', 'of', 'is', 'no', 'yes', 'pm', 'am']);
    const lower = [...forms][0].toLowerCase();
    const hasCaps = !ENGLISH_COMMON.has(lower) && [...forms].some((f) => f.length >= 2 && f === f.toUpperCase() && /[A-Z]/.test(f));
    if (forms.size > 1 && hasCaps) issues.push({ kind: 'consistency', message: `المصطلح مكتوب بأكثر من شكل: ${[...forms].join(' / ')}؛ وحّده`, autoFixed: false });
  }

  // ── 5. Structure and questions (entries) ──────────────────
  const questions: string[] = [];
  if (opts.kind === 'entry') {
    const structured = ENTRY_SECTIONS.some((s) => s.labels.test(fixed));
    if (structured) {
      for (const s of ENTRY_SECTIONS) {
        if (!s.labels.test(fixed)) {
          issues.push({ kind: 'structure', message: `قسم ناقص في إدخال اليوم: ${s.question}`, autoFixed: false });
          questions.push(s.question);
        }
      }
    } else if (words < 25) {
      questions.push('ما الذي أنجزته تحديداً؟ وما النتيجة؟', 'ما الأداة أو النظام الذي استخدمته؟');
    }
  }

  const lastChar = fixed.trim().slice(-1);
  if (arabic && fixed.trim() && !/[.!؟:)\]»"]/.test(lastChar) && !/\d/.test(lastChar)) {
    fixed = fixed.trimEnd() + '.';
    fixesApplied++;
    issues.push({ kind: 'punctuation', message: 'أُضيفت نقطة في نهاية النص', autoFixed: true });
  }

  return {
    fixed,
    issues,
    questions: questions.slice(0, 3),
    stats: {
      words,
      sentences: sentences.length,
      avgSentenceWords: sentences.length ? Math.round(words / sentences.length) : 0,
      fixesApplied
    }
  };
}
