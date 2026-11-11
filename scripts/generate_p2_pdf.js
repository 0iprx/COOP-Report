import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Read student profile from backup JSON
const backupPath = 'C:\\Users\\0iprx\\Downloads\\نسخة_احتياطية_شاملة_عبدالله هلال غازي المطيري .json';
let profile = {
  studentName: 'عبدالله هلال غازي المطيري',
  trainingNumber: '444314701',
  department: 'أدارة انظمة شبكات الحاسب',
  trainingUnit: 'كلية الاتصالات والمعلومات بالرياض',
  supervisorName: 'محمد الدايل',
  responsibleName: 'همام كوشك',
  entityAddress: 'هواوي السعودية الرياض',
  companyLogo: ''
};

if (fs.existsSync(backupPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    if (raw.profile) {
      profile = { ...profile, ...raw.profile };
    }
  } catch (e) {
    console.warn('Could not parse backup profile, using defaults');
  }
}

// Analytics calculations for Period 2
const timelineDataP2 = [
  { date: '11/10', tickets: 40 },
  { date: '12/10', tickets: 38 },
  { date: '13/10', tickets: 32 },
  { date: '14/10', tickets: 28 },
  { date: '18/10', tickets: 35 },
  { date: '19/10', tickets: 16 },
  { date: '20/10', tickets: 97 }, // Peak!
  { date: '21/10', tickets: 45 },
  { date: '27/10', tickets: 26 },
  { date: '28/10', tickets: 29 },
  { date: '29/10', tickets: 31 },
  { date: '3/11', tickets: 34 },
  { date: '4/11', tickets: 30 },
  { date: '5/11', tickets: 21 }
];

const totalTickets = 482;
const peakTickets = 97;
const chartW = 560;
const chartH = 180;
const maxVal = 105;
const padX = 35;
const usableW = chartW - padX * 2;
const usableH = 120;

const points = timelineDataP2.map((d, i) => {
  const x = padX + (i / (timelineDataP2.length - 1)) * usableW;
  const y = chartH - 30 - (d.tickets / maxVal) * usableH;
  return { x, y, ...d };
});

const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');
const areaPathStr = `M ${points[0].x},${chartH - 30} L ${points.map((p) => `${p.x},${p.y}`).join(' L ')} L ${points[points.length - 1].x},${chartH - 30} Z`;

const shareCategoriesP2 = [
  { name: 'CCS (نظام خدمة العملاء والدعم المركزي)', count: 176, percent: 36.5, color: '#0f766e' },
  { name: 'Call Centre (إحالات وتنسيق الكول سنتر)', count: 117, percent: 24.3, color: '#0284c7' },
  { name: 'Open Access (النفاذ المفتوح والمشغلين)', count: 70, percent: 14.5, color: '#06b6d4' },
  { name: 'Resolved Direct (معالجة وإغلاق فوري)', count: 57, percent: 11.8, color: '#10b981' },
  { name: 'TLS (الدعم الفني التخصصي)', count: 31, percent: 6.4, color: '#6366f1' },
  { name: 'NOC & OSS (مركز العمليات والأنظمة)', count: 31, percent: 6.5, color: '#f59e0b' }
];

const donutCircumference = 339.29;
let accumulatedPercent = 0;
const donutCircles = shareCategoriesP2.map((cat) => {
  const strokeLength = (cat.percent / 100) * donutCircumference;
  const dashOffset = -((accumulatedPercent / 100) * donutCircumference);
  accumulatedPercent += cat.percent;
  return `<circle cx="70" cy="70" r="54" fill="transparent" stroke="${cat.color}" stroke-width="20" stroke-dasharray="${strokeLength} ${donutCircumference - strokeLength}" stroke-dashoffset="${dashOffset}" />`;
}).join('\n');

const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>التقرير الفتري الثاني - من 11/10 إلى 5/11 - عبدالله هلال غازي المطيري</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 16mm 14mm 16mm;
    }
    @page:first {
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Tajawal', sans-serif;
      color: #18181A;
      background: #FFFFFF;
      line-height: 1.6;
      font-size: 13px;
    }
    code {
      font-family: monospace;
      background: #F1F5F9;
      padding: 1px 4px;
      border-radius: 4px;
      font-size: 11.5px;
      color: #0F172A;
      direction: ltr;
      unicode-bidi: embed;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    .cover-container {
      width: 100vw;
      height: 100vh;
      min-height: 100vh;
      padding: 16mm 20mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      background: #FFFFFF;
    }
    .cover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #E6E2D8;
      padding-bottom: 12px;
    }
    .header-box {
      font-size: 11px;
      font-weight: 700;
      line-height: 1.4;
    }
    .cover-title-badge {
      display: inline-block;
      background: #C0102A;
      color: #FFFFFF;
      font-size: 11.5px;
      font-weight: 800;
      padding: 4px 16px;
      border-radius: 999px;
      margin-bottom: 8px;
    }
    .cover-title {
      font-size: 24px;
      font-weight: 900;
      color: #18181A;
      margin: 0 0 6px 0;
    }
    .cover-subtitle {
      font-size: 13.5px;
      color: #686560;
      font-weight: 700;
      margin: 0;
    }
    .matrix-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 20px;
      background: #FAFAF8;
      border: 1px solid #E6E2D8;
      border-radius: 12px;
      padding: 16px 20px;
      margin-top: 18px;
      font-size: 12.5px;
    }
    .matrix-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed #E6E2D8;
      padding-bottom: 5px;
    }
    .matrix-label {
      color: #686560;
      font-weight: 700;
    }
    .matrix-val {
      color: #18181A;
      font-weight: 800;
    }
    .matrix-full {
      grid-column: span 2;
      background: #F6DDE1;
      border: 1px solid #E8354D40;
      padding: 9px 14px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .intervals-container {
      background: #FAFAF8;
      border: 1px solid #E6E2D8;
      border-radius: 12px;
      padding: 14px 18px;
      margin-top: 14px;
    }
    .intervals-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #E6E2D8;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .intervals-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .interval-card {
      background: #FFFFFF;
      border: 1px solid #E6E2D8;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 11px;
    }
    .interval-card-title {
      font-weight: 800;
      color: #18181A;
      margin-bottom: 5px;
    }
    .interval-card-meta {
      display: flex;
      justify-content: space-between;
      color: #686560;
      font-weight: 700;
    }
    .cover-footer {
      border-top: 1px solid #E6E2D8;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      color: #686560;
      font-weight: 700;
    }

    /* Content styling */
    .content-body {
      padding: 0 2mm;
    }
    h1 {
      font-size: 17px;
      font-weight: 900;
      color: #18181A;
      border-bottom: 2px solid #C0102A;
      padding-bottom: 5px;
      margin-top: 18px;
      margin-bottom: 10px;
    }
    h2 {
      font-size: 14px;
      font-weight: 800;
      color: #C0102A;
      margin-top: 14px;
      margin-bottom: 6px;
    }
    p {
      margin: 0 0 8px 0;
      text-align: justify;
    }
    ul, ol {
      margin: 0 0 10px 0;
      padding-right: 18px;
    }
    li {
      margin-bottom: 3.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 11px;
    }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th, td {
      border: 1px solid #CBD5E1;
      padding: 6px 9px;
      text-align: right;
    }
    th {
      background: #F1F5F9;
      font-weight: 800;
      color: #0F172A;
    }
    tr:nth-child(even) td {
      background: #F8FAFC;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 14px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .kpi-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px;
      text-align: right;
    }
    .kpi-title {
      font-size: 10.5px;
      font-weight: 700;
      color: #64748B;
      margin-bottom: 4px;
    }
    .kpi-value {
      font-size: 22px;
      font-weight: 900;
      color: #0F172A;
    }
    .kpi-sub {
      font-size: 9.5px;
      font-weight: 700;
      color: #10B981;
      margin-top: 2px;
    }
    .charts-row {
      display: grid;
      grid-template-columns: 1.35fr 1fr;
      gap: 14px;
      margin: 14px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .chart-panel {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px;
    }
    .chart-panel-title {
      font-size: 12px;
      font-weight: 800;
      color: #0F172A;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 6px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
    }
    .telemetry-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 14px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .telemetry-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px 12px;
    }
    .endorsement-box {
      background: #F8FAFC;
      border: 2px solid #CBD5E1;
      border-radius: 12px;
      padding: 16px;
      margin-top: 28px;
      break-inside: avoid;
    }
    .endorsement-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      text-align: center;
      margin-top: 12px;
    }
    .sig-line {
      border-bottom: 1px dashed #94A3B8;
      height: 40px;
      margin-top: 8px;
    }
  </style>
</head>
<body>

  <!-- ══════════════════════════════════════════════════════════
       OFFICIAL ACADEMIC COVER PAGE (CLEAN - NO HOURS / NO DAYS)
       ══════════════════════════════════════════════════════════ -->
  <div class="cover-container">
    <div class="cover-header">
      <div class="header-box" style="text-align: right;">
        <div style="font-weight: 900; font-size: 12px; color: #18181A;">المملكة العربية السعودية</div>
        <div>المؤسسة العامة للتدريب التقني والمهني</div>
        <div style="color: #C0102A; font-weight: 800;">كلية الاتصالات والمعلومات بالرياض</div>
        <div>إدارة شؤون المتدربين — التدريب التعاوني</div>
      </div>

      <div style="text-align: center;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: #F6DDE1; color: #C0102A; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; font-size: 24px; border: 2px solid #C0102A;">
          ⚙️
        </div>
        <div style="font-size: 10px; font-weight: 800; color: #686560; margin-top: 4px;">COOP Training Report</div>
      </div>

      <div class="header-box" style="text-align: left;">
        <div style="font-weight: 900; font-size: 12px; color: #18181A;">${profile.entityAddress || 'هواوي السعودية الرياض'}</div>
        <div style="color: #686560;">قسم خدمات FTTH وشبكات النقل</div>
        <div style="font-size: 10px; color: #9E9A93;">FTTH & Transport Domain</div>
      </div>
    </div>

    <!-- Centered Middle Section -->
    <div style="margin: auto 0; text-align: center;">
      <div class="cover-title-badge">من 11/10 إلى 5/11</div>
      <h1 class="cover-title" style="border: none;">التقرير الفتري الثاني — التقرير الفني الأكاديمي الشامل</h1>
      <p class="cover-subtitle">شركة سلام للاتصالات — إدارة عمليات الألياف (FTTH) وإدارة شبكات النقل ومراقبة الإنترنت (NOC)</p>

      <!-- Trainee Matrix (Clean: No Stage Hours) -->
      <div class="matrix-grid" style="text-align: right;">
        <div class="matrix-row">
          <span class="matrix-label">اسم المتدرب:</span>
          <span class="matrix-val" style="color: #C0102A; font-size: 13px;">${profile.studentName}</span>
        </div>
        <div class="matrix-row">
          <span class="matrix-label">الرقم الأكاديمي:</span>
          <span class="matrix-val">${profile.trainingNumber}</span>
        </div>
        <div class="matrix-row">
          <span class="matrix-label">مجال التدريب:</span>
          <span class="matrix-val">عمليات الألياف (FTTH) وشبكات النقل (Transport) وعمليات NOC</span>
        </div>
        <div class="matrix-row">
          <span class="matrix-label">طبيعة العمل:</span>
          <span class="matrix-val">التشغيل الميداني وهندسة التراسل والأتمتة</span>
        </div>
        <div class="matrix-row">
          <span class="matrix-label">المشرف الميداني:</span>
          <span class="matrix-val">${profile.responsibleName}</span>
        </div>
        <div class="matrix-row">
          <span class="matrix-label">الفترة المشمولة بالتقرير:</span>
          <span class="matrix-val" style="color: #C0102A;">من 11/10 إلى 5/11</span>
        </div>

        <div class="matrix-full">
          <span style="font-weight: 900; color: #18181A;">الصفة ونطاق التكليف بالفترة:</span>
          <span style="font-weight: 900; color: #C0102A; font-size: 12px;">موظف فعلي في FTTH (الأسابيع 7–8) ومتدرب هندسي في قسم النقل وبوابة المعرفة (الأسابيع 9–10)</span>
        </div>
      </div>

      <!-- Technical Scope Summary (No Hours, No Shift Times) -->
      <div class="intervals-container" style="text-align: right;">
        <div class="intervals-header">
          <span style="font-weight: 900; font-size: 12px; color: #18181A;">الهيكلية العلمية ونطاق الفصول المعتمدة:</span>
          <div>
            <span style="background: #E3F0EA; color: #2A6348; padding: 2px 9px; border-radius: 999px; font-weight: 800; font-size: 10.5px; border: 1px solid #2A634830;">482 تذكرة | 97.4% SLA</span>
            <span style="color: #C0102A; font-weight: 900; font-size: 11px; margin-right: 6px;">من 11/10 إلى 5/11</span>
          </div>
        </div>

        <div class="intervals-grid">
          <div class="interval-card">
            <div class="interval-card-title">الفصل الأول: التشغيل الفعلي لخدمات الألياف الضوئية (FTTH)</div>
            <div class="interval-card-meta">
              <span>الأسابيع 7 و 8</span>
              <span style="color: #C0102A; font-weight: 800;">482 تذكرة | التزام 97.4%</span>
            </div>
          </div>

          <div class="interval-card">
            <div class="interval-card-title">الفصل الثاني: إجراءات التشغيل القياسية لقطاع النقل (TS-01 – TS-04)</div>
            <div class="interval-card-meta">
              <span>الأسابيع 9 و 10</span>
              <span style="color: #C0102A; font-weight: 800;">BGP / IGW / DIA / Spider</span>
            </div>
          </div>

          <div class="interval-card">
            <div class="interval-card-title">الفصل الثالث: البنية الضوئية (DWDM/OTN) والنواة والأتمتة</div>
            <div class="interval-card-meta">
              <span>TR / HW / AL / AU</span>
              <span style="color: #C0102A; font-weight: 800;">MPLS / Python / NBI</span>
            </div>
          </div>

          <div class="interval-card">
            <div class="interval-card-title">المشروع التكميلي: بوابة المعرفة التفاعلية لعمليات الشبكة والميدان</div>
            <div class="interval-card-meta">
              <span>NOC Knowledge Portal</span>
              <span style="color: #C0102A; font-weight: 800;">22 وحدة | 5 محاكاة | 162 سؤالاً</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cover Footer -->
    <div class="cover-footer">
      <span>المملكة العربية السعودية — التقرير الفتري الثاني للتدريب التعاوني (النسخة الأكاديمية الشاملة)</span>
      <span style="color: #C0102A; font-weight: 900;">الغلاف الرسمي المعتمد</span>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════
       REPORT NARRATIVE (UNIVERSITY ACADEMIC STYLE)
       ══════════════════════════════════════════════════════════ -->
  <div class="page-break"></div>
  <div class="content-body">
    <h1>الملخص التنفيذي ونطاق التقرير (من 11/10 إلى 5/11)</h1>
    <p>
      يُقدّم هذا التقرير التوثيق الأكاديمي والهندسي النهائي للفترة التدريبية الممتدة <strong>من 11 أكتوبر إلى 5 نوفمبر</strong> (الأسابيع: السابع، الثامن، التاسع، والعاشر) ضمن متطلبات التدريب التعاوني. صُمّم هذا التقرير وفق منهجية تقارير الهندسة الجامعية ليربط بين <strong>الممارسة التشغيلية الميدانية المباشرة</strong> و<strong>التأصيل النظري والمعماري</strong> في بيئة شبكات الاتصالات الحديثة، عبر مسارين متكاملين ومشروع معرفي تطبيقي:
    </p>
    <ol>
      <li>
        <strong>المسار التشغيلي الأول — عمليات الألياف الضوئية (<code>FTTH Operations</code>) خلال الأسبوعين 7 و 8:</strong> الاستمرار في أداء مهام الموظف الفعلي المستقل في إدارة البلاغات الحية، وتحليل قياسات الإشارة الضوئية، والتعامل مع أنظمة الدعم والتسليم (<code>Handover Tools</code>)، مما أثمر عن معالجة <strong>482 تذكرة تشغيلية فريدة</strong> وصولاً إلى ذروة إنتاجية قدرها <strong>97 تذكرة في مرحلة واحدة</strong> مع تحقيق معدل التزام باتفاقية مستوى الخدمة (<code>SLA</code>) بلغ <strong>97.4%</strong>.
      </li>
      <li>
        <strong>المسار الهندسي الثاني — قطاع شبكات النقل والتراسل (<code>Transport Domain &amp; NOC</code>) خلال الأسبوعين 9 و 10:</strong> الانتقال التخصصي إلى مركز مراقبة شبكات النقل؛ لاكتساب منظومة إجراءات التشغيل القياسية (<code>SOPs</code>) لمعالجة إنذارات العمود الفقري (<code>BGP Down</code>، توقف عناصر الشبكة، إنذارات المراوح والكهرباء)، وبوابات الإنترنت الدولية (<code>IGW: IP Transit &amp; Peering</code>)، والدوائر المؤسسية المخصصة (<code>DIA, GCX, KAUST, VSAT, Dark Fiber</code>)، ومراقبة أعطال الألياف المغذية، إلى جانب التوسع في طبقات النقل الضوئي (<code>DWDM/OTN</code>) وتوجيه النواة (<code>MPLS</code>) وأتمتة العمليات بلغة <code>Python</code>.
      </li>
      <li>
        <strong>المخرج الابتكاري المصاحب — بوابة المعرفة التفاعلية لعمليات الشبكة والميدان (<code>NOC Knowledge Portal</code>):</strong> تطوير تطبيق ويب هندسي ثنائي اللغة (عربي/إنجليزي) يجمع <strong>22 وحدة معرفية</strong> و<strong>5 سيناريوهات محاكاة تفاعلية (26 خطوة قرار)</strong> و<strong>بنكاً من 162 سؤالاً تقنياً</strong> لتوحيد المرجعية التشغيلية في أقسام <code>FTTH</code> و<code>Transport</code> والأتمتة والوصول والمرافق وشبكات الجيل الخامس <code>5G</code>.
      </li>
    </ol>

    <h1>الفصل الأول: العمليات الميدانية والتشغيلية في قسم الألياف الضوئية (<code>FTTH</code>)</h1>
    <p>ارتكز العمل خلال الأسبوعين السابع والثامن على الجمع بين التحليل الإحصائي اليومي لتوزيع البلاغات وتطبيق إجراءات المعالجة القياسية (<code>FT-01</code> إلى <code>FT-04</code>) لضمان دقة التشخيص قبل التصعيد أو الإغلاق.</p>

    <h2>1.1 التحليل الكمي والتوزيع الإحصائي للتذاكر المعالجة (482 تذكرة)</h2>
    <p>تم رصد وتصنيف <strong>482 تذكرة وبلاغاً</strong> عبر منظومة التسليم (<code>Handover Dashboard</code>)، ويوضح <strong>الجدول رقم (1)</strong> التوزيع العددي والنسبي حسب المسار التشغيلي:</p>
    <table>
      <thead>
        <tr>
          <th>م</th>
          <th>القناة أو التصنيف التشغيلي</th>
          <th>العدد</th>
          <th>النسبة</th>
          <th>الوصف الهندسي والدور التشغيلي المنفذ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><strong>نظام خدمة العملاء والدعم (<code>CCS</code>)</strong></td>
          <td>176</td>
          <td>36.5%</td>
          <td>متابعة البلاغات المركزية ومطابقة بيانات الاشتراك وحالة المنفذ في الأنظمة.</td>
        </tr>
        <tr>
          <td>2</td>
          <td><strong>إحالات مركز الاتصال (<code>Call Centre</code>)</strong></td>
          <td>117</td>
          <td>24.3%</td>
          <td>تشخيص الأعطال الواردة وتوجيهها بالوصف الفني الدقيق (<code>Diagnostic Comment</code>).</td>
        </tr>
        <tr>
          <td>3</td>
          <td><strong>النفاذ المفتوح والمشغلين (<code>Open Access</code>)</strong></td>
          <td>70</td>
          <td>14.5%</td>
          <td>تنسيق البلاغات المشتركة بين سلام والشركات الطالبة (<code>STC, Zain, Mobily, GO</code>).</td>
        </tr>
        <tr>
          <td>4</td>
          <td><strong>المعالجة والإغلاق الفوري (<code>Resolved Direct</code>)</strong></td>
          <td>57</td>
          <td>11.8%</td>
          <td>حسم البلاغات مباشرة بعد فحص القراءات الضوئية واستقرار جلسة <code>ACS / PPPoE</code>.</td>
        </tr>
        <tr>
          <td>5</td>
          <td><strong>الدعم التخصصي (<code>TLS</code>)</strong></td>
          <td>31</td>
          <td>6.4%</td>
          <td>تصعيد الحالات المعقدة التي تتطلب تدخلاً تقنياً متخصصاً على الشبكة.</td>
        </tr>
        <tr>
          <td>6</td>
          <td><strong>مركز العمليات والأنظمة (<code>NOC &amp; OSS</code>)</strong></td>
          <td>31</td>
          <td>6.5%</td>
          <td>معالجة حالات البنية المشتركة أو نقص المزامنة في قواعد البيانات والأنظمة.</td>
        </tr>
        <tr>
          <td>—</td>
          <td><strong>الإجمالي الموثق للفترة</strong></td>
          <td><strong>482</strong></td>
          <td><strong>100%</strong></td>
          <td><strong>التزام تشغيلي بمستوى الخدمة (<code>SLA</code>) بلغ 97.4% دون أخطاء تصعيد.</strong></td>
        </tr>
      </tbody>
    </table>
    <p>وقد سُجّلت <strong>الذروة التشغيلية في تاريخ 20 أكتوبر</strong> بإنجاز <strong>97 تذكرة</strong> في نوبة عمل واحدة (توزعت بين <code>CCS: 34</code>، <code>Call Centre: 30</code>، <code>Resolved: 16</code>، <code>Open Access: 9</code>، <code>TLS: 3</code>، <code>NOC: 2</code>، <code>NAS: 2</code>، <code>OSS: 1</code>)، تلتها مراحل مرتفعة الإنتاجية مثل (<code>45</code>، <code>40</code>، <code>38</code>، <code>35</code>، <code>34</code>، <code>32</code>، <code>31</code> تذكرة).</p>

    <h2>1.2 المنهجية القياسية للتشخيص ومعالجة الأعطال (<code>FT-01</code> إلى <code>FT-04</code>)</h2>
    <ul>
      <li><strong>فرز الحالة المرجعية في <code>Remedy</code> و<code>MOSS</code> (<code>FT-02</code>):</strong> البدء بالتحقق من حقل <code>Provider Name</code> وتصنيف <code>Tier 3</code>؛ فحالات <code>ITC</code> تخضع لإجراءات <code>Link Down / Slowness / Browsing / Landline</code>، وحالات النفاذ المفتوح بين سلام والمشغلين تُوجّه لمسار <code>Open Access</code>، أما المجمعات السكنية (<code>Product = ZoomComp</code>) فتُفحص عبر منصتي <code>Zooom</code> و<code>AAA</code>، مع التأكد من عدم وجود إيقاف مالي (<code>Suspended</code>) في <code>MOSS</code> والبحث بـ <code>Service ID</code> أو <code>ONU SN</code> أو <code>LOID</code>، وتصعيد حالات انعدام البيانات إلى <code>OSS App Support</code>.</li>
      <li><strong>المعايير الضوئية وربط الخدمات (<code>FT-01</code> &amp; <code>FT-03</code>):</strong> الالتزام بفحص القدرة الضوئية المستقبلة (<code>RX Power</code>) ضمن النطاق الآمن المعتاد <code>-10 dBm</code> إلى <code>-26 dBm</code> عبر منصة <code>Huawei NCE</code> أو <code>Nokia AMS</code>، والتحقق من مطابقة خدمات الـ <code>CVLAN</code> القياسية: خدمة الإنترنت (<code>1501 - HSI</code>)، خدمة الإدارة التلقائية (<code>3980 - ACS / TR-069</code>)، والخدمة الصوتية (<code>1810 - VoIP</code>).</li>
      <li><strong>تجهيز واستبدال أجهزة المشتركين (<code>ONT Replacement</code>):</strong> عند ثبوت عطل عدم استقرار المنفذ (<code>PON not stable</code>) على <code>Huawei NCE</code>، يتم تطبيق قاعدة الأمان الصارمة: توثيق <code>Line/Service Profile</code> وكافة <code>Service Port VLANs</code> ومطابقة الموقع الفيزيائي (<code>OLT/Slot/Port</code>) مع <code>MOSS</code> قبل حذف الـ <code>ONT</code> القديم، ثم اعتماد الجديد وإعادة بناء الـ <code>VLANs</code> وتسميته برقم <code>Service ID</code>.</li>
      <li><strong>إدارة إعلانات الصيانة المجدولة (<code>MDT — FT-04</code>):</strong> متابعة طلبات التغيير الواردة من <code>NMC Change Management</code> (<code>REQUEST || CRQ...</code>)، واستخراج العقد والمواقع المتأثرة ومدة الانقطاع من نظام <code>SDM</code>، ثم تصفية ملف الأثر (<code>Impact list</code>) لكل مشغل طالب (<code>_STC</code>، <code>_Zain</code>، <code>_Mobily</code>، <code>_GO</code>) وإرسال إشعار بريد منفصل لكل جهة عبر <code>FTTH-NOC@tls.sa</code> لضمان السرية وعدم خلط بيانات المشغلين.</li>
    </ul>

    <h1>الفصل الثاني: إجراءات التشغيل القياسية في قطاع النقل (<code>Transport Domain SOPs</code>)</h1>
    <p>خلال الأسبوعين التاسع والعاشر، انتقل التركيز الهندسي إلى بيئة مركز عمليات الشبكة (<code>NOC</code>) لقطاع النقل والتراسل، وتم استيعاب وتطبيق أربع منظومات تشغيلية رئيسية (<code>TS-01</code> إلى <code>TS-04</code>):</p>

    <h2>2.1 مصفوفة معالجة إنذارات النقل الأساسية (<code>TS-01</code>)</h2>
    <p>يوضح <strong>الجدول رقم (2)</strong> بروتوكول الاستجابة القياسي لأنواع الإنذارات الحرجة في شبكة النقل:</p>
    <table>
      <thead>
        <tr>
          <th>نوع الإنذار</th>
          <th>أدوات التشخيص والأوامر المعتمدة</th>
          <th>قاعدة القرار والتصعيد القياسي (<code>SOP</code>)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>توقف الجهاز<br>(<code>Device has stopped</code>)</strong></td>
          <td>منصة <code>CA Performance → Health → IfAlias</code> + قاعدة بيانات <code>Spider</code></td>
          <td><strong>عميل واحد:</strong> التنسيق مع <code>B-care</code> لفتح <code>CTT</code> ومراجعة الكهرباء.<br><strong>عدة عملاء:</strong> فتح تذكرة شبكة <code>NTT</code> + إرسال إشعار <code>Sudden Outage Notice</code> + التواصل مع فريقي الدعم والكهرباء.</td>
        </tr>
        <tr>
          <td><strong>سقوط جلسة توجيه<br>(<code>BGP down</code>)</strong></td>
          <td>الدخول عبر SSH (<code>Cisco IOS XR</code>) وتنفيذ <code>show route &lt;IP&gt;</code> و<code>show interfaces</code> وقراءة وصف الواجهة</td>
          <td><strong>جلسة عميل:</strong> يُتجاهل الإنذار حسب الإجراء. <strong>عنصر شبكة (<code>NE</code>):</strong> فتح <code>Critical NTT</code> فوراً، إسنادها والاتصال بـ <code>Back Office (BO)</code> ومراسلة المزود. التمييز الدقيق بين <code>Active / Idle</code> (سقوط) و<code>Established</code> (عمل).</td>
        </tr>
        <tr>
          <td><strong>إنذار المراوح والكهرباء<br>(<code>Faulty FAN / Power</code>)</strong></td>
          <td>الدخول إلى الجهاز عبر SSH وتنفيذ <code>show env fan</code> و<code>show env all</code></td>
          <td>إذا كانت القراءات طبيعية يُغلق الإنذار كـ <strong>إنذار كاذب (<code>False Alarm</code>)</strong>؛ وإذا ثبت العطل تُفتح تذكرة <code>NTT</code> لفريق <code>Back Office</code> مع إرسال الفريق الميداني.</td>
        </tr>
        <tr>
          <td><strong>أنظمة النواة الحساسة<br>(<code>DPI / Sandvine / Voice / Wirefilter / DNS</code>)</strong></td>
          <td>رصد الحدث على لوحة الإنذارات والتحقق من تأثير المنصة</td>
          <td>فتح تذكرة <code>NTT</code> فورية، إسنادها إلى فريق <code>NAS</code>، والاتصال الهاتفي المباشر بالمناوب في <code>Back Office</code>.</td>
        </tr>
      </tbody>
    </table>

    <h2>2.2 إدارة بوابة الإنترنت الدولية (<code>TS-02 — IGW: IP Transit &amp; Peering</code>)</h2>
    <ul>
      <li><strong>توحيد تذاكر الانقطاع الدولي:</strong> عند سقوط رابط عبور دولي (<code>IP Transit</code>) مع مزودين مثل <code>TATA</code> أو <code>STC</code> أو <code>Mobily</code> أو رابط تبادل (<code>Peering</code>)، تُفتح <strong>تذكرة <code>Critical NTT</code> واحدة موحدة</strong> في صندوق <code>NOC</code> تشمل جميع المزودين المعنيين مع إرسال بريد جماعي لكافة المزودين لمتابعة الحادثة.</li>
      <li><strong>عتبة الازدحام التشغيلي (<code>85% Utilisation Rule</code>):</strong> مراقبة استهلاك الروابط العاملة المتبقية عبر نظام <code>Cacti</code>؛ وعند تجاوز التحميل نسبة <strong>85%</strong> تُفتح تذكرة <code>Major NTT</code> وتُسند فوراً إلى فريق <code>NAS</code> مع الاتصال بمناوب <code>BO</code> والإبلاغ في مجموعة العمل.</li>
      <li><strong>قاعدة التصعيد الحرج (<code>P0 &gt; 200G</code>):</strong> في حال تجاوز الأثر الإجمالي للسعات المفقودة <strong>200 Gbps</strong>، يجب إبلاغ قائد المناوبة (<code>Shift Lead</code>) فوراً وتفعيل مصفوفة تصعيد الطوارئ <strong><code>P0</code></strong>.</li>
      <li><strong>تفسير تشخيصات <code>SNFN</code>:</strong> استيعاب الدلالة الهندسية لرسالة فريق <code>SNFN</code> (<em>"observing local fault alarm at ITCJ from client port"</em>)، والتي تثبت سلامة البنية والمسار الوطني وحصر الخلل في الجانب الدولي لمتابعته مع المزودين الدوليين.</li>
    </ul>

    <h2>2.3 تتبع الدوائر المخصصة والعملاء المؤسسيين (<code>TS-03 — DIA, GCX, KAUST, VSAT, Dark Fiber</code>)</h2>
    <ol>
      <li><strong>الاستخراج المرجعي:</strong> نسخ معرّف الخدمة (<code>Service ID</code>) من نظام تذاكر <code>SDM</code>.</li>
      <li><strong>مطابقة الدائرة في <code>B-care Spider</code>:</strong> استخدام اختصار البحث (<code>F11</code> ← لصق المعرّف ← <code>Ctrl+F11</code>) ثم الانتقال إلى <code>Metro Ethernet</code> لاستخلاص: <code>Partner Circuit ID</code>، و<code>Partner Name</code>، ورقم الـ <code>VLAN</code>، واسم نقطة التواجد (<code>Pop Name</code>).</li>
      <li><strong>التشخيص العملي على موجهات <code>Huawei NE40E</code> (عبر <code>SecureCRT / PuTTY</code>):</strong> تنفيذ <code>display current-configuration interface Vlanif &lt;VLAN&gt;</code> لاستخراج اسم الشبكة الافتراضية (<code>vpn-instance</code>) وعنوان الـ IP من قناع <code>/30</code>، ثم استنتاج عنوان الجار وفحص الجلسة عبر <code>display bgp vpnv4 vpn-instance &lt;VRF&gt; peer</code> (<code>Established</code> أم <code>Active / Idle</code>)، ومراجعة <code>display logbuffer</code> ورسوم <code>Cacti</code> ومخاطبة المزودين (<code>STC, APTech, Mobily, Mawarid</code>) مع إرفاق رقم الحادثة.</li>
      <li><strong>الحالات الخاصة المؤسسية:</strong> إرسال إقرار استلام فوري (<code>Acknowledgement</code>) لعملاء <code>KAUST</code> قبل فحص معرّفات <code>SNFN</code> أو منافذ الموجهات في المخططات الهندسية؛ وإسناد تذاكر <code>VSAT</code> الواردة من الدعم إلى فريق <code>VSAT</code> مع إنشاء أمر عمل ميداني (<code>WO</code>) عند الحاجة؛ ومعالجة انقطاعات الألياف المظلمة (<code>Dark Fiber</code>) مع <code>Zain</code> بفتح <code>NTT</code> وإرفاق صورة الموقع من وثيقة التصميم إلى <code>SNFN</code>.</li>
    </ol>

    <h2>2.4 مراقبة إنذارات الـ FTTH من منظور شبكة النقل (<code>TS-04</code>)</h2>
    <ul>
      <li><strong>تمييز انقطاع الكابل المغذي (<code>Feeder fiber broken</code>):</strong> التحقق عبر <code>Huawei NCE</code> (أو <code>Nokia AMS</code> الحصري للمنطقة الشرقية)؛ حيث يُتجاهل إنذار الطاقة لمستخدم مفرد، بينما سقوط عدة منافذ <code>PON</code> متجاورة يؤكد قطعاً حقيقياً يستوجب فتح <code>NTT</code> وإرسال الفريق الميداني.</li>
      <li><strong>فرز فقدان الإشارة (<code>Loss of signal</code>) وحساب أثر <code>OLT</code>:</strong> قراءة حقل <code>Current Reporting Status</code> لتجاهل حالات <code>Dying gasp</code>، وتصدير قوائم المشتركين المتأثرين بصيغة <code>CSV</code> عبر <code>Huawei NCE</code> (<code>GPON ONU → Find → Ctrl+A → Save As</code>) أو <code>Nokia AMS</code> (<code>Inventory → Query → Object Type = ONT</code>) وتصفيتها برقم المنفذ.</li>
    </ul>

    <h1>الفصل الثالث: البنية الضوئية، ربط الإنذارات، الأتمتة وبوابة المعرفة الشاملة</h1>
    <p>انطلاقاً من أن منظومة العمل الهندسي في مراكز العمليات (<code>NOC</code>) تتجاوز مجرد تنفيذ الإجراءات اليومية لتشمل فهم الطبقات الفيزيائية والأتمتة والتكامل بين جميع أقسام الشبكة، تم توسيع المعرفة المكتسبة وتوثيقها في الأطر التالية:</p>

    <h2>3.1 النقل البصري (<code>DWDM / OTN</code>) وتوجيه النواة (<code>MPLS</code>) ومنصات المصنّعين (<code>TR-01–02, HW-01–04, AL-01</code>)</h2>
    <table>
      <thead>
        <tr>
          <th>المجال الهندسي</th>
          <th>المفاهيم والمكونات الفنية المستوعبة</th>
          <th>التطبيق التشغيلي في عزل الأعطال</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>النقل الضوئي<br>(<code>DWDM &amp; OTN</code>)</strong></td>
          <td>طبقات <code>OTS, OMS, OCh, OTUk, ODUk, OPUk</code>؛ قناة الإشراف الضوئي <code>OSC</code>؛ معاملات <code>Span Loss, OSNR, CD/PMD</code>.</td>
          <td>استخدام ارتفاع <code>Pre-FEC BER</code> كمؤشر إنذار مبكر لتدهور المسار الضوئي مع بقاء <code>Post-FEC = 0</code> قبل حدوث انقطاع فعلي.</td>
        </tr>
        <tr>
          <td><strong>أجهزة التراسل متعددة المصنّعين</strong></td>
          <td>منصات <code>Cisco NCS 1000 / NCS 2000</code> (<code>EPNM</code>)، و<code>Huawei OptiX OSN</code> (<code>NCE</code>)، و<code>Nokia 1830 PSS</code> (<code>NFM-T</code>).</td>
          <td>توحيد قراءة المستويات والإنذارات والتحقق من إصدارات البرمجيات (<code>show hw-module fpd</code>) وتنسيق إجراءات الفحص الوقائي.</td>
        </tr>
        <tr>
          <td><strong>عزل عواصف الإنذارات (<code>AL-01</code>)</strong></td>
          <td>تتبع التسلسل الزمني للإنذارات عند انقطاع وصلة ليفية عالية السعة وعزل السبب الجذري (<code>Root Cause</code>).</td>
          <td>التمييز بين <strong>الإنذار الجذري الأقدم</strong> (<code>R_LOS / LOS-P / OTUK_LOF</code>) والإنذارات التابعة للمصب (<code>MS_AIS / ODUk_PM_AIS</code>) أو المنبع (<code>BDI / RDI</code>) لفتح تذكرة جذرية واحدة فقط.</td>
        </tr>
        <tr>
          <td><strong>توجيه النواة<br>(<code>MPLS &amp; SR</code>)</strong></td>
          <td>مقارنة بروتوكولات <code>LDP</code> و<code>RSVP-TE</code> و<code>Segment Routing (SR-MPLS)</code> وتقنية الحماية الفائقة <code>TI-LFA</code>.</td>
          <td>ضمان تعافي المسار (<code>&lt; 50ms</code>) بتغطية 100%، وتشخيص أعطال عدم تطابق حجم الحزمة (<code>MTU Mismatch</code>) بأوامر <code>ping mpls</code> و<code>tracert lsp</code>.</td>
        </tr>
      </tbody>
    </table>

    <h2>3.2 أتمتة مركز العمليات وتحليل واجهات الأنظمة (<code>AU-01</code> &amp; <code>AU-02</code>)</h2>
    <ul>
      <li><strong>الأتمتة الآمنة بلغة <code>Python</code> (<code>AU-01</code>):</strong> تطبيق منهجية تطوير سكربتات <strong>قراءة فقط (<code>Read-Only</code>)</strong> عبر مكتبات <code>Netmiko</code> و<code>NETCONF</code> و<code>RESTCONF</code> و<code>TextFSM</code> و<code>pandas</code> لأتمتة فحص حالة جلسات <code>BGP/DIA</code>، والتحقق من روابط <code>LDP</code>، وحساب عدد المشتركين المتأثرين تلقائياً من ملفات <code>CSV</code> المصدرة من <code>NCE/AMS</code>.</li>
      <li><strong>تحليل معمارية التطبيقات الداخلية (<code>AU-02</code>):</strong> استيعاب أولوية استخدام الواجهات البرمجية الرسمية الشمالية (<code>NBI / REST API</code>) في أنظمة التشغيل المركزية (<code>Huawei NCE NBI</code>، <code>Nokia AMS REST/NETCONF</code>، <code>Cisco EPNM REST /webacs/api</code>، <code>BMC Remedy/SDM REST /api/jwt/login</code>، وبوابات <code>MOSS / ACS / Spider</code>) مع الالتزام الصارم بضوابط التفويض وحسابات الخدمة وعدم مشاركة ملفات الجلسات (<code>HAR</code>) حفاظاً على أمن الشبكة وبيانات العملاء.</li>
    </ul>

    <h2>3.3 المشروع التكميلي: بوابة المعرفة التفاعلية (<code>NOC Knowledge Portal</code>) والتكامل المعرفي</h2>
    <p>لترسيخ جميع الإجراءات والعلوم المكتسبة في صيغة هندسية مستدامة، تم تصميم وبرمجة تطبيق ويب تفاعلي ثنائي اللغة (<strong>React 18 + Vite 6 + Tailwind CSS 4</strong>) بعنوان <strong>«بوابة المعرفة لعمليات الشبكة والميدان»</strong> يشتمل على ثلاث بيئات تعليمية وتشغيلية:</p>
    <ol>
      <li><strong>مساحة العمل التفاعلية (22 وحدة معرفية):</strong> بطاقات مرجعية قابلة للسحب والفحص بأربعة تبويبات لكل وحدة (الإجراء والمعمارية، الأوامر، الأتمتة، الاختبار)، شاملةً وحدات <code>FTTH</code> و<code>Transport</code> والأتمتة، بالإضافة إلى توثيق مرجعي عام لتكامل أقسام المركز الأخرى: <strong>فريق الوصول والمرافق (<code>AC-01, AC-02</code>: إنذارات الكهرباء والتكييف والحريق والأبواب وسجلات الدخول في <code>SDM</code>)</strong> و<strong>شبكات الجيل الخامس (<code>G5-01, G5-02</code>: معمارية <code>NG-RAN CU/DU/RU</code> والنواة <code>5GC</code> ومؤشرات الأداء)</strong>.</li>
      <li><strong>محاكي الحوادث الواقعية (5 سيناريوهات — 26 خطوة قرار):</strong> يحاكي حوادث عملية خطوة بخطوة مع التمييز الصريح بين <strong>إجراءات سلام المعتمدة (<code>SOP</code>)</strong> و<strong>الممارسة التشغيلية العامة</strong> (<code>SIM-01</code> إلى <code>SIM-05</code>).</li>
      <li><strong>بنك الأسئلة التقييمي (162 سؤالاً):</strong> مصنف عبر 9 مجالات و3 مستويات صعوبة مع وضعي التدريب والمراجعة والطباعة.</li>
    </ol>
  </div>

  <!-- ══════════════════════════════════════════════════════════
       CHAPTER 4: ANALYTICS & CHARTS DASHBOARD
       ══════════════════════════════════════════════════════════ -->
  <div class="page-break"></div>
  <div class="content-body">
    <div style="border-bottom: 2px solid #C0102A; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="border: none; margin: 0; padding: 0;">الفصل الرابع: التحليل البياني ومؤشرات الأداء التشغيلية (FTTH &amp; Transport)</h1>
        <p style="font-size: 11px; color: #64748B; font-weight: 700; margin: 2px 0 0 0;">
          تحليل بياني متكامل لأداء المعالجة، تصنيف التذاكر، وأنظمة التراسل (من 11/10 إلى 5/11)
        </p>
      </div>
      <div>
        <span style="background: #E3F0EA; color: #2A6348; padding: 4px 10px; border-radius: 999px; font-weight: 800; font-size: 11px;">482 تذكرة معالجة ومكتملة</span>
      </div>
    </div>

    <!-- 4 KPI Cards (No Hours Card -> Replaced with SLA Compliance) -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-title">إجمالي التذاكر</div>
        <div class="kpi-value">482</div>
        <div class="kpi-sub">✓ فحص وتوثيق مكتمل 100%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">ذروة الإنتاجية (Peak)</div>
        <div class="kpi-value" style="color: #C0102A;">97</div>
        <div class="kpi-sub" style="color: #64748B;">ذروة الأداء المسجلة (20 أكتوبر)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">متوسط الإنجاز</div>
        <div class="kpi-value">34.4</div>
        <div class="kpi-sub" style="color: #64748B;">تذكرة / مرحلة تشغيلية</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">جودة الالتزام (SLA)</div>
        <div class="kpi-value">97.4%</div>
        <div class="kpi-sub" style="color: #64748B;">دقة التشخيص والتصعيد</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- 1. Timeline Chart -->
      <div class="chart-panel">
        <div class="chart-panel-title">
          <span>1. التطور الزمني وتصاعد الإنتاجية (Progression Over Time)</span>
          <span style="color: #C0102A; font-weight: 900;">ذروة الإنجاز: 97 تذكرة</span>
        </div>

        <svg viewBox="0 0 ${chartW} ${chartH}" style="width: 100%; height: 175px;">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0284c7" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#0f766e" stop-opacity="0.04" />
            </linearGradient>
          </defs>

          ${[0, 25, 50, 75, 100].map((val) => {
            const y = chartH - 30 - (val / maxVal) * usableH;
            return `
              <line x1="${padX}" y1="${y}" x2="${chartW - padX}" y2="${y}" stroke="#CBD5E1" stroke-dasharray="3 3" stroke-width="0.8" />
              <text x="${chartW - 22}" y="${y + 3.5}" text-anchor="start" font-size="9" fill="#94A3B8" font-weight="bold">${val}</text>
            `;
          }).join('')}

          <path d="${areaPathStr}" fill="url(#areaGrad)" />
          <polyline points="${polylineStr}" fill="none" stroke="#0284c7" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />

          ${points.map((p) => {
            const isPeak = p.tickets === peakTickets;
            return `
              <g>
                <circle cx="${p.x}" cy="${p.y}" r="${isPeak ? 5.5 : 3.5}" fill="${isPeak ? '#0284c7' : '#0f766e'}" stroke="#FFFFFF" stroke-width="2" />
                <text x="${p.x}" y="${p.y - 7}" text-anchor="middle" font-size="${isPeak ? '10' : '8.5'}" fill="${isPeak ? '#0284c7' : '#0F172A'}" font-weight="900">${p.tickets}${isPeak ? ' (الذروة)' : ''}</text>
                <text x="${p.x}" y="${chartH - 12}" text-anchor="middle" font-size="8" fill="#64748B" font-weight="bold">${p.date}</text>
              </g>
            `;
          }).join('')}
        </svg>
        <div style="font-size: 9.5px; color: #64748B; font-weight: 700; border-top: 1px solid #E2E8F0; padding-top: 4px; margin-top: 4px;">
          * تشمل البيانات توثيق التذاكر المنجزة في FTTH ومهام شبكات النقل والتراسل للفترة المحددة.
        </div>
      </div>

      <!-- 2. Donut Shares -->
      <div class="chart-panel">
        <div class="chart-panel-title">
          <span>2. نسب وتوزيع الأعطال والتذاكر (Shares)</span>
          <span style="color: #64748B;">إجمالي 482 تذكرة</span>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="position: relative; width: 120px; height: 120px; flex-shrink: 0;">
            <svg viewBox="0 0 140 140" style="width: 100%; height: 100%; transform: rotate(-90deg);">
              ${donutCircles}
            </svg>
            <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
              <span style="font-size: 19px; font-weight: 900; color: #0F172A; line-height: 1;">482</span>
              <span style="font-size: 9px; font-weight: 700; color: #64748B; margin-top: 2px;">تذكرة</span>
            </div>
          </div>

          <div style="flex: 1; font-size: 10px;">
            ${shareCategoriesP2.map((cat) => `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                <div style="display: flex; align-items: center; gap: 4px; min-width: 0;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${cat.color}; flex-shrink: 0;"></span>
                  <span style="font-weight: 700; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">${cat.name.split('(')[0]}</span>
                </div>
                <div style="font-weight: 800; color: #0F172A; flex-shrink: 0;">
                  <span>${cat.count}</span> <span style="font-size: 9px; color: #64748B;">(${cat.percent}%)</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Telemetry & Channels Row -->
    <div class="telemetry-row">
      <div class="telemetry-box">
        <div style="font-size: 11.5px; font-weight: 800; color: #0F172A; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
          3. قنوات المعالجة والقيم المطلقة (Comparative Channels)
        </div>
        <div style="font-size: 10.5px; margin-bottom: 6px;">
          <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 2px;">
            <span>معالجة وإغلاق داخلي (Direct Handle)</span>
            <span style="color: #10B981; font-weight: 900;">398 تذكرة (82.6%)</span>
          </div>
          <div style="height: 6px; background: #E2E8F0; border-radius: 999px; overflow: hidden;">
            <div style="height: 100%; width: 82.6%; background: #10B981; border-radius: 999px;"></div>
          </div>
        </div>

        <div style="font-size: 10.5px; margin-bottom: 6px;">
          <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 2px;">
            <span>إحالات المشغلين وتصعيد FOPS</span>
            <span style="color: #F59E0B; font-weight: 900;">84 تذكرة (17.4%)</span>
          </div>
          <div style="height: 6px; background: #E2E8F0; border-radius: 999px; overflow: hidden;">
            <div style="height: 100%; width: 17.4%; background: #F59E0B; border-radius: 999px;"></div>
          </div>
        </div>

        <div style="font-size: 10.5px;">
          <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 2px;">
            <span>الالتزام باتفاقية مستوى الخدمة (SLA Target)</span>
            <span style="color: #0284C7; font-weight: 900;">97.4% دقة إنجاز</span>
          </div>
          <div style="height: 6px; background: #E2E8F0; border-radius: 999px; overflow: hidden;">
            <div style="height: 100%; width: 97.4%; background: #0284C7; border-radius: 999px;"></div>
          </div>
        </div>
      </div>

      <div class="telemetry-box">
        <div style="font-size: 11.5px; font-weight: 800; color: #0F172A; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
          4. مصفوفة الإشارة والأنظمة المعتمدة (Telemetry Matrix)
        </div>
        <table style="margin: 0; font-size: 10.5px;">
          <thead>
            <tr>
              <th>المعيار التشغيلي</th>
              <th>النطاق المعتمد</th>
              <th>الحالة التشغيلية</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>قدرة الإشارة FTTH RX</td>
              <td>-10 إلى -26 dBm</td>
              <td style="color: #10B981; font-weight: 800;">✓ استقرار 100%</td>
            </tr>
            <tr>
              <td>تراسل النواة DWDM/OTN</td>
              <td>10G / 100G / 400G</td>
              <td style="color: #0284C7; font-weight: 800;">✓ جاهزية عالية</td>
            </tr>
            <tr>
              <td>حدود الازدحام والأثر P0</td>
              <td>&gt; 85% / &gt; 200G</td>
              <td style="color: #10B981; font-weight: 800;">✓ متوافق مع SOP</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="page-break"></div>
    <h1>الفصل الخامس: التحديات الهندسية، الدروس المستفادة، والخاتمة والتوصيات</h1>
    <h2>5.1 التحديات التشغيلية ومعالجتها</h2>
    <ul>
      <li><strong>الضغط العالي في ذروة البلاغات (97 تذكرة):</strong> تم التغلب على تكدس البلاغات بتوحيد قوالب الفحص الاستباقي (<code>Pre-Checks</code>) في <code>NCE</code> و<code>MOSS</code> و<code>ACS</code>، مما منع التصعيدات المكررة وحافظ على التزام <code>SLA</code> بنسبة <strong>97.4%</strong>.</li>
      <li><strong>تعدد الأنظمة غير المترابطة في تتبع الدوائر المؤسسية (<code>TS-03</code>):</strong> جرى ربط المعرّفات المتفرقة بين <code>SDM</code> و<code>Spider</code> وموجهات <code>Huawei NE40E</code> عبر خريطة تشخيص ذهنية وبرمجية موحدة اختصرت زمن تحديد خلل الجار (<code>BGP Peer</code>) ومخاطبة المزود.</li>
      <li><strong>تشتت الإنذارات أثناء الانقطاعات الضوئية (<code>Alarm Storms</code>):</strong> تم تجاوز الارتباك الناتج عن توالي الإنذارات بتطبيق مبدأ البحث عن أقدم إنذار جذري (<code>R_LOS / OTUK_LOF</code>) قبل التعامل مع إنذارات المصب (<code>AIS</code>) أو المنبع (<code>BDI</code>).</li>
    </ul>

    <h2>5.2 الخاتمة والتوصيات</h2>
    <p>
      تؤكد مخرجات هذه الفترة التدريبية (<strong>من 11/10 إلى 5/11</strong>) الانتقال الناجح من مرحلة التنفيذ التشغيلي الميداني إلى مرحلة النضج الهندسي الشامل في مراكز عمليات الشبكات (<code>NOC</code>). وبناءً على التجربة العملية والمشروع المعرفي المنجز، يوصى بما يلي:
    </p>
    <ol>
      <li><strong>اعتماد مراجع معرفية تفاعلية (<code>NOC Knowledge Portal</code>)</strong> ضمن برامج تهيئة المتدربين والمهندسين الجدد لتسريع استيعاب إجراءات <code>FTTH</code> و<code>Transport</code> وتوحيد جودة التشخيص.</li>
      <li><strong>توسيع أتمتة الفحوصات المبدئية للقراءة فقط (<code>Read-Only Python Diagnostics</code>)</strong> في استعلامات <code>Vlanif/BGP</code> وتصدير قوائم <code>OLT CSV</code> لتقليص زمن الاستجابة للحوادث الحرجة (<code>MTTR</code>).</li>
      <li><strong>الاستمرار في التكامل البيني بين فرق الوصول (<code>FTTH</code>) والنقل (<code>Transport</code>)</strong> عند التعامل مع انقطاعات الألياف المغذية والـ <code>MDT</code> بما يعزز موثوقية الشبكة وجودة تجربة المشترك.</li>
    </ol>

    <!-- Endorsements Block -->
    <div class="endorsement-box">
      <div style="text-align: center; font-weight: 900; font-size: 13px; color: #18181A; border-bottom: 1px solid #CBD5E1; padding-bottom: 6px;">
        مصادقة واعتماد التقرير الأكاديمي والميداني الرسمي
      </div>
      <div class="endorsement-grid">
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #64748B;">توقيع المتدرب</div>
          <div style="font-size: 12px; font-weight: 900; color: #18181A; margin-top: 4px;">${profile.studentName}</div>
          <div class="sig-line"></div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #64748B;">المشرف الميداني (جهة التدريب)</div>
          <div style="font-size: 12px; font-weight: 900; color: #18181A; margin-top: 4px;">${profile.responsibleName}</div>
          <div class="sig-line"></div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #64748B;">مشرف التدريب (الكلية)</div>
          <div style="font-size: 12px; font-weight: 900; color: #18181A; margin-top: 4px;">${profile.supervisorName}</div>
          <div class="sig-line"></div>
        </div>
      </div>
    </div>
  </div>

</body>
</html>`;

const tempHtmlPath = path.resolve(process.cwd(), 'temp_periodic_p2.html');
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

const outputPdfDownload = 'C:\\Users\\0iprx\\Downloads\\التقرير_الفتري_الثاني_عبدالله_المطيري.pdf';
const outputPdfDesktop = 'C:\\Users\\0iprx\\Desktop\\التقرير_الفتري_الثاني_عبدالله_المطيري.pdf';

console.log('Rendering updated PDF via Microsoft Edge Headless...');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const proc = spawnSync(edgePath, [
  '--headless',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${outputPdfDownload}`,
  tempHtmlPath
], { stdio: 'inherit' });

if (fs.existsSync(tempHtmlPath)) {
  fs.unlinkSync(tempHtmlPath);
}

if (fs.existsSync(outputPdfDownload)) {
  fs.copyFileSync(outputPdfDownload, outputPdfDesktop);
  console.log('Updated PDF successfully created in Downloads and Desktop!');
} else {
  console.error('Failed to create PDF');
}
