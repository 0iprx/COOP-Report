import React from 'react';
import { GraduationCap, Building } from 'lucide-react';
import {
  EntryDTO,
  WeekGroup,
  calculateHoursBetween,
  formatDateArabic,
  formatDateEnglish,
  formatWeekPeriod,
  elevateTaskTitle,
  normalizeStudentName,
  generateAcademicWeeklySynthesis
} from '@coop/shared';
import { BidiText } from '../common/AcademicMarkdownView';
import { ProceduralNarrativeView } from '../common/ProceduralNarrativeView';

/* Week names and category labels used by the printable final report */
const AR_WEEK_NAMES = [
  'الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع', 'الأسبوع الخامس',
  'الأسبوع السادس', 'الأسبوع السابع', 'الأسبوع الثامن', 'الأسبوع التاسع', 'الأسبوع العاشر',
  'الأسبوع الحادي عشر', 'الأسبوع الثاني عشر', 'الأسبوع الثالث عشر', 'الأسبوع الرابع عشر',
  'الأسبوع الخامس عشر', 'الأسبوع السادس عشر'
];
const weekName = (i: number, isAr: boolean) => (isAr ? AR_WEEK_NAMES[i - 1] || `الأسبوع ${i}` : `Week ${i}`);

interface ProfileLike {
  studentName?: string;
  trainingNumber?: string;
  department?: string;
  trainingUnit?: string;
  supervisorName?: string;
  responsibleName?: string;
  entityAddress?: string;
  employeesCount?: string;
  trainingWeeks?: number;
  courseHours?: number;
  startDate?: string;
  companyLogo?: string | null;
  institutionLogo?: string | null;
  introText?: string | null;
  entityIntroText?: string | null;
  skillsText?: string | null;
  conclusionText?: string | null;
}

interface FinalReportDocumentProps {
  isAr: boolean;
  profile: ProfileLike;
  weeks: WeekGroup[];
  totalHours: number;
  getWeekTopic: (w: WeekGroup, isAr: boolean) => string;
  translateCategory: (cat: string, isAr: boolean) => string;
}

/** Splits free text into paragraphs; single line breaks stay inside a paragraph as list-like lines. */
const Paragraphs: React.FC<{ text?: string | null; isAr: boolean; empty: string }> = ({ text, isAr, empty }) => {
  const clean = (text || '').replace(/\\n/g, '\n').trim();
  if (!clean) return <p className="rt-p fd-empty">{empty}</p>;
  return (
    <>
      {clean.split(/\n{2,}/).map((block, i) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        const bullets = lines.length > 1 && lines.every((l) => /^([•\-*]|[0-9٠-٩]+[.)-]|[١-٩]\.)\s*/.test(l));
        if (bullets) {
          return (
            <ul key={i} className="rt-list rt-ul">
              {lines.map((l, k) => (
                <li key={k}>
                  <BidiText text={l.replace(/^([•\-*]|[0-9٠-٩]+[.)-])\s*/, '')} isAr={isAr} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="rt-p">
            {lines.map((l, k) => (
              <React.Fragment key={k}>
                {k > 0 && <br />}
                <BidiText text={l} isAr={isAr} />
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
};

const entryHours = (e: EntryDTO) => calculateHoursBetween(e.timeFrom || '08:00', e.timeTo || '16:00');
const fmtHours = (h: number) => (Number.isInteger(h) ? String(h) : h.toFixed(1));

export const FinalReportDocument: React.FC<FinalReportDocumentProps> = ({
  isAr,
  profile,
  weeks,
  totalHours,
  getWeekTopic,
  translateCategory
}) => {
  const fmtDate = (d: string) => (isAr ? formatDateArabic(d) : formatDateEnglish(d));
  const documentedWeeks = weeks.filter((w) => (w.entries || []).length > 0);
  const plannedWeeks = profile.trainingWeeks || weeks.length;
  const plannedHours = profile.courseHours || 0;
  const studentName = normalizeStudentName(profile.studentName) || '—';
  const T = (ar: string, en: string) => (isAr ? ar : en);

  // Report-wide synthesis for the competencies section (computed from the logged entries)
  const syntheses = documentedWeeks.map((w) =>
    generateAcademicWeeklySynthesis(w.entries, w.weekIndex, w.totalHours || w.entries.reduce((s, e) => s + entryHours(e), 0), isAr)
  );
  // Measured distribution of logged work by category
  const byCategory = new Map<string, { days: number; hours: number }>();
  for (const w of documentedWeeks) for (const e of w.entries) {
    const k = e.category || T('أخرى', 'Other');
    const cur = byCategory.get(k) || { days: 0, hours: 0 };
    cur.days += 1; cur.hours += entryHours(e);
    byCategory.set(k, cur);
  }
  const categoryRows = [...byCategory.entries()].sort((x, y) => y[1].hours - x[1].hours);
  const allCompetencies = Array.from(new Set(syntheses.flatMap((s) => s.acquiredCompetencies))).slice(0, 8);
  const allTools = Array.from(new Set(syntheses.flatMap((s) => s.toolsAndTech)));

  const sections = [
    { id: 'sec-intro', n: 1, title: T('المقدمة وأهداف التدريب', 'Introduction and objectives') },
    { id: 'sec-entity', n: 2, title: T('التعريف بجهة التدريب وطبيعة العمل', 'The host organization') },
    { id: 'sec-timeline', n: 3, title: T('سجل الأسابيع التدريبية', 'Weekly training record') },
    { id: 'sec-skills', n: 4, title: T('المعارف والمهارات المكتسبة', 'Knowledge and skills acquired') },
    { id: 'sec-conclusion', n: 5, title: T('الخاتمة والتوصيات', 'Conclusion and recommendations') },
    { id: 'sec-approval', n: 6, title: T('الإقرار والاعتماد', 'Declaration and endorsement') }
  ];

  return (
    <>
      {/* ══ Cover ══ */}
      <section id="sec-cover" className="rp-cover fd-cover">
        <div className="rp-cover-head">
          <div className="rp-org">
            {profile.institutionLogo ? (
              <img src={profile.institutionLogo} alt={T('شعار الجامعة', 'University logo')} className="rp-org-logo" />
            ) : (
              <span className="rp-org-logo is-empty" aria-hidden="true">
                <GraduationCap className="w-6 h-6" />
              </span>
            )}
            <div className="rp-org-text">
              <span className="rp-org-name">{T('المملكة العربية السعودية', 'Kingdom of Saudi Arabia')}</span>
              <span className="rp-org-sub">{T('وزارة التعليم', 'Ministry of Education')}</span>
              {profile.trainingUnit && <span className="rp-org-sub"><BidiText text={profile.trainingUnit} isAr={isAr} /></span>}
            </div>
          </div>
          <div className="rp-org is-end">
            <div className="rp-org-text">
              <span className="rp-org-name"><BidiText text={profile.entityAddress || T('جهة التدريب', 'Host organization')} isAr={isAr} /></span>
            </div>
            {profile.companyLogo ? (
              <img src={profile.companyLogo} alt={T('شعار جهة التدريب', 'Company logo')} className="rp-org-logo" />
            ) : (
              <span className="rp-org-logo is-empty" aria-hidden="true">
                <Building className="w-6 h-6" />
              </span>
            )}
          </div>
        </div>

        <div className="rp-cover-body">
          <div className="rp-cover-titleblock">
            <p className="rp-kicker">{T('تقرير التدريب التعاوني', 'Cooperative Training Report')}</p>
            <h1 className="rp-cover-title">{T('التقرير النهائي', 'Final Report')}</h1>
            {profile.entityAddress && (
              <p className="rp-cover-sub">
                <BidiText text={profile.entityAddress} isAr={isAr} />
              </p>
            )}
            {weeks.length > 0 && (
              <p className="rp-period">
                {T('من', 'From')} <bdi>{fmtDate(weeks[0].weekStart)}</bdi> {T('إلى', 'to')} <bdi>{fmtDate(weeks[weeks.length - 1].weekEnd)}</bdi>
              </p>
            )}
          </div>

          <dl className="rp-meta">
            <div className="rp-meta-item">
              <dt>{T('اسم المتدرب', 'Trainee')}</dt>
              <dd>{studentName}</dd>
            </div>
            <div className="rp-meta-item">
              <dt>{T('الرقم التدريبي', 'Training ID')}</dt>
              <dd><bdi>{profile.trainingNumber || '—'}</bdi></dd>
            </div>
            <div className="rp-meta-item">
              <dt>{T('القسم / التخصص', 'Department')}</dt>
              <dd><BidiText text={profile.department || '—'} isAr={isAr} /></dd>
            </div>
            <div className="rp-meta-item">
              <dt>{T('الكلية', 'College')}</dt>
              <dd><BidiText text={profile.trainingUnit || '—'} isAr={isAr} /></dd>
            </div>
            <div className="rp-meta-item">
              <dt>{T('المشرف الأكاديمي', 'Academic supervisor')}</dt>
              <dd>{profile.supervisorName || '—'}</dd>
            </div>
            <div className="rp-meta-item">
              <dt>{T('المشرف الميداني', 'Field supervisor')}</dt>
              <dd>{profile.responsibleName || '—'}</dd>
            </div>
            <div className="rp-meta-item">
              <dt>{T('الساعات المسجلة', 'Hours logged')}</dt>
              <dd>
                <bdi>{fmtHours(totalHours)}</bdi>
                {plannedHours > 0 && <span className="fd-of"> {T('من', 'of')} <bdi>{plannedHours}</bdi></span>}
              </dd>
            </div>
            <div className="rp-meta-item">
              <dt>{T('الأسابيع الموثقة', 'Weeks documented')}</dt>
              <dd>
                <bdi>{documentedWeeks.length}</bdi>
                <span className="fd-of"> {T('من', 'of')} <bdi>{plannedWeeks}</bdi></span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rp-cover-foot">
          <span>{T('التقرير النهائي للتدريب التعاوني', 'Cooperative training final report')}</span>
          <span><BidiText text={profile.trainingUnit || ''} isAr={isAr} /></span>
        </div>
      </section>

      <div className="rp-body">
        {/* ══ Contents ══ */}
        <div id="sec-toc" className="fd-toc" role="navigation" aria-label={T('فهرس المحتويات', 'Contents')}>
          <h2 className="rt-h1">{T('فهرس المحتويات', 'Contents')}</h2>
          <ol className="fd-toc-list">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="fd-toc-row">
                  <span className="fd-toc-n">{s.n}</span>
                  <span className="fd-toc-title">{s.title}</span>
                </a>
                {s.id === 'sec-timeline' && (
                  <ol className="fd-toc-sub">
                    {weeks.map((w) => (
                      <li key={w.weekIndex}>
                        <a href={`#week-${w.weekIndex}`} className="fd-toc-row is-sub">
                          <span className="fd-toc-n">{`3.${w.weekIndex}`}</span>
                          <span className="fd-toc-title">
                            {weekName(w.weekIndex, isAr)}
                            <span className="fd-toc-topic">
                              {' — '}
                              <BidiText text={getWeekTopic(w, isAr)} isAr={isAr} />
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* ══ 1. Introduction ══ */}
        <section id="sec-intro" className="fd-section">
          <h2 className="rt-h1">1. {sections[0].title}</h2>
          <div className="rt-doc">
            <Paragraphs text={profile.introText} isAr={isAr} empty={T('لم تُكتب المقدمة بعد.', 'The introduction has not been written yet.')} />
          </div>
        </section>

        {/* ══ 2. Organization ══ */}
        <section id="sec-entity" className="fd-section is-flow">
          <h2 className="rt-h1">2. {sections[1].title}</h2>
          <div className="rt-doc">
            <Paragraphs text={profile.entityIntroText} isAr={isAr} empty={T('لم يُكتب التعريف بجهة التدريب بعد.', 'The organization overview has not been written yet.')} />
          </div>
          <dl className="fd-facts">
            <div>
              <dt>{T('جهة التدريب', 'Organization')}</dt>
              <dd><BidiText text={profile.entityAddress || '—'} isAr={isAr} /></dd>
            </div>
            {profile.employeesCount && (
              <div>
                <dt>{T('عدد الموظفين', 'Employees')}</dt>
                <dd><BidiText text={profile.employeesCount} isAr={isAr} /></dd>
              </div>
            )}
            <div>
              <dt>{T('المشرف الميداني', 'Field supervisor')}</dt>
              <dd>{profile.responsibleName || '—'}</dd>
            </div>
          </dl>
        </section>

        {/* ══ 3. Weekly record ══ */}
        <section id="sec-timeline" className="fd-section">
          <h2 className="rt-h1">3. {sections[2].title}</h2>
          <p className="rt-p fd-lead">
            {T(
              `يعرض هذا الباب ${documentedWeeks.length} أسبوعاً موثقاً من أصل ${plannedWeeks}، بإجمالي ${fmtHours(totalHours)} ساعة مسجلة.`,
              `This chapter covers ${documentedWeeks.length} documented weeks out of ${plannedWeeks}, with ${fmtHours(totalHours)} hours logged.`
            )}
          </p>

          {weeks.map((w) => {
            const entries = w.entries || [];
            const hours = w.totalHours || entries.reduce((s, e) => s + entryHours(e), 0);
            const synthesis = entries.length > 0 ? generateAcademicWeeklySynthesis(entries, w.weekIndex, hours, isAr) : null;
            return (
              <article key={w.weekIndex} id={`week-${w.weekIndex}`} className="fd-week">
                <header className="fd-week-head">
                  <span className="fd-week-n">3.{w.weekIndex}</span>
                  <h3 className="fd-week-title">
                    {weekName(w.weekIndex, isAr)}: <BidiText text={getWeekTopic(w, isAr)} isAr={isAr} />
                  </h3>
                  <p className="fd-week-meta">
                    <BidiText text={formatWeekPeriod(w, isAr)} isAr={isAr} />
                    <span aria-hidden="true">  ·  </span>
                    {entries.length} {T('أيام', 'days')}
                    <span aria-hidden="true">  ·  </span>
                    {fmtHours(hours)} {T('ساعة', 'hours')}
                  </p>
                </header>

                {entries.length === 0 ? (
                  <p className="rt-p fd-empty">{T('لا توجد إدخالات موثقة لهذا الأسبوع.', 'No entries were logged for this week.')}</p>
                ) : (
                  <>
                    <div className="rt-table-wrap">
                      <table className="rt-table fd-days">
                        <thead>
                          <tr>
                            <th className="al-start">{T('اليوم', 'Day')}</th>
                            <th className="al-start">{T('الوقت', 'Time')}</th>
                            <th className="al-end">{T('الساعات', 'Hours')}</th>
                            <th className="al-start">{T('النشاط', 'Activity')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map((e, i) => (
                            <tr key={e.id || i}>
                              <td className="al-start fd-nowrap">{fmtDate(e.entryDate)}</td>
                              <td className="al-start fd-nowrap"><bdi dir="ltr">{e.timeFrom || '08:00'}–{e.timeTo || '16:00'}</bdi></td>
                              <td className="al-end">{fmtHours(entryHours(e))}</td>
                              <td className="al-start"><BidiText text={elevateTaskTitle(e.title, e.description, isAr)} isAr={isAr} /></td>
                            </tr>
                          ))}
                          <tr className="is-total">
                            <td className="al-start" colSpan={2}>{T('المجموع', 'Total')}</td>
                            <td className="al-end">{fmtHours(hours)}</td>
                            <td />
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {entries.map((e, i) => (
                      <div key={e.id || i} className="fd-day">
                        <h4 className="fd-day-title">
                          <span className="fd-day-date">{fmtDate(e.entryDate)}</span>
                          <BidiText text={elevateTaskTitle(e.title, e.description, isAr)} isAr={isAr} />
                        </h4>
                        <p className="fd-day-meta">
                          <BidiText text={translateCategory(e.category, isAr)} isAr={isAr} />
                          <span aria-hidden="true">  ·  </span>
                          <bdi dir="ltr">{e.timeFrom || '08:00'}–{e.timeTo || '16:00'}</bdi>
                        </p>
                        <ProceduralNarrativeView rawText={e.description} isAr={isAr} variant="document" />
                      </div>
                    ))}
                  </>
                )}

                {w.evidence && w.evidence.length > 0 && (
                  <div className="fd-figures">
                    {w.evidence.map((ev, k) => (
                      <figure key={ev.id || k} className="fd-figure">
                        <img src={ev.imageData} alt={ev.caption || ''} loading="lazy" />
                        <figcaption>
                          <span className="fd-fig-n">{T(`شكل ${w.weekIndex}.${k + 1}`, `Figure ${w.weekIndex}.${k + 1}`)}</span>{' '}
                          <BidiText text={ev.caption} isAr={isAr} />
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                )}

                {synthesis && (
                  <div className="fd-summary">
                    <h4 className="fd-summary-title">{T('خلاصة الأسبوع', 'Week summary')}</h4>
                    <p className="rt-p"><BidiText text={synthesis.executiveSummary} isAr={isAr} /></p>
                    {synthesis.acquiredCompetencies.length > 0 && (
                      <>
                        <span className="fd-label">{T('المهارات المكتسبة', 'Skills acquired')}</span>
                        <ul className="rt-list rt-ul">
                          {synthesis.acquiredCompetencies.map((c, k) => (
                            <li key={k}><BidiText text={c} isAr={isAr} /></li>
                          ))}
                        </ul>
                      </>
                    )}
                    {synthesis.toolsAndTech.length > 0 && (
                      <p className="fd-tools">
                        <span className="fd-label is-inline">{T('الأدوات والتقنيات:', 'Tools and technologies:')}</span>{' '}
                        <BidiText text={synthesis.toolsAndTech.join(isAr ? '، ' : ', ')} isAr={isAr} />
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>

        {/* ══ 4. Skills ══ */}
        <section id="sec-skills" className="fd-section">
          <h2 className="rt-h1">4. {sections[3].title}</h2>
          <div className="rt-doc">
            {profile.skillsText && <Paragraphs text={profile.skillsText} isAr={isAr} empty="" />}
          </div>
          {categoryRows.length > 0 && (
            <>
              <h3 className="rt-h2">{T('توزيع العمل الموثق حسب المجال', 'Logged work by area')}</h3>
              <div className="rt-table-wrap is-keep">
                <table className="rt-table">
                  <thead>
                    <tr>
                      <th className="al-start">{T('المجال', 'Area')}</th>
                      <th className="al-end">{T('الأيام', 'Days')}</th>
                      <th className="al-end">{T('الساعات', 'Hours')}</th>
                      <th className="al-end">{T('النسبة', 'Share')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryRows.map(([cat, v]) => (
                      <tr key={cat}>
                        <td className="al-start"><BidiText text={translateCategory(cat, isAr)} isAr={isAr} /></td>
                        <td className="al-end">{v.days}</td>
                        <td className="al-end">{fmtHours(v.hours)}</td>
                        <td className="al-end">{totalHours > 0 ? `${Math.round((v.hours / totalHours) * 100)}%` : '—'}</td>
                      </tr>
                    ))}
                    <tr className="is-total">
                      <td className="al-start">{T('المجموع', 'Total')}</td>
                      <td className="al-end">{categoryRows.reduce((n, [, v]) => n + v.days, 0)}</td>
                      <td className="al-end">{fmtHours(totalHours)}</td>
                      <td className="al-end">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
          {allCompetencies.length > 0 && (
            <>
              <h3 className="rt-h2">{T('الكفايات المكتسبة', 'Competencies acquired')}</h3>
              <ul className="rt-list rt-ul">
                {allCompetencies.map((c, k) => (
                  <li key={k}><BidiText text={c} isAr={isAr} /></li>
                ))}
              </ul>
            </>
          )}
          {allTools.length > 0 && (
            <p className="fd-tools">
              <span className="fd-label is-inline">{T('الأنظمة والأدوات المستخدمة:', 'Systems and tools used:')}</span>{' '}
              <BidiText text={allTools.join(isAr ? '، ' : ', ')} isAr={isAr} />
            </p>
          )}
        </section>

        {/* ══ 5. Conclusion ══ */}
        <section id="sec-conclusion" className="fd-section">
          <h2 className="rt-h1">5. {sections[4].title}</h2>
          <div className="rt-doc">
            <Paragraphs text={profile.conclusionText} isAr={isAr} empty={T('لم تُكتب الخاتمة بعد.', 'The conclusion has not been written yet.')} />
          </div>
        </section>

        {/* ══ 6. Declaration and endorsement ══ */}
        <section id="sec-approval" className="fd-section">
          <h2 className="rt-h1">6. {sections[5].title}</h2>
          <p className="rt-p">
            {T(
              'أقرّ أنا المتدرب الموقّع أدناه بأن المهام والأنشطة والأدلة الواردة في هذا التقرير تمثل عملي الميداني الفعلي المنجز تحت إشراف جهة التدريب ووفق الخطة التدريبية المقررة.',
              'I, the undersigned trainee, declare that the tasks, activities and evidence in this report are my own field work, completed under the supervision of the host organization and according to the approved training plan.'
            )}
          </p>

          <div className="rp-sign fd-sign">
            <div className="rp-sign-grid">
              <div className="rp-sign-cell">
                <span className="rp-sign-role">{T('المتدرب', 'Trainee')}</span>
                <span className="rp-sign-name">{studentName}</span>
                <span className="rp-sign-line" aria-hidden="true" />
                <span className="rp-sign-caption">{T('التوقيع والتاريخ', 'Signature and date')}</span>
              </div>
              <div className="rp-sign-cell">
                <span className="rp-sign-role">{T('المشرف الميداني', 'Field supervisor')}</span>
                <span className="rp-sign-name">{profile.responsibleName || '—'}</span>
                <span className="rp-sign-line" aria-hidden="true" />
                <span className="rp-sign-caption">{T('التوقيع والختم', 'Signature and stamp')}</span>
              </div>
              <div className="rp-sign-cell">
                <span className="rp-sign-role">{T('المشرف الأكاديمي', 'Academic supervisor')}</span>
                <span className="rp-sign-name">{profile.supervisorName || '—'}</span>
                <span className="rp-sign-line" aria-hidden="true" />
                <span className="rp-sign-caption">{T('التوقيع والتاريخ', 'Signature and date')}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
