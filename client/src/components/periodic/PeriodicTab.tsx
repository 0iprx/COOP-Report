import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FinalReportData,
  EntryDTO,
  SavedPeriodicReport,
  formatDateArabic,
  formatDateEnglish,
  calculateHoursBetween,
  generateAcademicWeeklySynthesis,
  ENTRY_CATEGORIES,
  elevateTaskTitle,
  normalizeStudentName,
  polishAcademicNarrative,
  convertBulletsToCohesiveParagraphs,
  isEntryStructuredQA
} from '@coop/shared';
import { PeriodicReportsManager } from '../weekly/PeriodicReportsManager';
import { WeeklyEvidenceSection } from '../weekly/WeeklyEvidenceSection';
import { DailyFormatAuditModal } from '../weekly/DailyFormatAuditModal';
import { DiffModal } from '../common/DiffModal';
import { BatchRewriteModal } from '../common/BatchRewriteModal';
import { ProceduralNarrativeView } from '../common/ProceduralNarrativeView';
import { periodicReportsService } from '../../services/periodicReportsService';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Copy,
  Download,
  Check,
  Edit3,
  Trash2,
  Plus,
  Sparkles,
  X,
  Save,
  CheckCircle,
  Languages,
  FileText,
  Printer,
  RotateCcw,
  Building,
  GraduationCap,
  Award,
  Sun,
  Moon,
  ListChecks,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  BookOpen,
  AlertTriangle,
  UserCheck,
  Sliders,
  ChevronDown,
  Compass
} from 'lucide-react';

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

export const PeriodicTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { lang, setLang, isAr, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();

  // Modals
  const [batchModalOpen, setBatchModalOpen] = useState<boolean>(false);
  const [auditModalOpen, setAuditModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadingDocx, setDownloadingDocx] = useState<boolean>(false);
  const [isTranslatingPeriod, setIsTranslatingPeriod] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string>('');
  const [errorToast, setErrorToast] = useState<string>('');

  // Logo file upload refs for Cover Page
  const institutionLogoInputRef = useRef<HTMLInputElement>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);

  // Saved Periodic Reports State (Offline-first persistence)
  const [savedPeriodicReports, setSavedPeriodicReports] = useState<SavedPeriodicReport[]>(() =>
    periodicReportsService.getSavedReports()
  );
  const [activePeriodicReport, setActivePeriodicReport] = useState<SavedPeriodicReport>(() => {
    const list = periodicReportsService.getSavedReports();
    const activeId = periodicReportsService.getActiveReportId();
    const found = list.find((r) => r.id === activeId);
    if (found) return found;
    if (list.length > 0) return list[0];
    const def = periodicReportsService.createDefaultReport();
    periodicReportsService.saveReport(def);
    return def;
  });

  // Edit / Add Day Modal State
  const [editingEntry, setEditingEntry] = useState<Partial<EntryDTO> | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [aiPolishing, setAiPolishing] = useState<boolean>(false);

  // Revisions Modal State
  const [revisionsModalOpen, setRevisionsModalOpen] = useState<boolean>(false);
  const [activeEntryForRevisions, setActiveEntryForRevisions] = useState<any>(null);
  const [entryRevisionsList, setEntryRevisionsList] = useState<any[]>([]);

  // Diff Modal State
  const [diffModalOpen, setDiffModalOpen] = useState<boolean>(false);
  const [diffTitle, setDiffTitle] = useState<string>('');
  const [originalText, setOriginalText] = useState<string>('');
  const [improvedText, setImprovedText] = useState<string>('');
  const [diffChunks, setDiffChunks] = useState<any[]>([]);

  // Fetch final report to get the full academic schedule of all entries and profile
  const { data: finalReportData, isLoading } = useQuery<FinalReportData>({
    queryKey: ['finalReport'],
    queryFn: async () => {
      const res = await api.get('/reports/final');
      return res.data;
    }
  });

  const profile = finalReportData?.profile || ({} as any);
  const entityName = profile?.entityAddress || (isAr ? 'جهة التدريب التعاوني' : 'Training Organization');

  // All entries from all weeks
  const allDocumentedEntries: EntryDTO[] = useMemo(() => {
    return (finalReportData?.weeks || []).flatMap((w) => w.entries || []);
  }, [finalReportData]);

  // Set default dates if active periodic report has none
  useEffect(() => {
    if (allDocumentedEntries.length > 0 && !activePeriodicReport.startDate && !activePeriodicReport.endDate) {
      const sorted = [...allDocumentedEntries].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
      const first = sorted[0].entryDate;
      const last = sorted[sorted.length - 1].entryDate;
      setActivePeriodicReport((prev) => ({
        ...prev,
        startDate: first,
        endDate: last
      }));
    }
  }, [allDocumentedEntries, activePeriodicReport.startDate, activePeriodicReport.endDate]);

  // Filtered entries for this periodic report
  const effectiveStartDate = activePeriodicReport.startDate || '';
  const effectiveEndDate = activePeriodicReport.endDate || '';

  const activeEntries: EntryDTO[] = useMemo(() => {
    return allDocumentedEntries
      .filter((e) => {
        if (!effectiveStartDate && !effectiveEndDate) return true;
        if (effectiveStartDate && e.entryDate < effectiveStartDate) return false;
        if (effectiveEndDate && e.entryDate > effectiveEndDate) return false;
        return true;
      })
      .sort((a, b) => a.entryDate.localeCompare(b.entryDate));
  }, [allDocumentedEntries, effectiveStartDate, effectiveEndDate]);

  const activeStructuredCount = activeEntries.filter((e) => isEntryStructuredQA(e.description)).length;
  const activeFreeformCount = activeEntries.length - activeStructuredCount;

  const activeTotalHours = useMemo(() => {
    return activeEntries.reduce((acc, e) => {
      return acc + calculateHoursBetween(e.timeFrom || '08:00', e.timeTo || '16:00');
    }, 0);
  }, [activeEntries]);

  const activeTotalDays = useMemo(() => {
    return new Set(activeEntries.map((e) => e.entryDate)).size;
  }, [activeEntries]);

  // Format period label
  const customPeriodLabel = useMemo(() => {
    if (effectiveStartDate && effectiveEndDate) {
      return isAr
        ? `من ${formatDateArabic(effectiveStartDate)} إلى ${formatDateArabic(effectiveEndDate)}`
        : `From ${formatDateEnglish(effectiveStartDate)} to ${formatDateEnglish(effectiveEndDate)}`;
    }
    return isAr ? 'كامل الفترة التدريبية المحددة' : 'All Specified Period';
  }, [effectiveStartDate, effectiveEndDate, isAr]);

  // Evidence list across weeks matching the period
  const customEvidenceList = useMemo(() => {
    return (finalReportData?.weeks || [])
      .filter((w) => {
        if (!effectiveStartDate && !effectiveEndDate) return true;
        if (effectiveStartDate && w.weekEnd < effectiveStartDate) return false;
        if (effectiveEndDate && w.weekStart > effectiveEndDate) return false;
        return true;
      })
      .flatMap((w) => w.evidence || []);
  }, [finalReportData, effectiveStartDate, effectiveEndDate]);

  /* ── A4 Dimension Study & Page Ordering Blueprint ─────────────────── */
  // Page 1: Cover + Trainee Matrix + Freehand Narrative Box (Always 1 full A4 page)
  // Page 2: Executive Matrix of tasks for the period (1 full page or more based on task count)
  // Pages 3..N: Day-by-Day Written Logs (If includeDailyTasks is true: 1 page per day)
  // Page Final: Photographic Evidence & Signatures (If includeSignatures is true: 1 page)
  const includeDaily = activePeriodicReport.includeDailyTasks !== false;
  const includeSig = activePeriodicReport.includeEndorsement !== false;

  const matrixPageCount = activeEntries.length > 0 ? 1 : 1;
  const dailyLogsPageCount = includeDaily ? activeEntries.length : 0;
  const finalEvidencePageCount = includeSig ? 1 : 0;
  const totalPages = 1 + matrixPageCount + dailyLogsPageCount + finalEvidencePageCount;

  // Study height capacity for Page 1 Freehand Narrative
  // Printable area on A4 is ~270mm. Fixed elements (Kingdom header + logos + title + trainee matrix) use ~125mm.
  // Available height for narrative is ~145mm (~24 text lines = ~1500 chars).
  const narrativeChars = (activePeriodicReport.customNarrative || '').trim().length;
  const maxSafeChars = 1400;
  const page1CapacityPct = Math.min(100, Math.round((narrativeChars / maxSafeChars) * 100));
  const isPage1Overfilled = narrativeChars > maxSafeChars;

  // Handlers for Periodic Report Selection & Persistence
  const handleSelectPeriodicReport = (report: SavedPeriodicReport) => {
    setActivePeriodicReport(report);
    periodicReportsService.setActiveReportId(report.id);
  };

  const handleUpdatePeriodicReport = (updated: Partial<SavedPeriodicReport>) => {
    setActivePeriodicReport((prev) => {
      const next = { ...prev, ...updated };
      return next;
    });
  };

  const handleSaveCurrentPeriodicReport = () => {
    const updatedList = periodicReportsService.saveReport(activePeriodicReport);
    setSavedPeriodicReports(updatedList);
    setSaveToast(t('تم حفظ التقرير الفتري وتحديثه بنجاح!', 'Periodic report saved successfully!'));
    setTimeout(() => setSaveToast(''), 3000);
  };

  const handleCreateNewPeriodicReport = () => {
    let startD = '';
    let endD = '';
    if (allDocumentedEntries.length > 0) {
      const sorted = [...allDocumentedEntries].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
      startD = sorted[0].entryDate;
      endD = sorted[sorted.length - 1].entryDate;
    }
    const newReport = periodicReportsService.createDefaultReport(startD, endD);
    const updatedList = periodicReportsService.saveReport(newReport);
    setSavedPeriodicReports(updatedList);
    setActivePeriodicReport(newReport);
    setSaveToast(t('تم إنشاء تقرير فتري جديد، يمكنك تخصيصه وحفظه الآن', 'New periodic report created'));
    setTimeout(() => setSaveToast(''), 3000);
  };

  const handleDeleteCurrentPeriodicReport = () => {
    if (!window.confirm(t('هل أنت متأكد من حذف هذا التقرير الفتري المحفوظ؟', 'Are you sure you want to delete this periodic report?'))) return;
    const updatedList = periodicReportsService.deleteReport(activePeriodicReport.id);
    setSavedPeriodicReports(updatedList);
    if (updatedList.length > 0) {
      setActivePeriodicReport(updatedList[0]);
    } else {
      const def = periodicReportsService.createDefaultReport();
      periodicReportsService.saveReport(def);
      setSavedPeriodicReports([def]);
      setActivePeriodicReport(def);
    }
    setSaveToast(t('تم حذف التقرير الفتري بنجاح', 'Periodic report deleted'));
    setTimeout(() => setSaveToast(''), 3000);
  };

  // Logo file uploads
  const handleUploadLogo = async (type: 'institution' | 'company', file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorToast(t('حجم الشعار كبير جداً (الحد الأقصى 5 ميجابايت)', 'Logo file too large (max 5MB)'));
      setTimeout(() => setErrorToast(''), 3000);
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        await api.post('/reports/profile', {
          [type === 'institution' ? 'institutionLogo' : 'companyLogo']: base64Data
        });
        await queryClient.invalidateQueries({ queryKey: ['finalReport'] });
        setSaveToast(t('تم تحديث الشعار بنجاح!', 'Logo updated successfully!'));
        setTimeout(() => setSaveToast(''), 3000);
      };
      reader.readAsDataURL(file);
    } catch {
      setErrorToast(t('تعذر رفع الشعار', 'Failed to upload logo'));
      setTimeout(() => setErrorToast(''), 3000);
    }
  };

  // Print PDF
  const handlePrintPDF = () => {
    window.print();
  };

  // Copy text to clipboard
  const handleCopyText = () => {
    let text = isAr
      ? `تقرير التدريب الميداني الفتري: ${customPeriodLabel}\nجهة التدريب: ${entityName}\nالإدارة / القسم: ${activePeriodicReport.department || '—'}\nالصفة الميدانية: ${activePeriodicReport.roleAssignment || '—'}\n\n`
      : `Periodic Field Training Report: ${customPeriodLabel}\nOrganization: ${entityName}\nDepartment: ${activePeriodicReport.department || '—'}\nRole: ${activePeriodicReport.roleAssignment || '—'}\n\n`;

    if (activePeriodicReport.customNarrative?.trim()) {
      text += isAr
        ? `بيان التكليف والسرد الإداري:\n${activePeriodicReport.customNarrative}\n\n`
        : `Operational Scope & Freehand Narrative:\n${activePeriodicReport.customNarrative}\n\n`;
    }

    if (activeEntries?.length) {
      text += isAr ? `المهام المنجزة:\n` : `Logged Tasks:\n`;
      activeEntries.forEach((e: EntryDTO) => {
        const d = isAr ? formatDateArabic(e.entryDate) : formatDateEnglish(e.entryDate);
        text += `• ${d}: ${elevateTaskTitle(e.title, e.description)} [${e.category}]\n  ${e.description}\n\n`;
      });
      text += isAr
        ? `إجمالي الأيام: ${activeTotalDays} | عدد المهام: ${activeEntries.length} | الساعات: ${activeTotalHours}`
        : `Total Days: ${activeTotalDays} | Tasks: ${activeEntries.length} | Hours: ${activeTotalHours}`;
    } else {
      text += isAr ? `(لا توجد مهام مسجلة في هذه الفترة)` : `(No tasks recorded in this period)`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Markdown
  const handleDownloadMarkdown = () => {
    let md = `# ${activePeriodicReport.title || (isAr ? 'تقرير التدريب التعاوني الفتري' : 'Periodic Training Report')} (${customPeriodLabel})\n\n`;
    md += `**${isAr ? 'الجهة:' : 'Organization:'}** ${entityName}  \n`;
    md += `**${isAr ? 'القسم / الإدارة:' : 'Department:'}** ${activePeriodicReport.department || '—'}  \n`;
    md += `**${isAr ? 'الصفة ونطاق التكليف:' : 'Operational Scope:'}** ${activePeriodicReport.roleAssignment || '—'}  \n`;
    md += `**${isAr ? 'أيام العمل:' : 'Work Days:'}** ${activeTotalDays}  \n`;
    md += `**${isAr ? 'إجمالي الساعات:' : 'Total Hours:'}** ${activeTotalHours}  \n`;
    md += `**${isAr ? 'المهام المنجزة:' : 'Completed Tasks:'}** ${activeEntries.length}  \n\n`;

    if (activePeriodicReport.customNarrative?.trim()) {
      md += `## ${isAr ? 'بيان التكليف والسرد الميداني للفترة' : 'Operational Scope & Narrative'}\n\n`;
      md += `${activePeriodicReport.customNarrative}\n\n`;
    }

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
    a.download = `Periodic_Report_${effectiveStartDate}_${effectiveEndDate}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Word DOCX
  const handleDownloadDocx = async () => {
    try {
      setDownloadingDocx(true);
      const exportUrl = `/reports/weekly/export/docx?start=${effectiveStartDate}&end=${effectiveEndDate}&lang=${lang}`;
      const res = await api.get(exportUrl, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Periodic_Report_${effectiveStartDate}_${effectiveEndDate}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert(t('تعذر تصدير تقرير الفترة كـ Word، يرجى المحاولة لاحقاً', 'Unable to download Word report.'));
    } finally {
      setDownloadingDocx(false);
    }
  };

  // AI-powered Report Content Translation
  const handleTranslatePeriodEntries = async (targetLang: 'ar' | 'en') => {
    if (!activeEntries || activeEntries.length === 0) {
      setErrorToast(t('لا توجد مهام في هذه الفترة لترجمتها', 'No tasks to translate in this period'));
      setTimeout(() => setErrorToast(''), 3000);
      return;
    }

    const confirmMsg = targetLang === 'en'
      ? `هل تريد ترجمة محتوى مهام هذا التقرير الفتري (${activeEntries.length} مهمة) بالكامل إلى اللغة الإنجليزية بالذكاء الاصطناعي؟\n\n• تشمل الترجمة: عناوين المهام، السرد الفني، والتصنيفات الهندسية.\n• سيتم تلقائياً حفظ نسخة احتياطية لكافة السجلات في سجل التعديلات مع إمكانية التراجع بأي وقت.`
      : `هل تريد ترجمة محتوى مهام هذا التقرير الفتري (${activeEntries.length} مهمة) بالكامل إلى اللغة العربية بالذكاء الاصطناعي؟\n\n• تشمل الترجمة: عناوين المهام، السرد الفني، والتصنيفات الهندسية.\n• سيتم تلقائياً حفظ نسخة احتياطية لكافة السجلات في سجل التعديلات مع إمكانية التراجع بأي وقت.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setIsTranslatingPeriod(true);
      const res = await api.post('/reports/weekly/translate', {
        entryIds: activeEntries.map((e) => e.id),
        targetLang
      });

      setLang(targetLang);

      await queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      await queryClient.invalidateQueries({ queryKey: ['entries'] });

      setSaveToast(
        res.data?.message ||
          (targetLang === 'en'
            ? 'تمت ترجمة محتوى التقرير الفتري إلى الإنجليزية بنجاح!'
            : 'تمت ترجمة محتوى التقرير الفتري إلى العربية بنجاح!')
      );
      setTimeout(() => setSaveToast(''), 4500);
    } catch (err: any) {
      setErrorToast(err?.response?.data?.error || t('تعذر ترجمة محتوى التقرير', 'Failed to translate report content'));
      setTimeout(() => setErrorToast(''), 3500);
    } finally {
      setIsTranslatingPeriod(false);
    }
  };

  // Open Edit Modal for entry
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

  // Delete entry
  const handleDeleteEntry = async (id: number) => {
    if (!window.confirm(t('هل أنت متأكد من حذف هذا السجل؟', 'Are you sure you want to delete this record?'))) return;
    try {
      await api.delete(`/entries/${id}`);
      await queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      setSaveToast(t('تم حذف السجل بنجاح', 'Entry deleted successfully'));
      setTimeout(() => setSaveToast(''), 2500);
    } catch {
      setErrorToast(t('تعذر حذف السجل', 'Failed to delete record'));
      setTimeout(() => setErrorToast(''), 3000);
    }
  };

  // Save entry edit
  const handleSaveEntryEdit = async () => {
    if (!editingEntry?.id) return;
    const finalCategory = isCustomCategory ? customCategory.trim() || 'أخرى' : editingEntry.category || 'أخرى';
    try {
      await api.put(`/entries/${editingEntry.id}`, {
        title: editingEntry.title,
        entryDate: editingEntry.entryDate,
        category: finalCategory,
        timeFrom: editingEntry.timeFrom,
        timeTo: editingEntry.timeTo,
        description: editingEntry.description
      });
      setIsEditModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      setSaveToast(t('تم حفظ وتعديل السجل بنجاح!', 'Entry updated successfully!'));
      setTimeout(() => setSaveToast(''), 3000);
    } catch {
      setErrorToast(t('تعذر حفظ التعديلات', 'Failed to update entry'));
      setTimeout(() => setErrorToast(''), 3000);
    }
  };

  // Open Revisions Modal
  const handleOpenRevisions = async (entry: EntryDTO) => {
    setActiveEntryForRevisions(entry);
    setRevisionsModalOpen(true);
    try {
      const res = await api.get(`/entries/${entry.id}/revisions`);
      setEntryRevisionsList(res.data.revisions || []);
    } catch {
      setErrorToast(t('تعذر تحميل سجل التعديلات', 'Failed to load revisions'));
      setTimeout(() => setErrorToast(''), 3000);
    }
  };

  // Restore Revision
  const handleRestoreRevision = async (rev: any) => {
    if (!activeEntryForRevisions?.id) return;
    try {
      await api.put(`/entries/${activeEntryForRevisions.id}`, {
        title: rev.title,
        category: rev.category,
        timeFrom: rev.timeFrom,
        timeTo: rev.timeTo,
        description: rev.description
      });
      setRevisionsModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      setSaveToast(t('تمت استعادة النسخة السابقة بنجاح!', 'Revision restored successfully!'));
      setTimeout(() => setSaveToast(''), 3000);
    } catch {
      setErrorToast(t('تعذر استعادة النسخة', 'Failed to restore revision'));
      setTimeout(() => setErrorToast(''), 3000);
    }
  };

  // Helper to render procedural narrative
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

      {/* ── Main Container ─────────────────────────────────── */}
      <div className="bg-card border border-line rounded-2xl p-4 sm:p-6 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:bg-transparent">
        {/* Top Header & Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-line no-print">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-accent-dim text-accent">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
                <span>{t('التقرير الفتري الميداني المخصص', 'Custom Periodic Field Report')}</span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-accent text-white">
                  {isAr ? 'قسم مستقل' : 'Dedicated'}
                </span>
              </h2>
            </div>
            <p className="text-xs text-sub mt-1">
              {t(
                'توثيق رسمي مخصص لفترات التكليف (من تاريخ إلى تاريخ) مع دراسة دقيقة لأبعاد صفحات A4 وخارطة الترقيم الأكاديمي',
                'Custom field documentation for date intervals with studied A4 printable dimensions and academic pagination.'
              )}
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadDocx}
              disabled={downloadingDocx}
              className="px-3.5 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title={t('تنزيل تقرير الفترة كمستند Word رسمي (.docx)', 'Download periodic Word report (.docx)')}
            >
              <FileText className={`w-3.5 h-3.5 text-accent ${downloadingDocx ? 'animate-bounce' : ''}`} />
              <span>{downloadingDocx ? t('جارٍ تصدير Word...', 'Exporting Word...') : t('تقرير Word (.docx)', 'Word (.docx)')}</span>
            </button>

            <button
              onClick={() => setBatchModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-black text-white bg-accent hover:bg-accent/90 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title={t('إعادة صياغة وهيكلة مهام الفترة أكاديمياً بالذكاء الاصطناعي', 'Academic AI Restructure for Period')}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>{t('الصياغة الأكاديمية بالذكاء الاصطناعي', 'Academic AI Rewrite')}</span>
            </button>

            {/* Audit & Enforce Daily Q&A Format Button */}
            <button
              type="button"
              onClick={() => setAuditModalOpen(true)}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-sm text-white ${
                activeFreeformCount > 0
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 ring-2 ring-amber-400/50'
                  : 'bg-teal-700 hover:bg-teal-800'
              }`}
              title={t('فحص نمط تدوين مهام الفترة (نموذج الأسئلة vs النظام الحر) وتوحيدها بالتقرير لطباعتها', 'Audit daily logging style (Q&A vs Freeform)')}
            >
              <ListChecks className="w-3.5 h-3.5 text-white" />
              <span>{t('فحص وتوحيد نمط التدوين', 'Audit & Apply Q&A Style')}</span>
              {activeFreeformCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-300 text-slate-950">
                  {activeFreeformCount} {isAr ? 'حر' : 'free'}
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
                  ✓ {isAr ? 'منظم' : 'Q&A'}
                </span>
              )}
            </button>

            {/* AI Report Translation Button (AR ⇄ EN) */}
            <button
              type="button"
              onClick={() => handleTranslatePeriodEntries(lang === 'ar' ? 'en' : 'ar')}
              disabled={isTranslatingPeriod || activeEntries.length === 0}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-sm text-white ${
                isTranslatingPeriod ? 'bg-purple-600 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'
              } disabled:opacity-50`}
              title="ترجمة محتوى مهام الفترة بالكامل بالذكاء الاصطناعي مع حفظ نسخة احتياطية"
            >
              <Languages className={`w-3.5 h-3.5 ${isTranslatingPeriod ? 'animate-spin' : ''}`} />
              <span>
                {isTranslatingPeriod
                  ? (lang === 'ar' ? 'جارٍ ترجمة التقرير...' : 'Translating...')
                  : (lang === 'ar' ? 'ترجمة محتوى التقرير (English)' : 'ترجمة محتوى التقرير (عربي)')}
              </span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-ink hover:bg-ink/85 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title={t('طباعة التقرير الفتري مباشرة أو حفظه كـ PDF رسمي متناسق الأبعاد', 'Print periodic report or save as PDF')}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('طباعة / حفظ PDF', 'Print / Save PDF')}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('تم النسخ!', 'Copied!') : t('نسخ النص', 'Copy Text')}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Markdown</span>
            </button>

            {/* Language Switcher */}
            <div className="inline-flex p-0.5 bg-bg border border-line rounded-xl text-xs font-bold shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  lang === 'ar' ? 'bg-accent text-white shadow-xs font-black' : 'text-sub hover:text-ink'
                }`}
              >
                عربي
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  lang === 'en' ? 'bg-accent text-white shadow-xs font-black' : 'text-sub hover:text-ink'
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-line bg-bg text-sub hover:text-accent hover:border-accent/40 transition-colors shrink-0 shadow-2xs"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-ink" />}
            </button>
          </div>
        </div>

        {/* ── Page Blueprint & A4 Dimension Study Widget (دراسة الأبعاد وترتيب الصفحات) ── */}
        <div className="mb-6 p-4 bg-gradient-to-br from-card via-bg to-card border border-line rounded-2xl shadow-xs no-print">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-line">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-black text-ink uppercase tracking-wider">
                  {t('هندسة الأبعاد الأكاديمية وقياس الصفحات (A4 Blueprint)', 'A4 Dimensions & Page Blueprint Engine')}
                </h3>
              </div>
              <p className="text-[11px] text-sub">
                {t(
                  'تمت دراسة قياسات الصفحات طبقاً لمعايير الطباعة A4 الرسمية لمنع فيض النصوص أو التداخل بين الفصول',
                  'Studied according to official A4 standards to ensure zero content truncation or unplanned overflow.'
                )}
              </p>
            </div>

            {/* Total Page Counter Badge */}
            <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-line shadow-2xs">
              <div className="text-right">
                <div className="text-[10px] text-sub font-bold">{t('إجمالي صفحات التقرير المطبوع', 'Total Printable A4 Pages')}</div>
                <div className="text-sm font-black text-accent flex items-center gap-1.5">
                  <span>{totalPages} {isAr ? 'صفحات A4 رسمية' : 'A4 Pages'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-black">
                    {isAr ? 'مرقمة تلقائياً' : 'Auto Paginated'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sequence Roadmap & Page 1 Height Meter */}
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
            {/* Sequence Roadmap (8 cols) */}
            <div className="lg:col-span-8 bg-card p-3 rounded-xl border border-line flex flex-col justify-between">
              <div className="text-[11px] font-bold text-sub mb-2 flex items-center justify-between">
                <span>{t('خارطة تسلسل وتوزيع صفحات التقرير:', 'Report Page Sequence Roadmap:')}</span>
                <span className="text-[10px] text-accent font-black">{customPeriodLabel}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Step 1: Cover & Freehand Narrative */}
                <div className="p-2 bg-bg rounded-lg border border-line/80 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-black text-accent">{isAr ? 'صفحة 1' : 'Page 1'}</div>
                    <div className="font-extrabold text-ink text-[11px] mt-0.5">{isAr ? 'الغلاف والسرد الحر' : 'Cover & Narrative'}</div>
                  </div>
                  <div className="text-[10px] text-sub mt-2">{isAr ? 'الهوية + المتدرب + التكليف' : 'Header + Matrix + Role'}</div>
                </div>

                {/* Step 2: Task Matrix */}
                <div className="p-2 bg-bg rounded-lg border border-line/80 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-black text-accent">{isAr ? 'صفحة 2' : 'Page 2'}</div>
                    <div className="font-extrabold text-ink text-[11px] mt-0.5">{isAr ? 'مصفوفة المهام' : 'Tasks Matrix'}</div>
                  </div>
                  <div className="text-[10px] text-sub mt-2">{activeEntries.length} {isAr ? 'مهام موثقة' : 'logged tasks'}</div>
                </div>

                {/* Step 3: Daily Logs */}
                <div className={`p-2 rounded-lg border flex flex-col justify-between ${
                  includeDaily ? 'bg-bg border-line/80' : 'bg-sub/5 border-dashed border-line opacity-60'
                }`}>
                  <div>
                    <div className="text-[10px] font-black text-accent">
                      {includeDaily ? (isAr ? `صفحات 3 .. ${2 + dailyLogsPageCount}` : `Pages 3..${2 + dailyLogsPageCount}`) : (isAr ? 'مستثنى' : 'Excluded')}
                    </div>
                    <div className="font-extrabold text-ink text-[11px] mt-0.5">{isAr ? 'السرد اليومي' : 'Daily Logs'}</div>
                  </div>
                  <div className="text-[10px] text-sub mt-2">
                    {includeDaily ? `${dailyLogsPageCount} ${isAr ? 'صفحة مفصلة' : 'pages'}` : (isAr ? 'غير مفعل' : 'Disabled')}
                  </div>
                </div>

                {/* Step 4: Evidence & Signatures */}
                <div className={`p-2 rounded-lg border flex flex-col justify-between ${
                  includeSig ? 'bg-bg border-line/80' : 'bg-sub/5 border-dashed border-line opacity-60'
                }`}>
                  <div>
                    <div className="text-[10px] font-black text-accent">
                      {includeSig ? (isAr ? `صفحة ${totalPages}` : `Page ${totalPages}`) : (isAr ? 'مستثنى' : 'Excluded')}
                    </div>
                    <div className="font-extrabold text-ink text-[11px] mt-0.5">{isAr ? 'الشواهد والمصادقة' : 'Evidence & Sign'}</div>
                  </div>
                  <div className="text-[10px] text-sub mt-2">
                    {includeSig ? (isAr ? 'تواقيع الاعتماد' : 'Endorsements') : (isAr ? 'غير مفعل' : 'Disabled')}
                  </div>
                </div>
              </div>
            </div>

            {/* Page 1 Height / Capacity Meter (4 cols) */}
            <div className="lg:col-span-4 bg-card p-3 rounded-xl border border-line flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-sub mb-1">
                  <span>{t('مؤشر سعة صفحة الغلاف (صفحة 1):', 'Page 1 Height & Capacity Meter:')}</span>
                  <span className={`font-black ${isPage1Overfilled ? 'text-warn' : page1CapacityPct > 80 ? 'text-amber-500' : 'text-ok'}`}>
                    {page1CapacityPct}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-bg rounded-full overflow-hidden border border-line/60">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isPage1Overfilled
                        ? 'bg-warn'
                        : page1CapacityPct > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${page1CapacityPct}%` }}
                  />
                </div>
              </div>

              <div className="text-[10px] text-sub mt-2 leading-relaxed">
                {isPage1Overfilled ? (
                  <span className="text-warn font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{t('تنبيه: السرد الحر طويل، قد يتجاوز صفحة 1 إلى صفحة إضافية قبل مصفوفة المهام.', 'Text is long and may spill onto page 2 before the matrix.')}</span>
                  </span>
                ) : page1CapacityPct > 80 ? (
                  <span className="text-amber-600 font-bold">
                    {t('سعة ممتلئة بالكامل — الغلاف والسرد يستغلان كامل الصفحة بدون فراغات زائدة.', 'Full capacity — nicely fills Page 1 without spill.')}
                  </span>
                ) : (
                  <span className="text-emerald-600 font-bold">
                    {t('أبعاد مثالية — الغلاف والسرد الحر سيندمجان في صفحة A4 واحدة متكاملة.', 'Ideal dimensions — cover and narrative fit perfectly on Page 1.')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Saved Periodic Reports Manager ───────────────────────── */}
        <PeriodicReportsManager
          currentReport={activePeriodicReport}
          savedReportsList={savedPeriodicReports}
          activeEntries={activeEntries}
          activeTotalHours={activeTotalHours}
          activeTotalDays={activeTotalDays}
          onSelectReport={handleSelectPeriodicReport}
          onUpdateReport={handleUpdatePeriodicReport}
          onSaveCurrentReport={handleSaveCurrentPeriodicReport}
          onCreateNewReport={handleCreateNewPeriodicReport}
          onDeleteCurrentReport={handleDeleteCurrentPeriodicReport}
          allDocumentedEntries={allDocumentedEntries}
        />

        {/* ── Printable Paper View: #periodic-paper-view ───────────── */}
        <div id="periodic-paper-view" className="space-y-8 mt-6">

          {/* ══════════════════════════════════════════════════════════════
              PAGE 1: Official Institutional General Cover Page with
              Periodic Custom Modifications & Freehand Narrative
             ══════════════════════════════════════════════════════════════ */}
          <section
            id="periodic-cover-page"
            className="bg-card border border-line rounded-2xl p-6 sm:p-8 print:p-0 print:border-none print:shadow-none print:rounded-none min-h-[620px] print:min-h-[265mm] print:max-h-[270mm] flex flex-col justify-between"
          >
            {/* Header: Kingdom Header & Dual Logos */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-line gap-4">
                {/* Right: Institution info / Logo */}
                <div className="text-right flex items-center gap-3">
                  {profile.institutionLogo ? (
                    <img
                      src={profile.institutionLogo}
                      alt="Institution Logo"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg border border-line print:border-none shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-accent-dim text-accent flex items-center justify-center font-black text-xs shrink-0 print:border print:border-slate-300">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="text-[11px] font-black text-ink">{isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}</div>
                    <div className="text-[10px] text-sub font-bold">{isAr ? 'وزارة التعليم' : 'Ministry of Education'}</div>
                    <div className="text-[10px] text-accent font-black">{profile.trainingUnit || (isAr ? 'الكلية / الجامعة' : 'College / University')}</div>
                  </div>
                </div>

                {/* Upload logo buttons (no-print) */}
                <div className="no-print flex items-center gap-1.5">
                  <input
                    type="file"
                    ref={institutionLogoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUploadLogo('institution', e.target.files[0])}
                  />
                  <input
                    type="file"
                    ref={companyLogoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUploadLogo('company', e.target.files[0])}
                  />
                  <button
                    type="button"
                    onClick={() => institutionLogoInputRef.current?.click()}
                    className="px-2 py-1 text-[10px] font-bold text-sub hover:text-ink bg-bg rounded-lg border border-line"
                    title="تغيير شعار الجامعة أو الكلية"
                  >
                    {isAr ? 'شعار الجامعة' : 'Uni Logo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => companyLogoInputRef.current?.click()}
                    className="px-2 py-1 text-[10px] font-bold text-sub hover:text-ink bg-bg rounded-lg border border-line"
                    title="تغيير شعار جهة التدريب"
                  >
                    {isAr ? 'شعار الجهة' : 'Co Logo'}
                  </button>
                </div>

                {/* Left: Training Company Logo */}
                <div className="text-left flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-[11px] font-black text-ink">{profile.entityAddress || entityName}</div>
                    <div className="text-[10px] text-sub font-bold">{activePeriodicReport.department || (isAr ? 'الإدارة المعنية' : 'Department')}</div>
                  </div>
                  {profile.companyLogo ? (
                    <img
                      src={profile.companyLogo}
                      alt="Company Logo"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg border border-line print:border-none shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-accent-dim text-accent flex items-center justify-center font-black text-xs shrink-0 print:border print:border-slate-300">
                      <Building className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>

              {/* Main Report Title Banner */}
              <div className="text-center py-4 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-accent text-white shadow-2xs">
                  <span>{customPeriodLabel}</span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-ink tracking-tight pt-1">
                  {activePeriodicReport.title || (isAr ? 'تقرير التدريب التعاوني الفتري - توثيق الأنشطة والمهام الميدانية' : 'Periodic Field Co-op Training Report')}
                </h1>
                <p className="text-xs text-sub font-bold">
                  {isAr
                    ? `توثيق رسمي صادر لمهام المتدرب بجهة التدريب: ${profile.entityAddress || entityName}`
                    : `Official field documentation issued for: ${profile.entityAddress || entityName}`}
                </p>
              </div>

              {/* Trainee Information Matrix on Cover */}
              <div className="bg-bg border border-line rounded-xl p-3 sm:p-4 text-start grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs trainee-matrix-print print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/60 print:p-2.5 print:gap-x-4 print:gap-y-1.5">
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'اسم المتدرب:' : 'Trainee Name:'}</span>
                  <span className="font-black text-ink">{normalizeStudentName(profile.studentName) || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'الرقم الأكاديمي:' : 'Student ID:'}</span>
                  <span className="font-black text-ink">{profile.trainingNumber || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'القسم / التخصص:' : 'Major / Specialization:'}</span>
                  <span className="font-black text-ink">{profile.department || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'المشرف الميداني:' : 'Field Supervisor:'}</span>
                  <span className="font-black text-ink">{profile.responsibleName || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'الإدارة / القسم الميداني:' : 'Field Department:'}</span>
                  <span className="font-black text-accent">{activePeriodicReport.department || profile.entityAddress || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'الصفة ونطاق التكليف:' : 'Operational Role:'}</span>
                  <span className="font-black text-ink">{activePeriodicReport.roleAssignment || (isAr ? 'متدرب ميداني' : 'Trainee')}</span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-bold text-sub">{isAr ? 'أيام العمل المنجزة:' : 'Work Days:'}</span>
                  <span className="font-black text-ink">{activeTotalDays} {isAr ? 'أيام' : 'days'}</span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-bold text-sub">{isAr ? 'إجمالي الساعات الميدانية:' : 'Total Hours:'}</span>
                  <span className="font-black text-ink">{activeTotalHours} {isAr ? 'ساعة تدريبية' : 'hours'}</span>
                </div>
              </div>

              {/* Freehand Narrative & Operational Scope Card (Directly Below Trainee Matrix on Page 1) */}
              <div className="mt-3 p-3.5 sm:p-4 bg-bg border border-accent/30 rounded-xl space-y-2 text-start print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/40 print:p-3 shadow-2xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-line/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs font-black text-ink">
                      {isAr ? '■ بيان التكليف والمهام الميدانية للفترة (السرد الإداري والحر):' : '■ Operational Scope & Freehand Narrative:'}
                    </span>
                  </div>
                  <span className="text-[10px] text-accent font-bold px-2 py-0.5 rounded-md bg-accent-dim">
                    {isAr ? 'توثيق رسمي معتمد' : 'Official Record'}
                  </span>
                </div>

                <div className="text-xs font-medium text-ink leading-relaxed whitespace-pre-line text-justify print:text-[10pt] print:leading-[1.75]">
                  {activePeriodicReport.customNarrative?.trim() || (
                    <span className="text-sub italic">
                      {isAr
                        ? `خلال هذه الفترة الممتدة من ${customPeriodLabel}، تم التكليف بالعمل الميداني كـ ${activePeriodicReport.roleAssignment || 'متدرب'} في ${activePeriodicReport.department || entityName}، حيث تم إنجاز حزمة من المهام التشغيلية والهندسية المتخصصة وحضور اللقاءات التنسيقية وتطبيق أعلى معايير الجودة والسلامة المهنية.`
                        : `During this period (${customPeriodLabel}), assigned as ${activePeriodicReport.roleAssignment || 'Trainee'} at ${activePeriodicReport.department || entityName}, successfully accomplishing operational and engineering tasks.`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Page 1 Footer */}
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[10px] text-sub font-bold">
              <span>{isAr ? 'المملكة العربية السعودية — التقرير الفتري الميداني' : 'KSA — Periodic Field Report'}</span>
              <span className="font-black text-accent">{isAr ? `صفحة 1 من ${totalPages}` : `Page 1 of ${totalPages}`}</span>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              PAGE 2: Executive Tasks Matrix & Activity Inventory Table
             ══════════════════════════════════════════════════════════════ */}
          <section
            id="periodic-matrix-page"
            className="bg-card border border-line rounded-2xl p-6 sm:p-8 print:p-0 print:border-none print:shadow-none print:rounded-none min-h-[620px] print:min-h-[265mm] print:break-before-page flex flex-col justify-between"
          >
            <div>
              {/* Page 2 Header */}
              <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
                <div>
                  <h3 className="text-sm font-black text-ink flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-accent" />
                    <span>{isAr ? 'جدول حصر وتوثيق أنشطة ومهام الفترة الميدانية' : 'Field Tasks Executive Matrix'}</span>
                  </h3>
                  <p className="text-[11px] text-sub mt-0.5">
                    {isAr
                      ? `حصر شامل لمهام الفترة (${customPeriodLabel}) — ${activeEntries.length} مهمة موثقة بمجموع ${activeTotalHours} ساعة`
                      : `Summary of tasks during ${customPeriodLabel} — ${activeEntries.length} tasks totaling ${activeTotalHours} hours`}
                  </p>
                </div>
                <div className="text-xs font-black text-accent bg-accent-dim px-2.5 py-1 rounded-lg">
                  {activeTotalDays} {isAr ? 'أيام عمل' : 'Work Days'}
                </div>
              </div>

              {/* Tasks Matrix Table */}
              <div className="overflow-x-auto border border-line rounded-xl">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="bg-bg text-ink font-black border-b border-line">
                      <th className="py-2.5 px-3 text-start w-12">{isAr ? 'م' : '#'}</th>
                      <th className="py-2.5 px-3 text-start w-28">{isAr ? 'التاريخ واليوم' : 'Date'}</th>
                      <th className="py-2.5 px-3 text-start w-48">{isAr ? 'عنوان المهمة المنجزة' : 'Task Title'}</th>
                      <th className="py-2.5 px-3 text-start w-40">{isAr ? 'التصنيف الهندسي' : 'Category'}</th>
                      <th className="py-2.5 px-3 text-start w-20">{isAr ? 'الساعات' : 'Hours'}</th>
                      <th className="py-2.5 px-3 text-start">{isAr ? 'موجز الإنجاز الميداني' : 'Executive Description'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {activeEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sub">
                          {isAr ? 'لا توجد مهام مسجلة ضمن نطاق هذه التواريخ.' : 'No tasks logged in this date range.'}
                        </td>
                      </tr>
                    ) : (
                      activeEntries.map((e, idx) => {
                        const h = calculateHoursBetween(e.timeFrom || '08:00', e.timeTo || '16:00');
                        const dateFormatted = isAr ? formatDateArabic(e.entryDate) : formatDateEnglish(e.entryDate);
                        const cleanDesc = e.description?.replace(/[*#]/g, '').slice(0, 110) + '...';
                        return (
                          <tr key={e.id} className="hover:bg-bg/60 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-sub">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-ink whitespace-nowrap">{dateFormatted}</td>
                            <td className="py-2.5 px-3 font-black text-ink">{elevateTaskTitle(e.title, e.description, isAr)}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-dim text-accent">
                                {formatCategory(e.category, isAr)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-black text-ink">{h} {isAr ? 'س' : 'h'}</td>
                            <td className="py-2.5 px-3 text-sub leading-snug">{cleanDesc}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Academic Page 2 Footer */}
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[10px] text-sub font-bold">
              <span>{isAr ? 'المملكة العربية السعودية — مصفوفة مهام الفترة الميدانية' : 'KSA — Field Tasks Executive Matrix'}</span>
              <span className="font-black text-accent">{isAr ? `صفحة 2 من ${totalPages}` : `Page 2 of ${totalPages}`}</span>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              PAGES 3..N: Day-by-Day Written Logs (If includeDaily is true)
              STRICTLY 1 Page Per Day in Print View
             ══════════════════════════════════════════════════════════════ */}
          {includeDaily && activeEntries.map((entry, idx) => {
            const pageNum = 3 + idx;
            const hours = calculateHoursBetween(entry.timeFrom, entry.timeTo);
            const dateStr = isAr ? formatDateArabic(entry.entryDate) : formatDateEnglish(entry.entryDate);

            return (
              <section
                key={entry.id}
                className="day-card-print bg-card border border-line rounded-2xl p-6 sm:p-8 print:p-0 print:border-none print:shadow-none print:rounded-none min-h-[620px] print:min-h-[265mm] print:break-before-page flex flex-col justify-between"
              >
                <div>
                  {/* Day Header Box */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-bg rounded-xl border border-line mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-black text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-black text-ink">{dateStr}</div>
                        <div className="text-[11px] text-sub font-bold flex items-center gap-2 mt-0.5">
                          <span>{entry.timeFrom || '08:00'} - {entry.timeTo || '16:00'}</span>
                          <span>&middot;</span>
                          <span className="text-accent">{hours} {isAr ? 'ساعات تدريبية' : 'training hours'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Edit/Delete buttons (no-print) */}
                    <div className="no-print flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleOpenRevisions(entry)}
                        className="p-1.5 text-xs text-sub hover:text-ink bg-card rounded-lg border border-line"
                        title="سجل التعديلات السابقة والتراجع"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(entry)}
                        className="p-1.5 text-xs text-sub hover:text-ink bg-card rounded-lg border border-line"
                        title="تعديل هذا اليوم"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1.5 text-xs text-sub hover:text-warn bg-card rounded-lg border border-line"
                        title="حذف هذا اليوم"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Task Title & Engineering Category */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-sub">{isAr ? 'عنوان المهمة:' : 'Task Title:'}</span>
                      <h4 className="text-sm font-black text-ink">{elevateTaskTitle(entry.title, entry.description, isAr)}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-dim text-accent mr-auto">
                        {formatCategory(entry.category, isAr)}
                      </span>
                    </div>
                  </div>

                  {/* Procedural Narrative View */}
                  <div className="procedural-narrative-box bg-bg/50 border border-line/60 rounded-xl p-4 sm:p-5 print:p-0 print:border-none print:bg-transparent">
                    {renderProceduralNarrative(entry.description, entry.timeFrom)}
                  </div>
                </div>

                {/* Day Page Academic Footer */}
                <div className="mt-6 pt-3 border-t border-line flex items-center justify-between text-[10px] text-sub font-bold">
                  <span>{isAr ? `المملكة العربية السعودية — السرد اليومي المفصل (${dateStr})` : `KSA — Daily Task Log (${dateStr})`}</span>
                  <span className="font-black text-accent">{isAr ? `صفحة ${pageNum} من ${totalPages}` : `Page ${pageNum} of ${totalPages}`}</span>
                </div>
              </section>
            );
          })}

          {/* ══════════════════════════════════════════════════════════════
              FINAL PAGE: Photographic Evidence & Official Signatures
             ══════════════════════════════════════════════════════════════ */}
          {includeSig && (
            <section
              id="periodic-evidence-page"
              className="bg-card border border-line rounded-2xl p-6 sm:p-8 print:p-0 print:border-none print:shadow-none print:rounded-none min-h-[620px] print:min-h-[265mm] print:break-before-page flex flex-col justify-between"
            >
              <div>
                {/* Final Page Header */}
                <div className="pb-3 border-b border-line mb-4">
                  <h3 className="text-sm font-black text-ink flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-accent" />
                    <span>{isAr ? 'الشواهد الميدانية والاعتماد والمصادقة الإشرافية' : 'Field Evidence & Supervisory Endorsement'}</span>
                  </h3>
                  <p className="text-[11px] text-sub mt-0.5">
                    {isAr
                      ? 'توثيق شواهد الفترة الميدانية ومصادقة المشرف الميداني والمشرف الأكاديمي'
                      : 'Photographic evidence and official supervisor sign-offs for this period'}
                  </p>
                </div>

                {/* Evidence Photos Gallery */}
                <div className="mb-6">
                  {customEvidenceList.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {customEvidenceList.map((ev, i) => (
                        <div key={i} className="border border-line rounded-xl overflow-hidden bg-bg">
                          <img
                            src={ev.imageData}
                            alt={ev.caption || 'Field Evidence'}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-2 text-[10px] font-bold text-sub truncate text-center">
                            {ev.caption || (isAr ? `شكل توثيقي ${i + 1}` : `Figure ${i + 1}`)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-bg rounded-xl border border-dashed border-line text-center text-xs text-sub">
                      {isAr ? 'لا توجد شواهد مصورة مرفقة لهذه الفترة.' : 'No photographic evidence attached for this period.'}
                    </div>
                  )}
                </div>

                {/* Tripartite Official Endorsement Signatures Box */}
                <div className="endorsement-box-print bg-bg border border-line rounded-xl p-4 sm:p-5 print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/60 shadow-2xs">
                  <div className="text-xs font-black text-ink mb-3 pb-2 border-b border-line/60">
                    {isAr ? 'المصادقة والاعتماد الرسمي لتقرير الفترة:' : 'Official Sign-off & Supervisory Endorsement:'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    {/* Trainee Signature */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-card border border-line/60 print:bg-transparent print:border-none">
                      <div className="font-bold text-accent text-[11px]">{isAr ? 'توقيع المتدرب:' : 'Trainee Signature:'}</div>
                      <div className="font-black text-ink">{normalizeStudentName(profile.studentName) || '—'}</div>
                      <div className="text-[10px] text-sub pt-2">{isAr ? 'التوقيع: ....................' : 'Sign: ....................'}</div>
                    </div>

                    {/* Field Supervisor Signature */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-card border border-line/60 print:bg-transparent print:border-none">
                      <div className="font-bold text-accent text-[11px]">{isAr ? 'اعتماد المشرف الميداني:' : 'Field Supervisor Approval:'}</div>
                      <div className="font-black text-ink">{profile.responsibleName || '....................'}</div>
                      <div className="text-[10px] text-sub pt-2">{isAr ? 'التوقيع والختم: ....................' : 'Sign & Stamp: ....................'}</div>
                    </div>

                    {/* Academic Supervisor Signature */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-card border border-line/60 print:bg-transparent print:border-none">
                      <div className="font-bold text-accent text-[11px]">{isAr ? 'اعتماد المشرف الأكاديمي:' : 'Academic Supervisor Approval:'}</div>
                      <div className="font-black text-ink">{profile.academicSupervisor || '....................'}</div>
                      <div className="text-[10px] text-sub pt-2">{isAr ? 'التوقيع: ....................' : 'Sign: ....................'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Page Academic Footer */}
              <div className="mt-6 pt-3 border-t border-line flex items-center justify-between text-[10px] text-sub font-bold">
                <span>{isAr ? 'المملكة العربية السعودية — مصادقة واعتماد الفترة الميدانية' : 'KSA — Supervisory Endorsement'}</span>
                <span className="font-black text-accent">{isAr ? `صفحة ${totalPages} من ${totalPages}` : `Page ${totalPages} of ${totalPages}`}</span>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* ── Modals: Edit Entry, Revisions, Batch Rewrite, Audit, Diff ── */}
      {/* Edit Entry Modal */}
      {isEditModalOpen && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-card border border-line rounded-2xl w-full max-w-xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-sm font-black text-ink flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-accent" />
                <span>{t('تعديل مهمة التدريب', 'Edit Training Task')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-sub hover:text-ink hover:bg-bg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-sub font-bold mb-1">{t('عنوان المهمة', 'Task Title')}</label>
                <input
                  type="text"
                  value={editingEntry.title || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-ink font-bold focus:border-accent outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sub font-bold mb-1">{t('التاريخ', 'Date')}</label>
                  <input
                    type="date"
                    value={editingEntry.entryDate || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, entryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-ink font-bold focus:border-accent outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-sub font-bold mb-1">{t('التصنيف', 'Category')}</label>
                  <select
                    value={isCustomCategory ? '__custom__' : editingEntry.category || ''}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                        setEditingEntry({ ...editingEntry, category: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-ink font-bold focus:border-accent outline-hidden"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__custom__">-- {t('تصنيف هندسي مخصص', 'Custom Category')} --</option>
                  </select>
                </div>
              </div>

              {isCustomCategory && (
                <div>
                  <label className="block text-sub font-bold mb-1">{t('اسم التصنيف المخصص', 'Custom Category Name')}</label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-ink font-bold focus:border-accent outline-hidden"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sub font-bold mb-1">{t('من الساعة', 'From')}</label>
                  <input
                    type="time"
                    value={editingEntry.timeFrom || '08:00'}
                    onChange={(e) => setEditingEntry({ ...editingEntry, timeFrom: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-ink font-bold focus:border-accent outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-sub font-bold mb-1">{t('إلى الساعة', 'To')}</label>
                  <input
                    type="time"
                    value={editingEntry.timeTo || '16:00'}
                    onChange={(e) => setEditingEntry({ ...editingEntry, timeTo: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-ink font-bold focus:border-accent outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sub font-bold mb-1">{t('تفاصيل وسرد المهمة', 'Description')}</label>
                <textarea
                  rows={6}
                  value={editingEntry.description || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                  className="w-full px-3 py-2 bg-bg border border-line rounded-xl text-ink leading-relaxed focus:border-accent outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-sub hover:text-ink bg-bg rounded-xl border border-line"
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveEntryEdit}
                className="px-4 py-2 text-xs font-black text-white bg-accent hover:bg-accent/90 rounded-xl shadow-xs"
              >
                {t('حفظ التعديلات', 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revisions History Modal */}
      {revisionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-card border border-line rounded-2xl w-full max-w-xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-sm font-black text-ink flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-accent" />
                <span>{t('سجل التعديلات والإصدارات السابقة', 'Revision History')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setRevisionsModalOpen(false)}
                className="p-1 rounded-lg text-sub hover:text-ink hover:bg-bg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {entryRevisionsList.length === 0 ? (
                <div className="p-6 text-center text-xs text-sub">
                  {t('لا توجد تعديلات سابقة مسجلة لهذه المهمة.', 'No previous revisions found for this task.')}
                </div>
              ) : (
                entryRevisionsList.map((rev, i) => (
                  <div key={rev.id || i} className="p-3 bg-bg border border-line rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-ink">{rev.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRestoreRevision(rev)}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-accent rounded-lg"
                      >
                        {t('استعادة هذه النسخة', 'Restore')}
                      </button>
                    </div>
                    <div className="text-sub text-[11px] leading-relaxed line-clamp-3">{rev.description}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch Rewrite Modal */}
      {batchModalOpen && (
        <BatchRewriteModal
          isOpen={batchModalOpen}
          onClose={() => setBatchModalOpen(false)}
          totalEntries={activeEntries.length}
          weekNumber={1}
          onSuccess={async () => {
            await queryClient.invalidateQueries({ queryKey: ['finalReport'] });
            await queryClient.invalidateQueries({ queryKey: ['entries'] });
            setSaveToast(t('تم تطبيق الصياغة الأكاديمية بنجاح!', 'Academic rewrite applied successfully!'));
            setTimeout(() => setSaveToast(''), 3000);
          }}
        />
      )}

      {/* Daily Format Audit Modal */}
      {auditModalOpen && (
        <DailyFormatAuditModal
          isOpen={auditModalOpen}
          onClose={() => setAuditModalOpen(false)}
          entries={activeEntries}
          weekNumber={1}
          onSuccess={async () => {
            await queryClient.invalidateQueries({ queryKey: ['finalReport'] });
            await queryClient.invalidateQueries({ queryKey: ['entries'] });
            setSaveToast(t('تم توحيد نمط الأسئلة لمهام الفترة بنجاح!', 'Daily format unified successfully!'));
            setTimeout(() => setSaveToast(''), 3000);
          }}
        />
      )}

      {/* Diff Modal */}
      {diffModalOpen && (
        <DiffModal
          isOpen={diffModalOpen}
          onClose={() => setDiffModalOpen(false)}
          actionTitle={diffTitle}
          originalText={originalText}
          improvedText={improvedText}
          diffChunks={diffChunks}
          onAccept={() => {
            if (editingEntry) {
              setEditingEntry({ ...editingEntry, description: improvedText });
            }
            setDiffModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
