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

// ── Master Arabic Report for Period 2 (Weeks 7–12 | Oct 11 – Nov 19) ──
export const DEFAULT_REPORT_P2_AR: FreshPeriodicReport = {
  title: 'التقرير الفتري الثاني',
  majorField: 'عمليات الألياف الضوئية (FTTH) وشبكات النقل التراسلي (B2B Transport Networks)',
  department: 'قسم خدمات الألياف الضوئية (FTTH) وقسم شبكات النقل (Transport Domain — B2B)',
  roleAssignment: 'موظف فعلي في FTTH (الأسابيع 7–8 و12) ومتدرب في شبكات النقل (الأسابيع 9–11)',
  periodCoverage: 'من 11/10 إلى 19/11',
  stageOneHours: '',
  stageTwoHours: '',
  intervals: [
    {
      id: 'int_p2_1',
      label: 'الأسابيع 7 و 8 (11/10 – 21/10): العمل الفعلي في قسم FTTH',
      startDate: '331 تذكرة',
      endDate: 'ذروة 97 تذكرة (20/10)',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_2',
      label: 'الأسابيع 9 إلى 11 (25/10 – 12/11): التدريب في قسم شبكات النقل (B2B)',
      startDate: 'تدريب ومشاهدة (0 تذاكر)',
      endDate: 'DWDM / OTN / MPLS / SNFN',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_3',
      label: 'الأسبوع 11 (8/11 – 12/11): التعمق في المخططات والإنذارات والربط الدولي',
      startDate: 'إنذارات A1–A3',
      endDate: 'لندن / ألمانيا / الأردن',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_4',
      label: 'الأسبوع 12 (15/11 – 19/11): العودة إلى قسم FTTH',
      startDate: 'قرابة 90 تذكرة موزعة',
      endDate: 'مع تطور أتمتة تذاكر FTTH',
      timeFrom: '',
      timeTo: ''
    }
  ],
  customNarrative: `# مقدمة التقرير الفتري الثاني ونطاق العمل (من 11/10 إلى 19/11)

يغطي هذا التقرير ستة أسابيع كاملة من برنامج التدريب التعاوني الممتدة **من 11 أكتوبر إلى 19 نوفمبر (الأسابيع: 7، 8، 9، 10، 11، 12)**، حيث توزع العمل والتدريب فيها بين المسارين الرئيسيين التاليين:

1. **الأسابيع السابع والثامن (\`11/10 – 21/10\`) — الاستمرار كموظف فعلي في قسم الألياف الضوئية (\`FTTH\`):**
   العمل المباشر والمستقل على معالجة بلاغات المشتركين، ومتابعة قائمة التسليم اليومية (\`Handover Dashboard\`)، وفحص قراءات الإشارة الضوئية والخدمات على الأنظمة التشغيلية، وإنجاز **331 تذكرة** خلال الأسبوعين بمعدل التزام خدمي مرتفع وبذروة يومية بلغت **97 تذكرة بتاريخ 20 أكتوبر**.
2. **الأسابيع التاسع والعاشر والحادي عشر (\`25/10 – 12/11\`، شاملة الأسبوع 11 من \`8/11 إلى 12/11\`) — التدريب الهندسي في قسم شبكات النقل (\`Transport Domain — B2B\`):**
   الانتقال للتدريب الهندسي والمشاهدة الميدانية في قسم النقل والتراسل ذات الطبيعة التجارية بين الشركات (\`B2B\`) **دون استلام أي تذاكر تشغيلية (0 تذاكر)**؛ حيث ركّزت هذه الأسابيع الثلاثة على شرح وفهم طريقة عمل تقنيات النقل الأساسية (\`DWDM\` و\`OTN\` و\`MPLS\`)، وبنية الشبكة الوطنية للألياف (\`SNFN\`)، وآلية نقل حركة الإنترنت خارج المملكة العربية السعودية إلى مراكز التبادل والعبور الدولية في **لندن وألمانيا والأردن والدول العربية**، ومخططات الشبكات والجهات المسؤولة عنها، وأنواع الأجهزة والكوابل الضوئية، وطريقة تحديد موقع قطع الألياف بدقة باستخدام جهاز \`OTDR\`، وتصنيف ومراقبة الإنذارات (\`A1 / A2 / A3\`)، وخطوات فتح التذاكر وتوثيقها في نظام \`BMC Remedy\`.
3. **الأسبوع الثاني عشر (\`15/11 – 19/11\`) — العودة إلى قسم الألياف الضوئية (\`FTTH\`):**
   الرجوع للعمل الميداني والتشغيلي في قسم \`FTTH\` ومعالجة **قرابة 90 تذكرة موزعة** على مختلف التصنيفات، وذلك بالتزامن مع استمرار وتطور نظام الأتمتة داخل قسم \`FTTH\` لأخذ وتصنيف مختلف أنواع التذاكر وتوجيهها بكفاءة.

---

# أولًا: التشغيل الفعلي في قسم FTTH (الأسابيع 7 و 8) والعودة في الأسبوع 12

## 1. سير العمل الفني في معالجة بلاغات FTTH
ارتكز العمل الفعلي على التشخيص المنظم قبل أي إجراء تحويل أو تصعيد عبر الأنظمة التشغيلية المعتمدة (\`Remedy\`، \`MOSS\`، \`Huawei NCE\`، و\`ACS\`):
* **التحقق الأولي من الاشتراك:** مطابقة رقم الخدمة (\`Service ID\`) في نظام \`MOSS\` للتأكد من فاعلية الاشتراك وعدم وجود إيقاف مالي (\`Suspended\`)، وتحديد المنصة المزوّدة (\`Huawei NCE\` أو \`Nokia AMS\`).
* **فحص الإشارة الضوئية (\`RX Power\`):** التأكد من أن القدرة الضوئية المستقبلة لدى جهاز العميل (\`ONT\`) تقع ضمن النطاق التشغيلي المعتمد (**\`-10 dBm\` إلى \`-26 dBm\`**).
* **مراجعة خدمات \`CVLAN\`:** التحقق من ربط منافذ الخدمة الثلاثة بشكل سليم: خدمة الإنترنت (\`1501 - HSI\`)، خدمة الإدارة (\`3980 - ACS / TR-069\`)، وخدمة الصوت (\`1810 - VoIP\`).
* **توجيه التذاكر وتدوين التشخيص:** كتابة تعليق فني واضح (\`Diagnostic Comment\`) قبل الإغلاق المباشر (\`Resolved\`)، أو التحويل لمركز الاتصال (\`Call Centre\`) عند سلامة خط الألياف، أو التنسيق في مسار النفاذ المفتوح (\`Open Access\`) مع المشغلين، أو تصعيد أعطال الفايبر الميدانية لفرق الميدان (\`FOPS\`).

## 2. تفاصيل الأيام الموثقة من أداة التسليم والعودة في الأسبوع 12

توثق الجداول التالية الأرقام الفعلية لتذاكر **قسم FTTH فقط** من لقطات التسليم الميدانية (\`Handover Snapshots\`) بمجموع **452 تذكرة FTTH** موزعة عبر مراحل العمل في القسم، بينما كانت أسابيع التدريب في **قسم الترانزبورت (0 تذاكر)** مخصصة للتدريب النظري والمشاهدة الحية فقط:

### لقطات أداة التسليم الموثقة بالصور (Snapshots — قسم FTTH)
| التاريخ | إجمالي اليوم | \`CCS\` | \`Call Centre\` | \`Open Access\` | \`Resolved\` | \`TLS\` | \`Pending to NOC\` | \`OSS\` | \`NAS\` | أمثلة وملاحظات موثقة |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| **11/10** | **40** | 10 | 15 | 7 | 6 | 0 | 2 | 0 | 0 | بداية الأسبوع 7 (لقطة مسائية موثقة) |
| **19/10** | **16** | 6 | 6 | 2 | 2 | 0 | 0 | 0 | 0 | لقطة موثقة — توازن تشغيلي ودقة 100% |
| **20/10** | **97** | 34 | 30 | 9 | 16 | 3 | 2 | 1 | 2 | **أعلى ذروة يومية** (مثل التذكرة \`INC000003443563\`) |
| **21/10** | **45** | 25 | 11 | 6 | 3 | 0 | 0 | 0 | 0 | ارتفعت من \`36\` (10:28 م) إلى \`45\` (11:57 م) |
| **29/10** | **31** | 16 | 3 | 5 | 3 | 2 | 0 | 2 | 0 | تغطية FTTH موثقة بالصورة — تذاكر النقل = 0 (\`INC000003464990\`–\`INC000003461185\`) |

### ملخص الأسابيع الستة الكامل (إجمالي تذاكر FTTH = 452 | تذاكر الترانزبورت = 0)
| الفترة الأسبوعية | التواريخ | القسم والتكليف | عدد التذاكر المستلمة | تفاصيل المرحلة |
| --- | --- | --- | ---: | --- |
| **الأسبوع 7** | 11/10 – 15/10 | \`FTTH\` (موظف فعلي) | 138 تذكرة | تشغيل تذاكر \`CCS\` و\`Call Centre\` و\`Open Access\` (أيام \`11/10\` إلى \`14/10\`) |
| **الأسبوع 8** | 18/10 – 22/10 | \`FTTH\` (موظف فعلي) | 193 تذكرة | ذروة الأسبوعين بتسجيل **97 تذكرة في \`20/10\`** و45 تذكرة في \`21/10\` |
| **الأسبوع 9** | 25/10 – 29/10 | \`Transport\` (متدرب B2B) + لقطة \`29/10\` | 0 نقل (31 FTTH) | **0 تذاكر في الترانزبورت** (تدريب ومشاهدة فقط)؛ و31 تذكرة موثقة بالصورة لـ \`FTTH\` بتاريخ \`29/10\` |
| **الأسبوع 10** | 1/11 – 5/11 | \`Transport\` (متدرب B2B) | 0 تذاكر | **تدريب هندسي ومشاهدة حية دون استلام تذاكر** — دراسة \`DWDM/OTN/MPLS\` و\`SNFN\` |
| **الأسبوع 11** | **8/11 – 12/11** | **\`Transport\` (متدرب B2B)** | **0 تذاكر** | **تدريب هندسي ومشاهدة حية دون استلام تذاكر** — المخططات، الأجهزة، \`OTDR\`، \`A1–A3\`، و\`Remedy\` |
| **الأسبوع 12** | **15/11 – 19/11** | **العودة إلى \`FTTH\` (موظف فعلي)** | **قرابة 90 تذكرة** | العودة لقسم \`FTTH\` ومعالجة قرابة 90 تذكرة موزعة بالتوازي مع تطور أتمتة تذاكر القسم |
| **الإجمالي** | **11/10 – 19/11** | **الأسابيع 7 إلى 12** | **452 تذكرة FTTH** | **0 تذاكر في قسم الترانزبورت | التزام تشغيلي (\`SLA\`) = 97.4%** |

### التوزيع الإجمالي لتذاكر قسم FTTH حسب التصنيف (452 تذكرة)
| م | التصنيف (\`Category\`) | الإجمالي | النسبة |
|---|---|---:|---:|
| 1 | \`CCS\` | **165** | 36.5% |
| 2 | \`Call Centre\` | **110** | 24.3% |
| 3 | \`Open Access\` | **66** | 14.6% |
| 4 | \`Resolved Direct\` | **55** | 12.2% |
| 5 | \`TLS\` | **29** | 6.4% |
| 6 | \`NOC & OSS\` | **27** | 6.0% |
| — | **إجمالي تذاكر FTTH** | **452** | **100.0%** |

---

# ثانيًا: طبيعة قسم النقل (\`B2B\`) والجهات التي يتم التعامل معها (الأسابيع 9–11)

على عكس قسم \`FTTH\` الذي يخدم عملاء المنازل والأفراد (\`B2C\`)، يعمل قسم شبكات النقل (\`Transport Domain\`) وفق نموذج **الشركة إلى الشركة (\`B2B — Business-to-Business\`)**؛ أي أن "العميل" هنا هو بالأساس **شركة اتصالات، أو مشغّل شبكة، أو مزوّد إنترنت (\`ISP\`)، أو جهة حكومية ومؤسسة كبرى** تستأجر سعات عالية (10G، 100G، 400G) أو دوائر ربط مخصصة ومؤمّنة، مما يرفع حساسية كل إنذار لأن انقطاعاً واحداً قد يؤثر على آلاف المستخدمين التابعين لتلك الجهة.

### الجهات والأطراف المرتبطة بعمل قسم النقل
| الفئة | أمثلة الجهات الفعلية | دورها في التشغيل والتنسيق |
| --- | --- | --- |
| **المشغلون المحليون (\`Local Carriers\`)** | \`STC\`، \`Mobily\`، \`Zain\`، \`Salam (ITC)\`، \`Dawiyat\`، \`GO\` | تبادل حركة البيانات، الربط البيني، دوائر النفاذ والدوائر المؤجرة، ومعالجة الأعطال المشتركة |
| **الشبكة الوطنية للألياف (\`SNFN\`)** | ائتلاف الشبكة الوطنية للألياف الضوئية | العمود الفقري البري للألياف داخل المملكة والتنسيق لتحديد وإصلاح الأعطال الوطنية |
| **الشركات الدولية ومزودو العبور (\`IGW Partners\`)** | \`TATA Communications\`، \`GCX\`، مزودو \`Tier-1\` ومشغلو دول الجوار | توفير بوابات العبور الدولي (\`IP Transit\`) والربط القاري عبر الأردن والخليج وأوروبا (لندن وألمانيا) |
| **العملاء المؤسسيون (\`Enterprise B2B\`)** | البنوك، الشركات الكبرى، الوزارات، مراكز البيانات | استهلاك خدمات الإنترنت المخصص (\`DIA\`) وشبكات \`MPLS L3VPN / L2VPN\` والدوائر المظلمة |
| **الفرق الداخلية والمساندة** | \`NOC\`، \`Back Office (BO)\`، \`Network Planning\`، \`FOPS\`، \`Power Team\`، \`B-Care\` | استلام البلاغات، التحليل المتقدم، تصميم المخططات، اللحام الميداني، الكهرباء، والتواصل مع عملاء \`B2B\` |

---

# ثالثًا: آلية عمل تقنيات النقل الأساسية (\`DWDM\` و\`OTN\` و\`MPLS\`)

تعمل تقنيات النقل الثلاث في منظومة مترابطة تنقل حركة البيانات من طبقة الفوتونات الضوئية في باطن الأرض حتى طبقة التوجيه الذكية:

## 1. تقنية \`DWDM\` (تعدد الإرسال بتقسيم الطول الموجي الكثيف — الطبقة الضوئية)
* **الفكرة الأساسية:** بدلاً من نقل إشارة واحدة على ليف ضوئي واحد، تقوم تقنية \`DWDM\` بدمج **من 40 إلى 120 طولاً موجياً (قناة ضوئية بلون ليزر مستقل)** على **نفس الليف الضوئي أحادي النمط (\`SMF\`)**، بحيث تحمل كل قناة سعات عالية (10G / 100G / 400G) بتوازي تام.
* **المكوّنات الرئيسية:**
  * **\`Transponders / Muxponders\`:** تحويل إشارة العميل إلى طول موجي دقيق ومعياري في النطاق (\`C-Band\`).
  * **\`Mux / Demux\` و\`ROADM\`:** جمع القنوات في جهة الإرسال وفصلها أو إعادة توجيهها ديناميكياً في العقد الوسيطة دون تحويلها إلى كهرباء (\`Optical Switching\`).
  * **\`EDFA / Raman Amplifiers\`:** مضخمات ضوئية تُركب كل 80–100 كم لتقوية الإشارة الضوئية دون الحاجة لفك التشفير، مع قناة إشراف منفصلة (\`OSC\`) تراقب حالة الكابل والأجهزة عن بعد.

## 2. تقنية \`OTN\` (شبكة النقل الضوئية وفق معيار \`ITU-T G.709\` — التغليف الرقمي والإدارة)
* **الفكرة الأساسية:** تعمل \`OTN\` كغلاف رقمي قياسي ("مظروف ذكي" فوق \`DWDM\`) يحمل داخله مختلف أنواع حركة البيانات (IP، Ethernet، SDH) مع إضافة ترويسات إدارة ومراقبة لكل مسار.
* **المزايا التشغيلية في الـ \`NOC\`:**
  * **تصحيح الأخطاء الأمامي (\`FEC\`):** تكتشف الأخطاء الرقمية الناتجة عن ضعف الإشارة وتصححها برمجياً، ما يتيح للـ \`NOC\` مراقبة تدهور المسار عبر \`Pre-FEC BER\` قبل سقوط الخدمة.
  * **المراقبة الطرفية ومتعددة المشغلين (\`TCM — Tandem Connection Monitoring\`):** تحديد هل تدهور الجودة وقع داخل شبكتنا أم ضمن شبكة مشغّل آخر.
  * **الحماية السريعة (\`SNCP / 1+1\`):** نقل حركة البيانات للمسار الاحتياطي خلال **أقل من 50 ملي ثانية** عند حدوث قطع.

## 3. تقنية \`MPLS\` (تبديل الملصقات متعدد البروتوكولات — طبقة التوجيه \`Layer 2.5\`)
* **الفكرة الأساسية:** على مستوى موجهات الشبكة (\`PE\` و\`P\`)، تُلصق الحزم برقم مختصر (\`Label\`) بدلاً من قراءة جداول التوجيه الضخمة في كل قفزة؛ مما يسرّع التمرير ويتيح فصل شبكات عملاء \`B2B\` بشكل معزول وآمن.
* **كيف تعمل عملياً لعملاء \`B2B\`:**
  * يدخل العميل من موجّه الطرف (\`CE\`) إلى موجه المزود (\`PE\` مثل \`Huawei NE40E\` أو \`Cisco ASR 9000\`).
  * يُعزل كل عميل شركة داخل جدول توجيه خاص به (**\`VRF — Virtual Routing and Forwarding\`**) ويتبادل مساراته عبر \`MP-BGP\` وبروتوكولات داخلية (\`OSPF / IS-IS\`).
  * توفر \`Fast Reroute (FRR)\` تحويل المسار في **أقل من 50 ملي ثانية** عبر \`LDP / RSVP-TE / SR-MPLS\`، مع ضبط جودة الخدمة (\`QoS\`) لأولوية الصوت والبيانات البنكية والـ \`DIA\`.

| وجه المقارنة | \`DWDM\` | \`OTN (G.709)\` | \`MPLS\` |
| --- | --- | --- | --- |
| **طبقة العمل** | الطبقة الضوئية الفيزيائية (\`L0/L1\`) | الطبقة الرقمية التراسليه (\`L1\`) | طبقة الشبكة وتبديل الملصقات (\`L2.5\`) |
| **وحدة النقل** | الطول الموجي (قناة ضوئية \`λ\`) | إطار رقمي (\`OPUk → ODUk → OTUk\`) | حزمة تحمل ملصقاً (\`Label / LSP\`) |
| **الأجهزة** | \`OptiX OSN / NCS 2000 / 1830 PSS\` | كروت \`OTN\` على أجهزة النقل البصري | موجهات \`NE40E / NE8000 / ASR 9000\` |
| **الوظيفة الجوهرية** | مضاعفة السعة عبر الأطوال الموجية وتضخيمها | التغليف الموثوق، تصحيح \`FEC\`، والمراقبة الطرفية | توجيه \`B2B\`، عزل \`VRF/L3VPN\`، وحماية \`FRR\` |

---

# رابعًا: تخطيط الشبكات، المخططات المسؤولة، \`SNFN\`، ونقل الإنترنت خارج السعودية

<!-- transport-architecture-diagrams -->

## 1. أنواع تخطيط الشبكات (\`Network Topologies\`)
تعتمد شبكات النقل أربعة نماذج تخطيط رئيسية لتفادي الانقطاع وتحقيق التوافرية العالية (\`High Availability\`):
* **التخطيط الخطي نقطة إلى نقطة (\`Point-to-Point / Linear\`):** يربط عقدتين مباشرة عبر كابل واحد أو مسار مزدوج؛ شائع في وصلات النفاذ القريبة أو الروابط الفرعية، ويتوقف عند قطع المسار ما لم يكن محمياً (\`1+1\`).
* **التخطيط الحلقي (\`Ring Topology\`):** يتصل كل موقع بجارَين لتشكيل حلقة مغلقة؛ فإذا انقطع الليف بين أي نقطتين تعكس أجهزة \`DWDM / OTN\` الإشارة للاتجاه المعاكس في الحلقة تلقائياً خلال **أقل من 50 ملي ثانية** (\`SNCP / UPSR Protection\`).
* **التخطيط الشبكي أو المتداخل (\`Mesh / Partial Mesh Topology\`):** تُربط المقاسم الرئيسية (\`Core POPs\`) بعدة مسارات متقاطعة عبر عقد \`ROADM\` وموجهات \`MPLS\`؛ ويوفر أعلى موثوقية لنقل الإنترنت الدولي وحركة المدن الكبرى لأن سقوط مسار لا يقطع الخدمة.
* **التخطيط النجمي المزدوج (\`Dual-Homed Hub-and-Spoke\`):** يربط مواقع عملاء \`B2B\` المهمين بموجّهين منفصلين (\`PE-1\` و\`PE-2\`) عبر مسارين ليفين مختلفين (\`Active / Standby\` أو \`Load Sharing\`).

## 2. من المسؤول عن إعداد وإرسال مخططات كل شبكة؟
| نوع المخطط | الجهة المسؤولة عن الإعداد والإرسال | متى يُرسل ولمن؟ |
| --- | --- | --- |
| **التصميم الهندسي العام والتفصيلي (\`HLD & LLD\`)** | **إدارة تخطيط وتصميم الشبكات (\`Network Planning & Design Engineering\`)** | قبل التنفيذ وعند التوسعات؛ يُسلّم لفرق التنفيذ و\`Back Office\` و\`NOC\` |
| **مخطط الدائرة والمسار المعتمد (\`CLR / Circuit Layout Diagram\`)** | **فريق التجهيز والتسليم (\`Provisioning / Service Delivery\`)** والمزود الشريك لخدمات \`B2B\` | فور تفعيل أي عميل \`DIA / MPLS\` أو رابط دولي؛ يُحفظ كمرجع رسمي لدى \`NOC\` و\`B-Care\` |
| **المخطط التنفيذي الفعلي وخرائط المسارات الأرضية (\`As-Built & GIS/KMZ\`)** | **مقاول التنفيذ وفريق الألياف الخارجية (\`OSP / SNFN Engineering\`)** | بعد انتهاء الحفر واللحام وتسليم المشروع؛ يستخدمها الـ \`NOC\` و\`FOPS\` لمطابقة مسافة \`OTDR\` مع الخريطة |

## 3. ما هي \`SNFN\` وكيف يُنقل الإنترنت خارج السعودية (لندن، ألمانيا، الأردن والدول العربية)؟
* **الشبكة الوطنية للألياف (\`SNFN — Saudi National Fiber Network\`):** هي شبكة العمود الفقري البري فائق السعة داخل المملكة العربية السعودية، تأسست بالشراكة/الائتلاف بين شركتي **سلام (\`ITC\`) وموبايلي** وتغطي **أكثر من 19,000 كيلومتر** لربط مناطق المملكة ومدنها الرئيسية (الرياض، جدة، الدمام والخبر، وغيرها) بالمعابر الحدودية ومحطات الإنزال البحرية، وتم تحديثها بأجهزة تراسل ضوئي عالية السعة لخدمة \`B2B\` ومشغلي العبور الدولي. وعند وقوع عطل في مسار وطني يتم التنسيق مع فريق تشغيل \`SNFN\` لفحص المسار وتحديد موقع القطع.
* **كيف تخرج حركة الإنترنت من السعودية إلى دول العالم (لندن، ألمانيا، الأردن، والدول العربية)؟**
  1. **داخل المملكة:** تتجمع حركة المشتركين (\`FTTH\`) والشركات (\`B2B\`) في المقاسم الإقليمية ومنها عبر شبكة \`SNFN\` الضوئية إلى بوابات الإنترنت الدولية (\`IGW — International Gateway\`).
  2. **المعابر البرية نحو الدول العربية:** تنطلق مسارات أرضية حدودية عالية السعة عبر شبكة \`SNFN\` مباشرة نحو **الأردن (عمّان والعقبة)** وبقية دول الجوار (**الإمارات، البحرين، الكويت، عُمان، قطر، العراق، ومصر**). ويُعد **ممر العبور السعودي عبر الخبر – الأردن** بوابة برية استراتيجية تنقل حركة البيانات بين الخليج وأوروبا بكفاءة وتنوع مسار.
  3. **محطات الإنزال للكابلات البحرية (\`Submarine Cable Landing Stations\`):** تخرج الكابلات البحرية القارية عبر محطتي الإنزال الرئيسيتين في **جدة (على البحر الأحمر باتجاه مصر وقناة السويس والبحر المتوسط)** و**الخبر (على الخليج العربي)** ضمن منظومات كابلات دولية مثل \`FALCON\` و\`FEA\` و\`SEA-ME-WE\` و\`IMEWE\` و\`AAE-1\` و\`2Africa\` إضافة لامتداد \`Medusa\` عبر العقبة بالأردن.
  4. **الوصول إلى مراكز التبادل والعبور العالمية في أوروبا:** تتصل تلك الكابلات والمسارات بشركاء دوليين (مثل \`TATA\` و\`GCX\` ومشغلي \`Tier-1\`) وصولاً إلى أكبر نقطتي تبادل إنترنت (\`IXPs\`) تستضيفان المحتوى العالمي والحوسبة السحابية: **لندن في المملكة المتحدة (\`LINX / Telehouse\`)** و**فرانكفورت في ألمانيا (\`DE-CIX\`)**؛ حيث تتم هناك عمليات **العبور الدولي (\`IP Transit\`) والتبادل المباشر (\`Peering\`)** لعودة المحتوى العالمي إلى المستخدمين داخل المملكة بأقل زمن استجابة.

---

# خامسًا: أنواع الأجهزة، أنواع الكوابل، وطريقة تحديد مكان قطع الألياف بدقة (\`OTDR\`)

<!-- transport-hardware-visuals -->

## 1. جدول أهم الأجهزة في شبكات النقل والفحص الميداني
| الفئة | أسماء وموديلات الأجهزة | الدور داخل الشبكة |
| --- | --- | --- |
| **أجهزة النقل البصري (\`DWDM / OTN\`)** | \`Huawei OptiX OSN 9800 / 1800\`، \`Cisco NCS 2000 / 1000\`، \`Nokia 1830 PSS\`، \`Ciena 6500\` | دمج ونقل الأطوال الموجية (\`100G/400G\`)، التكبير الضوئي، والحماية السريعة (\`< 50ms\`) |
| **موجهات النواة والحافة (\`IP / MPLS\`)** | \`Huawei NE40E / NE8000\`، \`Cisco ASR 9000\`، \`Juniper MX Series\` | توجيه حركة الإنترنت الدولية (\`BGP\`)، وإدارة دوائر \`B2B DIA\` و\`MPLS VPN\` |
| **أجهزة النفاذ ولوحات التوصيل** | \`Huawei MA5800\`، \`Nokia ISAM (OLT)\`، ولوحات التوزيع البصرية (\`ODF\`) | ربط مشغلات الـ \`FTTH\` والعملاء مع نقاط إنهاء وتوزيع الألياف في المقاسم |
| **أجهزة الفحص واللحام الميداني** | جهاز **\`OTDR\`**، جهاز اللحام الحراري (\`Fusion Splicer\`)، \`Optical Power Meter (OPM)\`، \`VFL\`، \`OSA\` | قياس القدرة الضوئية، تحليل الطيف، تحديد مسافة قطع الليف، وإعادة لحامه |

## 2. أنواع الكوابل المستخدمة في قسم النقل (\`Transport Cables\`)
| نوع الكابل | اللون / التكوين الفيزيائي | مكان الاستخدام |
| --- | --- | --- |
| **ألياف أحادية النمط (\`SMF — OS2 G.652D / G.655\`)** | أصفر (\`Patchcord\` بموصلات \`LC / SC / FC\`) بقطر نواة \`9/125 µm\` | وصلات الربط الداخلية داخل المقاسم بين لوحات \`ODF\` وأجهزة \`DWDM\` و\`NE40E\` |
| **ألياف متعددة النمط (\`MMF — OM3 / OM4\`)** | أزرق سماوي (\`Aqua\`) بقطر نواة \`50/125 µm\` | المسافات القصيرة جداً داخل نفس الغرفة أو الـ \`Rack\` (توصيلات \`10G/40G/100G\` قصيرة المدى) |
| **الكابل البري الأرضي المسلّح (\`Armored Underground Trunk\`)** | غلاف \`PE\` أسود سميك + تسليح فولاذي مموّج + أنابيب ألياف ملونة (\`Loose Tubes\`) | شبكة \`SNFN\` الوطنية والمسارات البرية بين المدن لحمايتها من القوارض والضغط والتربة |
| **الكابل البحري (\`Submarine Optical Cable\`)** | طبقات تسليح فولاذي مجدولة + أنبوب نحاسي للتغذية + نواة ألياف محكمة العزل | ربط محطات الإنزال (\`جدة / الخبر\`) بالكابلات القارية العابرة للبحار والمحيطات |
| **كوابل التغذية والنحاس (\`Power & Management\`)** | كوابل طاقة \`-48V DC\` ثنائية التغذية (\`Feed A / Feed B\`) + كوابل \`Cat6/Cat6A\` | تغذية رفوف النقل بالتيار المستمر وربط منافذ الإدارة والتحكم (\`Management Ports\`) |

## 3. كيف يتم تحديد مكان العطل أو قطع الألياف بدقة (\`OTDR Fiber Cut Localization\`)؟
عند سقوط مسار ليفي طويل (مثلاً مسار بطول 80 كم بين مدينتين)، لا يمكن لفريق الصيانة فحص الكابل بالعين؛ لذا تُتبع الخطوات الهندسية التالية للوصول إلى نقطة القطع بدقة أمتار محدودة:
1. **رصد الإنذار وعزل الطرفين في الـ \`NOC\`:** يظهر إنذار فقد الإشارة الضوئية (\`R_LOS\` من تصنيف \`A1\`) على جهاز النقل في المحطة (\`POP A\`) والمحطة المقابلة (\`POP B\`).
2. **التوجيه الميداني وحقن نبضة الليزر عبر جهاز \`OTDR\`:** يتوجه فني الميدان (\`FOPS\`) أو يُفعّل قياس \`OTDR\` (المحمولة أو المدمجة في الكروت الضوئية) من لوحة الـ \`ODF\` باتجاه المسار المقطوع. يرسل الجهاز نبضة ضوئية عالية التردد ويستقبل الضوء المرتد (\`Rayleigh Backscatter\` والانعكاس الحاد عند الكسر \`Fresnel Reflection\`).
3. **حساب المسافة الفيزيائية بدقة:** يقيس الجهاز زمن ذهاب وإياب النبضة الضوئية \`t\` ويحسب مسافة القطع وفق العلاقة الفيزيائية:  
   **\`d = (c × t) / (2 × n)\`**  
   حيث \`c\` سرعة الضوء في الفراغ و\`n\` معامل انكسار الزجاج في الليف الضوئي (\`≈ 1.468\`)، فيظهر على الشاشة رقم المسافة بدقة مثل **\`24.38 km\`**.
4. **المطابقة على خرائط المسارات (\`GIS / KMZ Maps\`):** تُسقَط المسافة المقاسة (مع مراعاة طول الاحتياط اللولبي \`Slack Loops\` في غرف التفتيش) على خريطة مسار الألياف لتحديد **غرفة التفتيش (\`Manhole\`) أو موقع الحفريات الفعلي** بالضبط.
5. **الإصلاح واللحام وإعادة القياس:** يحفر أو يفتح الفريق الغرفة المحددة، ويلحم الألياف المتضررة بجهاز **\`Fusion Splicer\`**، ثم يُعيد فحص المسار بجهاز \`OTDR\` للتأكد من انخفاض فقد اللحام وزوال إنذار \`R_LOS\` في شاشات الـ \`NOC\`.

---

# سادسًا: مراقبة الإنذارات (\`A1–A3\`)، تحديد المشكلة، وفتح التذكرة في \`BMC Remedy\`

## 1. تصنيف الإنذارات وأهم الإنذارات المراقبة في قسم النقل
تُصنف أنظمة مراقبة الشبكات (\`NMS / OSS\`) الإنذارات حسب مستوى الخطورة لضمان سرعة الاستجابة، ويأتي على رأسها **إنذار الفئة \`A1\`** بوصفه الأهم والأعلى أولوية في غرفة المراقبة:

| فئة الإنذار | المستوى القياسي | الدلالة التشغيلية وإجراء الـ \`NOC\` |
| --- | --- | --- |
| **\`A1\` (الأهم)** | **حرج (\`Critical — Service Affecting\`)** | يمثل انقطاعاً فعلياً أو خطراً فورياً يوقف حركة البيانات على مسار رئيسي أو عقدة نقل أو رابط \`IGW/B2B\` (مثل انقطاع ليف كامل \`R_LOS\`، فقد إطارات تام \`LOF\`، أو سقوط مصدر تغذية رئيسي). يستلزم **تدخلاً فورياً، فتح تذكرة \`Critical\` في \`Remedy\`، والتصعيد المباشر دون تأخير**. |
| **\`A2\`** | **رئيسي (\`Major\`)** | تأثير ملحوظ على جودة الخدمة أو فقدان أحد مسارات الحماية الاحتياطية مع استمرار عمل المسار الآخر (أو عطل وحدة تبريد/طاقة فرعية). يتطلب معالجة سريعة قبل تطوره إلى \`A1\`. |
| **\`A3\`** | **ثانوي (\`Minor / Warning\`)** | تنبيه وقائي أو خلل محدود غير مؤثر على حركة البيانات الحالية؛ يُوثّق ويُتابع ضمن المهام المجدولة. |

### كيف يميز مهندس الـ \`NOC\` موضع المشكلة الحقيقي أثناء تعدد الإنذارات؟
* **التفرقة بين السبب الجذري (\`Root Cause\`) والإنذارات التابعة (\`Symptomatic Alarms\`):** عند انقطاع ليف رئيسي، يسجل الجهاز المستقبل **أقدم إنذار قطع (\`LOS / R_LOS / LOF\`)** كسبب جذري؛ بينما تُرسل العقد اللاحقة نحو المصب إنذار **\`AIS\`** (إشارة تنبيه لتفادي إغراق الشبكة)، وتُرجع العقدة المقابلة إنذار **\`BDI / RDI\`** نحو المنبع. لذا يُحدَّد العطل بالبحث عن **أول نقطة ظهر فيها \`LOS\`** وليس نقطة ظهور \`AIS\`.
* **عزل نطاق العطل:** بفحص قراءة الإشارة الضوئية (\`Rx/Tx Optical Power\`) وحالة منفذ التوجيه (\`BGP Active/Idle\` مقابل \`Established\`) ومسار الحماية، يتبين فوراً هل المشكلة في **جهاز داخل المقسم (\`Board/SFP Fault\`)** أم **قطع في الفايبر الأرضي (\`SNFN / FOPS\`)** أم **لدى العميل الشريك/المزود الدولي (\`B2B Customer / International Carrier\`)**.

## 2. خطوات فتح تذكرة العطل في نظام \`BMC Remedy\` بالترتيب الفعلي
1. **الدخول إلى \`BMC Remedy ITSM / Smart IT\`:** اختيار إنشاء حادثة جديدة (\`Create New Incident\`) وتحديد نوعها؛ تذكرة شبكة (\`NTT — Network Trouble Ticket\`) لأعطال النقل والمسارات المشتركة، أو تذكرة عميل (\`CTT\`) عند انحصار العطل في خدمة عميل واحد.
2. **تحديد الجهة ومعرّف الدائرة:** إدخال اسم الشركة/المشغل المتأثر ورقم الدائرة أو الخدمة (\`Circuit ID / Service ID\`) واسم الـ \`POP\` المتأثر.
3. **كتابة ملخص موحّد وواضح (\`Summary\`):** صياغة عنوان قياسي يوضح نوع العطل، الموقع، الرابط، وحجم التأثير مثل:  
   \`[Critical A1] R_LOS / Link Down - [POP Name] - [Circuit/Carrier] - [Service Impact]\`.
4. **توثيق التفاصيل الفنية في حقل الوصف (\`Notes / Description\`):** تدوين وقت ظهور الإنذار بدقة، تصنيف الخطورة (\`A1 / Critical\`)، اسم الجهاز والـ \`Slot/Port\`، قراءات الإشارة الضوئية (\`Rx/Tx\`) أو حالة جلسة التوجيه (\`BGP\`)، وما تم التحقق منه مبدئياً.
5. **اختيار التصنيف القياسي (\`Operational & Product Categorization\`):** تحديد \`Tier 1 / Tier 2 / Tier 3\` المطابق لقسم النقل (مثل: \`Network → Transport → DWDM / Optical / Fiber Cut / IP Transit\`).
6. **تعيين الأولوية والتأثير (\`Impact & Urgency → Priority\`):** اختيار الدرجة المتوافقة مع فئة الإنذار (\`Critical\` لـ \`A1\`، \`Major\` لـ \`A2\`).
7. **تحديد الفريق المستلم (\`Assigned Support Group\`):** إسناد التذكرة إما لإبقائها في سلة \`NOC\` (لمتابعة المزودين الدوليين)، أو تحويلها إلى \`Transport Back Office (BO)\` (للفحص المتقدم)، أو \`Field Operations (FOPS)\` / \`SNFN\` (لقياس \`OTDR\` وإصلاح الألياف)، أو \`Power Team\` (لأعطال الكهرباء والمكيفات).
8. **الحفظ وتحديث السجل حتى الإغلاق (\`Work Info & Closure\`):** بعد الحفظ يولّد النظام الرقم المرجعي (\`INC00000xxxxxxx\`) ويُعتمد في الاتصالات والبريد الإلكتروني مع الشركات المزودة؛ ثم تُضاف تحديثات العمل باستمرار حتى زوال الإنذار (\`Alarm Cleared\`) وتوثيق السبب الجذري (\`Root Cause\`) وإغلاق التذكرة بعد تأكيد استقرار الخدمة.

---

<!-- pagebreak -->

<!-- analytics-charts-p2 -->

---

<!-- pagebreak -->

# سابعًا: التحديات الميدانية، الخاتمة، والتوصيات العملية

## 1. التحديات التي واجهتها خلال الفترة وكيفية التعامل معها
* **التحول السريع من دعم المشتركين (\`FTTH\`) إلى شبكات النقل التجارية (\`B2B\`):** استيعاب الفارق في المسؤولية بين تذكرة مشترك فردي وبين رابط \`IP Transit\` أو \`SNFN\` يخدم شركات كاملة ومتصل دولياً بلندن وألمانيا والأردن.
* **تتبع مصدر العطل وسط تتابع الإنذارات:** التمييز العملي بين إنذار القطع الجذري \`A1 (LOS / LOF)\` وبين إنذارات المصب \`AIS\` العارضة قبل التصعيد وفتح التذكرة في \`Remedy\`.
* **استئناف العمل في \`FTTH\` خلال الأسبوع 12:** المواءمة السريعة مع التطور التلقائي في أتمتة تذاكر قسم \`FTTH\` والاستمرار في إنجاز قرابة 90 تذكرة موزعة بمستوى الدقة المعتاد.

## 2. الخاتمة والتوصيات
استكملت هذه الفترة التدريبية الممتدة **من 11/10 إلى 19/11 (الأسابيع 7 إلى 12)** بناء الخبرة التشغيلية والهندسية عبر مسارين عمليين متكاملين: إتقان عمليات الألياف الضوئية (\`FTTH\`) بواقع **331 تذكرة** في الأسبوعين 7–8 (ذروة 97 تذكرة) إضافة لقرابة **90 تذكرة** بعد العودة في الأسبوع 12، وفهم منظومة شبكات النقل التجارية (\`B2B Transport\`) خلال الأسابيع 9–11 من طبقات \`DWDM\` و\`OTN\` و\`MPLS\`، وشبكة \`SNFN\` والربط الدولي، وصولاً إلى فحص قطع الألياف بـ \`OTDR\` ومراقبة إنذارات \`A1–A3\` وتذاكر \`BMC Remedy\`.

**التوصيات العملية:**
1. تعزيز الجلسات التطبيقية الميدانية لاستخدام جهاز \`OTDR\` وربط قراءاته مباشرة بخرائط مسارات الألياف (\`GIS/KMZ\`) عند التعامل مع أعطال \`SNFN\`.
2. إرفاق مخططات \`As-Built\` و\`Circuit Layout Diagrams\` المحدّثة مباشرة داخل بطاقات التوجيه لتسريع تتبع دوائر \`B2B\` عند حدوث إنذارات \`A1\`.
3. توسيع التكامل التنسيقي بين فرق \`FTTH\` و\`Transport NOC\` عند وقوع أعطال الكابلات المغذية أو المجمعات المشتركة لتقليص زمن الإصلاح العام.`
};

// ── Native Academic English Report for Period 2 (Weeks 7–12 | Oct 11 – Nov 19) ──
export const DEFAULT_REPORT_P2_EN: FreshPeriodicReport = {
  title: 'Second Periodic Cooperative Training Report',
  majorField: 'FTTH Access Operations & B2B Optical/IP Transport Networks',
  department: 'FTTH Operations & Transport Networks Domain (B2B Carrier Backbone)',
  roleAssignment: 'Active FTTH Specialist (Weeks 7–8 & 12) & Transport Networks Trainee (Weeks 9–11)',
  periodCoverage: 'Oct 11 – Nov 19',
  stageOneHours: '',
  stageTwoHours: '',
  intervals: [
    {
      id: 'int_p2_1_en',
      label: 'Weeks 7–8 (Oct 11 – Oct 21): Active FTTH Operations',
      startDate: '331 Tickets Handled',
      endDate: 'Peak: 97 Tickets (Oct 20)',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_2_en',
      label: 'Weeks 9–11 (Oct 25 – Nov 12): B2B Transport Networks Training',
      startDate: 'Training Only (0 Tickets)',
      endDate: 'DWDM / OTN / MPLS / SNFN',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_3_en',
      label: 'Week 11 (Nov 08 – Nov 12): Topologies, A1 Alarms & Global Transit',
      startDate: 'Alarm Classes A1–A3',
      endDate: 'London / Frankfurt / Jordan',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_4_en',
      label: 'Week 12 (Nov 15 – Nov 19): Return to FTTH Operations',
      startDate: '~90 Distributed Tickets',
      endDate: 'Evolved FTTH Ticketing Automation',
      timeFrom: '',
      timeTo: ''
    }
  ],
  customNarrative: `# Introduction & Reporting Scope (Weeks 7–12 | Oct 11 – Nov 19)

This Second Periodic Report documents six consecutive weeks of cooperative engineering training conducted from **October 11 to November 19 (Weeks 7 through 12)**. Across this period, operational assignments spanned two complementary tiers of telecommunications infrastructure—residential fiber access and business-to-business (\`B2B\`) carrier backbone transport:

1. **Weeks 7 & 8 (\`Oct 11 – Oct 21\`) — Active FTTH Specialist:** Performed full live subscriber fault diagnostics and handover queue management, resolving **331 tickets** across residential and open-access channels and achieving a single-shift peak of **97 tickets on October 20** at **97.4% SLA compliance**.
2. **Weeks 9, 10 & 11 (\`Oct 25 – Nov 12\`, explicitly covering Week 11: \`Nov 08 – Nov 12\`) — Transport Networks Trainee (\`B2B Domain\` — Observation Only, 0 Tickets Assigned):** Transitioned into Carrier Transport Operations strictly for **technical training and live NOC shadowing without receiving live tickets (\`0 tickets\`)**, studying end-to-end **\`DWDM\`, \`OTN\`, and \`MPLS\`** transmission architectures, **\`SNFN\`** national backbone routing, international internet transport corridors linking Saudi Arabia to **London, Frankfurt (Germany), Jordan, and neighboring Arab states**, network topology design and diagram ownership, optical hardware and fiber cable classes, **\`OTDR\`** cut localization, **\`A1–A3\`** alarm prioritization, and **\`BMC Remedy\`** incident ticketing workflows.
3. **Week 12 (\`Nov 15 – Nov 19\`) — Return to FTTH Operations:** Rejoined the FTTH Operations desk to resolve **approximately 90 distributed tickets** across standard categories while operating alongside continuously evolving department ticketing automation designed to automatically intake and route routine FTTH cases.

---

# 1. Active FTTH Operations (Weeks 7–8) & Week 12 Return

## 1.1 Diagnostic Workflow & Quality Standards
Live ticket execution centered on empirical verification across \`Remedy\`, \`MOSS\`, \`Huawei NCE\`, and \`ACS\` before closing or escalating incidents:
* **Provisioning & Billing Validation:** Confirmed active subscriber state in \`MOSS\` (verifying no \`Suspended\` hold) and mapped the serving regional OLT management domain (\`Huawei NCE\` vs. \`Nokia AMS\`).
* **Optical Power & VLAN Verification:** Audited ONT received optical power (\`RX Power\`) strictly within the **\`-10 dBm to -26 dBm\`** operating envelope and verified mapped \`CVLANs\` (\`1501\` for HSI internet, \`3980\` for ACS/TR-069 management, and \`1810\` for VoIP).
* **Disciplined Resolution & Escalation:** Authored clear diagnostic summaries before executing \`Resolved\` direct closures, referring subscriber-premise or account matters to \`Call Centre\`, coordinating \`Open Access\` multi-operator lines, or dispatching field crews (\`FOPS\`) when physical fiber attenuation or optical loss was confirmed.

## 1.2 FTTH Handover Snapshot Breakdown & Six-Week Summary (452 FTTH Tickets | 0 Transport Tickets)

### Photographed Shift Handover Snapshots (FTTH Only)
| Date | Total | \`CCS\` | \`Call Centre\` | \`Open Access\` | \`Resolved\` | \`TLS\` | \`Pending to NOC\` | \`OSS\` | \`NAS\` | Observed Record Highlights |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| **Oct 11** | **40** | 10 | 15 | 7 | 6 | 0 | 2 | 0 | 0 | Verified Week 7 FTTH handover baseline |
| **Oct 19** | **16** | 6 | 6 | 2 | 2 | 0 | 0 | 0 | 0 | Balanced mid-shift queue with 100% accuracy |
| **Oct 20** | **97** | 34 | 30 | 9 | 16 | 3 | 2 | 1 | 2 | **All-time peak** (sample ID: \`INC000003443563\`) |
| **Oct 21** | **45** | 25 | 11 | 6 | 3 | 0 | 0 | 0 | 0 | Progressed from \`36\` (10:28 PM) to \`45\` (11:57 PM) |
| **Oct 29** | **31** | 16 | 3 | 5 | 3 | 2 | 0 | 2 | 0 | Documented FTTH handover shift — Transport tickets = 0 (\`INC000003464990\`–\`INC000003461185\`) |

### Six-Week Consolidated Activity Summary (452 FTTH Tickets | 0 Transport Tickets)
| Week | Dates | Assignment | Tickets Handled | Operational Summary |
| --- | --- | --- | ---: | --- |
| **Week 7** | Oct 11 – Oct 15 | \`FTTH\` Specialist | 138 FTTH | Full live ticket execution across \`CCS\`, \`Call Centre\`, and \`Open Access\` |
| **Week 8** | Oct 18 – Oct 22 | \`FTTH\` Specialist | 193 FTTH | Peak throughput including **97 tickets on Oct 20** and 45 on Oct 21 |
| **Week 9** | Oct 25 – Oct 29 | \`Transport\` Trainee + Oct 29 FTTH | 0 Trans (31 FTTH) | **0 Transport tickets** (training & observation only); 31 FTTH tickets captured Oct 29 |
| **Week 10** | Nov 01 – Nov 05 | \`Transport\` Trainee | 0 Tickets | **Technical Training & Observation Only — No Tickets Assigned** (\`DWDM/OTN/MPLS\`, \`SNFN\`) |
| **Week 11** | **Nov 08 – Nov 12** | **\`Transport\` Trainee** | **0 Tickets** | **Technical Training & Observation Only — No Tickets Assigned** (Topologies, \`OTDR\`, \`A1–A3\`, \`Remedy\`) |
| **Week 12** | **Nov 15 – Nov 19** | **Returned to \`FTTH\`** | **~90 FTTH** | Handled ~90 distributed tickets alongside evolved FTTH ticketing automation |
| **Total** | **Oct 11 – Nov 19** | **Weeks 7–12** | **452 FTTH** | **0 Transport Tickets Assigned | 97.4% SLA Target Compliance** |

### FTTH Category Distribution (452 Verified Cases)
| # | Category | Total | Share |
|---|---|---:|---:|
| 1 | \`CCS\` | **165** | 36.5% |
| 2 | \`Call Centre\` | **110** | 24.3% |
| 3 | \`Open Access\` | **66** | 14.6% |
| 4 | \`Resolved Direct\` | **55** | 12.2% |
| 5 | \`TLS\` | **29** | 6.4% |
| 6 | \`NOC & OSS\` | **27** | 6.0% |
| — | **Total FTTH Tickets** | **452** | **100.0%** |

---

# 2. The B2B Nature of Transport & External/Internal Stakeholders

Unlike residential \`FTTH\` support (\`B2C\`), **Transport Networks operate almost exclusively in a Business-to-Business (\`B2B\`) environment**. Here, the "Customer" is another telecom operator, internet service provider (\`ISP\`), enterprise corporation, bank, data center, or government body leasing high-capacity wavelengths, Dedicated Internet Access (\`DIA\`), \`MPLS\` VPNs, or Dark Fiber. Because a single backbone circuit aggregates thousands of downstream endpoints, B2B transport faults demand disciplined multi-party coordination:

* **Domestic Saudi Carriers:** Interconnecting and coordinating trouble isolation with **\`STC\`**, **\`Mobily\`**, **\`Zain\`**, **\`Salam (ITC)\`**, **\`Dawiyat\`**, and **\`GO\`**.
* **National Fiber Backbone (\`SNFN\`):** Coordinating long-haul terrestrial fiber maintenance, span verification, and cut restoration across the **Saudi National Fiber Network**.
* **International Wholesale & Transit Carriers:** Managing high-capacity cross-border and subsea gateways alongside Tier-1 partners such as **\`TATA Communications\`**, **\`GCX\`**, regional Arab carriers (Jordan, UAE, Bahrain, Kuwait, Oman, Qatar, Egypt), and global exchanges (**London \`LINX\`**, **Frankfurt \`DE-CIX\`**).
* **Internal Operations Teams:** Aligning seamlessly with **\`NOC\`** engineers, **\`Back Office (BO)\`** Tier-2/3 specialists, **\`Network Planning & Design\`**, **\`Field Operations (FOPS)\`**, **\`Power & Facilities\`**, and **\`B-Care\`** enterprise account desks.

---

# 3. Core Transport Stack: How \`DWDM\`, \`OTN\` & \`MPLS\` Operate Together

Modern carrier backbones layer three specialized technologies over underground optical fiber to maximize bandwidth, fault visibility, and resilience:

1. **\`DWDM\` (Dense Wavelength Division Multiplexing — Layer 0/1 Optical Carrier):** Combines **40 to 120 independent laser wavelengths (\`C-Band\`)** onto a single pair of single-mode fibers using **Transponders/Muxponders** and **Mux/Demux or \`ROADM\`** switches. **\`EDFA\`** and Raman optical amplifiers boost weakened signals every ~80–100 km without electrical regeneration, while an Optical Supervisory Channel (\`OSC\`) monitors node health end to end.
2. **\`OTN\` (Optical Transport Network / \`ITU-T G.709\` — Digital Wrapper):** Wraps client traffic into standardized digital containers (**\`OPUk → ODUk → OTUk\`**) riding over DWDM wavelengths. OTN adds **Forward Error Correction (\`FEC\`)** to detect and recover optical bit errors (\`Pre-FEC BER\`) early, supports multi-carrier **Tandem Connection Monitoring (\`TCM\`)** for SLA verification, and delivers **sub-50 ms \`SNCP / 1+1\` optical protection switching**.
3. **\`MPLS\` (Multiprotocol Label Switching — Layer 2.5 Packet Core):** Operates on Provider Edge (\`PE\`) and Core (\`P\`) routers (\`Huawei NE40E/NE8000\`, \`Cisco ASR 9000\`). Packets entering from Customer Edge (\`CE\`) routers receive compact numeric labels defining **Label Switched Paths (\`LSPs\`)** via \`LDP / RSVP-TE / SR-MPLS\`. Each enterprise B2B client is isolated inside a dedicated **\`VRF\` (\`L3VPN / L2VPN\`)** advertised via \`MP-BGP\`, backed by **\`QoS\` prioritization** and **sub-50 ms \`Fast Reroute (FRR)\`**.

| Dimension | \`DWDM\` | \`OTN (ITU-T G.709)\` | \`MPLS Core\` |
| --- | --- | --- | --- |
| **Network Layer** | Optical Photonic Layer (\`L0 / L1\`) | Digital Transport Wrapper (\`L1\`) | Packet / Label Switching (\`L2.5\`) |
| **Transport Unit** | Optical Wavelength (\`λ\`) | Digital Frame (\`OPUk / ODUk / OTUk\`) | Label-Switched Packet (\`LSP\`) |
| **Representative Nodes** | \`OptiX OSN\`, \`Cisco NCS 2000\`, \`Nokia 1830 PSS\` | OTN Line & Tributary Cards | \`Huawei NE40E/NE8000\`, \`Cisco ASR 9000\` |
| **Core Value** | Multi-terabit fiber capacity & amplification | FEC error recovery, multi-carrier OAM, \`<50ms\` protection | B2B \`VRF\` isolation, \`BGP\` routing & \`FRR\` |

---

# 4. Topologies, Diagram Ownership, \`SNFN\` & International Internet Routing

<!-- transport-architecture-diagrams -->

## 4.1 Network Topologies & Diagram Ownership
* **Core Topologies Studied:**
  * **Point-to-Point (Linear):** Direct two-node span for short-haul interconnections; requires parallel diverse backup if \`1+1\` protected.
  * **Ring Topology:** Closed multi-node loop enabling bi-directional automatic traffic reversal (**\`<50 ms\`** via \`SNCP\`) whenever a span cuts.
  * **Mesh / Partial Mesh:** Dense multi-path connectivity across \`ROADM\` and \`MPLS\` core POPs (\`Riyadh\`, \`Jeddah\`, \`Al-Khobar\`), preventing regional outages even under simultaneous link disruptions.
  * **Dual-Homed B2B Hub-and-Spoke:** Connects high-value corporate \`CE\` devices to two separate \`PE\` routers over physically diverse ducts.
* **Who Sends and Maintains Network Diagrams:** High-Level & Low-Level Designs (**\`HLD / LLD\`**) originate from **Network Planning & Design Engineering**; upon circuit activation, **Provisioning / Service Delivery Teams** and partner carriers issue official **Circuit Layout Records (\`CLR\`)** and logical peering diagrams to \`NOC\` and \`Back Office\`; finally, **Outside Plant (\`OSP\`) & \`SNFN\` Fiber Teams** supply georeferenced **\`As-Built\` & \`GIS/KMZ\` Fiber Route Maps** used during cut localization.

## 4.2 \`SNFN\` & How Internet Traffic Leaves Saudi Arabia (London, Germany, Jordan & Arab States)
* **Saudi National Fiber Network (\`SNFN\`):** An ultra-broadband **~19,000+ km** domestic long-haul fiber infrastructure built by **\`Salam (ITC)\` and \`Mobily\`** and modernized with high-capacity optical systems. \`SNFN\` links every major Saudi city and data center directly to land borders and submarine cable landing stations.
* **International Traffic Routing Beyond Saudi Arabia:**
  1. **Domestic Aggregation:** Customer and ISP traffic traverses \`SNFN\` optical trunks into Saudi **International Gateways (\`IGW\`)** located in \`Riyadh\`, \`Jeddah\`, and \`Al-Khobar\`.
  2. **Terrestrial Cross-Border Corridors:** Direct cross-border fiber gateways interconnect Saudi Arabia with **Jordan (\`Amman / Aqaba\`)**, **UAE**, **Bahrain**, **Kuwait**, **Qatar**, **Oman**, **Iraq**, and **Egypt**—providing resilient overland paths (including the Saudi Transit Corridor to Jordan and Mediterranean interconnections via Aqaba).
  3. **Submarine Landing Stations & European Hubs:** Major subsea cables terminating in **Jeddah (Red Sea)** and **Al-Khobar (Arabian Gulf)**—such as \`FALCON\`, \`FEA\`, \`SEA-ME-WE\`, \`IMEWE\`, \`AAE-1\`, \`2Africa\`, and \`Medusa\`—transit Egypt/Mediterranean toward premier European Internet Exchange Points in **London, UK (\`LINX / Telehouse\`)** and **Frankfurt, Germany (\`DE-CIX\`)** via Tier-1 transit and peering carriers (\`TATA\`, \`GCX\`, and global content providers).

---

# 5. Hardware Equipment, Optical Cables & \`OTDR\` Cut Localization

<!-- transport-hardware-visuals -->

## 5.1 Hardware & Optical Cable Reference
* **Core Hardware Shelves:** Optical \`DWDM/OTN\` platforms (\`Huawei OptiX OSN 9800/1800\`, \`Cisco NCS 2000/1000\`, \`Nokia 1830 PSS\`, \`Ciena 6500\`), IP/MPLS Core & Edge routers (\`Huawei NE40E/NE8000\`, \`Cisco ASR 9000\`, \`Juniper MX\`), Access OLTs & passive \`ODF\` patch panels, and field test kits (**\`OTDR\`**, **Fusion Splicer**, \`OPM\`, \`VFL\`, \`OSA\`).
* **Cable Classes in Service:**
  * **Single-Mode Indoor Patchcords (\`SMF OS2 G.652D/G.655\`, \`9/125 µm\`):** Yellow jumpers linking \`ODF\` ports to optical transceivers inside POPs.
  * **Multi-Mode Short-Reach Jumpers (\`MMF OM3/OM4\`, \`50/125 µm\`):** Aqua cables for intra-rack/short data-center spans.
  * **Armored Underground Trunk Cables:** Black heavy polyethylene jacket with corrugated steel tape armor protecting multi-tube long-haul \`SNFN\` intercity fibers from excavation and rodents.
  * **Submarine Fiber Cables:** Heavy multi-layer steel armor wires and copper power conductors feeding undersea repeaters across ocean beds.
  * **Support Cabling:** Dual redundant **\`-48V DC\`** power feeds (\`Feed A / Feed B\`) and \`Cat6/Cat6A\` out-of-band management cabling.

## 5.2 Pinpointing Exact Fiber Cuts with \`OTDR\`
1. **Alarm Trigger:** A broken buried fiber causes immediate Loss of Signal (\`R_LOS\`, \`A1\` critical) on the adjacent \`POP\` optical ports.
2. **OTDR Measurement:** Field technicians connect an **Optical Time-Domain Reflectometer (\`OTDR\`)** at the nearest \`ODF\`, injecting high-frequency optical test pulses and analyzing returning **Rayleigh backscatter** alongside the sharp **Fresnel reflection spike** generated at the fiber break.
3. **Distance Computation:** Using round-trip pulse delay \`t\` and glass refractive index \`n ≈ 1.468\`, the instrument resolves cut distance down to meter accuracy: **\`d = (c × t) / (2 × n)\`** (e.g., \`24.38 km\`).
4. **GIS/KMZ Correlation & Restoration:** Engineers map that exact distance (accounting for manhole fiber slack loops) onto \`As-Built GIS/KMZ\` drawings to identify the precise manhole or third-party digging site, dispatch field fusion-splicing teams, weld the severed fibers, verify splice loss via a follow-up \`OTDR\` trace, and confirm alarm recovery in the \`NOC\`.

---

# 6. NOC Monitoring: \`A1–A3\` Alarms, Isolation & \`BMC Remedy\` Ticketing

## 6.1 Transport Alarm Classification (\`A1\` Highlighted) & Fault Isolation
* **\`A1\` (Critical — Service Affecting — Primary Monitored Class):** Represents active or imminent outage on a core optical trunk, international transit link, or primary \`B2B\` transport node (such as \`R_LOS\` fiber cut, \`LOF\` frame misalignment across framing bytes, or total power feed failure). Triggers immediate NOC triage, \`Critical\` Remedy ticketing, and urgent escalation.
* **\`A2\` (Major):** Significant capacity degradation or loss of backup path protection (redundancy at risk) requiring rapid intervention.
* **\`A3\` (Minor):** Non-service-affecting anomalies or preventive hardware threshold warnings tracked routinely.

**Root-Cause Isolation Logic:** When a major optical cut floods the \`NMS\` screen, NOC engineers locate the **earliest physical \`R_LOS / LOF\` alarm** rather than downstream **\`AIS\`** (Alarm Indication Signal propagated forward so downstream nodes suppress false panic) or upstream **\`BDI / RDI\`** notifications. Correlating optical power (\`Rx/Tx\`), interface state, and \`BGP\` peering (\`Established\` vs. \`Active/Idle\`) isolates whether the root fault lies inside the local POP, along national \`SNFN\` trunks, at a \`B2B\` premise, or on an international partner span.

## 6.2 Step-by-Step Incident Creation in \`BMC Remedy\`
1. **Launch New Incident:** Authenticate into **\`BMC Remedy ITSM / Smart IT\`** and select **\`NTT\`** (Network Trouble Ticket) for shared/backbone outages or **\`CTT\`** for isolated single-\`B2B\` customer faults.
2. **Populate B2B & Circuit Identity:** Attach the impacted corporate/carrier entity, **\`Service ID / Circuit ID\`**, and originating \`POP\`.
3. **Standardize the Summary Line:** Use consistent format: \`[Critical A1] R_LOS / Link Down - [POP] - [Circuit/Carrier] - [Impact]\`.
4. **Record Technical Diagnostics:** Log exact alarm UTC/local timestamp, \`A1\`/\`A2\` class, chassis/slot/port coordinates, optical Rx/Tx levels or \`BGP\` peer state, customer/traffic impact, and preliminary checks already completed.
5. **Select Operational & Product Categorization:** Map \`Tier 1 / Tier 2 / Tier 3\` accurately (e.g., \`Network → Transport → DWDM / Fiber Cut / IP Transit\`).
6. **Assign Impact, Urgency & Priority:** Align SLA timers strictly with alarm severity (\`Critical\` for \`A1\`).
7. **Route to the Owning Support Group:** Keep international transit escalations in the \`NOC\` queue while emailing global carriers, or assign to \`Transport Back Office (BO)\`, \`FOPS / SNFN\` for \`OTDR\`/splicing dispatch, or \`Power Team\` for facility alarms.
8. **Track Reference \`INC00000...\` Through Closure:** Reference the generated Remedy ticket ID across all carrier communications, maintain timestamped **Work Info** updates, confirm \`R_LOS\` clearance post-restoration, document final **Root Cause Analysis (\`RCA\`)**, and close cleanly.

---

<!-- pagebreak -->

<!-- analytics-charts-p2 -->

---

<!-- pagebreak -->

# 7. Challenges, Conclusion & Practical Recommendations

Bridging active \`FTTH\` execution (**331 tickets** in Weeks 7–8 plus **~90 distributed tickets** upon returning in Week 12 alongside evolved ticketing automation) with \`B2B\` Transport training across Weeks 9–11 (Oct 11 – Nov 19) built a clear end-to-end understanding of how individual subscriber fiber lines aggregate into national \`SNFN\` trunks and international gateways reaching Jordan, regional Arab neighbors, Frankfurt, and London. Practical recommendations going forward include coupling real-time \`OTDR\` break distances directly with \`GIS/KMZ\` route maps in NOC runbooks, attaching updated \`Circuit Layout Records\` to \`BMC Remedy\` B2B tickets, and preserving standardized diagnostic handoffs between \`FTTH\` and \`Transport\` engineering teams.`
};
