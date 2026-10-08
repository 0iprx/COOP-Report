import React from 'react';

interface AcademicMarkdownViewProps {
  content: string;
  className?: string;
}

// Inline formatting helper for **bold** text
const formatInlineText = (text: string): React.ReactNode => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-black text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

export const AcademicMarkdownView: React.FC<AcademicMarkdownViewProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Empty line
    if (!line) {
      i++;
      continue;
    }

    // 2. Page Break or Horizontal divider
    if (line === '<!-- pagebreak -->' || line === '===pagebreak===' || line === '[pagebreak]') {
      elements.push(
        <div key={`pb-${i}`} className="print-page-break" style={{ pageBreakBefore: 'always', breakBefore: 'page' }} />
      );
      i++;
      continue;
    }

    if (line === '---' || line === '***' || line === '___') {
      elements.push(
        <div key={`hr-${i}`} className="my-5 border-t-2 border-line/80 print:my-3 print:border-slate-300 break-after-avoid" style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }} />
      );
      i++;
      continue;
    }

    // 3. Headings
    if (line.startsWith('# ')) {
      elements.push(
        <div key={`h1-${i}`} className="mt-7 mb-3 pb-2 border-b-2 border-accent/40 flex items-center gap-2 print:mt-4 print:mb-2 break-after-avoid" style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
          <span className="w-2.5 h-6 rounded-full bg-accent shrink-0 print:bg-slate-800" />
          <h2 className="text-base sm:text-lg font-black text-ink tracking-tight print:text-[12.5pt]">
            {formatInlineText(line.substring(2))}
          </h2>
        </div>
      );
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <div key={`h2-${i}`} className="mt-5 mb-2.5 flex items-center gap-2 print:mt-3 print:mb-1.5 break-after-avoid" style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
          <span className="w-1.5 h-4 rounded-full bg-accent/70 shrink-0 print:bg-slate-600" />
          <h3 className="text-sm sm:text-base font-extrabold text-ink print:text-[11pt]">
            {formatInlineText(line.substring(3))}
          </h3>
        </div>
      );
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${i}`} className="text-xs sm:text-sm font-black text-accent mt-3.5 mb-1.5 print:text-[10pt] print:mt-2.5 break-after-avoid" style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
          {formatInlineText(line.substring(4))}
        </h4>
      );
      i++;
      continue;
    }

    // 4. Tables
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerRow = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        
        // Skip separator row (tableLines[1])
        const bodyRows = tableLines.slice(2).map((r) =>
          r
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim())
        );

        elements.push(
          <div key={`table-${i}`} className="my-4 overflow-x-auto print:my-2.5 print-table-container">
            <table className="w-full text-xs text-ink border-collapse border border-line print:border-slate-300 print:text-[8pt] print-table">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/60 border-b border-line print:bg-slate-100">
                  {headerRow.map((h, hIdx) => (
                    <th key={hIdx} className="p-2 print:py-1 print:px-2 text-start font-black text-[11px] print:text-[8.5pt]">
                      {formatInlineText(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60 print:divide-slate-200">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className={`break-inside-avoid ${rIdx % 2 === 1 ? 'bg-bg/40 print:bg-slate-50/50' : ''}`} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2 print:py-1 print:px-2 text-start font-medium text-[11px] print:text-[8pt] leading-snug">
                        {formatInlineText(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 5. Unordered list
    if (line.startsWith('* ') || line.startsWith('- ')) {
      const listItems: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith('* ') || lines[i].trim().startsWith('- '))
      ) {
        listItems.push(lines[i].trim().substring(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1 list-disc list-inside text-xs text-ink/90 print:text-[10pt] print:space-y-0.5">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {formatInlineText(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 6. Numbered list
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1 list-decimal list-inside text-xs text-ink/90 print:text-[10pt] print:space-y-0.5">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {formatInlineText(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 7. Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="my-2 text-xs text-ink/90 leading-relaxed text-justify print:text-[10pt] print:leading-[1.7]">
        {formatInlineText(line)}
      </p>
    );
    i++;
  }

  return <div className={`space-y-1 text-start ${className}`}>{elements}</div>;
};
