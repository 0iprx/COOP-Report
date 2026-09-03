import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { FinalReportData, EntryDTO, formatDateArabic } from '@coop/shared';
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
  CheckCircle
} from 'lucide-react';

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
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadingPptx, setDownloadingPptx] = useState<boolean>(false);

  // Edit / Add Day Modal State
  const [editingEntry, setEditingEntry] = useState<Partial<EntryDTO> | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
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
  const entityName = finalReportData?.profile?.entityAddress || 'جهة التدريب';

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
    let text = `تقرير الأسبوع التدريبي: ${formatDateArabic(weekReport.weekStart)} — ${formatDateArabic(weekReport.weekEnd)}\n`;
    text += `جهة التدريب: ${entityName}\n\n`;

    if (weekReport.entries?.length) {
      weekReport.entries.forEach((e: EntryDTO) => {
        text += `• ${formatDateArabic(e.entryDate)}: ${e.title} [${e.category}]\n  ${e.description}\n\n`;
      });
      text += `إجمالي الأيام: ${weekReport.totalDays} | عدد المهام المنجزة: ${weekReport.totalTasks}`;
    } else {
      text += `(أسبوع تدريبي مؤجل أو لم تسجل به مهام بعد)`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!weekReport) return;
    let md = `# تقرير الأسبوع التدريبي (${formatDateArabic(weekReport.weekStart)} — ${formatDateArabic(weekReport.weekEnd)})\n\n`;
    md += `**الجهة:** ${entityName}  \n`;
    md += `**أيام العمل:** ${weekReport.totalDays || 0} أيام  \n`;
    md += `**المهام المنجزة:** ${weekReport.totalTasks || 0} مهام  \n\n`;
    md += `## جدول المهام والإنجازات الميدانية\n\n`;
    md += `| التاريخ | العنوان | التصنيف | تفاصيل الإنجاز والسرد الأكاديمي |\n`;
    md += `|---|---|---|---|\n`;

    if (weekReport.entries?.length) {
      weekReport.entries.forEach((e: EntryDTO) => {
        md += `| ${formatDateArabic(e.entryDate)} | ${e.title} | ${e.category} | ${e.description.replace(/\n/g, ' ')} |\n`;
      });
    } else {
      md += `| — | أسبوع تدريبي مؤجل أو متاح للتوثيق لاحقاً | — | — |\n`;
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
      alert('تعذر تحميل عرض PowerPoint، يرجى المحاولة لاحقاً');
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
    setIsEditModalOpen(true);
  };

  // Save changes to backend
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry?.title?.trim() || !editingEntry?.description?.trim()) {
      setErrorToast('يرجى كتابة عنوان المهمة والتفاصيل اليومية');
      setTimeout(() => setErrorToast(''), 3000);
      return;
    }

    try {
      if (editingEntry.id) {
        await api.put(`/entries/${editingEntry.id}`, editingEntry);
      } else {
        await api.post('/entries', editingEntry);
      }
      queryClient.invalidateQueries({ queryKey: ['weekly', selectedWeek] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setSaveToast('تم حفظ وتحديث السجل الميداني بنجاح');
      setTimeout(() => setSaveToast(''), 3500);
      setIsEditModalOpen(false);
      setEditingEntry(null);
    } catch {
      setErrorToast('تعذر حفظ التعديل، يرجى المحاولة لاحقاً');
      setTimeout(() => setErrorToast(''), 3500);
    }
  };

  // Delete an entry
  const handleDeleteEntry = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المهمة من سجل الأسبوع؟')) return;
    try {
      await api.delete(`/entries/${id}`);
      queryClient.invalidateQueries({ queryKey: ['weekly', selectedWeek] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setSaveToast('تم حذف المهمة من سجل الأسبوع');
      setTimeout(() => setSaveToast(''), 3000);
    } catch {
      setErrorToast('تعذر حذف المهمة');
      setTimeout(() => setErrorToast(''), 3000);
    }
  };

  // Polish entry description using AI
  const handlePolishDailyText = async () => {
    if (!editingEntry?.description?.trim()) return;
    setAiPolishing(true);
    try {
      const res = await api.post('/ai/process', {
        text: editingEntry.description,
        action: 'polish',
        targetLang: 'ar'
      });
      setEditingEntry((prev) => (prev ? { ...prev, description: res.data.result } : null));
    } catch {
      setErrorToast('تعذر تنقيح النص ذكياً، يرجى المحاولة لاحقاً');
      setTimeout(() => setErrorToast(''), 3000);
    } finally {
      setAiPolishing(false);
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-line">
          <div>
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              <span>التقرير الأسبوعي المعتمد</span>
            </h2>
            <p className="text-xs text-sub mt-0.5">
              خطة التدريب موزعة على {finalReportData?.profile?.trainingWeeks || 14} أسبوعاً تدريبياً مع إمكانية التعديل الشامل والسرد الكتابي
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPresentation}
              disabled={downloadingPptx}
              className="px-3.5 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title="تصدير شرائح عرض تقديمي للمناقشة (.pptx) متضمناً صور الداتا سنتر وبيئة العمل والأسابيع الـ 14"
            >
              <Download className={`w-3.5 h-3.5 text-accent ${downloadingPptx ? 'animate-bounce' : ''}`} />
              <span>{downloadingPptx ? 'جارٍ التوليد...' : 'عرض PowerPoint (.pptx)'}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
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
              <span>اختر الأسبوع للمعاينة والتعديل وإرفاق الصور:</span>
              <span className="text-[11px] text-muted hidden sm:inline">(أزرار الانتقال يميناً ويساراً متاحة بالأسفل)</span>
            </div>

            {/* Quick Dropdown Picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-sub">انتقال سريع:</span>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="px-2.5 py-1 text-xs bg-bg border border-line rounded-lg text-ink font-bold focus:outline-none focus:border-accent"
              >
                {weeksList.map((w) => (
                  <option key={w.weekIndex} value={w.weekStart}>
                    الأسبوع {w.weekIndex} ({w.entries?.length || 0} مهام)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scrolling Container with explicit Right and Left Arrow Buttons */}
          <div className="relative flex items-center gap-1.5">
            <button
              type="button"
              onClick={scrollRight}
              className="p-2.5 rounded-xl bg-bg hover:bg-line text-ink border border-line transition-all shadow-xs shrink-0 z-10 hover:scale-105"
              title="التمرير يميناً"
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
                      <span>الأسبوع {w.weekIndex}</span>
                      {hasEvidence && (
                        <span className="w-1.5 h-1.5 rounded-full bg-ok shrink-0" title="يحتوي على صور توثيقية" />
                      )}
                    </div>
                    <span className="text-[10px] opacity-80">
                      {hasEntries ? `${w.entries.length} مهام موثقة` : 'مؤجل / فارغ'}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={scrollLeft}
              className="p-2.5 rounded-xl bg-bg hover:bg-line text-ink border border-line transition-all shadow-xs shrink-0 z-10 hover:scale-105"
              title="التمرير يساراً"
            >
              <ChevronLeft className="w-4 h-4 text-ink" />
            </button>
          </div>
        </div>

        {/* Selected Week View */}
        {isLoading ? (
          <div className="text-center py-12 text-sub text-sm">جارٍ تحميل تقرير الأسبوع...</div>
        ) : (
          <div className="space-y-6">
            {/* Header info with Next / Previous Week Jumpers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-bg rounded-xl border border-line">
              <div>
                <span className="text-xs text-sub font-bold block">فترة الأسبوع المحددة:</span>
                <span className="text-sm font-extrabold text-ink">
                  {weekReport ? `${formatDateArabic(weekReport.weekStart)} إلى ${formatDateArabic(weekReport.weekEnd)}` : '—'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Previous Week Button */}
                <button
                  disabled={!prevWeek}
                  onClick={() => prevWeek && setSelectedWeek(prevWeek.weekStart)}
                  className="px-3 py-1.5 rounded-xl border border-line bg-card hover:bg-line text-xs font-bold text-ink disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                  title={prevWeek ? `الانتقال للأسبوع ${prevWeek.weekIndex}` : 'لا يوجد أسبوع سابق'}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>الأسبوع السابق</span>
                </button>

                {/* Next Week Button */}
                <button
                  disabled={!nextWeek}
                  onClick={() => nextWeek && setSelectedWeek(nextWeek.weekStart)}
                  className="px-3 py-1.5 rounded-xl border border-line bg-card hover:bg-line text-xs font-bold text-ink disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                  title={nextWeek ? `الانتقال للأسبوع ${nextWeek.weekIndex}` : 'لا يوجد أسبوع تالٍ'}
                >
                  <span>الأسبوع التالي</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {currentWeekObj && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold mr-2 ${
                      currentWeekObj.status === 'completed'
                        ? 'bg-ok-bg text-ok'
                        : currentWeekObj.status === 'in_progress'
                          ? 'bg-accent-dim text-accent'
                          : 'bg-warn-bg text-warn'
                    }`}
                  >
                    {currentWeekObj.status === 'completed' ? 'منجز ومعتمد' : currentWeekObj.status === 'in_progress' ? 'قيد التنفيذ' : 'مؤجل'}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-bg border border-line rounded-xl p-4">
                <div className="flex items-center justify-between text-sub mb-1">
                  <span className="text-xs font-bold">أيام العمل المنجزة</span>
                  <Calendar className="w-4 h-4 text-accent" />
                </div>
                <div className="text-2xl font-black text-ink">{weekReport?.totalDays || 0}</div>
                <div className="text-[11px] text-sub mt-0.5">أيام موثقة بالأسبوع</div>
              </div>

              <div className="bg-accent-dim/30 border border-accent/20 rounded-xl p-4">
                <div className="flex items-center justify-between text-sub mb-1">
                  <span className="text-xs font-bold">المهام الميدانية المنفذة</span>
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                </div>
                <div className="text-2xl font-black text-accent">{weekReport?.totalTasks || 0}</div>
                <div className="text-[11px] text-sub mt-0.5">مهمة مسجلة في هذا الأسبوع</div>
              </div>
            </div>

            {/* Section Header with Add New Day/Task Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <h3 className="text-sm font-extrabold text-ink flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-accent" />
                  <span>جدول المهام والسرد اليومي للأسبوع</span>
                </h3>
                <p className="text-xs text-sub mt-0.5">
                  يمكنك تعديل أي يوم، إعادة صياغة التفاصيل، أو إضافة مهام جديدة بحرية تامة
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddDay}
                className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة يوم / مهمة لهذا الأسبوع</span>
              </button>
            </div>

            {/* Weekly Entries Table with Full Editing Options */}
            {!weekReport?.entries || weekReport.entries.length === 0 ? (
              <div className="border border-dashed border-line rounded-2xl p-8 text-center space-y-4 bg-bg/50">
                <Clock className="w-9 h-9 text-warn mx-auto opacity-75" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-ink">
                    {currentWeekObj ? `الأسبوع ${currentWeekObj.weekIndex}` : 'هذا الأسبوع'} مؤجل أو لم تُسجل به مهام بعد
                  </h3>
                  <p className="text-xs text-sub max-w-md mx-auto leading-relaxed">
                    يمكنك كتابة وتوثيق مهام وأيام هذا الأسبوع الآن مباشرةً بالنقر على الزر أدناه:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddDay}
                  className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة أول يوم ومهمة للأسبوع</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-line rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-bg text-sub font-bold border-b border-line">
                    <tr>
                      <th className="py-3 px-4 w-28">التاريخ</th>
                      <th className="py-3 px-4 w-52">العنوان / التصنيف</th>
                      <th className="py-3 px-4">تفاصيل وسرد الإنجاز الأكاديمي</th>
                      <th className="py-3 px-3 w-24 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {weekReport.entries.map((entry: EntryDTO) => (
                      <tr key={entry.id} className="hover:bg-bg/40 transition-colors group">
                        <td className="py-3 px-4 font-bold text-ink whitespace-nowrap align-top">
                          {formatDateArabic(entry.entryDate)}
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
                              title="تعديل هذا اليوم / المهمة"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-1.5 rounded-lg bg-bg hover:bg-warn-bg text-sub hover:text-warn border border-line transition-all"
                              title="حذف المهمة"
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
          <div className="bg-card border border-line rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in text-right">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-bg">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-extrabold text-ink">
                  {editingEntry.id ? 'تعديل بيانات وسرد اليوم' : 'إضافة يوم ومهمة جديدة للأسبوع'}
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
                  <label className="block font-bold text-sub">تاريخ اليوم التدريبي</label>
                  <input
                    type="date"
                    required
                    value={editingEntry.entryDate || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, entryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-sub">التصنيف الفني</label>
                  <select
                    value={editingEntry.category || 'تطوير / برمجة'}
                    onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value as EntryDTO['category'] })}
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink font-bold"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-sub">عنوان المهمة / النشاط الميداني</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: التهيئة العامة والتعريف بسياسات أمن المعلومات"
                  value={editingEntry.title || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink font-semibold"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-sub">التفاصيل والسرد الأكاديمي للمهمة</label>
                  <button
                    type="button"
                    disabled={aiPolishing || !editingEntry.description}
                    onClick={handlePolishDailyText}
                    className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent-dim/60 disabled:opacity-50"
                    title="تنقيح الصياغة لغوياً وتقنياً بأسلوب تقرير أكاديمي"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{aiPolishing ? 'جارٍ التنقيح...' : 'تنقيح الصياغة (AI)'}</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  required
                  placeholder="اكتب شرحاً وافياً للمهام التي قمت بإنجازها، الأدوات المستخدمة، والنتائج المتحققة..."
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
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
