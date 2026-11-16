import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MOCK_SAMPLE_PREVIEW_PROFILE, MOCK_SAMPLE_PREVIEW_WEEKS } from '../../data/mockPreviewData';
import { FinalReportData, EntryDTO, ProfileInput, DiffChunk, formatDateArabic, formatDateEnglish, countWords, calculateHoursBetween, REPORT_TEMPLATES, ReportTemplateId, OrganizationLookupResult, generateAcademicWeeklySynthesis, formatWeekPeriod, elevateTaskTitle, normalizeStudentName, convertBulletsToCohesiveParagraphs } from '@coop/shared';
import {
  FileText,
  Search,
  Globe,
  Building2,
  Copy,
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
  RefreshCw,
  Eye,
  ArrowRight,
  Compass,
  Lightbulb,
  Award,
  HelpCircle,
  ListChecks,
  Send,
  ExternalLink,
  Presentation
} from 'lucide-react';
import { DiffModal } from '../common/DiffModal';
import { ProceduralNarrativeView } from '../common/ProceduralNarrativeView';
import { FinalReportDocument } from './FinalReportDocument';
import { ActionMenu } from '../ui/ActionMenu';
import { AssistantPanel } from '../ai/AssistantPanel';
import { AssistantMemory } from '../ai/AssistantMemory';
import { WritingHints } from '../ai/WritingHints';

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
    'أخرى': 'Other',
    'شبكات الاتصالات اللاسلكية والجيل الخامس (5G)': 'Wireless Networks & 5G Telecom',
    'شبكات النفاذ والألياف الضوئية (FTTH)': 'Access Networks & Optical Fiber (FTTH)',
    'أمن المعلومات والأمن السيبراني': 'Cybersecurity & Information Protection',
    'إدارة الأعطال والتشغيل ومراقبة الأنظمة (NOC)': 'Incident Management, Operations & NOC Monitoring',
    'هندسة الشبكات وتراسل البيانات': 'Network Engineering & Data Transmission',
    'تطوير وهندسة البرمجيات والأنظمة': 'Software & Systems Engineering',
    'إدارة الأنظمة والخوادم المؤسسية': 'Enterprise Systems & Server Administration',
    'الحوسبة السحابية والبنية الرقمية': 'Cloud Computing & Digital Infrastructure',
    'إدارة قواعد البيانات والنسخ الاحتياطي': 'Database Administration & Disaster Recovery',
    'إدارة المشاريع والجودة والامتثال': 'Project Management, QA & Compliance'
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

export const getWeekTopic = (w: { weekIndex: number; entries?: { title: string; description?: string }[] }, isAr: boolean = true): string => {
  if (w.entries && w.entries.length > 0) {
    const titles = w.entries
      .map(e => e.title.replace(/\s*[-—–]\s*(اليوم|Day)\s*\d+.*$/i, '').trim())
      .filter(t => t.length > 2);
    const uniqueTitles = Array.from(new Set(titles));
    if (uniqueTitles.length > 0) {
      const elevated = uniqueTitles.slice(0, 2).map(t => elevateTaskTitle(t, '')).join(isAr ? ' و ' : ' & ');
      return elevated || uniqueTitles[0];
    }
  }
  return isAr ? 'أسبوع تدريبي مجدول (قيد التوثيق)' : 'Scheduled Training Week (Pending)';
};

// Helper to render procedural narrative with classified sections or cohesive paragraphs
export const renderProceduralNarrative = (rawText: string, isAr: boolean = true) => {
  if (!rawText) return null;
  return <ProceduralNarrativeView rawText={rawText} isAr={isAr} />;
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
    executiveSummary: 'يمثل هذا التقرير التوثيق النهائي لفترة التدريب التعاوني في قطاع العمليات والشبكات بشركة stc على مدار 14 أسبوعاً (320 ساعة تدريبية فعلية). شملت المهام صيانة كبائن التوزيع (MDF/IDF)، وتكوين شبكات الاتصال المحلية الافتراضية (VLANs) على محولات Cisco Catalyst، وربط خطوط المشتركين بنظام الألياف الضوئية (FTTH)، ورصد أداء الشبكة ومعالجة 84 تذكرة بلاغ عطل فني وفق مؤشرات الأداء (SLA).',
    introText: 'انطلاقاً من الخطة التدريبية المقررة بالكلية، يهدف هذا المقرر الميداني إلى تطبيق المعارف والمهارات المكتسبة في معامل الكلية على بيئة العمل المؤسسية الفعلية، والتعرف على المعايير الصناعية المتبعة في إدارة الشبكات وتقنيات الاتصال الحديثة.',
    entityIntroText: 'تعد شركة الاتصالات السعودية (stc) رائدة التحول الرقمي ومزود الاتصالات الرائد في الشرق الأوسط. يتميز قطاع الشبكات والعمليات ببيئة عمل احترافية تدير آلاف المقاسم والخوادم ومراكز البيانات الموزعة، مع الالتزام الصارم بضوابط الأمان واستمرارية الخدمة بنسبة توافر 99.99%.',
    skillsText: '• المهارات الفنية: برمجة وتكوين محولات وموجهات Cisco، فحص توصيلات الألياف الضوئية بجهاز OTDR، تركيب وتأريض كبائن الاتصالات، وضبط جدران الحماية Fortinet.\n• المهارات الشخصية: التواصل الفني، العمل في نوبات الطوارئ، وتوثيق الإجراءات القياسية (SOP).',
    challengesText: 'واجه الفريق تذبذباً في إشارات بعض خطوط الألياف الضوئية لأحد القطاعات؛ تم استخدام جهاز فحص الانكسار الضوئي وتحديد نقطة الانحناء الحرج وإعادة لحام الشعيرات، مما استعاد جودة الإشارة بنسبة 100%.',
    conclusionText: 'أثبتت فترة التدريب التعاوني أهميتها المحورية في تجسير الفجوة بين الجانبين الأكاديمي والعملي، وساهمت في تعزيز الثقة والجاهزية للانخراط في سوق العمل التقني بكفاءة عالية واحترافية تامة.'
  },
  {
    id: 'huawei-telecom',
    name: 'نموذج هندسة شبكات الاتصالات وهواوي (Huawei & Telecom)',
    institution: 'كلية الاتصالات والمعلومات بالرياض (قسم تقنية الاتصالات)',
    templateId: 'telecom',
    specialty: 'هندسة الاتصالات وشبكات الجيل الخامس (5G RAN & Transmission)',
    hostCompany: 'شركة هواوي تك إنفستمنت العربية بالتعاون مع المشغلين (stc / Mobily / Zain)',
    studentTitle: 'فحص وتكامل محطات الجيل الخامس ومسارات المايكروويف والألياف الضوئية (5G & RTN Integration)',
    executiveSummary: 'يوثق هذا التقرير مخرجات التدريب الميداني في مشاريع توسعة وتحديث شبكات الاتصالات المتنقلة. شملت المهام تركيب واختبار وحدات النطاق الأساسي BBU5900، وفحص كوابل التغذية والموجة الراجعة (VSWR) للهوائيات، وتهيئة وصلات المايكروويف RTN 950A، وفحص مسارات الألياف الضوئية بجهاز OTDR للتأكد من مستويات الطاقة الضوئية (Optical RX Power). أسفرت الأعمال عن إتمام اختبارات القبول الموقعي (PAT) لـ 26 محطة بنسبة نجاح 100% ودون تسجيل أي إنذارات حرجة.',
    introText: 'يهدف التدريب الميداني في كلية الاتصالات والمعلومات إلى مواءمة المعارف الأكاديمية مع الواقع التشغيلي لمشاريع الاتصالات الكبرى، وتطبيق معايير وإجراءات التشغيل القياسية (SOP) العالمية.',
    entityIntroText: 'تعد شركة هواوي من رواد تقنية المعلومات والاتصالات عالمياً، وتعمل بشراكة استراتيجية مع مشغلي الاتصالات (stc، موبايلي، زين) لبناء وتحديث البنية التحتية لشبكات الجيل الخامس وشبكات النقل التراسلي المتقدمة.',
    skillsText: '• المهارات الفنية: فحص الموجة الراجعة بجهاز Site Master، لحام واختبار الألياف الضوئية (Splicing & OTDR)، تهيئة وحدات BBU و RRU، استخدام برمجيات Web LMT و U2020، ومطابقة متطلبات فحص القبول PAT.\n• المهارات المهنية: الالتزام الصارم بضوابط السلامة المهنية الميدانية (HSE)، إدارة تصاريح العمل (Work Permits)، والعمل الجماعي الفعال.',
    challengesText: 'ظهور إنذار عدم اتساق المسار الضوئي (Optical Link Loss) أثناء تدشين أحد المواقع؛ جرى فحص الوصلات بجهاز OTDR واكتشاف انحناء حرج في كابل التغذية مع تلوث نهاية موصل الـ SFP. تم تنظيف العدسات وإعادة المسار، مما أعاد طاقة الإشارة إلى -13.8 dBm وأنهى الإنذار بنجاح.',
    conclusionText: 'أثمر التدريب التعاوني عن إتقان المهارات الميدانية التشغيلية المعقدة في قطاع الاتصالات، وعزز الجاهزية الكاملة للعمل كمهندس اتصالات وشبكات يمتلك الكفاءة العالية في بيئات العمل الحية.'
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const instLogoInputRef = useRef<HTMLInputElement>(null);
  const compLogoInputRef = useRef<HTMLInputElement>(null);
  const [samplesModalOpen, setSamplesModalOpen] = useState<boolean>(false);
  const [selectedSample, setSelectedSample] = useState<ReportSample>(ACTUAL_PREVIOUS_REPORTS[0]);
  const [modalSubTab, setModalSubTab] = useState<'guide' | 'samples'>('guide');
  const [guideSection, setGuideSection] = useState<'overview' | 'executive' | 'daily' | 'star' | 'verbs' | 'universities'>('overview');
  const [isSampleMode, setIsSampleMode] = useState<boolean>(false);
  const [assistantField, setAssistantField] = useState<'introText' | 'entityIntroText' | 'skillsText' | 'conclusionText' | null>(null);
  const [memoryOpen, setMemoryOpen] = useState<boolean>(false);

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

  // Organization Academic AI Search State
  const [orgSearchModalOpen, setOrgSearchModalOpen] = useState<boolean>(false);
  const [orgSearchQuery, setOrgSearchQuery] = useState<string>('');
  const [orgSearchDept, setOrgSearchDept] = useState<string>('');
  const [orgSearching, setOrgSearching] = useState<boolean>(false);
  const [orgSearchResult, setOrgSearchResult] = useState<OrganizationLookupResult | null>(null);
  const [orgSearchActiveTab, setOrgSearchActiveTab] = useState<'entity' | 'intro' | 'skills' | 'conclusion'>('entity');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  
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

  // Toggle between Showing Only Truthful Documented Weeks (Default) vs Full Theoretical Plan
  const [showOnlyActualWeeks, setShowOnlyActualWeeks] = useState<boolean>(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const isInitialMount = useRef(true);

  // Always guaranteed 14 weeks for the Table of Contents & Timeline
  const weeksCount = profileData.trainingWeeks || 14;
  const rawWeeks = reportData?.weeks || [];
  const weeksWithEntries = rawWeeks.filter(
    (w) => (w.entries && w.entries.length > 0) || w.totalHours > 0
  );
  const actualWeeksCount = weeksWithEntries.length;

  const displayWeeks =
    showOnlyActualWeeks && actualWeeksCount > 0
      ? weeksWithEntries
      : rawWeeks.length > 0
      ? rawWeeks
      : Array.from({ length: weeksCount }, (_, i) => {
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

  // Active Preview Profile & Weeks (Switches between Sample Data & Real Trainee Data)
  const activePreviewProfile = isSampleMode
    ? { ...MOCK_SAMPLE_PREVIEW_PROFILE, reportTemplate: profileData.reportTemplate }
    : profileData;
  const activePreviewWeeks = isSampleMode ? MOCK_SAMPLE_PREVIEW_WEEKS : displayWeeks;

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

  // Initialize profile with smart merge from LocalStorage draft & DB
  useEffect(() => {
    let draftProfile: Partial<ProfileInput> | null = null;
    try {
      const cachedDraft = localStorage.getItem(PROFILE_DRAFT_KEY);
      if (cachedDraft) {
        draftProfile = JSON.parse(cachedDraft);
      }
    } catch {}

    if (reportData?.profile) {
      const dbProfile = reportData.profile;
      const merged: ProfileInput = {
        studentName: dbProfile.studentName || draftProfile?.studentName || '',
        trainingNumber: dbProfile.trainingNumber || draftProfile?.trainingNumber || '',
        department: dbProfile.department || draftProfile?.department || '',
        trainingUnit: dbProfile.trainingUnit || draftProfile?.trainingUnit || '',
        supervisorName: dbProfile.supervisorName || draftProfile?.supervisorName || '',
        responsibleName: dbProfile.responsibleName || draftProfile?.responsibleName || '',
        entityAddress: dbProfile.entityAddress || draftProfile?.entityAddress || '',
        employeesCount: dbProfile.employeesCount || draftProfile?.employeesCount || '',
        trainingWeeks: dbProfile.trainingWeeks || draftProfile?.trainingWeeks || 14,
        courseHours: dbProfile.courseHours || draftProfile?.courseHours || 280,
        startDate: dbProfile.startDate || draftProfile?.startDate || '',
        companyLogo: dbProfile.companyLogo || draftProfile?.companyLogo || '',
        institutionLogo: dbProfile.institutionLogo || draftProfile?.institutionLogo || '',
        reportTemplate: (dbProfile.reportTemplate as any) || draftProfile?.reportTemplate || 'royal',
        executiveSummary: dbProfile.executiveSummary || draftProfile?.executiveSummary || '',
        challengesText: dbProfile.challengesText || draftProfile?.challengesText || '',
        recommendationsText: dbProfile.recommendationsText || draftProfile?.recommendationsText || '',
        introText: dbProfile.introText || draftProfile?.introText || '',
        entityIntroText: dbProfile.entityIntroText || draftProfile?.entityIntroText || '',
        skillsText: dbProfile.skillsText || draftProfile?.skillsText || '',
        conclusionText: dbProfile.conclusionText || draftProfile?.conclusionText || ''
      };

      setProfileData(merged);

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
          const textAll = [merged.introText, merged.entityIntroText, merged.skillsText, merged.conclusionText].join(' ');
          const initialSnapshot: ReportVersionSnapshot = {
            id: 'ver_init',
            timestamp: new Date().toISOString(),
            timeFormatted: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            label: 'النسخة الأصلية المحفوظة',
            data: merged,
            wordCount: countWords(textAll)
          };
          setVersions([initialSnapshot]);
          setCurrentVersionIndex(0);
        }
      }
    } else if (draftProfile && !profileData.studentName) {
      setProfileData((prev) => ({ ...prev, ...draftProfile }));
    }
  }, [reportData]);

  // Automatic Background Save to LocalStorage & Cloud DB (Never Lose Data)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!profileData.studentName && !profileData.introText && !profileData.entityAddress) {
      return;
    }

    // Immediate Local Storage persistence
    localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(profileData));

    // Background Cloud Save (debounced 1200ms)
    setAutoSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        await api.put('/profile', profileData);
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      } catch {
        setAutoSaveStatus('idle');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [profileData]);

  // Save Profile Mutation (Manual save button also available)
  const saveProfileMutation = useMutation({
    mutationFn: async (data: ProfileInput) => {
      const res = await api.put('/profile', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      setSaveToast('تم حفظ وتثبيت كافة بيانات التقرير في السجلات السحابية بنجاح');
      recordVersion('تم الحفظ يدوياً في قاعدة البيانات', profileData);
      setTimeout(() => setSaveToast(''), 3000);
    }
  });

  // Submit Final Report for Supervisor Review
  const submitReportMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/supervisor/submit-report');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      setSaveToast(data.message || 'تم إرسال التقرير للمشرف الأكاديمي بنجاح');
      setTimeout(() => setSaveToast(''), 3500);
    },
    onError: (err: any) => {
      setErrorToast(err.response?.data?.error || 'تعذر إرسال التقرير للمشرف');
      setTimeout(() => setErrorToast(''), 3500);
    }
  });

  const handleProfileChange = <K extends keyof ProfileInput>(field: K, value: ProfileInput[K]) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfileMutation.mutate(profileData);
  };

  // Auto-snapshot when user finishes typing a section (>2.5s of typing inactivity)
  useEffect(() => {
    if (!profileData.studentName && !profileData.introText) return;
    const snapHandler = setTimeout(() => {
      const currentSnap = versions[currentVersionIndex];
      if (currentSnap && JSON.stringify(currentSnap.data) !== JSON.stringify(profileData)) {
        recordVersion('حفظ تلقائي أثناء التحرير', profileData);
      }
    }, 2500);

    return () => clearTimeout(snapHandler);
  }, [profileData, currentVersionIndex, versions]);

  // Time Travel: Undo to previous snapshot
  const handleUndo = () => {
    if (currentVersionIndex > 0) {
      const prevIdx = currentVersionIndex - 1;
      const target = versions[prevIdx];
      setCurrentVersionIndex(prevIdx);
      setProfileData({ ...target.data });
      localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(target.data));
      saveProfileMutation.mutate(target.data);
      setSaveToast(`تم التراجع إلى النسخة السابقة: (${target.label}) وحفظها بنجاح`);
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
      localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(target.data));
      saveProfileMutation.mutate(target.data);
      setSaveToast(`تم التقدم إلى النسخة اللاحقة: (${target.label}) وحفظها بنجاح`);
      setTimeout(() => setSaveToast(''), 3000);
    }
  };

  // Time Travel: Jump to specific snapshot
  const handleRestoreVersion = (ver: ReportVersionSnapshot, idx: number) => {
    setCurrentVersionIndex(idx);
    setProfileData({ ...ver.data });
    localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(ver.data));
    saveProfileMutation.mutate(ver.data);
    setVersionsModalOpen(false);
    setSaveToast(`تم استعادة النسخة: (${ver.label}) وحفظها في قاعدة البيانات بنجاح`);
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

  type TextProfileField = 'introText' | 'entityIntroText' | 'skillsText' | 'conclusionText' | 'executiveSummary' | 'challengesText' | 'recommendationsText';

  const fieldLabels: Record<TextProfileField, string> = {
    introText: 'المقدمة وأهداف التدريب',
    entityIntroText: 'التعريف بجهة التدريب',
    skillsText: 'المعارف والمهارات المكتسبة',
    conclusionText: 'الخاتمة والتوصيات',
    executiveSummary: 'الملخص التنفيذي للتقرير',
    challengesText: 'التحديات التشغيلية والحلول',
    recommendationsText: 'التوصيات المهنية والأكاديمية'
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

  // Organization Academic Search & Generation Handlers
  const handleOpenOrgSearchModal = (initialName?: string, targetTab: 'entity' | 'intro' | 'skills' | 'conclusion' | 'all' = 'entity') => {
    const query = (initialName || profileData.entityAddress || '').trim();
    setOrgSearchQuery(query);
    setOrgSearchDept(profileData.department || '');
    setOrgSearchActiveTab(targetTab === 'all' ? 'entity' : targetTab);
    setOrgSearchModalOpen(true);

    if (query && (!orgSearchResult || orgSearchResult.organizationName !== query)) {
      executeOrgLookup(query, profileData.department || '');
    }
  };

  const executeOrgLookup = async (name: string, dept: string) => {
    if (!name || !name.trim()) {
      triggerError('يرجى إدخال اسم جهة التدريب للبحث');
      return;
    }
    setOrgSearching(true);
    try {
      const res = await api.post('/ai/organization-lookup', {
        organizationName: name.trim(),
        department: dept.trim()
      });
      setOrgSearchResult(res.data);
    } catch (err: any) {
      triggerError(err.response?.data?.error || 'تعذر استرجاع بيانات الجهة من الإنترنت حالياً');
    } finally {
      setOrgSearching(false);
    }
  };

  const handleApplyOrgContent = (field: TextProfileField | 'all') => {
    if (!orgSearchResult) return;

    recordVersion(`قبل تعبئة بيانات الجهة (${orgSearchResult.foundName})`, profileData);

    const updated: ProfileInput = { ...profileData };

    if (!updated.entityAddress || updated.entityAddress.trim().length < 4) {
      updated.entityAddress = orgSearchResult.foundName;
    }

    if (field === 'all') {
      updated.entityIntroText = orgSearchResult.entityOverview;
      updated.introText = orgSearchResult.suggestedIntro;
      updated.skillsText = orgSearchResult.suggestedSkills;
      updated.conclusionText = orgSearchResult.suggestedConclusion;
      setSaveToast('تم تعبئة كافة الأقسام الأربعة بصياغة أكاديمية رصينة بنجاح!');
    } else if (field === 'entityIntroText') {
      updated.entityIntroText = orgSearchResult.entityOverview;
      setSaveToast('تم تعبئة قسم (التعريف بجهة التدريب وطبيعة العمل) بنجاح!');
    } else if (field === 'introText') {
      updated.introText = orgSearchResult.suggestedIntro;
      setSaveToast('تم تعبئة قسم (المقدمة وأهداف التدريب) بنجاح!');
    } else if (field === 'skillsText') {
      updated.skillsText = orgSearchResult.suggestedSkills;
      setSaveToast('تم تعبئة قسم (المعارف والمهارات المكتسبة) بنجاح!');
    } else if (field === 'conclusionText') {
      updated.conclusionText = orgSearchResult.suggestedConclusion;
      setSaveToast('تم تعبئة قسم (الخاتمة والتوصيات) بنجاح!');
    }

    setProfileData(updated);
    saveProfileMutation.mutate(updated);
    recordVersion(`بعد تعبئة بيانات الجهة (${orgSearchResult.foundName})`, updated);
    setOrgSearchModalOpen(false);
    setTimeout(() => setSaveToast(''), 4000);
  };

  // Auto-Translate Entire Report
  const handleAutoTranslateReport = async () => {
    const fields: TextProfileField[] = [
      'introText',
      'entityIntroText',
      'skillsText',
      'conclusionText',
      'executiveSummary',
      'challengesText',
      'recommendationsText'
    ];
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
      const res = await api.get(`/reports/export/docx?lang=${previewLang}&onlyActual=${showOnlyActualWeeks}`, {
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
      const res = await api.get(`/reports/export/html?lang=${previewLang}&onlyActual=${showOnlyActualWeeks}`, {
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

      {/* ── Command bar: status, versions and export in one row ── */}
      {(() => {
        const st = reportData?.profile?.status || 'draft';
        const statusMeta: Record<string, { label: string; hint: string; tone: string }> = {
          draft: { label: 'مسودة', hint: 'عند اكتمال الفصول ارفع التقرير للمشرف للمراجعة.', tone: 'is-draft' },
          submitted: { label: 'مرفوع للمراجعة', hint: 'التقرير معروض الآن لدى المشرف.', tone: 'is-review' },
          under_review: { label: 'قيد المراجعة', hint: 'التقرير معروض الآن لدى المشرف.', tone: 'is-review' },
          changes_requested: { label: 'مطلوب تعديلات', hint: 'اقرأ ملاحظات المشرف وعدّل الأقسام ثم أعد الإرسال.', tone: 'is-warn' },
          approved: {
            label: 'معتمد',
            hint: `اعتمده المشرف${reportData?.profile?.supervisorName ? `: ${reportData.profile.supervisorName}` : ''}.`,
            tone: 'is-ok'
          }
        };
        const meta = statusMeta[st] || statusMeta.draft;
        const plannedHours = profileData.courseHours || 0;
        const loggedHours = reportData?.totalHours || 0;
        return (
          <div className="fr-bar no-print">
            <div className="fr-bar-status">
              <span className={`fr-status ${meta.tone}`}>{meta.label}</span>
              <span className="fr-bar-hint">{meta.hint}</span>
            </div>

            <div className="fr-bar-actions">
              <ActionMenu
                label="الإصدارات والنسخ"
                icon={<History className="w-4 h-4" aria-hidden="true" />}
                groups={[
                  {
                    label: 'الإصدارات',
                    items: [
                      { id: 'undo', label: 'تراجع', hint: 'العودة إلى الإصدار السابق', icon: <RotateCcw className="w-4 h-4" />, disabled: currentVersionIndex <= 0, onSelect: handleUndo },
                      { id: 'redo', label: 'إعادة', hint: 'التقدم إلى الإصدار الأحدث', icon: <RotateCw className="w-4 h-4" />, disabled: currentVersionIndex >= versions.length - 1, onSelect: handleRedo },
                      { id: 'history', label: 'سجل الإصدارات', icon: <History className="w-4 h-4" />, badge: String(versions.length), onSelect: () => setVersionsModalOpen(true) },
                      { id: 'pin', label: 'حفظ لقطة الآن', icon: <Pin className="w-4 h-4" />, onSelect: handleManualSnapshot }
                    ]
                  },
                  {
                    label: 'النسخ الاحتياطية',
                    items: [
                      { id: 'json', label: 'تنزيل نسخة كاملة (JSON)', hint: 'قابلة للاستيراد لاحقاً', icon: <Download className="w-4 h-4" />, disabled: !!downloadingArchive, onSelect: handleDownloadBackupJSON },
                      { id: 'csv', label: 'تنزيل السجل اليومي (CSV)', icon: <Download className="w-4 h-4" />, disabled: !!downloadingArchive, onSelect: handleDownloadBackupCSV },
                      { id: 'md', label: 'تنزيل نص التقرير (Markdown)', icon: <Download className="w-4 h-4" />, disabled: !!downloadingArchive, onSelect: () => handleDownloadBackupMarkdown(previewLang) },
                      { id: 'import', label: 'استيراد نسخة احتياطية', icon: <UploadCloud className="w-4 h-4" />, onSelect: () => fileInputRef.current?.click() }
                    ]
                  }
                ]}
              />

              <ActionMenu
                label="تصدير"
                icon={<Download className="w-4 h-4" aria-hidden="true" />}
                busy={downloadingDocx || downloadingPptx || downloadingHtml}
                groups={[
                  {
                    label: 'الصيغة',
                    items: [
                      { id: 'pdf', label: 'طباعة أو حفظ PDF', hint: 'نسخة الطباعة الرسمية', icon: <Printer className="w-4 h-4" />, onSelect: handlePrintPDF },
                      { id: 'docx', label: 'Word (.docx)', hint: downloadingDocx ? 'جارٍ التصدير...' : 'مستند قابل للتعديل مع فهرس', icon: <FileText className="w-4 h-4" />, disabled: downloadingDocx, onSelect: handleExportDocx },
                      { id: 'pptx', label: 'PowerPoint (.pptx)', hint: downloadingPptx ? 'جارٍ التصدير...' : 'شرائح المناقشة', icon: <Presentation className="w-4 h-4" />, disabled: downloadingPptx, onSelect: handleExportPresentation },
                      { id: 'html', label: 'صفحة HTML مستقلة', hint: downloadingHtml ? 'جارٍ التصدير...' : 'تعمل دون اتصال', icon: <FileCode className="w-4 h-4" />, disabled: downloadingHtml, onSelect: handleExportHTML }
                    ]
                  },
                  {
                    label: 'الخيارات',
                    items: [
                      {
                        id: 'lang',
                        label: previewLang === 'ar' ? 'لغة التقرير: العربية' : 'Report language: English',
                        hint: previewLang === 'ar' ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic',
                        icon: <Languages className="w-4 h-4" />,
                        onSelect: () => setPreviewLang(previewLang === 'ar' ? 'en' : 'ar')
                      },
                      {
                        id: 'weeks',
                        label: showOnlyActualWeeks ? `الأسابيع الموثقة فقط (${actualWeeksCount})` : `كل أسابيع الخطة (${weeksCount})`,
                        hint: showOnlyActualWeeks ? 'إظهار كل أسابيع الخطة' : 'إظهار الأسابيع الموثقة فقط',
                        icon: <CheckCircle2 className="w-4 h-4" />,
                        onSelect: () => setShowOnlyActualWeeks(!showOnlyActualWeeks)
                      }
                    ]
                  }
                ]}
              />

              {st === 'approved' && reportData?.profile?.verificationHash ? (
                <a
                  className="btn-primary"
                  href={`/verify/${(reportData.profile as any).id || user?.id || 1}/${reportData.profile.verificationHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  <span>رابط التحقق</span>
                </a>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  disabled={submitReportMutation.isPending || st === 'submitted' || st === 'under_review'}
                  onClick={() => submitReportMutation.mutate()}
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {submitReportMutation.isPending ? 'جارٍ الإرسال...' : st === 'changes_requested' ? 'إعادة الإرسال للمشرف' : 'إرسال للمشرف'}
                  </span>
                </button>
              )}
            </div>

            <p className="fr-bar-stats">
              <span>{reportData?.wordCount || 0} كلمة</span>
              <span aria-hidden="true">·</span>
              <span>
                {loggedHours} ساعة مسجلة{plannedHours > 0 ? ` من ${plannedHours}` : ''}
              </span>
              <span aria-hidden="true">·</span>
              <span>{actualWeeksCount} من {weeksCount} أسبوعاً موثقاً</span>
            </p>
          </div>
        );
      })()}

      {/* Profile Form Card */}
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-line">
          <div>
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-accent" />
              <span>بيانات الغلاف وأقسام التقرير النهائي</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs text-sub">
                تُحفظ هذه البيانات سحابياً تلقائياً وتُدرج في الغلاف والمقدمة والخاتمة لملفات DOCX و PDF و HTML
              </p>
              {autoSaveStatus === 'saving' && (
                <span className="text-[11px] text-accent font-bold flex items-center gap-1 bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-accent" />
                  جارِ الحفظ التلقائي بالسحابة...
                </span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="text-[11px] text-ok font-bold flex items-center gap-1 bg-ok-bg px-2.5 py-0.5 rounded-full border border-ok/30 animate-fade-in">
                  <CheckCircle2 className="w-3 h-3 text-ok" />
                  تم الحفظ التلقائي في السجلات السحابية
                </span>
              )}
              {autoSaveStatus === 'idle' && (
                <span className="text-[11px] text-muted font-medium flex items-center gap-1 bg-bg px-2 py-0.5 rounded-full border border-line">
                  <Check className="w-3 h-3 text-ok" />
                  محفوظ سحابياً ومحلياً (لا حاجة لإعادة التعبئة)
                </span>
              )}
            </div>
          </div>

          <ActionMenu
            label="مساعد الكتابة"
            icon={<Sparkles className="w-4 h-4" aria-hidden="true" />}
            busy={aiLoading}
            groups={[
              {
                items: [
                  {
                    id: 'audit',
                    label: 'تدقيق كل الفقرات',
                    hint: 'إملاء ونحو للأقسام الأربعة دفعة واحدة',
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    disabled: aiLoading,
                    onSelect: handleAuditAllSections
                  },
                  {
                    id: 'translate',
                    label: previewLang === 'ar' ? 'ترجمة الأقسام إلى الإنجليزية' : 'ترجمة الأقسام إلى العربية',
                    hint: 'تُحفظ نسخة من النص قبل الترجمة',
                    icon: <Languages className="w-4 h-4" />,
                    disabled: aiLoading,
                    onSelect: handleAutoTranslateReport
                  }
                ]
              }
            ]}
          />
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">

          {/* Institutional Template Switcher Bar */}
          <div className="bg-bg/60 border border-line rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-ink">اختر قالب التقرير الأنسب لمؤسستك أو جامعتك:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsSampleMode(!isSampleMode)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 shadow-xs ${
                    isSampleMode
                      ? 'bg-ok text-white border-ok shadow-sm ring-2 ring-ok/20'
                      : 'text-ink bg-card hover:bg-line border-line'
                  }`}
                  title="معاينة كافة صفحات وأقسام التقرير ببيانات نموذجية متكاملة لرؤية جمال وتنسيق القالب"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isSampleMode ? 'إيقاف المعاينة النموذجية' : 'معاينة القالب ببيانات نموذجية تجريبية'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSamplesModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold text-accent bg-accent-dim hover:bg-accent-dim/80 rounded-xl border border-accent/20 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>استعراض نماذج وتقارير سابقة نموذجية (Library)</span>
                </button>
              </div>
            </div>

            {/* Template Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
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
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sub">جهة التدريب (المؤسسة أو الشركة)</label>
                <button
                  type="button"
                  onClick={() => handleOpenOrgSearchModal(profileData.entityAddress, 'all')}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded-lg border border-accent/20 transition-all hover:bg-accent/20"
                  title="بحث فوري في الإنترنت والموسوعات واسترجاع الصياغة الأكاديمية"
                >
                  <Globe className="w-3 h-3 text-accent" />
                  <span>بحث فوري وصياغة أكاديمية من الإنترنت</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={profileData.entityAddress}
                  onChange={(e) => handleProfileChange('entityAddress', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenOrgSearchModal(profileData.entityAddress, 'all')}
                  placeholder="اسم ومقر جهة التدريب (مثال: أرامكو السعودية، سدايا، شركة علم، وزارة الصحة...)"
                  className="w-full px-3 py-2 pl-24 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  disabled={orgSearching}
                  onClick={() => handleOpenOrgSearchModal(profileData.entityAddress, 'all')}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-bold bg-accent text-white rounded-lg hover:bg-accent/90 transition-all flex items-center gap-1 shadow-xs disabled:opacity-50"
                  title="بحث فوري وتعبئة الأقسام"
                >
                  <Search className="w-3 h-3" />
                  <span>بحث وتعبئة</span>
                </button>
              </div>
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
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sub">عدد أسابيع التدريب المقررة</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleProfileChange('trainingWeeks', Math.max(1, (profileData.trainingWeeks || 14) - 1))}
                    className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-bg hover:bg-line border border-line text-sub hover:text-ink"
                    title="إنقاص أسبوع"
                  >
                    - أسبوع
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProfileChange('trainingWeeks', Math.min(30, (profileData.trainingWeeks || 14) + 1))}
                    className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent"
                    title="إضافة أسبوع جديد"
                  >
                    + أسبوع
                  </button>
                </div>
              </div>
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
                  onClick={() => handleOpenOrgSearchModal(profileData.entityAddress, 'intro')}
                  className="text-[11px] font-bold text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/30 shadow-xs"
                  title="توليد مقدمة أكاديمية مخصصة لجهة التدريب وتخصصك"
                >
                  <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>توليد من بيانات الجهة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssistantField('introText')}
                  className="btn-ghost btn-sm"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>مساعد الكتابة</span>
                </button>
              </div>
            </div>
            <textarea
              value={profileData.introText}
              onChange={(e) => handleProfileChange('introText', e.target.value)}
              rows={3}
              className="w-full p-3 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent leading-relaxed"
            />
            <WritingHints text={String(profileData.introText || '')} kind="section" onApplyFixes={(fixed) => handleProfileChange('introText', fixed)} />
          </div>

          {/* Section 2: Entity */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold text-sub">التعريف بجهة التدريب وطبيعة العمل فيها</label>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenOrgSearchModal(profileData.entityAddress, 'entity')}
                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 shadow-xs"
                  title="بحث فوري في الإنترنت والمصادر الرسمية وتوليد صياغة أكاديمية رصينة للجهة"
                >
                  <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>بحث وتعبئة من الإنترنت</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssistantField('entityIntroText')}
                  className="btn-ghost btn-sm"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>مساعد الكتابة</span>
                </button>
              </div>
            </div>
            <textarea
              value={profileData.entityIntroText}
              onChange={(e) => handleProfileChange('entityIntroText', e.target.value)}
              rows={3}
              className="w-full p-3 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent leading-relaxed"
            />
            <WritingHints text={String(profileData.entityIntroText || '')} kind="section" onApplyFixes={(fixed) => handleProfileChange('entityIntroText', fixed)} />
          </div>

          {/* Section 3: Skills */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold text-sub">المعارف والمهارات والتجارب المكتسبة (ربطها بمقررات الكلية)</label>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenOrgSearchModal(profileData.entityAddress, 'skills')}
                  className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/30 shadow-xs"
                  title="توليد مهارات وتجارب متوافقة مع نشاط جهة التدريب وتخصصك"
                >
                  <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span>توليد من بيانات الجهة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssistantField('skillsText')}
                  className="btn-ghost btn-sm"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>مساعد الكتابة</span>
                </button>
              </div>
            </div>
            <textarea
              value={profileData.skillsText}
              onChange={(e) => handleProfileChange('skillsText', e.target.value)}
              rows={3}
              className="w-full p-3 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent leading-relaxed"
            />
            <WritingHints text={String(profileData.skillsText || '')} kind="section" onApplyFixes={(fixed) => handleProfileChange('skillsText', fixed)} />
          </div>

          {/* Section 4: Conclusion */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold text-sub">الخاتمة والتوصيات العامة</label>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenOrgSearchModal(profileData.entityAddress, 'conclusion')}
                  className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 shadow-xs"
                  title="توليد خاتمة وتوصيات منهجية مناسبة لبيئة الجهة والجامعة"
                >
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>توليد من بيانات الجهة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssistantField('conclusionText')}
                  className="btn-ghost btn-sm"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>مساعد الكتابة</span>
                </button>
              </div>
            </div>
            <textarea
              value={profileData.conclusionText}
              onChange={(e) => handleProfileChange('conclusionText', e.target.value)}
              rows={2}
              className="w-full p-3 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent leading-relaxed"
            />
            <WritingHints text={String(profileData.conclusionText || '')} kind="section" onApplyFixes={(fixed) => handleProfileChange('conclusionText', fixed)} />
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

      {/* Sample Preview Mode Banner */}
      {isSampleMode && (
        <div className="p-3.5 mb-4 bg-accent-dim/60 border border-accent/30 rounded-xl flex items-center justify-between gap-3 text-xs text-ink no-print shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent shrink-0" />
            <span className="font-bold">
              {isAr
                ? 'وضع المعاينة بالبيانات النموذجية مفعّل لرؤية تنسيق وفخامة القالب بكافة أقسامه — بياناتك وسجلاتك الحقيقية محفوظة ولن تتأثر إطلاقاً.'
                : 'Sample preview mode active to showcase template aesthetics & layout — your real logs and data are safely preserved.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsSampleMode(false)}
            className="px-2.5 py-1 bg-card hover:bg-line border border-line rounded-lg text-ink font-bold text-[11px] shrink-0 transition-colors"
          >
            {isAr ? 'إيقاف المعاينة' : 'Exit Preview'}
          </button>
        </div>
      )}

      {assistantField && (
        <AssistantPanel
          open={!!assistantField}
          onClose={() => setAssistantField(null)}
          target={{ type: 'section', key: assistantField }}
          title={fieldLabels[assistantField]}
          text={String(profileData[assistantField] || '')}
          lang={previewLang}
          onOpenMemory={() => setMemoryOpen(true)}
          onApplied={(finalText) => {
            handleProfileChange(assistantField, finalText);
            queryClient.invalidateQueries({ queryKey: ['finalReport'] });
            setSaveToast('تم اعتماد النص، ويمكنك استرجاع السابق من سجل المساعد');
            setTimeout(() => setSaveToast(''), 3500);
          }}
        />
      )}
      <AssistantMemory open={memoryOpen} onClose={() => setMemoryOpen(false)} />
      {/* Printable report: cover, contents, chapters, endorsement */}
      <div id="report-paper-view" dir={isAr ? 'rtl' : 'ltr'} className="rp-paper fd-paper">
        <FinalReportDocument
          isAr={isAr}
          profile={activePreviewProfile}
          weeks={activePreviewWeeks}
          totalHours={activePreviewWeeks.reduce(
            (sum: number, w: any) => sum + (w.entries || []).reduce((s: number, e: EntryDTO) => s + calculateHoursBetween(e.timeFrom || '08:00', e.timeTo || '16:00'), 0),
            0
          )}
          getWeekTopic={getWeekTopic}
          translateCategory={translateCategory}
        />
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
                    <span>مركز إرشادات ونماذج التقرير التعاوني</span>
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
                          يتألف التقرير الاحترافي من 6 أقسام جوهرية متسلسلة تحقق معايير التقييم للجان الأكاديمية والشركات:
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
                            توثيق زمني أو بحسب المشاريع يوضح تفاصيل العمل اليومي والأسبوعي مقترناً بالساعات والفئات المحددة.
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
                          [فعل إجرائي محدد] + [الأداة أو البيئة أو النظام المستخدم] + [النتيجة الملموسة والمحققة]
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
                          هذه المنهجية هي المعيار الموصى به لدى لجان تقييم ABET وشركات مثل أرامكو وسابك لتقييم قدرة المتدرب على حل المشكلات الهندسية:
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
                          قاموس الأفعال الإجرائية (Action Verbs Bank) في التقارير الفنية
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
                        <span>الملخص التنفيذي (Executive Summary):</span>
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

      {/* ========================================================================= */}
      {/* Organization Academic Search & Auto-Fill Modal */}
      {/* ========================================================================= */}
      {orgSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card border border-line rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-accent-dim/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center shadow-xs shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
                    <span>البحث الأكاديمي الذكي واسترجاع بيانات جهة التدريب</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-bold hidden sm:inline-block">
                      بحث فوري من الإنترنت
                    </span>
                  </h3>
                  <p className="text-xs text-sub mt-0.5">
                    استرجاع الحقائق الموثقة وصياغة نصوص أكاديمية منمقة تملأ تقريرك وفق معايير الجامعات ورؤية 2030
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOrgSearchModalOpen(false)}
                className="p-1.5 text-sub hover:text-ink rounded-lg hover:bg-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="p-4 sm:p-5 border-b border-line bg-bg/50 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-sub">اسم المؤسسة أو جهة التدريب</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={orgSearchQuery}
                      onChange={(e) => setOrgSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && executeOrgLookup(orgSearchQuery, orgSearchDept)}
                      placeholder="مثال: أرامكو السعودية، سدايا، شركة علم، STC، وزارة الصحة، مصرف الراجحي..."
                      className="w-full px-3.5 py-2.5 pl-24 text-sm bg-card border border-line rounded-xl focus:outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      disabled={orgSearching || !orgSearchQuery.trim()}
                      onClick={() => executeOrgLookup(orgSearchQuery, orgSearchDept)}
                      className="absolute left-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-bold bg-accent text-white rounded-lg hover:bg-accent/90 transition-all flex items-center gap-1 shadow-xs disabled:opacity-50"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{orgSearching ? 'جاري البحث...' : 'بحث بالإنترنت'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-sub">تخصصك الجامعي (لتخصيص المهارات)</label>
                  <input
                    type="text"
                    value={orgSearchDept}
                    onChange={(e) => setOrgSearchDept(e.target.value)}
                    placeholder="مثال: هندسة برمجيات، إدارة أعمال..."
                    className="w-full px-3 py-2.5 text-sm bg-card border border-line rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-sub">
                <span className="font-bold flex items-center gap-1">
                  <Sparkle className="w-3 h-3 text-accent" />
                  أمثلة شائعة:
                </span>
                {['أرامكو السعودية', 'stc', 'هواوي السعودية Huawei', 'موبايلي Mobily', 'زين السعودية Zain', 'سدايا SDAIA', 'شركة علم', 'سابك', 'نيوم NEOM', 'مصرف الراجحي'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setOrgSearchQuery(name);
                      executeOrgLookup(name, orgSearchDept);
                    }}
                    className="px-2 py-0.5 rounded-md bg-card hover:bg-accent-dim hover:text-accent border border-line text-[11px] transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {orgSearching && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border-3 border-accent border-t-transparent animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-ink">جاري البحث الفوري في المصادر الرسمية والموسوعات الرقمية...</p>
                    <p className="text-xs text-sub">نقوم باسترجاع تاريخ الجهة، ورؤيتها، وهيكلها التقني، وصياغة نصوص أكاديمية منمقة</p>
                  </div>
                </div>
              )}

              {!orgSearching && !orgSearchResult && (
                <div className="py-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-accent-dim/60 text-accent mx-auto flex items-center justify-center">
                    <Globe className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-sm font-bold text-ink">أدخل اسم جهة التدريب واضغط "بحث بالإنترنت"</h4>
                    <p className="text-xs text-sub leading-relaxed">
                      سيقوم النظام بالبحث المباشر عن المؤسسة وجلب معلوماتها الموثقة وصياغة كلام أكاديمي رصين لتعبئة تقريرك بضغطة زر واحدة!
                    </p>
                  </div>
                </div>
              )}

              {!orgSearching && orgSearchResult && (
                <div className="space-y-4">
                  {/* Entity Metadata Card */}
                  <div className="bg-bg border border-line rounded-xl p-3.5 sm:p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-accent" />
                        <span className="text-sm font-black text-ink">{orgSearchResult.foundName}</span>
                      </div>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-ok-bg text-ok border border-ok/30 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        المصدر: {orgSearchResult.source}
                      </span>
                    </div>

                    {orgSearchResult.keyFacts && orgSearchResult.keyFacts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {orgSearchResult.keyFacts.map((fact, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-card border border-line px-2 py-1 rounded-md text-sub line-clamp-1 max-w-full"
                            title={fact}
                          >
                            • {fact}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section Tabs */}
                  <div className="flex items-center gap-1 border-b border-line pb-1 overflow-x-auto text-xs">
                    <button
                      type="button"
                      onClick={() => setOrgSearchActiveTab('entity')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        orgSearchActiveTab === 'entity'
                          ? 'bg-accent text-white shadow-xs'
                          : 'text-sub hover:text-ink hover:bg-bg'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>١. التعريف بجهة التدريب</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrgSearchActiveTab('intro')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        orgSearchActiveTab === 'intro'
                          ? 'bg-accent text-white shadow-xs'
                          : 'text-sub hover:text-ink hover:bg-bg'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>٢. المقدمة وأهداف التدريب</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrgSearchActiveTab('skills')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        orgSearchActiveTab === 'skills'
                          ? 'bg-accent text-white shadow-xs'
                          : 'text-sub hover:text-ink hover:bg-bg'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>٣. المعارف والمهارات</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrgSearchActiveTab('conclusion')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        orgSearchActiveTab === 'conclusion'
                          ? 'bg-accent text-white shadow-xs'
                          : 'text-sub hover:text-ink hover:bg-bg'
                      }`}
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>٤. الخاتمة والتوصيات</span>
                    </button>
                  </div>

                  {/* Active Tab Content Card */}
                  <div className="bg-card border border-line rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-ink">
                        {orgSearchActiveTab === 'entity' && 'الصياغة الأكاديمية المقترحة لقسم (التعريف بجهة التدريب وطبيعة العمل)'}
                        {orgSearchActiveTab === 'intro' && 'الصياغة الأكاديمية المقترحة لقسم (المقدمة وأهداف التدريب التعاوني)'}
                        {orgSearchActiveTab === 'skills' && 'الصياغة الأكاديمية المقترحة لقسم (المعارف والمهارات والتجارب المكتسبة)'}
                        {orgSearchActiveTab === 'conclusion' && 'الصياغة الأكاديمية المقترحة لقسم (الخاتمة والتوصيات العامة)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const text =
                            orgSearchActiveTab === 'entity'
                              ? orgSearchResult.entityOverview
                              : orgSearchActiveTab === 'intro'
                              ? orgSearchResult.suggestedIntro
                              : orgSearchActiveTab === 'skills'
                              ? orgSearchResult.suggestedSkills
                              : orgSearchResult.suggestedConclusion;
                          navigator.clipboard.writeText(text);
                          setCopiedText(true);
                          setTimeout(() => setCopiedText(false), 2000);
                        }}
                        className="text-sub hover:text-accent font-bold flex items-center gap-1"
                      >
                        {copiedText ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText ? 'تم النسخ!' : 'نسخ النص'}</span>
                      </button>
                    </div>

                    <div className="p-3.5 bg-bg/80 border border-line rounded-lg text-xs leading-relaxed text-ink whitespace-pre-wrap font-sans max-h-60 overflow-y-auto">
                      {orgSearchActiveTab === 'entity' && orgSearchResult.entityOverview}
                      {orgSearchActiveTab === 'intro' && orgSearchResult.suggestedIntro}
                      {orgSearchActiveTab === 'skills' && orgSearchResult.suggestedSkills}
                      {orgSearchActiveTab === 'conclusion' && orgSearchResult.suggestedConclusion}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] text-sub">
                        عدد الكلمات:{' '}
                        <strong className="text-ink">
                          {countWords(
                            orgSearchActiveTab === 'entity'
                              ? orgSearchResult.entityOverview
                              : orgSearchActiveTab === 'intro'
                              ? orgSearchResult.suggestedIntro
                              : orgSearchActiveTab === 'skills'
                              ? orgSearchResult.suggestedSkills
                              : orgSearchResult.suggestedConclusion
                          )}
                        </strong>{' '}
                        كلمة
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const field =
                            orgSearchActiveTab === 'entity'
                              ? 'entityIntroText'
                              : orgSearchActiveTab === 'intro'
                              ? 'introText'
                              : orgSearchActiveTab === 'skills'
                              ? 'skillsText'
                              : 'conclusionText';
                          handleApplyOrgContent(field);
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-accent/15 text-accent border border-accent/30 rounded-lg hover:bg-accent/25 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>تطبيق وتعبئة هذا القسم فقط</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-line bg-bg/50 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setOrgSearchModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-sub hover:text-ink rounded-xl border border-line hover:bg-card transition-colors"
              >
                إغلاق
              </button>

              {orgSearchResult && (
                <button
                  type="button"
                  onClick={() => handleApplyOrgContent('all')}
                  className="px-5 py-2 text-xs font-black bg-accent text-white rounded-xl hover:bg-accent/90 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تعبئة كافة الأقسام الأربعة فوراً (المقدمة + الجهة + المهارات + الخاتمة)</span>
                </button>
              )}
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
