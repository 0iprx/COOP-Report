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
  Languages
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import {
  PeriodicShiftInterval,
  FinalReportData,
  normalizeStudentName
} from '@coop/shared';
import { AcademicMarkdownView } from '../common/AcademicMarkdownView';
import { PeriodicAnalyticsCharts } from './PeriodicAnalyticsCharts';
import { getFTTHDailyEntries } from '../../services/ftthDailyEntriesData';

interface FreshPeriodicReport {
  title: string;
  majorField: string;
  department: string;
  roleAssignment: string;
  periodCoverage: string;
  stageOneHours: string;
  stageTwoHours: string;
  intervals: PeriodicShiftInterval[];
  customNarrative: string;
}

const STORAGE_KEY_FTTH_AR = 'coop_ftth_periodic_report_v7_ar';
const STORAGE_KEY_FTTH_EN = 'coop_ftth_periodic_report_v7_en';
const STORAGE_KEY_REPORT_LANG = 'coop_ftth_report_lang_preference_v1';

// ── Master Arabic Report ──────────────────────────────────────────────
const DEFAULT_FTTH_REPORT_AR: FreshPeriodicReport = {
  title: 'تقرير التدريب التعاوني',
  majorField: 'FTTH – Fiber to the Home',
  department: 'قسم خدمات الألياف الضوئية FTTH (Technical Support / FTTH Operations)',
  roleAssignment: 'متدرب وموظف فعلي كـ FTTH',
  periodCoverage: 'من 20/9 إلى 7/10',
  stageOneHours: 'من 8:30 صباحًا إلى 6:00 مساءً',
  stageTwoHours: 'Shift B من 2:00 مساءً إلى 10:00 مساءً',
  intervals: [
    {
      id: 'int_1',
      label: 'المرحلة الأولى: بداية العمل والتعرف على FTTH والتذاكر',
      startDate: '21/9',
      endDate: '22/9',
      timeFrom: '08:30',
      timeTo: '18:00'
    },
    {
      id: 'int_2',
      label: 'المرحلة الثانية: تعمق وتطبيق عملي (Shift B)',
      startDate: '27/9',
      endDate: '1/10',
      timeFrom: '14:00',
      timeTo: '22:00'
    },
    {
      id: 'int_3',
      label: 'المرحلة الثالثة: استقلالية وتغطية الشفت بالكامل (Shift B)',
      startDate: '4/10',
      endDate: '7/10',
      timeFrom: '14:00',
      timeTo: '22:00'
    }
  ],
  customNarrative: `# مقدمة

خلال الفترة من 20/9 إلى 7/10 من فترة التدريب التعاوني، تم العمل والتدريب ضمن بيئة تشغيلية متخصصة في خدمات الألياف الضوئية **FTTH – Fiber to the Home**. وقد شهدت هذه الفترة انتقالًا تدريجيًا من مرحلة التعرف على بيئة العمل والأنظمة والإجراءات المتبعة إلى مرحلة التطبيق العملي والتعامل المباشر مع التذاكر الفنية ومتابعتها وتنفيذ الإجراءات المرتبطة بها.

في بداية الفترة تم التعرف على طبيعة عمل موظف FTTH، وآلية التعامل مع التذاكر وتصنيف الأعطال، ثم تم التعمق في الجوانب الفنية المتعلقة بأجهزة **ONT**، ومستويات الإشارة الضوئية **RX**، والخدمات المرتبطة بالـ **VLAN وCVLAN**، إضافة إلى التعرف على عدد من الأنظمة المستخدمة في العمل مثل **Huawei NCE وMOSS وACS**.

ومع استمرار التدريب والتطبيق العملي، تطور مستوى التعامل مع التذاكر من مرحلة التعلم والمتابعة إلى مرحلة تنفيذ الـ **Handle** والتعامل مع الحالات بدرجة أكبر من الاستقلالية، وصولًا إلى القدرة على التعامل مع الشفت بشكل فعلي ومباشر، والتعامل مع **244 تذكرة فريدة** بمعدل يقارب **35 تذكرة في الشفت الواحد**، مما رسخ الجاهزية للعمل كـ **متدرب وموظف فعلي كـ FTTH**.

---

# أولًا: التسلسل الزمني ومراحل الدوام

## 20/9 – الاستئذان

**الحضور:** لم يتم الحضور.  
**السبب:** وعكة صحية.  
**الإجراء:** تم تقديم طلب استئذان رسمي للجهة المسؤولة، وقد تمت الموافقة عليه واعتماده.

---

## 21/9 – بداية العمل والتعرف على بيئة FTTH

في هذا اليوم بدأت مرحلة العمل الفعلي ضمن قسم FTTH، وكان وقت الدوام من الساعة **8:30 صباحًا حتى الساعة 6:00 مساءً**.

بدأت بالتعرف على طبيعة العمل والمسؤوليات الأساسية لموظف FTTH، كما تم التعرف على أنواع التذاكر والمشكلات التي يتم استقبالها والتعامل معها، وطريقة دراسة التذكرة قبل اتخاذ أي إجراء.

وكان من أهم ما تم التعرف عليه تصنيف التذاكر إلى حالات مختلفة بحسب نوع المشكلة: **Slowness** و**Link Down** و**Frequency Disconnections** و**Port Blocked**، مع فهم الخطوات العامة المعتمدة لتشخيص كل حالة.

---

## 22/9 – التشخيص الفعلي وفحص بيانات الخدمة

استمر العمل في هذا اليوم من الساعة **8:30 صباحًا حتى الساعة 6:00 مساءً**، وتم التعمق في طريقة فحص الحالات عملياً.

تم التركيز على أن تشخيص العطل لا يعتمد على وصف المشترك فقط، بل يتطلب فحص بيانات الخدمة والجهاز، وعلى رأسها: حالة جهاز الـ **ONT**، مستوى إشارة **RX**، قراءة **MAC Address**، والتحقق من الخدمات والـ **VLANs** المرتبطة.

كما تم ترسيخ قاعدة أن الإجراءات تتحدد بناءً على النتائج الفنية الدقيقة للفحص وليس مجرد التقدير النظري.

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

# تاسعًا: مرحلة التطبيق العملي ونظام الشفتات (Shift B)

ابتداءً من **27/9** انتقل التدريب إلى نظام **Shift B (من 2:00 م حتى 10:00 م)**:
* **27/9 (8 ساعات):** تعمق في فحص الـ ONT ومستويات RX ومراجعة الحالات الميدانية.
* **28/9 (8 ساعات):** تدريب عملي وبدء توثيق التذاكر المنجزة (**19 تذكرة**).
* **29/9 (8 ساعات):** التعمق في الـ Configuration وربط الـ CVLANs بالخدمات.
* **30/9 (8 ساعات):** تنفيذ الـ Handle على التذاكر وإغلاق الحالات (**18 تذكرة**).
* **1/10 (8 ساعات):** استقلالية أعلى في التعامل وتنوع في مسارات التذاكر (**33 تذكرة**).

---

# عاشرًا: الإحصائيات الشاملة للتذاكر المعالجة (244 تذكرة)

خلال الأيام السبعة الموثقة تم التعامل مع **244 تذكرة فريدة** بنظام Shift B (من 2:00 م إلى 10:00 م):

| التاريخ | وقت التواجد | عدد التذاكر المعالجة |
| ------- | ---------------- | --------------------: |
| 28/9 | 2:00 م – 10:00 م | **19** |
| 30/9 | 2:00 م – 10:00 م | **18** |
| 1/10 | 2:00 م – 10:00 م | **33** |
| 4/10 | 2:00 م – 10:00 م | **54** |
| 5/10 | 2:00 م – 10:00 م | **40** |
| 6/10 | 2:00 م – 10:00 م | **23** |
| 7/10 | 2:00 م – 10:00 م | **57** |
| **الإجمالي** | **56 ساعة توثيق** | **244 تذكرة فريدة** |

* **متوسط الإنجاز:** بلغ متوسط التعامل اليومي **34.9 تذكرة في الشفت الواحد**.

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

# الثالث عشر: الفترة المتقدمة والاستقلالية (من 4/10 إلى 7/10)

خلال هذه الفترة استمر العمل بنظام **Shift B (2:00 م إلى 10:00 م)**:
* الانتقال من مرحلة التوجيه إلى **الاستقلالية التامة في إدارة الشفت**.
* سرعة فرز المشاكل وقراءة المؤشرات واتخاذ القرار الفني في وقت قياسي.
* كتابة تعليقات احترافية وتوثيق كل خطوة داخل الأنظمة.
* تتويج الفترة في يوم **7/10** بإنجاز **57 تذكرة في شفت واحد** بأعلى دقة مهنية.

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
11. إدارة الوقت والعمل بفاعلية تحت ضغط حجم التذاكر المرتفع أثناء الشفت.

---

# الخامس عشر: الصعوبات التي تمت مواجهتها وكيف تم التغلب عليها

في بداية التدريب ظهرت تحديات طبيعية نتيجة الانتقال إلى بيئة عمل حقيقية:
* كثرة المصطلحات والاختصارات الفنية وتعدد الأنظمة (Huawei NCE, MOSS, ACS).
* اختلاف خطوات التشخيص بين موديلات أجهزة الـ ONT والشركات المصنعة.
* الحاجة لسرعة اتخاذ القرار خلال الشفت.

**طريقة التغلب عليها:**
بالممارسة اليومية والتعرض لـ 244 حالة حقيقية، تم إنشاء مسار ذهني منظم للتشخيص، وأصبح ربط الأعراض بنتائج الفحص يتم بمرونة وسرعة دون تردد.

---

# السادس عشر: التطور المهني ومستوى الأداء

يظهر التطور المهني بشكل جلي في تصاعد حجم الإنتاجية والكفاءة:
* **البداية:** 19 تذكرة في 28/9 مع مراجعة كل خطوة.
* **المنتصف:** 33 تذكرة في 1/10 مع بدء الاستقلالية وتنوع مسارات التذاكر.
* **الذروة:** 54 تذكرة في 4/10، وصولاً إلى **57 تذكرة في 7/10**.

يعكس هذا التدرج تحولاً حقيقياً من مستوى متدرب يحتاج إلى إشراف مباشر إلى **موظف فعلي قادر على تغطية الشفت بكفاءة وثقة**.

---

# السابع عشر: التقييم الذاتي والتوصيات

ساهمت هذه الفترة في صقل المهارات التشغيلية لشبكات الألياف الضوئية، وعززت الثقة في التعامل مع المشتركين والأنظمة المعقدة. وأثبتت التجربة أن الدعم الفني لـ FTTH يعتمد على التحليل المنطقي والبيانات الملموسة وليس مجرد الافتراضات.

---

<!-- pagebreak -->

# الخاتمة

شكّلت هذه الفترة محطة فارقة في مسيرة التدريب التعاوني؛ حيث تم الدمج بين الفهم النظري العميق لخدمات الألياف الضوئية FTTH وأجهزة ONT ومستويات الإشارة والـ CVLANs، وبين التطبيق العملي المكثف عبر معالجة **244 تذكرة فريدة** وتغطية الشفتات الميدانية بنجاح.

وقد حققت هذه التجربة أهدافها التعليمية والمهنية بالكامل، مؤكدة الجاهزية التامة للانخراط في سوق العمل كـ **متدرب وموظف فعلي في قطاع الاتصالات وشبكات FTTH**.

---

## ملحق: سجل الحضور ومراحل الدوام

| التاريخ | وقت الدوام | الحالة / النشاط الميداني |
| ------- | ---------------- | ------------------------------------- |
| 20/9 | — | استئذان بموافقة رسمية من الجهة المسؤولة |
| 21/9 | 8:30 ص – 6:00 م | بداية العمل والتعرف على FTTH والتذاكر |
| 22/9 | 8:30 ص – 6:00 م | التعمق في التشخيص وفحص الخدمة |
| 27/9 | 2:00 م – 10:00 م | تعمق وتطبيق عملي (Shift B) |
| 28/9 | 2:00 م – 10:00 م | تطبيق عملي – إنجاز 19 تذكرة |
| 29/9 | 2:00 م – 10:00 م | تعمق في Configuration والـ CVLANs |
| 30/9 | 2:00 م – 10:00 م | تطبيق عملي – إنجاز 18 تذكرة |
| 1/10 | 2:00 م – 10:00 م | تطبيق عملي – إنجاز 33 تذكرة |
| 4/10 | 2:00 م – 10:00 م | تطبيق عملي – إنجاز 54 تذكرة |
| 5/10 | 2:00 م – 10:00 م | تطبيق عملي – إنجاز 40 تذكرة |
| 6/10 | 2:00 م – 10:00 م | تطبيق عملي – إنجاز 23 تذكرة |
| 7/10 | 2:00 م – 10:00 م | تطبيق عملي – إنجاز 57 تذكرة (ذروة الإنجاز) |

**إجمالي التواجد الميداني: ما بين 91 إلى 113 ساعة معتمدة، تم خلالها إنجاز 244 تذكرة فريدة.**`
};

// ── Master English Report ─────────────────────────────────────────────
const DEFAULT_FTTH_REPORT_EN: FreshPeriodicReport = {
  title: 'Cooperative Training Report',
  majorField: 'FTTH – Fiber to the Home',
  department: 'FTTH Services Department (Technical Support / FTTH Operations)',
  roleAssignment: 'Trainee and Active Employee as FTTH',
  periodCoverage: 'From Sep 20 to Oct 7',
  stageOneHours: '8:30 AM – 6:00 PM',
  stageTwoHours: 'Shift B (2:00 PM – 10:00 PM)',
  intervals: [
    {
      id: 'int_1_en',
      label: 'Stage 1: Department Induction & FTTH Fundamentals',
      startDate: 'Sep 21',
      endDate: 'Sep 22',
      timeFrom: '08:30',
      timeTo: '18:00'
    },
    {
      id: 'int_2_en',
      label: 'Stage 2: Hands-on Practical Application (Shift B)',
      startDate: 'Sep 27',
      endDate: 'Oct 01',
      timeFrom: '14:00',
      timeTo: '22:00'
    },
    {
      id: 'int_3_en',
      label: 'Stage 3: Autonomous Shift Operations (Shift B)',
      startDate: 'Oct 04',
      endDate: 'Oct 07',
      timeFrom: '14:00',
      timeTo: '22:00'
    }
  ],
  customNarrative: `# Introduction

During the period from Sep 20 to Oct 7 of the cooperative training program, practical training was conducted within an operational environment specialized in **FTTH – Fiber to the Home** services. This period witnessed a progressive transition from familiarization with the operational workflows, systems, and procedures to direct hands-on handling, diagnostic troubleshooting, and end-to-end ticket management.

Initially, focus was placed on understanding the core responsibilities of an FTTH technical support specialist, ticket classification, and fault taxonomy. Subsequently, deep technical training was conducted covering **ONT devices**, **RX optical power levels**, and network services associated with **VLAN and CVLAN**, in addition to operational platforms such as **Huawei NCE, MOSS, and ACS**.

Through continuous practical exposure, ticket handling evolved towards greater autonomy, advancing from observing diagnostic workflows to executing direct **Ticket Handling**, root-cause analysis, and routing—whether resolving tickets, reassigning to Call Centre, escalating to specialized tiers (FOPS/NOC), or dispatching field technicians. Over the documented period, **244 unique tickets** were handled at an average of **~35 tickets per shift**, demonstrating readiness as an **active employee in FTTH operations**.

---

# 1. Training Timeline and Shift Schedules

## Sep 20 – Authorized Absence

**Attendance:** Absent.  
**Reason:** Medical condition.  
**Action:** Formal leave request submitted and officially approved by management.

---

## Sep 21 – Initial Work & Introduction to FTTH Environment

Operational duties commenced within the FTTH department from **8:30 AM to 6:00 PM**.  
Familiarization was established with primary technical support responsibilities, incoming fault tickets, and preliminary review procedures before taking corrective actions.

Key fault categories introduced included: **Slowness**, **Link Down**, **Frequency Disconnections**, and **Port Blocked**, focusing on understanding technical implications and general diagnostic workflows.

---

## Sep 22 – Practical Diagnostics & Service Data Verification

Operational duties continued from **8:30 AM to 6:00 PM**, advancing into hands-on verification methodologies.  
Emphasis was placed on grounding diagnoses on concrete device telemetry rather than user descriptions alone, notably: **ONT status**, **RX power level**, **MAC Address registration**, and mapped **VLAN services**.

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

# 9. Practical Application & Shift B Operations

Beginning **Sep 27**, operations transitioned to **Shift B (2:00 PM to 10:00 PM)**:
* **Sep 27 (8h):** Advanced ONT telemetry, RX verification, and case studies.
* **Sep 28 (8h):** Hands-on handling—**19 tickets** processed.
* **Sep 29 (8h):** Advanced configuration and CVLAN mapping audits.
* **Sep 30 (8h):** Autonomous ticket handling and resolution execution—**18 tickets** processed.
* **Oct 1 (8h):** Multi-tier ticket routing and escalation—**33 tickets** processed.

---

# 10. Quantitative Ticket Handling Analytics (244 Tickets)

Across the seven documented shifts, **244 unique tickets** were successfully processed under Shift B (2:00 PM – 10:00 PM):

| Date | Shift Hours | Handled Unique Tickets |
| ---- | ----------- | ---------------------: |
| Sep 28 | 2:00 PM – 10:00 PM | **19** |
| Sep 30 | 2:00 PM – 10:00 PM | **18** |
| Oct 1 | 2:00 PM – 10:00 PM | **33** |
| Oct 4 | 2:00 PM – 10:00 PM | **54** |
| Oct 5 | 2:00 PM – 10:00 PM | **40** |
| Oct 6 | 2:00 PM – 10:00 PM | **23** |
| Oct 7 | 2:00 PM – 10:00 PM | **57** |
| **Total** | **56 Hours Documented** | **244 Unique Tickets** |

* **Shift Performance Benchmark:** Average daily throughput achieved was **34.9 tickets per shift**.

---

# 11. Daily Category Breakdown

### Sep 28 (19 Tickets Total)
| Category | Unique Count |
| -------- | -----------: |
| Call Centre | 15 |
| CCS | 2 |
| Open Access | 1 |
| TLS | 1 |
| OSS / Pending to NOC / Resolved / NAS | 0 |
| **Total** | **19** |

---

### Sep 30 (18 Tickets Total)
| Category | Unique Count |
| -------- | -----------: |
| Resolved | 11 |
| Call Centre | 4 |
| CCS | 3 |
| Open Access / TLS / OSS / Pending to NOC / NAS | 0 |
| **Total** | **18** |

---

### Oct 1 (33 Tickets Total)
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

### Oct 4 (54 Tickets Total)
| Category | Unique Count |
| -------- | -----------: |
| Call Centre | 33 |
| CCS | 12 |
| Open Access | 7 |
| Pending to NOC | 2 |
| TLS / OSS / Resolved / NAS | 0 |
| **Total** | **54** |

---

### Oct 5 (40 Tickets Total)
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

### Oct 6 (23 Tickets Total)
| Category | Unique Count |
| -------- | -----------: |
| CCS | 10 |
| Call Centre | 8 |
| Open Access | 4 |
| Pending to NOC | 1 |
| TLS / OSS / Resolved / NAS | 0 |
| **Total** | **23** |

---

### Oct 7 (57 Tickets Total – Peak Performance)
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

Consolidating the **244 unique tickets** across all seven shifts reveals the following distribution:

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

# 13. Advanced Autonomous Operations (Oct 4 to Oct 7)

Operations under Shift B (2:00 PM – 10:00 PM) reached full operational independence:
* Rapid telemetry diagnosis, triage, and accurate routing without direct supervision.
* High-volume ticket processing culminated on **Oct 7** with a record **57 tickets handled** in a single shift.

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
10. Effective workload and time management under peak shift volumes.

---

# 15. Operational Challenges & Mitigation

Initial challenges included complex technical acronyms, diverse vendor interfaces (Huawei, Nokia, ZTE), and rapid decision-making requirements under live shift constraints.  
Through repetitive immersion and handling 244 real-world cases, diagnostic reflexes were honed into a structured, highly dependable operational workflow.

---

# 16. Professional Performance Trajectory

A clear progression in operational efficiency was demonstrated:
* **Initial Stage:** 19 tickets on Sep 28 with step-by-step verification.
* **Intermediate Stage:** 33 tickets on Oct 1 with expanding multi-channel routing.
* **Peak Maturity:** 54 tickets on Oct 4, reaching **57 tickets on Oct 7**.

---

# 17. Self-Assessment & Reflection

This training bridged theoretical concepts with real-world telecommunications infrastructure. Technical support in FTTH requires empirical telemetry analysis and structured deductive logic rather than assumptions.

---

<!-- pagebreak -->

# Conclusion

This cooperative training period marked a transformative milestone, synthesizing theoretical fiber optics foundations with intensive hands-on experience handling **244 unique tickets** across operational shifts.  
The experience confirmed full operational readiness to perform as an **active employee in FTTH telecommunications and network operations**.

---

## Appendix: Attendance and Operational Log

| Date | Shift Hours | Operational Activity |
| ---- | ----------- | -------------------- |
| Sep 20 | — | Authorized Leave (Approved) |
| Sep 21 | 8:30 AM – 6:00 PM | Department Induction & FTTH Fundamentals |
| Sep 22 | 8:30 AM – 6:00 PM | Telemetry Diagnostics & Service Verification |
| Sep 27 | 2:00 PM – 10:00 PM | Advanced Hands-on Diagnostics (Shift B) |
| Sep 28 | 2:00 PM – 10:00 PM | Operational Handling – 19 Tickets Processed |
| Sep 29 | 2:00 PM – 10:00 PM | Configuration & CVLAN Deep Dive |
| Sep 30 | 2:00 PM – 10:00 PM | Operational Handling – 18 Tickets Processed |
| Oct 1 | 2:00 PM – 10:00 PM | Operational Handling – 33 Tickets Processed |
| Oct 4 | 2:00 PM – 10:00 PM | Operational Handling – 54 Tickets Processed |
| Oct 5 | 2:00 PM – 10:00 PM | Operational Handling – 40 Tickets Processed |
| Oct 6 | 2:00 PM – 10:00 PM | Operational Handling – 23 Tickets Processed |
| Oct 7 | 2:00 PM – 10:00 PM | Peak Shift Handling – 57 Tickets Processed |

**Total Logged Presence: ~91 to 113 Certified Hours with 244 Handled Tickets.**`
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

  // Arabic report state
  const [reportAr, setReportAr] = useState<FreshPeriodicReport>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FTTH_AR);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.customNarrative) return parsed;
      }
    } catch {}
    return DEFAULT_FTTH_REPORT_AR;
  });

  // English report state
  const [reportEn, setReportEn] = useState<FreshPeriodicReport>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FTTH_EN);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.customNarrative) return parsed;
      }
    } catch {}
    return DEFAULT_FTTH_REPORT_EN;
  });

  // Currently viewed report based on reportLang
  const currentReport = isReportAr ? reportAr : reportEn;
  const setCurrentReport = isReportAr ? setReportAr : setReportEn;

  // Persist language preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REPORT_LANG, reportLang);
  }, [reportLang]);

  // Persist drafts locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FTTH_AR, JSON.stringify(reportAr));
    } catch {}
  }, [reportAr]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FTTH_EN, JSON.stringify(reportEn));
    } catch {}
  }, [reportEn]);

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

  // Clear / Reset to default FTTH report for the active language
  const handleResetToDefault = () => {
    if (
      window.confirm(
        isReportAr
          ? 'هل تريد استعادة نموذج تقرير FTTH وتحديث الحقول بكامل البيانات الجديدة؟'
          : 'Restore default English FTTH report template with full data?'
      )
    ) {
      if (isReportAr) {
        setReportAr(DEFAULT_FTTH_REPORT_AR);
        localStorage.removeItem(STORAGE_KEY_FTTH_AR);
      } else {
        setReportEn(DEFAULT_FTTH_REPORT_EN);
        localStorage.removeItem(STORAGE_KEY_FTTH_EN);
      }
      setSaveToast(
        isReportAr ? 'تم استعادة تقرير FTTH المحدّث بنجاح!' : 'FTTH English report restored successfully!'
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

  // Import 12 FTTH Daily Entries to Daily Log Tab
  const [importingDaily, setImportingDaily] = useState<boolean>(false);

  const handleImportToDailyReports = async () => {
    if (importingDaily) return;
    setImportingDaily(true);
    try {
      const entriesToImport = getFTTHDailyEntries();
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
            ? `✅ تم إدراج ${createdCount} تقرير يومي بنجاح في قسم التقارير اليومية!`
            : `✅ Successfully imported ${createdCount} daily reports into Daily Logs!`
        );
      } else {
        setSaveToast(
          isReportAr
            ? 'التقارير اليومية لجميع أيام الفترة موجودة بالفعل ومسجلة مسبقاً!'
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
        ? '💡 في نافذة الطباعة: اختر A4 وتأكد من إلغاء خيار (Headers and footers / الرؤوس والتذييلات) لطباعة نظيفة بدون روابط أو أرقام افتراضية'
        : '💡 In print dialog: choose A4 and uncheck (Headers and footers) for clean output without URLs or browser page counts'
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
        
        {/* ── Clean Top Header with Language Switcher & Print ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-line no-print">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-accent-dim text-accent">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-ink">
                {isReportAr
                  ? 'تقرير التدريب التعاوني (قسم خدمات الألياف الضوئية FTTH)'
                  : 'Co-op Training Report (FTTH Operations)'}
              </h2>
              <p className="text-[11px] text-sub font-bold">
                {currentReport.periodCoverage} • {currentReport.roleAssignment} • {isReportAr ? 'إجمالي 244 تذكرة' : '244 Total Tickets'}
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
              title={isReportAr ? 'استعادة النموذج الافتراضي' : 'Reset to Default'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-accent" />
              <span>{isReportAr ? 'استعادة' : 'Reset'}</span>
            </button>

            <button
              type="button"
              onClick={handleImportToDailyReports}
              disabled={importingDaily}
              className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent/90 text-xs font-black text-white flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
              title={isReportAr ? 'إضافة الـ 12 يوماً كتقارير جديدة في قسم التقارير اليومية (دون حذف التقارير السابقة)' : 'Add 12 days to Daily Logs without deleting existing'}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {importingDaily
                  ? (isReportAr ? 'جاري الإضافة...' : 'Adding...')
                  : (isReportAr ? '+ إضافة إلى التقارير اليومية' : '+ Add to Daily Logs')}
              </span>
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
            <span className="text-[11px] text-sub font-bold group-open:rotate-180 transition-transform">▼</span>
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

            {/* Row 2: Coverage & Shifts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-black text-sub mb-1">
                  {isReportAr ? 'الفترة المشمولة بالتقرير:' : 'Reporting Period:'}
                </label>
                <input
                  type="text"
                  value={currentReport.periodCoverage}
                  onChange={(e) => setCurrentReport({ ...currentReport, periodCoverage: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-sub mb-1">
                  {isReportAr ? 'دوام المرحلة الأولى:' : 'Stage 1 Hours:'}
                </label>
                <input
                  type="text"
                  value={currentReport.stageOneHours}
                  onChange={(e) => setCurrentReport({ ...currentReport, stageOneHours: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-sub mb-1">
                  {isReportAr ? 'دوام المرحلة الثانية:' : 'Stage 2 Hours:'}
                </label>
                <input
                  type="text"
                  value={currentReport.stageTwoHours}
                  onChange={(e) => setCurrentReport({ ...currentReport, stageTwoHours: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-ink"
                />
              </div>
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
            <span className="text-lg">💡</span>
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

        {/* ── Printable Paper View: #periodic-paper-view ───────────── */}
        <div
          id="periodic-paper-view"
          className="w-full max-w-[210mm] mx-auto bg-white dark:bg-card border border-line rounded-2xl p-6 sm:p-10 shadow-lg print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full space-y-6"
        >

          {/* ══════════════════════════════════════════════════════════════
              PAGE 1: Official Institutional Cover Page
             ══════════════════════════════════════════════════════════════ */}
          <section
            id="periodic-cover-page"
            className="bg-card border border-line rounded-2xl p-6 sm:p-8 print:p-0 print:border-none print:shadow-none print:rounded-none flex flex-col justify-between"
          >
            {/* Header: Kingdom Header & Dual Logos - Pinned to Top */}
            <div className="shrink-0 flex items-center justify-between pb-4 border-b border-line gap-4">
              {/* Right (in RTL) or Left (in LTR): Institution Info / Logo */}
              <div className={`flex items-center gap-3 ${isReportAr ? 'text-right' : 'text-left'}`}>
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
                  <div className="text-[11px] font-black text-ink">
                    {isReportAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}
                  </div>
                  <div className="text-[10px] text-sub font-bold">
                    {isReportAr ? 'وزارة التعليم' : 'Ministry of Education'}
                  </div>
                  {/* Institution Name preserved in Arabic as requested */}
                  <div className="text-[10px] text-accent font-black">
                    {profile.trainingUnit || (isReportAr ? 'الكلية / الجامعة' : 'الجامعة / الكلية')}
                  </div>
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
                  title={isReportAr ? 'تغيير شعار الجامعة أو الكلية' : 'Upload University Logo'}
                >
                  {isReportAr ? 'شعار الجامعة' : 'Uni Logo'}
                </button>
                <button
                  type="button"
                  onClick={() => companyLogoInputRef.current?.click()}
                  className="px-2 py-1 text-[10px] font-bold text-sub hover:text-ink bg-bg rounded-lg border border-line"
                  title={isReportAr ? 'تغيير شعار جهة التدريب' : 'Upload Company Logo'}
                >
                  {isReportAr ? 'شعار الجهة' : 'Co Logo'}
                </button>
              </div>

              {/* Left (in RTL) or Right (in LTR): Training Company Logo */}
              <div className={`flex items-center gap-3 ${isReportAr ? 'text-left' : 'text-right'}`}>
                <div className={`hidden sm:block ${isReportAr ? 'text-right' : 'text-right'}`}>
                  <div className="text-[11px] font-black text-ink">{profile.entityAddress || entityName}</div>
                  <div className="text-[10px] text-sub font-bold">FTTH Operations</div>
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

            {/* Centered Middle Section: Title, Trainee Information Matrix & Shift Intervals */}
            <div className="flex-1 flex flex-col justify-center my-auto py-4 sm:py-6 space-y-4 sm:space-y-5">
              {/* Main Report Title Banner */}
              <div className="text-center py-2 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-black bg-accent text-white shadow-2xs">
                  <span>{currentReport.periodCoverage}</span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-ink tracking-tight pt-1">
                  {currentReport.title}
                </h1>
                <p className="text-xs text-sub font-bold">
                  {currentReport.department}
                </p>
              </div>

              {/* Trainee & Period Information Matrix on Cover */}
              <div className="bg-bg border border-line rounded-xl p-3 sm:p-4 text-start grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs trainee-matrix-print print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/60 print:p-3 print:gap-x-4 print:gap-y-2">
                {/* 1. Trainee Name: Preserved in Arabic as requested! */}
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">
                    {isReportAr ? 'اسم المتدرب:' : 'Trainee Name:'}
                  </span>
                  <span className="font-black text-ink">
                    {normalizeStudentName(profile.studentName) || '—'}
                  </span>
                </div>

                {/* 2. Student ID */}
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">
                    {isReportAr ? 'الرقم الأكاديمي:' : 'Student ID:'}
                  </span>
                  <span className="font-black text-ink">{profile.trainingNumber || '—'}</span>
                </div>

                {/* 3. Field of Training */}
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">
                    {isReportAr ? 'مجال التدريب:' : 'Training Field:'}
                  </span>
                  <span className="font-black text-ink">{currentReport.majorField}</span>
                </div>

                {/* 4. Nature of Work */}
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">
                    {isReportAr ? 'طبيعة العمل:' : 'Nature of Work:'}
                  </span>
                  <span className="font-black text-ink">{currentReport.department}</span>
                </div>

                {/* 5. Field Supervisor: Preserved in Arabic as requested! */}
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">
                    {isReportAr ? 'المشرف الميداني:' : 'Field Supervisor:'}
                  </span>
                  <span className="font-black text-ink">
                    {profile.responsibleName || '—'}
                  </span>
                </div>

                {/* 6. Period Coverage */}
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">
                    {isReportAr ? 'الفترة المشمولة بالتقرير:' : 'Reporting Period:'}
                  </span>
                  <span className="font-black text-accent">{currentReport.periodCoverage}</span>
                </div>
                
                {/* 7. Specific Role on Cover */}
                <div className="sm:col-span-2 flex items-center justify-between bg-accent-dim/40 border border-accent/20 rounded-lg p-2 print:border-slate-300 print:bg-slate-100">
                  <span className="font-black text-ink">
                    {isReportAr ? 'الصفة ونطاق التكليف بالفترة:' : 'Role on Cover:'}
                  </span>
                  <span className="font-black text-accent text-[12px] print:text-slate-900">
                    {currentReport.roleAssignment}
                  </span>
                </div>

                {/* 8. Stage 1 Hours */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-bold text-sub">
                    {isReportAr ? 'دوام المرحلة الأولى:' : 'Stage 1 Hours:'}
                  </span>
                  <span className="font-bold text-ink">{currentReport.stageOneHours}</span>
                </div>

                {/* 9. Stage 2 Hours */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-bold text-sub">
                    {isReportAr ? 'دوام المرحلة الثانية:' : 'Stage 2 Hours:'}
                  </span>
                  <span className="font-bold text-ink">{currentReport.stageTwoHours}</span>
                </div>
              </div>

              {/* Work Intervals Summary & Total Metric on Cover */}
              <div className="mt-4 p-3 bg-bg border border-line rounded-xl space-y-2 text-start print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/40 print:p-2.5 shadow-2xs">
                <div className="flex items-center justify-between pb-1 border-b border-line/60">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-black text-ink">
                      {isReportAr ? 'نظام وتوزيع الفترات والورديات المعتمدة:' : 'Authorized Shift & Period Distribution:'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {isReportAr ? '244 تذكرة فريدة معالجة' : '244 Handled Tickets'}
                    </span>
                    <span className="text-[10px] text-accent font-black">
                      {isReportAr ? '91 - 113 ساعة معتمدة' : '~91-113 Hours'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {currentReport.intervals.map((int, idx) => (
                    <div key={int.id || idx} className="p-2 bg-card border border-line rounded-lg print:border-slate-300">
                      <div className="font-black text-ink text-[11px] mb-1">{int.label}</div>
                      <div className="text-[10px] text-sub font-bold flex items-center justify-between">
                        <span>{isReportAr ? `من ${int.startDate} إلى ${int.endDate}` : `${int.startDate} – ${int.endDate}`}</span>
                        <span className="font-black text-accent">{int.timeFrom} - {int.timeTo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Academic Page 1 Footer - Pinned to Bottom */}
            <div className="shrink-0 mt-auto pt-3 border-t border-line flex items-center justify-between text-[10px] text-sub font-bold">
              <span>
                {isReportAr
                  ? 'المملكة العربية السعودية — تقرير التدريب التعاوني (خدمات الألياف الضوئية FTTH)'
                  : 'KSA — Cooperative Training Report (FTTH Operations)'}
              </span>
              <span className="font-black text-accent">
                {isReportAr ? 'الغلاف الرسمي المعتمد' : 'Official Cover Page'}
              </span>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              FULL REPORT NARRATIVE: Complete Sections & Tables rendered
             ══════════════════════════════════════════════════════════════ */}
          <section className="bg-card border border-line rounded-2xl p-6 sm:p-8 print:p-0 print:border-none print:shadow-none print:rounded-none shadow-sm">
            <table className="w-full border-collapse border-none m-0 p-0 print-pages-table">
              <thead className="hidden print:table-header-group">
                <tr>
                  <th style={{ height: '14mm', border: 'none', padding: 0 }} />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-0 border-none print:px-[16mm] align-top space-y-6">
                    <AcademicMarkdownView content={currentReport.customNarrative} />

                    {/* Executive Vector Analytics & Performance Charts Dashboard */}
                    <PeriodicAnalyticsCharts isReportAr={isReportAr} />

                    {/* Official Supervisory Endorsement Block at the end of report */}
                    <div
                      id="periodic-endorsement-block"
                      className="mt-6 pt-4 border-t-2 border-line/80 p-4 bg-bg border border-line rounded-xl text-start print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/50 print:p-4 shadow-2xs endorsement-box-print break-inside-avoid"
                    >
                      <div className="text-center font-black text-xs sm:text-sm text-ink mb-4 pb-1 border-b border-line/60">
                        {isReportAr ? 'مصادقة واعتماد التقرير الميداني الرسمي' : 'Official Supervisory Endorsements'}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center text-xs">
                        {/* Trainee Signature */}
                        <div className="space-y-1">
                          <div className="font-bold text-sub text-[11px]">
                            {isReportAr ? 'توقيع المتدرب' : 'Trainee Signature'}
                          </div>
                          {/* Student Name preserved in Arabic */}
                          <div className="font-black text-ink">{normalizeStudentName(profile.studentName) || '—'}</div>
                          <div className="h-10 border-b border-dashed border-line/80 print:h-8" />
                        </div>

                        {/* Field Supervisor */}
                        <div className="space-y-1">
                          <div className="font-bold text-sub text-[11px]">
                            {isReportAr ? 'المشرف الميداني (جهة التدريب)' : 'Field Supervisor'}
                          </div>
                          {/* Field Supervisor Name preserved in Arabic */}
                          <div className="font-black text-ink">{profile.responsibleName || '—'}</div>
                          <div className="h-10 border-b border-dashed border-line/80 print:h-8" />
                        </div>

                        {/* Academic Supervisor */}
                        <div className="space-y-1">
                          <div className="font-bold text-sub text-[11px]">
                            {isReportAr ? 'مشرف التدريب (الجامعة)' : 'Academic Supervisor'}
                          </div>
                          {/* Academic Supervisor Name preserved in Arabic */}
                          <div className="font-black text-ink">{profile.supervisorName || '—'}</div>
                          <div className="h-10 border-b border-dashed border-line/80 print:h-8" />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot className="hidden print:table-footer-group">
                <tr>
                  <th style={{ height: '14mm', border: 'none', padding: 0 }} />
                </tr>
              </tfoot>
            </table>
          </section>

        </div>
      </div>
    </div>
  );
};
