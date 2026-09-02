import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { EntryDTO, getWeekStart, getWeekEnd, formatDateArabic } from '@coop/shared';
import { Calendar, Clock, CheckCircle2, Copy, Download, FileText, Check } from 'lucide-react';

export const WeeklyTab: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Fetch all entries to compute available weeks
  const { data: entriesData } = useQuery<{ entries: EntryDTO[] }>({
    queryKey: ['entries'],
    queryFn: async () => {
      const res = await api.get('/entries');
      return res.data;
    }
  });

  // Calculate unique weeks (Sunday starts)
  const availableWeeks: string[] = React.useMemo(() => {
    if (!entriesData?.entries?.length) return [];
    const starts = new Set(entriesData.entries.map((e) => getWeekStart(e.entryDate)));
    return Array.from(starts).sort().reverse();
  }, [entriesData]);

  // Set default selected week
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeek) {
      setSelectedWeek(availableWeeks[0]);
    }
  }, [availableWeeks, selectedWeek]);

  // Fetch weekly report data
  const { data: weekReport, isLoading } = useQuery({
    queryKey: ['weekly', selectedWeek],
    queryFn: async () => {
      if (!selectedWeek) return null;
      const res = await api.get(`/reports/weekly?week=${selectedWeek}`);
      return res.data;
    },
    enabled: !!selectedWeek
  });

  const handleCopyText = () => {
    if (!weekReport) return;
    let text = `تقرير الأسبوع التدريبي: ${formatDateArabic(weekReport.weekStart)} — ${formatDateArabic(weekReport.weekEnd)}\n`;
    text += `جهة التدريب: شركة هواوي السعودية (Huawei Tech Saudi)\n\n`;

    weekReport.entries?.forEach((e: EntryDTO) => {
      text += `• ${formatDateArabic(e.entryDate)}: ${e.title} (${e.timeFrom} - ${e.timeTo}) [${e.category}]\n  ${e.description}\n\n`;
    });

    text += `إجمالي الأيام: ${weekReport.totalDays} | إجمالي الساعات المعتمدة: ${weekReport.totalHours} ساعة | عدد المهام: ${weekReport.totalTasks}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!weekReport) return;
    let md = `# تقرير الأسبوع التدريبي (${formatDateArabic(weekReport.weekStart)} — ${formatDateArabic(weekReport.weekEnd)})\n\n`;
    md += `**الجهة:** شركة هواوي السعودية (Huawei Tech Saudi)  \n`;
    md += `**إجمالي الساعات:** ${weekReport.totalHours} ساعة  \n`;
    md += `**أيام العمل:** ${weekReport.totalDays} أيام  \n\n`;
    md += `## جدول المهام والإنجازات اليومية\n\n`;
    md += `| التاريخ | العنوان | الوقت | التصنيف | تفاصيل الإنجاز |\n`;
    md += `|---|---|---|---|---|\n`;

    weekReport.entries?.forEach((e: EntryDTO) => {
      md += `| ${formatDateArabic(e.entryDate)} | ${e.title} | ${e.timeFrom} - ${e.timeTo} | ${e.category} | ${e.description.replace(/\n/g, ' ')} |\n`;
    });

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
            <p className="text-xs text-sub mt-0.5">يبدأ الأسبوع الأكاديمي من الأحد وينتهي بالسبت</p>
          </div>

          {availableWeeks.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-sub">الأسبوع:</label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink"
              >
                {availableWeeks.map((w) => (
                  <option key={w} value={w}>
                    {formatDateArabic(w)} — {formatDateArabic(getWeekEnd(w))}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {!availableWeeks.length ? (
          <div className="text-center py-12 text-sub text-sm">
            لا توجد إدخالات أسبوعية بعد. أضف إنجازاتك اليومية من تبويب "سجل اليوميات".
          </div>
        ) : isLoading ? (
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
                  {weekReport?.entries?.map((e: EntryDTO) => (
                    <tr key={e.id} className="hover:bg-bg/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-ink whitespace-nowrap">
                        {formatDateArabic(e.entryDate)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-ink">{e.title}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-dim text-accent">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sub whitespace-nowrap">
                        {e.timeFrom} - {e.timeTo}
                      </td>
                      <td className="py-3 px-4 text-ink leading-relaxed whitespace-pre-wrap">
                        {e.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleCopyText}
                className="px-4 py-2 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ للحافظة!' : 'نسخ التقرير كنص'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="px-4 py-2 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل كملف Markdown (.md)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
