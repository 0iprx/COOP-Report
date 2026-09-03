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
  InternalHyperlink,
  BorderStyle,
  Tab,
  TabStopType,
  TabStopPosition,
  LeaderType,
  TableOfContents,
  PageReference
} from 'docx';
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

export async function generateAcademicDocx(reportData: FinalReportData, lang: 'ar' | 'en' = 'ar'): Promise<Buffer> {
  const { profile, weeks, totalHours, totalDays, totalEntries } = reportData;
  const isAr = lang === 'ar';
  const entityName = profile.entityAddress || (isAr ? 'جهة التدريب التعاوني' : 'Host Training Organization');
  const courseHours = profile.courseHours || 280;
  const progressPercent = Math.min(100, Math.round((totalHours / courseHours) * 100));
  const trainingWeeksCount = profile.trainingWeeks || 14;

  const doc = new Document({
    features: {
      updateFields: true // Automatically updates Word TOC page numbers and fields on open
    },
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
                      ? `تقرير التدريب التعاوني — ${entityName}`
                      : `Co-op Training Report — ${entityName}`,
                    size: 18,
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
                    size: 18,
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
            bidirectional: isAr,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia',
                bold: true,
                size: 28,
                color: '6E6B62'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: isAr,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: profile.trainingUnit || (isAr ? 'الوحدة التدريبية / الكلية' : 'Academic Department'),
                bold: true,
                size: 26,
                color: '6E6B62'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new Bookmark({
                id: 'sec_cover',
                children: [
                  new TextRun({
                    text: isAr ? 'التقرير النهائي للتدريب التعاوني' : 'Cooperative Training Final Report',
                    bold: true,
                    size: 42,
                    color: '8B0000'
                  })
                ]
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: isAr,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: `${isAr ? 'جهة التدريب:' : 'Host Organization:'} ${entityName}`,
                bold: true,
                size: 30,
                color: '1B1B18'
              })
            ]
          }),

          // Cover Metadata Table
          createMetaTable(profile, totalHours, totalDays, totalEntries, courseHours, progressPercent, isAr),

          // ==========================================
          // TABLE OF CONTENTS (EXACT IMAGE FORMAT WITH DOTTED LEADERS & CLICKABLE HYPERLINKS)
          // ==========================================
          new Paragraph({
            pageBreakBefore: true,
            alignment: AlignmentType.CENTER,
            bidirectional: isAr,
            spacing: { before: 300, after: 300 },
            children: [
              new Bookmark({
                id: 'sec_toc',
                children: [
                  new TextRun({
                    text: isAr ? 'فهرس المحتويات (Table of Contents)' : 'Table of Contents',
                    bold: true,
                    size: 38,
                    color: '8B0000'
                  })
                ]
              })
            ]
          }),

          // TOC Header line (Title on right, Page on left)
          new Paragraph({
            bidirectional: isAr,
            spacing: { before: 100, after: 150 },
            tabStops: [{ type: isAr ? TabStopType.LEFT : TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
              new TextRun({ text: isAr ? 'المحتوى / الموضوع' : 'Chapter & Topic', bold: true, size: 22, color: '6E6B62' }),
              new TextRun({ children: [new Tab()] }),
              new TextRun({ text: isAr ? 'الصفحة' : 'Page', bold: true, size: 22, color: '6E6B62' })
            ]
          }),

          // Abstract & Acknowledgment
          createTOCDottedItem('sec_cover', isAr ? 'صفحة الغلاف والبيانات الأساسية' : 'Cover Page & Student Info', isAr),
          createTOCDottedItem('sec_toc', isAr ? 'فهرس المحتويات' : 'Table of Contents', isAr),

          // Chapter 1: Introduction
          createTOCChapterItem('chap_intro', isAr ? 'الفصل الأول: المقدمة وأهداف التدريب وبيانات المقرر' : 'CHAPTER 1: INTRODUCTION & OBJECTIVES', isAr),
          createTOCSubItem('sec_intro_obj', isAr ? '1.1 أهداف التدريب التعاوني ودوافعه الأكاديمية' : '1.1 Objectives & Academic Motivations', isAr),
          createTOCSubItem('sec_intro_req', isAr ? `1.2 متطلبات المقرر وساعات التدريب (${courseHours} ساعة)` : `1.2 Course Hours & Framework (${courseHours} hrs)`, isAr),

          // Chapter 2: Host Organization
          createTOCChapterItem('chap_org', isAr ? `الفصل الثاني: التعريف بجهة التدريب (${entityName})` : `CHAPTER 2: TRAINING ORGANIZATION (${entityName})`, isAr),
          createTOCSubItem('sec_org_about', isAr ? '2.1 نبذة عن جهة التدريب وهيكلها الإداري' : '2.1 Host Organization & Department', isAr),
          createTOCSubItem('sec_org_plan', isAr ? `2.2 الخطة المعتمدة للتدريب (${trainingWeeksCount} أسبوعاً)` : `2.2 Approved COOP Plan (${trainingWeeksCount} Weeks)`, isAr),

          // Chapter 3: Weekly Training Timeline (All 14 Weeks)
          createTOCChapterItem('chap_timeline', isAr ? `الفصل الثالث: السجل الزمني والتفصيلي للأسابيع التدريبية (${trainingWeeksCount} أسبوعاً)` : `CHAPTER 3: WEEKLY TRAINING TIMELINE (${trainingWeeksCount} WEEKS)`, isAr),

          // Dynamic Entries for each week from 1 to 14
          ...weeks.map((w) => {
            const weekTaskSnippet = w.entries && w.entries.length > 0
              ? w.entries[0].title
              : (isAr ? 'أسبوع تدريبي مؤجل / متاح للتوثيق لاحقاً' : 'Postponed / Available for Logging');
            const weekFullTitle = isAr
              ? `الأسبوع ${w.weekIndex} (${w.weekStart} إلى ${w.weekEnd}): ${weekTaskSnippet}`
              : `Week ${w.weekIndex} (${w.weekStart} to ${w.weekEnd}): ${weekTaskSnippet}`;
            return createTOCWeekItem(`week_${w.weekIndex}`, weekFullTitle, isAr);
          }),

          // Chapter 4: Acquired Skills
          createTOCChapterItem('chap_skills', isAr ? 'الفصل الرابع: المعارف والمهارات والخبرات المكتسبة' : 'CHAPTER 4: ACQUIRED KNOWLEDGE & SKILLS', isAr),
          createTOCSubItem('sec_skills_tech', isAr ? '4.1 المهارات التقنية والبرمجية والتطبيقية' : '4.1 Technical & Practical Competencies', isAr),
          createTOCSubItem('sec_skills_soft', isAr ? '4.2 مهارات التواصل المؤسسي والانضباط المهني' : '4.2 Professional Discipline & Teamwork', isAr),

          // Chapter 5: Conclusions & Recommendations
          createTOCChapterItem('chap_conclusion', isAr ? 'الفصل الخامس: الخاتمة والتوصيات العامة' : 'CHAPTER 5: CONCLUSIONS & RECOMMENDATIONS', isAr),

          // Appendices
          createTOCChapterItem('chap_appendix_a', isAr ? 'الملاحق: استمارة تقييم واعتماد المشرف الميداني' : 'APPENDIX A: FIELD SUPERVISOR EVALUATION', isAr),
          createTOCChapterItem('chap_appendix_b', isAr ? 'الملاحق: اعتماد المشرف الأكاديمي وسجل الحضور' : 'APPENDIX B: ACADEMIC APPROVAL & ATTENDANCE', isAr),

          // ==========================================
          // CHAPTER 1: INTRODUCTION & OBJECTIVES
          // ==========================================
          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new Bookmark({
                id: 'chap_intro',
                children: [
                  new TextRun({
                    text: isAr ? 'الفصل الأول: المقدمة وأهداف التدريب وبيانات المقرر' : 'CHAPTER 1: INTRODUCTION & OBJECTIVES',
                    bold: true,
                    size: 32,
                    color: '8B0000'
                  })
                ]
              })
            ]
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            bidirectional: isAr,
            spacing: { before: 200, after: 100 },
            children: [
              new Bookmark({
                id: 'sec_intro_obj',
                children: [
                  new TextRun({
                    text: isAr ? '1.1 أهداف التدريب التعاوني ودوافعه الأكاديمية' : '1.1 Objectives & Academic Motivations',
                    bold: true,
                    size: 26,
                    color: '2F6B4F'
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
                  ? 'يمثّل التدريب التعاوني متطلباً أكاديمياً محورياً يسعى إلى تجسير الفجوة بين المقررات الدراسية النظرية ومتطلبات سوق العمل الفعلية...'
                  : 'Cooperative training serves as a fundamental academic component aimed at bridging theoretical knowledge with practical industry practices...')
              })
            ]
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            bidirectional: isAr,
            spacing: { before: 300, after: 100 },
            children: [
              new Bookmark({
                id: 'sec_intro_req',
                children: [
                  new TextRun({
                    text: isAr ? `1.2 متطلبات المقرر وساعات التدريب المعتمدة (${courseHours} ساعة)` : `1.2 Course Hours & Requirements (${courseHours} hrs)`,
                    bold: true,
                    size: 26,
                    color: '2F6B4F'
                  })
                ]
              })
            ]
          }),
          createCourseHoursBox(courseHours, totalHours, progressPercent, trainingWeeksCount, profile.startDate, isAr),

          // ==========================================
          // CHAPTER 2: HOST ORGANIZATION
          // ==========================================
          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new Bookmark({
                id: 'chap_org',
                children: [
                  new TextRun({
                    text: isAr ? `الفصل الثاني: التعريف بجهة التدريب (${entityName})` : `CHAPTER 2: TRAINING ORGANIZATION (${entityName})`,
                    bold: true,
                    size: 32,
                    color: '8B0000'
                  })
                ]
              })
            ]
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            bidirectional: isAr,
            spacing: { before: 200, after: 100 },
            children: [
              new Bookmark({
                id: 'sec_org_about',
                children: [
                  new TextRun({
                    text: isAr ? '2.1 نبذة عن جهة التدريب وهيكلها الإداري' : '2.1 Host Organization & Structure',
                    bold: true,
                    size: 26,
                    color: '2F6B4F'
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
                  ? `تُعد ${entityName} من المؤسسات الرائدة التي تتيح للمتدربين بيئة عمل تقنية متكاملة تدعم الابتكار والتطوير المستمر...`
                  : `${entityName} is a prestigious professional organization providing trainees with comprehensive exposure to modern systems...`)
              })
            ]
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            bidirectional: isAr,
            spacing: { before: 300, after: 100 },
            children: [
              new Bookmark({
                id: 'sec_org_plan',
                children: [
                  new TextRun({
                    text: isAr ? `2.2 الخطة المعتمدة ومسؤوليات التدريب (${trainingWeeksCount} أسبوعاً)` : `2.2 Approved Plan & Responsibilities (${trainingWeeksCount} Weeks)`,
                    bold: true,
                    size: 26,
                    color: '2F6B4F'
                  })
                ]
              })
            ]
          }),
          createOrgOverviewCard(profile, isAr),

          // ==========================================
          // CHAPTER 3: WEEKLY TRAINING TIMELINE (14 WEEKS)
          // ==========================================
          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new Bookmark({
                id: 'chap_timeline',
                children: [
                  new TextRun({
                    text: isAr
                      ? `الفصل الثالث: الخطة والسجل التفصيلي للأسابيع التدريبية (${trainingWeeksCount} أسبوعاً)`
                      : `CHAPTER 3: WEEKLY TRAINING TIMELINE (${trainingWeeksCount} WEEKS)`,
                    bold: true,
                    size: 32,
                    color: '8B0000'
                  })
                ]
              })
            ]
          }),

          // Each week on its own distinct page with individual bookmarks and supervisor sign-off!
          ...weeks.flatMap((w) => [
            new Paragraph({
              pageBreakBefore: true,
              heading: HeadingLevel.HEADING_2,
              bidirectional: isAr,
              spacing: { before: 300, after: 150 },
              children: [
                new Bookmark({
                  id: `week_${w.weekIndex}`,
                  children: [
                    new TextRun({
                      text: isAr
                        ? `الأسبوع ${w.weekIndex}: الفترة من ${w.weekStart} إلى ${w.weekEnd}`
                        : `Week ${w.weekIndex}: From ${w.weekStart} to ${w.weekEnd}`,
                      bold: true,
                      size: 28,
                      color: '2F6B4F'
                    })
                  ]
                })
              ]
            }),

            // Week Summary Stat Card
            createWeekStatBanner(w, courseHours, isAr),

            // Week Detailed Entries Table
            createWeekEntriesTable(w.entries, isAr),

            // Week Supervisor Review & Sign-Off Box
            createSupervisorWeekSignoff(profile.responsibleName, isAr)
          ]),

          // ==========================================
          // CHAPTER 4: ACQUIRED KNOWLEDGE & SKILLS
          // ==========================================
          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new Bookmark({
                id: 'chap_skills',
                children: [
                  new TextRun({
                    text: isAr ? 'الفصل الرابع: المعارف والمهارات والخبرات المكتسبة' : 'CHAPTER 4: ACQUIRED KNOWLEDGE & SKILLS',
                    bold: true,
                    size: 32,
                    color: '8B0000'
                  })
                ]
              })
            ]
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            bidirectional: isAr,
            spacing: { before: 200, after: 100 },
            children: [
              new Bookmark({
                id: 'sec_skills_tech',
                children: [
                  new TextRun({
                    text: isAr ? '4.1 المهارات التقنية والبرمجية والتطبيقية' : '4.1 Technical & Practical Competencies',
                    bold: true,
                    size: 26,
                    color: '2F6B4F'
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
                  ? 'خلال فترة التدريب التعاوني، تم اكتساب وتطبيق مهارات هندسية وتقنية متقدمة تشمل تحليل الأنظمة وتكوين الشبكات وحل المشكلات الفنية...'
                  : 'Throughout the cooperative training period, advanced competencies in systems analysis, networking configuration, and troubleshooting were applied...')
              })
            ]
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            bidirectional: isAr,
            spacing: { before: 200, after: 100 },
            children: [
              new Bookmark({
                id: 'sec_skills_soft',
                children: [
                  new TextRun({
                    text: isAr ? '4.2 مهارات التواصل المؤسسي والانضباط المهني' : '4.2 Professional Discipline & Teamwork',
                    bold: true,
                    size: 26,
                    color: '2F6B4F'
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
                text: isAr
                  ? 'تم صقل مهارات العمل ضمن فرق متعددة التخصصات، الالتزام بمواعيد التسليم، إعداد التقارير الفنية الموجزة، والتواصل المؤسسي الفعال.'
                  : 'Key soft skills were refined including working in cross-functional teams, adherence to project deadlines, preparing technical reports, and effective communication.'
              })
            ]
          }),

          // ==========================================
          // CHAPTER 5: CONCLUSIONS & RECOMMENDATIONS
          // ==========================================
          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new Bookmark({
                id: 'chap_conclusion',
                children: [
                  new TextRun({
                    text: isAr ? 'الفصل الخامس: الخاتمة والتوصيات العامة' : 'CHAPTER 5: CONCLUSIONS & RECOMMENDATIONS',
                    bold: true,
                    size: 32,
                    color: '8B0000'
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
                  ? 'في ختام هذا التقرير، نرفع أسمى آيات الشكر لجهة التدريب والمشرفين الأكاديميين والميدانيين على ما قدموه من توجيه ودعم مستمر أثمر في صقل الجاهزية لسوق العمل.'
                  : 'In conclusion, highest appreciation is extended to the training organization and academic supervisors for their guidance and mentorship throughout the training period.')
              })
            ]
          }),

          // ==========================================
          // APPENDICES: SUPERVISOR FINAL APPROVAL
          // ==========================================
          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new Bookmark({
                id: 'chap_appendix_a',
                children: [
                  new TextRun({
                    text: isAr ? 'ملحق أ: استمارة تقييم واعتماد المشرف الميداني' : 'APPENDIX A: FIELD SUPERVISOR EVALUATION',
                    bold: true,
                    size: 32,
                    color: '8B0000'
                  })
                ]
              })
            ]
          }),
          createFinalApprovalTable(profile, totalHours, courseHours, isAr),

          new Paragraph({
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
            bidirectional: isAr,
            spacing: { before: 400, after: 200 },
            children: [
              new Bookmark({
                id: 'chap_appendix_b',
                children: [
                  new TextRun({
                    text: isAr ? 'ملحق ب: اعتماد المشرف الأكاديمي وسجل الحضور والالتزام' : 'APPENDIX B: ACADEMIC APPROVAL & ATTENDANCE',
                    bold: true,
                    size: 32,
                    color: '8B0000'
                  })
                ]
              })
            ]
          }),
          createAcademicSignoffTable(profile, totalHours, courseHours, totalDays, isAr)
        ]
      }
    ]
  });

  return await Packer.toBuffer(doc);
}

// ────────────────────────────────────────────────────────────
// TOC Items with Dotted Leaders & Dynamic PageReference (calculates exact text dimensions in Word)
// ────────────────────────────────────────────────────────────
function createTOCChapterItem(anchorId: string, title: string, isAr: boolean): Paragraph {
  return new Paragraph({
    bidirectional: isAr,
    spacing: { before: 120, after: 60 },
    tabStops: [
      {
        type: isAr ? TabStopType.LEFT : TabStopType.RIGHT,
        position: TabStopPosition.MAX,
        leader: LeaderType.DOT
      }
    ],
    children: [
      new InternalHyperlink({
        anchor: anchorId,
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 24,
            color: '8B0000'
          })
        ]
      }),
      new TextRun({ children: [new Tab()] }),
      new PageReference(anchorId)
    ]
  });
}

function createTOCSubItem(anchorId: string, title: string, isAr: boolean): Paragraph {
  return new Paragraph({
    bidirectional: isAr,
    indent: { [isAr ? 'right' : 'left']: 360 },
    spacing: { before: 40, after: 40 },
    tabStops: [
      {
        type: isAr ? TabStopType.LEFT : TabStopType.RIGHT,
        position: TabStopPosition.MAX,
        leader: LeaderType.DOT
      }
    ],
    children: [
      new InternalHyperlink({
        anchor: anchorId,
        children: [
          new TextRun({
            text: title,
            size: 22,
            color: '1B1B18'
          })
        ]
      }),
      new TextRun({ children: [new Tab()] }),
      new PageReference(anchorId)
    ]
  });
}

function createTOCWeekItem(anchorId: string, title: string, isAr: boolean): Paragraph {
  return new Paragraph({
    bidirectional: isAr,
    indent: { [isAr ? 'right' : 'left']: 480 },
    spacing: { before: 40, after: 40 },
    tabStops: [
      {
        type: isAr ? TabStopType.LEFT : TabStopType.RIGHT,
        position: TabStopPosition.MAX,
        leader: LeaderType.DOT
      }
    ],
    children: [
      new InternalHyperlink({
        anchor: anchorId,
        children: [
          new TextRun({
            text: `• ${title}`,
            size: 21,
            color: '2F6B4F'
          })
        ]
      }),
      new TextRun({ children: [new Tab()] }),
      new PageReference(anchorId)
    ]
  });
}

function createTOCDottedItem(anchorId: string, title: string, isAr: boolean): Paragraph {
  return new Paragraph({
    bidirectional: isAr,
    spacing: { before: 80, after: 80 },
    tabStops: [
      {
        type: isAr ? TabStopType.LEFT : TabStopType.RIGHT,
        position: TabStopPosition.MAX,
        leader: LeaderType.DOT
      }
    ],
    children: [
      new InternalHyperlink({
        anchor: anchorId,
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 23,
            color: '1B1B18'
          })
        ]
      }),
      new TextRun({ children: [new Tab()] }),
      new PageReference(anchorId)
    ]
  });
}

// ────────────────────────────────────────────────────────────
// Tables & Structural Blocks
// ────────────────────────────────────────────────────────────
function createMetaTable(
  p: FinalReportData['profile'],
  totalHours: number,
  totalDays: number,
  totalEntries: number,
  courseHours: number,
  progressPercent: number,
  isAr: boolean
): Table {
  const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: 'E6E2D8' };
  const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

  const metaRows = [
    [isAr ? 'اسم المتدرب' : 'Trainee Name', p.studentName || '—'],
    [isAr ? 'الرقم التدريبي / الأكاديمي' : 'Training ID', p.trainingNumber || '—'],
    [isAr ? 'القسم / التخصص' : 'Department', p.department || '—'],
    [isAr ? 'المشرف الأكاديمي' : 'Academic Supervisor', p.supervisorName || '—'],
    [isAr ? 'المشرف الميداني بالجهة' : 'Field Supervisor', p.responsibleName || '—'],
    [isAr ? 'عنوان جهة التدريب' : 'Host Organization', p.entityAddress || '—'],
    [isAr ? 'ساعات المقرر المطلوبة' : 'Required Course Hours', `${courseHours} ${isAr ? 'ساعة' : 'hrs'}`],
    [
      isAr ? 'إجمالي الساعات المنجزة' : 'Total Logged Hours',
      `${totalHours} ${isAr ? 'ساعة معتمدة' : 'hrs'} (${progressPercent}% ${isAr ? 'من المقرر' : 'completed'})`
    ],
    [isAr ? 'مدة التدريب المعتمدة' : 'Training Weeks', `${p.trainingWeeks || 14} ${isAr ? 'أسبوعاً' : 'weeks'}`]
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: metaRows.map(
      ([label, val]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              borders,
              children: [
                new Paragraph({
                  bidirectional: isAr,
                  children: [new TextRun({ text: label, bold: true, size: 24, color: '6E6B62' })]
                })
              ]
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders,
              children: [
                new Paragraph({
                  bidirectional: isAr,
                  children: [new TextRun({ text: val, size: 24, bold: true, color: '1B1B18' })]
                })
              ]
            })
          ]
        })
    )
  });
}

function createCourseHoursBox(
  courseHours: number,
  totalHours: number,
  progressPercent: number,
  weeksCount: number,
  startDate: string,
  isAr: boolean
): Table {
  const cellBorder = { style: BorderStyle.SINGLE, size: 6, color: '8B0000' };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
            children: [
              new Paragraph({
                bidirectional: isAr,
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 60 },
                children: [
                  new TextRun({
                    text: isAr ? 'متطلبات وإحصائيات مقرر التدريب التعاوني' : 'Course Requirements & Progress Summary',
                    bold: true,
                    size: 26,
                    color: '8B0000'
                  })
                ]
              }),
              new Paragraph({
                bidirectional: isAr,
                alignment: AlignmentType.CENTER,
                spacing: { before: 60, after: 120 },
                children: [
                  new TextRun({
                    text: isAr
                      ? `ساعات المقرر المطلوبة: ${courseHours} ساعة  |  الساعات المنجزة: ${totalHours} ساعة (${progressPercent}%)  |  الخطة: ${weeksCount} أسبوعاً  |  البداية: ${startDate || 'حسب التقويم'}`
                      : `Required: ${courseHours} hrs  |  Completed: ${totalHours} hrs (${progressPercent}%)  |  Plan: ${weeksCount} Weeks  |  Start: ${startDate || 'As Scheduled'}`,
                    size: 22,
                    bold: true,
                    color: '2F6B4F'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function createOrgOverviewCard(p: FinalReportData['profile'], isAr: boolean): Table {
  const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: 'E6E2D8' };
  const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            children: [
              new Paragraph({
                bidirectional: isAr,
                children: [
                  new TextRun({
                    text: isAr
                      ? `المقر: ${p.entityAddress || '—'}  |  عدد الموظفين: ${p.employeesCount || '—'}  |  المشرف الميداني: ${p.responsibleName || '—'}`
                      : `Location: ${p.entityAddress || '—'}  |  Employees: ${p.employeesCount || '—'}  |  Supervisor: ${p.responsibleName || '—'}`,
                    size: 22,
                    color: '1B1B18'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function createWeekStatBanner(
  w: FinalReportData['weeks'][0],
  courseHours: number,
  isAr: boolean
): Table {
  const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: 'E6E2D8' };
  const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
  const hasEntries = w.entries && w.entries.length > 0;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            children: [
              new Paragraph({
                bidirectional: isAr,
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: isAr
                      ? `ساعات الأسبوع: ${w.totalHours} ساعة  |  أيام العمل: ${w.totalDays} أيام  |  المهام: ${w.entries.length} مهام  |  الحالة: ${hasEntries ? 'منجز ومعتمد' : 'أسبوع تدريبي مؤجل / متاح للتوثيق لاحقاً'}`
                      : `Week Hours: ${w.totalHours} hrs  |  Active Days: ${w.totalDays}  |  Tasks: ${w.entries.length}  |  Status: ${hasEntries ? 'Completed' : 'Postponed / Available for Update'}`,
                    size: 22,
                    bold: true,
                    color: hasEntries ? '2F6B4F' : 'B45309'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
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
        children: [new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: isAr ? 'المهمة / التصنيف' : 'Task / Category', bold: true, size: 22 })] })]
      }),
      new TableCell({
        width: { size: 14, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: isAr ? 'الفترة' : 'Time', bold: true, size: 22 })] })]
      }),
      new TableCell({
        width: { size: 44, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: isAr ? 'التفاصيل والتوثيق الأكاديمي' : 'Details & Description', bold: true, size: 22 })] })]
      })
    ]
  });

  const rows = entries.length > 0
    ? entries.map(
        (e) =>
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: isAr ? formatDateArabic(e.entryDate) : formatDateEnglish(e.entryDate), size: 20 })] })]
              }),
              new TableCell({
                children: [
                  new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: e.title, bold: true, size: 20 })] }),
                  new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: `[${translateCategory(e.category, isAr)}]`, size: 18, color: '8B0000' })] })
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
      )
    : [
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 4,
              children: [
                new Paragraph({
                  bidirectional: isAr,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 180, after: 180 },
                  children: [
                    new TextRun({
                      text: isAr
                        ? 'أسبوع تدريبي مؤجل أو لم تسجل به مهام بعد — متاح للتوثيق والاستكمال في أي وقت لاحق'
                        : 'Postponed or pending training week — available for updates and logging anytime',
                      italics: true,
                      size: 22,
                      color: '888888'
                    })
                  ]
                })
              ]
            })
          ]
        })
      ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...rows]
  });
}

function createSupervisorWeekSignoff(supervisorName: string, isAr: boolean): Table {
  const cellBorder = { style: BorderStyle.DOTTED, size: 4, color: 'C8C4BA' };
  const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            children: [
              new Paragraph({
                bidirectional: isAr,
                children: [
                  new TextRun({
                    text: isAr
                      ? `اعتماد المشرف الميداني (${supervisorName || '....................'})  |  التقييم الأسبوعي: [  ] ممتاز  [  ] جيد جداً  [  ] جيد  |  التوقيع: ....................`
                      : `Supervisor Sign-off (${supervisorName || '....................'})  |  Rating: [  ] Excellent  [  ] Very Good  [  ] Good  |  Signature: ....................`,
                    size: 20,
                    color: '6E6B62'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function createFinalApprovalTable(
  p: FinalReportData['profile'],
  totalHours: number,
  courseHours: number,
  isAr: boolean
): Table {
  const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: '1B1B18' };
  const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 100, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                bidirectional: isAr,
                children: [new TextRun({ text: isAr ? 'اعتماد وتقييم المشرف الميداني بالجهة:' : 'Field Supervisor Final Evaluation:', bold: true, size: 24 })]
              }),
              new Paragraph({
                bidirectional: isAr,
                spacing: { before: 100 },
                children: [new TextRun({ text: `${isAr ? 'اسم المشرف الميداني:' : 'Field Supervisor:'} ${p.responsibleName || '....................'}`, size: 22 })]
              }),
              new Paragraph({
                bidirectional: isAr,
                spacing: { before: 100 },
                children: [new TextRun({ text: `${isAr ? 'الساعات المعتمدة المنجزة:' : 'Approved Hours:'} ${totalHours} / ${courseHours} ${isAr ? 'ساعة' : 'hrs'}`, size: 22 })]
              }),
              new Paragraph({
                bidirectional: isAr,
                spacing: { before: 100 },
                children: [new TextRun({ text: isAr ? 'التقييم العام للمتدرب: [  ] ممتاز  [  ] جيد جداً  [  ] جيد' : 'Overall Performance: [  ] Excellent  [  ] Very Good  [  ] Good', size: 22 })]
              }),
              new Paragraph({
                bidirectional: isAr,
                spacing: { before: 120 },
                children: [new TextRun({ text: isAr ? 'التوقيع والختم الرسمي: ........................................' : 'Official Stamp & Signature: ........................................', size: 22 })]
              })
            ]
          })
        ]
      })
    ]
  });
}

function createAcademicSignoffTable(
  p: FinalReportData['profile'],
  totalHours: number,
  courseHours: number,
  totalDays: number,
  isAr: boolean
): Table {
  const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: '1B1B18' };
  const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 100, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                bidirectional: isAr,
                children: [new TextRun({ text: isAr ? 'اعتماد المشرف الأكاديمي (الكلية / الجامعة):' : 'Academic Supervisor Final Grade:', bold: true, size: 24 })]
              }),
              new Paragraph({
                bidirectional: isAr,
                spacing: { before: 100 },
                children: [new TextRun({ text: `${isAr ? 'اسم المشرف الأكاديمي:' : 'Academic Supervisor:'} ${p.supervisorName || '....................'}`, size: 22 })]
              }),
              new Paragraph({
                bidirectional: isAr,
                spacing: { before: 100 },
                children: [new TextRun({ text: `${isAr ? 'إجمالي أيام النشاط الموثقة:' : 'Total Verified Days:'} ${totalDays} ${isAr ? 'يوماً' : 'days'}`, size: 22 })]
              }),
              new Paragraph({
                bidirectional: isAr,
                spacing: { before: 100 },
                children: [new TextRun({ text: `${isAr ? 'الدرجة والتقدير الأكاديمي النهائي:' : 'Final Academic Grade:'} ....................`, size: 22 })]
              }),
              new Paragraph({
                bidirectional: isAr,
                spacing: { before: 120 },
                children: [new TextRun({ text: isAr ? 'التوقيع والختم: ........................................' : 'Signature & Stamp: ........................................', size: 22 })]
              })
            ]
          })
        ]
      })
    ]
  });
}
