import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FinalReportData, WeekGroup, EntryDTO, formatDateArabic } from '@coop/shared';
import {
  ShieldCheck,
  UserCheck,
  Users,
  Eye,
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
  Key,
  CalendarRange,
  Layers,
  Filter,
  Image as ImageIcon,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  User,
  X,
  Loader2,
  TrendingUp,
  Tag
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

type InspectionViewMode = 'daily' | 'weekly' | 'monthly' | 'custom' | 'chapters' | 'evaluation';

export const SupervisorTab: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const isSupervisor = user?.role === 'supervisor';

  // ----------------------------------------------------
  // Trainee State: Link supervisor form
  // ----------------------------------------------------
  const [supervisorCodeInput, setSupervisorCodeInput] = useState<string>('');
  const [linkMessage, setLinkMessage] = useState<string>('');
  const [linkError, setLinkError] = useState<string>('');

  // ----------------------------------------------------
  // Supervisor Inspection State
  // ----------------------------------------------------
  const [selectedTraineeId, setSelectedTraineeId] = useState<number | null>(null);
  const [traineeSearchQuery, setTraineeSearchQuery] = useState<string>('');
  const [traineeFilterStatus, setTraineeFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  
  // Inspection modes: 'daily' | 'weekly' | 'monthly' | 'custom' | 'chapters' | 'evaluation'
  const [inspectionMode, setInspectionMode] = useState<InspectionViewMode>('weekly');

  // Daily Mode Filters
  const [dailySearchQuery, setDailySearchQuery] = useState<string>('');
  const [dailyCategoryFilter, setDailyCategoryFilter] = useState<string>('all');
  const [dailySelectedDate, setDailySelectedDate] = useState<string>('all');

  // Weekly Mode State
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(1);

  // Monthly Mode State
  const [selectedMonthStage, setSelectedMonthStage] = useState<number>(1);

  // Custom Range Mode State
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Evaluation form state
  const [supervisorNotes, setSupervisorNotes] = useState<string>('');
  const [supervisorRating, setSupervisorRating] = useState<string>('ممتاز');
  const [supervisorApproved, setSupervisorApproved] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string>('');
  const [copyCodeToast, setCopyCodeToast] = useState<boolean>(false);

  // Download states
  const [downloadingDocx, setDownloadingDocx] = useState<boolean>(false);
  const [downloadingHtml, setDownloadingHtml] = useState<boolean>(false);

  // Lightbox modal for evidence photos
  const [zoomedPhoto, setZoomedPhoto] = useState<{ src: string; caption: string; weekIndex?: number } | null>(null);

  // ----------------------------------------------------
  // Supervisor Account Settings Modal (تغيير اليوزر والرمز السري بدون فلسفة)
  // ----------------------------------------------------
  const [accountModalOpen, setAccountModalOpen] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>(user?.username || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [accountSaving, setAccountSaving] = useState<boolean>(false);
  const [accountError, setAccountError] = useState<string>('');
  const [accountSuccess, setAccountSuccess] = useState<string>('');

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
      a.download = `تقرير_${studentName.replace(/\s+/g, '_')}.docx`;
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
      a.download = `تقرير_${studentName.replace(/\s+/g, '_')}.html`;
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

  // Handle Account Update (Username & Password)
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setAccountError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setAccountError('كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام');
      return;
    }

    setAccountSaving(true);
    try {
      const payload: { username?: string; password?: string } = {};
      if (newUsername.trim() && newUsername.trim() !== user?.username) {
        payload.username = newUsername.trim();
      }
      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      if (!payload.username && !payload.password) {
        setAccountError('لم تقم بإجراء أي تغيير على اسم المستخدم أو كلمة المرور');
        setAccountSaving(false);
        return;
      }

      const res = await api.put('/auth/update-account', payload);
      setAccountSuccess(res.data.message || 'تم تحديث بيانات الحساب بنجاح');
      setNewPassword('');
      setConfirmPassword('');
      await refreshUser();
      setTimeout(() => {
        setAccountSuccess('');
        setAccountModalOpen(false);
      }, 1800);
    } catch (err: any) {
      setAccountError(err.response?.data?.error || 'تعذر تحديث بيانات الحساب');
    } finally {
      setAccountSaving(false);
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
              <span>حسابك مرتبط بمشرف التدريب</span>
            </div>
            <div className="text-ink">
              اسم المشرف: <span className="font-extrabold text-accent">{user.supervisor.username}</span>
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
  const filteredTrainees = traineesList.filter((t) => {
    const matchesQuery =
      t.studentName.toLowerCase().includes(traineeSearchQuery.toLowerCase()) ||
      t.username.toLowerCase().includes(traineeSearchQuery.toLowerCase()) ||
      t.trainingNumber.includes(traineeSearchQuery);
    if (!matchesQuery) return false;
    if (traineeFilterStatus === 'approved') return t.supervisorApproved;
    if (traineeFilterStatus === 'pending') return !t.supervisorApproved;
    return true;
  });

  const totalSupervisedHours = traineesList.reduce((sum, t) => sum + t.totalHours, 0);
  const totalApprovedReports = traineesList.filter((t) => t.supervisorApproved).length;
  const totalPendingReports = traineesList.length - totalApprovedReports;
  const selectedTraineeSummary = traineesList.find((t) => t.id === selectedTraineeId);

  // Flattened entries for Daily inspection & calculations
  const allEntries: EntryDTO[] = useMemo(() => {
    if (!traineeReport?.weeks) return [];
    return traineeReport.weeks.flatMap((w) => w.entries);
  }, [traineeReport]);

  // Unique categories in this trainee's logs
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    allEntries.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [allEntries]);

  // Unique dates in this trainee's logs
  const availableDates = useMemo(() => {
    const set = new Set<string>();
    allEntries.forEach((e) => {
      if (e.entryDate) set.add(e.entryDate);
    });
    return Array.from(set).sort().reverse();
  }, [allEntries]);

  // Filtered entries for Daily Mode
  const filteredDailyEntries = useMemo(() => {
    return allEntries.filter((e) => {
      if (dailyCategoryFilter !== 'all' && e.category !== dailyCategoryFilter) return false;
      if (dailySelectedDate !== 'all' && e.entryDate !== dailySelectedDate) return false;
      if (dailySearchQuery.trim()) {
        const q = dailySearchQuery.toLowerCase();
        const inTitle = e.title?.toLowerCase().includes(q);
        const inDesc = e.description?.toLowerCase().includes(q);
        if (!inTitle && !inDesc) return false;
      }
      return true;
    });
  }, [allEntries, dailyCategoryFilter, dailySelectedDate, dailySearchQuery]);

  // Selected Week Object for Weekly Mode
  const activeWeekObj: WeekGroup | undefined = useMemo(() => {
    if (!traineeReport?.weeks) return undefined;
    return traineeReport.weeks.find((w) => w.weekIndex === selectedWeekIndex) || traineeReport.weeks[0];
  }, [traineeReport, selectedWeekIndex]);

  // Four Monthly Stages: Month 1 (Weeks 1-4), Month 2 (Weeks 5-8), Month 3 (Weeks 9-12), Month 4 (Weeks 13-14)
  const monthlyStages = useMemo(() => {
    if (!traineeReport?.weeks) return [];
    const stages = [
      {
        monthIndex: 1,
        title: 'الشهر الأول (الأسابيع 1 - 4)',
        stageName: 'مرحلة التهيئة وبدء المهام الأساسية',
        weekIndices: [1, 2, 3, 4]
      },
      {
        monthIndex: 2,
        title: 'الشهر الثاني (الأسابيع 5 - 8)',
        stageName: 'مرحلة الممارسة والتكليفات الميدانية',
        weekIndices: [5, 6, 7, 8]
      },
      {
        monthIndex: 3,
        title: 'الشهر الثالث (الأسابيع 9 - 12)',
        stageName: 'مرحلة المشاريع والمهام المتقدمة',
        weekIndices: [9, 10, 11, 12]
      },
      {
        monthIndex: 4,
        title: 'الشهر الرابع (الأسابيع 13 - 14)',
        stageName: 'مرحلة الإغلاق واستخلاص المخرجات',
        weekIndices: [13, 14]
      }
    ];

    return stages.map((stg) => {
      const weeksInStage = traineeReport.weeks.filter((w) => stg.weekIndices.includes(w.weekIndex));
      const hours = weeksInStage.reduce((sum, w) => sum + w.totalHours, 0);
      const entries = weeksInStage.flatMap((w) => w.entries);
      const uniqueDays = new Set(entries.map((e) => e.entryDate)).size;
      const targetHours = stg.monthIndex === 4 ? 40 : 80;
      const percent = Math.min(100, Math.round((hours / targetHours) * 100));

      // Category breakdown in this month
      const catCount: Record<string, number> = {};
      entries.forEach((e) => {
        catCount[e.category] = (catCount[e.category] || 0) + 1;
      });

      return {
        ...stg,
        weeksInStage,
        totalHours: Number(hours.toFixed(1)),
        targetHours,
        percent,
        uniqueDays,
        entriesCount: entries.length,
        entries,
        categoryBreakdown: catCount
      };
    });
  }, [traineeReport]);

  const activeMonthObj = useMemo(() => {
    return monthlyStages.find((m) => m.monthIndex === selectedMonthStage) || monthlyStages[0];
  }, [monthlyStages, selectedMonthStage]);

  // Filtered entries for Custom Period Mode
  const customPeriodData = useMemo(() => {
    if (!customStartDate && !customEndDate) {
      return {
        entries: allEntries,
        totalHours: traineeReport?.totalHours || 0,
        uniqueDays: traineeReport?.totalDays || 0,
        totalTasks: allEntries.length
      };
    }

    const filtered = allEntries.filter((e) => {
      if (customStartDate && e.entryDate < customStartDate) return false;
      if (customEndDate && e.entryDate > customEndDate) return false;
      return true;
    });

    const hours = filtered.reduce((sum, e) => {
      const [fh, fm] = (e.timeFrom || '00:00').split(':').map(Number);
      const [th, tm] = (e.timeTo || '00:00').split(':').map(Number);
      let diff = (th * 60 + tm) - (fh * 60 + fm);
      if (diff < 0) diff += 24 * 60;
      return sum + diff / 60;
    }, 0);

    const days = new Set(filtered.map((e) => e.entryDate)).size;

    return {
      entries: filtered,
      totalHours: Number(hours.toFixed(1)),
      uniqueDays: days,
      totalTasks: filtered.length
    };
  }, [allEntries, customStartDate, customEndDate, traineeReport]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 z-50 animate-fade-in max-w-[90%] text-center">
          <Check className="w-4 h-4 text-ok shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Banner & Quick Linking Card + Supervisor Account Management */}
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-ok-bg text-ok flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-ink">بوابة المشرف الأكاديمي والميداني</h2>
              <span className="px-2 py-0.5 rounded-full bg-accent-dim text-accent text-[10px] font-black">
                لوحة التحكم الشاملة
              </span>
            </div>
            <p className="text-xs text-sub mt-0.5">
              فحص تقارير المتدربين (يومية، أسبوعية، شهرية، مخصصة) واعتمادها الأكاديمي المباشر
            </p>
          </div>
        </div>

        {/* Action Buttons: Code Copy + Account Settings Modal Trigger */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Supervisor Linking Code */}
          <div className="bg-bg border border-line rounded-xl p-2.5 sm:px-3 flex items-center gap-3">
            <div>
              <span className="text-sub block text-[10px] font-bold">رمز ربط المتدربين بك:</span>
              <span className="text-accent font-black text-xs sm:text-sm tracking-wider font-mono">{user.username}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-2.5 py-1.5 bg-card hover:bg-line text-ink border border-line rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="نسخ اسم المشرف لمشاركته مع المتدربين"
            >
              {copyCodeToast ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5 text-sub" />}
              <span>{copyCodeToast ? 'تم النسخ' : 'نسخ'}</span>
            </button>
          </div>

          {/* Account Credentials Settings Button (بدون فلسفة) */}
          <button
            type="button"
            onClick={() => {
              setNewUsername(user?.username || '');
              setNewPassword('');
              setConfirmPassword('');
              setAccountError('');
              setAccountSuccess('');
              setAccountModalOpen(true);
            }}
            className="px-3.5 py-2 bg-bg hover:bg-line text-ink border border-line rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
            title="تغيير اسم المستخدم أو الرمز السري لحسابك"
          >
            <Key className="w-4 h-4 text-accent" />
            <span>تعديل الحساب والرمز السري</span>
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
            <span>إجمالي الساعات المسجلة</span>
          </div>
          <div className="text-2xl font-black text-ok">{totalSupervisedHours} س</div>
        </div>

        <div className="bg-card border border-line rounded-xl p-4 space-y-1">
          <div className="text-xs font-bold text-sub flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-accent" />
            <span>التقارير المعتمدة</span>
          </div>
          <div className="text-2xl font-black text-accent">{totalApprovedReports}</div>
        </div>

        <div className="bg-card border border-line rounded-xl p-4 space-y-1">
          <div className="text-xs font-bold text-sub flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-warn" />
            <span>قيد المراجعة</span>
          </div>
          <div className="text-2xl font-black text-warn">{totalPendingReports}</div>
        </div>
      </div>

      {/* Trainees Directory & Comprehensive Inspection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right Column: Trainees Directory & Filter */}
        <div className="bg-card border border-line rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <h3 className="text-xs font-extrabold text-ink flex items-center gap-1.5">
              <Users className="w-4 h-4 text-accent" />
              <span>دليل المتدربين ({traineesList.length})</span>
            </h3>
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setTraineeFilterStatus('all')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                  traineeFilterStatus === 'all' ? 'bg-accent text-white' : 'text-sub hover:text-ink'
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setTraineeFilterStatus('approved')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                  traineeFilterStatus === 'approved' ? 'bg-ok text-white' : 'text-sub hover:text-ink'
                }`}
              >
                المعتمد
              </button>
              <button
                type="button"
                onClick={() => setTraineeFilterStatus('pending')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                  traineeFilterStatus === 'pending' ? 'bg-warn text-white' : 'text-sub hover:text-ink'
                }`}
              >
                المتبقي
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-sub absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={traineeSearchQuery}
              onChange={(e) => setTraineeSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو الرقم التدريبي..."
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
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
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
                        ? 'bg-accent-dim/40 border-accent shadow-sm ring-1 ring-accent'
                        : 'border-line hover:border-ink/40 bg-bg/40'
                    }`}
                  >
                    <div className="flex items-center justify-between font-extrabold text-ink">
                      <span>{t.studentName}</span>
                      {t.supervisorApproved ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-ok-bg text-ok flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
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

        {/* Left Columns (2 cols): Comprehensive Inspection Workspace */}
        <div className="lg:col-span-2 bg-card border border-line rounded-2xl p-6 shadow-sm space-y-6">
          {!selectedTraineeId ? (
            <div className="text-center py-28 text-sub text-sm space-y-3">
              <Eye className="w-10 h-10 text-sub/40 mx-auto" />
              <p className="font-bold text-ink text-base">حدد متدرباً من القائمة الجانبية لبدء الفحص والاعتماد</p>
              <p className="text-xs text-muted max-w-md mx-auto">
                يمكنك استعراض كامل أنشطة المتدرب بالترتيب اليومي، الأسبوعي، الشهري، أو حسب فترة مخصصة مع شواهد الصور الميدانية
              </p>
            </div>
          ) : reportLoading ? (
            <div className="text-center py-28 text-sub text-sm space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" />
              <p>جارٍ تحميل بيانات التقرير وسجلات الإنجاز...</p>
            </div>
          ) : traineeReport ? (
            <div className="space-y-6">
              {/* Inspection Trainee Header */}
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
                    الرقم التدريبي: <span className="font-bold text-ink">{traineeReport.profile.trainingNumber || '—'}</span> | جهة التدريب: <span className="font-bold text-ink">{traineeReport.profile.entityAddress || '—'}</span>
                  </div>
                </div>

                {/* Supervisor Export Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={downloadingDocx}
                    onClick={() => handleDownloadDocx(selectedTraineeId, traineeReport.profile.studentName)}
                    className="px-3 py-1.5 bg-bg hover:bg-line border border-line rounded-xl text-xs font-bold text-ink flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                    title="تحميل مستند Word معتمد"
                  >
                    <Download className={`w-3.5 h-3.5 text-accent ${downloadingDocx ? 'animate-bounce' : ''}`} />
                    <span>{downloadingDocx ? 'جارٍ التحميل...' : 'تقرير Word'}</span>
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

              {/* Multi-Mode Inspection Navigation Bar */}
              <div className="bg-bg/60 p-1.5 border border-line rounded-2xl flex flex-wrap items-center gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setInspectionMode('daily')}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    inspectionMode === 'daily'
                      ? 'bg-accent text-white shadow-sm font-black'
                      : 'text-sub hover:text-ink hover:bg-bg'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>تقارير يومية ({allEntries.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectionMode('weekly')}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    inspectionMode === 'weekly'
                      ? 'bg-accent text-white shadow-sm font-black'
                      : 'text-sub hover:text-ink hover:bg-bg'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>تقارير أسبوعية (14 أسبوع)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectionMode('monthly')}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    inspectionMode === 'monthly'
                      ? 'bg-accent text-white shadow-sm font-black'
                      : 'text-sub hover:text-ink hover:bg-bg'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>تقارير شهرية (4 مراحل)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectionMode('custom')}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    inspectionMode === 'custom'
                      ? 'bg-accent text-white shadow-sm font-black'
                      : 'text-sub hover:text-ink hover:bg-bg'
                  }`}
                >
                  <CalendarRange className="w-3.5 h-3.5" />
                  <span>فترة مخصصة (كوستم)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectionMode('chapters')}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    inspectionMode === 'chapters'
                      ? 'bg-accent text-white shadow-sm font-black'
                      : 'text-sub hover:text-ink hover:bg-bg'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>فصول التقرير</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectionMode('evaluation')}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    inspectionMode === 'evaluation'
                      ? 'bg-ok text-white shadow-sm font-black'
                      : 'text-ok hover:bg-ok-bg/40'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>التقييم والاعتماد</span>
                </button>
              </div>

              {/* ---------------------------------------------------- */}
              {/* MODE 1: DAILY REPORTS (تقارير يومية)                */}
              {/* ---------------------------------------------------- */}
              {inspectionMode === 'daily' && (
                <div className="space-y-4">
                  {/* Daily Filters Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-bg/40 border border-line rounded-xl text-xs">
                    {/* Search inside tasks */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-sub absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={dailySearchQuery}
                        onChange={(e) => setDailySearchQuery(e.target.value)}
                        placeholder="بحث في تفاصيل اليوميات..."
                        className="w-full pr-8 pl-3 py-1.5 bg-card border border-line rounded-lg text-ink focus:outline-none focus:border-accent"
                      />
                    </div>

                    {/* Filter by Category */}
                    <select
                      value={dailyCategoryFilter}
                      onChange={(e) => setDailyCategoryFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-card border border-line rounded-lg text-ink font-medium focus:outline-none focus:border-accent"
                    >
                      <option value="all">كافة التصنيفات التقنية ({availableCategories.length})</option>
                      {availableCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    {/* Filter by specific Date */}
                    <select
                      value={dailySelectedDate}
                      onChange={(e) => setDailySelectedDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-card border border-line rounded-lg text-ink font-medium focus:outline-none focus:border-accent"
                    >
                      <option value="all">كافة أيام التدريب ({availableDates.length} يوم)</option>
                      {availableDates.map((d) => (
                        <option key={d} value={d}>
                          {formatDateArabic(d)} ({d})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Summary Metric for filtered view */}
                  <div className="flex items-center justify-between text-xs text-sub font-bold px-1">
                    <span>عدد المهام اليومية المطابقة: {filteredDailyEntries.length} مهمة</span>
                    <span>
                      إجمالي ساعات العرض:{' '}
                      {filteredDailyEntries
                        .reduce((sum, e) => {
                          const [fh, fm] = (e.timeFrom || '00:00').split(':').map(Number);
                          const [th, tm] = (e.timeTo || '00:00').split(':').map(Number);
                          let diff = (th * 60 + tm) - (fh * 60 + fm);
                          if (diff < 0) diff += 24 * 60;
                          return sum + diff / 60;
                        }, 0)
                        .toFixed(1)}{' '}
                      ساعة
                    </span>
                  </div>

                  {/* Daily Entries List */}
                  {!filteredDailyEntries.length ? (
                    <div className="text-center py-12 text-sub text-xs bg-bg/20 border border-line rounded-xl">
                      لا توجد مدخلات يومية مطابقة للفلتر المحدد.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                      {filteredDailyEntries.map((entry) => {
                        const [fh, fm] = (entry.timeFrom || '00:00').split(':').map(Number);
                        const [th, tm] = (entry.timeTo || '00:00').split(':').map(Number);
                        let diff = (th * 60 + tm) - (fh * 60 + fm);
                        if (diff < 0) diff += 24 * 60;
                        const duration = (diff / 60).toFixed(1);

                        return (
                          <div
                            key={entry.id}
                            className="p-4 bg-bg/40 border border-line rounded-xl space-y-2 hover:border-accent/40 transition-colors text-xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-line pb-2">
                              <div className="font-extrabold text-ink text-sm flex items-center gap-2">
                                <span>{entry.title}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-sub font-medium">
                                <span className="bg-card px-2 py-0.5 rounded border border-line font-bold text-ink">
                                  {formatDateArabic(entry.entryDate)}
                                </span>
                                <span>
                                  ({entry.timeFrom} - {entry.timeTo})
                                </span>
                                <span className="font-extrabold text-ok">{duration} س</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-accent-dim text-accent">
                                {entry.category}
                              </span>
                            </div>

                            <p className="text-sub leading-relaxed whitespace-pre-wrap font-normal text-xs pt-1">
                              {entry.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* MODE 2: WEEKLY REPORTS (تقارير أسبوعية مع شواهد الصور)*/}
              {/* ---------------------------------------------------- */}
              {inspectionMode === 'weekly' && (
                <div className="space-y-5">
                  {/* 14 Weeks Chips Selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-line no-scrollbar">
                    {traineeReport.weeks.map((w) => {
                      const isSelected = selectedWeekIndex === w.weekIndex;
                      const hasTasks = w.entries.length > 0;
                      const hasPhotos = (w.evidence?.length || 0) > 0;

                      return (
                        <button
                          key={w.weekIndex}
                          type="button"
                          onClick={() => setSelectedWeekIndex(w.weekIndex)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all text-center ${
                            isSelected
                              ? 'bg-accent text-white shadow-sm ring-1 ring-accent'
                              : hasTasks
                              ? 'bg-bg text-ink border border-line hover:border-accent/40'
                              : 'bg-bg/40 text-sub border border-line/60 opacity-70'
                          }`}
                        >
                          <div className="font-extrabold">الأسبوع {w.weekIndex}</div>
                          <div className="text-[10px] font-medium flex items-center justify-center gap-1 mt-0.5">
                            <span>{w.totalHours}س</span>
                            {hasPhotos && <ImageIcon className="w-2.5 h-2.5 text-accent" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Week Details Header */}
                  {activeWeekObj && (
                    <div className="p-4 bg-bg border border-line rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-black text-ink flex items-center gap-2">
                          <span>تقرير الأسبوع {activeWeekObj.weekIndex}</span>
                          <span className="text-xs font-bold text-sub">
                            ({formatDateArabic(activeWeekObj.weekStart)} — {formatDateArabic(activeWeekObj.weekEnd)})
                          </span>
                        </h4>
                        <p className="text-[11px] text-sub mt-0.5">
                          سجل الإنجازات الميدانية والمهام المنفذة والصور التوثيقية لهذا الأسبوع
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="bg-card px-3 py-1.5 rounded-xl border border-line font-bold text-ink text-center">
                          <span className="text-[10px] text-sub block">ساعات العمل</span>
                          <span className="text-accent font-extrabold">{activeWeekObj.totalHours} ساعة</span>
                        </div>
                        <div className="bg-card px-3 py-1.5 rounded-xl border border-line font-bold text-ink text-center">
                          <span className="text-[10px] text-sub block">عدد المهام</span>
                          <span className="text-ok font-extrabold">{activeWeekObj.entries.length} مهمة</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Weekly Field Evidence Photos (شواهد الصور للأسبوع) */}
                  {activeWeekObj && (
                    <div className="border border-line rounded-2xl p-4 bg-bg/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-ink flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-accent" />
                          <span>الشواهد والصور التوثيقية للأسبوع {activeWeekObj.weekIndex}</span>
                        </span>
                        <span className="text-[11px] font-bold text-sub">
                          ({activeWeekObj.evidence?.length || 0} من 4 صور)
                        </span>
                      </div>

                      {!activeWeekObj.evidence?.length ? (
                        <div className="p-3 text-center text-xs text-sub bg-card rounded-xl border border-dashed border-line">
                          لم يرفق المتدرب صوراً توثيقية لهذا الأسبوع.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {activeWeekObj.evidence.map((photo, pIdx) => (
                            <div
                              key={photo.id || pIdx}
                              onClick={() =>
                                setZoomedPhoto({
                                  src: photo.imageData,
                                  caption: photo.caption,
                                  weekIndex: activeWeekObj.weekIndex
                                })
                              }
                              className="group cursor-pointer border border-line rounded-xl overflow-hidden bg-card p-1.5 space-y-1.5 hover:border-accent transition-all shadow-2xs"
                            >
                              <div className="relative h-28 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center">
                                <img
                                  src={photo.imageData}
                                  alt={photo.caption}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <span className="absolute bottom-1 right-1 bg-ink/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  تكبير
                                </span>
                              </div>
                              <p className="text-[10px] font-bold text-ink line-clamp-2 px-1 leading-snug">
                                {photo.caption}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Day-by-Day Tasks for Active Week */}
                  {activeWeekObj && (
                    <div className="space-y-3">
                      <h5 className="text-xs font-extrabold text-ink flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-accent" />
                        <span>سجل المهام اليومية في هذا الأسبوع ({activeWeekObj.entries.length})</span>
                      </h5>

                      {!activeWeekObj.entries.length ? (
                        <div className="p-6 text-center text-xs text-sub bg-bg/20 border border-line rounded-xl italic">
                          لم تسجل مهام في هذا الأسبوع حتى الآن.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {activeWeekObj.entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="p-3.5 bg-bg/50 border border-line rounded-xl space-y-1.5 text-xs"
                            >
                              <div className="flex items-center justify-between font-bold text-ink">
                                <span>{entry.title}</span>
                                <span className="text-[11px] text-sub font-normal">
                                  {formatDateArabic(entry.entryDate)} ({entry.timeFrom} - {entry.timeTo})
                                </span>
                              </div>
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-dim text-accent">
                                {entry.category}
                              </span>
                              <p className="text-sub leading-relaxed whitespace-pre-wrap pt-0.5 font-normal">
                                {entry.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* MODE 3: MONTHLY REPORTS (تقارير شهرية - 4 مراحل)     */}
              {/* ---------------------------------------------------- */}
              {inspectionMode === 'monthly' && (
                <div className="space-y-5">
                  {/* 4 Month Stages Selector Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {monthlyStages.map((m) => {
                      const isSelected = selectedMonthStage === m.monthIndex;
                      return (
                        <button
                          key={m.monthIndex}
                          type="button"
                          onClick={() => setSelectedMonthStage(m.monthIndex)}
                          className={`p-3.5 rounded-xl border text-right transition-all space-y-2 text-xs ${
                            isSelected
                              ? 'bg-accent-dim/40 border-accent shadow-sm ring-1 ring-accent'
                              : 'bg-bg/40 border-line hover:border-ink/40'
                          }`}
                        >
                          <div className="font-extrabold text-ink">{m.title}</div>
                          <div className="text-[10px] text-sub font-medium line-clamp-1">{m.stageName}</div>
                          <div className="flex items-center justify-between text-[11px] font-bold pt-1">
                            <span className="text-accent">{m.totalHours} / {m.targetHours} س</span>
                            <span className="text-sub">{m.percent}%</span>
                          </div>
                          <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all"
                              style={{ width: `${m.percent}%` }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Month Deep Dive */}
                  {activeMonthObj && (
                    <div className="bg-bg/40 border border-line rounded-2xl p-5 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
                        <div>
                          <h4 className="text-sm font-black text-ink">{activeMonthObj.title}</h4>
                          <p className="text-xs text-sub">{activeMonthObj.stageName}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="bg-card px-3 py-1.5 rounded-xl border border-line font-bold text-ink">
                            الساعات: <span className="text-ok font-extrabold">{activeMonthObj.totalHours} س</span>
                          </span>
                          <span className="bg-card px-3 py-1.5 rounded-xl border border-line font-bold text-ink">
                            الأيام: <span className="text-accent font-extrabold">{activeMonthObj.uniqueDays} يوم</span>
                          </span>
                          <span className="bg-card px-3 py-1.5 rounded-xl border border-line font-bold text-ink">
                            المهام: <span className="text-ink font-extrabold">{activeMonthObj.entriesCount} مهمة</span>
                          </span>
                        </div>
                      </div>

                      {/* Technical Categories Distribution in this Month */}
                      <div className="space-y-2">
                        <span className="text-xs font-extrabold text-ink block">
                          التوزيع التقني للمهام خلال هذا الشهر:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(activeMonthObj.categoryBreakdown).map(([cat, count]) => (
                            <span
                              key={cat}
                              className="px-2.5 py-1 rounded-lg bg-card border border-line text-[11px] font-bold text-ink flex items-center gap-1.5"
                            >
                              <Tag className="w-3 h-3 text-accent" />
                              <span>{cat}</span>
                              <span className="text-sub font-mono">({count})</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Month Tasks List */}
                      <div className="space-y-3">
                        <span className="text-xs font-extrabold text-ink block">
                          كافة المهام المنفذة خلال {activeMonthObj.title} ({activeMonthObj.entries.length}):
                        </span>

                        {!activeMonthObj.entries.length ? (
                          <div className="p-6 text-center text-xs text-sub bg-card rounded-xl border border-line italic">
                            لم تسجل مهام في هذا الشهر التدريبي.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                            {activeMonthObj.entries.map((entry) => (
                              <div
                                key={entry.id}
                                className="p-3 bg-card border border-line rounded-xl space-y-1 text-xs"
                              >
                                <div className="flex items-center justify-between font-bold text-ink">
                                  <span>{entry.title}</span>
                                  <span className="text-[11px] text-sub font-normal">
                                    {formatDateArabic(entry.entryDate)} ({entry.timeFrom} - {entry.timeTo})
                                  </span>
                                </div>
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-dim text-accent">
                                  {entry.category}
                                </span>
                                <p className="text-sub leading-relaxed whitespace-pre-wrap font-normal text-[11px]">
                                  {entry.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* MODE 4: CUSTOM PERIOD REPORTS (فترة مخصصة / كوستم)   */}
              {/* ---------------------------------------------------- */}
              {inspectionMode === 'custom' && (
                <div className="space-y-5">
                  {/* Date Range Selector & Shortcuts */}
                  <div className="bg-bg/40 border border-line rounded-2xl p-4 space-y-3.5 text-xs">
                    <div className="font-extrabold text-ink flex items-center gap-2">
                      <CalendarRange className="w-4 h-4 text-accent" />
                      <span>تحديد نطاق زمني مخصص لفحص الإنجازات</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sub block font-bold mb-1">من تاريخ:</label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full px-3 py-2 bg-card border border-line rounded-xl text-ink font-medium focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="text-sub block font-bold mb-1">إلى تاريخ:</label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full px-3 py-2 bg-card border border-line rounded-xl text-ink font-medium focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    {/* Quick Shortcuts */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-sub font-bold ml-1">فترات سريعة:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomStartDate('');
                          setCustomEndDate('');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-card border border-line hover:border-accent text-[11px] font-bold text-ink"
                      >
                        كامل فترة التدريب
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (availableDates.length > 0) {
                            const lastDate = availableDates[0];
                            const d = new Date(lastDate);
                            d.setDate(d.getDate() - 14);
                            setCustomStartDate(d.toISOString().split('T')[0]);
                            setCustomEndDate(lastDate);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-card border border-line hover:border-accent text-[11px] font-bold text-ink"
                      >
                        آخر 14 يوماً
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (traineeReport?.weeks?.[6]?.weekEnd) {
                            setCustomStartDate(traineeReport.weeks[0].weekStart);
                            setCustomEndDate(traineeReport.weeks[6].weekEnd);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-card border border-line hover:border-accent text-[11px] font-bold text-ink"
                      >
                        النصف الأول (الأسابيع 1-7)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (traineeReport?.weeks?.[7]?.weekStart && traineeReport?.weeks?.[13]?.weekEnd) {
                            setCustomStartDate(traineeReport.weeks[7].weekStart);
                            setCustomEndDate(traineeReport.weeks[13].weekEnd);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-card border border-line hover:border-accent text-[11px] font-bold text-ink"
                      >
                        النصف الثاني (الأسابيع 8-14)
                      </button>
                    </div>
                  </div>

                  {/* Calculated Metrics for Custom Period */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-card border border-line rounded-xl p-3 text-center space-y-0.5">
                      <span className="text-[10px] font-bold text-sub block">ساعات الفترة المحددة</span>
                      <span className="text-xl font-black text-accent">{customPeriodData.totalHours} س</span>
                    </div>
                    <div className="bg-card border border-line rounded-xl p-3 text-center space-y-0.5">
                      <span className="text-[10px] font-bold text-sub block">الأيام المنجزة</span>
                      <span className="text-xl font-black text-ok">{customPeriodData.uniqueDays} يوم</span>
                    </div>
                    <div className="bg-card border border-line rounded-xl p-3 text-center space-y-0.5">
                      <span className="text-[10px] font-bold text-sub block">عدد المهام</span>
                      <span className="text-xl font-black text-ink">{customPeriodData.totalTasks} مهمة</span>
                    </div>
                  </div>

                  {/* Entries in Custom Period */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-ink">
                      <span>المهام المنجزة ضمن هذا النطاق ({customPeriodData.entries.length})</span>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="text-sub hover:text-accent flex items-center gap-1 text-[11px]"
                        title="طباعة تقرير هذه الفترة"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة التقرير المخصص</span>
                      </button>
                    </div>

                    {!customPeriodData.entries.length ? (
                      <div className="p-8 text-center text-xs text-sub bg-bg/20 border border-line rounded-xl">
                        لا توجد مدخلات مسجلة في هذا النطاق الزمني.
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                        {customPeriodData.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="p-3.5 bg-bg/40 border border-line rounded-xl space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between font-bold text-ink">
                              <span>{entry.title}</span>
                              <span className="text-[11px] text-sub font-normal">
                                {formatDateArabic(entry.entryDate)} ({entry.timeFrom} - {entry.timeTo})
                              </span>
                            </div>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-dim text-accent">
                              {entry.category}
                            </span>
                            <p className="text-sub leading-relaxed whitespace-pre-wrap font-normal text-xs pt-1">
                              {entry.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* MODE 5: REPORT CHAPTERS (فصول التقرير الأكاديمي)     */}
              {/* ---------------------------------------------------- */}
              {inspectionMode === 'chapters' && (
                <div className="space-y-4 text-xs max-h-[550px] overflow-y-auto pr-1">
                  <div className="border border-line rounded-xl p-4 bg-bg/30 space-y-1.5">
                    <span className="font-extrabold text-ink block text-xs">١. المقدمة وأهداف التدريب وبيانات المقرر:</span>
                    <p className="text-sub leading-relaxed whitespace-pre-wrap font-normal">{traineeReport.profile.introText || 'لم يتم إدخال المقدمة بعد.'}</p>
                  </div>

                  <div className="border border-line rounded-xl p-4 bg-bg/30 space-y-1.5">
                    <span className="font-extrabold text-ink block text-xs">٢. التعريف بجهة التدريب وطبيعة العمل:</span>
                    <p className="text-sub leading-relaxed whitespace-pre-wrap font-normal">{traineeReport.profile.entityIntroText || 'لم يتم إدخال التعريف بالجهة بعد.'}</p>
                  </div>

                  <div className="border border-line rounded-xl p-4 bg-bg/30 space-y-1.5">
                    <span className="font-extrabold text-ink block text-xs">٣. المعارف والمهارات والتجارب المكتسبة:</span>
                    <p className="text-sub leading-relaxed whitespace-pre-wrap font-normal">{traineeReport.profile.skillsText || 'لم يتم إدخال المهارات بعد.'}</p>
                  </div>

                  <div className="border border-line rounded-xl p-4 bg-bg/30 space-y-1.5">
                    <span className="font-extrabold text-ink block text-xs">٤. الخاتمة والتوصيات العامة:</span>
                    <p className="text-sub leading-relaxed whitespace-pre-wrap font-normal">{traineeReport.profile.conclusionText || 'لم يتم إدخال الخاتمة بعد.'}</p>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* MODE 6: EVALUATION & APPROVAL (التقييم والاعتماد)     */}
              {/* ---------------------------------------------------- */}
              {inspectionMode === 'evaluation' && (
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

                  {/* Verification Hash Badge if Approved */}
                  {traineeReport.profile.verificationHash && (
                    <div className="p-3 bg-card border border-line rounded-xl space-y-1 text-[11px]">
                      <span className="text-sub block font-medium">رمز التحقق الرقمي المعتمد:</span>
                      <span className="font-mono font-black text-accent select-all block break-all">
                        {traineeReport.profile.verificationHash}
                      </span>
                    </div>
                  )}

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

      {/* ---------------------------------------------------- */}
      {/* Lightbox Modal for Evidence Photos                   */}
      {/* ---------------------------------------------------- */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomedPhoto(null)}
        >
          <div
            className="bg-card border border-line rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-3 p-4"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-xs font-bold text-ink">
                شاهد توثيقي — الأسبوع {zoomedPhoto.weekIndex}
              </span>
              <button
                type="button"
                onClick={() => setZoomedPhoto(null)}
                className="p-1 rounded-lg hover:bg-line text-sub hover:text-ink transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
              <img
                src={zoomedPhoto.src}
                alt={zoomedPhoto.caption}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>
            <p className="text-xs font-bold text-ink leading-relaxed px-1">
              {zoomedPhoto.caption}
            </p>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Supervisor Account Settings Modal (تغيير اليوزر والرمز) */}
      {/* ---------------------------------------------------- */}
      {accountModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setAccountModalOpen(false)}
        >
          <div
            className="bg-card border border-line rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-5 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-ink">إعدادات حساب المشرف</h3>
                  <p className="text-[11px] text-sub">تعديل اسم المستخدم والرمز السري مباشرة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAccountModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-line text-sub hover:text-ink transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {accountError && (
              <div className="p-3 bg-accent-dim text-accent text-xs font-bold rounded-xl border border-accent/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{accountError}</span>
              </div>
            )}

            {accountSuccess && (
              <div className="p-3 bg-ok-bg text-ok text-xs font-bold rounded-xl border border-ok/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{accountSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateAccount} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-sub">اسم المستخدم (رمز ربط المتدربين):</label>
                <div className="relative">
                  <User className="w-4 h-4 text-sub absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="اسم المستخدم الجديد..."
                    required
                    className="w-full pr-9 pl-3 py-2.5 bg-bg border border-line rounded-xl text-ink font-medium focus:outline-none focus:border-accent"
                  />
                </div>
                <p className="text-[10px] text-muted">
                  هذا الاسم هو نفس الرمز الذي يستخدمه الطلاب لربط تقاريرهم بك.
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block font-bold text-sub">كلمة المرور الجديدة (اختياري):</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-sub absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="اتركه فارغاً إذا كنت لا ترغب بتغيير الرمز..."
                    className="w-full pr-9 pl-3 py-2.5 bg-bg border border-line rounded-xl text-ink font-medium focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {newPassword.trim() && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-sub">تأكيد كلمة المرور الجديدة:</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-sub absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد إدخال الرمز السري الجديد..."
                      className="w-full pr-9 pl-3 py-2.5 bg-bg border border-line rounded-xl text-ink font-medium focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setAccountModalOpen(false)}
                  className="px-4 py-2 bg-bg hover:bg-line text-sub hover:text-ink font-bold rounded-xl text-xs transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={accountSaving}
                  className="px-6 py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  {accountSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جارٍ الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>حفظ التعديلات فوراً</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
