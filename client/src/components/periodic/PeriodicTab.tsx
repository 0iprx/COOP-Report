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

const STORAGE_KEY_FTTH = 'coop_ftth_periodic_report_v3';

// Default initial FTTH Report supplied by the user
const DEFAULT_FTTH_REPORT: FreshPeriodicReport = {
  title: 'التقرير الأسبوعي للتدريب التعاوني',
  majorField: 'FTTH – Fiber to the Home',
  department: 'Technical Support / FTTH Operations',
  roleAssignment: 'متدرب وموظف فعلي كـ FTTH',
  periodCoverage: 'من 20/9 إلى 7/10',
  stageOneHours: 'من 8:30 صباحًا إلى 6:00 مساءً',
  stageTwoHours: 'Shift B من 2:00 مساءً إلى 10:00 مساءً',
  intervals: [
    {
      id: 'int_1',
      label: 'المرحلة الأولى: بداية العمل والتعرف على التذاكر',
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
      label: 'المرحلة الثالثة: استقلالية وتغطية الشفت (Shift B)',
      startDate: '4/10',
      endDate: '7/10',
      timeFrom: '14:00',
      timeTo: '22:00'
    }
  ],
  customNarrative: `# 1. مقدمة

خلال هذه الفترة من التدريب التعاوني تم الانتقال تدريجيًا من مرحلة التعرف على بيئة العمل وطبيعة المهام في قسم **FTTH** إلى مرحلة التطبيق العملي والتعامل مع التذاكر والحالات الفعلية.

تركز التدريب على فهم خدمات الألياف الضوئية، والتعرف على أنواع أجهزة **ONT**، وقراءة مستويات الإشارة الضوئية **RX**، وفهم الـ **CVLAN** والخدمات المرتبطة بها، بالإضافة إلى التعرف على الأنظمة والأدوات المستخدمة في بيئة العمل، مثل **Huawei NCE وMOSS وACS**.

كما تم التدريب على كيفية تحليل أنواع مختلفة من الأعطال، وتحديد خطوات التحقق المناسبة لكل حالة، ومعرفة متى تتم معالجة التذكرة داخليًا ومتى يتم تصعيدها إلى جهة أخرى مثل **FOPS** أو **Call Center** أو طلب إرسال فني للموقع.

ومع استمرار التدريب والتطبيق العملي، تطور مستوى التعامل مع التذاكر من مرحلة التعلم والمتابعة إلى مرحلة تنفيذ الـ **Handle** والتعامل مع الحالات بدرجة أكبر من الاستقلالية، وصولًا إلى القدرة على التعامل مع الشفت بشكل فعلي.

---

# 2. التسلسل الزمني للتدريب

## 20/9 – الاستئذان

**الحضور:** لم يتم الحضور.
**السبب:** وعكة صحية.
**الإجراء:** تم تقديم طلب استئذان، وتمت الموافقة عليه من الجهة المسؤولة.

---

# 3. الفترة من 21/9 إلى 22/9

**وقت الدوام:** 8:30 صباحًا – 6:00 مساءً

مثلت هذه الفترة بداية العمل الفعلي والتعرف على طبيعة مهام موظف **FTTH**، حيث تم الانتقال إلى بيئة العمل والتعرف على أنواع التذاكر وآلية التعامل معها.

في البداية تم التعرف على أبرز أنواع المشاكل والتذاكر التي يتم التعامل معها، بالإضافة إلى خطوات التحقق الأساسية لكل نوع.

## 3.1 Frequency Disconnections

وهي الحالات التي يعاني فيها المشترك من **تقطيع متكرر أو انقطاع متقطع في الخدمة**.

تم التعرف على طريقة التحقق من مستوى وتكرار التقطيع من خلال نظام **MOSS**، وذلك للمساعدة في تحديد حالة الخدمة ومعرفة ما إذا كانت المشكلة متكررة وتحتاج إلى إجراء إضافي.

---

## 3.2 Link Down

تم التعرف على حالات **Link Down**، وهي الحالات التي يكون فيها اتصال الخدمة متوقفًا أو غير قائم.

عند التعامل مع الحالة، يتم إجراء مجموعة من الفحوصات على الـ ONT، ومنها:

* التحقق من قراءة الـ MAC Address.
* التحقق من مستوى RX.
* التحقق من حالة الاتصال.
* التأكد من وجود الـ VLANs المطلوبة.
* التحقق من ACS.
* التحقق من Wi-Fi.
* التحقق من Voice.
* مراجعة حالة الخدمات المرتبطة بالـ ONT.

وفي حال كانت المؤشرات تشير إلى وجود مشكلة في الطاقة أو الألياف، مثل **Power Failure** أو **Fiber Issue**، يتم اتخاذ الإجراء المناسب وطلب إرسال فني عند الحاجة.

---

## 3.3 Slowness

وهي حالات **بطء سرعة الإنترنت**.

تم التعرف على خطوات التعامل مع هذه الحالات، خصوصًا في الحالات التي يكون فيها الـ Provider والـ Seeker مرتبطين بخدمة ITC.

وتبدأ عملية التحقق عادةً من:

1. التحقق من مستوى RX.
2. التأكد من أن مستوى الإشارة ضمن النطاق المقبول.
3. إجراء Speed Test.
4. تحليل نتيجة اختبار السرعة.
5. في حال كانت السرعة طبيعية ولا توجد مشكلة فنية واضحة، يتم تحويل التذكرة إلى Call Center بعد كتابة Comment يوضح نتائج الفحص.
6. في حال وجود مشكلة فنية، يتم تصعيد الحالة إلى الجهة المختصة مثل FOPS للتحقق منها.

---

## 3.4 Port Blocked

تم التعرف كذلك على حالات **Port Blocked**، والتي تتعلق بوجود منفذ أو أكثر في حالة تعطيل أو Blocked.

تم التعرف على أهمية التحقق من حالة المنفذ وتحديد ما إذا كان الخلل مرتبطًا بالخدمة أو بالإعدادات، ثم اتخاذ الإجراء المناسب حسب الحالة.

---

# 4. التعرف على أجهزة ONT

من أهم الجوانب التي تم تعلمها خلال هذه المرحلة هو التعرف على أجهزة **ONT – Optical Network Terminal**.

الـ ONT هو الجهاز الموجود لدى المشترك والذي يستقبل الخدمة عبر شبكة الألياف الضوئية، ويعمل كواجهة أساسية لتقديم الخدمات للمستخدم مثل الإنترنت والهاتف، بالإضافة إلى بعض وظائف الشبكة المنزلية حسب نوع الجهاز.

تم التعرف بشكل أساسي على نوعين:

### Light ONT
وهو النوع الأساسي من أجهزة ONT، وتم التعرف على كيفية تمييزه والتعامل معه من خلال الأنظمة المستخدمة.

### Advanced ONT
وهو نوع يوفر إمكانيات وخدمات إضافية، ويتم التعامل معه حسب نوع الجهاز والخدمات المرتبطة به.

---

# 5. أنواع ONT حسب الأنظمة والشركات

تم خلال التدريب التعرف على اختلاف أجهزة ONT حسب الشركة المصنعة وطريقة تصنيفها داخل النظام.

## Huawei NCE
تم التعرف على:
* Light ONT.
* Advanced ONT.
* طريقة التمييز بين الأنواع من خلال Last Name.
* H5 ضمن تصنيفات Light ONT.
* ELS ضمن تصنيفات Advanced ONT.

---

## Nokia
تم التعرف على تصنيفات أجهزة Nokia، ومنها:

### Light ONT
* Equipped Type.
* Last Name:
  * F
  * E

### Advanced ONT
* Last Name:
  * B
  * K

---

## ZTE
تم كذلك التعرف على أجهزة **ZTE** والتعامل معها ضمن بيئة FTTH، مع فهم اختلاف أنواع الأجهزة وطرق التحقق منها.

---

# 6. مستوى RX

من أهم المعلومات الفنية التي تم اكتسابها خلال التدريب هو فهم مستوى **RX Power** وأهميته في تشخيص بعض المشاكل.

تم التعرف على أن نطاق مستوى RX الذي تم الاعتماد عليه أثناء الفحص كان تقريبًا:

**من -10 dBm إلى -26 dBm**

ويعتبر فحص RX من الخطوات المهمة عند التعامل مع عدد من الحالات، خصوصًا:
* Slowness.
* Link Down.
* مشاكل الاتصال.
* بعض حالات التقطيع.

ويساعد هذا الفحص في إعطاء مؤشر أولي عن جودة الإشارة الضوئية ومعرفة ما إذا كانت هناك مشكلة واضحة في مستوى الاستقبال.

---

# 7. التعرف على CVLAN والخدمات

تم خلال التدريب التعرف على مفهوم **CVLAN** وعلاقتها بالخدمات المختلفة التي يتم تقديمها من خلال شبكة FTTH.

ومن أبرز القيم التي تم التعرف عليها:

| CVLAN | الخدمة | الاستخدام |
| ----- | ---------------- | ---------------------------------------------- |
| 1501 | HSI | خدمة الإنترنت |
| 3980 | ACS / Management | الإدارة والتهيئة وبعض الوظائف المرتبطة بالخدمة |
| 1810 | Voice | خدمة الهاتف الصوتي |

وساعد فهم هذه القيم على تحسين القدرة على تحليل حالة الخدمة والتأكد من ارتباط الخدمات المطلوبة بالـ ONT.

---

# 8. التعرف على الأنظمة والأدوات

## Huawei NCE
تم التعرف على استخدام **Huawei NCE** للوصول إلى المعلومات الفنية المتعلقة بأجهزة ONT، والتعرف على أنواع الأجهزة وبعض بيانات الخدمة والحالة.

---

## MOSS
تم التعرف على استخدام **MOSS** في فحص ومتابعة حالات التقطيع، خصوصًا **Frequency Disconnections**، وذلك للمساعدة في معرفة مستوى وتكرار المشكلة.

---

## ACS
تم التعرف على دور **ACS** في الإدارة والتهيئة المرتبطة بأجهزة ONT والخدمات، بالإضافة إلى بعض عمليات Management وConfiguration.

---

## FOPS
تم التعرف على آلية تصعيد الحالات التي تحتاج إلى فحص أو معالجة من جهة فنية مختصة.

---

## Call Center
تم التعرف على الحالات التي يتم فيها تحويل التذكرة إلى Call Center، خصوصًا عندما تظهر نتائج الفحص أن الخدمة تعمل بصورة طبيعية ولا توجد مشكلة فنية واضحة، مع أهمية كتابة Comment واضح يوضح جميع خطوات التحقق ونتائجها.

---

# 9. فهم مكونات شبكة FTTH

لم يقتصر التدريب على التعامل مع التذاكر، بل تم التعرف على مجموعة من المفاهيم والمكونات المرتبطة بشبكة FTTH.

## ONT – Optical Network Terminal
هو الجهاز الموجود لدى المشترك والذي يستقبل الإشارة الضوئية القادمة من شبكة الألياف ويتيح تقديم الخدمات للمشترك.

---

## ODB – Optical Distribution Box
هو أحد مكونات شبكة الألياف الضوئية، ويستخدم في تنظيم وتوزيع وربط الألياف ضمن شبكة التوزيع.

---

## HGU – Home Gateway Unit
هو جهاز بوابة منزلية يمكن أن يجمع وظائف الاتصال والخدمات المنزلية، مثل الإنترنت والـ Wi-Fi والصوت، حسب نوع الجهاز والخدمة المقدمة.

---

## Provider وSeeker
تم التعرف على مفهومي **Provider** و**Seeker** ضمن بيئة العمل وطريقة ارتباطهما بالخدمة والتذكرة، وأهميتهما عند تحديد مسار التعامل مع بعض الحالات.

---

# 10. منهجية التعامل مع التذاكر

من أهم المهارات التي تم اكتسابها خلال التدريب هي الانتقال من التعامل مع التذكرة بشكل عشوائي إلى اتباع منهجية واضحة في التشخيص.

أصبحت خطوات التعامل مع التذكرة تعتمد على:

### الخطوة الأولى
قراءة التذكرة وفهم المشكلة الأساسية.

### الخطوة الثانية
تحديد نوع المشكلة:
* Slowness
* Link Down
* Frequency Disconnections
* Port Blocked

### الخطوة الثالثة
التحقق من بيانات الخدمة والـ ONT.

### الخطوة الرابعة
فحص مستوى RX.

### الخطوة الخامسة
التحقق من MAC Address.

### الخطوة السادسة
التحقق من VLANs والخدمات المرتبطة.

### الخطوة السابعة
فحص ACS وWi-Fi وVoice عند الحاجة.

### الخطوة الثامنة
إجراء Speed Test في الحالات التي تتطلب ذلك.

### الخطوة التاسعة
تحليل نتائج الفحص وتحديد سبب المشكلة المحتمل.

### الخطوة العاشرة
تحديد الإجراء المناسب:
* معالجة التذكرة.
* كتابة Comment.
* تحويلها إلى Call Center.
* تصعيدها إلى FOPS.
* طلب إرسال فني.
* الاستمرار في متابعة الحالة.

هذه المنهجية ساعدت على رفع سرعة ودقة التعامل مع التذاكر.

---

# 11. الفترة من 27/9 إلى 1/10

**نظام الدوام:** Shift B
**وقت الحضور اليومي:** 2:00 مساءً
**وقت الانصراف اليومي:** 10:00 مساءً
**إجمالي ساعات العمل اليومية:** 8 ساعات
**إجمالي ساعات التواجد خلال الفترة:** 40 ساعة

مثلت هذه الفترة مرحلة متقدمة في التدريب، حيث لم يعد التركيز على التعرف على المعلومات فقط، وإنما بدأ تطبيقها بشكل عملي والتعامل مع التذاكر بصورة أكثر استقلالية.

---

## 27/9
**الحضور:** 2:00 مساءً | **الانصراف:** 10:00 مساءً | **ساعات التواجد:** 8 ساعات

تم التعمق في أنواع التذاكر التي تم التعرف عليها سابقًا، مع التركيز على طريقة تحليل كل حالة وتحديد خطوات التحقق المناسبة.
تمت مراجعة حالات:
* Slowness.
* Link Down.
* Frequency Disconnections.
* Port Blocked.

كما تم تطبيق خطوات فحص الـ ONT ومستوى RX وMAC Address وVLANs والخدمات المرتبطة.

---

## 28/9
**الحضور:** 2:00 مساءً | **الانصراف:** 10:00 مساءً | **ساعات التواجد:** 8 ساعات

تم التركيز على الجانب الفني لأجهزة ONT والتعمق في الفرق بين Light ONT وAdvanced ONT، بالإضافة إلى التعرف بشكل أكبر على تصنيفات الأجهزة داخل الأنظمة.
كما تمت مراجعة وفحص: RX, MAC Address, VLAN, ACS, Wi-Fi, Voice.
وتم تطبيق هذه المعلومات على الحالات العملية لفهم العلاقة بين البيانات الفنية ونوع العطل.

---

## 29/9
**الحضور:** 2:00 مساءً | **الانصراف:** 10:00 مساءً | **ساعات التواجد:** 8 ساعات

تم التعمق في الـ Configuration والخدمات المرتبطة بالـ ONT، بالإضافة إلى مراجعة الـ CVLANs والخدمات المرتبطة بها (CVLAN 1501 – HSI, CVLAN 3980 – ACS/Management, CVLAN 1810 – Voice).
كما تم تطبيق هذه المعلومات أثناء التعامل مع التذاكر وتحليل الحالات قبل اتخاذ الإجراء المناسب.

---

## 30/9
**الحضور:** 2:00 مساءً | **الانصراف:** 10:00 مساءً | **ساعات التواجد:** 8 ساعات

تم الانتقال إلى مستوى أكثر تقدمًا في التعامل مع التذاكر، حيث بدأ تنفيذ **Handle للتذاكر** ومتابعتها وفق الإجراءات المعتمدة (قراءة التذكرة، فهم المشكلة، تحديد نوع العطل، إجراء الفحوصات، تحليل النتائج، اتخاذ الإجراء، كتابة Comment، تصعيد الحالات، متابعة التذكرة).
وأصبح التعامل مع الحالات أكثر استقلالية مقارنة بالمراحل الأولى من التدريب.

---

## 1/10
**الحضور:** 2:00 مساءً | **الانصراف:** 10:00 مساءً | **ساعات التواجد:** 8 ساعات

تم الاستمرار في التطبيق العملي والتعامل مع التذاكر بصورة أكثر استقلالية، مع الاعتماد على التحليل الشخصي للحالة وتحديد خطوات الفحص والإجراء المناسب، ومعرفة الحالات التي تحتاج Call Center أو FOPS أو إرسال فني.
وفي نهاية هذه المرحلة أصبح التعامل مع التذاكر أكثر سرعة وتنظيمًا.

---

# 12. الفترة من 4/10 إلى 7/10

**نظام الدوام:** Shift B
**وقت الحضور:** 2:00 مساءً
**وقت الانصراف:** 10:00 مساءً
**إجمالي ساعات العمل اليومية:** 8 ساعات
**إجمالي ساعات التواجد خلال الفترة:** 32 ساعة

تمثل هذه الفترة مرحلة متقدمة من التدريب، حيث تم الاستمرار في تطبيق جميع المعارف السابقة، مع التركيز بصورة أكبر على **الاعتماد على النفس في التعامل مع التذاكر والعمل ضمن الشفت**.

---

## 4/10
**الحضور:** 2:00 مساءً | **الانصراف:** 10:00 مساءً | **ساعات التواجد:** 8 ساعات
استمر التعامل مع التذاكر وتطبيق خطوات التشخيص وسرعة تحديد نوع المشكلة والفحوصات المطلوبة وتنفيذ الـ Handle.

---

## 5/10
**الحضور:** 2:00 مساءً | **الانصراف:** 10:00 مساءً | **ساعات التواجد:** 8 ساعات
التعامل مع حالات مختلفة وتطبيق خطوات التحقق من الـ ONT والـ RX والـ VLANs والخدمات المرتبطة، وتعزيز القدرة على تحديد التصعيد.

---

## 6/10
**الحضور:** 2:00 مساءً | **الانصراف:** 10:00 مساءً | **ساعات التواجد:** 8 ساعات
استمر التطبيق العملي مع زيادة مستوى الاستقلالية ومتابعة التذكرة وتوثيق الإجراءات والنتائج عبر الـ Comments.

---

## 7/10
**الحضور:** 2:00 مساءً | **الانصراف:** 10:00 مساءً | **ساعات التواجد:** 8 ساعات
العمل ضمن الشفت والتعامل مع التذاكر بصورة مستقلة، وتطبيق جميع المهارات المكتسبة من فهم المشكلة والفحص وحتى اتخاذ الإجراء.
شكل هذا اليوم مرحلة هامة في الانتقال من متدرب يحتاج توجيهًا مستمرًا إلى موظف مستقل في مهام FTTH.

---

# 13. ملخص ساعات الحضور

| التاريخ | وقت الحضور | وقت الانصراف | إجمالي الساعات | المرحلة |
| ------- | ---------: | -----------: | -------------: | ------------------------------- |
| 20/9 | — | — | — | استئذان |
| 21/9 | 8:30 ص | 6:00 م | 9.5 ساعات | بداية العمل والتعرف على التذاكر |
| 22/9 | 8:30 ص | 6:00 م | 9.5 ساعات | تطبيق أساسيات التشخيص |
| 27/9 | 2:00 م | 10:00 م | 8 ساعات | تعمق وتطبيق |
| 28/9 | 2:00 م | 10:00 م | 8 ساعات | ONT والأنظمة |
| 29/9 | 2:00 م | 10:00 م | 8 ساعات | Configuration وCVLAN |
| 30/9 | 2:00 م | 10:00 م | 8 ساعات | Handle للتذاكر |
| 1/10 | 2:00 م | 10:00 م | 8 ساعات | تعامل أكثر استقلالية |
| 4/10 | 2:00 م | 10:00 م | 8 ساعات | تطبيق عملي |
| 5/10 | 2:00 م | 10:00 م | 8 ساعات | تشخيص وتصعيد |
| 6/10 | 2:00 م | 10:00 م | 8 ساعات | متابعة التذاكر |
| 7/10 | 2:00 م | 10:00 م | 8 ساعات | تعامل مستقل مع الشفت |

**إجمالي التواجد المحتسب وفق الساعات المذكورة: 113 ساعة تقريبًا، مع احتساب 20/9 كاستئذان وعدم احتساب وقت الاستراحة إن وجد.**

---

# 14. أهم المعارف الفنية المكتسبة

خلال هذه الفترة تم اكتساب معرفة عملية في مجموعة من المجالات، أهمها:

### خدمات FTTH
فهم طبيعة خدمات الألياف الضوئية وآلية تقديم الخدمة للمشترك.

### ONT
التعرف على وظيفة الـ ONT وأنواعه والاختلاف بين Light وAdvanced ONT.

### RX
فهم أهمية مستوى الإشارة الضوئية واستخدامه كجزء أساسي من خطوات التشخيص.

### VLAN / CVLAN
التعرف على الخدمات المرتبطة بالـ CVLAN وفهم دورها في تحديد الخدمات.

### Configuration
التعرف على الإعدادات والتهيئة المرتبطة بالخدمة والـ ONT.

### Ticket Handling
التعامل مع التذاكر من مرحلة القراءة والتحليل إلى الفحص والتوثيق والتصعيد والمتابعة.

### Troubleshooting
تطوير منهجية عملية لتحديد سبب المشكلة بدلًا من التعامل معها بشكل عشوائي.

---

# 15. أهم المهارات العملية المكتسبة

بنهاية الفترة أصبح بالإمكان:

1. قراءة التذكرة وفهم المشكلة الأساسية.
2. تصنيف نوع العطل.
3. تحديد خطوات التحقق المناسبة.
4. فحص الـ ONT.
5. التحقق من MAC Address.
6. قراءة مستوى RX.
7. التحقق من الـ VLANs.
8. التحقق من ACS وWi-Fi وVoice.
9. إجراء Speed Test.
10. تحليل نتيجة الفحص.
11. كتابة Comment واضح.
12. عمل Handle للتذكرة.
13. تصعيد الحالة إلى الجهة المختصة.
14. تحديد الحالات التي تتطلب Call Center.
15. تحديد الحالات التي تحتاج إلى FOPS.
16. تحديد الحالات التي تستوجب إرسال فني.
17. العمل ضمن نظام الشفت.
18. التعامل مع التذاكر بدرجة متقدمة من الاستقلالية.

---

# 16. الصعوبات التي تمت مواجهتها وكيف تم التغلب عليها

في بداية التدريب ظهرت بعض الصعوبات الطبيعية المرتبطة بالانتقال من المعرفة النظرية إلى بيئة العمل الفعلية، ومن أبرزها كثرة المصطلحات الفنية وتعدد أنواع التذاكر واختلاف طريقة التعامل مع الأعطال. ومع تكرار الحالات والممارسة اليومية، أصبح فهم التذاكر أسرع، كما أصبح من الأسهل ربط الأعراض بنتائج الفحوصات والإجراء المطلوب.

---

# 17. التطور المهني خلال الفترة

أحد أهم نتائج هذه الفترة هو التطور الواضح في مستوى الاستقلالية، من مرحلة التعرف والملاحظة والتوجيه المباشر إلى مرحلة قراءة التذكرة وتحليل المشكلة وتنفيذ الفحص واتخاذ القرار وإجراء الـ Handle والمتابعة المستقلة.

---

# 18. التقييم الذاتي للفترة

ساهمت هذه الفترة بشكل كبير في تطوير قدرتي على التعامل مع بيئة العمل المهنية في مجال الدعم الفني وشبكات الألياف الضوئية، والاعتماد على خطوات تشخيص منظمة وتوثيق العمل وتحمل مسؤولية التذكرة.

---

# 19. الخلاصة النهائية

كانت هذه الفترة مرحلة مهمة جدًا في التدريب التعاوني، حيث بدأت بالتعرف على بيئة العمل وأنواع التذاكر الأساسية، ثم انتقلت تدريجيًا إلى فهم الجوانب الفنية المرتبطة بخدمات FTTH وأجهزة ONT والـ RX والـ VLANs والأنظمة المستخدمة.
وساعد العمل ضمن Shift B (من الساعة 2:00 مساءً وحتى 10:00 مساءً) على اكتساب خبرة عملية حقيقية في بيئة العمل والالتزام بالشفت وتحمل مسؤولية التذاكر.
وفي نهاية الفترة أصبح بالإمكان التعامل مع التذاكر بدرجة متقدمة من الاستقلالية وصولاً إلى القدرة على التعامل مع شفت كامل بصورة عملية واحترافية.`
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

  // Standalone fresh periodic report (Initialized with FTTH report)
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
          ? 'هل تريد استعادة نموذج تقرير FTTH الافتراضي وتحديث الحقول؟'
          : 'Restore default FTTH report template?'
      )
    ) {
      setReport(DEFAULT_FTTH_REPORT);
      localStorage.removeItem(STORAGE_KEY_FTTH);
      setSaveToast(t('تم استعادة تقرير FTTH بنجاح!', 'FTTH Report restored!'));
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
                {t('التقرير الفتري للتدريب التعاوني (FTTH)', 'Periodic Co-op Report (FTTH)')}
              </h2>
              <p className="text-[11px] text-sub font-bold">
                {report.periodCoverage} • {report.roleAssignment}
              </p>
            </div>
          </div>

          {/* Action Buttons: Reset & Print/PDF */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3.5 py-1.5 rounded-xl bg-bg hover:bg-line border border-line text-xs font-bold text-ink flex items-center gap-1.5 transition-all shadow-2xs"
              title={t('استعادة التقرير الافتراضي', 'Reset / Reload Default FTTH')}
            >
              <RotateCcw className="w-3.5 h-3.5 text-accent" />
              <span>{t('استعادة التقرير', 'Reset / Reload')}</span>
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
                    <div className="text-[10px] text-sub font-bold">{report.department}</div>
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
                  {report.majorField} • {report.department}
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
                  <span className="font-bold text-sub">{isAr ? 'الفترة التي يغطيها التقرير:' : 'Coverage:'}</span>
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

              {/* Work Intervals Summary on Cover */}
              <div className="mt-4 p-3 bg-bg border border-line rounded-xl space-y-2 text-start print:border print:border-slate-300 print:rounded-xl print:bg-slate-50/40 print:p-2.5 shadow-2xs">
                <div className="flex items-center justify-between pb-1 border-b border-line/60">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-black text-ink">
                      {isAr ? 'نظام وتوزيع الفترات والورديات المعتمدة:' : 'Shift & Period Distribution:'}
                    </span>
                  </div>
                  <span className="text-[10px] text-accent font-black">
                    {isAr ? 'إجمالي: 113 ساعة تقريباً' : 'Total: ~113 hours'}
                  </span>
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
              <span>{isAr ? 'المملكة العربية السعودية — التقرير الفتري للتدريب التعاوني (FTTH)' : 'KSA — Periodic Co-op Training Report (FTTH)'}</span>
              <span className="font-black text-accent">{isAr ? 'الغلاف الرسمي' : 'Cover Page'}</span>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              FULL REPORT NARRATIVE: Complete 19 Sections rendered
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
