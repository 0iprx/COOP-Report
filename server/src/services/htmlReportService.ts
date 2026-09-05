import { FinalReportData, formatDateArabic, formatDateEnglish } from '@coop/shared';

function translateCategory(cat: string, isAr: boolean): string {
  if (isAr) return cat;
  const map: Record<string, string> = {
    'تطوير / برمجة': 'Development & Programming',
    'اجتماعات': 'Meetings & Alignment',
    'تدريب وتعلّم': 'Training & Learning',
    'توثيق': 'Documentation',
    'دعم فني': 'Technical Support',
    'أخرى': 'Other'
  };
  return map[cat] || cat;
}

function getWeekTopicServer(w: any, isAr: boolean = true): string {
  if (w.entries && w.entries.length > 0) {
    const firstTitle = (w.entries[0].title || '').replace(/\s*[-—–]\s*(اليوم|Day)\s*\d+.*$/i, '').trim();
    if (firstTitle && firstTitle.length > 3) return firstTitle;
  }
  const defaultTopicsAr = [
    'التهيئة والتعريف بأنظمة المنشأة وسياسات أمن المعلومات',
    'استكشاف البنية التحتية والبيئة التشغيلية للخوادم',
    'إدارة وصيانة شبكات الاتصال وتوصيلات الألياف الضوئية',
    'تكوين وإدارة خوادم قواعد البيانات والنسخ الاحتياطي',
    'مراقبة أداء الشبكات وإعداد جدران الحماية السيبرانية',
    'مراجعة مؤشرات الأداء والتقييم النصفي مع المشرف الميداني',
    'أتمتة العمليات التشغيلية وإدارة الخدمات السحابية',
    'صيانة الخوادم وإدارة وحدات تزويد الطاقة الاحتياطية',
    'تحليل سجلات الأمان وإجراءات الاستجابة للحوادث الرقمية',
    'تحديث البنية التحتية واختبار خطة التعافي من الكوارث',
    'ورش العمل الهندسية وتطوير الحلول البرمجية المؤسسية',
    'توثيق إجراءات التشغيل القياسية وتحديث الأدلة الفنية',
    'اختبار تكامل الأنظمة وضمان الجودة والمطابقة الفنية',
    'مناقشة التقرير الفني الختامي واعتماد مخرجات التدريب'
  ];
  return isAr
    ? (defaultTopicsAr[w.weekIndex - 1] || `المهام والأعمال الفنية للأسبوع ${w.weekIndex}`)
    : `Week ${w.weekIndex} Technical Activities`;
}

export function generateStandaloneHTMLReport(reportData: FinalReportData, lang: 'ar' | 'en' = 'ar'): string {
  const { profile, weeks, totalHours, totalDays, totalEntries, estimatedPages, wordCount } = reportData;
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const entityName = profile.entityAddress || (isAr ? 'جهة التدريب التعاوني' : 'Host Organization');
  const courseHours = profile.courseHours || 280;
  const progressPercent = Math.min(100, Math.round((totalHours / courseHours) * 100));

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isAr ? `تقرير التدريب التعاوني — ${entityName}` : `Co-op Training Report — ${entityName}`}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: ${
        profile.reportTemplate === 'modern' ? '#F8FAFC' :
        profile.reportTemplate === 'executive' ? '#F1F5F9' :
        profile.reportTemplate === 'tvtc' ? '#F4FBF7' : '#F7F5F0'
      };
      --card: #FFFFFF;
      --ink: #1B1B18;
      --sub: #6E6B62;
      --line: #E4E0D5;
      --accent: ${
        profile.reportTemplate === 'modern' ? '#0284C7' :
        profile.reportTemplate === 'executive' ? '#1E293B' :
        profile.reportTemplate === 'tvtc' ? '#065F46' : '#8B0000'
      };
      --accent-dim: ${
        profile.reportTemplate === 'modern' ? '#E0F2FE' :
        profile.reportTemplate === 'executive' ? '#E2E8F0' :
        profile.reportTemplate === 'tvtc' ? '#E6F4EA' : '#F4DDDF'
      };
      --ok: #2F6B4F;
      --ok-bg: #E5F1EA;
    }
    .cover-logos {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 24px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--line);
    }
    .cover-logo-img {
      max-width: 90px;
      max-height: 90px;
      object-fit: contain;
    }
    .cover-logo-box {
      width: 90px;
      height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
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
      max-width: 920px;
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
      font-size: 32px;
      font-weight: 800;
      margin: 14px 0;
    }
    .cover .subtitle {
      font-size: 19px;
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
    /* TOC with Dotted Leader lines matching image media_1788397544077.png */
    .toc {
      background: #FCFBF9;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 28px;
      margin-bottom: 40px;
    }
    .toc h2 {
      margin-top: 0;
      color: var(--accent);
      font-size: 22px;
      font-weight: 800;
      text-align: center;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--accent);
      margin-bottom: 20px;
    }
    .toc-row {
      display: flex;
      align-items: baseline;
      text-decoration: none;
      color: var(--ink);
      padding: 6px 0;
      font-size: 14px;
      font-weight: 700;
      transition: color 0.15s;
    }
    .toc-row:hover {
      color: var(--accent);
    }
    .toc-row.sub {
      padding-${isAr ? 'right' : 'left'}: 24px;
      font-size: 13px;
      font-weight: 500;
      color: var(--ok);
    }
    .toc-dots {
      flex-grow: 1;
      border-bottom: 2px dotted #C8C4BA;
      margin: 0 10px;
      position: relative;
      top: -4px;
    }
    .toc-page {
      color: var(--accent);
      font-weight: 800;
      min-width: 24px;
      text-align: ${isAr ? 'left' : 'right'};
    }
    h2.section-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--accent);
      border-bottom: 2px solid var(--accent);
      padding-bottom: 8px;
      margin-top: 40px;
    }
    .course-card {
      background: #FDF8F8;
      border: 1px solid #F0D0D0;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      font-size: 14px;
      text-align: center;
      font-weight: 700;
      color: var(--accent);
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
    .supervisor-signbox {
      padding: 12px 16px;
      background: #FAF9F6;
      border-top: 1px dashed var(--line);
      font-size: 12.5px;
      color: var(--sub);
    }
    .approval-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 24px;
      font-size: 13.5px;
    }
    .approval-table td {
      width: 50%;
      padding: 18px;
      border: 1px solid var(--ink);
      vertical-align: top;
    }
    .print-bar {
      position: sticky;
      top: 10px;
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(8px);
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      margin-bottom: 20px;
      border: 1px solid var(--line);
    }
    .btn {
      background: var(--accent);
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    /* Suppress browser print header/footer */
    @page {
      size: A4 portrait;
      margin: 0;
    }
    @media print {
      body {
        background: white;
        margin: 0;
        padding: 2cm 1.6cm;
      }
      .container { max-width: 100%; margin: 0; padding: 0; }
      .report-paper { border: none; box-shadow: none; padding: 0; }
      .print-bar { display: none !important; }
      .week-block { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="print-bar">
      <span style="font-size: 13px; color: var(--sub); display: inline-flex; align-items: center; gap: 6px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <span>${isAr ? 'لطباعة نقية كـ PDF: ألغِ خيار (الرؤوس والتذييلات / Headers & Footers) في نافذة الطباعة لإخفاء الرابط والتاريخ.' : 'Tip: Uncheck "Headers and Footers" in print options to hide page URLs and dates.'}</span>
      </span>
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
        <div class="subtitle">${entityName}</div>
        
        <div class="meta-grid">
          <div class="meta-item"><b>${isAr ? 'اسم المتدرب:' : 'Trainee Name:'}</b> ${escapeHtml(profile.studentName) || '—'}</div>
          <div class="meta-item"><b>${isAr ? 'الرقم التدريبي:' : 'Training ID:'}</b> ${escapeHtml(profile.trainingNumber) || '—'}</div>
          <div class="meta-item"><b>${isAr ? 'القسم / التخصص:' : 'Department:'}</b> ${escapeHtml(profile.department) || '—'}</div>
          <div class="meta-item"><b>${isAr ? 'المشرف الأكاديمي:' : 'Academic Supervisor:'}</b> ${escapeHtml(profile.supervisorName) || '—'}</div>
          <div class="meta-item"><b>${isAr ? 'المشرف الميداني:' : 'Field Supervisor:'}</b> ${escapeHtml(profile.responsibleName) || '—'}</div>
          <div class="meta-item"><b>${isAr ? 'ساعات المقرر في الخطة:' : 'Course Credit:'}</b> ${isAr ? 'ساعتان معتمدتان من المعدل التراكمي' : '2 Credit Hours in GPA'}</div>
          <div class="meta-item"><b>${isAr ? 'المدة التدريبية:' : 'Training Duration:'}</b> ${profile.trainingWeeks || 14} ${isAr ? 'أسبوعاً تدريبياً ميدانياً' : 'Weeks'}</div>
          <div class="meta-item"><b>${isAr ? 'حالة التوثيق الميداني:' : 'Documentation Status:'}</b> ${weeks.length} ${isAr ? 'أسبوعاً موثقاً بالكامل (100%)' : 'Weeks Completed (100%)'}</div>
        </div>
      </div>

      <!-- TOC matching exact format of image media_1788397544077.png -->
      <div class="toc" id="sec-toc">
        <h2>${isAr ? 'فهرس المحتويات وموضوعات الأسابيع' : 'Table of Contents & Weekly Topics'}</h2>
        
        <a class="toc-row" href="#sec-cover">
          <span>${isAr ? '• صفحة الغلاف والبيانات الأساسية' : '• Cover & Student Credentials'}</span>
          <span class="toc-dots"></span>
          <span class="toc-page">${isAr ? '١' : '1'}</span>
        </a>

        <a class="toc-row" href="#sec-intro">
          <span>${isAr ? '• 1. المقدمة وأهداف التدريب وبيانات المقرر (ساعتان معتمدتان)' : '• 1. Introduction & Course Credit (2 Credit Hours in GPA)'}</span>
          <span class="toc-dots"></span>
          <span class="toc-page">${isAr ? '٢' : '2'}</span>
        </a>

        <a class="toc-row" href="#sec-entity">
          <span>${isAr ? '• 2. التعريف بجهة التدريب وطبيعة العمل' : '• 2. Host Organization Overview'}</span>
          <span class="toc-dots"></span>
          <span class="toc-page">${isAr ? '٣' : '3'}</span>
        </a>

        <a class="toc-row" href="#sec-timeline">
          <span>${isAr ? `• 3. سجل وتقارير الأسابيع التدريبية الميدانية (${weeks.length} أسبوعاً)` : `• 3. Weekly Field Training Reports (${weeks.length} Weeks)`}</span>
          <span class="toc-dots"></span>
          <span class="toc-page">${isAr ? '٤' : '4'}</span>
        </a>

        ${weeks.map((w, idx) => `
          <a class="toc-row sub" href="#week-${w.weekIndex}">
            <span>${isAr ? `— تقرير الأسبوع ${w.weekIndex}: ${escapeHtml(getWeekTopicServer(w, isAr))}` : `— Week ${w.weekIndex} Report: ${escapeHtml(getWeekTopicServer(w, false))}`}</span>
            <span class="toc-dots"></span>
            <span class="toc-page">${5 + idx}</span>
          </a>
        `).join('')}

        <a class="toc-row" href="#sec-skills">
          <span>${isAr ? '• 4. المعارف والمهارات والتجارب المكتسبة' : '• 4. Acquired Knowledge & Skills'}</span>
          <span class="toc-dots"></span>
          <span class="toc-page">${5 + weeks.length}</span>
        </a>

        <a class="toc-row" href="#sec-conclusion">
          <span>${isAr ? '• 5. الخاتمة والتوصيات العامة' : '• 5. Conclusion & Recommendations'}</span>
          <span class="toc-dots"></span>
          <span class="toc-page">${6 + weeks.length}</span>
        </a>

        <a class="toc-row" href="#sec-approval">
          <span>${isAr ? '• 6. استمارة تقييم واعتماد المشرفين والملاحق' : '• 6. Supervisory Approval Form & Appendices'}</span>
          <span class="toc-dots"></span>
          <span class="toc-page">${7 + weeks.length}</span>
        </a>
      </div>

      <!-- Section 1 -->
      <h2 class="section-title page-break" id="sec-intro">${isAr ? '1. المقدمة وأهداف التدريب وساعات المقرر' : '1. Introduction & Course Requirements'}</h2>
      <p style="white-space: pre-wrap;">${escapeHtml(profile.introText)}</p>

      <div class="course-card">
        ${isAr
          ? `ساعات المقرر المطلوبة: ${courseHours} ساعة  |  الساعات المنجزة: ${totalHours} ساعة (${progressPercent}%)  |  الخطة: ${profile.trainingWeeks || 14} أسبوعاً  |  البداية: ${profile.startDate || 'حسب التقويم'}`
          : `Required: ${courseHours} hrs  |  Completed: ${totalHours} hrs (${progressPercent}%)  |  Plan: ${profile.trainingWeeks || 14} Weeks  |  Start: ${profile.startDate || 'As Scheduled'}`}
      </div>

      <!-- Section 2 -->
      <h2 class="section-title" id="sec-entity">${isAr ? '2. التعريف بجهة التدريب وطبيعة العمل' : '2. Host Organization Overview'}</h2>
      <p style="white-space: pre-wrap;">${escapeHtml(profile.entityIntroText)}</p>
      <div style="background: #FAFAFA; padding: 14px 18px; border-radius: 6px; font-size: 13.5px; border: 1px solid var(--line); margin: 16px 0;">
        <b>${isAr ? 'جهة التدريب:' : 'Organization:'}</b> ${escapeHtml(entityName)} | 
        <b>${isAr ? 'عدد الموظفين:' : 'Employees:'}</b> ${escapeHtml(profile.employeesCount) || '—'} |
        <b>${isAr ? 'المشرف الميداني:' : 'Supervisor:'}</b> ${escapeHtml(profile.responsibleName) || '—'}
      </div>

      <!-- Section 3 -->
      <h2 class="section-title page-break" id="sec-timeline">${isAr ? `3. تقارير وسجل الأسابيع التدريبية الميدانية (${weeks.length} أسبوعاً)` : `3. Weekly Field Training Reports (${weeks.length} Weeks)`}</h2>
      ${weeks.map((w) => `
        <div class="week-block page-break" id="week-${w.weekIndex}">
          <div class="week-header">
            <span>${isAr ? `تقرير الأسبوع ${w.weekIndex}: ${escapeHtml(getWeekTopicServer(w, isAr))}` : `Week ${w.weekIndex} Report: ${escapeHtml(getWeekTopicServer(w, false))}`}</span>
            <span>${isAr ? 'الفترة:' : 'Period:'} ${w.weekStart} — ${w.weekEnd}</span>
          </div>

          <div style="padding: 16px; background: #FFFFFF;">
            <div style="font-size: 13px; font-weight: 800; color: var(--ink); margin-bottom: 12px; border-bottom: 1px solid var(--line); padding-bottom: 6px;">
              ${isAr ? 'أولاً: البيان التفصيلي للمهام والأعمال الميدانية المنفذة:' : 'Accomplished Technical Tasks:'}
            </div>

            ${w.entries.length > 0 ? w.entries.map((e: any, eIdx: number) => `
              <div style="margin-bottom: 12px; padding: 12px 14px; background: #FAFAF8; border: 1px solid var(--line); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-weight: 800; font-size: 13px; color: var(--ink);">(${eIdx + 1}) ${escapeHtml(e.title)}</span>
                  <span style="font-size: 11px; color: var(--sub);">${e.entryDate ? (isAr ? formatDateArabic(e.entryDate) : formatDateEnglish(e.entryDate)) : ''}</span>
                </div>
                <div style="margin-bottom: 6px;">
                  <span class="badge">${escapeHtml(translateCategory(e.category, isAr))}</span>
                </div>
                <div style="font-size: 12px; color: var(--sub); line-height: 1.6; white-space: pre-wrap;">${escapeHtml(e.description)}</div>
              </div>
            `).join('') : `
              <div style="text-align: center; color: var(--sub); padding: 20px; font-style: italic;">
                ${isAr ? 'أسبوع تدريبي مؤجل أو لم تسجل به مهام بعد — متاح للتوثيق والاستكمال لاحقاً' : 'Postponed or pending training week'}
              </div>
            `}
          </div>

          ${w.evidence && w.evidence.length > 0 ? `
            <div style="padding: 14px 16px; background: #FAFAFA; border-top: 1px solid var(--line);">
              <div style="font-size: 12px; font-weight: bold; color: var(--accent); margin-bottom: 8px;">
                ${isAr ? 'ثانياً: الصور التوثيقية والأدلة الميدانية للأسبوع:' : 'Weekly Documentation & Field Evidence Photos:'}
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                ${w.evidence.map((ev, evIdx) => `
                  <div style="border: 1px solid var(--line); border-radius: 6px; overflow: hidden; background: #FFF;">
                    <img src="${ev.imageData}" alt="${escapeHtml(ev.caption)}" style="width: 100%; height: 140px; object-fit: cover; display: block;" />
                    <div style="padding: 8px; font-size: 11.5px; color: var(--ink); line-height: 1.4;">
                      <b>${isAr ? `شكل (${evIdx + 1}): ` : `Figure (${evIdx + 1}): `}</b>${escapeHtml(ev.caption)}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div style="padding: 12px 16px; background: #F8F8F8; border-top: 1px dashed var(--line); font-size: 11.5px; display: flex; justify-content: space-between; align-items: center; color: var(--sub);">
            <span><b>${isAr ? 'اعتماد المشرف الميداني بالمنشأة:' : 'Supervisor Sign-off:'}</b> ${escapeHtml(profile.responsibleName) || '....................'}</span>
            <span>${isAr ? 'التقييم: [  ] ممتاز   [  ] جيد جداً   [  ] جيد' : 'Rating: [  ] Excellent  [  ] Very Good  [  ] Good'}</span>
            <span>${isAr ? 'التوقيع والختم: ....................' : 'Signature: ....................'}</span>
          </div>
        </div>
      `).join('')}

      <!-- Section 4 -->
      <h2 class="section-title page-break" id="sec-skills">${isAr ? '4. المعارف والمهارات والتجارب المكتسبة' : '4. Acquired Knowledge & Skills'}</h2>
      <p>${escapeHtml(profile.skillsText)}</p>

      <!-- Section 5 -->
      <h2 class="section-title page-break" id="sec-conclusion">${isAr ? '5. الخاتمة والتوصيات العامة' : '5. Conclusion'}</h2>
      <p>${escapeHtml(profile.conclusionText)}</p>

      <!-- Section 6: Approval -->
      <h2 class="section-title page-break" id="sec-approval">${isAr ? '6. استمارة اعتماد وتوقيعات الإشراف' : '6. Supervisory Approval & Final Sign-Off'}</h2>
      <table class="approval-table">
        <tr>
          <td>
            <b>${isAr ? 'اعتماد المشرف الميداني (جهة التدريب):' : 'Field Supervisor Approval:'}</b><br><br>
            ${isAr ? 'الاسم:' : 'Name:'} ${escapeHtml(profile.responsibleName) || '....................'}<br><br>
            ${isAr ? 'الساعات المعتمدة:' : 'Approved Hours:'} ${totalHours} / ${courseHours}<br><br>
            ${isAr ? 'التوقيع والختم: ........................................' : 'Signature & Stamp: ........................................'}
          </td>
          <td>
            <b>${isAr ? 'اعتماد المشرف الأكاديمي (الكلية / الجامعة):' : 'Academic Supervisor Approval:'}</b><br><br>
            ${isAr ? 'الاسم:' : 'Name:'} ${escapeHtml(profile.supervisorName) || '....................'}<br><br>
            ${isAr ? 'الدرجة النهائية:' : 'Final Grade:'} ....................<br><br>
            ${isAr ? 'التوقيع والختم: ........................................' : 'Signature & Stamp: ........................................'}
          </td>
        </tr>
      </table>
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
