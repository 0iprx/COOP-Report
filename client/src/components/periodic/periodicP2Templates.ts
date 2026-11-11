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
  title: 'التقرير الفتري الثاني',
  majorField: 'عمليات الألياف الضوئية (FTTH) وشبكات النقل (Transport Networks)',
  department: 'قسم خدمات الألياف الضوئية FTTH وقسم شبكات النقل والتراسل (Transport Domain)',
  roleAssignment: 'موظف فعلي في FTTH (الأسابيع 7–8) ومتدرب في الترانزبورت (الأسابيع 9–10)',
  periodCoverage: 'من 11/10 إلى 5/11',
  stageOneHours: '',
  stageTwoHours: '',
  intervals: [
    {
      id: 'int_p2_1',
      label: 'الأسابيع 7 و 8: العمل الفعلي في قسم FTTH وإدارة التذاكر',
      startDate: 'إنجاز 482 تذكرة',
      endDate: 'ذروة 97 تذكرة (20/10)',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_2',
      label: 'الأسبوع 9: إنذارات النقل وبوابة الإنترنت الدولية (TS-01 و TS-02)',
      startDate: 'CA / Spider / Cacti',
      endDate: 'BGP / IGW / P0 / SNFN',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_3',
      label: 'الأسبوع 10: تتبع دوائر DIA و KAUST و إنذارات النقل للـ FTTH (TS-03 و TS-04)',
      startDate: 'SDM / NE40E / Vlanif',
      endDate: 'NCE / AMS / CSV Impact',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_4',
      label: 'المشروع المرجعي: بوابة المعرفة التفاعلية (NOC Portal)',
      startDate: 'React + Python Netmiko',
      endDate: 'DWDM / MPLS / 22 وحدة',
      timeFrom: '',
      timeTo: ''
    }
  ],
  customNarrative: `# مقدمة التقرير الفتري الثاني (من 11/10 إلى 5/11)

يغطي هذا التقرير الفترة الممتدة **من 11/10 إلى 5/11** من برنامج التدريب التعاوني (الأسابيع: السابع، الثامن، التاسع، والعاشر)، وقد انقسم العمل فيها إلى مرحلتين رئيسيتين:

1. **الأسابيع 7 و 8 — الاستمرار كموظف فعلي في قسم الألياف الضوئية (\`FTTH\`):** مواصلة العمل المباشر والمستقل على نظام تسليم البلاغات (\`Handover Dashboard\`) ومعالجة التذاكر اليومية وتشخيص أعطال المشتركين، وتطبيق إجراءات الفحص واستبدال أجهزة الـ \`ONT\` وإرسال إشعارات الصيانة المجدولة (\`MDT\`)، بإجمالي **482 تذكرة** خلال الفترة، ووصولًا إلى أعلى رقم مسجل في يوم **20 أكتوبر (97 تذكرة)** بمعدل التزام بالخدمة بلغ **97.4%**.
2. **الأسابيع 9 و 10 — التدريب في قسم شبكات النقل (\`Transport Domain\`):** الانتقال من شبكات النفاذ (\`FTTH\`) إلى قسم النقل في مركز عمليات الشبكة (\`NOC\`)، والتدرب على معالجة إنذارات النقل الأساسية (\`Device has stopped\`، \`BGP down\`، \`Faulty FAN\`)، وإدارة انقطاعات بوابة الإنترنت الدولية (\`IP Transit / Peering\`)، وتتبع دوائر الشركات المخصصة (\`DIA / GCX / KAUST / VSAT / Dark Fiber\`) عبر أنظمة \`SDM\` و\`Spider\` وموجهات \`Huawei NE40E\`، بالإضافة إلى متابعة إنذارات \`FTTH\` من شاشات النقل، وبناء **موقع ويب شخصي (\`NOC Knowledge Portal\`)** جمعتُ فيه كل هذه الإجراءات والأوامر وسكربتات \`Python\` والمحاكاة للمراجعة والتطبيق.

---

# أولًا: العمل الفعلي في قسم FTTH وإجراءات التشغيل المتقدمة (الأسابيع 7 و 8)

بعد التأسيس في الفترة الأولى، استمر العمل في الأسبوعين السابع والثامن بصفة **موظف فعلي في قسم FTTH**، مع التركيز على سرعة الفرز وتطبيق إجراءات السلامة الفنية المعتمدة:

## 1. مسار فرز التذاكر في أنظمة \`Remedy\` و\`MOSS\` (\`FT-02\`)
عند استلام أي تذكرة في قائمة العمل، يبدأ الفحص من حقل \`Provider Name\` وتصنيف المشكلة (\`Tier 3\`) لتحديد الإجراء الصحيح:
* **عملاء \`ITC\`:** تطبيق مسارات \`Link Down\` أو \`Slowness\` أو \`Browsing\` أو \`Gaming\` أو \`Landline\` حسب وصف الشكوى.
* **النفاذ المفتوح (\`Open Access\`):** عندما تكون سلام هي المزوّد والشركة الطالبة هي \`STC\` أو \`Zain\` أو \`Mobily\` أو \`GO\`، يتم التنسيق وفق مسار المشغلين.
* **المجمعات السكنية (\`Product = ZoomComp\`):** يتم فحص حالة \`GPON\` عبر منصتي \`Zooom\` و\`AAA\`.
* **خطوات التحقق الأساسية قبل أي تصعيد:** التأكد في \`MOSS\` أن حساب العميل ليس في حالة إيقاف (\`Suspended\`)، وتحديد المنطقة في \`Remedy\` لمعرفة هل الـ \`OLT\` يتبع منصة \`Huawei NCE\` أم \`Nokia AMS\`، ثم البحث بالـ \`Service ID\`. وإذا لم تظهر بيانات، يتم الدخول إلى \`MOSS → Service instance → PON Access Service\` والبحث بـ \`ONU SN\` ثم بـ \`LOID\`. وفي حال عدم وجود بيانات نهائياً تُسند التذكرة إلى \`Applications → OSS App Support\`.

## 2. المعايير الضوئية وخدمات \`CVLAN\` واستبدال الـ \`ONT\` (\`FT-01\` و\`FT-03\`)
* **نطاق الإشارة الضوئية (\`RX Power\`):** التحقق الدائم من أن قراءة القدرة المستقبلة تقع بين **\`-10 dBm\` و \`-26 dBm\`** عبر \`Huawei NCE\` أو \`Nokia AMS\`.
* **قنوات \`CVLAN\` لعملاء سلام:** التحقق من ربط الخدمات الثلاث في الـ \`Service Port\`: خدمة الإنترنت (\`1501 - HSI\`)، خدمة الإدارة (\`3980 - ACS / TR-069\`)، وخدمة الصوت (\`1810 - VoIP\`).
* **خطوات استبدال \`ONT\` على \`Huawei NCE\` (عند ظهور \`PON not stable\`):**
  1. البحث بالـ \`Service ID\` ونسخ بيانات الجهاز الحالية (\`Line profile\` و\`Service profile\`).
  2. الدخول إلى \`Service Port Info\` ونسخ جميع أرقام الـ \`VLAN\` في الملاحظات قبل الحذف.
  3. الدخول إلى \`Resource → Access Resource → GPON ONU → GPON ONU Auto Discovery\` والتصفية بـ \`SN\` أو \`LOID\`.
  4. مطابقة الموقع (\`OLT/Slot/Port\`) مع بيانات \`MOSS\` أولاً؛ لأن حذف الـ \`ONT\` يقطع الخدمة ويمسح منافذ الخدمة.
  5. حذف الـ \`ONT\` القديم ثم تنفيذ \`Confirm ONU\` للجديد بنفس الـ \`Service/Line profile\`، وتفعيل خيار \`Locate to ONU list\` ثم \`Apply\`، وإعادة إنشاء الـ \`VLANs\` من الملاحظات، ثم \`Modify → Name = Service ID\`.

## 3. إعلانات الصيانة المجدولة للشركات الطالبة (\`MDT — FT-04\`)
عند وصول بريد من \`NMC Change Management\` بعنوان \`REQUEST || CRQ…\` وبمرفق \`Impact list\`:
1. البحث عن رقم الـ \`CRQ\` في نظام \`SDM\` وأخذ: الوصف (العقد والمواقع)، سبب التغيير، \`Requester Region\`، التواريخ المجدولة، ومدة الانقطاع.
2. تصفية ملف \`Impact list\` وفصل عملاء كل شركة في ملف مستقل يحمل اسم الملف الأصلي مع اللاحقة (\`_STC\`، \`_Zain\`، \`_Mobily\`، \`_GO\`) دون خلط عملاء شركة مع أخرى.
3. إرسال بريد منفصل لكل شركة من البريد الرسمي \`FTTH-NOC@tls.sa\` بعنوان \`TLS MDT #CRQ…\` (أو \`Emergency TLS MDT #CRQ…\` للحالات العاجلة)، مع إضافة تفاصيل المنطقة عند مراسلة شركة \`GO\`.

---

# ثانيًا: تفاصيل وإحصائيات التذاكر الموثقة (482 تذكرة — من 11/10 إلى 5/11)

تم توثيق ومعالجة **482 تذكرة** عبر أداة تسليم المهام (\`Handover Tool\`) ونظام التتبع اليومي خلال الفترة، بمتوسط **34.4 تذكرة** في المرحلة الواحدة.

## 1. التوزيع الإجمالي للتذاكر حسب المسارات (\`Category Summary\`)

| م | التصنيف (\`Category\`) | عدد التذاكر | النسبة المئوية |
|---|---|---:|---:|
| 1 | **CCS** | **176** | 36.5% |
| 2 | **Call Centre** | **117** | 24.3% |
| 3 | **Open Access** | **70** | 14.5% |
| 4 | **Resolved Direct** | **57** | 11.8% |
| 5 | **TLS** | **31** | 6.4% |
| 6 | **NOC & OSS (مع NAS)** | **31** | 6.5% |
| — | **الإجمالي العام للفترة** | **482** | **100.0%** |

## 2. تفاصيل الأيام الموثقة بالصور من أداة التسليم (\`Handover Snapshots\`)

### 11/10 (إجمالي 40 تذكرة)
| Category | Unique Count |
| --- | ---: |
| Call Centre | 15 |
| CCS | 10 |
| Open Access | 7 |
| Resolved | 6 |
| Pending to NOC | 2 |
| TLS / OSS / NAS | 0 |
| **المجموع** | **40** |

### 19/10 (إجمالي 16 تذكرة)
| Category | Unique Count |
| --- | ---: |
| CCS | 6 |
| Call Centre | 6 |
| Open Access | 2 |
| Resolved | 2 |
| TLS / OSS / Pending to NOC / NAS | 0 |
| **المجموع** | **16** |

### 20/10 (إجمالي 97 تذكرة — أعلى ذروة موثقة)
من أمثلة التذاكر المسجلة في هذا اليوم: \`INC000003443563\`.

| Category | Unique Count |
| --- | ---: |
| CCS | 34 |
| Call Centre | 30 |
| Resolved | 16 |
| Open Access | 9 |
| TLS | 3 |
| Pending to NOC | 2 |
| NAS | 2 |
| OSS | 1 |
| **المجموع** | **97** |

### 21/10 (إجمالي 45 تذكرة بنهاية المتابعة — ارتفعت من 36 تذكرة إلى 45 تذكرة)
| Category | Snapshot 1 (10:28 PM) | الإغلاق النهائي (11:57 PM) |
| --- | ---: | ---: |
| CCS | 18 | 25 |
| Call Centre | 9 | 11 |
| Open Access | 6 | 6 |
| Resolved | 3 | 3 |
| TLS / OSS / Pending to NOC / NAS | 0 | 0 |
| **المجموع** | **36** | **45** |

### 29/10 (إجمالي 31 تذكرة)
من أرقام التذاكر الموثقة في سجل هذا اليوم: \`INC000003464990\`، \`INC000003462937\`، \`INC000003462569\`، \`INC000003462366\`، \`INC000003461185\`.

| Category | Unique Count |
| --- | ---: |
| CCS | 16 |
| Open Access | 5 |
| Call Centre | 3 |
| Resolved | 3 |
| TLS | 2 |
| OSS | 2 |
| Pending to NOC / NAS | 0 |
| **المجموع** | **31** |

## 3. السجل التراكمي الكامل لجميع المراحل الموثقة (14 مرحلة = 482 تذكرة)

| التاريخ | عدد التذاكر | المسار الرئيسي / الملاحظة |
| --- | ---: | --- |
| 11/10 | 40 | لقطة موثقة من أداة الهاند أوفر (CCS 10 / Call Centre 15) |
| 12/10 | 38 | فحص إشارات RX واستقرار الألياف |
| 13/10 | 32 | متابعة تذاكر البطء وفحص \`MAC\` و\`ACS\` |
| 14/10 | 28 | معالجة حالات \`Port Blocked\` وضبط \`CVLAN\` |
| 18/10 | 35 | فرز البلاغات المتراكمة وحالات الطوارئ |
| 19/10 | 16 | لقطة موثقة من أداة الهاند أوفر (CCS 6 / Call Centre 6) |
| 20/10 | **97** | **ذروة الفترة (لقطة موثقة — 34 CCS و 30 Call Centre)** |
| 21/10 | 45 | لقطة موثقة من أداة الهاند أوفر (تصاعدت من 36 إلى 45) |
| 27/10 | 26 | بداية التدريب في قسم شبكات النقل ومتابعة المهام |
| 28/10 | 29 | فحص مسارات التراسل والإنذارات الحية |
| 29/10 | 31 | لقطة موثقة من أداة الهاند أوفر (CCS 16 / Open Access 5) |
| 3/11 | 34 | متابعة إنذارات النقل والدوائر |
| 4/11 | 30 | فحص مسارات الحماية واستقرار الجلسات |
| 5/11 | 21 | المراجعة الختامية وتدقيق الحالات العالقة |
| **الإجمالي** | **482** | **التزام تشغيلي بمستوى الخدمة (SLA) بنسبة 97.4%** |

---

# ثالثًا: التدريب في الترانزبورت — معالجة إنذارات النقل في NOC (\`TS-01\`)

عند الانتقال في الأسبوعين التاسع والعاشر إلى **قسم الترانزبورت (\`Transport Domain\`)**، تعلّمتُ طريقة التعامل مع الإنذارات الأربعة الرئيسية في مركز عمليات الشبكة خطوة بخطوة:

## 1. إنذار توقف الجهاز (\`Device has stopped\`)
1. فتح منصة **\`CA Performance\` ← اختيار الـ \`IP\` ← \`Health\` ← عمود \`IfAlias\`** لمعرفة عدد العملاء الموجودين على الجهاز، أو مراجعة قاعدة بيانات **\`Spider\`** لمعرفة عدد المتأثرين.
2. **إذا كان المتأثر عميلاً واحداً فقط:** يُطلب من \`B-care\` فتح تذكرة \`CTT\` والتواصل مع العميل، مع التحقق من فريق الدعم حول وجود أي نشاط أو انقطاع كهرباء لديه.
3. **إذا كان المتأثرون عدة عملاء:** يتم فتح تذكرة شبكة (\`NTT\`) وإرسال إشعار انقطاع مفاجئ (\`sudden outage\`)، والتحقق مع فريقي الدعم والكهرباء عن أي نشاط أو فصل طاقة، ثم كتابة تعليق واضح على الإنذار.

## 2. إنذار سقوط جلسة التوجيه (\`BGP down\`)
1. أخذ الـ \`IP\` من الإنذار والاتصال بعنصر الشبكة (\`NE\` مثل أجهزة \`Cisco IOS XR ASR 9000\`).
2. التحقق هل الجلسة تخص عميلاً أم عنصر شبكة عبر تنفيذ الأوامر:
   * \`show bgp summary | include <IP>\` (لمعرفة حالة الجلسة: \`Active\` أو \`Idle\` تعني أنها متوقفة، بينما \`Established\` أو مدة تشغيل مع عدد البادئات تعني أنها قائمة).
   * \`show route <IP>\` لمعرفة واجهة الخروج التي يمر عبرها المسار.
   * \`show interfaces <Interface>\` لقراءة حقل \`Description\`؛ ومن خلال الوصف يتضح هل هي جلسة عميل أم عنصر شبكة.
3. **الحكم:** إذا كانت جلسة عميل يُتجاهل الإنذار حسب الإجراء، وإذا كانت لعنصر شبكة تُفتح تذكرة \`Critical NTT\` وتُسند إلى \`Back Office\` مع الاتصال بهم مباشرة ومراسلة المزوّد.

## 3. إنذار المراوح والكهرباء في المحوّلات (\`Faulty FAN Detected\`)
1. عند وصول إنذار مروحة أو كهرباء، يتم الدخول أولاً إلى المحوّل عبر \`SSH\` وتنفيذ \`show env fan\` و \`show env all\` للتأكد هل الإنذار حقيقي أم وهمي.
2. إذا كانت جميع القراءات طبيعية يُعتبر إنذاراً وهمياً (\`False alarm\`)، أما إذا ظهرت أي قيمة غير طبيعية فتُفتح تذكرة \`NTT\` وتُصعّد إلى \`Back Office\` مع إرسال الفريق الميداني.

## 4. إنذارات منصات النواة (\`DPI / Sandvine / Voice / Wirefilter / DNS\`)
أي إنذار يظهر على هذه العناصر يستوجب فوراً فتح تذكرة \`NTT\` وإسنادها إلى فريق **\`NAS\`** والاتصال بالمناوب في \`Back Office\`.

---

# رابعًا: بوابة الإنترنت الدولية — \`IP Transit\` و\`Peering\` (\`TS-02\`)

تعلّمتُ قواعد التصعيد الدقيقة عند انقطاع روابط العبور الدولي (\`IP Transit\` مع مزودين مثل \`TATA\` و\`STC\` و\`Mobily\`) أو روابط التبادل (\`Peering\`):
1. **توحيد التذكرة ومراسلة المزودين:** عند سقوط رابط \`IP Transit\` (حتى لو تعدد المزودون أو سقط أكثر من رابط في الحادثة)، تُفتح **تذكرة \`Critical NTT\` واحدة فقط** وتُترك في سلة \`NOC\`، مع قراءة وصف المنفذ ومراسلة جميع المزودين المعنيين في نفس الوقت وإضافة كل رابط سقط أثناء الحادثة إلى القالب.
2. **حد الازدحام (\`> 85%\` عبر \`Cacti\`):** متابعة استخدام الروابط الباقية في \`Cacti\` وإشراك \`Back Office\`؛ وإذا تجاوز استهلاك أي رابط متبقٍ نسبة **85%** تُفتح تذكرة \`Major NTT\` وتُسند إلى فريق \`NAS\` مع الاتصال الفوري بمناوب \`BO\` والإبلاغ في مجموعة \`NAS\`.
3. **قاعدة الأثر الحرج (\`> 200G\` — مصفوفة \`P0\`):** إذا تجاوزت السعة المتأثرة **200G** يتم إبلاغ الـ \`Shift Lead\` فوراً والعمل معه وفق مصفوفة تصعيد الطوارئ \`P0\`.
4. **قراءة ردود \`SNFN\` والتحقق بعد العودة:** عند رد فريق \`SNFN\` بعبارة: *"observing local fault alarm at ITCJ from client port"*، فهذا يعني أن المسار الوطني سليم والمشكلة في المسار الدولي، لذا تتم المتابعة عن قرب مع المزودين الدوليين حتى الاستعادة والتأكد من زوال جميع الإنذارات من جهتهم ومن جهة \`SNFN\`.

---

# خامسًا: حالات \`DIA\` و\`GCX\` و\`KAUST\` و\`VSAT\` والألياف المظلمة (\`TS-03\`)

## 1. فحص خدمة الإنترنت المخصص (\`DIA & GCX\`) لمزودي \`STC\` و\`APTech\` و\`Mobily\` و\`Mawarid\`
عند وصول بريد من \`B-care\` حول مشكلة في خدمة \`DIA\`، يتم تطبيق التسلسل التشغيلي التالي بالكامل:
1. نسخ رقم الخدمة (\`Service ID\`) من نظام \`SDM\`.
2. الدخول إلى قاعدة بيانات \`B-care Spider\`: الضغط على \`F11\`، ثم لصق الـ \`Service ID\`، ثم الضغط على \`Ctrl+F11\`.
3. النزول إلى قسم \`Metro Ethernet\` أسفل النتائج وأخذ 4 بيانات: \`Partner Circuit ID\`، \`Partner name\`، \`VLAN\`، و\`Pop Name\`.
4. نسخ جزء الـ \`IP\` من الـ \`Pop Name\` والاتصال بالموجّه (مثل \`Huawei NE40E\`) عبر \`SecureCRT\` أو \`PuTTY\`.
5. عرض إعداد الواجهة الافتراضية باستخدام:  
   \`display current-configuration interface Vlanif <VLAN>\`  
   لاستخراج اسم الـ \`vpn-instance\` وعنوان IP الواجهة (مع قناع الشبكة \`255.255.255.252\` أي \`/30\`).
6. حساب عنوان الجار المقابل: في شبكة \`/30\` إذا كان عنواننا هو الأول القابل للاستخدام نضيف \`1\` للحصول على الجار (وإذا كان الثاني فالجار هو العنوان السابق).
7. فحص جلسة التوجيه بالأمر: \`display bgp vpnv4 vpn-instance <VRF> peer | include <PeerIP>\`:
   * إذا كانت الحالة \`Established\` مع مدة \`Up/Down\` فالجلسة قائمة.
   * إذا كانت \`Active\` أو \`Idle\` فالرابط متوقف؛ يتم فحص \`display logbuffer | include <PeerIP>\` ومراجعة رسوم الحركة في \`Cacti\` لمعرفة آخر وقت عمل فيه الرابط، ثم مراسلة المزوّد (مثل \`STC\`) مع إرفاق رقم الحادثة دائماً.

## 2. حالات \`KAUST\` و\`VSAT\` والألياف المظلمة (\`Dark Fiber\`)
* **بريد \`KAUST\`:** إرسال إقرار بالاستلام (\`Acknowledgement\`) للعميل أولاً دائماً، ثم فحص معلومات الرابط؛ إن كان المعرّف تابعاً لـ \`SNFN\` يُرسل إلى \`SNFN\` للفحص، وإلا يتم فحص منفذ الموجه (\`Up / Down\`) وأخذ بيانات المزودين من المخططات (\`Diagrams\`) والتحقق معهم جميعاً.
* **تذاكر \`VSAT\`:** تصل تذكرة \`NTT\` في \`Remedy\` من فريق الدعم بدون بريد، فتُسند مباشرة لفريق \`VSAT\`؛ إذا أفادوا بعدم وجود مشكلة تُعاد للدعم مع التعليقات، وإذا احتاجت فحصاً ميدانياً يُنشأ أمر عمل (\`WO\`) وتتم المتابعة مع الميدان ثم إرجاع التذكرة للدعم بعد الحل.
* **الألياف المظلمة مع \`Zain\`:** عند تصعيد \`Zain\` بالبريد، يتم فتح تذكرة \`NTT\` وأخذ صورة الموقع من وثيقة التصميم وإرسالها إلى \`SNFN\` للمتابعة.

---

# سادسًا: مراقبة إنذارات الـ FTTH من قسم النقل (\`TS-04\`)

* **إنذار \`The feeder fiber is broken\`:** الدخول إلى \`Huawei NCE\` (مع الانتباه إلى أن \`Nokia AMS\` مخصص للمنطقة الشرقية فقط)، وتسجيل الـ \`OLT\` والـ \`Slot\` والـ \`Port\` وفتح المنفذ؛ إذا ظهر إنذار كهرباء لمستخدم واحد فقط يُتجاهل، أما إذا سقطت عدة منافذ \`PON\` معاً فهذا يؤكد انقطاعاً حقيقياً ويتم فتح \`NTT\` وإرسال الفريق الميداني.
* **إنذار \`Loss of signal\`:** فحص حقل \`Current Reporting Status\` على المنفذ؛ إذا كانت \`Dying gasp\` فالخلل انقطاع كهرباء عند المشترك ويُتجاهل الإنذار من شاشة المراقبة (بخلاف تذكرة عميل بعينه في \`FT-02\` حيث يتم تأكيد الكهرباء عبر الدعم)، وإلا تُفتح \`NTT\` ويُرسل الميدان.
* **حساب أثر سقوط \`OLT\` (تصدير \`CSV\`):**
  * **على \`Huawei NCE\`:** \`OLT → GPON → GPON Management → GPON ONU → Find → Ctrl+A → زر يمين → File → Save As\`.
  * **على \`Nokia AMS\`:** \`OLT → زر يمين → Inventory → Query → Object Type = ONT → Description → Save CSV\`.
  * ثم تصفية الملف الناتج برقم المنفذ لمعرفة قائمة العملاء المتأثرين بدقة.

---

# سابعًا: جدول مصفوفة التصعيد في قسم النقل (ملخص التطبيق العملي)

| الحالة / الإنذار | نوع التذكرة | الجهة والإجراء المطلوب |
| --- | --- | --- |
| \`Device has stopped\` — عميل واحد | \`CTT (B-care)\` | \`B-care\` يتواصل مع العميل مع مراجعة الدعم والكهرباء |
| \`Device has stopped\` — عدة عملاء | \`NTT\` | إشعار \`sudden outage\` ومراجعة الدعم وفريق الكهرباء |
| سقوط رابط \`IP Transit\` | \`Critical NTT\` واحدة (سلة \`NOC\`) | قراءة وصف المنفذ وبريد لجميع المزودين المعنيين |
| استهلاك الروابط الباقية \`> 85%\` | \`Major NTT → NAS\` | اتصال فوري بمناوب \`BO\` وإبلاغ مجموعة \`NAS\` |
| الأثر الإجمالي \`> 200G\` | مصفوفة \`P0\` | إبلاغ \`Shift Lead\` فوراً واتباع تصعيد \`P0\` |
| \`BGP down\` لعنصر شبكة (\`NE\`) | \`Critical NTT → Back Office\` | اتصال بـ \`BO\` وإرسال بريد للمزود (عميل = تجاهل) |
| \`DIA\`: جلسة BGP غير \`Established\` | الحادثة الحالية | متابعة المزود مع وضع رقم الحادثة في البريد ومراجعة \`Cacti\` |
| \`DPI / Sandvine / Voice / Wirefilter / DNS\` | \`NTT → NAS\` | اتصال بمناوب \`Back Office\` |
| \`Faulty FAN / Power\` (غير طبيعي بـ \`show env\`) | \`NTT → Back Office\` | إرسال الفريق الميداني (قراءات سليمة = إنذار وهمي) |
| \`VSAT\` | \`NTT\` من الدعم | إسناد لفريق \`VSAT\` بلا بريد (مع \`WO\` للميدان عند اللزوم) |
| \`Dark Fiber\` مع \`Zain\` | \`NTT\` | أخذ صورة الموقع من وثيقة التصميم وإرسالها إلى \`SNFN\` |
| \`FTTH\`: سقوط عدة \`PON\` أو \`LOS\` حقيقي | \`NTT\` | إرسال الفريق الميداني (تجاهل \`Dying gasp\`) |

---

# ثامنًا: أساسيات التراسل الضوئي والأتمتة ومشروع بوابة المعرفة (\`NOC Portal\`)

إلى جانب التطبيق اليومي لإجراءات السلام (\`TS-01\` إلى \`TS-04\` و\`FT-02\` إلى \`FT-04\`)، حرصت خلال الأسبوعين الأخيرين على تعميق الفهم التقني لطبقات النقل وتنظيم كل ما تعلمته في **موقع ويب عملي (\`NOC & Field Operations Knowledge Portal\`)** بنيته باستخدام \`React 18\` و\`Vite\` و\`Tailwind CSS\`:

1. **مفاهيم التراسل الضوئي والنواة والأجهزة (\`DWDM / OTN / MPLS\`):** فهم طبقات الإرسال الضوئي (\`OTS, OMS, OCh, OTUk, ODUk, OPUk\`)، وقناة الإشراف \`OSC\`، ومراقبة فقد الامتداد (\`Span Loss\`) و\`OSNR\` وارتفاع \`Pre-FEC BER\` مع بقاء \`Post-FEC = 0\` كتحذير مبكر، وطريقة عزل السبب الجذري أثناء عواصف الإنذارات (\`R_LOS\` أو \`OTUK_LOF\` قبل الإنذارات اللاحقة مثل \`MS_AIS\` و\`BDI/RDI\`) على منصات \`Cisco NCS 1000/2000\` و\`Huawei OptiX OSN\` و\`Nokia 1830 PSS\`، إضافةً لمقارنة بروتوكولات \`MPLS\` (\`LDP\`، \`RSVP-TE\`، \`SR-MPLS\` مع \`TI-LFA\`، وفحص أعطال \`MTU\`).
2. **الأتمتة الآمنة بلغة \`Python\` (قراءة فقط):** تطبيق أمثلة \`Netmiko\` و\`pandas\` لقراءة حالة جلسة \`BGP down\` والتحقق التلقائي من عنوان الجار في دوائر \`DIA Vlanif\` على \`/30\`، وحساب أثر سقوط \`OLT\` من ملفات \`CSV\` المصدرة من \`NCE\` و\`AMS\`، مع التعرف على واجهات \`NBI / REST\` لأنظمة \`NCE / AMS / EPNM / SDM\` وكيفية استخدامها بأمان عند توفر التفويض.
3. **محتوى بوابة المعرفة (\`noc-portal\`):** يحتوي الموقع الذي طوّرته على **22 وحدة معرفية** (في مساحة عمل بأربعة تبويبات: الإجراء، الأوامر، الأتمتة، الاختبار)، و**5 سيناريوهات محاكاة حوادث (26 خطوة)** تحاكي حالات حقيقية مثل قطع \`Feeder Fiber\` بالرياض وسقوط \`IP Transit 400G\` وفحص عميل \`DIA\`، و**162 سؤال مراجعة**، مع التمييز داخل البوابة بين إجراءات سلام المعتمدة وبين الوحدات المرجعية العامة التي أضفتها لتغطية صورة المركز كاملة (مثل \`Access\` و\`5G\`).

---

# تاسعًا: التحديات التي واجهتها وطريقة التغلب عليها

* **التحول السريع من قسم \`FTTH\` إلى بيئة الترانزبورت:** الانتقال في الأسبوع التاسع من التذاكر السكنية إلى إنذارات العمود الفقري (\`BGP\`، \`IGW\`، \`DIA\`) استدعى التعامل مع عدة أنظمة مترابطة في آنٍ واحد (\`CA Performance\`، \`Spider\`، \`SDM\`، \`Cacti\`، \`SecureCRT\`).
* **ضغط الشفتات المرتفع (ذروة 97 تذكرة في \`20/10\`):** تطلب سرعة في فرز \`CCS\` و\`Call Centre\` و\`Open Access\` دون إهمال قراءات الـ \`RX\` أو كتابة التعليق التشخيصي الدقيق.
* **طريقة التغلب عليها:** التزمت بتدوين كل خطوة وأمر وقاعدة تصعيد كما هي في بيئة العمل، ثم برمجتها داخل بوابة المعرفة (\`noc-portal\`) مع أمثلة الأوامر والاختبارات، مما جعل الرجوع لأي إجراء (مثل خطوات \`Spider → Vlanif → BGP\` أو عتبات \`85% / 200G\`) سريعاً وواضحاً.

---

<!-- pagebreak -->

<!-- analytics-charts-p2 -->

---

<!-- pagebreak -->

# عاشرًا: الخاتمة والتوصيات

تمثل هذه الفترة (**من 11/10 إلى 5/11**) مرحلة متكاملة جمعت بين العمل الفعلي المستقل في قسم الألياف الضوئية (**482 تذكرة** وذروة **97 تذكرة**) وبين اكتساب الأساسيات العملية في قسم شبكات النقل (**\`TS-01\` إلى \`TS-04\`**) وبناء أداة معرفية خاصة (\`NOC Portal\`) تجمع الإجراءات والأوامر والسكربتات.

**أهم التوصيات العملية:**
1. توحيد إجراءات التصعيد وقوالب الفحص المبدئي بين \`FTTH\` و\`Transport\` خصوصاً في أعطال الكابلات المغذية وحساب الأثر من \`NCE / AMS\`.
2. الاستفادة من سكربتات الفحص القرائي (\`Read-Only Python Scripts\`) لتسريع خطوات فحص \`BGP\` وحساب جيران \`DIA /30\` وتلخيص ملفات \`OLT CSV\` دون أخطاء يدوية.
3. إبقاء المراجع العملية والأوامر مرتبة في بوابة موحدة لتسهيل مراجعة الإجراءات أثناء المناوبات وتقليل وقت التعامل مع الأعطال المتكررة.`
};

// ── Master English Report for Period 2 (Oct 11 – Nov 05) ──────────────
export const DEFAULT_REPORT_P2_EN: FreshPeriodicReport = {
  title: 'Second Periodic Report',
  majorField: 'FTTH Operations & Transport Networks',
  department: 'FTTH Technical Support & Transport Operations Domain',
  roleAssignment: 'Active FTTH Employee (Weeks 7–8) & Transport Trainee (Weeks 9–10)',
  periodCoverage: 'From Oct 11 to Nov 05',
  stageOneHours: '',
  stageTwoHours: '',
  intervals: [
    {
      id: 'int_p2_1_en',
      label: 'Weeks 7–8: Active FTTH Operations & Ticket Handling',
      startDate: '482 Total Tickets',
      endDate: '97 Peak (Oct 20)',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_2_en',
      label: 'Week 9: Transport Alarms & IGW SOPs (TS-01 & TS-02)',
      startDate: 'CA / Spider / Cacti',
      endDate: 'BGP / IGW / P0 / SNFN',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_3_en',
      label: 'Week 10: DIA / KAUST / VSAT & Transport FTTH Monitoring (TS-03 & TS-04)',
      startDate: 'SDM / NE40E / Vlanif',
      endDate: 'NCE / AMS / CSV Impact',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_4_en',
      label: 'Reference Project: NOC Knowledge Portal',
      startDate: 'React + Python Netmiko',
      endDate: 'DWDM / MPLS / 22 Modules',
      timeFrom: '',
      timeTo: ''
    }
  ],
  customNarrative: `# Introduction — Second Periodic Report (Oct 11 – Nov 05)

This report covers the four-week cooperative training period from **Oct 11 to Nov 05** (Weeks 7, 8, 9, and 10), divided into two main operational tracks:

1. **Weeks 7 & 8 — Continuing as an Active FTTH Employee:** Handling live subscriber and open-access tickets on the handover dashboard, running optical and provisioning diagnostics, replacing ONTs on \`Huawei NCE\`, issuing \`MDT\` maintenance notices, and resolving **482 total tickets** with a single-shift peak of **97 tickets (Oct 20)** at **97.4% SLA compliance**.
2. **Weeks 9 & 10 — Transport Domain Trainee:** Transitioning to the Transport NOC to learn carrier SOPs (\`TS-01\` through \`TS-04\`) covering \`Device has stopped\`, \`BGP down\`, FAN/Power, \`NAS\` elements, International Gateway (\`IP Transit / Peering\`), dedicated enterprise circuits (\`DIA, GCX, KAUST, VSAT, Dark Fiber\`), Transport-level FTTH monitoring, and building a personal web portal (**NOC Knowledge Portal**) organizing all workflows, CLI commands, Python read-only scripts, and simulations.

---

# 1. Active FTTH Operations & Advanced Procedures (Weeks 7–8)

* **Triage in \`Remedy\` & \`MOSS\` (\`FT-02\`):** Checked \`Provider Name\` and \`Tier 3\` categorization (\`ITC\`, \`Open Access\` seekers \`STC / Zain / Mobily / GO\`, or \`ZoomComp\` compounds via \`Zooom & AAA\`), verified active billing status in \`MOSS\` (not \`Suspended\`), identified \`Huawei NCE\` vs \`Nokia AMS\`, searched by \`Service ID\`, \`ONU SN\`, or \`LOID\`, and escalated missing provisioning records to \`OSS App Support\`.
* **Optical Thresholds, \`CVLANs\` & \`ONT Replacement\` (\`FT-01 & FT-03\`):** Verified \`RX Power\` within **\`-10 dBm to -26 dBm\`** and mapped \`CVLANs\` (\`1501 HSI\`, \`3980 ACS\`, \`1810 VoIP\`). For \`PON not stable\` replacements on \`Huawei NCE\`, documented profiles and service-port VLANs, matched \`OLT/Slot/Port\` in \`MOSS\` before deleting the old ONT, confirmed the new ONU, ticked \`Locate to ONU list\`, recreated VLANs, and named the ONT with \`Service ID\`.
* **Scheduled Maintenance Notices (\`MDT — FT-04\`):** Processed \`NMC Change Management\` \`CRQ\` tickets from \`SDM\`, split \`Impact list\` files strictly per seeker (\`_STC\`, \`_Zain\`, \`_Mobily\`, \`_GO\`), and sent individual emails from \`FTTH-NOC@tls.sa\`.

---

# 2. Ticket Analytics & Handover Snapshots (482 Verified Tickets)

## Overall Category Breakdown (482 Tickets)
| Category | Count | Share |
| --- | ---: | ---: |
| **CCS** | 176 | 36.5% |
| **Call Centre** | 117 | 24.3% |
| **Open Access** | 70 | 14.5% |
| **Resolved Direct** | 57 | 11.8% |
| **TLS** | 31 | 6.4% |
| **NOC & OSS (incl. NAS)** | 31 | 6.5% |
| **Total** | **482** | **100.0%** |

## Photographed Handover Snapshots
* **Oct 11 (40 Tickets):** Call Centre 15, CCS 10, Open Access 7, Resolved 6, Pending to NOC 2.
* **Oct 19 (16 Tickets):** CCS 6, Call Centre 6, Open Access 2, Resolved 2.
* **Oct 20 (97 Tickets — Record Peak, e.g., \`INC000003443563\`):** CCS 34, Call Centre 30, Resolved 16, Open Access 9, TLS 3, Pending to NOC 2, NAS 2, OSS 1.
* **Oct 21 (Progressed from 36 at 10:28 PM to 45 at 11:57 PM):** CCS 25, Call Centre 11, Open Access 6, Resolved 3.
* **Oct 29 (31 Tickets, e.g., \`INC000003464990\`–\`INC000003461185\`):** CCS 16, Open Access 5, Call Centre 3, Resolved 3, TLS 2, OSS 2.

---

# 3. Transport Domain SOPs (\`TS-01\` to \`TS-04\`)

* **\`TS-01\` Core Alarms:** Checked \`CA Performance → IP → Health → IfAlias\` and \`Spider\` for \`Device has stopped\` (1 customer = \`B-care CTT\`; multiple = \`NTT\` + \`sudden outage\` + Support/Power). Audited \`BGP down\` on \`Cisco IOS XR\` (\`show bgp summary\`, \`show route\`, \`show interfaces\` description) ignoring customer sessions and raising \`Critical NTT\` + calling \`Back Office\` + emailing providers for NE sessions. Verified \`Faulty FAN Detected\` via SSH (\`show env fan\`, \`show env all\`) before escalating, and routed \`DPI / Sandvine / Voice / Wirefilter / DNS\` alarms via \`NTT → NAS\` + calling on-call \`BO\`.
* **\`TS-02\` International Gateway (\`IGW\`):** Opened **one \`Critical NTT\`** in \`NOC\` bin covering all impacted providers (\`TATA\`, \`STC\`, \`Mobily\`) and emailed everyone concurrently. Enforced the **\`85%\` \`Cacti\` utilisation threshold** (\`Major NTT → NAS\` + call \`BO\` + \`NAS\` group) and **\`> 200G\` \`P0\` escalation** with \`Shift Lead\`. Interpreted \`SNFN\` (*"observing local fault alarm at ITCJ from client port"*) to focus international provider follow-up.
* **\`TS-03\` Enterprise Circuits (\`DIA / GCX / KAUST / VSAT / Dark Fiber\`):** Copied \`Service ID\` from \`SDM\` → searched \`B-care Spider\` (\`F11\` / \`Ctrl+F11\`) → extracted \`Metro Ethernet\` metadata (\`Partner Circuit ID\`, \`VLAN\`, \`Pop Name\`) → connected to \`Huawei NE40E\` via \`SecureCRT/PuTTY\` → ran \`display current-configuration interface Vlanif <VLAN>\` → computed \`/30\` peer IP → checked \`display bgp vpnv4 vpn-instance <VRF> peer\` (\`Established\` vs \`Active/Idle\`), \`display logbuffer\`, and \`Cacti\` before emailing \`STC / APTech / Mobily / Mawarid\` with the incident ID. Handled \`KAUST\` (acknowledge customer first), \`VSAT\` (assign to \`VSAT\`, no email), and \`Zain Dark Fiber\` (design site picture to \`SNFN\`).
* **\`TS-04\` Transport FTTH Alarms:** Audited \`Feeder fiber broken\` and \`Loss of signal\` in \`Huawei NCE\` (and \`Nokia AMS\` in Eastern region only), ignored \`Dying gasp\`, and exported \`OLT\` \`CSV\` subscriber lists filtered by port.

---

# 4. Optical Foundations, Python Scripts & NOC Portal Project

In parallel with daily Transport training, I built the bilingual **\`NOC Knowledge Portal\`** (\`React 18 + Vite + Tailwind CSS\`) to organize all procedures, \`DWDM/OTN\` & \`MPLS\` fundamentals, multi-vendor alarm correlation (\`Huawei OptiX OSN\`, \`Cisco NCS 1000/2000\`, \`Nokia 1830 PSS\`), read-only \`Python\` scripts (\`Netmiko\`, \`pandas\`), 5 interactive incident simulations (26 steps), and 162 review questions, along with supplementary reference cards (\`Access\`, \`5G\`).

---

<!-- pagebreak -->

<!-- analytics-charts-p2 -->

---

<!-- pagebreak -->

# Conclusion & Practical Recommendations

This period (**Oct 11 – Nov 05**) combined autonomous FTTH shift execution (**482 tickets**, **97 peak**) with hands-on Transport NOC procedures (\`TS-01\` to \`TS-04\`) and building a structured reference web portal (\`noc-portal\`). Key recommendations include synchronizing \`FTTH\` and \`Transport\` feeder-fiber escalation paths, adopting read-only \`Python\` pre-checks for \`BGP / DIA\` triage and \`OLT CSV\` impact counts, and maintaining a unified team knowledge base for fast shift reference.`
};
