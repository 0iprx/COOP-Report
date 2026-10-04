import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  /** Destructive actions use the accent colour; neutral ones use the ink colour */
  tone?: 'accent' | 'neutral';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * In-page confirmation (replaces window.confirm): keeps the site's look in both themes,
 * explains what will happen, closes on Escape / backdrop click and focuses the safe action first.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, children, confirmLabel, cancelLabel, tone = 'accent', busy, onConfirm, onCancel }) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[var(--overlay)] backdrop-blur-xs no-print animate-fade-in"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onCancel()}
    >
      <div role="alertdialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined} className="w-full max-w-md rounded-2xl border border-line bg-card p-5 shadow-2xl animate-scale-in text-start">
        <h3 className="text-base font-extrabold text-ink mb-2">{title}</h3>
        <div className="text-xs text-sub leading-relaxed space-y-2">{children}</div>
        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 text-xs font-bold text-ink bg-bg hover:bg-line border border-line rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-60 ${
              tone === 'accent' ? 'bg-accent hover:bg-accent-mid' : 'bg-ink text-bg hover:opacity-90'
            }`}
          >
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
