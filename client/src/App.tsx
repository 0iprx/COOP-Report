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
      retry: 1
    }
  }
});

type TabType = 'log' | 'weekly' | 'final' | 'supervisor';

const MainDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('log');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs font-bold text-sub">جارٍ تحميل نظام COOP Report...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar currentLang={lang} onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="tabs-container flex items-center gap-2 border-b border-line pb-px mb-6 overflow-x-auto no-print">
          <button
            onClick={() => setActiveTab('log')}
            className={`pb-3 px-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'log'
                ? 'border-accent text-accent'
                : 'border-transparent text-sub hover:text-ink'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>تسجيل يومي</span>
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`pb-3 px-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'weekly'
                ? 'border-accent text-accent'
                : 'border-transparent text-sub hover:text-ink'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>التقرير الأسبوعي</span>
          </button>

          <button
            onClick={() => setActiveTab('final')}
            className={`pb-3 px-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'final'
                ? 'border-accent text-accent'
                : 'border-transparent text-sub hover:text-ink'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>التقرير النهائي والفهرس</span>
          </button>

          <button
            onClick={() => setActiveTab('supervisor')}
            className={`pb-3 px-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'supervisor'
                ? 'border-accent text-accent'
                : 'border-transparent text-sub hover:text-ink'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{user.role === 'supervisor' ? 'بوابة المشرف التدريبي' : 'بيانات المشرف'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'log' && <DailyLogTab />}
          {activeTab === 'weekly' && <WeeklyTab />}
          {activeTab === 'final' && <FinalReportTab currentLang={lang} />}
          {activeTab === 'supervisor' && <SupervisorTab />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line py-6 text-center text-xs text-sub no-print bg-card/40">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>نظام COOP Report — سجل التدريب التعاوني الذكي (Huawei Tech Saudi)</span>
          <span>معايير أمان معتمدة وتصدير متكامل DOCX / PDF / HTML</span>
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
