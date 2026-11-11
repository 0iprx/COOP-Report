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
  { date: '20/10', tickets: 97 },
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
  { name: 'CCS (نظام خدمة العملاء والدعم)', count: 176, percent: 36.5, color: '#0f766e' },
  { name: 'Call Centre (إحالات الكول سنتر)', count: 117, percent: 24.3, color: '#0284c7' },
  { name: 'Open Access (النفاذ المفتوح)', count: 70, percent: 14.5, color: '#06b6d4' },
  { name: 'Resolved Direct (إغلاق مباشر)', count: 57, percent: 11.8, color: '#10b981' },
  { name: 'TLS (الدعم الفني التخصصي)', count: 31, percent: 6.4, color: '#6366f1' },
  { name: 'NOC & OSS (مع NAS)', count: 31, percent: 6.5, color: '#f59e0b' }
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
      margin: 14mm 15mm 14mm 15mm;
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
      line-height: 1.62;
      font-size: 12.5px;
    }
    code {
      font-family: monospace;
      background: #F1F5F9;
      padding: 1px 4px;
      border-radius: 4px;
      font-size: 11px;
      color: #0F172A;
      border: 1px solid #E2E8F0;
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
      line-height: 1.45;
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
      font-size: 13px;
      color: #686560;
      font-weight: 700;
      margin: 0;
    }
    .matrix-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 11px 18px;
      background: #FAFAF8;
      border: 1px solid #E6E2D8;
      border-radius: 12px;
      padding: 15px 18px;
      margin-top: 16px;
      font-size: 12px;
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
      padding: 8px 13px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .intervals-container {
      background: #FAFAF8;
      border: 1px solid #E6E2D8;
      border-radius: 12px;
      padding: 13px 16px;
      margin-top: 14px;
    }
    .intervals-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #E6E2D8;
      padding-bottom: 7px;
      margin-bottom: 10px;
    }
    .intervals-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 9px;
    }
    .interval-card {
      background: #FFFFFF;
      border: 1px solid #E6E2D8;
      border-radius: 8px;
      padding: 9px 11px;
      font-size: 11px;
    }
    .interval-card-title {
      font-weight: 800;
      color: #18181A;
      margin-bottom: 4px;
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
      padding: 0 1mm;
    }
    h1 {
      font-size: 16px;
      font-weight: 900;
      color: #18181A;
      border-bottom: 2px solid #C0102A;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 9px;
      page-break-after: avoid;
      break-after: avoid;
    }
    h2 {
      font-size: 13.5px;
      font-weight: 800;
      color: #C0102A;
      margin-top: 13px;
      margin-bottom: 5px;
      page-break-after: avoid;
      break-after: avoid;
    }
    h3 {
      font-size: 12px;
      font-weight: 800;
      color: #0F172A;
      margin-top: 10px;
      margin-bottom: 4px;
      page-break-after: avoid;
      break-after: avoid;
    }
    p {
      margin: 0 0 7px 0;
      text-align: justify;
    }
    ul, ol {
      margin: 0 0 9px 0;
      padding-right: 18px;
    }
    li {
      margin-bottom: 3.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 12px 0;
      font-size: 11px;
    }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th, td {
      border: 1px solid #CBD5E1;
      padding: 5px 8px;
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
    .snapshots-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 8px 0 12px 0;
    }
    .snapshot-box {
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 8px;
      background: #FAFAF8;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .snapshot-box h3 {
      margin-top: 0;
      color: #C0102A;
    }
    .snapshot-box table {
      margin: 4px 0 0 0;
      font-size: 10.2px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 12px 0;
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
      font-size: 21px;
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
      gap: 12px;
      margin: 12px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .chart-panel {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 11px;
    }
    .chart-panel-title {
      font-size: 11.5px;
      font-weight: 800;
      color: #0F172A;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 5px;
      margin-bottom: 9px;
      display: flex;
      justify-content: space-between;
    }
    .telemetry-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 12px 0;
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
      padding: 15px;
      margin-top: 22px;
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
      height: 38px;
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
        <div style="width: 52px; height: 52px; border-radius: 50%; background: #F6DDE1; color: #C0102A; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; font-size: 22px; border: 2px solid #C0102A;">
          COOP
        </div>
        <div style="font-size: 10px; font-weight: 800; color: #686560; margin-top: 4px;">التقرير الفتري للتدريب التعاوني</div>
      </div>

      <div class="header-box" style="text-align: left;">
        <div style="font-weight: 900; font-size: 12px; color: #18181A;">${profile.entityAddress || 'هواوي السعودية الرياض'}</div>
        <div style="color: #686560;">قسم خدمات الألياف FTTH وشبكات النقل</div>
        <div style="font-size: 10px; color: #9E9A93;">FTTH Operations &amp; Transport Domain</div>
      </div>
    </div>

    <!-- Centered Middle Section -->
    <div style="margin: auto 0; text-align: center;">
      <div class="cover-title-badge">من 11/10 إلى 5/11</div>
      <h1 class="cover-title" style="border: none;">التقرير الفتري الثاني</h1>
      <p class="cover-subtitle">قسم خدمات الألياف الضوئية FTTH وقسم شبكات النقل والتراسل (Transport Domain)</p>

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
          <span class="matrix-val">عمليات الألياف (FTTH) وشبكات النقل (Transport Networks)</span>
        </div>
        <div class="matrix-row">
          <span class="matrix-label">طبيعة العمل:</span>
          <span class="matrix-val">قسم خدمات FTTH وقسم شبكات النقل (Transport Domain)</span>
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
          <span style="font-weight: 900; color: #C0102A; font-size: 12px;">موظف فعلي في FTTH (الأسابيع 7–8) ومتدرب في الترانزبورت (الأسابيع 9–10)</span>
        </div>
      </div>

      <!-- Technical Scope Summary (No Hours, No Shift Times) -->
      <div class="intervals-container" style="text-align: right;">
        <div class="intervals-header">
          <span style="font-weight: 900; font-size: 12px; color: #18181A;">ملخص مراحل الفترة ونطاق العمل:</span>
          <div>
            <span style="background: #E3F0EA; color: #2A6348; padding: 2px 9px; border-radius: 999px; font-weight: 800; font-size: 10.5px; border: 1px solid #2A634830;">482 تذكرة موثقة | 97.4% SLA</span>
            <span style="color: #C0102A; font-weight: 900; font-size: 11px; margin-right: 6px;">من 11/10 إلى 5/11</span>
          </div>
        </div>

        <div class="intervals-grid">
          <div class="interval-card">
            <div class="interval-card-title">الأسابيع 7 و 8: العمل الفعلي في قسم FTTH وإدارة التذاكر</div>
            <div class="interval-card-meta">
              <span>إنجاز 482 تذكرة</span>
              <span style="color: #C0102A; font-weight: 800;">ذروة 97 تذكرة (20/10)</span>
            </div>
          </div>

          <div class="interval-card">
            <div class="interval-card-title">الأسبوع 9: إنذارات النقل وبوابة الإنترنت الدولية (TS-01 و TS-02)</div>
            <div class="interval-card-meta">
              <span>CA / Spider / Cacti</span>
              <span style="color: #C0102A; font-weight: 800;">BGP / IGW / P0 / SNFN</span>
            </div>
          </div>

          <div class="interval-card">
            <div class="interval-card-title">الأسبوع 10: تتبع دوائر DIA و KAUST وإنذارات النقل للـ FTTH (TS-03 و TS-04)</div>
            <div class="interval-card-meta">
              <span>SDM / NE40E / Vlanif</span>
              <span style="color: #C0102A; font-weight: 800;">NCE / AMS / CSV Impact</span>
            </div>
          </div>

          <div class="interval-card">
            <div class="interval-card-title">المشروع المرجعي: بوابة المعرفة التفاعلية (NOC Portal)</div>
            <div class="interval-card-meta">
              <span>React + Python Netmiko</span>
              <span style="color: #C0102A; font-weight: 800;">DWDM / MPLS / 22 وحدة</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cover Footer -->
    <div class="cover-footer">
      <span>المملكة العربية السعودية — التقرير الفتري الثاني للتدريب التعاوني (من 11/10 إلى 5/11)</span>
      <span style="color: #C0102A; font-weight: 900;">الغلاف الرسمي المعتمد</span>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════
       REPORT NARRATIVE
       ══════════════════════════════════════════════════════════ -->
  <div class="page-break"></div>
  <div class="content-body">
    <h1>مقدمة التقرير الفتري الثاني (من 11/10 إلى 5/11)</h1>
    <p>
      يغطي هذا التقرير الفترة الممتدة <strong>من 11/10 إلى 5/11</strong> من برنامج التدريب التعاوني (الأسابيع: السابع، الثامن، التاسع، والعاشر)، وقد انقسم العمل فيها إلى مرحلتين رئيسيتين:
    </p>
    <ol>
      <li>
        <strong>الأسابيع 7 و 8 — الاستمرار كموظف فعلي في قسم الألياف الضوئية (<code>FTTH</code>):</strong> مواصلة العمل المباشر والمستقل على نظام تسليم البلاغات (<code>Handover Dashboard</code>) ومعالجة التذاكر اليومية وتشخيص أعطال المشتركين، وتطبيق إجراءات الفحص واستبدال أجهزة الـ <code>ONT</code> وإرسال إشعارات الصيانة المجدولة (<code>MDT</code>)، بإجمالي <strong>482 تذكرة</strong> خلال الفترة، ووصولًا إلى أعلى رقم مسجل في يوم <strong>20 أكتوبر (97 تذكرة)</strong> بمعدل التزام بالخدمة بلغ <strong>97.4%</strong>.
      </li>
      <li>
        <strong>الأسابيع 9 و 10 — التدريب في قسم شبكات النقل (<code>Transport Domain</code>):</strong> الانتقال من شبكات النفاذ (<code>FTTH</code>) إلى قسم النقل في مركز عمليات الشبكة (<code>NOC</code>)، والتدرب على معالجة إنذارات النقل الأساسية (<code>Device has stopped</code>، <code>BGP down</code>، <code>Faulty FAN</code>)، وإدارة انقطاعات بوابة الإنترنت الدولية (<code>IP Transit / Peering</code>)، وتتبع دوائر الشركات المخصصة (<code>DIA / GCX / KAUST / VSAT / Dark Fiber</code>) عبر أنظمة <code>SDM</code> و<code>Spider</code> وموجهات <code>Huawei NE40E</code>، بالإضافة إلى متابعة إنذارات <code>FTTH</code> من شاشات النقل، وبناء <strong>موقع ويب شخصي (<code>NOC Knowledge Portal</code>)</strong> جمعتُ فيه كل هذه الإجراءات والأوامر وسكربتات <code>Python</code> والمحاكاة للمراجعة والتطبيق.
      </li>
    </ol>

    <h1>أولًا: العمل الفعلي في قسم FTTH وإجراءات التشغيل المتقدمة (الأسابيع 7 و 8)</h1>
    <h2>1. مسار فرز التذاكر في أنظمة <code>Remedy</code> و<code>MOSS</code> (<code>FT-02</code>)</h2>
    <p>عند استلام أي تذكرة في قائمة العمل، يبدأ الفحص من حقل <code>Provider Name</code> وتصنيف المشكلة (<code>Tier 3</code>) لتحديد الإجراء الصحيح:</p>
    <ul>
      <li><strong>عملاء <code>ITC</code>:</strong> تطبيق مسارات <code>Link Down</code> أو <code>Slowness</code> أو <code>Browsing</code> أو <code>Gaming</code> أو <code>Landline</code> حسب وصف الشكوى.</li>
      <li><strong>النفاذ المفتوح (<code>Open Access</code>):</strong> عندما تكون سلام هي المزوّد والشركة الطالبة هي <code>STC</code> أو <code>Zain</code> أو <code>Mobily</code> أو <code>GO</code>، يتم التنسيق وفق مسار المشغلين.</li>
      <li><strong>المجمعات السكنية (<code>Product = ZoomComp</code>):</strong> يتم فحص حالة <code>GPON</code> عبر منصتي <code>Zooom</code> و<code>AAA</code>.</li>
      <li><strong>خطوات التحقق الأساسية قبل أي تصعيد:</strong> التأكد في <code>MOSS</code> أن حساب العميل ليس في حالة إيقاف (<code>Suspended</code>)، وتحديد المنطقة في <code>Remedy</code> لمعرفة هل الـ <code>OLT</code> يتبع منصة <code>Huawei NCE</code> أم <code>Nokia AMS</code>، ثم البحث بالـ <code>Service ID</code>. وإذا لم تظهر بيانات، يتم الدخول إلى <code>MOSS → Service instance → PON Access Service</code> والبحث بـ <code>ONU SN</code> ثم بـ <code>LOID</code>، وفي حال عدم وجود بيانات نهائياً تُسند التذكرة إلى <code>Applications → OSS App Support</code>.</li>
    </ul>

    <h2>2. المعايير الضوئية وخدمات <code>CVLAN</code> واستبدال الـ <code>ONT</code> (<code>FT-01</code> و<code>FT-03</code>)</h2>
    <ul>
      <li><strong>نطاق الإشارة الضوئية (<code>RX Power</code>):</strong> التحقق الدائم من أن قراءة القدرة المستقبلة تقع بين <code>-10 dBm</code> و <code>-26 dBm</code> عبر <code>Huawei NCE</code> أو <code>Nokia AMS</code>.</li>
      <li><strong>قنوات <code>CVLAN</code> لعملاء سلام:</strong> خدمة الإنترنت (<code>1501 - HSI</code>)، خدمة الإدارة (<code>3980 - ACS / TR-069</code>)، وخدمة الصوت (<code>1810 - VoIP</code>).</li>
      <li><strong>خطوات استبدال <code>ONT</code> على <code>Huawei NCE</code> (عند ظهور <code>PON not stable</code>):</strong> البحث بالـ <code>Service ID</code> ونسخ بيانات الجهاز (<code>Line/Service profile</code>) ثم الدخول إلى <code>Service Port Info</code> ونسخ جميع أرقام الـ <code>VLAN</code> في الملاحظات ← الدخول إلى <code>Resource → Access Resource → GPON ONU → GPON ONU Auto Discovery</code> والتصفية بـ <code>SN</code> أو <code>LOID</code> ← مطابقة الموقع (<code>OLT/Slot/Port</code>) مع <code>MOSS</code> قبل الحذف (لأن الحذف يقطع الخدمة ويمسح المنافذ) ← حذف الـ <code>ONT</code> القديم ثم <code>Confirm ONU</code> للجديد ← تفعيل <code>Locate to ONU list</code> ثم <code>Apply</code> وإعادة إنشاء الـ <code>VLANs</code> ثم <code>Modify → Name = Service ID</code>.</li>
    </ul>

    <h2>3. إعلانات الصيانة المجدولة للشركات الطالبة (<code>MDT — FT-04</code>)</h2>
    <p>عند وصول بريد من <code>NMC Change Management</code> بعنوان <code>REQUEST || CRQ…</code> ومرفق <code>Impact list</code>: يتم البحث عن رقم <code>CRQ</code> في <code>SDM</code> وأخذ الوصف (العقد والمواقع) وسبب التغيير والـ <code>Requester Region</code> والتواريخ ومدة الانقطاع ← تصفية ملف <code>Impact list</code> وفصل عملاء كل شركة في ملف مستقل بلاحقة <code>_STC</code> أو <code>_Zain</code> أو <code>_Mobily</code> أو <code>_GO</code> ← إرسال بريد منفصل لكل جهة من <code>FTTH-NOC@tls.sa</code> بعنوان <code>TLS MDT #CRQ…</code> (أو <code>Emergency TLS MDT #CRQ…</code> للحالات العاجلة) مع إضافة تفاصيل المنطقة لشركة <code>GO</code>.</p>

    <h1>ثانيًا: تفاصيل وإحصائيات التذاكر الموثقة (482 تذكرة — من 11/10 إلى 5/11)</h1>
    <h2>1. التوزيع الإجمالي للتذاكر حسب المسارات (<code>Category Summary</code>)</h2>
    <table>
      <thead>
        <tr>
          <th>م</th>
          <th>التصنيف (<code>Category</code>)</th>
          <th>عدد التذاكر</th>
          <th>النسبة المئوية</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1</td><td><strong>CCS</strong></td><td>176</td><td>36.5%</td></tr>
        <tr><td>2</td><td><strong>Call Centre</strong></td><td>117</td><td>24.3%</td></tr>
        <tr><td>3</td><td><strong>Open Access</strong></td><td>70</td><td>14.5%</td></tr>
        <tr><td>4</td><td><strong>Resolved Direct</strong></td><td>57</td><td>11.8%</td></tr>
        <tr><td>5</td><td><strong>TLS</strong></td><td>31</td><td>6.4%</td></tr>
        <tr><td>6</td><td><strong>NOC &amp; OSS (مع NAS)</strong></td><td>31</td><td>6.5%</td></tr>
        <tr><td>—</td><td><strong>الإجمالي العام للفترة</strong></td><td><strong>482</strong></td><td><strong>100.0%</strong></td></tr>
      </tbody>
    </table>

    <h2>2. تفاصيل الأيام الموثقة بالصور من أداة التسليم (<code>Handover Snapshots</code>)</h2>
    <div class="snapshots-grid">
      <div class="snapshot-box">
        <h3>11/10 (إجمالي 40 تذكرة)</h3>
        <table>
          <thead><tr><th>Category</th><th>Unique Count</th></tr></thead>
          <tbody>
            <tr><td>Call Centre</td><td>15</td></tr>
            <tr><td>CCS</td><td>10</td></tr>
            <tr><td>Open Access</td><td>7</td></tr>
            <tr><td>Resolved</td><td>6</td></tr>
            <tr><td>Pending to NOC</td><td>2</td></tr>
            <tr><td>TLS / OSS / NAS</td><td>0</td></tr>
            <tr><td><strong>المجموع</strong></td><td><strong>40</strong></td></tr>
          </tbody>
        </table>
      </div>

      <div class="snapshot-box">
        <h3>19/10 (إجمالي 16 تذكرة)</h3>
        <table>
          <thead><tr><th>Category</th><th>Unique Count</th></tr></thead>
          <tbody>
            <tr><td>CCS</td><td>6</td></tr>
            <tr><td>Call Centre</td><td>6</td></tr>
            <tr><td>Open Access</td><td>2</td></tr>
            <tr><td>Resolved</td><td>2</td></tr>
            <tr><td>TLS / OSS / Pending to NOC / NAS</td><td>0</td></tr>
            <tr><td><strong>المجموع</strong></td><td><strong>16</strong></td></tr>
          </tbody>
        </table>
      </div>

      <div class="snapshot-box">
        <h3>20/10 (إجمالي 97 تذكرة — الذروة، مثل <code>INC000003443563</code>)</h3>
        <table>
          <thead><tr><th>Category</th><th>Unique Count</th></tr></thead>
          <tbody>
            <tr><td>CCS</td><td>34</td></tr>
            <tr><td>Call Centre</td><td>30</td></tr>
            <tr><td>Resolved</td><td>16</td></tr>
            <tr><td>Open Access</td><td>9</td></tr>
            <tr><td>TLS</td><td>3</td></tr>
            <tr><td>Pending to NOC</td><td>2</td></tr>
            <tr><td>NAS</td><td>2</td></tr>
            <tr><td>OSS</td><td>1</td></tr>
            <tr><td><strong>المجموع</strong></td><td><strong>97</strong></td></tr>
          </tbody>
        </table>
      </div>

      <div class="snapshot-box">
        <h3>21/10 (ارتفعت من 36 إلى 45 تذكرة بنهاية المتابعة)</h3>
        <table>
          <thead><tr><th>Category</th><th>10:28 PM</th><th>11:57 PM</th></tr></thead>
          <tbody>
            <tr><td>CCS</td><td>18</td><td>25</td></tr>
            <tr><td>Call Centre</td><td>9</td><td>11</td></tr>
            <tr><td>Open Access</td><td>6</td><td>6</td></tr>
            <tr><td>Resolved</td><td>3</td><td>3</td></tr>
            <tr><td>TLS / OSS / NOC / NAS</td><td>0</td><td>0</td></tr>
            <tr><td><strong>المجموع</strong></td><td><strong>36</strong></td><td><strong>45</strong></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="snapshot-box" style="margin-bottom: 12px;">
      <h3>29/10 (إجمالي 31 تذكرة — أمثلة التذاكر: <code>INC000003464990</code>، <code>INC000003462937</code>، <code>INC000003462569</code>، <code>INC000003462366</code>، <code>INC000003461185</code>)</h3>
      <table>
        <thead><tr><th>Category</th><th>CCS</th><th>Open Access</th><th>Call Centre</th><th>Resolved</th><th>TLS</th><th>OSS</th><th>Pending to NOC / NAS</th><th>المجموع</th></tr></thead>
        <tbody>
          <tr><td><strong>Unique Count</strong></td><td>16</td><td>5</td><td>3</td><td>3</td><td>2</td><td>2</td><td>0</td><td><strong>31</strong></td></tr>
        </tbody>
      </table>
    </div>

    <h2>3. السجل التراكمي الكامل للمراحل الـ 14 (482 تذكرة)</h2>
    <table>
      <thead>
        <tr>
          <th>التاريخ</th>
          <th>العدد</th>
          <th>الملاحظة التشغيلية</th>
          <th>التاريخ</th>
          <th>العدد</th>
          <th>الملاحظة التشغيلية</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>11/10</td><td>40</td><td>لقطة هاند أوفر موثقة (CCS 10 / Call Centre 15)</td><td>21/10</td><td>45</td><td>لقطة هاند أوفر موثقة (ارتفعت من 36 إلى 45)</td></tr>
        <tr><td>12/10</td><td>38</td><td>فحص إشارات RX واستقرار الألياف</td><td>27/10</td><td>26</td><td>بداية التدريب في قسم النقل ومتابعة المهام</td></tr>
        <tr><td>13/10</td><td>32</td><td>متابعة تذاكر البطء وفحص <code>MAC</code> و<code>ACS</code></td><td>28/10</td><td>29</td><td>فحص مسارات التراسل والإنذارات الحية</td></tr>
        <tr><td>14/10</td><td>28</td><td>معالجة <code>Port Blocked</code> وضبط <code>CVLAN</code></td><td>29/10</td><td>31</td><td>لقطة هاند أوفر موثقة (CCS 16 / Open Access 5)</td></tr>
        <tr><td>18/10</td><td>35</td><td>فرز البلاغات المتراكمة وحالات الطوارئ</td><td>3/11</td><td>34</td><td>متابعة إنذارات النقل والدوائر</td></tr>
        <tr><td>19/10</td><td>16</td><td>لقطة هاند أوفر موثقة (CCS 6 / Call Centre 6)</td><td>4/11</td><td>30</td><td>فحص مسارات الحماية واستقرار الجلسات</td></tr>
        <tr><td>20/10</td><td><strong>97</strong></td><td><strong>ذروة الفترة (لقطة موثقة — 34 CCS / 30 Call Centre)</strong></td><td>5/11</td><td>21</td><td>المراجعة الختامية وتدقيق الحالات العالقة</td></tr>
      </tbody>
    </table>

    <h1>ثالثًا: التدريب في الترانزبورت — معالجة إنذارات النقل في NOC (<code>TS-01</code>)</h1>
    <h2>1. إنذار توقف الجهاز (<code>Device has stopped</code>)</h2>
    <ol>
      <li>فتح منصة <strong><code>CA Performance</code> ← اختيار الـ <code>IP</code> ← <code>Health</code> ← عمود <code>IfAlias</code></strong> لمعرفة عدد العملاء الموجودين على الجهاز، أو مراجعة قاعدة بيانات <strong><code>Spider</code></strong> لمعرفة المتأثرين.</li>
      <li><strong>عميل واحد:</strong> الطلب من <code>B-care</code> فتح تذكرة <code>CTT</code> والتواصل مع العميل، والتحقق مع فريق الدعم عن أي نشاط أو انقطاع كهرباء لديه.</li>
      <li><strong>عدة عملاء:</strong> فتح تذكرة شبكة (<code>NTT</code>)، وإرسال إشعار انقطاع مفاجئ (<code>sudden outage</code>)، والتحقق مع فريقي الدعم والكهرباء، وإضافة تعليق واضح على الإنذار.</li>
    </ol>

    <h2>2. إنذار سقوط جلسة التوجيه (<code>BGP down</code>)</h2>
    <ol>
      <li>أخذ الـ <code>IP</code> من الإنذار والاتصال بعنصر الشبكة (<code>NE</code> مثل أجهزة <code>Cisco IOS XR ASR 9000</code>).</li>
      <li>تنفيذ الأوامر: <code>show bgp summary | include &lt;IP&gt;</code> (للتأكد من الحالة: <code>Active</code> أو <code>Idle</code> تعني سقوطاً، بينما <code>Established</code> تعني جلسة قائمة)، ثم <code>show route &lt;IP&gt;</code> لمعرفة واجهة الخروج، ثم <code>show interfaces &lt;Interface&gt;</code> لقراءة <code>Description</code> وتحديد هل هي جلسة عميل أم عنصر شبكة.</li>
      <li><strong>الإجراء:</strong> جلسة عميل = تجاهل الإنذار؛ عنصر شبكة = فتح تذكرة <code>Critical NTT</code> وإسنادها إلى <code>Back Office</code> والاتصال بهم هاتفياً ومراسلة المزوّد.</li>
    </ol>

    <h2>3. إنذار المراوح والكهرباء (<code>Faulty FAN Detected</code>) ومنصات النواة</h2>
    <ul>
      <li><strong>المراوح والكهرباء:</strong> الدخول عبر <code>SSH</code> للمحوّل وتنفيذ <code>show env fan</code> و <code>show env all</code>؛ إن كانت القيم سليمة فالإنذار وهمي، وإن ظهرت قيمة غير طبيعية تُفتح <code>NTT</code> وتُصعّد إلى <code>Back Office</code> مع إرسال الفريق الميداني.</li>
      <li><strong>منصات النواة (<code>DPI / Sandvine / Voice / Wirefilter / DNS</code>):</strong> أي إنذار عليها يستوجب فتح <code>NTT</code> فورية وإسنادها إلى فريق <strong><code>NAS</code></strong> والاتصال بالمناوب في <code>Back Office</code>.</li>
    </ul>

    <h1>رابعًا: بوابة الإنترنت الدولية — <code>IP Transit</code> و<code>Peering</code> (<code>TS-02</code>)</h1>
    <ul>
      <li><strong>توحيد التذكرة:</strong> عند انقطاع رابط <code>IP Transit</code> (مثل <code>TATA</code>، <code>STC</code>، <code>Mobily</code>) أو <code>Peering</code>، تُفتح <strong>تذكرة <code>Critical NTT</code> واحدة فقط</strong> في سلة <code>NOC</code> لكل المزوّدين، مع قراءة وصف المنفذ ومراسلة الجميع في نفس الوقت وإضافة كل رابط سقط للقالب.</li>
      <li><strong>قاعدة الازدحام (<code>&gt; 85%</code> عبر <code>Cacti</code>):</strong> متابعة الروابط الباقية في <code>Cacti</code> وإشراك <code>Back Office</code>؛ وعند تجاوز <strong>85%</strong> تُفتح تذكرة <code>Major NTT</code> لفريق <code>NAS</code> مع الاتصال الفوري بمناوب <code>BO</code> والإبلاغ في مجموعة <code>NAS</code>.</li>
      <li><strong>قاعدة الأثر الحرج (<code>&gt; 200G</code> — مصفوفة <code>P0</code>):</strong> إبلاغ الـ <code>Shift Lead</code> فوراً وتطبيق مصفوفة تصعيد الطوارئ <code>P0</code>.</li>
      <li><strong>قراءة ردود <code>SNFN</code>:</strong> عبارة <em>"observing local fault alarm at ITCJ from client port"</em> تعني أن المسار الوطني سليم والمشكلة في المسار الدولي؛ فتتم متابعة المزوّدين الدوليين حتى الاستعادة وزوال الإنذارات لدى الطرفين.</li>
    </ul>

    <h1>خامسًا: حالات <code>DIA</code> و<code>GCX</code> و<code>KAUST</code> و<code>VSAT</code> والألياف المظلمة (<code>TS-03</code>)</h1>
    <h2>1. تتبع خدمة الإنترنت المخصص (<code>DIA &amp; GCX</code>) لمزودي <code>STC</code> و<code>APTech</code> و<code>Mobily</code> و<code>Mawarid</code></h2>
    <ol>
      <li>نسخ رقم الخدمة (<code>Service ID</code>) من نظام <code>SDM</code>.</li>
      <li>الدخول إلى <code>B-care Spider</code>: ضغط <code>F11</code> ← لصق <code>Service ID</code> ← ضغط <code>Ctrl+F11</code>.</li>
      <li>من قسم <code>Metro Ethernet</code> أسفل النتائج: أخذ <code>Partner Circuit ID</code>، <code>Partner name</code>، <code>VLAN</code>، و<code>Pop Name</code>.</li>
      <li>نسخ الـ <code>IP</code> من <code>Pop Name</code> والاتصال بموجه <code>Huawei NE40E</code> عبر <code>SecureCRT</code> أو <code>PuTTY</code>.</li>
      <li>تنفيذ <code>display current-configuration interface Vlanif &lt;VLAN&gt;</code> لمعرفة <code>vpn-instance</code> وعنوان الواجهة على قناع <code>/30</code> (<code>255.255.255.252</code>).</li>
      <li>حساب عنوان الجار على <code>/30</code> (إضافة <code>1</code> إذا كان عنواننا الأول في الشبكة الفرعية، أو العنوان السابق إذا كان الثاني)، ثم فحص الجلسة عبر <code>display bgp vpnv4 vpn-instance &lt;VRF&gt; peer | include &lt;PeerIP&gt;</code> للتأكد من الحالة (<code>Established</code> أم <code>Active / Idle</code>).</li>
      <li>فحص <code>display logbuffer | include &lt;PeerIP&gt;</code> وحركة <code>Cacti</code> لمعرفة وقت الانقطاع، ثم مراسلة المزوّد (مثل <code>STC</code>) مع ذكر رقم الحادثة.</li>
    </ol>

    <h2>2. حالات <code>KAUST</code> و<code>VSAT</code> والألياف المظلمة (<code>Dark Fiber</code>)</h2>
    <ul>
      <li><strong>بريد <code>KAUST</code>:</strong> إرسال إقرار بالاستلام (<code>Acknowledgement</code>) للعميل أولاً، ثم فحص معرّف الرابط (إن كان <code>SNFN</code> يُرسل إلى <code>SNFN</code>، وإلا فحص منفذ الموجه والمخططات ومراجعة المزوّدين).</li>
      <li><strong>تذاكر <code>VSAT</code>:</strong> تصل <code>NTT</code> في <code>Remedy</code> من الدعم بدون بريد فتُسند لفريق <code>VSAT</code> مباشرة؛ إما إعادة للدعم عند سلامتها أو إنشاء أمر عمل (<code>WO</code>) للفحص الميداني ثم إعادتها للدعم بعد الحل.</li>
      <li><strong>الألياف المظلمة مع <code>Zain</code>:</strong> فتح <code>NTT</code> وأخذ صورة الموقع من وثيقة التصميم وإرسالها إلى <code>SNFN</code> للمتابعة.</li>
    </ul>

    <h1>سادسًا: مراقبة إنذارات الـ FTTH من قسم النقل (<code>TS-04</code>)</h1>
    <ul>
      <li><strong><code>The feeder fiber is broken</code>:</strong> الدخول إلى <code>Huawei NCE</code> (مع ملاحظة أن <code>Nokia AMS</code> في المنطقة الشرقية فقط) وفتح الـ <code>OLT</code> والـ <code>Slot</code>؛ إنذار كهرباء لمستخدم واحد يُتجاهل، أما سقوط عدة منافذ <code>PON</code> معاً فيوجب فتح <code>NTT</code> وإرسال الفريق الميداني.</li>
      <li><strong><code>Loss of signal</code>:</strong> فحص حقل <code>Current Reporting Status</code>؛ إذا كانت <code>Dying gasp</code> فهو انقطاع كهرباء ويُتجاهل من مستوى المراقبة (بخلاف تذكرة العميل في <code>FT-02</code>)، وإلا تُفتح <code>NTT</code> ويرسل الميدان.</li>
      <li><strong>حساب أثر سقوط <code>OLT</code> (تصدير <code>CSV</code>):</strong> في <code>Huawei NCE</code> عبر <code>OLT → GPON → GPON Management → GPON ONU → Find → Ctrl+A → File → Save As</code>، وفي <code>Nokia AMS</code> عبر <code>OLT → Inventory → Query → Object Type = ONT → Description → Save CSV</code>، ثم تصفية الملف برقم المنفذ.</li>
    </ul>

    <h1>سابعًا: مصفوفة التصعيد الشاملة في قسم النقل</h1>
    <table>
      <thead>
        <tr>
          <th>الحالة / الإنذار</th>
          <th>نوع التذكرة</th>
          <th>الجهة والإجراء المطلوب</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><code>Device has stopped</code> — عميل واحد</td><td><code>CTT (B-care)</code></td><td><code>B-care</code> يتواصل مع العميل مع مراجعة الدعم والكهرباء</td></tr>
        <tr><td><code>Device has stopped</code> — عدة عملاء</td><td><code>NTT</code></td><td>إشعار <code>sudden outage</code> ومراجعة الدعم وفريق الكهرباء</td></tr>
        <tr><td>سقوط رابط <code>IP Transit</code></td><td><code>Critical NTT</code> واحدة (سلة <code>NOC</code>)</td><td>قراءة وصف المنفذ وبريد لجميع المزودين المعنيين</td></tr>
        <tr><td>استهلاك الروابط الباقية <code>&gt; 85%</code></td><td><code>Major NTT → NAS</code></td><td>اتصال فوري بمناوب <code>BO</code> وإبلاغ مجموعة <code>NAS</code></td></tr>
        <tr><td>الأثر الإجمالي <code>&gt; 200G</code></td><td>مصفوفة <code>P0</code></td><td>إبلاغ <code>Shift Lead</code> فوراً واتباع تصعيد <code>P0</code></td></tr>
        <tr><td><code>BGP down</code> لعنصر شبكة (<code>NE</code>)</td><td><code>Critical NTT → Back Office</code></td><td>اتصال بـ <code>BO</code> وإرسال بريد للمزود (عميل = تجاهل)</td></tr>
        <tr><td><code>DIA</code>: جلسة BGP غير <code>Established</code></td><td>الحادثة الحالية</td><td>متابعة المزود مع رقم الحادثة في البريد ومراجعة <code>Cacti</code></td></tr>
        <tr><td><code>DPI / Sandvine / Voice / Wirefilter / DNS</code></td><td><code>NTT → NAS</code></td><td>اتصال بمناوب <code>Back Office</code></td></tr>
        <tr><td><code>Faulty FAN / Power</code> (غير طبيعي)</td><td><code>NTT → Back Office</code></td><td>إرسال الفريق الميداني (قراءات سليمة = إنذار وهمي)</td></tr>
        <tr><td><code>VSAT</code></td><td><code>NTT</code> من الدعم</td><td>إسناد لفريق <code>VSAT</code> بلا بريد (مع <code>WO</code> للميدان عند اللزوم)</td></tr>
        <tr><td><code>Dark Fiber</code> مع <code>Zain</code></td><td><code>NTT</code></td><td>أخذ صورة الموقع من وثيقة التصميم وإرسالها إلى <code>SNFN</code></td></tr>
        <tr><td><code>FTTH</code>: سقوط عدة <code>PON</code> أو <code>LOS</code> حقيقي</td><td><code>NTT</code></td><td>إرسال الفريق الميداني (تجاهل <code>Dying gasp</code>)</td></tr>
      </tbody>
    </table>

    <h1>ثامنًا: أساسيات التراسل الضوئي والأتمتة وبوابة المعرفة (<code>NOC Portal</code>)</h1>
    <p>إلى جانب التطبيق اليومي لإجراءات السلام (<code>TS-01</code> إلى <code>TS-04</code> و<code>FT-02</code> إلى <code>FT-04</code>)، حرصت خلال الأسبوعين الأخيرين على تعميق الفهم التقني لطبقات النقل وتنظيم كل ما تعلمته في <strong>موقع ويب عملي (<code>NOC &amp; Field Operations Knowledge Portal</code>)</strong> بنيته باستخدام <code>React 18</code> و<code>Vite</code> و<code>Tailwind CSS</code>:</p>
    <ol>
      <li><strong>مفاهيم التراسل الضوئي والنواة والأجهزة (<code>DWDM / OTN / MPLS</code>):</strong> فهم طبقات الإرسال الضوئي (<code>OTS, OMS, OCh, OTUk, ODUk, OPUk</code>)، وقناة الإشراف <code>OSC</code>، ومراقبة <code>Span Loss</code> و<code>OSNR</code> وارتفاع <code>Pre-FEC BER</code> مع بقاء <code>Post-FEC = 0</code>، وعزل السبب الجذري أثناء عواصف الإنذارات (<code>R_LOS</code> / <code>OTUK_LOF</code> قبل <code>MS_AIS</code> و<code>BDI/RDI</code>) على أجهزة <code>Cisco NCS 1000/2000</code> و<code>Huawei OptiX OSN</code> و<code>Nokia 1830 PSS</code>، ومقارنة بروتوكولات <code>MPLS</code> (<code>LDP</code> و<code>RSVP-TE</code> و<code>SR-MPLS</code> مع <code>TI-LFA</code> وفحص <code>MTU</code>).</li>
      <li><strong>الأتمتة الآمنة بلغة <code>Python</code> (قراءة فقط):</strong> تطبيق أمثلة <code>Netmiko</code> و<code>pandas</code> لقراءة حالة جلسة <code>BGP down</code> وحساب الجار في دوائر <code>DIA Vlanif /30</code>، وحساب أثر سقوط <code>OLT</code> من ملفات <code>CSV</code> المصدرة من <code>NCE</code> و<code>AMS</code>، مع التعرف على واجهات <code>NBI / REST</code> لأنظمة <code>NCE / AMS / EPNM / SDM</code>.</li>
      <li><strong>محتوى بوابة المعرفة (<code>noc-portal</code>):</strong> يضم الموقع <strong>22 وحدة معرفية</strong>، و<strong>5 سيناريوهات محاكاة حوادث (26 خطوة)</strong>، و<strong>162 سؤال مراجعة</strong>، مع التمييز الصريح داخل البوابة بين إجراءات سلام المعتمدة وبين الوحدات المرجعية العامة التي أضفتها لتغطية صورة المركز كاملة (مثل <code>Access</code> و<code>5G</code>).</li>
    </ol>

    <h1>تاسعًا: التحديات التي واجهتها وطريقة التغلب عليها</h1>
    <ul>
      <li><strong>التحول السريع من قسم <code>FTTH</code> إلى بيئة الترانزبورت:</strong> التعامل مع عدة أنظمة مترابطة في آنٍ واحد (<code>CA Performance</code>، <code>Spider</code>، <code>SDM</code>، <code>Cacti</code>، <code>SecureCRT</code>).</li>
      <li><strong>ضغط الشفتات المرتفع (ذروة 97 تذكرة في <code>20/10</code>):</strong> الموازنة بين سرعة الفرز وكتابة التعليق التشخيصي الدقيق.</li>
      <li><strong>طريقة التغلب عليها:</strong> تدوين كل خطوة وأمر وقاعدة تصعيد كما هي في بيئة العمل، ثم برمجتها داخل بوابة المعرفة (<code>noc-portal</code>) مع أمثلة الأوامر والاختبارات، مما سهّل الرجوع السريع لأي إجراء.</li>
    </ul>
  </div>

  <!-- ══════════════════════════════════════════════════════════
       ANALYTICS & CHARTS DASHBOARD
       ══════════════════════════════════════════════════════════ -->
  <div class="page-break"></div>
  <div class="content-body">
    <div style="border-bottom: 2px solid #C0102A; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="border: none; margin: 0; padding: 0;">عاشرًا: لوحة الرسوم البيانية والإحصائيات التشغيلية</h1>
        <p style="font-size: 11px; color: #64748B; font-weight: 700; margin: 2px 0 0 0;">
          توزيع التذاكر والالتزام التشغيلي للفترة (من 11/10 إلى 5/11)
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
        <div class="kpi-sub" style="color: #64748B;">تذكرة / مرحلة موثقة</div>
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
          <span>1. التطور الزمني لتدفق التذاكر (Progression Over Time)</span>
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
          * تشمل البيانات توثيق التذاكر المنجزة في FTTH ومهام شبكات النقل للفترة من 11/10 إلى 5/11.
        </div>
      </div>

      <!-- 2. Donut Shares -->
      <div class="chart-panel">
        <div class="chart-panel-title">
          <span>2. توزيع التذاكر حسب التصنيف (Shares)</span>
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
            <span>إحالات المشغلين والتصعيد المتقدم</span>
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
          4. مصفوفة المعايير والأنظمة المعتمدة
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
              <td style="color: #10B981; font-weight: 800;">✓ معتمد</td>
            </tr>
            <tr>
              <td>قنوات CVLAN (HSI / ACS / Voice)</td>
              <td>1501 / 3980 / 1810</td>
              <td style="color: #0284C7; font-weight: 800;">✓ معتمد</td>
            </tr>
            <tr>
              <td>حدود الازدحام والأثر في IGW</td>
              <td>&gt; 85% / &gt; 200G (P0)</td>
              <td style="color: #10B981; font-weight: 800;">✓ مطابق لـ SOP</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <h1>الحادي عشر: الخاتمة والتوصيات</h1>
    <p>
      تمثل هذه الفترة (<strong>من 11/10 إلى 5/11</strong>) مرحلة متكاملة جمعت بين العمل الفعلي المستقل في قسم الألياف الضوئية (<strong>482 تذكرة</strong> وذروة <strong>97 تذكرة</strong>) وبين اكتساب الأساسيات العملية في قسم شبكات النقل (<strong><code>TS-01</code> إلى <code>TS-04</code></strong>) وبناء أداة معرفية خاصة (<code>NOC Portal</code>) تجمع الإجراءات والأوامر والسكربتات.
    </p>
    <ol>
      <li>توحيد إجراءات التصعيد وقوالب الفحص المبدئي بين <code>FTTH</code> و<code>Transport</code> خصوصاً في أعطال الكابلات المغذية وحساب الأثر من <code>NCE / AMS</code>.</li>
      <li>الاستفادة من سكربتات الفحص القرائي (<code>Read-Only Python Scripts</code>) لتسريع خطوات فحص <code>BGP</code> وحساب جيران <code>DIA /30</code> وتلخيص ملفات <code>OLT CSV</code> دون أخطاء يدوية.</li>
      <li>إبقاء المراجع العملية والأوامر مرتبة في بوابة موحدة لتسهيل مراجعة الإجراءات أثناء المناوبات وتقليل وقت التعامل مع الأعطال المتكررة.</li>
    </ol>

    <!-- Endorsements Block -->
    <div class="endorsement-box">
      <div style="text-align: center; font-weight: 900; font-size: 13px; color: #18181A; border-bottom: 1px solid #CBD5E1; padding-bottom: 6px;">
        مصادقة واعتماد التقرير الميداني الرسمي
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
