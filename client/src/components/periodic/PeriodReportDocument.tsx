import React from 'react';
import { LEARNING_STATUS_LABELS, PeriodReportContent, PeriodReportStats, ProfileInput, ReportProfileDTO } from '@coop/shared';
import { LearningStatusBadge } from '../final/EntryInsightPanel';

/** Printable weekly / monthly COOP report (A4, same visual language as the final report) */
export const PeriodReportDocument: React.FC<{
  content: PeriodReportContent;
  stats: PeriodReportStats;
  profile: ReportProfileDTO | ProfileInput;
  lang: 'ar' | 'en';
  version: number;
}> = ({ content, stats, profile, lang, version }) => {
  const isAr = lang === 'ar';
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const pct = Math.min(100, Math.round((stats.cumulativeHours / Math.max(stats.plannedHours, 1)) * 100));

  const info: [string, string][] = [
    [L('اسم المتدرب', 'Trainee'), profile.studentName],
    [L('الرقم التدريبي', 'Training No.'), profile.trainingNumber],
    [L('جهة التدريب', 'Host Organization'), profile.entityAddress],
    [L('القسم / الوحدة', 'Department / Unit'), profile.trainingUnit || profile.department],
    [L('المشرف الميداني', 'Field Supervisor'), profile.responsibleName],
    [L('المشرف الأكاديمي', 'Academic Supervisor'), profile.supervisorName]
  ];

  return (
    <article id="period-report-paper" dir={isAr ? 'rtl' : 'ltr'} className="period-doc bg-card border border-line rounded-2xl p-5 sm:p-10 shadow-sm text-ink print-page-wrapper">
      <header className="text-center space-y-1 pb-5 border-b-2 border-[#8B0000]">
        <div className="text-[11px] font-bold text-sub">{L('المملكة العربية السعودية', 'Kingdom of Saudi Arabia')}</div>
        {(profile.trainingUnit || profile.department) && <div className="text-[11px] font-bold text-sub">{profile.trainingUnit || profile.department}</div>}
        <h1 className="text-lg sm:text-xl font-black text-[#8B0000] pt-2">{content.title}</h1>
        <div className="text-xs text-sub font-semibold">{content.subtitle}</div>
        <div className="text-[10px] text-muted">{L(`الإصدار ${version}`, `Version ${version}`)}</div>
      </header>

      <table className="period-info w-full text-xs my-5">
        <tbody>
          {info.map(([k, v]) => (
            <tr key={k}>
              <th>{k}</th>
              <td>{v || '—'}</td>
            </tr>
          ))}
          <tr>
            <th>{L('ساعات الفترة', 'Hours this period')}</th>
            <td>
              {stats.hours} {L('ساعة', 'h')} · {stats.days} {L('أيام عمل', 'working days')} · {stats.entries} {L('مهمة', 'tasks')}
            </td>
          </tr>
          <tr>
            <th>{L('الساعات التراكمية', 'Cumulative hours')}</th>
            <td>
              {stats.cumulativeHours} / {stats.plannedHours} ({pct}%)
              <div className="period-progress">
                <div style={{ width: `${pct}%` }} />
              </div>
            </td>
          </tr>
          <tr>
            <th>{L('تصنيف التعلم', 'Learning profile')}</th>
            <td>
              {LEARNING_STATUS_LABELS.new[lang]}: {stats.newCount} · {LEARNING_STATUS_LABELS.reinforced[lang]}: {stats.reinforcedCount} ·{' '}
              {LEARNING_STATUS_LABELS.routine[lang]}: {stats.routineCount}
            </td>
          </tr>
        </tbody>
      </table>

      {content.sections.map((s, i) => (
        <section key={s.key} className="period-section">
          <h2>
            {i + 1}. {s.heading}
          </h2>
          {s.body &&
            s.body
              .split(/\n{2,}/)
              .filter((p) => p.trim())
              .map((p, pi) => <p key={pi}>{p.trim()}</p>)}

          {s.key === 'activities' && content.activities.length > 0 && (
            <table className="period-table w-full text-xs">
              <thead>
                <tr>
                  <th className="w-28">{L('التاريخ', 'Date')}</th>
                  <th className="w-44">{L('المهمة', 'Task')}</th>
                  <th>{L('ما نُفّذ', 'What was done')}</th>
                  <th className="w-14">{L('الساعات', 'Hours')}</th>
                  <th className="w-24">{L('التصنيف', 'Learning')}</th>
                </tr>
              </thead>
              <tbody>
                {content.activities.map((a) => (
                  <tr key={a.entryId}>
                    <td>{a.dateLabel}</td>
                    <td className="font-bold">{a.title}</td>
                    <td>{a.summary}</td>
                    <td className="text-center">{a.hours}</td>
                    <td>{a.learningStatus ? <LearningStatusBadge status={a.learningStatus} isAr={isAr} compact /> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {s.key === 'skills' && (
            <div className="space-y-2">
              {content.newSkills.length > 0 && (
                <div>
                  <div className="period-sub period-sub-new">{L('معارف جديدة', 'New knowledge')}</div>
                  <ul>
                    {content.newSkills.map((k, ki) => (
                      <li key={ki}>{k}</li>
                    ))}
                  </ul>
                </div>
              )}
              {content.reinforcedSkills.length > 0 && (
                <div>
                  <div className="period-sub period-sub-reinforced">{L('مهارات تم تعزيزها', 'Reinforced skills')}</div>
                  <ul>
                    {content.reinforcedSkills.map((k, ki) => (
                      <li key={ki}>{k}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {s.items && s.items.length > 0 && s.key === 'tools' ? (
            <div className="insight-tools">
              {s.items.map((t) => (
                <span key={t} className="tech-pill insight-tool">
                  {t}
                </span>
              ))}
            </div>
          ) : (
            s.items &&
            s.items.length > 0 && (
              <ul>
                {s.items.map((it, ii) => (
                  <li key={ii}>{it}</li>
                ))}
              </ul>
            )
          )}
        </section>
      ))}

      <section className="period-section period-signoff">
        <h2>{L('اعتماد المشرفين', 'Supervisor Sign-off')}</h2>
        <table className="period-info w-full text-xs">
          <tbody>
            <tr>
              <th>{L('ملاحظات المشرف الميداني', 'Field supervisor remarks')}</th>
              <td className="h-14" />
            </tr>
            <tr>
              <th>{L('التوقيع والتاريخ', 'Signature & date')}</th>
              <td className="h-10" />
            </tr>
            <tr>
              <th>{L('ملاحظات المشرف الأكاديمي', 'Academic supervisor remarks')}</th>
              <td className="h-14" />
            </tr>
            <tr>
              <th>{L('التوقيع والتاريخ', 'Signature & date')}</th>
              <td className="h-10" />
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  );
};
