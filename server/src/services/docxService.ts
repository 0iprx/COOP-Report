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
  Header,
  Footer,
  PageNumber,
  Bookmark,
  InternalHyperlink
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
            size: 28, // 14pt standard academic
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
              top: 1417, // 2.5 cm standard margins
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
                      ? 'سجل التدريب التعاوني — شركة هواوي السعودية (Huawei Tech Saudi)'
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
          // ==========================================
          // COVER PAGE
          // ==========================================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 200 },
            bidirectional: isAr,
            children: [
              new Bookmark({
                id: 'sec_cover',
                children: [
                  new TextRun({
                    text: isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia',
                    bold: true,
                    size: 32,
                    color: '1B1B18'
                  })
                ]
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
            bidirectional: isAr,
            children: [
              new TextRun({
                text: profile.trainingUnit || (isAr ? 'الوحدة التدريبية / الكلية' : 'Academic Training Institution'),
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
                  ? 'التقرير النهائي للتدريب التعاوني (Co-op Final Report)'
                  : 'Cooperative Training Final Academic Report',
                bold: true,
                size: 40,
                color: 'C8102E' // Huawei Red
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 1000 },
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

          // Cover Metadata Table
          createMetaTable(profile, totalHours, totalDays, totalEntries, isAr),

          // ==========================================
          // TABLE OF CONTENTS (INTERACTIVE HYPERLINKS)
          // ==========================================
          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 300 },
            children: [
              new Bookmark({
                id: 'sec_toc',
                children: [
                  new TextRun({
                    text: isAr ? 'فهرس المحتويات (انقر للانتقال المباشر للقسم)' : 'Table of Contents (Click to Navigate)',
                    bold: true,
                    size: 34,
                    color: 'C8102E'
                  })
                ]
              })
            ]
          }),

          // TOC Links to Major Sections
          createTOCLink('sec_cover', isAr ? '• صفحة الغلاف والبيانات الرسمية' : '• Cover Page & Official Metadata', isAr),
          createTOCLink('sec_intro', isAr ? '• 1. المقدمة وأهمية التدريب التعاوني' : '• 1. Introduction & Objectives', isAr),
          createTOCLink('sec_entity', isAr ? '• 2. التعريف بجهة التدريب وطبيعة العمل (هواوي)' : '• 2. Organization Overview (Huawei)', isAr),
          createTOCLink('sec_timeline', isAr ? '• 3. الخطة والجدول الزمني للتدريب الأسبوعي' : '• 3. Training Timeline & Weekly Breakdown', isAr),

          // Dynamic TOC Links for Each Week
          ...weeks.map((w) =>
            new Paragraph({
              bidirectional: isAr,
              spacing: { before: 60, after: 60 },
              indent: { left: 720 },
              children: [
                new InternalHyperlink({
                  anchor: `week_${w.weekIndex}`,
                  children: [
                    new TextRun({
                      text: isAr
                        ? `— الأسبوع ${w.weekIndex} (${w.weekStart} إلى ${w.weekEnd}) — [${w.totalHours} ساعة]`
                        : `— Week ${w.weekIndex} (${w.weekStart} to ${w.weekEnd}) — [${w.totalHours} hrs]`,
                      size: 24,
                      color: '2F6B4F',
                      underline: {}
                    })
                  ]
                })
              ]
            })
          ),

          createTOCLink('sec_skills', isAr ? '• 4. المعارف والمهارات والتجارب المكتسبة' : '• 4. Acquired Knowledge & Technical Skills', isAr),
          createTOCLink('sec_conclusion', isAr ? '• 5. الخاتمة والتوصيات العامة' : '• 5. Conclusion & Recommendations', isAr),

          // ==========================================
          // SECTION 1: INTRODUCTION
          // ==========================================
          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new Bookmark({
                id: 'sec_intro',
                children: [
                  new TextRun({
                    text: isAr ? '1. المقدمة وأهداف التدريب التعاوني' : '1. Introduction & Training Objectives',
                    bold: true,
                    size: 32,
                    color: 'C8102E'
                  })
                ]
              })
            ]
          }),
          new Paragraph({
            bidirectional: isAr,
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: profile.introText || (isAr
                  ? 'يمثل التدريب التعاوني ركيزة جوهرية لربط المناهج والعلوم الأكاديمية بالتطبيقات العملية في سوق العمل...'
                  : 'Cooperative training represents an essential pillar bridging academic curriculum with industry applications...')
              })
            ]
          }),

          // ==========================================
          // SECTION 2: ORGANIZATION OVERVIEW
          // ==========================================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 500, after: 200 },
            children: [
              new Bookmark({
                id: 'sec_entity',
                children: [
                  new TextRun({
                    text: isAr ? '2. التعريف بجهة التدريب وطبيعة العمل' : '2. Organization Overview',
                    bold: true,
                    size: 32,
                    color: 'C8102E'
                  })
                ]
              })
            ]
          }),
          new Paragraph({
            bidirectional: isAr,
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: profile.entityIntroText || (isAr
                  ? 'تعد شركة هواوي السعودية من الشركات العالمية الرائدة في توفير البنية التحتية لتقنية المعلومات والاتصالات...'
                  : 'Huawei Tech Saudi is a leading global provider of ICT infrastructure and smart devices...')
              })
            ]
          }),

          // ==========================================
          // SECTION 3: DETAILED TIMELINE (WEEKS)
          // ==========================================
          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new Bookmark({
                id: 'sec_timeline',
                children: [
                  new TextRun({
                    text: isAr ? '3. السجل الزمني والتفصيلي للتدريب الأسبوعي' : '3. Detailed Training Timeline & Weekly Logs',
                    bold: true,
                    size: 32,
                    color: 'C8102E'
                  })
                ]
              })
            ]
          }),

          // Each week on its own distinct page with individual bookmarks!
          ...weeks.flatMap((w) => [
            new Paragraph({
              pageBreakBefore: true, // Guarantees distinct page for each week!
              heading: HeadingLevel.HEADING_2,
              bidirectional: isAr,
              spacing: { before: 300, after: 200 },
              children: [
                new Bookmark({
                  id: `week_${w.weekIndex}`,
                  children: [
                    new TextRun({
                      text: isAr
                        ? `الأسبوع ${w.weekIndex}: الفترة من ${w.weekStart} إلى ${w.weekEnd} [إجمالي: ${w.totalHours} ساعة]`
                        : `Week ${w.weekIndex}: From ${w.weekStart} to ${w.weekEnd} [Total: ${w.totalHours} hrs]`,
                      bold: true,
                      size: 28,
                      color: '2F6B4F'
                    })
                  ]
                })
              ]
            }),
            createWeekEntriesTable(w.entries, isAr)
          ]),

          // ==========================================
          // SECTION 4: SKILLS ACQUIRED
          // ==========================================
          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new Bookmark({
                id: 'sec_skills',
                children: [
                  new TextRun({
                    text: isAr ? '4. المعارف والمهارات والتجارب المكتسبة' : '4. Acquired Competencies & Technical Skills',
                    bold: true,
                    size: 32,
                    color: 'C8102E'
                  })
                ]
              })
            ]
          }),
          new Paragraph({
            bidirectional: isAr,
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: profile.skillsText || (isAr
                  ? 'خلال فترة التدريب التعاوني في بيئة عمل هواوي، تم اكتساب مهارات تقنية متقدمة...'
                  : 'Throughout the cooperative training at Huawei, advanced technical competencies were attained...')
              })
            ]
          }),

          // ==========================================
          // SECTION 5: CONCLUSION
          // ==========================================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 500, after: 200 },
            children: [
              new Bookmark({
                id: 'sec_conclusion',
                children: [
                  new TextRun({
                    text: isAr ? '5. الخاتمة والتوصيات' : '5. Conclusion & Recommendations',
                    bold: true,
                    size: 32,
                    color: 'C8102E'
                  })
                ]
              })
            ]
          }),
          new Paragraph({
            bidirectional: isAr,
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: profile.conclusionText || (isAr
                  ? 'في ختام هذا التقرير، نرفع أسمى آيات الشكر والتقدير لشركة هواوي السعودية...'
                  : 'In conclusion, I would like to express my highest gratitude to Huawei Tech Saudi...')
              })
            ]
          })
        ]
      }
    ]
  });

  return await Packer.toBuffer(doc);
}

function createTOCLink(anchorId: string, title: string, isAr: boolean): Paragraph {
  return new Paragraph({
    bidirectional: isAr,
    spacing: { before: 80, after: 80 },
    children: [
      new InternalHyperlink({
        anchor: anchorId,
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 26,
            color: '1B1B18',
            underline: {}
          })
        ]
      })
    ]
  });
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
    [isAr ? 'إجمالي الساعات المعتمدة' : 'Total Certified Hours', `${totalHours} ${isAr ? 'ساعة' : 'hours'}`],
    [isAr ? 'إجمالي أيام العمل الفعلي' : 'Total Work Days', `${totalDays} ${isAr ? 'يوم' : 'days'}`],
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
    (e) =>
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
