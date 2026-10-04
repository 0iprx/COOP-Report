import React, { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Bot, RefreshCw, Sparkles, X } from 'lucide-react';
import { EntryDTO, LEARNING_STATUS_LABELS, LearningStatus } from '@coop/shared';
import { api } from '../../services/api';
import { runAgentJob, apiErrorMessage } from '../../services/agentJobs';
import { AgentEngineBadge } from '../common/AgentEngineBadge';

export interface ReportAgentSettings {
  showInsights: boolean;
  useCorrectedText: boolean;
  tocShowDays: boolean;
}

/** Control panel (not printed) for the daily-entry analysis agent */
export const InsightAgentPanel: React.FC<{
  entries: EntryDTO[];
  isAr: boolean;
  settings: ReportAgentSettings;
  onSettingsChange: (s: ReportAgentSettings) => void;
}> = ({ entries, isAr, settings, onSettingsChange }) => {
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const cancelRef = useRef({ cancelled: false });

  const counts: Record<LearningStatus, number> = { new: 0, reinforced: 0, routine: 0 };
  let analysed = 0;
  let stale = 0;
  for (const e of entries) {
    if (!e.insight) continue;
    analysed++;
    if (e.insight.isStale) stale++;
    counts[e.insight.learningStatus]++;
  }
  const pending = entries.length - analysed + stale;

  const run = async (scope: 'missing' | 'all') => {
    setRunning(true);
    setError('');
    setProgress(0);
    setMessage('');
    cancelRef.current = { cancelled: false };
    try {
      await runAgentJob(
        () => api.post('/insights/analyze-all', { scope }),
        (s) => {
          setProgress(s.progress);
          setMessage(s.message);
        },
        cancelRef.current
      );
      setMessage(L('اكتمل تحليل اليوميات', 'Analysis complete'));
    } catch (err) {
      if (!cancelRef.current.cancelled) setError(apiErrorMessage(err, L('تعذر إكمال التحليل', 'Analysis failed')));
    } finally {
      setRunning(false);
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    }
  };

  const toggle = (key: keyof ReportAgentSettings) => onSettingsChange({ ...settings, [key]: !settings[key] });

  return (
    <div className="bg-card border border-line rounded-2xl p-4 sm:p-5 shadow-sm no-print space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent-dim text-accent shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-extrabold text-ink">{L('الوكيل الذكي لتحليل اليوميات', 'Daily-log AI agent')}</div>
            <p className="text-xs text-sub leading-relaxed">
              {L(
                'يقرأ كل يوم مع جميع الأيام السابقة: يدقق النص ويعيد كتابته بالأسلوب الأنسب له، ويحدد هل ما تعلمته جديد أم تعزيز أم تكرار، والهدف وما نفذته، ويحفظ نسخة عربية وإنجليزية. نصك الأصلي لا يُحذف ولا يُعدّل.',
                'Reads each day against all earlier days: proofreads and rewrites it in the best-fitting style, classifies the learning (new / reinforced / routine), extracts the goal and what was done, and stores Arabic and English editions. Your original text is never deleted or changed.'
              )}
            </p>
            <AgentEngineBadge isAr={isAr} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={running || entries.length === 0}
            onClick={() => run('missing')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-accent hover:bg-accent/90 rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {pending > 0
                ? L(`تحليل اليوميات غير المحللة (${pending})`, `Analyse pending days (${pending})`)
                : L('كل اليوميات محللة', 'All days analysed')}
            </span>
          </button>
          <button
            type="button"
            disabled={running || entries.length === 0}
            onClick={() => run('all')}
            className="px-3.5 py-2 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 text-accent" />
            <span>{L('إعادة تحليل الكل', 'Re-analyse all')}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
        <span className="px-2 py-0.5 rounded-full bg-bg border border-line text-sub">
          {L(`محلل: ${analysed} من ${entries.length}`, `Analysed: ${analysed}/${entries.length}`)}
        </span>
        {(['new', 'reinforced', 'routine'] as LearningStatus[]).map((s) => (
          <span key={s} className={`insight-badge insight-badge-${s} insight-badge-compact`}>
            {LEARNING_STATUS_LABELS[s][isAr ? 'ar' : 'en']}: {counts[s]}
          </span>
        ))}
        {stale > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-warn-bg text-warn">
            {L(`${stale} يوم عُدّل بعد تحليله`, `${stale} edited since analysis`)}
          </span>
        )}
      </div>

      {running && (
        <div className="space-y-1.5">
          <div className="h-2 rounded-full bg-bg overflow-hidden border border-line">
            <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-sub">
            <span className="truncate">{message || L('بانتظار الوكيل…', 'Waiting for the agent…')}</span>
            <button
              type="button"
              onClick={() => {
                cancelRef.current.cancelled = true;
                setRunning(false);
              }}
              className="flex items-center gap-1 text-sub hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
              {L('إخفاء التقدم (يستمر التحليل في الخادم)', 'Hide (keeps running on the server)')}
            </button>
          </div>
        </div>
      )}
      {!running && message && !error && <div className="text-[11px] font-bold text-ok">{message}</div>}
      {error && <div className="text-[11px] font-bold text-accent">{error}</div>}

      <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 border-t border-line text-xs text-ink font-semibold">
        {(
          [
            ['showInsights', L('إظهار تحليل الوكيل تحت كل يوم في التقرير و PDF', 'Show agent analysis under each day (report & PDF)')],
            ['useCorrectedText', L('استخدام النص المدقق والمعاد كتابته في التقرير', 'Use the proofread, rewritten text in the report')],
            ['tocShowDays', L('عرض الأيام وتصنيفها داخل الفهرس', 'List each day and its classification in the TOC')]
          ] as [keyof ReportAgentSettings, string][]
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings[key]} onChange={() => toggle(key)} className="accent-[var(--accent)]" />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
