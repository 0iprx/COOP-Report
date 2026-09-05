import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { FinalReportData, EntryDTO, formatDateArabic, formatDateEnglish } from '@coop/shared';
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
  CheckCheck
} from 'lucide-react';
import { DiffModal } from '../common/DiffModal';

const CATEGORIES: Array<EntryDTO['category']> = [
  'تطوير / برمجة',
  'اجتماعات',
  'تدريب وتعلّم',
  'توثيق',
  'دعم فني',
  'أخرى'
];

export const WeeklyTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { lang, isAr, t } = useLanguage();
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadingPptx, setDownloadingPptx] = useState<boolean>(false);

  // Edit / Add Day Modal State
  const [editingEntry, setEditingEntry] = useState<Partial<EntryDTO> | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [aiPolishing, setAiPolishing] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string>('');
  const [errorToast, setErrorToast] = useState<string>('');

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
      timeTo: entry.timeTo || '12:00',
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
      timeTo: '12:00',
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-line">
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
        <div className="space-y-2 mb-6">
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
          <div className="space-y-6">
            {/* Header info with Next / Previous Week Jumpers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-bg rounded-xl border border-line">
              <div>
                <span className="text-xs text-sub font-bold block">{t('فترة الأسبوع المحددة:', 'Selected Week Period:')}</span>
                <span className="text-sm font-extrabold text-ink">
                  {weekReport
                    ? isAr
                      ? `${formatDateArabic(weekReport.weekStart)} إلى ${formatDateArabic(weekReport.weekEnd)}`
                      : `${formatDateEnglish(weekReport.weekStart)} to ${formatDateEnglish(weekReport.weekEnd)}`
                    : '—'}
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

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <h3 className="text-sm font-extrabold text-ink flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-accent" />
                  <span>{t('جدول المهام والسرد اليومي للأسبوع', 'Weekly Task Schedule & Narrative')}</span>
                </h3>
                <p className="text-xs text-sub mt-0.5">
                  {t('يمكنك تعديل أي يوم، إعادة صياغة التفاصيل، أو إضافة مهام جديدة بحرية تامة', 'Edit any day, refine details with AI, or add new tasks freely')}
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
              <div className="overflow-x-auto border border-line rounded-xl">
                <table className="w-full text-start text-xs">
                  <thead className="bg-bg text-sub font-bold border-b border-line">
                    <tr>
                      <th className="py-3 px-4 w-28 text-start">{t('التاريخ', 'Date')}</th>
                      <th className="py-3 px-4 w-52 text-start">{t('العنوان / التصنيف', 'Title / Category')}</th>
                      <th className="py-3 px-4 text-start">{t('تفاصيل وسرد الإنجاز الأكاديمي', 'Task Details & Accomplishments')}</th>
                      <th className="py-3 px-3 w-24 text-center">{t('إجراءات', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {weekReport.entries.map((entry: EntryDTO) => (
                      <tr key={entry.id} className="hover:bg-bg/40 transition-colors group">
                        <td className="py-3 px-4 font-bold text-ink whitespace-nowrap align-top">
                          {isAr ? formatDateArabic(entry.entryDate) : formatDateEnglish(entry.entryDate)}
                        </td>
                        <td className="py-3 px-4 align-top space-y-1">
                          <div className="font-bold text-ink text-xs">{entry.title}</div>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-dim text-accent">
                            {entry.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sub leading-relaxed whitespace-pre-wrap align-top">
                          {entry.description}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap align-top">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(entry)}
                              className="p-1.5 rounded-lg bg-bg hover:bg-line text-ink hover:text-accent border border-line transition-all"
                              title={t('تعديل هذا اليوم / المهمة', 'Edit Task')}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-1.5 rounded-lg bg-bg hover:bg-warn-bg text-sub hover:text-warn border border-line transition-all"
                              title={t('حذف المهمة', 'Delete Task')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
