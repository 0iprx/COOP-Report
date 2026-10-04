import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from 'docx';
import pptxgen from 'pptxgenjs';
import { LEARNING_STATUS_LABELS, PeriodReportContent, PeriodReportStats, ReportProfileDTO } from '@coop/shared';

/** Word and PowerPoint editions of a weekly / monthly COOP report (same palette as the site) */

const ACCENT = '8B0000';
const INK = '1B1B18';
const SUB = '6E6B62';
const LINE = 'D9D4C7';

function p(text: string, isAr: boolean, opts: { bold?: boolean; size?: number; color?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; after?: number } = {}) {
  return new Paragraph({
    bidirectional: isAr,
    alignment: opts.align ?? (isAr ? AlignmentType.RIGHT : AlignmentType.LEFT),
    spacing: { after: opts.after ?? 120, line: 320 },
    children: [new TextRun({ text, bold: opts.bold, size: opts.size ?? 24, color: opts.color ?? INK, rightToLeft: isAr })]
  });
}

function cell(text: string, isAr: boolean, header = false, width?: number) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: header ? { type: ShadingType.CLEAR, color: 'auto', fill: 'F1EEE6' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [p(text, isAr, { bold: header, size: header ? 20 : 20, after: 0 })]
  });
}

function sectionHeading(text: string, isAr: boolean) {
  return new Paragraph({
    bidirectional: isAr,
    alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
    spacing: { before: 280, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 28, color: ACCENT, rightToLeft: isAr })]
  });
}

function infoTable(rows: [string, string][], isAr: boolean) {
  // visuallyRightToLeft mirrors the columns, so the label cell stays first in both languages
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    visuallyRightToLeft: isAr,
    rows: rows.map(([k, v]) => new TableRow({ children: [cell(k, isAr, true, 30), cell(v || '—', isAr, false, 70)] }))
  });
}

export async function generatePeriodReportDocx(
  content: PeriodReportContent,
  stats: PeriodReportStats,
  profile: ReportProfileDTO,
  lang: 'ar' | 'en'
): Promise<Buffer> {
  const isAr = lang === 'ar';
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const children: (Paragraph | Table)[] = [];

  children.push(p(L('المملكة العربية السعودية', 'Kingdom of Saudi Arabia'), isAr, { align: AlignmentType.CENTER, color: SUB, size: 22 }));
  children.push(p(profile.trainingUnit || profile.department || '', isAr, { align: AlignmentType.CENTER, color: SUB, size: 22 }));
  children.push(p(content.title, isAr, { align: AlignmentType.CENTER, bold: true, size: 34, color: ACCENT, after: 60 }));
  children.push(p(content.subtitle, isAr, { align: AlignmentType.CENTER, color: SUB, size: 22, after: 240 }));

  children.push(
    infoTable(
      [
        [L('اسم المتدرب', 'Trainee'), profile.studentName],
        [L('الرقم التدريبي', 'Training No.'), profile.trainingNumber],
        [L('جهة التدريب', 'Host Organization'), profile.entityAddress],
        [L('المشرف الميداني', 'Field Supervisor'), profile.responsibleName],
        [L('المشرف الأكاديمي', 'Academic Supervisor'), profile.supervisorName],
        [
          L('الساعات / الأيام', 'Hours / Days'),
          `${stats.hours} ${L('ساعة', 'h')} / ${stats.days} ${L('أيام', 'days')} — ${L('التراكمي', 'Cumulative')}: ${stats.cumulativeHours}/${stats.plannedHours}`
        ],
        [
          L('تصنيف التعلم', 'Learning profile'),
          `${LEARNING_STATUS_LABELS.new[lang]}: ${stats.newCount} · ${LEARNING_STATUS_LABELS.reinforced[lang]}: ${stats.reinforcedCount} · ${LEARNING_STATUS_LABELS.routine[lang]}: ${stats.routineCount}`
        ]
      ],
      isAr
    )
  );

  content.sections.forEach((s, i) => {
    children.push(sectionHeading(`${i + 1}. ${s.heading}`, isAr));
    if (s.body) s.body.split(/\n{2,}/).forEach((para) => children.push(p(para.trim(), isAr)));

    if (s.key === 'activities' && content.activities.length) {
      const head = [L('التاريخ', 'Date'), L('المهمة', 'Task'), L('ما نُفّذ', 'What was done'), L('الساعات', 'Hours'), L('التصنيف', 'Learning')];
      const rows = [
        new TableRow({ tableHeader: true, children: head.map((h) => cell(h, isAr, true)) }),
        ...content.activities.map(
          (a) =>
            new TableRow({
              children: [
                cell(a.dateLabel, isAr, false, 14),
                cell(a.title, isAr, false, 24),
                cell(a.summary, isAr, false, 42),
                cell(String(a.hours), isAr, false, 8),
                cell(a.learningStatus ? LEARNING_STATUS_LABELS[a.learningStatus][lang] : '—', isAr, false, 12)
              ]
            })
        )
      ];
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, visuallyRightToLeft: isAr, rows }));
    }

    if (s.key === 'skills') {
      if (content.newSkills.length) {
        children.push(p(L('معارف جديدة:', 'New knowledge:'), isAr, { bold: true, color: '2A6348' }));
        content.newSkills.forEach((k) => children.push(p(`• ${k}`, isAr)));
      }
      if (content.reinforcedSkills.length) {
        children.push(p(L('مهارات تم تعزيزها:', 'Reinforced skills:'), isAr, { bold: true, color: 'B45309' }));
        content.reinforcedSkills.forEach((k) => children.push(p(`• ${k}`, isAr)));
      }
    }

    (s.items || []).forEach((it) => children.push(p(`• ${it}`, isAr)));
  });

  // Sign-off block
  children.push(sectionHeading(L('اعتماد المشرفين', 'Supervisor Sign-off'), isAr));
  children.push(
    infoTable(
      [
        [L('ملاحظات المشرف الميداني', 'Field supervisor remarks'), ' '],
        [L('التوقيع والتاريخ', 'Signature & date'), ' '],
        [L('ملاحظات المشرف الأكاديمي', 'Academic supervisor remarks'), ' '],
        [L('التوقيع والتاريخ', 'Signature & date'), ' ']
      ],
      isAr
    )
  );

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: isAr ? 'Traditional Arabic' : 'Times New Roman', size: 24, color: INK } }
      }
    },
    sections: [
      {
        properties: { page: { margin: { top: 1200, bottom: 1200, left: 1100, right: 1100 } } },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${profile.studentName || ''}  |  `, size: 18, color: SUB }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: SUB })
                ]
              })
            ]
          })
        },
        children
      }
    ]
  });
  return Packer.toBuffer(doc);
}

export async function generatePeriodReportPptx(
  content: PeriodReportContent,
  stats: PeriodReportStats,
  profile: ReportProfileDTO,
  lang: 'ar' | 'en'
): Promise<Buffer> {
  const isAr = lang === 'ar';
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.rtlMode = isAr;
  const fontFace = isAr ? 'Tajawal' : 'Calibri';
  const align = isAr ? 'right' : 'left';
  const base = { fontFace, rtl: isAr, align } as const;

  const frame = (title: string, n: number) => {
    const s = pptx.addSlide();
    s.background = { color: 'FAFAF8' };
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.12, fill: { color: 'C0102A' }, line: { color: 'C0102A' } });
    s.addText(title, { ...base, x: 0.7, y: 0.4, w: 11.9, h: 0.6, fontSize: 24, bold: true, color: ACCENT });
    s.addShape(pptx.ShapeType.line, { x: 0.7, y: 1.05, w: 11.9, h: 0, line: { color: LINE, width: 1 } });
    s.addText(`${profile.studentName || ''}  |  ${content.title}  |  ${n}`, { ...base, x: 0.7, y: 7.0, w: 11.9, h: 0.3, fontSize: 9, color: SUB });
    return s;
  };

  // Cover
  const cover = pptx.addSlide();
  cover.background = { color: 'FAFAF8' };
  cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.2, fill: { color: 'C0102A' }, line: { color: 'C0102A' } });
  cover.addText(content.title, { ...base, align: 'center', x: 0.7, y: 2.2, w: 11.9, h: 1.0, fontSize: 32, bold: true, color: ACCENT });
  cover.addText(content.subtitle, { ...base, align: 'center', x: 0.7, y: 3.2, w: 11.9, h: 0.5, fontSize: 16, color: SUB });
  cover.addText(
    [profile.studentName, profile.entityAddress, profile.trainingUnit || profile.department].filter(Boolean).join('  •  '),
    { ...base, align: 'center', x: 0.7, y: 4.0, w: 11.9, h: 0.5, fontSize: 14, color: INK }
  );
  cover.addText(
    `${stats.hours} ${L('ساعة', 'hours')}  •  ${stats.days} ${L('أيام عمل', 'working days')}  •  ${stats.newCount} ${L('معارف جديدة', 'new learnings')}`,
    { ...base, align: 'center', x: 0.7, y: 4.7, w: 11.9, h: 0.5, fontSize: 14, color: '2A6348', bold: true }
  );

  let n = 2;
  for (const s of content.sections) {
    const slide = frame(s.heading, n++);
    const bullets: string[] = [];
    if (s.key === 'skills') {
      bullets.push(...content.newSkills.map((k) => `${L('جديد', 'New')}: ${k}`));
      bullets.push(...content.reinforcedSkills.map((k) => `${L('تعزيز', 'Reinforced')}: ${k}`));
    }
    bullets.push(...(s.items || []));

    if (s.key === 'activities' && content.activities.length) {
      const header = [L('التاريخ', 'Date'), L('المهمة', 'Task'), L('الساعات', 'Hours'), L('التصنيف', 'Learning')].map((t) => ({
        text: t,
        options: { bold: true, fill: { color: 'F1EEE6' }, color: INK }
      }));
      const rows = content.activities.slice(0, 10).map((a) => [
        { text: a.dateLabel },
        { text: a.title },
        { text: String(a.hours) },
        { text: a.learningStatus ? LEARNING_STATUS_LABELS[a.learningStatus][lang] : '—' }
      ]);
      const table = [header, ...rows].map((r) => (isAr ? [...r].reverse() : r));
      slide.addTable(table as any, {
        x: 0.7, y: 1.3, w: 11.9, fontFace, fontSize: 11, color: INK, border: { type: 'solid', pt: 0.5, color: LINE },
        colW: isAr ? [1.3, 1.6, 6.5, 2.5] : [2.5, 6.5, 1.6, 1.3], align, rtlMode: isAr
      } as any);
      continue;
    }

    const body = s.body ? s.body.replace(/\s+/g, ' ').trim() : '';
    if (body) {
      slide.addText(body.length > 900 ? `${body.slice(0, 900)}…` : body, {
        ...base, x: 0.7, y: 1.3, w: 11.9, h: bullets.length ? 2.6 : 5.4, fontSize: 15, color: INK, valign: 'top', paraSpaceAfter: 6
      });
    }
    if (bullets.length) {
      slide.addText(
        bullets.slice(0, 8).map((b) => ({ text: b.length > 160 ? `${b.slice(0, 160)}…` : b, options: { bullet: true, breakLine: true } })),
        { ...base, x: 0.7, y: body ? 4.0 : 1.3, w: 11.9, h: body ? 2.8 : 5.4, fontSize: 14, color: INK, valign: 'top' }
      );
    }
  }

  const out = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer;
  return out;
}
