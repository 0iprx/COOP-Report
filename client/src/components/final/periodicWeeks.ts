import { getFTTHDailyEntries, getPeriod2DailyEntries } from '../../services/ftthDailyEntriesData';

/**
 * The first and second periodic reports, rewritten and split into the training
 * week each event belongs to (weeks start on Sunday, matching the report service).
 *
 * Sources: the periodic report narratives and their ticket tables. Numbers are the
 * documented daily figures as written there; week totals are the sum of those days.
 */

export interface TicketDay {
  date: string; // YYYY-MM-DD
  count: number;
  note: string;
}

export interface WeekProcedure {
  title: string;
  steps: string[];
}

export interface PeriodicWeek {
  weekStart: string; // Sunday, YYYY-MM-DD
  period: 1 | 2;
  unit: string;
  topic: string;
  overview: string;
  activities: string[];
  procedures: WeekProcedure[];
  tickets: TicketDay[];
  challenge: string;
}

export const PERIOD_LABELS: Record<1 | 2, { title: string; range: string; summary: string }> = {
  1: {
    title: 'الفترة الأولى',
    range: 'من 20/9 إلى 7/10',
    summary: 'العمل في قسم خدمات الألياف الضوئية (FTTH): من التعرف على الأنظمة وتصنيف الأعطال إلى معالجة التذاكر باستقلالية.'
  },
  2: {
    title: 'الفترة الثانية',
    range: 'من 11/10 إلى 5/11',
    summary: 'أسبوعان موظفاً فعلياً في قسم FTTH، ثم أسبوعان في قسم شبكات النقل (Transport) بمركز عمليات الشبكة (NOC).'
  }
};

export const PERIODIC_WEEKS: PeriodicWeek[] = [
  {
    weekStart: '2026-09-20',
    period: 1,
    unit: 'قسم خدمات الألياف الضوئية FTTH',
    topic: 'الانضمام إلى قسم FTTH وتصنيف الأعطال وفحص الإشارة الضوئية',
    overview:
      'بدأت في هذا الأسبوع الفترة الأولى من العمل في قسم خدمات الألياف الضوئية (FTTH). تغيّبت يوم 20/9 بعذر صحي قدّمته رسمياً واعتُمد، ثم باشرت يوم 21/9 فتعرفت على مهام موظف الدعم الفني وآلية استلام التذكرة ودراستها قبل اتخاذ أي إجراء، وانتقلت يوم 22/9 إلى الفحص العملي لتذاكر انقطاع الخدمة (Link Down).',
    activities: [
      'تعلمت تصنيف التذاكر إلى أربع حالات: Slowness وLink Down وFrequency Disconnections وPort Blocked، وخطوات الفحص المبدئي لكل حالة.',
      'فحصت تذاكر Link Down بقراءة MAC Address ومستوى الإشارة RX Power والتحقق من الـ VLANs عبر ACS.',
      'ميّزت بين الانقطاع الناتج عن فقد الإشارة الضوئية والانقطاع الناتج عن خطأ في الإعدادات، وحددت الحالات التي تحتاج زيارة فني ميداني (Dispatch).',
      'تعرفت على الأنظمة المستخدمة (Huawei NCE وMOSS وACS) وعلى مكونات الشبكة (ONT وODB وHGU) ومفهومي Provider وSeeker في مسار خدمات ITC.'
    ],
    procedures: [
      {
        title: 'فحص تذكرة Link Down',
        steps: [
          'قراءة MAC Address للجهاز.',
          'قراءة مستوى RX Power ومقارنته بالنطاق المعتمد من -10 dBm إلى -26 dBm.',
          'التحقق من حالة الاتصال ووجود الـ VLANs المطلوبة.',
          'فحص خدمات ACS وWi-Fi وVoice.',
          'عند ظهور Power Failure أو Fiber Issue أو انقطاع كامل: تقييم الحاجة إلى إرسال فني للموقع (Dispatch Technician).'
        ]
      }
    ],
    tickets: [],
    challenge:
      'كثرة المصطلحات والاختصارات وتعدد الأنظمة في البداية، وتذبذب قراءات الإشارة قرب الحد الحرج؛ وتجاوزت ذلك بربط كل قراءة بمعيارها الرقمي بدل التقدير.'
  },
  {
    weekStart: '2026-09-27',
    period: 1,
    unit: 'قسم خدمات الألياف الضوئية FTTH — وردية المساء (Shift B)',
    topic: 'وردية المساء ومعالجة البطء والتقطيع وخدمات CVLAN',
    overview:
      'انتقلت في هذا الأسبوع إلى وردية المساء (Shift B) وبدأت معالجة التذاكر بنفسي تحت إشراف المشرف الميداني، فعالجت 70 تذكرة موثقة في ثلاثة أيام، وتوسعت في فحص البطء والتقطيع المتكرر وخدمات CVLAN.',
    activities: [
      '27/9: فحص تذاكر بطء السرعة: اختبار السرعة (Speed Test)، وحالة منفذ LAN، والشبكة اللاسلكية بنطاقي 2.4GHz و5GHz، ومطابقة سرعة الباقة مع الإعداد الفعلي.',
      '29/9: التحقق من ربط خدمات CVLAN بالجهاز: 1501 للإنترنت (HSI)، و3980 للإدارة (ACS)، و1810 للصوت (Voice)، ومعالجة انقطاعات سببها خطأ في تعيين CVLAN عبر Huawei NCE.',
      '30/9: تحليل التقطيع المتكرر من سجل الانقطاعات في MOSS ومقارنته باستقرار الإشارة.',
      '1/10: معالجة حالات Port Blocked، وإعادة تهيئة الخدمة عن بُعد عبر ACS، وتصعيد ما يلزم إلى Call Centre أو FOPS.'
    ],
    procedures: [
      {
        title: 'فحص تذكرة بطء السرعة (Slowness) لعملاء ITC',
        steps: [
          'فحص مستوى RX والتأكد أنه ضمن النطاق المقبول.',
          'إجراء اختبار السرعة (Speed Test).',
          'إذا كانت السرعة طبيعية ولا يوجد خلل فني: تحويل التذكرة إلى Call Centre مع تعليق (Comment) يوضح نتائج الفحص.',
          'إذا وُجد خلل في الإشارة أو السرعة: تصعيد التذكرة إلى FOPS.'
        ]
      }
    ],
    tickets: [
      { date: '2026-09-28', count: 19, note: 'Call Centre 15، CCS 2، Open Access 1، TLS 1' },
      { date: '2026-09-30', count: 18, note: 'Resolved 11، Call Centre 4، CCS 3' },
      { date: '2026-10-01', count: 33, note: 'Call Centre 19، CCS 8، Pending to NOC 3، Open Access 2، OSS 1' }
    ],
    challenge:
      'الموازنة بين سرعة المعالجة والالتزام بزمن الاستجابة (SLA)، والحالات التي يبدو فيها الخط مستقراً لحظة الفحص بينما يُظهر السجل تقطيعاً سابقاً؛ فاعتمدت على سجل MOSS لا على الفحص اللحظي وحده.'
  },
  {
    weekStart: '2026-10-04',
    period: 1,
    unit: 'قسم خدمات الألياف الضوئية FTTH — وردية المساء (Shift B)',
    topic: 'العمل المستقل في الوردية وذروة الفترة الأولى',
    overview:
      'عملت في هذا الأسبوع باستقلالية كاملة في وردية المساء، فعالجت 174 تذكرة في أربعة أيام، وختمت الفترة الأولى يوم 7/10 بأعلى عدد يومي فيها (57 تذكرة)، ليبلغ مجموع الفترة 244 تذكرة.',
    activities: [
      '4/10: معالجة 54 تذكرة بخطوات فحص سريعة ومنظمة، مع التنقل بين Huawei NCE وMOSS ونظام التذاكر.',
      '5/10: معالجة الأعطال المركبة التي تجمع البطء والتقطيع، وتوجيه الفنيين الميدانيين إلى موضع الخلل المحتمل.',
      '6/10: مراجعة التذاكر المؤجلة والتأكد من عودة الإشارة إلى النطاق المعتمد بعد الإصلاح قبل الإغلاق.',
      '7/10: معالجة 57 تذكرة في وردية واحدة، أعلى عدد في الفترة الأولى.'
    ],
    procedures: [
      {
        title: 'منهجية التعامل مع التذكرة التي استقر عليها عملي',
        steps: [
          'قراءة التذكرة وفهم المشكلة ووصف العميل.',
          'تصنيف العطل (Slowness أو Link Down أو Disconnections أو Port Blocked).',
          'فحص بيانات الـ ONT في النظام.',
          'فحص مستوى RX.',
          'التحقق من MAC Address.',
          'التحقق من الـ VLANs والـ CVLANs المرتبطة.',
          'فحص خدمات ACS وWi-Fi وVoice.',
          'إجراء Speed Test في حالات البطء.',
          'تحليل النتائج ومقارنتها بالمعايير لتحديد السبب.',
          'اتخاذ الإجراء: Handle مع تعليق مفصل، أو تحويل إلى Call Centre، أو تصعيد إلى FOPS، أو طلب Dispatch.'
        ]
      }
    ],
    tickets: [
      { date: '2026-10-04', count: 54, note: 'Call Centre 33، CCS 12، Open Access 7، Pending to NOC 2' },
      { date: '2026-10-05', count: 40, note: 'Call Centre 14، CCS 13، Open Access 7، Pending to NOC 5، Resolved 1' },
      { date: '2026-10-06', count: 23, note: 'CCS 10، Call Centre 8، Open Access 4، Pending to NOC 1' },
      { date: '2026-10-07', count: 57, note: 'Call Centre 32، CCS 11، Open Access 6، Pending to NOC 5، OSS 2، Resolved 1' }
    ],
    challenge:
      'ضغط الوردية والحاجة إلى التنقل السريع بين الأنظمة دون إهمال خطوة، والأعطال المؤقتة التي تعود بعد استقرارها؛ فصرت أصنّف الحالات المتشابهة معاً وأتابع الحالة بعد الحل قبل إغلاقها.'
  },
  {
    weekStart: '2026-10-11',
    period: 2,
    unit: 'قسم خدمات الألياف الضوئية FTTH — موظف فعلي',
    topic: 'موظف فعلي في FTTH: فرز التذاكر في Remedy وMOSS ومعايير الإشارة',
    overview:
      'بدأت الفترة الثانية بالعمل موظفاً فعلياً في قسم FTTH على لوحة تسليم البلاغات (Handover Dashboard)، فعالجت 138 تذكرة في أربعة أيام بين وردية المساء (11 و12/10) والوردية الصباحية (13 و14/10).',
    activities: [
      '11/10: معالجة 40 تذكرة وإغلاق 6 منها مباشرة وتصعيد حالتين إلى NOC.',
      '12/10: فحص مستوى RX Power في كل حالة ومطابقته للنطاق من -10 إلى -26 dBm، والتمييز بين أعطال الكابل الداخلي والكبائن الخارجية.',
      '13/10: متابعة تذاكر البطء باختبار السرعة وقراءة MAC Address عبر ACS، وتوجيه الحالات التي تحتاج زيارة ميدانية.',
      '14/10: معالجة حالات Port Blocked على أجهزة Huawei وNokia، والتحقق من قنوات CVLAN الثلاث، وإعادة تفعيل المنافذ عن بُعد.'
    ],
    procedures: [
      {
        title: 'مسار فرز التذكرة في Remedy وMOSS (FT-02)',
        steps: [
          'قراءة حقل Provider Name وتصنيف المشكلة (Tier 3) لتحديد المسار.',
          'عملاء ITC: تطبيق مسار Link Down أو Slowness أو Browsing أو Gaming أو Landline حسب الشكوى.',
          'النفاذ المفتوح (Open Access): إذا كانت سلام هي المزوّد والطالبة STC أو Zain أو Mobily أو GO، يُتبع مسار المشغلين.',
          'المجمعات السكنية (Product = ZoomComp): فحص حالة GPON عبر Zooom وAAA.',
          'قبل أي تصعيد: التأكد في MOSS أن الحساب غير موقوف (Suspended)، وتحديد المنطقة في Remedy لمعرفة هل الـ OLT على Huawei NCE أم Nokia AMS، ثم البحث بالـ Service ID.',
          'إذا لم تظهر بيانات: MOSS ← Service instance ← PON Access Service والبحث بـ ONU SN ثم LOID؛ وإن لم توجد بيانات نهائياً تُسند التذكرة إلى Applications ← OSS App Support.'
        ]
      }
    ],
    tickets: [
      { date: '2026-10-11', count: 40, note: 'Call Centre 15، CCS 10، Open Access 7، Resolved 6، Pending to NOC 2' },
      { date: '2026-10-12', count: 38, note: 'فحص إشارات RX واستقرار الألياف' },
      { date: '2026-10-13', count: 32, note: 'تذاكر البطء وفحص MAC وACS' },
      { date: '2026-10-14', count: 28, note: 'حالات Port Blocked وضبط CVLAN' }
    ],
    challenge:
      'كثرة بلاغات Open Access التي تتطلب مطابقة دقيقة بين المشغلين؛ فالتزمت بقراءة حقل المزوّد أولاً قبل اختيار المسار.'
  },
  {
    weekStart: '2026-10-18',
    period: 2,
    unit: 'قسم خدمات الألياف الضوئية FTTH — موظف فعلي',
    topic: 'ذروة العمل في FTTH (97 تذكرة) واستبدال أجهزة ONT وإشعارات الصيانة',
    overview:
      'كان هذا الأسبوع أكثر أسابيع التدريب ضغطاً؛ عالجت فيه 193 تذكرة في أربعة أيام، منها 97 تذكرة يوم 20/10، وهو أعلى عدد يومي سجلته طوال التدريب، ثم غطيت يوم 21/10 وردية ممتدة حتى منتصف الليل.',
    activities: [
      '18/10: فرز البلاغات المتراكمة بعد نهاية الأسبوع (35 تذكرة)، ومنها انقطاعات سببتها أعمال حفر في بعض الأحياء.',
      '19/10: معالجة 16 تذكرة موثقة في تقرير التسليم دون بلاغات مرتجعة.',
      '20/10: معالجة 97 تذكرة في وردية المساء مع الحفاظ على قراءة RX وكتابة التعليق التشخيصي لكل حالة.',
      '21/10: ارتفع العدد من 36 تذكرة عند 10:28 م إلى 45 تذكرة عند 11:57 م، وسلّمت الوردية الليلية دون أعطال معلقة.'
    ],
    procedures: [
      {
        title: 'استبدال جهاز ONT على Huawei NCE عند ظهور PON not stable (FT-03)',
        steps: [
          'البحث بالـ Service ID ونسخ بيانات الجهاز الحالية (Line profile وService profile).',
          'نسخ أرقام الـ VLAN كلها من Service Port Info في الملاحظات قبل الحذف.',
          'الدخول إلى Resource ← Access Resource ← GPON ONU ← GPON ONU Auto Discovery والتصفية بـ SN أو LOID.',
          'مطابقة الموقع (OLT/Slot/Port) مع بيانات MOSS أولاً، لأن حذف الـ ONT يقطع الخدمة ويمسح منافذها.',
          'حذف الجهاز القديم، ثم Confirm ONU للجديد بالـ profiles نفسها مع Locate to ONU list ثم Apply، وإعادة إنشاء الـ VLANs، ثم Modify ← Name = Service ID.'
        ]
      },
      {
        title: 'إشعارات الصيانة المجدولة للشركات الطالبة (MDT — FT-04)',
        steps: [
          'عند وصول بريد NMC Change Management بعنوان REQUEST || CRQ ومعه Impact list: البحث عن رقم CRQ في SDM وأخذ الوصف والسبب والمنطقة والتواريخ ومدة الانقطاع.',
          'فصل عملاء كل شركة في ملف مستقل باسم الملف الأصلي مع اللاحقة (_STC و_Zain و_Mobily و_GO) دون خلط.',
          'إرسال بريد منفصل لكل شركة بعنوان TLS MDT #CRQ (أو Emergency TLS MDT للحالات العاجلة)، مع إضافة تفاصيل المنطقة لشركة GO.'
        ]
      }
    ],
    tickets: [
      { date: '2026-10-18', count: 35, note: 'البلاغات المتراكمة وحالات الطوارئ' },
      { date: '2026-10-19', count: 16, note: 'CCS 6، Call Centre 6، Open Access 2، Resolved 2' },
      { date: '2026-10-20', count: 97, note: 'CCS 34، Call Centre 30، Resolved 16، Open Access 9، TLS 3، Pending to NOC 2، NAS 2، OSS 1' },
      { date: '2026-10-21', count: 45, note: 'CCS 25، Call Centre 11، Open Access 6، Resolved 3' }
    ],
    challenge:
      'الحفاظ على دقة الفحص تحت ضغط الذروة يوم 20/10؛ فاعتمدت التشخيص المتوازي للحالات المتشابهة دون تخطي قراءة الإشارة أو التعليق.'
  },
  {
    weekStart: '2026-10-25',
    period: 2,
    unit: 'قسم شبكات النقل (Transport) — مركز عمليات الشبكة NOC',
    topic: 'الانتقال إلى قسم شبكات النقل: إنذارات NOC وبوابة الإنترنت الدولية',
    overview:
      'انتقلت يوم 27/10 من شبكات النفاذ (FTTH) إلى قسم شبكات النقل في مركز عمليات الشبكة، وتعلمت التعامل مع الإنذارات الرئيسية خطوة بخطوة وقواعد التصعيد عند انقطاع روابط بوابة الإنترنت الدولية، وتابعت 86 مهمة وتذكرة في ثلاثة أيام منها وردية ليلية يوم 29/10.',
    activities: [
      '27/10: التعرف على مكونات شبكة النقل والفرق بين شبكات النفاذ والعمود الفقري (Backbone).',
      '28/10: أساسيات التراسل الضوئي (DWDM وOTN) والمسارات عالية السعة التي تغذي الأبراج وكبائن FTTH.',
      '29/10: وردية ليلية لمراقبة استقرار مسارات التراسل أثناء نافذة الصيانة.',
      'تطبيق إجراءات الإنذارات الأربعة (TS-01) وقواعد بوابة الإنترنت الدولية (TS-02) على الأنظمة: CA Performance وSpider وSDM وCacti وSecureCRT.'
    ],
    procedures: [
      {
        title: 'إنذارات NOC الرئيسية (TS-01)',
        steps: [
          'Device has stopped: معرفة عدد العملاء على الجهاز من CA Performance (Health ← IfAlias) أو Spider؛ عميل واحد ← تذكرة CTT عبر B-care، عدة عملاء ← تذكرة NTT وإشعار sudden outage مع مراجعة الدعم وفريق الكهرباء.',
          'BGP down: الاتصال بعنصر الشبكة وتنفيذ show bgp summary | include <IP> ثم show route <IP> ثم show interfaces <Interface>؛ جلسة عميل ← يُتجاهل الإنذار، جلسة عنصر شبكة ← Critical NTT إلى Back Office مع الاتصال بهم ومراسلة المزوّد.',
          'Faulty FAN Detected: تنفيذ show env fan وshow env all عبر SSH؛ قراءات طبيعية ← إنذار وهمي، وغير ذلك ← NTT إلى Back Office وإرسال الفريق الميداني.',
          'إنذارات DPI وSandvine وVoice وWirefilter وDNS: فتح NTT فوراً وإسنادها إلى فريق NAS والاتصال بمناوب Back Office.'
        ]
      },
      {
        title: 'انقطاع روابط بوابة الإنترنت الدولية IP Transit وPeering (TS-02)',
        steps: [
          'فتح تذكرة Critical NTT واحدة فقط في سلة NOC مهما تعدد المزودون أو الروابط الساقطة، ومراسلة جميع المزودين المعنيين في الوقت نفسه.',
          'متابعة استهلاك الروابط الباقية في Cacti؛ إذا تجاوز أي رابط 85% تُفتح Major NTT إلى NAS مع الاتصال بمناوب Back Office.',
          'إذا تجاوزت السعة المتأثرة 200G: إبلاغ Shift Lead فوراً والعمل وفق مصفوفة تصعيد P0.',
          'إذا ردّ فريق SNFN بوجود local fault alarm من منفذ العميل في ITCJ فالمسار الوطني سليم والمشكلة دولية؛ فتتم المتابعة مع المزودين حتى زوال الإنذارات.'
        ]
      }
    ],
    tickets: [
      { date: '2026-10-27', count: 26, note: 'بداية التدريب في قسم النقل' },
      { date: '2026-10-28', count: 29, note: 'مسارات التراسل والإنذارات الحية' },
      { date: '2026-10-29', count: 31, note: 'وردية ليلية — CCS 16، Open Access 5، Call Centre 3، Resolved 3، TLS 2، OSS 2' }
    ],
    challenge:
      'الانتقال السريع من تذاكر المشتركين إلى إنذارات العمود الفقري تطلب العمل على عدة أنظمة مترابطة في وقت واحد؛ فدوّنت كل أمر وقاعدة تصعيد كما هي في بيئة العمل للرجوع إليها.'
  },
  {
    weekStart: '2026-11-01',
    period: 2,
    unit: 'قسم شبكات النقل (Transport) — مركز عمليات الشبكة NOC',
    topic: 'دوائر الشركات (DIA وKAUST) وإنذارات FTTH من شاشات النقل وبوابة المعرفة',
    overview:
      'ختمت الفترة الثانية بالتعامل مع دوائر الشركات المخصصة وإنذارات FTTH كما تظهر في شاشات النقل، وتابعت 85 مهمة وتذكرة في ثلاثة أيام، ونظّمت ما تعلمته في الفترة كلها داخل بوابة معرفة بنيتها بنفسي (NOC Knowledge Portal).',
    activities: [
      'فحص خدمة الإنترنت المخصص (DIA وGCX) لمزودي STC وAPTech وMobily وMawarid من SDM وSpider حتى جلسة BGP على موجه Huawei NE40E.',
      'التعامل مع بريد KAUST وتذاكر VSAT والألياف المظلمة مع Zain (TS-03).',
      'متابعة إنذارات FTTH من شاشات النقل وحساب أثر سقوط الـ OLT من ملفات CSV (TS-04).',
      'بناء بوابة المعرفة بـ React 18 وVite وTailwind CSS: 22 وحدة معرفية، و5 سيناريوهات محاكاة حوادث (26 خطوة)، و162 سؤال مراجعة، مع أمثلة Python للقراءة فقط (Netmiko وpandas).',
      '5/11: مراجعة ختامية لمهام قسمي FTTH وTransport وتدقيق الحالات العالقة.'
    ],
    procedures: [
      {
        title: 'فحص دائرة DIA (TS-03)',
        steps: [
          'نسخ رقم الخدمة (Service ID) من SDM.',
          'البحث في B-care Spider (F11 ثم لصق الرقم ثم Ctrl+F11) وأخذ Partner Circuit ID وPartner name وVLAN وPop Name من قسم Metro Ethernet.',
          'الاتصال بالموجه عبر SecureCRT أو PuTTY وتنفيذ display current-configuration interface Vlanif <VLAN> لاستخراج vpn-instance وعنوان الواجهة (/30).',
          'حساب عنوان الجار في شبكة /30، ثم تنفيذ display bgp vpnv4 vpn-instance <VRF> peer | include <PeerIP>.',
          'Established ← الجلسة قائمة؛ Active أو Idle ← فحص display logbuffer ورسوم Cacti لمعرفة آخر عمل للرابط، ثم مراسلة المزوّد مع رقم الحادثة.'
        ]
      },
      {
        title: 'إنذارات FTTH في شاشات النقل (TS-04)',
        steps: [
          'The feeder fiber is broken: تسجيل OLT وSlot وPort من Huawei NCE (وNokia AMS للمنطقة الشرقية فقط)؛ سقوط عدة منافذ PON ← NTT وإرسال الميدان، وإنذار كهرباء لمستخدم واحد ← يُتجاهل.',
          'Loss of signal: إذا كانت حالة المنفذ Dying gasp فهو انقطاع كهرباء عند المشترك ويُتجاهل، وإلا تُفتح NTT ويُرسل الميدان.',
          'حساب الأثر: تصدير قائمة الأجهزة إلى CSV من NCE أو AMS وتصفيتها برقم المنفذ لمعرفة العملاء المتأثرين.'
        ]
      }
    ],
    tickets: [
      { date: '2026-11-03', count: 34, note: 'إنذارات النقل والدوائر' },
      { date: '2026-11-04', count: 30, note: 'مسارات الحماية واستقرار الجلسات' },
      { date: '2026-11-05', count: 21, note: 'المراجعة الختامية وتدقيق الحالات العالقة' }
    ],
    challenge:
      'كثرة الخطوات والأوامر في فحص الدوائر؛ فجمعتها في بوابة المعرفة مع أمثلة الأوامر والاختبارات حتى صار الرجوع إلى أي إجراء سريعاً.'
  }
];

const byStart = new Map(PERIODIC_WEEKS.map((w) => [w.weekStart, w]));

// Titles of the daily entries that come from the periodic reports (Daily log import).
const KNOWN_TITLES = new Set(
  [...getFTTHDailyEntries(2026), ...getPeriod2DailyEntries(2026)].map((e) => e.title.trim())
);

/**
 * The periodic weeks apply only to the trainee whose log carries these periods
 * (detected from the imported daily entries), so no other trainee sees them.
 */
export function periodicWeeksFor(entryTitles: string[]): Map<string, PeriodicWeek> {
  const owns = entryTitles.some((t) => KNOWN_TITLES.has((t || '').trim()));
  return owns ? byStart : new Map();
}
