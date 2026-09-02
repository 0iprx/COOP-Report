import { FinalReportData, formatDateArabic } from '@coop/shared';

export function generateStandaloneHTMLReport(reportData: FinalReportData, lang: 'ar' | 'en' = 'ar'): string {
  const { profile, weeks, totalHours, totalDays, totalEntries, estimatedPages, wordCount } = reportData;
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isAr ? 'تقرير التدريب التعاوني — شركة هواوي السعودية' : 'Co-op Training Report — Huawei Tech Saudi'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #F7F5F0;
      --card: #FFFFFF;
      --ink: #1B1B18;
      --sub: #6E6B62;
      --line: #E4E0D5;
      --accent: #C8102E;
      --accent-dim: #F4DDDF;
      --ok: #2F6B4F;
      --ok-bg: #E5F1EA;
    }
    html {
      scroll-behavior: smooth;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 900px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .report-paper {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 56px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .cover {
      text-align: center;
      border-bottom: 2px solid var(--line);
      padding-bottom: 40px;
      margin-bottom: 40px;
    }
    .cover h1 {
      color: var(--accent);
      font-size: 30px;
      font-weight: 800;
      margin: 14px 0;
    }
    .cover .subtitle {
      font-size: 18px;
      color: var(--ink);
      font-weight: 700;
      margin-bottom: 24px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      text-align: ${isAr ? 'right' : 'left'};
      background: #FAFAFA;
      padding: 22px;
      border-radius: 8px;
      border: 1px solid var(--line);
      margin-top: 24px;
      font-size: 13.5px;
    }
    .meta-item b {
      color: var(--sub);
      display: inline-block;
      min-width: 140px;
    }
    .toc {
      background: #FCFBF9;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 36px;
    }
    .toc h3 {
      margin-top: 0;
      color: var(--accent);
      font-size: 18px;
      font-weight: 800;
      border-bottom: 2px solid var(--accent);
      padding-bottom: 8px;
    }
    .toc a {
      color: var(--ink);
      text-decoration: none;
      display: block;
      padding: 6px 0;
      font-size: 14px;
      font-weight: 600;
      border-bottom: 1px dashed #EAE8E0;
      transition: color 0.15s;
    }
    .toc a:hover {
      color: var(--accent);
    }
    .toc-sub {
      padding-${isAr ? 'right' : 'left'}: 24px;
    }
    .toc-sub a {
      font-size: 13px;
      color: var(--sub);
    }
    .toc-sub a:hover {
      color: var(--accent);
    }
    h2.section-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--ink);
      border-bottom: 2px solid var(--accent);
      padding-bottom: 8px;
      margin-top: 40px;
    }
    .week-block {
      margin-bottom: 32px;
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .week-header {
      background: #F8F9FA;
      padding: 12px 18px;
      font-weight: 700;
      border-bottom: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      color: var(--ok);
      font-size: 14px;
    }
    table.entries-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    table.entries-table th, table.entries-table td {
      padding: 10px 14px;
      text-align: ${isAr ? 'right' : 'left'};
      border-bottom: 1px solid var(--line);
      vertical-align: top;
    }
    table.entries-table th {
      background: #FDFDFD;
      color: var(--sub);
      font-weight: 700;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      background: var(--accent-dim);
      color: var(--accent);
    }
    .print-bar {
      position: sticky;
      top: 10px;
      z-index: 100;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 20px;
    }
    .btn {
      background: var(--accent);
      color: white;
      border: none;
      padding: 9px 18px;
      border-radius: 7px;
      font-family: inherit;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    @media print {
      @page {
        margin: 2.5cm;
        size: A4 portrait;
      }
      body { background: white; }
      .container { max-width: 100%; margin: 0; padding: 0; }
      .report-paper { border: none; box-shadow: none; padding: 0; }
      .print-bar { display: none; }
      .week-block { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="print-bar">
      <button class="btn" onclick="window.print()">${isAr ? 'طباعة التقرير / حفظ PDF' : 'Print / Save as PDF'}</button>
    </div>
    <div class="report-paper">
      <!-- Cover -->
      <div class="cover" id="sec-cover">
        <div style="font-size: 13px; color: var(--sub); font-weight: 700; margin-bottom: 4px;">
          ${isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}
        </div>
        <div style="font-size: 15px; color: var(--ink); font-weight: 700;">
          ${profile.trainingUnit || (isAr ? 'الوحدة التدريبية / الكلية' : 'Academic Institution')}
        </div>
        <h1>${isAr ? 'التقرير النهائي للتدريب التعاوني (Co-op Report)' : 'Cooperative Training Final Report'}</h1>
        <div class="subtitle">${profile.entityAddress || (isAr ? 'هواوي السعودية (Huawei Tech Saudi)' : 'Huawei Tech Saudi')}</div>
        
        <div class="meta-grid">
          <div class="meta-item"><b>${isAr ? 'اسم المتدرب:' : 'Trainee Name:'}</b> ${escapeHtml(profile.studentName) || '—'}</div>
          <div class="meta-item"><b>${isAr ? 'الرقم التدريبي:' : 'Training ID:'}</b> ${escapeHtml(profile.trainingNumber) || '—'}</div>
          <div class="meta-item"><b>${isAr ? 'القسم / التخصص:' : 'Department:'}</b> ${escapeHtml(profile.department) || '—'}</div>
          <div class="meta-item"><b>${isAr ? 'المشرف الأكاديمي:' : 'Academic Supervisor:'}</b> ${escapeHtml(profile.supervisorName) || '—'}</div>
          <div class="meta-item"><b>${isAr ? 'المشرف الميداني:' : 'Field Supervisor:'}</b> ${escapeHtml(profile.responsibleName) || '—'}</div>
          <div class="meta-item"><b>${isAr ? 'إجمالي الساعات المعتمدة:' : 'Total Hours:'}</b> ${totalHours} ${isAr ? 'ساعة' : 'hrs'}</div>
        </div>
      </div>

      <!-- TOC (Clickable for Instant Seamless Navigation) -->
      <div class="toc" id="sec-toc">
        <h3>${isAr ? 'فهرس المحتويات (انقر للانتقال المباشر للقسم)' : 'Table of Contents (Click to Navigate)'}</h3>
        <a href="#sec-cover">${isAr ? '• صفحة الغلاف والبيانات الأساسية' : '• Cover & Basic Metadata'}</a>
        <a href="#sec-intro">${isAr ? '• 1. المقدمة وأهداف التدريب التعاوني' : '• 1. Introduction & Objectives'}</a>
        <a href="#sec-entity">${isAr ? '• 2. التعريف بجهة التدريب وطبيعة العمل' : '• 2. Organization Overview'}</a>
        <a href="#sec-timeline">${isAr ? '• 3. الخطة والجدول الزمني للتدريب الأسبوعي' : '• 3. Training Timeline & Weekly Breakdown'}</a>
        <div class="toc-sub">
          ${weeks.map((w) => `<a href="#week-${w.weekIndex}">— ${isAr ? 'الأسبوع' : 'Week'} ${w.weekIndex} (${w.weekStart} إلى ${w.weekEnd}) [${w.totalHours} ${isAr ? 'ساعة' : 'hrs'}]</a>`).join('')}
        </div>
        <a href="#sec-skills">${isAr ? '• 4. المعارف والمهارات والتجارب المكتسبة' : '• 4. Acquired Knowledge & Skills'}</a>
        <a href="#sec-conclusion">${isAr ? '• 5. الخاتمة والتوصيات العامة' : '• 5. Conclusion & Recommendations'}</a>
      </div>

      <!-- Section 1 -->
      <h2 class="section-title page-break" id="sec-intro">${isAr ? '1. المقدمة وأهداف التدريب التعاوني' : '1. Introduction'}</h2>
      <p>${escapeHtml(profile.introText)}</p>

      <!-- Section 2 -->
      <h2 class="section-title" id="sec-entity">${isAr ? '2. التعريف بجهة التدريب وطبيعة العمل' : '2. Organization Overview'}</h2>
      <p>${escapeHtml(profile.entityIntroText)}</p>
      <div style="background: #FAFAFA; padding: 14px 18px; border-radius: 6px; font-size: 13.5px; border: 1px solid var(--line); margin: 16px 0;">
        <b>${isAr ? 'المقر:' : 'Address:'}</b> ${escapeHtml(profile.entityAddress)} | 
        <b>${isAr ? 'عدد الموظفين:' : 'Employees:'}</b> ${escapeHtml(profile.employeesCount) || '—'} |
        <b>${isAr ? 'المشرف الميداني:' : 'Supervisor:'}</b> ${escapeHtml(profile.responsibleName) || '—'}
      </div>

      <!-- Section 3 -->
      <h2 class="section-title page-break" id="sec-timeline">${isAr ? '3. الخطة والجدول الزمني للتدريب الأسبوعي' : '3. Training Timeline'}</h2>
      ${weeks.map((w) => `
        <div class="week-block page-break" id="week-${w.weekIndex}">
          <div class="week-header">
            <span>${isAr ? 'الأسبوع' : 'Week'} ${w.weekIndex} (${w.weekStart} — ${w.weekEnd})</span>
            <span>${w.totalHours} ${isAr ? 'ساعة عمل معتمدة' : 'hours'} | ${w.entries.length} ${isAr ? 'مهام' : 'tasks'}</span>
          </div>
          <table class="entries-table">
            <thead>
              <tr>
                <th style="width: 15%;">${isAr ? 'التاريخ' : 'Date'}</th>
                <th style="width: 25%;">${isAr ? 'العنوان / التصنيف' : 'Title / Category'}</th>
                <th style="width: 15%;">${isAr ? 'الوقت' : 'Time'}</th>
                <th style="width: 45%;">${isAr ? 'تفاصيل الإنجاز' : 'Details'}</th>
              </tr>
            </thead>
            <tbody>
              ${w.entries.map((e) => `
                <tr>
                  <td>${formatDateArabic(e.entryDate)}</td>
                  <td><b>${escapeHtml(e.title)}</b><br><span class="badge">${escapeHtml(e.category)}</span></td>
                  <td>${e.timeFrom} - ${e.timeTo}</td>
                  <td>${escapeHtml(e.description)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}

      <!-- Section 4 -->
      <h2 class="section-title page-break" id="sec-skills">${isAr ? '4. المعارف والمهارات والتجارب المكتسبة' : '4. Acquired Knowledge & Skills'}</h2>
      <p>${escapeHtml(profile.skillsText)}</p>

      <!-- Section 5 -->
      <h2 class="section-title page-break" id="sec-conclusion">${isAr ? '5. الخاتمة والتوصيات' : '5. Conclusion & Recommendations'}</h2>
      <p>${escapeHtml(profile.conclusionText)}</p>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--line); font-size: 13px; color: var(--sub); text-align: center;">
        ${isAr ? 'تم إنشاء التقرير بواسطة نظام COOP Report — سجل التدريب التعاوني الذكي' : 'Generated by COOP Report System'}
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
