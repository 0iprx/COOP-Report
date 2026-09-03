import pptxgen from 'pptxgenjs';
import { FinalReportData } from '@coop/shared';

export async function generatePresentationBuffer(reportData: FinalReportData): Promise<Buffer> {
  // @ts-ignore
  const pptx = new (pptxgen.default || pptxgen)();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = reportData.profile.studentName || 'COOP Trainee';
  pptx.title = `عرض مناقشة التدريب التعاوني - ${reportData.profile.studentName}`;
  pptx.company = reportData.profile.entityAddress || 'COOP Training';

  // Theme Colors
  const BG_COLOR = '0F172A'; // Slate 900
  const CARD_BG = '1E293B';  // Slate 800
  const TEXT_MAIN = 'F8FAFC'; // Slate 50
  const TEXT_MUTED = '94A3B8'; // Slate 400
  const ACCENT_TEAL = '0D9488'; // Teal 600
  const ACCENT_EMERALD = '10B981'; // Emerald 500

  // ------------------------------------------------------------------
  // Slide 1: Cover Slide
  // ------------------------------------------------------------------
  const slide1 = pptx.addSlide();
  slide1.background = { color: BG_COLOR };

  slide1.addText('المملكة العربية السعودية — المؤسسة العامة للتدريب التقني والمهني', {
    x: 0.8,
    y: 0.6,
    w: 11.7,
    h: 0.4,
    fontSize: 14,
    color: ACCENT_TEAL,
    bold: true,
    rtl: true,
    align: 'right'
  });

  slide1.addText('عرض مناقشة التقرير النهائي للتدريب التعاوني', {
    x: 0.8,
    y: 1.4,
    w: 11.7,
    h: 1.0,
    fontSize: 32,
    color: TEXT_MAIN,
    bold: true,
    rtl: true,
    align: 'right'
  });

  slide1.addText(`جهة التدريب الميداني: ${reportData.profile.entityAddress || 'جهة التدريب'}`, {
    x: 0.8,
    y: 2.6,
    w: 11.7,
    h: 0.6,
    fontSize: 20,
    color: ACCENT_EMERALD,
    bold: true,
    rtl: true,
    align: 'right'
  });

  // Metadata Card
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 3.8,
    w: 11.7,
    h: 2.7,
    fill: { color: CARD_BG },
    line: { color: '334155', width: 1 }
  });

  const studentName = reportData.profile.studentName || 'المتدرب';
  const trainingNum = reportData.profile.trainingNumber || '—';
  const dept = reportData.profile.department || '—';
  const supervisor = reportData.profile.supervisorName || reportData.profile.responsibleName || 'المشرف المعتمد';
  const hours = `${reportData.totalHours} من ${reportData.profile.courseHours || 280} ساعة معتمدة`;

  slide1.addText(
    `إعداد المتدرب: ${studentName}\n` +
    `الرقم التدريبي: ${trainingNum}\n` +
    `القسم والتخصص: ${dept}\n` +
    `إشراف: ${supervisor}\n` +
    `إجمالي ساعات الإنجاز: ${hours}`,
    {
      x: 1.2,
      y: 4.1,
      w: 10.9,
      h: 2.2,
      fontSize: 15,
      color: TEXT_MAIN,
      lineSpacing: 28,
      rtl: true,
      align: 'right'
    }
  );

  // ------------------------------------------------------------------
  // Slide 2: Host Entity & Scope Overview
  // ------------------------------------------------------------------
  const slide2 = pptx.addSlide();
  slide2.background = { color: BG_COLOR };

  slide2.addText('١. التعريف بجهة التدريب ونطاق العمل الميداني', {
    x: 0.8,
    y: 0.6,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    color: TEXT_MAIN,
    bold: true,
    rtl: true,
    align: 'right'
  });

  // Entity Details Box
  slide2.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.5,
    w: 5.6,
    h: 5.2,
    fill: { color: CARD_BG },
    line: { color: '334155', width: 1 }
  });

  slide2.addText('بيانات الخطة التدريبية', {
    x: 1.1,
    y: 1.8,
    w: 5.0,
    h: 0.4,
    fontSize: 18,
    color: ACCENT_TEAL,
    bold: true,
    rtl: true,
    align: 'right'
  });

  slide2.addText(
    `• جهة التدريب: ${reportData.profile.entityAddress || '—'}\n\n` +
    `• الكلية / الوحدة: ${reportData.profile.trainingUnit || '—'}\n\n` +
    `• مدة التدريب المعتمدة: ${reportData.profile.trainingWeeks || 14} أسبوعاً تدريبياً\n\n` +
    `• ساعات المقرر المطلوبة: ${reportData.profile.courseHours || 280} ساعة\n\n` +
    `• إجمالي أيام العمل المسجلة: ${reportData.totalDays} يوم عمل`,
    {
      x: 1.1,
      y: 2.4,
      w: 5.0,
      h: 4.0,
      fontSize: 14,
      color: TEXT_MAIN,
      rtl: true,
      align: 'right'
    }
  );

  // Entity Narrative Box
  slide2.addShape(pptx.ShapeType.rect, {
    x: 6.8,
    y: 1.5,
    w: 5.7,
    h: 5.2,
    fill: { color: CARD_BG },
    line: { color: '334155', width: 1 }
  });

  slide2.addText('نبذة عن طبيعة العمل والبيئة المهنية', {
    x: 7.1,
    y: 1.8,
    w: 5.1,
    h: 0.4,
    fontSize: 18,
    color: ACCENT_TEAL,
    bold: true,
    rtl: true,
    align: 'right'
  });

  const entitySummary = reportData.profile.entityIntroText
    ? reportData.profile.entityIntroText.slice(0, 450) + (reportData.profile.entityIntroText.length > 450 ? '...' : '')
    : 'تم تنفيذ التدريب في بيئة تقنية متكاملة تهدف إلى تطبيق المهارات الميدانية وحل المشكلات الهندسية والتنظيمية.';

  slide2.addText(entitySummary, {
    x: 7.1,
    y: 2.4,
    w: 5.1,
    h: 4.0,
    fontSize: 13,
    color: TEXT_MUTED,
    lineSpacing: 24,
    rtl: true,
    align: 'right'
  });

  // ------------------------------------------------------------------
  // Slide 3: 14-Week Progress & Accomplishments
  // ------------------------------------------------------------------
  const slide3 = pptx.addSlide();
  slide3.background = { color: BG_COLOR };

  slide3.addText('٢. ملخص إنجاز الأسابيع الـ 14 وساعات العمل', {
    x: 0.8,
    y: 0.6,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    color: TEXT_MAIN,
    bold: true,
    rtl: true,
    align: 'right'
  });

  // 4 Metric Counters
  const metrics = [
    { title: 'إجمالي الساعات المعتمدة', val: `${reportData.totalHours} س` },
    { title: 'ساعات المقرر المطلوبة', val: `${reportData.profile.courseHours || 280} س` },
    { title: 'نسبة إنجاز الخطة', val: `${Math.min(100, Math.round((reportData.totalHours / (reportData.profile.courseHours || 280)) * 100))}%` },
    { title: 'إجمالي المهام المسجلة', val: `${reportData.totalEntries} مهمة` }
  ];

  metrics.forEach((m, idx) => {
    const xPos = 0.8 + idx * 2.95;
    slide3.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: 1.5,
      w: 2.8,
      h: 1.6,
      fill: { color: CARD_BG },
      line: { color: '334155', width: 1 }
    });

    slide3.addText(m.val, {
      x: xPos,
      y: 1.7,
      w: 2.8,
      h: 0.7,
      fontSize: 26,
      color: ACCENT_EMERALD,
      bold: true,
      align: 'center'
    });

    slide3.addText(m.title, {
      x: xPos,
      y: 2.4,
      w: 2.8,
      h: 0.5,
      fontSize: 12,
      color: TEXT_MUTED,
      bold: true,
      rtl: true,
      align: 'center'
    });
  });

  // High-level timeline table of weeks
  const sampleWeeks = reportData.weeks.slice(0, 7);
  const tableRows: any[][] = [
    [
      { text: 'مجموع الساعات', options: { bold: true, color: TEXT_MAIN, fill: { color: '334155' }, align: 'center' } },
      { text: 'فترة الأسبوع', options: { bold: true, color: TEXT_MAIN, fill: { color: '334155' }, align: 'center' } },
      { text: 'الأسبوع', options: { bold: true, color: TEXT_MAIN, fill: { color: '334155' }, align: 'center' } }
    ]
  ];

  sampleWeeks.forEach((w) => {
    tableRows.push([
      { text: `${w.totalHours} ساعة`, options: { color: TEXT_MAIN, fill: { color: CARD_BG }, align: 'center' } },
      { text: `${w.weekStart} إلى ${w.weekEnd}`, options: { color: TEXT_MUTED, fill: { color: CARD_BG }, align: 'center' } },
      { text: `الأسبوع ${w.weekIndex}`, options: { color: ACCENT_TEAL, bold: true, fill: { color: CARD_BG }, align: 'center' } }
    ]);
  });

  slide3.addTable(tableRows, {
    x: 0.8,
    y: 3.4,
    w: 11.7,
    colW: [3.5, 4.7, 3.5],
    fontSize: 12,
    lineWeight: 1,
    lineColor: '475569'
  });

  // ------------------------------------------------------------------
  // Slide 4 & 5: Field Evidence & Documentation Photos
  // ------------------------------------------------------------------
  // Collect all photos from all weeks
  const allEvidence: { weekIndex: number; caption: string; imageData: string }[] = [];
  reportData.weeks.forEach((w) => {
    if (w.evidence && w.evidence.length > 0) {
      w.evidence.forEach((ev) => {
        allEvidence.push({
          weekIndex: w.weekIndex,
          caption: ev.caption,
          imageData: ev.imageData
        });
      });
    }
  });

  if (allEvidence.length > 0) {
    // Up to 4 photos per slide
    const chunkSize = 4;
    for (let c = 0; c < Math.min(2, Math.ceil(allEvidence.length / chunkSize)); c++) {
      const chunk = allEvidence.slice(c * chunkSize, (c + 1) * chunkSize);
      const slideEv = pptx.addSlide();
      slideEv.background = { color: BG_COLOR };

      slideEv.addText(`٣. الصور التوثيقية والأدلة الميدانية (الجزء ${c + 1})`, {
        x: 0.8,
        y: 0.5,
        w: 11.7,
        h: 0.6,
        fontSize: 22,
        color: TEXT_MAIN,
        bold: true,
        rtl: true,
        align: 'right'
      });

      slideEv.addText('توثيق ميداني لبيئة العمل ومراكز البيانات والمعامل (دون أي بيانات سرية للجهة وفق سياسة أمن المعلومات)', {
        x: 0.8,
        y: 1.1,
        w: 11.7,
        h: 0.4,
        fontSize: 11,
        color: TEXT_MUTED,
        rtl: true,
        align: 'right'
      });

      // Place up to 4 photos in a 2x2 grid
      chunk.forEach((ev, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const xPos = 0.8 + col * 5.95;
        const yPos = 1.6 + row * 2.65;

        // Image Card Container
        slideEv.addShape(pptx.ShapeType.rect, {
          x: xPos,
          y: yPos,
          w: 5.75,
          h: 2.5,
          fill: { color: CARD_BG },
          line: { color: '334155', width: 1 }
        });

        // Add Image
        try {
          slideEv.addImage({
            data: ev.imageData,
            x: xPos + 0.15,
            y: yPos + 0.15,
            w: 2.6,
            h: 2.2
          });
        } catch {
          // If image fails to embed, placeholder text
          slideEv.addText('[صورة توثيقية]', {
            x: xPos + 0.15,
            y: yPos + 0.15,
            w: 2.6,
            h: 2.2,
            align: 'center',
            color: TEXT_MUTED
          });
        }

        // Caption & Week Tag
        slideEv.addText(`الأسبوع ${ev.weekIndex}`, {
          x: xPos + 2.9,
          y: yPos + 0.2,
          w: 2.7,
          h: 0.35,
          fontSize: 13,
          color: ACCENT_TEAL,
          bold: true,
          rtl: true,
          align: 'right'
        });

        slideEv.addText(ev.caption, {
          x: xPos + 2.9,
          y: yPos + 0.6,
          w: 2.7,
          h: 1.7,
          fontSize: 11,
          color: TEXT_MAIN,
          lineSpacing: 18,
          rtl: true,
          align: 'right'
        });
      });
    }
  } else {
    // Evidence placeholder slide if no photos attached yet
    const slideEv = pptx.addSlide();
    slideEv.background = { color: BG_COLOR };

    slideEv.addText('٣. الصور التوثيقية والأدلة الميدانية', {
      x: 0.8,
      y: 0.6,
      w: 11.7,
      h: 0.6,
      fontSize: 24,
      color: TEXT_MAIN,
      bold: true,
      rtl: true,
      align: 'right'
    });

    slideEv.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.6,
      w: 11.7,
      h: 4.8,
      fill: { color: CARD_BG },
      line: { color: '334155', width: 1 }
    });

    slideEv.addText(
      'يمكنك إرفاق الصور التوثيقية (مثل تصوير مركز البيانات، المعامل، غرف الخوادم، بيئة العمل الميدانية) عبر تبويب التقرير الأسبوعي لتظهر تلقائياً هنا في هذا العرض التقديمي.',
      {
        x: 1.5,
        y: 3.5,
        w: 10.3,
        h: 1.2,
        fontSize: 16,
        color: TEXT_MUTED,
        rtl: true,
        align: 'center'
      }
    );
  }

  // ------------------------------------------------------------------
  // Slide 6: Acquired Skills & Technical Competencies
  // ------------------------------------------------------------------
  const slideSkills = pptx.addSlide();
  slideSkills.background = { color: BG_COLOR };

  slideSkills.addText('٤. المهارات والخبرات المكتسبة', {
    x: 0.8,
    y: 0.6,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    color: TEXT_MAIN,
    bold: true,
    rtl: true,
    align: 'right'
  });

  slideSkills.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.5,
    w: 11.7,
    h: 5.2,
    fill: { color: CARD_BG },
    line: { color: '334155', width: 1 }
  });

  const skillsContent = reportData.profile.skillsText
    ? reportData.profile.skillsText.slice(0, 600) + (reportData.profile.skillsText.length > 600 ? '...' : '')
    : '• اكتساب مهارات التعامل مع الأنظمة والشبكات والبيئات التشغيلية الحقيقية.\n' +
      '• تطبيق المعارف النظرية وتطوير حلول برمجية وميدانية للتحديات التقنية.\n' +
      '• تعزيز مهارات التواصل المهني، والعمل الجماعي، وإدارة الوقت والمهام.';

  slideSkills.addText(skillsContent, {
    x: 1.2,
    y: 1.9,
    w: 10.9,
    h: 4.4,
    fontSize: 14,
    color: TEXT_MAIN,
    lineSpacing: 26,
    rtl: true,
    align: 'right'
  });

  // ------------------------------------------------------------------
  // Slide 7: Conclusion, Recommendations & Acknowledgements
  // ------------------------------------------------------------------
  const slideEnd = pptx.addSlide();
  slideEnd.background = { color: BG_COLOR };

  slideEnd.addText('٥. الخاتمة والتوصيات ورسالة الشكر', {
    x: 0.8,
    y: 0.6,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    color: TEXT_MAIN,
    bold: true,
    rtl: true,
    align: 'right'
  });

  slideEnd.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.5,
    w: 11.7,
    h: 3.5,
    fill: { color: CARD_BG },
    line: { color: '334155', width: 1 }
  });

  const conclusionContent = reportData.profile.conclusionText
    ? reportData.profile.conclusionText.slice(0, 500) + (reportData.profile.conclusionText.length > 500 ? '...' : '')
    : 'أثمرت تجربة التدريب التعاوني عن إثراء الجوانب التطبيقية وربط المناهج بسوق العمل الفعلي، مع التوصية باستمرار وتوسيع الشراكات التدريبية.';

  slideEnd.addText(conclusionContent, {
    x: 1.2,
    y: 1.8,
    w: 10.9,
    h: 2.8,
    fontSize: 14,
    color: TEXT_MAIN,
    lineSpacing: 26,
    rtl: true,
    align: 'right'
  });

  // Thank You Banner
  slideEnd.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 5.3,
    w: 11.7,
    h: 1.4,
    fill: { color: '064E3B' }, // Emerald 900
    line: { color: ACCENT_EMERALD, width: 1 }
  });

  slideEnd.addText('شكراً للجنة التحكيم الموقرة، ولجهة التدريب، وللمشرف الأكاديمي على الدعم والمتابعة', {
    x: 1.0,
    y: 5.7,
    w: 11.3,
    h: 0.6,
    fontSize: 16,
    color: 'ECFDF5',
    bold: true,
    rtl: true,
    align: 'center'
  });

  // Generate buffer
  const out = await pptx.write({ outputType: 'nodebuffer' });
  return out as Buffer;
}
