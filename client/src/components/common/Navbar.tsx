import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Shield, User, BookOpen, ShieldCheck, Loader2, Sun, Moon, Link2, Unlink, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [backupToast, setBackupToast] = useState('');

  // Profile dropdown state
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Supervisor linking state
  const [supervisorInput, setSupervisorInput] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkMsg, setLinkMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  // Link supervisor
  const handleLinkSupervisor = async () => {
    if (!supervisorInput.trim()) return;
    setLinkLoading(true);
    setLinkMsg(null);
    try {
      const res = await api.post('/supervisor/link', { supervisorUsernameOrCode: supervisorInput.trim() });
      setLinkMsg({ type: 'ok', text: res.data.message || t('تم الربط بنجاح', 'Linked successfully') });
      setSupervisorInput('');
      await refreshUser();
    } catch (err: any) {
      setLinkMsg({ type: 'err', text: err.response?.data?.error || t('تعذر ربط المشرف', 'Could not link supervisor') });
    } finally {
      setLinkLoading(false);
    }
  };

  // Unlink supervisor
  const handleUnlinkSupervisor = async () => {
    setUnlinkLoading(true);
    setLinkMsg(null);
    try {
      await api.post('/supervisor/unlink');
      setLinkMsg({ type: 'ok', text: t('تم فك الربط بنجاح', 'Supervisor unlinked successfully') });
      await refreshUser();
    } catch (err: any) {
      setLinkMsg({ type: 'err', text: err.response?.data?.error || t('تعذر فك الربط', 'Could not unlink supervisor') });
    } finally {
      setUnlinkLoading(false);
    }
  };

  // Emergency safety backup — a human-readable copy of every entry, downloadable
  // anytime from day one, so the trainee always has everything on their own device
  // even if the platform is unreachable.
  const handleSafetyBackup = async () => {
    if (isDownloadingBackup) return;
    setIsDownloadingBackup(true);
    try {
      const res = await api.get('/backup/export-readable', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `COOP_Safety_Backup_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setBackupToast(
        t('تم تنزيل نسختك الاحتياطية — احتفظ بها على جهازك.', 'Your safety backup was downloaded — keep it on your device.')
      );
    } catch {
      setBackupToast(t('تعذر تنزيل النسخة الاحتياطية، حاول مجدداً.', 'Could not download the backup, please try again.'));
    } finally {
      setIsDownloadingBackup(false);
      setTimeout(() => setBackupToast(''), 4000);
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-line glass">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-[3.75rem] flex items-center justify-between gap-4">

        {/* ── Brand ────────────────────────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center shadow-sm shrink-0">
            <BookOpen className="w-[18px] h-[18px]" />
          </div>
          <div>
            <div className="font-black text-[1.05rem] tracking-tight text-ink leading-none flex items-baseline gap-2">
              <span>COOP Report</span>
              <span className="badge badge-accent hidden sm:inline-flex text-[10px] tracking-wide uppercase">
                {t('مساعد التدريب التعاوني', 'Co-op Assistant')}
              </span>
            </div>
            <p className="text-[11px] text-muted hidden sm:block mt-0.5 leading-none">
              {t('سجل ومساعد تدوين وتقارير التدريب التعاوني', 'Cooperative Training Logging & Reporting Assistant')}
            </p>
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────── */}
        <div className="flex items-center gap-3">

          {/* Emergency Safety Backup — always available, from day one */}
          {user && user.role === 'trainee' && (
            <button
              type="button"
              onClick={handleSafetyBackup}
              disabled={isDownloadingBackup}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-line bg-bg text-xs font-bold text-sub hover:text-accent hover:border-accent/40 transition-colors disabled:opacity-60 shrink-0"
              title={t(
                'تنزيل نسخة احتياطية قابلة للقراءة من كل ما سجّلته حتى الآن، احتياطاً لأي مشكلة في الموقع.',
                'Download a readable safety copy of everything you have logged so far, in case the site ever has an issue.'
              )}
            >
              {isDownloadingBackup ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              )}
              <span className="hidden sm:inline">{t('نسخة احتياطية', 'Safety Backup')}</span>
            </button>
          )}

          {/* Explicit Language Switcher: Responsive for mobile */}
          <div className="inline-flex p-0.5 bg-bg border border-line rounded-xl text-xs font-bold shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setLang('ar')}
              className={`px-2 sm:px-3 py-1 rounded-lg transition-all ${
                lang === 'ar'
                  ? 'bg-accent text-white shadow-xs font-extrabold'
                  : 'text-sub hover:text-ink'
              }`}
              title="تحويل الموقع بالكامل إلى العربية"
            >
              <span className="hidden sm:inline">العربية</span>
              <span className="sm:hidden">عربي</span>
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 sm:px-3 py-1 rounded-lg transition-all ${
                lang === 'en'
                  ? 'bg-accent text-white shadow-xs font-extrabold'
                  : 'text-sub hover:text-ink'
              }`}
              title="Switch entire website to English"
            >
              <span className="hidden sm:inline">English</span>
              <span className="sm:hidden">EN</span>
            </button>
          </div>

          {/* Theme Switcher: Dark / Light Mode */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-line bg-bg text-sub hover:text-accent hover:border-accent/40 transition-colors shrink-0 shadow-2xs"
            title={isDark ? t('التبديل إلى الوضع النهاري', 'Switch to Light Mode') : t('التبديل إلى الوضع الليلي', 'Switch to Dark Mode')}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-ink" />}
          </button>

          {/* User Menu with Profile Dropdown */}
          {user && (
            <div className="flex items-center gap-2 ps-2 border-s border-line" ref={profileRef}>
              <button
                type="button"
                onClick={() => { setProfileOpen(!profileOpen); setLinkMsg(null); }}
                className="flex items-center gap-2 cursor-pointer select-none hover:opacity-80 transition-opacity"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    user.role === 'supervisor'
                      ? 'bg-accent-dim text-accent'
                      : 'bg-ok-bg text-ok'
                  }`}
                >
                  {user.role === 'supervisor' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div className="hidden md:block text-start leading-tight">
                  <div className="text-xs font-bold text-ink">{user.username}</div>
                  <div className="text-[10px] text-muted">
                    {user.role === 'supervisor' ? t('مشرف ميداني', 'Field Supervisor') : t('متدرب تعاوني', 'Co-op Trainee')}
                  </div>
                </div>
                <ChevronDown className={`w-3 h-3 text-sub transition-transform hidden md:block ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={logout}
                className="p-1.5 text-muted hover:text-accent rounded-lg hover:bg-accent-dim/40 transition-colors"
                title={t('تسجيل الخروج', 'Sign Out')}
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute top-[3.75rem] right-2 sm:right-4 w-80 bg-card border border-line rounded-2xl shadow-xl z-50 animate-fade-in overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-line bg-bg/60">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                        user.role === 'supervisor' ? 'bg-accent-dim text-accent' : 'bg-ok-bg text-ok'
                      }`}>
                        {user.role === 'supervisor' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-ink">{user.username}</div>
                        <div className="text-[11px] text-muted">
                          {user.role === 'supervisor' ? t('مشرف ميداني', 'Field Supervisor') : t('متدرب تعاوني', 'Co-op Trainee')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supervisor Section (Trainee only) */}
                  {user.role === 'trainee' && (
                    <div className="px-4 py-3 space-y-3">
                      <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                        {t('المشرف الميداني', 'Field Supervisor')}
                      </div>

                      {/* Current supervisor status */}
                      {user.supervisor ? (
                        <div className="flex items-center justify-between p-2.5 bg-ok-bg/50 border border-ok/20 rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-accent-dim text-accent flex items-center justify-center">
                              <Shield className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-ink">{user.supervisor.username}</div>
                              <div className="text-[10px] text-ok font-bold">{t('مرتبط', 'Linked')}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleUnlinkSupervisor}
                            disabled={unlinkLoading}
                            className="px-2 py-1 text-[10px] font-bold text-accent hover:bg-accent-dim rounded-lg transition-colors flex items-center gap-1"
                            title={t('فك الربط', 'Unlink')}
                          >
                            {unlinkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
                            {t('فك الربط', 'Unlink')}
                          </button>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-bg border border-line rounded-xl text-[11px] text-sub text-center">
                          {t('لم يتم ربط مشرف بعد — أدخل اسم المستخدم الخاص بالمشرف أدناه', 'No supervisor linked yet — enter supervisor username below')}
                        </div>
                      )}

                      {/* Link form */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={supervisorInput}
                          onChange={(e) => setSupervisorInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleLinkSupervisor()}
                          placeholder={t('اسم مستخدم المشرف...', 'Supervisor username...')}
                          className="flex-1 px-3 py-2 text-xs bg-bg border border-line rounded-xl text-ink placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleLinkSupervisor}
                          disabled={linkLoading || !supervisorInput.trim()}
                          className="px-3 py-2 text-xs font-bold bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
                        >
                          {linkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
                          {t('ربط', 'Link')}
                        </button>
                      </div>

                      {/* Status message */}
                      {linkMsg && (
                        <div className={`p-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ${
                          linkMsg.type === 'ok' ? 'bg-ok-bg text-ok' : 'bg-accent-dim text-accent'
                        }`}>
                          {linkMsg.type === 'ok' ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
                          <span>{linkMsg.text}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {backupToast && (
        <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="bg-ink text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{backupToast}</span>
          </div>
        </div>
      )}
    </nav>
  );
};
