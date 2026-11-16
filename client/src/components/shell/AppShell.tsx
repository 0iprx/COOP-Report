import React, { useEffect, useRef, useState } from 'react';
import { BrandMark, BRAND } from '../ui/BrandMark';
import {
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Loader2,
  Link2,
  Unlink,
  CheckCircle2,
  AlertCircle,
  UserRound,
  Languages
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export interface ShellNavItem<T extends string = string> {
  id: T;
  label: string;
  /** One-word label for the mobile bottom bar */
  shortLabel?: string;
  icon: React.ReactNode;
}

interface AppShellProps<T extends string> {
  items: ShellNavItem<T>[];
  active: T;
  onSelect: (id: T) => void;
  children: React.ReactNode;
}

export function AppShell<T extends string>({ items, active, onSelect, children }: AppShellProps<T>) {
  const { user, logout, refreshUser } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { toggleTheme, isDark } = useTheme();

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState('');
  const [supervisorInput, setSupervisorInput] = useState('');
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkMsg, setLinkMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAccountOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountOpen]);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(''), 4000);
  };

  const handleSafetyBackup = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await api.get('/backup/export-readable', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/html;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `COOP_Safety_Backup_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast(t('تم تنزيل نسختك الاحتياطية. احتفظ بها على جهازك.', 'Your safety backup was downloaded. Keep it on your device.'));
    } catch {
      showToast(t('تعذر تنزيل النسخة الاحتياطية. حاول مجدداً.', 'Could not download the backup. Please try again.'));
    } finally {
      setDownloading(false);
    }
  };

  const handleLink = async () => {
    if (!supervisorInput.trim()) return;
    setLinkBusy(true);
    setLinkMsg(null);
    try {
      const res = await api.post('/supervisor/link', { supervisorUsernameOrCode: supervisorInput.trim() });
      setLinkMsg({ type: 'ok', text: res.data.message || t('تم الربط بنجاح', 'Linked successfully') });
      setSupervisorInput('');
      await refreshUser();
    } catch (err: any) {
      setLinkMsg({ type: 'err', text: err.response?.data?.error || t('تعذر ربط المشرف', 'Could not link supervisor') });
    } finally {
      setLinkBusy(false);
    }
  };

  const handleUnlink = async () => {
    setLinkBusy(true);
    setLinkMsg(null);
    try {
      await api.post('/supervisor/unlink');
      setLinkMsg({ type: 'ok', text: t('تم فك الربط', 'Supervisor unlinked') });
      await refreshUser();
    } catch (err: any) {
      setLinkMsg({ type: 'err', text: err.response?.data?.error || t('تعذر فك الربط', 'Could not unlink supervisor') });
    } finally {
      setLinkBusy(false);
    }
  };

  const activeItem = items.find((i) => i.id === active);
  const roleLabel = user?.role === 'supervisor' ? t('مشرف', 'Supervisor') : t('متدرب', 'Trainee');

  const utilityButtons = (
    <>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        aria-label={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
        title={lang === 'ar' ? 'English' : 'العربية'}
      >
        <Languages className="w-[18px] h-[18px]" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="icon-btn"
        onClick={toggleTheme}
        aria-label={isDark ? t('الوضع النهاري', 'Light mode') : t('الوضع الليلي', 'Dark mode')}
        title={isDark ? t('الوضع النهاري', 'Light mode') : t('الوضع الليلي', 'Dark mode')}
      >
        {isDark ? <Sun className="w-[18px] h-[18px]" aria-hidden="true" /> : <Moon className="w-[18px] h-[18px]" aria-hidden="true" />}
      </button>
    </>
  );

  return (
    <div className="shell">
      {/* ── Sidebar (desktop) ───────────────────────────── */}
      <aside className="shell-sidebar no-print" aria-label={t('التنقل الرئيسي', 'Main navigation')}>
        <div className="shell-brand">
          <BrandMark size={36} className="shrink-0" />
          <span className="min-w-0">
            <span className="brand-word block text-[17px] text-ink leading-tight">{t(BRAND.ar, BRAND.en)}</span>
            <span className="block text-xs text-sub leading-tight mt-0.5">{t('سجل التدريب التعاوني', 'Co-op training log')}</span>
          </span>
        </div>

        <nav className="shell-nav">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`shell-nav-item ${active === item.id ? 'is-active' : ''}`}
              aria-current={active === item.id ? 'page' : undefined}
              onClick={() => onSelect(item.id)}
            >
              <span className="shell-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-1">
          {user?.role === 'trainee' && (
            <button type="button" className="shell-nav-item" onClick={handleSafetyBackup} disabled={downloading}>
              <span className="shell-nav-icon" aria-hidden="true">
                {downloading ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <ShieldCheck className="w-[18px] h-[18px]" />}
              </span>
              <span>{t('نسخة احتياطية', 'Safety backup')}</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Main column ─────────────────────────────────── */}
      <div className="shell-main">
        <header className="shell-topbar no-print">
          <div className="flex items-center gap-3 min-w-0">
            <BrandMark size={36} className="shrink-0 lg:hidden" />
            <h1 className="shell-title truncate">{activeItem?.label}</h1>
          </div>

          <div className="flex items-center gap-1.5">
            {utilityButtons}
            {user && (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  className="shell-account"
                  aria-haspopup="dialog"
                  aria-expanded={accountOpen}
                  onClick={() => {
                    setAccountOpen((v) => !v);
                    setLinkMsg(null);
                  }}
                >
                  <span className="shell-avatar" aria-hidden="true">
                    <UserRound className="w-4 h-4" />
                  </span>
                  <span className="hidden sm:block text-start leading-tight min-w-0">
                    <span className="block text-sm font-semibold text-ink truncate max-w-[9rem]">{user.username}</span>
                    <span className="block text-xs text-sub">{roleLabel}</span>
                  </span>
                </button>

                {accountOpen && (
                  <div className="account-panel" role="dialog" aria-label={t('الحساب', 'Account')}>
                    <div className="px-4 py-3 border-b border-line">
                      <div className="text-sm font-semibold text-ink">{user.username}</div>
                      <div className="text-xs text-sub mt-0.5">{roleLabel}</div>
                    </div>

                    {user.role === 'trainee' && (
                      <div className="px-4 py-3 space-y-2.5 border-b border-line">
                        <div className="text-xs font-semibold text-sub">{t('المشرف', 'Supervisor')}</div>
                        {user.supervisor ? (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-ink font-medium truncate">{user.supervisor.username}</span>
                            <button type="button" className="btn-ghost btn-sm" onClick={handleUnlink} disabled={linkBusy}>
                              {linkBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                              <span>{t('فك الربط', 'Unlink')}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <label className="sr-only" htmlFor="shell-supervisor">
                              {t('اسم مستخدم المشرف', 'Supervisor username')}
                            </label>
                            <input
                              id="shell-supervisor"
                              type="text"
                              value={supervisorInput}
                              onChange={(e) => setSupervisorInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleLink()}
                              placeholder={t('اسم مستخدم المشرف', 'Supervisor username')}
                              className="input-field"
                            />
                            <button
                              type="button"
                              className="btn-primary btn-sm shrink-0"
                              onClick={handleLink}
                              disabled={linkBusy || !supervisorInput.trim()}
                            >
                              {linkBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                              <span>{t('ربط', 'Link')}</span>
                            </button>
                          </div>
                        )}
                        {linkMsg && (
                          <div className={`flex items-center gap-1.5 text-xs font-medium ${linkMsg.type === 'ok' ? 'text-ok' : 'text-accent'}`} role="status">
                            {linkMsg.type === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                            <span>{linkMsg.text}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-2">
                      {user.role === 'trainee' && (
                        <button type="button" className="action-menu-item lg:hidden" onClick={handleSafetyBackup} disabled={downloading}>
                          <span className="action-menu-icon" aria-hidden="true">
                            <ShieldCheck className="w-4 h-4" />
                          </span>
                          <span className="font-semibold text-ink">{t('تنزيل نسخة احتياطية', 'Download safety backup')}</span>
                        </button>
                      )}
                      <button type="button" className="action-menu-item" onClick={logout}>
                        <span className="action-menu-icon" aria-hidden="true">
                          <LogOut className="w-4 h-4" />
                        </span>
                        <span className="font-semibold text-ink">{t('تسجيل الخروج', 'Sign out')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="shell-content">{children}</main>
      </div>

      {/* ── Bottom navigation (mobile) ──────────────────── */}
      <nav className="shell-bottomnav no-print" aria-label={t('التنقل الرئيسي', 'Main navigation')}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`shell-bottomnav-item ${active === item.id ? 'is-active' : ''}`}
            aria-current={active === item.id ? 'page' : undefined}
            aria-label={item.label}
            onClick={() => onSelect(item.id)}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span className="truncate max-w-full">{item.shortLabel || item.label}</span>
          </button>
        ))}
      </nav>

      {toast && (
        <div className="shell-toast" role="status">
          <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
