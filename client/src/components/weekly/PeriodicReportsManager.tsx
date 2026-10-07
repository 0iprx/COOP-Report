import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Save,
  Trash2,
  Plus,
  Clock,
  FileText,
  CheckCircle2,
  Check,
  AlertCircle,
  Edit3,
  Layers,
  ChevronDown,
  Building,
  UserCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SavedPeriodicReport, EntryDTO, formatDateArabic, formatDateEnglish, generateAcademicWeeklySynthesis } from '@coop/shared';
import { api } from '../../services/api';

interface PeriodicReportsManagerProps {
  currentReport: SavedPeriodicReport;
  savedReportsList: SavedPeriodicReport[];
  activeEntries: EntryDTO[];
  activeTotalHours: number;
  activeTotalDays: number;
  onSelectReport: (report: SavedPeriodicReport) => void;
  onUpdateReport: (updated: Partial<SavedPeriodicReport>) => void;
  onSaveCurrentReport: () => void;
  onCreateNewReport: () => void;
  onDeleteCurrentReport: () => void;
  allDocumentedEntries: EntryDTO[];
}

export const PeriodicReportsManager: React.FC<PeriodicReportsManagerProps> = ({
  currentReport,
  savedReportsList,
  activeEntries,
  activeTotalHours,
  activeTotalDays,
  onSelectReport,
  onUpdateReport,
  onSaveCurrentReport,
  onCreateNewReport,
  onDeleteCurrentReport,
  allDocumentedEntries
}) => {
  const { t, isAr } = useLanguage();
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [managerCollapsed, setManagerCollapsed] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string>('');

  // Auto-generate a comprehensive technical synthesis from logged tasks for this period
  const handleAutoDraft = () => {
    setIsDrafting(true);
    try {
      const synthesis = generateAcademicWeeklySynthesis(
        activeEntries,
        currentReport.title || (isAr ? 'تقرير الفترة المحددة' : 'Periodic Report'),
        activeTotalHours,
        isAr
      );

      const periodStr = isAr
        ? `خلال هذه الفترة التدريبية (من تاريخ ${formatDateArabic(currentReport.startDate)} إلى ${formatDateArabic(currentReport.endDate)})`
        : `During this training timeframe (from ${formatDateEnglish(currentReport.startDate)} to ${formatDateEnglish(currentReport.endDate)})`;

      const roleStr = currentReport.roleAssignment
        ? (isAr ? `، تم العمل والمباشرة الميدانية كـ (${currentReport.roleAssignment})` : `, worked as (${currentReport.roleAssignment})`)
        : '';

      const deptStr = currentReport.department
        ? (isAr ? ` في ${currentReport.department}` : ` in ${currentReport.department}`)
        : '';

      const draftedNarrative = `${periodStr}${roleStr}${deptStr}، حيث باشرنا تنفيذ المهام الميدانية والتشغيلية الموكلة بدقة ومهنية عالية وفق المعايير المؤسسية.\n\n${synthesis.executiveSummary}\n\n${synthesis.fullNarrative}`.trim();

      onUpdateReport({ customNarrative: draftedNarrative });
      setFeedbackToast(t('تم توليد مسودة السرد الفتروي بنجاح استناداً لمهام الفترة!', 'Auto-draft generated successfully from period tasks!'));
      setTimeout(() => setFeedbackToast(''), 3000);
    } catch {
      setFeedbackToast(t('تعذر توليد المسودة', 'Failed to generate draft'));
      setTimeout(() => setFeedbackToast(''), 3000);
    } finally {
      setIsDrafting(false);
    }
  };

  // Polish the user's handwritten narrative with AI
  const handlePolishNarrative = async () => {
    if (!currentReport.customNarrative.trim()) return;
    setIsPolishing(true);
    try {
      const res = await api.post('/ai/process', {
        text: currentReport.customNarrative,
        action: 'polish',
        targetLang: isAr ? 'ar' : 'en'
      });
      if (res.data?.result) {
        onUpdateReport({ customNarrative: res.data.result });
        setFeedbackToast(t('تم تنقيح الصياغة بنجاح مع الحفاظ على كافة تفاصيلك!', 'Polished narrative successfully!'));
        setTimeout(() => setFeedbackToast(''), 3000);
      }
    } catch {
      setFeedbackToast(t('تعذر الاتصال بخدمة التنقيح', 'Failed to polish narrative'));
      setTimeout(() => setFeedbackToast(''), 3000);
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="bg-card border border-line rounded-2xl p-4 sm:p-5 no-print mb-6 shadow-sm space-y-4 text-start">
      {/* Toast Alert */}
      {feedbackToast && (
        <div className="p-3 rounded-xl bg-ok-bg text-ok border border-ok/30 flex items-center gap-2 text-xs font-bold animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header & Report Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-ink flex items-center gap-2">
              <span>{t('إدارة وتوثيق التقارير الفترية المحفوظة', 'Saved Periodic Reports Manager')}</span>
              <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-accent-dim text-accent font-extrabold">
                {savedReportsList.length} {isAr ? 'تقارير فترية' : 'reports'}
              </span>
            </h3>
            <p className="text-[11px] text-sub">
              {t('تقارير مخصصة من تاريخ إلى تاريخ مع إمكانية الكتابة الحرة وحفظها بالتقارير بنفس الغلاف والطباعة', 'Custom date-range reports with freehand writing and cover preservation.')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {savedReportsList.length > 0 && (
            <div className="relative">
              <select
                value={currentReport.id}
                onChange={(e) => {
                  const target = savedReportsList.find(r => r.id === e.target.value);
                  if (target) onSelectReport(target);
                }}
                className="appearance-none pl-8 pr-3 py-1.5 bg-bg border border-line rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-accent cursor-pointer shadow-2xs"
                title={t('اختر تقريراً فتروياً محفوظاً', 'Select saved periodic report')}
              >
                {savedReportsList.map((r, rIdx) => (
                  <option key={r.id} value={r.id}>
                    {r.title || `تقرير فترة ${rIdx + 1}`} ({r.startDate} إلى {r.endDate})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-sub absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <button
            type="button"
            onClick={onCreateNewReport}
            className="px-3 py-1.5 rounded-xl bg-bg hover:bg-line border border-line text-xs font-bold text-ink flex items-center gap-1.5 transition-all shadow-2xs"
            title={t('إنشاء تقرير فتروي جديد', 'New Periodic Report')}
          >
            <Plus className="w-3.5 h-3.5 text-accent" />
            <span>{t('+ تقرير فتروي جديد', '+ New Report')}</span>
          </button>

          <button
            type="button"
            onClick={onSaveCurrentReport}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
            title={t('حفظ التقرير الفتروي الحالي بجميع تعديلاته وسرده الحر', 'Save periodic report')}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('حفظ التقرير بالتقارير', 'Save Report')}</span>
          </button>

          {savedReportsList.some(r => r.id === currentReport.id) && (
            <button
              type="button"
              onClick={onDeleteCurrentReport}
              className="p-1.5 rounded-xl bg-bg hover:bg-warn-bg text-sub hover:text-warn border border-line transition-all shadow-2xs"
              title={t('حذف هذا التقرير الفتروي من السجلات', 'Delete periodic report')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setManagerCollapsed(!managerCollapsed)}
            className="text-xs font-bold text-sub hover:text-ink px-2 py-1 rounded-lg"
          >
            {managerCollapsed ? t('إظهار خيارات التحرير', 'Expand') : t('تصغير', 'Collapse')}
          </button>
        </div>
      </div>

      {!managerCollapsed && (
        <>
          {/* Row 1: Report Title, Dates, Role & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="space-y-1">
              <label className="block text-[11px] font-black text-sub">
                {t('عنوان التقرير الفتروي (يظهر بالغلاف):', 'Report Title on Cover:')}
              </label>
              <input
                type="text"
                value={currentReport.title}
                onChange={(e) => onUpdateReport({ title: e.target.value })}
                placeholder="تقرير التدريب الميداني للفترة المحددة"
                className="w-full px-3 py-1.5 bg-bg border border-line rounded-xl font-bold text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-black text-sub">
                {t('من تاريخ (بداية الفترة):', 'From Date:')}
              </label>
              <input
                type="date"
                value={currentReport.startDate}
                onChange={(e) => onUpdateReport({ startDate: e.target.value })}
                className="w-full px-3 py-1.5 bg-bg border border-line rounded-xl font-bold text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-black text-sub">
                {t('إلى تاريخ (نهاية الفترة):', 'To Date:')}
              </label>
              <input
                type="date"
                value={currentReport.endDate}
                onChange={(e) => onUpdateReport({ endDate: e.target.value })}
                className="w-full px-3 py-1.5 bg-bg border border-line rounded-xl font-bold text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-black text-sub">
                {t('المسمى / التكليف الميداني للفترة:', 'Role / Assignment in Period:')}
              </label>
              <input
                type="text"
                value={currentReport.roleAssignment || ''}
                onChange={(e) => onUpdateReport({ roleAssignment: e.target.value })}
                placeholder="موظف رسمي بقسم الشبكات"
                className="w-full px-3 py-1.5 bg-bg border border-line rounded-xl font-bold text-ink focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Quick Date Range Presets */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
            <span className="text-[11px] font-bold text-sub">{t('فترات سريعة:', 'Presets:')}</span>
            <button
              type="button"
              onClick={() => {
                if (allDocumentedEntries.length > 0) {
                  const sorted = [...allDocumentedEntries].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
                  onUpdateReport({
                    startDate: sorted[0].entryDate,
                    endDate: sorted[sorted.length - 1].entryDate
                  });
                }
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-bg hover:bg-line border border-line text-ink"
            >
              {t('كامل فترة التدريب', 'All Logged Days')}
            </button>
          </div>

          {/* Row 2: Freehand Narrative Editor ("واكتب فيه حر وتحته وش سويت بالضبط بالفتره") */}
          <div className="space-y-2 pt-2 border-t border-line/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-black text-ink flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-accent" />
                  <span>{t('السرد والوصف الميداني للفترة (كتابة يدوية حرة - وش سويت بالضبط بالفترة):', 'Freehand Periodic Field Narrative (What you accomplished):')}</span>
                </label>
                <p className="text-[11px] text-sub">
                  {t('اكتب بحرية ما قمت به خلال هذه الفترة. يظهر هذا النص رسمياً في صندوق الموجز التنفيذي أسفل الغلاف.', 'Write freely. This will be formatted officially in the Executive Summary box on the cover page.')}
                </p>
              </div>

              {/* Action Buttons for Narrative */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleAutoDraft}
                  disabled={isDrafting || activeEntries.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent text-xs font-black flex items-center gap-1.5 transition-all disabled:opacity-40 shadow-2xs"
                  title={t('توليد واقتراح صياغة ذكية من واقع مهام الفترة', 'Auto-draft from logged tasks')}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isDrafting ? t('جارٍ التوليد...', 'Generating...') : t('توليد مسودة من مهام الفترة', 'Draft from Tasks')}</span>
                </button>

                {currentReport.customNarrative && (
                  <button
                    type="button"
                    onClick={handlePolishNarrative}
                    disabled={isPolishing}
                    className="px-3 py-1.5 rounded-xl bg-bg hover:bg-line border border-line text-xs font-bold text-ink flex items-center gap-1.5 transition-all disabled:opacity-40 shadow-2xs"
                    title={t('تنقيح الصياغة أكاديمياً بالذكاء الاصطناعي مع حفظ الوقائع 100%', 'Polish wording via AI')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-ok" />
                    <span>{isPolishing ? t('جارٍ الصياغة...', 'Polishing...') : t('تنقيح أكاديمي (AI)', 'Polish AI')}</span>
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={currentReport.customNarrative}
              onChange={(e) => onUpdateReport({ customNarrative: e.target.value })}
              rows={4}
              placeholder={isAr
                ? `مثال: خلال هذه الفترة من تاريخ ${currentReport.startDate || '...'} إلى تاريخ ${currentReport.endDate || '...'} تم العمل كـ موظف رسمي بقسم هندسة الشبكات وتراسل البيانات، حيث باشرت المهام الميدانية والتشغيلية التالية...`
                : `Example: During this period from ${currentReport.startDate} to ${currentReport.endDate}, worked as an active team member in the department, conducting the following core field engineering operations...`}
              className="w-full p-3.5 bg-bg border border-line rounded-xl text-xs sm:text-sm text-ink leading-relaxed font-normal focus:outline-none focus:border-accent transition-colors resize-y shadow-inner"
            />
          </div>

          {/* Row 3: Output Inclusion Options */}
          <div className="pt-2 border-t border-line/60 flex flex-wrap items-center gap-4 text-xs font-bold text-ink">
            <span className="text-sub text-[11px]">{t('خيارات تضمين أقسام التقرير:', 'Report Sections:')}</span>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={currentReport.includeDailyTasks}
                onChange={(e) => onUpdateReport({ includeDailyTasks: e.target.checked })}
                className="w-4 h-4 rounded text-accent accent-accent"
              />
              <span>{t('تضمين بطاقات المهام اليومية للفترة', 'Include Daily Task Cards')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={currentReport.includeEvidence}
                onChange={(e) => onUpdateReport({ includeEvidence: e.target.checked })}
                className="w-4 h-4 rounded text-accent accent-accent"
              />
              <span>{t('تضمين الصور والشواهد للفترة', 'Include Evidence Photos')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={currentReport.includeEndorsement}
                onChange={(e) => onUpdateReport({ includeEndorsement: e.target.checked })}
                className="w-4 h-4 rounded text-accent accent-accent"
              />
              <span>{t('تضمين صندوق المصادقة والاعتماد الميداني', 'Include Field Endorsement')}</span>
            </label>
          </div>
        </>
      )}
    </div>
  );
};
