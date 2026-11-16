import React from 'react';
import { PeriodicAnalyticsCharts } from '../periodic/PeriodicAnalyticsCharts';

interface AcademicMarkdownViewProps {
  content: string;
  className?: string;
  isReportAr?: boolean;
  period?: 'p1' | 'p2';
}

/* ────────────────────────────────────────────────────────────────────────────
   Inline formatting
   - **bold** and `term` (terms render as plain isolated text, not code chips)
   - In Arabic reports every Latin run is bidi-isolated so parentheses,
     slashes and numbers around English terms keep their visual order.
   ──────────────────────────────────────────────────────────────────────────── */

// A stretch of non-Arabic text that contains at least one Latin letter.
const LATIN_RUN = /[^؀-ۿ\n]*[A-Za-z][^؀-ۿ\n]*/g;
const EDGE_PUNCT = /[\s،,.:;؛!?«»"'’—–-]/;

const tidyPunctuation = (text: string): string =>
  text
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s+([،,:؛.])/g, '$1')
    .replace(/ {2,}/g, ' ');

const parenBalance = (s: string) => (s.match(/\(/g) || []).length - (s.match(/\)/g) || []).length;

/**
 * Shrinks a Latin run so it never captures surrounding punctuation or an
 * unmatched parenthesis that belongs to the Arabic sentence.
 */
const coreOfRun = (run: string): [number, number] => {
  let a = 0;
  let b = run.length;
  let changed = true;
  while (changed && a < b) {
    changed = false;
    const core = run.slice(a, b);
    if (EDGE_PUNCT.test(run[a])) { a++; changed = true; continue; }
    if (EDGE_PUNCT.test(run[b - 1]) && run[b - 1] !== '%') { b--; changed = true; continue; }
    const bal = parenBalance(core);
    if (bal > 0 && run[a] === '(') { a++; changed = true; continue; }
    if (bal < 0 && run[b - 1] === ')') { b--; changed = true; continue; }
    if (bal > 0) {
      const lastOpen = core.lastIndexOf('(');
      if (lastOpen >= 0 && core.indexOf(')', lastOpen) < 0) { b = a + lastOpen; changed = true; continue; }
    }
    if (bal < 0) {
      const firstClose = core.indexOf(')');
      if (firstClose >= 0 && core.lastIndexOf('(', firstClose) < 0) { a = a + firstClose + 1; changed = true; continue; }
    }
  }
  return [a, b];
};

const isolateLatin = (text: string, keyBase: string): React.ReactNode[] => {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  LATIN_RUN.lastIndex = 0;
  while ((m = LATIN_RUN.exec(text))) {
    const [a, b] = coreOfRun(m[0]);
    const core = m[0].slice(a, b);
    if (!/[A-Za-z]/.test(core)) continue;
    const start = m.index + a;
    if (start > last) out.push(text.slice(last, start));
    out.push(
      <bdi key={`${keyBase}-l${start}`} dir="ltr" className={core.length <= 28 ? 'rt-latin is-short' : 'rt-latin'}>
        {core}
      </bdi>
    );
    last = start + core.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
};

/** Arabic text with every English run bidi-isolated; plain text otherwise. */
export const BidiText: React.FC<{ text?: string | null; isAr: boolean }> = ({ text, isAr }) =>
  !text ? null : isAr ? <>{isolateLatin(tidyPunctuation(text), 'bt')}</> : <>{text}</>;

const formatInline = (raw: string, isAr: boolean, keyBase = 'i'): React.ReactNode => {
  if (!raw) return null;
  const text = tidyPunctuation(raw);
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, idx) => {
    const key = `${keyBase}-${idx}`;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={key} className="rt-strong">
          {formatInline(part.slice(2, -2), isAr, key)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const inner = part.slice(1, -1).trim();
      const hasArabic = /[؀-ۿ]/.test(inner);
      return (
        <bdi key={key} dir={hasArabic ? 'auto' : 'ltr'} className={inner.length <= 28 ? 'rt-term is-short' : 'rt-term'}>
          {inner}
        </bdi>
      );
    }
    return isAr ? <React.Fragment key={key}>{isolateLatin(part, key)}</React.Fragment> : part;
  });
};

/* ────────────────────────────────────────────────────────────────────────────
   Tables
   ──────────────────────────────────────────────────────────────────────────── */

const AR_HEADER_MAP: Record<string, string> = {
  category: 'التصنيف',
  'unique count': 'عدد التذاكر'
};

type Align = 'start' | 'center' | 'end';

const splitRow = (row: string): string[] =>
  row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

const parseAlign = (sep: string): Align => {
  const s = sep.replace(/\s/g, '');
  if (s.startsWith(':') && s.endsWith(':')) return 'center';
  if (s.endsWith(':')) return 'end';
  return 'start';
};

const isSeparatorRow = (row: string) => /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/.test(row.trim());

const isNumericCell = (cell: string) => /^[\s*]*[-+]?[\d.,]+\s*%?[\s*]*$/.test(cell) || /^\*\*[\d.,]+%?\*\*$/.test(cell);

const isTotalRow = (row: string[]) =>
  row.some((c) => /^\*\*.*(المجموع|الإجمالي|Total|Grand)/i.test(c) || /^(المجموع|الإجمالي|Total)/i.test(c.replace(/\*/g, '')));

/* ────────────────────────────────────────────────────────────────────────────
   Block parser
   ──────────────────────────────────────────────────────────────────────────── */

type Block =
  | { kind: 'h1' | 'h2' | 'h3'; text: string; line: number }
  | { kind: 'p'; text: string; line: number }
  | { kind: 'ul' | 'ol'; items: string[]; line: number }
  | { kind: 'table'; header: string[]; align: Align[]; rows: string[][]; line: number }
  | { kind: 'hr' | 'pagebreak'; line: number }
  | { kind: 'charts'; period: 'p1' | 'p2'; line: number };

const CHART_TOKENS = new Set([
  '<!-- analytics-charts -->',
  '[analytics-charts]',
  '===analytics-charts===',
  '<!-- analytics -->',
  '<!-- analytics-charts-p2 -->',
  '<!-- analytics-charts-p1 -->'
]);

const parseBlocks = (content: string, period: 'p1' | 'p2'): Block[] => {
  const lines = content.split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }
    if (line === '<!-- pagebreak -->' || line === '===pagebreak===' || line === '[pagebreak]') {
      blocks.push({ kind: 'pagebreak', line: i });
      i++;
      continue;
    }
    if (CHART_TOKENS.has(line)) {
      blocks.push({ kind: 'charts', period: line.includes('p2') ? 'p2' : line.includes('p1') ? 'p1' : period, line: i });
      i++;
      continue;
    }
    if (line === '---' || line === '***' || line === '___') {
      blocks.push({ kind: 'hr', line: i });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ kind: 'h3', text: line.slice(4), line: i });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ kind: 'h2', text: line.slice(3), line: i });
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push({ kind: 'h1', text: line.slice(2), line: i });
      i++;
      continue;
    }
    if (line.startsWith('|')) {
      const rows: string[] = [];
      const start = i;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i].trim());
        i++;
      }
      if (rows.length >= 2 && isSeparatorRow(rows[1])) {
        const header = splitRow(rows[0]);
        const align = splitRow(rows[1]).map(parseAlign);
        blocks.push({ kind: 'table', header, align, rows: rows.slice(2).map(splitRow), line: start });
      } else {
        rows.forEach((r, k) => blocks.push({ kind: 'p', text: r, line: start + k }));
      }
      continue;
    }
    if (/^[*-]\s/.test(line)) {
      const items: string[] = [];
      const start = i;
      while (i < lines.length && /^[*-]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ kind: 'ul', items, line: start });
      continue;
    }
    if (/^\d+[.)]\s/.test(line)) {
      const items: string[] = [];
      const start = i;
      while (i < lines.length && /^\d+[.)]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s/, ''));
        i++;
      }
      blocks.push({ kind: 'ol', items, line: start });
      continue;
    }
    blocks.push({ kind: 'p', text: line, line: i });
    i++;
  }
  return blocks;
};

/* ────────────────────────────────────────────────────────────────────────────
   Renderer
   ──────────────────────────────────────────────────────────────────────────── */

export const AcademicMarkdownView: React.FC<AcademicMarkdownViewProps> = ({
  content,
  className = '',
  isReportAr = true,
  period = 'p1'
}) => {
  if (!content) return null;
  const isAr = isReportAr;
  const blocks = parseBlocks(content, period);

  const renderTable = (b: Extract<Block, { kind: 'table' }>) => {
    const header = b.header.map((h) => (isAr ? AR_HEADER_MAP[h.replace(/\*/g, '').trim().toLowerCase()] || h : h));
    const colAlign: Align[] = header.map((_, c) => {
      if (b.align[c] && b.align[c] !== 'start') return b.align[c];
      const nums = b.rows.filter((r) => r[c] && isNumericCell(r[c])).length;
      return b.rows.length > 0 && nums >= Math.ceil(b.rows.length * 0.6) ? 'end' : 'start';
    });
    const compact = header.length <= 2;
    const small = b.rows.length <= 14;
    return (
      <div className={`rt-table-wrap ${compact ? 'is-compact' : ''} ${small ? 'is-keep' : ''}`}>
        <table className="rt-table">
          <thead>
            <tr>
              {header.map((h, c) => (
                <th key={c} className={`al-${colAlign[c]}`} scope="col">
                  {formatInline(h, isAr, `th${b.line}-${c}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((row, r) => (
              <tr key={r} className={isTotalRow(row) ? 'is-total' : undefined}>
                {header.map((_, c) => (
                  <td key={c} className={`al-${colAlign[c]}`}>
                    {formatInline(row[c] ?? '', isAr, `td${b.line}-${r}-${c}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBlock = (b: Block): React.ReactNode => {
    switch (b.kind) {
      case 'pagebreak':
        return <div key={`pb-${b.line}`} className="print-page-break rt-pagebreak" aria-hidden="true" />;
      case 'hr':
        return <hr key={`hr-${b.line}`} className="rt-hr" />;
      case 'charts':
        return (
          <div key={`charts-${b.line}`} className="rt-charts">
            <PeriodicAnalyticsCharts isReportAr={isAr} period={b.period} />
          </div>
        );
      case 'h1':
        return (
          <h2 key={`h1-${b.line}`} className="rt-h1">
            {formatInline(b.text, isAr, `h1-${b.line}`)}
          </h2>
        );
      case 'h2':
        return (
          <h3 key={`h2-${b.line}`} className="rt-h2">
            {formatInline(b.text, isAr, `h2-${b.line}`)}
          </h3>
        );
      case 'h3':
        return (
          <h4 key={`h3-${b.line}`} className="rt-h3">
            {formatInline(b.text, isAr, `h3-${b.line}`)}
          </h4>
        );
      case 'ul':
        return (
          <ul key={`ul-${b.line}`} className="rt-list rt-ul">
            {b.items.map((it, k) => (
              <li key={k}>{formatInline(it, isAr, `ul${b.line}-${k}`)}</li>
            ))}
          </ul>
        );
      case 'ol':
        return (
          <ol key={`ol-${b.line}`} className="rt-list rt-ol">
            {b.items.map((it, k) => (
              <li key={k}>{formatInline(it, isAr, `ol${b.line}-${k}`)}</li>
            ))}
          </ol>
        );
      case 'table':
        return <React.Fragment key={`t-${b.line}`}>{renderTable(b)}</React.Fragment>;
      case 'p':
      default:
        return (
          <p key={`p-${b.line}`} className="rt-p">
            {formatInline((b as { text: string }).text, isAr, `p-${b.line}`)}
          </p>
        );
    }
  };

  // Keep a heading together with the block that follows it, so a heading never
  // sits alone at the bottom of a printed page.
  const out: React.ReactNode[] = [];
  for (let k = 0; k < blocks.length; k++) {
    const b = blocks[k];
    const next = blocks[k + 1];
    const isHeading = b.kind === 'h1' || b.kind === 'h2' || b.kind === 'h3';
    const nextKeepable =
      next &&
      (next.kind === 'p' ||
        next.kind === 'ul' ||
        next.kind === 'ol' ||
        (next.kind === 'table' && next.rows.length <= 14));
    if (isHeading && nextKeepable) {
      out.push(
        <div key={`keep-${b.line}`} className={`rt-keep ${next.kind === 'table' ? 'is-whole' : ''}`}>
          {renderBlock(b)}
          {renderBlock(next)}
        </div>
      );
      k++;
      continue;
    }
    out.push(renderBlock(b));
  }

  return (
    <div className={`rt-doc ${isAr ? 'is-ar' : 'is-en'} ${className}`} dir={isAr ? 'rtl' : 'ltr'}>
      {out}
    </div>
  );
};
