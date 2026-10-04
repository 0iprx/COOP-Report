import React from 'react';
import { EntryDTO, LEARNING_STATUS_LABELS, LearningStatus } from '@coop/shared';
import { LearningStatusBadge, insightText, EntryLocation } from './EntryInsightPanel';

/**
 * Cumulative learning record: every analysed day in order, what was learned and how it relates to
 * earlier days. New learnings first-class; routine days are summarised in one line.
 */
export const LearningMap: React.FC<{
  entries: EntryDTO[];
  isAr: boolean;
  locate: (entryId: number) => EntryLocation | undefined;
  formatDate: (d: string) => string;
  numerals: (n: number | string) => string;
}> = ({ entries, isAr, locate, formatDate, numerals }) => {
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const analysed = entries.filter((e) => e.insight);
  if (analysed.length === 0) return null;

  const counts: Record<LearningStatus, number> = { new: 0, reinforced: 0, routine: 0 };
  analysed.forEach((e) => counts[e.insight!.learningStatus]++);
  const shown = analysed.filter((e) => e.insight!.learningStatus !== 'routine');
  const routineDays = analysed.filter((e) => e.insight!.learningStatus === 'routine');

  return (
    <div id="sec-learning-map" className="scroll-mt-24 space-y-4 pt-4 page-break learning-map">
      <h2 className="text-lg font-extrabold text-ink border-b-2 border-accent pb-1.5 inline-block">
        {isAr ? `${numerals(4)}.${numerals(1)} ` : '4.1 '}
        {L('سجل التعلّم التراكمي', 'Cumulative Learning Record')}
      </h2>
      <p className="text-sm text-sub leading-loose">
        {L(
          `حلّل الوكيل الذكي ${numerals(analysed.length)} يوماً تدريبياً وقارن كل يوم بجميع الأيام التي سبقته، فتبيّن أن ${numerals(
            counts.new
          )} يوماً حملت معرفة جديدة، و${numerals(counts.reinforced)} يوماً عززت معرفة سابقة بإضافة جديدة، و${numerals(
            counts.routine
          )} يوماً كانت تكراراً لمهام سبق تنفيذها.`,
          `The AI agent analysed ${analysed.length} training days, comparing each with every earlier day: ${counts.new} introduced new knowledge, ${counts.reinforced} reinforced earlier knowledge with something new, and ${counts.routine} repeated earlier tasks.`
        )}
      </p>

      <table className="learning-map-table w-full text-start text-xs border-collapse">
        <thead>
          <tr>
            <th className="w-24">{L('المرجع', 'Ref.')}</th>
            <th className="w-28">{L('التصنيف', 'Type')}</th>
            <th>{L('ما تم تعلّمه', 'What was learned')}</th>
            <th className="w-40">{L('مبني على', 'Builds on')}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((e) => {
            const ins = e.insight!;
            const loc = locate(e.id);
            return (
              <tr key={e.id}>
                <td>
                  <a href={`#entry-${e.id}`} className="font-bold text-accent">
                    {loc ? L(`أ${numerals(loc.weekIndex)} · ي${numerals(loc.dayNumber)}`, `W${loc.weekIndex} · D${loc.dayNumber}`) : ''}
                  </a>
                  <div className="text-[10px] text-sub">{formatDate(e.entryDate)}</div>
                </td>
                <td>
                  <LearningStatusBadge status={ins.learningStatus} isAr={isAr} compact />
                </td>
                <td className="leading-relaxed">{insightText(ins, isAr).learnedWhat}</td>
                <td>
                  {(ins.related || []).map((r) => {
                    const rl = locate(r.entryId);
                    return (
                      <a key={r.entryId} href={`#entry-${r.entryId}`} className="insight-ref">
                        {rl ? L(`أ${numerals(rl.weekIndex)} · ي${numerals(rl.dayNumber)}`, `W${rl.weekIndex} · D${rl.dayNumber}`) : formatDate(r.entryDate)}
                      </a>
                    );
                  })}
                  {(!ins.related || ins.related.length === 0) && <span className="text-sub">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {routineDays.length > 0 && (
        <p className="text-xs text-sub leading-relaxed">
          <b>{LEARNING_STATUS_LABELS.routine[isAr ? 'ar' : 'en']}: </b>
          {routineDays
            .map((e) => {
              const loc = locate(e.id);
              return loc ? L(`الأسبوع ${numerals(loc.weekIndex)} اليوم ${numerals(loc.dayNumber)}`, `W${loc.weekIndex} D${loc.dayNumber}`) : formatDate(e.entryDate);
            })
            .join(isAr ? '، ' : ', ')}
        </p>
      )}
    </div>
  );
};
