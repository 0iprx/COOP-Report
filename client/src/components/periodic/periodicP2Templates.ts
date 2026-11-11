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
  majorField: 'FTTH Operations & Transport Networks (خدمات الألياف الضوئية وشبكات النقل)',
  department: 'قسم خدمات الألياف FTTH وقسم شبكات النقل والتراسل (Transport Domain)',
  roleAssignment: 'موظف فعلي في FTTH (الأسابيع 7-8) ومتدرب في شبكات الترانزبورت (الأسابيع 9-10)',
  periodCoverage: 'من 11/10 إلى 5/11',
  stageOneHours: '',
  stageTwoHours: '',
  intervals: [
    {
      id: 'int_p2_1',
      label: 'المرحلة الأولى: إدارة تذاكر FTTH الفعلي ومعالجة الأعطال',
      startDate: 'تشغيل وحل البلاغات',
      endDate: 'CCS / Call Centre',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_2',
      label: 'المرحلة الثانية: ذروة المعالجة التشغيلية (97 تذكرة بالهاند أوفر)',
      startDate: 'تشخيص وفحص متقدم',
      endDate: '482 تذكرة إجمالاً',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_3',
      label: 'المرحلة الثالثة: مراقبة إنذارات النقل (TS-01 إلى TS-04)',
      startDate: 'BGP / IGW / DIA',
      endDate: 'CA / Spider / Cacti',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_4',
      label: 'المرحلة الرابعة: البنية الضوئية (DWDM/OTN) وبوابة المعرفة (NOC Portal)',
      startDate: 'MPLS / Alarm Storm',
      endDate: 'Python / Netmiko',
      timeFrom: '',
      timeTo: ''
    }
  ],
  customNarrative: `# مقدمة التقرير الفتري الثاني (من 11/10 إلى 5/11)

يغطي هذا **التقرير الفتري الثاني** أربعة أسابيع تدريبية وتشغيلية متقدمة ممتدة **من 11 أكتوبر إلى 5 نوفمبر** (الأسابيع: 7، 8، 9، 10). وتميزت هذه الفترة بالجمع بين مسارين عمليين وهندسيين متكاملين في قطاع الاتصالات:

1. **المحور الأول — قسم خدمات الألياف الضوئية (FTTH Operations) [الأسابيع 7 و 8]:**  
   العمل كـ **موظف فعلي** متمكن من التعامل المباشر والمستقل مع بلاغات المشتركين وأنظمة تسليم المهام (Handover Tools)، مما أثمر عن معالجة وتوثيق **482 تذكرة وبلاغاً تشغيلياً** وصلت ذروتها التاريخية إلى **97 تذكرة في مرحلة واحدة** بمعدل التزام باتفاقية مستوى الخدمة (SLA) بلغ **97.4%**.
2. **المحور الثاني — قسم شبكات النقل والتراسل (Transport Domain & NOC) [الأسابيع 9 و 10]:**  
   الانتقال التخصصي كـ **متدرب في شبكات النقل**؛ حيث تم التدرب على إجراءات التشغيل القياسية (SOPs) لمركز عمليات الشبكة (NOC) للتعامل مع إنذارات النواة (BGP, Device Stopped, FAN/Power)، وبوابة الإنترنت الدولية (IP Transit / Peering)، وحالات العملاء المؤسسيين والدوائر المخصصة (DIA, GCX, KAUST, VSAT, Dark Fiber)، إضافة إلى معمارية النقل البصري (DWDM/OTN) وربط الأعطال (Alarm Correlation)، وتطوير **بوابة معرفية تفاعلية (NOC Knowledge Portal)** لجمع وتوثيق كافة إجراءات النقل والشبكة في مرجع هندسي موحد.

---

# أولاً: المحور الأول — عمليات قسم الألياف الضوئية (FTTH)

خلال الأسبوعين السابع والثامن، تركزت المهام الميدانية والتشغيلية على قيادة مسار التشخيص ومعالجة التذاكر عبر أنظمة الهاند أوفر وتصنيف البلاغات:

## 1. توزيع وتصنيف التذاكر المعالجة (482 تذكرة موثقة)
* **نظام خدمة العملاء والدعم المركزي (CCS):** استحوذ على النسبة الأكبر بمعدل **36.5% (176 تذكرة)** لمتابعة البلاغات الفنية المركزية ومطابقة بيانات الخدمة.
* **إحالات الكول سنتر (Call Centre):** بنسبة **24.3% (117 تذكرة)** لإعادة التوجيه الفني الدقيق بعد التحقق من سلامة الخدمة مع تدوين تعليق تشخيصي واضح (Diagnostic Comment).
* **النفاذ المفتوح والمشغلين (Open Access):** بنسبة **14.5% (70 تذكرة)** لمعالجة أعطال البنية المشتركة ونقاط الربط مع المشغلين.
* **المعالجة والإغلاق الفوري (Resolved Direct):** بنسبة **11.8% (57 تذكرة)** تم إغلاقها مباشرة بعد استقرار الإشارة وضبط المنافذ عبر ACS.
* **الدعم التخصصي والتصعيد (TLS & NOC & OSS):** بنسبة **12.9% (62 تذكرة)** شملت التصعيد للفرق الهندسية المتقدمة ومراقبة الأنظمة.

## 2. المعايير الفنية والمنصات المستخدمة في FTTH
* التحقق الصارم من **نطاق القدرة الضوئية المستقبلة (RX Power)** المعتمد بين **\`-10 dBm\` إلى \`-26 dBm\`** عبر منصة **Huawei NCE**.
* فحص خدمات الـ **CVLAN**: خدمة الإنترنت (**1501 - HSI**)، خدمة الإدارة (**3980 - ACS / TR-069**)، والخدمة الصوتية (**1810 - VoIP**).
* توثيق الحالات القياسية التي بلغت في ذروتها **97 تذكرة** (موزعة بين CCS: 34، Call Centre: 30، Resolved: 16، Open Access: 9، TLS: 3، NOC: 2، NAS: 2، OSS: 1)، وحالات أخرى مسجلة مثل (40 تذكرة، 45 تذكرة، 31 تذكرة، 16 تذكرة).

---

# ثانياً: المحور الثاني — إجراءات وتقنيات شبكات النقل (Transport Domain)

مثّل الانتقال إلى **قسم الترانزبورت (Transport Networks)** نقلة هندسية شاملة لاكتساب مهارات مركز عمليات الشبكة (NOC) والتعامل مع العمود الفقري للشبكة:

## 1. معالجة إنذارات النقل الأساسية (Transport Alarm Handling)
* **إنذار توقف الجهاز (\`Device has stopped\`):**
  * التحقق الفوري من عدد العملاء المتأثرين عبر منصة **CA Performance → Health → عمود \`IfAlias\`** وكذلك قاعدة بيانات **Spider**.
  * **عميل واحد:** التنسيق مع **B-care** لفتح تذكرة **CTT** والتواصل مع العميل والتحقق من الكهرباء.
  * **عدة عملاء:** فتح تذكرة شبكة (**NTT**) وإرسال إشعار انقطاع مفاجئ (**Sudden Outage Notice**) ومراجعة فريقي الدعم والكهرباء مع توثيق تعليق واضح.
* **إنذار سقوط جلسة BGP (\`BGP down\`):**
  * الدخول إلى عنصر الشبكة (NE) وتنفيذ أوامر التوجيه (\`show bgp summary\`, \`show route <IP>\`, \`show interfaces\`) لقراءة وصف واجهة الخروج.
  * **جلسة عميل:** يتم تجاهل الإنذار وفق الإجراء القياسي.
  * **عنصر شبكة (Network Element):** فتح تذكرة **Critical NTT** وإسنادها لـ **Back Office (BO)** والاتصال بهم مباشرة مع مراسلة المزود بالبريد.
  * التمييز بين حالة السقوط (\`Active\` أو \`Idle\`) والحالة المستقرة (\`Established\` مع عدد البادئات).
* **إنذارات المراوح والكهرباء (\`Faulty FAN Detected\`):**
  * التحقق المسبق عبر SSH باستخدام أوامر \`show env fan\` و \`show env all\` للتمييز بين الإنذار الوهمي والإنذار الحقيقي قبل تصعيده لـ Back Office وإرسال الفريق الميداني.
* **عناصر الشبكة الحساسة (\`DPI / Sandvine / Voice / Wirefilter / DNS\`):**
  * أي إنذار على هذه المنصات يستوجب فتح تذكرة **NTT** فورية وإسنادها إلى فريق **NAS** والاتصال بالمناوب في Back Office.

## 2. بوابة الإنترنت الدولية (IGW: IP Transit & Peering)
* عند سقوط أي رابط عبور دولي (**IP Transit** مثل TATA أو STC أو Mobily) أو رابط تبادل (**Peering**): يتم فتح **Critical NTT واحدة** في سلة \`NOC\` ومراسلة كافة المزودين المعنيين معاً.
* **قاعدة حد الازدحام (\`85% Utilisation Threshold\`):** مراقبة استهلاك الروابط المتبقية عبر **Cacti**؛ في حال تجاوز الضغط **85%** تُفتح تذكرة **Major NTT** وتُسند لفريق **NAS** مع الاتصال بمناوب Back Office وإبلاغ مجموعة العمل.
* **قاعدة الأثر الحرج (\`P0 Matrix > 200G\`):** إذا تجاوز الأثر الإجمالي للسعات المفقودة **200 Gbps** يتم إبلاغ **Shift Lead** فوراً وتطبيق مصفوفة تصعيد **P0**.
* **قراءة ردود SNFN:** استيعاب دلالة رد فريق SNFN (*"observing local fault alarm at ITCJ from client port"*) الذي يؤكد سلامة المسار الوطني وحصر الخلل في المسار الدولي لمتابعته مع المزودين الدوليين.

## 3. الدوائر المخصصة والعملاء المؤسسيين (\`DIA / GCX / KAUST / VSAT / Dark Fiber\`)
* **تشخيص خدمة الإنترنت المخصص (DIA & GCX) للمزودين (STC, APTech, Mobily, Mawarid):**
  1. نسخ **Service ID** من نظام **SDM**.
  2. البحث في قاعدة بيانات **B-care Spider** (\`F11\` ثم لصق المعرّف ثم \`Ctrl+F11\`) واستخراج بيانات **Metro Ethernet**: (Partner Circuit ID, Partner Name, VLAN, Pop Name).
  3. الاتصال بجهاز التوجيه (مثل **Huawei NE40E** عبر SecureCRT / PuTTY) واستعلام إعداد الواجهة:  
     \`display current-configuration interface Vlanif <VLAN>\` لاستخراج الـ **vpn-instance** وعنوان IP ضمن شبكة **\`/30\`**.
  4. حساب عنوان الجار المقابل وفحص الجلسة عبر \`display bgp vpnv4 vpn-instance <VRF> peer\` والتأكد من حالتها (\`Established\` أم \`Active/Idle\`)، مع مراجعة \`display logbuffer\` ورسوم **Cacti** وإرفاق رقم الحادثة عند مخاطبة المزود.
* **حالات KAUST:** إرسال إقرار استلام (Acknowledgement) للعميل أولاً، والتحقق مما إذا كان معرّف الرابط تابعاً لـ SNFN أم فحص منفذ الراوتر عبر المخططات الهندسية.
* **تذاكر VSAT:** استلام NTT من الدعم وإسنادها مباشرة إلى فريق VSAT (دون بريد) مع إنشاء أمر عمل (WO) للميدان عند اللزوم.
* **الألياف المظلمة مع Zain (Dark Fiber):** فتح تذكرة NTT وأخذ صورة الموقع من وثيقة التصميم وإرسالها إلى **SNFN** للمتابعة.

## 4. مراقبة إنذارات FTTH من مركز النقل (Transport Monitoring)
* **إنذار قطع كابل التغذية (\`Feeder fiber broken\`):** الفحص عبر **Huawei NCE** (أو **Nokia AMS** الحصري للمنطقة الشرقية)؛ يُتجاهل إنذار القدرة لمستخدم واحد، بينما سقوط عدة منافذ PON معاً يعني قطعاً حقيقياً يتطلب فتح NTT وإرسال الفريق الميداني.
* **إنذار فقد الإشارة (\`Loss of signal\`):** قراءة حقل \`Current Reporting Status\`؛ فإذا كان \`Dying gasp\` فهو انقطاع كهرباء لدى العميل ويُتجاهل من مستوى المراقبة، وإلا يتم فتح NTT للتدخل الميداني.
* **حساب أثر سقوط OLT:** استخراج كافة العملاء المتأثرين وتصديرهم بصيغة CSV من **Huawei NCE** (\`GPON ONU → Find → Ctrl+A → Save As\`) أو **Nokia AMS** (\`Inventory → Query → Object Type = ONT\`) وتصفيتها برقم المنفذ.

## 5. المعمارية الضوئية، ربط الإنذارات، والأتمتة (\`DWDM / OTN / MPLS / Python\`)
* **معمارية DWDM و OTN:** فهم طبقات النقل (**OTS, OMS, OCh, OTUk, ODUk, OPUk**)، ودور قناة الإشراف الضوئي (**OSC**)، ومراقبة المعوقات الضوئية مثل فقد الامتداد (**Span Loss**)، ونسبة الإشارة للضوضاء (**OSNR**)، والتشتت (**CD/PMD**)، ومعدل الأخطاء قبل التصحيح (**Pre-FEC BER**) كمؤشر إنذار مبكر مع بقاء **Post-FEC = 0**.
* **إدارة عواصف الإنذارات (Alarm Storm Correlation):** تطبيق قاعدة عزل أقدم إنذار جذري (**\`R_LOS\` / \`LOS-P\` / \`OTUK_LOF\`**) عن الإنذارات الناتجة اللاحقة نحو المصب (**\`MS_AIS\` / \`ODUk_PM_AIS\`**) أو نحو المنبع (**\`BDI / RDI\`**) عبر مصفوفة متعددة المصنعين (**Huawei OptiX OSN, Cisco NCS 1000/2000, Nokia 1830 PSS**) وربط البلاغات الفرعية بتذكرة جذرية واحدة.
* **توجيه الشبكة الأساسية (MPLS & Segment Routing):** المقارنة بين **LDP** و **RSVP-TE** و **SR-MPLS** وتقنية الحماية السريعة **TI-LFA** (تغطية 100% خلال < 50ms)، واكتشاف أعطال **عدم تطابق MTU** واختبار المسار بأوامر \`ping mpls\` و \`tracert lsp\`.
* **بناء بوابة المعرفة والأتمتة (NOC Portal & Python Automation):** تصميم وتطوير موقع ويب تفاعلي متكامل (**NOC & Field Operations Knowledge Portal**) يضم 22 وحدة معرفية و5 سيناريوهات محاكاة حوادث وبنك أسئلة تقني، مع تطبيق مفاهيم الأتمتة بـ **Python (Netmiko)** لفحص جلسات BGP، ومطابقة حالات DIA، وحساب الأثر من ملفات NCE/AMS بشكل آمن (قراءة فقط).

---

<!-- pagebreak -->

<!-- analytics-charts-p2 -->

---

<!-- pagebreak -->

# الخاتمة والتوصيات

يمثل هذا **التقرير الفتري الثاني (من 11/10 إلى 5/11)** خلاصة مرحلة مهنية استثنائية جمعت بين الكفاءة التشغيلية الميدانية والعمق الهندسي؛ فمن إنجاز **482 تذكرة ومهمة في خدمات FTTH** وتحقيق رقم قياسي بلغ **97 تذكرة**، إلى استيعاب منظومة **شبكات النقل والـ NOC** بكل تفاصيلها من إنذارات الـ BGP والعبور الدولي IGW، ودوائر الـ DIA و Spider، وصولاً إلى شبكات DWDM/OTN وبناء بوابة معرفية متكاملة تُسهم في رفع سرعة ودقة الاستجابة للحوادث.

تؤكد هذه المخرجات الجاهزية الهندسية والعملية العالية للعمل ضمن فرق عمليات الشبكات ومراكز المراقبة (NOC) وإدارة البنية التحتية للاتصالات.`
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
      label: 'Phase 1: Autonomous FTTH Ticket Execution',
      startDate: '482 Total Tickets',
      endDate: 'CCS / Call Centre',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_2_en',
      label: 'Phase 2: Peak Operational Throughput (97 Tickets)',
      startDate: 'Handover Verified',
      endDate: '97.4% SLA Met',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_3_en',
      label: 'Phase 3: Transport SOPs (TS-01 to TS-04)',
      startDate: 'IGW / BGP / DIA',
      endDate: 'Spider / CA / Cacti',
      timeFrom: '',
      timeTo: ''
    },
    {
      id: 'int_p2_4_en',
      label: 'Phase 4: DWDM/OTN Core, MPLS & NOC Knowledge Portal',
      startDate: 'Multi-Vendor Alarms',
      endDate: 'Python / Netmiko',
      timeFrom: '',
      timeTo: ''
    }
  ],
  customNarrative: `# Introduction — Second Periodic Report (Oct 11 – Nov 05)

This **Second Periodic Report** spans four intensive academic and operational weeks from **October 11 to November 05** (Weeks 7, 8, 9, and 10), bridging two complementary tiers of telecommunications engineering:

1. **Pillar 1 — FTTH Active Operations (Weeks 7 & 8):**  
   Acting as an **Active Employee in FTTH Operations**, handling live subscriber escalations, telemetry diagnostics, and handover dashboard queues—culminating in **482 verified tickets** and an all-time record peak of **97 tickets** with **97.4% SLA compliance**.
2. **Pillar 2 — Transport Domain & NOC Engineering (Weeks 9 & 10):**  
   Transitioning as a **Transport Networks Trainee**, mastering carrier-grade Standard Operating Procedures (SOPs) for Transport alarms (\`Device has stopped\`, \`BGP down\`, Fan/Power, NAS), International Gateway links (IP Transit & Peering), enterprise services (DIA, GCX, KAUST, VSAT, Dark Fiber), optical backbone transmission (DWDM/OTN), MPLS core routing, multi-vendor alarm correlation, and authoring a comprehensive **NOC Knowledge Portal** web platform.

---

# 1. FTTH Operations & Ticket Analytics (482 Verified Cases)

Operations leveraged handover tooling across key support channels:
* **Customer Care Support (CCS):** **36.5% (176 tickets)** for centralized residential diagnostics.
* **Call Centre Referrals:** **24.3% (117 tickets)** routed with structured technical comments.
* **Open Access Operators:** **14.5% (70 tickets)** coordinating shared carrier infrastructure.
* **Resolved Direct Handling:** **11.8% (57 tickets)** resolved directly post telemetry and ACS validation.
* **TLS, NOC & OSS Escalations:** **12.9% (62 tickets)** covering Tier-2 and core escalations.

Key technical standards maintained include strict **Optical RX Power verification (\`-10 dBm to -26 dBm\`)** on Huawei NCE and validating mapped **CVLANs (1501 HSI, 3980 ACS, 1810 Voice)**.

---

# 2. Transport Domain SOPs & Engineering Competencies (NOC Portal Extract)

## A. Core Transport Alarm Triage (TS-01)
* **Device has stopped:** Audited via **CA Performance → Health → \`IfAlias\`** and **Spider Database**. Single affected customer triggers a **CTT via B-care**; multiple affected customers trigger an **NTT with a Sudden Outage Notice**, verifying power/support status.
* **BGP Down Triage:** Accessed Network Elements via CLI (\`show bgp summary\`, \`show route\`, \`show interfaces\`) to differentiate customer sessions (ignored per SOP) from Network Element links (open **Critical NTT**, assign & call **Back Office**, email provider). Identified \`Active\`/\`Idle\` down states vs \`Established\`.
* **Faulty FAN / Power Verification:** Verified via SSH (\`show env fan\`, \`show env all\`) to rule out false alarms before dispatching field teams.
* **DPI / Sandvine / Voice / Wirefilter / DNS:** Immediately raised NTT assigned to **NAS team** with direct call to on-call Back Office.

## B. International Gateway — IP Transit & Peering (TS-02)
* Opened **one unified Critical NTT** in the \`NOC\` bin covering all involved carriers (TATA, STC, Mobily) simultaneously.
* **85% Utilisation Rule:** Monitored remaining link saturation in **Cacti**; exceeding **85%** triggers a **Major NTT to NAS** and urgent escalation to BO.
* **>200G Impact (P0 Escalation):** Notified Shift Lead immediately and executed the **P0 escalation matrix**.
* Interpreted **SNFN** diagnostic updates (e.g., *"observing local fault alarm at ITCJ from client port"*) confirming healthy national spans and isolating international faults.

## C. Enterprise Services — DIA, GCX, KAUST, VSAT & Dark Fiber (TS-03)
* **DIA & GCX Workflow:** Extracted **Service ID** from **SDM** → queried **B-care Spider** (\`F11\` / \`Ctrl+F11\`) → obtained Metro Ethernet metadata (Partner Circuit ID, VLAN, Pop Name) → accessed **Huawei NE40E** (\`display current-configuration interface Vlanif\`) to identify \`vpn-instance\` and \`/30\` IP → computed peer IP and audited BGP status (\`display bgp vpnv4 vpn-instance ... peer\` and \`display logbuffer\`) with providers (STC, APTech, Mobily, Mawarid).
* **KAUST:** Sent immediate customer acknowledgement before verifying SNFN IDs or router ports via diagrams.
* **VSAT & Zain Dark Fiber:** Processed Remedy NTTs directly to VSAT team (creating WO for field checks when needed) and dispatched design site maps to **SNFN** for Zain Dark Fiber escalations.

## D. FTTH Alarms in Transport Monitoring (TS-04)
* **Feeder Fiber Broken:** Audited via **Huawei NCE** (and **Nokia AMS** for Eastern region); ignored single-user power alerts while raising NTT + field dispatch when multiple PON ports dropped simultaneously.
* **Loss of Signal (LOS):** Checked \`Current Reporting Status\`—if \`Dying gasp\`, ignored as customer power outage; otherwise dispatched field support.
* **OLT Impact Calculation:** Exported subscriber ONU/ONT lists to CSV from NCE and AMS and filtered by port.

## E. Optical Backbone, Alarm Correlation & Automation (TR-01, TR-02, AL-01, AU-01)
* **DWDM & OTN:** Mastered OTS/OMS/OCh/OTUk/ODUk/OPUk layers, OSC supervisory channels, optical impairments (Span loss, OSNR, CD/PMD), and **Pre-FEC BER** early degradation tracking with Post-FEC maintained at 0.
* **Multi-Vendor Alarm Correlation:** Isolated root \`R_LOS\` / \`LOS-P\` / \`OTUK_LOF\` alarms from cascading consequence alarms (\`MS_AIS\`, \`ODU AIS\`, \`BDI/RDI\`) across Huawei OptiX OSN, Cisco NCS 1000/2000, and Nokia 1830 PSS.
* **MPLS & Segment Routing:** Compared LDP, RSVP-TE, and SR-MPLS (**TI-LFA** sub-50ms protection), diagnosing **MTU mismatches** and LSP breaks via \`ping mpls\` / \`tracert lsp\`.
* **NOC Knowledge Portal & Python Automation:** Built an interactive bilingual web portal (**NOC & Field Operations Knowledge Portal**) encompassing 22 technical modules and 5 incident simulations, alongside read-only **Python / Netmiko** automation scripts for BGP triage, DIA verification, and alarm suppression.

---

<!-- pagebreak -->

<!-- analytics-charts-p2 -->

---

<!-- pagebreak -->

# Conclusion

This **Second Periodic Report (Oct 11 – Nov 05)** demonstrates comprehensive operational mastery across both consumer fiber access (**482 FTTH cases**, peaking at **97 cases**) and enterprise/backbone **Transport Networks**. From live BGP/IGW/DIA triage and DWDM root-cause isolation to building an interactive NOC Knowledge Portal, the training cemented full readiness for Carrier NOC and Transport Operations engineering roles.`
};
