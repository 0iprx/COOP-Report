import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LogOut, Shield, User, BookOpen, ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [backupToast, setBackupToast] = useState('');

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

          {/* Explicit Language Switcher: Arabic & English Buttons */}
          <div className="inline-flex p-0.5 bg-bg border border-line rounded-xl text-xs font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => setLang('ar')}
              className={`px-3 py-1 rounded-lg transition-all ${
                lang === 'ar'
                  ? 'bg-accent text-white shadow-xs font-extrabold'
                  : 'text-sub hover:text-ink'
              }`}
              title="تحويل الموقع بالكامل إلى العربية"
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-lg transition-all ${
                lang === 'en'
                  ? 'bg-accent text-white shadow-xs font-extrabold'
                  : 'text-sub hover:text-ink'
              }`}
              title="Switch entire website to English"
            >
              English
            </button>
          </div>

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-2 ps-2 border-s border-line">
              <div className="flex items-center gap-2 cursor-default select-none">
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
              </div>

              <button
                onClick={logout}
                className="p-1.5 text-muted hover:text-accent rounded-lg hover:bg-accent-dim/40 transition-colors"
                title={t('تسجيل الخروج', 'Sign Out')}
              >
                <LogOut className="w-4 h-4" />
              </button>
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
