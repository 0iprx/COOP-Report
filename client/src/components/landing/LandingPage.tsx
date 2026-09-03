import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthScreen } from '../auth/AuthScreen';
import {
  ShieldCheck,
  Sparkles,
  FileText,
  Presentation,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  Menu,
  Download,
  Layers,
  Award,
  Users,
  Camera,
  FolderLock,
  ArrowRight,
  Printer,
  FileCode,
  Lock,
  Cpu,
  Check,
  Building,
  HelpCircle,
  Clock,
  Laptop,
  Flame,
  BookmarkCheck,
  Star
} from 'lucide-react';

export const LandingPage: React.FC<{ onOpenTestDev?: () => void }> = ({ onOpenTestDev }) => {
  const { demoLogin } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'word' | 'pptx' | 'toc' | 'eval'>('word');
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
      alert('تعذر تسجيل الدخول التجريبي حالياً، يرجى المحاولة لاحقاً');
    } finally {
      setDemoLoading(false);
    }
  };

  const faqs = [
    {
      q: 'هل يضمن النظام تحقيق شرط اللائحة الأكاديمية (فيما لا يقل عن 15 صفحة)؟',
      a: 'نعم وبدقة هندسية مطلقة؛ يُولّد التقرير النهائي في 21 صفحة رسمية متكاملة (صفحة غلاف رسمية، صفحة فهرس شجري منقط، صفحة للمقدمة وبيانات المقرر، صفحة للتعريف بالمنشأة، 14 صفحة مستقلة لسجل الأسابيع الـ 14 الميدانية وجداول المهام والأدلة، صفحة للمهارات المكتسبة، صفحة للخاتمة، وصفحة استمارة تقييم واعتماد المشرف والختم الرسمي).'
    },
    {
      q: 'كيف يضمن النظام عدم تسريب خصوصية جهة التدريب في صور الأدلة؟',
      a: 'يحتوي النظام على طبقة أمنية مزدوجة متطورة؛ فور اختيار المتدرب للصورة، يقوم محرك Canvas بالمتصفح أولاً بتجريد كافة البيانات الوصفية الحساسة مثل إحداثيات الموقع الجغرافي الدقيقة (GPS) وبيانات الكاميرا والتاريخ الأصلي، ثم يقوم خادم السيرفر بفحص الـ Magic Bytes ومنع أي تسريب لمعلومات المنشأة الحساسة قبل الحفظ.'
    },
    {
      q: 'هل يمكنني تعديل التقرير في برنامج Microsoft Word بعد تنزيله؟',
      a: 'بالتأكيد. ملف الـ DOCX الذي يولّده النظام هو مستند Word أصلي 100% مبني وفق معايير OpenXML الأكاديمية، بخط Traditional Arabic للغة العربية و Times New Roman للإنجليزية، وجداول قياسية بهوامش 2.54 سم، مع إمكانية تحرير وتعديل كل كلمة وجدول وصورة بحرية تامة.'
    },
    {
      q: 'ما هو معيار خلو التقرير من الإيموجيات (Zero-Emoji Standard)؟',
      a: 'في لجان المناقشة والتحكيم الجامعي بالمملكة، يُعد وجود أي إيموجي (رموز تعبيرية ملونة) في التقارير الرسمية خطأً أكاديمياً يخل بالرصانة العلمية. نظامنا يطبق فلترة صارمة لمنع الإيموجيات في التقارير الصادرة، مع استبدالها بأرقام وأشكال ونقاط أكاديمية موحدة.'
    },
    {
      q: 'كيف يشارك المشرف الميداني بالتقييم دون إفساد كتابة المتدرب؟',
      a: 'تتيح بوابة المشرف المستقلة قراءة وتدقيق سجلات الطالب وأدلته الميدانية في وضع القراءة الآمن، مع تزويده ببطاقة تقييم إلكترونية مستقلة لإضافة الدرجة وملاحظات التقييم وخانة الاعتماد الرسمي، دون أي قدرة على حذف أو تعديل نصوص الطالب.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink selection:bg-accent-dim selection:text-accent font-sans antialiased" dir="rtl">
      
      {/* ── 1. Floating Luxury Navbar ────────────────────────────────────────── */}
      <header className="sticky top-3 z-50 px-3 sm:px-6">
        <div className="max-w-6xl mx-auto backdrop-blur-xl bg-card/85 border border-line/80 shadow-md rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between transition-all">
          {/* Brand Logo & Academic Crest */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-[#8B0000] text-white flex items-center justify-center font-black shadow-md text-xs tracking-tighter group-hover:scale-105 transition-transform">
              COOP
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-ink flex items-center gap-2">
                <span>COOP.Report</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-dim text-accent font-extrabold border border-accent/20">
                  الإصدار الرسمي v2.5
                </span>
              </div>
              <div className="text-[11px] text-muted hidden md:block">
                المنظومة الأكاديمية الذكية لإدارة وتقارير التدريب التعاوني
              </div>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-sub">
            <a href="#standards" className="hover:text-accent transition-colors">معايير اللائحة (21 صفحة)</a>
            <a href="#preview" className="hover:text-accent transition-colors">معاينة المخرجات</a>
            <a href="#features" className="hover:text-accent transition-colors">المميزات الهندسية</a>
            <a href="#comparison" className="hover:text-accent transition-colors">المقارنة الأكاديمية</a>
            <a href="#faq" className="hover:text-accent transition-colors">الأسئلة الشائعة</a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={handleFastDemoLogin}
              disabled={demoLoading}
              className="px-3.5 py-2 rounded-xl border border-line bg-bg hover:bg-card text-sub hover:text-ink text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
              title="دخول فوري بدون تسجيل لمعاينة المنصة"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>{demoLoading ? 'جارٍ التحميل...' : 'دخول تجريبي (1-Click)'}</span>
            </button>

            <button
              onClick={() => handleOpenAuth('login')}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-mid text-white text-xs font-extrabold transition-all shadow-sm hover:shadow-md active:scale-98 flex items-center gap-1.5"
            >
              <span>تسجيل الدخول</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => handleOpenAuth('login')}
              className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-bold"
            >
              دخول
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-bg border border-line text-sub hover:text-ink"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-2 max-w-6xl mx-auto bg-card border border-line rounded-2xl shadow-xl p-5 space-y-4 animate-fade-in text-xs font-bold">
            <a
              href="#standards"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sub hover:text-accent border-b border-line/60"
            >
              معايير اللائحة (21 صفحة)
            </a>
            <a
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sub hover:text-accent border-b border-line/60"
            >
              معاينة المخرجات والملفات
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sub hover:text-accent border-b border-line/60"
            >
              المميزات الهندسية
            </a>
            <a
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sub hover:text-accent border-b border-line/60"
            >
              المقارنة مع التوثيق التقليدي
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sub hover:text-accent border-b border-line/60"
            >
              الأسئلة الشائعة
            </a>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleFastDemoLogin}
                disabled={demoLoading}
                className="w-full py-2.5 rounded-xl border border-line bg-bg text-sub font-bold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>دخول تجريبي فوري بنقرة واحدة</span>
              </button>
              <button
                onClick={() => handleOpenAuth('register')}
                className="w-full py-2.5 rounded-xl bg-accent text-white font-extrabold"
              >
                إنشاء حساب جديد وبدء التوثيق
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── 2. Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Decorative Glow Ambient Elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-ok/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-line text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sub">مصمم ومعتمد وفق لوائح التدريب التعاوني بالكليات والجامعات السعودية</span>
              <ShieldCheck className="w-4 h-4 text-ok" />
            </div>

            {/* Powerful Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-ink tracking-tight leading-[1.2] sm:leading-[1.18]">
              وثّق تدريبك التعاوني، ولّد تقريرك الأكاديمي،{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-accent to-[#8B0000]">
                واستعد للمناقشة بامتياز
              </span>
            </h1>

            {/* Impactful Subtitle */}
            <p className="text-sub text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
              منصة هندسية متكاملة تدير أسابيع التدريب الـ 14، تدقق مهامك اليومية بالذكاء الاصطناعي، تدمج أدلة العمل المصورة دون تسريب خصوصية المنشأة، وتصدر تقرير Word رسمي في <b>21 صفحة قياسية</b> وعرض PowerPoint عريض للمناقشة بضغطة زر.
            </p>

            {/* Primary Calls to Action */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
              <button
                onClick={() => handleOpenAuth('register')}
                className="px-7 py-3.5 bg-gradient-to-r from-accent to-[#8B0000] hover:opacity-95 text-white text-sm font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center gap-2.5"
              >
                <span>ابدأ توثيق تدريبك مجاناً</span>
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleFastDemoLogin}
                disabled={demoLoading}
                className="px-6 py-3.5 bg-card hover:bg-surface border border-line text-ink text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2 active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>{demoLoading ? 'جارٍ فتح المنصة...' : 'معاينة تجريبية فورية (1-Click)'}</span>
              </button>
            </div>

            {/* Trust Markers */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs text-sub border-t border-line/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
                <span>21 صفحة أكاديمية قياسية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
                <span>14 أسبوعاً (280 ساعة عمل)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
                <span>تصدير Word + PowerPoint + HTML + PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
                <span>معيار Zero-Emoji الرسمي</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Interactive Live Showcase & Preview (The Core Visual) ─────────── */}
      <section id="preview" className="py-12 sm:py-16 border-y border-line bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-accent uppercase tracking-widest">المعاينة الحية للمخرجات</span>
            <h2 className="text-2xl sm:text-3xl font-black text-ink">
              كيف تبدو مخرجات تقريرك وعرض المناقشة؟
            </h2>
            <p className="text-xs sm:text-sm text-sub">
              بدون أي تعليق أو تنسيق مكسور، شاهد الدقة المتناهية للمستندات الصادرة من النظام:
            </p>
          </div>

          {/* Interactive Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 p-1.5 bg-bg rounded-2xl border border-line max-w-xl mx-auto">
            <button
              onClick={() => setActivePreviewTab('word')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activePreviewTab === 'word' ? 'bg-card text-accent shadow-sm border border-line' : 'text-sub hover:text-ink'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>مستند Word (.docx)</span>
            </button>
            <button
              onClick={() => setActivePreviewTab('pptx')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activePreviewTab === 'pptx' ? 'bg-card text-accent shadow-sm border border-line' : 'text-sub hover:text-ink'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>عرض البوربوينت (16:9)</span>
            </button>
            <button
              onClick={() => setActivePreviewTab('toc')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activePreviewTab === 'toc' ? 'bg-card text-accent shadow-sm border border-line' : 'text-sub hover:text-ink'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>الفهرس الشجري</span>
            </button>
            <button
              onClick={() => setActivePreviewTab('eval')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activePreviewTab === 'eval' ? 'bg-card text-accent shadow-sm border border-line' : 'text-sub hover:text-ink'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>استمارة المشرف</span>
            </button>
          </div>

          {/* Tab Content Display Area */}
          <div className="bg-surface rounded-2xl border border-line shadow-lg overflow-hidden p-4 sm:p-8 transition-all">
            
            {/* Tab 1: Word Document Page View */}
            {activePreviewTab === 'word' && (
              <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-line text-xs text-sub">
                  <span className="font-bold text-ink">معاينة صفحة أسبوع تدريبي داخل مستند Word المعتمد (صفحة 6 من 21)</span>
                  <span className="text-ok font-bold">هوامش 2.54 سم &bull; خط Traditional Arabic</span>
                </div>

                <div className="bg-card p-6 sm:p-8 rounded-xl border border-line shadow-sm space-y-5">
                  {/* Academic Page Header */}
                  <div className="flex justify-between items-center text-[11px] pb-3 border-b-2 border-line text-muted font-bold">
                    <span>تقرير التدريب التعاوني الميداني — الفصل التدريبي الثاني</span>
                    <span>المملكة العربية السعودية</span>
                  </div>

                  {/* Week Heading */}
                  <div className="flex justify-between items-baseline pt-2">
                    <h4 className="text-base font-extrabold text-ink">الأسبوع الثاني: استكشاف كبائن الخوادم وأنظمة لينكس</h4>
                    <span className="text-xs px-2.5 py-1 rounded bg-ok-bg text-ok font-bold">20 ساعة معتمدة</span>
                  </div>
                  <div className="text-xs text-sub">الفترة: من 2026-01-11 إلى 2026-01-15 &bull; عدد أيام العمل: 5 أيام</div>

                  {/* Tasks Table Mock */}
                  <div className="border border-line rounded-lg overflow-hidden text-xs">
                    <div className="grid grid-cols-4 bg-surface p-2.5 font-bold border-b border-line text-ink">
                      <div>اليوم والتاريخ</div>
                      <div>الفترة الزمنية</div>
                      <div className="col-span-2">المهمة الميدانية المنفذة</div>
                    </div>
                    <div className="grid grid-cols-4 p-2.5 border-b border-line/60 text-sub">
                      <div>الأحد 01-11</div>
                      <div>08:00 - 12:00 (4س)</div>
                      <div className="col-span-2 text-ink font-medium">تفقد كبائن الخوادم المركزية (Server Racks) ومراقبة درجات حرارة التبريد.</div>
                    </div>
                    <div className="grid grid-cols-4 p-2.5 border-b border-line/60 text-sub bg-surface/30">
                      <div>الإثنين 01-12</div>
                      <div>08:00 - 12:00 (4س)</div>
                      <div className="col-span-2 text-ink font-medium">تكوين مستخدمي النظام على توزيعة Ubuntu Server وضبط أذونات SSH.</div>
                    </div>
                  </div>

                  {/* Embedded Evidence Photo Box */}
                  <div className="bg-surface p-4 rounded-xl border border-line space-y-2">
                    <div className="text-[11px] font-bold text-accent">الأدلة الميدانية والصور التوثيقية للأسبوع (مدمجة بالأصل):</div>
                    <div className="h-40 bg-ink/90 rounded-lg flex flex-col items-center justify-center text-white space-y-1.5 p-4 border border-line text-center">
                      <Camera className="w-7 h-7 text-accent" />
                      <div className="text-xs font-bold">صورة توثيقية: فحص كبائن الخوادم بمركز البيانات</div>
                      <div className="text-[10px] text-muted">تم إزالة إحداثيات GPS تلقائياً &bull; مدمجة داخل بايتات مستند DOCX</div>
                    </div>
                  </div>

                  {/* Supervisor Weekly Sign-off Box */}
                  <div className="p-3.5 bg-surface rounded-lg border border-line flex items-center justify-between text-xs">
                    <div className="text-sub font-bold">اعتماد المشرف الميداني للأسبوع:</div>
                    <div className="text-ok font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تم الاعتماد والتحقق من ساعات العمل (20 ساعة)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: PowerPoint 16:9 Presentation */}
            {activePreviewTab === 'pptx' && (
              <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-line text-xs text-sub">
                  <span className="font-bold text-ink">معاينة شريحة العرض التقديمي للمناقشة — 16:9 Widescreen (شريحة 4 من 8)</span>
                  <span className="text-accent font-bold">قالب رسمي مجهز للجنة التحكيم</span>
                </div>

                <div className="bg-[#0f172a] text-white p-6 sm:p-8 rounded-xl shadow-xl aspect-video flex flex-col justify-between border border-line">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-accent text-[11px] font-bold">٣. الصور التوثيقية والأدلة الميدانية</div>
                      <h3 className="text-lg sm:text-xl font-black">توثيق بيئة العمل ومراكز البيانات والمعامل</h3>
                    </div>
                    <div className="text-[10px] px-2.5 py-1 rounded bg-white/10 text-white font-mono">
                      COOP Defense Deck
                    </div>
                  </div>

                  {/* 2 Photo Cards Simulation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 space-y-2">
                      <div className="h-24 bg-slate-900 rounded flex items-center justify-center text-slate-400 text-xs">
                        [صورة عالية الدقة لخوادم الداتا سنتر]
                      </div>
                      <div className="text-[11px] font-bold text-slate-200">الأسبوع الثاني: كبائن الخوادم الرئيسية</div>
                      <div className="text-[10px] text-slate-400">متابعة وحدات تزويد الطاقة ومستشعرات الرطوبة</div>
                    </div>

                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 space-y-2">
                      <div className="h-24 bg-slate-900 rounded flex items-center justify-center text-slate-400 text-xs">
                        [صورة كوابل الألياف الضوئية]
                      </div>
                      <div className="text-[11px] font-bold text-slate-200">الأسبوع الرابع: موزع كوابل الشبكة</div>
                      <div className="text-[10px] text-slate-400">توصيل واختبار سرعات نقل البيانات 10Gbps</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-700/50 pt-2">
                    <span>المتدرب: عبد الله بن محمد القحطاني</span>
                    <span>الجهة: شركة تقنية وحلول الحوسبة السحابية</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Table of Contents Hierarchy */}
            {activePreviewTab === 'toc' && (
              <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-line text-xs text-sub">
                  <span className="font-bold text-ink">معاينة الفهرس الشجري الذكي (Child Tree Hierarchy) — صفحة 2 من 21</span>
                  <span className="text-ok font-bold">أرقام صفحات دقيقة وروابط انتقال فورية</span>
                </div>

                <div className="bg-card p-6 rounded-xl border border-line font-mono text-xs space-y-2.5">
                  <div className="flex justify-between font-bold text-ink pb-2 border-b border-line">
                    <span>فهرس المحتويات الأكاديمي الشجري</span>
                    <span className="text-accent">الصفحة</span>
                  </div>
                  <div className="flex justify-between text-sub">
                    <span>فهرس المحتويات وصفحة الغلاف الأكاديمي .....................................................</span>
                    <span>١ - ٢</span>
                  </div>
                  <div className="flex justify-between text-sub">
                    <span>١. المقدمة وأهداف التدريب وبيانات المقرر (280 ساعة) ........................................</span>
                    <span>٣</span>
                  </div>
                  <div className="flex justify-between text-sub">
                    <span>٢. التعريف بجهة التدريب والهيكل الإداري وطبيعة العمل .......................................</span>
                    <span>٤</span>
                  </div>
                  <div className="flex justify-between text-ink font-bold pt-1">
                    <span>٣. الباب التدريبي: سجل الأسابيع الـ 14 الميدانية ..........................................</span>
                    <span className="text-accent font-black">٥ - ١٨</span>
                  </div>
                  <div className="pr-4 text-[11px] text-muted space-y-1.5">
                    <div className="flex justify-between">
                      <span>├── الأسبوع الأول: التهيئة العامة وسياسات أمن المعلومات [20 ساعة] .......................</span>
                      <span className="text-ok font-bold">٥</span>
                    </div>
                    <div className="flex justify-between">
                      <span>├── الأسبوع الثاني: استكشاف كبائن الخوادم [20 ساعة] [صور توثيقية] ........................</span>
                      <span className="text-ok font-bold">٦</span>
                    </div>
                    <div className="flex justify-between">
                      <span>├── الأسبوع الثالث: صيانة كوابل الألياف الضوئية [20 ساعة] .................................</span>
                      <span className="text-ok font-bold">٧</span>
                    </div>
                    <div className="flex justify-between">
                      <span>├── ... (كافة الأسابيع حتى الأسبوع 14 مع أرقام صفحاتها المتسلسلة)</span>
                      <span className="text-sub">...</span>
                    </div>
                    <div className="flex justify-between">
                      <span>└── الأسبوع الرابع عشر: جلسة مناقشة التقرير الختامي واعتماد الساعات ......................</span>
                      <span className="text-ok font-bold">١٨</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sub pt-1">
                    <span>٤. المعارف والمهارات والتجارب المكتسبة والربط مع الكلية ...................................</span>
                    <span>١٩</span>
                  </div>
                  <div className="flex justify-between text-sub">
                    <span>٥. الخاتمة والتوصيات الأكاديمية والمهنية ...................................................</span>
                    <span>٢٠</span>
                  </div>
                  <div className="flex justify-between text-ok font-bold pt-1 border-t border-line">
                    <span>٦. استمارة تقييم واعتماد المشرف الميداني والأكاديمي والختم الرسمي .........................</span>
                    <span>٢١</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Evaluation & Approval Sheet */}
            {activePreviewTab === 'eval' && (
              <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-line text-xs text-sub">
                  <span className="font-bold text-ink">معاينة استمارة الاعتماد والختم الرسمي النهائي — صفحة 21 من 21</span>
                  <span className="text-ok font-bold">استمارة رسمية معتمدة</span>
                </div>

                <div className="bg-card p-6 rounded-xl border border-line space-y-4 text-xs">
                  <div className="text-center space-y-1 pb-3 border-b border-line">
                    <h4 className="font-black text-sm text-ink">استمارة التقييم والاعتماد الختامي للتدريب التعاوني</h4>
                    <p className="text-[11px] text-sub">تُعبأ وتُعتمد رسمياً من قبل المشرف الميداني بالمنشأة وتُرفع للكلية / الجامعة</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sub">
                    <div className="p-3 bg-surface rounded-lg border border-line space-y-1">
                      <div className="text-[10px] text-muted">اسم المشرف الميداني:</div>
                      <div className="font-bold text-ink">م. عبد العزيز بن سعد الغامدي</div>
                    </div>
                    <div className="p-3 bg-surface rounded-lg border border-line space-y-1">
                      <div className="text-[10px] text-muted">المسمى الوظيفي:</div>
                      <div className="font-bold text-ink">مدير هندسة الأنظمة والبنية التحتية</div>
                    </div>
                  </div>

                  <div className="p-4 bg-surface rounded-xl border border-line space-y-2">
                    <div className="font-bold text-ink">التقييم العام للمتدرب:</div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded bg-ok-bg text-ok font-black">ممتاز (98 / 100)</span>
                      <span className="text-sub">أظهر التزاماً استثنائياً وإتقاناً للمهام الهندسية الموكلة إليه.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-line text-center">
                    <div className="space-y-6">
                      <div className="font-bold text-sub">توقيع المشرف الميداني</div>
                      <div className="font-mono text-muted text-xs">عبد العزيز الغامدي (معتمد رقمياً)</div>
                    </div>
                    <div className="space-y-6">
                      <div className="font-bold text-sub">ختم جهة التدريب الرسمية</div>
                      <div className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-line flex items-center justify-center text-[10px] text-muted">
                        الختم الرسمي
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. Official Academic Standards Compliance Matrix ───────────────── */}
      <section id="standards" className="py-16 sm:py-20 border-b border-line bg-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-accent uppercase tracking-widest">المعايير الرسمية المعتمدة</span>
            <h2 className="text-2xl sm:text-3xl font-black text-ink">
              ترتيب أوراق التقرير بحسب معايير الكليات التقنية والجامعات
            </h2>
            <p className="text-xs sm:text-sm text-sub">
              تم بناء هيكل التقرير ليطابق حرفياً بنود لائحة إعداد التقرير الفني للتدريب التعاوني (فيما لا يقل عن 15 صفحة):
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Standard 1 */}
            <div className="p-6 bg-card rounded-2xl border border-line space-y-3 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center text-xs font-black">١</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-accent-dim text-accent font-bold">الصفحة الأولى (١)</span>
              </div>
              <h3 className="font-extrabold text-base text-ink">الغلاف الأكاديمي المعتمد</h3>
              <p className="text-xs text-sub leading-relaxed">
                يحتوي على اسم المتدرب، الرقم التدريبي، اسم الوحدة التدريبية والكلية، اسم القسم، واسم المشرف التدريبي في الوحدة التدريبية.
              </p>
            </div>

            {/* Standard 2 */}
            <div className="p-6 bg-card rounded-2xl border border-line space-y-3 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center text-xs font-black">٢</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-accent-dim text-accent font-bold">الصفحة الثانية (٢)</span>
              </div>
              <h3 className="font-extrabold text-base text-ink">فهرس المحتويات الشجري</h3>
              <p className="text-xs text-sub leading-relaxed">
                فهرس رقمي منقط يوضح العناوين الرئيسية وأرقام صفحاتها، مع تفرع شجري للأسابيع الـ 14 وساعاتها المعتمدة.
              </p>
            </div>

            {/* Standard 3 */}
            <div className="p-6 bg-card rounded-2xl border border-line space-y-3 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center text-xs font-black">٣</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-accent-dim text-accent font-bold">الصفحة الثالثة (٣)</span>
              </div>
              <h3 className="font-extrabold text-base text-ink">المقدمة وأهمية التدريب</h3>
              <p className="text-xs text-sub leading-relaxed">
                صياغة أكاديمية رصينة تشرح أهمية التدريب التعاوني كحلقة وصل بين العلوم النظرية وسوق العمل، وساعات المقرر (280 ساعة).
              </p>
            </div>

            {/* Standard 4 */}
            <div className="p-6 bg-card rounded-2xl border border-line space-y-3 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center text-xs font-black">٤</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-accent-dim text-accent font-bold">الصفحة الرابعة (٤)</span>
              </div>
              <h3 className="font-extrabold text-base text-ink">التعريف بجهة التدريب</h3>
              <p className="text-xs text-sub leading-relaxed">
                اسم الجهة، عنوانها، طبيعة العمل، عدد الموظفين، نبذة عامة عنها وعن القسم التقني، واسم المسؤول عن التدريب.
              </p>
            </div>

            {/* Standard 5 */}
            <div className="p-6 bg-card rounded-2xl border border-line space-y-3 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center text-xs font-black">٥</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-accent-dim text-accent font-bold">الصفحات من ٥ إلى ١٨</span>
              </div>
              <h3 className="font-extrabold text-base text-ink">الجدول الزمني للأسابيع (14 أسبوعاً)</h3>
              <p className="text-xs text-sub leading-relaxed">
                صفحة مستقلة لكل أسبوع تحتوي على جدول إنجاز الأيام، صور الأدلة الميدانية المدمجة، ومربع اعتماد وتوقيع المشرف الأسبوعي.
              </p>
            </div>

            {/* Standard 6 */}
            <div className="p-6 bg-card rounded-2xl border border-line space-y-3 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-ok text-white flex items-center justify-center text-xs font-black">٦</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-ok-bg text-ok font-bold">الصفحات من ١٩ إلى ٢١</span>
              </div>
              <h3 className="font-extrabold text-base text-ink">المهارات والربط العلمي والاعتماد</h3>
              <p className="text-xs text-sub leading-relaxed">
                شرح موجز للمعارف والمهارات مع الربط بين دراسة الكلية وواقع العمل، يليه الخاتمة واستمارة التقييم والختم الرسمي.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Comparison: Manual Traditional vs COOP.Report ────────────────── */}
      <section id="comparison" className="py-16 sm:py-20 border-b border-line bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-accent uppercase tracking-widest">الفارق الجوهري</span>
            <h2 className="text-2xl sm:text-3xl font-black text-ink">
              لماذا يختار المتدربون والمشرفون منصة COOP.Report؟
            </h2>
          </div>

          <div className="border border-line rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-2 bg-surface p-4 text-xs font-bold border-b border-line text-ink">
              <div className="text-muted">طرق التوثيق التقليدية المشتتة (Word يدوي)</div>
              <div className="text-accent flex items-center gap-1.5 font-extrabold">
                <Sparkles className="w-4 h-4" />
                <span>منظومة COOP.Report الذكية</span>
              </div>
            </div>

            <div className="divide-y divide-line text-xs">
              <div className="grid grid-cols-2 p-4 gap-4">
                <div className="text-sub flex items-start gap-2">
                  <X className="w-4 h-4 text-warn shrink-0 mt-0.5" />
                  <span>تنسيق يدوي مرهق يتغير عند نقل الملف بين الأجهزة.</span>
                </div>
                <div className="text-ink font-bold flex items-start gap-2">
                  <Check className="w-4 h-4 text-ok shrink-0 mt-0.5" />
                  <span>توليد DOCX أصلي بهوامش وجداول أكاديمية ثابتة 100%.</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-4 gap-4 bg-surface/30">
                <div className="text-sub flex items-start gap-2">
                  <X className="w-4 h-4 text-warn shrink-0 mt-0.5" />
                  <span>الصور تنكسر وتظهر كأيقونة حمراء مفقودة عند الإرسال.</span>
                </div>
                <div className="text-ink font-bold flex items-start gap-2">
                  <Check className="w-4 h-4 text-ok shrink-0 mt-0.5" />
                  <span>الصور مدمجة في بايتات الملف بالأصل ولا تنكسر أبداً.</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-4 gap-4">
                <div className="text-sub flex items-start gap-2">
                  <X className="w-4 h-4 text-warn shrink-0 mt-0.5" />
                  <span>خطر تسريب إحداثيات الموقع (GPS) من كاميرا الجوال.</span>
                </div>
                <div className="text-ink font-bold flex items-start gap-2">
                  <Check className="w-4 h-4 text-ok shrink-0 mt-0.5" />
                  <span>تجريد تلقائي كامل لبيانات الـ GPS و EXIF قبل الحفظ.</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-4 gap-4 bg-surface/30">
                <div className="text-sub flex items-start gap-2">
                  <X className="w-4 h-4 text-warn shrink-0 mt-0.5" />
                  <span>صعوبة تجهيز عرض بوربوينت من الصفر ليلة المناقشة.</span>
                </div>
                <div className="text-ink font-bold flex items-start gap-2">
                  <Check className="w-4 h-4 text-ok shrink-0 mt-0.5" />
                  <span>توليد عرض بوربوينت عريض 16:9 جاهز للمناقشة بضغطة زر.</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-4 gap-4">
                <div className="text-sub flex items-start gap-2">
                  <X className="w-4 h-4 text-warn shrink-0 mt-0.5" />
                  <span>ضياع التعديلات أو مسودة اليوم في حال انقطاع النت.</span>
                </div>
                <div className="text-ink font-bold flex items-start gap-2">
                  <Check className="w-4 h-4 text-ok shrink-0 mt-0.5" />
                  <span>حفظ فوري محلي كل نصف ثانية وسجل زمني لـ 30 إصداراً.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ Accordion ───────────────────────────────────────────────── */}
      <section id="faq" className="py-16 sm:py-20 border-b border-line bg-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-black text-accent uppercase tracking-widest">إجابات الخبراء</span>
            <h2 className="text-2xl sm:text-3xl font-black text-ink">الأسئلة الأكثر شيوعاً</h2>
            <p className="text-xs sm:text-sm text-sub">كل ما تحتاج معرفته عن المعايير الأكاديمية للمنصة</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-card rounded-2xl border border-line overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-right flex items-center justify-between gap-4 font-extrabold text-sm text-ink hover:text-accent transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-full bg-surface border border-line text-sub shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-sub leading-relaxed border-t border-line/60 bg-surface/30 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7. Grand Call to Action ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-accent via-[#8B0000] to-accent text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold">
            <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>انضم إلى مئات المتدربين المتميزين في كليات وجامعات المملكة</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            لا تدع تقريرك الختامي للصدفة — ابدأ الآن واضمن أعلى درجات التميز
          </h2>

          <p className="text-white/85 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            وفّر عشرات الساعات من التنسيق اليدوي المرهق، واجعل تقريرك جاهزاً صفحة بصفحة وعرضك التقديمي مبهراً أمام لجنة المناقشة.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
            <button
              onClick={() => handleOpenAuth('register')}
              className="px-8 py-4 bg-white hover:bg-white/95 text-accent font-black text-sm rounded-2xl shadow-2xl transition-all active:scale-98"
            >
              إنشاء حساب جديد وبدء التوثيق مجاناً
            </button>
            <button
              onClick={handleFastDemoLogin}
              disabled={demoLoading}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-sm rounded-2xl transition-all"
            >
              {demoLoading ? 'جارٍ الفتح...' : 'معاينة تجريبية فورية (1-Click)'}
            </button>
          </div>
        </div>
      </section>

      {/* ── 8. Official Academic Footer ─────────────────────────────────────── */}
      <footer className="py-10 bg-card border-t border-line text-xs text-sub">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-line">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">
                C
              </div>
              <span className="font-black text-base text-ink">COOP.Report</span>
              <span className="text-muted text-[11px]">&mdash; الإصدار الأكاديمي المعتمد v2.5</span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-[11.5px] text-muted">
              <a href="#standards" className="hover:text-accent transition-colors font-bold">معايير اللائحة (21 صفحة)</a>
              <a href="#preview" className="hover:text-accent transition-colors font-bold">معاينة الملفات</a>
              <a href="#features" className="hover:text-accent transition-colors font-bold">المميزات</a>
              <a href="#faq" className="hover:text-accent transition-colors font-bold">الأسئلة الشائعة</a>
              <button
                onClick={handleFastDemoLogin}
                className="text-accent hover:underline font-extrabold"
              >
                مختبر المحاكاة (/testdev)
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted">
            <div>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} COOP.Report &mdash; نظام توثيق وتقارير التدريب التعاوني.</div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-ok" />
              <span>بيانات مشفرة ومحمية &bull; بدون إعلانات &bull; خصوصية المنشأة مضمونة</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── 9. Floating Auth Modal (Login / Register / 1-Click Demo) ─────────── */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/65 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-card rounded-3xl border border-line shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
            {/* Close Floating Button */}
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-bg hover:bg-line text-sub hover:text-ink flex items-center justify-center transition-colors border border-line"
              title="إغلاق والعودة لصفحة الهبوط"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Render Auth Screen */}
            <div className="p-2 sm:p-4">
              <AuthScreen />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
