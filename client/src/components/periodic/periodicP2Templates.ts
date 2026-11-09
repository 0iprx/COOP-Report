import { PeriodicShiftInterval } from '@coop/shared';

export interface FreshPeriodicReport {
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

// ── Master Arabic Report for Period 2 (Oct 11 – Nov 05) ───────────────
export const DEFAULT_REPORT_P2_AR: FreshPeriodicReport = {
  title: 'تقرير التدريب التعاوني (التقرير الفتري الثاني)',
  majorField: 'FTTH Operations & Transport Networks (خدمات الألياف الضوئية وشبكات النقل)',
  department: 'قسم خدمات الألياف FTTH وقسم شبكات النقل والتراسل (Transport Operations)',
  roleAssignment: 'موظف فعلي في FTTH (الأسابيع 7-8) ومتدرب في شبكات الترانزبورت (الأسابيع 9-10)',
  periodCoverage: 'من 11/10 إلى 5/11',
  stageOneHours: 'شفتات FTTH متناوبة: 2:00 م – 10:00 م، و 4:00 م – 12:00 م، و 10:00 م – 6:00 ص',
  stageTwoHours: 'شفتات Transport: 4:00 م – 12:00 م، و 6:00 م – 2:00 ص، وصباحي 10:30 ص – 6:00 م',
  intervals: [
    {
      id: 'int_p2_1',
      label: 'المرحلة الأولى: إدارة وتغطية شفتات FTTH المتناوبة كموظف فعلي',
      startDate: '11/10',
      endDate: '14/10',
      timeFrom: '14:00',
      timeTo: '22:00'
    },
    {
      id: 'int_p2_2',
      label: 'المرحلة الثانية: إدارة ذروة التذاكر (97 تذكرة) وشفتات المساء والليل',
      startDate: '18/10',
      endDate: '21/10',
      timeFrom: '16:00',
      timeTo: '00:00'
    },
    {
      id: 'int_p2_3',
      label: 'المرحلة الثالثة: الانتقال لقسم شبكات النقل والورديات الليلية (Transport)',
      startDate: '27/10',
      endDate: '29/10',
      timeFrom: '18:00',
      timeTo: '02:00'
    },
    {
      id: 'int_p2_4',
      label: 'المرحلة الرابعة: تشخيص إنذارات التراسل واختبارات الحماية للشبكة الناقلة',
      startDate: '3/11',
      endDate: '5/11',
      timeFrom: '10:30',
      timeTo: '18:00'
    }
  ],
  customNarrative: `# مقدمة التقرير الفتري الثاني

يغطي هذا التقرير الفتري الثاني مرحلة مفصلية ومتقدمة من مسيرة التدريب التعاوني تمتد عبر أربعة أسابيع تدريبية كاملة من **11 أكتوبر وحتى 5 نوفمبر** (الأسابيع: 7، 8، 9، 10). تميزت هذه الفترة بنقلة نوعية جمعت بين محورين هندسيين وتشغيليين متكاملين:

1. **المحور الأول (الأسابيع 7 و 8):** تمكين تشغيلي كامل كـ **موظف فعلي في قسم خدمات الألياف الضوئية (FTTH)**، تم خلاله تغطية ورديات العمل الميداني على مدار الساعة (24/7) التي شملت الشفت الأساسي الأكثر تكراراً (**من 2:00 ظهراً إلى 10:00 ليلاً**)، والورديات المسائية الممتدة (**من 4:00 عصراً إلى 12:00 منتصف الليل**)، وورديات الليل والسهر (**من 10:00 ليلاً إلى 6:00 صباحاً**)، وتحقيق أرقام إنتاجية استثنائية بلغت ذروتها التاريخية بمعالجة **97 تذكرة تشغيلية معتمدة في شفت واحد** بتاريخ 20 أكتوبر.
2. **المحور الثاني (الأسابيع 9 و 10):** الانتقال المهني المبرمج إلى **قسم شبكات النقل والتراسل (Transport Networks)** كـ **متدرب تخصصي**؛ للتعرف على البنية التحتية الكبرى للشبكة (Backbone Infrastructure)، وتقنيات التراسل الضوئي عالي السعة (DWDM / OTN)، وشبكات التراسل الميكروي (Microwave Links)، ومراقبة تدفق البيانات بين المقاسم وأبراج الاتصالات.

وقد أثمرت هذه الفترة عن التعامل مع **482 تذكرة وبلاغ تشغيلي موثق** بمعدل التزام باتفاقية مستوى الخدمة بلغ **97.4%**، مما رسخ فهماً شاملاً لمنظومة الاتصالات المتكاملة بدءاً من نقطة وصول العميل (FTTH Access) وحتى النواة المركزية للشبكة (Core & Transport).

---

# أولاً: التسلسل الزمني وتوزيع الورديات

## 1. الأسبوع السابع (من 11/10 إلى 15/10) – قسم FTTH:
* **الأحد 11/10 (Shift B من 2:00 م إلى 10:00 م):** إدارة الوردية كـ موظف فعلي ومعالجة **40 تذكرة تشغيلية موثقة بالهاند أوفر** (CCS: 10، Call Centre: 15، Open Access: 7، Resolved: 6، و Pending to NOC: 2).
* **الاثنين 12/10 (Shift B من 2:00 م إلى 10:05 م):** استكمال شفت المساء ومعالجة **38 تذكرة** وفحص استقرار الإشارة الضوئية والتأكد من مطابقة الـ MAC Address.
* **الثلاثاء 13/10 (شفت صباحي من 10:00 ص إلى 6:00 م):** فحص بلاغات النفاذ وسرعات التصفح لـ **32 تذكرة** وإحالة الحالات السليمة للكول سنتر.
* **الأربعاء 14/10 (شفت صباحي من 9:55 ص إلى 6:00 م):** معالجة **28 تذكرة** وفحص منافذ الـ ONT المعطلة عبر خوادم ACS.
* **الخميس 15/10:** راحة أسبوعية مجدولة.

---

## 2. الأسبوع الثامن (من 18/10 إلى 22/10) – قسم FTTH (ذروة الإنجاز التشغيلي):
* **الأحد 18/10 (شفت صباحي كامل من 8:30 ص إلى 6:00 م):** معالجة التذاكر المتراكمة وإغلاق **35 تذكرة** بالتنسيق مع الفرق الفنية.
* **الاثنين 19/10 (شفت صباحي من 8:30 ص إلى 6:00 م):** إنجاز **16 تذكرة موثقة بالهاند أوفر** موزعة بين CCS (6 تذاكر)، Call Centre (6 تذاكر)، Open Access (تذكرتان)، و Resolved مباشر (تذكرتان).
* **الثلاثاء 20/10 (شفت مسائي من 4:00 م إلى 12:00 منتصف الليل):** **ذروة الإنجاز التاريخي للتدريب** بإنجاز **97 تذكرة تشغيلية معتمدة** عبر نظام CCS (34 تذكرة)، Call Centre (30 تذكرة)، Resolved مباشر (16 تذكرة)، و Open Access (9 تذاكر).
* **الأربعاء 21/10 (شفت مسائي ممتد من 4:00 م إلى 12:00 منتصف الليل):** استكمال الأداء القياسي وإغلاق **45 تذكرة** حتى اللحظات الأخيرة من الشفت (11:57 م) موزعة بين CCS (25 تذكرة)، Call Centre (11 تذكرة)، Open Access (6 تذاكر)، و Resolved مباشر (3 تذاكر).
* **الخميس 22/10:** راحة أسبوعية مجدولة.

---

## 3. الأسبوع التاسع (من 25/10 إلى 29/10) – الانتقال لقسم شبكات النقل (Transport):
* **الأحد 25/10 والاثنين 26/10:** استئذان رسمي لعارض صحي معتمد وموافق عليه نظامياً.
* **الثلاثاء 27/10 (شفت مسائي من 4:00 م إلى 11:50 م):** مباشرة العمل في قسم Transport، والتعرف على البنية التحتية ومسارات التراسل الرئيسية ومتابعة 26 مهمة.
* **الأربعاء 28/10 (من 4:20 م إلى 12:20 بعد منتصف الليل):** دراسة كبائن ومسارات التراسل الضوئي (DWDM و OTN) ومتابعة 29 حالة تشغيلية.
* **الخميس 29/10 (وردية ليلية من 6:00 م إلى 2:00 فجراً):** شفت ليلي لمراقبة استقرار حركة البيانات وإنجاز **31 تذكرة ومهمة تراسل موثقة بالهاند أوفر** (CCS: 16، Open Access: 5، Call Centre: 3، Resolved: 3، TLS: 2، OSS: 2).

---

## 4. الأسبوع العاشر (من 1/11 إلى 5/11) – قسم شبكات النقل (Transport):
* **الأحد 1/11 والاثنين 2/11:** تهيئة ومراجعة بيانات الدوائر الناقلة وتدفق الترافيك.
* **الثلاثاء 3/11 (دوام صباحي من 10:30 ص إلى 6:00 م):** فحص إنذارات شبكات النقل واستكشاف أخطاء وصلات الميكروويف (Microwave Links) لـ 34 مهمة وبلاغ.
* **الأربعاء 4/11 (دوام صباحي من 10:30 ص إلى 6:00 م):** اختبارات مسارات الحماية التلقائية (Protection Switching) للدوائر الناقلة لـ 30 مهمة.
* **الخميس 5/11 (دوام صباحي من 10:30 ص إلى 6:00 م):** مراجعة مؤشرات الأداء والتوثيق الهندسي الختامي لـ 21 مهمة تشغيلية.

---

# ثانياً: مهام موظف FTTH الفعلي وتصنيف التذاكر المعتمد

خلال الأسبوعين السابع والثامن تم العمل باستقلالية تامة كموظف فعلي في تغطية الورديات المتناوبة، وتوظيف منظومة البرمجيات التشغيلية (Handover Tools) وتصنيف التذاكر وفق القنوات والأنظمة المعتمدة في بيئة العمل:

1. **نظام خدمة العملاء والدعم المركزي (CCS - Customer Care Support):**
   * شكل الحصة الكبرى من التذاكر بمعدل **36.5% (176 تذكرة)**.
   * يختص بمتابعة البلاغات الفنية المركزية ومراجعة حالة التوصيل للعميل وإجراء الفحوصات المنطقية.
2. **إحالات وتنسيق الكول سنتر (Call Centre Referrals):**
   * مثل **24.3% (117 تذكرة)**، حيث يتم فحص التذكرة وإعادة توجيهها بتعليق فني حاسم (Diagnostic Comment) أو إغلاقها عند سلامة الخدمة.
3. **النفاذ المفتوح وتنسيق المشغلين (Open Access Operators):**
   * مثل **14.5% (70 تذكرة)**، ويتعامل مع البنية التحتية المشتركة بين المشغلين ومزودي الخدمة، والتحقق من نقاط الربط المشتركة.
4. **المعالجة والإغلاق الفوري (Resolved Direct Handling):**
   * مثل **11.8% (57 تذكرة)** تم إغلاقها فورياً بعد استقرار الخدمة ومطابقة قراءات الإشارة وضبط المنافذ.
5. **الدعم الفني التخصصي والتصعيدات (TLS & NOC):**
   * مثل **12.9% (62 تذكرة)** موزعة بين الدعم الفني التخصصي TLS، ومركز عمليات الشبكة NOC، وأنظمة OSS للتعامل مع الأعطال المعقدة.

---

# ثالثاً: معايير الإشارة الضوئية وشبكات الـ CVLAN

* **نطاق القدرة الضوئية المستقبلة (Optical RX Power):**
  الالتزام الصارم بالنطاق القياسي المعتمد: **من -10 dBm إلى -26 dBm** على منصة Huawei NCE.
* **الربط والتحقق من خدمات الـ CVLAN:**
  * **CVLAN 1501:** الإنترنت فائق السرعة (HSI).
  * **CVLAN 3980:** إدارة أجهزة الـ ONT وبروتوكول TR-069 لخوادم ACS.
  * **CVLAN 1810:** الاتصال الصوتي عبر بروتوكول الإنترنت (VoIP).

---

# رابعاً: شبكات النقل والتراسل (Transport Networks)

مثل الانتقال إلى قسم شبكات النقل نقلة نوعية في فهم الصورة الهندسية الكبرى للبنية التحتية:

### 1. معمارية شبكة النقل (Transport Backbone Architecture):
تعمل شبكة النقل كشريان حيوي يربط بين كبائن الألياف الضوئية (FTTH) ومحطات الجيل الرابع والخامس (4G/5G) من جهة، وبين مراكز البيانات ومقاسم الاتصالات الرئيسية (Core Switches) من جهة أخرى.

### 2. تقنيات التراسل المعتمدة:
* **تقنية تقسيم الطول الموجي الكثيف (DWDM):**
  نقل عشرات القنوات الضوئية على شعيرة فايبر واحدة بسعات فائقة تصل إلى مئات الجيجابت/ثانية (100G/400G Links).
* **شبكات النقل البصري (OTN - Optical Transport Network):**
  تأطير وإدارة البيانات وتوفير آليات تصحيح الأخطاء المتقدمة (FEC - Forward Error Correction).
* **شبكات النفاذ الراديوي المبنية على بروتوكول الإنترنت (IP RAN):**
  تجميع حركة المرور القادمة من أبراج الاتصالات وتمريرها عبر مسارات موجهة بتقنيات MPLS/SR.
* **وصلات الميكروويف (Microwave Backhaul):**
  استخدام الترددات اللاسلكية الموجهة في المناطق الوعرة أو كمسار بديل للطوارئ، مع تطبيق تقنيات التعديل التكيفي (Adaptive Modulation).

### 3. مراقبة الإنذارات وحماية المسارات (Network Protection):
* متابعة إنذارات فقدان الإشارة (LOS - Loss of Signal).
* استقراء معدلات الخطأ في البت (BER - Bit Error Rate).
* اختبارات التحويل التلقائي للحماية (1+1 Protection Switching) والتي تتم خلال زمن قياسي يقل عن 50 ميلي ثانية لضمان استمرارية الأعمال وعدم تأثر المشتركين.

---

<!-- pagebreak -->

<!-- analytics-charts-p2 -->

---

<!-- pagebreak -->

# الخاتمة

أكدت هذه الفترة المتقدمة (الأسابيع 7 - 10) على الجاهزية التشغيلية والهندسية المتكاملة؛ فمن خلال إتقان مهام موظف FTTH الفعلي وتغطية مختلف الورديات المتناوبة والتعامل مع **482 تذكرة وبلاغ تشغيلي**، إلى التزود بالمعارف التطبيقية العميقة لشبكات النقل والتراسل (Transport)، باتت الرؤية الهندسية لمنظومة الاتصالات متكاملة من أدق تفاصيل نقطة وصول المشترك وحتى أضخم مسارات العمود الفقري للشبكة.

---

## ملحق: سجل الحضور والورديات اليومية المعتمدة (التقرير الفتري الثاني)

| التاريخ | اليوم | وقت الحضور والانصراف | القسم / طبيعة التكليف | الإنجاز التشغيلي |
| ------- | ----- | --------------------- | --------------------- | ---------------- |
| 11/10 | الأحد | 2:00 م – 10:00 م | قسم FTTH (Shift B) | **إنجاز 40 تذكرة تشغيلية معتمدة** |
| 12/10 | الاثنين | 2:00 م – 10:05 م | قسم FTTH (Shift B) | معالجة 38 تذكرة وفحص الإشارة |
| 13/10 | الثلاثاء | 10:00 ص – 6:00 م | قسم FTTH (شفت صباحي) | معالجة 32 تذكرة وفحص التصفح |
| 14/10 | الأربعاء | 9:55 ص – 6:00 م | قسم FTTH (شفت صباحي) | فحص منافذ الـ ONT لـ 28 تذكرة |
| 15/10 | الخميس | — | راحة أسبوعية | — |
| 18/10 | الأحد | 8:30 ص – 6:00 م | قسم FTTH (شفت صباحي) | إنجاز 35 تذكرة وإغلاق المتراكم |
| 19/10 | الاثنين | 8:30 ص – 6:00 م | قسم FTTH (شفت صباحي) | **إنجاز 16 تذكرة موثقة بالهاند أوفر** |
| 20/10 | الثلاثاء | 4:00 م – 12:00 منتصف الليل | قسم FTTH (شفت مسائي) | **ذروة الإنجاز التاريخي: 97 تذكرة** |
| 21/10 | الأربعاء | 4:00 م – 12:00 منتصف الليل | قسم FTTH (شفت مسائي) | **إنجاز 45 تذكرة حتى نهاية الشفت** |
| 22/10 | الخميس | — | راحة أسبوعية | — |
| 25/10 | الأحد | — | استئذان رسمي | عارض صحي معتمد نظامياً |
| 26/10 | الاثنين | — | استئذان رسمي | عارض صحي معتمد نظامياً |
| 27/10 | الثلاثاء | 4:00 م – 11:50 م | قسم Transport (شبكات النقل) | بدء التدريب ومتابعة 26 مهمة |
| 28/10 | الأربعاء | 4:20 م – 12:20 بعد منتصف الليل | قسم Transport (شبكات النقل) | دراسة DWDM و OTN (29 مهمة) |
| 29/10 | الخميس | 6:00 م – 2:00 فجراً | قسم Transport (وردية ليلية) | **إنجاز 31 تذكرة ومهمة تراسل موثقة** |
| 1/11 | الأحد | — | تهيئة وتنسيق | متابعة حركة البيانات |
| 2/11 | الاثنين | — | تهيئة وتنسيق | مراجعة السعات والدوائر |
| 3/11 | الثلاثاء | 10:30 ص – 6:00 م | قسم Transport (دوام صباحي) | إنذارات النقل والميكروويف (34 مهمة) |
| 4/11 | الأربعاء | 10:30 ص – 6:00 م | قسم Transport (دوام صباحي) | اختبارات مسارات الحماية (30 مهمة) |
| 5/11 | الخميس | 10:30 ص – 6:00 م | قسم Transport (دوام صباحي) | التوثيق الهندسي الختامي (21 مهمة) |

**إجمالي الساعات المعتمدة بالفترة: 128 إلى 146 ساعة عمل، تم خلالها إنجاز 482 تذكرة ومهمة تراسل موثقة.**`
};

// ── Master English Report for Period 2 (Oct 11 – Nov 05) ──────────────
export const DEFAULT_REPORT_P2_EN: FreshPeriodicReport = {
  title: 'Cooperative Training Report (Second Periodic Report)',
  majorField: 'FTTH Operations & Transport Networks',
  department: 'FTTH Technical Support & Transport Operations Engineering',
  roleAssignment: 'Active FTTH Employee (Weeks 7–8) & Transport Trainee (Weeks 9–10)',
  periodCoverage: 'From Oct 11 to Nov 05',
  stageOneHours: 'Rotational FTTH Shifts: 2:00 PM – 10:00 PM, 4:00 PM – 12:00 AM, 10:00 PM – 6:00 AM',
  stageTwoHours: 'Transport Evening & Night: 6:00 PM – 2:00 AM & Day Shifts: 10:30 AM – 6:00 PM',
  intervals: [
    {
      id: 'int_p2_1_en',
      label: 'Stage 1: Active FTTH Operational Shift Handling (Shift B & Day Shifts)',
      startDate: 'Oct 11',
      endDate: 'Oct 14',
      timeFrom: '14:00',
      timeTo: '22:00'
    },
    {
      id: 'int_p2_2_en',
      label: 'Stage 2: Peak Ticket Execution (97 Tickets) & Extended Evening Shifts',
      startDate: 'Oct 18',
      endDate: 'Oct 21',
      timeFrom: '16:00',
      timeTo: '00:00'
    },
    {
      id: 'int_p2_3_en',
      label: 'Stage 3: Department Transition to Transport Networks & Night Shifts',
      startDate: 'Oct 27',
      endDate: 'Oct 29',
      timeFrom: '18:00',
      timeTo: '02:00'
    },
    {
      id: 'int_p2_4_en',
      label: 'Stage 4: Transport Node Telemetry, Microwave Links & Protection Testing',
      startDate: 'Nov 03',
      endDate: 'Nov 05',
      timeFrom: '10:30',
      timeTo: '18:00'
    }
  ],
  customNarrative: `# Introduction to Second Periodic Report

This second periodic report covers a pivotal, advanced operational stage of cooperative training spanning four full academic weeks from **October 11 to November 05** (Weeks: 7, 8, 9, 10). This period represents a dual-pillar telecommunications experience:

1. **Pillar 1 (Weeks 7 & 8):** Full operational autonomy as an **Active Employee in FTTH Services**, covering rotational 24/7 operations including the primary shift (**2:00 PM – 10:00 PM**), extended evening shifts (**4:00 PM – 12:00 AM**), and night monitoring (**10:00 PM – 6:00 AM**), culminating in an all-time peak of **97 certified tickets handled in a single shift** on October 20.
2. **Pillar 2 (Weeks 9 & 10):** Structured department rotation to **Transport Networks** as a **Specialized Trainee**, exploring backbone network infrastructure, dense wavelength multiplexing (**DWDM / OTN**), microwave backhaul links, and core optical dispersion management.

Over this period, **482 documented tickets and transport tasks** were handled with an overall SLA compliance rate of **97.4%**, cementing an end-to-end understanding from client subscriber demarcation to national core backhaul.

---

# 1. Operational Timeline & Shift Schedules

## Stage 1: Weeks 7 & 8 – FTTH Active Employee Rotation:
* **Oct 11 (Shift B: 2:00 PM – 10:00 PM):** Shift leadership with **40 documented tickets** (CCS: 10, Call Centre: 15, Open Access: 7, Resolved: 6, Pending to NOC: 2).
* **Oct 12 (Shift B: 2:00 PM – 10:05 PM):** Evening shift execution with **38 tickets processed**.
* **Oct 13 (Day Shift: 10:00 AM – 6:00 PM):** Diagnostics on slowness and browsing tickets for **32 cases**.
* **Oct 14 (Day Shift: 9:55 AM – 6:00 PM):** Port Blocked interface resets and TR-069 ACS sync for **28 cases**.
* **Oct 18 (Full Day: 8:30 AM – 6:00 PM):** Backlog reduction and **35 tickets closed**.
* **Oct 19 (Day Shift: 8:30 AM – 6:00 PM):** **16 tickets processed and verified** on handover log.
* **Oct 20 (Evening Peak: 4:00 PM – 12:00 AM):** **All-time historic training record of 97 tickets processed** (CCS: 34, Call Centre: 30, Resolved: 16, Open Access: 9, TLS: 3, NOC: 2, NAS: 2, OSS: 1).
* **Oct 21 (Extended Evening: 4:00 PM – 12:00 AM):** **45 tickets processed** through late shift closure (11:57 PM).

---

## Stage 2: Weeks 9 & 10 – Transport Networks Engineering:
* **Oct 25 & 26:** Officially approved medical leave.
* **Oct 27 (Evening Shift: 4:00 PM – 11:50 PM):** Transport onboarding, backbone architecture induction, and 26 operational reviews.
* **Oct 28 (Extended Shift: 4:20 PM – 12:20 AM):** DWDM / OTN cabinet architectures, 10G/100G optical routes, and 29 cases.
* **Oct 29 (Night Shift: 6:00 PM – 2:00 AM):** Night maintenance window monitoring with **31 verified tickets/tasks** (CCS: 16, Open Access: 5, Call Centre: 3, Resolved: 3, TLS: 2, OSS: 2).
* **Nov 03 (Morning: 10:30 AM – 6:00 PM):** Microwave backhaul link diagnostics and fading analysis across 34 tasks.
* **Nov 04 (Morning: 10:30 AM – 6:00 PM):** 1+1 Protection switching and failover verification across 30 tasks.
* **Nov 05 (Morning: 10:30 AM – 6:00 PM):** Final period performance auditing, documentation, and handover across 21 tasks.

---

# 2. Handover Systems & Ticket Taxonomy

Handling operations leveraged official handover dashboards classifying cases across vital industry channels:
1. **Customer Care Support (CCS):** 36.5% of cases (176 tickets) representing central residential customer diagnostics.
2. **Call Centre Referrals:** 24.3% (117 tickets) requiring structured diagnostic comments and customer callbacks.
3. **Open Access Operators:** 14.5% (70 tickets) coordinating transit and shared infrastructure with partner carriers.
4. **Resolved Direct:** 11.8% (57 tickets) closed immediately upon successful telemetry verification.
5. **TLS & NOC Escalations:** 12.9% (62 tickets) escalating complex physical degradations to Tier-2 and core operations.

---

# 3. Transport Networks Core Concepts

* **DWDM & OTN Transmission:** Multi-wavelength optical multiplexing multiplying fiber capacity to 100G/400G carriers.
* **Microwave Backhaul:** Line-of-sight wireless transmission with adaptive modulation for remote radio towers.
* **Network Protection Switching:** Sub-50ms automated ring failover preventing service disruption upon physical fiber cuts.

---

<!-- pagebreak -->

<!-- analytics-charts-p2 -->

---

<!-- pagebreak -->

# Conclusion

The second training period successfully demonstrated comprehensive operational readiness across both consumer access layers (**FTTH**) and high-capacity carrier transport backbones (**Transport Networks**), completing **482 verified operational tickets and tasks**.

---

## Appendix: Official Attendance & Shift Log (Period 2)

| Date | Day | Shift Hours | Department / Assignment | Operational Achievements |
| ---- | --- | ----------- | ----------------------- | ------------------------ |
| Oct 11 | Sun | 2:00 PM – 10:00 PM | FTTH (Shift B) | **40 Certified Tickets Handled** |
| Oct 12 | Mon | 2:00 PM – 10:05 PM | FTTH (Shift B) | 38 Tickets & RX Verification |
| Oct 13 | Tue | 10:00 AM – 6:00 PM | FTTH (Morning Shift) | 32 Speed & Access Tickets |
| Oct 14 | Wed | 9:55 AM – 6:00 PM | FTTH (Morning Shift) | 28 Port & CVLAN Checks |
| Oct 18 | Sun | 8:30 AM – 6:00 PM | FTTH (Morning Shift) | 35 Backlog Reduction Tickets |
| Oct 19 | Mon | 8:30 AM – 6:00 PM | FTTH (Morning Shift) | **16 Handover Verified Tickets** |
| Oct 20 | Tue | 4:00 PM – 12:00 AM | FTTH (Evening Shift) | **Record Peak: 97 Tickets** |
| Oct 21 | Wed | 4:00 PM – 12:00 AM | FTTH (Evening Shift) | **45 Tickets Handled (11:57 PM)** |
| Oct 25 | Sun | — | Authorized Leave | Approved Medical Leave |
| Oct 26 | Mon | — | Authorized Leave | Approved Medical Leave |
| Oct 27 | Tue | 4:00 PM – 11:50 PM | Transport Networks | Department Onboarding (26 tasks) |
| Oct 28 | Wed | 4:20 PM – 12:20 AM | Transport Networks | DWDM / OTN Principles (29 tasks) |
| Oct 29 | Thu | 6:00 PM – 2:00 AM | Transport Networks (Night) | **31 Verified Transport Tasks** |
| Nov 03 | Tue | 10:30 AM – 6:00 PM | Transport Networks | Microwave Link Audits (34 tasks) |
| Nov 04 | Wed | 10:30 AM – 6:00 PM | Transport Networks | 1+1 Protection Failovers (30 tasks) |
| Nov 05 | Thu | 10:30 AM – 6:00 PM | Transport Networks | Final Telemetry Audit (21 tasks) |

**Total Logged Presence: 128 to 146 Certified Hours with 482 Handled Tickets and Transport Tasks.**`
};
