import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { AuthScreen } from './components/auth/AuthScreen';
import { DailyLogTab } from './components/log/DailyLogTab';
import { WeeklyTab } from './components/weekly/WeeklyTab';
import { FinalReportTab } from './components/final/FinalReportTab';
import { SupervisorTab } from './components/supervisor/SupervisorTab';
import { Calendar, Clock, FileText, ShieldCheck } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000
    }
  }
});

type TabType = 'log' | 'weekly' | 'final' | 'supervisor';

const tabs: { id: TabType; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
  { id: 'log',        labelAr: 'التسجيل اليومي',       labelEn: 'Daily Log',         icon: <Calendar   className="w-4 h-4" /> },
  { id: 'weekly',     labelAr: 'التقرير الأسبوعي',     labelEn: 'Weekly Report',     icon: <Clock      className="w-4 h-4" /> },
  { id: 'final',      labelAr: 'التقرير النهائي',       labelEn: 'Final Report',      icon: <FileText   className="w-4 h-4" /> },
  { id: 'supervisor', labelAr: 'بوابة المشرف',          labelEn: 'Supervisor Portal', icon: <ShieldCheck className="w-4 h-4" /> }
];

const MainDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('log');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  /* ── Loading ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center space-y-4 animate-fade-in">
          {/* Branded spinner */}
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-line" />
            <div className="absolute inset-0 rounded-full border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-accent-dim flex items-center justify-center">
              <Calendar className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div className="text-xs font-bold text-sub">جارٍ تحميل COOP Report...</div>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar currentLang={lang} onToggleLang={() => setLang((p) => (p === 'ar' ? 'en' : 'ar'))} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">

        {/* ── Tab Navigation ──────────────────────────────── */}
        <div className="tabs-container no-scrollbar no-print flex items-center overflow-x-auto border-b border-line mb-6 gap-1 px-1 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              <span>
                {lang === 'ar'
                  ? tab.labelAr
                  : tab.id === 'supervisor' && user.role === 'supervisor'
                    ? 'Supervisor Portal'
                    : tab.labelEn}
              </span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ─────────────────────────────────── */}
        <div className="animate-fade-in" key={activeTab}>
          {activeTab === 'log'        && <DailyLogTab />}
          {activeTab === 'weekly'     && <WeeklyTab />}
          {activeTab === 'final'      && <FinalReportTab currentLang={lang} />}
          {activeTab === 'supervisor' && <SupervisorTab />}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="no-print border-t border-line bg-card/50 py-5 text-center text-[11px] text-muted">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-bold text-sub">COOP Report &mdash; نظام التوثيق الأكاديمي الذكي</span>
          <span>بيانات مشفرة &middot; نسخ احتياطي آمن &middot; تصدير DOCX / PDF / HTML</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MainDashboard />
      </AuthProvider>
    </QueryClientProvider>
  );
}
