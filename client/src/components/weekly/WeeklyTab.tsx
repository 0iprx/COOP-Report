import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { FinalReportData, EntryDTO, formatDateArabic, formatDateEnglish, calculateHoursBetween, generateAcademicWeeklySynthesis, formatWeekPeriod, ENTRY_CATEGORIES } from '@coop/shared';
import { WeeklyEvidenceSection } from './WeeklyEvidenceSection';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Copy,
  Download,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  Plus,
  Sparkles,
  X,
  Save,
  CheckCircle,
  Languages,
  FileText,
  CheckCheck,
  Printer,
  RotateCcw,
  History
} from 'lucide-react';
import { DiffModal } from '../common/DiffModal';

const CATEGORIES = ENTRY_CATEGORIES;

export const WeeklyTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { lang, isAr, t } = useLanguage();
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadingPptx, setDownloadingPptx] = useState<boolean>(false);
  const [downloadingDocx, setDownloadingDocx] = useState<boolean>(false);
  const [isAuditingWeek, setIsAuditingWeek] = useState<boolean>(false);

  // Edit / Add Day Modal State
  const [editingEntry, setEditingEntry] = useState<Partial<EntryDTO> | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [aiPolishing, setAiPolishing] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string>('');
  const [errorToast, setErrorToast] = useState<string>('');
  const [revisionsModalOpen, setRevisionsModalOpen] = useState<boolean>(false);
  const [activeEntryForRevisions, setActiveEntryForRevisions] = useState<any>(null);
  const [entryRevisionsList, setEntryRevisionsList] = useState<any[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch final report to get the full academic schedule of all 14 weeks
  const { data: finalReportData } = useQuery<FinalReportData>({
    queryKey: ['finalReport'],
    queryFn: async () => {
      const res = await api.get('/reports/final');
      return res.data;
    }
  });

  const weeksList = finalReportData?.weeks || [];
  const entityName = finalReportData?.profile?.entityAddress || (isAr ? 'جهة التدريب' : 'Host Organization');

  // Set default selected week to first week or current active
  useEffect(() => {
    if (weeksList.length > 0 && !selectedWeek) {
      const activeWeek = weeksList.find((w) => w.entries.length > 0) || weeksList[0];
      setSelectedWeek(activeWeek.weekStart);
    }
  }, [weeksList, selectedWeek]);

  // Fetch weekly report data for selected week
  const { data: weekReport, isLoading } = useQuery({
    queryKey: ['weekly', selectedWeek],
    queryFn: async () => {
      if (!selectedWeek) return null;
      const res = await api.get(`/reports/weekly?week=${selectedWeek}`);
      return res.data;
    },
    enabled: !!selectedWeek
  });

  const currentWeekObj = weeksList.find((w) => w.weekStart === selectedWeek);
  const currentIndex = weeksList.findIndex((w) => w.weekStart === selectedWeek);
  const prevWeek = currentIndex > 0 ? weeksList[currentIndex - 1] : null;
  const nextWeek = currentIndex < weeksList.length - 1 && currentIndex !== -1 ? weeksList[currentIndex + 1] : null;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const handleCopyText = () => {
    if (!weekReport) return;
    let text = isAr
      ? `تقرير الأسبوع التدريبي: ${formatDateArabic(weekReport.weekStart)} — ${formatDateArabic(weekReport.weekEnd)}\nجهة التدريب: ${entityName}\n\n`
      : `Weekly Training Report: ${formatDateEnglish(weekReport.weekStart)} — ${formatDateEnglish(weekReport.weekEnd)}\nOrganization: ${entityName}\n\n`;

    if (weekReport.entries?.length) {
      weekReport.entries.forEach((e: EntryDTO) => {
        const d = isAr ? formatDateArabic(e.entryDate) : formatDateEnglish(e.entryDate);
        text += `• ${d}: ${e.title} [${e.category}]\n  ${e.description}\n\n`;
      });
      text += isAr
        ? `إجمالي الأيام: ${weekReport.totalDays} | عدد المهام المنجزة: ${weekReport.totalTasks}`
        : `Total Days: ${weekReport.totalDays} | Completed Tasks: ${weekReport.totalTasks}`;
    } else {
      text += isAr ? `(أسبوع تدريبي مؤجل أو لم تسجل به مهام بعد)` : `(Postponed or pending training week)`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!weekReport) return;
    const start = isAr ? formatDateArabic(weekReport.weekStart) : formatDateEnglish(weekReport.weekStart);
    const end = isAr ? formatDateArabic(weekReport.weekEnd) : formatDateEnglish(weekReport.weekEnd);

    let md = `# ${isAr ? 'تقرير الأسبوع التدريبي' : 'Weekly Training Report'} (${start} — ${end})\n\n`;
    md += `**${isAr ? 'الجهة:' : 'Organization:'}** ${entityName}  \n`;
    md += `**${isAr ? 'أيام العمل:' : 'Work Days:'}** ${weekReport.totalDays || 0}  \n`;
    md += `**${isAr ? 'المهام المنجزة:' : 'Completed Tasks:'}** ${weekReport.totalTasks || 0}  \n\n`;
    md += `## ${isAr ? 'جدول المهام والإنجازات الميدانية' : 'Weekly Technical Tasks'}\n\n`;
    md += `| ${isAr ? 'التاريخ' : 'Date'} | ${isAr ? 'العنوان' : 'Title'} | ${isAr ? 'التصنيف' : 'Category'} | ${isAr ? 'تفاصيل الإنجاز والسرد الأكاديمي' : 'Details'} |\n`;
    md += `|---|---|---|---|\n`;

    if (weekReport.entries?.length) {
      weekReport.entries.forEach((e: EntryDTO) => {
        const d = isAr ? formatDateArabic(e.entryDate) : formatDateEnglish(e.entryDate);
        md += `| ${d} | ${e.title} | ${e.category} | ${e.description.replace(/\n/g, ' ')} |\n`;
      });
    } else {
      md += `| — | ${isAr ? 'أسبوع تدريبي مؤجل أو متاح للتوثيق لاحقاً' : 'Pending or postponed week'} | — | — |\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Weekly_Report_${selectedWeek}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocx = async () => {
    try {
      setDownloadingDocx(true);
      const res = await api.get(`/reports/weekly/export/docx?week=${selectedWeek}&lang=${lang}`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Weekly_Report_${currentWeekObj ? currentWeekObj.weekIndex : selectedWeek}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert(t('تعذر تحميل مستند Word للأسبوع، يرجى المحاولة لاحقاً', 'Failed to export weekly Word report.'));
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleAuditPolishWeek = async () => {
    if (!weekReport?.entries?.length) return;
    try {
      setIsAuditingWeek(true);
      const res = await api.post(`/reports/weekly/audit-polish?week=${selectedWeek}`);
      queryClient.invalidateQueries({ queryKey: ['weekly', selectedWeek] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setSaveToast(res.data.message || t('تم تدقيق وإعادة صياغة الأسبوع وترقية تصنيفاته بنجاح!', 'Weekly tasks polished and classified!'));
      setTimeout(() => setSaveToast(''), 4000);
    } catch {
      setErrorToast(t('تعذر تدقيق وإعادة صياغة مهام الأسبوع، يرجى المحاولة لاحقاً', 'Failed to audit week'));
      setTimeout(() => setErrorToast(''), 3500);
    } finally {
      setIsAuditingWeek(false);
    }
  };

  const handleDownloadPresentation = async () => {
    try {
      setDownloadingPptx(true);
      const res = await api.get('/reports/export/presentation', { responseType: 'blob' });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `عرض_مناقشة_${entityName.replace(/\s+/g, '_')}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert(t('تعذر تحميل عرض PowerPoint، يرجى المحاولة لاحقاً', 'Unable to download PowerPoint presentation.'));
    } finally {
      setDownloadingPptx(false);
    }
  };

  // Open Edit Modal for existing entry
  const handleOpenEdit = (entry: EntryDTO) => {
    setEditingEntry({
      id: entry.id,
      title: entry.title,
      entryDate: entry.entryDate,
      category: entry.category,
      timeFrom: entry.timeFrom || '08:00',
      timeTo: entry.timeTo || '16:00',
      description: entry.description
    });
    const isCustom = entry.category && !CATEGORIES.includes(entry.category as any);
    setIsCustomCategory(!!isCustom);
    setCustomCategory(isCustom ? (entry.category as string) : '');
    setIsEditModalOpen(true);
  };

  // Open Modal to Add a new Day/Task for the current week
  const handleOpenAddDay = () => {
    setEditingEntry({
      title: '',
      entryDate: selectedWeek || new Date().toISOString().split('T')[0],
      category: 'تطوير / برمجة',
      timeFrom: '08:00',
      timeTo: '16:00',
      description: ''
    });
    setIsCustomCategory(false);
    setCustomCategory('');
    setIsEditModalOpen(true);
  };

  // Save changes to backend
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry?.title?.trim() || !editingEntry?.description?.trim()) {
      setErrorToast(t('يرجى كتابة عنوان المهمة والتفاصيل اليومية', 'Please enter task title and description'));
      setTimeout(() => setErrorToast(''), 3000);
      return;
    }
    if (isCustomCategory && !customCategory.trim()) {
      setErrorToast(t('يرجى كتابة اسم التصنيف المخصص أو اختيار تصنيف من القائمة', 'Please enter a custom category name'));
      setTimeout(() => setErrorToast(''), 3000);
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : (editingEntry.category || 'تطوير / برمجة');
    const entryPayload = {
      ...editingEntry,
      category: finalCategory
    };

    try {
      if (entryPayload.id) {
        await api.put(`/entries/${entryPayload.id}`, entryPayload);
      } else {
        await api.post('/entries', entryPayload);
      }
      queryClient.invalidateQueries({ queryKey: ['weekly', selectedWeek] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setSaveToast(t('تم حفظ وتحديث السجل الميداني بنجاح', 'Task saved and updated successfully'));
      setTimeout(() => setSaveToast(''), 3500);
      setIsEditModalOpen(false);
      setEditingEntry(null);
    } catch {
      setErrorToast(t('تعذر حفظ التعديل، يرجى المحاولة لاحقاً', 'Failed to save changes'));
      setTimeout(() => setErrorToast(''), 3500);
    }
  };

  // Delete an entry
  const handleDeleteEntry = async (id: number) => {
    if (!window.confirm(t('هل أنت متأكد من حذف هذه المهمة من سجل الأسبوع؟', 'Are you sure you want to delete this task?'))) return;
    try {
      await api.delete(`/entries/${id}`);
      queryClient.invalidateQueries({ queryKey: ['weekly', selectedWeek] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setSaveToast(t('تم حذف المهمة من سجل الأسبوع', 'Task deleted successfully'));
      setTimeout(() => setSaveToast(''), 3000);
    } catch {
      setErrorToast(t('تعذر حذف المهمة', 'Failed to delete task'));
      setTimeout(() => setErrorToast(''), 3000);
    }
  };

  // Rollback revision mutation
  const rollbackMutation = useMutation({
    mutationFn: async ({ entryId, revId }: { entryId: number; revId: number }) => {
      const res = await api.post(`/entries/${entryId}/revisions/${revId}/rollback`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly', selectedWeek] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setRevisionsModalOpen(false);
      setSaveToast(t('تم التراجع عن التعديل واستعادة النسخة السابقة بنجاح!', 'Rolled back to previous revision!'));
      setTimeout(() => setSaveToast(''), 3000);
    },
    onError: () => {
      setErrorToast(t('تعذر التراجع عن التعديل واستعادة النسخة', 'Failed to roll back'));
      setTimeout(() => setErrorToast(''), 3000);
    }
  });

  const handleOpenRevisions = async (entry: any) => {
    setActiveEntryForRevisions(entry);
    setRevisionsModalOpen(true);

    // Instant offline/cached fallback so revisions display immediately
    const cacheKey = `coop_entry_revs_${entry.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setEntryRevisionsList(JSON.parse(cached));
      } catch {}
    }

    try {
      const res = await api.get(`/entries/${entry.id}/revisions`);
      const revs = res.data.revisions || [];
      setEntryRevisionsList(revs);
      localStorage.setItem(cacheKey, JSON.stringify(revs));
    } catch {
      if (!cached) {
        setErrorToast(t('تعذر تحميل سجل التعديلات من الخادم', 'Failed to load revisions from server'));
        setTimeout(() => setErrorToast(''), 3000);
      }
    }
  };

  // Helper to render procedural narrative with structured bullets and headers
  const renderProceduralNarrative = (text: string) => {
    if (!text) return null;
    const clean = text.replace(/^[ \t]*[-_=]{3,}[ \t]*$/gm, '\n');
    const lines = clean.split('\n');
    const elements: React.ReactNode[] = [];
    let currentBullets: string[] = [];

    const flushBullets = () => {
      if (currentBullets.length > 0) {
        elements.push(
          <ul key={`bullets-${elements.length}`} className="my-2 space-y-1.5 list-none pr-1">
            {currentBullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed text-ink">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C0102A] mt-2 shrink-0"></span>
                <span className="flex-1">{b}</span>
              </li>
            ))}
          </ul>
        );
        currentBullets = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed) {
        flushBullets();
        continue;
      }

      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /\*\s*$/.test(trimmed)) {
        const cleanItem = trimmed.replace(/^[•\-\*]\s*|\s*\*$/g, '').trim();
        currentBullets.push(cleanItem);
        continue;
      }

      if (
        (trimmed.startsWith('**') && trimmed.endsWith('**')) ||
        /^(في تمام الساعة|بعد الساعة|الساعة|قسم|فريق|مرحلة|منظومة|موجز)\s*[\d:]*.*:?$/i.test(trimmed)
      ) {
        flushBullets();
        const title = trimmed.replace(/^\*\*|\*\*$/g, '').replace(/:$/, '').trim();
        elements.push(
          <h5 key={`heading-${elements.length}`} className="font-extrabold text-xs sm:text-sm text-ink pt-2.5 pb-1 border-b border-line/40 flex items-center gap-1.5">
            <span className="w-1 h-3.5 bg-accent rounded-full shrink-0"></span>
            <span>{title}</span>
          </h5>
        );
        continue;
      }

      flushBullets();
      elements.push(
        <p key={`p-${elements.length}`} className="text-xs sm:text-sm leading-relaxed text-ink my-1">
          {trimmed}
        </p>
      );
    }

    flushBullets();
    return <div className="space-y-0.5 text-start">{elements}</div>;
  };

  // AI Enhancement State for Day Editing Modal
  const [diffModalOpen, setDiffModalOpen] = useState<boolean>(false);
  const [diffTitle, setDiffTitle] = useState<string>('');
  const [originalText, setOriginalText] = useState<string>('');
  const [improvedText, setImprovedText] = useState<string>('');
  const [diffChunks, setDiffChunks] = useState<any[]>([]);

  // AI Actions Handler (Polish, Spellcheck, Summarize, Translate)
  const handleAIAction = async (action: 'polish' | 'spellcheck' | 'summarize' | 'translate') => {
    if (!editingEntry?.description?.trim()) return;
    setAiPolishing(true);

    const actionTitles: Record<string, string> = {
      polish: t('تنقيح وصياغة أكاديمية رصينة', 'Academic Polishing & Refinement'),
      spellcheck: t('تصحيح إملائي ونحوي دقيق', 'Grammar & Spell Check'),
      summarize: t('اختصار وإيجاز فني مكثف', 'Concise Technical Summary'),
      translate: t('ترجمة فورية للإنجليزية الأكاديمية', 'Academic English Translation')
    };

    const activeCat = isCustomCategory ? (customCategory.trim() || 'أخرى') : (editingEntry.category || '');

    try {
      const res = await api.post('/ai/process', {
        text: editingEntry.description,
        action,
        targetLang: action === 'translate' ? (isAr ? 'en' : 'ar') : 'ar',
        context: `Task: ${editingEntry.title || ''} | Category: ${activeCat}`
      });

      setDiffTitle(actionTitles[action] || t('معالجة النص', 'Text Processing'));
      setOriginalText(editingEntry.description);
      setImprovedText(res.data.result);
      setDiffChunks(res.data.diff || []);
      setDiffModalOpen(true);
    } catch {
      setErrorToast(t('تعذر معالجة النص ذكياً، يرجى المحاولة لاحقاً', 'AI processing failed'));
      setTimeout(() => setErrorToast(''), 3000);
    } finally {
      setAiPolishing(false);
    }
  };

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Save / Error Toasts */}
      {saveToast && (
        <div className="fixed bottom-5 left-5 z-50 bg-ok text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed bottom-5 left-5 z-50 bg-warn text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <span>{errorToast}</span>
        </div>
      )}

      <div className="bg-card border border-line rounded-2xl p-4 sm:p-6 shadow-sm">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-line no-print">
          <div>
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              <span>{t('سجل ومتابعة الأسبوع التدريبي', 'Weekly Training Log & Review')}</span>
            </h2>
            <p className="text-xs text-sub mt-0.5">
              {t(
                'مساعدك في تدوين وتصنيف مهام الأسبوع وحفظ كافة التفاصيل لعدم نسيانها عند إعداد التقرير',
                'Your assistant to log, classify, and track weekly tasks without forgetting details.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadDocx}
              disabled={downloadingDocx}
              className="px-3.5 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title={t('تنزيل تقرير الأسبوع كمستند Word رسمي معتمد (.docx) متضمناً جدول المهام والأختام', 'Download weekly Word report (.docx)')}
            >
              <FileText className={`w-3.5 h-3.5 text-accent ${downloadingDocx ? 'animate-bounce' : ''}`} />
              <span>{downloadingDocx ? t('جارٍ تصدير Word...', 'Exporting Word...') : t('تقرير Word (.docx)', 'Word (.docx)')}</span>
            </button>

            <button
              onClick={handleAuditPolishWeek}
              disabled={isAuditingWeek || !weekReport?.entries?.length}
              className="px-3.5 py-1.5 text-xs font-black text-white bg-linear-to-r from-accent to-[#C0102A] hover:opacity-90 rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title={t('تدقيق لغوي وهندسي وإعادة صياغة وترقية تصنيفات وعناوين كافة مهام الأسبوع وفق أعلى المعايير بضغطة واحدة', 'Audit, elevate titles, and rephrase entire week')}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAuditingWeek ? 'animate-spin' : ''}`} />
              <span>{isAuditingWeek ? t('جارٍ التدقيق والترقية...', 'Auditing & Elevating...') : t('✨ التدقيق والترقية الأكاديمية للأسبوع', '✨ AI Polish & Upgrade Week')}</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-accent hover:bg-accent/90 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title={t('طباعة تقرير الأسبوع مباشرة أو حفظه كـ PDF رسمي متناسق', 'Print weekly report or save as PDF')}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('طباعة / حفظ PDF', 'Print / Save PDF')}</span>
            </button>

            <button
              onClick={handleDownloadPresentation}
              disabled={downloadingPptx}
              className="px-3.5 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title={t('تصدير شرائح عرض تقديمي للمناقشة (.pptx)', 'Export defense PowerPoint slides (.pptx)')}
            >
              <Download className={`w-3.5 h-3.5 text-accent ${downloadingPptx ? 'animate-bounce' : ''}`} />
              <span>{downloadingPptx ? t('جارٍ التوليد...', 'Generating...') : t('عرض PowerPoint (.pptx)', 'PowerPoint (.pptx)')}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('تم النسخ!', 'Copied!') : t('نسخ النص', 'Copy Text')}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Markdown</span>
            </button>
          </div>
        </div>

        {/* 14 Weeks Navigation Bar with Right/Left Scrolling Buttons */}
        <div className="space-y-2 mb-6 no-print">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-sub">
            <div className="flex items-center gap-2">
              <span>{t('اختر الأسبوع للمعاينة والتعديل وإرفاق الصور:', 'Select week to review, edit, or attach photos:')}</span>
            </div>

            {/* Quick Dropdown Picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-sub">{t('انتقال سريع:', 'Quick Jump:')}</span>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="px-2.5 py-1 text-xs bg-bg border border-line rounded-lg text-ink font-bold focus:outline-none focus:border-accent"
              >
                {weeksList.map((w) => (
                  <option key={w.weekIndex} value={w.weekStart}>
                    {t(`الأسبوع ${w.weekIndex} (${w.entries?.length || 0} مهام)`, `Week ${w.weekIndex} (${w.entries?.length || 0} tasks)`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scrolling Container with explicit Right and Left Arrow Buttons */}
          <div className="relative flex items-center gap-1.5">
            <button
              type="button"
              onClick={isAr ? scrollRight : scrollLeft}
              className="p-2.5 rounded-xl bg-bg hover:bg-line text-ink border border-line transition-all shadow-xs shrink-0 z-10 hover:scale-105"
              title={isAr ? 'التمرير يميناً' : 'Scroll Left'}
            >
              <ChevronRight className="w-4 h-4 text-ink" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1 scroll-smooth flex-1"
            >
              {weeksList.map((w) => {
                const isSelected = selectedWeek === w.weekStart;
                const hasEntries = w.entries && w.entries.length > 0;
                const hasEvidence = w.evidence && w.evidence.length > 0;
                return (
                  <button
                    key={w.weekIndex}
                    onClick={() => setSelectedWeek(w.weekStart)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex flex-col items-center gap-0.5 border shrink-0 ${
                      isSelected
                        ? 'bg-accent text-white border-accent shadow-md ring-2 ring-accent/20 scale-[1.02]'
                        : hasEntries
                          ? 'bg-bg hover:bg-line text-ink border-line'
                          : 'bg-bg/40 text-muted border-dashed border-line'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{t(`الأسبوع ${w.weekIndex}`, `Week ${w.weekIndex}`)}</span>
                      {hasEvidence && (
                        <span className="w-1.5 h-1.5 rounded-full bg-ok shrink-0" title={t('يحتوي على صور توثيقية', 'Contains evidence photos')} />
                      )}
                    </div>
                    <span className="text-[10px] opacity-80">
                      {hasEntries ? t(`${w.entries.length} مهام موثقة`, `${w.entries.length} logged tasks`) : t('مؤجل / فارغ', 'Postponed / Empty')}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={isAr ? scrollLeft : scrollRight}
              className="p-2.5 rounded-xl bg-bg hover:bg-line text-ink border border-line transition-all shadow-xs shrink-0 z-10 hover:scale-105"
              title={isAr ? 'التمرير يساراً' : 'Scroll Right'}
            >
              <ChevronLeft className="w-4 h-4 text-ink" />
            </button>
          </div>
        </div>

        {/* Selected Week View */}
        {isLoading ? (
          <div className="text-center py-12 text-sub text-sm">{t('جارٍ تحميل تقرير الأسبوع...', 'Loading weekly log...')}</div>
        ) : (
          <div id="weekly-paper-view" className="printable-a4-sheet space-y-6">
            {/* Formal Printable Academic Weekly Header (Visible on print) */}
            <div className="hidden print:block pb-5 mb-5 border-b-2 border-line text-center space-y-3 break-inside-avoid">
              <div className="flex items-center justify-between text-xs font-bold text-sub">
                <span>{isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}</span>
                <span>{finalReportData?.profile?.trainingUnit || (isAr ? 'الوحدة التدريبية / الكلية' : 'Academic Institution')}</span>
              </div>
              <h1 className="text-xl font-black text-ink">
                {isAr ? `تقرير المتابعة والتوثيق الأسبوعي — ${currentWeekObj ? `الأسبوع ${currentWeekObj.weekIndex}` : 'الأسبوع التدريبي'}` : `Weekly Training & Log Report — Week ${currentWeekObj?.weekIndex || 1}`}
              </h1>
              <div className="text-xs text-sub font-semibold">
                {weekReport
                  ? `${isAr ? 'الفترة التدريبية المنفذة: ' : 'Executed Training Period: '} ${formatWeekPeriod(weekReport, isAr)}`
                  : '—'}
              </div>
              <div className="p-4 bg-bg rounded-xl border border-line text-xs grid grid-cols-2 sm:grid-cols-3 gap-3 text-start print-grid-3">
                <div><span className="font-bold text-sub">{isAr ? 'اسم المتدرب:' : 'Trainee Name:'}</span> <span className="font-extrabold text-ink">{finalReportData?.profile?.studentName || '—'}</span></div>
                <div><span className="font-bold text-sub">{isAr ? 'الرقم التدريبي:' : 'Training ID:'}</span> <span className="font-extrabold text-ink">{finalReportData?.profile?.trainingNumber || '—'}</span></div>
                <div><span className="font-bold text-sub">{isAr ? 'جهة التدريب:' : 'Host Org:'}</span> <span className="font-extrabold text-ink">{entityName}</span></div>
                <div><span className="font-bold text-sub">{isAr ? 'المشرف الميداني:' : 'Field Supervisor:'}</span> <span className="font-extrabold text-ink">{finalReportData?.profile?.responsibleName || '—'}</span></div>
                <div><span className="font-bold text-sub">{isAr ? 'أيام العمل المنجزة:' : 'Work Days:'}</span> <span className="font-extrabold text-ink">{weekReport?.totalDays || 0} {isAr ? 'أيام' : 'days'}</span></div>
                <div><span className="font-bold text-sub">{isAr ? 'إجمالي الساعات الفعلية:' : 'Total Hours:'}</span> <span className="font-extrabold text-ink">{weekReport?.totalHours || 0} {isAr ? 'ساعة' : 'hrs'}</span></div>
              </div>
            </div>

            {/* Executive Weekly Tasks Table Matrix (Visible in both Screen and Print) */}
            {weekReport && weekReport.entries && weekReport.entries.length > 0 && (
              <div className="overflow-x-auto border border-line rounded-xl my-4 bg-card print:border-line print:bg-white break-inside-avoid shadow-xs">
                <div className="bg-bg px-4 py-2.5 border-b border-line flex items-center justify-between text-xs font-black text-ink">
                  <span>{isAr ? 'جدول حصر وتوثيق الأنشطة والمهام الأسبوعية المعتمد' : 'Official Weekly Tasks Executive Matrix'}</span>
                  <span className="text-[11px] font-bold text-accent">
                    {weekReport.totalDays} {isAr ? 'أيام عمل' : 'days'} &middot; {weekReport.totalHours} {isAr ? 'ساعة فعلية' : 'hours'}
                  </span>
                </div>
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="bg-bg/60 border-b border-line text-ink font-extrabold text-[11px]">
                      <th className="p-2.5 text-start w-28">{isAr ? 'اليوم والتاريخ' : 'Day & Date'}</th>
                      <th className="p-2.5 text-center w-24">{isAr ? 'التوقيت' : 'Time'}</th>
                      <th className="p-2.5 text-center w-16">{isAr ? 'الساعات' : 'Hours'}</th>
                      <th className="p-2.5 text-start w-28">{isAr ? 'التصنيف الفني' : 'Domain'}</th>
                      <th className="p-2.5 text-start">{isAr ? 'النشاط والمهمة التشغيلية الميدانية' : 'Operational Scope & Task'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {weekReport.entries.map((entry: EntryDTO, idx: number) => {
                      const hours = calculateHoursBetween(entry.timeFrom || '08:00', entry.timeTo || '16:00');
                      return (
                        <tr key={entry.id} className="hover:bg-bg/30 transition-colors">
                          <td className="p-2.5 font-extrabold text-ink whitespace-nowrap">
                            <span className="text-accent ml-1 font-black">{isAr ? `اليوم ${idx + 1}` : `D${idx + 1}`}</span>
                            <span className="text-sub font-semibold text-[10.5px]">
                              ({isAr ? formatDateArabic(entry.entryDate) : formatDateEnglish(entry.entryDate)})
                            </span>
                          </td>
                          <td className="p-2.5 text-center text-sub font-mono text-[11px] whitespace-nowrap" dir="ltr">
                            {entry.timeFrom || '08:00'} - {entry.timeTo || '16:00'}
                          </td>
                          <td className="p-2.5 text-center font-black text-ink whitespace-nowrap">
                            {hours} {isAr ? 'س' : 'h'}
                          </td>
                          <td className="p-2.5">
                            <span className="px-2.5 py-1 rounded-md text-[10.5px] font-extrabold bg-slate-100 text-slate-800 whitespace-nowrap border border-slate-300 shadow-xs print:bg-white print:border-slate-400">
                              {entry.category}
                            </span>
                          </td>
                          <td className="p-2.5 font-bold text-ink leading-snug">
                            {entry.title}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Header info with Next / Previous Week Jumpers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-bg rounded-xl border border-line no-print">
              <div>
                <span className="text-xs text-sub font-bold block">{t('فترة الأسبوع المحددة:', 'Selected Week Period:')}</span>
                <span className="text-sm font-extrabold text-ink">
                  {weekReport ? formatWeekPeriod(weekReport, isAr) : '—'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Previous Week Button */}
                <button
                  disabled={!prevWeek}
                  onClick={() => prevWeek && setSelectedWeek(prevWeek.weekStart)}
                  className="px-3 py-1.5 rounded-xl border border-line bg-card hover:bg-line text-xs font-bold text-ink disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                  title={prevWeek ? t(`الانتقال للأسبوع ${prevWeek.weekIndex}`, `Go to Week ${prevWeek.weekIndex}`) : ''}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>{t('الأسبوع السابق', 'Previous Week')}</span>
                </button>

                {/* Next Week Button */}
                <button
                  disabled={!nextWeek}
                  onClick={() => nextWeek && setSelectedWeek(nextWeek.weekStart)}
                  className="px-3 py-1.5 rounded-xl border border-line bg-card hover:bg-line text-xs font-bold text-ink disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                  title={nextWeek ? t(`الانتقال للأسبوع ${nextWeek.weekIndex}`, `Go to Week ${nextWeek.weekIndex}`) : ''}
                >
                  <span>{t('الأسبوع التالي', 'Next Week')}</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {currentWeekObj && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold mx-1 ${
                      currentWeekObj.status === 'completed'
                        ? 'bg-ok-bg text-ok'
                        : currentWeekObj.status === 'in_progress'
                          ? 'bg-accent-dim text-accent'
                          : 'bg-warn-bg text-warn'
                    }`}
                  >
                    {currentWeekObj.status === 'completed'
                      ? t('مكتمل وموثّق', 'Completed & Documented')
                      : currentWeekObj.status === 'in_progress'
                        ? t('قيد التنفيذ', 'In Progress')
                        : t('مؤجل', 'Postponed')}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics (Hidden in Print to prevent wasting Page 1 space) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 no-print print:hidden">
              <div className="bg-bg border border-line rounded-xl p-4">
                <div className="flex items-center justify-between text-sub mb-1">
                  <span className="text-xs font-bold">{t('أيام العمل المنجزة', 'Logged Work Days')}</span>
                  <Calendar className="w-4 h-4 text-accent" />
                </div>
                <div className="text-2xl font-black text-ink">{weekReport?.totalDays || 0}</div>
                <div className="text-[11px] text-sub mt-0.5">{t('أيام موثقة بالأسبوع', 'Days recorded this week')}</div>
              </div>

              <div className="bg-accent-dim/30 border border-accent/20 rounded-xl p-4">
                <div className="flex items-center justify-between text-sub mb-1">
                  <span className="text-xs font-bold">{t('المهام الميدانية المنفذة', 'Completed Tasks')}</span>
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                </div>
                <div className="text-2xl font-black text-accent">{weekReport?.totalTasks || 0}</div>
                <div className="text-[11px] text-sub mt-0.5">{t('مهمة مسجلة في هذا الأسبوع', 'Tasks recorded this week')}</div>
              </div>
            </div>

            {/* Section Header with Add New Day/Task Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 no-print print:hidden">
              <div>
                <h3 className="text-sm font-extrabold text-ink flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-accent" />
                  <span>{t('سجل المهام والسرد اليومي للأسبوع', 'Weekly Task Log & Daily Narrative')}</span>
                </h3>
                <p className="text-xs text-sub mt-0.5">
                  {t('كل يوم مدون بساعاته وتصنيفه وسرده الأكاديمي التفصيلي مع إمكانية التعديل والإضافة بحرية', 'Daily logs documented with hours, categories, and detailed academic narratives.')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddDay}
                className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t('إضافة يوم / مهمة لهذا الأسبوع', '+ Add Day / Task for this Week')}</span>
              </button>
            </div>

            {/* Weekly Entries Table with Full Editing Options */}
            {!weekReport?.entries || weekReport.entries.length === 0 ? (
              <div className="border border-dashed border-line rounded-2xl p-8 text-center space-y-4 bg-bg/50">
                <Clock className="w-9 h-9 text-warn mx-auto opacity-75" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-ink">
                    {t(
                      `${currentWeekObj ? `الأسبوع ${currentWeekObj.weekIndex}` : 'هذا الأسبوع'} مؤجل أو لم تُسجل به مهام بعد`,
                      `${currentWeekObj ? `Week ${currentWeekObj.weekIndex}` : 'This week'} is pending with no tasks yet`
                    )}
                  </h3>
                  <p className="text-xs text-sub max-w-md mx-auto leading-relaxed">
                    {t('يمكنك كتابة وتوثيق مهام وأيام هذا الأسبوع الآن مباشرةً بالنقر على الزر أدناه:', 'You can log tasks and days for this week right now:')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddDay}
                  className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('إضافة أول يوم ومهمة للأسبوع', '+ Add First Day & Task for Week')}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {weekReport.entries.map((entry: EntryDTO, dayIdx: number) => {
                  const entryHours = calculateHoursBetween(entry.timeFrom || '08:00', entry.timeTo || '16:00');
                  return (
                    <div
                      key={entry.id}
                      className="border border-line rounded-2xl overflow-hidden bg-card shadow-xs hover:shadow-sm transition-all text-start day-card-print break-inside-avoid"
                    >
                      {/* Day Card Header matching the user's uploaded image exactly */}
                      <div className="bg-bg px-4 sm:px-5 py-3 border-b border-line flex flex-wrap items-center justify-between gap-2.5">
                        {/* Right: Day badge, Date, and Time window */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-3 py-1 rounded-lg text-xs font-black bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 print:bg-slate-900 print:text-white shadow-xs">
                            {isAr ? `اليوم ${dayIdx + 1}` : `Day ${dayIdx + 1}`}
                          </span>
                          <span className="font-extrabold text-ink text-xs sm:text-sm">
                            {isAr ? formatDateArabic(entry.entryDate) : formatDateEnglish(entry.entryDate)}
                          </span>
                          <span className="text-sub text-xs font-semibold" dir="ltr">
                            ({entry.timeFrom || '08:00'} – {entry.timeTo || '16:00'})
                          </span>
                        </div>

                        {/* Left: Category Tag, Hours calculation, and Actions */}
                        <div className="flex items-center gap-2.5">
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 print:bg-white print:border-slate-400 print:text-black shadow-xs">
                            {entry.category}
                          </span>
                          <span className="text-xs font-bold text-sub">
                            {entryHours} {isAr ? 'ساعات' : 'hrs'}
                          </span>

                          {/* Screen Actions (hidden when printing) */}
                          <div className="flex items-center gap-1.5 no-print print:hidden mr-1">
                            <button
                              type="button"
                              onClick={() => handleOpenRevisions(entry)}
                              className="p-1.5 rounded-lg bg-card hover:bg-line text-sub hover:text-accent border border-line transition-all shadow-xs relative"
                              title={t('سجل التعديلات واسترجاع النسخ السابقة', 'Revision History & Rollback')}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              {((entry as any)._count?.revisions ?? 0) > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">
                                  {(entry as any)._count.revisions}
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(entry)}
                              className="p-1.5 rounded-lg bg-card hover:bg-line text-sub hover:text-accent border border-line transition-all shadow-xs"
                              title={t('تعديل هذا اليوم / المهمة', 'Edit Task')}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-1.5 rounded-lg bg-card hover:bg-warn-bg text-sub hover:text-warn border border-line transition-all shadow-xs"
                              title={t('حذف المهمة', 'Delete Task')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Day Card Body: Formal Task Title & Full Procedural Narrative */}
                      <div className="p-4 sm:p-6 space-y-3.5">
                        <div>
                          <div className="text-xs font-black text-[#C0102A] uppercase tracking-wider mb-1">
                            {isAr ? 'النشاط الفني والمهمة التشغيلية الميدانية:' : 'Technical Activity & Operational Scope:'}
                          </div>
                          <h4 className="text-sm sm:text-base font-black text-ink leading-snug">
                            {entry.title}
                          </h4>
                        </div>

                        <div className="pt-3 border-t border-line/60">
                          <div className="text-xs font-black text-sub uppercase tracking-wider mb-1.5">
                            {isAr ? 'السرد الإجرائي ونتائج التنفيذ الهندسي والميداني:' : 'Procedural Narrative & Engineering Results:'}
                          </div>
                          <div className="text-ink text-xs sm:text-sm leading-loose bg-bg/50 p-4 rounded-xl border border-line/60 procedural-narrative-box">
                            {renderProceduralNarrative(entry.description)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Weekly Learning Synthesis & Acquired Competencies (Dynamic Expert Generation) */}
                {(() => {
                  const synthesis = generateAcademicWeeklySynthesis(
                    weekReport.entries || [],
                    currentWeekObj?.weekIndex || 1,
                    weekReport.totalHours || 0,
                    isAr
                  );
                  return (
                    <div className="mt-6 p-5 bg-card border border-line rounded-2xl space-y-3.5 text-start break-inside-avoid shadow-xs print:border-none print:shadow-none print:p-0 print:bg-transparent synthesis-box-print">
                      <div className="flex items-center justify-between border-b border-line pb-2.5 print:border-b-2 print:border-slate-800">
                        <div className="text-xs font-black text-ink flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-accent print:hidden" />
                          <span>{isAr ? 'الموجز التنفيذي والمخرجات والكفايات المكتسبة للأسبوع' : 'Weekly Executive Synthesis & Acquired Competencies'}</span>
                        </div>
                        <span className="text-[11px] font-bold text-sub">
                          {isAr ? 'صياغة أكاديمية استشارية معتمدة' : 'Official Academic Synthesis'}
                        </span>
                      </div>

                      {/* Executive Narrative */}
                      <p className="text-xs sm:text-sm text-ink leading-relaxed font-medium">
                        {synthesis.executiveSummary}
                      </p>

                      {/* Core Operational Pillars */}
                      {synthesis.technicalPillars.length > 0 && (
                        <div className="pt-2 border-t border-line/60 space-y-1.5 print:border-t print:border-slate-200">
                          <div className="text-[11px] font-black text-[#C0102A] uppercase tracking-wider">
                            {isAr ? 'المحاور والأنشطة التشغيلية المنفذة:' : 'Core Operational Pillars:'}
                          </div>
                          <ul className="space-y-1 text-xs text-sub">
                            {synthesis.technicalPillars.map((pillar, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C0102A] mt-1.5 shrink-0"></span>
                                <span className="text-ink font-semibold">{pillar}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Acquired Competencies */}
                      {synthesis.acquiredCompetencies.length > 0 && (
                        <div className="pt-2 border-t border-line/60 space-y-1.5 print:border-t print:border-slate-200">
                          <div className="text-[11px] font-black text-ok uppercase tracking-wider flex items-center gap-1">
                            <span>{isAr ? 'الكفايات والمعارف الهندسية المكتسبة:' : 'Acquired Engineering Competencies:'}</span>
                          </div>
                          <ul className="space-y-1 text-xs text-sub">
                            {synthesis.acquiredCompetencies.map((comp, cIdx) => (
                              <li key={cIdx} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-ok mt-1.5 shrink-0"></span>
                                <span>{comp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tools & Tech Badges */}
                      {synthesis.toolsAndTech.length > 0 && (
                        <div className="pt-2 border-t border-line/60 flex flex-wrap items-center gap-1.5 print:border-t print:border-slate-200" dir={isAr ? 'rtl' : 'ltr'}>
                          <span className="text-[11px] font-black text-sub ml-1">
                            {isAr ? 'التقنيات والأدوات الموظفة:' : 'Utilized Tech:'}
                          </span>
                          {synthesis.toolsAndTech.map((tool, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2.5 py-0.5 rounded-md text-[10.5px] font-mono font-bold bg-accent-dim/60 text-accent border border-accent/20 print:bg-slate-100 print:text-slate-800 print:border-slate-300 tech-pill"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Formal Supervisory Approval & Stamp Block (For Official Print & Defense) */}
                <div className="mt-6 border border-line rounded-2xl overflow-hidden bg-card text-start break-inside-avoid print:border-none print:shadow-none print:bg-transparent endorsement-box-print">
                  <div className="bg-bg px-5 py-3 border-b border-line flex items-center justify-between print:bg-transparent print:px-0 print:border-b-2 print:border-slate-800" dir={isAr ? 'rtl' : 'ltr'}>
                    <span className="text-xs font-black text-ink">{t('المصادقة والاعتماد الميداني للأسبوع', 'Field Supervisory Weekly Endorsement')}</span>
                    <span className="text-[11px] font-bold text-accent shrink-0">{entityName}</span>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs print-grid-3 print:p-0 print:pt-3">
                    <div className="space-y-2 p-3 bg-bg/40 rounded-xl border border-line/60">
                      <div className="font-bold text-sub">{t('توقيع المتدرب:', 'Trainee Signature:')}</div>
                      <div className="font-extrabold text-ink">{finalReportData?.profile?.studentName || '—'}</div>
                      <div className="text-[11px] text-muted pt-2 border-t border-line/40">التوقيع: ....................</div>
                    </div>
                    <div className="space-y-2 p-3 bg-bg/40 rounded-xl border border-line/60">
                      <div className="font-bold text-sub">{t('اعتماد المشرف الميداني:', 'Field Supervisor Approval:')}</div>
                      <div className="font-extrabold text-ink">{finalReportData?.profile?.responsibleName || '....................'}</div>
                      <div className="text-[11px] text-muted pt-2 border-t border-line/40">التوقيع: ....................</div>
                    </div>
                    <div className="space-y-2 p-3 bg-bg/40 rounded-xl border border-line/60 flex flex-col justify-between">
                      <div className="font-bold text-sub">{t('ختم جهة التدريب الرسمي:', 'Official Host Entity Stamp:')}</div>
                      <div className="h-12 border border-dashed border-line rounded-lg flex items-center justify-center text-[10px] text-muted">
                        [ موضع الختم الرسمي ]
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Field Evidence Photos Component */}
            {currentWeekObj && (
              <WeeklyEvidenceSection weekIndex={currentWeekObj.weekIndex} />
            )}
          </div>
        )}
      </div>

      {/* Edit / Add Entry Modal */}
      {isEditModalOpen && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-line rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in text-start">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-bg">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-extrabold text-ink">
                  {editingEntry.id ? t('تعديل بيانات وسرد اليوم', 'Edit Daily Task') : t('إضافة يوم ومهمة جديدة للأسبوع', 'Add New Day & Task')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-sub hover:text-ink hover:bg-line transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEntry} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-sub">{t('تاريخ اليوم التدريبي', 'Training Date')}</label>
                  <input
                    type="date"
                    required
                    value={editingEntry.entryDate || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, entryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-sub">{t('التصنيف الفني', 'Technical Category')}</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(!isCustomCategory);
                        if (!isCustomCategory && !customCategory) {
                          setCustomCategory('');
                        }
                      }}
                      className="text-[10px] font-bold text-accent hover:underline"
                    >
                      {isCustomCategory ? t('← قائمة التصنيفات', '← Preset Categories') : t('+ كتابة تصنيف مخصص', '+ Custom Category')}
                    </button>
                  </div>
                  {isCustomCategory ? (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder={t('مثال: أمن سيبراني، ذكاء اصطناعي، شبكات...', 'e.g. Cyber Security, AI, Networks...')}
                      className="w-full px-3 py-2 bg-bg border border-accent rounded-xl focus:outline-none focus:ring-1 focus:ring-accent text-ink font-bold"
                      autoFocus
                      required
                    />
                  ) : (
                    <select
                      value={editingEntry.category || 'تطوير / برمجة'}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCategory(true);
                          setCustomCategory('');
                        } else {
                          setEditingEntry({ ...editingEntry, category: e.target.value as EntryDTO['category'] });
                        }
                      }}
                      className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink font-bold"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__custom__">✨ {t('+ كتابة تصنيف مخصص...', '+ Custom category...')}</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Work Hours & Daily Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-sub">{t('وقت الحضور (البداية)', 'Start Time')}</label>
                  <input
                    type="time"
                    required
                    value={editingEntry.timeFrom || '08:00'}
                    onChange={(e) => setEditingEntry({ ...editingEntry, timeFrom: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-sub">{t('وقت الانصراف (النهاية)', 'End Time')}</label>
                    <span className="text-[11px] font-bold text-accent">
                      {calculateHoursBetween(editingEntry.timeFrom || '08:00', editingEntry.timeTo || '16:00')} {t('ساعات تدريب', 'hrs')}
                    </span>
                  </div>
                  <input
                    type="time"
                    required
                    value={editingEntry.timeTo || '16:00'}
                    onChange={(e) => setEditingEntry({ ...editingEntry, timeTo: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-sub">{t('عنوان المهمة / النشاط الميداني', 'Task Title / Activity')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('مثال: التهيئة العامة والتعريف بسياسات أمن المعلومات', 'e.g. Orientation and Information Security Policies')}
                  value={editingEntry.title || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block font-bold text-sub">{t('التفاصيل والسرد الأكاديمي للمهمة', 'Task Details & Narrative')}</label>
                  
                  {/* AI Quick Actions Toolbar */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      disabled={aiPolishing || !editingEntry.description}
                      onClick={() => handleAIAction('polish')}
                      className="text-[11px] font-bold text-accent hover:bg-accent hover:text-white transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-dim/60 border border-accent/20 disabled:opacity-40"
                      title={t('تنقيح الصياغة لغوياً وتقنياً', 'Polish phrasing using AI')}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{t('تنقيح الصياغة', 'Polish')}</span>
                    </button>
                    <button
                      type="button"
                      disabled={aiPolishing || !editingEntry.description}
                      onClick={() => handleAIAction('spellcheck')}
                      className="text-[11px] font-bold text-ok hover:bg-ok hover:text-white transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ok-bg border border-ok/20 disabled:opacity-40"
                      title={t('تصحيح إملائي ونحوي', 'Spell & Grammar check')}
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>{t('تصحيح إملائي', 'Spellcheck')}</span>
                    </button>
                    <button
                      type="button"
                      disabled={aiPolishing || !editingEntry.description}
                      onClick={() => handleAIAction('summarize')}
                      className="text-[11px] font-bold text-ink hover:bg-line transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-line disabled:opacity-40"
                      title={t('اختصار وإيجاز فني', 'Summarize')}
                    >
                      <FileText className="w-3 h-3" />
                      <span>{t('إيجاز', 'Summary')}</span>
                    </button>
                    <button
                      type="button"
                      disabled={aiPolishing || !editingEntry.description}
                      onClick={() => handleAIAction('translate')}
                      className="text-[11px] font-bold text-ink hover:bg-line transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-line disabled:opacity-40"
                      title={t('ترجمة فورية للإنجليزية', 'Translate to English')}
                    >
                      <Languages className="w-3 h-3" />
                      <span>{isAr ? 'ترجمة EN' : 'ترجمة AR'}</span>
                    </button>
                  </div>
                </div>
                <textarea
                  rows={5}
                  required
                  placeholder={t('اكتب شرحاً وافياً للمهام التي قمت بإنجازها، الأدوات المستخدمة، والنتائج المتحققة...', 'Write a clear explanation of tasks accomplished, tools used, and results...')}
                  value={editingEntry.description || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink leading-relaxed"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-bg hover:bg-line text-sub font-bold transition-colors"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('حفظ التعديلات', 'Save Changes')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revisions History Modal for Day Cards */}
      {revisionsModalOpen && activeEntryForRevisions && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-card border border-line rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-start">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
                  <History className="w-5 h-5 text-accent" />
                  <span>{t('سجل التعديلات والنسخ المحفوظة لهذا اليوم', 'Revision History & Rollback Vault')}</span>
                </h3>
                <p className="text-[11px] text-sub font-medium">
                  {t('تاريخ اليوم التدريبي:', 'Training Day Date:')} <strong className="text-ink">{activeEntryForRevisions.entryDate}</strong> — {entryRevisionsList.length > 0 ? `${entryRevisionsList.length} ${t('نسخة مسجلة في الأرشيف', 'version(s) archived')}` : t('النسخة الأصلية الأساسية', 'Original Baseline Version')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRevisionsModalOpen(false)}
                className="p-1 rounded-lg text-sub hover:text-ink hover:bg-line transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 flex-1 space-y-4">
              {/* Current Active Entry State */}
              <div className="p-4 rounded-xl border border-ok/30 bg-ok-bg/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-black text-ok">
                    <span className="w-2 h-2 rounded-full bg-ok animate-pulse"></span>
                    {t('النسخة الحالية النشطة في التقرير وقاعدة البيانات', 'Current Active Version in Report & Database')}
                  </span>
                  <span className="text-[10px] font-bold text-sub">
                    {activeEntryForRevisions.timeFrom} - {activeEntryForRevisions.timeTo} | {activeEntryForRevisions.category}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-ink">{activeEntryForRevisions.title}</h4>
                <div className="text-xs text-ink/90 leading-relaxed whitespace-pre-wrap bg-card/60 p-3 rounded-lg border border-line/40">
                  {activeEntryForRevisions.description}
                </div>
              </div>

              {/* Revision History Stream */}
              <div className="space-y-2.5">
                <div className="text-xs font-black text-sub uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-accent" />
                  <span>{t('سجل التعديلات والإصدارات السابقة (إمكانية الاسترجاع الفوري):', 'Archived Prior Revisions (Instant Rollback):')}</span>
                </div>

                {!entryRevisionsList?.length ? (
                  <div className="text-center py-6 px-4 rounded-xl border border-dashed border-line bg-bg text-sub text-xs space-y-1">
                    <p className="font-bold text-ink">
                      {t('هذه هي النسخة الأصلية المعتمدة حالياً في قاعدة البيانات.', 'This is the active baseline version stored safely in the database.')}
                    </p>
                    <p className="text-[11px] text-sub">
                      {t('أي تعديل جديد تجريه على هذا اليوم سيتم حفظه مع الاحتفاظ بنسخته السابقة هنا تلقائياً لضمان عدم فقدان أي بيانات.', 'Any subsequent edits will automatically be archived here with exact timestamps for instant rollback.')}
                    </p>
                  </div>
                ) : (
                  entryRevisionsList.map((rev, idx) => {
                    const isSameAsCurrent = rev.title === activeEntryForRevisions.title && rev.description === activeEntryForRevisions.description;
                    return (
                      <div key={rev.id || idx} className="p-3.5 rounded-xl border border-line bg-bg space-y-2 hover:border-accent/40 transition-colors">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-accent-dim text-accent">
                              #{entryRevisionsList.length - idx}
                            </span>
                            <span className="font-extrabold text-ink">{rev.title}</span>
                            {rev.createdAt && (
                              <span className="text-[10px] text-muted hidden sm:inline">
                                ({new Date(rev.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })})
                              </span>
                            )}
                          </div>
                          {!isSameAsCurrent && (
                            <button
                              type="button"
                              onClick={() => rollbackMutation.mutate({ entryId: activeEntryForRevisions.id, revId: rev.id })}
                              disabled={rollbackMutation.isPending}
                              className="px-3 py-1 text-[11px] font-bold rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50 shrink-0"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>{rollbackMutation.isPending ? t('جارٍ الاسترجاع...', 'Restoring...') : t('العودة لهذه النسخة', 'Rollback to this')}</span>
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-sub leading-relaxed whitespace-pre-wrap bg-card p-2.5 rounded-lg border border-line/50">
                          {rev.description}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-line flex items-center justify-between">
              <span className="text-[11px] text-ok font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('بياناتك مؤرشفة ومحمية من الفقدان في السيرفر', 'All data securely preserved on server')}
              </span>
              <button
                type="button"
                onClick={() => setRevisionsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-bg hover:bg-line text-xs font-bold text-ink transition-colors"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Diff Modal for Weekly Tab */}
      <DiffModal
        isOpen={diffModalOpen}
        onClose={() => setDiffModalOpen(false)}
        actionTitle={diffTitle}
        originalText={originalText}
        improvedText={improvedText}
        diffChunks={diffChunks}
        onAccept={() => {
          setEditingEntry((prev) => (prev ? { ...prev, description: improvedText } : null));
          setDiffModalOpen(false);
          setSaveToast(t('تم تطبيق التعديلات الذكية بنجاح!', 'AI improvements applied successfully!'));
          setTimeout(() => setSaveToast(''), 3000);
        }}
      />
    </div>
  );
};
