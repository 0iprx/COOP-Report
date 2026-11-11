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

// ── Master Academic Arabic Report for Period 2 (Oct 11 – Nov 05) ──────
export const DEFAULT_REPORT_P2_AR: FreshPeriodicReport = {
  title: 'التقرير الفتري الثاني — التقرير الفني الأكاديمي الشامل',
  majorField: 'عمليات الألياف الضوئية (FTTH) وشبكات النقل والتراسل (Transport Domain) وهندسة مراكز العمليات (NOC)',
  department: 'شركة سلام للاتصالات — إدارة عمليات الألياف (FTTH) وإدارة شبكات النقل ومراقبة الإنترنت (NOC)',
  roleAssignment: 'موظف فعلي في قسم FTTH (الأسابيع 7–8) ومتدرب هندسي في قسم النقل (Transport Domain) ومشروع بوابة المعرفة (الأسابيع 9–10)',
  periodCoverage: 'من 11/10 إلى 5/11',
  stageOneHours: '',
  stageTwoHours: '',
  intervals: [
    {
      id: 'int_p2_1',
      label: 'الفصل الأول: التشغيل الفعلي لخدمات الألياف الضوئية (FTTH)',
      startDate: 'الأسابيع 7 و 8',
      endDate: '482 تذكرة | التزام 97.4%',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_2',
      label: 'الفصل الثاني: إجراءات التشغيل القياسية لقطاع النقل (TS-01 – TS-04)',
      startDate: 'الأسابيع 9 و 10',
      endDate: 'BGP / IGW / DIA / Spider',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_3',
      label: 'الفصل الثالث: البنية الضوئية (DWDM/OTN) والنواة والأتمتة',
      startDate: 'TR / HW / AL / AU',
      endDate: 'MPLS / Python / NBI',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_4',
      label: 'المشروع التكميلي: بوابة المعرفة التفاعلية لعمليات الشبكة والميدان',
      startDate: 'NOC Knowledge Portal',
      endDate: '22 وحدة | 5 محاكاة | 162 سؤالاً',
      timeFrom: '',
      timeTo: ''
    }
  ],
  customNarrative: `# الملخص التنفيذي ونطاق التقرير (من 11/10 إلى 5/11)

يُقدّم هذا التقرير التوثيق الأكاديمي والهندسي النهائي للفترة التدريبية الممتدة **من 11 أكتوبر إلى 5 نوفمبر** (الأسابيع: السابع، الثامن، التاسع، والعاشر) ضمن متطلبات التدريب التعاوني. صُمّم هذا التقرير وفق منهجية تقارير الهندسة الجامعية ليربط بين **الممارسة التشغيلية الميدانية المباشرة** و**التأصيل النظري والمعماري** في بيئة شبكات الاتصالات الحديثة، عبر مسارين متكاملين ومشروع معرفي تطبيقي:

1. **المسار التشغيلي الأول — عمليات الألياف الضوئية (\`FTTH Operations\`) خلال الأسبوعين 7 و 8:** الاستمرار في أداء مهام الموظف الفعلي المستقل في إدارة البلاغات الحية، وتحليل قياسات الإشارة الضوئية، والتعامل مع أنظمة الدعم والتسليم (\`Handover Tools\`)، مما أثمر عن معالجة **482 تذكرة تشغيلية فريدة** وصولاً إلى ذروة إنتاجية قدرها **97 تذكرة في مرحلة واحدة** مع تحقيق معدل التزام باتفاقية مستوى الخدمة (\`SLA\`) بلغ **97.4%**.
2. **المسار الهندسي الثاني — قطاع شبكات النقل والتراسل (\`Transport Domain & NOC\`) خلال الأسبوعين 9 و 10:** الانتقال التخصصي إلى مركز مراقبة شبكات النقل؛ لاكتساب منظومة إجراءات التشغيل القياسية (\`SOPs\`) لمعالجة إنذارات العمود الفقري (\`BGP Down\`، توقف عناصر الشبكة، إنذارات المراوح والكهرباء)، وبوابات الإنترنت الدولية (\`IGW: IP Transit & Peering\`)، والدوائر المؤسسية المخصصة (\`DIA, GCX, KAUST, VSAT, Dark Fiber\`)، ومراقبة أعطال الألياف المغذية، إلى جانب التوسع في طبقات النقل الضوئي (\`DWDM/OTN\`) وتوجيه النواة (\`MPLS\`) وأتمتة العمليات بلغة \`Python\`.
3. **المخرج الابتكاري المصاحب — بوابة المعرفة التفاعلية لعمليات الشبكة والميدان (\`NOC Knowledge Portal\`):** تطوير تطبيق ويب هندسي ثنائي اللغة (عربي/إنجليزي) يجمع **22 وحدة معرفية** و**5 سيناريوهات محاكاة تفاعلية (26 خطوة قرار)** و**بنكاً من 162 سؤالاً تقنياً** لتوحيد المرجعية التشغيلية في أقسام \`FTTH\` و\`Transport\` والأتمتة والوصول والمرافق وشبكات الجيل الخامس \`5G\`.

---

# الفصل الأول: العمليات الميدانية والتشغيلية في قسم الألياف الضوئية (\`FTTH\`)

ارتكز العمل خلال الأسبوعين السابع والثامن على الجمع بين التحليل الإحصائي اليومي لتوزيع البلاغات وتطبيق إجراءات المعالجة القياسية (\`FT-01\` إلى \`FT-04\`) لضمان دقة التشخيص قبل التصعيد أو الإغلاق.

## 1.1 التحليل الكمي والتوزيع الإحصائي للتذاكر المعالجة (482 تذكرة)

تم رصد وتصنيف **482 تذكرة وبلاغاً** عبر منظومة التسليم (\`Handover Dashboard\`)، ويوضح **الجدول رقم (1)** التوزيع العددي والنسبي حسب المسار التشغيلي:

| م | القناة أو التصنيف التشغيلي | عدد التذاكر | النسبة المئوية | الوصف الهندسي والدور التشغيلي المنفذ |
|---|---|---:|---:|---|
| 1 | **نظام خدمة العملاء والدعم (\`CCS\`)** | 176 | 36.5% | متابعة البلاغات المركزية ومطابقة بيانات الاشتراك وحالة المنفذ في الأنظمة. |
| 2 | **إحالات مركز الاتصال (\`Call Centre\`)** | 117 | 24.3% | تشخيص الأعطال الواردة وتوجيهها بالوصف الفني الدقيق (\`Diagnostic Comment\`). |
| 3 | **النفاذ المفتوح والمشغلين (\`Open Access\`)** | 70 | 14.5% | تنسيق البلاغات المشتركة بين سلام والشركات الطالبة (\`STC, Zain, Mobily, GO\`). |
| 4 | **المعالجة والإغلاق الفوري (\`Resolved Direct\`)** | 57 | 11.8% | حسم البلاغات مباشرة بعد فحص القراءات الضوئية واستقرار جلسة \`ACS / PPPoE\`. |
| 5 | **الدعم التخصصي (\`TLS\`)** | 31 | 6.4% | تصعيد الحالات المعقدة التي تتطلب تدخلاً تقنياً متخصصاً على الشبكة. |
| 6 | **مركز العمليات والأنظمة (\`NOC & OSS\`)** | 31 | 6.5% | معالجة حالات البنية المشتركة أو نقص المزامنة في قواعد البيانات والأنظمة. |
| — | **الإجمالي الموثق للفترة** | **482** | **100.0%** | **التزام تشغيلي بمستوى الخدمة (\`SLA\`) بلغ 97.4% دون أخطاء تصعيد.** |

وقد سُجّلت **الذروة التشغيلية في تاريخ 20 أكتوبر** بإنجاز **97 تذكرة** في نوبة عمل واحدة (توزعت بين \`CCS: 34\`، \`Call Centre: 30\`، \`Resolved: 16\`، \`Open Access: 9\`، \`TLS: 3\`، \`NOC: 2\`، \`NAS: 2\`، \`OSS: 1\`)، تلتها مراحل مرتفعة الإنتاجية مثل (\`45\`، \`40\`، \`38\`، \`35\`، \`34\`، \`32\`، \`31\` تذكرة).

## 1.2 المنهجية القياسية للتشخيص ومعالجة الأعطال (\`FT-01\` إلى \`FT-04\`)

* **فرز الحالة المرجعية في \`Remedy\` و\`MOSS\` (\`FT-02\`):** البدء بالتحقق من حقل \`Provider Name\` وتصنيف \`Tier 3\`؛ فحالات \`ITC\` تخضع لإجراءات \`Link Down / Slowness / Browsing / Landline\`، وحالات النفاذ المفتوح بين سلام والمشغلين تُوجّه لمسار \`Open Access\`، أما المجمعات السكنية (\`Product = ZoomComp\`) فتُفحص عبر منصتي \`Zooom\` و\`AAA\`، مع التأكد من عدم وجود إيقاف مالي (\`Suspended\`) في \`MOSS\` والبحث بـ \`Service ID\` أو \`ONU SN\` أو \`LOID\`، وتصعيد حالات انعدام البيانات إلى \`OSS App Support\`.
* **المعايير الضوئية وربط الخدمات (\`FT-01\` & \`FT-03\`):** الالتزام بفحص القدرة الضوئية المستقبلة (\`RX Power\`) ضمن النطاق الآمن المعتاد **\`-10 dBm\` إلى \`-26 dBm\`** عبر منصة \`Huawei NCE\` أو \`Nokia AMS\`، والتحقق من مطابقة خدمات الـ \`CVLAN\` القياسية: خدمة الإنترنت (\`1501 - HSI\`)، خدمة الإدارة التلقائية (\`3980 - ACS / TR-069\`)، والخدمة الصوتية (\`1810 - VoIP\`).
* **تجهيز واستبدال أجهزة المشتركين (\`ONT Replacement\`):** عند ثبوت عطل عدم استقرار المنفذ (\`PON not stable\`) على \`Huawei NCE\`، يتم تطبيق قاعدة الأمان الصارمة: توثيق \`Line/Service Profile\` وكافة \`Service Port VLANs\` ومطابقة الموقع الفيزيائي (\`OLT/Slot/Port\`) مع \`MOSS\` قبل حذف الـ \`ONT\` القديم، ثم اعتماد الجديد وإعادة بناء الـ \`VLANs\` وتسميته برقم \`Service ID\`.
* **إدارة إعلانات الصيانة المجدولة (\`MDT — FT-04\`):** متابعة طلبات التغيير الواردة من \`NMC Change Management\` (\`REQUEST || CRQ...\`)، واستخراج العقد والمواقع المتأثرة ومدة الانقطاع من نظام \`SDM\`، ثم تصفية ملف الأثر (\`Impact list\`) لكل مشغل طالب (\`_STC\`, \`_Zain\`, \`_Mobily\`, \`_GO\`) وإرسال إشعار بريد منفصل لكل جهة عبر \`FTTH-NOC@tls.sa\` لضمان السرية وعدم خلط بيانات المشغلين.

---

# الفصل الثاني: إجراءات التشغيل القياسية في قطاع النقل (\`Transport Domain SOPs\`)

خلال الأسبوعين التاسع والعاشر، انتقل التركيز الهندسي إلى بيئة مركز عمليات الشبكة (\`NOC\`) لقطاع النقل والتراسل، وتم استيعاب وتطبيق أربع منظومات تشغيلية رئيسية (\`TS-01\` إلى \`TS-04\`):

## 2.1 مصفوفة معالجة إنذارات النقل الأساسية (\`TS-01\`)

يوضح **الجدول رقم (2)** بروتوكول الاستجابة القياسي لأنواع الإنذارات الحرجة في شبكة النقل:

| نوع الإنذار | أدوات التشخيص والأوامر المعتمدة | قاعدة القرار والتصعيد القياسي (\`SOP\`) |
|---|---|---|
| **توقف الجهاز (\`Device has stopped\`)** | منصة \`CA Performance → Health → IfAlias\` + قاعدة بيانات \`Spider\` | **عميل واحد:** التنسيق مع \`B-care\` لفتح \`CTT\` ومراجعة الكهرباء. **عدة عملاء:** فتح تذكرة شبكة \`NTT\` + إرسال إشعار \`Sudden Outage Notice\` + التواصل مع فريقي الدعم والكهرباء. |
| **سقوط جلسة توجيه (\`BGP down\`)** | الدخول عبر SSH (\`Cisco IOS XR\`) وتنفيذ \`show route <IP>\` و\`show interfaces\` وقراءة وصف الواجهة | **جلسة عميل (\`Customer Session\`):** يُتجاهل الإنذار حسب الإجراء. **عنصر شبكة (\`NE\`):** فتح \`Critical NTT\` فوراً، إسنادها والاتصال بـ \`Back Office (BO)\` ومراسلة المزود. التمييز الدقيق بين \`Active / Idle\` (سقوط) و\`Established\` (عمل). |
| **إنذار المراوح والكهرباء (\`Faulty FAN / Power\`)** | الدخول إلى الجهاز عبر SSH وتنفيذ \`show env fan\` و\`show env all\` | إذا كانت القراءات طبيعية يُغلق الإنذار كـ **إنذار كاذب (\`False Alarm\`)**؛ وإذا ثبت العطل تُفتح تذكرة \`NTT\` لفريق \`Back Office\` مع إرسال الفريق الميداني. |
| **أنظمة النواة الحساسة (\`DPI / Sandvine / Voice / Wirefilter / DNS\`)** | رصد الحدث على لوحة الإنذارات والتحقق من تأثير المنصة | فتح تذكرة \`NTT\` فورية، إسنادها إلى فريق \`NAS\`، والاتصال الهاتفي المباشر بالمناوب في \`Back Office\`. |

## 2.2 إدارة بوابة الإنترنت الدولية (\`TS-02 — IGW: IP Transit & Peering\`)

* **توحيد تذاكر الانقطاع الدولي:** عند سقوط رابط عبور دولي (\`IP Transit\`) مع مزودين مثل \`TATA\` أو \`STC\` أو \`Mobily\` أو رابط تبادل (\`Peering\`)، تُفتح **تذكرة \`Critical NTT\` واحدة موحدة** في صندوق \`NOC\` تشمل جميع المزودين المعنيين مع إرسال بريد جماعي لكافة المزودين لمتابعة الحادثة.
* **عتبة الازدحام التشغيلي (\`85% Utilisation Rule\`):** مراقبة استهلاك الروابط العاملة المتبقية عبر نظام \`Cacti\`؛ وعند تجاوز التحميل نسبة **85%** تُفتح تذكرة \`Major NTT\` وتُسند فوراً إلى فريق \`NAS\` مع الاتصال بمناوب \`BO\` والإبلاغ في مجموعة العمل.
* **قاعدة التصعيد الحرج (\`P0 > 200G\`):** في حال تجاوز الأثر الإجمالي للسعات المفقودة **200 Gbps**، يجب إبلاغ قائد المناوبة (\`Shift Lead\`) فوراً وتفعيل مصفوفة تصعيد الطوارئ **\`P0\`**.
* **تفسير تشخيصات \`SNFN\`:** استيعاب الدلالة الهندسية لرسالة فريق \`SNFN\` (*"observing local fault alarm at ITCJ from client port"*)، والتي تثبت سلامة البنية والمسار الوطني وحصر الخلل في الجانب الدولي لمتابعته مع المزودين الدوليين.

## 2.3 تتبع الدوائر المخصصة والعملاء المؤسسيين (\`TS-03 — DIA, GCX, KAUST, VSAT, Dark Fiber\`)

تم إتقان مسار التتبع متعدد الطبقات لدوائر الإنترنت المخصص (\`DIA\`) و\`GCX\` التابعة لمزودين مثل (\`STC\`, \`APTech\`, \`Mobily\`, \`Mawarid\`) وفق التسلسل الهندسي التالي:

1. **الاستخراج المرجعي:** نسخ معرّف الخدمة (\`Service ID\`) من نظام تذاكر \`SDM\`.
2. **مطابقة الدائرة في \`B-care Spider\`:** استخدام اختصار البحث (\`F11\` ← لصق المعرّف ← \`Ctrl+F11\`) ثم الانتقال إلى \`Metro Ethernet\` لاستخلاص: \`Partner Circuit ID\`، و\`Partner Name\`، ورقم الـ \`VLAN\`، واسم نقطة التواجد (\`Pop Name\`).
3. **التشخيص العملي على موجهات \`Huawei NE40E\`:** الدخول عبر \`SecureCRT\` أو \`PuTTY\` وتنفيذ سلسلة الأوامر التشخيصية:
   * استعلام ربط التوجيه: \`display current-configuration interface Vlanif <VLAN>\` لاستخراج اسم الشبكة الافتراضية (\`vpn-instance\`) وعنوان الـ IP من قناع \`/30\`.
   * استنتاج عنوان الجار (\`Neighbor IP\` عبر زيادة خانة \`+1\` إذا كان الأول بالشبكة الفرعية) ثم فحص جلسة التوجيه: \`display bgp vpnv4 vpn-instance <VRF> peer\` للتحقق مما إذا كانت الحالة \`Established\` أم منقطعة (\`Active / Idle\`).
   * فحص السجل اللحظي للأعطال عبر \`display logbuffer\` ومراجعة رسوم الحركة في \`Cacti\`، ثم مخاطبة المزود مع إرفاق رقم الحادثة.
4. **الحالات الخاصة المؤسسية:** إرسال إقرار استلام فوري (\`Acknowledgement\`) لعملاء \`KAUST\` قبل فحص معرّفات \`SNFN\` أو منافذ الموجهات في المخططات الهندسية؛ وإسناد تذاكر \`VSAT\` الواردة من الدعم إلى فريق \`VSAT\` مع إنشاء أمر عمل ميداني (\`WO\`) عند الحاجة؛ ومعالجة انقطاعات الألياف المظلمة (\`Dark Fiber\`) مع \`Zain\` بفتح \`NTT\` وإرفاق صورة الموقع من وثيقة التصميم إلى \`SNFN\`.

## 2.4 مراقبة إنذارات الـ FTTH من منظور شبكة النقل (\`TS-04\`)

* **تمييز انقطاع الكابل المغذي (\`Feeder fiber broken\`):** التحقق عبر \`Huawei NCE\` (أو \`Nokia AMS\` الحصري للمنطقة الشرقية)؛ حيث يُتجاهل إنذار الطاقة لمستخدم مفرد، بينما سقوط عدة منافذ \`PON\` متجاورة يؤكد قطعاً حقيقياً يستوجب فتح \`NTT\` وإرسال الفريق الميداني.
* **فرز فقدان الإشارة (\`Loss of signal\`):** قراءة حقل \`Current Reporting Status\`؛ فظهور حالة \`Dying gasp\` يعني انقطاع تيار كهربائي لدى المشترك ويُتجاهل من مستوى المراقبة، وإلا يتم التصعيد الميداني عبر \`NTT\`.
* **حساب الأثر الكلي عند سقوط \`OLT\`:** استخراج وتصدير قوائم المشتركين بصيغة \`CSV\` عبر مسار \`Huawei NCE\` (\`GPON Management → GPON ONU → Find → Ctrl+A → File → Save As\`) أو \`Nokia AMS\` (\`Inventory → Query → Object Type = ONT → Save CSV\`) وتصفيتها برقم المنفذ المتأثر.

---

# الفصل الثالث: البنية الضوئية، ربط الإنذارات، الأتمتة وبوابة المعرفة الشاملة

انطلاقاً من أن منظومة العمل الهندسي في مراكز العمليات (\`NOC\`) تتجاوز مجرد تنفيذ الإجراءات اليومية لتشمل فهم الطبقات الفيزيائية والأتمتة والتكامل بين جميع أقسام الشبكة، تم توسيع المعرفة المكتسبة وتوثيقها في الأطر التالية:

## 3.1 النقل البصري (\`DWDM / OTN\`) وتوجيه النواة (\`MPLS\`) ومنصات المصنّعين (\`TR-01\`, \`TR-02\`, \`HW-01–04\`, \`AL-01\`)

| المجال الهندسي | المفاهيم والمكونات الفنية المستوعبة | التطبيق التشغيلي في عزل الأعطال |
|---|---|---|
| **النقل الضوئي (\`DWDM & OTN\`)** | طبقات \`OTS\`, \`OMS\`, \`OCh\`, \`OTUk\`, \`ODUk\`, \`OPUk\`؛ قناة الإشراف الضوئي \`OSC\`؛ معاملات \`Span Loss\`, \`OSNR\`, \`CD/PMD\`. | استخدام ارتفاع \`Pre-FEC BER\` كمؤشر إنذار مبكر لتدهور المسار الضوئي مع بقاء \`Post-FEC = 0\` قبل حدوث انقطاع فعلي. |
| **أجهزة التراسل متعددة المصنّعين** | منصات \`Cisco NCS 1000 / NCS 2000\` (\`EPNM\`)، و\`Huawei OptiX OSN\` (\`NCE\`)، و\`Nokia 1830 PSS\` (\`NFM-T\`). | توحيد قراءة المستويات والإنذارات والتحقق من إصدارات البرمجيات (\`show hw-module fpd\`) وتنسيق إجراءات الفحص الوقائي. |
| **عزل عواصف الإنذارات (\`AL-01\`)** | تتبع التسلسل الزمني للإنذارات عند انقطاع وصلة ليفية عالية السعة وعزل السبب الجذري (\`Root Cause\`). | التمييز بين **الإنذار الجذري الأقدم** (\`R_LOS / LOS-P / OTUK_LOF\`) والإنذارات التابعة للمصب (\`MS_AIS / ODUk_PM_AIS\`) أو المنبع (\`BDI / RDI\`) لفتح تذكرة جذرية واحدة فقط. |
| **توجيه النواة (\`MPLS & SR\`)** | مقارنة بروتوكولات \`LDP\` و\`RSVP-TE\` و\`Segment Routing (SR-MPLS)\` وتقنية الحماية الفائقة \`TI-LFA\`. | ضمان تعافي المسار (\`< 50ms\`) بتغطية 100%، وتشخيص أعطال عدم تطابق حجم الحزمة (\`MTU Mismatch\`) بأوامر \`ping mpls\` و\`tracert lsp\`. |

## 3.2 أتمتة مركز العمليات وتحليل واجهات الأنظمة (\`AU-01\` & \`AU-02\`)

* **الأتمتة الآمنة بلغة \`Python\` (\`AU-01\`):** تطبيق منهجية تطوير سكربتات **قراءة فقط (\`Read-Only\`)** عبر مكتبات \`Netmiko\` و\`NETCONF\` و\`RESTCONF\` و\`TextFSM\` و\`pandas\` لأتمتة فحص حالة جلسات \`BGP/DIA\`، والتحقق من روابط \`LDP\`، وحساب عدد المشتركين المتأثرين تلقائياً من ملفات \`CSV\` المصدرة من \`NCE/AMS\`.
* **تحليل معمارية التطبيقات الداخلية (\`AU-02\`):** استيعاب أولوية استخدام الواجهات البرمجية الرسمية الشمالية (\`NBI / REST API\`) في أنظمة التشغيل المركزية (\`Huawei NCE NBI\`، \`Nokia AMS REST/NETCONF\`، \`Cisco EPNM REST /webacs/api\`، \`BMC Remedy/SDM REST /api/jwt/login\`، وبوابات \`MOSS / ACS / Spider\`) مع الالتزام الصارم بضوابط التفويض وحسابات الخدمة وعدم مشاركة ملفات الجلسات (\`HAR\`) حفاظاً على أمن الشبكة وبيانات العملاء.

## 3.3 المشروع التكميلي: بوابة المعرفة التفاعلية (\`NOC & Field Operations Knowledge Portal\`) والتكامل المعرفي

لترسيخ جميع الإجراءات والعلوم المكتسبة في صيغة هندسية مستدامة، تم تصميم وبرمجة تطبيق ويب تفاعلي ثنائي اللغة (**React 18 + Vite 6 + Tailwind CSS 4**) بعنوان **«بوابة المعرفة لعمليات الشبكة والميدان»** يشتمل على ثلاث بيئات تعليمية وتشغيلية:

1. **مساحة العمل التفاعلية (22 وحدة معرفية):** تضم بطاقات مرجعية قابلة للسحب والفحص مقسمة إلى 4 تبويبات لكل وحدة (\`الإجراء والمعمارية\`، \`الأوامر ومسارات المعالجة\`، \`الأتمتة والسكربتات\`، \`الاختبار\`). وتشمل إلى جانب وحدات \`FTTH\` (\`FT-01\`–\`FT-04\`) والنقل (\`TS-01\`–\`TS-04\`, \`TR-01\`–\`TR-03\`, \`HW-01\`–\`HW-04\`, \`AL-01\`) والأتمتة (\`AU-01\`–\`AU-02\`)، توثيقاً مرجعياً عاماً لتكامل أقسام المركز الأخرى:
   * **فريق الوصول والمرافق (\`AC-01\`, \`AC-02\`):** إطار متابعة إنذارات المرافق الحرجة (\`Mains failure\`, \`Generator\`, \`DC/Rectifier\`, \`HVAC\`, \`Fire/Smoke\`) والتحكم بالأبواب وتوثيق اتصالات وسجلات الدخول والمغادرة في \`SDM\`.
   * **شبكات الجيل الخامس (\`G5-01\`, \`G5-02\`):** دراسة مرجعية لمعمارية \`NG-RAN\` (تقسيم \`gNB\` إلى \`CU-CP/CU-UP/DU/RU\` وواجهات \`F1/E1/Xn\` وترددات \`n78\`) والنواة \`5GC\` (\`AMF, SMF, UPF\`) ومؤشرات الأداء والمعالجة.
2. **محاكي الحوادث الواقعية (5 سيناريوهات — 26 خطوة قرار):** يحاكي حالات عملية خطوة بخطوة مع التمييز الأكاديمي الصريح بين ما يستند إلى **إجراءات سلام المعتمدة (\`SOP\`)** وما يمثل **ممارسة تشغيلية عامة** (\`SIM-01\` قطع مغذي \`OLT\` بالرياض، \`SIM-02\` سقوط \`IP Transit 400G\` وتطبيق قاعدة 85% و\`P0\` و\`SNFN\`، \`SIM-03\` انقطاع عميل \`DIA\` عبر \`Spider → Vlanif → BGP\`، \`SIM-04\` تذكرة \`ITC Link Down\`، و\`SIM-05\` عاصفة إنذارات \`DWDM\`).
3. **بنك الأسئلة التقييمي (162 سؤالاً):** مصنف عبر 9 مجالات و3 مستويات صعوبة مع وضعي التدريب والمراجعة والطباعة.

---

<!-- pagebreak -->

# الفصل الرابع: التحليل البياني ومؤشرات الأداء التشغيلية

<!-- analytics-charts-p2 -->

---

<!-- pagebreak -->

# الفصل الخامس: التحديات الهندسية، الدروس المستفادة، والخاتمة والتوصيات

## 5.1 التحديات التشغيلية ومعالجتها
* **الضغط العالي في ذروة البلاغات (97 تذكرة):** تم التغلب على تكدس البلاغات بتوحيد قوالب الفحص الاستباقي (\`Pre-Checks\`) في \`NCE\` و\`MOSS\` و\`ACS\`، مما منع التصعيدات المكررة وحافظ على التزام **\`SLA\` بنسبة 97.4%**.
* **تعدد الأنظمة غير المترابطة في تتبع الدوائر المؤسسية (\`TS-03\`):** جرى ربط المعرّفات المتفرقة بين \`SDM\` و\`Spider\` وموجهات \`Huawei NE40E\` عبر خريطة تشخيص ذهنية وبرمجية موحدة اختصرت زمن تحديد خلل الجار (\`BGP Peer\`) ومخاطبة المزود.
* **تشتت الإنذارات أثناء الانقطاعات الضوئية (\`Alarm Storms\`):** تم تجاوز الارتباك الناتج عن توالي الإنذارات بتطبيق مبدأ البحث عن أقدم إنذار جذري (\`R_LOS / OTUK_LOF\`) قبل التعامل مع إنذارات المصب (\`AIS\`) أو المنبع (\`BDI\`).

## 5.2 الخاتمة والتوصيات
تؤكد مخرجات هذه الفترة التدريبية (**من 11/10 إلى 5/11**) الانتقال الناجح من مرحلة التنفيذ التشغيلي الميداني إلى مرحلة النضج الهندسي الشامل في مراكز عمليات الشبكات (\`NOC\`). وبناءً على التجربة العملية والمشروع المعرفي المنجز، يوصى بما يلي:
1. **اعتماد مراجع معرفية تفاعلية (\`NOC Knowledge Portal\`)** ضمن برامج تهيئة المتدربين والمهندسين الجدد لتسريع استيعاب إجراءات \`FTTH\` و\`Transport\` وتوحيد جودة التشخيص.
2. **توسيع أتمتة الفحوصات المبدئية للقراءة فقط (\`Read-Only Python Diagnostics\`)** في استعلامات \`Vlanif/BGP\` وتصدير قوائم \`OLT CSV\` لتقليص زمن الاستجابة للحوادث الحرجة (\`MTTR\`).
3. **الاستمرار في التكامل البيني بين فرق الوصول (\`FTTH\`) والنقل (\`Transport\`)** عند التعامل مع انقطاعات الألياف المغذية والـ \`MDT\` بما يعزز موثوقية الشبكة وجودة تجربة المشترك.`
};

// ── Master Academic English Report for Period 2 (Oct 11 – Nov 05) ─────
export const DEFAULT_REPORT_P2_EN: FreshPeriodicReport = {
  title: 'Second Periodic Report — Comprehensive Academic & Engineering Final Report',
  majorField: 'FTTH Operations, Transport Networks Domain & NOC Engineering',
  department: 'Salam Telecom — FTTH Technical Operations & Transport Network Monitoring (NOC)',
  roleAssignment: 'Active FTTH Employee (Weeks 7–8) & Transport Trainee / NOC Portal Author (Weeks 9–10)',
  periodCoverage: 'From Oct 11 to Nov 05',
  stageOneHours: '',
  stageTwoHours: '',
  intervals: [
    {
      id: 'int_p2_1_en',
      label: 'Chapter 1: Autonomous FTTH Operations',
      startDate: 'Weeks 7 & 8',
      endDate: '482 Tickets | 97.4% SLA',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_2_en',
      label: 'Chapter 2: Transport Domain Salam SOPs (TS-01 – TS-04)',
      startDate: 'Weeks 9 & 10',
      endDate: 'BGP / IGW / DIA / Spider',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_3_en',
      label: 'Chapter 3: DWDM/OTN Core, MPLS & Python Automation',
      startDate: 'TR / HW / AL / AU',
      endDate: 'Multi-Vendor & NBI',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_4_en',
      label: 'Applied Capstone: NOC & Field Knowledge Portal',
      startDate: 'React 18 + Vite 6',
      endDate: '22 Modules | 5 Sims | 162 Qs',
      timeFrom: '',
      timeTo: ''
    }
  ],
  customNarrative: `# Executive Summary & Report Scope (Oct 11 – Nov 05)

This **Second Periodic Report** provides a formal academic and engineering synthesis of the four-week cooperative training phase spanning **October 11 to November 05** (Weeks 7, 8, 9, and 10). Structured in accordance with university engineering report standards, it unifies **autonomous operational execution**, **carrier-grade backbone SOP mastery**, and **applied software knowledge engineering**:

1. **Track 1 — FTTH Active Operations (Weeks 7 & 8):** Operated as a full-capacity **Active FTTH Employee**, diagnosing residential and open-access outages across handover tooling and telemetry systems—resolving and documenting **482 unique tickets**, reaching an all-time peak of **97 tickets**, and sustaining **97.4% SLA compliance**.
2. **Track 2 — Transport Domain & NOC Monitoring (Weeks 9 & 10):** Transitioned into **Transport Domain Operations**, mastering Salam's carrier SOPs (\`TS-01\` through \`TS-04\`) covering core alarms (\`Device has stopped\`, \`BGP down\`, FAN/Power, NAS systems), International Gateway links (\`IP Transit & Peering\`), dedicated enterprise circuits (\`DIA, GCX, KAUST, VSAT, Dark Fiber\`), optical backbone layers (\`DWDM/OTN\`), MPLS core routing, multi-vendor alarm correlation, and read-only \`Python\` automation.
3. **Engineering Deliverable — NOC & Field Operations Knowledge Portal:** Designed and built a bilingual interactive web platform (**22 modules, 5 incident simulations across 26 decision steps, and 162 technical assessment items**) unifying Salam's operational SOPs alongside multi-vendor backbone, automation, access/facilities, and \`5G\` reference modules.

---

# Chapter 1: FTTH Operations & OSP Engineering Analysis

## 1.1 Quantitative Distribution of Processed Tickets (482 Cases)

Operations tracked **482 verified incidents** across handover dashboards, achieving peak throughput on **October 20 (97 tickets)**. **Table 1** summarizes channel distribution:

| # | Operational Category | Tickets | Share | Technical Role Executed |
|---|---|---:|---:|---|
| 1 | **Customer Care Support (\`CCS\`)** | 176 | 36.5% | Centralized residential fault auditing and service state correlation. |
| 2 | **Call Centre Referrals** | 117 | 24.3% | Technical triage and structured diagnostic routing comments. |
| 3 | **Open Access Operators** | 70 | 14.5% | Cross-carrier troubleshooting for STC, Zain, Mobily, and GO seekers. |
| 4 | **Resolved Direct** | 57 | 11.8% | Immediate resolution upon RX optical validation and \`ACS / PPPoE\` sync. |
| 5 | **Technical Line Support (\`TLS\`)** | 31 | 6.4% | Tier-2 escalation for complex access-layer faults. |
| 6 | **\`NOC & OSS\` Escalations** | 31 | 6.5% | Core network correlation and provisioning database reconciliation. |
| — | **Period Total** | **482** | **100.0%** | **Sustained 97.4% SLA compliance without misrouted escalations.** |

## 1.2 Standard FTTH Diagnostic & Provisioning Procedures (\`FT-01\` to \`FT-04\`)

* **Triage Logic (\`FT-02\`):** Audited \`Provider Name\` and \`Tier 3\` tags in \`Remedy\` (\`ITC\`, \`Open Access\`, \`ZoomComp\` via \`Zooom & AAA\`), validated non-suspended status in \`MOSS\`, located subscribers by \`Service ID\`, \`ONU SN\`, or \`LOID\`, and escalated missing provisioning records to \`OSS App Support\`.
* **Optical Standards & ONT Replacement (\`FT-01\` & \`FT-03\`):** Enforced strict **RX Power (\`-10 dBm to -26 dBm\`)** validation and \`CVLAN\` mapping (\`1501 HSI\`, \`3980 ACS\`, \`1810 VoIP\`). For \`PON not stable\` replacements on \`Huawei NCE\`, documented all profiles and service-port VLANs and matched \`OLT/Slot/Port\` in \`MOSS\` prior to deleting and re-confirming the new ONT.
* **Planned Maintenance Notices (\`MDT — FT-04\`):** Processed \`NMC Change Management\` \`CRQ\` requests via \`SDM\`, partitioned \`Impact list\` sheets by seeker (\`_STC\`, \`_Zain\`, \`_Mobily\`, \`_GO\`), and dispatched isolated notifications via \`FTTH-NOC@tls.sa\`.

---

# Chapter 2: Transport Domain Standard Operating Procedures (\`TS-01\` to \`TS-04\`)

## 2.1 Core Transport Alarm Triage Matrix (\`TS-01\`)

| Alarm Type | Verification Tools & CLI | Standard Escalation Rule (\`SOP\`) |
|---|---|---|
| **\`Device has stopped\`** | \`CA Performance → Health → IfAlias\` + \`Spider\` DB | **Single customer:** Coordinate \`CTT\` via \`B-care\` and check power. **Multiple customers:** Open \`NTT\`, dispatch \`Sudden Outage Notice\`, and check Support/Power teams. |
| **\`BGP down\`** | \`Cisco IOS XR\` CLI (\`show route <IP>\`, \`show interfaces\`) | **Customer session:** Ignored per SOP. **Network Element:** Open \`Critical NTT\`, assign and call \`Back Office (BO)\`, and email provider. Distinguish \`Active/Idle\` vs \`Established\`. |
| **\`Faulty FAN / Power\`** | SSH CLI (\`show env fan\`, \`show env all\`) | Normal readings confirm a false alarm; confirmed hardware faults trigger \`NTT\` to \`Back Office\` and field dispatch. |
| **\`DPI / Sandvine / Voice / Wirefilter / DNS\`** | Live platform alarm monitoring | Immediately raise \`NTT\` assigned to \`NAS\` team and call on-call \`Back Office\`. |

## 2.2 International Gateway — IP Transit & Peering (\`TS-02\`)

* **Unified Carrier Incident Handling:** When \`IP Transit\` (\`TATA\`, \`STC\`, \`Mobily\`) or \`Peering\` links drop, open **one unified \`Critical NTT\`** in the \`NOC\` queue for all impacted providers and email all providers jointly.
* **\`85%\` Utilisation & \`P0 > 200G\` Rules:** Monitored remaining links via \`Cacti\`; exceeding **\`85%\`** triggers a \`Major NTT\` to \`NAS\` and direct \`BO\` call. Total traffic impact **\`> 200 Gbps\`** mandates immediate \`Shift Lead\` escalation under the **\`P0\` escalation matrix**.
* **Interpreting \`SNFN\` Updates:** Recognized that *"observing local fault alarm at ITCJ from client port"* verifies national span health and isolates the issue to international segments.

## 2.3 Enterprise Circuits — \`DIA, GCX, KAUST, VSAT & Dark Fiber\` (\`TS-03\`)

1. **\`DIA & GCX\` End-to-End Traceability (\`STC, APTech, Mobily, Mawarid\`):** Copy \`Service ID\` from \`SDM\` → query \`B-care Spider\` (\`F11\` / \`Ctrl+F11\`) → retrieve \`Metro Ethernet\` fields (\`Partner Circuit ID\`, \`VLAN\`, \`Pop Name\`).
2. **Router CLI Audit (\`Huawei NE40E\` via \`SecureCRT / PuTTY\`):** Run \`display current-configuration interface Vlanif <VLAN>\` to identify \`vpn-instance\` and \`/30\` IP, compute peer address, verify \`display bgp vpnv4 vpn-instance <VRF> peer\` (\`Established\` vs \`Active/Idle\`), inspect \`display logbuffer\` and \`Cacti\`, and email the provider referencing the incident number.
3. **Specialized Enterprise Paths:** Dispatched immediate acknowledgements for \`KAUST\` tickets before verifying \`SNFN IDs\` or router diagrams; routed \`VSAT\` incidents to the \`VSAT\` team with field \`WO\` creation as needed; and escalated \`Zain Dark Fiber\` faults with design site maps to \`SNFN\`.

## 2.4 FTTH Alarms in Transport Monitoring (\`TS-04\`)

* Verified \`Feeder fiber broken\` in \`Huawei NCE\` (and \`Nokia AMS\` for Eastern Region), ignoring single-user power alerts while dispatching field teams via \`NTT\` when multiple \`PON\` ports drop together.
* Filtered \`Loss of signal\` via \`Current Reporting Status\`, ignoring \`Dying gasp\` customer power outages and exporting impacted \`OLT\` \`GPON ONU / ONT\` inventories to \`CSV\` for impact assessment.

---

# Chapter 3: Optical Backbone, Alarm Correlation, Automation & Portal Engineering

## 3.1 \`DWDM/OTN\`, \`MPLS Core\`, Multi-Vendor Hardware & Alarm Correlation (\`TR-01–02, HW-01–04, AL-01\`)

* **Optical Transmission (\`DWDM & OTN\`):** Analyzed \`OTS, OMS, OCh, OTUk, ODUk, OPUk\` layers, \`OSC\` supervision, and optical impairments (\`Span Loss\`, \`OSNR\`, \`CD/PMD\`), leveraging rising \`Pre-FEC BER\` with \`Post-FEC = 0\` as an early degradation warning across \`Cisco NCS 1000/2000\`, \`Huawei OptiX OSN\`, and \`Nokia 1830 PSS\`.
* **Alarm Storm Correlation (\`AL-01\`):** Isolated earliest root faults (\`R_LOS / LOS-P / OTUK_LOF\`) from downstream consequence alarms (\`MS_AIS / ODUk_PM_AIS\`) and upstream indications (\`BDI / RDI\`).
* **\`MPLS & Segment Routing\`:** Contrasted \`LDP\`, \`RSVP-TE\`, and \`SR-MPLS\` (\`TI-LFA < 50ms\` sub-50ms protection) and diagnosed \`MTU\` mismatches using \`ping mpls\` and \`tracert lsp\`.

## 3.2 NOC Automation, Internal API Analysis & Knowledge Portal (\`AU-01, AU-02, AC-01–02, G5-01–02\`)

* **Read-Only \`Python\` & Internal Portal APIs (\`AU-01 & AU-02\`):** Applied safe read-only automation (\`Netmiko\`, \`NETCONF\`, \`RESTCONF\`, \`TextFSM\`, \`pandas\`) for BGP/DIA/LDP verification and OLT CSV impact parsing, alongside architectural understanding of northbound \`NBI / REST\` interfaces across \`NCE\`, \`AMS\`, \`EPNM\`, \`BMC Remedy/SDM\`, and internal portals (\`MOSS, ACS, Spider\`) under strict authorization and credential hygiene.
* **NOC & Field Knowledge Portal & Cross-Domain Reference:** Built a bilingual web portal (**React 18 + Vite 6 + Tailwind CSS 4**) housing **22 modules, 5 simulations (26 steps), and 162 quiz items**, deliberately distinguishing Salam's live SOPs (\`FT-02–04\`, \`TS-01–04\`) from general multi-vendor reference modules covering **Access & Facilities (\`AC-01–02\`)** and **5G \`NG-RAN / 5GC\` (\`G5-01–02\`)**.

---

<!-- pagebreak -->

# Chapter 4: Operational Analytics & Performance Telemetry

<!-- analytics-charts-p2 -->

---

<!-- pagebreak -->

# Chapter 5: Engineering Challenges, Conclusion & Recommendations

This second training period (**Oct 11 – Nov 05**) bridged live high-volume residential access support (**482 FTTH cases, peak 97, 97.4% SLA**) with carrier-grade Transport NOC operations and software-driven knowledge engineering. Key recommendations include institutionalizing the **NOC Knowledge Portal** for engineer onboarding, expanding **read-only \`Python\` pre-checks** for \`DIA\` and \`OLT\` impact triage, and maintaining tight synchronization between \`FTTH\` and \`Transport\` workflows.`
};
