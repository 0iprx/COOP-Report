import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { FinalReportData, ProfileInput, DiffChunk, formatDateArabic, formatDateEnglish, countWords, calculateHoursBetween, REPORT_TEMPLATES, ReportTemplateId } from '@coop/shared';
import {
  FileText,
  Sparkle,
  Upload,
  Layers,
  BookOpen,
  LayoutTemplate,
  Trash2,
  GraduationCap,
  Building,
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
  FileCheck,
  AlertCircle,
  Clock,
  RotateCcw,
  RotateCw,
  History,
  Pin,
  X,
  Eye,
  ArrowRight,
  Compass,
  Lightbulb,
  Award,
  HelpCircle,
  ListChecks
} from 'lucide-react';
import { DiffModal } from '../common/DiffModal';

const PROFILE_DRAFT_KEY = 'coop_profile_draft_v2';
const PROFILE_HISTORY_KEY = 'coop_profile_history_v2';

interface FinalReportTabProps {
  currentLang: 'ar' | 'en';
}

interface ReportVersionSnapshot {
  id: string;
  timestamp: string;
  timeFormatted: string;
  label: string;
  data: ProfileInput;
  wordCount: number;
}

function translateCategory(cat: string, isAr: boolean): string {
  if (isAr) return cat;
  const map: Record<string, string> = {
    'تطوير / برمجة': 'Development & Programming',
    'اجتماعات': 'Meetings & Alignment',
    'تدريب وتعلّم': 'Training & Learning',
    'توثيق': 'Documentation',
    'دعم فني': 'Technical Support',
    'أخرى': 'Other'
  };
  return map[cat] || cat;
}

const toArabicIndic = (num: number | string): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w]);
};

const getArabicWeekName = (index: number): string => {
  const names = [
    'الأسبوع الأول',
    'الأسبوع الثاني',
    'الأسبوع الثالث',
    'الأسبوع الرابع',
    'الأسبوع الخامس',
    'الأسبوع السادس',
    'الأسبوع السابع',
    'الأسبوع الثامن',
    'الأسبوع التاسع',
    'الأسبوع العاشر',
    'الأسبوع الحادي عشر',
    'الأسبوع الثاني عشر',
    'الأسبوع الثالث عشر',
    'الأسبوع الرابع عشر',
    'الأسبوع الخامس عشر',
    'الأسبوع السادس عشر'
  ];
  return names[index - 1] || `الأسبوع ${index}`;
};

export const getWeekTopic = (w: { weekIndex: number; entries?: { title: string }[] }, isAr: boolean = true): string => {
  if (w.entries && w.entries.length > 0) {
    const firstTitle = w.entries[0].title.replace(/\s*[-—–]\s*(اليوم|Day)\s*\d+.*$/i, '').trim();
    if (firstTitle && firstTitle.length > 3) return firstTitle;
  }
  const defaultTopicsAr = [
    'التهيئة والتعريف بأنظمة المنشأة وسياسات أمن المعلومات',
    'استكشاف البنية التحتية والبيئة التشغيلية للخوادم',
    'إدارة وصيانة شبكات الاتصال وتوصيلات الألياف الضوئية',
    'تكوين وإدارة خوادم قواعد البيانات والنسخ الاحتياطي',
    'مراقبة أداء الشبكات وإعداد جدران الحماية السيبرانية',
    'مراجعة مؤشرات الأداء والتقييم النصفي مع المشرف الميداني',
    'أتمتة العمليات التشغيلية وإدارة الخدمات السحابية',
    'صيانة الخوادم وإدارة وحدات تزويد الطاقة الاحتياطية',
    'تحليل سجلات الأمان وإجراءات الاستجابة للحوادث الرقمية',
    'تحديث البنية التحتية واختبار خطة التعافي من الكوارث',
    'ورش العمل الهندسية وتطوير الحلول البرمجية المؤسسية',
    'توثيق إجراءات التشغيل القياسية وتحديث الأدلة الفنية',
    'اختبار تكامل الأنظمة وضمان الجودة والمطابقة الفنية',
    'مناقشة التقرير الفني الختامي واعتماد مخرجات التدريب'
  ];
  return isAr
    ? (defaultTopicsAr[w.weekIndex - 1] || `المهام والأعمال الفنية للأسبوع ${w.weekIndex}`)
    : `Week ${w.weekIndex} Technical Activities`;
};


export interface ReportSample {
  id: string;
  name: string;
  institution: string;
  templateId: ReportTemplateId;
  specialty: string;
  hostCompany: string;
  studentTitle: string;
  executiveSummary: string;
  introText: string;
  entityIntroText: string;
  skillsText: string;
  challengesText: string;
  conclusionText: string;
}

export const ACTUAL_PREVIOUS_REPORTS: ReportSample[] = [
  {
    id: 'tvtc-network',
    name: 'نموذج الكليات التقنية والاتصالات (TVTC)',
    institution: 'كلية الاتصالات والمعلومات بالرياض (المؤسسة العامة للتدريب التقني والمهني)',
    templateId: 'tvtc',
    specialty: 'إدارة وتأمين شبكات الحاسب (Network Administration)',
    hostCompany: 'شركة الاتصالات السعودية (stc - قطاع العمليات والشبكات)',
    studentTitle: 'تهيئة وإدارة البنية التحتية لشبكات الألياف الضوئية والخوادم الافتراضية',
    executiveSummary: 'يمثل هذا التقرير التوثيق النهائي لفترة التدريب التعاوني في قطاع العمليات والشبكات بشركة stc على مدار 14 أسبوعاً (320 ساعة ميدانية معتمدة). شملت المهام صيانة كبائن التوزيع (MDF/IDF)، وتكوين شبكات الاتصال المحلية الافتراضية (VLANs) على محولات Cisco Catalyst، وربط خطوط المشتركين بنظام الألياف الضوئية (FTTH)، ورصد أداء الشبكة ومعالجة 84 تذكرة بلاغ عطل فني وفق مؤشرات الأداء (SLA).',
    introText: 'انطلاقاً من الخطة التدريبية المعتمدة بالكلية، يهدف هذا المقرر الميداني إلى تطبيق المعارف والمهارات المكتسبة في معامل الكلية على بيئة العمل المؤسسية الفعلية، والتعرف على المعايير الصناعية المعتمدة في إدارة الشبكات وتقنيات الاتصال الحديثة.',
    entityIntroText: 'تعد شركة الاتصالات السعودية (stc) رائدة التحول الرقمي ومزود الاتصالات الرائد في الشرق الأوسط. يتميز قطاع الشبكات والعمليات ببيئة عمل احترافية تدير آلاف المقاسم والخوادم ومراكز البيانات الموزعة، مع الالتزام الصارم بضوابط الأمان واستمرارية الخدمة بنسبة توافر 99.99%.',
    skillsText: '• المهارات الفنية: برمجة وتكوين محولات وموجهات Cisco، فحص توصيلات الألياف الضوئية بجهاز OTDR، تركيب وتأريض كبائن الاتصالات، وضبط جدران الحماية Fortinet.\n• المهارات الشخصية: التواصل الفني، العمل في نوبات الطوارئ، وتوثيق الإجراءات القياسية (SOP).',
    challengesText: 'واجه الفريق تذبذباً في إشارات بعض خطوط الألياف الضوئية لأحد القطاعات؛ تم استخدام جهاز فحص الانكسار الضوئي وتحديد نقطة الانحناء الحرج وإعادة لحام الشعيرات، مما استعاد جودة الإشارة بنسبة 100%.',
    conclusionText: 'أثبتت فترة التدريب التعاوني أهميتها المحورية في تجسير الفجوة بين الجانبين الأكاديمي والعملي، وساهمت في تعزيز الثقة والجاهزية للانخراط في سوق العمل التقني بكفاءة عالية واحترافية تامة.'
  },
  {
    id: 'kfupm-software',
    name: 'نموذج جامعة الملك فهد للبترول والمعادن (KFUPM)',
    institution: 'جامعة الملك فهد للبترول والمعادن (King Fahd University of Petroleum & Minerals)',
    templateId: 'modern',
    specialty: 'هندسة البرمجيات والأنظمة السحابية (Software Engineering & Cloud Architecture)',
    hostCompany: 'أرامكو السعودية (Saudi Aramco - Information Technology Services)',
    studentTitle: 'Architecting Scalable Microservices & Automated CI/CD Pipelines on Azure Cloud',
    executiveSummary: 'This COOP report presents the technical outcomes of a 15-week field engineering assignment at Saudi Aramco IT Services. The project focused on containerizing legacy corporate portals, modernizing monolithic architectures into microservices using Docker and Kubernetes, and establishing end-to-end automated CI/CD pipelines via Azure DevOps. The work resulted in decreasing deployment cycle times by 68% and improving service resilience.',
    introText: 'Cooperative training at KFUPM represents a rigorous transition from academic theoretical rigor to real-world industrial software engineering, challenging students to apply computing principles and system design methodologies to mission-critical corporate applications.',
    entityIntroText: 'Saudi Aramco Information Technology operates one of the most sophisticated computing infrastructures in the global energy sector, providing enterprise cloud solutions, supercomputing capabilities, cybersecurity defenses, and digital oilfield automation across international operations.',
    skillsText: '• Technical Competencies: Kubernetes cluster orchestration, Docker containerization, TypeScript/Node.js backend design, Azure Cloud architecture, automated regression testing with Vitest/Jest, and OpenTelemetry logging.\n• Professional Skills: Agile/Scrum sprint planning, cross-functional collaboration, technical code reviews, and executive delivery.',
    challengesText: 'During container migration, high latency was detected in cross-service REST communications. The challenge was resolved by refactoring synchronous dependencies into an asynchronous event-driven architecture using message queues, reducing average latency from 420ms to 48ms.',
    conclusionText: 'The COOP experience at Saudi Aramco provided invaluable industrial exposure to high-availability enterprise architectures, reinforcing the importance of clean architecture, cybersecurity compliance, and continuous technical refinement.'
  },
  {
    id: 'ksu-ai-data',
    name: 'نموذج جامعة الملك سعود (KSU - CCIS)',
    institution: 'جامعة الملك سعود (كلية علوم الحاسب والمعلومات - KSU CCIS)',
    templateId: 'royal',
    specialty: 'علوم البيانات والذكاء الاصطناعي (Data Science & Enterprise Analytics)',
    hostCompany: 'شركة عِلم (Elm - قطاع المنصات الرقمية وحلول البيانات)',
    studentTitle: 'تطوير خطوط معالجة البيانات الضخمة ونماذج التنبؤ بمؤشرات الأداء للخدمات الحكومية',
    executiveSummary: 'يوثق هذا التقرير إنجازات التدريب التعاوني بكلية علوم الحاسب والمعلومات بجامعة الملك سعود لدى شركة عِلم على مدار 14 أسبوعاً. اشتملت المخرجات على بناء وتدقيق خطوط معالجة البيانات الضخمة (ETL Pipelines) لمنصات وطنية، وتطبيق خوارزميات التعلم الآلي لاستشراف أحجام الطلب على الخدمات بدقة تفوق 94%، مع الالتزام بالمعايير الوطنية لحوكمة البيانات (NDMO).',
    introText: 'يهدف مقرر التدريب التعاوني في كلية علوم الحاسب والمعلومات إلى تعزيز المعارف التطبيقية للطلبة في بيئات رائدة، وربط النظريات الأكاديمية في هندسة البيانات والذكاء الاصطناعي بأحدث أدوات المعالجة والتحليل المؤسسي.',
    entityIntroText: 'تعد شركة عِلم الذراع الرقمي الرائد في المملكة في بناء وتطوير المنظومات الرقمية الآمنة والحلول المستندة للبيانات، حيث تدير منصات تخدم ملايين المستفيدين يومياً وتساهم بشكل فعال في تحقيق مستهدفات رؤية 2030.',
    skillsText: '• المهارات التقنية: معالجة البيانات الضخمة باستخدام Apache Spark و Python (Pandas, Scikit-Learn)، تصميم مستودعات البيانات النجمية (Star Schema)، كتابة استعلامات SQL متقدمة، وبناء لوحات Tableau و PowerBI.\n• المهارات المؤسسية: حوكمة البيانات الوطنية (NDMO)، التفكير التحليلي، وإعداد عروض الإيجاز للقيادات.',
    challengesText: 'واجه المشروع عدم اتساق في صيغ البيانات وتكرارها من مصادر متعددة؛ تم بناء خط أنابيب تنظيف آلي (Automated Data Cleansing Engine) يعتمد على خوارزميات التحقق المنطقي، مما خفض نسبة القيم الشاذة إلى أقل من 0.3%.',
    conclusionText: 'حققت فترة التدريب أهدافها بأعلى معايير الجودة، حيث أثبتت جدارة التكوين الأكاديمي بجامعة الملك سعود في التعامل مع أعقد التحديات التقنية في المنصات الوطنية الكبرى.'
  },
  {
    id: 'executive-gcc',
    name: 'النموذج المؤسسي والتنفيذي (جامعات الخليج والشركات الكبرى)',
    institution: 'كليات الهندسة وإدارة الأعمال والتقنية بدول مجلس التعاون الخليجي',
    templateId: 'executive',
    specialty: 'إدارة وتطوير المنظومات المؤسسية وهندسة الحلول (Enterprise Solutions & IT Governance)',
    hostCompany: 'الشركة العربية للأنابيب / القطاع الصناعي الخليجي',
    studentTitle: 'تطبيق معايير الحوكمة الرقمية وأتمتة العمليات التشغيلية (ERP Systems & Automation)',
    executiveSummary: 'يقدم هذا التقرير التنفيذي ملخصاً للمهام الاستشارية والتقنية المنجزة خلال فترة التدريب الميداني. تركزت المسؤوليات في تقييم مدى مطابقة الأنظمة المؤسسية لضوابط الحوكمة والأمن السيبراني، وأتمتة مسارات العمل الورقية عبر نظام SAP ERP، وإعداد وتحديث 18 دليلاً إجرائياً قياسياً (SOP) ساهمت في تقليص زمن إنجاز المعاملات بنسبة 35%.',
    introText: 'يشكل التدريب الميداني التطبيقي فرصة استراتيجية لصقل الكفاءات المهنية وتطبيق مفاهيم إدارة التغيير وتكامل النظم في القطاعات الصناعية والتجارية الكبرى.',
    entityIntroText: 'تتميز بيئة العمل بالانضباط الصناعي الصارم وتطبيق أعلى معايير الجودة العالمية (ISO 9001, ISO 27001) في إدارة الموارد وتأمين سلاسل الإمداد والبيانات.',
    skillsText: '• المهارات العملية: تحليل العمليات التشغيلية (BPMN)، تكوين وحدات نظام SAP، تدقيق ضوابط الأمان، وإعداد وثائق الامتثال المؤسسي.\n• المهارات الإدارية: إدارة أصحاب المصلحة، كتابة التقارير التنفيذية، والتفاوض الفني.',
    challengesText: 'مقاومة بعض المستخدمين للتحول من النماذج الورقية إلى النظام الآلي الجديد؛ تم إعداد ورش تدريبية مبسطة وأدلة مستخدم مصورة بالفيديو، مما رفع معدل التبني الرقمي إلى 96% خلال ثلاثة أسابيع.',
    conclusionText: 'خلصت التجربة إلى أن نجاح التحول الرقمي يرتكز بصورة متوازنة على جاهزية التكنولوجيا وكفاءة تأهيل المورد البشري والتواصل المستمر.'
  }
];

export const FinalReportTab: React.FC<FinalReportTabProps> = ({ currentLang }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const instLogoInputRef = useRef<HTMLInputElement>(null);
  const compLogoInputRef = useRef<HTMLInputElement>(null);
  const [samplesModalOpen, setSamplesModalOpen] = useState<boolean>(false);
  const [selectedSample, setSelectedSample] = useState<ReportSample>(ACTUAL_PREVIOUS_REPORTS[0]);
  const [modalSubTab, setModalSubTab] = useState<'guide' | 'samples'>('guide');
  const [guideSection, setGuideSection] = useState<'overview' | 'executive' | 'daily' | 'star' | 'verbs' | 'universities'>('overview');

  // Preview Language State (Can be toggled in-app or synced with top bar)
  const [previewLang, setPreviewLang] = useState<'ar' | 'en'>(currentLang);

  useEffect(() => {
    setPreviewLang(currentLang);
  }, [currentLang]);

  // Profile Form State
  const [profileData, setProfileData] = useState<ProfileInput>({
    studentName: '',
    trainingNumber: '',
    department: '',
    trainingUnit: '',
    supervisorName: '',
    responsibleName: '',
    entityAddress: '',
    employeesCount: '',
    trainingWeeks: 14,
    courseHours: 280,
    startDate: '',
    companyLogo: '',
    institutionLogo: '',
    reportTemplate: 'royal',
    executiveSummary: '',
    challengesText: '',
    recommendationsText: '',
    introText: '',
    entityIntroText: '',
    skillsText: '',
    conclusionText: ''
  });

  // Version History & Time Travel State
  const [versions, setVersions] = useState<ReportVersionSnapshot[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(-1);
  const [versionsModalOpen, setVersionsModalOpen] = useState<boolean>(false);

  const [saveToast, setSaveToast] = useState<string>('');
  const [errorToast, setErrorToast] = useState<string>('');
  const [backupNotice, setBackupNotice] = useState<string>('');
  const [downloadingDocx, setDownloadingDocx] = useState<boolean>(false);
  const [downloadingHtml, setDownloadingHtml] = useState<boolean>(false);
  const [downloadingPptx, setDownloadingPptx] = useState<boolean>(false);

  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'institution' | 'company') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png', 0.9);
          handleProfileChange(type === 'institution' ? 'institutionLogo' : 'companyLogo', dataUrl);
          setSaveToast(type === 'institution' ? 'تم رفع وحفظ شعار الجامعة / الكلية' : 'تم رفع وحفظ شعار جهة التدريب');
          setTimeout(() => setSaveToast(''), 3000);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAdoptSample = (sample: ReportSample) => {
    const updated: ProfileInput = {
      ...profileData,
      trainingUnit: sample.institution,
      department: sample.specialty,
      entityAddress: sample.hostCompany,
      reportTemplate: sample.templateId,
      executiveSummary: sample.executiveSummary,
      introText: sample.introText,
      entityIntroText: sample.entityIntroText,
      skillsText: sample.skillsText,
      challengesText: sample.challengesText,
      conclusionText: sample.conclusionText
    };
    setProfileData(updated);
    saveProfileMutation.mutate(updated);
    recordVersion('استيراد نموذج: ' + sample.name, updated);
    setSamplesModalOpen(false);
    setSaveToast('تم استيراد النموذج وتطبيقه كمسودة لتقريرك بنجاح!');
    setTimeout(() => setSaveToast(''), 4000);
  };

  const triggerError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(''), 4000);
  };

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

  // Always guaranteed 14 weeks for the Table of Contents & Timeline
  const weeksCount = profileData.trainingWeeks || 14;
  const rawWeeks = reportData?.weeks || [];
  const displayWeeks = rawWeeks.length > 0 ? rawWeeks : Array.from({ length: weeksCount }, (_, i) => {
    const wIndex = i + 1;
    const base = profileData.startDate ? new Date(profileData.startDate) : new Date();
    const dStart = new Date(base.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const dEnd = new Date(dStart.getTime() + 4 * 24 * 60 * 60 * 1000);
    return {
      weekIndex: wIndex,
      weekStart: dStart.toISOString().split('T')[0],
      weekEnd: dEnd.toISOString().split('T')[0],
      totalHours: 0,
      totalDays: 0,
      status: 'pending' as const,
      entries: [],
      evidence: []
    };
  });

  // Record a version snapshot
  const recordVersion = (label: string, newData: ProfileInput) => {
    const textAll = [newData.introText, newData.entityIntroText, newData.skillsText, newData.conclusionText].join(' ');
    const snap: ReportVersionSnapshot = {
      id: 'ver_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      label,
      data: { ...newData },
      wordCount: countWords(textAll)
    };

    setVersions((prev) => {
      const truncated = prev.slice(0, currentVersionIndex + 1);
      const updated = [...truncated, snap].slice(-30); // Keep up to 30 snapshots
      try {
        localStorage.setItem(PROFILE_HISTORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setCurrentVersionIndex((prev) => Math.min(prev + 1, 29));
  };

  // Initialize profile & load initial version snapshot
  useEffect(() => {
    if (reportData?.profile) {
      const initial: ProfileInput = {
        studentName: reportData.profile.studentName || '',
        trainingNumber: reportData.profile.trainingNumber || '',
        department: reportData.profile.department || '',
        trainingUnit: reportData.profile.trainingUnit || '',
        supervisorName: reportData.profile.supervisorName || '',
        responsibleName: reportData.profile.responsibleName || '',
        entityAddress: reportData.profile.entityAddress || '',
        employeesCount: reportData.profile.employeesCount || '',
        trainingWeeks: reportData.profile.trainingWeeks || 14,
        courseHours: reportData.profile.courseHours || 280,
        startDate: reportData.profile.startDate || '',
        companyLogo: reportData.profile.companyLogo || '',
        institutionLogo: reportData.profile.institutionLogo || '',
        reportTemplate: (reportData.profile.reportTemplate as any) || 'royal',
        executiveSummary: reportData.profile.executiveSummary || '',
        challengesText: reportData.profile.challengesText || '',
        recommendationsText: reportData.profile.recommendationsText || '',
        introText: reportData.profile.introText || '',
        entityIntroText: reportData.profile.entityIntroText || '',
        skillsText: reportData.profile.skillsText || '',
        conclusionText: reportData.profile.conclusionText || ''
      };

      setProfileData(initial);

      // Initialize version history if empty
      if (versions.length === 0) {
        let loadedHistory: ReportVersionSnapshot[] = [];
        try {
          const cached = localStorage.getItem(PROFILE_HISTORY_KEY);
          if (cached) loadedHistory = JSON.parse(cached);
        } catch {}

        if (loadedHistory.length > 0) {
          setVersions(loadedHistory);
          setCurrentVersionIndex(loadedHistory.length - 1);
        } else {
          const textAll = [initial.introText, initial.entityIntroText, initial.skillsText, initial.conclusionText].join(' ');
          const initialSnapshot: ReportVersionSnapshot = {
            id: 'ver_init',
            timestamp: new Date().toISOString(),
            timeFormatted: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            label: 'النسخة الأصلية المحفوظة',
            data: initial,
            wordCount: countWords(textAll)
          };
          setVersions([initialSnapshot]);
          setCurrentVersionIndex(0);
        }
      }
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
      recordVersion('تم الحفظ في قاعدة البيانات', profileData);
      setTimeout(() => setSaveToast(''), 3000);
    }
  });

  const handleProfileChange = <K extends keyof ProfileInput>(field: K, value: ProfileInput[K]) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfileMutation.mutate(profileData);
  };

  // Time Travel: Undo to previous snapshot
  const handleUndo = () => {
    if (currentVersionIndex > 0) {
      const prevIdx = currentVersionIndex - 1;
      const target = versions[prevIdx];
      setCurrentVersionIndex(prevIdx);
      setProfileData({ ...target.data });
      setSaveToast(`تم التراجع إلى النسخة السابقة: (${target.label})`);
      setTimeout(() => setSaveToast(''), 3000);
    }
  };

  // Time Travel: Redo to next snapshot
  const handleRedo = () => {
    if (currentVersionIndex < versions.length - 1) {
      const nextIdx = currentVersionIndex + 1;
      const target = versions[nextIdx];
      setCurrentVersionIndex(nextIdx);
      setProfileData({ ...target.data });
      setSaveToast(`تم التقدم إلى النسخة اللاحقة: (${target.label})`);
      setTimeout(() => setSaveToast(''), 3000);
    }
  };

  // Time Travel: Jump to specific snapshot
  const handleRestoreVersion = (ver: ReportVersionSnapshot, idx: number) => {
    setCurrentVersionIndex(idx);
    setProfileData({ ...ver.data });
    setVersionsModalOpen(false);
    setSaveToast(`تم استعادة النسخة: (${ver.label})`);
    setTimeout(() => setSaveToast(''), 3500);
  };

  // Manual Snapshot button
  const handleManualSnapshot = () => {
    recordVersion('نسخة مثبتة يدوياً', profileData);
    setSaveToast('تم حفظ لقطة جديدة في سجل الإصدارات');
    setTimeout(() => setSaveToast(''), 3000);
  };

  // Export Complete Backup Archive (Authenticated Blob Download)
  const handleExportBackup = async () => {
    try {
      const res = await api.get('/backup/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coop_report_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setBackupNotice('تم تصدير وحفظ نسخة احتياطية مشفرة بـ SHA-256 محلياً على جهازك.');
      setTimeout(() => setBackupNotice(''), 4000);
    } catch {
      triggerError('تعذر تصدير النسخة الاحتياطية، يرجى إعادة المحاولة');
    }
  };

  // Import Backup Archive
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('backup', file);

    try {
      const res = await api.post('/backup/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setSaveToast(res.data.message || 'تم استرجاع النسخة الاحتياطية بنجاح!');
      setTimeout(() => setSaveToast(''), 4000);
    } catch (err: any) {
      triggerError(err.response?.data?.error || 'فشل استيراد النسخة الاحتياطية (تأكد من سلامة الملف)');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Export PowerPoint Presentation Deck (.pptx)
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
      const rawEntity = profileData.entityAddress || 'COOP_Defense';
      const safeEntity = rawEntity.replace(/[\\/:*?"<>|\s]/g, '_').slice(0, 40);
      a.download = `عرض_مناقشة_${safeEntity}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      triggerError('تعذر تصدير عرض PowerPoint، يرجى المحاولة لاحقاً');
    } finally {
      setDownloadingPptx(false);
    }
  };

  type TextProfileField = 'introText' | 'entityIntroText' | 'skillsText' | 'conclusionText';

  const fieldLabels: Record<TextProfileField, string> = {
    introText: 'المقدمة وأهداف التدريب',
    entityIntroText: 'التعريف بجهة التدريب',
    skillsText: 'المعارف والمهارات المكتسبة',
    conclusionText: 'الخاتمة والتوصيات'
  };

  // AI Field Actions (Polish, Summarize, Spellcheck, Translate)
  const handleAIField = async (
    field: TextProfileField,
    action: 'polish' | 'spellcheck' | 'summarize' | 'translate'
  ) => {
    const text = String(profileData[field] || '');
    if (!text || !text.trim()) {
      triggerError('الحقل لا يحتوي على نص كافٍ للمعالجة');
      return;
    }

    setAiLoading(true);
    setCurrentTargetField(field);

    const actionLabels: Record<string, string> = {
      polish: 'تنقيح وصياغة أكاديمية رصينة',
      spellcheck: 'تدقيق إملائي ونحوي دقيق',
      summarize: 'إيجاز وتلخيص علمي مكثف',
      translate: 'ترجمة فورية للإنجليزية الأكاديمية'
    };

    try {
      const res = await api.post('/ai/process', {
        text,
        action,
        targetLang: action === 'translate' ? (previewLang === 'ar' ? 'en' : 'ar') : 'ar',
        context: `حقل في التقرير النهائي: ${fieldLabels[field]}`
      });

      setDiffTitle(actionLabels[action] || 'معالجة النص');
      setOriginalText(text);
      setImprovedText(res.data.result);
      setDiffChunks(res.data.diff || []);
      setDiffModalOpen(true);
    } catch {
      triggerError('تعذر استدعاء المعالجة الذكية، يرجى المحاولة لاحقاً');
    } finally {
      setAiLoading(false);
    }
  };

  // Comprehensive AI Audit for All Sections
  const handleAuditAllSections = async () => {
    const fields: TextProfileField[] = ['introText', 'entityIntroText', 'skillsText', 'conclusionText'];
    setAiLoading(true);

    recordVersion('قبل التدقيق الإملائي الشامل', profileData);

    try {
      const updated = { ...profileData };
      for (const f of fields) {
        const val = String(updated[f] || '');
        if (val && val.trim()) {
          const res = await api.post('/ai/process', {
            text: val,
            action: 'spellcheck'
          });
          updated[f] = res.data.result;
        }
      }
      setProfileData(updated);
      recordVersion('بعد التدقيق الإملائي الشامل', updated);
      saveProfileMutation.mutate(updated);
      setSaveToast('تم التدقيق الإملائي الشامل وحفظ النتائج بنجاح');
      setTimeout(() => setSaveToast(''), 3500);
    } catch {
      triggerError('تعذر إكمال التدقيق الشامل');
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-Translate Entire Report
  const handleAutoTranslateReport = async () => {
    const fields: TextProfileField[] = ['introText', 'entityIntroText', 'skillsText', 'conclusionText'];
    const targetLang = previewLang === 'ar' ? 'en' : 'ar';
    setAiLoading(true);

    recordVersion(`قبل ترجمة التقرير إلى (${targetLang})`, profileData);

    try {
      const updated = { ...profileData };
      for (const f of fields) {
        const val = String(updated[f] || '');
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
      setPreviewLang(targetLang);
      recordVersion(`بعد الترجمة إلى (${targetLang})`, updated);
      saveProfileMutation.mutate(updated);
      setSaveToast(
        targetLang === 'en'
          ? 'تمت ترجمة التقرير بالكامل وتحويل المعاينة إلى الإنجليزية الأكاديمية بنجاح'
          : 'تمت ترجمة التقرير بالكامل وتحويل المعاينة إلى العربية بنجاح'
      );
      setTimeout(() => setSaveToast(''), 3500);
    } catch {
      triggerError('تعذر إكمال الترجمة الذاتية للتقرير');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Emergency Offline Backup Handlers ──────────────────────────────────────
  const [downloadingArchive, setDownloadingArchive] = useState<string | null>(null);

  const handleDownloadBackupJSON = async () => {
    try {
      setDownloadingArchive('json');
      const res = await api.get('/reports/export/backup/json', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `نسخة_احتياطية_شاملة_${profileData.studentName || 'trainee'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSaveToast('تم تحميل ملف النسخة الاحتياطية الكاملة (JSON) بنجاح');
      setTimeout(() => setSaveToast(''), 3500);
    } catch {
      triggerError('تعذر استخراج النسخة الاحتياطية');
    } finally {
      setDownloadingArchive(null);
    }
  };

  const handleDownloadBackupCSV = async () => {
    try {
      setDownloadingArchive('csv');
      const res = await api.get('/reports/export/backup/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `سجل_مهام_التدريب_التعاوني_${profileData.studentName || 'trainee'}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSaveToast('تم تحميل جدول المهام اليومية (Excel CSV) بنجاح');
      setTimeout(() => setSaveToast(''), 3500);
    } catch {
      triggerError('تعذر استخراج ملف CSV');
    } finally {
      setDownloadingArchive(null);
    }
  };

  const handleDownloadBackupMarkdown = async (lang: 'ar' | 'en' = 'ar') => {
    try {
      setDownloadingArchive(`md-${lang}`);
      const res = await api.get(`/reports/export/backup/markdown?lang=${lang}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/markdown;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = lang === 'en'
        ? `${profileData.studentName || 'Trainee'}_Coop_Dossier.md`
        : `ملف_التدريب_الكامل_${profileData.studentName || 'المتدرب'}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSaveToast(lang === 'en' ? 'Complete training text dossier downloaded!' : 'تم تحميل ملف التقرير النصي الشامل لجميع الأسابيع بنجاح');
      setTimeout(() => setSaveToast(''), 3500);
    } catch {
      triggerError('تعذر استخراج الملف النصي للتقرير');
    } finally {
      setDownloadingArchive(null);
    }
  };

  // Export handlers with authenticated Blob downloads
  const handleExportDocx = async () => {
    try {
      setDownloadingDocx(true);
      const res = await api.get(`/reports/export/docx?lang=${previewLang}`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = previewLang === 'en' ? 'Coop_Final_Report.docx' : 'تقرير_التدريب_التعاوني.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSaveToast('تم تحميل مستند Word بنجاح مع الفهرسة الدقيقة');
      setTimeout(() => setSaveToast(''), 3500);
    } catch {
      triggerError('تعذر تصدير مستند Word، يرجى المحاولة مرة أخرى');
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleExportHTML = async () => {
    try {
      setDownloadingHtml(true);
      const res = await api.get(`/reports/export/html?lang=${previewLang}`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = previewLang === 'en' ? 'Coop_Final_Report.html' : 'تقرير_التدريب_التعاوني.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSaveToast('تم تحميل ملف HTML بنجاح');
      setTimeout(() => setSaveToast(''), 3500);
    } catch {
      triggerError('تعذر تصدير ملف HTML، يرجى المحاولة مرة أخرى');
    } finally {
      setDownloadingHtml(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const pages = reportData?.estimatedPages || 1;
  const isTargetAchieved = pages >= 20;
  const isAr = previewLang === 'ar';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 z-50 animate-fade-in max-w-[90%] text-center">
          <Check className="w-4 h-4 text-ok shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {errorToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-accent text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 z-50 animate-fade-in max-w-[90%] text-center">
          <AlertCircle className="w-4 h-4 text-white shrink-0" />
          <span>{errorToast}</span>
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

      {/* Top Protection & Version Control Toolbar Card */}
      <div className="bg-card border border-line rounded-2xl p-4 sm:p-5 shadow-sm no-print flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-ok-bg text-ok flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-ink">نظام حماية البيانات والتنقل بين الإصدارات</h3>
            <p className="text-[11px] text-sub">
              تراجع فوري لأي تعديل سابق والعودة للحالي مع حفظ نسخ احتياطية بـ SHA-256
            </p>
          </div>
        </div>

        {/* Time-Travel & Version History Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Undo Button */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={currentVersionIndex <= 0}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-ink bg-bg hover:bg-line border border-line disabled:opacity-30 disabled:hover:bg-bg transition-all flex items-center gap-1.5 shadow-sm"
            title="تراجع للماضي (النسخة السابقة)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-accent" />
            <span>تراجع</span>
          </button>

          {/* Redo Button */}
          <button
            type="button"
            onClick={handleRedo}
            disabled={currentVersionIndex >= versions.length - 1}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-ink bg-bg hover:bg-line border border-line disabled:opacity-30 disabled:hover:bg-bg transition-all flex items-center gap-1.5 shadow-sm"
            title="التقدم للحالي (النسخة الأحدث)"
          >
            <RotateCw className="w-3.5 h-3.5 text-ok" />
            <span>التقدم للحالي</span>
          </button>

          

          {/* Version History Modal Trigger */}
          <button
            type="button"
            onClick={() => setVersionsModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-ink bg-bg hover:bg-line border border-line transition-all flex items-center gap-1.5 shadow-sm"
            title="عرض سجل كافة الإصدارات والتنقل الفوري بينها"
          >
            <History className="w-3.5 h-3.5 text-sub" />
            <span>سجل الإصدارات ({versions.length})</span>
          </button>

          {/* Pin Snapshot Button */}
          <button
            type="button"
            onClick={handleManualSnapshot}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-sub hover:text-ink bg-bg hover:bg-line border border-line transition-all"
            title="حفظ لقطة إصدار حالية"
          >
            <Pin className="w-3.5 h-3.5" />
          </button>

          <span className="text-line mx-1">|</span>

          {/* Backup Export */}
          <button
            type="button"
            onClick={handleDownloadBackupJSON}
            disabled={!!downloadingArchive}
            className="px-3 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
            title="تصدير أرشيف كامل لبياناتك بملف JSON"
          >
            <Download className="w-3.5 h-3.5 text-ok" />
            <span>{downloadingArchive === 'json' ? 'جارٍ...' : 'نسخة JSON'}</span>
          </button>
          
          <button
            type="button"
            onClick={handleDownloadBackupCSV}
            disabled={!!downloadingArchive}
            className="px-3 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
            title="تصدير السجل اليومي بملف CSV"
          >
            <Download className="w-3.5 h-3.5 text-ok" />
            <span>{downloadingArchive === 'csv' ? 'جارٍ...' : 'نسخة CSV'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownloadBackupMarkdown('ar')}
            disabled={!!downloadingArchive}
            className="px-3 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
            title="تصدير التقرير النصي بملف Markdown"
          >
            <Download className="w-3.5 h-3.5 text-ok" />
            <span>{downloadingArchive === 'md-ar' ? 'جارٍ...' : 'نسخة MD'}</span>
          </button>

          {/* Backup Import */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
            title="استرجاع وتدقيق نسخة احتياطية سابقة"
          >
            <UploadCloud className="w-3.5 h-3.5 text-accent" />
            <span>استيراد نسخة</span>
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

          <div className="flex flex-wrap items-center gap-2">
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
              title="ترجمة ذاتية لجميع أقسام التقرير بدون أي تدخل يدوي مع حفظ نسخة احتياطية"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>ترجمة التقرير كاملاً ({previewLang === 'ar' ? 'English' : 'عربي'})</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">

          {/* Institutional Template Switcher Bar */}
          <div className="bg-bg/60 border border-line rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-ink">اختر قالب التقرير المعتمد لمؤسستك أو جامعتك:</span>
              </div>
              <button
                type="button"
                onClick={() => setSamplesModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold text-accent bg-accent-dim hover:bg-accent-dim/80 rounded-xl border border-accent/20 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>استعراض نماذج وتقارير سابقة معتمدة (Library)</span>
              </button>
            </div>

            {/* Template Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {REPORT_TEMPLATES.map((tmpl) => {
                const isActive = (profileData.reportTemplate || 'royal') === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      const updated = { ...profileData, reportTemplate: tmpl.id };
                      setProfileData(updated);
                      saveProfileMutation.mutate(updated);
                      recordVersion('تغيير القالب إلى ' + tmpl.nameAr, updated);
                    }}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 relative overflow-hidden ${
                      isActive
                        ? 'border-accent bg-card shadow-sm ring-2 ring-accent/20'
                        : 'border-line bg-card/60 hover:bg-card hover:border-line-strong'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tmpl.primaryColor }}
                        />
                        <span className="text-xs font-extrabold text-ink">{isAr ? tmpl.nameAr : tmpl.nameEn}</span>
                      </div>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          backgroundColor: isActive ? tmpl.primaryColor : undefined,
                          color: isActive ? '#FFFFFF' : tmpl.primaryColor,
                          border: `1px solid ${tmpl.primaryColor}40`
                        }}
                      >
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-sub leading-snug line-clamp-2">
                      {tmpl.descriptionAr}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dual Logos Upload Cards */}
          <div className="bg-bg/40 border border-line rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold text-ink">شعارات الغلاف الرسمي (تظهر في الغلاف المتناظر والمستندات المصدرة):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Institution Logo Card */}
              <div className="bg-card border border-line rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  {profileData.institutionLogo ? (
                    <img
                      src={profileData.institutionLogo}
                      alt="شعار الكلية / الجامعة"
                      className="w-14 h-14 object-contain rounded-lg border border-line bg-white p-1 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg border border-dashed border-line flex items-center justify-center text-sub bg-bg shrink-0">
                      <GraduationCap className="w-6 h-6 text-sub/60" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-ink">شعار الكلية / الجامعة / المؤسسة</div>
                    <div className="text-[10.5px] text-sub">يظهر أعلى الغلاف جهة اليمين (RTL)</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="file"
                    ref={instLogoInputRef}
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e, 'institution')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => instLogoInputRef.current?.click()}
                    className="px-2.5 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-lg border border-line transition-colors flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3 text-accent" />
                    <span>{profileData.institutionLogo ? 'تغيير' : 'رفع'}</span>
                  </button>
                  {profileData.institutionLogo && (
                    <button
                      type="button"
                      onClick={() => handleProfileChange('institutionLogo', '')}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف الشعار"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Company Logo Card */}
              <div className="bg-card border border-line rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  {profileData.companyLogo ? (
                    <img
                      src={profileData.companyLogo}
                      alt="شعار جهة التدريب"
                      className="w-14 h-14 object-contain rounded-lg border border-line bg-white p-1 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg border border-dashed border-line flex items-center justify-center text-sub bg-bg shrink-0">
                      <Building className="w-6 h-6 text-sub/60" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-ink">شعار جهة التدريب / الشركة</div>
                    <div className="text-[10.5px] text-sub">يظهر أعلى الغلاف جهة اليسار (RTL)</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="file"
                    ref={compLogoInputRef}
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e, 'company')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => compLogoInputRef.current?.click()}
                    className="px-2.5 py-1.5 text-xs font-bold text-ink bg-bg hover:bg-line rounded-lg border border-line transition-colors flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3 text-accent" />
                    <span>{profileData.companyLogo ? 'تغيير' : 'رفع'}</span>
                  </button>
                  {profileData.companyLogo && (
                    <button
                      type="button"
                      onClick={() => handleProfileChange('companyLogo', '')}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف الشعار"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

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
              <label className="block text-xs font-bold text-sub">الوحدة التدريبية / الكلية</label>
              <input
                type="text"
                value={profileData.trainingUnit}
                onChange={(e) => handleProfileChange('trainingUnit', e.target.value)}
                placeholder="مثال: كلية الاتصالات والمعلومات"
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">المشرف الأكاديمي (الكلية)</label>
              <input
                type="text"
                value={profileData.supervisorName}
                onChange={(e) => handleProfileChange('supervisorName', e.target.value)}
                placeholder="اسم الدكتور / المشرف الأكاديمي"
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">المشرف الميداني (جهة التدريب)</label>
              <input
                type="text"
                value={profileData.responsibleName}
                onChange={(e) => handleProfileChange('responsibleName', e.target.value)}
                placeholder="اسم المشرف المسؤول بالجهة"
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">جهة التدريب</label>
              <input
                type="text"
                value={profileData.entityAddress}
                onChange={(e) => handleProfileChange('entityAddress', e.target.value)}
                placeholder="اسم ومقر جهة التدريب"
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">تاريخ بدء التدريب التعاوني</label>
              <input
                type="date"
                value={profileData.startDate}
                onChange={(e) => handleProfileChange('startDate', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">عدد أسابيع التدريب المعتمدة</label>
              <input
                type="number"
                min="1"
                max="30"
                value={profileData.trainingWeeks || 14}
                onChange={(e) => handleProfileChange('trainingWeeks', parseInt(e.target.value) || 14)}
                placeholder="14"
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-ok">ساعات المقرر المطلوبة (ساعة)</label>
              <input
                type="number"
                min="10"
                max="2000"
                value={profileData.courseHours || 280}
                onChange={(e) => handleProfileChange('courseHours', parseInt(e.target.value) || 280)}
                placeholder="280"
                className="w-full px-3 py-2 text-sm bg-bg border border-ok/40 rounded-xl focus:outline-none focus:border-ok font-black text-ok"
              />
            </div>
          </div>

          {/* Section 1: Intro */}
          <div className="space-y-1.5 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold text-sub">المقدمة (أهمية التدريب التعاوني وأهدافه)</label>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('introText', 'polish')}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent-dim/60"
                  title="تنقيح الصياغة لتكون بأسلوب أكاديمي رفيع"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>تنقيح أكاديمي</span>
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('introText', 'summarize')}
                  className="text-[11px] font-bold text-ink hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-bg border border-line"
                  title="إيجاز وتلخيص علمي مكثف"
                >
                  <FileText className="w-3 h-3 text-sub" />
                  <span>إيجاز وتلخيص</span>
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('introText', 'spellcheck')}
                  className="text-[11px] font-bold text-ok hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-ok-bg"
                  title="تصحيح الهمزات والأخطاء الإملائية والنحوية"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تدقيق</span>
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('introText', 'translate')}
                  className="text-[11px] font-bold text-sub hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-bg border border-line"
                  title="ترجمة فورية للإنجليزية الأكاديمية"
                >
                  <Languages className="w-3 h-3" />
                  <span>ترجمة</span>
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold text-sub">التعريف بجهة التدريب وطبيعة العمل فيها</label>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('entityIntroText', 'polish')}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent-dim/60"
                  title="تنقيح الصياغة أكاديمياً"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>تنقيح أكاديمي</span>
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('entityIntroText', 'summarize')}
                  className="text-[11px] font-bold text-ink hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-bg border border-line"
                  title="إيجاز وتلخيص مهني"
                >
                  <FileText className="w-3 h-3 text-sub" />
                  <span>إيجاز وتلخيص</span>
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('entityIntroText', 'spellcheck')}
                  className="text-[11px] font-bold text-ok hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-ok-bg"
                  title="تدقيق إملائي ونحوي"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تدقيق</span>
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('entityIntroText', 'translate')}
                  className="text-[11px] font-bold text-sub hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-bg border border-line"
                  title="ترجمة فورية"
                >
                  <Languages className="w-3 h-3" />
                  <span>ترجمة</span>
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold text-sub">المعارف والمهارات والتجارب المكتسبة (ربطها بمقررات الكلية)</label>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('skillsText', 'polish')}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent-dim/60"
                  title="تنقيح الصياغة أكاديمياً"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>تنقيح أكاديمي</span>
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('skillsText', 'summarize')}
                  className="text-[11px] font-bold text-ink hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-bg border border-line"
                  title="إيجاز وتلخيص المهارات"
                >
                  <FileText className="w-3 h-3 text-sub" />
                  <span>إيجاز وتلخيص</span>
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('skillsText', 'spellcheck')}
                  className="text-[11px] font-bold text-ok hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-ok-bg"
                  title="تدقيق إملائي ونحوي"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تدقيق</span>
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('skillsText', 'translate')}
                  className="text-[11px] font-bold text-sub hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-bg border border-line"
                  title="ترجمة فورية"
                >
                  <Languages className="w-3 h-3" />
                  <span>ترجمة</span>
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold text-sub">الخاتمة والتوصيات العامة</label>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('conclusionText', 'polish')}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent-dim/60"
                  title="تنقيح الصياغة أكاديمياً"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>تنقيح أكاديمي</span>
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('conclusionText', 'summarize')}
                  className="text-[11px] font-bold text-ink hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-bg border border-line"
                  title="إيجاز الخاتمة"
                >
                  <FileText className="w-3 h-3 text-sub" />
                  <span>إيجاز وتلخيص</span>
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('conclusionText', 'spellcheck')}
                  className="text-[11px] font-bold text-ok hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-ok-bg"
                  title="تدقيق إملائي ونحوي"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تدقيق</span>
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAIField('conclusionText', 'translate')}
                  className="text-[11px] font-bold text-sub hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-bg border border-line"
                  title="ترجمة فورية"
                >
                  <Languages className="w-3 h-3" />
                  <span>ترجمة</span>
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
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isTargetAchieved ? 'bg-ok-bg text-ok' : 'bg-accent-dim text-accent'
            }`}
          >
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-ink">
                عدد الصفحات المقدر: {pages} صفحة
              </span>
              {isTargetAchieved ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ok-bg text-ok flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  مستوفٍ للمعيار (20+ صفحة)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-dim text-accent flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  أقل من 20 صفحة
                </span>
              )}
            </div>
            <p className="text-xs text-sub mt-0.5">
              إجمالي الكلمات: {reportData?.wordCount || 0} كلمة | إجمالي الساعات المسجلة: {reportData?.totalHours || 0} من {profileData.courseHours || 280} ساعة ({Math.min(100, Math.round(((reportData?.totalHours || 0) / (profileData.courseHours || 280)) * 100))}%)
            </p>
          </div>
        </div>

        {/* Export Buttons & Preview Language Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Toggle for Export and Preview */}
          <div className="flex items-center bg-bg border border-line rounded-xl p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setPreviewLang('ar')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                previewLang === 'ar' ? 'bg-accent text-white shadow-sm' : 'text-sub hover:text-ink'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>العربية</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewLang('en')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                previewLang === 'en' ? 'bg-accent text-white shadow-sm' : 'text-sub hover:text-ink'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>English</span>
            </button>
          </div>

          <button
            onClick={handleExportPresentation}
            disabled={downloadingPptx}
            className="px-3.5 py-2 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="تنزيل شرائح عرض تقديمي متكاملة للمناقشة أمام اللجنة (.pptx) متضمنة الصور التوثيقية والأسابيع"
          >
            <Download className={`w-4 h-4 text-accent ${downloadingPptx ? 'animate-bounce' : ''}`} />
            <span>{downloadingPptx ? 'جارٍ تصدير PowerPoint...' : 'عرض PowerPoint (.pptx)'}</span>
          </button>

          <button
            onClick={handleExportDocx}
            disabled={downloadingDocx}
            className="px-3.5 py-2 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="تنزيل مستند Word مع فهرسة ذكية ديناميكية وأرقام صفحات مرتبطة بكل أسبوع وفصل"
          >
            <Download className={`w-4 h-4 text-accent ${downloadingDocx ? 'animate-bounce' : ''}`} />
            <span>{downloadingDocx ? 'جارٍ تصدير Word...' : 'تنزيل Word مع الفهرسة (.docx)'}</span>
          </button>

          <button
            onClick={handleExportHTML}
            disabled={downloadingHtml}
            className="px-3.5 py-2 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="تنزيل تقرير HTML مستقل أوفلاين مع روابط تنقل سلسة"
          >
            <FileCode className={`w-4 h-4 text-ok ${downloadingHtml ? 'animate-bounce' : ''}`} />
            <span>{downloadingHtml ? 'جارٍ تصدير HTML...' : 'تنزيل HTML مستقل'}</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-2 text-xs font-bold text-white bg-accent hover:bg-accent/90 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            title="طباعة التقرير مباشرة أو حفظ كـ PDF بفواصل صفحات قياسية دون ظهور الرابط والتاريخ"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ PDF</span>
          </button>
        </div>
      </div>

      {/* Interactive Table of Contents (مطابق تماماً لمرجع الصورة بالأسطر المنقطة وروابط التنقل) */}
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm no-print" dir={isAr ? 'rtl' : 'ltr'}>
        <h3 className="text-base font-black text-[#8B0000] text-center pb-3 mb-5 border-b-2 border-[#8B0000] flex items-center justify-center gap-2">
          <Bookmark className="w-5 h-5" />
          <span>{isAr ? 'فهرس المحتويات وموضوعات الأسابيع' : 'Table of Contents & Weekly Topics'}</span>
        </h3>

        <div className="space-y-2.5 max-w-2xl mx-auto text-xs font-bold">
          <a href="#sec-cover" className="flex items-baseline justify-between text-ink hover:text-accent transition-colors group">
            <span className="group-hover:translate-x-[-2px] transition-transform">
              {isAr ? 'فهرس المحتويات وصفحة الغلاف' : 'Cover Page & Student Credentials'}
            </span>
            <span className="flex-grow mx-3 border-b-2 border-dotted border-muted/50 relative top-[-4px]"></span>
            <span className="text-[#8B0000] font-black">{isAr ? '١' : '1'}</span>
          </a>

          <a href="#sec-intro" className="flex items-baseline justify-between text-ink hover:text-accent transition-colors group">
            <span className="group-hover:translate-x-[-2px] transition-transform">
              {isAr
                ? '١. المقدمة وأهداف التدريب وبيانات المقرر (ساعتان معتمدتان من المعدل)'
                : '1. Introduction & Course Credit (2 Credit Hours in GPA)'}
            </span>
            <span className="flex-grow mx-3 border-b-2 border-dotted border-muted/50 relative top-[-4px]"></span>
            <span className="text-[#8B0000] font-black">{isAr ? '٢' : '2'}</span>
          </a>

          <a href="#sec-entity" className="flex items-baseline justify-between text-ink hover:text-accent transition-colors group">
            <span className="group-hover:translate-x-[-2px] transition-transform">
              {isAr
                ? `٢. التعريف بجهة التدريب وطبيعة العمل ${profileData.entityAddress ? `(${profileData.entityAddress})` : ''}`
                : `2. Host Organization Overview ${profileData.entityAddress ? `(${profileData.entityAddress})` : ''}`}
            </span>
            <span className="flex-grow mx-3 border-b-2 border-dotted border-muted/50 relative top-[-4px]"></span>
            <span className="text-[#8B0000] font-black">{isAr ? '٣' : '3'}</span>
          </a>

          <a href="#sec-timeline" className="flex items-baseline justify-between text-ink hover:text-accent transition-colors group">
            <span className="group-hover:translate-x-[-2px] transition-transform">
              {isAr
                ? `٣. الباب التدريبي: سجل وتقارير الأسابيع الميدانية الـ (${displayWeeks.length} أسبوعاً)`
                : `3. Training Reports & Weekly Field Records (${displayWeeks.length} Weeks)`}
            </span>
            <span className="flex-grow mx-3 border-b-2 border-dotted border-muted/50 relative top-[-4px]"></span>
            <span className="text-[#8B0000] font-black">{isAr ? toArabicIndic(4) : '4'}</span>
          </a>

          {/* Child Weeks Narrative Topic Indexing - Guaranteed for all 14 Weeks */}
          <div className="space-y-1.5 pr-2 sm:pr-4 py-1">
            {displayWeeks.map((w, idx) => {
              const isLast = idx === displayWeeks.length - 1;
              const treeSymbol = isLast ? '└──' : '├──';
              const pageNum = 5 + idx;

              return (
                <a
                  key={w.weekIndex}
                  href={`#week-${w.weekIndex}`}
                  className="flex items-baseline justify-between text-sub hover:text-accent pr-3 pl-2 py-1 rounded-lg hover:bg-bg/60 transition-colors group text-[11.5px]"
                >
                  <div className="flex items-baseline gap-2 flex-1 min-w-0 pr-1">
                    <span className="text-muted/60 font-mono text-[11px] select-none shrink-0">{treeSymbol}</span>
                    <span className="font-bold text-ink group-hover:text-accent transition-colors shrink-0">
                      {isAr ? `تقرير ${getArabicWeekName(w.weekIndex)}:` : `Week ${w.weekIndex} Report:`}
                    </span>
                    <span className="text-sub group-hover:text-ink transition-colors truncate">
                      {getWeekTopic(w, isAr)}
                    </span>
                  </div>
                  <span className="flex-grow mx-3 border-b border-dotted border-line relative top-[-4px]"></span>
                  <span className="text-ok font-bold shrink-0">
                    {isAr ? toArabicIndic(pageNum) : pageNum}
                  </span>
                </a>
              );
            })}
          </div>

          <a href="#sec-skills" className="flex items-baseline justify-between text-ink hover:text-accent transition-colors group">
            <span className="group-hover:translate-x-[-2px] transition-transform">
              {isAr ? '٤. المعارف والمهارات والتجارب المكتسبة' : '4. Acquired Competencies & Technical Skills'}
            </span>
            <span className="flex-grow mx-3 border-b-2 border-dotted border-muted/50 relative top-[-4px]"></span>
            <span className="text-[#8B0000] font-black">{isAr ? toArabicIndic(5 + displayWeeks.length) : 5 + displayWeeks.length}</span>
          </a>

          <a href="#sec-conclusion" className="flex items-baseline justify-between text-ink hover:text-accent transition-colors group">
            <span className="group-hover:translate-x-[-2px] transition-transform">
              {isAr ? '٥. الخاتمة والتوصيات العامة' : '5. Conclusion & Recommendations'}
            </span>
            <span className="flex-grow mx-3 border-b-2 border-dotted border-muted/50 relative top-[-4px]"></span>
            <span className="text-[#8B0000] font-black">{isAr ? toArabicIndic(6 + displayWeeks.length) : 6 + displayWeeks.length}</span>
          </a>

          <a href="#sec-approval" className="flex items-baseline justify-between text-ink hover:text-accent transition-colors group">
            <span className="group-hover:translate-x-[-2px] transition-transform">
              {isAr ? '٦. استمارة تقييم واعتماد المشرفين والملاحق' : '6. Supervisory Approval Form & Appendices'}
            </span>
            <span className="flex-grow mx-3 border-b-2 border-dotted border-muted/50 relative top-[-4px]"></span>
            <span className="text-[#8B0000] font-black">{isAr ? toArabicIndic(7 + displayWeeks.length) : 7 + displayWeeks.length}</span>
          </a>
        </div>
      </div>

      {/* Report Paper Preview Container (Printable Document with Dual-Language Rendering) */}
      <div
        id="report-paper-view"
        dir={isAr ? 'rtl' : 'ltr'}
        className="bg-card border border-line rounded-2xl p-4 sm:p-8 md:p-12 shadow-sm leading-relaxed text-ink space-y-8 print-only-container print-page-wrapper overflow-x-auto"
      >
        {/* Cover Page */}
        <div id="sec-cover" className="scroll-mt-24 text-center pb-10 border-b-2 border-line space-y-6">
          {/* Symmetrical Dual-Logo Header */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 pb-4 border-b border-line/60">
            {/* Institution Logo (Right in RTL / Left in LTR) */}
            <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
              {profileData.institutionLogo ? (
                <img
                  src={profileData.institutionLogo}
                  alt="Institution Logo"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 border border-dashed border-line rounded-lg flex flex-col items-center justify-center text-[9px] sm:text-[10px] text-sub/50 p-1">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5 sm:mb-1 text-sub/40" />
                  <span>شعار الكلية</span>
                </div>
              )}
            </div>

            {/* Center National & Academic Hierarchy */}
            <div className="flex-1 text-center space-y-0.5 sm:space-y-1 px-1">
              <div className="text-[10px] sm:text-xs font-bold text-sub uppercase tracking-wider">
                {isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-ink">
                {profileData.trainingUnit || (isAr ? 'الوحدة التدريبية / الكلية' : 'Academic Department / College')}
              </div>
              {profileData.department && (
                <div className="text-[11px] sm:text-xs font-semibold text-sub">
                  {profileData.department}
                </div>
              )}
            </div>

            {/* Company Logo (Left in RTL / Right in LTR) */}
            <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
              {profileData.companyLogo ? (
                <img
                  src={profileData.companyLogo}
                  alt="Company Logo"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 border border-dashed border-line rounded-lg flex flex-col items-center justify-center text-[9px] sm:text-[10px] text-sub/50 p-1">
                  <Building className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5 sm:mb-1 text-sub/40" />
                  <span>شعار المنشأة</span>
                </div>
              )}
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-accent mt-4">
            {isAr ? 'التقرير النهائي للتدريب التعاوني (Co-op Report)' : 'Cooperative Training Final Report (Co-op Report)'}
          </h1>
          <div className="text-base font-bold text-ink">
            {isAr ? 'جهة التدريب:' : 'Host Organization:'} {profileData.entityAddress || '—'}
          </div>

          <div className="mt-8 max-w-xl mx-auto bg-bg border border-line rounded-xl p-5 text-right grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs" dir={isAr ? 'rtl' : 'ltr'}>
            <div>
              <span className="font-bold text-sub">{isAr ? 'اسم المتدرب:' : 'Trainee Name:'}</span> {profileData.studentName || '—'}
            </div>
            <div>
              <span className="font-bold text-sub">{isAr ? 'الرقم التدريبي:' : 'Training ID:'}</span> {profileData.trainingNumber || '—'}
            </div>
            <div>
              <span className="font-bold text-sub">{isAr ? 'القسم / التخصص:' : 'Department:'}</span> {profileData.department || '—'}
            </div>
            <div>
              <span className="font-bold text-sub">{isAr ? 'المشرف الأكاديمي:' : 'Academic Supervisor:'}</span> {profileData.supervisorName || '—'}
            </div>
            <div>
              <span className="font-bold text-sub">{isAr ? 'المشرف الميداني:' : 'Field Supervisor:'}</span> {profileData.responsibleName || '—'}
            </div>
            <div>
              <span className="font-bold text-sub">{isAr ? 'ساعات المقرر في الخطة:' : 'Course Credit:'}</span> {isAr ? 'ساعتان معتمدتان من المعدل التراكمي' : '2 Credit Hours in GPA'}
            </div>
            <div>
              <span className="font-bold text-sub">{isAr ? 'المدة التدريبية المعتمدة:' : 'Training Duration:'}</span> {profileData.trainingWeeks || 14} {isAr ? 'أسبوعاً تدريبياً ميدانياً' : 'Weeks'}
            </div>
            <div>
              <span className="font-bold text-sub">{isAr ? 'حالة التوثيق الميداني:' : 'Documentation Status:'}</span> {displayWeeks.length} {isAr ? 'أسبوعاً موثقاً بالكامل (100%)' : 'Weeks Documented (100%)'}
            </div>
          </div>
        </div>

        {/* Section 1: Intro */}
        <div id="sec-intro" className="scroll-mt-24 space-y-3 pt-4">
          <h2 className="text-lg font-extrabold text-ink border-b-2 border-accent pb-1.5 inline-block">
            {isAr ? '1. المقدمة وأهداف التدريب' : '1. Introduction & Objectives'}
          </h2>
          <p className="text-sm text-ink leading-loose whitespace-pre-wrap">
            {profileData.introText || (isAr ? 'لم تُحدد المقدمة بعد.' : 'No introduction provided yet.')}
          </p>
        </div>

        {/* Section 2: Entity */}
        <div id="sec-entity" className="scroll-mt-24 space-y-3 pt-4">
          <h2 className="text-lg font-extrabold text-ink border-b-2 border-accent pb-1.5 inline-block">
            {isAr ? '2. التعريف بجهة التدريب وطبيعة العمل' : '2. Host Organization Overview'}
          </h2>
          <p className="text-sm text-ink leading-loose whitespace-pre-wrap">
            {profileData.entityIntroText || (isAr ? 'لم يُحدد التعريف بجهة التدريب بعد.' : 'No organization overview provided yet.')}
          </p>
          <div className="bg-bg border border-line rounded-lg p-3 text-xs text-sub flex flex-wrap gap-4 font-semibold">
            <span>{isAr ? 'جهة التدريب:' : 'Organization:'} {profileData.entityAddress || '—'}</span>
            <span>{isAr ? 'عدد الموظفين تقريباً:' : 'Employees:'} {profileData.employeesCount || '—'}</span>
            <span>{isAr ? 'المسؤول الميداني:' : 'Supervisor:'} {profileData.responsibleName || '—'}</span>
          </div>
        </div>

        {/* Section 3: Detailed Weekly Technical Reports */}
        <div id="sec-timeline" className="scroll-mt-24 space-y-6 pt-4 page-break">
          <h2 className="text-lg font-extrabold text-ink border-b-2 border-accent pb-1.5 inline-block">
            {isAr ? '3. تقارير وسجل الأسابيع التدريبية الميدانية (14 أسبوعاً)' : '3. Weekly Technical Training Reports (14 Weeks)'}
          </h2>

          {displayWeeks.map((w) => {
            const weekTitle = isAr ? getArabicWeekName(w.weekIndex) : `Week ${w.weekIndex}`;
            const weekTopic = getWeekTopic(w, isAr);

            return (
              <div key={w.weekIndex} id={`week-${w.weekIndex}`} className="scroll-mt-24 border border-line rounded-xl overflow-hidden mb-8 page-break bg-card shadow-xs">
                {/* Academic Header for the Week */}
                <div className="bg-bg px-5 py-3 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-accent">{isAr ? 'تقرير الأسبوع الميداني' : 'Field Training Report'}</span>
                    <h3 className="text-sm font-extrabold text-ink">
                      {weekTitle}: {weekTopic}
                    </h3>
                  </div>
                  <div className="text-xs text-sub font-semibold">
                    <span>{isAr ? 'الفترة التدريبية:' : 'Period:'} من <b>{w.weekStart}</b> إلى <b>{w.weekEnd}</b></span>
                  </div>
                </div>

                {/* Narrative Tasks Content */}
                <div className="p-5 space-y-4">
                  {w.entries.length === 0 ? (
                    <div className="p-5 text-center text-xs text-sub bg-surface/50 rounded-lg border border-dashed border-line flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-warn" />
                      <span>{isAr ? 'أسبوع تدريبي مؤجل أو متاح لاستكمال التوثيق والسرد الكتابي' : 'Pending week documentation'}</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-ink border-b border-line pb-1.5 flex items-center justify-between">
                        <span>{isAr ? 'أولاً: البيان التفصيلي للمهام والأعمال الميدانية المنجزة:' : 'Accomplished Technical Tasks:'}</span>
                        <span className="text-[11px] text-muted font-normal">{w.entries.length} {isAr ? 'مهام موثقة' : 'tasks'}</span>
                      </div>
                      <div className="space-y-3">
                        {w.entries.map((entry, eIdx) => {
                          const entryHours = calculateHoursBetween(entry.timeFrom, entry.timeTo);
                          return (
                            <div key={entry.id || eIdx} className="rounded-xl border border-line bg-card overflow-hidden text-xs shadow-2xs">
                              {/* Entry Header: Day Badge, Date, Time Span, Hours, Category */}
                              <div className="bg-surface/80 px-4 py-2.5 border-b border-line flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2.5 py-0.5 rounded-md bg-accent text-white text-[11px] font-black">
                                    {isAr ? `اليوم ${eIdx + 1}` : `Day ${eIdx + 1}`}
                                  </span>
                                  <span className="font-extrabold text-ink text-xs">
                                    {isAr ? formatDateArabic(entry.entryDate) : formatDateEnglish(entry.entryDate)}
                                  </span>
                                  <span className="text-sub text-[11px] font-medium">
                                    ({entry.timeFrom || '08:00'} — {entry.timeTo || '16:00'})
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-dim text-accent border border-accent/20">
                                    {translateCategory(entry.category, isAr)}
                                  </span>
                                  <span className="text-[11px] font-bold text-sub">
                                    {entryHours} {isAr ? 'ساعات' : 'hrs'}
                                  </span>
                                </div>
                              </div>

                              {/* Entry Body: Formal Task Title & Procedural Narrative */}
                              <div className="p-4 space-y-2.5">
                                <div>
                                  <div className="text-[10px] font-black text-accent uppercase tracking-wider mb-0.5">
                                    {isAr ? 'النشاط الفني والمهمة التشغيلية الميدانية:' : 'Technical Activity & Operational Scope:'}
                                  </div>
                                  <h4 className="text-sm font-black text-ink leading-snug">
                                    {entry.title}
                                  </h4>
                                </div>

                                <div className="pt-2 border-t border-line/60">
                                  <div className="text-[10px] font-black text-sub uppercase tracking-wider mb-1">
                                    {isAr ? 'السرد الإجرائي ونتائج التنفيذ الهندسي:' : 'Procedural Narrative & Engineering Results:'}
                                  </div>
                                  <p className="text-ink/90 leading-relaxed whitespace-pre-wrap text-xs bg-bg/50 p-3 rounded-lg border border-line/60">
                                    {entry.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Weekly Field Evidence Photos */}
                  {w.evidence && w.evidence.length > 0 && (
                    <div className="pt-2 space-y-2.5">
                      <div className="text-xs font-bold text-accent border-b border-line pb-1.5">
                        {isAr ? 'ثانياً: الأدلة والصور التوثيقية الميدانية للأسبوع:' : 'Field Evidence & Documentation Photos:'}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {w.evidence.map((ev, evIdx) => (
                          <div key={ev.id || evIdx} className="border border-line rounded-xl overflow-hidden bg-surface">
                            <img src={ev.imageData} alt={ev.caption} className="w-full h-44 object-cover" />
                            <div className="p-2.5 text-xs font-bold text-ink leading-snug bg-card border-t border-line">
                              {isAr ? `شكل توثيقي (${evIdx + 1}): ` : `Figure (${evIdx + 1}): `}
                              <span className="font-normal text-sub">{ev.caption}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Academic Supervisory Endorsement Box */}
                <div className="px-5 py-3.5 bg-surface border-t border-line text-xs text-sub flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-bold text-ink">
                    <span>{isAr ? 'اعتماد المشرف الميداني بالمنشأة:' : 'Field Supervisor Approval:'}</span>
                    <span className="text-sub font-normal">{profileData.responsibleName || '....................'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11.5px]">
                    <span>{isAr ? 'التقييم: [  ] ممتاز   [  ] جيد جداً   [  ] جيد' : 'Rating: [  ] Excellent  [  ] Very Good  [  ] Good'}</span>
                    <span>{isAr ? 'التوقيع والختم: ....................' : 'Signature: ....................'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section 4: Skills */}
        <div id="sec-skills" className="scroll-mt-24 space-y-3 pt-4 page-break">
          <h2 className="text-lg font-extrabold text-ink border-b-2 border-accent pb-1.5 inline-block">
            {isAr ? '4. المعارف والمهارات والتجارب المكتسبة' : '4. Acquired Competencies & Technical Skills'}
          </h2>
          <p className="text-sm text-ink leading-loose whitespace-pre-wrap">
            {profileData.skillsText || (isAr ? 'لم تُحدد المهارات المكتسبة بعد.' : 'No acquired skills described yet.')}
          </p>
        </div>

        {/* Section 5: Conclusion */}
        <div id="sec-conclusion" className="scroll-mt-24 space-y-3 pt-4 page-break">
          <h2 className="text-lg font-extrabold text-ink border-b-2 border-accent pb-1.5 inline-block">
            {isAr ? '5. الخاتمة والتوصيات' : '5. Conclusions & Recommendations'}
          </h2>
          <p className="text-sm text-ink leading-loose whitespace-pre-wrap">
            {profileData.conclusionText || (isAr ? 'لم تُحدد الخاتمة بعد.' : 'No conclusion provided yet.')}
          </p>
        </div>

        {/* Section 6: Official Approval & Appendices */}
        <div id="sec-approval" className="scroll-mt-24 space-y-4 pt-4 page-break">
          <h2 className="text-lg font-extrabold text-ink border-b-2 border-accent pb-1.5 inline-block">
            {isAr ? '6. استمارة تقييم واعتماد المشرفين والملاحق الأكاديمية' : '6. Supervisory Approval Form & Appendices'}
          </h2>

          <div className="border border-line rounded-xl overflow-hidden text-xs">
            <div className="bg-bg p-3 font-bold text-ink border-b border-line flex justify-between">
              <span>{isAr ? 'بيانات الاعتماد والتقييم النهائي الشامل' : 'Final Evaluation & Endorsement'}</span>
              <span className="text-accent">{profileData.responsibleName || (isAr ? 'المشرف الميداني' : 'Field Supervisor')}</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sub">
                <div><b>{isAr ? 'اسم المتدرب:' : 'Student Name:'}</b> {profileData.studentName || '—'}</div>
                <div><b>{isAr ? 'الرقم التدريبي / الجامعي:' : 'ID / Trainee Number:'}</b> {profileData.trainingNumber || '—'}</div>
                <div><b>{isAr ? 'جهة التدريب:' : 'Host Organization:'}</b> {profileData.entityAddress || '—'}</div>
                <div><b>{isAr ? 'إجمالي الساعات المعتمدة:' : 'Total Approved Hours:'}</b> {reportData?.totalHours || 0} / {profileData.courseHours || 280} {isAr ? 'ساعة' : 'hrs'}</div>
              </div>
              <div className="border-t border-line pt-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-ink">{isAr ? 'التقييم العام للمتدرب: ' : 'Overall Rating: '}</span>
                  <span className="text-ok font-bold">{reportData?.profile?.supervisorRating || (isAr ? 'ممتاز (معتمد)' : 'Excellent')}</span>
                </div>
                <div className="text-muted">
                  {isAr ? 'التوقيع والختم الرسمي: .......................................' : 'Official Signature & Stamp: .......................................'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      {/* Samples & Writing Guide Hub Modal (مركز إرشادات وقوالب التقرير التعاوني) */}
      {samplesModalOpen && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in no-print">
          <div className="bg-card border border-line rounded-2xl p-4 sm:p-6 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-ink flex items-center gap-2">
                    <span>مركز إرشادات وقوالب التقرير التعاوني المعتمدة</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      دليل شامل + نماذج حقيقية
                    </span>
                  </h3>
                  <p className="text-xs text-sub">
                    تعلم أصول الصياغة الهندسية الأكاديمية واستعرض قوالب وتقارير كبرى الجامعات والشركات السعودية والخليجية
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSamplesModalOpen(false)}
                className="p-1.5 text-sub hover:text-ink rounded-lg transition-colors border border-transparent hover:border-line"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Tabs Toggle (Guide vs Real Samples) */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-bg border border-line rounded-xl my-3 shrink-0">
              <button
                type="button"
                onClick={() => setModalSubTab('guide')}
                className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  modalSubTab === 'guide'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-sub hover:text-ink hover:bg-card'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>دليل وقواعد كتابة التقرير بالتفصيل (Writing Guide)</span>
              </button>
              <button
                type="button"
                onClick={() => setModalSubTab('samples')}
                className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  modalSubTab === 'samples'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-sub hover:text-ink hover:bg-card'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>نماذج وتقارير سابقة حقيقية للاستيراد ({ACTUAL_PREVIOUS_REPORTS.length} نماذج)</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs leading-relaxed text-ink">
              
              {/* TAB 1: HOW TO WRITE GUIDE */}
              {modalSubTab === 'guide' && (
                <div className="space-y-4">
                  
                  {/* Guide Sub-Nav Pills */}
                  <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
                    {[
                      { id: 'overview', label: 'نظرة عامة وهيكل التقرير', icon: Compass },
                      { id: 'executive', label: 'صياغة الملخص التنفيذي', icon: Award },
                      { id: 'daily', label: 'توثيق المهام والسجلات', icon: ListChecks },
                      { id: 'star', label: 'منهجية STAR لحل التحديات', icon: Lightbulb },
                      { id: 'verbs', label: 'بنك الأفعال الإجرائية (Verbs)', icon: Sparkles },
                      { id: 'universities', label: 'معايير الجامعات (KFUPM/KSU/TVTC)', icon: GraduationCap },
                    ].map((pill) => {
                      const Icon = pill.icon;
                      const isActive = guideSection === pill.id;
                      return (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => setGuideSection(pill.id as any)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            isActive
                              ? 'border-accent bg-accent/10 text-accent ring-1 ring-accent'
                              : 'border-line bg-bg text-sub hover:text-ink hover:bg-card'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{pill.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Section 1: Overview & Structure */}
                  {guideSection === 'overview' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="p-4 bg-bg border border-line rounded-xl space-y-2">
                        <h4 className="text-sm font-extrabold text-accent flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-ok" />
                          <span>الهيكل الأكاديمي القياسي لتقرير التدريب التعاوني (Standard Structure)</span>
                        </h4>
                        <p className="text-sub">
                          يتألف التقرير الاحترافي المعتمد من 6 أقسام جوهرية متسلسلة تحقق معايير التقييم للجان الأكاديمية والشركات:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 bg-bg/70 border border-line rounded-xl space-y-1.5">
                          <div className="flex items-center gap-2 font-bold text-ink">
                            <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[11px]">1</span>
                            <span>صفحة الغلاف والشعارات الرسمية</span>
                          </div>
                          <p className="text-[11px] text-sub leading-relaxed">
                            تضم شعار المؤسسة التعليمية وشعار جهة التدريب متقابلين، وعنوان التقرير، واسم الطالب والرقم الأكاديمي، والمشرفين (الأكاديمي والميداني) والفصل التدريبي.
                          </p>
                        </div>

                        <div className="p-3.5 bg-bg/70 border border-line rounded-xl space-y-1.5">
                          <div className="flex items-center gap-2 font-bold text-ink">
                            <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[11px]">2</span>
                            <span>الملخص التنفيذي (Executive Summary)</span>
                          </div>
                          <p className="text-[11px] text-sub leading-relaxed">
                            صفحة مكثفة توجز السياق، والدور الوظيفي، وأبرز الإنجازات الكمية والنوعية، والقيمة المضافة التي قدمها المتدرب للشركة دون إسهاب.
                          </p>
                        </div>

                        <div className="p-3.5 bg-bg/70 border border-line rounded-xl space-y-1.5">
                          <div className="flex items-center gap-2 font-bold text-ink">
                            <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[11px]">3</span>
                            <span>نبذة المنظمة والبيئة التشغيلية</span>
                          </div>
                          <p className="text-[11px] text-sub leading-relaxed">
                            الهيكل التنظيمي، أهداف القسم المشرف، والأنظمة أو الآلات أو البيئات البرمجية التي يعتمد عليها القسم في إدارة أعماله.
                          </p>
                        </div>

                        <div className="p-3.5 bg-bg/70 border border-line rounded-xl space-y-1.5">
                          <div className="flex items-center gap-2 font-bold text-ink">
                            <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[11px]">4</span>
                            <span>سجل المهام والمشاريع التراكمية</span>
                          </div>
                          <p className="text-[11px] text-sub leading-relaxed">
                            توثيق زمني أو بحسب المشاريع يوضح تفاصيل العمل اليومي والأسبوعي مقترناً بالساعات والفئات المعتمدة.
                          </p>
                        </div>

                        <div className="p-3.5 bg-bg/70 border border-line rounded-xl space-y-1.5">
                          <div className="flex items-center gap-2 font-bold text-ink">
                            <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[11px]">5</span>
                            <span>التحديات الفنية ومعالجتها (STAR)</span>
                          </div>
                          <p className="text-[11px] text-sub leading-relaxed">
                            توثيق المشكلات غير المتوقعة وكيف تصرف المتدرب هندسياً وعملياً لحلها وما النتائج المترتبة على ذلك.
                          </p>
                        </div>

                        <div className="p-3.5 bg-bg/70 border border-line rounded-xl space-y-1.5">
                          <div className="flex items-center gap-2 font-bold text-ink">
                            <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[11px]">6</span>
                            <span>الخاتمة والتوصيات المتبادلة</span>
                          </div>
                          <p className="text-[11px] text-sub leading-relaxed">
                            توصيات للجامعة لتطوير المناهج، وتوصيات لجهة التدريب لدعم استمرارية المتدربين، وخاتمة تلخص النضج المهني المكتسب.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 2: Executive Summary */}
                  {guideSection === 'executive' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl space-y-2">
                        <h4 className="text-sm font-extrabold text-accent">
                          المعادلة الرياضية لكتابة الملخص التنفيذي (The Formula):
                        </h4>
                        <div className="p-3 bg-card border border-accent/30 rounded-lg font-mono text-xs text-ink font-bold">
                          [الجهة + المدة + القسم] + [المشروع الأساسي والتقنيات] + [أبرز 3 مخرجات كمية/نوعية] + [الأثر والقيمة المضافة]
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-bold text-ink">مثال تطبيقي عملي (صيغة ممتازة):</h5>
                        <div className="p-3.5 bg-bg border border-line rounded-xl text-sub leading-relaxed">
                          "تم إنجاز فترة التدريب التعاوني في شركة (اسم الشركة) ضمن فريق (هندسة البرمجيات/التشغيل) على مدار 16 أسبوعاً بواقع 480 ساعة تدريبية. تركز الدور الأساسي على تطوير وتحديث نظام إدارة الطلبات المركزي باستخدام Node.js وPostgreSQL. أسفر التدريب عن ثلاثة مخرجات رئيسية: بناء 14 واجهة برمجية آمنة وفق معيار RESTful، وتقليص زمن استعلامات قواعد البيانات بنسبة 28% عبر الفهرسة وتحسين الاستعلامات، وأتمتة اختبارات الجودة لتغطية 85% من الكود الأساسي. ساهمت هذه المخرجات في رفع كفاءة استجابة النظام وتوفير بيئة تشغيلية متكاملة تتماشى مع معايير الشركة الهندسية."
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                          <span className="font-bold text-red-500 block mb-1">أخطاء شائعة يجب تجنبها:</span>
                          <ul className="list-disc list-inside space-y-1 text-[11px] text-sub">
                            <li>البدء بعبارات عاطفية مثل "لقد كانت تجربة ممتعة جداً وأنا سعيد".</li>
                            <li>سرد كل يوم بيومه بدلاً من تلخيص الصورة الكلية.</li>
                            <li>غياب الأرقام والنسب والمخرجات القابلة للقياس.</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-ok/5 border border-ok/20 rounded-xl">
                          <span className="font-bold text-ok block mb-1">نقاط ترفع درجتك في التقييم:</span>
                          <ul className="list-disc list-inside space-y-1 text-[11px] text-sub">
                            <li>ذكر التقنيات والأدوات المحددة بالاسم التجاري أو البرمجي.</li>
                            <li>توثيق الأثر على بيئة العمل والإنتاجية.</li>
                            <li>كتابة الملخص باللغتين العربية والإنجليزية لتقرير متكامل.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 3: Daily & Weekly Logs */}
                  {guideSection === 'daily' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="p-4 bg-bg border border-line rounded-xl space-y-2">
                        <h4 className="text-sm font-extrabold text-accent">
                          قاعدة كتابة السجل اليومي والأسبوعي (The 3-Part Log Rule)
                        </h4>
                        <div className="p-3 bg-card border border-line rounded-lg font-mono text-xs text-ink font-bold">
                          [فعل إجرائي محدد] + [الأداة أو البيئة أو النظام المعتمد] + [النتيجة الملموسة والمحققة]
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-bold text-ink">مقارنة الصياغة (ضعيفة مقابل هندسية احترافية):</h5>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-line text-right text-xs">
                            <thead>
                              <tr className="bg-bg">
                                <th className="p-2 border border-line text-sub font-bold">الصياغة الضعيفة (تجنبها)</th>
                                <th className="p-2 border border-line text-accent font-extrabold">الصياغة الهندسية المقبولة أكاديمياً (اعتمدها)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line text-[11px]">
                              <tr>
                                <td className="p-2.5 text-red-500 bg-red-500/5">"جلست مع التيم وشفت كيف يشتغل السيرفر"</td>
                                <td className="p-2.5 text-ink bg-card">"حضور جلسة توجيه فني لتحليل معمارية الخوادم السحابية (AWS EC2)، وتوثيق تسلسل معالجة البيانات عبر مخطط انسيابي."</td>
                              </tr>
                              <tr>
                                <td className="p-2.5 text-red-500 bg-red-500/5">"صلحت مشكلة في الكود واشتغل"</td>
                                <td className="p-2.5 text-ink bg-card">"فحص وتصحيح استثناءات التزامن (Race Condition) في دالة المصادقة، وإعادة اختبار وحدة الشيفرة لضمان استقرار جلسات المستخدمين."</td>
                              </tr>
                              <tr>
                                <td className="p-2.5 text-red-500 bg-red-500/5">"سويت فحص للأجهزة في المعمل"</td>
                                <td className="p-2.5 text-ink bg-card">"إجراء الفحص الدوري لـ 12 محطة تحكم منطقي مبرمج (PLC) ومعايرة إشارات الحساسات والتأكد من مطابقتها لمعايير السلامة OHS."</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 4: STAR Problem Solving */}
                  {guideSection === 'star' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="p-4 bg-bg border border-line rounded-xl space-y-2">
                        <h4 className="text-sm font-extrabold text-accent">
                          منهجية STAR لتوثيق التحديات وحلها (Situation, Task, Action, Result)
                        </h4>
                        <p className="text-sub">
                          هذه المنهجية هي المعيار المعتمد لدى لجان تقييم ABET وشركات مثل أرامكو وسابك لتقييم قدرة المتدرب على حل المشكلات الهندسية:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 bg-bg border border-line rounded-xl space-y-1">
                          <span className="font-extrabold text-accent text-xs">S - Situation (الموقف والتحدي):</span>
                          <p className="text-sub text-[11px]">
                            صف المشكلة التقنية وسياقها بوضوح (مثلاً: ارتفاع معدل تأخير استجابة واجهة المستخدم أو خلل في معايرة ضغط الهيدروليك).
                          </p>
                        </div>
                        <div className="p-3.5 bg-bg border border-line rounded-xl space-y-1">
                          <span className="font-extrabold text-accent text-xs">T - Task (المهمة المطلوبة):</span>
                          <p className="text-sub text-[11px]">
                            ما كان المطلوب منك تحقيقه بالضبط دون تعطيل العمليات الجارية؟
                          </p>
                        </div>
                        <div className="p-3.5 bg-bg border border-line rounded-xl space-y-1">
                          <span className="font-extrabold text-accent text-xs">A - Action (الإجراء الهندسي):</span>
                          <p className="text-sub text-[11px]">
                            ما الخطوات المنهجية والبحثية والأدوات التي استخدمتها لعزل المشكلة واختبار الحلول البديلة؟
                          </p>
                        </div>
                        <div className="p-3.5 bg-bg border border-line rounded-xl space-y-1">
                          <span className="font-extrabold text-accent text-xs">R - Result (النتيجة والأثر):</span>
                          <p className="text-sub text-[11px]">
                            ما النتيجة الرقمية المحققة بعد الحل؟ وما الدرس المستفاد الذي يمنع تكرار الخطأ مستقبلاً؟
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 5: Action Verbs Bank */}
                  {guideSection === 'verbs' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="p-4 bg-bg border border-line rounded-xl">
                        <h4 className="text-sm font-extrabold text-accent mb-1">
                          قاموس الأفعال الإجرائية (Action Verbs Bank) المعتمدة في التقارير
                        </h4>
                        <p className="text-sub">
                          ابدأ كل جملة ومهمة بأحد هذه الأفعال لإضفاء الصبغة الهندسية والأكاديمية الرفيعة:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-bg border border-line rounded-xl space-y-2">
                          <div className="font-bold text-accent border-b border-line pb-1">التحليل والتخطيط</div>
                          <div className="text-[11px] text-sub space-y-1">
                            <div>• حلّل (Analyzed)</div>
                            <div>• قيّم (Assessed)</div>
                            <div>• استكشف (Explored)</div>
                            <div>• شخّص (Diagnosed)</div>
                            <div>• خطّط (Planned)</div>
                            <div>• قارن (Benchmarked)</div>
                          </div>
                        </div>

                        <div className="p-3 bg-bg border border-line rounded-xl space-y-2">
                          <div className="font-bold text-accent border-b border-line pb-1">التصميم والهندسة</div>
                          <div className="text-[11px] text-sub space-y-1">
                            <div>• صمّم (Designed)</div>
                            <div>• نمذج (Modeled)</div>
                            <div>• هندس (Engineered)</div>
                            <div>• صاغ (Formulated)</div>
                            <div>• رسَم (Drafted)</div>
                            <div>• هيّأ (Configured)</div>
                          </div>
                        </div>

                        <div className="p-3 bg-bg border border-line rounded-xl space-y-2">
                          <div className="font-bold text-accent border-b border-line pb-1">التنفيذ والبرمجة</div>
                          <div className="text-[11px] text-sub space-y-1">
                            <div>• برمج / طوّر (Developed)</div>
                            <div>• بنى (Constructed)</div>
                            <div>• دمج (Integrated)</div>
                            <div>• نشر (Deployed)</div>
                            <div>• أتمت (Automated)</div>
                            <div>• ربط (Interfaced)</div>
                          </div>
                        </div>

                        <div className="p-3 bg-bg border border-line rounded-xl space-y-2">
                          <div className="font-bold text-accent border-b border-line pb-1">الفحص والتحسين</div>
                          <div className="text-[11px] text-sub space-y-1">
                            <div>• فحص / اختبر (Tested)</div>
                            <div>• عاير (Calibrated)</div>
                            <div>• حسّن (Optimized)</div>
                            <div>• نقّح (Debugged)</div>
                            <div>• وثّق (Documented)</div>
                            <div>• راقب (Monitored)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 6: Institutional Standards */}
                  {guideSection === 'universities' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="p-4 bg-bg border border-line rounded-xl">
                        <h4 className="text-sm font-extrabold text-accent mb-1">
                          المعايير المحددة بحسب المؤسسة والجامعة (Institutional Rules)
                        </h4>
                        <p className="text-sub">
                          لكل جهة تعليمية اشتراطات محددة يطلبها مقيمو التقرير، احرص على تضمينها:
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3.5 bg-bg/80 border border-line rounded-xl space-y-1">
                          <div className="flex items-center gap-2 font-bold text-ink">
                            <GraduationCap className="w-4 h-4 text-accent" />
                            <span>جامعة الملك فهد للبترول والمعادن (KFUPM - COOP Guidelines):</span>
                          </div>
                          <p className="text-[11px] text-sub leading-relaxed">
                            يتطلب معيار ENGL 214 كتابة التقرير باللغة الإنجليزية، خط Times New Roman بحجم 12pt وتباعد 1.5، مع هوامش 1 إنش. يمنع منعاً باتاً استخدام ضمائر المتكلم (I, We) واستبدالها بالصيغة الموضوعية (Third-person or passive voice: "The database was optimized", "The system architecture was evaluated").
                          </p>
                        </div>

                        <div className="p-3.5 bg-bg/80 border border-line rounded-xl space-y-1">
                          <div className="flex items-center gap-2 font-bold text-ink">
                            <GraduationCap className="w-4 h-4 text-accent" />
                            <span>جامعة الملك سعود (KSU - CCIS ABET Standards):</span>
                          </div>
                          <p className="text-[11px] text-sub leading-relaxed">
                            التركيز على مخرجات الطلاب (Student Outcomes - SOs)، وربط المقررات الدراسية (مثل قواعد البيانات، الشبكات، البرمجة كائنية التوجه) بالمهام الميدانية المنفذة، مع إرفاق ملخص تنفيذي ثنائي اللغة (عربي + إنجليزي).
                          </p>
                        </div>

                        <div className="p-3.5 bg-bg/80 border border-line rounded-xl space-y-1">
                          <div className="flex items-center gap-2 font-bold text-ink">
                            <Building className="w-4 h-4 text-accent" />
                            <span>المؤسسة العامة للتدريب التقني والمهني (TVTC Guidelines):</span>
                          </div>
                          <p className="text-[11px] text-sub leading-relaxed">
                            التركيز على التقرير الفني العملي، وتوضيح الفارق بين ما تدرب عليه المتدرب في معامل الكلية والآلات/الأنظمة الحقيقية في الموقع الصناعي، مع تخصيص قسم كامل لإجراءات السلامة المهنية ومعدات الحماية الشخصية (PPE).
                          </p>
                        </div>

                        <div className="p-3.5 bg-bg/80 border border-line rounded-xl space-y-1">
                          <div className="flex items-center gap-2 font-bold text-ink">
                            <Building className="w-4 h-4 text-accent" />
                            <span>جهات التدريب الكبرى وجامعات الخليج (Aramco, STC, Kuwait Univ, UAEU):</span>
                          </div>
                          <p className="text-[11px] text-sub leading-relaxed">
                            التركيز على مؤشرات الأداء الرئيسية (KPIs)، والجدوى التشغيلية، ومساهمة المتدرب في المشاريع الحية مع الحفاظ على سرية البيانات غير المصرح بنشرها (Non-Disclosure Agreement).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: ACTUAL APPROVED SAMPLES LIBRARY */}
              {modalSubTab === 'samples' && (
                <div className="space-y-4">
                  {/* Samples Selector Pills */}
                  <div className="flex gap-2 p-1.5 bg-bg border border-line rounded-xl overflow-x-auto shrink-0">
                    {ACTUAL_PREVIOUS_REPORTS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => setSelectedSample(sample)}
                        className={`px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                          selectedSample.id === sample.id
                            ? 'bg-accent text-white shadow-xs'
                            : 'text-sub hover:text-ink hover:bg-card'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>{sample.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Sample Card Meta */}
                  <div className="bg-bg/60 p-4 rounded-xl border border-line space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2">
                      <div>
                        <span className="font-extrabold text-accent text-sm">{selectedSample.institution}</span>
                        <div className="text-sub font-semibold text-xs">{selectedSample.specialty}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdoptSample(selectedSample)}
                        className="px-3.5 py-1.5 bg-ok hover:bg-ok/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>استيراد هذا النموذج كمسودة لتقريري</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-sub">
                      <div><b>جهة التدريب:</b> {selectedSample.hostCompany}</div>
                      <div><b>عنوان التقرير:</b> {selectedSample.studentTitle}</div>
                    </div>
                  </div>

                  {/* Sample Sections Breakdown */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-extrabold text-accent text-xs mb-1 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>الملخص التنفيذي المعتمد (Executive Summary):</span>
                      </h4>
                      <p className="p-3 bg-bg border border-line rounded-xl leading-relaxed whitespace-pre-wrap text-sub">{selectedSample.executiveSummary}</p>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-ink text-xs mb-1 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        <span>المقدمة وأهداف التدريب التعاوني:</span>
                      </h4>
                      <p className="p-3 bg-bg border border-line rounded-xl leading-relaxed whitespace-pre-wrap text-sub">{selectedSample.introText}</p>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-ink text-xs mb-1 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5" />
                        <span>نبذة عن جهة التدريب والبيئة التشغيلية:</span>
                      </h4>
                      <p className="p-3 bg-bg border border-line rounded-xl leading-relaxed whitespace-pre-wrap text-sub">{selectedSample.entityIntroText}</p>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-ink text-xs mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>المهارات والخبرات المكتسبة والربط الأكاديمي:</span>
                      </h4>
                      <p className="p-3 bg-bg border border-line rounded-xl leading-relaxed whitespace-pre-wrap text-sub">{selectedSample.skillsText}</p>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-ink text-xs mb-1 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>التحديات الفنية ومعالجة الصعوبات (STAR Problem-Solving):</span>
                      </h4>
                      <p className="p-3 bg-bg border border-line rounded-xl leading-relaxed whitespace-pre-wrap text-sub">{selectedSample.challengesText}</p>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-ink text-xs mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-ok" />
                        <span>الخاتمة والتوصيات:</span>
                      </h4>
                      <p className="p-3 bg-bg border border-line rounded-xl leading-relaxed whitespace-pre-wrap text-sub">{selectedSample.conclusionText}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="text-[11px] text-sub">
                {modalSubTab === 'guide' 
                  ? 'يمكنك التبديل إلى تبويب "نماذج سابقة" لاستيراد أي نموذج بالكامل بضغطة زر' 
                  : `معروض حالياً نموذج: ${selectedSample.name}`}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSamplesModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-sub hover:text-ink bg-bg rounded-xl border border-line"
                >
                  إغلاق
                </button>
                {modalSubTab === 'samples' && (
                  <button
                    type="button"
                    onClick={() => handleAdoptSample(selectedSample)}
                    className="px-4 py-2 text-xs font-bold text-white bg-accent hover:bg-accent/90 rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>اعتماد وتطبيق هذا النموذج كمسودة</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Version History Modal (سجل الإصدارات الكامل والتنقل الزمني) */}
      {versionsModalOpen && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in no-print">
          <div className="bg-card border border-line rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="text-base font-extrabold text-ink">سجل الإصدارات ولقطات التقرير</h3>
                  <p className="text-xs text-sub">يمكنك الرجوع لأي إصدار سابق في ثانية واحدة دون فقدان نسختك الحالية</p>
                </div>
              </div>
              <button
                onClick={() => setVersionsModalOpen(false)}
                className="p-1 text-sub hover:text-ink rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto space-y-3 flex-1 divide-y divide-line">
              {versions.map((ver, idx) => {
                const isCurrent = idx === currentVersionIndex;
                return (
                  <div
                    key={ver.id}
                    className={`pt-3 first:pt-0 p-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                      isCurrent ? 'bg-accent-dim/50 border border-accent/30' : 'hover:bg-bg'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-ink">{ver.label}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-accent text-white">
                            النسخة الحالية المعروضة
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-sub flex items-center gap-2">
                        <Clock className="w-3 h-3 text-sub shrink-0" />
                        <span>{ver.timeFormatted}</span>
                        <span>•</span>
                        <span>{ver.wordCount} كلمة</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => handleRestoreVersion(ver, idx)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all disabled:opacity-40 flex items-center gap-1.5 bg-bg hover:bg-card border-line text-ink"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-ok" />
                      <span>{isCurrent ? 'النسخة الحالية' : 'استعادة هذه النسخة'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setVersionsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-sub hover:text-ink rounded-xl bg-bg"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diff Modal */}
      <DiffModal
        isOpen={diffModalOpen}
        actionTitle={diffTitle}
        originalText={originalText}
        improvedText={improvedText}
        diffChunks={diffChunks}
        onAccept={() => {
          if (currentTargetField) {
            const updated = { ...profileData, [currentTargetField]: improvedText };
            setProfileData(updated);
            recordVersion(`بعد ${diffTitle}: ${fieldLabels[currentTargetField as TextProfileField] || currentTargetField}`, updated);
            saveProfileMutation.mutate(updated);
            setSaveToast(previewLang === 'en' ? 'AI improvements applied and saved!' : 'تم تطبيق التعديلات الذكية وحفظها تلقائياً!');
            setTimeout(() => setSaveToast(''), 3000);
          }
          setDiffModalOpen(false);
        }}
        onClose={() => setDiffModalOpen(false)}
      />
    </div>
  );
};
