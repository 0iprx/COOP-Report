import React, { useState } from 'react';
import {
  ListChecks,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  RotateCcw,
  Clock,
  MapPin,
  FileText,
  Loader2,
  Check,
  ShieldCheck,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { EntryDTO, formatDateArabic, formatDateEnglish, isEntryStructuredQA, parseStructuredDailyNarrative } from '@coop/shared';

interface DailyFormatAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: EntryDTO[];
  weekNumber: number;
  onSuccess: () => void;
}

export const DailyFormatAuditModal: React.FC<DailyFormatAuditModalProps> = ({
  isOpen,
  onClose,
  entries,
  weekNumber,
  onSuccess
}) => {
  const { t, isAr } = useLanguage();
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertingEntryId, setConvertingEntryId] = useState<number | null>(null);
  const [forceAll, setForceAll] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string>('');
  const [errorToast, setErrorToast] = useState<string>('');

  if (!isOpen) return null;

  const totalCount = entries.length;
  const structuredCount = entries.filter((e) => isEntryStructuredQA(e.description)).length;
  const freeformCount = totalCount - structuredCount;

  // Batch convert all freeform tasks in the week
  const handleBatchConvert = async (onlyForce: boolean = false) => {
    setIsConverting(true);
    setSuccessToast('');
    setErrorToast('');

    try {
      const res = await api.post('/entries/batch-structure-qa', {
        weekNumber,
        forceAll: onlyForce
      });

      setSuccessToast(res.data.message || t('تمت هيكلة المهام بنجاح بنمط الأسئلة اليومي', 'Successfully structured tasks into daily Q&A pattern'));
      onSuccess();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      setErrorToast(err?.response?.data?.error || t('حدث خطأ أثناء هيكلة السجلات', 'Failed to structure entries'));
      setTimeout(() => setErrorToast(''), 4000);
    } finally {
      setIsConverting(false);
    }
  };

  // Convert a single entry
  const handleSingleConvert = async (entryId: number) => {
    setConvertingEntryId(entryId);
    setSuccessToast('');
    setErrorToast('');

    try {
      const res = await api.post('/entries/batch-structure-qa', {
        entryIds: [entryId],
        forceAll: true
      });

      setSuccessToast(t('تم تحويل المهمة إلى نموذج الأسئلة بنجاح!', 'Task converted to Q&A pattern successfully!'));
      onSuccess();
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err: any) {
      setErrorToast(err?.response?.data?.error || t('تعذر تحويل المهمة', 'Failed to convert task'));
      setTimeout(() => setErrorToast(''), 3000);
    } finally {
      setConvertingEntryId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-card border border-line rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-bg/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-600 dark:text-teal-400">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-ink">
                {t(`فحص وتوحيد نمط التدوين: الأسبوع ${weekNumber}`, `Logging Style Audit: Week ${weekNumber}`)}
              </h3>
              <p className="text-[11px] text-sub flex items-center gap-1.5 pt-0.5">
                <span>{t('نموذج الأسئلة المنظم (الموقع، الفترة، الإنجاز، المشاكل، الجديد) vs النظام الحر', 'Structured Q&A vs Freeform Narrative')}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isConverting}
            className="text-sub hover:text-ink p-1.5 rounded-lg hover:bg-bg transition-colors disabled:opacity-40"
            title={t('إغلاق', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-start">
          {/* Toast Messages */}
          {successToast && (
            <div className="p-3.5 rounded-xl bg-ok-bg text-ok border border-ok/30 flex items-center gap-2 text-xs font-bold animate-fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}
          {errorToast && (
            <div className="p-3.5 rounded-xl bg-warn-bg text-warn border border-warn/30 flex items-center gap-2 text-xs font-bold animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorToast}</span>
            </div>
          )}

          {/* Quick Inspection Summary Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-bg border border-line text-center space-y-1">
              <div className="text-[11px] font-bold text-sub flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('إجمالي المهام', 'Total Tasks')}</span>
              </div>
              <div className="text-xl font-black text-ink">{totalCount}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('نموذج الأسئلة', 'Q&A Style')}</span>
              </div>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">{structuredCount}</div>
            </div>

            <div className={`p-3.5 rounded-xl text-center space-y-1 border ${
              freeformCount > 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400' : 'bg-bg border-line text-sub'
            }`}>
              <div className="text-[11px] font-bold flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{t('النظام الحر', 'Freeform')}</span>
              </div>
              <div className={`text-xl font-black ${freeformCount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-sub'}`}>
                {freeformCount}
              </div>
            </div>
          </div>

          {/* Status Diagnostic Card */}
          {freeformCount > 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 text-xs font-black">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  {isAr
                    ? `تنبيه الفحص: تم رصد ${freeformCount} مهمة مدونة بنظام السرد الحر المباشر`
                    : `Audit Alert: Detected ${freeformCount} tasks written in freeform text`}
                </span>
              </div>
              <p className="text-[11.5px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                {isAr
                  ? 'المهام المدونة بالسرد الحر لا تظهر مقسمة ببطاقات (الموقع، الفترة، الإنجازات، التحديات، المهارات الجديدة). انقر على الزر أدناه لهيكلتها فوراً بنمط الأسئلة اليومي لتظهر مصنفة وأنيقة بالتقرير للطباعة.'
                  : 'Freeform tasks will not display with categorized badges and cards. Click the button below to restructure them into the structured Q&A template for academic printing.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBatchConvert(false)}
                  disabled={isConverting}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isConverting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{t('هيكلة وتحويل مهام السرد الحر لنموذج الأسئلة الآن', 'Structure Freeform Tasks to Q&A Now')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="space-y-0.5">
                <div className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                  {t('ممتاز! جميع مهام هذا الأسبوع مهيكلة بنموذج الأسئلة المنظم', 'All tasks for this week are structured in Q&A style')}
                </div>
                <p className="text-[11.5px] text-emerald-800 dark:text-emerald-300 font-medium">
                  {t('كل يوم يظهر بشارات الموقع والفترة وبطاقات الإنجاز والتحديات والمهارات وجاهز للطباعة فوراً.', 'Every day displays with location/period badges and categorized cards ready for print.')}
                </p>
              </div>
            </div>
          )}

          {/* Day by Day Inspection Breakdown */}
          <div className="space-y-2.5 pt-1">
            <div className="text-xs font-black text-sub uppercase tracking-wider flex items-center justify-between">
              <span>{t('فحص تفصيلي لمهام كل يوم بالأسبوع:', 'Day-by-Day Task Audit:')}</span>
              <span className="text-[11px] font-normal text-muted">
                {t('يتم حفظ نسخة احتياطية تلقائياً قبل أي تعديل', 'Revisions are automatically backed up')}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {entries.map((entry, idx) => {
                const isStructured = isEntryStructuredQA(entry.description);
                const parsed = parseStructuredDailyNarrative(entry.description);
                const isItemConverting = convertingEntryId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                      isStructured
                        ? 'bg-card border-line'
                        : 'bg-amber-500/5 border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                          {isAr ? `اليوم ${idx + 1}` : `Day ${idx + 1}`}
                        </span>
                        <span className="text-xs font-extrabold text-ink truncate max-w-[220px]">
                          {entry.title}
                        </span>
                        <span className="text-[10.5px] text-sub">
                          {isAr ? formatDateArabic(entry.entryDate) : formatDateEnglish(entry.entryDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isStructured ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t('نموذج الأسئلة ✓', 'Q&A Style ✓')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            <AlertCircle className="w-3 h-3" />
                            <span>{t('سرد حر مباشر', 'Freeform')}</span>
                          </span>
                        )}

                        {!isStructured && (
                          <button
                            type="button"
                            onClick={() => handleSingleConvert(entry.id)}
                            disabled={isItemConverting}
                            className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all flex items-center gap-1 disabled:opacity-50"
                            title={t('تحويل هذا اليوم إلى نمط الأسئلة', 'Convert this day to Q&A pattern')}
                          >
                            {isItemConverting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            <span>{t('هيكلة', 'Structure')}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mini sections preview */}
                    {isStructured ? (
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-sub pt-1 border-t border-line/40">
                        {parsed.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-accent" />
                            <span>{parsed.location}</span>
                          </span>
                        )}
                        {parsed.period && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-accent" />
                            <span>{parsed.period}</span>
                          </span>
                        )}
                        {parsed.achievements && (
                          <span className="inline-flex items-center gap-1 text-ok">
                            <Check className="w-3 h-3" />
                            <span>{t('إنجازات محددة', 'Achievements')}</span>
                          </span>
                        )}
                        {parsed.challenges && (
                          <span className="inline-flex items-center gap-1 text-warn">
                            <AlertCircle className="w-3 h-3" />
                            <span>{t('تحديات وحلول', 'Challenges')}</span>
                          </span>
                        )}
                        {parsed.newLearnings && (
                          <span className="inline-flex items-center gap-1 text-accent">
                            <Sparkles className="w-3 h-3" />
                            <span>{t('معارف مكتسبة', 'New Skills')}</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-sub line-clamp-2 leading-relaxed pt-1 border-t border-amber-500/20">
                        {entry.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-line bg-bg/50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-sub font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-ok" />
            <span>{t('الأمانة العلمية: 100% حفظ للنصوص مع إمكانية التراجع', '100% Data Preservation with Full Rollback')}</span>
          </div>

          <div className="flex items-center gap-2">
            {freeformCount > 0 && (
              <button
                type="button"
                onClick={() => handleBatchConvert(false)}
                disabled={isConverting}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isConverting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{t('توحيد كل مهام الأسبوع لنمط الأسئلة', 'Unify All Week Tasks to Q&A Style')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-card hover:bg-line border border-line text-xs font-bold text-ink transition-all"
            >
              {t('إغلاق', 'Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
