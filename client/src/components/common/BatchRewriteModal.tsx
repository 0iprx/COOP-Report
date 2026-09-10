import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  X,
  ShieldCheck,
  Cpu,
  AlertCircle,
  Loader2,
  Target,
  Cog,
  Wrench,
  BarChart3,
  Award,
  GraduationCap,
  FileText,
  Layers
} from 'lucide-react';
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
  const [model, setModel] = useState<string>('gemini-3.6-flash');
  const [style, setStyle] = useState<'procedural' | 'star_impact' | 'academic_competency' | 'concise_executive'>('procedural');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleStartRewrite = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessResult(null);

    try {
      const res = await api.post('/entries/batch-academic-rewrite', {
        weekNumber,
        model,
        style
      });

      setSuccessResult(res.data);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.error ||
        err?.message ||
        t('حدث خطأ أثناء معالجة السجلات. يرجى المحاولة مرة أخرى.', 'Error occurred during batch rewrite.')
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
              {/* Style Selector: 4 Advanced Report Archetypes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-sub flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-accent" />
                    <span>{t('نمط وفلسفة الصياغة الفنية المطلوبة:', 'Report Writing Archetype & Philosophy:')}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-accent-dim text-accent text-[11px] font-bold">
                    {totalEntries} {t('سجلات مستهدفة', 'target entries')}
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStyle('procedural')}
                    className={`p-3 rounded-xl border text-start transition-all flex items-start gap-2.5 ${
                      style === 'procedural'
                        ? 'bg-accent/5 border-accent shadow-xs ring-1 ring-accent/30'
                        : 'bg-card border-line hover:border-accent/40'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${style === 'procedural' ? 'bg-accent text-white' : 'bg-bg text-sub'}`}>
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-ink">{t('الهندسي الإجرائي الاحترافي', 'Standard Procedural Engineering')}</div>
                      <div className="text-[10.5px] text-sub pt-0.5 leading-snug">{t('الهدف، الخطوات الميدانية، الأدوات، والمخرجات التشغيلية', 'Objective, steps, tools, outputs')}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStyle('star_impact')}
                    className={`p-3 rounded-xl border text-start transition-all flex items-start gap-2.5 ${
                      style === 'star_impact'
                        ? 'bg-accent/5 border-accent shadow-xs ring-1 ring-accent/30'
                        : 'bg-card border-line hover:border-accent/40'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${style === 'star_impact' ? 'bg-accent text-white' : 'bg-bg text-sub'}`}>
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-ink">{t('الأثر وحل المشكلات (STAR)', 'STAR Impact & Troubleshooting')}</div>
                      <div className="text-[10.5px] text-sub pt-0.5 leading-snug">{t('نطاق التكليف، الحلول والتشخيص، التقنيات، والقيمة المضافة للشركة', 'Situation, Task, Action, Result')}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStyle('academic_competency')}
                    className={`p-3 rounded-xl border text-start transition-all flex items-start gap-2.5 ${
                      style === 'academic_competency'
                        ? 'bg-accent/5 border-accent shadow-xs ring-1 ring-accent/30'
                        : 'bg-card border-line hover:border-accent/40'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${style === 'academic_competency' ? 'bg-accent text-white' : 'bg-bg text-sub'}`}>
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-ink">{t('الأكاديمي التحليلي (الجدارات)', 'Competency & Learning Outcomes')}</div>
                      <div className="text-[10.5px] text-sub pt-0.5 leading-snug">{t('ربط الممارسة العملية بالمفاهيم التخصصية ومعايير الاعتماد', 'Mapping field tasks to academic competencies')}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStyle('concise_executive')}
                    className={`p-3 rounded-xl border text-start transition-all flex items-start gap-2.5 ${
                      style === 'concise_executive'
                        ? 'bg-accent/5 border-accent shadow-xs ring-1 ring-accent/30'
                        : 'bg-card border-line hover:border-accent/40'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${style === 'concise_executive' ? 'bg-accent text-white' : 'bg-bg text-sub'}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-ink">{t('الموجز التنفيذي المركز', 'Concise Executive Summary')}</div>
                      <div className="text-[10.5px] text-sub pt-0.5 leading-snug">{t('فقرة مباشرة فائقة التركيز لسرعة المراجعة ولجان المناقشة', 'Tight professional narrative for rapid review')}</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dynamic Architecture Preview Card */}
              <div className="p-3.5 bg-bg border border-line rounded-xl space-y-2">
                <div className="text-xs font-bold text-sub flex items-center justify-between">
                  <span>{t('هيكلية السجل الناتج:', 'Restructured Output Sections:')}</span>
                  <span className="text-[11px] font-extrabold text-accent">
                    {style === 'procedural' && t('4 أقسام: الهدف، الخطوات، الأدوات، النتائج', '4 Sections')}
                    {style === 'star_impact' && t('4 أقسام: التكليف، الحلول، الأنظمة، القيمة المضافة', '4 Sections')}
                    {style === 'academic_competency' && t('4 أقسام: الجدارة، التطبيق، المفاهيم، مخرجات التعلم', '4 Sections')}
                    {style === 'concise_executive' && t('فقرة تنفيذية شاملة ومباشرة', 'Executive Narrative')}
                  </span>
                </div>

                {style === 'procedural' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-card border border-line rounded-lg">
                      <span className="font-bold text-accent flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('الهدف التشغيلي', 'Objective')}</span>
                      </span>
                      <p className="text-[10.5px] text-sub pt-0.5">{t('الغاية التقنية لمهام اليوم بدقة', 'Precise operational purpose')}</p>
                    </div>
                    <div className="p-2 bg-card border border-line rounded-lg">
                      <span className="font-bold text-accent flex items-center gap-1.5">
                        <Cog className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('الخطوات الميدانية', 'Procedural Steps')}</span>
                      </span>
                      <p className="text-[10.5px] text-sub pt-0.5">{t('سرد إجرائي مهني بالخطوات المنفذة', 'Clear procedural execution')}</p>
                    </div>
                    <div className="p-2 bg-card border border-line rounded-lg">
                      <span className="font-bold text-accent flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('الأنظمة والأدوات', 'Tools & Systems')}</span>
                      </span>
                      <p className="text-[10.5px] text-sub pt-0.5">{t('حصر الأجهزة والبرمجيات المذكورة', 'Listed hardware/software tools')}</p>
                    </div>
                    <div className="p-2 bg-card border border-line rounded-lg">
                      <span className="font-bold text-accent flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('المخرجات والنتائج', 'Outcomes & Metrics')}</span>
                      </span>
                      <p className="text-[10.5px] text-sub pt-0.5">{t('النتائج المتحققة بنهاية اليوم', 'Tangible outputs verified')}</p>
                    </div>
                  </div>
                )}

                {style === 'star_impact' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-card border border-line rounded-lg">
                      <span className="font-bold text-accent flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('نطاق التكليف والمهمة', 'Scope & Mission')}</span>
                      </span>
                      <p className="text-[10.5px] text-sub pt-0.5">{t('المسؤولية الميدانية المسندة بدقة', 'Assigned field responsibility')}</p>
                    </div>
                    <div className="p-2 bg-card border border-line rounded-lg">
                      <span className="font-bold text-accent flex items-center gap-1.5">
                        <Cog className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('الإجراءات والحلول الفنية', 'Solutions & Action')}</span>
                      </span>
                      <p className="text-[10.5px] text-sub pt-0.5">{t('التحليل وحل المشكلات والأعطال', 'Troubleshooting & resolution')}</p>
                    </div>
                    <div className="p-2 bg-card border border-line rounded-lg">
                      <span className="font-bold text-accent flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('الأنظمة والتقنيات المستخدمة', 'Applied Systems')}</span>
                      </span>
                      <p className="text-[10.5px] text-sub pt-0.5">{t('البيئات والأجهزة المستخدمة فعلياً', 'Production tools & systems')}</p>
                    </div>
                    <div className="p-2 bg-card border border-line rounded-lg">
                      <span className="font-bold text-accent flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('الأثر والقيمة المضافة', 'Business Impact')}</span>
                      </span>
                      <p className="text-[10.5px] text-sub pt-0.5">{t('مؤشرات الإنجاز والجودة للجهة', 'Verified operational value')}</p>
                    </div>
                  </div>
                )}

                {style === 'academic_competency' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-card border border-line rounded-lg">
                      <span className="font-bold text-accent flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('الجدارة والمهارة المستهدفة', 'Target Competency')}</span>
                      </span>
                      <p className="text-[10.5px] text-sub pt-0.5">{t('المهارة المرتبطة بمعايير الاعتماد', 'Curriculum learning outcome')}</p>
                    </div>
                    <div className="p-2 bg-card border border-line rounded-lg">
                      <span className="font-bold text-accent flex items-center gap-1.5">
                        <Cog className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('الممارسة والتطبيق الميداني', 'Practical Application')}</span>
                      </span>
                      <p className="text-[10.5px] text-sub pt-0.5">{t('تطبيق المفاهيم النظرية عملياً', 'Hands-on practice in work context')}</p>
                    </div>
                    <div className="p-2 bg-card border border-line rounded-lg">
                      <span className="font-bold text-accent flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('الأدوات والمفاهيم المطبقة', 'Applied Frameworks')}</span>
                      </span>
                      <p className="text-[10.5px] text-sub pt-0.5">{t('المعايير الهندسية والأنظمة', 'Standards & tools utilized')}</p>
                    </div>
                    <div className="p-2 bg-card border border-line rounded-lg">
                      <span className="font-bold text-accent flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('مخرجات التعلم والتقييم', 'Learning Outcomes')}</span>
                      </span>
                      <p className="text-[10.5px] text-sub pt-0.5">{t('التقييم الذاتي والدروس المستفادة', 'Acquired mastery & reflection')}</p>
                    </div>
                  </div>
                )}

                {style === 'concise_executive' && (
                  <div className="p-2.5 bg-card border border-line rounded-lg text-xs">
                    <span className="font-bold text-accent flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('ملخص الإنجاز الميداني المركز', 'Concise Executive Summary')}</span>
                    </span>
                    <p className="text-[11px] text-sub pt-1 leading-relaxed">
                      {t('صياغة فقرة احترافية محكمة وموجزة توجز النشاط، والأدوات، والنتائج دون تشعب، مناسبة جداً للتقارير السريعة وعروض لجان المناقشة.', 'A tight single narrative summarizing core task, tools, and results.')}
                    </p>
                  </div>
                )}
              </div>

              {/* AI Engine & Scientific Integrity settings */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      <option value="gemini-3.6-flash">Gemini 3.6 Flash ({t('الموصى به - فائق الدقة والسرعة', 'Recommended')})</option>
                      <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
                      <option value="gemini-flash-latest">Gemini Flash Latest</option>
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
