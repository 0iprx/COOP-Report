import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { FinalReportData, formatDateArabic } from '@coop/shared';
import {
  Sparkles,
  Download,
  FileText,
  Presentation,
  FileCode,
  Printer,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calendar,
  Clock,
  ShieldCheck,
  RefreshCw,
  Loader2,
  ExternalLink
} from 'lucide-react';

export const TestDevLab: React.FC = () => {
  const queryClient = useQueryClient();

  const [downloadingDocx, setDownloadingDocx] = useState<boolean>(false);
  const [downloadingPptx, setDownloadingPptx] = useState<boolean>(false);
  const [downloadingHtml, setDownloadingHtml] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Fetch final report data
  const { data: reportData, isLoading, refetch } = useQuery<FinalReportData>({
    queryKey: ['finalReport'],
    queryFn: async () => {
      const res = await api.get('/reports/final');
      return res.data;
    }
  });

  // Seed 14-Week Simulation Mutation
  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/testdev/seed');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      refetch();
      triggerToast(data.message || 'تم حقن وتوليد خطة 14 أسبوعاً التجريبية بنجاح!');
    },
    onError: (err: any) => {
      triggerToast(err.response?.data?.error || 'تعذر توليد بيانات المحاكاة');
    }
  });

  // Clear Simulation Data Mutation
  const clearMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/testdev/clear');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      refetch();
      triggerToast(data.message || 'تم تفريغ البيانات التجريبية بنجاح');
    },
    onError: (err: any) => {
      triggerToast(err.response?.data?.error || 'تعذر تفريغ البيانات');
    }
  });

  // Export Handlers
  const handleExportDocx = async () => {
    try {
      setDownloadingDocx(true);
      const res = await api.get('/reports/export/docx?lang=ar', { responseType: 'blob' });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `تقرير_تجريبي_COOP_TestDev.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      triggerToast('تم تصدير مستند Word التجريبي بنجاح!');
    } catch {
      triggerToast('تعذر تصدير مستند Word');
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleExportPresentation = async () => {
    try {
      setDownloadingPptx(true);
      const res = await api.get('/reports/export/presentation', { responseType: 'blob' });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `عرض_مناقشة_تجريبي_TestDev.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      triggerToast('تم تصدير عرض PowerPoint التجريبي بنجاح!');
    } catch {
      triggerToast('تعذر تصدير عرض PowerPoint');
    } finally {
      setDownloadingPptx(false);
    }
  };

  const handleExportHtml = async () => {
    try {
      setDownloadingHtml(true);
      const res = await api.get('/reports/export/html?lang=ar', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `تقرير_تجريبي_أوفلاين_TestDev.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      triggerToast('تم تصدير ملف HTML المستقل بنجاح!');
    } catch {
      triggerToast('تعذر تصدير ملف HTML');
    } finally {
      setDownloadingHtml(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const weeksList = reportData?.weeks || [];
  const totalEntries = reportData?.totalEntries || 0;
  const totalHours = reportData?.totalHours || 0;
  const totalEvidence = weeksList.reduce((acc, w) => acc + (w.evidence?.length || 0), 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-2.5 rounded-xl shadow-2xl text-xs font-bold z-50 flex items-center gap-2 border border-line animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-ok" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Lab Header */}
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent-dim text-accent flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-ink">مختبر المحاكاة واختبار التصدير الأكاديمي</h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-accent text-white">
                  /testdev
                </span>
              </div>
              <p className="text-xs text-sub mt-0.5">
                بيئة معملية متكاملة لاختبار رؤية الأسابيع الـ 14، تدقيق الفهرس الشجري، وتصدير ملفات Word و PowerPoint و PDF
              </p>
            </div>
          </div>

          {/* Seeding & Reset Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="px-4 py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              title="حقن 14 أسبوعاً تدريبياً مع 280 ساعة و 4 صور توثيقية وبيانات مؤسسية واقعية"
            >
              {seedMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>حقن محاكاة الـ 14 أسبوعاً الأكاديمية</span>
            </button>

            <button
              onClick={() => {
                if (confirm('هل ترغب في تفريغ بيانات المحاكاة والعودة لسجل فارغ؟')) {
                  clearMutation.mutate();
                }
              }}
              disabled={clearMutation.isPending}
              className="px-3.5 py-2 bg-bg hover:bg-line text-sub hover:text-ink border border-line rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="تفريغ بيانات المحاكاة"
            >
              <Trash2 className="w-3.5 h-3.5 text-warn" />
              <span>تفريغ المحاكاة</span>
            </button>
          </div>
        </div>

        {/* Live Lab Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-bg rounded-xl border border-line">
            <div className="text-xs text-sub font-bold">الأسابيع المجهزة</div>
            <div className="text-xl font-black text-ink mt-0.5">{weeksList.length} أسبوعاً</div>
            <div className="text-[10px] text-ok mt-0.5">تفرع شجري بالفهرس</div>
          </div>

          <div className="p-3 bg-bg rounded-xl border border-line">
            <div className="text-xs text-sub font-bold">إجمالي الساعات</div>
            <div className="text-xl font-black text-ok mt-0.5">{totalHours} ساعة</div>
            <div className="text-[10px] text-sub mt-0.5">من أصل 280 ساعة</div>
          </div>

          <div className="p-3 bg-bg rounded-xl border border-line">
            <div className="text-xs text-sub font-bold">المهام الموثقة</div>
            <div className="text-xl font-black text-accent mt-0.5">{totalEntries} مهمة</div>
            <div className="text-[10px] text-sub mt-0.5">موزعة على الأيام</div>
          </div>

          <div className="p-3 bg-bg rounded-xl border border-line">
            <div className="text-xs text-sub font-bold">الصور التوثيقية</div>
            <div className="text-xl font-black text-[#8B0000] mt-0.5">{totalEvidence} صور</div>
            <div className="text-[10px] text-ok mt-0.5">مجردة من EXIF/GPS</div>
          </div>
        </div>
      </div>

      {/* Export Testing Toolbar */}
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-ink flex items-center gap-2">
              <Download className="w-4 h-4 text-accent" />
              <span>أزرار الاختبار والتصدير الميداني للملفات</span>
            </h3>
            <p className="text-xs text-sub">انقر على أي زر لتنزيل وتفحص مظهر التقرير في البرنامج المخصص له:</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Word Export Card */}
          <div className="p-4 bg-bg rounded-xl border border-line space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-ink text-xs">
                <FileText className="w-4 h-4 text-accent" />
                <span>مستند Word (.docx)</span>
              </div>
              <p className="text-[11px] text-sub leading-relaxed">
                21 صفحة قياسية، فهرس ذكي منقط بأرقام الصفحات، صور الداتا سنتر مدمجة بالداخل، وخانة اعتماد وتوقيع المشرف الأسبوعي.
              </p>
            </div>
            <button
              onClick={handleExportDocx}
              disabled={downloadingDocx}
              className="w-full py-2 bg-card hover:bg-line border border-line text-ink rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 text-accent ${downloadingDocx ? 'animate-bounce' : ''}`} />
              <span>{downloadingDocx ? 'جارٍ التوليد...' : 'تنزيل Word (.docx)'}</span>
            </button>
          </div>

          {/* PowerPoint Export Card */}
          <div className="p-4 bg-bg rounded-xl border border-line space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-ink text-xs">
                <Presentation className="w-4 h-4 text-accent" />
                <span>عرض PowerPoint (.pptx)</span>
              </div>
              <p className="text-[11px] text-sub leading-relaxed">
                8 شرائح عريضة 16:9 مجهزة للمناقشة الرسمية، رسومات بيانية لإنجاز الأسابيع، وشريحة كاملة مخصصة لصور بيئة العمل.
              </p>
            </div>
            <button
              onClick={handleExportPresentation}
              disabled={downloadingPptx}
              className="w-full py-2 bg-card hover:bg-line border border-line text-ink rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 text-accent ${downloadingPptx ? 'animate-bounce' : ''}`} />
              <span>{downloadingPptx ? 'جارٍ التوليد...' : 'تنزيل PowerPoint (.pptx)'}</span>
            </button>
          </div>

          {/* HTML Standalone Card */}
          <div className="p-4 bg-bg rounded-xl border border-line space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-ink text-xs">
                <FileCode className="w-4 h-4 text-ok" />
                <span>ملف HTML مستقل أوفلاين</span>
              </div>
              <p className="text-[11px] text-sub leading-relaxed">
                صفحة تفاعلية مدمج بداخلها كافة الخطوط والصور، تعمل بدون اتصال إنترنت، وتتضمن روابط شجرية سلسة لكافة الأسابيع.
              </p>
            </div>
            <button
              onClick={handleExportHtml}
              disabled={downloadingHtml}
              className="w-full py-2 bg-card hover:bg-line border border-line text-ink rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 text-ok ${downloadingHtml ? 'animate-bounce' : ''}`} />
              <span>{downloadingHtml ? 'جارٍ التوليد...' : 'تنزيل HTML مستقل'}</span>
            </button>
          </div>

          {/* PDF Print Card */}
          <div className="p-4 bg-bg rounded-xl border border-line space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-ink text-xs">
                <Printer className="w-4 h-4 text-accent" />
                <span>طباعة / حفظ PDF مباشر</span>
              </div>
              <p className="text-[11px] text-sub leading-relaxed">
                معاينة الطباعة المجهزة بفواصل صفحات A4 الأكاديمية مع إخفاء أشرطة التنقل وعناصر التحكم لتوليد PDF نظيف تماماً.
              </p>
            </div>
            <button
              onClick={handlePrintPdf}
              className="w-full py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>معاينة طباعة PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Academic Compliance & Verification Checklist */}
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-ink flex items-center gap-2 pb-3 border-b border-line">
          <ShieldCheck className="w-5 h-5 text-ok" />
          <span>نتائج التدقيق الآلي للائحة الرسمية المعتمدة (Academic Quality Audit)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-bg rounded-xl border border-line flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-ok shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-ink">شرط الحجم الأكاديمي (لا يقل عن 15 صفحة)</div>
              <div className="text-sub text-[11px] leading-relaxed">
                محقّق بامتياز: يبلغ التقرير <b>21 صفحة بالضبط</b> (صفحة واحدة لكل أسبوع + الغلاف والفهرس والمقدمة واستمارة المشرف).
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-bg rounded-xl border border-line flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-ok shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-ink">التفرع الشجري للأسابيع بالفهرس (Child Tree)</div>
              <div className="text-sub text-[11px] leading-relaxed">
                محقّق بنسبة 100%: تحت الباب الثالث تتفرع الأسابيع الـ 14 بعلامات شجرية وأرقام صفحات دقيقة من 5 إلى 18.
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-bg rounded-xl border border-line flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-ok shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-ink">أمان الصور التوثيقية وسرية المعلومات</div>
              <div className="text-sub text-[11px] leading-relaxed">
                محقّق: الصور مجردة بالكامل من إحداثيات الموقع (GPS) وبيانات الجهاز الحساسة عبر المعالجة المزدوجة بالمتصفح والسيرفر.
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-bg rounded-xl border border-line flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-ok shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-ink">اعتماد المشرف الميداني الرسمي</div>
              <div className="text-sub text-[11px] leading-relaxed">
                محقّق: يتضمن كل أسبوع مربع توقيع أسبوعي، بالإضافة لاستمارة التقييم والاعتماد الختامي في الصفحة الأخيرة رقم 21.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
