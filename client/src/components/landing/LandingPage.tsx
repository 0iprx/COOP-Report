import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthScreen } from '../auth/AuthScreen';
import {
  Sparkles,
  FileText,
  Presentation,
  CheckCircle2,
  ChevronDown,
  X,
  Menu,
  Download,
  Layers,
  Award,
  Camera,
  ArrowRight,
  Printer,
  Calendar,
  BookOpen,
  Sliders,
  ArrowUpRight,
  Check,
  BookmarkCheck,
  Search,
  FolderPlus
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
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-md bg-surface text-sub font-bold border border-line">
                  Co-op Assistant
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-sub">
            <a href="#how-it-helps" className="hover:text-ink transition-colors">How It Helps</a>
            <a href="#timeline" className="hover:text-ink transition-colors">14 Weeks Tracking</a>
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
            <a href="#how-it-helps" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sub hover:text-ink">How It Helps</a>
            <a href="#timeline" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sub hover:text-ink">14 Weeks Tracking</a>
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-line shadow-xs">
            <BookmarkCheck className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px] font-bold text-sub">
              Your Assistant for Cooperative Training Logging & Report Writing
            </span>
          </div>

          {/* Honest, Clear Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-ink leading-[1.15]">
            Log, Remember, and Write Your <br className="hidden sm:block" />
            <span className="text-accent">Co-Op Reports with Ease</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-sub max-w-2xl mx-auto leading-relaxed">
            Never lose track of your daily training tasks. A focused workspace designed to help you categorize activities, remember technical achievements, and assemble weekly and final reports without stress.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleFastDemoLogin}
              disabled={demoLoading}
              className="px-6 py-3 rounded-xl bg-accent text-white font-extrabold text-sm hover:bg-accent/90 transition-all shadow-md hover:shadow-lg flex items-center gap-2 hover:scale-[1.01]"
            >
              <span>{demoLoading ? 'Initializing...' : 'Start Logging Tasks'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleOpenAuth('login')}
              className="px-6 py-3 rounded-xl bg-card border border-line text-ink font-extrabold text-sm hover:bg-surface transition-all shadow-xs"
            >
              Sign In
            </button>

            {onOpenTestDev && (
              <button
                onClick={handleOpenSandbox}
                className="px-5 py-3 rounded-xl bg-surface border border-line text-sub hover:text-accent font-bold text-sm transition-all flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-accent" />
                <span>Sandbox (/testdev)</span>
              </button>
            )}
          </div>

          {/* Practical Value Highlights */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3 bg-card border border-line rounded-xl">
              <div className="text-xs font-bold text-sub">Daily Memory</div>
              <div className="text-sm font-black text-ink mt-0.5">Never Forget a Day</div>
            </div>
            <div className="p-3 bg-card border border-line rounded-xl">
              <div className="text-xs font-bold text-sub">14-Week Setup</div>
              <div className="text-sm font-black text-ink mt-0.5">Organized Timeline</div>
            </div>
            <div className="p-3 bg-card border border-line rounded-xl">
              <div className="text-xs font-bold text-sub">Word & PowerPoint</div>
              <div className="text-sm font-black text-ink mt-0.5">Editable Office Files</div>
            </div>
            <div className="p-3 bg-card border border-line rounded-xl">
              <div className="text-xs font-bold text-sub">Language Choice</div>
              <div className="text-sm font-black text-ink mt-0.5">Arabic & English</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Four Core Practical Capabilities ────────────────────────────── */}
      <section id="how-it-helps" className="py-14 px-4 sm:px-6 bg-surface border-y border-line">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Designed to Keep You Organized from Day One
            </h2>
            <p className="text-xs sm:text-sm text-sub">
              No complicated setups. Just a clear way to track your work, categorize your tasks, and generate your report files.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {/* Card 1 */}
            <div className="p-5 bg-card border border-line rounded-2xl space-y-3 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-ink">Never Forget a Task</h3>
              <p className="text-xs text-sub leading-relaxed">
                Log activities on the day they happen. Store what you learned, tools you used, and problems you solved so you never lose the details.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-5 bg-card border border-line rounded-2xl space-y-3 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-ink">Categorize Your Work</h3>
              <p className="text-xs text-sub leading-relaxed">
                Group tasks into categories like programming, networks, information security, tech support, or documentation for clear organization.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-5 bg-card border border-line rounded-2xl space-y-3 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-ink">Store Evidence Photos</h3>
              <p className="text-xs text-sub leading-relaxed">
                Keep visual records of your workspace, server racks, configurations, and diagrams neatly attached to each specific week.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-5 bg-card border border-line rounded-2xl space-y-3 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
                <Printer className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-ink">Generate Reports & Slides</h3>
              <p className="text-xs text-sub leading-relaxed">
                Export cleanly structured Word (.docx) reports, PDF drafts, and defense presentation slides (.pptx) with a single click.
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
              What the Platform Generates for You
            </h2>
            <p className="text-xs sm:text-sm text-sub">
              Preview the draft reports, defense slides, and 14-week tracking timeline generated from your daily logs.
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
                <span>Report Draft (DOCX & PDF)</span>
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
                <span>14-Week Schedule</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Final Report Preview */}
          {activePreviewTab === 'report' && (
            <div className="bg-card border border-line rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-line gap-4">
                <div>
                  <div className="text-xs font-bold text-accent uppercase tracking-wider">
                    Full Co-op Report Draft
                  </div>
                  <h3 className="text-lg font-black text-ink mt-0.5">
                    Cooperative Training Technical Report
                  </h3>
                  <div className="text-xs text-sub mt-1">
                    Outputs editable Microsoft Word (.docx) and high-resolution PDF
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface border border-line text-sub">
                  Editable Word Document
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="font-bold text-ink flex items-center justify-between">
                    <span>1. Title & Details</span>
                    <BookOpen className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-sub leading-relaxed">
                    Student name, major, host company profile, training period, and 2-credit-hour GPA notation.
                  </p>
                </div>

                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="font-bold text-ink flex items-center justify-between">
                    <span>2. Narrative Indexing</span>
                    <Sliders className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-sub leading-relaxed">
                    Clear technical topic headers for each of the 14 training weeks instead of plain mechanical hour tables.
                  </p>
                </div>

                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="font-bold text-ink flex items-center justify-between">
                    <span>3. Photo Evidence</span>
                    <Camera className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-sub leading-relaxed">
                    Workplace and technical photos embedded with captions, plus dedicated review signature boxes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Defense Slides Preview */}
          {activePreviewTab === 'slides' && (
            <div className="bg-card border border-line rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-line gap-4">
                <div>
                  <div className="text-xs font-bold text-accent uppercase tracking-wider">
                    Defense Presentation Deck
                  </div>
                  <h3 className="text-lg font-black text-ink mt-0.5">
                    16:9 Widescreen PowerPoint Presentation (.pptx)
                  </h3>
                  <div className="text-xs text-sub mt-1">
                    Structured slides ready for your committee discussion
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface border border-line text-sub">
                  PowerPoint (.pptx)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="text-[11px] font-extrabold text-accent">Slide 1</div>
                  <div className="font-bold text-ink">Title & Trainee Profile</div>
                  <p className="text-sub text-[11px]">Training timeline, major, and host company identity.</p>
                </div>
                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="text-[11px] font-extrabold text-accent">Slide 2</div>
                  <div className="font-bold text-ink">Company Overview</div>
                  <p className="text-sub text-[11px]">Host department structure and trainee responsibilities.</p>
                </div>
                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="text-[11px] font-extrabold text-accent">Slides 3-6</div>
                  <div className="font-bold text-ink">14-Week Highlights</div>
                  <p className="text-sub text-[11px]">Weekly breakdown of technical tasks and milestones.</p>
                </div>
                <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                  <div className="text-[11px] font-extrabold text-accent">Slide 7</div>
                  <div className="font-bold text-ink">Photos & Conclusion</div>
                  <p className="text-sub text-[11px]">Key takeaways, skills learned, and closing thoughts.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Curriculum View */}
          {activePreviewTab === 'curriculum' && (
            <div className="bg-card border border-line rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-line gap-4">
                <div>
                  <div className="text-xs font-bold text-accent uppercase tracking-wider">
                    Full Training Timeline
                  </div>
                  <h3 className="text-lg font-black text-ink mt-0.5">
                    14 Structured Training Weeks
                  </h3>
                  <div className="text-xs text-sub mt-1">
                    Easily jump between weeks, edit days, and attach photos
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-surface border border-line rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[10px]">1</span>
                    <span className="font-bold text-ink">Orientation, Enterprise Environment & Security Policies</span>
                  </div>
                  <span className="text-sub font-semibold">Week 1</span>
                </div>
                <div className="p-3 bg-surface border border-line rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[10px]">5</span>
                    <span className="font-bold text-ink">Network Infrastructure, Routers & Firewall Configuration</span>
                  </div>
                  <span className="text-sub font-semibold">Week 5</span>
                </div>
                <div className="p-3 bg-surface border border-line rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[10px]">10</span>
                    <span className="font-bold text-ink">Database Administration, Data Backup & Maintenance</span>
                  </div>
                  <span className="text-sub font-semibold">Week 10</span>
                </div>
                <div className="p-3 bg-surface border border-line rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[10px]">14</span>
                    <span className="font-bold text-ink">Knowledge Transfer, Project Handover & Review</span>
                  </div>
                  <span className="text-sub font-semibold">Week 14</span>
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
              Simple 3-Step Routine
            </h2>
            <p className="text-xs sm:text-sm text-sub">
              A straightforward habit that makes writing your final report completely effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-card border border-line rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">
                01
              </div>
              <h3 className="text-sm font-extrabold text-ink">Log Your Tasks</h3>
              <p className="text-xs text-sub leading-relaxed">
                Take two minutes at the end of each training day to write down what you accomplished and pick a category.
              </p>
            </div>

            <div className="p-6 bg-card border border-line rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">
                02
              </div>
              <h3 className="text-sm font-extrabold text-ink">Attach Photos</h3>
              <p className="text-xs text-sub leading-relaxed">
                Add workspace setups, system photos, and diagram captures to keep visual evidence organized by week.
              </p>
            </div>

            <div className="p-6 bg-card border border-line rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">
                03
              </div>
              <h3 className="text-sm font-extrabold text-ink">Download & Review</h3>
              <p className="text-xs text-sub leading-relaxed">
                Export your structured Word document and presentation slides whenever you need to submit or present.
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
              Everything you need to know about logging your training and exporting your files.
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

      {/* ── 7. Bottom Action Banner ────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 bg-surface border-t border-line">
        <div className="max-w-4xl mx-auto p-8 sm:p-10 bg-card border border-line rounded-3xl text-center space-y-5 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-line text-sub text-xs font-bold">
            <FolderPlus className="w-3.5 h-3.5 text-accent" />
            <span>Co-Op Documentation Assistant</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-ink tracking-tight">
            Keep Your Co-op Training Organized Today
          </h2>

          <p className="text-xs sm:text-sm text-sub max-w-lg mx-auto leading-relaxed">
            Start recording your daily activities now so you never have to struggle remembering past weeks.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleFastDemoLogin}
              disabled={demoLoading}
              className="px-6 py-3 rounded-xl bg-accent text-white font-extrabold text-sm hover:bg-accent/90 transition-all shadow-md flex items-center gap-2"
            >
              <span>{demoLoading ? 'Launching...' : 'Start Logging Tasks'}</span>
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
            A personal assistant for trainees to record, classify, and draft co-op training reports without forgetting details.
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
