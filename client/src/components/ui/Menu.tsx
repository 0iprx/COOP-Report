import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * Small accessible dropdown menu used to group secondary actions (exports, backups, account…).
 * - Closes on outside click, Escape and after choosing an item.
 * - Arrow keys / Home / End move between items; focus returns to the trigger on close.
 * - Positioned with logical properties, so it opens toward the correct side in RTL and LTR.
 */

interface MenuProps {
  /** Renders the trigger button; spread `triggerProps` onto it */
  trigger: (ctx: { open: boolean; triggerProps: React.ButtonHTMLAttributes<HTMLButtonElement> & { ref: React.Ref<HTMLButtonElement> } }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: 'start' | 'end';
  /** Tailwind width class of the panel */
  width?: string;
  label?: string;
}

export const Menu: React.FC<MenuProps> = ({ trigger, children, align = 'end', width = 'w-64', label }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const first = panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])');
      first?.focus();
    }
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (!open || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'));
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement as HTMLElement);
    const move = (n: number) => {
      e.preventDefault();
      items[(n + items.length) % items.length].focus();
    };
    if (e.key === 'ArrowDown') move(idx + 1);
    else if (e.key === 'ArrowUp') move(idx - 1);
    else if (e.key === 'Home') move(0);
    else if (e.key === 'End') move(items.length - 1);
    else if (e.key === 'Tab') setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative inline-flex" onKeyDown={onKeyDown}>
      {trigger({
        open,
        triggerProps: {
          ref: triggerRef,
          type: 'button',
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          'aria-controls': open ? panelId : undefined,
          onClick: () => setOpen((o) => !o)
        }
      })}
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="menu"
          aria-label={label}
          className={`absolute top-full mt-2 z-50 ${align === 'end' ? 'end-0' : 'start-0'} ${width} max-w-[calc(100vw-1.5rem)] rounded-2xl border border-line bg-card p-1.5 text-start animate-scale-in no-print`}
          style={{ boxShadow: 'var(--menu-shadow)' }}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
};

interface MenuItemProps {
  icon?: React.ReactNode;
  label: React.ReactNode;
  hint?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  /** Marks the currently selected option (for single-choice menus) */
  checked?: boolean;
  /** Keeps the menu open after selecting (default: closes) */
  keepOpen?: boolean;
  close?: () => void;
  href?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({ icon, label, hint, onClick, disabled, danger, checked, keepOpen, close, href }) => {
  const cls = `w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-start transition-colors outline-none ${
    danger ? 'text-accent hover:bg-accent-dim focus-visible:bg-accent-dim' : 'text-ink hover:bg-bg focus-visible:bg-bg'
  } disabled:opacity-40 disabled:pointer-events-none`;
  const body = (
    <>
      {icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center text-sub">{icon}</span>}
      <span className="flex-1 min-w-0">
        <span className="block truncate">{label}</span>
        {hint && <span className="block text-[10.5px] font-medium text-muted truncate">{hint}</span>}
      </span>
      {checked && <span className="text-accent text-sm leading-none">✓</span>}
    </>
  );
  if (href) {
    return (
      <a role="menuitem" href={href} target="_blank" rel="noreferrer" className={cls} onClick={() => !keepOpen && close?.()}>
        {body}
      </a>
    );
  }
  return (
    <button
      type="button"
      role={checked !== undefined ? 'menuitemradio' : 'menuitem'}
      aria-checked={checked}
      disabled={disabled}
      className={cls}
      onClick={() => {
        onClick?.();
        if (!keepOpen) close?.();
      }}
    >
      {body}
    </button>
  );
};

export const MenuLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-muted">{children}</div>
);

export const MenuSeparator: React.FC = () => <div role="separator" className="my-1.5 h-px bg-line" />;
