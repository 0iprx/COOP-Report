import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthScreen } from '../auth/AuthScreen';
import {
  Sparkles,
  FileText,
  Presentation,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  X,
  Menu,
  Download,
  Layers,
  Award,
  Users,
  Camera,
  ArrowRight,
  Printer,
  FileCode,
  Building,
  Clock,
  Laptop,
  Check,
  Calendar,
  Eye,
  BookOpen,
  FolderCheck,
  Sliders,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export const LandingPage: React.FC<{ onOpenTestDev?: () => void }> = ({ onOpenTestDev }) => {
  const { demoLogin } = useAuth();
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
      alert('Demo session initiation failed. Please try again.');
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
      alert('Unable to launch sandbox. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  const faqs = [
    {
      q: 'Does the generated report comply with university and TVTC requirements?',
      a: 'Yes. The report conforms to standard institutional cooperative training guidelines. It automatically generates a formal cover page, narrative table of contents, company overview, 14 individual weekly technical chapters with photo documentation, competencies evaluation, and official supervisor endorsement pages.'
    },
    {
      q: 'Can I edit the exported report in Microsoft Word?',
      a: 'Yes, 100%. The downloaded file is a standard OpenXML (.docx) document with proper heading hierarchy, margins (2.54 cm), and typography (Times New Roman / Traditional Arabic). Every paragraph, table, and caption remains fully editable in Microsoft Word.'
    },
    {
      q: 'How does the 14-week curriculum schedule work?',
      a: 'The platform structures your training journey across 14 dedicated weeks aligned with the 2-credit-hour academic curriculum. You can freely navigate, edit entries, rephrase descriptions, attach field evidence photos, or mark weeks as postponed at any time.'
    },
    {
      q: 'Can I produce defense slides directly from the platform?',
      a: 'Yes. You can export a native PowerPoint (.pptx) deck structured for your committee defense. It contains your profile, host organization background, 14-week milestone summary, key technical achievements, embedded field evidence, and academic conclusions.'
    },
    {
      q: 'Is bilingual reporting supported for both Arabic and English curricula?',
      a: 'Yes. You can switch the entire report preview and download deliverables in either English or Arabic with a single click. The built-in academic translation engine converts technical terminology, table of contents, and narrative sections seamlessly.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink selection:bg-accent-dim selection:text-accent font-sans antialiased" dir="ltr">
      
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
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-md bg-accent-dim text-accent font-extrabold">
                  Academic Platform
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-sub">
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#curriculum" className="hover:text-ink transition-colors">14-Week Curriculum</a>
            <a href="#preview" className="hover:text-ink transition-colors">Report & Slides</a>
            <a href="#faq" className="hover:text-ink transition-colors">FAQ</a>
            {onOpenTestDev && (
              <button
                onClick={handleOpenSandbox}
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
              >
                <span>Sandbox (/testdev)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => handleOpenAuth('login')}
              className="px-3.5 py-2 text-xs font-bold text-ink hover:text-accent transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={handleFastDemoLogin}
              disabled={demoLoading}
              className="px-4 py-2 text-xs font-bold bg-accent text-white hover:bg-accent/90 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>{demoLoading ? 'Launching...' : 'Explore Demo'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              onClick={handleFastDemoLogin}
              className="px-3 py-1.5 text-xs font-bold bg-accent text-white rounded-lg"
            >
              Demo
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
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sub hover:text-ink">Features</a>
            <a href="#curriculum" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sub hover:text-ink">Curriculum</a>
            <a href="#preview" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sub hover:text-ink">Report Preview</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sub hover:text-ink">FAQ</a>
            {onOpenTestDev && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenSandbox();
                }}
                className="w-full text-left py-2 text-accent"
              >
                Open Sandbox (/testdev)
              </button>
            )}
            <div className="pt-2 border-t border-line flex gap-2">
              <button
                onClick={() => handleOpenAuth('login')}
                className="flex-1 py-2 rounded-xl border border-line text-ink text-center"
              >
                Sign In
              </button>
              <button
                onClick={() => handleOpenAuth('register')}
                className="flex-1 py-2 rounded-xl bg-accent text-white text-center"
              >
                Create Account
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── 2. Hero Section ────────────────────────────────────────────────── */}
      <section className="pt-16 pb-14 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Tag Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-line shadow-xs">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-sub">
              Engineered for Cooperative Training Trainees
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-ink leading-[1.15]">
            The Modern Standard for <br className="hidden sm:block" />
            <span className="text-accent">Cooperative Training Reports</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-sub max-w-2xl mx-auto leading-relaxed">
            Document daily technical tasks, organize your 14-week curriculum milestones, and automatically produce publication-grade final reports, formal documentation, and defense presentation decks.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleFastDemoLogin}
              disabled={demoLoading}
              className="px-6 py-3 rounded-xl bg-accent text-white font-extrabold text-sm hover:bg-accent/90 transition-all shadow-md hover:shadow-lg flex items-center gap-2 hover:scale-[1.01]"
            >
              <span>{demoLoading ? 'Initializing...' : 'Launch Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleOpenAuth('login')}
              className="px-6 py-3 rounded-xl bg-card border border-line text-ink font-extrabold text-sm hover:bg-surface transition-all shadow-xs"
            >
              Sign In to Existing Account
            </button>

            {onOpenTestDev && (
              <button
                onClick={handleOpenSandbox}
                className="px-5 py-3 rounded-xl bg-surface border border-line text-sub hover:text-accent font-bold text-sm transition-all flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-accent" />
                <span>Open /testdev Lab</span>
              </button>
            )}
          </div>

          {/* Authentic Core Highlights */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3 bg-card border border-line rounded-xl">
              <div className="text-xs font-bold text-sub">Curriculum Track</div>
              <div className="text-sm font-black text-ink mt-0.5">14 Training Weeks</div>
            </div>
            <div className="p-3 bg-card border border-line rounded-xl">
              <div className="text-xs font-bold text-sub">Academic Credit</div>
              <div className="text-sm font-black text-ink mt-0.5">2 Credit Hours GPA</div>
            </div>
            <div className="p-3 bg-card border border-line rounded-xl">
              <div className="text-xs font-bold text-sub">Office Exports</div>
              <div className="text-sm font-black text-ink mt-0.5">Word & PowerPoint</div>
            </div>
            <div className="p-3 bg-card border border-line rounded-xl">
              <div className="text-xs font-bold text-sub">Language Engine</div>
              <div className="text-sm font-black text-ink mt-0.5">Arabic & English</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Interactive Report & Presentation Showcase ─────────────────── */}
      <section id="preview" className="py-12 px-4 sm:px-6 bg-surface border-y border-line">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Institutional Deliverables, Generated in One Click
            </h2>
            <p className="text-xs sm:text-sm text-sub">
              Inspect the exact documents generated by the platform for academic committee review and formal defense.
            </p>
          </div>

          {/* Interactive Preview Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-card border border-line rounded-xl gap-1">
              <button
                onClick={() => setActivePreviewTab('report')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePreviewTab === 'report'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-sub hover:text-ink'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Final Report (DOCX & PDF)</span>
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
                <span>Defense Slides (PPTX)</span>
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
                <span>14-Week Curriculum View</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Final Report Preview */}
          {activePreviewTab === 'report' && (
            <div className="bg-card border border-line rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in text-left">
              {/* Report Header Simulation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-line gap-4">
                <div>
                  <div className="text-xs font-extrabold uppercase text-accent tracking-wider">
                    Institutional Standard Document
                  </div>
                  <h3 className="text-lg font-black text-ink mt-0.5">
                    Cooperative Training Final Technical Report
                  </h3>
                  <div className="text-xs text-sub mt-1">
                    Format: Genuine Microsoft Word (.docx) & High-Resolution Print PDF
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-ok-bg text-ok">
                    Ready for Defense
                  </span>
                </div>
              </div>

              {/* Simulated Paper Sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Section A: Cover & Academic Info */}
                <div className="p-4 bg-surface border border-line rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-sub font-bold">
                    <span>1. Formal Cover Page</span>
                    <Award className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-sub leading-relaxed">
                    Official academic header, trainee registration credentials, host enterprise details, academic semester, and 2-credit-hour GPA notation.
                  </p>
                  <div className="pt-2 border-t border-line text-[11px] text-muted">
                    No placeholder text • Standard margins
                  </div>
                </div>

                {/* Section B: Narrative Table of Contents */}
                <div className="p-4 bg-surface border border-line rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-sub font-bold">
                    <span>2. Narrative Indexing</span>
                    <BookOpen className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-sub leading-relaxed">
                    Technical topic titles for each of the 14 weeks (e.g. "Week 3: Firewall Configuration & Security Policies") instead of raw clock-in hours.
                  </p>
                  <div className="pt-2 border-t border-line text-[11px] text-muted">
                    Hierarchical page numbers & dots
                  </div>
                </div>

                {/* Section C: Field Evidence & Sign-off */}
                <div className="p-4 bg-surface border border-line rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-sub font-bold">
                    <span>3. Field Evidence & Signatures</span>
                    <Camera className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-sub leading-relaxed">
                    Embedded server room documentation and workflow photographs with formal figure numbering, alongside official workplace supervisor rating blocks.
                  </p>
                  <div className="pt-2 border-t border-line text-[11px] text-muted">
                    Supervisor sign-off block on each week
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Defense Slides Preview */}
          {activePreviewTab === 'slides' && (
            <div className="bg-card border border-line rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-line gap-4">
                <div>
                  <div className="text-xs font-extrabold uppercase text-accent tracking-wider">
                    Executive Defense Slides
                  </div>
                  <h3 className="text-lg font-black text-ink mt-0.5">
                    16:9 Widescreen PowerPoint Presentation (.pptx)
                  </h3>
                  <div className="text-xs text-sub mt-1">
                    Tailored for formal university and committee defense presentations
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-accent-dim text-accent">
                  Native .PPTX Export
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="text-[11px] font-extrabold text-accent">Slide 1</div>
                  <div className="font-bold text-ink">Title & Trainee Profile</div>
                  <p className="text-sub text-[11px]">Academic crest, training period, major, and host entity identity.</p>
                </div>
                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="text-[11px] font-extrabold text-accent">Slide 2</div>
                  <div className="font-bold text-ink">Enterprise Architecture</div>
                  <p className="text-sub text-[11px]">Department structure, technical environment, and trainee role.</p>
                </div>
                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="text-[11px] font-extrabold text-accent">Slides 3-6</div>
                  <div className="font-bold text-ink">14-Week Key Milestones</div>
                  <p className="text-sub text-[11px]">Phase-by-phase technical activities, tools used, and deliverables.</p>
                </div>
                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="text-[11px] font-extrabold text-accent">Slide 7</div>
                  <div className="font-bold text-ink">Evidence & Conclusions</div>
                  <p className="text-sub text-[11px]">Visual documentation, acquired competencies, and closing remarks.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Curriculum View */}
          {activePreviewTab === 'curriculum' && (
            <div className="bg-card border border-line rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-line gap-4">
                <div>
                  <div className="text-xs font-extrabold uppercase text-accent tracking-wider">
                    Complete Academic Roadmap
                  </div>
                  <h3 className="text-lg font-black text-ink mt-0.5">
                    14-Week Structured Training Schedule
                  </h3>
                  <div className="text-xs text-sub mt-1">
                    Total course value: 2 Credit Hours in Cumulative GPA
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-surface border border-line rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[10px]">1</span>
                    <span className="font-bold text-ink">Orientation, Enterprise Environment & Security Policies</span>
                  </div>
                  <span className="text-sub font-semibold">Week 1 • Foundational</span>
                </div>
                <div className="p-3 bg-surface border border-line rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[10px]">5</span>
                    <span className="font-bold text-ink">Network Infrastructure, Routers & Firewall Configuration</span>
                  </div>
                  <span className="text-sub font-semibold">Week 5 • Technical Core</span>
                </div>
                <div className="p-3 bg-surface border border-line rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[10px]">10</span>
                    <span className="font-bold text-ink">Database Administration, Data Backup & Disaster Recovery</span>
                  </div>
                  <span className="text-sub font-semibold">Week 10 • Advanced Ops</span>
                </div>
                <div className="p-3 bg-surface border border-line rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[10px]">14</span>
                    <span className="font-bold text-ink">Final Knowledge Transfer, Project Handover & Evaluation</span>
                  </div>
                  <span className="text-sub font-semibold">Week 14 • Concluding</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 4. Core Features Grid ─────────────────────────────────────────── */}
      <section id="features" className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Engineered for Rigorous Academic Review
            </h2>
            <p className="text-xs sm:text-sm text-sub">
              Everything required to complete, document, and defend your cooperative training period without manual formatting headaches.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {/* Feature 1 */}
            <div className="p-5 bg-card border border-line rounded-2xl space-y-3 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-ink">Narrative Academic Chapters</h3>
              <p className="text-xs text-sub leading-relaxed">
                Transforms everyday work notes into coherent academic narrative chapters with descriptive weekly topic headers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 bg-card border border-line rounded-2xl space-y-3 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-ink">Field Evidence Proof</h3>
              <p className="text-xs text-sub leading-relaxed">
                Easily attach workplace photos, datacenter configurations, and system diagrams with automated figure indexing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 bg-card border border-line rounded-2xl space-y-3 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
                <Printer className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-ink">Native Office Exports</h3>
              <p className="text-xs text-sub leading-relaxed">
                One-click export to native Microsoft Word (.docx), print-ready PDF, and PowerPoint (.pptx) presentation decks.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 bg-card border border-line rounded-2xl space-y-3 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-ink">Bilingual Dual Engine</h3>
              <p className="text-xs text-sub leading-relaxed">
                Switch preview and final documents between Arabic and English with automated academic terminology mapping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Simple 3-Step Process ──────────────────────────────────────── */}
      <section id="curriculum" className="py-14 px-4 sm:px-6 bg-surface border-y border-line">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              How the Platform Works
            </h2>
            <p className="text-xs sm:text-sm text-sub">
              From day one of training to final committee defense in three structured stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-card border border-line rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">
                01
              </div>
              <h3 className="text-sm font-extrabold text-ink">Log Daily Tasks</h3>
              <p className="text-xs text-sub leading-relaxed">
                Record your daily achievements, assign technical categories, and specify dates within the active week.
              </p>
            </div>

            <div className="p-6 bg-card border border-line rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">
                02
              </div>
              <h3 className="text-sm font-extrabold text-ink">Attach Field Photos</h3>
              <p className="text-xs text-sub leading-relaxed">
                Upload photos of your workspace, server racks, network topologies, and technical setups with descriptive captions.
              </p>
            </div>

            <div className="p-6 bg-card border border-line rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">
                03
              </div>
              <h3 className="text-sm font-extrabold text-ink">Generate & Defend</h3>
              <p className="text-xs text-sub leading-relaxed">
                Download your completed 20+ page Word report, PDF document, and defense presentation deck ready for faculty evaluation.
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
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-sub">
              Everything you need to know about academic standards, export compatibility, and workflow.
            </p>
          </div>

          <div className="space-y-3 text-left">
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
                    className="w-full p-4 text-left text-xs sm:text-sm font-extrabold text-ink flex items-center justify-between gap-4 hover:bg-surface transition-colors"
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

      {/* ── 7. Bottom CTA Banner ──────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 bg-surface border-t border-line">
        <div className="max-w-4xl mx-auto p-8 sm:p-10 bg-card border border-line rounded-3xl text-center space-y-5 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-dim text-accent text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Academic Excellence</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-ink tracking-tight">
            Ready to Complete Your Co-op Documentation?
          </h2>

          <p className="text-xs sm:text-sm text-sub max-w-lg mx-auto leading-relaxed">
            Start structuring your 14-week cooperative training report today with immediate export to Word, PDF, and PowerPoint.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleFastDemoLogin}
              disabled={demoLoading}
              className="px-6 py-3 rounded-xl bg-accent text-white font-extrabold text-sm hover:bg-accent/90 transition-all shadow-md flex items-center gap-2"
            >
              <span>{demoLoading ? 'Launching...' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenAuth('login')}
              className="px-6 py-3 rounded-xl bg-surface border border-line text-ink font-bold text-sm hover:bg-line transition-all"
            >
              Sign In
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
          <div className="text-center sm:text-left">
            Aligned with Saudi University and TVTC Cooperative Training Curricula (2 Credit Hours in GPA).
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
