import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthScreen } from '../auth/AuthScreen';
import {
  FileText,
  Presentation,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Calendar,
  Clock,
  Download,
  Layers,
  ArrowRight,
  ChevronLeft,
  X,
  ExternalLink,
  BookOpen,
  Award,
  Users,
  Camera,
  FolderLock
} from 'lucide-react';

interface LandingPageProps {
  onOpenTestDev?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenTestDev }) => {
  const { demoLogin } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [demoLoading, setDemoLoading] = useState<boolean>(false);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
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

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink selection:bg-accent-dim selection:text-accent font-sans antialiased" dir="rtl">
      {/* ── Sticky Top Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-black shadow-sm text-sm tracking-tighter">
              COOP
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-ink flex items-center gap-2">
                <span>COOP.Report</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-dim text-accent font-bold">
                  v2.5
                </span>
              </div>
              <div className="text-[11px] text-muted hidden sm:block">نظام توثيق وتقارير التدريب التعاوني الأكاديمي</div>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-sub">
            <a href="#features" className="hover:text-accent transition-colors">المميزات الأكاديمية</a>
            <a href="#standards" className="hover:text-accent transition-colors">معايير اللائحة (21 صفحة)</a>
            <a href="#exports" className="hover:text-accent transition-colors">صيغ التصدير</a>
            <a href="#how-it-works" className="hover:text-accent transition-colors">كيف يعمل؟</a>
            <a
              href="/testdev"
              onClick={(e) => {
                e.preventDefault();
                handleFastDemoLogin();
              }}
              className="text-accent hover:underline flex items-center gap-1 font-extrabold"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>مختبر المحاكاة (/testdev)</span>
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFastDemoLogin}
              disabled={demoLoading}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-bg hover:bg-card text-sub hover:text-ink text-xs font-bold transition-all"
              title="دخول فوري بحساب تجريبي لمعاينة الموقع وتجربته"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>{demoLoading ? 'جارٍ الدخول...' : 'دخول تجريبي (1-Click)'}</span>
            </button>

            <button
              onClick={() => handleOpenAuth('login')}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-mid text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>تسجيل الدخول</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden border-b border-line bg-gradient-to-b from-card to-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-dim text-accent border border-accent/20 text-xs font-bold animate-fade-in shadow-xs">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>معتمد أكاديمياً وفق اشتراطات الكليات التقنية والجامعات السعودية</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-ink tracking-tight leading-tight sm:leading-snug">
              المنظومة الأذكى لإدارة وتوثيق{' '}
              <span className="text-accent underline decoration-accent/30 underline-offset-8">
                التدريب التعاوني
              </span>{' '}
              وتوليد التقارير الرسمية
            </h1>

            {/* Subtitle */}
            <p className="text-sub text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              سجّل مهامك اليومية، نظّم أسابيعك الـ 14، ارفع صور الأدلة الميدانية بأمان تام، ولّد تقارير
              Word و PowerPoint و HTML متكاملة في 21 صفحة دون أي إيموجيات ومعتمدة بالكامل.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleOpenAuth('register')}
                className="px-6 py-3 bg-accent hover:bg-accent-mid text-white text-sm font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center gap-2"
              >
                <span>ابدأ توثيق تدريبك مجاناً</span>
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleFastDemoLogin}
                disabled={demoLoading}
                className="px-5 py-3 bg-card hover:bg-line border border-line text-ink text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>{demoLoading ? 'جارٍ التحميل...' : 'دخول فوري بحساب تجريبي (1-Click)'}</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-sub border-t border-line/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ok" />
                <span>تقرير 21 صفحة قياسي</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ok" />
                <span>14 أسبوعاً قياسياً (280 ساعة)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ok" />
                <span>معيار Zero-Emoji الرسمي</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ok" />
                <span>تجريد تلقائي لـ GPS/EXIF</span>
              </div>
            </div>
          </div>

          {/* Interactive Document Preview Mockup */}
          <div className="mt-14 max-w-4xl mx-auto bg-card rounded-2xl border border-line shadow-xl overflow-hidden">
            {/* Window Top Bar */}
            <div className="bg-surface px-4 py-3 border-b border-line flex items-center justify-between text-xs text-sub">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-line" />
                <div className="w-3 h-3 rounded-full bg-line" />
                <div className="w-3 h-3 rounded-full bg-line" />
                <span className="font-bold text-ink pr-2">معاينة التقرير الفني النهائي — 21 صفحة رسمية</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] px-2 py-0.5 rounded bg-ok-bg text-ok font-bold">280 ساعة مكتملة (100%)</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-accent-dim text-accent font-bold">Word / PPTX / PDF</span>
              </div>
            </div>

            {/* Document Mock Body */}
            <div className="p-6 sm:p-8 space-y-6 bg-surface/50">
              {/* Report Header Card */}
              <div className="bg-card p-5 rounded-xl border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-accent">المملكة العربية السعودية — التدريب التقني والجامعي</div>
                  <h3 className="font-extrabold text-base text-ink">التقرير الفني الختامي للتدريب التعاوني (COOP Final Report)</h3>
                  <div className="text-xs text-sub flex flex-wrap items-center gap-3 pt-1">
                    <span>المتدرب: <b>عبد الله بن محمد القحطاني</b></span>
                    <span>&bull;</span>
                    <span>الجهة: <b>شركة تقنية وحلول الحوسبة السحابية</b></span>
                    <span>&bull;</span>
                    <span>المشرف الأكاديمي: <b>د. خالد المنصور</b></span>
                  </div>
                </div>
                <div className="shrink-0 p-2.5 rounded-xl bg-bg border border-line text-center">
                  <div className="text-[10px] text-sub font-bold">إجمالي الصفحات</div>
                  <div className="text-xl font-black text-ink mt-0.5">21 صفحة</div>
                  <div className="text-[9px] text-ok font-bold">مطابق للائحة الرسمية</div>
                </div>
              </div>

              {/* Hierarchical TOC Preview Box */}
              <div className="bg-card p-5 rounded-xl border border-line space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-line font-bold text-ink">
                  <span>فهرس المحتويات الأكاديمي الشجري (Hierarchical Table of Contents)</span>
                  <span className="text-accent">أرقام الصفحات</span>
                </div>
                <div className="space-y-1.5 text-sub">
                  <div className="flex justify-between">
                    <span>١. المقدمة وأهداف التدريب وبيانات المقرر (280 ساعة)</span>
                    <span>صفحة ٣</span>
                  </div>
                  <div className="flex justify-between">
                    <span>٢. التعريف بجهة التدريب، الهيكل الإداري وطبيعة العمل</span>
                    <span>صفحة ٤</span>
                  </div>
                  <div className="flex justify-between font-bold text-ink pt-1">
                    <span>٣. الباب التدريبي: سجل الأسابيع الـ 14 الميدانية</span>
                    <span className="text-accent">صفحات ٥ إلى ١٨</span>
                  </div>
                  <div className="pr-4 text-[11px] text-muted space-y-1">
                    <div>├── الأسبوع الأول: التهيئة العامة وسياسات أمن المعلومات (20 ساعة) ............ ص ٥</div>
                    <div>├── الأسبوع الثاني: استكشاف كبائن الخوادم [صور توثيقية] (20 ساعة) ............. ص ٦</div>
                    <div>├── ... (كافة الأسابيع التدريبية حتى الأسبوع الرابع عشر)</div>
                    <div>└── الأسبوع الرابع عشر: مناقشة التقرير الختامي وتسليم المهام (20 ساعة) ....... ص ١٨</div>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>٤. المعارف والمهارات والتجارب المكتسبة والربط العلمي مع الكلية</span>
                    <span>صفحة ١٩</span>
                  </div>
                  <div className="flex justify-between">
                    <span>٥. الخاتمة والتوصيات الأكاديمية والمهنية</span>
                    <span>صفحة ٢٠</span>
                  </div>
                  <div className="flex justify-between font-bold text-ok">
                    <span>٦. استمارة تقييم واعتماد المشرف الميداني والأكاديمي والختم الرسمي</span>
                    <span>صفحة ٢١</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Official Standards Compliance Section ───────────────────── */}
      <section id="standards" className="py-16 sm:py-20 border-b border-line bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-accent uppercase tracking-wider">مطابقة اللوائح الرسمية</span>
            <h2 className="text-2xl sm:text-3xl font-black text-ink">
              ترتيب أوراق التقرير بحسب معايير الكليات التقنية والجامعات
            </h2>
            <p className="text-xs sm:text-sm text-sub">
              تمت هندسة المنصة لتطابق حرفياً بنود لائحة إعداد التقرير الفني للتدريب التعاوني (فيما لا يقل عن 15 صفحة)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Item 1 */}
            <div className="p-5 bg-bg rounded-xl border border-line space-y-2">
              <div className="flex items-center gap-2 font-bold text-ink text-sm">
                <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-black">١</span>
                <span>الغلاف الأكاديمي المعتمد</span>
              </div>
              <p className="text-xs text-sub leading-relaxed">
                يحتوي على اسم المتدرب، الرقم التدريبي، اسم الوحدة والكلية، القسم، واسم المشرف الميداني والأكاديمي.
              </p>
              <div className="text-[10px] text-accent font-bold pt-1">الصفحة الأولى (١)</div>
            </div>

            {/* Item 2 */}
            <div className="p-5 bg-bg rounded-xl border border-line space-y-2">
              <div className="flex items-center gap-2 font-bold text-ink text-sm">
                <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-black">٢</span>
                <span>فهرس المحتويات الشجري</span>
              </div>
              <p className="text-xs text-sub leading-relaxed">
                فهرس رقمي منقط يوضح العناوين الرئيسية، والتفرع الشجري لكافة الأسابيع الـ 14 مع أرقام صفحاتها الدقيقة.
              </p>
              <div className="text-[10px] text-accent font-bold pt-1">الصفحة الثانية (٢)</div>
            </div>

            {/* Item 3 */}
            <div className="p-5 bg-bg rounded-xl border border-line space-y-2">
              <div className="flex items-center gap-2 font-bold text-ink text-sm">
                <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-black">٣</span>
                <span>المقدمة وأهمية التدريب</span>
              </div>
              <p className="text-xs text-sub leading-relaxed">
                صياغة أكاديمية رصينة توضح أهداف التدريب التعاوني، بطاقة ساعات المقرر المطلوبة، ونسبة الإنجاز.
              </p>
              <div className="text-[10px] text-accent font-bold pt-1">الصفحة الثالثة (٣)</div>
            </div>

            {/* Item 4 */}
            <div className="p-5 bg-bg rounded-xl border border-line space-y-2">
              <div className="flex items-center gap-2 font-bold text-ink text-sm">
                <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-black">٤</span>
                <span>التعريف بجهة التدريب</span>
              </div>
              <p className="text-xs text-sub leading-relaxed">
                اسم الجهة، عنوانها، طبيعة العمل، عدد الموظفين، نبذة عن القسم التقني، واسم المسؤول الميداني.
              </p>
              <div className="text-[10px] text-accent font-bold pt-1">الصفحة الرابعة (٤)</div>
            </div>

            {/* Item 5 */}
            <div className="p-5 bg-bg rounded-xl border border-line space-y-2">
              <div className="flex items-center gap-2 font-bold text-ink text-sm">
                <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-black">٥</span>
                <span>الجدول الزمني للأسابيع</span>
              </div>
              <p className="text-xs text-sub leading-relaxed">
                14 صفحة مستقلة (صفحة لكل أسبوع) تشمل جدول المهام اليومية، الساعات، صور الأدلة الميدانية، وتوقيع المشرف.
              </p>
              <div className="text-[10px] text-accent font-bold pt-1">الصفحات من ٥ إلى ١٨</div>
            </div>

            {/* Item 6 */}
            <div className="p-5 bg-bg rounded-xl border border-line space-y-2">
              <div className="flex items-center gap-2 font-bold text-ink text-sm">
                <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-black">٦</span>
                <span>المهارات والاعتماد النهائي</span>
              </div>
              <p className="text-xs text-sub leading-relaxed">
                المعارف والمهارات وربطها مع الكلية، الخاتمة والتوصيات، واستمارة التقييم والاعتماد الرسمي للمشرفين.
              </p>
              <div className="text-[10px] text-ok font-bold pt-1">الصفحات من ١٩ إلى ٢١</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Features Section ────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-20 border-b border-line bg-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-accent uppercase tracking-wider">مزايا هندسية متطورة</span>
            <h2 className="text-2xl sm:text-3xl font-black text-ink">
              كل ما تحتاجه لإنجاز تدريبك التعاوني بأعلى درجة امتياز
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Feature 1 */}
            <div className="p-6 bg-card rounded-2xl border border-line space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-accent-dim text-accent flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink">مساعد الصياغة والتدقيق الأكاديمي</h3>
              <p className="text-xs text-sub leading-relaxed">
                تحويل المسودات البسيطة إلى صياغة فنية راقية، مع فحص إملائي دقيق ومقارنة الفروقات (Word Diff) قبل الاعتماد.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-card rounded-2xl border border-line space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-accent-dim text-accent flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink">توثيق الأدلة الميدانية وسرية البيانات</h3>
              <p className="text-xs text-sub leading-relaxed">
                رفع صور الداتا سنتر والورش مع تجريد تلقائي لبيانات الـ GPS و EXIF لضمان سرية المنشأة وفق أعلى معايير الأمن السيبراني.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-card rounded-2xl border border-line space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-accent-dim text-accent flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink">بوابة المشرف الميداني والربط المباشر</h3>
              <p className="text-xs text-sub leading-relaxed">
                متابعة فورية للمتدرب دون التدخل في كتابته، مع صلاحية التقييم وإضافة الملاحظات والاعتماد الرسمي الأسبوعي والنهائي.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-card rounded-2xl border border-line space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-accent-dim text-accent flex items-center justify-center font-bold">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink">تصدير Word و PowerPoint متكامل</h3>
              <p className="text-xs text-sub leading-relaxed">
                توليد ملف DOCX منسق بالصور المدمجة وعرض شرائح 16:9 مجهز للمناقشة الرسمية، وملف HTML مستقل يعمل بدون إنترنت.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-card rounded-2xl border border-line space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-accent-dim text-accent flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink">حفظ تلقائي للمسودات وسجل الإصدارات</h3>
              <p className="text-xs text-sub leading-relaxed">
                حفظ محلي مستمر كل نصف ثانية، وسجل زمني يحفظ حتى 30 نسخة سابقة للرجوع لأي تعديل قديم بضغطة زر واحدة.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-card rounded-2xl border border-line space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-accent-dim text-accent flex items-center justify-center font-bold">
                <FolderLock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink">نسخ احتياطي رقمي مشفر (SHA-256)</h3>
              <p className="text-xs text-sub leading-relaxed">
                تصدير واسترجاع نسخة احتياطية كاملة لبياناتك وصورك بملف JSON واحد مع بصمة أمان رقمية تضمن عدم تلف البيانات.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works Section ────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-20 border-b border-line bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-accent uppercase tracking-wider">بساطة الاستخدام</span>
            <h2 className="text-2xl sm:text-3xl font-black text-ink">كيف يعمل نظام COOP.Report في 3 خطوات؟</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-bg rounded-2xl border border-line space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center font-black mx-auto text-lg shadow-sm">
                1
              </div>
              <h3 className="font-bold text-base text-ink">أنشئ حسابك وحدد الخطة</h3>
              <p className="text-xs text-sub leading-relaxed">
                سجّل بياناتك وبيانات جهة التدريب وعدد ساعات المقرر المطلوبة (مثلاً 280 ساعة عبر 14 أسبوعاً).
              </p>
            </div>

            <div className="p-6 bg-bg rounded-2xl border border-line space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center font-black mx-auto text-lg shadow-sm">
                2
              </div>
              <h3 className="font-bold text-base text-ink">دوّن مهامك وارفق أدلتك</h3>
              <p className="text-xs text-sub leading-relaxed">
                سجّل الأعمال اليومية وساعاتها، واستخدم مساعد الذكاء الاصطناعي للصياغة، وارفق صور بيئة العمل لكل أسبوع.
              </p>
            </div>

            <div className="p-6 bg-bg rounded-2xl border border-line space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center font-black mx-auto text-lg shadow-sm">
                3
              </div>
              <h3 className="font-bold text-base text-ink">صدّر تقريرك وعرض المناقشة</h3>
              <p className="text-xs text-sub leading-relaxed">
                بضغطة زر، حمّل تقرير الـ 21 صفحة بصيغة Word أو PDF وعرض PowerPoint التقديمي جاهزاً للمشرف ولجنة التقييم.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Call to Action Banner ───────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-accent to-[#8B0000] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            جاهز لبدء توثيق تدريبك التعاوني بأعلى درجات الاحترافية؟
          </h2>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            انضم الآن وابدأ بتسجيل مهامك اليومية خطوة بخطوة، واضمن صدور تقريرك الختامي وعرض المناقشة بأرقى المعايير الجامعية.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleOpenAuth('register')}
              className="px-6 py-3 bg-white hover:bg-white/90 text-accent font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-[0.99]"
            >
              إنشاء حساب جديد وبدء التوثيق
            </button>
            <button
              onClick={handleFastDemoLogin}
              disabled={demoLoading}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition-all"
            >
              {demoLoading ? 'جارٍ التحميل...' : 'دخول فوري بحساب تجريبي (1-Click)'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="py-8 bg-card border-t border-line text-xs text-sub">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent text-white flex items-center justify-center font-black text-[10px]">
              C
            </div>
            <span className="font-extrabold text-ink">COOP.Report</span>
            <span className="text-muted">&mdash; نظام توثيق وتقارير التدريب التعاوني الذكي</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-muted">
            <a href="#standards" className="hover:text-accent transition-colors">معايير اللائحة</a>
            <span>&bull;</span>
            <a href="#features" className="hover:text-accent transition-colors">المميزات</a>
            <span>&bull;</span>
            <button
              onClick={handleFastDemoLogin}
              className="hover:text-accent transition-colors font-bold"
            >
              المختبر التجريبي (/testdev)
            </button>
            <span>&bull;</span>
            <button
              onClick={() => handleOpenAuth('login')}
              className="hover:text-accent transition-colors font-bold text-accent"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </footer>

      {/* ── Auth Modal (Floating Login / Register Window) ──────────── */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-card rounded-2xl border border-line shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-bg hover:bg-line text-sub hover:text-ink flex items-center justify-center transition-colors border border-line"
              title="إغلاق والعودة لصفحة الهبوط"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Render Auth Screen inside modal */}
            <div className="p-2 sm:p-4">
              <AuthScreen />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
