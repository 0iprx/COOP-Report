import React from 'react';
import { Bookmark } from 'lucide-react';
import { EntryDTO, LEARNING_STATUS_LABELS, LearningStatus, calculateHoursBetween } from '@coop/shared';
import { LearningStatusBadge, insightText } from './EntryInsightPanel';

interface TocWeek {
  weekIndex: number;
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  entries: EntryDTO[];
}

interface ReportTOCProps {
  weeks: TocWeek[];
  isAr: boolean;
  entityAddress?: string;
  showDays: boolean;
  hasLearningMap: boolean;
  useCorrectedText: boolean;
  weekLabel: (w: TocWeek) => string;
  weekTopic: (w: TocWeek) => string;
  formatPeriod: (w: TocWeek) => string;
  formatDate: (d: string) => string;
  numerals: (n: number | string) => string;
}

/**
 * Hierarchical, numbered table of contents. Every line is an internal link, and browsers keep
 * internal links when saving to PDF, so the index is clickable in the exported PDF as well.
 * Each training day is listed with the agent's learning classification.
 */
export const ReportTOC: React.FC<ReportTOCProps> = ({
  weeks,
  isAr,
  entityAddress,
  showDays,
  hasLearningMap,
  useCorrectedText,
  weekLabel,
  weekTopic,
  formatPeriod,
  formatDate,
  numerals
}) => {
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const num = (...parts: number[]) => parts.map((p) => numerals(p)).join('.');

  const allEntries = weeks.flatMap((w) => w.entries || []);
  const counts: Record<LearningStatus, number> = { new: 0, reinforced: 0, routine: 0 };
  for (const e of allEntries) if (e.insight) counts[e.insight.learningStatus]++;
  const analyzed = counts.new + counts.reinforced + counts.routine;
  const totalHours = allEntries.reduce((s, e) => s + calculateHoursBetween(e.timeFrom, e.timeTo), 0);

  const Row: React.FC<{ href: string; n: string; title: React.ReactNode; sub?: React.ReactNode; trail?: React.ReactNode; level: 1 | 2 | 3 }> = ({
    href,
    n,
    title,
    sub,
    trail,
    level
  }) => (
    <a href={href} className={`toc-row toc-level-${level}`}>
      <span className="toc-num">{n}</span>
      <span className="toc-title">
        {title}
        {sub && <span className="toc-sub">{sub}</span>}
      </span>
      <span className="toc-leader" aria-hidden="true" />
      {trail !== undefined && <span className="toc-trail">{trail}</span>}
      {/* Page number: reserved here, filled in after the printed pages are laid out (services/printPaged.ts) */}
      <span className="toc-pg" aria-hidden="true">00</span>
    </a>
  );

  return (
    <div id="sec-toc" className="scroll-mt-24 py-6 page-break toc-root" dir={isAr ? 'rtl' : 'ltr'}>
      <h2 className="text-base font-black text-[#8B0000] text-center pb-3 mb-5 border-b-2 border-[#8B0000] flex items-center justify-center gap-2">
        <Bookmark className="w-5 h-5" />
        <span>{L('فهرس المحتويات', 'Table of Contents')}</span>
      </h2>

      <div className="toc-summary">
        <span>
          <b>{numerals(weeks.length)}</b> {L('أسبوعاً', 'weeks')}
        </span>
        <span>
          <b>{numerals(allEntries.length)}</b> {L('يوماً موثقاً', 'documented days')}
        </span>
        <span>
          <b>{numerals(Number(totalHours.toFixed(1)))}</b> {L('ساعة', 'hours')}
        </span>
        {analyzed > 0 && (
          <>
            <span className="toc-summary-new">
              <b>{numerals(counts.new)}</b> {LEARNING_STATUS_LABELS.new[isAr ? 'ar' : 'en']}
            </span>
            <span className="toc-summary-reinforced">
              <b>{numerals(counts.reinforced)}</b> {LEARNING_STATUS_LABELS.reinforced[isAr ? 'ar' : 'en']}
            </span>
            <span className="toc-summary-routine">
              <b>{numerals(counts.routine)}</b> {LEARNING_STATUS_LABELS.routine[isAr ? 'ar' : 'en']}
            </span>
          </>
        )}
      </div>

      <div role="navigation" className="toc-list max-w-3xl mx-auto">
        <Row href="#sec-cover" n="" level={1} title={L('صفحة الغلاف وبيانات المتدرب', 'Cover Page & Trainee Details')} />
        <Row href="#sec-intro" n={num(1)} level={1} title={L('المقدمة وأهداف التدريب', 'Introduction & Training Objectives')} />
        <Row
          href="#sec-entity"
          n={num(2)}
          level={1}
          title={`${L('التعريف بجهة التدريب وطبيعة العمل', 'Host Organization Overview')}${entityAddress ? ` (${entityAddress})` : ''}`}
        />
        <Row
          href="#sec-timeline"
          n={num(3)}
          level={1}
          title={L('تقارير الأسابيع والسجل اليومي الميداني', 'Weekly Reports & Daily Field Log')}
          trail={L(`${numerals(weeks.length)} أسبوعاً`, `${weeks.length} weeks`)}
        />

        {weeks.map((w, wi) => (
          <div key={w.weekIndex} className="toc-week-block">
            <Row
              href={`#week-${w.weekIndex}`}
              n={num(3, wi + 1)}
              level={2}
              title={
                <>
                  <b>{weekLabel(w)}:</b> {weekTopic(w)}
                </>
              }
              sub={formatPeriod(w)}
            />
            {showDays &&
              (w.entries || []).map((e, di) => {
                const title = e.insight && useCorrectedText && !e.insight.isStale ? insightText(e.insight, isAr).title : e.title;
                return (
                  <Row
                    key={e.id}
                    href={`#entry-${e.id}`}
                    n={num(3, wi + 1, di + 1)}
                    level={3}
                    title={
                      <>
                        <span className="toc-day">{L(`اليوم ${numerals(di + 1)}`, `Day ${di + 1}`)}</span> {title}
                      </>
                    }
                    trail={
                      <>
                        {e.insight && <LearningStatusBadge status={e.insight.learningStatus} isAr={isAr} compact />}
                        <span className="toc-date">{formatDate(e.entryDate)}</span>
                      </>
                    }
                  />
                );
              })}
          </div>
        ))}

        <Row href="#sec-skills" n={num(4)} level={1} title={L('المعارف والمهارات والتجارب المكتسبة', 'Acquired Knowledge & Skills')} />
        {hasLearningMap && (
          <Row
            href="#sec-learning-map"
            n={num(4, 1)}
            level={2}
            title={L('سجل التعلّم التراكمي (تحليل الوكيل الذكي)', 'Cumulative Learning Record (AI agent analysis)')}
          />
        )}
        <Row href="#sec-conclusion" n={num(5)} level={1} title={L('الخاتمة والتوصيات', 'Conclusion & Recommendations')} />
        <Row href="#sec-approval" n={num(6)} level={1} title={L('استمارة تقييم المشرفين والملاحق', 'Supervisory Evaluation & Appendices')} />
      </div>

      {analyzed > 0 && (
        <div className="toc-legend">
          <span>{L('دليل التصنيف:', 'Legend:')}</span>
          <LearningStatusBadge status="new" isAr={isAr} compact />
          <span>{L('معرفة لم تظهر في أي يوم سابق', 'not seen on any earlier day')}</span>
          <LearningStatusBadge status="reinforced" isAr={isAr} compact />
          <span>{L('بناء على معرفة سابقة بإضافة جديدة', 'builds on earlier knowledge')}</span>
          <LearningStatusBadge status="routine" isAr={isAr} compact />
          <span>{L('تكرار لمهمة سابقة', 'repeat of an earlier task')}</span>
        </div>
      )}
    </div>
  );
};
