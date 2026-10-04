import React from 'react';
import { EntryInsightDTO, LEARNING_STATUS_LABELS, LearningStatus, REWRITE_STYLE_LABELS } from '@coop/shared';

export interface EntryLocation {
  weekIndex: number;
  dayNumber: number;
}

export const LearningStatusBadge: React.FC<{ status: LearningStatus; isAr: boolean; compact?: boolean }> = ({ status, isAr, compact }) => (
  <span className={`insight-badge insight-badge-${status} ${compact ? 'insight-badge-compact' : ''}`}>
    {LEARNING_STATUS_LABELS[status][isAr ? 'ar' : 'en']}
  </span>
);

/** Localised text of an insight: the stored English edition when previewing in English */
export function insightText(insight: EntryInsightDTO, isAr: boolean) {
  const en = !isAr ? insight.en : null;
  return {
    title: en?.title || insight.correctedTitle,
    text: en?.text || insight.correctedText,
    goal: en?.goal || insight.goal,
    actionsDone: en?.actionsDone || insight.actionsDone,
    learnedWhat: en?.learnedWhat || insight.learnedWhat,
    relationNote: en?.relationNote || insight.relationNote || ''
  };
}

/**
 * The agent's reading of one day, printed under the day's narrative:
 * learning classification, goal, what was done, what was learned, tools and the link to earlier days.
 */
export const EntryInsightPanel: React.FC<{
  insight: EntryInsightDTO;
  isAr: boolean;
  locate: (entryId: number) => EntryLocation | undefined;
  formatDate: (d: string) => string;
}> = ({ insight, isAr, locate, formatDate }) => {
  const t = insightText(insight, isAr);
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const learnedLabel =
    insight.learningStatus === 'new'
      ? L('الجديد الذي تعلّمته', 'What I learned (new)')
      : insight.learningStatus === 'reinforced'
      ? L('ما أضافه هذا اليوم لمعرفتي السابقة', 'What this day added to prior knowledge')
      : L('المهارة التي تمت ممارستها', 'Skill practised');

  return (
    <div className={`insight-panel insight-panel-${insight.learningStatus}`}>
      <div className="insight-panel-head">
        <span className="insight-panel-title">{L('تحليل الوكيل الذكي لليوم', 'AI agent analysis of the day')}</span>
        <span className="insight-panel-meta">
          <LearningStatusBadge status={insight.learningStatus} isAr={isAr} />
          <span className="insight-style-tag">{REWRITE_STYLE_LABELS[insight.rewriteStyle][isAr ? 'ar' : 'en']}</span>
        </span>
      </div>

      <dl className="insight-grid">
        <div className="insight-cell">
          <dt>{L('الهدف من المهمة', 'Purpose of the task')}</dt>
          <dd>{t.goal}</dd>
        </div>
        <div className="insight-cell">
          <dt>{L('ماذا نفّذت', 'What I did')}</dt>
          <dd>{t.actionsDone}</dd>
        </div>
        <div className="insight-cell insight-cell-wide">
          <dt>{learnedLabel}</dt>
          <dd>{t.learnedWhat}</dd>
        </div>
        {insight.tools.length > 0 && (
          <div className="insight-cell insight-cell-wide">
            <dt>{L('الأدوات والتقنيات', 'Tools & technologies')}</dt>
            <dd className="insight-tools">
              {insight.tools.map((tool) => (
                <span key={tool} className="tech-pill insight-tool">
                  {tool}
                </span>
              ))}
            </dd>
          </div>
        )}
        {(t.relationNote || (insight.related && insight.related.length > 0)) && (
          <div className="insight-cell insight-cell-wide">
            <dt>{L('العلاقة بالأيام السابقة', 'Link to earlier days')}</dt>
            <dd>
              {t.relationNote}
              {insight.related && insight.related.length > 0 && (
                <span className="insight-refs">
                  {insight.related.map((r) => {
                    const loc = locate(r.entryId);
                    return (
                      <a key={r.entryId} href={`#entry-${r.entryId}`} className="insight-ref">
                        {loc
                          ? L(`الأسبوع ${loc.weekIndex} · اليوم ${loc.dayNumber}`, `Week ${loc.weekIndex} · Day ${loc.dayNumber}`)
                          : formatDate(r.entryDate)}
                      </a>
                    );
                  })}
                </span>
              )}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
};
