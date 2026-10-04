import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarRange, Download, FileText, History, Languages, Loader2, Presentation, Printer, RefreshCw, Sparkles } from 'lucide-react';
import {
  FinalReportData,
  LEARNING_STATUS_LABELS,
  PeriodDescriptor,
  PeriodReportVersionDTO,
  PeriodType,
  formatDateArabic,
  formatDateEnglish
} from '@coop/shared';
import { api } from '../../services/api';
import { runAgentJob, apiErrorMessage } from '../../services/agentJobs';
import { useLanguage } from '../../context/LanguageContext';
import { AgentEngineBadge } from '../common/AgentEngineBadge';
import { PeriodReportDocument } from './PeriodReportDocument';

/**
 * Weekly and monthly COOP reports written by the built-in agent from the daily log.
 * Each generation is saved as a new version (older versions stay available), in Arabic and English.
 */
export const PeriodReportsTab: React.FC = () => {
  const { isAr } = useLanguage();
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const queryClient = useQueryClient();

  const [type, setType] = useState<PeriodType>('weekly');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [docLang, setDocLang] = useState<'ar' | 'en'>(isAr ? 'ar' : 'en');
  const [job, setJob] = useState<{ key: string; progress: number; message: string } | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');

  const { data: periods, isLoading } = useQuery<{ weekly: PeriodDescriptor[]; monthly: PeriodDescriptor[] }>({
    queryKey: ['periods'],
    queryFn: async () => (await api.get('/period-reports/periods')).data
  });
  const list = periods?.[type] || [];

  const { data: versionsData } = useQuery<{ versions: PeriodReportVersionDTO[] }>({
    queryKey: ['periodVersions', type, selectedKey],
    queryFn: async () => (await api.get(`/period-reports/${type}/${selectedKey}/versions`)).data,
    enabled: !!selectedKey
  });
  const versions = versionsData?.versions || [];

  useEffect(() => {
    if (versions.length && (!selectedVersionId || !versions.some((v) => v.id === selectedVersionId))) {
      setSelectedVersionId(versions[0].id);
    }
  }, [versions, selectedVersionId]);

  const { data: reportData } = useQuery<{ report: PeriodReportVersionDTO }>({
    queryKey: ['periodReport', selectedVersionId],
    queryFn: async () => (await api.get(`/period-reports/${selectedVersionId}`)).data,
    enabled: !!selectedVersionId
  });
  const report = reportData?.report;

  const { data: finalData } = useQuery<FinalReportData>({
    queryKey: ['finalReport'],
    queryFn: async () => (await api.get('/reports/final')).data
  });

  const selectPeriod = (key: string) => {
    setSelectedKey(key);
    setSelectedVersionId(null);
    setError('');
  };

  const refreshAfterJob = (key: string, newId?: number) => {
    queryClient.invalidateQueries({ queryKey: ['periods'] });
    queryClient.invalidateQueries({ queryKey: ['periodVersions', type, key] });
    queryClient.invalidateQueries({ queryKey: ['finalReport'] });
    queryClient.invalidateQueries({ queryKey: ['insights'] });
    if (newId) {
      queryClient.invalidateQueries({ queryKey: ['periodReport', newId] });
      setSelectedVersionId(newId);
    }
  };

  const generate = async (key: string) => {
    selectPeriod(key);
    setJob({ key, progress: 0, message: '' });
    try {
      const result = await runAgentJob(
        () => api.post(`/period-reports/${type}/${key}/generate`),
        (s) => setJob({ key, progress: s.progress, message: s.message })
      );
      refreshAfterJob(key, result?.report?.id);
    } catch (err) {
      setError(apiErrorMessage(err, L('تعذر إنشاء التقرير', 'Report generation failed')));
    } finally {
      setJob(null);
    }
  };

  const retryEnglish = async () => {
    if (!report || !selectedKey) return;
    setJob({ key: selectedKey, progress: 0, message: '' });
    try {
      await runAgentJob(
        () => api.post(`/period-reports/${report.id}/retry-en`),
        (s) => setJob({ key: selectedKey, progress: s.progress, message: s.message })
      );
      refreshAfterJob(selectedKey, report.id);
    } catch (err) {
      setError(apiErrorMessage(err, L('تعذر إعداد النسخة الإنجليزية', 'English edition failed')));
    } finally {
      setJob(null);
    }
  };

  const download = async (format: 'docx' | 'pptx') => {
    if (!report) return;
    setDownloading(format);
    try {
      const res = await api.get(`/period-reports/${report.id}/export/${format}?lang=${docLang}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.periodType === 'weekly' ? 'Weekly' : 'Monthly'}_Report_${report.periodKey}_v${report.version}_${docLang}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(apiErrorMessage(err, L('تعذر تنزيل الملف', 'Download failed')));
    } finally {
      setDownloading('');
    }
  };

  const content = report ? (docLang === 'en' ? report.contentEn : report.contentAr) : null;
  const fmtDate = (d: string) => (isAr ? formatDateArabic(d) : formatDateEnglish(d));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-card border border-line rounded-2xl p-4 sm:p-5 shadow-sm no-print space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent-dim text-accent shrink-0">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-extrabold text-ink">{L('التقارير الدورية (أسبوعية وشهرية)', 'Periodic Reports (weekly & monthly)')}</h2>
              <p className="text-xs text-sub leading-relaxed">
                {L(
                  'يكتب الوكيل الذكي تقرير تدريب تعاوني رسمي من يومياتك: ملخص تنفيذي، أهداف، أعمال مجمّعة حسب المحاور، مهارات جديدة ومعززة، تحديات، أدوات، تقييم ذاتي وخطة قادمة — بالعربية والإنجليزية، وكل إنشاء يُحفظ كنسخة جديدة دون حذف السابقة.',
                  'The built-in agent writes a formal co-op report from your daily log: executive summary, objectives, work grouped by theme, new and reinforced skills, challenges, tools, self-assessment and next plan — in Arabic and English. Every generation is saved as a new version; earlier ones are kept.'
                )}
              </p>
              <AgentEngineBadge isAr={isAr} />
            </div>
          </div>
          <div className="flex items-center bg-bg border border-line rounded-xl p-1 text-xs font-bold shrink-0">
            {(['weekly', 'monthly'] as PeriodType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  setSelectedKey(null);
                  setSelectedVersionId(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${type === t ? 'bg-accent text-white shadow-sm' : 'text-sub hover:text-ink'}`}
              >
                {t === 'weekly' ? L('أسبوعي', 'Weekly') : L('شهري', 'Monthly')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Periods */}
      <div className="bg-card border border-line rounded-2xl p-4 sm:p-5 shadow-sm no-print">
        {isLoading ? (
          <div className="text-xs text-sub flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> {L('جارٍ التحميل…', 'Loading…')}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-8 text-sub text-sm">
            {L('لا توجد يوميات مسجلة بعد. سجّل يومياتك من تبويب التسجيل اليومي ثم عد لإنشاء التقارير.', 'No daily entries yet. Log your days first, then come back to generate reports.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map((p) => {
              const active = p.periodKey === selectedKey;
              const busy = job?.key === p.periodKey;
              return (
                <div
                  key={p.periodKey}
                  className={`rounded-xl border p-3.5 space-y-2 transition-colors cursor-pointer ${active ? 'border-accent bg-accent-dim/30' : 'border-line hover:bg-bg'}`}
                  onClick={() => selectPeriod(p.periodKey)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-ink">{isAr ? p.label : p.labelEn}</span>
                    {p.latestVersion ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ok-bg text-ok">
                        {L(`النسخة ${p.latestVersion}`, `v${p.latestVersion}`)}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-bg text-sub border border-line">{L('لم يُنشأ', 'Not generated')}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-sub">
                    {fmtDate(p.periodStart)} — {fmtDate(p.periodEnd)}
                  </div>
                  <div className="text-[11px] text-sub font-semibold">
                    {p.entryCount} {L('يوميات', 'entries')} · {p.hours} {L('ساعة', 'h')}
                  </div>
                  <button
                    type="button"
                    disabled={!!job}
                    onClick={(e) => {
                      e.stopPropagation();
                      generate(p.periodKey);
                    }}
                    className="w-full px-3 py-1.5 text-xs font-bold text-white bg-accent hover:bg-accent/90 rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : p.latestVersion ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {p.latestVersion ? L('إنشاء نسخة جديدة', 'Generate new version') : L('إنشاء التقرير', 'Generate report')}
                  </button>
                  {busy && (
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-bg overflow-hidden border border-line">
                        <div className="h-full bg-accent transition-all" style={{ width: `${job!.progress}%` }} />
                      </div>
                      <div className="text-[10.5px] text-sub truncate">{job!.message || L('بانتظار الوكيل…', 'Waiting for the agent…')}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {error && <div className="mt-3 text-xs font-bold text-accent">{error}</div>}
      </div>

      {/* Versions + toolbar */}
      {selectedKey && versions.length > 0 && (
        <div className="bg-card border border-line rounded-2xl p-4 sm:p-5 shadow-sm no-print space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <History className="w-4 h-4 text-accent" />
              <span className="text-xs font-extrabold text-ink">{L('سجل النسخ:', 'Versions:')}</span>
              {versions.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVersionId(v.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                    v.id === selectedVersionId ? 'bg-accent text-white border-accent' : 'bg-bg text-sub border-line hover:text-ink'
                  }`}
                  title={new Date(v.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-GB')}
                >
                  {L(`نسخة ${v.version}`, `v${v.version}`)}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-bg border border-line rounded-xl p-1 text-xs font-bold">
                {(['ar', 'en'] as const).map((lng) => {
                  const st = lng === 'ar' ? report?.statusAr : report?.statusEn;
                  return (
                    <button
                      key={lng}
                      type="button"
                      onClick={() => setDocLang(lng)}
                      className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${docLang === lng ? 'bg-accent text-white shadow-sm' : 'text-sub hover:text-ink'}`}
                    >
                      <Languages className="w-3.5 h-3.5" />
                      <span>{lng === 'ar' ? 'العربية' : 'English'}</span>
                      {st && st !== 'ready' && <span className="text-[9px] opacity-80">({st === 'pending' ? L('قيد الإعداد', 'pending') : L('غير متوفرة', 'unavailable')})</span>}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={!content}
                onClick={() => window.print()}
                className="px-3.5 py-2 text-xs font-bold text-white bg-accent hover:bg-accent/90 rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Printer className="w-4 h-4" /> {L('طباعة / حفظ PDF', 'Print / Save PDF')}
              </button>
              <button
                type="button"
                disabled={!content || !!downloading}
                onClick={() => download('docx')}
                className="px-3.5 py-2 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Download className={`w-4 h-4 text-accent ${downloading === 'docx' ? 'animate-bounce' : ''}`} /> Word
              </button>
              <button
                type="button"
                disabled={!content || !!downloading}
                onClick={() => download('pptx')}
                className="px-3.5 py-2 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Presentation className={`w-4 h-4 text-accent ${downloading === 'pptx' ? 'animate-bounce' : ''}`} /> PowerPoint
              </button>
            </div>
          </div>

          {report && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="px-2 py-0.5 rounded-full bg-bg border border-line text-sub">
                {report.stats.hours} {L('ساعة', 'h')} · {report.stats.days} {L('أيام', 'days')}
              </span>
              <span className="insight-badge insight-badge-new insight-badge-compact">
                {LEARNING_STATUS_LABELS.new[isAr ? 'ar' : 'en']}: {report.stats.newCount}
              </span>
              <span className="insight-badge insight-badge-reinforced insight-badge-compact">
                {LEARNING_STATUS_LABELS.reinforced[isAr ? 'ar' : 'en']}: {report.stats.reinforcedCount}
              </span>
              <span className="insight-badge insight-badge-routine insight-badge-compact">
                {LEARNING_STATUS_LABELS.routine[isAr ? 'ar' : 'en']}: {report.stats.routineCount}
              </span>
              {report.mode !== 'llm' && (
                <span className="px-2 py-0.5 rounded-full bg-warn-bg text-warn">
                  {L('كُتبت بالمحرك اللغوي المدمج (النموذج لم يكن جاهزاً)', 'Written by the rule-based engine (model was not ready)')}
                </span>
              )}
              {report.statusEn === 'failed' && (
                <button type="button" onClick={retryEnglish} disabled={!!job} className="px-2 py-0.5 rounded-full bg-accent-dim text-accent">
                  {L('إعادة إعداد النسخة الإنجليزية', 'Retry English edition')}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {selectedKey && versions.length === 0 && !job && (
        <div className="bg-card border border-dashed border-line rounded-2xl p-6 text-center text-sub text-sm no-print flex flex-col items-center gap-2">
          <FileText className="w-6 h-6 text-sub/60" />
          {L('لم يُنشأ تقرير لهذه الفترة بعد. اضغط «إنشاء التقرير».', 'No report for this period yet. Press "Generate report".')}
        </div>
      )}

      {/* Printable document */}
      {report && content && finalData?.profile && (
        <PeriodReportDocument content={content} stats={report.stats} profile={finalData.profile} lang={docLang} version={report.version} />
      )}
      {report && !content && (
        <div className="bg-card border border-line rounded-2xl p-6 text-center text-sub text-sm no-print">
          {docLang === 'en'
            ? L('النسخة الإنجليزية لهذا الإصدار غير متوفرة بعد. النسخة العربية متاحة كاملة.', 'The English edition of this version is not available yet. The Arabic edition is complete.')
            : L('النسخة العربية غير متوفرة لهذا الإصدار.', 'Arabic edition unavailable for this version.')}
        </div>
      )}
    </div>
  );
};
