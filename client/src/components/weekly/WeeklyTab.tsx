import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { FinalReportData, EntryDTO, formatDateArabic } from '@coop/shared';
import { Calendar, Clock, CheckCircle2, Copy, Download, FileText, Check, AlertCircle } from 'lucide-react';

export const WeeklyTab: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Fetch final report to get the full academic schedule of all 14 weeks
  const { data: finalReportData } = useQuery<FinalReportData>({
    queryKey: ['finalReport'],
    queryFn: async () => {
      const res = await api.get('/reports/final');
      return res.data;
    }
  });

  const weeksList = finalReportData?.weeks || [];
  const entityName = finalReportData?.profile?.entityAddress || 'جهة التدريب';

  // Set default selected week to first week or current active
  useEffect(() => {
    if (weeksList.length > 0 && !selectedWeek) {
      // Pick first week with entries, or week 1
      const activeWeek = weeksList.find((w) => w.entries.length > 0) || weeksList[0];
      setSelectedWeek(activeWeek.weekStart);
    }
  }, [weeksList, selectedWeek]);

  // Fetch weekly report data for selected week
  const { data: weekReport, isLoading } = useQuery({
    queryKey: ['weekly', selectedWeek],
    queryFn: async () => {
      if (!selectedWeek) return null;
      const res = await api.get(`/reports/weekly?week=${selectedWeek}`);
      return res.data;
    },
    enabled: !!selectedWeek
  });

  const currentWeekObj = weeksList.find((w) => w.weekStart === selectedWeek);

  const handleCopyText = () => {
    if (!weekReport) return;
    let text = `تقرير الأسبوع التدريبي: ${formatDateArabic(weekReport.weekStart)} — ${formatDateArabic(weekReport.weekEnd)}\n`;
    text += `جهة التدريب: ${entityName}\n\n`;

    if (weekReport.entries?.length) {
      weekReport.entries.forEach((e: EntryDTO) => {
        text += `• ${formatDateArabic(e.entryDate)}: ${e.title} (${e.timeFrom} - ${e.timeTo}) [${e.category}]\n  ${e.description}\n\n`;
      });
      text += `إجمالي الأيام: ${weekReport.totalDays} | إجمالي الساعات المعتمدة: ${weekReport.totalHours} ساعة | عدد المهام: ${weekReport.totalTasks}`;
    } else {
      text += `(أسبوع تدريبي مؤجل أو لم تسجل به مهام بعد)`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!weekReport) return;
    let md = `# تقرير الأسبوع التدريبي (${formatDateArabic(weekReport.weekStart)} — ${formatDateArabic(weekReport.weekEnd)})\n\n`;
    md += `**الجهة:** ${entityName}  \n`;
    md += `**إجمالي الساعات:** ${weekReport.totalHours || 0} ساعة  \n`;
    md += `**أيام العمل:** ${weekReport.totalDays || 0} أيام  \n\n`;
    md += `## جدول المهام والإنجازات اليومية\n\n`;
    md += `| التاريخ | العنوان | الوقت | التصنيف | تفاصيل الإنجاز |\n`;
    md += `|---|---|---|---|---|\n`;

    if (weekReport.entries?.length) {
      weekReport.entries.forEach((e: EntryDTO) => {
        md += `| ${formatDateArabic(e.entryDate)} | ${e.title} | ${e.timeFrom} - ${e.timeTo} | ${e.category} | ${e.description.replace(/\n/g, ' ')} |\n`;
      });
    } else {
      md += `| — | أسبوع تدريبي مؤجل أو متاح للتوثيق لاحقاً | — | — | — |\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Weekly_Report_${selectedWeek}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-line">
          <div>
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              <span>التقرير الأسبوعي المعتمد</span>
            </h2>
            <p className="text-xs text-sub mt-0.5">
              خطة التدريب موزعة على {finalReportData?.profile?.trainingWeeks || 14} أسبوعاً مع حرية التنقل وتأجيل وتخطي الأسابيع
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ التقرير'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير Markdown</span>
            </button>
          </div>
        </div>

        {/* 14 Weeks Navigation Strip */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-sub">
            <span>اختر الأسبوع للمعاينة أو التعديل:</span>
            <span className="text-[11px] text-muted">يمكنك تأجيل أو تخطي أي أسبوع والعودة له لاحقاً</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1">
            {weeksList.map((w) => {
              const isSelected = selectedWeek === w.weekStart;
              const hasEntries = w.entries && w.entries.length > 0;
              return (
                <button
                  key={w.weekIndex}
                  type="button"
                  onClick={() => setSelectedWeek(w.weekStart)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 min-w-[5.5rem] ${
                    isSelected
                      ? 'bg-accent text-white border-accent shadow-sm'
                      : hasEntries
                        ? 'bg-card text-ink border-line hover:border-ok'
                        : 'bg-bg text-sub border-line hover:border-accent/40 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        hasEntries ? (isSelected ? 'bg-white' : 'bg-ok') : isSelected ? 'bg-white/60' : 'bg-muted'
                      }`}
                    />
                    <span>الأسبوع {w.weekIndex}</span>
                  </div>
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                    {hasEntries ? `${w.totalHours} ساعة` : 'مؤجل / فارغ'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Week Content */}
        {isLoading ? (
          <div className="text-center py-12 text-sub text-sm">جارٍ تحميل بيانات الأسبوع...</div>
        ) : (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-ok-bg/50 border border-ok/20 rounded-xl p-4">
                <div className="flex items-center justify-between text-sub mb-1">
                  <span className="text-xs font-bold">أيام العمل المسجلة</span>
                  <Calendar className="w-4 h-4 text-ok" />
                </div>
                <div className="text-2xl font-black text-ok">{weekReport?.totalDays || 0}</div>
                <div className="text-[11px] text-sub mt-0.5">أيام نشاط فعلي</div>
              </div>

              <div className="bg-ok-bg/50 border border-ok/20 rounded-xl p-4">
                <div className="flex items-center justify-between text-sub mb-1">
                  <span className="text-xs font-bold">إجمالي الساعات</span>
                  <Clock className="w-4 h-4 text-ok" />
                </div>
                <div className="text-2xl font-black text-ok">{weekReport?.totalHours || 0}</div>
                <div className="text-[11px] text-sub mt-0.5">ساعات تدريب معتمدة</div>
              </div>

              <div className="bg-accent-dim/30 border border-accent/20 rounded-xl p-4">
                <div className="flex items-center justify-between text-sub mb-1">
                  <span className="text-xs font-bold">المهام والإنجازات</span>
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                </div>
                <div className="text-2xl font-black text-accent">{weekReport?.totalTasks || 0}</div>
                <div className="text-[11px] text-sub mt-0.5">مهمة موثقة بالأسبوع</div>
              </div>
            </div>

            {/* Weekly Entries Table */}
            {(!weekReport?.entries || weekReport.entries.length === 0) ? (
              <div className="border border-dashed border-line rounded-2xl p-8 text-center space-y-3 bg-bg/50">
                <Clock className="w-8 h-8 text-warn mx-auto opacity-75" />
                <h3 className="text-sm font-bold text-ink">
                  {currentWeekObj ? `الأسبوع ${currentWeekObj.weekIndex}` : 'هذا الأسبوع'} مؤجل أو لم تُسجل به مهام بعد
                </h3>
                <p className="text-xs text-sub max-w-md mx-auto leading-relaxed">
                  يمكنك تخطي هذا الأسبوع والبدء بأي أسبوع آخر، أو إضافة مهام له في أي وقت لاحق من تبويب "التسجيل اليومي".
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-line rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-bg text-sub font-bold border-b border-line">
                    <tr>
                      <th className="py-3 px-4 w-28">التاريخ</th>
                      <th className="py-3 px-4 w-48">العنوان / التصنيف</th>
                      <th className="py-3 px-4 w-28">الوقت</th>
                      <th className="py-3 px-4">تفاصيل الإنجاز</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {weekReport.entries.map((entry: EntryDTO) => (
                      <tr key={entry.id} className="hover:bg-bg/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-ink whitespace-nowrap">
                          {formatDateArabic(entry.entryDate)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-ink">{entry.title}</div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-dim text-accent">
                            {entry.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sub whitespace-nowrap">
                          {entry.timeFrom} - {entry.timeTo}
                        </td>
                        <td className="py-3 px-4 text-sub leading-relaxed whitespace-pre-wrap">
                          {entry.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
