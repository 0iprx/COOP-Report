import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FinalReportData } from '@coop/shared';
import {
  ShieldCheck,
  UserCheck,
  Users,
  Eye,
  MessageSquare,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export const SupervisorTab: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const isSupervisor = user?.role === 'supervisor';

  // Trainee State: Link supervisor form
  const [supervisorCodeInput, setSupervisorCodeInput] = useState<string>('');
  const [linkMessage, setLinkMessage] = useState<string>('');
  const [linkError, setLinkError] = useState<string>('');

  // Supervisor State: Selected trainee inspection
  const [selectedTraineeId, setSelectedTraineeId] = useState<number | null>(null);
  const [supervisorNotes, setSupervisorNotes] = useState<string>('');
  const [notesMessage, setNotesMessage] = useState<string>('');

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

  // Supervisor fetches trainees
  const { data: traineesData, isLoading: traineesLoading } = useQuery({
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

  // Save supervisor notes mutation
  const saveNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const res = await api.post(`/supervisor/trainees/${id}/notes`, { notes });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traineeReport', selectedTraineeId] });
      setNotesMessage('تم حفظ الملاحظات التقييمية بنجاح');
      setTimeout(() => setNotesMessage(''), 3000);
    }
  });

  // ----------------------------------------------------
  // Trainee View
  // ----------------------------------------------------
  if (!isSupervisor) {
    return (
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-line">
          <div className="w-10 h-10 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-ink">ربط المشرف الميداني بالتدريب</h2>
            <p className="text-xs text-sub">
              يتيح ربط الحساب لمشرفك الأكاديمي أو الميداني متابعة إنجازاتك اليومية واعتماد تقريرك النهائي
            </p>
          </div>
        </div>

        {user?.supervisor ? (
          <div className="p-4 bg-ok-bg border border-ok/30 rounded-xl text-xs space-y-1">
            <div className="font-bold text-ok flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>الحساب مرتبط بمشرف معتمد</span>
            </div>
            <div className="text-ink">
              اسم المشرف: <span className="font-bold">{user.supervisor.username}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-accent-dim/40 border border-accent/20 rounded-xl text-xs text-accent font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>لم تقم بربط حسابك مع أي مشرف حتى الآن.</span>
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
              اسم مستخدم المشرف (أو رمز الربط الخاص به)
            </label>
            <input
              type="text"
              value={supervisorCodeInput}
              onChange={(e) => setSupervisorCodeInput(e.target.value)}
              placeholder="مثال: dr_khalid أو supervisor_huawei"
              className="w-full px-3.5 py-2.5 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={linkMutation.isPending}
            className="px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span>{linkMutation.isPending ? 'جارٍ التحقق...' : 'ربط الحساب بالمشرف'}</span>
          </button>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------
  // Supervisor Portal View
  // ----------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Supervisor Header Banner */}
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-ok-bg text-ok flex items-center justify-center font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-ink">بوابة المشرف التدريبي</h2>
            <p className="text-xs text-sub">
              استعراض ومتابعة سجلات المتدربين المرتبطين، ومراجعة تقاريرهم الأسبوعية والنهائية
            </p>
          </div>
        </div>

        <div className="bg-bg border border-line rounded-xl px-4 py-2.5 text-xs text-right">
          <span className="text-sub block text-[11px] font-bold">اسم المستخدم لربط المتدربين بك:</span>
          <span className="text-accent font-black text-sm tracking-wider">{user.username}</span>
        </div>
      </div>

      {/* Trainees List & Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trainees List */}
        <div className="bg-card border border-line rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <h3 className="text-xs font-extrabold text-ink flex items-center gap-1.5">
              <Users className="w-4 h-4 text-accent" />
              <span>قائمة المتدربين</span>
            </h3>
            <span className="text-xs font-bold text-sub">
              {traineesData?.trainees?.length || 0} متدرب
            </span>
          </div>

          {traineesLoading ? (
            <div className="text-center py-8 text-sub text-xs">جارٍ جلب المتدربين...</div>
          ) : !traineesData?.trainees?.length ? (
            <div className="text-center py-8 text-sub text-xs">
              لا يوجد متدربون مرتبطون بحسابك حالياً. زوّد المتدربين باسم المستخدم الخاص بك للارتباط.
            </div>
          ) : (
            <div className="space-y-2">
              {traineesData.trainees.map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTraineeId(t.id);
                    setSupervisorNotes(t.profile?.supervisorNotes || '');
                  }}
                  className={`w-full text-right p-3 rounded-xl border transition-all ${
                    selectedTraineeId === t.id
                      ? 'bg-accent-dim/40 border-accent text-ink font-bold'
                      : 'border-line hover:border-ink/50 bg-bg/50 text-sub'
                  }`}
                >
                  <div className="text-xs font-bold text-ink">
                    {t.profile?.studentName || t.username}
                  </div>
                  <div className="text-[11px] text-sub mt-0.5">
                    الرقم: {t.profile?.trainingNumber || 'غير محدد'} | {t._count?.entries || 0} إدخال
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Selected Trainee Report Inspection */}
        <div className="lg:col-span-2 bg-card border border-line rounded-2xl p-6 shadow-sm space-y-6">
          {!selectedTraineeId ? (
            <div className="text-center py-16 text-sub text-sm">
              حدد متدرباً من القائمة الجانبية لاستعراض تقريره وسجلاته اليومية.
            </div>
          ) : reportLoading ? (
            <div className="text-center py-16 text-sub text-sm">جارٍ تحميل تقرير المتدرب...</div>
          ) : traineeReport ? (
            <div className="space-y-6">
              {/* Trainee Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
                <div>
                  <h3 className="text-base font-extrabold text-ink">
                    تقرير المتدرب: {traineeReport.profile.studentName || 'متدرب'}
                  </h3>
                  <div className="text-xs text-sub mt-0.5">
                    القسم: {traineeReport.profile.department || '—'} | الكلية: {traineeReport.profile.trainingUnit || '—'}
                  </div>
                </div>

                {/* Supervisor Downloads */}
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/reports/export/docx?traineeId=${selectedTraineeId}&lang=ar`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-bg hover:bg-line border border-line rounded-xl text-xs font-bold text-ink flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-accent" />
                    <span>تحميل Word</span>
                  </a>
                  <a
                    href={`/api/reports/export/html?traineeId=${selectedTraineeId}&lang=ar`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-bg hover:bg-line border border-line rounded-xl text-xs font-bold text-ink flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-ok" />
                    <span>عرض HTML</span>
                  </a>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-bg border border-line rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-accent">{traineeReport.totalHours}</div>
                  <div className="text-[11px] text-sub font-bold">ساعات معتمدة</div>
                </div>
                <div className="bg-bg border border-line rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-ok">{traineeReport.totalDays}</div>
                  <div className="text-[11px] text-sub font-bold">أيام عمل مسجلة</div>
                </div>
                <div className="bg-bg border border-line rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-ink">{traineeReport.estimatedPages}</div>
                  <div className="text-[11px] text-sub font-bold">صفحات تقديرية</div>
                </div>
              </div>

              {/* Supervisory Feedback Notes */}
              <div className="bg-ok-bg/30 border border-ok/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-ink flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-ok" />
                    <span>ملاحظات وتقييم المشرف التدريبي</span>
                  </span>
                  {notesMessage && <span className="text-xs font-bold text-ok">{notesMessage}</span>}
                </div>

                <textarea
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  rows={3}
                  placeholder="أدخل ملاحظاتك الإشرافية، التوجيهات الأكاديمية، أو التقييم الميداني هنا..."
                  className="w-full p-3 text-xs bg-card border border-line rounded-xl focus:outline-none focus:border-ok"
                />

                <div className="flex justify-end">
                  <button
                    onClick={() =>
                      saveNotesMutation.mutate({ id: selectedTraineeId, notes: supervisorNotes })
                    }
                    disabled={saveNotesMutation.isPending}
                    className="px-4 py-1.5 bg-ok hover:bg-ok/90 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{saveNotesMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ التقييم والملاحظات'}</span>
                  </button>
                </div>
              </div>

              {/* Trainee Content Sections Preview */}
              <div className="space-y-4 text-xs">
                <div className="border border-line rounded-xl p-4 bg-bg/30">
                  <div className="font-extrabold text-ink mb-1">المقدمة</div>
                  <p className="text-sub leading-relaxed">{traineeReport.profile.introText || '—'}</p>
                </div>

                <div className="border border-line rounded-xl p-4 bg-bg/30">
                  <div className="font-extrabold text-ink mb-1">المهارات المكتسبة</div>
                  <p className="text-sub leading-relaxed">{traineeReport.profile.skillsText || '—'}</p>
                </div>

                <div className="border border-line rounded-xl p-4 bg-bg/30">
                  <div className="font-extrabold text-ink mb-1">الخاتمة</div>
                  <p className="text-sub leading-relaxed">{traineeReport.profile.conclusionText || '—'}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
