import React, { useState } from 'react';
import { Sparkles, Check, X, ShieldCheck, Key, Cpu, AlertCircle, Loader2, Target, Cog, Wrench, BarChart3, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';

interface BatchRewriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalEntries: number;
  weekNumber?: number;
  onSuccess: () => void;
}

export const BatchRewriteModal: React.FC<BatchRewriteModalProps> = ({
  isOpen,
  onClose,
  totalEntries,
  weekNumber,
  onSuccess
}) => {
  const { t, isAr } = useLanguage();
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('coop_gemini_api_key') || '');
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleStartRewrite = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessResult(null);

    try {
      if (apiKey.trim()) {
        localStorage.setItem('coop_gemini_api_key', apiKey.trim());
      }

      const res = await api.post('/entries/batch-academic-rewrite', {
        weekNumber,
        apiKey: apiKey.trim() || undefined,
        model
      });

      setSuccessResult(res.data);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.error ||
        err?.message ||
        t('حدث خطأ أثناء معالجة السجلات. تأكد من صحة الاتصال أو المفتاح.', 'Error occurred during batch rewrite.')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-card border border-line rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-bg/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-ink">
                {weekNumber
                  ? t(`إعادة صياغة وترتيب سجلات الأسبوع ${weekNumber} أكاديمياً`, `Academic Rewrite: Week ${weekNumber}`)
                  : t('إعادة صياغة وترتيب السجلات اليومية أكاديمياً (شامل)', 'Batch Academic Daily Log Restructuring')}
              </h3>
              <p className="text-[11px] text-sub flex items-center gap-1.5 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-ok" />
                <span>{t('أمانة علمية صارمة 100% | صفر اختلاق | صفر فقدان للمعلومات', '100% Factual Fidelity | Zero Hallucination')}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-sub hover:text-ink p-1.5 rounded-lg hover:bg-bg transition-colors disabled:opacity-40"
            title={t('إغلاق', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-ink text-sm">
          {successResult ? (
            <div className="py-6 text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 bg-ok-bg border border-ok/30 rounded-2xl flex items-center justify-center mx-auto text-ok">
                <Check className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-ink">
                  {t('اكتملت إعادة الصياغة الأكاديمية بنجاح!', 'Academic Restructuring Complete!')}
                </h4>
                <p className="text-xs text-sub max-w-md mx-auto leading-relaxed">
                  {successResult.message || t(`تمت معالجة وترتيب ${successResult.processedCount} سجلات بأعلى المعايير الأكاديمية.`, `Processed ${successResult.processedCount} entries.`)}
                </p>
              </div>

              <div className="p-3 bg-bg border border-line rounded-xl text-xs text-sub text-start space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-ink">
                  <ShieldCheck className="w-4 h-4 text-ok" />
                  <span>{t('سجل الأمان والتراجع التلقائي:', 'Safety & Rollback Guarantee:')}</span>
                </div>
                <p className="leading-relaxed">
                  {t(
                    'تم حفظ نسخة أصلية من كل سجل في جدول المراجعات التاريخية (Revisions). يمكنك في أي وقت استعراض النسخ السابقة أو التراجع عنها بنقرة واحدة.',
                    'Original copies of all entries are safely preserved in the revision history. You can review or rollback anytime.'
                  )}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-2.5 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
                >
                  {t('تم، العودة للسجلات', 'Done & View Entries')}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Architecture Explanation Card */}
              <div className="p-4 bg-bg border border-line rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-sub">
                  <span>{t('الهيكلية الهندسية المعتمدة لكل يوم:', 'Approved Daily Engineering Structure:')}</span>
                  <span className="px-2 py-0.5 rounded-md bg-accent-dim text-accent text-[11px]">
                    {totalEntries} {t('سجلات مستهدفة', 'target entries')}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-card border border-line rounded-lg">
                    <span className="font-bold text-accent flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('الهدف التشغيلي', 'Objective')}</span>
                    </span>
                    <p className="text-[11px] text-sub pt-0.5">{t('الغاية التقنية لمهام اليوم بدقة', 'Precise operational purpose')}</p>
                  </div>
                  <div className="p-2.5 bg-card border border-line rounded-lg">
                    <span className="font-bold text-accent flex items-center gap-1.5">
                      <Cog className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('الخطوات الميدانية', 'Procedural Steps')}</span>
                    </span>
                    <p className="text-[11px] text-sub pt-0.5">{t('سرد إجرائي مهني بالخطوات المنفذة', 'Clear procedural execution')}</p>
                  </div>
                  <div className="p-2.5 bg-card border border-line rounded-lg">
                    <span className="font-bold text-accent flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('الأنظمة والأدوات', 'Tools & Systems')}</span>
                    </span>
                    <p className="text-[11px] text-sub pt-0.5">{t('حصر الأجهزة والبرمجيات المذكورة', 'Listed hardware/software tools')}</p>
                  </div>
                  <div className="p-2.5 bg-card border border-line rounded-lg">
                    <span className="font-bold text-accent flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('المخرجات والنتائج', 'Outcomes & Metrics')}</span>
                    </span>
                    <p className="text-[11px] text-sub pt-0.5">{t('النتائج المتحققة بنهاية اليوم', 'Tangible outputs verified')}</p>
                  </div>
                </div>
              </div>

              {/* API Configuration & Gemini Flash settings */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-sub flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-accent" />
                    <span>{t('مفتاح Google Gemini API Key (اختياري / موصى به):', 'Google Gemini API Key (Optional / Recommended):')}</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
                  >
                    <span>{t('احصل على مفتاح مجاني وفوري', 'Get Free API Key')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t('الصق مفتاح AIzaSy... (إذا لم تضعه في ملف .env السيرفر)', 'Paste AIzaSy... key (or use server .env)')}
                  className="w-full px-3 py-2 text-xs bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink font-mono"
                  disabled={isProcessing}
                />
                <p className="text-[11px] text-sub leading-normal">
                  {t(
                    'إذا كان المفتاح مضافاً مسبقاً في سيرفر النظام أو كنت ترغب بالاعتماد على المحرك الأكاديمي الداخلي، يمكنك ترك الحقل فارغاً.',
                    'If already configured in server .env or using internal engine, you can leave this empty.'
                  )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-sub flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-accent" />
                      <span>{t('محرك الذكاء الاصطناعي:', 'AI Model Engine:')}</span>
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 text-xs bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink font-semibold"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash ({t('الموصى به - فائق الدقة والسرعة', 'Recommended')})</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-sub">
                      {t('ضمان الأمانة العلمية:', 'Scientific Integrity:')}
                    </label>
                    <div className="px-3 py-2 text-xs bg-bg border border-line rounded-xl text-sub font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-ok"></span>
                      <span>{t('صفر اختلاق (درجة حرارة 0.15)', 'Zero Hallucination (T=0.15)')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-accent-dim border border-accent/20 text-accent text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!successResult && (
          <div className="px-6 py-4 border-t border-line bg-bg/40 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-bold text-sub hover:text-ink hover:bg-bg rounded-xl transition-colors disabled:opacity-40"
            >
              {t('إلغاء', 'Cancel')}
            </button>

            <button
              type="button"
              onClick={handleStartRewrite}
              disabled={isProcessing || totalEntries === 0}
              className="px-6 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm text-xs flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('جارٍ إعادة الصياغة الأكاديمية...', 'Restructuring in progress...')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {weekNumber
                      ? t(`بدء إعادة صياغة الأسبوع (${totalEntries} سجلات)`, `Rewrite Week (${totalEntries} entries)`)
                      : t(`بدء إعادة صياغة جميع السجلات (${totalEntries})`, `Rewrite All (${totalEntries} entries)`)}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
