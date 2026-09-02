import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat
} from 'docx';
import { FinalReportData, formatDateArabic } from '@coop/shared';

export async function generateAcademicDocx(reportData: FinalReportData, lang: 'ar' | 'en' = 'ar'): Promise<Buffer> {
  const { profile, weeks, totalHours, totalDays, totalEntries } = reportData;
  const isAr = lang === 'ar';

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: isAr ? 'Traditional Arabic' : 'Times New Roman',
            size: 28, // 14pt
            color: '1B1B18'
          },
          paragraph: {
            spacing: {
              line: 360, // 1.5 line spacing
              before: 120,
              after: 120
            }
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1417, // ~2.5 cm
              bottom: 1417,
              left: 1417,
              right: 1417
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
                bidirectional: isAr,
                children: [
                  new TextRun({
                    text: isAr
                      ? 'سجل التدريب التعاوني — شركة هواوي السعودية'
                      : 'Co-op Training Report — Huawei Tech Saudi',
                    size: 20,
                    color: '6E6B62'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [
                      isAr ? 'صفحة ' : 'Page ',
                      PageNumber.CURRENT,
                      isAr ? ' من ' : ' of ',
                      PageNumber.TOTAL_PAGES
                    ],
                    size: 20,
                    color: '6E6B62'
                  })
                ]
              })
            ]
          })
        },
        children: [
          // 1. Cover Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 300 },
            bidirectional: isAr,
            children: [
              new TextRun({
                text: isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia',
                bold: true,
                size: 32,
                color: '1B1B18'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
            bidirectional: isAr,
            children: [
              new TextRun({
                text: isAr ? (profile.trainingUnit || 'الوحدة التدريبية / الكلية') : (profile.trainingUnit || 'Training Institution'),
                bold: true,
                size: 28,
                color: '6E6B62'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 400 },
            bidirectional: isAr,
            children: [
              new TextRun({
                text: isAr
                  ? 'التقرير النهائي للتدريب التعاوني (Co-op Report)'
                  : 'Cooperative Training Final Report (Co-op)',
                bold: true,
                size: 40,
                color: 'C8102E' // Huawei Red
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 1200 },
            bidirectional: isAr,
            children: [
              new TextRun({
                text: isAr
                  ? 'جهة التدريب: شركة هواوي السعودية (Huawei Tech Saudi)'
                  : 'Host Organization: Huawei Tech Saudi',
                bold: true,
                size: 30,
                color: '1B1B18'
              })
            ]
          }),

          // Cover Meta Table
          createMetaTable(profile, totalHours, totalDays, totalEntries, isAr),

          // Page Break to Table of Contents
          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            children: [
              new TextRun({
                text: isAr ? 'فهرس المحتويات (Table of Contents)' : 'Table of Contents',
                bold: true,
                size: 34,
                color: 'C8102E'
              })
            ]
          }),
          new Paragraph({
            bidirectional: isAr,
            spacing: { after: 100 },
            children: [new TextRun({ text: isAr ? '1. المقدمة وأهمية التدريب التعاوني' : '1. Introduction', bold: true })]
          }),
          new Paragraph({
            bidirectional: isAr,
            spacing: { after: 100 },
            children: [new TextRun({ text: isAr ? '2. التعريف بجهة التدريب وطبيعة العمل (هواوي)' : '2. Organization Overview (Huawei)', bold: true })]
          }),
          new Paragraph({
            bidirectional: isAr,
            spacing: { after: 100 },
            children: [new TextRun({ text: isAr ? '3. الخطة والجدول الزمني للتدريب الأسبوعي' : '3. Training Timeline & Weekly Breakdown', bold: true })]
          }),
          ...weeks.map(
            w =>
              new Paragraph({
                bidirectional: isAr,
                spacing: { after: 60 },
                indent: { left: 720 },
                children: [
                  new TextRun({
                    text: isAr
                      ? `— الأسبوع ${w.weekIndex}: ${w.weekStart} إلى ${w.weekEnd} (${w.totalHours} ساعة)`
                      : `— Week ${w.weekIndex}: ${w.weekStart} to ${w.weekEnd} (${w.totalHours} hrs)`,
                    size: 24,
                    color: '6E6B62'
                  })
                ]
              })
          ),
          new Paragraph({
            bidirectional: isAr,
            spacing: { after: 100 },
            children: [new TextRun({ text: isAr ? '4. المعارف والمهارات والتجارب المكتسبة' : '4. Acquired Skills & Technical Competencies', bold: true })]
          }),
          new Paragraph({
            bidirectional: isAr,
            spacing: { after: 400 },
            children: [new TextRun({ text: isAr ? '5. الخ خاتمة والتوصيات' : '5. Conclusion & Recommendations', bold: true })]
          }),

          // Section 1: Introduction
          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 300, after: 200 },
            children: [
              new TextRun({
                text: isAr ? '1. المقدمة وأهداف التدريب' : '1. Introduction & Training Objectives',
                bold: true,
                size: 32,
                color: 'C8102E'
              })
            ]
          }),
          new Paragraph({
            bidirectional: isAr,
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: profile.introText || (isAr
                  ? 'يمثل التدريب التعاوني ركيزة أساسية لربط المناهج والعلوم الأكاديمية بالتطبيقات العملية في سوق العمل...'
                  : 'Cooperative training represents an essential pillar bridging academic curriculum with industry standards...')
              })
            ]
          }),

          // Section 2: Organization Overview
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: isAr ? '2. التعريف بجهة التدريب وطبيعة العمل' : '2. Organization Overview',
                bold: true,
                size: 32,
                color: 'C8102E'
              })
            ]
          }),
          new Paragraph({
            bidirectional: isAr,
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: profile.entityIntroText || (isAr
                  ? 'تعد شركة هواوي من الشركات العالمية الرائدة في توفير البنية التحتية لتقنية المعلومات والاتصالات...'
                  : 'Huawei is a leading global provider of information and communications technology (ICT) infrastructure...')
              })
            ]
          }),

          // Section 3: Timeline & Weeks
          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: isAr ? '3. السجل الزمني والتفصيلي للتدريب' : '3. Detailed Training Timeline',
                bold: true,
                size: 32,
                color: 'C8102E'
              })
            ]
          }),

          ...weeks.flatMap(w => [
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              bidirectional: isAr,
              spacing: { before: 300, after: 150 },
              children: [
                new TextRun({
                  text: isAr
                    ? `الأسبوع ${w.weekIndex} (${w.weekStart} — ${w.weekEnd}) | إجمالي: ${w.totalHours} ساعة`
                    : `Week ${w.weekIndex} (${w.weekStart} — ${w.weekEnd}) | Total: ${w.totalHours} hrs`,
                  bold: true,
                  size: 28,
                  color: '2F6B4F'
                })
              ]
            }),
            createWeekEntriesTable(w.entries, isAr)
          ]),

          // Section 4: Skills
          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: isAr ? '4. المعارف والمهارات والتجارب المكتسبة' : '4. Acquired Knowledge & Competencies',
                bold: true,
                size: 32,
                color: 'C8102E'
              })
            ]
          }),
          new Paragraph({
            bidirectional: isAr,
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: profile.skillsText || (isAr
                  ? 'من خلال فترة التدريب في بيئة عمل هواوي، تم اكتساب مهارات تقنية متقدمة...'
                  : 'Through the training period at Huawei, advanced technical and professional skills were developed...')
              })
            ]
          }),

          // Section 5: Conclusion
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: isAr ? '5. الخاتمة والتوصيات' : '5. Conclusion & Recommendations',
                bold: true,
                size: 32,
                color: 'C8102E'
              })
            ]
          }),
          new Paragraph({
            bidirectional: isAr,
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: profile.conclusionText || (isAr
                  ? 'في ختام هذا التقرير، أتقدم بجزيل الشكر لشركة هواوي والكلية على إتاحة هذه الفرصة المثمرة...'
                  : 'In conclusion, I would like to express my sincere appreciation to Huawei and the academic institution...')
              })
            ]
          })
        ]
      }
    ]
  });

  return await Packer.toBuffer(doc);
}

function createMetaTable(
  p: FinalReportData['profile'],
  totalHours: number,
  totalDays: number,
  totalEntries: number,
  isAr: boolean
): Table {
  const rows = [
    [isAr ? 'اسم المتدرب' : 'Trainee Name', p.studentName || '—'],
    [isAr ? 'الرقم التدريبي / الأكاديمي' : 'Trainee ID', p.trainingNumber || '—'],
    [isAr ? 'القسم / التخصص' : 'Department', p.department || '—'],
    [isAr ? 'الوحدة التدريبية (الكلية)' : 'Training Institution', p.trainingUnit || '—'],
    [isAr ? 'المشرف الأكاديمي بالكلية' : 'Academic Supervisor', p.supervisorName || '—'],
    [isAr ? 'المسؤول عن التدريب بالجهة' : 'Field Supervisor (Huawei)', p.responsibleName || '—'],
    [isAr ? 'جهة التدريب' : 'Host Organization', p.entityAddress || 'هواوي السعودية (Huawei Tech Saudi)'],
    [isAr ? 'إجمالي الساعات المسجلة' : 'Total Certified Hours', `${totalHours} ${isAr ? 'ساعة' : 'hours'}`],
    [isAr ? 'إجمالي أيام العمل' : 'Total Work Days', `${totalDays} ${isAr ? 'يوم' : 'days'}`],
    [isAr ? 'إجمالي المهام المنجزة' : 'Total Completed Tasks', `${totalEntries}`]
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      ([label, val]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  bidirectional: isAr,
                  children: [new TextRun({ text: label, bold: true, size: 24 })]
                })
              ]
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  bidirectional: isAr,
                  children: [new TextRun({ text: val, size: 24 })]
                })
              ]
            })
          ]
        })
    )
  });
}

function createWeekEntriesTable(entries: FinalReportData['weeks'][0]['entries'], isAr: boolean): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 18, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: isAr ? 'التاريخ' : 'Date', bold: true, size: 22 })] })]
      }),
      new TableCell({
        width: { size: 24, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: isAr ? 'العنوان / التصنيف' : 'Title / Category', bold: true, size: 22 })] })]
      }),
      new TableCell({
        width: { size: 14, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: isAr ? 'الوقت' : 'Time', bold: true, size: 22 })] })]
      }),
      new TableCell({
        width: { size: 44, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: isAr ? 'تفاصيل الإنجاز والمهام' : 'Achievement & Tasks', bold: true, size: 22 })] })]
      })
    ]
  });

  const rows = entries.map(
    e =>
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: formatDateArabic(e.entryDate), size: 20 })] })]
          }),
          new TableCell({
            children: [
              new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: e.title, bold: true, size: 20 })] }),
              new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: `[${e.category}]`, size: 18, color: 'C8102E' })] })
            ]
          }),
          new TableCell({
            children: [new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: `${e.timeFrom} - ${e.timeTo}`, size: 20 })] })]
          }),
          new TableCell({
            children: [new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: e.description, size: 20 })] })]
          })
        ]
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...rows]
  });
}
