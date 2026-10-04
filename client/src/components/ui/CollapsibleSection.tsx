import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  /** Small status chips shown on the header (always visible, also when collapsed) */
  badges?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * Collapsible card. The body stays mounted when collapsed (only hidden), so form state,
 * auto-save timers and refs inside keep working. The open/closed choice is remembered per browser.
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ id, title, subtitle, icon, badges, defaultOpen = true, children }) => {
  const storageKey = `coop_section_${id}`;
  const [open, setOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === '1') return true;
      if (saved === '0') return false;
    } catch {
      // storage blocked — fall back to the default
    }
    return defaultOpen;
  });

  const toggle = () => {
    setOpen((o) => {
      try {
        localStorage.setItem(storageKey, o ? '0' : '1');
      } catch {
        // ignore
      }
      return !o;
    });
  };

  return (
    <section className="space-y-3 no-print">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={`${id}-body`}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-line bg-card hover:bg-bg/60 transition-colors text-start shadow-sm"
      >
        {icon && <span className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center shrink-0">{icon}</span>}
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-extrabold text-ink">{title}</span>
          {subtitle && <span className="block text-[11px] text-sub mt-0.5">{subtitle}</span>}
        </span>
        {badges && <span className="hidden sm:flex items-center gap-1.5 shrink-0">{badges}</span>}
        <ChevronDown className={`w-4 h-4 text-sub shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div id={`${id}-body`} className={open ? 'space-y-4' : 'hidden'}>
        {children}
      </div>
    </section>
  );
};
