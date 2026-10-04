import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Bot, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { EntryInsightDTO, REWRITE_STYLE_LABELS } from '@coop/shared';
import { api } from '../../services/api';
import { runAgentJob, apiErrorMessage } from '../../services/agentJobs';
import { LearningStatusBadge, insightText } from '../final/EntryInsightPanel';

/**
 * Agent controls for one daily entry: analyse, show the classification and findings,
 * and optionally apply the proofread text (the previous text is archived as a revision).
 */
export const EntryAgentInline: React.FC<{ entryId: number; insight?: EntryInsightDTO; isAr: boolean }> = ({ entryId, insight, isAr }) => {
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<'' | 'analyse' | 'apply'>('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['insights'] });
    queryClient.invalidateQueries({ queryKey: ['finalReport'] });
  };

  const analyse = async () => {
    setBusy('analyse');
    setError('');
    try {
      await runAgentJob(() => api.post(`/insights/analyze/${entryId}`), (s) => setStatus(s.message));
      setOpen(true);
      refresh();
    } catch (err) {
      setError(apiErrorMessage(err, L('تعذر تحليل اليوم', 'Analysis failed')));
    } finally {
      setBusy('');
      setStatus('');
    }
  };

  const apply = async () => {
    setBusy('apply');
    setError('');
    try {
      await api.post(`/insights/${entryId}/apply`);
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      refresh();
    } catch (err) {
      setError(apiErrorMessage(err, L('تعذر تطبيق النص', 'Could not apply the text')));
    } finally {
      setBusy('');
    }
  };

  const t = insight ? insightText(insight, isAr) : null;

  return (
    <div className="pt-1 space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        {insight && <LearningStatusBadge status={insight.learningStatus} isAr={isAr} compact />}
        {insight?.isStale && (
          <span className="px-2 py-0.5 rounded-full font-bold bg-warn-bg text-warn">{L('عُدّل بعد التحليل', 'Edited since analysis')}</span>
        )}
        <button
          type="button"
          onClick={analyse}
          disabled={!!busy}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold text-accent bg-accent-dim hover:opacity-90 disabled:opacity-60"
        >
          {busy === 'analyse' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
          {insight ? L('إعادة التحليل', 'Re-analyse') : L('تحليل بالوكيل الذكي', 'Analyse with AI agent')}
        </button>
        {insight && (
          <button type="button" onClick={() => setOpen(!open)} className="inline-flex items-center gap-1 font-bold text-sub hover:text-ink">
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {L('عرض التحليل', 'Show analysis')}
          </button>
        )}
        {busy === 'analyse' && status && <span className="text-sub truncate max-w-[16rem]">{status}</span>}
      </div>

      {error && <div className="text-[11px] font-bold text-accent">{error}</div>}

      {insight && t && open && (
        <div className="insight-panel">
          <dl className="insight-grid">
            <div className="insight-cell">
              <dt>{L('الهدف من المهمة', 'Purpose')}</dt>
              <dd>{t.goal}</dd>
            </div>
            <div className="insight-cell">
              <dt>{L('ماذا نفّذت', 'What I did')}</dt>
              <dd>{t.actionsDone}</dd>
            </div>
            <div className="insight-cell insight-cell-wide">
              <dt>{L('ما تعلّمته', 'What I learned')}</dt>
              <dd>{t.learnedWhat}</dd>
            </div>
            {t.relationNote && (
              <div className="insight-cell insight-cell-wide">
                <dt>{L('العلاقة بالأيام السابقة', 'Link to earlier days')}</dt>
                <dd>{t.relationNote}</dd>
              </div>
            )}
            <div className="insight-cell insight-cell-wide">
              <dt>
                {L('النص بعد التدقيق وإعادة الكتابة', 'Proofread & rewritten text')} — {REWRITE_STYLE_LABELS[insight.rewriteStyle][isAr ? 'ar' : 'en']}
              </dt>
              <dd className="whitespace-pre-wrap">{t.text}</dd>
            </div>
          </dl>
          {!insight.isStale && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 mt-2 border-t border-line">
              <span className="text-[10.5px] text-sub">
                {L('عند التطبيق يُحفظ نصك الحالي في سجل التعديلات ويمكن استرجاعه في أي وقت.', 'Applying archives your current text in the revision history; it can be restored anytime.')}
              </span>
              <button
                type="button"
                onClick={apply}
                disabled={!!busy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-accent hover:bg-accent/90 disabled:opacity-60"
              >
                {busy === 'apply' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {L('تطبيق النص المدقق على اليومية', 'Apply proofread text to the entry')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
