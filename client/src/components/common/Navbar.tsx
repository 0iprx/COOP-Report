import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Shield, User, BookOpen, ShieldCheck, Loader2, Sun, Moon, Monitor, Link2, Unlink, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';
import { Menu, MenuItem, MenuLabel, MenuSeparator } from '../ui/Menu';

export const Navbar: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { preference, setPreference, toggleTheme, isDark } = useTheme();
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [backupToast, setBackupToast] = useState('');

  // Supervisor linking state
  const [supervisorInput, setSupervisorInput] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkMsg, setLinkMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

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
      setBackupToast(t('تم تنزيل نسختك الاحتياطية — احتفظ بها على جهازك.', 'Your safety backup was downloaded — keep it on your device.'));
    } catch {
      setBackupToast(t('تعذر تنزيل النسخة الاحتياطية، حاول مجدداً.', 'Could not download the backup, please try again.'));
    } finally {
      setIsDownloadingBackup(false);
      setTimeout(() => setBackupToast(''), 4000);
    }
  };

  const roleLabel = user?.role === 'supervisor' ? t('مشرف ميداني', 'Field Supervisor') : t('متدرب تعاوني', 'Co-op Trainee');

  const Avatar: React.FC<{ size: string }> = ({ size }) => (
    <div
      className={`${size} rounded-full flex items-center justify-center shrink-0 ${
        user?.role === 'supervisor' ? 'bg-accent-dim text-accent' : 'bg-ok-bg text-ok'
      }`}
    >
      {user?.role === 'supervisor' ? <Shield className="w-1/2 h-1/2" /> : <User className="w-1/2 h-1/2" />}
    </div>
  );

  return (
    <nav className="sticky top-0 z-40 glass" aria-label={t('الشريط العلوي', 'Top bar')}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* ── Brand ────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center shadow-sm shrink-0">
            <BookOpen className="w-[18px] h-[18px]" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-base tracking-tight text-ink leading-none">COOP Report</div>
            <p className="text-[11px] text-muted hidden sm:block mt-1 leading-none truncate">
              {t('مساعد توثيق التدريب التعاوني', 'Co-op Training Logging Assistant')}
            </p>
          </div>
        </div>

        {/* ── Actions: language · theme · account ───────────── */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex p-0.5 bg-bg border border-line rounded-xl text-xs font-bold" role="group" aria-label={t('اللغة', 'Language')}>
            {(['ar', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                title={l === 'ar' ? 'تحويل الموقع بالكامل إلى العربية' : 'Switch entire website to English'}
                className={`px-2.5 py-1 rounded-lg transition-colors ${lang === l ? 'bg-accent text-white font-extrabold shadow-xs' : 'text-sub hover:text-ink'}`}
              >
                {l === 'ar' ? 'عربي' : 'EN'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-line bg-bg text-sub hover:text-ink hover:border-line-strong transition-colors"
            title={isDark ? t('التبديل إلى الوضع النهاري', 'Switch to Light Mode') : t('التبديل إلى الوضع الليلي', 'Switch to Dark Mode')}
            aria-label={isDark ? t('الوضع النهاري', 'Light mode') : t('الوضع الليلي', 'Dark mode')}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {user && (
            <Menu
              width="w-80"
              label={t('قائمة الحساب', 'Account menu')}
              trigger={({ open, triggerProps }) => (
                <button
                  {...triggerProps}
                  onClick={(e) => {
                    triggerProps.onClick?.(e);
                    setLinkMsg(null);
                  }}
                  className="flex items-center gap-2 ps-1 pe-2 h-9 rounded-xl border border-line bg-bg hover:border-line-strong transition-colors"
                  aria-label={t('قائمة الحساب', 'Account menu')}
                >
                  <Avatar size="w-7 h-7" />
                  <span className="hidden md:block text-xs font-bold text-ink max-w-[7rem] truncate">{user.username}</span>
                  <ChevronDown className={`w-3 h-3 text-sub transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
              )}
            >
              {(close) => (
                <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <Avatar size="w-10 h-10" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-ink truncate">{user.username}</div>
                      <div className="text-[11px] text-muted">{roleLabel}</div>
                    </div>
                  </div>

                  {/* Supervisor linking (trainee only) */}
                  {user.role === 'trainee' && (
                    <>
                      <MenuSeparator />
                      <div className="px-3 py-2 space-y-2.5">
                        <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                          {t('المشرف الميداني', 'Field Supervisor')}
                        </div>
                        {user.supervisor ? (
                          <div className="flex items-center justify-between gap-2 p-2.5 bg-ok-bg border border-ok/25 rounded-xl">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-accent-dim text-accent flex items-center justify-center shrink-0">
                                <Shield className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-ink truncate">{user.supervisor.username}</div>
                                <div className="text-[10px] text-ok font-bold">{t('مرتبط', 'Linked')}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleUnlinkSupervisor}
                              disabled={unlinkLoading}
                              className="px-2 py-1 text-[11px] font-bold text-accent hover:bg-accent-dim rounded-lg transition-colors flex items-center gap-1 shrink-0"
                            >
                              {unlinkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
                              {t('فك الربط', 'Unlink')}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={supervisorInput}
                              onChange={(e) => setSupervisorInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleLinkSupervisor()}
                              placeholder={t('اسم مستخدم المشرف...', 'Supervisor username...')}
                              aria-label={t('اسم مستخدم المشرف', 'Supervisor username')}
                              className="flex-1 min-w-0 px-3 py-2 text-xs bg-bg border border-line rounded-xl text-ink placeholder:text-muted focus:outline-none focus:border-accent"
                            />
                            <button
                              type="button"
                              onClick={handleLinkSupervisor}
                              disabled={linkLoading || !supervisorInput.trim()}
                              className="px-3 py-2 text-xs font-bold bg-accent text-white rounded-xl hover:bg-accent-mid transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
                            >
                              {linkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
                              {t('ربط', 'Link')}
                            </button>
                          </div>
                        )}
                        {linkMsg && (
                          <div
                            role="status"
                            className={`p-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ${linkMsg.type === 'ok' ? 'bg-ok-bg text-ok' : 'bg-accent-dim text-accent'}`}
                          >
                            {linkMsg.type === 'ok' ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
                            <span>{linkMsg.text}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <MenuSeparator />
                  <MenuLabel>{t('المظهر', 'Appearance')}</MenuLabel>
                  <MenuItem icon={<Sun className="w-4 h-4" />} label={t('نهاري', 'Light')} checked={preference === 'light'} keepOpen onClick={() => setPreference('light')} close={close} />
                  <MenuItem icon={<Moon className="w-4 h-4" />} label={t('ليلي', 'Dark')} checked={preference === 'dark'} keepOpen onClick={() => setPreference('dark')} close={close} />
                  <MenuItem icon={<Monitor className="w-4 h-4" />} label={t('حسب النظام', 'Match system')} checked={preference === 'system'} keepOpen onClick={() => setPreference('system')} close={close} />

                  {user.role === 'trainee' && (
                    <>
                      <MenuSeparator />
                      <MenuItem
                        icon={isDownloadingBackup ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-accent" />}
                        label={t('نسخة احتياطية قابلة للقراءة', 'Download safety backup')}
                        hint={t('كل ما سجلته على جهازك، احتياطاً لأي مشكلة', 'Everything you logged, saved on your device')}
                        disabled={isDownloadingBackup}
                        onClick={handleSafetyBackup}
                        close={close}
                      />
                    </>
                  )}

                  <MenuSeparator />
                  <MenuItem icon={<LogOut className="w-4 h-4" />} label={t('تسجيل الخروج', 'Sign out')} danger onClick={logout} close={close} />
                </div>
              )}
            </Menu>
          )}
        </div>
      </div>

      {backupToast && (
        <div role="status" className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="bg-ink text-bg text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{backupToast}</span>
          </div>
        </div>
      )}
    </nav>
  );
};
