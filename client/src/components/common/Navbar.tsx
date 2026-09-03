import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LogOut, Shield, User, BookOpen } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();

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
    </nav>
  );
};
