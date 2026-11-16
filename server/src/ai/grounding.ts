/**
 * Deterministic grounding check: anything concrete in the proposal (numbers,
 * English terms and acronyms) must also appear in what the model was given.
 * This catches invented devices, tools and figures before the user sees them.
 */

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const normDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));

const COMMON_LATIN = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'by', 'at', 'as', 'is', 'are', 'was', 'were', 'be',
  'this', 'that', 'these', 'those', 'it', 'its', 'from', 'into', 'via', 'per', 'also', 'not', 'no', 'than', 'then', 'after',
  'before', 'during', 'while', 'which', 'who', 'what', 'when', 'where', 'how', 'all', 'each', 'both', 'more', 'most', 'other',
  'such', 'their', 'they', 'them', 'we', 'our', 'i', 'my', 'me', 'he', 'she', 'his', 'her', 'has', 'have', 'had', 'did', 'do', 'does'
]);

function latinTokens(s: string): string[] {
  return (normDigits(s).match(/[A-Za-z][A-Za-z0-9+#./_-]*[A-Za-z0-9+#]|[A-Za-z]{2,}/g) || []).map((t) => t.toLowerCase());
}

function numberTokens(s: string): string[] {
  return (normDigits(s).match(/\d+(?:[.,:]\d+)*/g) || []).map((n) => n.replace(/,/g, ''));
}

export interface GroundingReport {
  ok: boolean;
  unsupported: string[];
}

/**
 * @param proposal model output
 * @param sources everything the model legitimately had (source text, context, notes, answers)
 * @param opts.checkLatin false when the output language is English (every word would be "new")
 */
export function checkGrounding(proposal: string, sources: string[], opts: { checkLatin: boolean }): GroundingReport {
  const pool = normDigits(sources.join('\n')).toLowerCase();
  const poolLatin = new Set(latinTokens(pool));
  const poolNums = new Set(numberTokens(pool));
  const unsupported = new Set<string>();

  for (const n of numberTokens(proposal)) {
    // Single digits are usually ordinals or list numbers ("1.", "الأسبوع 3") — only flag 2+ digit figures.
    if (n.replace(/\D/g, '').length < 2) continue;
    if (!poolNums.has(n) && !pool.includes(n)) unsupported.add(n);
  }

  if (opts.checkLatin) {
    for (const t of latinTokens(proposal)) {
      if (COMMON_LATIN.has(t)) continue;
      if (poolLatin.has(t) || pool.includes(t)) continue;
      unsupported.add(t);
    }
  }
  return { ok: unsupported.size === 0, unsupported: [...unsupported].slice(0, 12) };
}

/**
 * The other direction: concrete facts (multi-digit numbers, English terms) that
 * were in the source but are missing from the proposal. Used for every task except
 * summaries and translations, where dropping or rewording them is expected.
 */
export function findDropped(source: string, proposal: string, opts: { checkLatin: boolean }): string[] {
  const out = normDigits(proposal).toLowerCase();
  const dropped = new Set<string>();
  for (const n of numberTokens(source)) {
    if (n.replace(/\D/g, '').length < 2) continue;
    if (!out.includes(n)) dropped.add(n);
  }
  if (opts.checkLatin) {
    for (const t of latinTokens(source)) {
      if (COMMON_LATIN.has(t) || t.length < 2) continue;
      if (!out.includes(t)) dropped.add(t);
    }
  }
  return [...dropped].slice(0, 12);
}
