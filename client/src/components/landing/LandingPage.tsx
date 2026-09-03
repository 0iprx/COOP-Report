import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AuthScreen } from '../auth/AuthScreen';
import {
  FileText,
  Presentation,
  ChevronDown,
  X,
  Menu,
  Camera,
  ArrowRight,
  Printer,
  Calendar,
  BookOpen,
  Sliders,
  ArrowUpRight,
  BookmarkCheck,
  Search,
  FolderPlus,
  Layers
} from 'lucide-react';

export const LandingPage: React.FC<{ onOpenTestDev?: () => void }> = ({ onOpenTestDev }) => {
  const { demoLogin } = useAuth();
  const { lang, setLang, isAr, t } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'report' | 'slides' | 'curriculum'>('report');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleFastDemoLogin = async () => {
    setDemoLoading(true);
    try {
      await demoLogin();
    } catch {
      alert(isAr ? 'تعذر بدء الجلسة التجريبية، يرجى المحاولة لاحقاً.' : 'Demo session initiation failed. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleOpenSandbox = async () => {
    setDemoLoading(true);
    try {
      await demoLogin();
      if (onOpenTestDev) {
        onOpenTestDev();
      }
    } catch {
      alert(isAr ? 'تعذر فتح مختبر المحاكاة.' : 'Unable to launch sandbox. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  const faqs = isAr ? [
    {
      q: 'ما هو الهدف الأساسي من COOP.Report؟',
      a: 'هو مساعد شخصي ومساحة عمل مخصصة للمتدرب التعاوني لتدوين مهامه اليومية، تصنيف الأعمال، حفظ صور الأدلة الميدانية، وتجميع تقارير الأسابيع الـ 14 وشرائح المناقشة لعدم نسيان أي إنجاز عند إعداد التقرير النهائي.'
    },
    {
      q: 'كيف يساعدني النظام في تذكر وتوثيق التدريب؟',
      a: 'بدلاً من محاولة تذكر 14 أسبوعاً في نهاية الفصل الدراسي، يمكنك في دقيقتين نهاية كل يوم تسجيل ما أنجزته وتصنيفه (برمجة، شبكات، أمن، دعم فني) مع إرفاق الصور. ويقوم النظام تلقائياً بتنظيم كل ذلك أسبوعاً بأسبوع.'
    },
    {
      q: 'هل يمكنني تعديل التقرير الصادر في برنامج Microsoft Word؟',
      a: 'نعم 100%. الملف الصادر هو مستند وورد أصلي (.docx) منسق ومقسم إلى فصول، ويمكنك تحرير كل كلمة، إضافة ملاحق، أو تعديل الجداول بحرية تامة.'
    },
    {
      q: 'هل يتيح النظام إنشاء شرائح عرض تقديمي للمناقشة؟',
      a: 'نعم. يولد النظام ملف PowerPoint (.pptx) بمقاس 16:9 يتضمن نبذة عن جهة التدريب، ملخص أسابيع التدريب الـ 14، صور الأدلة الميدانية، والنتائج المستفادة جاهزة للعرض أمام لجنة التحكيم.'
    },
    {
      q: 'هل يدعم النظام اللغتين العربية والإنجليزية؟',
      a: 'نعم بكل تأكيد. يمكنك بنقرة واحدة تحويل الموقع كاملاً ومسودة التقارير المصدرة بين العربية والإنجليزية مع ترجمة المصطلحات الفنية وتفاصيل الأسابيع.'
    }
  ] : [
    {
      q: 'What is the primary purpose of COOP.Report?',
      a: 'It is a personal companion and reporting assistant for cooperative training trainees. It helps you systematically log your daily tasks, classify activities, attach technical photos, and assemble organized weekly reports and defense slides so nothing is forgotten.'
    },
    {
      q: 'How does it help me remember and organize my training?',
      a: 'Instead of trying to recall 14 weeks of work at the end of the semester, you can quickly jot down daily tasks, assign tags (development, networks, support, etc.), and store field photos. The system keeps everything structured week by week.'
    },
    {
      q: 'Can I edit the generated report in Microsoft Word?',
      a: 'Yes, 100%. The downloaded document is a clean, standard Microsoft Word (.docx) file. You can freely edit, rephrase, customize styles, or add university-specific appendices at any time.'
    },
    {
      q: 'Can I create a defense presentation directly from my logged tasks?',
      a: 'Yes. You can export a 16:9 widescreen PowerPoint presentation (.pptx) summarizing your host company, your 14-week milestones, photo evidence, and key takeaways for your committee defense.'
    },
    {
      q: 'Does it support both Arabic and English?',
      a: 'Yes. You can switch the preview and exports between Arabic and English with a single click, including automated translation of technical terminology and weekly topics.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink selection:bg-accent-dim selection:text-accent font-sans antialiased" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* ── 1. Floating Top Navigation Bar ──────────────────────────────────── */}
      <header className="sticky top-3 z-50 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto backdrop-blur-xl bg-card/90 border border-line shadow-sm rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between transition-all">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center font-black shadow-sm text-xs tracking-tighter">
              COOP
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-ink flex items-center gap-2">
                <span>COOP.Report</span>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-md bg-surface text-sub font-bold border border-line">
                  {t('مساعد التدريب التعاوني', 'Co-op Assistant')}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-sub">
            <a href="#how-it-helps" className="hover:text-ink transition-colors">{t('كيف يساعدك؟', 'How It Helps')}</a>
            <a href="#timeline" className="hover:text-ink transition-colors">{t('متابعة الأسابيع الـ 14', '14 Weeks Tracking')}</a>
            <a href="#preview" className="hover:text-ink transition-colors">{t('معاينة التقارير والشرائح', 'Report & Slides')}</a>
            <a href="#faq" className="hover:text-ink transition-colors">{t('الأسئلة الشائعة', 'FAQ')}</a>
            {onOpenTestDev && (
              <button
                onClick={handleOpenSandbox}
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
              >
                <span>{t('مختبر الفحص (/testdev)', 'Sandbox (/testdev)')}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </nav>

          {/* Explicit Language Switcher & Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Explicit Arabic / English Buttons */}
            <div className="inline-flex p-0.5 bg-surface border border-line rounded-xl text-xs font-bold shadow-2xs">
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

            <button
              onClick={() => handleOpenAuth('login')}
              className="px-3.5 py-2 text-xs font-bold text-ink hover:text-accent transition-colors"
            >
              {t('تسجيل الدخول', 'Sign In')}
            </button>
            <button
              onClick={handleFastDemoLogin}
              disabled={demoLoading}
              className="px-4 py-2 text-xs font-bold bg-accent text-white hover:bg-accent/90 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>{demoLoading ? t('جارٍ التحميل...', 'Launching...') : t('تجربة فورية', 'Explore Demo')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu & Language Toggle */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-line bg-surface text-ink"
            >
              {lang === 'ar' ? 'English' : 'عربي'}
            </button>
            <button
              onClick={handleFastDemoLogin}
              className="px-3 py-1 text-xs font-bold bg-accent text-white rounded-lg"
            >
              {t('تجربة', 'Demo')}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-ink hover:bg-line rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden max-w-7xl mx-auto mt-2 bg-card border border-line rounded-2xl p-4 shadow-xl space-y-3 text-xs font-bold">
            <a href="#how-it-helps" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sub hover:text-ink">{t('كيف يساعدك؟', 'How It Helps')}</a>
            <a href="#timeline" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sub hover:text-ink">{t('الأسابيع الـ 14', '14 Weeks Tracking')}</a>
            <a href="#preview" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sub hover:text-ink">{t('معاينة التقارير', 'Report Preview')}</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sub hover:text-ink">{t('الأسئلة الشائعة', 'FAQ')}</a>
            {onOpenTestDev && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenSandbox();
                }}
                className="w-full text-start py-2 text-accent"
              >
                {t('مختبر الفحص (/testdev)', 'Open Sandbox (/testdev)')}
              </button>
            )}
            <div className="pt-2 border-t border-line flex gap-2">
              <button
                onClick={() => handleOpenAuth('login')}
                className="flex-1 py-2 rounded-xl border border-line text-ink text-center"
              >
                {t('تسجيل الدخول', 'Sign In')}
              </button>
              <button
                onClick={() => handleOpenAuth('register')}
                className="flex-1 py-2 rounded-xl bg-accent text-white text-center"
              >
                {t('حساب جديد', 'Create Account')}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── 2. Hero Section ────────────────────────────────────────────────── */}
      <section className="pt-16 pb-14 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Tag Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-line shadow-xs">
            <BookmarkCheck className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px] font-bold text-sub">
              {t('مساعدك الشخصي لتدوين وتصنيف مهام التدريب التعاوني وكتابة التقارير', 'Your Assistant for Cooperative Training Logging & Report Writing')}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-ink leading-[1.15]">
            {isAr ? (
              <>
                دوّن، تذكّر، واكتب تقارير تدريبك <br className="hidden sm:block" />
                <span className="text-accent">التعاوني بكل سهولة</span>
              </>
            ) : (
              <>
                Log, Remember, and Write Your <br className="hidden sm:block" />
                <span className="text-accent">Co-Op Reports with Ease</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-sub max-w-2xl mx-auto leading-relaxed">
            {t(
              'لا تفقد أثر مهامك اليومية أبدًا؛ مساحة عمل مصممة لمساعدتك على تصنيف أنشطتك، تذكر إنجازاتك التقنية، وتجميع تقاريرك الأسبوعية والنهائية دون عناء.',
              'Never lose track of your daily training tasks. A focused workspace designed to help you categorize activities, remember technical achievements, and assemble weekly and final reports without stress.'
            )}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleFastDemoLogin}
              disabled={demoLoading}
              className="px-6 py-3 rounded-xl bg-accent text-white font-extrabold text-sm hover:bg-accent/90 transition-all shadow-md hover:shadow-lg flex items-center gap-2 hover:scale-[1.01]"
            >
              <span>{demoLoading ? t('جارٍ التهيئة...', 'Initializing...') : t('بدء تدوين المهام', 'Start Logging Tasks')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleOpenAuth('login')}
              className="px-6 py-3 rounded-xl bg-card border border-line text-ink font-extrabold text-sm hover:bg-surface transition-all shadow-xs"
            >
              {t('تسجيل الدخول', 'Sign In')}
            </button>

            {onOpenTestDev && (
              <button
                onClick={handleOpenSandbox}
                className="px-5 py-3 rounded-xl bg-surface border border-line text-sub hover:text-accent font-bold text-sm transition-all flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-accent" />
                <span>{t('مختبر المحاكاة (/testdev)', 'Sandbox (/testdev)')}</span>
              </button>
            )}
          </div>

          {/* Practical Value Highlights */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-start">
            <div className="p-3 bg-card border border-line rounded-xl">
              <div className="text-xs font-bold text-sub">{t('ذاكرة يومية', 'Daily Memory')}</div>
              <div className="text-sm font-black text-ink mt-0.5">{t('لا تفوت أي يوم', 'Never Forget a Day')}</div>
            </div>
            <div className="p-3 bg-card border border-line rounded-xl">
              <div className="text-xs font-bold text-sub">{t('خطة 14 أسبوعاً', '14-Week Setup')}</div>
              <div className="text-sm font-black text-ink mt-0.5">{t('جدول زمني منظم', 'Organized Timeline')}</div>
            </div>
            <div className="p-3 bg-card border border-line rounded-xl">
              <div className="text-xs font-bold text-sub">{t('تصدير Word و PPTX', 'Word & PowerPoint')}</div>
              <div className="text-sm font-black text-ink mt-0.5">{t('ملفات أوفيس قابلة للتحرير', 'Editable Office Files')}</div>
            </div>
            <div className="p-3 bg-card border border-line rounded-xl">
              <div className="text-xs font-bold text-sub">{t('ثنائي اللغة', 'Language Choice')}</div>
              <div className="text-sm font-black text-ink mt-0.5">{t('عربي وإنجليزي بنقرة', 'Arabic & English')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Four Core Practical Capabilities ────────────────────────────── */}
      <section id="how-it-helps" className="py-14 px-4 sm:px-6 bg-surface border-y border-line">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {t('مصمم لتنظيم تدريبك من اليوم الأول', 'Designed to Keep You Organized from Day One')}
            </h2>
            <p className="text-xs sm:text-sm text-sub">
              {t(
                'دون أي تعقيد؛ مساحة مباشرة لتدوين عملك اليومي، تصنيف مهامك، وتوليد ملفات التقارير بنقرة واحدة.',
                'No complicated setups. Just a clear way to track your work, categorize your tasks, and generate your report files.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-start">
            <div className="p-5 bg-card border border-line rounded-2xl space-y-3 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-ink">{t('لا تنسى أي مهمة', 'Never Forget a Task')}</h3>
              <p className="text-xs text-sub leading-relaxed">
                {t(
                  'سجل المهام والأنشطة في نفس يوم إنجازها. احفظ ما تعلمته، الأدوات التي استخدمتها، والحلول التي طبقتها.',
                  'Log activities on the day they happen. Store what you learned, tools you used, and problems you solved so you never lose the details.'
                )}
              </p>
            </div>

            <div className="p-5 bg-card border border-line rounded-2xl space-y-3 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-ink">{t('صنّف مهامك بدقة', 'Categorize Your Work')}</h3>
              <p className="text-xs text-sub leading-relaxed">
                {t(
                  'قسّم عملك حسب مجاله التقني (برمجة، شبكات، أمن معلومات، دعم فني، توثيق) لتسهيل عرضه ومناقشته.',
                  'Group tasks into categories like programming, networks, information security, tech support, or documentation for clear organization.'
                )}
              </p>
            </div>

            <div className="p-5 bg-card border border-line rounded-2xl space-y-3 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-ink">{t('احفظ صور الأدلة الميدانية', 'Store Evidence Photos')}</h3>
              <p className="text-xs text-sub leading-relaxed">
                {t(
                  'احتفظ بصور الداتا سنتر، بيئة العمل، والمخططات الفنية مربوطة بكل أسبوع محدد ومجهزة للشرح.',
                  'Keep visual records of your workspace, server racks, configurations, and diagrams neatly attached to each specific week.'
                )}
              </p>
            </div>

            <div className="p-5 bg-card border border-line rounded-2xl space-y-3 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
                <Printer className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-ink">{t('ولّد التقارير والشرائح', 'Generate Reports & Slides')}</h3>
              <p className="text-xs text-sub leading-relaxed">
                {t(
                  'صدّر تقرير وورد (.docx) كامل ومقسم لفصول، ملف PDF عالي الدقة، وشرائح عرض تقديمي (.pptx) بضغطة زر.',
                  'Export cleanly structured Word (.docx) reports, PDF drafts, and defense presentation slides (.pptx) with a single click.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Deliverables Preview ────────────────────────────────────────── */}
      <section id="preview" className="py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {t('المخرجات التي يساعدك النظام في إنشائها', 'What the Platform Generates for You')}
            </h2>
            <p className="text-xs sm:text-sm text-sub">
              {t(
                'عاين نماذج مسودات التقارير وشرائح العرض ومسار الأسابيع الـ 14 المنشأة من سجلاتك اليومية.',
                'Preview the draft reports, defense slides, and 14-week tracking timeline generated from your daily logs.'
              )}
            </p>
          </div>

          {/* Interactive Preview Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-surface border border-line rounded-xl gap-1">
              <button
                onClick={() => setActivePreviewTab('report')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePreviewTab === 'report'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-sub hover:text-ink'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t('مسودة التقرير (Word & PDF)', 'Report Draft (DOCX & PDF)')}</span>
              </button>

              <button
                onClick={() => setActivePreviewTab('slides')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePreviewTab === 'slides'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-sub hover:text-ink'
                }`}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>{t('شرائح المناقشة (PowerPoint)', 'Defense Slides (PPTX)')}</span>
              </button>

              <button
                onClick={() => setActivePreviewTab('curriculum')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePreviewTab === 'curriculum'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-sub hover:text-ink'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('جدول الأسابيع الـ 14', '14-Week Schedule')}</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Final Report Preview */}
          {activePreviewTab === 'report' && (
            <div className="bg-card border border-line rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in text-start">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-line gap-4">
                <div>
                  <div className="text-xs font-bold text-accent uppercase tracking-wider">
                    {t('مسودة التقرير الفني الشامل', 'Full Co-op Report Draft')}
                  </div>
                  <h3 className="text-lg font-black text-ink mt-0.5">
                    {t('تقرير التدريب التعاوني الفني', 'Cooperative Training Technical Report')}
                  </h3>
                  <div className="text-xs text-sub mt-1">
                    {t('يصدر بصيغة Microsoft Word (.docx) قابلة للتعديل وملف PDF', 'Outputs editable Microsoft Word (.docx) and high-resolution PDF')}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface border border-line text-sub">
                  {t('مستند وورد قابل للتحرير', 'Editable Word Document')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="font-bold text-ink flex items-center justify-between">
                    <span>{t('1. صفحة الغلاف والبيانات', '1. Title & Details')}</span>
                    <BookOpen className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-sub leading-relaxed">
                    {t(
                      'بيانات المتدرب، جهة التدريب، التخصص، فترة التدريب، وتدوين الساعتين المعتمدتين من المعدل.',
                      'Student name, major, host company profile, training period, and 2-credit-hour GPA notation.'
                    )}
                  </p>
                </div>

                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="font-bold text-ink flex items-center justify-between">
                    <span>{t('2. فهرس موضوعات الأسابيع', '2. Narrative Indexing')}</span>
                    <Sliders className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-sub leading-relaxed">
                    {t(
                      'عناوين موضوعية فنية لكل أسبوع من الأسابيع الـ 14 بدلاً من جداول الساعات اليدوية.',
                      'Clear technical topic headers for each of the 14 training weeks instead of plain mechanical hour tables.'
                    )}
                  </p>
                </div>

                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="font-bold text-ink flex items-center justify-between">
                    <span>{t('3. صور الأدلة والملاحظات', '3. Photo Evidence')}</span>
                    <Camera className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-sub leading-relaxed">
                    {t(
                      'إرفاق صور الداتا سنتر والأجهزة مع ترقيم أشكال توضيحي وخانات توقيع المشرف الميداني.',
                      'Workplace and technical photos embedded with captions, plus dedicated review signature boxes.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Defense Slides Preview */}
          {activePreviewTab === 'slides' && (
            <div className="bg-card border border-line rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in text-start">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-line gap-4">
                <div>
                  <div className="text-xs font-bold text-accent uppercase tracking-wider">
                    {t('عرض تقديمي للمناقشة', 'Defense Presentation Deck')}
                  </div>
                  <h3 className="text-lg font-black text-ink mt-0.5">
                    {t('عرض PowerPoint (.pptx) بمقاس 16:9 عريض', '16:9 Widescreen PowerPoint Presentation (.pptx)')}
                  </h3>
                  <div className="text-xs text-sub mt-1">
                    {t('شرائح منسقة جاهزة لمناقشتك أمام لجنة التدريب', 'Structured slides ready for your committee discussion')}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface border border-line text-sub">
                  PowerPoint (.pptx)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="text-[11px] font-extrabold text-accent">{t('شريحة 1', 'Slide 1')}</div>
                  <div className="font-bold text-ink">{t('عنوان التقرير وبيانات المتدرب', 'Title & Trainee Profile')}</div>
                  <p className="text-sub text-[11px]">{t('بيانات الطالب، التخصص، والجهة.', 'Training timeline, major, and host company identity.')}</p>
                </div>
                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="text-[11px] font-extrabold text-accent">{t('شريحة 2', 'Slide 2')}</div>
                  <div className="font-bold text-ink">{t('التعريف بجهة التدريب', 'Company Overview')}</div>
                  <p className="text-sub text-[11px]">{t('القسم، الأنظمة، وطبيعة العمل.', 'Host department structure and trainee responsibilities.')}</p>
                </div>
                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="text-[11px] font-extrabold text-accent">{t('شرائح 3-6', 'Slides 3-6')}</div>
                  <div className="font-bold text-ink">{t('أبرز إنجازات الأسابيع الـ 14', '14-Week Highlights')}</div>
                  <p className="text-sub text-[11px]">{t('توزيع المهام الفنية أسبوعاً بأسبوع.', 'Weekly breakdown of technical tasks and milestones.')}</p>
                </div>
                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="text-[11px] font-extrabold text-accent">{t('شريحة 7', 'Slide 7')}</div>
                  <div className="font-bold text-ink">{t('الصور الميدانية والخاتمة', 'Photos & Conclusion')}</div>
                  <p className="text-sub text-[11px]">{t('أهم المهارات والنتائج المكتسبة.', 'Key takeaways, skills learned, and closing thoughts.')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Curriculum View */}
          {activePreviewTab === 'curriculum' && (
            <div className="bg-card border border-line rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in text-start">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-line gap-4">
                <div>
                  <div className="text-xs font-bold text-accent uppercase tracking-wider">
                    {t('الخطة الزمنية الكاملة', 'Full Training Timeline')}
                  </div>
                  <h3 className="text-lg font-black text-ink mt-0.5">
                    {t('14 أسبوعاً تدريبياً ميدانياً', '14 Structured Training Weeks')}
                  </h3>
                  <div className="text-xs text-sub mt-1">
                    {t('حرية كاملة في التنقل، تعديل الأيام، وإرفاق الصور', 'Easily jump between weeks, edit days, and attach photos')}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-surface border border-line rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[10px]">1</span>
                    <span className="font-bold text-ink">{t('التهيئة والتعريف بأنظمة المنشأة وسياسات أمن المعلومات', 'Orientation, Enterprise Environment & Security Policies')}</span>
                  </div>
                  <span className="text-sub font-semibold">{t('الأسبوع 1', 'Week 1')}</span>
                </div>
                <div className="p-3 bg-surface border border-line rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[10px]">5</span>
                    <span className="font-bold text-ink">{t('إدارة البنية التحتية للشبكات وإعداد أجهزة الراوتر والجدران النارية', 'Network Infrastructure, Routers & Firewall Configuration')}</span>
                  </div>
                  <span className="text-sub font-semibold">{t('الأسبوع 5', 'Week 5')}</span>
                </div>
                <div className="p-3 bg-surface border border-line rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[10px]">10</span>
                    <span className="font-bold text-ink">{t('إدارة الخوادم وقواعد البيانات وعمليات النسخ الاحتياطي الدوري', 'Database Administration, Data Backup & Maintenance')}</span>
                  </div>
                  <span className="text-sub font-semibold">{t('الأسبوع 10', 'Week 10')}</span>
                </div>
                <div className="p-3 bg-surface border border-line rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[10px]">14</span>
                    <span className="font-bold text-ink">{t('نقل المعرفة وتسليم المهام وجلسة مراجعة الأداء الختامية', 'Knowledge Transfer, Project Handover & Review')}</span>
                  </div>
                  <span className="text-sub font-semibold">{t('الأسبوع 14', 'Week 14')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. Simple 3-Step Process ──────────────────────────────────────── */}
      <section id="timeline" className="py-14 px-4 sm:px-6 bg-surface border-y border-line">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {t('3 خطوات بسيطة ومباشرة', 'Simple 3-Step Routine')}
            </h2>
            <p className="text-xs sm:text-sm text-sub">
              {t(
                'عادة يومية سريعة تجعل كتابة تقريرك النهائي أمراً في غاية السهولة.',
                'A straightforward habit that makes writing your final report completely effortless.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
            <div className="p-6 bg-card border border-line rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">
                01
              </div>
              <h3 className="text-sm font-extrabold text-ink">{t('سجّل مهام يومك', 'Log Your Tasks')}</h3>
              <p className="text-xs text-sub leading-relaxed">
                {t(
                  'في نهاية كل يوم تدريبي، خصص دقيقتين لكتابة ما قمت به واختيار تصنيفه الفني.',
                  'Take two minutes at the end of each training day to write down what you accomplished and pick a category.'
                )}
              </p>
            </div>

            <div className="p-6 bg-card border border-line rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">
                02
              </div>
              <h3 className="text-sm font-extrabold text-ink">{t('أرفق صور الأدلة', 'Attach Photos')}</h3>
              <p className="text-xs text-sub leading-relaxed">
                {t(
                  'التقط صوراً لبيئة عملك وخوادمك وإعداداتك واربطها بالأسبوع المناسب مع كتابة شرح مختصر.',
                  'Add workspace setups, system photos, and diagram captures to keep visual evidence organized by week.'
                )}
              </p>
            </div>

            <div className="p-6 bg-card border border-line rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">
                03
              </div>
              <h3 className="text-sm font-extrabold text-ink">{t('نزّل التقرير والشرائح', 'Download & Review')}</h3>
              <p className="text-xs text-sub leading-relaxed">
                {t(
                  'صدّر مستند الوورد وشرائح العرض فوراً متى ما حان وقت التسليم أو المناقشة.',
                  'Export your structured Word document and presentation slides whenever you need to submit or present.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ Section ────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {t('الأسئلة المتكررة', 'Frequently Asked Questions')}
            </h2>
            <p className="text-xs sm:text-sm text-sub">
              {t(
                'كل ما تود معرفته حول تدوين التدريب وتصدير التقارير.',
                'Everything you need to know about logging your training and exporting your files.'
              )}
            </p>
          </div>

          <div className="space-y-3 text-start">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-card border border-line rounded-xl overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 text-start text-xs sm:text-sm font-extrabold text-ink flex items-center justify-between gap-4 hover:bg-surface transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-sub transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-sub leading-relaxed border-t border-line/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7. Bottom Action Banner ────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 bg-surface border-t border-line">
        <div className="max-w-4xl mx-auto p-8 sm:p-10 bg-card border border-line rounded-3xl text-center space-y-5 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-line text-sub text-xs font-bold">
            <FolderPlus className="w-3.5 h-3.5 text-accent" />
            <span>{t('مساعد توثيق التدريب التعاوني', 'Co-Op Documentation Assistant')}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-ink tracking-tight">
            {t('نظّم مهام تدريبك التعاوني من اليوم', 'Keep Your Co-op Training Organized Today')}
          </h2>

          <p className="text-xs sm:text-sm text-sub max-w-lg mx-auto leading-relaxed">
            {t(
              'ابدأ بتسجيل إنجازاتك اليومية أولاً بأول حتى لا تجد صعوبة في استرجاع وتذكر الأسابيع الماضية.',
              'Start recording your daily activities now so you never have to struggle remembering past weeks.'
            )}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleFastDemoLogin}
              disabled={demoLoading}
              className="px-6 py-3 rounded-xl bg-accent text-white font-extrabold text-sm hover:bg-accent/90 transition-all shadow-md flex items-center gap-2"
            >
              <span>{demoLoading ? t('جارٍ التحميل...', 'Launching...') : t('بدء تدوين المهام', 'Start Logging Tasks')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenAuth('login')}
              className="px-6 py-3 rounded-xl bg-surface border border-line text-ink font-bold text-sm hover:bg-line transition-all"
            >
              {t('تسجيل الدخول', 'Sign In')}
            </button>
          </div>
        </div>
      </section>

      {/* ── 8. Minimalist Footer ──────────────────────────────────────────── */}
      <footer className="py-8 px-4 sm:px-6 border-t border-line bg-card text-sub text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-ink">
            <div className="w-6 h-6 rounded-md bg-accent text-white flex items-center justify-center font-black text-[10px]">
              C
            </div>
            <span>COOP.Report</span>
          </div>
          <div className="text-center sm:text-start">
            {t(
              'مساعد شخصي للمتدربين لتدوين وتصنيف مهام التدريب التعاوني وكتابة التقارير دون نسيان أي تفصيل.',
              'A personal assistant for trainees to record, classify, and draft co-op training reports without forgetting details.'
            )}
          </div>
          <div>
            © {new Date().getFullYear()} COOP.Report. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Auth Screen Modal */}
      {authModalOpen && (
        <AuthScreen
          initialMode={authInitialMode}
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </div>
  );
};
