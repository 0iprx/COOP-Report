import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface ActionMenuItem {
  id: string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  badge?: string;
}

export interface ActionMenuGroup {
  label?: string;
  items: ActionMenuItem[];
}

interface ActionMenuProps {
  label: string;
  icon?: React.ReactNode;
  groups: ActionMenuGroup[];
  variant?: 'primary' | 'secondary';
  busy?: boolean;
  badge?: string;
}

/**
 * One trigger, many actions. Keeps a page to a single primary button and moves
 * every secondary action behind a labelled menu (keyboard: arrows, Home/End, Esc).
 */
export const ActionMenu: React.FC<ActionMenuProps> = ({ label, icon, groups, variant = 'secondary', busy, badge }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    const first = rootRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)');
    first?.focus();
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') || []
    );
    const idx = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={variant === 'primary' ? 'btn-primary' : 'btn-ghost'}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {icon}
        <span>{label}</span>
        {badge && <span className="menu-badge">{badge}</span>}
        <ChevronDown
          className={`w-4 h-4 opacity-70 transition-transform ${open ? 'rotate-180' : ''} ${busy ? 'animate-pulse' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div id={menuId} role="menu" aria-label={label} className="action-menu" onKeyDown={onMenuKeyDown}>
          {groups.map((group, gi) => (
            <div key={gi} role="group" aria-label={group.label} className="action-menu-group">
              {group.label && <div className="action-menu-label">{group.label}</div>}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  className="action-menu-item"
                  onClick={() => {
                    close(false);
                    item.onSelect();
                  }}
                >
                  <span className="action-menu-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="flex-1 min-w-0 text-start">
                    <span className="block font-semibold text-ink">{item.label}</span>
                    {item.hint && <span className="block text-xs text-sub mt-0.5 leading-snug">{item.hint}</span>}
                  </span>
                  {item.badge && <span className="menu-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
