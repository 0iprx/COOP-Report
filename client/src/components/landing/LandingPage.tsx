import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AuthScreen } from '../auth/AuthScreen';
import {
  FileText,
  Presentation,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  NotebookPen,
  ImagePlus,
  FileDown
} from 'lucide-react';

// ─── 3D Tilt Step Card ──────────────────────────────────────────────────────
// A pointer-reactive card: tilts toward the cursor with a moving glare/shine
// sweep and a floating depth layer for the step number, giving the "3 Steps"
// section a tactile, physical feel instead of flat boxes.
const TiltStepCard: React.FC<{
  index: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  isAr: boolean;
}> = ({ index, icon, title, description, isAr }) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ rx: number; ry: number; px: number; py: number }>({
    rx: 0,
    ry: 0,
    px: 50,
    py: 50
  });
  const [isHovering, setIsHovering] = useState(false);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const rx = (0.5 - py / 100) * 16; // rotateX: up/down tilt
    const ry = (px / 100 - 0.5) * 18; // rotateY: left/right tilt
    setTilt({ rx, ry, px, py });
  };

  const handleLeave = () => {
    setIsHovering(false);
    setTilt({ rx: 0, ry: 0, px: 50, py: 50 });
  };

  return (
    <div style={{ perspective: '1000px' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleLeave}
        className="group relative p-6 bg-card border border-line rounded-2xl space-y-3 overflow-hidden cursor-default"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${isHovering ? 1.035 : 1}) translateZ(0)`,
          transformStyle: 'preserve-3d',
          transition: isHovering ? 'transform 80ms ease-out' : 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: isHovering
            ? '0 24px 40px -12px rgba(139, 0, 0, 0.28), 0 4px 10px rgba(0,0,0,0.06)'
            : '0 1px 2px rgba(0,0,0,0.04)'
        }}
      >
        {/* Moving glare sweep */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            opacity: isHovering ? 1 : 0,
            background: `radial-gradient(280px circle at ${tilt.px}% ${tilt.py}%, rgba(255,255,255,0.35), transparent 60%)`
          }}
        />
        {/* Accent glow corner */}
        <div
          className="pointer-events-none absolute -top-10 -end-10 w-28 h-28 rounded-full bg-accent/10 blur-2xl transition-transform duration-500"
          style={{ transform: isHovering ? 'scale(1.4)' : 'scale(1)' }}
        />

        <div
          className="w-11 h-11 rounded-xl bg-accent text-white flex items-center justify-center font-black text-sm shadow-md relative"
          style={{
            transform: isHovering ? 'translateZ(40px) scale(1.08)' : 'translateZ(20px)',
            transition: 'transform 300ms ease-out'
          }}
        >
          {icon}
          <span className="absolute -top-2 -end-2 w-5 h-5 rounded-full bg-ink text-white text-[10px] font-black flex items-center justify-center border-2 border-card">
            {index}
          </span>
        </div>

        <div style={{ transform: isHovering ? 'translateZ(24px)' : 'translateZ(0)', transition: 'transform 300ms ease-out' }}>
          <h3 className="text-sm font-extrabold text-ink">{title}</h3>
          <p className="text-xs text-sub leading-relaxed mt-1.5">{description}</p>
        </div>

        <div
          className="absolute bottom-4 end-5 text-6xl font-black text-ink/[0.04] select-none pointer-events-none"
          style={{ transform: isHovering ? 'translateZ(8px) scale(1.1)' : 'translateZ(0)', transition: 'transform 300ms ease-out' }}
        >
          {index}
        </div>
      </div>
    </div>
  );
};

// ─── Creative 3D Step Pipeline ──────────────────────────────────────────────
// An interactive 3D perspective pipeline: Features 3 floating isometric cards
// connected by animated glowing data conduits, floating 3D badges, and depth layering.
const Creative3DStepPipeline: React.FC<{
  isAr: boolean;
  t: (ar: string, en: string) => string;
}> = ({ isAr, t }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Auto-cycle through steps every 4.5s unless user is interacting
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4800);
    return () => clearInterval(timer);
  }, [isHovered]);

  const steps = [
    {
      num: '01',
      title: t('سجّل مهام يومك', 'Log Your Daily Tasks'),
      headline: t('التدوين الميداني اللحظي', 'Real-Time Micro-Logging'),
      description: t(
        'في نهاية كل يوم تدريبي، خصص دقيقتين لتوثيق ما قمت بإنجازه، الأدوات والأنظمة المستخدمة، وتصنيف الساعات.',
        'At the end of each training day, take two minutes to log completed activities, systems configured, and working hours.'
      ),
      badge: t('حفظ فوري للمسودات', 'Instant Auto-Save'),
      icon: <NotebookPen className="w-5 h-5 text-white" />,
      chips: [t('70 يوماً ميدانياً', '70 Training Days'), t('تدقيق وتصحيح ذكي', 'Instant AI Audit'), t('حماية المسودات', 'Zero Data Loss')]
    },
    {
      num: '02',
      title: t('أرفق صور الأدلة', 'Attach Visual Artifacts'),
      headline: t('التوثيق بالشواهد والأشكال', 'Visual Field Proofs & Captions'),
      description: t(
        'التقط صوراً لبيئة عملك وخوادمك وشاشات الإعداد واربطها بأسبوعها التدريبي مع تسميات أكاديمية موثقة.',
        'Capture photos of server racks, network topologies, and configs, linked by week with academic figure numbering.'
      ),
      badge: t('شواهد مرئية معتمدة', 'Verified Field Proofs'),
      icon: <ImagePlus className="w-5 h-5 text-white" />,
      chips: [t('ترقيم رسمي للأشكال', 'Figure Numbering'), t('ضغط وحفظ تلقائي', 'Optimized Artifacts'), t('توثيق أسبوعي', 'Weekly Linked')]
    },
    {
      num: '03',
      title: t('نزّل التقرير والشرائح', 'Download Deliverables'),
      headline: t('التصدير الأكاديمي المزدوج', 'Official Multi-Format Export'),
      description: t(
        'صدّر مستند الوورد الأكاديمي الكامل وشرائح العرض 16:9 بنسختين عربية وإنجليزية، مع أرشيف الطوارئ الشامل.',
        'Export your formal academic Word report, 16:9 defense deck in Arabic and English, plus full emergency archive.'
      ),
      badge: t('جاهز للطباعة والمناقشة', 'Ready for Defense & Print'),
      icon: <FileDown className="w-5 h-5 text-white" />,
      chips: [t('DOCX جامعي رسمي', 'Academic DOCX'), t('PowerPoint عريض 16:9', '16:9 Defense Deck'), t('أرشيف طوارئ CSV/JSON', 'Emergency Archive')]
    }
  ];

  return (
    <div
      className="space-y-8 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Step Switcher Tabs */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        {steps.map((s, idx) => {
          const isActive = idx === activeStep;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 relative ${
                isActive
                  ? 'bg-accent text-white shadow-lg shadow-accent/25 scale-105'
                  : 'bg-card text-sub hover:text-ink hover:bg-surface border border-line'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-black transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'bg-surface text-sub group-hover:text-ink'
                }`}
              >
                {s.num}
              </span>
              <span>{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* 3D Perspective Stage */}
      <div
        className="relative grid grid-cols-1 md:grid-cols-3 gap-6 text-start"
        style={{ perspective: '1400px' }}
      >
        {steps.map((step, idx) => {
          const isActive = idx === activeStep;

          return (
            <div
              key={step.num}
              onClick={() => setActiveStep(idx)}
              className="cursor-pointer transition-all duration-500"
              style={{
                transform: isActive
                  ? 'translateZ(40px) scale(1.03)'
                  : 'translateZ(-15px) scale(0.97)',
                transformStyle: 'preserve-3d'
              }}
            >
              <div
                className={`relative h-full p-6 sm:p-7 rounded-2xl border transition-all duration-500 overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-b from-card via-card to-accent/[0.04] border-accent/40 shadow-2xl shadow-accent/15 ring-2 ring-accent/20'
                    : 'bg-card/90 hover:bg-card border-line hover:border-accent/30 shadow-sm opacity-85 hover:opacity-100'
                }`}
              >
                {/* 3D Floating Glow Orb */}
                <div
                  className={`pointer-events-none absolute -top-12 -end-12 w-32 h-32 rounded-full blur-3xl transition-opacity duration-500 ${
                    isActive ? 'bg-accent/20 opacity-100' : 'bg-accent/5 opacity-0'
                  }`}
                />

                {/* Top Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shadow-md transition-transform duration-500 ${
                          isActive ? 'bg-accent scale-110 shadow-accent/30' : 'bg-sub/20 text-ink'
                        }`}
                        style={{ transform: isActive ? 'translateZ(30px)' : 'translateZ(10px)' }}
                      >
                        {step.icon}
                      </div>
                      <div>
                        <div className="text-[11px] font-black text-accent uppercase tracking-wider">
                          {t('خطوة', 'Step')} {step.num}
                        </div>
                        <h3 className="text-base font-black text-ink">{step.title}</h3>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-colors ${
                        isActive
                          ? 'bg-accent-dim text-accent border-accent/30'
                          : 'bg-surface text-sub border-line'
                      }`}
                    >
                      {step.badge}
                    </span>
                  </div>

                  <p className="text-xs text-sub leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Chips */}
                <div className="pt-5 mt-5 border-t border-line/70">
                  <div className="flex flex-wrap gap-1.5">
                    {step.chips.map((chip, cIdx) => (
                      <span
                        key={cIdx}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${
                          isActive
                            ? 'bg-surface text-ink border-line'
                            : 'bg-bg/60 text-sub border-line/50'
                        }`}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Giant watermark number in background */}
                <div
                  className={`absolute -bottom-3 end-3 text-7xl font-black select-none pointer-events-none transition-colors duration-500 ${
                    isActive ? 'text-accent/[0.08]' : 'text-ink/[0.03]'
                  }`}
                >
                  {step.num}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const LandingPage: React.FC<{ onOpenTestDev?: () => void }> = ({ onOpenTestDev }) => {
  const { demoLogin } = useAuth();
  const { lang, setLang, isAr, t } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'report' | 'slides' | 'curriculum'>('report');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const [isStoryHovered, setIsStoryHovered] = useState<boolean>(false);

  useEffect(() => {
    if (isStoryHovered) return;
    const interval = setInterval(() => {
      setActiveStoryIndex((prev) => (prev + 1) % 3);
    }, 5500);
    return () => clearInterval(interval);
  }, [isStoryHovered]);

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
        <div className="max-w-7xl mx-auto backdrop-blur-xl bg-card/95 border border-line shadow-sm rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4 transition-all">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center font-black shadow-sm text-xs tracking-tighter">
              COOP
            </div>
            <span className="font-extrabold text-sm tracking-tight text-ink">
              COOP.Report
            </span>
          </div>

          {/* Desktop Navigation Links - Spacious, concise, zero line-wrapping */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-semibold text-sub shrink-0">
            <a href="#how-it-helps" className="hover:text-ink transition-colors whitespace-nowrap">{t('المميزات', 'Features')}</a>
            <a href="#story" className="hover:text-accent transition-colors font-bold text-accent whitespace-nowrap">{t('قصة المشروع', 'Project Story')}</a>
            <a href="#timeline" className="hover:text-ink transition-colors whitespace-nowrap">{t('الأسابيع الـ 14', '14 Weeks')}</a>
            <a href="#preview" className="hover:text-ink transition-colors whitespace-nowrap">{t('التقارير والشرائح', 'Reports & Slides')}</a>
            <a href="#faq" className="hover:text-ink transition-colors whitespace-nowrap">{t('الأسئلة الشائعة', 'FAQ')}</a>
            {onOpenTestDev && (
              <button
                onClick={handleOpenSandbox}
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                <span>{t('المختبر (/testdev)', 'Sandbox (/testdev)')}</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </nav>

          {/* Explicit Language Switcher & Action Buttons */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Explicit Arabic / English Buttons */}
            <div className="inline-flex p-0.5 bg-surface border border-line rounded-xl text-xs font-bold shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                  lang === 'ar'
                    ? 'bg-accent text-white shadow-2xs font-extrabold'
                    : 'text-sub hover:text-ink'
                }`}
                title="تحويل الموقع بالكامل إلى العربية"
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                  lang === 'en'
                    ? 'bg-accent text-white shadow-2xs font-extrabold'
                    : 'text-sub hover:text-ink'
                }`}
                title="Switch entire website to English"
              >
                English
              </button>
            </div>

            <button
              onClick={() => handleOpenAuth('login')}
              className="px-3 py-1.5 text-xs font-bold text-ink hover:text-accent transition-colors whitespace-nowrap"
            >
              {t('تسجيل الدخول', 'Sign In')}
            </button>
            <button
              onClick={handleFastDemoLogin}
              disabled={demoLoading}
              className="px-3.5 py-1.5 text-xs font-bold bg-accent text-white hover:bg-accent/90 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            >
              <span>{demoLoading ? t('...', '...') : t('تجربة فورية', 'Demo')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile & Tablet Toggle Controls */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="inline-flex p-0.5 bg-surface border border-line rounded-lg text-[11px] font-bold">
              <button
                onClick={() => setLang('ar')}
                className={`px-2 py-0.5 rounded ${lang === 'ar' ? 'bg-accent text-white' : 'text-sub'}`}
              >
                عربي
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded ${lang === 'en' ? 'bg-accent text-white' : 'text-sub'}`}
              >
                EN
              </button>
            </div>
            <button
              onClick={handleFastDemoLogin}
              className="px-3 py-1.5 text-xs font-bold bg-accent text-white rounded-xl whitespace-nowrap"
            >
              {t('تجربة', 'Demo')}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-ink hover:bg-line rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden max-w-7xl mx-auto mt-2 bg-card border border-line rounded-2xl p-4 shadow-xl space-y-3 text-xs font-bold">
            <a href="#how-it-helps" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sub hover:text-ink">{t('المميزات', 'Features')}</a>
            <a href="#story" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-accent font-bold">{t('قصة المشروع والحل', 'Project Story & Solution')}</a>
            <a href="#timeline" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sub hover:text-ink">{t('الأسابيع الـ 14', '14 Weeks Tracking')}</a>
            <a href="#preview" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sub hover:text-ink">{t('معاينة التقارير والشرائح', 'Report & Slides')}</a>
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
              onClick={() => handleOpenAuth('login')}
              className="px-6 py-3 rounded-xl bg-accent text-white font-extrabold text-sm hover:bg-accent/90 transition-all shadow-md hover:shadow-lg flex items-center gap-2 hover:scale-[1.01]"
            >
              <span>{t('بدء تدوين المهام', 'Start Logging Tasks')}</span>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start" style={{ perspective: '1400px' }}>
            <TiltStepCard
              index="01"
              icon={<NotebookPen className="w-[18px] h-[18px]" />}
              isAr={isAr}
              title={t('سجّل مهام يومك', 'Log Your Tasks')}
              description={t(
                'في نهاية كل يوم تدريبي، خصص دقيقتين لكتابة ما قمت به واختيار تصنيفه الفني.',
                'Take two minutes at the end of each training day to write down what you accomplished and pick a category.'
              )}
            />
            <TiltStepCard
              index="02"
              icon={<ImagePlus className="w-[18px] h-[18px]" />}
              isAr={isAr}
              title={t('أرفق صور الأدلة', 'Attach Photos')}
              description={t(
                'التقط صوراً لبيئة عملك وخوادمك وإعداداتك واربطها بالأسبوع المناسب مع كتابة شرح مختصر.',
                'Add workspace setups, system photos, and diagram captures to keep visual evidence organized by week.'
              )}
            />
            <TiltStepCard
              index="03"
              icon={<FileDown className="w-[18px] h-[18px]" />}
              isAr={isAr}
              title={t('نزّل التقرير والشرائح', 'Download & Review')}
              description={t(
                'صدّر مستند الوورد وشرائح العرض فوراً متى ما حان وقت التسليم أو المناقشة.',
                'Export your structured Word document and presentation slides whenever you need to submit or present.'
              )}
            />
          </div>
        </div>
      </section>

      {/* ── 6. Developer Story: The Problem, The Solution & Why Optimal (3D Orbit / Rotating Stack) ───── */}
      <section id="story" className="py-20 px-4 sm:px-6 bg-card border-y border-line overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-dim text-accent border border-accent/20 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('من وحي التجربة الميدانية • Multi-Agent AI Architecture', 'Field-Inspired Engineering • Multi-Agent AI Architecture')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {t('قصة المشروع: المشكلة، والحل، ولماذا هذا هو الخيار الأمثل؟', 'Behind the Project: The Problem, The Solution & Why It Is Optimal')}
            </h2>
            <p className="text-xs sm:text-sm text-sub leading-relaxed">
              {t(
                'تم بناء وتطوير هذا الموقع والمساعد بالكامل بواسطة منظومة وكلاء ذكاء اصطناعي متخصصين (Multi-Agent System) لحل مشكلة حقيقية واجهها المطور أثناء تدريبه التعاوني: نسيان الأعمال والمهام المنفذة على مدار 14 أسبوعاً.',
                'This platform and assistant was architected and built via specialized AI agents (Multi-Agent System) to solve a genuine dilemma the developer faced during his co-op training: forgetting daily accomplishments over 14 grueling weeks.'
              )}
            </p>
          </div>

          {/* 3D Rotating Stage */}
          <div
            className="relative w-full max-w-4xl mx-auto h-[530px] sm:h-[480px] flex items-center justify-center select-none"
            style={{ perspective: '1200px' }}
            onMouseEnter={() => setIsStoryHovered(true)}
            onMouseLeave={() => setIsStoryHovered(false)}
          >
            {/* Card 0: The Problem */}
            {(() => {
              const offset = (0 - activeStoryIndex + 3) % 3;
              const isFront = offset === 0;
              const isNext = offset === 1;
              let transformStyle = '';
              let zIndex = 10;
              let opacity = 0.5;
              let filter = 'blur(0.5px)';

              if (isFront) {
                transformStyle = 'translate3d(0, 0, 0) scale(1) rotateY(0deg)';
                zIndex = 30;
                opacity = 1;
                filter = 'none';
              } else if (isNext) {
                const x = isAr ? '-54%' : '54%';
                const rot = isAr ? '-16deg' : '16deg';
                transformStyle = `translate3d(${x}, 0, -140px) scale(0.88) rotateY(${rot})`;
                zIndex = 15;
              } else {
                const x = isAr ? '54%' : '-54%';
                const rot = isAr ? '16deg' : '-16deg';
                transformStyle = `translate3d(${x}, 0, -140px) scale(0.88) rotateY(${rot})`;
                zIndex = 15;
              }

              return (
                <div
                  onClick={() => setActiveStoryIndex(0)}
                  className={`absolute top-0 w-[310px] sm:w-[390px] md:w-[420px] h-[480px] sm:h-[450px] rounded-3xl p-6 md:p-7 transition-all duration-700 ease-out cursor-pointer flex flex-col justify-between border ${
                    isFront
                      ? 'bg-card border-warn shadow-2xl ring-1 ring-warn/30'
                      : 'bg-surface/90 border-line shadow-lg hover:border-warn/40'
                  }`}
                  style={{
                    transform: transformStyle,
                    zIndex,
                    opacity,
                    filter,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-warn-bg text-warn flex items-center justify-center font-black shadow-xs">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-warn-bg text-warn border border-warn/20">
                        {t('المرحلة 01 • المشكلة', 'Phase 01 • Problem')}
                      </span>
                    </div>
                    <div className="text-xs font-black text-warn uppercase tracking-wider">
                      {t('المشكلة الواقعية الميدانية', 'The Real Field Dilemma')}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-ink leading-snug">
                      {t('تراكم 14 أسبوعاً وضياع تفاصيل الإنجازات', '14 Weeks of Tasks Forgotten at the Deadline')}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-sub leading-relaxed">
                      {t(
                        'يمتد التدريب التعاوني إلى 70 يوماً من العمل والمهام التقنية المتلاحقة. ومع الانشغال اليومي، تتلاشى التفاصيل وتُنسى أسماء الأنظمة والأجهزة والحلول المطبقة، ليجد المتدرب نفسه في نهاية الفصل مجبراً على كتابة تقرير من الذاكرة، مما ينتج تقارير ركيكة ومكررة لا تعكس جهده الفعلي.',
                        'Co-op training spans 70 full working days of continuous technical tasks. In the daily rush, system names, terminal commands, and specific solutions are easily forgotten. Trainees end up having to reconstruct 14 weeks from memory, resulting in generic, rushed reports that fail to showcase their true efforts.'
                      )}
                    </p>
                  </div>
                  <div className="p-3.5 bg-bg/80 rounded-2xl border border-line/70 text-xs text-sub font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-warn shrink-0" />
                    <span>{t('النتيجة السابقة: ضغط نفسي وتخمين عشوائي بنهاية الفصل', 'The Old Reality: Extreme deadline panic & vague guessing')}</span>
                  </div>
                </div>
              );
            })()}

            {/* Card 1: The Solution & Multi-Agent Build */}
            {(() => {
              const offset = (1 - activeStoryIndex + 3) % 3;
              const isFront = offset === 0;
              const isNext = offset === 1;
              let transformStyle = '';
              let zIndex = 10;
              let opacity = 0.5;
              let filter = 'blur(0.5px)';

              if (isFront) {
                transformStyle = 'translate3d(0, 0, 0) scale(1) rotateY(0deg)';
                zIndex = 30;
                opacity = 1;
                filter = 'none';
              } else if (isNext) {
                const x = isAr ? '-54%' : '54%';
                const rot = isAr ? '-16deg' : '16deg';
                transformStyle = `translate3d(${x}, 0, -140px) scale(0.88) rotateY(${rot})`;
                zIndex = 15;
              } else {
                const x = isAr ? '54%' : '-54%';
                const rot = isAr ? '16deg' : '-16deg';
                transformStyle = `translate3d(${x}, 0, -140px) scale(0.88) rotateY(${rot})`;
                zIndex = 15;
              }

              return (
                <div
                  onClick={() => setActiveStoryIndex(1)}
                  className={`absolute top-0 w-[310px] sm:w-[390px] md:w-[420px] h-[480px] sm:h-[450px] rounded-3xl p-6 md:p-7 transition-all duration-700 ease-out cursor-pointer flex flex-col justify-between border ${
                    isFront
                      ? 'bg-card border-accent shadow-2xl ring-1 ring-accent/30'
                      : 'bg-surface/90 border-line shadow-lg hover:border-accent/40'
                  }`}
                  style={{
                    transform: transformStyle,
                    zIndex,
                    opacity,
                    filter,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-accent-dim text-accent flex items-center justify-center font-black shadow-xs">
                        <Layers className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent-dim text-accent border border-accent/20">
                        {t('المرحلة 02 • الابتكار', 'Phase 02 • Innovation')}
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-accent uppercase tracking-wider">
                      {t('الحل وهندسة الـ Multi-Agent', 'The Solution & Multi-Agent Build')}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-ink leading-snug">
                      {t('مساعد تدوين فوري شُيّد بعدة وكلاء AI', 'Instant Logging Assistant Built with Multi-Agent AI')}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-sub leading-relaxed">
                      {t(
                        'قام المطور بهندسة وبناء المنصة بالكامل بالتعاون مع وكلاء ذكاء اصطناعي متخصصين (Multi-Agent Architecture): وكيل لنمذجة البيانات وحفظ المسودات فورياً، وكيل لتوليد مستندات Word وشرائح PowerPoint الرسمية، ووكيل لغوي لضمان الصياغة الهندسية الأكاديمية الصارمة.',
                        'The developer engineered the platform using a collaborative Multi-Agent AI architecture: a Data Resilience Agent for instant auto-saving, an Office Generation Agent for compiling native Word and PowerPoint decks, and an Academic Language Agent enforcing rigorous engineering phrasing without fluff.'
                      )}
                    </p>
                  </div>
                  <div className="p-3.5 bg-accent-dim/40 rounded-2xl border border-accent/30 text-xs text-accent font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent shrink-0" />
                    <span>{t('تم البناء عبر: Data Agent + Office Agent + Academic Agent', 'Engineered by: Data Agent + Office Agent + Academic Agent')}</span>
                  </div>
                </div>
              );
            })()}

            {/* Card 2: Why Optimal */}
            {(() => {
              const offset = (2 - activeStoryIndex + 3) % 3;
              const isFront = offset === 0;
              const isNext = offset === 1;
              let transformStyle = '';
              let zIndex = 10;
              let opacity = 0.5;
              let filter = 'blur(0.5px)';

              if (isFront) {
                transformStyle = 'translate3d(0, 0, 0) scale(1) rotateY(0deg)';
                zIndex = 30;
                opacity = 1;
                filter = 'none';
              } else if (isNext) {
                const x = isAr ? '-54%' : '54%';
                const rot = isAr ? '-16deg' : '16deg';
                transformStyle = `translate3d(${x}, 0, -140px) scale(0.88) rotateY(${rot})`;
                zIndex = 15;
              } else {
                const x = isAr ? '54%' : '-54%';
                const rot = isAr ? '16deg' : '-16deg';
                transformStyle = `translate3d(${x}, 0, -140px) scale(0.88) rotateY(${rot})`;
                zIndex = 15;
              }

              return (
                <div
                  onClick={() => setActiveStoryIndex(2)}
                  className={`absolute top-0 w-[310px] sm:w-[390px] md:w-[420px] h-[480px] sm:h-[450px] rounded-3xl p-6 md:p-7 transition-all duration-700 ease-out cursor-pointer flex flex-col justify-between border ${
                    isFront
                      ? 'bg-card border-ok shadow-2xl ring-1 ring-ok/30'
                      : 'bg-surface/90 border-line shadow-lg hover:border-ok/40'
                  }`}
                  style={{
                    transform: transformStyle,
                    zIndex,
                    opacity,
                    filter,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-ok-bg text-ok flex items-center justify-center font-black shadow-xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-ok-bg text-ok border border-ok/20">
                        {t('المرحلة 03 • الأثر', 'Phase 03 • Impact')}
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-ok uppercase tracking-wider">
                      {t('لماذا هذا الحل هو الأمثل؟', 'Why This Solution is Optimal')}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-ink leading-snug">
                      {t('3 ركائز تجعله البديل الأذكى عالمياً', '3 Pillars That Make It the Ideal Choice')}
                    </h3>
                    <ul className="text-xs sm:text-[13px] text-sub space-y-2 leading-relaxed list-disc list-inside">
                      <li>
                        <strong className="text-ink">{t('التدوين اللحظي (Micro-Logging):', 'Micro-Logging:')}</strong>{' '}
                        {t('دقيقتان يومياً تقضيان تماماً على نسيان 14 أسبوعاً.', '2 minutes a day eliminates 14 weeks of memory loss.')}
                      </li>
                      <li>
                        <strong className="text-ink">{t('فصل التدوين عن التنسيق:', 'Separation of Concerns:')}</strong>{' '}
                        {t('المتدرب يركز على إنجازه فقط، والنظام يبني الفهارس وملفات Word و PPTX.', 'You focus solely on your work; the system structures files & slides.')}
                      </li>
                      <li>
                        <strong className="text-ink">{t('أمان وموثوقية محلية:', 'Local Resilience:')}</strong>{' '}
                        {t('حفظ فوري للمسودات، استرجاع التعديلات السابقة، ودعم كامل للغتين.', 'Instant draft caching, full revision rollback, and bilingual support.')}
                      </li>
                    </ul>
                  </div>
                  <div className="p-3.5 bg-ok-bg/50 rounded-2xl border border-ok/30 text-xs text-ok font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
                    <span>{t('النتيجة: تقرير هندسي متكامل وعرض مناقشة جاهز دون ضغط', 'Result: Flawless technical report & slides ready without stress')}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Interactive Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveStoryIndex((prev) => (prev - 1 + 3) % 3)}
                className="p-2.5 rounded-xl border border-line bg-surface hover:bg-card text-ink hover:text-accent transition-all shadow-xs"
                title={t('السابق', 'Previous')}
              >
                {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>

              {/* 3 Interactive Tab Buttons */}
              <div className="inline-flex p-1 bg-surface border border-line rounded-2xl text-xs font-bold shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveStoryIndex(0)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeStoryIndex === 0
                      ? 'bg-warn text-white shadow-xs font-black'
                      : 'text-sub hover:text-ink'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('1. المشكلة', '1. Problem')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStoryIndex(1)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeStoryIndex === 1
                      ? 'bg-accent text-white shadow-xs font-black'
                      : 'text-sub hover:text-ink'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('2. الحل و AI', '2. Solution')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStoryIndex(2)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeStoryIndex === 2
                      ? 'bg-ok text-white shadow-xs font-black'
                      : 'text-sub hover:text-ink'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('3. لماذا هو الأمثل؟', '3. Why Optimal?')}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveStoryIndex((prev) => (prev + 1) % 3)}
                className="p-2.5 rounded-xl border border-line bg-surface hover:bg-card text-ink hover:text-accent transition-all shadow-xs"
                title={t('التالي', 'Next')}
              >
                {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
            <span className="text-[11px] text-sub font-medium">
              {t('حرك بالأسهم أو انقر على أي بطاقة لعرضها في المقدمة', 'Rotate via arrows, tabs, or click any card directly')}
            </span>
          </div>

        </div>
      </section>

      {/* ── 7. FAQ Section ────────────────────────────────────────────────── */}
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
              onClick={() => handleOpenAuth('login')}
              className="px-6 py-3 rounded-xl bg-accent text-white font-extrabold text-sm hover:bg-accent/90 transition-all shadow-md flex items-center gap-2"
            >
              <span>{t('بدء تدوين المهام', 'Start Logging Tasks')}</span>
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
