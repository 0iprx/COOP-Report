import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FinalReportData, formatDateArabic } from '@coop/shared';
import {
  ShieldCheck,
  UserCheck,
  Users,
  Eye,
  MessageSquare,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Search,
  Clock,
  Calendar,
  Award,
  FileText,
  FileCheck,
  ChevronLeft
} from 'lucide-react';

interface TraineeSummary {
  id: number;
  username: string;
  studentName: string;
  trainingNumber: string;
  department: string;
  trainingUnit: string;
  entityAddress: string;
  courseHours: number;
  trainingWeeks: number;
  supervisorNotes: string;
  supervisorRating: string;
  supervisorApproved: boolean;
  supervisorApprovedAt: string | null;
  totalHours: number;
  totalDays: number;
  totalTasks: number;
  lastEntryDate: string | null;
}

export const SupervisorTab: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const isSupervisor = user?.role === 'supervisor';

  // Trainee State: Link supervisor form
  const [supervisorCodeInput, setSupervisorCodeInput] = useState<string>('');
  const [linkMessage, setLinkMessage] = useState<string>('');
  const [linkError, setLinkError] = useState<string>('');

  // Supervisor State: Inspection & Filter
  const [selectedTraineeId, setSelectedTraineeId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeInspectionTab, setActiveInspectionTab] = useState<'weeks' | 'chapters' | 'evaluation'>('weeks');

  // Evaluation form state
  const [supervisorNotes, setSupervisorNotes] = useState<string>('');
  const [supervisorRating, setSupervisorRating] = useState<string>('ممتاز');
  const [supervisorApproved, setSupervisorApproved] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string>('');
  const [copyCodeToast, setCopyCodeToast] = useState<boolean>(false);

  // Download states
  const [downloadingDocx, setDownloadingDocx] = useState<boolean>(false);
  const [downloadingHtml, setDownloadingHtml] = useState<boolean>(false);

  // Trainee links supervisor mutation
  const linkMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post('/supervisor/link', { supervisorUsernameOrCode: code });
      return res.data;
    },
    onSuccess: (data) => {
      setLinkMessage(data.message);
      setLinkError('');
      setSupervisorCodeInput('');
      refreshUser();
    },
    onError: (err: any) => {
      setLinkError(err.response?.data?.error || 'تعذر ربط المشرف');
      setLinkMessage('');
    }
  });

  // Supervisor fetches trainees with summary metrics
  const { data: traineesData, isLoading: traineesLoading } = useQuery<{ trainees: TraineeSummary[] }>({
    queryKey: ['supervisorTrainees'],
    queryFn: async () => {
      const res = await api.get('/supervisor/trainees');
      return res.data;
    },
    enabled: isSupervisor
  });

  // Supervisor inspects selected trainee report
  const { data: traineeReport, isLoading: reportLoading } = useQuery<FinalReportData>({
    queryKey: ['traineeReport', selectedTraineeId],
    queryFn: async () => {
      if (!selectedTraineeId) return null;
      const res = await api.get(`/supervisor/trainees/${selectedTraineeId}/report`);
      return res.data;
    },
    enabled: isSupervisor && !!selectedTraineeId
  });

  // Save supervisor evaluation mutation
  const evaluateMutation = useMutation({
    mutationFn: async ({
      id,
      notes,
      rating,
      approved
    }: {
      id: number;
      notes: string;
      rating: string;
      approved: boolean;
    }) => {
      const res = await api.post(`/supervisor/trainees/${id}/evaluate`, {
        notes,
        rating,
        approved
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supervisorTrainees'] });
      queryClient.invalidateQueries({ queryKey: ['traineeReport', selectedTraineeId] });
      setSaveToast(data.message || 'تم اعتماد وحفظ التقييم الإشرافي بنجاح');
      setTimeout(() => setSaveToast(''), 3500);
    }
  });

  // Authenticated DOCX download for supervisor
  const handleDownloadDocx = async (traineeId: number, studentName: string) => {
    try {
      setDownloadingDocx(true);
      const res = await api.get(`/reports/export/docx?traineeId=${traineeId}&lang=ar`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `تقرير_${studentName.replace(/\s+/g, '_')}_المعتمد.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('تعذر تحميل مستند Word، يرجى المحاولة لاحقاً');
    } finally {
      setDownloadingDocx(false);
    }
  };

  // Authenticated HTML download for supervisor
  const handleDownloadHtml = async (traineeId: number, studentName: string) => {
    try {
      setDownloadingHtml(true);
      const res = await api.get(`/reports/export/html?traineeId=${traineeId}&lang=ar`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `تقرير_${studentName.replace(/\s+/g, '_')}_المعتمد.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('تعذر تحميل ملف HTML');
    } finally {
      setDownloadingHtml(false);
    }
  };

  const handleCopyCode = () => {
    if (user?.username) {
      navigator.clipboard.writeText(user.username);
      setCopyCodeToast(true);
      setTimeout(() => setCopyCodeToast(false), 3000);
    }
  };

  // ----------------------------------------------------
  // Trainee View (ربط المشرف من جانب المتدرب)
  // ----------------------------------------------------
  if (!isSupervisor) {
    return (
      <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-sm max-w-2xl mx-auto space-y-6" dir="rtl">
        <div className="flex items-center gap-3.5 pb-4 border-b border-line">
          <div className="w-12 h-12 rounded-2xl bg-accent-dim text-accent flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-ink">ربط المشرف الأكاديمي والميداني</h2>
            <p className="text-xs text-sub mt-0.5">
              يتيح ربط الحساب لمشرفك متابعة إنجازاتك اليومية واعتماد ساعات التقرير النهائي رسمياً
            </p>
          </div>
        </div>

        {user?.supervisor ? (
          <div className="p-4 bg-ok-bg border border-ok/30 rounded-xl text-xs space-y-1.5 animate-fade-in">
            <div className="font-bold text-ok flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>حسابك مرتبط بمشرف معتمد</span>
            </div>
            <div className="text-ink">
              اسم المشرف المعتمد: <span className="font-extrabold text-accent">{user.supervisor.username}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-accent-dim/40 border border-accent/20 rounded-xl text-xs text-accent font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>لم تقم بربط حسابك مع أي مشرف حتى الآن. أدخل رمز المشرف أدناه للربط الفوري.</span>
          </div>
        )}

        {linkMessage && (
          <div className="p-3 bg-ok-bg text-ok text-xs font-bold rounded-xl border border-ok/30">
            {linkMessage}
          </div>
        )}

        {linkError && (
          <div className="p-3 bg-accent-dim text-accent text-xs font-bold rounded-xl border border-accent/30">
            {linkError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (supervisorCodeInput.trim()) {
              linkMutation.mutate(supervisorCodeInput.trim());
            }
          }}
          className="space-y-4 pt-2"
        >
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-sub">
              اسم مستخدم المشرف (أو رمز الربط الإشرافي)
            </label>
            <input
              type="text"
              value={supervisorCodeInput}
              onChange={(e) => setSupervisorCodeInput(e.target.value)}
              placeholder="مثال: dr_khalid أو supervisor_tech"
              className="w-full px-3.5 py-2.5 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent font-medium"
              required
            />
          </div>

          <button
            type="submit"
            disabled={linkMutation.isPending}
            className="px-6 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span>{linkMutation.isPending ? 'جارٍ الربط الفوري...' : 'ربط الحساب بالمشرف فوراً'}</span>
          </button>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------
  // Supervisor Portal View (بوابة المشرف التدريبي)
  // ----------------------------------------------------
  const traineesList = traineesData?.trainees || [];
  const filteredTrainees = traineesList.filter(
    (t) =>
      t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.trainingNumber.includes(searchQuery)
  );

  const totalSupervisedHours = traineesList.reduce((sum, t) => sum + t.totalHours, 0);
  const totalApprovedReports = traineesList.filter((t) => t.supervisorApproved).length;
  const totalPendingReports = traineesList.length - totalApprovedReports;

  const selectedTraineeSummary = traineesList.find((t) => t.id === selectedTraineeId);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 z-50 animate-fade-in max-w-[90%] text-center">
          <Check className="w-4 h-4 text-ok shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Banner & Quick Linking Card */}
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-ok-bg text-ok flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-ink">بوابة المشرف الأكاديمي والميداني</h2>
            <p className="text-xs text-sub mt-0.5">
              متابعة مباشرة لإنجازات المتدربين، وفحص أسبوعي دقيق واعتماد رسمي للتقارير دون التأثير على نصوص المتدرب
            </p>
          </div>
        </div>

        {/* Quick Link Code for Trainees */}
        <div className="bg-bg border border-line rounded-xl p-3 sm:px-4 flex items-center justify-between gap-4">
          <div>
            <span className="text-sub block text-[11px] font-bold">رمز ربط المتدربين بك:</span>
            <span className="text-accent font-black text-sm tracking-wider font-mono">{user.username}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3 py-1.5 bg-card hover:bg-line text-ink border border-line rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            title="نسخ الرمز لمشاركته مع المتدربين"
          >
            {copyCodeToast ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5 text-sub" />}
            <span>{copyCodeToast ? 'تم النسخ' : 'نسخ الرمز'}</span>
          </button>
        </div>
      </div>

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-card border border-line rounded-xl p-4 space-y-1">
          <div className="text-xs font-bold text-sub flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-accent" />
            <span>المتدربون المرتبطون</span>
          </div>
          <div className="text-2xl font-black text-ink">{traineesList.length}</div>
        </div>

        <div className="bg-card border border-line rounded-xl p-4 space-y-1">
          <div className="text-xs font-bold text-sub flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-ok" />
            <span>إجمالي الساعات المعتمدة</span>
          </div>
          <div className="text-2xl font-black text-ok">{totalSupervisedHours} س</div>
        </div>

        <div className="bg-card border border-line rounded-xl p-4 space-y-1">
          <div className="text-xs font-bold text-sub flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-accent" />
            <span>التقارير المعتمدة رسمياً</span>
          </div>
          <div className="text-2xl font-black text-accent">{totalApprovedReports}</div>
        </div>

        <div className="bg-card border border-line rounded-xl p-4 space-y-1">
          <div className="text-xs font-bold text-sub flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-warn" />
            <span>بانتظار المراجعة والاعتماد</span>
          </div>
          <div className="text-2xl font-black text-warn">{totalPendingReports}</div>
        </div>
      </div>

      {/* Trainees Directory & Comprehensive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right: Trainees Directory & Search */}
        <div className="bg-card border border-line rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <h3 className="text-xs font-extrabold text-ink flex items-center gap-1.5">
              <Users className="w-4 h-4 text-accent" />
              <span>دليل المتدربين ({traineesList.length})</span>
            </h3>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-sub absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو الرقم الأكاديمي..."
              className="w-full pr-8 pl-3 py-2 text-xs bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
            />
          </div>

          {traineesLoading ? (
            <div className="text-center py-8 text-sub text-xs">جارٍ جلب المتدربين...</div>
          ) : !traineesList.length ? (
            <div className="text-center py-10 text-sub text-xs space-y-2">
              <p>لا يوجد متدربون مرتبطون بحسابك حالياً.</p>
              <p className="text-[11px] text-muted">شارك رمز المشرف ({user.username}) مع طلابك للارتباط الفوري.</p>
            </div>
          ) : !filteredTrainees.length ? (
            <div className="text-center py-8 text-sub text-xs">لا توجد نتائج مطابقة لبحثك.</div>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredTrainees.map((t) => {
                const percent = Math.min(100, Math.round((t.totalHours / (t.courseHours || 280)) * 100));
                const isSelected = selectedTraineeId === t.id;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTraineeId(t.id);
                      setSupervisorNotes(t.supervisorNotes || '');
                      setSupervisorRating(t.supervisorRating || 'ممتاز');
                      setSupervisorApproved(t.supervisorApproved || false);
                    }}
                    className={`w-full text-right p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                      isSelected
                        ? 'bg-accent-dim/40 border-accent shadow-sm'
                        : 'border-line hover:border-ink/40 bg-bg/40'
                    }`}
                  >
                    <div className="flex items-center justify-between font-extrabold text-ink">
                      <span>{t.studentName}</span>
                      {t.supervisorApproved ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-ok-bg text-ok">
                          معتمد
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warn-bg text-warn">
                          قيد المراجعة
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-sub">
                      الرقم: {t.trainingNumber || '—'} | {t.department || '—'}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-sub">
                        <span>إنجاز الساعات: {t.totalHours} / {t.courseHours} س</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percent >= 100 ? 'bg-ok' : 'bg-accent'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Left: Non-Destructive Inspection & Supervisory Action Workspace */}
        <div className="lg:col-span-2 bg-card border border-line rounded-2xl p-6 shadow-sm space-y-6">
          {!selectedTraineeId ? (
            <div className="text-center py-24 text-sub text-sm space-y-2">
              <Eye className="w-8 h-8 text-sub/50 mx-auto" />
              <p className="font-bold text-ink">حدد متدرباً من القائمة الجانبية لبدء الفحص والاعتماد</p>
              <p className="text-xs text-muted">يمكنك استعراض كامل أسابيع المتدرب وتقاريره الأكاديمية دون المساس بنصوصه</p>
            </div>
          ) : reportLoading ? (
            <div className="text-center py-24 text-sub text-sm">جارٍ تحميل بيانات التقرير وسجل الأسابيع...</div>
          ) : traineeReport ? (
            <div className="space-y-6">
              {/* Inspection Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-ink">
                      {traineeReport.profile.studentName || selectedTraineeSummary?.studentName || 'المتدرب'}
                    </h3>
                    {selectedTraineeSummary?.supervisorApproved && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-ok-bg text-ok flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        معتمد رسمياً
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-sub mt-0.5">
                    الرقم: {traineeReport.profile.trainingNumber || '—'} | جهة التدريب: {traineeReport.profile.entityAddress || '—'}
                  </div>
                </div>

                {/* Supervisor Export Actions (Authenticated Blobs) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={downloadingDocx}
                    onClick={() => handleDownloadDocx(selectedTraineeId, traineeReport.profile.studentName)}
                    className="px-3 py-1.5 bg-bg hover:bg-line border border-line rounded-xl text-xs font-bold text-ink flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                    title="تحميل مستند Word معتمد بفهرسة ديناميكية"
                  >
                    <Download className={`w-3.5 h-3.5 text-accent ${downloadingDocx ? 'animate-bounce' : ''}`} />
                    <span>{downloadingDocx ? 'جارٍ التحميل...' : 'تحميل Word'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={downloadingHtml}
                    onClick={() => handleDownloadHtml(selectedTraineeId, traineeReport.profile.studentName)}
                    className="px-3 py-1.5 bg-bg hover:bg-line border border-line rounded-xl text-xs font-bold text-ink flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                    title="عرض وتنزيل نسخة HTML للتقرير"
                  >
                    <ExternalLink className={`w-3.5 h-3.5 text-ok ${downloadingHtml ? 'animate-bounce' : ''}`} />
                    <span>عرض HTML</span>
                  </button>
                </div>
              </div>

              {/* Inspection Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-line pb-2">
                <button
                  type="button"
                  onClick={() => setActiveInspectionTab('weeks')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeInspectionTab === 'weeks'
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-bg text-sub hover:text-ink'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>سجل الأسابيع الـ 14 ({traineeReport.weeks.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveInspectionTab('chapters')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeInspectionTab === 'chapters'
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-bg text-sub hover:text-ink'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>فصول التقرير الأكاديمي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveInspectionTab('evaluation')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeInspectionTab === 'evaluation'
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-bg text-sub hover:text-ink'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>التقييم والاعتماد الإشرافي</span>
                </button>
              </div>

              {/* Tab 1: Week-by-Week Audit (قراءة وفحص تفصيلي) */}
              {activeInspectionTab === 'weeks' && (
                <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                  {traineeReport.weeks.map((w) => (
                    <div key={w.weekIndex} className="border border-line rounded-xl overflow-hidden bg-bg/30">
                      <div className="bg-bg px-4 py-2 border-b border-line flex items-center justify-between text-xs font-bold text-ink">
                        <span>الأسبوع {w.weekIndex} ({w.weekStart} — {w.weekEnd})</span>
                        <span className="text-ok font-extrabold">{w.totalHours} ساعة عمل | {w.entries.length} مهام</span>
                      </div>

                      {w.entries.length === 0 ? (
                        <div className="p-3 text-center text-xs text-sub italic font-medium">
                          أسبوع تدريبي مؤجل أو لم تسجل به مهام بعد.
                        </div>
                      ) : (
                        <div className="divide-y divide-line text-xs">
                          {w.entries.map((e) => (
                            <div key={e.id} className="p-3 space-y-1">
                              <div className="flex items-center justify-between font-bold text-ink">
                                <span>{e.title}</span>
                                <span className="text-sub font-normal text-[11px]">
                                  {formatDateArabic(e.entryDate)} ({e.timeFrom} - {e.timeTo})
                                </span>
                              </div>
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-dim text-accent">
                                {e.category}
                              </span>
                              <p className="text-sub leading-relaxed whitespace-pre-wrap pt-0.5">{e.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Report Chapters Audit (قراءة فقط بدون إمكانية التعديل) */}
              {activeInspectionTab === 'chapters' && (
                <div className="space-y-4 text-xs max-h-[550px] overflow-y-auto pr-1">
                  <div className="border border-line rounded-xl p-4 bg-bg/30 space-y-1.5">
                    <span className="font-extrabold text-ink block text-xs">١. المقدمة وأهداف التدريب وبيانات المقرر:</span>
                    <p className="text-sub leading-relaxed whitespace-pre-wrap">{traineeReport.profile.introText || 'لم يتم إدخال المقدمة بعد.'}</p>
                  </div>

                  <div className="border border-line rounded-xl p-4 bg-bg/30 space-y-1.5">
                    <span className="font-extrabold text-ink block text-xs">٢. التعريف بجهة التدريب وطبيعة العمل:</span>
                    <p className="text-sub leading-relaxed whitespace-pre-wrap">{traineeReport.profile.entityIntroText || 'لم يتم إدخال التعريف بالجهة بعد.'}</p>
                  </div>

                  <div className="border border-line rounded-xl p-4 bg-bg/30 space-y-1.5">
                    <span className="font-extrabold text-ink block text-xs">٣. المعارف والمهارات والتجارب المكتسبة:</span>
                    <p className="text-sub leading-relaxed whitespace-pre-wrap">{traineeReport.profile.skillsText || 'لم يتم إدخال المهارات بعد.'}</p>
                  </div>

                  <div className="border border-line rounded-xl p-4 bg-bg/30 space-y-1.5">
                    <span className="font-extrabold text-ink block text-xs">٤. الخاتمة والتوصيات العامة:</span>
                    <p className="text-sub leading-relaxed whitespace-pre-wrap">{traineeReport.profile.conclusionText || 'لم يتم إدخال الخاتمة بعد.'}</p>
                  </div>
                </div>
              )}

              {/* Tab 3: Official Supervisory Evaluation & Approval Form */}
              {activeInspectionTab === 'evaluation' && (
                <div className="bg-ok-bg/30 border border-ok/30 rounded-2xl p-5 space-y-4 text-xs font-bold">
                  <div className="flex items-center gap-2 text-ink">
                    <Award className="w-5 h-5 text-ok" />
                    <div>
                      <h4 className="text-sm font-black text-ink">استمارة التقييم والاعتماد الإشرافي الرسمي</h4>
                      <p className="text-[11px] text-sub font-normal">تُدرج هذه النتيجة والملاحظات في الاستمارة الرسمية لملفات DOCX و PDF</p>
                    </div>
                  </div>

                  {/* Rating Selector */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-sub block">التقييم العام لأداء المتدرب:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['ممتاز', 'جيد جداً', 'جيد'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setSupervisorRating(r)}
                          className={`py-2 rounded-xl border text-center transition-all ${
                            supervisorRating === r
                              ? 'bg-ok text-white border-ok shadow-sm font-black'
                              : 'bg-card text-ink border-line hover:border-ok/50'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Supervisory Feedback Notes */}
                  <div className="space-y-1.5">
                    <label className="text-sub block">الملاحظات والتوجيهات الإشرافية:</label>
                    <textarea
                      value={supervisorNotes}
                      onChange={(e) => setSupervisorNotes(e.target.value)}
                      rows={3}
                      placeholder="اكتب توجيهاتك للمتدرب وملاحظاتك الميدانية الأكاديمية هنا..."
                      className="w-full p-3 text-xs bg-card border border-line rounded-xl focus:outline-none focus:border-ok font-normal leading-relaxed"
                    />
                  </div>

                  {/* Official Approval Checkbox */}
                  <div className="p-3 bg-card border border-line rounded-xl flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-ink block font-black">اعتماد التقرير النهائي رسمياً</span>
                      <span className="text-[11px] text-sub font-normal block">
                        تأكيد استيفاء المتدرب لساعات المقرر ({traineeReport.totalHours} من {traineeReport.profile.courseHours || 280} ساعة)
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={supervisorApproved}
                        onChange={(e) => setSupervisorApproved(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ok"></div>
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={evaluateMutation.isPending}
                      onClick={() =>
                        evaluateMutation.mutate({
                          id: selectedTraineeId,
                          notes: supervisorNotes,
                          rating: supervisorRating,
                          approved: supervisorApproved
                        })
                      }
                      className="px-6 py-2.5 bg-ok hover:bg-ok/90 disabled:opacity-50 text-white font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{evaluateMutation.isPending ? 'جارٍ الحفظ والاعتماد...' : 'حفظ التقييم واعتماد التقرير'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
