import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { FinalReportData, EntryDTO, formatDateArabic, formatDateEnglish, calculateHoursBetween, generateAcademicWeeklySynthesis, formatWeekPeriod, ENTRY_CATEGORIES, elevateTaskTitle, normalizeStudentName, polishAcademicNarrative, convertBulletsToCohesiveParagraphs, isEntryStructuredQA } from '@coop/shared';
import { WeeklyEvidenceSection } from './WeeklyEvidenceSection';
import { Menu, MenuItem, MenuLabel, MenuSeparator } from '../ui/Menu';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { AgentAnalyseButton } from '../common/AgentAnalyseButton';
import { LEARNING_STATUS_LABELS, LearningStatus } from '@coop/shared';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Copy,
  Download,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  Edit3,
  Trash2,
  Plus,
  Sparkles,
  X,
  Save,
  CheckCircle,
  Languages,
  FileText,
  CheckCheck,
  Printer,
  RotateCcw,
  History,
  Building,
  GraduationCap,
  Award,
  Sun,
  Moon,
  Globe,
  ListChecks
} from 'lucide-react';
import { DiffModal } from '../common/DiffModal';
import { ProceduralNarrativeView } from '../common/ProceduralNarrativeView';

const CATEGORIES = ENTRY_CATEGORIES;

const formatCategory = (cat: string, isAr: boolean) => {
  if (isAr) return cat;
  const categoryMapArToEn: Record<string, string> = {
    'إجراءات الانضمام والتعريف ببيئة العمل': 'Onboarding & Workplace Orientation',
    'هندسة الشبكات وتراسل البيانات': 'Network Engineering & Data Transmission',
    'شبكات النفاذ والألياف الضوئية (FTTH)': 'Access Networks & Fiber Optics (FTTH)',
    'شبكات الاتصالات اللاسلكية والجيل الخامس (5G)': 'Wireless Telecom & 5G Networks',
    'إدارة الأعطال والتشغيل ومراقبة الأنظمة (NOC)': 'Incident Management, Operations & NOC',
    'أمن المعلومات والأمن السيبراني': 'Information Security & Cybersecurity',
    'الدعم الفني الميداني وصيانة النظم': 'Field Technical Support & Systems Maintenance',
    'تطوير وهندسة البرمجيات والأنظمة': 'Software & Systems Engineering',
    'الحوسبة السحابية وإدارة الخوادم': 'Cloud Computing & Server Administration',
    'الاجتماعات الفنية والتخطيط التشغيلي': 'Technical Meetings & Operational Planning',
    'التوثيق الهندسي وضبط الجودة': 'Engineering Documentation & Quality Control',
    'تطوير / برمجة': 'Development / Programming',
    'دعم فني': 'Technical Support',
    'اجتماعات': 'Meetings',
    'تدريب وتعلّم': 'Training & Learning',
    'توثيق': 'Documentation',
    'شبكات': 'Networking',
    'أنظمة': 'Systems',
    'أمن سيبراني': 'Cybersecurity',
    'صيانة ودعم فني': 'Maintenance & Technical Support',
    'برمجة وتطوير': 'Software Development',
    'إدارة مشاريع': 'Project Management',
    'قواعد بيانات': 'Databases',
    'أخرى': 'Other'
  };
  return categoryMapArToEn[cat] || cat;
};

const translateSectionHeader = (header: string, isAr: boolean) => {
  const clean = header.replace(/[:：]$/, '').trim();
  if (isAr) {
    const enToArMap: Record<string, string> = {
      'Executive Accomplishment Summary': 'موجز الإنجاز',
      'Field Accomplishment Summary': 'ملخص الإنجاز الميداني',
      'Training Summary': 'موجز الإنجاز الميداني',
      'Operational Objective': 'الهدف التشغيلي',
      'Operational Scope & Field Assignment': 'نطاق التكليف والمهمة الميدانية',
      'Operational Scope': 'نطاق التكليف',
      'Assignment Scope': 'نطاق التكليف',
      'Target Competency & Skill': 'الجدارة والمهارة المستهدفة',
      'Field Procedures & Technical Steps': 'الإجراءات والخطوات الميدانية',
      'Field Procedures': 'الإجراءات والخطوات الميدانية',
      'Technical Actions & Troubleshooting': 'الإجراءات والحلول الفنية',
      'Technical Actions': 'الإجراءات الفنية',
      'Technical Steps': 'الخطوات الفنية',
      'Field Practice & Practical Application': 'الممارسة والتطبيق الميداني',
      'Systems, Tools & Equipment Utilized': 'الأنظمة والأدوات المستخدمة',
      'Systems & Tools': 'الأنظمة والأدوات المستخدمة',
      'Systems & Technologies Utilized': 'الأنظمة والتقنيات المستخدمة',
      'Systems & Technologies': 'الأنظمة والتقنيات المستخدمة',
      'Applied Tools & Technical Concepts': 'الأدوات والمفاهيم التقنية المطبقة',
      'Applied Tools': 'الأدوات المطبقة',
      'Technical Outcomes & Deliverables': 'المخرجات والنتائج الفنية',
      'Technical Outcomes': 'المخرجات الفنية',
      'Deliverables': 'المخرجات الفنية',
      'Value Added & Business Impact': 'الأثر والقيمة المضافة',
      'Learning Outcomes & Self-Assessment': 'مخرجات التعلم والتقييم الذاتي',
      'Location': 'الموقع',
      'Period': 'الفترة',
      'Field Tasks & Activities': 'المهام والأنشطة الميدانية',
      'Challenges & Resolutions': 'التحديات والحلول',
      'Key Learnings & Knowledge Acquired': 'ما تم تعلمه اليوم',
      'Assigned Team': 'الفريق',
      'Department / Unit': 'القسم',
      'Phase / Milestone': 'المرحلة',
      'Conclusion': 'الخلاصة والنتائج'
    };
    return enToArMap[clean] || clean;
  }
  const headerMap: Record<string, string> = {
    'موجز الإنجاز': 'Executive Accomplishment Summary',
    'ملخص الإنجاز الميداني': 'Field Accomplishment Summary',
    'الهدف التشغيلي': 'Operational Objective',
    'نطاق التكليف والمهمة الميدانية': 'Operational Scope & Field Assignment',
    'نطاق التكليف': 'Assignment Scope',
    'الجدارة والمهارة المستهدفة': 'Target Competency & Skill',
    'الإجراءات والخطوات الميدانية': 'Field Procedures & Technical Steps',
    'الإجراءات والحلول الفنية': 'Technical Actions & Troubleshooting',
    'الممارسة والتطبيق الميداني': 'Field Practice & Practical Application',
    'الأنظمة والأدوات المستخدمة': 'Systems, Tools & Equipment Utilized',
    'الأنظمة والتقنيات المستخدمة': 'Systems & Technologies Utilized',
    'الأدوات والمفاهيم التقنية المطبقة': 'Applied Tools & Technical Concepts',
    'المخرجات والنتائج الفنية': 'Technical Outcomes & Deliverables',
    'الأثر والقيمة المضافة': 'Value Added & Business Impact',
    'مخرجات التعلم والتقييم الذاتي': 'Learning Outcomes & Self-Assessment',
    'الموقع': 'Location',
    'الفترة': 'Period',
    'المهام والأنشطة الميدانية': 'Field Tasks & Activities',
    'التحديات والحلول': 'Challenges & Resolutions',
    'ما تم تعلمه اليوم': 'Key Learnings & Knowledge Acquired',
    'فريق': 'Assigned Team',
    'قسم': 'Department / Unit',
    'مرحلة': 'Phase / Milestone',
    'الخلاصة': 'Conclusion'
  };
  return headerMap[clean] || clean;
};

export const WeeklyTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { lang, setLang, isAr, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [addWeekConfirm, setAddWeekConfirm] = useState<boolean>(false);
  const [downloadingPptx, setDownloadingPptx] = useState<boolean>(false);
  const [downloadingDocx, setDownloadingDocx] = useState<boolean>(false);
  const [isAuditingWeek, setIsAuditingWeek] = useState<boolean>(false);
  const [isTranslatingWeek, setIsTranslatingWeek] = useState<boolean>(false);

  // Report Mode: Weekly Scheduled vs Custom Date Range
  const [reportMode, setReportMode] = useState<'weekly' | 'custom'>('weekly');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Logo file upload refs for Cover Page
  const institutionLogoInputRef = useRef<HTMLInputElement>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);

  // Edit / Add Day Modal State
  const [editingEntry, setEditingEntry] = useState<Partial<EntryDTO> | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [aiPolishing, setAiPolishing] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string>('');
  const [errorToast, setErrorToast] = useState<string>('');
  const [revisionsModalOpen, setRevisionsModalOpen] = useState<boolean>(false);
  const [activeEntryForRevisions, setActiveEntryForRevisions] = useState<any>(null);
  const [entryRevisionsList, setEntryRevisionsList] = useState<any[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch final report to get the full academic schedule of all 14 weeks
  const { data: finalReportData } = useQuery<FinalReportData>({
    queryKey: ['finalReport'],
    queryFn: async () => {
      const res = await api.get('/reports/final');
      return res.data;
    }
  });

  const weeksList = finalReportData?.weeks || [];
  const entityName = finalReportData?.profile?.entityAddress || (isAr ? 'جهة التدريب' : 'Host Organization');

  // Set default selected week to first week or current active
  useEffect(() => {
    if (weeksList.length > 0 && !selectedWeek) {
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
  const currentIndex = weeksList.findIndex((w) => w.weekStart === selectedWeek);
  const prevWeek = currentIndex > 0 ? weeksList[currentIndex - 1] : null;
  const nextWeek = currentIndex < weeksList.length - 1 && currentIndex !== -1 ? weeksList[currentIndex + 1] : null;

  // Direct Logo Upload Handler from Cover Page
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'institutionLogo' | 'companyLogo') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      if (finalReportData?.profile) {
        const updatedProfile = { ...finalReportData.profile, [field]: base64 };
        try {
          await api.put('/profile', updatedProfile);
          queryClient.invalidateQueries({ queryKey: ['finalReport'] });
          setSaveToast(
            field === 'institutionLogo'
              ? t('تم تحديث وحفظ شعار الكلية / المؤسسة بنجاح', 'Institution logo updated')
              : t('تم تحديث وحفظ شعار جهة التدريب بنجاح', 'Company logo updated')
          );
          setTimeout(() => setSaveToast(''), 3000);
        } catch {
          setErrorToast(t('تعذر تحديث الشعار', 'Failed to update logo'));
          setTimeout(() => setErrorToast(''), 3000);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Dynamic Week Increment Handler
  const [addingWeek, setAddingWeek] = useState<boolean>(false);
  const handleAddWeek = async () => {
    try {
      setAddingWeek(true);
      const currentWeeks = finalReportData?.profile?.trainingWeeks || weeksList.length || 14;
      const nextWeeks = currentWeeks + 1;
      await api.put('/profile', {
        ...(finalReportData?.profile || {}),
        trainingWeeks: nextWeeks
      });
      await queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      setSaveToast(t(`تمت إضافة الأسبوع التدريبي ${nextWeeks} بنجاح!`, `Week ${nextWeeks} added successfully!`));
      setTimeout(() => setSaveToast(''), 3500);
    } catch {
      setErrorToast(t('تعذر إضافة أسبوع تدريبي جديد', 'Failed to add week'));
      setTimeout(() => setErrorToast(''), 3000);
    } finally {
      setAddingWeek(false);
    }
  };

  // Aggregated entries for Custom Date Range mode vs Scheduled Weekly mode
  const allDocumentedEntries: EntryDTO[] = (finalReportData?.weeks || []).flatMap((w) => w.entries || []);

  const filteredCustomEntries = allDocumentedEntries
    .filter((e) => {
      if (!customStartDate && !customEndDate) return true;
      if (customStartDate && e.entryDate < customStartDate) return false;
      if (customEndDate && e.entryDate > customEndDate) return false;
      return true;
    })
    .sort((a, b) => a.entryDate.localeCompare(b.entryDate));

  const activeEntries: EntryDTO[] = reportMode === 'custom'
    ? filteredCustomEntries
    : (weekReport?.entries || []);

  const activeStructuredCount = activeEntries.filter((e) => isEntryStructuredQA(e.description)).length;
  const activeFreeformCount = activeEntries.length - activeStructuredCount;

  const activeTotalHours = activeEntries.reduce((acc, e) => {
    return acc + calculateHoursBetween(e.timeFrom || '08:00', e.timeTo || '16:00');
  }, 0);

  const activeTotalDays = new Set(activeEntries.map((e) => e.entryDate)).size;

  const customPeriodLabel = (customStartDate && customEndDate)
    ? (isAr
        ? `من ${formatDateArabic(customStartDate)} إلى ${formatDateArabic(customEndDate)}`
        : `From ${formatDateEnglish(customStartDate)} to ${formatDateEnglish(customEndDate)}`)
    : (isAr ? 'كامل الفترة التدريبية المحددة' : 'All Specified Period');

  const customEvidenceList = (finalReportData?.weeks || [])
    .filter((w) => {
      if (!customStartDate && !customEndDate) return true;
      if (customStartDate && w.weekEnd < customStartDate) return false;
      if (customEndDate && w.weekStart > customEndDate) return false;
      return true;
    })
    .flatMap((w) => w.evidence || []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const handleCopyText = () => {
    const periodStr = reportMode === 'custom'
      ? customPeriodLabel
      : (weekReport ? formatWeekPeriod(weekReport, isAr) : '—');

    let text = isAr
      ? `تقرير التدريب الميداني: ${periodStr}\nجهة التدريب: ${entityName}\n\n`
      : `Field Training Report: ${periodStr}\nOrganization: ${entityName}\n\n`;

    if (activeEntries?.length) {
      activeEntries.forEach((e: EntryDTO) => {
        const d = isAr ? formatDateArabic(e.entryDate) : formatDateEnglish(e.entryDate);
        text += `• ${d}: ${elevateTaskTitle(e.title, e.description)} [${e.category}]\n  ${e.description}\n\n`;
      });
      text += isAr
        ? `إجمالي الأيام: ${activeTotalDays} | عدد المهام المنجزة: ${activeEntries.length} | الساعات: ${activeTotalHours}`
        : `Total Days: ${activeTotalDays} | Tasks: ${activeEntries.length} | Hours: ${activeTotalHours}`;
    } else {
      text += isAr ? `(لا توجد مهام مسجلة في هذه الفترة)` : `(No tasks recorded in this period)`;
    }

    const done = () => {
      setSaveToast(t('تم نسخ النص', 'Text copied'));
      setTimeout(() => setSaveToast(''), 2000);
    };
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      ok ? done() : setErrorToast(t('تعذر النسخ تلقائياً', 'Could not copy automatically'));
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  };

  const handleDownloadMarkdown = () => {
    const periodStr = reportMode === 'custom'
      ? customPeriodLabel
      : (weekReport ? formatWeekPeriod(weekReport, isAr) : '—');

    let md = `# ${isAr ? 'تقرير التدريب الميداني' : 'Field Training Report'} (${periodStr})\n\n`;
    md += `**${isAr ? 'الجهة:' : 'Organization:'}** ${entityName}  \n`;
    md += `**${isAr ? 'أيام العمل:' : 'Work Days:'}** ${activeTotalDays}  \n`;
    md += `**${isAr ? 'إجمالي الساعات:' : 'Total Hours:'}** ${activeTotalHours}  \n`;
    md += `**${isAr ? 'المهام المنجزة:' : 'Completed Tasks:'}** ${activeEntries.length}  \n\n`;
    md += `## ${isAr ? 'جدول المهام والإنجازات الميدانية' : 'Field Technical Tasks'}\n\n`;
    md += `| ${isAr ? 'التاريخ' : 'Date'} | ${isAr ? 'العنوان' : 'Title'} | ${isAr ? 'التصنيف' : 'Category'} | ${isAr ? 'الساعات' : 'Hours'} | ${isAr ? 'تفاصيل الإنجاز والسرد الأكاديمي' : 'Details'} |\n`;
    md += `|---|---|---|---|---|\n`;

    if (activeEntries.length) {
      activeEntries.forEach((e: EntryDTO) => {
        const d = isAr ? formatDateArabic(e.entryDate) : formatDateEnglish(e.entryDate);
        const h = calculateHoursBetween(e.timeFrom || '08:00', e.timeTo || '16:00');
        md += `| ${d} | ${elevateTaskTitle(e.title, e.description)} | ${e.category} | ${h} | ${e.description.replace(/\n/g, ' ')} |\n`;
      });
    } else {
      md += `| — | ${isAr ? 'لا توجد مهام موثقة في هذه الفترة' : 'No documented tasks'} | — | — | — |\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = reportMode === 'custom' ? `Custom_Training_Report.md` : `Weekly_Report_${selectedWeek}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocx = async () => {
    try {
      setDownloadingDocx(true);
      const res = await api.get(`/reports/weekly/export/docx?week=${selectedWeek}&lang=${lang}`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Weekly_Report_${currentWeekObj ? currentWeekObj.weekIndex : selectedWeek}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert(t('تعذر تحميل مستند Word للأسبوع، يرجى المحاولة لاحقاً', 'Failed to export weekly Word report.'));
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleAuditPolishWeek = async () => {
    if (!weekReport?.entries?.length) return;
    try {
      setIsAuditingWeek(true);
      const res = await api.post(`/reports/weekly/audit-polish?week=${selectedWeek}`);
      queryClient.invalidateQueries({ queryKey: ['weekly', selectedWeek] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setSaveToast(res.data.message || t('تم تدقيق وإعادة صياغة الأسبوع وترقية تصنيفاته بنجاح!', 'Weekly tasks polished and classified!'));
      setTimeout(() => setSaveToast(''), 4000);
    } catch {
      setErrorToast(t('تعذر تدقيق وإعادة صياغة مهام الأسبوع، يرجى المحاولة لاحقاً', 'Failed to audit week'));
      setTimeout(() => setErrorToast(''), 3500);
    } finally {
      setIsAuditingWeek(false);
    }
  };

  // AI-powered Report Content Translation between Arabic and English (Zero Data Loss with Revisions)
  const handleTranslateWeekEntries = async (targetLang: 'ar' | 'en') => {
    if (!activeEntries || activeEntries.length === 0) {
      setErrorToast(t('لا توجد مهام أو سجلات في هذه الفترة لترجمتها', 'No tasks to translate in this period'));
      setTimeout(() => setErrorToast(''), 3000);
      return;
    }

    const confirmMsg = targetLang === 'en'
      ? (isAr
          ? `هل تريد ترجمة محتوى مهام هذا التقرير (${activeEntries.length} مهمة) بالكامل إلى اللغة الإنجليزية بالذكاء الاصطناعي؟\n\n• تشمل الترجمة: عناوين المهام، السرد الفني، والتصنيفات الهندسية.\n• سيتم تلقائياً حفظ نسخة احتياطية لكافة السجلات في سجل التعديلات (Revisions) مع إمكانية التراجع بأي وقت.`
          : `Translate all ${activeEntries.length} tasks in this report to English via AI?\n\n• Translates titles, technical descriptions, and categories.\n• Automatic revision backups are saved to ensure zero data loss.`)
      : (isAr
          ? `هل تريد ترجمة محتوى مهام هذا التقرير (${activeEntries.length} مهمة) بالكامل إلى اللغة العربية بالذكاء الاصطناعي؟\n\n• تشمل الترجمة: عناوين المهام، السرد الفني، والتصنيفات الهندسية.\n• سيتم تلقائياً حفظ نسخة احتياطية لكافة السجلات في سجل التعديلات (Revisions) مع إمكانية التراجع بأي وقت.`
          : `Translate all ${activeEntries.length} tasks in this report to Arabic via AI?\n\n• Translates titles, technical descriptions, and categories.\n• Automatic revision backups are saved to ensure zero data loss.`);

    if (!window.confirm(confirmMsg)) return;

    try {
      setIsTranslatingWeek(true);
      const payload = reportMode === 'custom'
        ? { entryIds: activeEntries.map((e) => e.id), targetLang }
        : { week: selectedWeek, targetLang };

      const res = await api.post('/reports/weekly/translate', payload);

      setLang(targetLang);

      await queryClient.invalidateQueries({ queryKey: ['weekly', selectedWeek] });
      await queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      await queryClient.invalidateQueries({ queryKey: ['entries'] });

      setSaveToast(
        res.data?.message ||
          (targetLang === 'en'
            ? 'تمت ترجمة محتوى التقرير إلى الإنجليزية بنجاح مع حفظ نسخة احتياطية!'
            : 'تمت ترجمة محتوى التقرير إلى العربية بنجاح مع حفظ نسخة احتياطية!')
      );
      setTimeout(() => setSaveToast(''), 4500);
    } catch (err: any) {
      setErrorToast(err?.response?.data?.error || t('تعذر ترجمة محتوى التقرير، يرجى المحاولة لاحقاً', 'Failed to translate report content'));
      setTimeout(() => setErrorToast(''), 3500);
    } finally {
      setIsTranslatingWeek(false);
    }
  };

  const handleSwitchLangWithPrompt = (newLang: 'ar' | 'en') => {
    setLang(newLang);
    if (newLang === 'en' && activeEntries.some((e) => /[\u0600-\u06FF]/.test(e.description || ''))) {
      if (window.confirm('تم تحويل الواجهة والترويسات إلى الإنجليزية.\n\nهل تريد أيضاً ترجمة محتوى التقرير الفعلي (نصوص المهام والسرد الأكاديمي) بالكامل إلى اللغة الإنجليزية بالذكاء الاصطناعي؟\n(مضمون بدون أي فقدان للبيانات مع حفظ نسخة احتياطية في سجل التعديلات)')) {
        handleTranslateWeekEntries('en');
      }
    } else if (newLang === 'ar' && activeEntries.some((e) => /^[A-Za-z]/.test(e.description?.trim() || ''))) {
      if (window.confirm('تم تحويل الواجهة والترويسات إلى العربية.\n\nهل تريد أيضاً ترجمة محتوى التقرير الفعلي (نصوص المهام والسرد الأكاديمي) بالكامل إلى اللغة العربية بالذكاء الاصطناعي؟')) {
        handleTranslateWeekEntries('ar');
      }
    }
  };

  const handleDownloadPresentation = async () => {
    try {
      setDownloadingPptx(true);
      const res = await api.get('/reports/export/presentation', { responseType: 'blob' });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `عرض_مناقشة_${entityName.replace(/\s+/g, '_')}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert(t('تعذر تحميل عرض PowerPoint، يرجى المحاولة لاحقاً', 'Unable to download PowerPoint presentation.'));
    } finally {
      setDownloadingPptx(false);
    }
  };

  // Open Edit Modal for existing entry
  const handleOpenEdit = (entry: EntryDTO) => {
    setEditingEntry({
      id: entry.id,
      title: entry.title,
      entryDate: entry.entryDate,
      category: entry.category,
      timeFrom: entry.timeFrom || '08:00',
      timeTo: entry.timeTo || '16:00',
      description: entry.description
    });
    const isCustom = entry.category && !CATEGORIES.includes(entry.category as any);
    setIsCustomCategory(!!isCustom);
    setCustomCategory(isCustom ? (entry.category as string) : '');
    setIsEditModalOpen(true);
  };

  // Open Modal to Add a new Day/Task for the current week
  const handleOpenAddDay = () => {
    setEditingEntry({
      title: '',
      entryDate: selectedWeek || new Date().toISOString().split('T')[0],
      category: 'تطوير / برمجة',
      timeFrom: '08:00',
      timeTo: '16:00',
      description: ''
    });
    setIsCustomCategory(false);
    setCustomCategory('');
    setIsEditModalOpen(true);
  };

  // Save changes to backend
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry?.title?.trim() || !editingEntry?.description?.trim()) {
      setErrorToast(t('يرجى كتابة عنوان المهمة والتفاصيل اليومية', 'Please enter task title and description'));
      setTimeout(() => setErrorToast(''), 3000);
      return;
    }
    if (isCustomCategory && !customCategory.trim()) {
      setErrorToast(t('يرجى كتابة اسم التصنيف المخصص أو اختيار تصنيف من القائمة', 'Please enter a custom category name'));
      setTimeout(() => setErrorToast(''), 3000);
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : (editingEntry.category || 'تطوير / برمجة');
    const entryPayload = {
      ...editingEntry,
      category: finalCategory
    };

    try {
      if (entryPayload.id) {
        await api.put(`/entries/${entryPayload.id}`, entryPayload);
      } else {
        await api.post('/entries', entryPayload);
      }
      queryClient.invalidateQueries({ queryKey: ['weekly', selectedWeek] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setSaveToast(t('تم حفظ وتحديث السجل الميداني بنجاح', 'Task saved and updated successfully'));
      setTimeout(() => setSaveToast(''), 3500);
      setIsEditModalOpen(false);
      setEditingEntry(null);
    } catch {
      setErrorToast(t('تعذر حفظ التعديل، يرجى المحاولة لاحقاً', 'Failed to save changes'));
      setTimeout(() => setErrorToast(''), 3500);
    }
  };

  // Delete an entry
  const handleDeleteEntry = async (id: number) => {
    if (!window.confirm(t('هل أنت متأكد من حذف هذه المهمة من سجل الأسبوع؟', 'Are you sure you want to delete this task?'))) return;
    try {
      await api.delete(`/entries/${id}`);
      queryClient.invalidateQueries({ queryKey: ['weekly', selectedWeek] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setSaveToast(t('تم حذف المهمة من سجل الأسبوع', 'Task deleted successfully'));
      setTimeout(() => setSaveToast(''), 3000);
    } catch {
      setErrorToast(t('تعذر حذف المهمة', 'Failed to delete task'));
      setTimeout(() => setErrorToast(''), 3000);
    }
  };

  // Rollback revision mutation
  const rollbackMutation = useMutation({
    mutationFn: async ({ entryId, revId }: { entryId: number; revId: number }) => {
      const res = await api.post(`/entries/${entryId}/revisions/${revId}/rollback`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly', selectedWeek] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setRevisionsModalOpen(false);
      setSaveToast(t('تم التراجع عن التعديل واستعادة النسخة السابقة بنجاح!', 'Rolled back to previous revision!'));
      setTimeout(() => setSaveToast(''), 3000);
    },
    onError: () => {
      setErrorToast(t('تعذر التراجع عن التعديل واستعادة النسخة', 'Failed to roll back'));
      setTimeout(() => setErrorToast(''), 3000);
    }
  });

  const handleOpenRevisions = async (entry: any) => {
    setActiveEntryForRevisions(entry);
    setRevisionsModalOpen(true);

    // Instant offline/cached fallback so revisions display immediately
    const cacheKey = `coop_entry_revs_${entry.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setEntryRevisionsList(JSON.parse(cached));
      } catch {}
    }

    try {
      const res = await api.get(`/entries/${entry.id}/revisions`);
      const revs = res.data.revisions || [];
      setEntryRevisionsList(revs);
      localStorage.setItem(cacheKey, JSON.stringify(revs));
    } catch {
      if (!cached) {
        setErrorToast(t('تعذر تحميل سجل التعديلات من الخادم', 'Failed to load revisions from server'));
        setTimeout(() => setErrorToast(''), 3000);
      }
    }
  };

  // Helper to render procedural narrative with classified sections or cohesive paragraphs
  const renderProceduralNarrative = (rawText: string, entryTimeFrom?: string) => {
    if (!rawText) return null;
    return (
      <ProceduralNarrativeView
        rawText={rawText}
        isAr={isAr}
        defaultLocation={entityName}
        defaultPeriod={entryTimeFrom && parseInt(entryTimeFrom.split(':')[0], 10) >= 13 ? (isAr ? 'مسائيًا' : 'Evening') : (isAr ? 'صباحًا' : 'Morning')}
      />
    );
  };

  // AI Enhancement State for Day Editing Modal
  const [diffModalOpen, setDiffModalOpen] = useState<boolean>(false);
  const [diffTitle, setDiffTitle] = useState<string>('');
  const [originalText, setOriginalText] = useState<string>('');
  const [improvedText, setImprovedText] = useState<string>('');
  const [diffChunks, setDiffChunks] = useState<any[]>([]);

  // AI Actions Handler (Polish, Spellcheck, Summarize, Translate)
  const handleAIAction = async (action: 'polish' | 'spellcheck' | 'summarize' | 'translate') => {
    if (!editingEntry?.description?.trim()) return;
    setAiPolishing(true);

    const actionTitles: Record<string, string> = {
      polish: t('تنقيح وصياغة أكاديمية رصينة', 'Academic Polishing & Refinement'),
      spellcheck: t('تصحيح إملائي ونحوي دقيق', 'Grammar & Spell Check'),
      summarize: t('اختصار وإيجاز فني مكثف', 'Concise Technical Summary'),
      translate: t('ترجمة فورية للإنجليزية الأكاديمية', 'Academic English Translation')
    };

    const activeCat = isCustomCategory ? (customCategory.trim() || 'أخرى') : (editingEntry.category || '');

    try {
      const res = await api.post('/ai/process', {
        text: editingEntry.description,
        action,
        targetLang: action === 'translate' ? (isAr ? 'en' : 'ar') : 'ar',
        context: `Task: ${editingEntry.title || ''} | Category: ${activeCat}`
      });

      setDiffTitle(actionTitles[action] || t('معالجة النص', 'Text Processing'));
      setOriginalText(editingEntry.description);
      setImprovedText(res.data.result);
      setDiffChunks(res.data.diff || []);
      setDiffModalOpen(true);
    } catch {
      setErrorToast(t('تعذر معالجة النص ذكياً، يرجى المحاولة لاحقاً', 'AI processing failed'));
      setTimeout(() => setErrorToast(''), 3000);
    } finally {
      setAiPolishing(false);
    }
  };

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Save / Error Toasts */}
      {saveToast && (
        <div className="fixed bottom-5 left-5 z-50 bg-ok text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed bottom-5 left-5 z-50 bg-warn text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <span>{errorToast}</span>
        </div>
      )}

      <div className="bg-card border border-line rounded-2xl p-4 sm:p-6 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:bg-transparent">
        {/* Header: title + the three actions that matter (agent · export · print) */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 mb-4 border-b border-line no-print">
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              <span>{t('التقرير الأسبوعي', 'Weekly Report')}</span>
            </h2>
            <p className="text-xs text-sub mt-1 max-w-xl">
              {t(
                'راجع أيام الأسبوع، أضف الصور التوثيقية، ثم دع الوكيل الذكي يحوّل يومياتك إلى تقرير واضح للقارئ قبل الطباعة أو التصدير.',
                'Review the week, add evidence photos, then let the AI agent turn your daily notes into a clear report before printing or exporting.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <AgentAnalyseButton
              entryIds={activeEntries.map((e) => e.id)}
              pending={activeEntries.filter((e) => { const ins = (finalReportData?.weeks || []).flatMap((w) => w.entries).find((x) => x.id === e.id)?.insight; return !ins || ins.isStale; }).length}
            />

            <Menu
              width="w-72"
              label={t('تصدير', 'Export')}
              trigger={({ open, triggerProps }) => (
                <button
                  {...triggerProps}
                  className="px-3 py-2 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
                >
                  {downloadingDocx || downloadingPptx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-accent" />}
                  <span>{t('تصدير', 'Export')}</span>
                  <ChevronDown className={`w-3 h-3 text-sub transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
              )}
            >
              {(close) => (
                <>
                  <MenuLabel>{reportMode === 'weekly' ? t('هذا الأسبوع', 'This week') : t('الفترة المحددة', 'Selected period')}</MenuLabel>
                  <MenuItem
                    icon={<FileText className="w-4 h-4" />}
                    label={t('مستند Word (.docx)', 'Word document (.docx)')}
                    hint={reportMode === 'weekly' ? t('جدول المهام وخانات التوقيع', 'Task table and signature boxes') : t('متاح للأسبوع المجدول فقط', 'Available for scheduled weeks only')}
                    disabled={downloadingDocx || reportMode !== 'weekly'}
                    onClick={handleDownloadDocx}
                    close={close}
                  />
                  <MenuItem icon={<Copy className="w-4 h-4" />} label={t('نسخ النص', 'Copy as text')} hint={t('للصق في أي مستند أو رسالة', 'Paste anywhere')} onClick={handleCopyText} close={close} />
                  <MenuItem icon={<Download className="w-4 h-4" />} label="Markdown (.md)" onClick={handleDownloadMarkdown} close={close} />
                  <MenuSeparator />
                  <MenuLabel>{t('التدريب كاملاً', 'Entire training')}</MenuLabel>
                  <MenuItem
                    icon={<Download className="w-4 h-4" />}
                    label={t('عرض مناقشة PowerPoint (.pptx)', 'Defence slides PowerPoint (.pptx)')}
                    hint={t('شرائح لكل التدريب وليس لهذا الأسبوع فقط', 'Covers all weeks, not only this one')}
                    disabled={downloadingPptx}
                    onClick={handleDownloadPresentation}
                    close={close}
                  />
                </>
              )}
            </Menu>

            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-3.5 py-2 text-xs font-bold text-bg bg-ink hover:opacity-90 rounded-xl transition-opacity flex items-center gap-1.5 shadow-sm"
              title={t('طباعة تقرير الأسبوع أو حفظه كملف PDF', 'Print the weekly report or save it as PDF')}
            >
              <Printer className="w-4 h-4" />
              <span>{t('طباعة / PDF', 'Print / PDF')}</span>
            </button>
          </div>
        </div>

        {/* Scope: scheduled week (navigator) or custom period */}
        <div className="no-print mb-5 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="inline-flex p-0.5 bg-bg border border-line rounded-xl text-xs font-bold self-start" role="group" aria-label={t('نطاق التقرير', 'Report scope')}>
              <button
                type="button"
                aria-pressed={reportMode === 'weekly'}
                onClick={() => setReportMode('weekly')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors ${reportMode === 'weekly' ? 'bg-accent text-white shadow-xs' : 'text-sub hover:text-ink'}`}
              >
                {t('أسبوع مجدول', 'Scheduled week')}
              </button>
              <button
                type="button"
                aria-pressed={reportMode === 'custom'}
                onClick={() => {
                  setReportMode('custom');
                  if (!customStartDate && allDocumentedEntries.length > 0) {
                    const sorted = [...allDocumentedEntries].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
                    setCustomStartDate(sorted[0].entryDate);
                    setCustomEndDate(sorted[sorted.length - 1].entryDate);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-colors ${reportMode === 'custom' ? 'bg-accent text-white shadow-xs' : 'text-sub hover:text-ink'}`}
              >
                {t('فترة مخصصة', 'Custom period')}
              </button>
            </div>

            {reportMode === 'weekly' ? (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={!prevWeek}
                  onClick={() => prevWeek && setSelectedWeek(prevWeek.weekStart)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-line bg-bg hover:bg-line text-ink disabled:opacity-35 transition-colors"
                  aria-label={t('الأسبوع السابق', 'Previous week')}
                  title={prevWeek ? t(`الأسبوع ${prevWeek.weekIndex}`, `Week ${prevWeek.weekIndex}`) : ''}
                >
                  {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <Menu
                  width="w-80"
                  align="start"
                  label={t('اختيار الأسبوع', 'Choose week')}
                  trigger={({ open, triggerProps }) => (
                    <button
                      {...triggerProps}
                      className="min-w-[13rem] px-3.5 h-9 flex items-center justify-between gap-3 rounded-xl border border-line bg-bg hover:border-line-strong transition-colors"
                    >
                      <span className="text-start">
                        <span className="block text-xs font-extrabold text-ink leading-tight">
                          {t(`الأسبوع ${currentWeekObj?.weekIndex ?? '—'}`, `Week ${currentWeekObj?.weekIndex ?? '—'}`)}
                        </span>
                        <span className="block text-[10.5px] text-sub leading-tight">{weekReport ? formatWeekPeriod(weekReport, isAr) : '—'}</span>
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-sub transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                >
                  {(close) => (
                    <div className="max-h-80 overflow-y-auto">
                      {weeksList.map((w) => {
                        const n = w.entries?.length || 0;
                        return (
                          <MenuItem
                            key={w.weekIndex}
                            label={t(`الأسبوع ${w.weekIndex}`, `Week ${w.weekIndex}`)}
                            hint={
                              n
                                ? t(`${n} مهام · ${w.totalHours} ساعة${w.evidence?.length ? ` · ${w.evidence.length} صور` : ''}`, `${n} tasks · ${w.totalHours} h${w.evidence?.length ? ` · ${w.evidence.length} photos` : ''}`)
                                : t('فارغ', 'Empty')
                            }
                            checked={w.weekStart === selectedWeek}
                            onClick={() => setSelectedWeek(w.weekStart)}
                            close={close}
                          />
                        );
                      })}
                      <MenuSeparator />
                      <MenuItem icon={<Plus className="w-4 h-4" />} label={t('إضافة أسبوع إلى خطة التدريب', 'Add a week to the training plan')} onClick={() => setAddWeekConfirm(true)} close={close} />
                    </div>
                  )}
                </Menu>

                <button
                  type="button"
                  disabled={!nextWeek}
                  onClick={() => nextWeek && setSelectedWeek(nextWeek.weekStart)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-line bg-bg hover:bg-line text-ink disabled:opacity-35 transition-colors"
                  aria-label={t('الأسبوع التالي', 'Next week')}
                  title={nextWeek ? t(`الأسبوع ${nextWeek.weekIndex}`, `Week ${nextWeek.weekIndex}`) : ''}
                >
                  {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {currentWeekObj && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      currentWeekObj.status === 'completed' ? 'bg-ok-bg text-ok' : currentWeekObj.status === 'in_progress' ? 'bg-accent-dim text-accent' : 'bg-warn-bg text-warn'
                    }`}
                  >
                    {currentWeekObj.status === 'completed' ? t('مكتمل', 'Completed') : currentWeekObj.status === 'in_progress' ? t('قيد التنفيذ', 'In progress') : t('بلا مهام', 'No tasks')}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-end gap-2 flex-wrap">
                <label className="text-[11px] font-bold text-sub space-y-1">
                  <span className="block">{t('من', 'From')}</span>
                  <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="px-3 py-1.5 bg-bg border border-line rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-accent" />
                </label>
                <label className="text-[11px] font-bold text-sub space-y-1">
                  <span className="block">{t('إلى', 'To')}</span>
                  <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="px-3 py-1.5 bg-bg border border-line rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-accent" />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (allDocumentedEntries.length > 0) {
                      const sorted = [...allDocumentedEntries].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
                      setCustomStartDate(sorted[0].entryDate);
                      setCustomEndDate(sorted[sorted.length - 1].entryDate);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-bg hover:bg-line border border-line text-ink"
                >
                  {t('كل التدريب', 'Whole training')}
                </button>
              </div>
            )}
          </div>

          {/* Summary: numbers + the agent's learning classification for this scope */}
          {(() => {
            const byId = new Map((finalReportData?.weeks || []).flatMap((w) => w.entries).map((e) => [e.id, e.insight]));
            const counts: Record<LearningStatus, number> = { new: 0, reinforced: 0, routine: 0 };
            let analysed = 0;
            for (const e of activeEntries) {
              const ins = byId.get(e.id);
              if (ins) {
                counts[ins.learningStatus]++;
                analysed++;
              }
            }
            return (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 rounded-xl bg-bg border border-line text-xs">
                <span className="font-bold text-sub">
                  <b className="text-ink text-sm">{activeTotalDays}</b> {t('أيام', 'days')}
                </span>
                <span className="font-bold text-sub">
                  <b className="text-ink text-sm">{activeEntries.length}</b> {t('مهمة', 'tasks')}
                </span>
                <span className="font-bold text-sub">
                  <b className="text-ok text-sm">{activeTotalHours}</b> {t('ساعة', 'hours')}
                </span>
                {reportMode === 'custom' && <span className="text-sub">{customPeriodLabel}</span>}
                <span className="flex-1" />
                {analysed > 0 ? (
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sub font-bold">{t('تحليل الوكيل:', 'Agent analysis:')}</span>
                    {(['new', 'reinforced', 'routine'] as LearningStatus[]).map((st) => (
                      <span key={st} className={`insight-badge insight-badge-${st} insight-badge-compact`}>
                        {LEARNING_STATUS_LABELS[st][isAr ? 'ar' : 'en']}: {counts[st]}
                      </span>
                    ))}
                    {analysed < activeEntries.length && <span className="text-warn font-bold">{t(`${activeEntries.length - analysed} بلا تحليل`, `${activeEntries.length - analysed} not analysed`)}</span>}
                  </span>
                ) : (
                  activeEntries.length > 0 && <span className="text-sub">{t('لم يحلل الوكيل هذه الأيام بعد', 'The agent has not analysed these days yet')}</span>
                )}
              </div>
            );
          })()}
        </div>

        {/* Tasks header + add */}
        <div className="flex items-center justify-between gap-3 mb-5 no-print">
          <h3 className="text-sm font-extrabold text-ink flex items-center gap-1.5">
            <Edit3 className="w-4 h-4 text-accent" />
            <span>{reportMode === 'weekly' ? t('مهام الأسبوع', "Week's tasks") : t('مهام الفترة', "Period's tasks")}</span>
          </h3>
          <button
            type="button"
            onClick={handleOpenAddDay}
            className="px-3.5 py-2 rounded-xl bg-bg hover:bg-line border border-line text-ink font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-accent" />
            <span>{t('إضافة يوم', 'Add a day')}</span>
          </button>
        </div>

        <ConfirmDialog
          open={addWeekConfirm}
          title={t('إضافة أسبوع إلى خطة التدريب؟', 'Add a week to the training plan?')}
          confirmLabel={t('إضافة الأسبوع', 'Add week')}
          cancelLabel={t('إلغاء', 'Cancel')}
          tone="neutral"
          busy={addingWeek}
          onCancel={() => setAddWeekConfirm(false)}
          onConfirm={async () => {
            await handleAddWeek();
            setAddWeekConfirm(false);
          }}
        >
          <p>
            {t(
              `ستصبح خطة التدريب ${(finalReportData?.profile?.trainingWeeks || weeksList.length || 14) + 1} أسبوعاً. لا تتأثر يومياتك الحالية، ويمكن تقليل العدد لاحقاً من بيانات التقرير.`,
              `The plan will become ${(finalReportData?.profile?.trainingWeeks || weeksList.length || 14) + 1} weeks. Your existing entries are not affected, and the number can be reduced later in the report details.`
            )}
          </p>
        </ConfirmDialog>

        {/* Selected View (Screen & Print Paper View) */}
        {isLoading && reportMode === 'weekly' ? (
          <div className="text-center py-12 text-sub text-sm">{t('جارٍ تحميل تقرير الأسبوع...', 'Loading weekly log...')}</div>
        ) : (
          <>
            <div id="weekly-paper-view" className="printable-a4-sheet space-y-6">
            {/* Hidden File Inputs for Interactive Cover Page Logo Uploads */}
            <input
              type="file"
              ref={institutionLogoInputRef}
              accept="image/*"
              className="hidden no-print"
              onChange={(e) => handleLogoUpload(e, 'institutionLogo')}
            />
            <input
              type="file"
              ref={companyLogoInputRef}
              accept="image/*"
              className="hidden no-print"
              onChange={(e) => handleLogoUpload(e, 'companyLogo')}
            />

            {/* Page 1: Standalone Weekly/Custom Academic Cover Page */}
            <div
              id="weekly-cover-page"
              className="text-center py-8 sm:py-14 border-b-2 border-line pb-10 sm:pb-16 break-inside-avoid print:page-break print:break-after-page print:border-none print:p-0 print:m-0"
              style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
            >
              {/* Dual Logos & Academic Identity Header */}
              <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-line/60 pb-4 sm:pb-6 print:border-b-2 print:border-slate-800 print:mb-0">
                {/* Institution Logo (Right in RTL / Left in LTR) */}
                <div
                  onClick={() => institutionLogoInputRef.current?.click()}
                  className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center shrink-0 cursor-pointer group relative"
                  title={t('انقر لرفع أو تغيير شعار الكلية / المؤسسة', 'Click to upload institution logo')}
                >
                  {finalReportData?.profile?.institutionLogo ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={finalReportData.profile.institutionLogo}
                        alt="Institution Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center text-[10px] text-white font-bold transition-opacity no-print">
                        {t('تغيير', 'Change')}
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 border border-dashed border-accent/40 group-hover:border-accent group-hover:bg-accent/5 rounded-lg flex flex-col items-center justify-center text-[9px] sm:text-[10px] text-sub/70 p-1 transition-colors">
                      <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5 sm:mb-1 text-accent" />
                      <span>{isAr ? 'رفع الشعار' : 'Upload'}</span>
                    </div>
                  )}
                </div>

                {/* Central Academic Identity */}
                <div className="flex-1 text-center space-y-0.5 sm:space-y-1 px-1">
                  <div className="text-[10px] sm:text-xs font-bold text-sub uppercase tracking-wider">
                    {isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-ink">
                    {finalReportData?.profile?.trainingUnit || (isAr ? 'الوحدة التدريبية / الكلية' : 'Academic Department / College')}
                  </div>
                  {finalReportData?.profile?.department && (
                    <div className="text-[11px] sm:text-xs font-semibold text-sub">
                      {finalReportData.profile.department}
                    </div>
                  )}
                </div>

                {/* Company Logo (Left in RTL / Right in LTR) */}
                <div
                  onClick={() => companyLogoInputRef.current?.click()}
                  className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center shrink-0 cursor-pointer group relative"
                  title={t('انقر لرفع أو تغيير شعار جهة التدريب / الشركة', 'Click to upload company logo')}
                >
                  {finalReportData?.profile?.companyLogo ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={finalReportData.profile.companyLogo}
                        alt="Company Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center text-[10px] text-white font-bold transition-opacity no-print">
                        {t('تغيير', 'Change')}
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 border border-dashed border-accent/40 group-hover:border-accent group-hover:bg-accent/5 rounded-lg flex flex-col items-center justify-center text-[9px] sm:text-[10px] text-sub/70 p-1 transition-colors">
                      <Building className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5 sm:mb-1 text-accent" />
                      <span>{isAr ? 'رفع الشعار' : 'Upload'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Period Badge (Centered in the Middle) */}
              <div className="my-auto py-6 print:my-auto print:py-6 space-y-2">
                <div className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold bg-accent/10 text-accent border border-accent/20 mb-1 print:bg-slate-100 print:border print:border-slate-300 print:text-slate-900 print:text-xs">
                  {reportMode === 'weekly'
                    ? (isAr ? `الأسبوع التدريبي: الأسبوع ${currentWeekObj?.weekIndex || 1}` : `Training Week: Week ${currentWeekObj?.weekIndex || 1}`)
                    : (isAr ? `تقرير التدريب الميداني للفترة المحددة (${activeTotalDays} أيام عمل)` : `Field Training Report (${activeTotalDays} Days)`)}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-accent mt-2 print:text-black print:text-3xl print:leading-tight">
                  {reportMode === 'weekly'
                    ? (isAr ? 'تقرير التدريب التعاوني الأسبوعي (Weekly Co-op Report)' : 'Weekly Cooperative Training Report')
                    : (isAr ? 'تقرير التدريب الميداني التراكمي (Co-op Field Report)' : 'Cooperative Field Training Report')}
                </h1>
                <div className="text-sm sm:text-base font-bold text-sub mt-2 print:text-slate-600">
                  {reportMode === 'weekly'
                    ? (weekReport ? `${isAr ? 'الفترة التدريبية المنفذة: ' : 'Executed Period: '} ${formatWeekPeriod(weekReport, isAr)}` : '—')
                    : `${isAr ? 'الفترة الزمنية المشمولة بالتقرير: ' : 'Reported Period: '} ${customPeriodLabel}`}
                </div>
                <div className="text-sm sm:text-base font-bold text-ink mt-2 print:text-slate-800">
                  {isAr ? 'جهة التدريب:' : 'Host Organization:'} <span className="text-accent print:text-black font-extrabold">{entityName}</span>
                </div>
              </div>

              {/* Trainee Information Matrix Card - Lower Placement ("نزل الجدول تحت قليلا مرتب") */}
              <div className="mt-auto pt-6 print:mt-auto print:pt-4">
                <div
                  className="max-w-xl mx-auto bg-bg border border-line rounded-xl p-5 text-start grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs trainee-matrix-print print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/60 print:p-4 print:gap-x-6 print:gap-y-2.5 print:text-xs shadow-xs"
                  dir={isAr ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center justify-between border-b border-line/50 pb-1.5 print:border-slate-200">
                    <span className="font-bold text-sub">{isAr ? 'اسم المتدرب:' : 'Trainee Name:'}</span>
                    <span className="font-black text-ink">{normalizeStudentName(finalReportData?.profile?.studentName) || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-line/50 pb-1.5 print:border-slate-200">
                    <span className="font-bold text-sub">{isAr ? 'الرقم التدريبي:' : 'Training ID:'}</span>
                    <span className="font-mono font-black text-ink">{finalReportData?.profile?.trainingNumber || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-line/50 pb-1.5 print:border-slate-200">
                    <span className="font-bold text-sub">{isAr ? 'القسم / التخصص:' : 'Department:'}</span>
                    <span className="font-bold text-ink">{finalReportData?.profile?.department || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-line/50 pb-1.5 print:border-slate-200">
                    <span className="font-bold text-sub">{isAr ? 'المشرف الأكاديمي:' : 'Academic Supervisor:'}</span>
                    <span className="font-bold text-ink">{finalReportData?.profile?.supervisorName || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-line/50 pb-1.5 print:border-slate-200">
                    <span className="font-bold text-sub">{isAr ? 'المشرف الميداني:' : 'Field Supervisor:'}</span>
                    <span className="font-bold text-ink">{finalReportData?.profile?.responsibleName || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-line/50 pb-1.5 print:border-slate-200">
                    <span className="font-bold text-sub">{isAr ? 'إجمالي الساعات الفعلية:' : 'Logged Hours:'}</span>
                    <span className="font-black text-accent print:text-black">{activeTotalHours} {isAr ? 'ساعة تدريبية' : 'hrs'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-line/50 pb-1.5 print:border-slate-200">
                    <span className="font-bold text-sub">{isAr ? 'أيام العمل المنجزة:' : 'Active Days:'}</span>
                    <span className="font-black text-ink">{activeTotalDays} {isAr ? 'أيام' : 'days'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-line/50 pb-1.5 print:border-slate-200">
                    <span className="font-bold text-sub">{isAr ? 'حالة التوثيق:' : 'Status:'}</span>
                    <span className="font-black text-ok print:text-black">{activeEntries.length ? (isAr ? 'مكتمل التوثيق' : 'Completed') : (isAr ? 'قيد التوثيق' : 'Pending')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Page 2: Weekly Executive Synthesis & Competencies Dossier + Matrix Table */}
            {activeEntries.length > 0 && (() => {
              const synthesis = generateAcademicWeeklySynthesis(
                activeEntries,
                reportMode === 'weekly' ? (currentWeekObj?.weekIndex || 1) : 1,
                activeTotalHours,
                isAr
              );
              return (
                <div
                  id="weekly-page-2-synthesis"
                  className="space-y-6 print:pt-4"
                  style={{ breakBefore: 'page', pageBreakBefore: 'always', breakAfter: 'page', pageBreakAfter: 'always' }}
                >
                  {/* Synthesis Box */}
                  <div className="p-5 sm:p-6 bg-card border border-line rounded-2xl space-y-4 text-start break-inside-avoid shadow-xs print:border-none print:shadow-none print:p-0 print:bg-transparent synthesis-box-print">
                    <div className="flex items-center justify-between border-b border-line pb-3 print:border-b-2 print:border-slate-800">
                      <div className="text-sm font-black text-ink flex items-center gap-2">
                        <Award className="w-5 h-5 text-accent" />
                        <span>{reportMode === 'weekly' ? (isAr ? 'الموجز التنفيذي والكفايات المكتسبة للأسبوع (ملخص الأسبوع الشامل)' : 'Weekly Executive Summary & Acquired Competencies') : (isAr ? 'الموجز التنفيذي والكفايات المكتسبة للفترة المحددة' : 'Executive Summary & Acquired Competencies for Period')}</span>
                      </div>
                      <span className="text-[11px] font-bold text-sub">
                        {isAr ? 'صياغة أكاديمية استشارية رفيعة' : 'Official Academic Synthesis'}
                      </span>
                    </div>

                    {/* Executive Narrative */}
                    <p className="text-xs sm:text-sm text-ink leading-relaxed font-medium">
                      {synthesis.executiveSummary}
                    </p>

                    {/* Core Operational Pillars */}
                    {synthesis.technicalPillars.length > 0 && (
                      <div className="pt-2.5 border-t border-line/60 space-y-2 print:border-t print:border-slate-200">
                        <div className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          {isAr ? 'المحاور والأنشطة التشغيلية المنفذة:' : 'Core Operational Pillars:'}
                        </div>
                        <ul className="space-y-1.5 text-xs text-sub">
                          {synthesis.technicalPillars.map((pillar, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-700 dark:bg-slate-300 mt-1.5 shrink-0"></span>
                              <span className="text-ink font-semibold">{pillar}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Acquired Competencies */}
                    {synthesis.acquiredCompetencies.length > 0 && (
                      <div className="pt-2.5 border-t border-line/60 space-y-2 print:border-t print:border-slate-200">
                        <div className="text-xs font-black text-ok uppercase tracking-wider flex items-center gap-1">
                          <span>{isAr ? 'الكفايات والمعارف الهندسية المكتسبة:' : 'Acquired Engineering Competencies:'}</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-sub">
                          {synthesis.acquiredCompetencies.map((comp, cIdx) => (
                            <li key={cIdx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-ok mt-1.5 shrink-0"></span>
                              <span>{comp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tools & Tech Badges */}
                    {synthesis.toolsAndTech.length > 0 && (
                      <div className="pt-2.5 border-t border-line/60 flex flex-wrap items-center gap-1.5 print:border-t print:border-slate-200" dir={isAr ? 'rtl' : 'ltr'}>
                        <span className="text-xs font-black text-sub ml-1">
                          {isAr ? 'التقنيات والأدوات الموظفة:' : 'Utilized Tech:'}
                        </span>
                        {synthesis.toolsAndTech.map((tool, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-1 rounded-md text-[11px] font-mono font-extrabold bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 print:bg-white print:border-slate-400 print:text-black shadow-xs tech-pill"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Executive Weekly Tasks Table Matrix */}
                  <div className="overflow-x-auto border border-line rounded-xl my-4 bg-card print:border-line print:bg-white break-inside-avoid shadow-xs">
                    <div className="bg-bg px-4 py-2.5 border-b border-line flex items-center justify-between text-xs font-black text-ink print:bg-slate-100">
                      <span>{reportMode === 'weekly' ? (isAr ? 'جدول حصر وتوثيق الأنشطة والمهام الأسبوعية' : 'Weekly Tasks Executive Matrix') : (isAr ? 'جدول حصر وتوثيق أنشطة ومهام الفترة' : 'Tasks Executive Matrix')}</span>
                      <span className="text-[11px] font-bold text-accent print:text-black">
                        {activeTotalDays} {isAr ? 'أيام عمل' : 'days'} &middot; {activeTotalHours} {isAr ? 'ساعة فعلية' : 'hours'}
                      </span>
                    </div>
                    <table className="w-full text-start text-xs border-collapse">
                      <thead>
                        <tr className="bg-bg/60 border-b border-line text-ink font-extrabold text-[11px]">
                          <th className="p-2.5 text-start w-28">{isAr ? 'اليوم والتاريخ' : 'Day & Date'}</th>
                          <th className="p-2.5 text-center w-24">{isAr ? 'التوقيت' : 'Time'}</th>
                          <th className="p-2.5 text-center w-16">{isAr ? 'الساعات' : 'Hours'}</th>
                          <th className="p-2.5 text-start w-28">{isAr ? 'التصنيف الفني' : 'Domain'}</th>
                          <th className="p-2.5 text-start">{isAr ? 'النشاط والمهمة التشغيلية الميدانية' : 'Operational Scope & Task'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/70">
                        {activeEntries.map((entry: EntryDTO, idx: number) => {
                          const hours = calculateHoursBetween(entry.timeFrom || '08:00', entry.timeTo || '16:00');
                          return (
                            <tr key={entry.id} className="hover:bg-bg/30 transition-colors">
                              <td className="p-2.5 font-extrabold text-ink whitespace-nowrap">
                                <span className="text-accent ml-1 font-black print:text-black">{isAr ? `اليوم ${idx + 1}` : `D${idx + 1}`}</span>
                                <span className="text-sub font-semibold text-[10.5px]">
                                  ({isAr ? formatDateArabic(entry.entryDate) : formatDateEnglish(entry.entryDate)})
                                </span>
                              </td>
                              <td className="p-2.5 text-center text-sub font-mono text-[11px] whitespace-nowrap" dir="ltr">
                                {entry.timeFrom || '08:00'} - {entry.timeTo || '16:00'}
                              </td>
                              <td className="p-2.5 text-center font-black text-ink whitespace-nowrap">
                                {hours} {isAr ? 'س' : 'h'}
                              </td>
                              <td className="p-2.5">
                                <span className="px-2.5 py-1 rounded-md text-[10.5px] font-extrabold bg-slate-100 text-slate-800 whitespace-nowrap border border-slate-300 shadow-xs print:bg-white print:border-slate-400">
                                  {formatCategory(entry.category, isAr)}
                                </span>
                              </td>
                              <td className="p-2.5 font-bold text-ink leading-snug">
                                {elevateTaskTitle(entry.title, entry.description, isAr)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Pages 3+: Day-by-day Logs (Strictly 1 page max per day in print) */}
            {activeEntries.length === 0 ? (
              <div className="border border-dashed border-line rounded-2xl p-8 text-center space-y-4 bg-bg/50 no-print">
                <Clock className="w-9 h-9 text-warn mx-auto opacity-75" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-ink">
                    {t(
                      'لا توجد مهام أو أيام مسجلة في هذا النطاق بعد',
                      'No tasks or days recorded in this scope yet'
                    )}
                  </h3>
                  <p className="text-xs text-sub max-w-md mx-auto leading-relaxed">
                    {t('يمكنك كتابة وتوثيق المهام الآن مباشرةً بالنقر على زر إضافة مهمة أعلاه', 'You can log tasks for this scope right now:')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddDay}
                  className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('إضافة أول يوم ومهمة', '+ Add First Day & Task')}</span>
                </button>
              </div>
            ) : (
              <div id="weekly-days-dossier" className="space-y-4 print:pt-4">
                <div className="hidden print:block text-xs font-black text-slate-800 uppercase tracking-wider pb-2 mb-3 border-b-2 border-slate-800">
                  {isAr ? 'سجل وتفاصيل المهام والأنشطة اليومية الميدانية' : 'Detailed Daily Field Tasks & Activities'}
                </div>
                {activeEntries.map((entry: EntryDTO, dayIdx: number) => {
                  const entryHours = calculateHoursBetween(entry.timeFrom || '08:00', entry.timeTo || '16:00');
                  return (
                    <div
                      key={entry.id}
                      className="border border-line rounded-2xl overflow-hidden bg-card shadow-xs hover:shadow-sm transition-all text-start day-card-print break-inside-avoid print:border-none print:shadow-none print:bg-transparent print:p-0 print:mb-0"
                      style={{ pageBreakBefore: 'always', breakBefore: 'page', pageBreakAfter: 'always', breakAfter: 'page' }}
                    >
                      {/* Day Card Header */}
                      <div className="bg-bg px-4 sm:px-5 py-3 border-b border-line flex flex-wrap items-center justify-between gap-2.5 print:bg-transparent print:px-0 print:border-b-2 print:border-slate-800">
                        {/* Right: Day badge, Date, and Time window */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-3 py-1 rounded-lg text-xs font-black bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 print:bg-slate-900 print:text-white shadow-xs">
                            {isAr ? `اليوم ${dayIdx + 1}` : `Day ${dayIdx + 1}`}
                          </span>
                          <span className="font-extrabold text-ink text-xs sm:text-sm">
                            {isAr ? formatDateArabic(entry.entryDate) : formatDateEnglish(entry.entryDate)}
                          </span>
                          <span className="text-sub text-xs font-semibold" dir="ltr">
                            ({entry.timeFrom || '08:00'} – {entry.timeTo || '16:00'})
                          </span>
                        </div>

                        {/* Left: Category Tag, Hours calculation, and Actions */}
                        <div className="flex items-center gap-2.5">
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 print:bg-white print:border-slate-400 print:text-black shadow-xs">
                            {formatCategory(entry.category, isAr)}
                          </span>
                          <span className="text-xs font-bold text-sub">
                            {entryHours} {isAr ? 'ساعات' : 'hrs'}
                          </span>

                          {/* Screen Actions (hidden when printing) */}
                          <div className="flex items-center gap-1.5 no-print print:hidden mr-1">
                            <button
                              type="button"
                              onClick={() => handleOpenRevisions(entry)}
                              className="p-1.5 rounded-lg bg-card hover:bg-line text-sub hover:text-accent border border-line transition-all shadow-xs relative"
                              title={t('سجل التعديلات واسترجاع النسخ السابقة', 'Revision History & Rollback')}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              {((entry as any)._count?.revisions ?? 0) > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">
                                  {(entry as any)._count.revisions}
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(entry)}
                              className="p-1.5 rounded-lg bg-card hover:bg-line text-sub hover:text-accent border border-line transition-all shadow-xs"
                              title={t('تعديل هذا اليوم / المهمة', 'Edit Task')}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-1.5 rounded-lg bg-card hover:bg-warn-bg text-sub hover:text-warn border border-line transition-all shadow-xs"
                              title={t('حذف المهمة', 'Delete Task')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Day Card Body: Formal Task Title & Full Procedural Narrative */}
                      <div className="p-4 sm:p-6 space-y-3.5 print:px-0 print:py-3">
                        <div>
                          <div className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                            {isAr ? 'النشاط الفني والمهمة التشغيلية الميدانية:' : 'Technical Activity & Operational Scope:'}
                          </div>
                          <h4 className="text-sm sm:text-base font-black text-ink leading-snug">
                            {elevateTaskTitle(entry.title, entry.description, isAr)}
                          </h4>
                        </div>

                        <div className="pt-3 border-t border-line/60 print:border-t print:border-slate-200">
                          <div className="text-xs font-black text-sub uppercase tracking-wider mb-1.5">
                            {isAr ? 'السرد الإجرائي ونتائج التنفيذ الهندسي والميداني:' : 'Procedural Narrative & Engineering Results:'}
                          </div>
                          <div className="text-ink text-xs sm:text-sm leading-loose bg-bg/50 p-4 rounded-xl border border-line/60 procedural-narrative-box print:bg-transparent print:border-none print:p-0 print:text-sm print:leading-relaxed">
                            {renderProceduralNarrative(entry.description, entry.timeFrom)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Final Page: Evidence Photos + Field Supervisory Approval & Official Stamp Block */}
            <div
              id="weekly-final-evidence-page"
              className="space-y-6 pt-4 print:page-break print:break-before-page print:pt-4"
              style={{ pageBreakBefore: 'always', breakBefore: 'page' }}
            >
              {/* Field Evidence Photos */}
              {reportMode === 'weekly' && currentWeekObj ? (
                <WeeklyEvidenceSection weekIndex={currentWeekObj.weekIndex} />
              ) : (
                customEvidenceList.length > 0 && (
                  <div className="border border-line rounded-2xl p-5 bg-card text-start space-y-4 print:border-none print:p-0 print:bg-transparent">
                    <div className="flex items-center justify-between border-b border-line pb-3 print:border-b-2 print:border-slate-800">
                      <div className="text-sm font-black text-ink flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span>{isAr ? 'الصور والشواهد التوثيقية للفترة الميدانية' : 'Field Evidence Photos for Period'}</span>
                      </div>
                      <span className="text-xs font-bold text-sub">
                        {customEvidenceList.length} {isAr ? 'صور موثقة' : 'photos'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-2 print:gap-3">
                      {customEvidenceList.map((photo, pIdx) => (
                        <div key={photo.id || pIdx} className="border border-line rounded-xl overflow-hidden bg-bg p-2 space-y-1 print:border-slate-300 print:bg-white print:p-1.5 flex flex-col print:break-inside-avoid">
                          <div className="w-full min-h-[120px] max-h-[260px] print:min-h-0 print:h-[200px] overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-900/40 p-1 flex items-center justify-center">
                            <img src={photo.imageData} alt={photo.caption || ''} className="max-h-[240px] print:max-h-[190px] w-auto max-w-full object-contain rounded" />
                          </div>
                          {photo.caption && (
                            <p className="text-[11px] font-bold text-ink truncate print:text-[8.5pt] print:mt-1">{photo.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* Formal Supervisory Approval & Stamp Block (For Official Print & Defense - Kept in SAME Page) */}
              <div
                className="border border-line rounded-2xl overflow-hidden bg-card text-start break-inside-avoid print:border-none print:shadow-none print:bg-transparent endorsement-box-print print:mt-3"
                style={{ pageBreakBefore: 'avoid', breakBefore: 'avoid' }}
              >
                <div className="bg-bg px-5 py-3 border-b border-line flex items-center justify-between print:bg-transparent print:px-0 print:border-b-2 print:border-slate-800" dir={isAr ? 'rtl' : 'ltr'}>
                  <span className="text-xs font-black text-ink">{t('المصادقة والاعتماد الميداني الرسمي', 'Official Field Supervisory Endorsement')}</span>
                  <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">{entityName}</span>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs print-grid-3 print:p-0 print:pt-3">
                  <div className="space-y-2 p-3 bg-bg/40 rounded-xl border border-line/60 print:border-slate-300">
                    <div className="font-bold text-sub">{t('توقيع المتدرب:', 'Trainee Signature:')}</div>
                    <div className="font-extrabold text-ink">{normalizeStudentName(finalReportData?.profile?.studentName) || '—'}</div>
                    <div className="text-[11px] text-muted pt-2 border-t border-line/40 print:border-slate-300">التوقيع: ....................</div>
                  </div>
                  <div className="space-y-2 p-3 bg-bg/40 rounded-xl border border-line/60 print:border-slate-300">
                    <div className="font-bold text-sub">{t('اعتماد المشرف الميداني:', 'Field Supervisor Approval:')}</div>
                    <div className="font-extrabold text-ink">{finalReportData?.profile?.responsibleName || '....................'}</div>
                    <div className="text-[11px] text-muted pt-2 border-t border-line/40 print:border-slate-300">التوقيع: ....................</div>
                  </div>
                  <div className="space-y-2 p-3 bg-bg/40 rounded-xl border border-line/60 flex flex-col justify-between print:border-slate-300">
                    <div className="font-bold text-sub">{t('ختم جهة التدريب الرسمي:', 'Official Host Entity Stamp:')}</div>
                    <div className="h-12 border border-dashed border-line rounded-lg flex items-center justify-center text-[10px] text-muted print:border-slate-400">
                      [ موضع الختم الرسمي ]
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>

      {/* Edit / Add Entry Modal */}
      {isEditModalOpen && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-line rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in text-start">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-bg">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-extrabold text-ink">
                  {editingEntry.id ? t('تعديل بيانات وسرد اليوم', 'Edit Daily Task') : t('إضافة يوم ومهمة جديدة للأسبوع', 'Add New Day & Task')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-sub hover:text-ink hover:bg-line transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEntry} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-sub">{t('تاريخ اليوم التدريبي', 'Training Date')}</label>
                  <input
                    type="date"
                    required
                    value={editingEntry.entryDate || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, entryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-sub">{t('التصنيف الفني', 'Technical Category')}</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(!isCustomCategory);
                        if (!isCustomCategory && !customCategory) {
                          setCustomCategory('');
                        }
                      }}
                      className="text-[10px] font-bold text-accent hover:underline"
                    >
                      {isCustomCategory ? t('← قائمة التصنيفات', '← Preset Categories') : t('+ كتابة تصنيف مخصص', '+ Custom Category')}
                    </button>
                  </div>
                  {isCustomCategory ? (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder={t('مثال: أمن سيبراني، ذكاء اصطناعي، شبكات...', 'e.g. Cyber Security, AI, Networks...')}
                      className="w-full px-3 py-2 bg-bg border border-accent rounded-xl focus:outline-none focus:ring-1 focus:ring-accent text-ink font-bold"
                      autoFocus
                      required
                    />
                  ) : (
                    <select
                      value={editingEntry.category || 'تطوير / برمجة'}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCategory(true);
                          setCustomCategory('');
                        } else {
                          setEditingEntry({ ...editingEntry, category: e.target.value as EntryDTO['category'] });
                        }
                      }}
                      className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink font-bold"
                    >
                      <optgroup label={isAr ? 'مجالات هندسية وتخصصية' : 'Engineering & Specialized'}>
                        {CATEGORIES.slice(0, 10).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label={isAr ? 'تصنيفات عامة' : 'General Categories'}>
                        {CATEGORIES.slice(10).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </optgroup>
                      <option value="__custom__">{t('+ كتابة تصنيف مخصص...', '+ Custom category...')}</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Work Hours & Daily Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-sub">{t('وقت الحضور (البداية)', 'Start Time')}</label>
                  <input
                    type="time"
                    required
                    value={editingEntry.timeFrom || '08:00'}
                    onChange={(e) => setEditingEntry({ ...editingEntry, timeFrom: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-sub">{t('وقت الانصراف (النهاية)', 'End Time')}</label>
                    <span className="text-[11px] font-bold text-accent">
                      {calculateHoursBetween(editingEntry.timeFrom || '08:00', editingEntry.timeTo || '16:00')} {t('ساعات تدريب', 'hrs')}
                    </span>
                  </div>
                  <input
                    type="time"
                    required
                    value={editingEntry.timeTo || '16:00'}
                    onChange={(e) => setEditingEntry({ ...editingEntry, timeTo: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-sub">{t('عنوان المهمة / النشاط الميداني', 'Task Title / Activity')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('مثال: التهيئة العامة والتعريف بسياسات أمن المعلومات', 'e.g. Orientation and Information Security Policies')}
                  value={editingEntry.title || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block font-bold text-sub">{t('التفاصيل والسرد الأكاديمي للمهمة', 'Task Details & Narrative')}</label>
                </div>
                <textarea
                  rows={5}
                  required
                  placeholder={t('اكتب شرحاً وافياً للمهام التي قمت بإنجازها، الأدوات المستخدمة، والنتائج المتحققة...', 'Write a clear explanation of tasks accomplished, tools used, and results...')}
                  value={editingEntry.description || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink leading-relaxed"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-bg hover:bg-line text-sub font-bold transition-colors"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('حفظ التعديلات', 'Save Changes')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revisions History Modal for Day Cards */}
      {revisionsModalOpen && activeEntryForRevisions && (
        <div className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-card border border-line rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-start">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
                  <History className="w-5 h-5 text-accent" />
                  <span>{t('سجل التعديلات والنسخ المحفوظة لهذا اليوم', 'Revision History & Rollback Vault')}</span>
                </h3>
                <p className="text-[11px] text-sub font-medium">
                  {t('تاريخ اليوم التدريبي:', 'Training Day Date:')} <strong className="text-ink">{activeEntryForRevisions.entryDate}</strong> — {entryRevisionsList.length > 0 ? `${entryRevisionsList.length} ${t('نسخة مسجلة في الأرشيف', 'version(s) archived')}` : t('النسخة الأصلية الأساسية', 'Original Baseline Version')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRevisionsModalOpen(false)}
                className="p-1 rounded-lg text-sub hover:text-ink hover:bg-line transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 flex-1 space-y-4">
              {/* Current Active Entry State */}
              <div className="p-4 rounded-xl border border-ok/30 bg-ok-bg/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-black text-ok">
                    <span className="w-2 h-2 rounded-full bg-ok animate-pulse"></span>
                    {t('النسخة الحالية النشطة في التقرير وقاعدة البيانات', 'Current Active Version in Report & Database')}
                  </span>
                  <span className="text-[10px] font-bold text-sub">
                    {activeEntryForRevisions.timeFrom} - {activeEntryForRevisions.timeTo} | {activeEntryForRevisions.category}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-ink">{activeEntryForRevisions.title}</h4>
                <div className="text-xs text-ink/90 leading-relaxed whitespace-pre-wrap bg-card/60 p-3 rounded-lg border border-line/40">
                  {activeEntryForRevisions.description}
                </div>
              </div>

              {/* Revision History Stream */}
              <div className="space-y-2.5">
                <div className="text-xs font-black text-sub uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-accent" />
                  <span>{t('سجل التعديلات والإصدارات السابقة (إمكانية الاسترجاع الفوري):', 'Archived Prior Revisions (Instant Rollback):')}</span>
                </div>

                {!entryRevisionsList?.length ? (
                  <div className="text-center py-6 px-4 rounded-xl border border-dashed border-line bg-bg text-sub text-xs space-y-1">
                    <p className="font-bold text-ink">
                      {t('هذه هي النسخة الأصلية المحفوظة حالياً في قاعدة البيانات.', 'This is the active baseline version stored safely in the database.')}
                    </p>
                    <p className="text-[11px] text-sub">
                      {t('أي تعديل جديد تجريه على هذا اليوم سيتم حفظه مع الاحتفاظ بنسخته السابقة هنا تلقائياً لضمان عدم فقدان أي بيانات.', 'Any subsequent edits will automatically be archived here with exact timestamps for instant rollback.')}
                    </p>
                  </div>
                ) : (
                  entryRevisionsList.map((rev, idx) => {
                    const isSameAsCurrent = rev.title === activeEntryForRevisions.title && rev.description === activeEntryForRevisions.description;
                    return (
                      <div key={rev.id || idx} className="p-3.5 rounded-xl border border-line bg-bg space-y-2 hover:border-accent/40 transition-colors">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-accent-dim text-accent">
                              #{entryRevisionsList.length - idx}
                            </span>
                            <span className="font-extrabold text-ink">{rev.title}</span>
                            {rev.createdAt && (
                              <span className="text-[10px] text-muted hidden sm:inline">
                                ({new Date(rev.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })})
                              </span>
                            )}
                          </div>
                          {!isSameAsCurrent && (
                            <button
                              type="button"
                              onClick={() => rollbackMutation.mutate({ entryId: activeEntryForRevisions.id, revId: rev.id })}
                              disabled={rollbackMutation.isPending}
                              className="px-3 py-1 text-[11px] font-bold rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50 shrink-0"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>{rollbackMutation.isPending ? t('جارٍ الاسترجاع...', 'Restoring...') : t('العودة لهذه النسخة', 'Rollback to this')}</span>
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-sub leading-relaxed whitespace-pre-wrap bg-card p-2.5 rounded-lg border border-line/50">
                          {rev.description}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-line flex items-center justify-between">
              <span className="text-[11px] text-ok font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('بياناتك مؤرشفة ومحمية من الفقدان في السيرفر', 'All data securely preserved on server')}
              </span>
              <button
                type="button"
                onClick={() => setRevisionsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-bg hover:bg-line text-xs font-bold text-ink transition-colors"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Diff Modal for Weekly Tab */}
      <DiffModal
        isOpen={diffModalOpen}
        onClose={() => setDiffModalOpen(false)}
        actionTitle={diffTitle}
        originalText={originalText}
        improvedText={improvedText}
        diffChunks={diffChunks}
        onAccept={() => {
          setEditingEntry((prev) => (prev ? { ...prev, description: improvedText } : null));
          setDiffModalOpen(false);
          setSaveToast(t('تم تطبيق التعديلات الذكية بنجاح!', 'AI improvements applied successfully!'));
          setTimeout(() => setSaveToast(''), 3000);
        }}
      />

      {/* Batch Academic Rewrite Modal */}

      {/* Daily Format Audit & Q&A Structuring Modal */}
    </div>
  );
};
