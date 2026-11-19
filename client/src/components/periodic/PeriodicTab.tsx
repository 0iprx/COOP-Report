import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  Printer,
  RotateCcw,
  CheckCircle,
  Building,
  GraduationCap,
  Calendar,
  Clock,
  Edit3,
  Languages,
  BarChart3,
  ChevronDown,
  Lightbulb
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import {
  PeriodicShiftInterval,
  FinalReportData,
  normalizeStudentName
} from '@coop/shared';
import { AcademicMarkdownView, BidiText } from '../common/AcademicMarkdownView';
import { PeriodicAnalyticsCharts } from './PeriodicAnalyticsCharts';
import { getFTTHDailyEntries, getPeriod2DailyEntries } from '../../services/ftthDailyEntriesData';
import {
  DEFAULT_REPORT_P2_AR,
  DEFAULT_REPORT_P2_EN,
  FreshPeriodicReport
} from './periodicP2Templates';

const STORAGE_KEY_FTTH_AR = 'coop_ftth_periodic_report_v10_ar';
const STORAGE_KEY_FTTH_EN = 'coop_ftth_periodic_report_v10_en';
const STORAGE_KEY_P2_AR = 'coop_periodic_report_p2_v7_ar';
const STORAGE_KEY_P2_EN = 'coop_periodic_report_p2_v7_en';
const STORAGE_KEY_REPORT_LANG = 'coop_ftth_report_lang_preference_v1';
const STORAGE_KEY_SELECTED_PERIOD = 'coop_selected_periodic_report_v1';

// ── Master Arabic Report ──────────────────────────────────────────────
const DEFAULT_FTTH_REPORT_AR: FreshPeriodicReport = {
  title: 'التقرير الفتري الأول',
  majorField: 'FTTH – Fiber to the Home',
  department: 'قسم خدمات الألياف الضوئية FTTH (Technical Support / FTTH Operations)',
  roleAssignment: 'متدرب وموظف فعلي كـ FTTH',
  periodCoverage: 'من 20/9 إلى 7/10',
  stageOneHours: '',
  stageTwoHours: '',
  intervals: [
    {
      id: 'int_1',
      label: 'المرحلة الأولى: التأسيس والتعرف على بيئة FTTH والتذاكر',
      startDate: 'التصنيف والتشخيص',
      endDate: 'Huawei NCE / MOSS / ACS',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_2',
      label: 'المرحلة الثانية: التعمق الفني في إشارات RX والـ CVLANs',
      startDate: 'معالجات وتكوينات',
      endDate: '244 تذكرة فريدة',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_3',
      label: 'المرحلة الثالثة: الاستقلالية التامة ومعالجة التذاكر بمرونة',
      startDate: 'أداء قياسي (57 تذكرة)',
      endDate: 'تغطية شاملة',
      timeFrom: '',
      timeTo: ''
    }
  ],
  customNarrative: `# مقدمة التقرير الفتري الأول (من 20/9 إلى 7/10)

خلال الفترة الممتدة **من 20/9 إلى 7/10** من برنامج التدريب التعاوني، تم العمل والتدريب ضمن بيئة تشغيلية متخصصة في خدمات الألياف الضوئية **FTTH – Fiber to the Home**. وقد شهدت هذه الفترة انتقالًا تدريجيًا من مرحلة التعرف على بيئة العمل والأنظمة والإجراءات المتبعة إلى مرحلة التطبيق العملي والتعامل المباشر مع التذاكر الفنية ومتابعتها وتنفيذ الإجراءات المرتبطة بها.

في بداية الفترة تم التعرف على طبيعة عمل موظف FTTH، وآلية التعامل مع التذاكر وتصنيف الأعطال، ثم تم التعمق في الجوانب الفنية المتعلقة بأجهزة **ONT**، ومستويات الإشارة الضوئية **RX**، والخدمات المرتبطة بالـ **VLAN وCVLAN**، إضافة إلى التعرف على عدد من الأنظمة المستخدمة في العمل مثل **Huawei NCE وMOSS وACS**.

ومع استمرار التدريب والتطبيق العملي، تطور مستوى التعامل مع التذاكر من مرحلة التعلم والمتابعة إلى مرحلة تنفيذ الـ **Handle** والتعامل مع الحالات بدرجة عالية من الاستقلالية، وصولًا إلى التعامل المباشر مع **244 تذكرة فريدة** بمعدل يقارب **35 تذكرة في المرحلة التشغيلية الواحدة**، مما رسخ الجاهزية للعمل كـ **متدرب وموظف فعلي كـ FTTH**.

---

# أولًا: التدرج الفني ومنهجية التشخيص

## 1. مرحلة التأسيس والتعرف على بيئة FTTH
في مطلع هذه الفترة بدأت مرحلة الانخراط العملي ضمن قسم FTTH، والتعرف على طبيعة العمل والمسؤوليات الأساسية لموظف الدعم الفني لخدمات الألياف الضوئية، وآلية استلام ودراسة التذاكر قبل اتخاذ أي إجراء.
وكان من أهم ما تم إتقانه تصنيف التذاكر إلى حالات مختلفة بحسب نوع المشكلة: **Slowness** و**Link Down** و**Frequency Disconnections** و**Port Blocked**، مع فهم الخطوات القياسية المعتمدة لتشخيص كل حالة.

## 2. مرحلة التعمق في الفحص الفني وبيانات الخدمة
تم التركيز خلال هذه المرحلة على أن تشخيص العطل لا يعتمد على وصف المشترك فقط، بل يستند إلى فحص بيانات الخدمة والجهاز بصورة دقيقة، وعلى رأسها: حالة جهاز الـ **ONT**، مستوى إشارة **RX**، قراءة **MAC Address**، والتحقق من الخدمات والـ **VLANs** المرتبطة، مع ترسيخ قاعدة أن القرارات الفنية تُبنى على المؤشرات القياسية وليس التقدير النظري.

---

# ثانيًا: أنواع الأعطال وطرق التحقق والتشخيص

## 1. Slowness – بطء سرعة الإنترنت

في الحالات التي يكون فيها الـ **Provider والـ Seeker** ضمن مسار خدمة ITC، يتم اتباع تسلسل الفحص التالي:
1. فحص قراءة مستوى الإشارة الضوئية **RX** والتأكد من أنها ضمن النطاق المقبول.
2. إجراء اختبار السرعة **Speed Test** للتحقق من السرعة الفعلية للخدمة.
3. في حال كانت السرعة طبيعية ولا يوجد خلل فني، يتم تحويل التذكرة إلى **Call Centre** مع تدوين **Comment** تفصيلي يوضح نتائج الفحوصات.
4. في حال وجود مشكلة فنية في الإشارة أو السرعة، يتم تصعيد التذكرة إلى **FOPS** لمزيد من التحقق والمعالجة.

---

## 2. Link Down – انقطاع اتصال الخدمة

وهي الحالات التي يكون فيها اتصال الخدمة منقطعًا، ويتم إجراء فحص شامل للـ ONT يشمل:
* قراءة الـ **MAC Address**.
* التحقق من مستوى **RX Power**.
* التحقق من حالة الاتصال ووجود الـ **VLANs** المطلوبة.
* فحص خدمات **ACS** و **Wi-Fi** و **Voice**.

وفي حال كانت المؤشرات تشير إلى انقطاع كامل أو **Power Failure** أو مشكلة في كابلات الألياف الضوئية (**Fiber Issue**)، يتم تقييم الحاجة لتدخل ميداني وطلب إرسال فني للموقع (**Dispatch Technician**).

---

## 3. Frequency Disconnections – التقطيع المتكرر

وهي الحالات التي يعاني فيها المشترك من تقطيع متكرر أو انقطاع متقطع بالخدمة.
* يتم استخدام نظام **MOSS** للتحقق من مستوى وتكرار التقطيع الزمني.
* يساعد هذا الفحص في تحديد ما إذا كانت المشكلة متكررة وتحتاج إلى تصعيد أو إجراء وقائي قبل إغلاق التذكرة.

---

## 4. Port Blocked – تعطيل المنافذ

تتعلق بوجود منفذ أو أكثر في حالة تعطيل أو **Blocked**.
* يتم التحقق من حالة المنفذ وربطه بإعدادات الخدمة والتذكرة، ثم تحديد الإجراء المناسب سواء بفك التعطيل عبر النظام أو إعادة التهيئة.

---

# ثالثًا: أجهزة ONT وتصنيفاتها الفنية

الـ **ONT (Optical Network Terminal)** هو جهاز العميل الأساسي الذي يستقبل الإشارة الضوئية ويحولها إلى خدمات الإنترنت والصوت.

### الفرق بين الأنواع:
* **Light ONT:** النوع الأساسي لتقديم الخدمة المباشرة.
* **Advanced ONT:** يوفر إمكانيات شبكية وتغطية وخدمات إضافية متقدمة.

### تصنيفات الشركات المصنعة داخل الأنظمة:
1. **Huawei NCE:**
   * تصنيف أجهزة Light ONT (مثل فئات **H5**).
   * تصنيف أجهزة Advanced ONT (مثل فئات **ELS**).
   * التمييز بين الأجهزة بناءً على الـ Last Name والبيانات الفنية.
2. **Nokia:**
   * أجهزة Light ONT: المرتبطة بـ Last Name مثل **F و E** (Equipped Type).
   * أجهزة Advanced ONT: المرتبطة بـ Last Name مثل **B و K**.
3. **ZTE:**
   * التعرف على تصنيفاتها وطرق فحصها وتوافقها مع الشبكة.

---

# رابعًا: مستوى الإشارة الضوئية RX Power

من أهم المعايير الفنية التي تم التدرب عليها:
* **النطاق التشغيلي المقبول المعتمد أثناء التدريب:**
  **من -10 dBm إلى -26 dBm**
* يعتبر فحص **RX** خطوة إلزامية في حالات **Slowness و Link Down و التقطيع**، حيث يقدم مؤشرًا قطعيًا عن سلامة خط الألياف الضوئية الواصل للعميل.

---

# خامسًا: شبكات الـ CVLAN والخدمات المرتبطة

تم فهم مفهوم الـ **CVLAN** والتحقق من ارتباط الخدمات الصحيحة بكل جهاز:

| CVLAN | الخدمة | الاستخدام التشغيلي |
| ----- | ---------------- | ---------------------------------------------- |
| **1501** | HSI | خدمة الإنترنت عالي السرعة (High Speed Internet) |
| **3980** | ACS / Management | إدارة وتهيئة جهاز الـ ONT وتحديث الإعدادات |
| **1810** | Voice | خدمة الهاتف الصوتي عبر الألياف (VoIP) |

---

# سادسًا: الأنظمة والأدوات التشغيلية

* **Huawei NCE:** الوصول لبيانات أجهزة ONT، قراءة مستوى RX، والاطلاع على حالة المنافذ وتفاصيل الخدمة.
* **MOSS:** مراقبة التقطيع المتكرر (Frequency Disconnections) وتحليل سجل استقرار الاتصال.
* **ACS:** الإدارة والتهيئة المركزية وتعديل إعدادات الـ ONT.
* **FOPS:** تصعيد المشاكل المعقدة التي تحتاج لفحص متقدم أو تدخل فني متخصص.
* **Call Centre:** تحويل التذاكر بعد اكتمال الفحص الفني والتأكد من سلامة المؤشرات، مع توثيق الفحص في Comment واضح.

---

# سابعًا: معمارية شبكة FTTH

* **ONT (Optical Network Terminal):** جهاز الاستقبال لدى المشترك.
* **ODB (Optical Distribution Box):** صندوق توزيع وربط الألياف ضمن شبكة التوزيع الخارجية.
* **HGU (Home Gateway Unit):** البوابة المنزلية التي تدمج الإنترنت والواي فاي والصوت.
* **Provider و Seeker:** مفهومان رئيسيان لتحديد مسار التذكرة والجهة المزودة والمستفيدة لخدمات ITC.

---

# ثامنًا: منهجية التعامل مع التذاكر (خطوات التشخيص الـ 10)

تم التحول إلى منهجية مهنية معتمدة من 10 خطوات:
1. **قراءة التذكرة** وفهم المشكلة الأساسية ووصف العميل.
2. **تصنيف العطل** (Slowness, Link Down, Disconnections, Port Blocked).
3. **فحص بيانات الـ ONT** المسجلة في النظام.
4. **فحص مستوى الإشارة الضوئية RX**.
5. **التحقق من قراءة الـ MAC Address**.
6. **التحقق من الـ VLANs والـ CVLANs** المرتبطة.
7. **فحص خدمات ACS و Wi-Fi و Voice**.
8. **إجراء Speed Test** في حالات بطء السرعة.
9. **تحليل النتائج** ومقارنتها بالمعايير الفنية لتحديد السبب الجذري.
10. **اتخاذ الإجراء المناسب:** تنفيذ الـ Handle، كتابة Comment تفصيلي، تحويلها لـ Call Centre، تصعيد لـ FOPS، أو طلب Dispatch لفني ميداني.

---

# تاسعًا: مرحلة التطبيق العملي وإدارة الحالات

خلال هذه المرحلة، انتقل العمل إلى التطبيق الميداني الكامل على أنظمة الدعم والتشغيل:
* فحص أجهزة الـ ONT ومستويات الإشارة الضوئية RX ومراجعة الحالات الفنية.
* التعمق في الـ Configuration وربط الـ CVLANs بالخدمات المخصصة.
* تنفيذ الـ Handle على التذاكر وإغلاق الحالات باستقلالية متزايدة ومتابعة مسارات التصعيد.

---

# عاشرًا: الإحصائيات الشاملة للتذاكر المعالجة (244 تذكرة)

تم توثيق معالجة **244 تذكرة فريدة** موزعة عبر دفعات المتابعة الميدانية خلال الفترة (من 20/9 إلى 7/10):

| الدفعة / السجل | النطاق الفني | عدد التذاكر المعالجة |
| -------------- | ------------ | --------------------: |
| السجل الموثق 1 | متابعة وتنفيذ الإجراءات الأساسية | **19** |
| السجل الموثق 2 | إغلاق ومعالجة مباشرة للحالات | **18** |
| السجل الموثق 3 | توجيه متعدد المسارات | **33** |
| السجل الموثق 4 | تدفق تشغيلي متسارع | **54** |
| السجل الموثق 5 | معالجة الحالات المركزية والتصعيد | **40** |
| السجل الموثق 6 | تشخيص ومراجعة الإشارة | **23** |
| السجل الموثق 7 | **ذروة الإنجاز والأداء القياسي** | **57** |
| **الإجمالي** | **كامل الفترة (20/9 – 7/10)** | **244 تذكرة فريدة** |

* **متوسط الإنجاز:** بلغ متوسط التعامل **34.9 تذكرة في المرحلة الموثقة الواحدة**.

---

# الحادي عشر: تفاصيل التذاكر اليومية حسب الفئات (Daily Breakdown)

### 28/9 (إجمالي 19 تذكرة)
| Category | Unique Count |
| -------- | -----------: |
| Call Centre | 15 |
| CCS | 2 |
| Open Access | 1 |
| TLS | 1 |
| OSS / Pending to NOC / Resolved / NAS | 0 |
| **المجموع** | **19** |

---

### 30/9 (إجمالي 18 تذكرة)
| Category | Unique Count |
| -------- | -----------: |
| Resolved | 11 |
| Call Centre | 4 |
| CCS | 3 |
| Open Access / TLS / OSS / Pending to NOC / NAS | 0 |
| **المجموع** | **18** |

---

### 1/10 (إجمالي 33 تذكرة)
| Category | Unique Count |
| -------- | -----------: |
| Call Centre | 19 |
| CCS | 8 |
| Pending to NOC | 3 |
| Open Access | 2 |
| OSS | 1 |
| TLS / Resolved / NAS | 0 |
| **المجموع** | **33** |

---

### 4/10 (إجمالي 54 تذكرة)
| Category | Unique Count |
| -------- | -----------: |
| Call Centre | 33 |
| CCS | 12 |
| Open Access | 7 |
| Pending to NOC | 2 |
| TLS / OSS / Resolved / NAS | 0 |
| **المجموع** | **54** |

---

### 5/10 (إجمالي 40 تذكرة)
| Category | Unique Count |
| -------- | -----------: |
| Call Centre | 14 |
| CCS | 13 |
| Open Access | 7 |
| Pending to NOC | 5 |
| Resolved | 1 |
| TLS / OSS / NAS | 0 |
| **المجموع** | **40** |

---

### 6/10 (إجمالي 23 تذكرة)
| Category | Unique Count |
| -------- | -----------: |
| CCS | 10 |
| Call Centre | 8 |
| Open Access | 4 |
| Pending to NOC | 1 |
| TLS / OSS / Resolved / NAS | 0 |
| **المجموع** | **23** |

---

### 7/10 (إجمالي 57 تذكرة - ذروة الإنجاز)
| Category | Unique Count |
| -------- | -----------: |
| Call Centre | 32 |
| CCS | 11 |
| Open Access | 6 |
| Pending to NOC | 5 |
| OSS | 2 |
| Resolved | 1 |
| TLS / NAS | 0 |
| **المجموع** | **57** |

---

# الثاني عشر: إجمالي توزيع مسارات التذاكر (Category Distribution)

عند تحليل كامل التذاكر الـ **244** المنجزة خلال الفترة، ظهر التوزيع الإجمالي التالي:

| Category (مسار التذكرة) | إجمالي التذاكر | النسبة المئوية التقريبية |
| ------------------------ | -------------: | -----------------------: |
| **Call Centre** | **125** | 51.2% |
| **CCS** | **59** | 24.2% |
| **Open Access** | **27** | 11.1% |
| **Pending to NOC** | **16** | 6.6% |
| **Resolved** | **13** | 5.3% |
| **OSS** | **3** | 1.2% |
| **TLS** | **1** | 0.4% |
| **NAS** | **0** | 0.0% |
| **الإجمالي العام** | **244** | **100%** |

توضح المؤشرات أن تذاكر **Call Centre** شكلت الحصة الأكبر (تأكيد سلامة الفحص وتوجيه العميل للدعم)، تلتها تذاكر **CCS** و **Open Access**.

---

# الثالث عشر: المرحلة المتقدمة والاستقلالية التشغيلية

شهدت نهاية هذه الفترة تكريس الاستقلالية الكاملة في الأداء التشغيلي:
* الانتقال من مرحلة التوجيه إلى **الاستقلالية التامة في معالجة البلاغات**.
* سرعة فرز المشاكل وقراءة المؤشرات واتخاذ القرار الفني في وقت قياسي.
* كتابة تعليقات احترافية وتوثيق كل خطوة داخل الأنظمة.
* تتويج الفترة بإنجاز **57 تذكرة في مرحلة واحدة** بأعلى دقة مهنية.

---

# الرابع عشر: المهارات والمعارف الفنية المكتسبة

### أهم المهارات العملية المكتسبة:
1. قراءة التذكرة وفهم المشكلة الأساسية بسرعة ودقة.
2. تصنيف الأعطال بدقة واختيار مسار التحقق المناسب.
3. فحص أجهزة الـ ONT واستخراج بيانات الـ MAC Address ومستوى RX.
4. التحقق من سلامة الـ VLANs والـ CVLANs (1501, 3980, 1810).
5. فحص خدمات ACS و Wi-Fi و Voice.
6. إجراء اختبارات السرعة Speed Test وتحليل النتائج.
7. كتابة Comments فنية واضحة ودقيقة توثق حالة الفحص.
8. تنفيذ الـ Handle على التذاكر وإغلاق الحالات المحلولة.
9. تصعيد الحالات الحرجة إلى FOPS أو NOC عند وجود أعطال شبكة.
10. فرز الحالات وتحديد متى يتم طلب Dispatch لفني ميداني.
11. إدارة الضغط والعمل بفاعلية تحت حجم التذاكر المرتفع.

---

# الخامس عشر: الصعوبات التي تمت مواجهتها وكيف تم التغلب عليها

في بداية التدريب ظهرت تحديات طبيعية نتيجة الانتقال إلى بيئة عمل حقيقية:
* كثرة المصطلحات والاختصارات الفنية وتعدد الأنظمة (Huawei NCE, MOSS, ACS).
* اختلاف خطوات التشخيص بين موديلات أجهزة الـ ONT والشركات المصنعة.
* الحاجة لسرعة اتخاذ القرار ودقة التشخيص.

**طريقة التغلب عليها:**
بالممارسة المستمرة والتعرض لـ 244 حالة حقيقية، تم بناء منهجية ذهنية منظمة للتشخيص، وأصبح ربط الأعراض بنتائج الفحص يتم بمرونة وسرعة دون تردد.

---

# السادس عشر: التطور المهني ومستوى الأداء

يظهر التطور المهني بشكل جلي في تصاعد حجم الإنتاجية والكفاءة:
* **البداية:** 19 تذكرة مع مراجعة كل خطوة.
* **المنتصف:** 33 تذكرة مع بدء الاستقلالية وتنوع مسارات التذاكر.
* **الذروة:** 54 تذكرة وصولاً إلى **57 تذكرة** في أعلى مراحل الإنجاز.

يعكس هذا التدرج تحولاً حقيقياً من مستوى متدرب يحتاج إلى إشراف مباشر إلى **موظف فعلي قادر على قيادة المهام التشغيلية بكفاءة وثقة**.

---

# السابع عشر: التقييم الذاتي والتوصيات

ساهمت هذه الفترة في صقل المهارات التشغيلية لشبكات الألياف الضوئية، وعززت الثقة في التعامل مع المشتركين والأنظمة المعقدة. وأثبتت التجربة أن الدعم الفني لـ FTTH يعتمد على التحليل المنطقي والبيانات الملموسة وليس مجرد الافتراضات.

---

<!-- pagebreak -->

<!-- analytics-charts -->

---

<!-- pagebreak -->

# الخاتمة

شكّلت هذه الفترة (من 20/9 إلى 7/10) محطة فارقة في مسيرة التدريب التعاوني؛ حيث تم الدمج بين الفهم النظري العميق لخدمات الألياف الضوئية FTTH وأجهزة ONT ومستويات الإشارة والـ CVLANs، وبين التطبيق العملي المكثف عبر معالجة **244 تذكرة فريدة** بنجاح.

وقد حققت هذه التجربة أهدافها التعليمية والمهنية بالكامل، مؤكدة الجاهزية التامة للانخراط في سوق العمل كـ **متدرب وموظف فعلي في قطاع الاتصالات وشبكات FTTH**.`
};

// ── Master English Report ─────────────────────────────────────────────
const DEFAULT_FTTH_REPORT_EN: FreshPeriodicReport = {
  title: 'First Periodic Report',
  majorField: 'FTTH – Fiber to the Home',
  department: 'FTTH Services Department (Technical Support / FTTH Operations)',
  roleAssignment: 'Trainee and Active Employee as FTTH',
  periodCoverage: 'From Sep 20 to Oct 07',
  stageOneHours: '',
  stageTwoHours: '',
  intervals: [
    {
      id: 'int_1_en',
      label: 'Phase 1: Department Induction & FTTH Fundamentals',
      startDate: 'Fault Triage',
      endDate: 'Huawei NCE / MOSS / ACS',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_2_en',
      label: 'Phase 2: Deep RX Signal & CVLAN Diagnostics',
      startDate: 'Hands-on Execution',
      endDate: '244 Unique Tickets',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_3_en',
      label: 'Phase 3: Autonomous Ticket Operations & Routing',
      startDate: 'Peak Velocity (57 Cases)',
      endDate: 'Full Coverage',
      timeFrom: '',
      timeTo: ''
    }
  ],
  customNarrative: `# Introduction — First Periodic Report (Sep 20 – Oct 07)

During the period from **Sep 20 to Oct 07** of the cooperative training program, practical training was conducted within an operational environment specialized in **FTTH – Fiber to the Home** services. This period witnessed a progressive transition from familiarization with the operational workflows, systems, and procedures to direct hands-on handling, diagnostic troubleshooting, and end-to-end ticket management.

Initially, focus was placed on understanding the core responsibilities of an FTTH technical support specialist, ticket classification, and fault taxonomy. Subsequently, deep technical training was conducted covering **ONT devices**, **RX optical power levels**, and network services associated with **VLAN and CVLAN**, in addition to operational platforms such as **Huawei NCE, MOSS, and ACS**.

Through continuous practical exposure, ticket handling evolved towards greater autonomy, advancing from observing diagnostic workflows to executing direct **Ticket Handling**, root-cause analysis, and routing—whether resolving tickets, reassigning to Call Centre, escalating to specialized tiers (FOPS/NOC), or dispatching field technicians. Over this period, **244 unique tickets** were handled at an average of **~35 tickets per cycle**, demonstrating readiness as an **active employee in FTTH operations**.

---

# 1. Operational Progression & Diagnostic Methodology

## Phase 1 – Initial Work & Introduction to FTTH Environment
Operational immersion commenced within the FTTH department, establishing mastery of primary technical support responsibilities, incoming fault queues, and systematic review procedures prior to corrective routing. Key fault categories mastered include: **Slowness**, **Link Down**, **Frequency Disconnections**, and **Port Blocked**.

## Phase 2 – Practical Diagnostics & Telemetry Verification
Diagnostics focused strictly on empirical device telemetry rather than subjective user reports—examining **ONT status**, **RX power levels**, **MAC Address registration**, and mapped **VLAN / CVLAN services**.

---

# 2. Fault Categories & Diagnostic Workflows

## 1. Slowness – Internet Speed Degradation

For cases where both **Provider and Seeker** operate under ITC transit:
1. Verify optical signal level (**RX Power**) against standard operational thresholds.
2. Conduct an official **Speed Test** to benchmark real-time throughput.
3. If test results are normal without technical defects, transfer the ticket to **Call Centre** with a detailed diagnostic **Comment**.
4. If technical degradation is confirmed, escalate the case to **FOPS** for specialized investigation.

---

## 2. Link Down – Service Disconnection

Complete service interruption requires holistic ONT telemetry verification:
* Read and verify **MAC Address**.
* Measure **RX Power level**.
* Check connection state and mapped **VLANs**.
* Inspect **ACS, Wi-Fi, and Voice** service parameters.

Where indicators reveal complete signal loss, **Power Failure**, or fiber breaks (**Fiber Issue**), an on-site technician dispatch (**Dispatch Field Tech**) is initiated.

---

## 3. Frequency Disconnections – Intermittent Flapping

Investigates intermittent drops and flapping connections:
* Leverage **MOSS** to monitor flapping frequency and historical stability patterns.
* Determine recurrence severity before initiating preventative actions or escalations.

---

## 4. Port Blocked – Disabled LAN Interfaces

Refers to interfaces in an administratively disabled or blocked state:
* Verify port operational status against subscription parameters and initiate unblocking or re-provisioning.

---

# 3. ONT Device Architecture & Vendor Classifications

The **ONT (Optical Network Terminal)** serves as the subscriber demarcation unit converting optical signals into data and voice services.

### Classifications:
* **Light ONT:** Standard terminal for direct residential service delivery.
* **Advanced ONT:** High-capacity terminal with advanced routing, Wi-Fi coverage, and multi-service interfaces.

### Management Systems & Vendor Profiles:
1. **Huawei NCE:**
   * Light ONT profiles (e.g., **H5** series).
   * Advanced ONT profiles (e.g., **ELS** series).
   * Telemetry identification using model designations and Last Name conventions.
2. **Nokia:**
   * Light ONT: Identified by Last Names such as **F and E** (Equipped Type).
   * Advanced ONT: Identified by Last Names such as **B and K**.
3. **ZTE:**
   * Vendor-specific ONT profiles, telemetry verification, and interoperability testing.

---

# 4. RX Optical Power Levels

* **Approved Operational Range:** **-10 dBm to -26 dBm**  
* RX power verification is a mandatory baseline across all fault diagnostics (**Slowness, Link Down, Flapping**), providing decisive telemetry on optical cable integrity.

---

# 5. CVLAN Architecture & Provisioned Services

Understanding mapped **CVLAN** parameters to validate service delivery:

| CVLAN | Service | Operational Purpose |
| ----- | ------- | ------------------- |
| **1501** | HSI | High-Speed Internet Access |
| **3980** | ACS / Management | Remote Provisioning, Configuration & Maintenance |
| **1810** | Voice | VoIP Telephony Service |

---

# 6. Operational Systems & Engineering Platforms

* **Huawei NCE:** Querying ONT live telemetry, RX power levels, port statuses, and optical metrics.
* **MOSS:** Tracking intermittent flapping (Frequency Disconnections) and historical uptime logs.
* **ACS:** Centralized auto-configuration, firmware upgrades, and subscriber gateway management.
* **FOPS:** Escalation pathway for complex fiber infrastructure and physical layer anomalies.
* **Call Centre:** Routing cases confirmed operational with comprehensive diagnostic commentary.

---

# 7. FTTH Network Components

* **ONT (Optical Network Terminal):** Subscriber premises equipment.
* **ODB (Optical Distribution Box):** External passive distribution box managing fiber splicing and drop cables.
* **HGU (Home Gateway Unit):** Integrated home gateway bridging Wi-Fi, Ethernet, and voice.
* **Provider & Seeker:** Structural concepts designating service ownership and transit routes.

---

# 8. 10-Step Standard Operating Procedure for Ticket Handling

A structured, 10-step troubleshooting methodology was adopted:
1. **Read & analyze ticket** details and customer fault description.
2. **Classify fault category** (Slowness, Link Down, Disconnections, Port Blocked).
3. **Inspect ONT registered telemetry** via the management portal.
4. **Measure optical RX power level**.
5. **Verify MAC Address registration**.
6. **Confirm VLAN and CVLAN associations**.
7. **Audit auxiliary services** (ACS, Wi-Fi, Voice).
8. **Execute throughput benchmarks** (Speed Test) when applicable.
9. **Correlate findings** against technical benchmarks to isolate root cause.
10. **Execute appropriate resolution:** Handle execution, technical commentary, Call Centre routing, FOPS escalation, or technician dispatch.

---

# 9. Practical Application & Operational Handling

During this phase, work transitioned into full hands-on execution across support and operations systems:
* Comprehensive ONT telemetry diagnostics, RX signal validation, and fault review.
* Advanced configuration audits and CVLAN mapping verification.
* Autonomous ticket handling, resolution execution, and multi-tier escalation routing.

---

# 10. Quantitative Ticket Handling Analytics (244 Tickets)

Across documented operational batches during the reporting period (Sep 20 – Oct 07), **244 unique tickets** were successfully processed:

| Batch / Record | Operational Focus | Handled Unique Tickets |
| -------------- | ----------------- | ---------------------: |
| Cycle 1 | Baseline triage & diagnostic validation | **19** |
| Cycle 2 | Direct handling & resolution closure | **18** |
| Cycle 3 | Multi-tier routing & escalation | **33** |
| Cycle 4 | High-velocity operational handling | **54** |
| Cycle 5 | Central ticket queue & FOPS coordination | **40** |
| Cycle 6 | Signal diagnostics & quality audits | **23** |
| Cycle 7 | **Peak operational record throughput** | **57** |
| **Total** | **Full Period (Sep 20 – Oct 07)** | **244 Unique Tickets** |

* **Performance Benchmark:** Average throughput achieved was **34.9 tickets per documented cycle**.

---

# 11. Category Breakdown Across Batches

### Cycle 1 (19 Tickets Total)
| Category | Unique Count |
| -------- | -----------: |
| Call Centre | 15 |
| CCS | 2 |
| Open Access | 1 |
| TLS | 1 |
| OSS / Pending to NOC / Resolved / NAS | 0 |
| **Total** | **19** |

---

### Cycle 2 (18 Tickets Total)
| Category | Unique Count |
| -------- | -----------: |
| Resolved | 11 |
| Call Centre | 4 |
| CCS | 3 |
| Open Access / TLS / OSS / Pending to NOC / NAS | 0 |
| **Total** | **18** |

---

### Cycle 3 (33 Tickets Total)
| Category | Unique Count |
| -------- | -----------: |
| Call Centre | 19 |
| CCS | 8 |
| Pending to NOC | 3 |
| Open Access | 2 |
| OSS | 1 |
| TLS / Resolved / NAS | 0 |
| **Total** | **33** |

---

### Cycle 4 (54 Tickets Total)
| Category | Unique Count |
| -------- | -----------: |
| Call Centre | 33 |
| CCS | 12 |
| Open Access | 7 |
| Pending to NOC | 2 |
| TLS / OSS / Resolved / NAS | 0 |
| **Total** | **54** |

---

### Cycle 5 (40 Tickets Total)
| Category | Unique Count |
| -------- | -----------: |
| Call Centre | 14 |
| CCS | 13 |
| Open Access | 7 |
| Pending to NOC | 5 |
| Resolved | 1 |
| TLS / OSS / NAS | 0 |
| **Total** | **40** |

---

### Cycle 6 (23 Tickets Total)
| Category | Unique Count |
| -------- | -----------: |
| CCS | 10 |
| Call Centre | 8 |
| Open Access | 4 |
| Pending to NOC | 1 |
| TLS / OSS / Resolved / NAS | 0 |
| **Total** | **23** |

---

### Cycle 7 (57 Tickets Total – Peak Performance)
| Category | Unique Count |
| -------- | -----------: |
| Call Centre | 32 |
| CCS | 11 |
| Open Access | 6 |
| Pending to NOC | 5 |
| OSS | 2 |
| Resolved | 1 |
| TLS / NAS | 0 |
| **Total** | **57** |

---

# 12. Overall Category Distribution

Consolidating the **244 unique tickets** across all documented cycles reveals the following distribution:

| Category (Routing Channel) | Total Tickets | Percentage |
| -------------------------- | ------------: | ---------: |
| **Call Centre** | **125** | 51.2% |
| **CCS** | **59** | 24.2% |
| **Open Access** | **27** | 11.1% |
| **Pending to NOC** | **16** | 6.6% |
| **Resolved** | **13** | 5.3% |
| **OSS** | **3** | 1.2% |
| **TLS** | **1** | 0.4% |
| **NAS** | **0** | 0.0% |
| **Grand Total** | **244** | **100%** |

---

# 13. Advanced Autonomous Operations

Operations reached full independence:
* Rapid telemetry diagnosis, triage, and accurate routing without direct supervision.
* High-volume ticket processing culminating in a record **57 tickets handled** in a single cycle.

---

# 14. Key Acquired Technical Competencies

1. Rapid diagnosis and root-cause analysis of fiber connectivity faults.
2. ONT telemetry extraction (MAC Address, optical RX power levels).
3. CVLAN configuration and service mapping verification (1501, 3980, 1810).
4. Auxiliary service troubleshooting (ACS, Wi-Fi, VoIP).
5. Comprehensive Speed Test benchmarks and throughput validation.
6. Professional technical commentary and SLA compliance documentation.
7. End-to-end ticket lifecycle handling and closure.
8. Escalation protocols to specialized engineering units (FOPS, NOC).
9. Accurate field dispatch triage.
10. Effective workload management under peak case volumes.

---

# 15. Operational Challenges & Mitigation

Initial challenges included complex technical acronyms, diverse vendor interfaces (Huawei, Nokia, ZTE), and rapid decision-making requirements under live operational constraints.  
Through repetitive immersion and handling 244 real-world cases, diagnostic reflexes were honed into a structured, highly dependable operational workflow.

---

# 16. Professional Performance Trajectory

A clear progression in operational efficiency was demonstrated:
* **Initial Stage:** 19 tickets with step-by-step verification.
* **Intermediate Stage:** 33 tickets with expanding multi-channel routing.
* **Peak Maturity:** 54 tickets, reaching **57 tickets** at peak output.

---

# 17. Self-Assessment & Reflection

This training bridged theoretical concepts with real-world telecommunications infrastructure. Technical support in FTTH requires empirical telemetry analysis and structured deductive logic rather than assumptions.

---

<!-- pagebreak -->

<!-- analytics-charts -->

---

<!-- pagebreak -->

# Conclusion

This first cooperative training period (Sep 20 – Oct 07) marked a transformative milestone, synthesizing theoretical fiber optics foundations with intensive hands-on experience handling **244 unique tickets**.  
The experience confirmed full operational readiness to perform as an **active employee in FTTH telecommunications and network operations**.`
};

export const PeriodicTab: React.FC = () => {
  const { t, isAr: globalIsAr } = useLanguage();
  const queryClient = useQueryClient();

  // Toast feedback
  const [saveToast, setSaveToast] = useState<string>('');
  const [errorToast, setErrorToast] = useState<string>('');

  // Logo file upload refs for Cover Page
  const institutionLogoInputRef = useRef<HTMLInputElement>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);

  // Active Report Language: 'ar' | 'en'
  const [reportLang, setReportLang] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem(STORAGE_KEY_REPORT_LANG) as 'ar' | 'en') || 'ar';
  });

  const isReportAr = reportLang === 'ar';

  // Active Periodic Period: 'p1' | 'p2' (defaults to p2 so new period is instantly active!)
  const [selectedPeriod, setSelectedPeriod] = useState<'p1' | 'p2'>(() => {
    return (localStorage.getItem(STORAGE_KEY_SELECTED_PERIOD) as 'p1' | 'p2') || 'p2';
  });

  // Arabic report state for Period 1
  const [reportP1Ar, setReportP1Ar] = useState<FreshPeriodicReport>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FTTH_AR);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.customNarrative) return parsed;
      }
    } catch {}
    return DEFAULT_FTTH_REPORT_AR;
  });

  // English report state for Period 1
  const [reportP1En, setReportP1En] = useState<FreshPeriodicReport>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FTTH_EN);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.customNarrative) return parsed;
      }
    } catch {}
    return DEFAULT_FTTH_REPORT_EN;
  });

  // Arabic report state for Period 2
  const [reportP2Ar, setReportP2Ar] = useState<FreshPeriodicReport>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_P2_AR);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.customNarrative) return parsed;
      }
    } catch {}
    return DEFAULT_REPORT_P2_AR;
  });

  // English report state for Period 2
  const [reportP2En, setReportP2En] = useState<FreshPeriodicReport>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_P2_EN);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.customNarrative) return parsed;
      }
    } catch {}
    return DEFAULT_REPORT_P2_EN;
  });

  // Currently viewed report based on selectedPeriod & reportLang
  const currentReport = selectedPeriod === 'p1'
    ? (isReportAr ? reportP1Ar : reportP1En)
    : (isReportAr ? reportP2Ar : reportP2En);

  const setCurrentReport = (updater: React.SetStateAction<FreshPeriodicReport>) => {
    if (selectedPeriod === 'p1') {
      if (isReportAr) setReportP1Ar(updater);
      else setReportP1En(updater);
    } else {
      if (isReportAr) setReportP2Ar(updater);
      else setReportP2En(updater);
    }
  };

  // Persist language preference and selected period
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REPORT_LANG, reportLang);
  }, [reportLang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SELECTED_PERIOD, selectedPeriod);
  }, [selectedPeriod]);

  // Persist drafts locally for P1
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FTTH_AR, JSON.stringify(reportP1Ar));
    } catch {}
  }, [reportP1Ar]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FTTH_EN, JSON.stringify(reportP1En));
    } catch {}
  }, [reportP1En]);

  // Persist drafts locally for P2
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_P2_AR, JSON.stringify(reportP2Ar));
    } catch {}
  }, [reportP2Ar]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_P2_EN, JSON.stringify(reportP2En));
    } catch {}
  }, [reportP2En]);

  // Fetch student profile for institutional cover page (university name, logos, student ID)
  const { data: finalReportData } = useQuery<FinalReportData>({
    queryKey: ['finalReport'],
    queryFn: async () => {
      const res = await api.get('/reports/final');
      return res.data;
    }
  });

  const profile = finalReportData?.profile || ({} as any);
  const entityName = profile?.entityAddress || (isReportAr ? 'جهة التدريب التعاوني' : 'Training Organization');

  // Clear / Reset to default report for the active language & selected period
  const handleResetToDefault = () => {
    const isP1 = selectedPeriod === 'p1';
    const periodName = isP1
      ? (isReportAr ? 'التقرير الفتري الأول (FTTH)' : 'Periodic Report 1 (FTTH)')
      : (isReportAr ? 'التقرير الفتري الثاني (FTTH & Transport)' : 'Periodic Report 2 (FTTH & Transport)');

    if (
      window.confirm(
        isReportAr
          ? `هل تريد استعادة نموذج ${periodName} وتحديث الحقول بالبيانات الافتراضية؟`
          : `Restore default ${periodName} template with full data?`
      )
    ) {
      if (isP1) {
        if (isReportAr) {
          setReportP1Ar(DEFAULT_FTTH_REPORT_AR);
          localStorage.removeItem(STORAGE_KEY_FTTH_AR);
        } else {
          setReportP1En(DEFAULT_FTTH_REPORT_EN);
          localStorage.removeItem(STORAGE_KEY_FTTH_EN);
        }
      } else {
        if (isReportAr) {
          setReportP2Ar(DEFAULT_REPORT_P2_AR);
          localStorage.removeItem(STORAGE_KEY_P2_AR);
        } else {
          setReportP2En(DEFAULT_REPORT_P2_EN);
          localStorage.removeItem(STORAGE_KEY_P2_EN);
        }
      }
      setSaveToast(
        isReportAr ? `تم استعادة ${periodName} المحدّث بنجاح!` : `${periodName} restored successfully!`
      );
      setTimeout(() => setSaveToast(''), 3000);
    }
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

  // Import Daily Entries for the selected period to Daily Log Tab (STRICTLY NON-DESTRUCTIVE)
  const [importingDaily, setImportingDaily] = useState<boolean>(false);

  const handleImportToDailyReports = async () => {
    if (importingDaily) return;
    setImportingDaily(true);
    try {
      const isP1 = selectedPeriod === 'p1';
      const entriesToImport = isP1 ? getFTTHDailyEntries() : getPeriod2DailyEntries();
      const existingRes = await api.get('/entries');
      const existingList: any[] = existingRes.data?.entries || [];
      const existingKeys = new Set(existingList.map((e: any) => `${e.entryDate}_${e.title}`));

      let createdCount = 0;
      for (const entry of entriesToImport) {
        if (!existingKeys.has(`${entry.entryDate}_${entry.title}`)) {
          await api.post('/entries', entry);
          createdCount++;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['entries'] });
      await queryClient.invalidateQueries({ queryKey: ['weekly'] });
      await queryClient.invalidateQueries({ queryKey: ['finalReport'] });

      if (createdCount > 0) {
        setSaveToast(
          isReportAr
            ? `تم إدراج ${createdCount} تقرير يومي بنجاح في قسم التقارير اليومية دون حذف أي تقرير سابق!`
            : `Successfully imported ${createdCount} daily reports into Daily Logs without deleting existing entries!`
        );
      } else {
        setSaveToast(
          isReportAr
            ? 'التقارير اليومية لجميع أيام هذه الفترة موجودة بالفعل ومسجلة مسبقاً!'
            : 'All daily reports for this period already exist in your log!'
        );
      }
      setTimeout(() => setSaveToast(''), 4500);
    } catch {
      setErrorToast(isReportAr ? 'تعذر إدراج التقارير اليومية، يرجى المحاولة لاحقاً' : 'Failed to import daily reports');
      setTimeout(() => setErrorToast(''), 4000);
    } finally {
      setImportingDaily(false);
    }
  };

  // Print PDF
  const handlePrintPDF = () => {
    setSaveToast(
      isReportAr
        ? 'في نافذة الطباعة: اختر A4 وتأكد من إلغاء خيار (Headers and footers / الرؤوس والتذييلات) لطباعة نظيفة بدون روابط أو أرقام افتراضية'
        : 'In print dialog: choose A4 and uncheck (Headers and footers) for clean output without URLs or browser page counts'
    );
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-6" dir={isReportAr ? 'rtl' : 'ltr'}>
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
        
        {/* ── Period Selector Navigation (الفترة الأولى / الفترة الثانية) ── */}
        <div className="no-print mb-4 pb-3 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-ink">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>{isReportAr ? 'اختر التقرير الفتري المطلوب:' : 'Select Target Periodic Report:'}</span>
          </div>

          <div className="inline-flex p-1 bg-bg border border-line rounded-xl text-xs font-bold shadow-2xs gap-1">
            <button
              type="button"
              onClick={() => setSelectedPeriod('p1')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                selectedPeriod === 'p1'
                  ? 'bg-ink text-white font-black shadow-xs'
                  : 'text-sub hover:text-ink hover:bg-line/60'
              }`}
              title={isReportAr ? 'عرض وطباعة التقرير الفتري الأول' : 'View Period 1 Report'}
            >
              <span>{isReportAr ? 'التقرير الفتري الأول (20/9 – 7/10)' : 'Periodic Report 1 (Sep 20 – Oct 07)'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-black">
                {isReportAr ? '244 تذكرة' : '244'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPeriod('p2')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                selectedPeriod === 'p2'
                  ? 'bg-accent text-white font-black shadow-xs'
                  : 'text-sub hover:text-ink hover:bg-line/60'
              }`}
              title={isReportAr ? 'عرض وطباعة التقرير الفتري الثاني المحدث' : 'View Period 2 Report'}
            >
              <span>{isReportAr ? 'التقرير الفتري الثاني (11/10 – 19/11)' : 'Periodic Report 2 (Oct 11 – Nov 19)'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-black">
                {isReportAr ? '452 تذكرة FTTH' : '452 FTTH'}
              </span>
            </button>
          </div>
        </div>

        {/* ── Clean Top Header with Language Switcher & Print ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-line no-print">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-accent-dim text-accent">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-ink">
                {currentReport.title}
              </h2>
              <p className="text-[11px] text-sub font-bold">
                {currentReport.periodCoverage} • {currentReport.roleAssignment} • {selectedPeriod === 'p2' ? (isReportAr ? '452 تذكرة FTTH (النقل: 0 تذاكر)' : '452 FTTH Tickets (Transport: 0)') : (isReportAr ? 'إجمالي 244 تذكرة' : '244 Total Tickets')}
              </p>
            </div>
          </div>

          {/* Action Buttons: Language Switcher, Reset & Print/PDF */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Version Toggle (عربي / English) */}
            <div className="inline-flex p-1 bg-bg border border-line rounded-xl text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => setReportLang('ar')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  isReportAr
                    ? 'bg-accent text-white shadow-xs font-black'
                    : 'text-sub hover:text-ink'
                }`}
                title="عرض وطباعة النسخة العربية الرسمية"
              >
                <span>عربي</span>
              </button>
              <button
                type="button"
                onClick={() => setReportLang('en')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  !isReportAr
                    ? 'bg-accent text-white shadow-xs font-black'
                    : 'text-sub hover:text-ink'
                }`}
                title="View & Print English Version"
              >
                <span>English</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-xl bg-bg hover:bg-line border border-line text-xs font-bold text-ink flex items-center gap-1.5 transition-all shadow-2xs"
              title={isReportAr ? 'استعادة النموذج الافتراضي للفترة المحددة' : 'Reset Selected Period Template'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-accent" />
              <span>{isReportAr ? 'استعادة' : 'Reset'}</span>
            </button>

            <button
              type="button"
              onClick={handleImportToDailyReports}
              disabled={importingDaily}
              className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent/90 text-xs font-black text-white flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
              title={
                isReportAr
                  ? (selectedPeriod === 'p2'
                      ? 'إضافة الـ 14 يوماً للفترة الثانية كتقارير جديدة في قسم التقارير اليومية دون حذف أي تقرير سابق'
                      : 'إضافة الـ 12 يوماً للفترة الأولى كتقارير جديدة في قسم التقارير اليومية دون حذف أي تقرير سابق')
                  : 'Add period days to Daily Logs without deleting existing'
              }
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {importingDaily
                  ? (isReportAr ? 'جاري الإضافة...' : 'Adding...')
                  : (isReportAr
                      ? (selectedPeriod === 'p2' ? '+ إضافة يوميات الفترة 2 (14 يوماً)' : '+ إضافة يوميات الفترة 1 (12 يوماً)')
                      : '+ Add to Daily Logs')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('report-analytics-charts-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-300 text-xs font-black text-teal-800 dark:bg-teal-950/40 dark:border-teal-700 dark:text-teal-200 dark:hover:bg-teal-900/50 flex items-center gap-1.5 transition-all shadow-2xs"
              title={isReportAr ? 'الانتقال المباشر إلى لوحة الرسوم البيانية والإحصائيات' : 'Jump to Analytics Charts'}
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{isReportAr ? 'لوحة الرسوم البيانية' : 'Analytics Charts'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-4 py-1.5 text-xs font-bold text-white bg-ink hover:bg-ink/85 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title={isReportAr ? 'طباعة التقرير أو حفظه كـ PDF رسمي' : 'Print report or save as PDF'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isReportAr ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
            </button>
          </div>
        </div>

        {/* ── Quick Editor Accordion (Hidden in Print: no-print) ───── */}
        <details className="no-print mb-8 p-4 bg-bg border border-line rounded-xl group">
          <summary className="text-xs font-black text-ink cursor-pointer list-none flex items-center justify-between select-none">
            <span className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-accent" />
              <span>
                {isReportAr
                  ? 'تعديل نصوص وبيانات التقرير الفتري (اضغط للإظهار / الإخفاء)'
                  : 'Edit Report Texts & Metadata (Click to expand)'}
              </span>
            </span>
            <ChevronDown className="w-4 h-4 text-sub group-open:rotate-180 transition-transform" aria-hidden="true" />
          </summary>

          <div className="mt-4 space-y-4 pt-3 border-t border-line/60 text-xs">
            {/* Row 1: Titles & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-black text-sub mb-1">
                  {isReportAr ? 'عنوان التقرير:' : 'Report Title:'}
                </label>
                <input
                  type="text"
                  value={currentReport.title}
                  onChange={(e) => setCurrentReport({ ...currentReport, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-sub mb-1">
                  {isReportAr ? 'مجال التدريب:' : 'Training Field:'}
                </label>
                <input
                  type="text"
                  value={currentReport.majorField}
                  onChange={(e) => setCurrentReport({ ...currentReport, majorField: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-sub mb-1">
                  {isReportAr ? 'طبيعة العمل / القسم:' : 'Department:'}
                </label>
                <input
                  type="text"
                  value={currentReport.department}
                  onChange={(e) => setCurrentReport({ ...currentReport, department: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-sub mb-1">
                  {isReportAr ? 'الصفة بالغلاف:' : 'Role on Cover:'}
                </label>
                <input
                  type="text"
                  value={currentReport.roleAssignment}
                  onChange={(e) => setCurrentReport({ ...currentReport, roleAssignment: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-accent"
                />
              </div>
            </div>

            {/* Row 2: Period Coverage Only */}
            <div>
              <label className="block text-[11px] font-black text-sub mb-1">
                {isReportAr ? 'الفترة المشمولة بالتقرير (من تاريخ - إلى تاريخ):' : 'Reporting Period (From Date – To Date):'}
              </label>
              <input
                type="text"
                value={currentReport.periodCoverage}
                onChange={(e) => setCurrentReport({ ...currentReport, periodCoverage: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-ink"
              />
            </div>

            {/* Markdown Narrative Textarea */}
            <div>
              <label className="block text-[11px] font-black text-sub mb-1">
                {isReportAr ? 'محتوى وسرد التقرير بالكامل (Markdown):' : 'Report Markdown Content:'}
              </label>
              <textarea
                value={currentReport.customNarrative}
                onChange={(e) => setCurrentReport({ ...currentReport, customNarrative: e.target.value })}
                rows={12}
                className="w-full p-3 bg-card border border-line rounded-xl text-xs text-ink font-mono leading-relaxed"
              />
            </div>
          </div>
        </details>

        {/* ── Print Recommendation Banner (no-print) ──────────────── */}
        <div className="no-print max-w-[210mm] mx-auto mb-5 p-3.5 bg-accent/5 border border-accent/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 text-ink font-bold">
            <Lightbulb className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />
            <span>
              {isReportAr
                ? 'لطباعة مثالية بحجم A4 وبدون روابط: في نافذة الطباعة (Ctrl + P) اختر A4 وألغِ تحديد خيار (الرؤوس والتذييلات / Headers and footers) من مزيد من الإعدادات.'
                : 'For perfect A4 print without browser URLs: In the print dialog (Ctrl + P), select A4 and uncheck "Headers and footers" under More settings.'}
            </span>
          </div>
          <button
            type="button"
            onClick={handlePrintPDF}
            className="px-4 py-1.5 bg-ink hover:bg-ink/85 text-white font-black rounded-xl text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isReportAr ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
          </button>
        </div>

        {/* ── Logo controls (screen only) ───────────────────────── */}
        <div className="no-print max-w-[210mm] mx-auto mb-3 flex flex-wrap items-center justify-end gap-2">
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
          <button type="button" className="btn-ghost btn-sm" onClick={() => institutionLogoInputRef.current?.click()}>
            <GraduationCap className="w-4 h-4" aria-hidden="true" />
            <span>{isReportAr ? 'شعار الجامعة' : 'University logo'}</span>
          </button>
          <button type="button" className="btn-ghost btn-sm" onClick={() => companyLogoInputRef.current?.click()}>
            <Building className="w-4 h-4" aria-hidden="true" />
            <span>{isReportAr ? 'شعار جهة التدريب' : 'Company logo'}</span>
          </button>
        </div>

        {/* ── Printable paper: cover page + report body ─────────────── */}
        <div id="periodic-paper-view" className="rp-paper" dir={isReportAr ? 'rtl' : 'ltr'} lang={isReportAr ? 'ar' : 'en'}>
          {/* ══ Cover page ══ */}
          <section id="periodic-cover-page" className="rp-cover">
            <div className="rp-cover-head">
              <div className="rp-org">
                {profile.institutionLogo ? (
                  <img src={profile.institutionLogo} alt={isReportAr ? 'شعار الجامعة' : 'University logo'} className="rp-org-logo" />
                ) : (
                  <span className="rp-org-logo is-empty" aria-hidden="true">
                    <GraduationCap className="w-6 h-6" />
                  </span>
                )}
                <div className="rp-org-text">
                  <span className="rp-org-name">{isReportAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}</span>
                  <span className="rp-org-sub">{isReportAr ? 'وزارة التعليم' : 'Ministry of Education'}</span>
                  <span className="rp-org-sub"><bdi>{profile.trainingUnit || (isReportAr ? 'الكلية / الجامعة' : 'University / College')}</bdi></span>
                </div>
              </div>

              <div className="rp-org is-end">
                <div className="rp-org-text">
                  <span className="rp-org-name"><BidiText text={profile.entityAddress || entityName} isAr={isReportAr} /></span>
                  <span className="rp-org-sub">{selectedPeriod === 'p2' ? 'FTTH & Transport Operations' : 'FTTH Operations'}</span>
                </div>
                {profile.companyLogo ? (
                  <img src={profile.companyLogo} alt={isReportAr ? 'شعار جهة التدريب' : 'Company logo'} className="rp-org-logo" />
                ) : (
                  <span className="rp-org-logo is-empty" aria-hidden="true">
                    <Building className="w-6 h-6" />
                  </span>
                )}
              </div>
            </div>

            <div className="rp-cover-body">
              <div className="rp-cover-titleblock">
                <p className="rp-kicker">{isReportAr ? 'تقرير التدريب التعاوني' : 'Cooperative Training Report'}</p>
                <h1 className="rp-cover-title"><BidiText text={currentReport.title} isAr={isReportAr} /></h1>
                <p className="rp-cover-sub"><BidiText text={currentReport.department} isAr={isReportAr} /></p>
                <p className="rp-period"><bdi>{currentReport.periodCoverage}</bdi></p>
              </div>

              <dl className="rp-meta">
                <div className="rp-meta-item">
                  <dt>{isReportAr ? 'اسم المتدرب' : 'Trainee'}</dt>
                  <dd><bdi>{normalizeStudentName(profile.studentName) || '—'}</bdi></dd>
                </div>
                <div className="rp-meta-item">
                  <dt>{isReportAr ? 'الرقم الأكاديمي' : 'Student ID'}</dt>
                  <dd>
                    <bdi>{profile.trainingNumber || '—'}</bdi>
                  </dd>
                </div>
                <div className="rp-meta-item">
                  <dt>{isReportAr ? 'مجال التدريب' : 'Training field'}</dt>
                  <dd><BidiText text={currentReport.majorField} isAr={isReportAr} /></dd>
                </div>
                <div className="rp-meta-item">
                  <dt>{isReportAr ? 'المشرف الميداني' : 'Field supervisor'}</dt>
                  <dd><bdi>{profile.responsibleName || '—'}</bdi></dd>
                </div>
                <div className="rp-meta-item is-wide">
                  <dt>{isReportAr ? 'الصفة ونطاق التكليف' : 'Role during the period'}</dt>
                  <dd><BidiText text={currentReport.roleAssignment} isAr={isReportAr} /></dd>
                </div>
              </dl>

              <div className="rp-scope">
                <div className="rp-scope-head">
                  <h2>{isReportAr ? 'محاور الفترة' : 'Period milestones'}</h2>
                  <span className="rp-scope-badge">
                    {selectedPeriod === 'p2'
                      ? isReportAr
                        ? '452 تذكرة FTTH | النقل: 0 تذاكر'
                        : '452 FTTH Tickets | Transport: 0'
                      : isReportAr
                        ? '244 تذكرة فريدة معالجة'
                        : '244 handled tickets'}
                  </span>
                </div>
                <ol
                  className="rp-scope-grid"
                  style={{ gridTemplateColumns: `repeat(${currentReport.intervals.length % 2 === 0 ? 2 : Math.min(3, currentReport.intervals.length)}, minmax(0, 1fr))` }}
                >
                  {currentReport.intervals.map((int, idx) => (
                    <li key={int.id || idx} className="rp-scope-card">
                      <span className="rp-scope-label"><BidiText text={int.label} isAr={isReportAr} /></span>
                      <span className="rp-scope-dates">
                        <bdi>{int.startDate}</bdi>
                        {int.endDate && int.endDate !== int.startDate && (
                          <>
                            <span className="rp-scope-sep" aria-hidden="true">·</span>
                            <bdi>{int.endDate}</bdi>
                          </>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="rp-cover-foot">
              <span>
                {isReportAr
                  ? selectedPeriod === 'p2'
                    ? 'التقرير الفتري الثاني — عمليات FTTH وشبكات النقل'
                    : 'التقرير الفتري الأول — خدمات الألياف الضوئية FTTH'
                  : selectedPeriod === 'p2'
                    ? 'Second periodic report — FTTH operations and transport networks'
                    : 'First periodic report — FTTH operations'}
              </span>
              <span><bdi>{profile.trainingUnit || ''}</bdi></span>
            </div>
          </section>

          {/* ══ Report body ══ */}
          <section className="rp-body">
            <AcademicMarkdownView content={currentReport.customNarrative} isReportAr={isReportAr} period={selectedPeriod} />

            {!currentReport.customNarrative?.includes('<!-- analytics-charts -->') &&
              !currentReport.customNarrative?.includes('<!-- analytics-charts-p1 -->') &&
              !currentReport.customNarrative?.includes('<!-- analytics-charts-p2 -->') && (
                <div className="rt-charts">
                  <PeriodicAnalyticsCharts isReportAr={isReportAr} period={selectedPeriod} />
                </div>
              )}

            <section id="periodic-endorsement-block" className="rp-sign" aria-label={isReportAr ? 'الاعتماد' : 'Endorsement'}>
              <h2 className="rp-sign-title">{isReportAr ? 'مصادقة واعتماد التقرير' : 'Endorsement'}</h2>
              <div className="rp-sign-grid">
                <div className="rp-sign-cell">
                  <span className="rp-sign-role">{isReportAr ? 'المتدرب' : 'Trainee'}</span>
                  <span className="rp-sign-name"><bdi>{normalizeStudentName(profile.studentName) || '—'}</bdi></span>
                  <span className="rp-sign-line" aria-hidden="true" />
                  <span className="rp-sign-caption">{isReportAr ? 'التوقيع' : 'Signature'}</span>
                </div>
                <div className="rp-sign-cell">
                  <span className="rp-sign-role">{isReportAr ? 'المشرف الميداني' : 'Field supervisor'}</span>
                  <span className="rp-sign-name"><bdi>{profile.responsibleName || '—'}</bdi></span>
                  <span className="rp-sign-line" aria-hidden="true" />
                  <span className="rp-sign-caption">{isReportAr ? 'التوقيع' : 'Signature'}</span>
                </div>
                <div className="rp-sign-cell">
                  <span className="rp-sign-role">{isReportAr ? 'المشرف الأكاديمي' : 'Academic supervisor'}</span>
                  <span className="rp-sign-name"><bdi>{profile.supervisorName || '—'}</bdi></span>
                  <span className="rp-sign-line" aria-hidden="true" />
                  <span className="rp-sign-caption">{isReportAr ? 'التوقيع' : 'Signature'}</span>
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
};
