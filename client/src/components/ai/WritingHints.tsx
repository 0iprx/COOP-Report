import React, { useEffect, useMemo, useState } from 'react';
import { analyzeText, type Analysis } from '@coop/shared';
import { CircleCheck, CircleDot, Wand2, ChevronDown } from 'lucide-react';

interface Props {
  text: string;
  kind: 'entry' | 'section' | 'free';
  /** Called with the text after safe fixes; the field updates only when the user clicks. */
  onApplyFixes: (fixed: string) => void;
  glossary?: { term: string; preferred: string }[];
}

/**
 * Live writing hints under a text field. Runs entirely in the browser (no server,
 * no model): spelling, punctuation, the trainee's glossary, style flags and missing
 * entry sections. The trainee's own text stays theirs; fixes apply only on click.
 */
export const WritingHints: React.FC<Props> = ({ text, kind, onApplyFixes, glossary }) => {
  const [debounced, setDebounced] = useState(text);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(text), 400);
    return () => clearTimeout(t);
  }, [text]);

  const analysis: Analysis | null = useMemo(() => {
    if (!debounced.trim() || debounced.trim().split(/\s+/).length < 3) return null;
    try {
      return analyzeText(debounced, { kind, glossary });
    } catch {
      return null;
    }
  }, [debounced, kind, glossary]);

  if (!analysis) return null;

  const fixes = analysis.issues.filter((i) => i.autoFixed);
  const flags = analysis.issues.filter((i) => !i.autoFixed);
  const canApply = fixes.length > 0 && analysis.fixed !== debounced && debounced === text;

  if (!fixes.length && !flags.length && !analysis.questions.length) {
    return (
      <div className="wh-bar is-clean" role="status">
        <CircleCheck className="w-4 h-4" aria-hidden="true" />
        <span>لا ملاحظات على الكتابة</span>
        <span className="wh-meta">{analysis.stats.words} كلمة</span>
      </div>
    );
  }

  return (
    <div className="wh">
      <div className="wh-bar">
        <button type="button" className="wh-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <CircleDot className="w-4 h-4" aria-hidden="true" />
          <span>
            {fixes.length > 0 && <>{fixes.length} تصحيح جاهز</>}
            {fixes.length > 0 && flags.length + analysis.questions.length > 0 && ' · '}
            {flags.length + analysis.questions.length > 0 && <>{flags.length + analysis.questions.length} ملاحظة</>}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        <span className="wh-meta">{analysis.stats.words} كلمة</span>
        {canApply && (
          <button type="button" className="btn-ghost btn-sm" onClick={() => onApplyFixes(analysis.fixed)}>
            <Wand2 className="w-4 h-4" aria-hidden="true" />
            <span>تطبيق التصحيحات</span>
          </button>
        )}
      </div>

      {open && (
        <div className="wh-panel">
          {fixes.length > 0 && (
            <ul className="ai-issues">
              {fixes.map((i, k) => (
                <li key={`f${k}`} className="is-fixed">
                  <CircleCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{i.message}</span>
                </li>
              ))}
            </ul>
          )}
          {flags.length > 0 && (
            <ul className="ai-issues">
              {flags.map((i, k) => (
                <li key={`g${k}`}>
                  <CircleDot className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>
                    {i.message}
                    {i.excerpt && (
                      <>
                        {' '}
                        <mark className="ai-excerpt">{i.excerpt}</mark>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {analysis.questions.length > 0 && (
            <>
              <span className="ai-label">لتكتمل الكتابة</span>
              <ul className="ai-changes">
                {analysis.questions.map((q, k) => (
                  <li key={`q${k}`}>{q}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};
