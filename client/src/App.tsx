import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { api } from './services/api';
import { AppShell } from './components/shell/AppShell';
import { AuthScreen } from './components/auth/AuthScreen';
import { DailyLogTab } from './components/log/DailyLogTab';
import { WeeklyTab } from './components/weekly/WeeklyTab';
import { PeriodicTab } from './components/periodic/PeriodicTab';
import { FinalReportTab } from './components/final/FinalReportTab';
import { SupervisorTab } from './components/supervisor/SupervisorTab';
import { TestDevLab } from './components/testdev/TestDevLab';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingModal } from './components/common/OnboardingModal';
import { VerifyPage } from './components/verify/VerifyPage';
import { Calendar, Clock, FileText, ShieldCheck, Layers, FileSpreadsheet } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000
    }
  }
});

type TabType = 'log' | 'weekly' | 'periodic' | 'final' | 'supervisor' | 'testdev';

const tabs: { id: TabType; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
  { id: 'log', labelAr: 'التسجيل اليومي', labelEn: 'Daily Log', icon: <Calendar className="w-[18px] h-[18px]" /> },
  { id: 'weekly', labelAr: 'التقرير الأسبوعي', labelEn: 'Weekly Report', icon: <Clock className="w-[18px] h-[18px]" /> },
  { id: 'periodic', labelAr: 'التقرير الفتري', labelEn: 'Periodic Report', icon: <FileSpreadsheet className="w-[18px] h-[18px]" /> },
  { id: 'final', labelAr: 'التقرير النهائي', labelEn: 'Final Report', icon: <FileText className="w-[18px] h-[18px]" /> },
  { id: 'supervisor', labelAr: 'بوابة المشرف', labelEn: 'Supervisor Portal', icon: <ShieldCheck className="w-[18px] h-[18px]" /> },
  { id: 'testdev', labelAr: 'مختبر المحاكاة', labelEn: 'Simulation lab', icon: <Layers className="w-[18px] h-[18px]" /> }
];

const SHORT_LABELS: Record<TabType, [string, string]> = {
  log: ['يومي', 'Daily'],
  weekly: ['أسبوعي', 'Weekly'],
  periodic: ['فتري', 'Periodic'],
  final: ['نهائي', 'Final'],
  supervisor: ['المشرف', 'Review'],
  testdev: ['محاكاة', 'Lab']
};

const MainDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const { lang, isAr, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('log');
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false);

  // Sync /testdev URL directly
  useEffect(() => {
    if (window.location.pathname === '/testdev' || window.location.hash === '#/testdev') {
      setActiveTab('testdev');
    }
  }, []);

  // Check if trainee needs initial plan setup
  const { data: reportData } = useQuery<{ profile: any }>({
    queryKey: ['finalReport'],
    queryFn: async () => {
      const res = await api.get('/reports/final');
      return res.data;
    },
    enabled: !!user && user.role === 'trainee'
  });

  useEffect(() => {
    if (user?.role === 'trainee' && reportData?.profile) {
      const hasEntity = !!reportData.profile.entityAddress?.trim();
      const dismissed = sessionStorage.getItem('coop_onboarding_completed') === 'true';
      if (!hasEntity && !dismissed) {
        setOnboardingOpen(true);
      }
    }
  }, [user, reportData]);

  const isVerifyRoute =
    window.location.pathname.startsWith('/verify/') ||
    window.location.hash.startsWith('#/verify/');

  if (isVerifyRoute) {
    return <VerifyPage />;
  }

  /* ── Loading ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-line" />
            <div className="absolute inset-0 rounded-full border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-accent-dim flex items-center justify-center">
              <Calendar className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div className="text-xs font-bold text-sub">
            {t('جارٍ التحميل…', 'Loading…')}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onOpenTestDev={() => setActiveTab('testdev')} />;
  }

  const visibleTabs = tabs.filter(
    (t) =>
      (t.id !== 'supervisor' || user.role === 'supervisor') &&
      (t.id !== 'testdev' || user.username === 'testdev_demo')
  );

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    if (tabId === 'testdev') {
      window.history.pushState(null, '', '/testdev');
    } else {
      if (window.location.pathname === '/testdev') {
        window.history.pushState(null, '', '/');
      }
    }
  };

  return (
    <>
      <AppShell
        items={visibleTabs.map((tab) => ({
          id: tab.id,
          label: lang === 'ar' ? tab.labelAr : tab.labelEn,
          shortLabel: SHORT_LABELS[tab.id][lang === 'ar' ? 0 : 1],
          icon: tab.icon
        }))}
        active={activeTab}
        onSelect={handleTabClick}
      >
        <div className="animate-fade-in" key={activeTab}>
          {activeTab === 'log' && <DailyLogTab />}
          {activeTab === 'weekly' && <WeeklyTab />}
          {activeTab === 'periodic' && <PeriodicTab />}
          {activeTab === 'final' && <FinalReportTab currentLang={lang} />}
          {activeTab === 'supervisor' && user.role === 'supervisor' && <SupervisorTab />}
          {activeTab === 'testdev' && <TestDevLab />}
        </div>
      </AppShell>

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        initialHours={reportData?.profile?.courseHours || 280}
        initialWeeks={reportData?.profile?.trainingWeeks || 14}
      />
    </>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <MainDashboard />
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

