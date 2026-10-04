import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Bot, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { runAgentJob, apiErrorMessage } from '../../services/agentJobs';
import { useLanguage } from '../../context/LanguageContext';

interface AgentAnalyseButtonProps {
  /** Limit the run to these entries (e.g. the days of one week); omit for the whole log */
  entryIds?: number[];
  /** Number of days that still need analysis; shown on the button */
  pending?: number;
  size?: 'sm' | 'md';
}

/**
 * The single entry point to the site's AI agent from the daily and weekly screens.
 * It proofreads and restructures each day into a reader-oriented report, classifies the learning
 * against earlier days and stores Arabic + English editions. Runs as a background job.
 */
export const AgentAnalyseButton: React.FC<AgentAnalyseButtonProps> = ({ entryIds, pending, size = 'md' }) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const run = async () => {
    setBusy(true);
    setError('');
    setProgress(0);
    try {
      await runAgentJob(
        () => api.post('/insights/analyze-all', { scope: 'missing', ...(entryIds?.length ? { entryIds } : {}) }),
        (s) => {
          setProgress(s.progress);
          setMessage(s.message);
        }
      );
      setMessage(t('اكتمل التحليل', 'Analysis complete'));
    } catch (err) {
      setError(apiErrorMessage(err, t('تعذر إكمال التحليل', 'Analysis failed')));
    } finally {
      setBusy(false);
      ['insights', 'finalReport', 'weekly', 'entries', 'periods'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
    }
  };

  return (
    <div className="flex flex-col items-stretch gap-1.5">
      <button
        type="button"
        onClick={run}
        disabled={busy || (entryIds !== undefined && entryIds.length === 0)}
        className={`${size === 'sm' ? 'px-3 py-1.5' : 'px-3.5 py-2'} text-xs font-bold text-white bg-accent hover:bg-accent-mid rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50`}
        title={t(
          'الوكيل الذكي يدقق كل يوم ويعيد ترتيبه كتقرير واضح للقارئ ويصنف ما تعلمته (جديد / تعزيز / متكرر) بمقارنته بالأيام السابقة',
          'The AI agent proofreads each day, restructures it into a clear report and classifies the learning (new / reinforced / routine) against earlier days'
        )}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
        <span>
          {busy
            ? t(`الوكيل يعمل… ${Math.round(progress)}%`, `Agent working… ${Math.round(progress)}%`)
            : pending
            ? t(`تحليل بالوكيل الذكي (${pending})`, `Analyse with AI agent (${pending})`)
            : t('تحليل بالوكيل الذكي', 'Analyse with AI agent')}
        </span>
      </button>
      {busy && message && <span className="text-[10.5px] text-sub truncate max-w-[18rem]">{message}</span>}
      {!busy && error && <span className="text-[10.5px] font-bold text-accent">{error}</span>}
    </div>
  );
};
