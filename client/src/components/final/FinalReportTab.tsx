import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { FinalReportData, ProfileInput, DiffChunk, formatDateArabic } from '@coop/shared';
import {
  FileText,
  Save,
  Sparkles,
  Download,
  Printer,
  FileCode,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Languages,
  Check,
  ShieldCheck,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { DiffModal } from '../common/DiffModal';

const PROFILE_DRAFT_KEY = 'coop_profile_draft_v2';

interface FinalReportTabProps {
  currentLang: 'ar' | 'en';
}

export const FinalReportTab: React.FC<FinalReportTabProps> = ({ currentLang }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [profileData, setProfileData] = useState<ProfileInput>({
    studentName: '',
    trainingNumber: '',
    department: '',
    trainingUnit: '',
    supervisorName: '',
    responsibleName: '',
    entityAddress: 'هواوي السعودية (Huawei Tech Saudi)',
    employeesCount: '',
    introText: '',
    entityIntroText: '',
    skillsText: '',
    conclusionText: ''
  });

  const [saveToast, setSaveToast] = useState<string>('');
  const [backupNotice, setBackupNotice] = useState<string>('');

  // AI Diff Modal State
  const [diffModalOpen, setDiffModalOpen] = useState<boolean>(false);
  const [diffTitle, setDiffTitle] = useState<string>('');
  const [originalText, setOriginalText] = useState<string>('');
  const [improvedText, setImprovedText] = useState<string>('');
  const [diffChunks, setDiffChunks] = useState<DiffChunk[]>([]);
  const [currentTargetField, setCurrentTargetField] = useState<keyof ProfileInput | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Fetch Report Profile & Data
  const { data: reportData, isLoading } = useQuery<FinalReportData>({
    queryKey: ['finalReport'],
    queryFn: async () => {
      const res = await api.get('/reports/final');
      return res.data;
    }
  });

  useEffect(() => {
    if (reportData?.profile) {
      setProfileData({
        studentName: reportData.profile.studentName || '',
        trainingNumber: reportData.profile.trainingNumber || '',
        department: reportData.profile.department || '',
        trainingUnit: reportData.profile.trainingUnit || '',
        supervisorName: reportData.profile.supervisorName || '',
        responsibleName: reportData.profile.responsibleName || '',
        entityAddress: reportData.profile.entityAddress || 'هواوي السعودية (Huawei Tech Saudi)',
        employeesCount: reportData.profile.employeesCount || '',
        introText: reportData.profile.introText || '',
        entityIntroText: reportData.profile.entityIntroText || '',
        skillsText: reportData.profile.skillsText || '',
        conclusionText: reportData.profile.conclusionText || ''
      });
    }
  }, [reportData]);

  // Auto-save draft for profile
  useEffect(() => {
    const handler = setTimeout(() => {
      if (profileData.introText || profileData.studentName) {
        localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(profileData));
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [profileData]);

  // Save Profile Mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (data: ProfileInput) => {
      const res = await api.put('/profile', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      setSaveToast('تم حفظ بيانات التقرير بنجاح وتحديث السجلات');
      localStorage.removeItem(PROFILE_DRAFT_KEY);
      setTimeout(() => setSaveToast(''), 3000);
    }
  });

  const handleProfileChange = (field: keyof ProfileInput, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfileMutation.mutate(profileData);
  };

  // Export Complete Backup Archive (SHA-256 Verified)
  const handleExportBackup = () => {
    window.open('/api/backup/export', '_blank');
    setBackupNotice('تم تصدير وحفظ نسخة احتياطية مشفرة بـ SHA-256 محلياً على جهازك.');
    setTimeout(() => setBackupNotice(''), 4500);
  };

  // Import Backup Archive
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backupJson = JSON.parse(text);

      const res = await api.post('/backup/import', backupJson);
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setSaveToast(res.data.message || 'تم استرجاع النسخة الاحتياطية بنجاح!');
      setTimeout(() => setSaveToast(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'فشل استيراد النسخة الاحتياطية (تأكد من سلامة الملف)');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // AI Field Polish / Action
  const handleAIField = async (
    field: keyof ProfileInput,
    action: 'polish' | 'spellcheck' | 'summarize' | 'translate'
  ) => {
    const text = profileData[field];
    if (!text || !text.trim()) {
      alert('الحقل لا يحتوي على نص كافٍ للمعالجة');
      return;
    }

    setAiLoading(true);
    setCurrentTargetField(field);

    const actionLabels: Record<string, string> = {
      polish: 'تنقيح وصياغة أكاديمية',
      spellcheck: 'تدقيق إملائي ونحوي',
      summarize: 'اختصار وإيجاز أكاديمي',
      translate: 'ترجمة فورية'
    };

    try {
      const res = await api.post('/ai/process', {
        text,
        action,
        targetLang: action === 'translate' ? 'en' : 'ar',
        context: `حقل في التقرير النهائي: ${field}`
      });

      setDiffTitle(actionLabels[action] || 'معالجة النص');
      setOriginalText(text);
      setImprovedText(res.data.result);
      setDiffChunks(res.data.diff || []);
      setDiffModalOpen(true);
    } catch {
      alert('تعذر استدعاء المعالجة الذكية، يرجى المحاولة لاحقاً');
    } finally {
      setAiLoading(false);
    }
  };

  // Comprehensive AI Audit for All Sections
  const handleAuditAllSections = async () => {
    const fields: Array<keyof ProfileInput> = ['introText', 'entityIntroText', 'skillsText', 'conclusionText'];
    setAiLoading(true);

    try {
      const updated = { ...profileData };
      for (const f of fields) {
        const val = updated[f];
        if (val && val.trim()) {
          const res = await api.post('/ai/process', {
            text: val,
            action: 'spellcheck'
          });
          updated[f] = res.data.result;
        }
      }
      setProfileData(updated);
      saveProfileMutation.mutate(updated);
      setSaveToast('تم التدقيق الإملائي الشامل وحفظ النتائج بنجاح');
      setTimeout(() => setSaveToast(''), 3500);
    } catch {
      alert('تعذر إكمال التدقيق الشامل');
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-Translate Entire Report
  const handleAutoTranslateReport = async () => {
    const fields: Array<keyof ProfileInput> = ['introText', 'entityIntroText', 'skillsText', 'conclusionText'];
    const targetLang = currentLang === 'ar' ? 'en' : 'ar';
    setAiLoading(true);

    try {
      const updated = { ...profileData };
      for (const f of fields) {
        const val = updated[f];
        if (val && val.trim()) {
          const res = await api.post('/ai/process', {
            text: val,
            action: 'translate',
            targetLang
          });
          updated[f] = res.data.result;
        }
      }
      setProfileData(updated);
      saveProfileMutation.mutate(updated);
      setSaveToast(
        targetLang === 'en'
          ? 'تمت ترجمة التقرير بالكامل إلى الإنجليزية الأكاديمية بنجاح'
          : 'تمت ترجمة التقرير بالكامل إلى العربية بنجاح'
      );
      setTimeout(() => setSaveToast(''), 3500);
    } catch {
      alert('تعذر إكمال الترجمة الذاتية للتقرير');
    } finally {
      setAiLoading(false);
    }
  };

  // Export handlers
  const handleExportDocx = () => {
    window.open(`/api/reports/export/docx?lang=${currentLang}`, '_blank');
  };

  const handleExportHTML = () => {
    window.open(`/api/reports/export/html?lang=${currentLang}`, '_blank');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const pages = reportData?.estimatedPages || 1;
  const isTargetAchieved = pages >= 20;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <Check className="w-4 h-4 text-ok" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Backup Notification */}
      {backupNotice && (
        <div className="p-3.5 rounded-xl bg-ok-bg border border-ok/30 text-ok text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{backupNotice}</span>
        </div>
      )}

      {/* Hidden file input for backup restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      {/* Data Protection & Backup Toolbar Card */}
      <div className="bg-card border border-line rounded-2xl p-5 shadow-sm no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-ok-bg text-ok flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-ink">نظام حماية البيانات ومنع التلف نهائياً</h3>
            <p className="text-[11px] text-sub">
              نسخ احتياطي فوري ومحمي برمز تحقق رقمي SHA-256 لضمان سلامة كافة مدخلاتك الأكاديمية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-3 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
            title="تصدير أرشيف كامل لبياناتك بملف JSON مع رمز تحقق رقمي"
          >
            <Download className="w-3.5 h-3.5 text-ok" />
            <span>تصدير نسخة احتياطية آمنة</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
            title="استرجاع وتدقيق نسخة احتياطية سابقة"
          >
            <UploadCloud className="w-3.5 h-3.5 text-accent" />
            <span>استيراد نسخة احتياطية</span>
          </button>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-line">
          <div>
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-accent" />
              <span>بيانات الغلاف وأقسام التقرير النهائي</span>
            </h2>
            <p className="text-xs text-sub mt-0.5">
              تُحفظ هذه البيانات وتُدرج تلقائياً في الغلاف والمقدمة والخاتمة لملفات DOCX و PDF و HTML
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={aiLoading}
              onClick={handleAuditAllSections}
              className="px-3 py-1.5 text-xs font-bold text-ok bg-ok-bg hover:bg-ok-bg/80 rounded-xl border border-ok/30 transition-colors flex items-center gap-1.5"
              title="مراجعة وتدقيق إملائي ونحوي لكل الفقرات دفعة واحدة"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تدقيق شامل للفقرات</span>
            </button>

            <button
              type="button"
              disabled={aiLoading}
              onClick={handleAutoTranslateReport}
              className="px-3 py-1.5 text-xs font-bold text-accent bg-accent-dim hover:bg-accent-dim/80 rounded-xl border border-accent/20 transition-colors flex items-center gap-1.5"
              title="ترجمة ذاتية لجميع أقسام التقرير بدون أي تدخل يدوي"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>ترجمة ذاتية للتقرير كاملاً</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">اسم المتدرب</label>
              <input
                type="text"
                value={profileData.studentName}
                onChange={(e) => handleProfileChange('studentName', e.target.value)}
                placeholder="الاسم الثلاثي أو الرباعي"
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">الرقم التدريبي / الأكاديمي</label>
              <input
                type="text"
                value={profileData.trainingNumber}
                onChange={(e) => handleProfileChange('trainingNumber', e.target.value)}
                placeholder="مثال: 441098231"
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">القسم / التخصص</label>
              <input
                type="text"
                value={profileData.department}
                onChange={(e) => handleProfileChange('department', e.target.value)}
                placeholder="مثال: هندسة الحاسب والشبكات"
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">الوحدة التدريبية (الكلية/الجامعة)</label>
              <input
                type="text"
                value={profileData.trainingUnit}
                onChange={(e) => handleProfileChange('trainingUnit', e.target.value)}
                placeholder="مثال: كلية الاتصالات والمعلومات"
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">اسم المشرف الأكاديمي</label>
              <input
                type="text"
                value={profileData.supervisorName}
                onChange={(e) => handleProfileChange('supervisorName', e.target.value)}
                placeholder="اسم الدكتور أو المهندس المشرف"
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">المسؤول عن التدريب بالجهة</label>
              <input
                type="text"
                value={profileData.responsibleName}
                onChange={(e) => handleProfileChange('responsibleName', e.target.value)}
                placeholder="مشرفك في شركة هواوي"
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">عنوان جهة التدريب</label>
              <input
                type="text"
                value={profileData.entityAddress}
                onChange={(e) => handleProfileChange('entityAddress', e.target.value)}
                placeholder="هواوي السعودية"
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">عدد الموظفين تقريباً</label>
              <input
                type="text"
                value={profileData.employeesCount}
                onChange={(e) => handleProfileChange('employeesCount', e.target.value)}
                placeholder="مثال: +1000"
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Section 1: Intro */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-sub">المقدمة (أهمية التدريب التعاوني وأهدافه)</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('introText', 'polish')}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>تنقيح أكاديمي</span>
                </button>
                <span className="text-line">|</span>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('introText', 'spellcheck')}
                  className="text-[11px] font-bold text-ok hover:underline flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تصحيح</span>
                </button>
              </div>
            </div>
            <textarea
              value={profileData.introText}
              onChange={(e) => handleProfileChange('introText', e.target.value)}
              rows={3}
              className="w-full p-3 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent leading-relaxed"
            />
          </div>

          {/* Section 2: Entity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-sub">التعريف بجهة التدريب (شركة هواوي وطبيعة العمل)</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('entityIntroText', 'polish')}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>تنقيح أكاديمي</span>
                </button>
                <span className="text-line">|</span>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('entityIntroText', 'spellcheck')}
                  className="text-[11px] font-bold text-ok hover:underline flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تصحيح</span>
                </button>
              </div>
            </div>
            <textarea
              value={profileData.entityIntroText}
              onChange={(e) => handleProfileChange('entityIntroText', e.target.value)}
              rows={3}
              className="w-full p-3 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent leading-relaxed"
            />
          </div>

          {/* Section 3: Skills */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-sub">المعارف والمهارات والتجارب المكتسبة (ربطها بمقررات الكلية)</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('skillsText', 'polish')}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>تنقيح أكاديمي</span>
                </button>
                <span className="text-line">|</span>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('skillsText', 'spellcheck')}
                  className="text-[11px] font-bold text-ok hover:underline flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تصحيح</span>
                </button>
              </div>
            </div>
            <textarea
              value={profileData.skillsText}
              onChange={(e) => handleProfileChange('skillsText', e.target.value)}
              rows={3}
              className="w-full p-3 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent leading-relaxed"
            />
          </div>

          {/* Section 4: Conclusion */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-sub">الخاتمة والتوصيات العامة</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('conclusionText', 'polish')}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>تنقيح أكاديمي</span>
                </button>
                <span className="text-line">|</span>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('conclusionText', 'spellcheck')}
                  className="text-[11px] font-bold text-ok hover:underline flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تصحيح</span>
                </button>
              </div>
            </div>
            <textarea
              value={profileData.conclusionText}
              onChange={(e) => handleProfileChange('conclusionText', e.target.value)}
              rows={2}
              className="w-full p-3 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saveProfileMutation.isPending}
              className="px-6 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm text-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saveProfileMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ بيانات التقرير'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Page Estimate and Export Toolbar */}
      <div className="bg-card border border-line rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 ${
              isTargetAchieved ? 'bg-ok-bg text-ok border border-ok/30' : 'bg-accent-dim text-accent border border-accent/20'
            }`}
          >
            {isTargetAchieved ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>
              الحجم التقديري: {pages} صفحة تقريباً ({reportData?.wordCount || 0} كلمة)
            </span>
          </div>
          <span className="text-xs text-sub hidden md:inline">
            {isTargetAchieved ? 'يحقق معيار الـ 20 صفحة الأكاديمي' : 'المعيار المطلوب: 20 صفحة فأكثر'}
          </span>
        </div>

        {/* Multi-Format Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportDocx}
            className="px-3.5 py-2 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-all flex items-center gap-1.5 shadow-sm"
            title="تنزيل ملف Word (.docx) حقيقي مع فهرسة وإشارات مرجعية وروابط تنقل مباشرة بين الصفحات"
          >
            <Download className="w-4 h-4 text-accent" />
            <span>تنزيل Word مع الفهرسة الفعلية (.docx)</span>
          </button>

          <button
            onClick={handleExportHTML}
            className="px-3.5 py-2 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-all flex items-center gap-1.5 shadow-sm"
            title="تنزيل تقرير HTML مستقل أوفلاين مع روابط تنقل سلسة"
          >
            <FileCode className="w-4 h-4 text-ok" />
            <span>تنزيل HTML مستقل</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-2 text-xs font-bold text-white bg-accent hover:bg-accent/90 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            title="طباعة التقرير مباشرة أو حفظ كـ PDF بفواصل صفحات قياسية"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ PDF</span>
          </button>
        </div>
      </div>

      {/* Interactive Table of Contents (الفهرس التفاعلي للانتقال الفعلي) */}
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm no-print">
        <h3 className="text-sm font-extrabold text-accent flex items-center gap-2 pb-3 mb-3 border-b border-line">
          <Bookmark className="w-4 h-4" />
          <span>فهرس التقرير التفاعلي (انقر للانتقال المباشر للقسم أو الأسبوع)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-xs font-bold">
          <a href="#sec-cover" className="text-ink hover:text-accent transition-colors flex items-center gap-1.5">
            <span className="text-sub">•</span> صفحة الغلاف والبيانات الأساسية
          </a>
          <a href="#sec-intro" className="text-ink hover:text-accent transition-colors flex items-center gap-1.5">
            <span className="text-sub">•</span> 1. المقدمة وأهمية التدريب
          </a>
          <a href="#sec-entity" className="text-ink hover:text-accent transition-colors flex items-center gap-1.5">
            <span className="text-sub">•</span> 2. التعريف بجهة التدريب (هواوي)
          </a>
          <a href="#sec-timeline" className="text-ink hover:text-accent transition-colors flex items-center gap-1.5">
            <span className="text-sub">•</span> 3. الجدول الزمني الأسبوعي ({reportData?.weeks?.length || 0} أسبوع)
          </a>
          <a href="#sec-skills" className="text-ink hover:text-accent transition-colors flex items-center gap-1.5">
            <span className="text-sub">•</span> 4. المعارف والمهارات المكتسبة
          </a>
          <a href="#sec-conclusion" className="text-ink hover:text-accent transition-colors flex items-center gap-1.5">
            <span className="text-sub">•</span> 5. الخاتمة والتوصيات
          </a>
        </div>

        {/* Sub-links to individual weeks */}
        {reportData?.weeks && reportData.weeks.length > 0 && (
          <div className="mt-4 pt-3 border-t border-line">
            <div className="text-[11px] font-bold text-sub mb-2">الانتقال المباشر لأسابيع التدريب:</div>
            <div className="flex flex-wrap gap-2">
              {reportData.weeks.map((w) => (
                <a
                  key={w.weekIndex}
                  href={`#week-${w.weekIndex}`}
                  className="px-2.5 py-1 bg-bg hover:bg-accent-dim hover:text-accent rounded-lg text-[11px] font-bold text-ink border border-line transition-colors"
                >
                  الأسبوع {w.weekIndex} ({w.totalHours} س)
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Report Paper Preview Container (Printable Document) */}
      <div
        id="report-paper-view"
        className="bg-card border border-line rounded-2xl p-8 sm:p-12 shadow-sm leading-relaxed text-ink space-y-8 print-only-container"
      >
        {/* Cover Page */}
        <div id="sec-cover" className="text-center pb-10 border-b-2 border-line space-y-4">
          <div className="text-xs font-bold text-sub">المملكة العربية السعودية</div>
          <div className="text-sm font-bold text-ink">{profileData.trainingUnit || 'الوحدة التدريبية / الكلية'}</div>
          <h1 className="text-2xl sm:text-3xl font-black text-accent mt-4">
            التقرير النهائي للتدريب التعاوني (Co-op Report)
          </h1>
          <div className="text-base font-bold text-ink">
            جهة التدريب: {profileData.entityAddress || 'هواوي السعودية (Huawei Tech Saudi)'}
          </div>

          <div className="mt-8 max-w-xl mx-auto bg-bg border border-line rounded-xl p-5 text-right grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-bold text-sub">اسم المتدرب:</span> {profileData.studentName || '—'}
            </div>
            <div>
              <span className="font-bold text-sub">الرقم التدريبي:</span> {profileData.trainingNumber || '—'}
            </div>
            <div>
              <span className="font-bold text-sub">القسم / التخصص:</span> {profileData.department || '—'}
            </div>
            <div>
              <span className="font-bold text-sub">المشرف الأكاديمي:</span> {profileData.supervisorName || '—'}
            </div>
            <div>
              <span className="font-bold text-sub">المشرف الميداني:</span> {profileData.responsibleName || '—'}
            </div>
            <div>
              <span className="font-bold text-sub">إجمالي الساعات المعتمدة:</span> {reportData?.totalHours || 0} ساعة
            </div>
          </div>
        </div>

        {/* Section 1: Intro */}
        <div id="sec-intro" className="space-y-3 pt-4">
          <h2 className="text-lg font-extrabold text-ink border-b-2 border-accent pb-1.5 inline-block">
            1. المقدمة وأهداف التدريب
          </h2>
          <p className="text-sm text-ink leading-loose whitespace-pre-wrap">
            {profileData.introText || 'لم تُحدد المقدمة بعد.'}
          </p>
        </div>

        {/* Section 2: Entity */}
        <div id="sec-entity" className="space-y-3 pt-4">
          <h2 className="text-lg font-extrabold text-ink border-b-2 border-accent pb-1.5 inline-block">
            2. التعريف بجهة التدريب وطبيعة العمل
          </h2>
          <p className="text-sm text-ink leading-loose whitespace-pre-wrap">
            {profileData.entityIntroText || 'لم يُحدد التعريف بجهة التدريب بعد.'}
          </p>
          <div className="bg-bg border border-line rounded-lg p-3 text-xs text-sub flex flex-wrap gap-4 font-semibold">
            <span>العنوان: {profileData.entityAddress}</span>
            <span>عدد الموظفين تقريباً: {profileData.employeesCount || '—'}</span>
            <span>المسؤول: {profileData.responsibleName || '—'}</span>
          </div>
        </div>

        {/* Section 3: Detailed Timeline */}
        <div id="sec-timeline" className="space-y-6 pt-4 page-break">
          <h2 className="text-lg font-extrabold text-ink border-b-2 border-accent pb-1.5 inline-block">
            3. الخطة والجدول الزمني للتدريب الأسبوعي
          </h2>

          {!reportData?.weeks?.length ? (
            <p className="text-sm text-sub">لا توجد إدخالات أسبوعية مسجلة بعد.</p>
          ) : (
            reportData.weeks.map((w) => (
              <div key={w.weekIndex} id={`week-${w.weekIndex}`} className="border border-line rounded-xl overflow-hidden mb-6 page-break">
                <div className="bg-bg px-4 py-2.5 border-b border-line flex items-center justify-between text-xs font-bold text-ok">
                  <span>
                    الأسبوع {w.weekIndex} ({w.weekStart} — {w.weekEnd})
                  </span>
                  <span>
                    {w.totalHours} ساعة عمل | {w.entries.length} مهام منجزة
                  </span>
                </div>
                <div className="divide-y divide-line">
                  {w.entries.map((entry) => (
                    <div key={entry.id} className="p-4 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-ink">
                        <span>{entry.title}</span>
                        <span className="text-sub font-normal">
                          {formatDateArabic(entry.entryDate)} ({entry.timeFrom} - {entry.timeTo})
                        </span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-dim text-accent">
                        {entry.category}
                      </span>
                      <p className="text-sub leading-relaxed whitespace-pre-wrap pt-1">{entry.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Section 4: Skills */}
        <div id="sec-skills" className="space-y-3 pt-4 page-break">
          <h2 className="text-lg font-extrabold text-ink border-b-2 border-accent pb-1.5 inline-block">
            4. المعارف والمهارات والتجارب المكتسبة
          </h2>
          <p className="text-sm text-ink leading-loose whitespace-pre-wrap">
            {profileData.skillsText || 'لم تُحدد المهارات المكتسبة بعد.'}
          </p>
        </div>

        {/* Section 5: Conclusion */}
        <div id="sec-conclusion" className="space-y-3 pt-4 page-break">
          <h2 className="text-lg font-extrabold text-ink border-b-2 border-accent pb-1.5 inline-block">
            5. الخاتمة والتوصيات
          </h2>
          <p className="text-sm text-ink leading-loose whitespace-pre-wrap">
            {profileData.conclusionText || 'لم تُحدد الخاتمة بعد.'}
          </p>
        </div>
      </div>

      {/* Diff Modal */}
      <DiffModal
        isOpen={diffModalOpen}
        actionTitle={diffTitle}
        originalText={originalText}
        improvedText={improvedText}
        diffChunks={diffChunks}
        onAccept={() => {
          if (currentTargetField) {
            handleProfileChange(currentTargetField, improvedText);
          }
          setDiffModalOpen(false);
        }}
        onClose={() => setDiffModalOpen(false)}
      />
    </div>
  );
};
