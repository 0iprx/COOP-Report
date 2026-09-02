import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield, User, Languages, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentLang: 'ar' | 'en';
  onToggleLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentLang, onToggleLang }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-line bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center font-black text-base shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight text-ink flex items-center gap-2">
              <span>COOP Report</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent-dim text-accent">
                Huawei Co-op
              </span>
            </div>
            <p className="text-xs text-sub hidden sm:block">
              {currentLang === 'ar' ? 'سجل التدريب التعاوني الأكاديمي والتوثيق اليومي' : 'Academic Cooperative Training & Daily Log System'}
            </p>
          </div>
        </div>

        {/* User & Actions */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-xs font-bold text-ink hover:bg-bg transition-colors"
            title="تبديل لغة العرض والتقارير"
          >
            <Languages className="w-3.5 h-3.5 text-accent" />
            <span>{currentLang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-line">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-ok-bg text-ok flex items-center justify-center">
                  {user.role === 'supervisor' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="hidden md:block text-right">
                  <div className="text-xs font-bold text-ink">{user.username}</div>
                  <div className="text-[11px] text-sub">
                    {user.role === 'supervisor' ? 'مشرف ميداني' : 'متدرب تعاوني'}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-sub hover:text-accent rounded-lg hover:bg-bg transition-colors"
                title="تسجيل الخروج"
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
