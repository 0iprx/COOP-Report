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
  Edit3
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import {
  PeriodicShiftInterval,
  FinalReportData,
  normalizeStudentName
} from '@coop/shared';
import { AcademicMarkdownView } from '../common/AcademicMarkdownView';

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

const STORAGE_KEY_FTTH = 'coop_ftth_periodic_report_v5';

// Master Comprehensive FTTH Report merging both technical depth and quantitative ticket analytics
const DEFAULT_FTTH_REPORT: FreshPeriodicReport = {
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

export const PeriodicTab: React.FC = () => {
  const { t, isAr } = useLanguage();
  const queryClient = useQueryClient();

  // Toast feedback
  const [saveToast, setSaveToast] = useState<string>('');
  const [errorToast, setErrorToast] = useState<string>('');

  // Logo file upload refs for Cover Page
  const institutionLogoInputRef = useRef<HTMLInputElement>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);

  // Standalone fresh periodic report (Initialized with FTTH Master report)
  const [report, setReport] = useState<FreshPeriodicReport>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FTTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.customNarrative) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_FTTH_REPORT;
  });

  // Auto-save draft so edits persist locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FTTH, JSON.stringify(report));
    } catch {
      // ignore
    }
  }, [report]);

  // Fetch student profile for institutional cover page (university name, logos, student ID)
  const { data: finalReportData } = useQuery<FinalReportData>({
    queryKey: ['finalReport'],
    queryFn: async () => {
      const res = await api.get('/reports/final');
      return res.data;
    }
  });

  const profile = finalReportData?.profile || ({} as any);
  const entityName = profile?.entityAddress || (isAr ? 'جهة التدريب التعاوني' : 'Training Organization');

  // Clear / Reset to default FTTH report
  const handleResetToDefault = () => {
    if (
      window.confirm(
        isAr
          ? 'هل تريد استعادة نموذج تقرير FTTH وتحديث الحقول بكامل البيانات الجديدة؟'
          : 'Restore default FTTH report template with full data?'
      )
    ) {
      setReport(DEFAULT_FTTH_REPORT);
      localStorage.removeItem(STORAGE_KEY_FTTH);
      setSaveToast(t('تم استعادة تقرير FTTH المحدّث بنجاح!', 'FTTH Report updated & restored!'));
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

  // Print PDF
  const handlePrintPDF = () => {
    window.print();
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
        
        {/* ── Clean Top Header: Only Title & Print ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-line no-print">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-accent-dim text-accent">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-ink">
                {t('تقرير التدريب التعاوني (قسم خدمات الألياف الضوئية FTTH)', 'Co-op Training Report (FTTH Operations)')}
              </h2>
              <p className="text-[11px] text-sub font-bold">
                {report.periodCoverage} • {report.roleAssignment} • إجمالي 244 تذكرة
              </p>
            </div>
          </div>

          {/* Action Buttons: Reset & Print/PDF */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3.5 py-1.5 rounded-xl bg-bg hover:bg-line border border-line text-xs font-bold text-ink flex items-center gap-1.5 transition-all shadow-2xs"
              title={t('استعادة النموذج المحدّث لتقرير FTTH', 'Reset / Reload Updated FTTH Report')}
            >
              <RotateCcw className="w-3.5 h-3.5 text-accent" />
              <span>{t('استعادة التقرير المحدّث', 'Reload FTTH')}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-4 py-1.5 text-xs font-bold text-white bg-ink hover:bg-ink/85 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title={t('طباعة التقرير الفتري أو حفظه كـ PDF رسمي', 'Print report or save as PDF')}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('طباعة / حفظ PDF', 'Print / Save PDF')}</span>
            </button>
          </div>
        </div>

        {/* ── Quick Editor Accordion (Hidden in Print: no-print) ───── */}
        <details className="no-print mb-8 p-4 bg-bg border border-line rounded-xl group">
          <summary className="text-xs font-black text-ink cursor-pointer list-none flex items-center justify-between select-none">
            <span className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-accent" />
              <span>{t('تعديل نصوص وبيانات التقرير الفتري (اضغط للإظهار / الإخفاء)', 'Edit Report Texts & Metadata')}</span>
            </span>
            <span className="text-[11px] text-sub font-bold group-open:rotate-180 transition-transform">▼</span>
          </summary>

          <div className="mt-4 space-y-4 pt-3 border-t border-line/60 text-xs">
            {/* Row 1: Titles & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-black text-sub mb-1">{t('عنوان التقرير:', 'Report Title:')}</label>
                <input
                  type="text"
                  value={report.title}
                  onChange={(e) => setReport({ ...report, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-sub mb-1">{t('مجال التدريب:', 'Field:')}</label>
                <input
                  type="text"
                  value={report.majorField}
                  onChange={(e) => setReport({ ...report, majorField: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-sub mb-1">{t('طبيعة العمل / القسم:', 'Department:')}</label>
                <input
                  type="text"
                  value={report.department}
                  onChange={(e) => setReport({ ...report, department: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-sub mb-1">{t('الصفة بالغلاف:', 'Role on Cover:')}</label>
                <input
                  type="text"
                  value={report.roleAssignment}
                  onChange={(e) => setReport({ ...report, roleAssignment: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-accent"
                />
              </div>
            </div>

            {/* Row 2: Coverage & Shifts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-black text-sub mb-1">{t('الفترة التي يغطيها التقرير:', 'Coverage:')}</label>
                <input
                  type="text"
                  value={report.periodCoverage}
                  onChange={(e) => setReport({ ...report, periodCoverage: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-sub mb-1">{t('دوام المرحلة الأولى:', 'Stage 1 Hours:')}</label>
                <input
                  type="text"
                  value={report.stageOneHours}
                  onChange={(e) => setReport({ ...report, stageOneHours: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-sub mb-1">{t('دوام المرحلة الثانية:', 'Stage 2 Hours:')}</label>
                <input
                  type="text"
                  value={report.stageTwoHours}
                  onChange={(e) => setReport({ ...report, stageTwoHours: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-card border border-line rounded-lg font-bold text-ink"
                />
              </div>
            </div>

            {/* Markdown Narrative Textarea */}
            <div>
              <label className="block text-[11px] font-black text-sub mb-1">{t('محتوى وسرد التقرير بالكامل (Markdown):', 'Report Markdown Content:')}</label>
              <textarea
                value={report.customNarrative}
                onChange={(e) => setReport({ ...report, customNarrative: e.target.value })}
                rows={12}
                className="w-full p-3 bg-card border border-line rounded-xl text-xs text-ink font-mono leading-relaxed"
              />
            </div>
          </div>
        </details>

        {/* ── Printable Paper View: #periodic-paper-view ───────────── */}
        <div id="periodic-paper-view" className="space-y-6">

          {/* ══════════════════════════════════════════════════════════════
              PAGE 1: Official Institutional Cover Page
             ══════════════════════════════════════════════════════════════ */}
          <section
            id="periodic-cover-page"
            className="bg-card border border-line rounded-2xl p-6 sm:p-8 print:p-0 print:border-none print:shadow-none print:rounded-none min-h-[620px] print:min-h-[265mm] flex flex-col justify-between"
          >
            <div>
              {/* Header: Kingdom Header & Dual Logos */}
              <div className="flex items-center justify-between pb-4 border-b border-line gap-4">
                {/* Right: Institution Info / Logo */}
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

              {/* Main Report Title Banner */}
              <div className="text-center py-4 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-black bg-accent text-white shadow-2xs">
                  <span>{report.periodCoverage}</span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-ink tracking-tight pt-1">
                  {report.title}
                </h1>
                <p className="text-xs text-sub font-bold">
                  {report.department}
                </p>
              </div>

              {/* Trainee & Period Information Matrix on Cover */}
              <div className="bg-bg border border-line rounded-xl p-3 sm:p-4 text-start grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs trainee-matrix-print print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/60 print:p-3 print:gap-x-4 print:gap-y-2">
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'اسم المتدرب:' : 'Trainee Name:'}</span>
                  <span className="font-black text-ink">{normalizeStudentName(profile.studentName) || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'الرقم الأكاديمي:' : 'Student ID:'}</span>
                  <span className="font-black text-ink">{profile.trainingNumber || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'مجال التدريب:' : 'Field:'}</span>
                  <span className="font-black text-ink">{report.majorField}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'طبيعة العمل:' : 'Nature of Work:'}</span>
                  <span className="font-black text-ink">{report.department}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'المشرف الميداني:' : 'Field Supervisor:'}</span>
                  <span className="font-black text-ink">{profile.responsibleName || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 pb-1">
                  <span className="font-bold text-sub">{isAr ? 'الفترة المشمولة بالتقرير:' : 'Coverage:'}</span>
                  <span className="font-black text-accent">{report.periodCoverage}</span>
                </div>
                
                {/* Specific Role Highlight requested by user: "اسم الفترة متدرب وموظف فعلي ك FTTH" */}
                <div className="sm:col-span-2 flex items-center justify-between bg-accent-dim/40 border border-accent/20 rounded-lg p-2 print:border-slate-300 print:bg-slate-100">
                  <span className="font-black text-ink">{isAr ? 'الصفة ونطاق التكليف بالفترة:' : 'Role Assignment:'}</span>
                  <span className="font-black text-accent text-[12px] print:text-slate-900">{report.roleAssignment}</span>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-bold text-sub">{isAr ? 'دوام المرحلة الأولى:' : 'Stage 1:'}</span>
                  <span className="font-bold text-ink">{report.stageOneHours}</span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-bold text-sub">{isAr ? 'دوام المرحلة الثانية:' : 'Stage 2:'}</span>
                  <span className="font-bold text-ink">{report.stageTwoHours}</span>
                </div>
              </div>

              {/* Work Intervals Summary & Total Metric on Cover */}
              <div className="mt-4 p-3 bg-bg border border-line rounded-xl space-y-2 text-start print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/40 print:p-2.5 shadow-2xs">
                <div className="flex items-center justify-between pb-1 border-b border-line/60">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-black text-ink">
                      {isAr ? 'نظام وتوزيع الفترات والورديات المعتمدة:' : 'Shift & Period Distribution:'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {isAr ? '244 تذكرة فريدة معالجة' : '244 Handled Tickets'}
                    </span>
                    <span className="text-[10px] text-accent font-black">
                      {isAr ? '91 - 113 ساعة معتمدة' : '~91-113 Hours'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {report.intervals.map((int, idx) => (
                    <div key={int.id || idx} className="p-2 bg-card border border-line rounded-lg print:border-slate-300">
                      <div className="font-black text-ink text-[11px] mb-1">{int.label}</div>
                      <div className="text-[10px] text-sub font-bold flex items-center justify-between">
                        <span>من {int.startDate} إلى {int.endDate}</span>
                        <span className="font-black text-accent">{int.timeFrom} - {int.timeTo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Academic Page 1 Footer */}
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[10px] text-sub font-bold">
              <span>{isAr ? 'المملكة العربية السعودية — تقرير التدريب التعاوني (خدمات الألياف الضوئية FTTH)' : 'KSA — Co-op Training Report (FTTH Operations)'}</span>
              <span className="font-black text-accent">{isAr ? 'الغلاف الرسمي المعتمد' : 'Official Cover Page'}</span>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              FULL REPORT NARRATIVE: Complete Sections & Tables rendered
             ══════════════════════════════════════════════════════════════ */}
          <section className="bg-card border border-line rounded-2xl p-6 sm:p-8 print:p-0 print:border-none print:shadow-none print:rounded-none shadow-sm space-y-6">
            <AcademicMarkdownView content={report.customNarrative} />

            {/* Official Supervisory Endorsement Block at the end of report */}
            <div className="mt-8 pt-4 border-t-2 border-line/80 p-4 bg-bg border border-line rounded-xl text-start print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/50 print:p-4 shadow-2xs break-inside-avoid">
              <div className="text-center font-black text-xs sm:text-sm text-ink mb-4 pb-1 border-b border-line/60">
                {isAr ? 'مصادقة واعتماد التقرير الميداني الرسمي' : 'Official Supervisory Endorsements'}
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                {/* Trainee Signature */}
                <div className="space-y-1">
                  <div className="font-bold text-sub text-[11px]">{isAr ? 'توقيع المتدرب' : 'Trainee Signature'}</div>
                  <div className="font-black text-ink">{normalizeStudentName(profile.studentName) || '—'}</div>
                  <div className="h-10 border-b border-dashed border-line/80 print:h-8" />
                </div>

                {/* Field Supervisor */}
                <div className="space-y-1">
                  <div className="font-bold text-sub text-[11px]">{isAr ? 'المشرف الميداني (جهة التدريب)' : 'Field Supervisor'}</div>
                  <div className="font-black text-ink">{profile.responsibleName || '—'}</div>
                  <div className="h-10 border-b border-dashed border-line/80 print:h-8" />
                </div>

                {/* Academic Supervisor */}
                <div className="space-y-1">
                  <div className="font-bold text-sub text-[11px]">{isAr ? 'مشرف التدريب (الجامعة)' : 'Academic Supervisor'}</div>
                  <div className="font-black text-ink">{profile.supervisorName || '—'}</div>
                  <div className="h-10 border-b border-dashed border-line/80 print:h-8" />
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
