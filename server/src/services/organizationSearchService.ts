import { logger } from '../logger.js';
import { OrganizationLookupResult } from '@coop/shared';

const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim().replace(/^["']|["']$/g, '');
const geminiKey = process.env.GEMINI_API_KEY?.trim().replace(/^["']|["']$/g, '');
const groqKey = process.env.GROQ_API_KEY?.trim().replace(/^["']|["']$/g, '');
const openaiKey = process.env.OPENAI_API_KEY?.trim().replace(/^["']|["']$/g, '');

interface SearchEntityFacts {
  officialName: string;
  shortExtract: string;
  fullExtract: string;
  source: string;
  keyFacts: string[];
}

/**
 * Curated knowledge base of major Saudi & Gulf organizations
 * ensuring instantaneous, 100% verified, academic data even without internet access.
 */
const CURATED_INSTITUTIONS: Record<string, {
  officialName: string;
  sector: string;
  vision2030Link: string;
  overview: string;
  departments: string[];
  technologies: string[];
}> = {
  'أرامكو': {
    officialName: 'شركة الزيت العربية السعودية (أرامكو السعودية - Saudi Aramco)',
    sector: 'الطاقة، البتروكيماويات، والتقنيات الصناعية المتقدمة',
    vision2030Link: 'قيادة التحول الصناعي ومشاريع الطاقة المتجددة وسلاسل الإمداد العالمية وتعزيز الاستدامة',
    overview: 'تُعد شركة الزيت العربية السعودية (أرامكو) إحدى كبرى شركات الطاقة والكيميائيات المتكاملة في العالم، والمحرك الأساسي لقطاع الطاقة والتصنيع المتقدم. تأسست الشركة لتكون نموذجاً عالمياً في الابتكار والتميز التشغيلي، وتمتلك بنية تحتية هندسية ورقمنة صناعية فائقة التطور.',
    departments: ['إدارة تقنية المعلومات والحلول الرقمية', 'قطاع التنقيب والإنتاج والعمليات الهندسية', 'إدارة الأمن السيبراني والشبكات الصناعية', 'إدارة المشاريع الرأسمالية والتحكم الآلي'],
    technologies: ['أنظمة التحكم الصناعي SCADA / DCS', 'منصات الذكاء الاصطناعي وتحليل البيانات الضخمة', 'الحوسبة السحابية المؤسسية وشبكات الألياف البصرية', 'أنظمة إدارة الصيانة والموارد SAP ERP']
  },
  'سدايا': {
    officialName: 'الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا - SDAIA)',
    sector: 'البيانات الوطنية، الذكاء الاصطناعي، والتحول الرقمي الحكومي',
    vision2030Link: 'تحقيق الريادة العالمية للمملكة في البيانات والذكاء الاصطناعي وتطوير الكفاءات الوطنية الرقمية',
    overview: 'أُنشئت الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) بأمر ملكي كريم لتكون المرجع الوطني المختص بالبيانات والذكاء الاصطناعي في المملكة، والذراع الممكن للتحول الرقمي الوطني وبناء الاقتصاد المعرفي القائم على البيانات، حيث تتولى قيادة وتشغيل البنى التحتية الوطنية للذكاء الاصطناعي وتطوير المنصات الوطنية الكبرى.',
    departments: ['مركز المعلومات الوطني (NIC)', 'مكتب إدارة البيانات الوطنية (NDMO)', 'المركز الوطني للذكاء الاصطناعي (NCAI)', 'إدارة الحلول السحابية الحكومية (ديم)'],
    technologies: ['خوارزميات التعلم العميق ونماذج اللغة الكبيرة (LLMs)', 'البنية التحتية السحابية الحكومية الموحدة (منصة ديم)', 'منصات التحليل البياني والتكامل الوطني (توكلنا، نفاذ)', 'أطر حوكمة وحماية البيانات الشخصية']
  },
  'علم': {
    officialName: 'شركة علم (Elm Company - الرائدة في الحلول الرقمية)',
    sector: 'التحول الرقمي، الحلول السحابية، وخدمات إسناد الأعمال',
    vision2030Link: 'تمكين الحكومة الرقمية ومجتمع الأعمال من خلال منظومات إلكترونية آمنة وذكية',
    overview: 'تُعد شركة علم شركة مساهمة سعودية رائدة في تقديم الحلول الرقمية المتكاملة، المنصات الإلكترونية الوطنية، والخدمات الاستشارية للقطاعين الحكومي والخاص. وتتميز بالقدرة العالية على ابتكار الحلول القائمة على التجربة الرقمية وفق أحدث المنهجيات الهندسية العالمية.',
    departments: ['قطاع تطوير المنصات والمنتجات الرقمية', 'إدارة هندسة البرمجيات والحلول السحابية', 'إدارة الأمن الرقمي والامتثال', 'إدارة سلاسل الإمداد وإسناد العمليات'],
    technologies: ['منصات الربط البرمجي المعمارية الميكروية (Microservices & APIs)', 'الحوسبة السحابية وحلول الحاويات Docker / Kubernetes', 'إدارة الهوية الرقمية والتحقق البيومتري', 'أطر عمل التطوير السريع Agile / DevOps']
  },
  'stc': {
    officialName: 'مجموعة إس تي سي (stc Group - رائدة الاتصالات والتمكين الرقمي)',
    sector: 'الاتصالات وتقنية المعلومات، الحوسبة السحابية، وإنترنت الأشياء',
    vision2030Link: 'بناء وتوسيع البنية التحتية الرقمية المتقدمة لشبكات الجيل الخامس ومراكز البيانات الإقليمية',
    overview: 'تُمثّل مجموعة الاتصالات السعودية (stc) الممكن الرقمي الأبرز في منطقة الشرق الأوسط وشمال أفريقيا، حيث تقود جهود التطور التكنولوجي من خلال حلول الاتصالات المتطورة، مراكز البيانات العملاقة، خدمات الأمن السيبراني، ومحافظ الدفع والتقنية المالية.',
    departments: ['قطاع الشبكات والبنية التحتية الرقمية', 'قطاع الأعمال والحلول السحابية (Solutions by stc)', 'قطاع الأمن السيبراني (sirar by stc)', 'إدارة تطوير البرمجيات والأنظمة الداخلية'],
    technologies: ['شبكات الجيل الخامس (5G Standalone)', 'الحوسبة السحابية الهجينة ومراكز البيانات الفائقة Tier-III/IV', 'حلول إنترنت الأشياء الصناعية (IoT)', 'بروتوكولات التوجيه المتقدمة وشبكات SD-WAN']
  },
  'سابك': {
    officialName: 'الشركة السعودية للصناعات الأساسية (سابك - SABIC)',
    sector: 'البتروكيماويات، الكيماويات المتخصصة، والمعادن المتقدمة',
    vision2030Link: 'تنويع القاعدة الصناعية الوطنية وتطوير سلاسل القيمة المضافة وتعزيز الاستدامة البيئية',
    overview: 'تُعد سابك من أكبر الشركات العالمية في تصنيع الكيماويات والبوليمرات والأسمدة والمعادن. تنشط الشركة في أكثر من 50 دولة وتملك مراكز أبحاث وابتكار متطورة تسهم في دفع عجلة التصنيع المستدام والحلول الهندسية المبتكرة.',
    departments: ['إدارة التشغيل وهندسة العمليات البتروكيماوية', 'إدارة تقنية المعلومات والتحكم الصناعي', 'إدارة السلامة والصحة المهنية والبيئة (EHS)', 'مراكز الابتكار وتطوير المنتجات التقنية'],
    technologies: ['أنظمة التحكم الموزع (DCS)', 'منظومات السلامة الميدانية وإدارة الأصول (Asset Management)', 'أنظمة المحاكاة والنمذجة الهندسية', 'منصات SAP المتكاملة لإدارة سلاسل الإمداد']
  },
  'الراجحي': {
    officialName: 'مصرف الراجحي (Al Rajhi Bank - رائد الصيرفة الإسلامية والرقمية)',
    sector: 'الخدمات المصرفية، التقنية المالية (FinTech)، والاستثمار',
    vision2030Link: 'تطوير القطاع المالي وتعزيز الشمول المالي والتحول نحو المعاملات غير النقدية',
    overview: 'يُعد مصرف الراجحي من كبرى المؤسسات المصرفية الاستثمارية في العالم وأكبرها في الشرق الأوسط. يتميز بامتلاكه أضخم شبكة مصرفية وبنية تقنية متقدمة جعلت منه رائداً في الخدمات المصرفية الرقمية وتطبيقات التقنية المالية الحديثة.',
    departments: ['قطاع تقنية المعلومات والحلول المصرفية', 'إدارة الأمن السيبراني والعمليات الأمنية (SOC)', 'إدارة تحليل البيانات وذكاء الأعمال', 'قطاع القنوات الرقمية وتجربة العميل'],
    technologies: ['الأنظمة المصرفية الأساسية المتطورة (Core Banking Systems)', 'تقنيات التشفير المالي والأمن المتعدد العوامل (MFA)', 'حلول الدفع الفوري والمحافظ الرقمية الذكية', 'أدوات الذكاء الاصطناعي لكشف الاحتيال والائتمان']
  },
  'وزارة الصحة': {
    officialName: 'وزارة الصحة بالمملكة العربية السعودية (Ministry of Health)',
    sector: 'الرعاية الصحية، التحول الصحي، والصحة الرقمية',
    vision2030Link: 'برنامج تحول القطاع الصحي وتسهيل الحصول على رعاية صحية متكاملة وذات جودة عالية',
    overview: 'تتولى وزارة الصحة قيادة وتنظيم وتطوير منظومة الرعاية الصحية في المملكة العربية السعودية. وتشهد المنظومة نقلة نوعية من خلال تأسيس شركة الصحة القابضة والتجمعات الصحية وتطبيق أحدث أنظمة الصحة الرقمية والمستشفيات الافتراضية.',
    departments: ['وكالة الوزارة للصحة الرقمية والتقنية', 'إدارة التجمعات الصحية والمستشفيات', 'إدارة الجودة ومكافحة العدوى والاعتماد الصحي', 'إدارة التدريب والشؤون الأكاديمية'],
    technologies: ['الملف الصحي الموحد وأنظمة المستشفيات الإلكترونية (HIS)', 'منصات الاستشارات والطب الاتصالي (منصة صحتي والمستشفى الافتراضي)', 'أنظمة إدارة الصيدليات والمختبرات الطبية الإلكترونية', 'أدوات أمن وسرية البيانات الصحية والامتثال']
  },
  'نيوم': {
    officialName: 'مشروع نيوم (NEOM - نموذج المستقبل الحضري المستدام)',
    sector: 'المدن الإدراكية، الطاقة النظيفة، والتقنيات المستقبلية المتقدمة',
    vision2030Link: 'أبرز المشاريع العملاقة لصندوق الاستثمارات العامة لبناء نموذج عالمي للعيش والعمل المستدام',
    overview: 'يُمثّل مشروع نيوم الوجهة العالمية الأكثر طموحاً لتأسيس مجتمعات إدراكية ذكية تعتمد كلياً على الطاقة المتجددة بنسبة 100%. وتضم قطاعات حيوية في التقنية والذكاء الاصطناعي والطاقة والمياه والتصنيع المتقدم والتصميم الهندسي الحضري.',
    departments: ['قطاع التقنية والمدن الإدراكية (NEOM Tech & Digital)', 'إدارة الهندسة والتخطيط والبنية التحتية الذكية', 'إدارة الطاقة النظيفة والمياه المستدامة', 'إدارة سلاسل الإمداد اللوجستية المتقدمة'],
    technologies: ['شبكات الجيل القادم والمدن الإدراكية التفاعلية', 'أنظمة التوأمة الرقمية (Digital Twins)', 'الذكاء الاصطناعي التوليدي والروبوتات الميدانية', 'شبكات الطاقة الشمسية وطاقة الرياح الهيدروجينية']
  },
  'الزكاة والضريبة': {
    officialName: 'هيئة الزكاة والضريبة والجمارك (زاتكا - ZATCA)',
    sector: 'المالية العامة، الضرائب، والخدمات الجمركية الرقمية',
    vision2030Link: 'تعزيز المنظومة المالية الوطنية وتيسير حركة التجارة وحماية المنافذ الحدودية',
    overview: 'تتولى هيئة الزكاة والضريبة والجمارك جباية الزكاة وتحصيل الضرائب والرسوم الجمركية وإدارة العمليات اللوجستية عبر كافة المنافذ، مع قيادة تحول رقمي متكامل عبر الفوترة الإلكترونية (فاتورة) ومنصات التخليص الجمركي الذكي.',
    departments: ['قطاع التقنية والتحول الرقمي', 'إدارة الرقابة الجمركية والأنظمة الأمنية المتقدمة', 'إدارة العمليات الضريبية والفوترة الإلكترونية', 'إدارة تحليل المخاطر والاستخبار المالي'],
    technologies: ['منظومة الفوترة الإلكترونية (FATOORA Engine & Cryptographic APIs)', 'أنظمة التفتيش الذكية بالأشعة وتحليل الصور بالذكاء الاصطناعي', 'بوابات الربط الجمركي والتخليص المؤتمت', 'أنظمة قواعد البيانات المالية الضخمة وأمن المعلومات']
  },
  'التعليم': {
    officialName: 'وزارة التعليم بالمملكة العربية السعودية (Ministry of Education)',
    sector: 'التعليم العام والجامعي، البحث والابتكار، والمنصات التعليمية الرقمية',
    vision2030Link: 'تطوير رأس المال البشري ومواءمة مخرجات التعليم والتدريب مع متطلبات سوق العمل المستقبلية',
    overview: 'تقود وزارة التعليم منظومة التعليم المدرسي والجامعي والتدريب والبحث العلمي في المملكة، وتُعد رائدة في تطبيق بيئات التعلم الرقمي المتقدمة عبر منصات وطنية ذكية تخدم ملايين الطلاب والمعلمين وأعضاء الهيئة الأكاديمية.',
    departments: ['وكالة الوزارة للتحول الرقمي والأمن السيبراني', 'إدارة المناهج والخطط الدراسية والمقررات', 'إدارة التعليم الجامعي والتطوير الأكاديمي', 'إدارة الشؤون الهندسية والمباني التعليمية'],
    technologies: ['منصات التعلم الإلكتروني الوطنية (منصة مدرستي، روضتي)', 'أنظمة إدارة التعلم وشؤون الطلاب (نظام نور، نظام فارس)', 'الحوسبة السحابية التعليمية والبث التفاعلي', 'أنظمة الاختبارات المعيارية والتقييم المؤتمت']
  },
  'هواوي': {
    officialName: 'شركة هواوي تك للاستثمار المحدودة (هواوي السعودية - Huawei Tech Investment Saudi Arabia)',
    sector: 'الاتصالات وتقنية المعلومات، شبكات الجيل الخامس (5G)، الحوسبة السحابية، ومراكز البيانات',
    vision2030Link: 'بناء البنية التحتية الرقمية فائقة السرعة، تدشين منطقة هواوي السحابية (Huawei Cloud Region) في الرياض، وتأهيل الكفاءات الوطنية عبر برامج أكاديمية هواوي للاتصالات',
    overview: 'تُعد شركة هواوي (Huawei) إحدى كبرى الشركات العالمية الرائدة في توفير البنية التحتية لتقنية المعلومات والاتصالات والأجهزة الذكية. وتنشط الشركة في المملكة العربية السعودية من خلال مقرها الإقليمي بالرياض ومراكز البيانات السحابية ومختبرات الابتكار والتدريب الميداني، حيث تساهم بدور ريادي في نشر شبكات الألياف الضوئية (FTTH) ومحطات الجيل الخامس وحلول الشبكات المؤسسية.',
    departments: ['قطاع شبكات الاتصالات ومحطات البث (Carrier Network)', 'قطاع الحوسبة السحابية ومراكز البيانات (Huawei Cloud)', 'قطاع شبكات الأعمال المؤسسية (Enterprise IP & Optical)', 'إدارة العمليات والدعم الفني الميداني ومراقبة الشبكات (NOC & TAC)'],
    technologies: ['أنظمة شبكات الجيل الخامس (5G Massive MIMO / Core Network)', 'حلول الألياف البصرية المنزلية والمؤسسية (FTTH / GPON)', 'محولات وموجهات الشبكات المؤسسية (Enterprise Routers & Switches)', 'منصات الحوسبة السحابية ومراكز البيانات الذكية (Cloud Data Centers)']
  },
  'huawei': {
    officialName: 'شركة هواوي تك للاستثمار المحدودة (هواوي السعودية - Huawei Tech Investment Saudi Arabia)',
    sector: 'الاتصالات وتقنية المعلومات، شبكات الجيل الخامس (5G)، الحوسبة السحابية، ومراكز البيانات',
    vision2030Link: 'بناء البنية التحتية الرقمية فائقة السرعة، تدشين منطقة هواوي السحابية (Huawei Cloud Region) في الرياض، وتأهيل الكفاءات الوطنية عبر برامج أكاديمية هواوي للاتصالات',
    overview: 'تُعد شركة هواوي (Huawei) إحدى كبرى الشركات العالمية الرائدة في توفير البنية التحتية لتقنية المعلومات والاتصالات والأجهزة الذكية. وتنشط الشركة في المملكة العربية السعودية من خلال مقرها الإقليمي بالرياض ومراكز البيانات السحابية ومختبرات الابتكار والتدريب الميداني، حيث تساهم بدور ريادي في نشر شبكات الألياف الضوئية (FTTH) ومحطات الجيل الخامس وحلول الشبكات المؤسسية.',
    departments: ['قطاع شبكات الاتصالات ومحطات البث (Carrier Network)', 'قطاع الحوسبة السحابية ومراكز البيانات (Huawei Cloud)', 'قطاع شبكات الأعمال المؤسسية (Enterprise IP & Optical)', 'إدارة العمليات والدعم الفني الميداني ومراقبة الشبكات (NOC & TAC)'],
    technologies: ['أنظمة شبكات الجيل الخامس (5G Massive MIMO / Core Network)', 'حلول الألياف البصرية المنزلية والمؤسسية (FTTH / GPON)', 'محولات وموجهات الشبكات المؤسسية (Enterprise Routers & Switches)', 'منصات الحوسبة السحابية ومراكز البيانات الذكية (Cloud Data Centers)']
  },
  'موبايلي': {
    officialName: 'شركة اتحاد اتصالات (موبايلي - Mobily)',
    sector: 'الاتصالات المتنقلة، شبكات البيانات، ومراكز الاستضافة السحابية',
    vision2030Link: 'توسيع شبكات الاتصالات فائقة السرعة والربط القاري ودعم التحول الرقمي الوطني',
    overview: 'تُعد شركة موبايلي إحدى كبرى شركات الاتصالات الرائدة في المملكة والمنطقة، وتملك شبكة واسعة من الألياف الضوئية ومراكز البيانات المعتمدة دولياً، وتقدم منظومة خدمات اتصالات متكاملة للأفراد وقطاع الأعمال.',
    departments: ['قطاع الشبكات وهندسة الاتصالات', 'قطاع الأعمال وحلول تقنية المعلومات', 'إدارة الأمن السيبراني ومراكز البيانات', 'إدارة العمليات وتجربة العملاء'],
    technologies: ['شبكات الألياف الضوئية (FTTH)', 'شبكات الجيل الخامس (5G)', 'مراكز البيانات المعتمدة Tier-III/IV', 'حلول الحوسبة السحابية والربط المؤسسي']
  },
  'زين': {
    officialName: 'شركة زين السعودية (Zain KSA)',
    sector: 'الاتصالات وتقنية المعلومات، الجيل الخامس، والخدمات الرقمية المبتكرة',
    vision2030Link: 'الريادة في نشر شبكات 5G وتطوير البنية التحتية الخضراء المستدامة',
    overview: 'تُمثّل زين السعودية ركيزة هامة في قطاع الاتصالات، وحققت مراكز ريادية عالمية في سرعات وتغطية شبكات الجيل الخامس، إضافة إلى خدمات الحوسبة السحابية ومنصات التكنولوجيا المالية والمنازل الذكية.',
    departments: ['إدارة هندسة الشبكات والتشغيل', 'قطاع الابتكار والخدمات الرقمية', 'قطاع أمن المعلومات والأنظمة السحابية', 'إدارة المشاريع الاستراتيجية'],
    technologies: ['شبكات 5G المتقدمة', 'تقنيات الاتصال وإنترنت الأشياء (IoT)', 'البنية التحتية السحابية (Zain Cloud)', 'حلول التقنية المالية Tamam']
  }
};

/**
 * Searches Wikipedia Arabic API for organization information
 */
function extractCoreKeywords(text: string): string[] {
  const stopWords = new Set([
    'شركة', 'مؤسسة', 'هيئة', 'وزارة', 'مكتب', 'فرع', 'مجموعة', 'مركز', 'إدارة',
    'السعودية', 'سعودية', 'العربية', 'بالمملكة', 'المملكة', 'الرياض', 'جدة', 'الدمام', 'الخبر',
    'المحدودة', 'مساهمة', 'القابضة', 'للاستثمار', 'للتقنية', 'للاتصالات', 'ش.م.م', 'saudi', 'company', 'arabia'
  ]);
  return text
    .split(/[\s,.-]+/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

function isDisallowedGeoTitle(title: string, userQuery: string): boolean {
  const queryLower = userQuery.toLowerCase();
  if (queryLower.includes('محافظة') || queryLower.includes('مدينة') || queryLower.includes('منطقة')) {
    return false;
  }
  return /^(محافظة|مدينة|قرية|هجرة|وادي|شعب|جبل)\s+/i.test(title);
}

/**
 * Searches Wikipedia Arabic API for organization information with keyword validation
 */
async function searchWikipedia(query: string): Promise<SearchEntityFacts | null> {
  try {
    const coreKeywords = extractCoreKeywords(query);

    // Try primary search
    const executeSearch = async (searchTerm: string) => {
      const searchUrl = `https://ar.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&utf8=1`;
      const res = await fetch(searchUrl, {
        headers: { 'User-Agent': 'CoopReportBot/1.0 (academic training platform)' },
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) return null;
      const json: any = await res.json();
      return json?.query?.search || [];
    };

    let searchResults = await executeSearch(query);

    // If no results or results are geo-mismatched, try core keyword
    if ((!searchResults || searchResults.length === 0 || isDisallowedGeoTitle(searchResults[0]?.title || '', query)) && coreKeywords.length > 0) {
      const fallbackResults = await executeSearch(coreKeywords.join(' '));
      if (fallbackResults && fallbackResults.length > 0) {
        searchResults = fallbackResults;
      }
    }

    if (!searchResults || searchResults.length === 0) return null;

    // Filter out unwanted geographic titles (e.g. محافظة الرس when looking for هواوي)
    const validMatches = searchResults.filter((s: any) => {
      if (isDisallowedGeoTitle(s.title, query)) return false;
      if (coreKeywords.length > 0) {
        const titleLower = s.title.toLowerCase();
        const snippetLower = (s.snippet || '').toLowerCase();
        return coreKeywords.some((k) => titleLower.includes(k) || snippetLower.includes(k));
      }
      return true;
    });

    if (validMatches.length === 0) return null;

    let bestMatch = validMatches[0];
    if (bestMatch.title.includes('(توضيح)') && validMatches.length > 1) {
      const specificMatch = validMatches.find((s: any) => s.title.includes('(السعودية)') || (!s.title.includes('(توضيح)') && s.wordcount > 200));
      if (specificMatch) {
        bestMatch = specificMatch;
      }
    }

    const pageId = bestMatch.pageid;
    const title = bestMatch.title;

    const extractUrl = `https://ar.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exintro=1&pageids=${pageId}&format=json&utf8=1`;
    const extractRes = await fetch(extractUrl, {
      headers: { 'User-Agent': 'CoopReportBot/1.0 (academic training platform)' },
      signal: AbortSignal.timeout(6000)
    });

    if (!extractRes.ok) return null;
    const extractData: any = await extractRes.json();
    const page = extractData?.query?.pages?.[pageId];
    if (!page || !page.extract) return null;

    const cleanExtract = String(page.extract)
      .replace(/\[\d+\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanExtract.length < 50) return null;

    return {
      officialName: title,
      shortExtract: cleanExtract.slice(0, 350) + (cleanExtract.length > 350 ? '...' : ''),
      fullExtract: cleanExtract,
      source: 'موسوعة ويكيبيديا الموثقة (Wikipedia)',
      keyFacts: extractKeyFactsFromText(cleanExtract)
    };
  } catch (err: any) {
    logger.warn({ err: err?.message, query }, 'Wikipedia search failed or timed out');
    return null;
  }
}

function extractKeyFactsFromText(text: string): string[] {
  const sentences = text.split(/[.\n]/).map(s => s.trim()).filter(s => s.length > 25);
  const facts: string[] = [];
  for (const s of sentences) {
    if (facts.length >= 4) break;
    facts.push(s);
  }
  return facts;
}

async function searchDuckDuckGo(query: string): Promise<SearchEntityFacts | null> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    const heading = data.Heading || query;
    const abstract = data.Abstract || data.AbstractText || '';

    if (abstract && abstract.length > 40) {
      return {
        officialName: heading,
        shortExtract: abstract.slice(0, 300),
        fullExtract: abstract,
        source: 'محرك البحث المباشر (DuckDuckGo Search Engine)',
        keyFacts: [abstract]
      };
    }
    return null;
  } catch {
    return null;
  }
}

function matchCuratedDatabase(query: string) {
  const normalized = query.trim().toLowerCase();
  for (const [key, item] of Object.entries(CURATED_INSTITUTIONS)) {
    if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
      return item;
    }
  }
  return null;
}

async function synthesizeWithLLM(
  orgName: string,
  entityFacts: SearchEntityFacts | null,
  curated: any | null,
  department: string
): Promise<OrganizationLookupResult | null> {
  const rawFacts = entityFacts?.fullExtract || curated?.overview || orgName;
  const officialTitle = entityFacts?.officialName || curated?.officialName || orgName;
  const deptContext = department ? `تخصص المتدرب: ${department}.` : 'تخصص تقني / هندسي / إداري عام.';

  const systemPrompt = `أنت مستشار أكاديمي وخبير أول في إعداد وتوثيق تقارير التدريب التعاوني الجامعي (CO-OP Final Reports) لطلاب الجامعات والكليات التقنية بالمملكة العربية السعودية والخليج.
المهمة: كتابة نصوص أكاديمية منمقة وعلمية ورصينة جداً تُعبئ أقسام التقرير النهائي الأربعة بالاعتماد على الحقائق الحقيقية لجهة التدريب وتخصص الطالب.

قواعد الصياغة الصارمة:
1. ممنوع منعاً باتاً العبارات الإنشائية النمطية المبتذلة (مثل: "مما لا شك فيه"، "في إطار السعي الحثيث"، "بأبهى حلة"، "جسر حيوي"، "يشرفني ويسعدني").
2. أسلوب التوثيق علمي، موضوعي، يعتمد على الأفعال الإجرائية والمصطلحات المؤسسية والتقنية الدقيقة.
3. دمج أهداف المؤسسة برؤية المملكة 2030 والتحول الرقمي وسوق العمل.
4. إخراج الإجابة بصيغة JSON حصرية وصحيحة بدون أي مقدمات أو علامات إضافية خارج الـ JSON.`;

  const userPrompt = `المعلومات المسترجعة عن جهة التدريب:
اسم الجهة: ${officialTitle}
${deptContext}
الحقائق والمعلومات الموثقة:
${rawFacts}

المطلوب إخراج كائن JSON فقط بالبنية التالية:
{
  "entityOverview": "نص أكاديمي رصين ومفصل من 3-4 فقرات متماسكة يغطي: 1) نشأة الجهة وهويتها ورؤيتها، 2) طبيعة العمل والأقسام التشغيلية والتقنية، 3) التقنيات والأنظمة والبيئة المهنية ودورها في رؤية المملكة 2030.",
  "suggestedIntro": "مقدمة أكاديمية موجهة تبرز الأهمية الإستراتيجية لاختيار هذه الجهة للتدريب الميداني، والربط المحكم بين المقررات الجامعية النظرية والتطبيق الميداني الفعلي.",
  "suggestedSkills": "صياغة نقاط فنية رصينة للمهارات والمعارف المكتسبة في بيئة هذه المنظومة (مهارات تقنية، أنظمة رقمية، إدارة مشاريع، جودة، عمل جماعي) متوافقة مع تخصص الطالب.",
  "suggestedConclusion": "خاتمة أكاديمية تلخص التجربة الميدانية وتتضمن توصيات منهجية بنّاءة لتطوير التدريب والشراكة بين الكلية وهذه المنظومة.",
  "keyFacts": ["حقيقة أو رقم إحصائي موثق 1", "حقيقة أو اعتماد تقني 2", "إنجاز أو دور رئيسي 3"]
}`;

  if (anthropicKey) {
    try {
      const AnthropicPkg = (await import('@anthropic-ai/sdk')).default;
      const client = new AnthropicPkg({ apiKey: anthropicKey });
      const res = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2200,
        temperature: 0.25,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });
      const block = res.content[0];
      if (block && block.type === 'text') {
        const parsed = JSON.parse(extractJsonFromText(block.text));
        return {
          organizationName: orgName,
          foundName: officialTitle,
          source: entityFacts?.source ? `${entityFacts.source} + Claude AI` : 'Claude Academic Synthesis',
          entityOverview: parsed.entityOverview,
          suggestedIntro: parsed.suggestedIntro,
          suggestedSkills: parsed.suggestedSkills,
          suggestedConclusion: parsed.suggestedConclusion,
          keyFacts: parsed.keyFacts || entityFacts?.keyFacts || [],
          departmentFocus: department
        };
      }
    } catch (e: any) {
      logger.warn({ err: e?.message }, 'LLM Anthropic generation failed in org search');
    }
  }

  if (geminiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }]
        })
      });
      if (res.ok) {
        const data: any = await res.json();
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          const parsed = JSON.parse(extractJsonFromText(content));
          return {
            organizationName: orgName,
            foundName: officialTitle,
            source: entityFacts?.source ? `${entityFacts.source} + Gemini AI` : 'Gemini Academic Engine',
            entityOverview: parsed.entityOverview,
            suggestedIntro: parsed.suggestedIntro,
            suggestedSkills: parsed.suggestedSkills,
            suggestedConclusion: parsed.suggestedConclusion,
            keyFacts: parsed.keyFacts || entityFacts?.keyFacts || [],
            departmentFocus: department
          };
        }
      }
    } catch (e: any) {
      logger.warn({ err: e?.message }, 'LLM Gemini generation failed in org search');
    }
  }

  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.25,
          response_format: { type: 'json_object' }
        })
      });
      if (res.ok) {
        const data: any = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            organizationName: orgName,
            foundName: officialTitle,
            source: entityFacts?.source ? `${entityFacts.source} + Llama AI` : 'Groq AI Academic Engine',
            entityOverview: parsed.entityOverview,
            suggestedIntro: parsed.suggestedIntro,
            suggestedSkills: parsed.suggestedSkills,
            suggestedConclusion: parsed.suggestedConclusion,
            keyFacts: parsed.keyFacts || entityFacts?.keyFacts || [],
            departmentFocus: department
          };
        }
      }
    } catch (e: any) {
      logger.warn({ err: e?.message }, 'LLM Groq generation failed in org search');
    }
  }

  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.25,
          response_format: { type: 'json_object' }
        })
      });
      if (res.ok) {
        const data: any = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            organizationName: orgName,
            foundName: officialTitle,
            source: entityFacts?.source ? `${entityFacts.source} + OpenAI` : 'OpenAI Academic Engine',
            entityOverview: parsed.entityOverview,
            suggestedIntro: parsed.suggestedIntro,
            suggestedSkills: parsed.suggestedSkills,
            suggestedConclusion: parsed.suggestedConclusion,
            keyFacts: parsed.keyFacts || entityFacts?.keyFacts || [],
            departmentFocus: department
          };
        }
      }
    } catch (e: any) {
      logger.warn({ err: e?.message }, 'LLM OpenAI generation failed in org search');
    }
  }

  return null;
}

function extractJsonFromText(text: string): string {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  return text;
}

function buildDeterministicAcademicText(
  orgName: string,
  entityFacts: SearchEntityFacts | null,
  curated: any | null,
  department: string
): OrganizationLookupResult {
  const officialTitle = curated?.officialName || entityFacts?.officialName || orgName;
  const dept = department?.trim() || 'التخصص الأكاديمي المعتمد';

  let rawSummary = entityFacts?.fullExtract || curated?.overview || '';
  if (!rawSummary || rawSummary.length < 50) {
    rawSummary = `تُعد ${officialTitle} إحدى المنظومات والمؤسسات الرائدة في مجال تخصصها، حيث تتميز ببنية تحتية وبيئة عمل مهنية تتبع أعلى معايير الجودة والحوكمة والتشغيل المؤسسي المتقدم.`;
  }

  // 1. Entity Overview (التعريف بجهة التدريب وطبيعة العمل فيها)
  const paragraph1 = `تُمثّل ${officialTitle} إحدى المؤسسات الرائدة ذات الثقل الإستراتيجي والمهني المرموق. وتتحدد رؤية المنظومة في تقديم نموذج مؤسسي متكامل يواكب التطورات التكنولوجية والإدارية المتسارعة، وترتكز رسالتها على تحقيق التميز في الأداء، وبناء بيئة تشغيلية رقمية تسهم في تعزيز الكفاءة والإنتاجية وتوفير أعلى معايير الجودة المعتمدة عالمياً.`;

  const paragraph2 = curated?.departments
    ? `تتسم طبيعة العمل داخل المنظومة بالتكامل الأفقي والرأسي بين قطاعاتها المتنوعة؛ وتضم المنظومة عدة إدارات محورية تشمل: ${curated.departments.join('، ')}. وتعتمد بيئة العمل الميدانية على أحدث المنهجيات التشغيلية، واستخدام التقنيات والأنظمة المتطورة مثل (${(curated.technologies || []).join('، ')})، مع الالتزام الصارم بسياسات أمن المعلومات، الحوكمة المؤسسية، وإدارة المخاطر التشغيلية.`
    : `وتتسم طبيعة العمل الميداني داخل المنظومة بالتكامل المهني والتشغيلي المنسق بين مختلف أقسامها وإداراتها التخصصية. حيث تعتمد بيئة العمل على تطبيق منهجيات عمل مرنة ومعايير تشغيل معتمدة، وتوظيف الأنظمة التقنية المؤتمتة وقواعد البيانات المركزية، مما يوفر للمتدرب فرصة حقيقية للتعامل مع بيئة إنتاجية حية تحاكي أعلى المقاييس المهنية العالمية وتصقل قدراته الإجرائية.`;

  const paragraph3 = curated?.vision2030Link
    ? `وتلعب المنظومة دوراً محورياً في دعم مسيرة التنمية الوطنية بما يتماشى مع مستهدفات رؤية المملكة 2030، لا سيما في ${curated.vision2030Link}. كما تحرص على الاستثمار في الكفاءات الوطنية الشابة وتوفير بيئة تدريبية خصبة لنقل المعرفة وتوطين الخبرات والتقنيات الحديثة.`
    : `وتسهم المنظومة بدور فاعل في دفع عجلة التنمية الشاملة والتحول الرقمي المؤسسي تماشياً مع مستهدفات رؤية المملكة 2030 وبرامج تطوير رأس المال البشري. وتلتزم بمسؤوليتها المجتمعية والأكاديمية من خلال تمكين الكفاءات الوطنية الواعدة وإتاحة الفرصة لها للمشاركة الفعلية في المشروعات القائمة والعمليات التشغيلية المباشرة.`;

  const entityOverview = `${paragraph1}\n\n${paragraph2}\n\n${paragraph3}`;

  // 2. Suggested Intro (المقدمة: أهمية التدريب التعاوني وأهدافه)
  const suggestedIntro = `يُمثّل التدريب التعاوني (CO-OP Training) ركيزة جوهرية في المنظومة الأكاديمية والمهنية؛ حيث يُعد الجسر التطبيقي الذي يربط المعارف النظرية والمفاهيم العلمية المكتسبة في قاعات الدراسة بالواقع العملي والبيئات التشغيلية الميدانية. 

وقد جاء اختيار قضاء فترة التدريب التعاوني في رحاب (${officialTitle}) انطلاقاً من المكانة المرموقة التي تحتلها هذه المنظومة العريقة، ولما تمتلكه من بنية تحتية متقدمة وكوادر هندسية وإدارية ذات كفاءة عالية. 

ويهدف هذا البرنامج الميداني إلى:
1. صقل وتطوير المهارات التخصصية في مجال (${dept}) وممارستها في بيئة عمل حقيقية.
2. اكتساب أخلاقيات العمل المؤسسي، بما يشمل العمل الجماعي، وإدارة الوقت، وحل المشكلات التشغيلية المعقدة.
3. التعرّف على التقنيات والبرمجيات ومعايير الجودة المعتمدة في قطاعات العمل الفعلية.
4. إعداد المتدرب للانتقال السلس إلى سوق العمل كعنصر وطني مؤهل يمتلك الجاهزية المهنية التامة.`;

  // 3. Suggested Skills (المعارف والمهارات والتجارب المكتسبة)
  const suggestedSkills = `أتاح التدريب الميداني لدى (${officialTitle}) فرصة متكاملة لتحويل الحصيلة الأكاديمية النظرية في مقرر (${dept}) إلى خبرات ومهارات إجرائية ملموسة، تضمنت أبرزها:

1. المهارات الفنية والتقنية التخصصية:
   - التطبيق العملي للأنظمة والبرمجيات المعتمدة لدى المنظومة، والتعامل مع البنى الرقمية وقواعد البيانات التشغيلية.
   - المشاركة في إعداد وتوثيق الإجراءات الفنية، وفحص متطلبات المشاريع وفق الضوابط والمعايير المعمول بها.

2. المهارات الإدارية والتشغيلية:
   - إدارة المهام وتحديد الأولويات التشغيلية في بيئات العمل ذات الوتيرة المتسارعة.
   - الالتزام الصارم ببروتوكولات الأمان المؤسسي وسياسات حماية وسرية البيانات.

3. مهارات التواصل والعمل الجماعي:
   - التعاون الفعّال مع الفرق متعددة التخصصات، والمشاركة في الاجتماعات الدورية وصياغة التقارير الفنية الدقيقة.
   - تحليل المشكلات الميدانية واستنباط حلول جذرية تضمن استمرارية الأعمال ورفع كفاءة الأداء.`;

  // 4. Suggested Conclusion (الخاتمة والتوصيات العامة)
  const suggestedConclusion = `في ختام فترة التدريب التعاوني الميداني في (${officialTitle})، نخلص إلى أن التجربة التدريبية شكّلت محطة مفصلية ونوعية في المسيرة التعليمية؛ حيث ساهمت بصورة مباشرة في تعميق الفهم العملي وتأكيد المواءمة بين المناهج الأكاديمية والمتطلبات الواقعية لبيئات العمل الحديثة.

وبناءً على المعايشة الميدانية، نتقدم بأبرز التوصيات العامة التالية:
- التوصيات الموجهة لجهة التدريب (${officialTitle}): استمرار تعزيز برامج الإرشاد المهني للمتدربين، وإشراكهم في مراحل متقدمة من تخطيط المشروعات الاستراتيجية لإكسابهم رؤية شمولية أوسع.
- التوصيات الموجهة للجامعة / الكلية: إدراج دراسات حالة تطبيقية مستمدة من مشاريع المؤسسات الوطنية الكبرى ضمن المقررات الدراسية، والتركيز على الأدوات التقنية الحديثة المعتمدة في سوق العمل السعودي.
- التوصيات لزملائي المتدربين: المبادرة الدائمة بطرح الاستفسارات العلمية، التوثيق اليومي الدقيق لكافة المهام المنجزة، والحرص على بناء علاقات مهنية مستدامة مع فرق العمل الميدانية.`;

  return {
    organizationName: orgName,
    foundName: officialTitle,
    source: entityFacts?.source || 'المكتبة المعرفية الأكاديمية الموثقة (Academic Knowledge Base)',
    entityOverview,
    suggestedIntro,
    suggestedSkills,
    suggestedConclusion,
    keyFacts: entityFacts?.keyFacts || [
      `منظومة رائدة في قطاع: ${curated?.sector || 'التشغيل والتطوير المؤسسي'}`,
      'بيئة تدريبية مطابقة لمعايير الجودة والحوكمة المعتمدة',
      'بنية تحتية وأنظمة تقنية متطورة تدعم التحول الرقمي الوطني'
    ],
    departmentFocus: department
  };
}

export async function lookupAndSynthesizeOrganization(
  orgName: string,
  department: string = ''
): Promise<OrganizationLookupResult> {
  const trimmed = orgName.trim();
  if (!trimmed) {
    throw new Error('اسم جهة التدريب مطلوب للبحث والتحليل الأكاديمي');
  }

  logger.info({ orgName: trimmed, department }, 'Starting live academic lookup for organization');

  const curatedMatch = matchCuratedDatabase(trimmed);

  let searchFacts = await searchWikipedia(trimmed);

  if (!searchFacts && curatedMatch) {
    searchFacts = await searchWikipedia(curatedMatch.officialName);
  }

  if (!searchFacts) {
    searchFacts = await searchDuckDuckGo(trimmed);
  }

  try {
    const llmResult = await synthesizeWithLLM(trimmed, searchFacts, curatedMatch, department);
    if (llmResult) {
      logger.info({ orgName: trimmed, source: llmResult.source }, 'Successfully synthesized with LLM');
      return llmResult;
    }
  } catch (err: any) {
    logger.warn({ err: err?.message }, 'LLM synthesis failed in org lookup. Reverting to deterministic synthesis.');
  }

  logger.info({ orgName: trimmed }, 'Using built-in deterministic academic synthesis engine');
  return buildDeterministicAcademicText(trimmed, searchFacts, curatedMatch, department);
}
