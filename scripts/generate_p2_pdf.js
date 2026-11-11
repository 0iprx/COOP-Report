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
      <h1 class="cover-title" style="border: none;">التقرير الفتري الثاني</h1>
      <p class="cover-subtitle">قسم خدمات الألياف FTTH وقسم شبكات النقل والتراسل (Transport Domain)</p>

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
          <span class="matrix-val">FTTH Operations & Transport Networks</span>
        </div>
        <div class="matrix-row">
          <span class="matrix-label">طبيعة العمل:</span>
          <span class="matrix-val">Technical Support & Transmission Engineering</span>
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
          <span style="font-weight: 900; color: #C0102A; font-size: 12.5px;">موظف فعلي في FTTH (الأسابيع 7-8) ومتدرب في شبكات الترانزبورت (الأسابيع 9-10)</span>
        </div>
      </div>

      <!-- Technical Scope Summary (No Hours, No Shift Times) -->
      <div class="intervals-container" style="text-align: right;">
        <div class="intervals-header">
          <span style="font-weight: 900; font-size: 12px; color: #18181A;">المحاور الفنية ونطاق الإنجاز في الفترة:</span>
          <div>
            <span style="background: #E3F0EA; color: #2A6348; padding: 2px 9px; border-radius: 999px; font-weight: 800; font-size: 10.5px; border: 1px solid #2A634830;">482 تذكرة وبلاغ تشغيلي</span>
            <span style="color: #C0102A; font-weight: 900; font-size: 11px; margin-right: 6px;">من 11/10 إلى 5/11</span>
          </div>
        </div>

        <div class="intervals-grid">
          <div class="interval-card">
            <div class="interval-card-title">المرحلة الأولى: إدارة تذاكر FTTH الفعلي ومعالجة الأعطال</div>
            <div class="interval-card-meta">
              <span>تشغيل وحل البلاغات</span>
              <span style="color: #C0102A; font-weight: 800;">CCS / Call Centre</span>
            </div>
          </div>

          <div class="interval-card">
            <div class="interval-card-title">المرحلة الثانية: ذروة المعالجة التشغيلية (97 تذكرة بالهاند أوفر)</div>
            <div class="interval-card-meta">
              <span>تشخيص وفحص متقدم</span>
              <span style="color: #C0102A; font-weight: 800;">482 تذكرة إجمالاً</span>
            </div>
          </div>

          <div class="interval-card">
            <div class="interval-card-title">المرحلة الثالثة: مراقبة إنذارات النقل (TS-01 إلى TS-04)</div>
            <div class="interval-card-meta">
              <span>BGP / IGW / DIA</span>
              <span style="color: #C0102A; font-weight: 800;">CA / Spider / Cacti</span>
            </div>
          </div>

          <div class="interval-card">
            <div class="interval-card-title">المرحلة الرابعة: البنية الضوئية (DWDM/OTN) وبوابة المعرفة (NOC Portal)</div>
            <div class="interval-card-meta">
              <span>MPLS / Alarm Storm</span>
              <span style="color: #C0102A; font-weight: 800;">Python / Netmiko</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cover Footer -->
    <div class="cover-footer">
      <span>المملكة العربية السعودية — التقرير الفتري الثاني للتدريب التعاوني (عمليات FTTH وشبكات النقل التراسلي)</span>
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
      يغطي هذا <strong>التقرير الفتري الثاني</strong> أربعة أسابيع تدريبية وتشغيلية متقدمة ممتدة <strong>من 11 أكتوبر إلى 5 نوفمبر</strong> (الأسابيع: 7، 8، 9، 10). وتميزت هذه الفترة بالجمع بين مسارين عمليين وهندسيين متكاملين في قطاع الاتصالات:
    </p>
    <ol>
      <li>
        <strong>المحور الأول — قسم خدمات الألياف الضوئية (FTTH Operations) [الأسابيع 7 و 8]:</strong><br>
        العمل كـ <strong>موظف فعلي</strong> متمكن من التعامل المباشر والمستقل مع بلاغات المشتركين وأنظمة تسليم المهام (Handover Tools)، مما أثمر عن معالجة وتوثيق <strong>482 تذكرة وبلاغاً تشغيلياً</strong> وصلت ذروتها التاريخية إلى <strong>97 تذكرة في مرحلة واحدة</strong> بمعدل التزام باتفاقية مستوى الخدمة (SLA) بلغ <strong>97.4%</strong>.
      </li>
      <li>
        <strong>المحور الثاني — قسم شبكات النقل والتراسل (Transport Domain &amp; NOC) [الأسابيع 9 و 10]:</strong><br>
        الانتقال التخصصي كـ <strong>متدرب في شبكات النقل</strong>؛ حيث تم التدرب على إجراءات التشغيل القياسية (SOPs) لمركز عمليات الشبكة (NOC) للتعامل مع إنذارات النواة (BGP, Device Stopped, FAN/Power)، وبوابة الإنترنت الدولية (IP Transit / Peering)، وحالات العملاء المؤسسيين والدوائر المخصصة (DIA, GCX, KAUST, VSAT, Dark Fiber)، إضافة إلى معمارية النقل البصري (DWDM/OTN) وربط الأعطال (Alarm Correlation)، وتطوير <strong>بوابة معرفية تفاعلية (NOC Knowledge Portal)</strong> لجمع وتوثيق كافة إجراءات النقل والشبكة في مرجع هندسي موحد.
      </li>
    </ol>

    <h1>أولاً: المحور الأول — عمليات قسم الألياف الضوئية (FTTH)</h1>
    <h2>1. توزيع وتصنيف التذاكر المعالجة (482 تذكرة موثقة)</h2>
    <ul>
      <li><strong>نظام خدمة العملاء والدعم المركزي (CCS):</strong> استحوذ على النسبة الأكبر بمعدل <strong>36.5% (176 تذكرة)</strong> لمتابعة البلاغات الفنية المركزية ومطابقة بيانات الخدمة.</li>
      <li><strong>إحالات الكول سنتر (Call Centre):</strong> بنسبة <strong>24.3% (117 تذكرة)</strong> لإعادة التوجيه الفني الدقيق بعد التحقق من سلامة الخدمة مع تدوين تعليق تشخيصي واضح (Diagnostic Comment).</li>
      <li><strong>النفاذ المفتوح والمشغلين (Open Access):</strong> بنسبة <strong>14.5% (70 تذكرة)</strong> لمعالجة أعطال البنية المشتركة ونقاط الربط مع المشغلين.</li>
      <li><strong>المعالجة والإغلاق الفوري (Resolved Direct):</strong> بنسبة <strong>11.8% (57 تذكرة)</strong> تم إغلاقها مباشرة بعد استقرار الإشارة وضبط المنافذ عبر ACS.</li>
      <li><strong>الدعم التخصصي والتصعيد (TLS &amp; NOC &amp; OSS):</strong> بنسبة <strong>12.9% (62 تذكرة)</strong> شملت التصعيد للفرق الهندسية المتقدمة ومراقبة الأنظمة.</li>
    </ul>

    <h2>2. المعايير الفنية والمنصات المستخدمة في FTTH</h2>
    <ul>
      <li>التحقق الصارم من <strong>نطاق القدرة الضوئية المستقبلة (RX Power)</strong> المعتمد بين <code>-10 dBm</code> إلى <code>-26 dBm</code> عبر منصة <strong>Huawei NCE</strong>.</li>
      <li>فحص خدمات الـ <strong>CVLAN</strong>: خدمة الإنترنت (<strong>1501 - HSI</strong>)، خدمة الإدارة (<strong>3980 - ACS / TR-069</strong>)، والخدمة الصوتية (<strong>1810 - VoIP</strong>).</li>
      <li>توثيق الحالات القياسية التي بلغت في ذروتها <strong>97 تذكرة</strong> (CCS: 34، Call Centre: 30، Resolved: 16، Open Access: 9، TLS: 3، NOC: 2، NAS: 2، OSS: 1)، وحالات أخرى مسجلة بمجاميع (40، 45، 31، 16 تذكرة).</li>
    </ul>

    <h1>ثانياً: المحور الثاني — إجراءات وتقنيات شبكات النقل (Transport Domain)</h1>
    <p>مثّل الانتقال إلى <strong>قسم الترانزبورت (Transport Networks)</strong> نقلة هندسية شاملة لاكتساب مهارات مركز عمليات الشبكة (NOC) والتعامل مع العمود الفقري للشبكة:</p>

    <h2>1. معالجة إنذارات النقل الأساسية (Transport Alarm Handling)</h2>
    <ul>
      <li><strong>إنذار توقف الجهاز (<code>Device has stopped</code>):</strong> التحقق من عدد العملاء المتأثرين عبر <strong>CA Performance → Health → IfAlias</strong> وقاعدة بيانات <strong>Spider</strong>. لعميل واحد يتم التنسيق مع B-care لفتح CTT والتواصل مع العميل، ولعدة عملاء تُفتح تذكرة <strong>NTT</strong> مع إشعار انقطاع مفاجئ (<strong>Sudden Outage Notice</strong>) ومراجعة الدعم والكهرباء.</li>
      <li><strong>إنذار سقوط جلسة BGP (<code>BGP down</code>):</strong> الاتصال بعنصر الشبكة (NE) وتنفيذ <code>show bgp summary</code> و <code>show route</code> وقراءة وصف الواجهة؛ تُتجاهل جلسات العملاء، أما جلسات عناصر الشبكة فتستوجب فتح <strong>Critical NTT</strong> وإسنادها إلى Back Office والاتصال بهم ومراسلة المزود، مع التفريق بين حالة السقوط (<code>Active / Idle</code>) والمستقرة (<code>Established</code>).</li>
      <li><strong>إنذارات المراوح والكهرباء (<code>Faulty FAN Detected</code>):</strong> الفحص أولاً عبر SSH باستخدام <code>show env fan</code> و <code>show env all</code> لفرز الإنذارات الوهمية عن الحقيقية قبل التصعيد.</li>
      <li><strong>عناصر الشبكة الحساسة (<code>DPI / Sandvine / Voice / Wirefilter / DNS</code>):</strong> فتح NTT وإسنادها مباشرة إلى فريق <strong>NAS</strong> والاتصال بالمناوب في Back Office.</li>
    </ul>

    <h2>2. بوابة الإنترنت الدولية (IGW: IP Transit &amp; Peering)</h2>
    <ul>
      <li>فتح <strong>Critical NTT واحدة</strong> في سلة <code>NOC</code> ومراسلة جميع المزودين الدوليين (TATA، STC، Mobily) عند سقوط روابط IP Transit أو Peering.</li>
      <li><strong>قاعدة حد الازدحام (<code>&gt; 85% Utilisation</code>):</strong> مراقبة الروابط المتبقية عبر <strong>Cacti</strong>؛ وتجاوز 85% يستدعي فتح <strong>Major NTT</strong> لفريق NAS والتواصل مع Back Office.</li>
      <li><strong>قاعدة الأثر الحرج (<code>&gt; 200G Impact / P0 Matrix</code>):</strong> إبلاغ Shift Lead فوراً وتطبيق مصفوفة تصعيد <strong>P0</strong> عند تجاوز الأثر 200 جيجابت/ثانية.</li>
      <li><strong>تفسير ردود SNFN:</strong> فهم دلالة رسالة <em>"observing local fault alarm at ITCJ from client port"</em> بأن المسار الوطني سليم والعطل دولي.</li>
    </ul>

    <h2>3. الدوائر المخصصة والعملاء المؤسسيين (<code>DIA / GCX / KAUST / VSAT / Dark Fiber</code>)</h2>
    <ul>
      <li><strong>تشخيص DIA &amp; GCX (لمزودي STC, APTech, Mobily, Mawarid):</strong> نسخ Service ID من <strong>SDM</strong> ← البحث في <strong>Spider</strong> (<code>F11</code> ثم <code>Ctrl+F11</code>) لاستخراج بيانات Metro Ethernet ← الدخول إلى <strong>Huawei NE40E</strong> وفحص <code>display current-configuration interface Vlanif</code> لاستخراج <code>vpn-instance</code> وعنوان <code>/30</code> ← حساب عنوان الجار وفحص حالة BGP (<code>display bgp vpnv4 vpn-instance peer</code>) و<code>display logbuffer</code> و Cacti.</li>
      <li><strong>حالات KAUST و VSAT والألياف المظلمة:</strong> إرسال إقرار استلام لـ KAUST والتحقق من معرّف SNFN، وإسناد تذاكر VSAT دون بريد مع إنشاء WO للميدان عند اللزوم، وإرسال صور المواقع من وثائق التصميم إلى SNFN في حالات Dark Fiber مع Zain.</li>
    </ul>

    <h2>4. مراقبة إنذارات FTTH من مركز النقل (Transport Monitoring)</h2>
    <ul>
      <li>التمييز في إنذارات <code>Feeder fiber broken</code> و <code>Loss of signal</code> عبر <strong>Huawei NCE</strong> و <strong>Nokia AMS</strong> (بالشرقية فقط)؛ حيث يُتجاهل إنذار <code>Dying gasp</code> أو قدرة المستخدم الواحد، بينما سقوط عدة منافذ PON يعني قطعاً حقيقياً يوجب إرسال الميدان، مع استخراج ملفات CSV لحساب أثر سقوط OLT.</li>
    </ul>

    <h2>5. المعمارية الضوئية، ربط الإنذارات، والأتمتة (<code>DWDM / OTN / MPLS / Python</code>)</h2>
    <ul>
      <li><strong>DWDM و OTN:</strong> طبقات (OTS, OMS, OCh, OTUk, ODUk) وقناة الإشراف (OSC)، ومراقبة المعوقات الضوئية (Span loss, OSNR, CD/PMD) وتتبع <strong>Pre-FEC BER</strong>.</li>
      <li><strong>إدارة عواصف الإنذارات:</strong> عزل أقدم إنذار جذري (<code>R_LOS</code> / <code>OTUK_LOF</code>) عن النتائج (<code>MS_AIS</code>, <code>BDI/RDI</code>) عبر أجهزة Huawei OptiX OSN و Cisco NCS 1000/2000 و Nokia 1830 PSS.</li>
      <li><strong>MPLS &amp; Segment Routing:</strong> المقارنة بين LDP و RSVP-TE و SR-MPLS (وحماية <strong>TI-LFA</strong>) وكشف عدم تطابق MTU.</li>
      <li><strong>بوابة المعرفة والأتمتة (NOC Portal &amp; Python):</strong> تطوير بوابة ويب معرفية تفاعلية متكاملة (22 وحدة معرفية و5 سيناريوهات محاكاة حوادث) وتطبيق أتمتة قراءة البيانات عبر Python و Netmiko.</li>
    </ul>
  </div>

  <!-- ══════════════════════════════════════════════════════════
       ANALYTICS & CHARTS DASHBOARD
       ══════════════════════════════════════════════════════════ -->
  <div class="page-break"></div>
  <div class="content-body">
    <div style="border-bottom: 2px solid #C0102A; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="border: none; margin: 0; padding: 0;">لوحة الرسوم البيانية والإحصائيات التشغيلية (FTTH &amp; Transport)</h1>
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

    <h1>الخاتمة والتوصيات</h1>
    <p>
      يمثل هذا <strong>التقرير الفتري الثاني (من 11/10 إلى 5/11)</strong> خلاصة مرحلة مهنية استثنائية جمعت بين الكفاءة التشغيلية الميدانية والعمق الهندسي؛ فمن إنجاز <strong>482 تذكرة ومهمة في خدمات FTTH</strong> وتحقيق رقم قياسي بلغ <strong>97 تذكرة</strong>، إلى استيعاب منظومة <strong>شبكات النقل والـ NOC</strong> بكل تفاصيلها من إنذارات الـ BGP والعبور الدولي IGW، ودوائر الـ DIA و Spider، وصولاً إلى شبكات DWDM/OTN وبناء بوابة معرفية متكاملة تُسهم في رفع سرعة ودقة الاستجابة للحوادث.
    </p>

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

if (fs.existsSync(outputPdfDownload)) {
  fs.copyFileSync(outputPdfDownload, outputPdfDesktop);
  console.log('Updated PDF successfully created in Downloads and Desktop!');
} else {
  console.error('Failed to create PDF');
}
