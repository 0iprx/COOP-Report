import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  Printer,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  Building,
  GraduationCap,
  Calendar,
  Clock,
  Edit3
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { periodicReportsService } from '../../services/periodicReportsService';
import {
  SavedPeriodicReport,
  PeriodicShiftInterval,
  FinalReportData,
  formatDateArabic,
  formatDateEnglish,
  calculateHoursBetween,
  normalizeStudentName
} from '@coop/shared';

// Helper to format 24-hour time string into a clean 12-hour display
const formatTimeString = (time: string, isAr: boolean): string => {
  if (!time) return '—';
  const parts = time.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  if (isNaN(h)) return time;
  const isPM = h >= 12;
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  const period = isPM ? (isAr ? 'مساءً' : 'PM') : (isAr ? 'صباحاً' : 'AM');
  return `${h}:${m} ${period}`;
};

export const PeriodicTab: React.FC = () => {
  const { t, isAr } = useLanguage();
  const queryClient = useQueryClient();

  // Toast feedback
  const [saveToast, setSaveToast] = useState<string>('');
  const [errorToast, setErrorToast] = useState<string>('');

  // Logo file upload refs for Cover Page
  const institutionLogoInputRef = useRef<HTMLInputElement>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);

  // Saved Periodic Reports State
  const [savedPeriodicReports, setSavedPeriodicReports] = useState<SavedPeriodicReport[]>(() =>
    periodicReportsService.getSavedReports()
  );

  const [activePeriodicReport, setActivePeriodicReport] = useState<SavedPeriodicReport>(() => {
    const list = periodicReportsService.getSavedReports();
    const activeId = periodicReportsService.getActiveReportId();
    const found = list.find((r) => r.id === activeId);
    if (found) return found;
    if (list.length > 0) return list[0];
    const def = periodicReportsService.createDefaultReport();
    periodicReportsService.saveReport(def);
    return def;
  });

  // Fetch final report to get the trainee profile and logos
  const { data: finalReportData } = useQuery<FinalReportData>({
    queryKey: ['finalReport'],
    queryFn: async () => {
      const res = await api.get('/reports/final');
      return res.data;
    }
  });

  const profile = finalReportData?.profile || ({} as any);
  const entityName = profile?.entityAddress || (isAr ? 'جهة التدريب التعاوني' : 'Training Organization');

  // Normalize intervals: ensure at least one interval exists
  const activeIntervals: PeriodicShiftInterval[] = useMemo(() => {
    if (activePeriodicReport.intervals && activePeriodicReport.intervals.length > 0) {
      return activePeriodicReport.intervals;
    }
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'int_1',
        label: isAr ? 'الفترة الأولى' : 'Interval 1',
        startDate: activePeriodicReport.startDate || today,
        endDate: activePeriodicReport.endDate || today,
        timeFrom: '08:00',
        timeTo: '14:00'
      }
    ];
  }, [activePeriodicReport.intervals, activePeriodicReport.startDate, activePeriodicReport.endDate, isAr]);

  // Overall dates bounds for display
  const overallStartDate = activeIntervals[0]?.startDate || activePeriodicReport.startDate || '';
  const overallEndDate = activeIntervals[activeIntervals.length - 1]?.endDate || activePeriodicReport.endDate || '';

  // Format overall period label
  const customPeriodLabel = useMemo(() => {
    if (overallStartDate && overallEndDate) {
      return isAr
        ? `من ${formatDateArabic(overallStartDate)} إلى ${formatDateArabic(overallEndDate)}`
        : `From ${formatDateEnglish(overallStartDate)} to ${formatDateEnglish(overallEndDate)}`;
    }
    return isAr ? 'فترة التكليف والتدريب الميداني' : 'Field Assignment Period';
  }, [overallStartDate, overallEndDate, isAr]);

  // Handlers for updating active report
  const handleUpdateReport = (updates: Partial<SavedPeriodicReport>) => {
    setActivePeriodicReport((prev) => {
      const next = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      // Auto-persist to storage
      periodicReportsService.saveReport(next);
      return next;
    });
  };

  // Add interval handler
  const handleAddInterval = () => {
    const last = activeIntervals[activeIntervals.length - 1];
    let nextStartDate = new Date().toISOString().split('T')[0];
    if (last?.endDate) {
      const d = new Date(last.endDate);
      d.setDate(d.getDate() + 1);
      if (!isNaN(d.getTime())) {
        nextStartDate = d.toISOString().split('T')[0];
      }
    }

    const newInt: PeriodicShiftInterval = {
      id: `int_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: isAr ? `الفترة ${activeIntervals.length + 1}` : `Interval ${activeIntervals.length + 1}`,
      startDate: nextStartDate,
      endDate: nextStartDate,
      timeFrom: last?.timeFrom || '08:00',
      timeTo: last?.timeTo || '14:00'
    };

    const nextIntervals = [...activeIntervals, newInt];
    handleUpdateReport({
      intervals: nextIntervals,
      startDate: nextIntervals[0].startDate,
      endDate: nextIntervals[nextIntervals.length - 1].endDate
    });
  };

  // Remove interval handler
  const handleRemoveInterval = (id: string) => {
    if (activeIntervals.length <= 1) return;
    const nextIntervals = activeIntervals.filter((i) => i.id !== id);
    handleUpdateReport({
      intervals: nextIntervals,
      startDate: nextIntervals[0]?.startDate,
      endDate: nextIntervals[nextIntervals.length - 1]?.endDate
    });
  };

  // Update specific interval handler
  const handleUpdateInterval = (id: string, updates: Partial<PeriodicShiftInterval>) => {
    const nextIntervals = activeIntervals.map((i) => {
      if (i.id === id) {
        return { ...i, ...updates };
      }
      return i;
    });
    handleUpdateReport({
      intervals: nextIntervals,
      startDate: nextIntervals[0]?.startDate,
      endDate: nextIntervals[nextIntervals.length - 1]?.endDate
    });
  };

  // Save Current Report
  const handleSaveCurrentReport = () => {
    const updated = periodicReportsService.saveReport(activePeriodicReport);
    setSavedPeriodicReports(updated);
    setSaveToast(t('تم حفظ التقرير الفتري بنجاح!', 'Periodic report saved successfully!'));
    setTimeout(() => setSaveToast(''), 3000);
  };

  // Create New Report
  const handleCreateNewReport = () => {
    const today = new Date().toISOString().split('T')[0];
    const newRep = periodicReportsService.createDefaultReport(today, today);
    newRep.title = isAr ? 'تقرير فترة التكليف' : 'Field Assignment Report';
    newRep.roleAssignment = isAr ? 'موظف رسمي في بيئة العمل' : 'Official Employee';
    const updated = periodicReportsService.saveReport(newRep);
    setSavedPeriodicReports(updated);
    setActivePeriodicReport(newRep);
    setSaveToast(t('تم إنشاء تقرير فتري جديد!', 'New periodic report created!'));
    setTimeout(() => setSaveToast(''), 3000);
  };

  // Delete Current Report
  const handleDeleteCurrentReport = () => {
    if (savedPeriodicReports.length <= 1) {
      alert(t('لا يمكن حذف التقرير الوحيد', 'Cannot delete the only report.'));
      return;
    }
    if (!window.confirm(t('هل أنت متأكد من حذف هذا التقرير الفتري؟', 'Delete this report?'))) return;
    const updated = periodicReportsService.deleteReport(activePeriodicReport.id);
    setSavedPeriodicReports(updated);
    if (updated.length > 0) {
      setActivePeriodicReport(updated[0]);
    }
    setSaveToast(t('تم حذف التقرير بنجاح', 'Report deleted successfully'));
    setTimeout(() => setSaveToast(''), 3000);
  };

  // Switch Report
  const handleSelectReport = (report: SavedPeriodicReport) => {
    setActivePeriodicReport(report);
    periodicReportsService.setActiveReportId(report.id);
  };

  // Logo file uploads
  const handleUploadLogo = async (type: 'institution' | 'company', file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorToast(t('حجم الشعار كبير جداً (الحد الأقصى 5 ميجابايت)', 'Logo file too large (max 5MB)'));
      setTimeout(() => setErrorToast(''), 3000);
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        await api.post('/reports/profile', {
          [type === 'institution' ? 'institutionLogo' : 'companyLogo']: base64Data
        });
        await queryClient.invalidateQueries({ queryKey: ['finalReport'] });
        setSaveToast(t('تم تحديث الشعار بنجاح!', 'Logo updated successfully!'));
        setTimeout(() => setSaveToast(''), 3000);
      };
      reader.readAsDataURL(file);
    } catch {
      setErrorToast(t('تعذر رفع الشعار', 'Failed to upload logo'));
      setTimeout(() => setErrorToast(''), 3000);
    }
  };

  // Print PDF
  const handlePrintPDF = () => {
    window.print();
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

      {/* ── Main Clean Container ─────────────────────────────────── */}
      <div className="bg-card border border-line rounded-2xl p-4 sm:p-6 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:bg-transparent">
        
        {/* ── Simple, Clean Top Header (Uncluttered, No extra buttons) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-line no-print">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-accent-dim text-accent">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-base font-extrabold text-ink">
              {t('التقرير الفتري', 'Periodic Report')}
            </h2>
          </div>

          {/* Clean Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Select saved report if multiple exist */}
            {savedPeriodicReports.length > 1 && (
              <select
                value={activePeriodicReport.id}
                onChange={(e) => {
                  const target = savedPeriodicReports.find((r) => r.id === e.target.value);
                  if (target) handleSelectReport(target);
                }}
                className="px-3 py-1.5 bg-bg border border-line rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-accent cursor-pointer shadow-2xs"
                title={t('اختر تقريراً فتروياً محفوظاً', 'Select saved report')}
              >
                {savedPeriodicReports.map((r, rIdx) => (
                  <option key={r.id} value={r.id}>
                    {r.title || `تقرير ${rIdx + 1}`} ({r.startDate} إلى {r.endDate})
                  </option>
                ))}
              </select>
            )}

            {/* Create New Report */}
            <button
              type="button"
              onClick={handleCreateNewReport}
              className="px-3 py-1.5 rounded-xl bg-bg hover:bg-line border border-line text-xs font-bold text-ink flex items-center gap-1.5 transition-all shadow-2xs"
              title={t('إنشاء تقرير فتري جديد', 'New Periodic Report')}
            >
              <Plus className="w-3.5 h-3.5 text-accent" />
              <span>{t('تقرير جديد', 'New Report')}</span>
            </button>

            {/* Save Report */}
            <button
              type="button"
              onClick={handleSaveCurrentReport}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title={t('حفظ التقرير', 'Save Report')}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('حفظ', 'Save')}</span>
            </button>

            {/* Delete Report (if > 1) */}
            {savedPeriodicReports.length > 1 && (
              <button
                type="button"
                onClick={handleDeleteCurrentReport}
                className="p-2 rounded-xl bg-bg hover:bg-warn-bg text-sub hover:text-warn border border-line transition-all shadow-2xs"
                title={t('حذف هذا التقرير', 'Delete Report')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Print / Save PDF */}
            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-4 py-1.5 text-xs font-bold text-white bg-ink hover:bg-ink/85 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title={t('طباعة التقرير الفتري أو حفظه كـ PDF رسمي', 'Print report or save as PDF')}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('طباعة / حفظ PDF', 'Print / Save PDF')}</span>
            </button>
          </div>
        </div>

        {/* ── Editor Form (Hidden in Print: no-print) ──────────────── */}
        <div className="space-y-4 no-print mb-8">
          
          {/* Card 1: General Info */}
          <div className="p-4 bg-bg border border-line rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-sub">
                  {t('عنوان التقرير:', 'Report Title:')}
                </label>
                <input
                  type="text"
                  value={activePeriodicReport.title}
                  onChange={(e) => handleUpdateReport({ title: e.target.value })}
                  placeholder="تقرير فترة التكليف بالقسم"
                  className="w-full px-3 py-1.5 bg-card border border-line rounded-lg font-bold text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-black text-sub">
                  {t('القسم / الإدارة المعنية:', 'Department:')}
                </label>
                <input
                  type="text"
                  value={activePeriodicReport.department || ''}
                  onChange={(e) => handleUpdateReport({ department: e.target.value })}
                  placeholder="قسم الدعم الفني / الشبكات"
                  className="w-full px-3 py-1.5 bg-card border border-line rounded-lg font-bold text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-black text-sub">
                  {t('المسمى / نطاق التكليف بالفترة:', 'Role / Assignment:')}
                </label>
                <input
                  type="text"
                  value={activePeriodicReport.roleAssignment || ''}
                  onChange={(e) => handleUpdateReport({ roleAssignment: e.target.value })}
                  placeholder="موظف رسمي في بيئة العمل"
                  className="w-full px-3 py-1.5 bg-card border border-line rounded-lg font-bold text-ink focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Work Periods / Intervals (من يوم كذا إلى كذا ومن الساعة كم إلى كم) */}
          <div className="p-4 bg-bg border border-line rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-black text-ink">
                  {t('فترات ومواعيد الدوام والتكليف:', 'Scheduled Work Intervals & Shifts:')}
                </h3>
                <span className="text-[10px] text-sub font-bold">
                  ({t('حدد الفترات: من يوم كذا إلى كذا ومن الساعة كم إلى كم', 'Specify dates and hours for each period')})
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddInterval}
                className="px-3 py-1 bg-accent text-white rounded-lg text-xs font-bold hover:bg-accent/90 transition-all flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('إضافة فترة / موعد آخر', 'Add Another Period')}</span>
              </button>
            </div>

            {/* Intervals List */}
            <div className="space-y-2.5">
              {activeIntervals.map((interval, index) => {
                const hours = calculateHoursBetween(interval.timeFrom || '08:00', interval.timeTo || '14:00');
                return (
                  <div
                    key={interval.id || index}
                    className="p-3 bg-card border border-line rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    {/* Interval Label */}
                    <div className="w-full md:w-36">
                      <input
                        type="text"
                        value={interval.label || `الفترة ${index + 1}`}
                        onChange={(e) => handleUpdateInterval(interval.id, { label: e.target.value })}
                        placeholder={`الفترة ${index + 1}`}
                        className="w-full px-2.5 py-1.5 bg-bg border border-line rounded-lg font-black text-accent text-xs"
                      />
                    </div>

                    {/* From Date to Date */}
                    <div className="flex items-center gap-1.5 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-sub">{t('من:', 'From:')}</span>
                        <input
                          type="date"
                          value={interval.startDate}
                          onChange={(e) => handleUpdateInterval(interval.id, { startDate: e.target.value })}
                          className="px-2 py-1 bg-bg border border-line rounded-lg font-bold text-ink text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-sub">{t('إلى:', 'To:')}</span>
                        <input
                          type="date"
                          value={interval.endDate}
                          onChange={(e) => handleUpdateInterval(interval.id, { endDate: e.target.value })}
                          className="px-2 py-1 bg-bg border border-line rounded-lg font-bold text-ink text-xs"
                        />
                      </div>
                    </div>

                    {/* Time From to Time To */}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sub shrink-0" />
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-sub">{t('الساعة:', 'Time:')}</span>
                        <input
                          type="time"
                          value={interval.timeFrom || '08:00'}
                          onChange={(e) => handleUpdateInterval(interval.id, { timeFrom: e.target.value })}
                          className="px-2 py-1 bg-bg border border-line rounded-lg font-bold text-ink text-xs"
                        />
                      </div>
                      <span className="text-sub">-</span>
                      <input
                        type="time"
                        value={interval.timeTo || '14:00'}
                        onChange={(e) => handleUpdateInterval(interval.id, { timeTo: e.target.value })}
                        className="px-2 py-1 bg-bg border border-line rounded-lg font-bold text-ink text-xs"
                      />
                    </div>

                    {/* Hours Badge & Delete */}
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-accent-dim text-accent shrink-0">
                        {hours} {isAr ? 'ساعات يومياً' : 'hrs/day'}
                      </span>

                      {activeIntervals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInterval(interval.id)}
                          className="p-1.5 text-sub hover:text-warn hover:bg-warn-bg rounded-lg border border-line transition-colors"
                          title={t('حذف هذه الفترة', 'Remove Period')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Freehand Narrative ("وبعده اكتب السرد التقرير لانه يكون للفتره كاملة") */}
          <div className="p-4 bg-bg border border-line rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-ink flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-accent" />
                <span>{t('سرد وتفاصيل التقرير للفترة كاملة (وش سويت بالضبط بالفترة):', 'Comprehensive Period Report Narrative:')}</span>
              </label>
              <span className="text-[10px] text-sub font-bold">
                {activePeriodicReport.customNarrative?.trim().length || 0} {isAr ? 'حرف' : 'chars'}
              </span>
            </div>

            <textarea
              value={activePeriodicReport.customNarrative}
              onChange={(e) => handleUpdateReport({ customNarrative: e.target.value })}
              rows={5}
              placeholder={
                isAr
                  ? `اكتب هنا سرد التقرير للفترة كاملة... مثلاً:\nخلال هذه الفترات من التكليف، تم العمل كموظف رسمي في قسم ... وتوليت المهام والمسؤوليات التالية:\n1. ...\n2. ...\nوقد تم إنجاز الأعمال التشغيلية وتطبيق المهارات المكتسبة بنجاح.`
                  : `Write the comprehensive narrative for the entire period here... e.g.:\nDuring these periods, assigned as an official employee in the department, executing the following core responsibilities and tasks...`
              }
              className="w-full p-3.5 bg-card border border-line rounded-xl text-xs sm:text-sm text-ink leading-relaxed font-normal focus:outline-none focus:border-accent transition-colors resize-y shadow-inner"
            />
          </div>
        </div>

        {/* ── Printable Paper View: #periodic-paper-view ───────────── */}
        <div id="periodic-paper-view" className="space-y-6">

          {/* ══════════════════════════════════════════════════════════════
              Official General Institutional Cover & Report Document
             ══════════════════════════════════════════════════════════════ */}
          <section
            id="periodic-cover-page"
            className="bg-card border border-line rounded-2xl p-6 sm:p-8 print:p-0 print:border-none print:shadow-none print:rounded-none min-h-[620px] print:min-h-[265mm] flex flex-col justify-between"
          >
            <div>
              {/* Header: Kingdom Header & Dual Logos */}
              <div className="flex items-center justify-between pb-4 border-b border-line gap-4">
                {/* Right: Institution Info / Logo */}
                <div className="text-right flex items-center gap-3">
                  {profile.institutionLogo ? (
                    <img
                      src={profile.institutionLogo}
                      alt="Institution Logo"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg border border-line print:border-none shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-accent-dim text-accent flex items-center justify-center font-black text-xs shrink-0 print:border print:border-slate-300">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="text-[11px] font-black text-ink">{isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}</div>
                    <div className="text-[10px] text-sub font-bold">{isAr ? 'وزارة التعليم' : 'Ministry of Education'}</div>
                    <div className="text-[10px] text-accent font-black">{profile.trainingUnit || (isAr ? 'الكلية / الجامعة' : 'College / University')}</div>
                  </div>
                </div>

                {/* Upload logo buttons (no-print) */}
                <div className="no-print flex items-center gap-1.5">
                  <input
                    type="file"
                    ref={institutionLogoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUploadLogo('institution', e.target.files[0])}
                  />
                  <input
                    type="file"
                    ref={companyLogoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUploadLogo('company', e.target.files[0])}
                  />
                  <button
                    type="button"
                    onClick={() => institutionLogoInputRef.current?.click()}
                    className="px-2 py-1 text-[10px] font-bold text-sub hover:text-ink bg-bg rounded-lg border border-line"
                    title="تغيير شعار الجامعة أو الكلية"
                  >
                    {isAr ? 'شعار الجامعة' : 'Uni Logo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => companyLogoInputRef.current?.click()}
                    className="px-2 py-1 text-[10px] font-bold text-sub hover:text-ink bg-bg rounded-lg border border-line"
                    title="تغيير شعار جهة التدريب"
                  >
                    {isAr ? 'شعار الجهة' : 'Co Logo'}
                  </button>
                </div>

                {/* Left: Training Company Logo */}
                <div className="text-left flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-[11px] font-black text-ink">{profile.entityAddress || entityName}</div>
                    <div className="text-[10px] text-sub font-bold">{activePeriodicReport.department || (isAr ? 'الإدارة المعنية' : 'Department')}</div>
                  </div>
                  {profile.companyLogo ? (
                    <img
                      src={profile.companyLogo}
                      alt="Company Logo"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg border border-line print:border-none shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-accent-dim text-accent flex items-center justify-center font-black text-xs shrink-0 print:border print:border-slate-300">
                      <Building className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>

              {/* Main Report Title Banner */}
              <div className="text-center py-4 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-accent text-white shadow-2xs">
                  <span>{customPeriodLabel}</span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-ink tracking-tight pt-1">
                  {activePeriodicReport.title || (isAr ? 'تقرير التدريب الميداني للفترة المحددة' : 'Periodic Field Report')}
                </h1>
                <p className="text-xs text-sub font-bold">
                  {isAr
                    ? `توثيق رسمي صادر لمهام المتدرب بجهة التدريب: ${profile.entityAddress || entityName}`
                    : `Official field documentation issued for: ${profile.entityAddress || entityName}`}
                </p>
              </div>

              {/* Trainee Information Matrix */}
              <div className="bg-bg border border-line rounded-xl p-3 sm:p-4 text-start grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs trainee-matrix-print print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/60 print:p-2.5 print:gap-x-4 print:gap-y-1.5">
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'اسم المتدرب:' : 'Trainee Name:'}</span>
                  <span className="font-black text-ink">{normalizeStudentName(profile.studentName) || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'الرقم الأكاديمي:' : 'Student ID:'}</span>
                  <span className="font-black text-ink">{profile.trainingNumber || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'القسم / التخصص:' : 'Major / Specialization:'}</span>
                  <span className="font-black text-ink">{profile.department || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'المشرف الميداني:' : 'Field Supervisor:'}</span>
                  <span className="font-black text-ink">{profile.responsibleName || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'الإدارة / القسم الميداني:' : 'Field Department:'}</span>
                  <span className="font-black text-accent">{activePeriodicReport.department || profile.entityAddress || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'الصفة ونطاق التكليف:' : 'Operational Role:'}</span>
                  <span className="font-black text-ink">{activePeriodicReport.roleAssignment || (isAr ? 'موظف رسمي في بيئة العمل' : 'Official Employee')}</span>
                </div>
              </div>

              {/* Work Intervals Official Table (جدول فترات ومواعيد الدوام المعتمدة) */}
              <div className="mt-4 p-3 bg-bg border border-line rounded-xl space-y-2 text-start print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/40 print:p-2.5 shadow-2xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-line/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-black text-ink">
                      {isAr ? '■ جدول فترات ومواعيد التكليف والدوام المعتمدة:' : '■ Authorized Assignment Schedule & Shift Intervals:'}
                    </span>
                  </div>
                  <span className="text-[10px] text-accent font-bold px-2 py-0.5 rounded-md bg-accent-dim">
                    {activeIntervals.length} {isAr ? 'فترات محددة' : 'intervals'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-ink text-start border-collapse">
                    <thead>
                      <tr className="border-b border-line/80 text-[11px] font-black text-sub bg-slate-100/50 dark:bg-slate-800/40 print:bg-slate-100">
                        <th className="py-1.5 px-2 text-start">#</th>
                        <th className="py-1.5 px-2 text-start">{isAr ? 'مسمى الفترة' : 'Period / Shift'}</th>
                        <th className="py-1.5 px-2 text-start">{isAr ? 'من تاريخ' : 'From Date'}</th>
                        <th className="py-1.5 px-2 text-start">{isAr ? 'إلى تاريخ' : 'To Date'}</th>
                        <th className="py-1.5 px-2 text-start">{isAr ? 'أوقات الدوام' : 'Shift Hours'}</th>
                        <th className="py-1.5 px-2 text-center">{isAr ? 'الساعات اليومية' : 'Daily Hours'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/40">
                      {activeIntervals.map((interval, iIdx) => {
                        const h = calculateHoursBetween(interval.timeFrom || '08:00', interval.timeTo || '14:00');
                        return (
                          <tr key={interval.id || iIdx} className="hover:bg-line/20">
                            <td className="py-2 px-2 font-bold text-sub">{iIdx + 1}</td>
                            <td className="py-2 px-2 font-black text-ink">{interval.label || `الفترة ${iIdx + 1}`}</td>
                            <td className="py-2 px-2 font-bold text-ink">{isAr ? formatDateArabic(interval.startDate) : formatDateEnglish(interval.startDate)}</td>
                            <td className="py-2 px-2 font-bold text-ink">{isAr ? formatDateArabic(interval.endDate) : formatDateEnglish(interval.endDate)}</td>
                            <td className="py-2 px-2 font-bold text-sub">
                              {formatTimeString(interval.timeFrom || '08:00', isAr)} - {formatTimeString(interval.timeTo || '14:00', isAr)}
                            </td>
                            <td className="py-2 px-2 text-center font-black text-accent">{h} {isAr ? 'ساعات' : 'hrs'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Freehand Comprehensive Narrative Card (سرد التقرير للفترة كاملة) */}
              <div className="mt-4 p-3.5 sm:p-4 bg-bg border border-accent/30 rounded-xl space-y-2 text-start print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/40 print:p-3 shadow-2xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-line/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs font-black text-ink">
                      {isAr ? '■ بيان وسرد التقرير الشامل للفترة (المهام والأعمال المنفذة):' : '■ Comprehensive Narrative & Completed Operations:'}
                    </span>
                  </div>
                  <span className="text-[10px] text-accent font-bold px-2 py-0.5 rounded-md bg-accent-dim">
                    {isAr ? 'توثيق رسمي معتمد' : 'Official Record'}
                  </span>
                </div>

                <div className="text-xs font-medium text-ink leading-relaxed whitespace-pre-line text-justify print:text-[10pt] print:leading-[1.75]">
                  {activePeriodicReport.customNarrative?.trim() || (
                    <span className="text-sub italic">
                      {isAr
                        ? `خلال هذه الفترات الممتدة من ${customPeriodLabel}، تم التكليف بالعمل الميداني كـ ${activePeriodicReport.roleAssignment || 'موظف رسمي في بيئة العمل'} في ${activePeriodicReport.department || entityName}، حيث تم إنجاز حزمة من المهام التشغيلية والهندسية المتخصصة وحضور اللقاءات التنسيقية وتطبيق أعلى معايير الجودة والسلامة المهنية.`
                        : `During these periods (${customPeriodLabel}), assigned as ${activePeriodicReport.roleAssignment || 'Official Employee'} at ${activePeriodicReport.department || entityName}, successfully accomplishing operational and technical tasks.`}
                    </span>
                  )}
                </div>
              </div>

              {/* Official Supervisory Endorsements & Signatures Block */}
              <div className="mt-5 p-3.5 bg-bg border border-line rounded-xl text-start print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/50 print:p-3 shadow-2xs">
                <div className="text-center font-black text-xs text-ink mb-3 pb-1 border-b border-line/60">
                  {isAr ? 'مصادقة واعتماد التقرير الميداني الرسمي' : 'Official Supervisory Endorsements'}
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  {/* Trainee Signature */}
                  <div className="space-y-1">
                    <div className="font-bold text-sub text-[11px]">{isAr ? 'توقيع المتدرب' : 'Trainee Signature'}</div>
                    <div className="font-black text-ink">{normalizeStudentName(profile.studentName) || '—'}</div>
                    <div className="h-9 border-b border-dashed border-line/80 print:h-8" />
                  </div>

                  {/* Field Supervisor */}
                  <div className="space-y-1">
                    <div className="font-bold text-sub text-[11px]">{isAr ? 'المشرف الميداني (جهة التدريب)' : 'Field Supervisor'}</div>
                    <div className="font-black text-ink">{profile.responsibleName || '—'}</div>
                    <div className="h-9 border-b border-dashed border-line/80 print:h-8" />
                  </div>

                  {/* Academic Supervisor */}
                  <div className="space-y-1">
                    <div className="font-bold text-sub text-[11px]">{isAr ? 'مشرف التدريب (الجامعة)' : 'Academic Supervisor'}</div>
                    <div className="font-black text-ink">{profile.supervisorName || '—'}</div>
                    <div className="h-9 border-b border-dashed border-line/80 print:h-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Page Footer */}
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[10px] text-sub font-bold">
              <span>{isAr ? 'المملكة العربية السعودية — تقرير التدريب الميداني للفترة' : 'KSA — Periodic Field Training Report'}</span>
              <span className="font-black text-accent">{isAr ? 'صفحة 1 من 1' : 'Page 1 of 1'}</span>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
