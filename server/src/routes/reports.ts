import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { buildFinalReportData } from '../services/reportService.js';
import { generateAcademicDocx, generateWeeklyDocx } from '../services/docxService.js';
import { generateStandaloneHTMLReport } from '../services/htmlReportService.js';
import { generatePresentationBuffer } from '../services/presentationService.js';
import { calculateHoursBetween, getWeekEnd, getWeekStart, inferProfessionalCategory, elevateTaskTitle, polishAcademicNarrative } from '@coop/shared';
import { rewriteEntryAcademically, processTextWithAI } from '../services/aiService.js';
import { logger } from '../logger.js';

const router = Router();
router.use(authenticate);

/**
 * Resolves the target user ID safely.
 * If a supervisor passes ?traineeId=X, verifies that trainee is linked to this supervisor.
 */
async function resolveTargetUserId(req: AuthenticatedRequest): Promise<number | null> {
  const currentUserId = req.user!.userId;
  if (!req.query.traineeId) {
    return currentUserId;
  }
  if (req.user!.role !== 'supervisor') {
    return null; // Non-supervisors cannot view other users
  }
  const traineeId = Number(req.query.traineeId);
  const trainee = await prisma.user.findFirst({
    where: { id: traineeId, supervisorId: currentUserId }
  });
  return trainee ? traineeId : null;
}

// GET /api/reports/weekly?week=YYYY-MM-DD
router.get('/weekly', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = await resolveTargetUserId(req);
    if (!targetUserId) {
      res.status(403).json({ error: 'غير مصرح لك بالوصول لبيانات هذا المتدرب' });
      return;
    }

    const weekParam = (req.query.week as string) || '';
    if (!weekParam) {
      res.status(400).json({ error: 'تاريخ بداية الأسبوع مطلوب' });
      return;
    }

    const weekStart = getWeekStart(weekParam);
    const weekEnd = getWeekEnd(weekStart);

    const entries = await prisma.entry.findMany({
      where: {
        userId: targetUserId,
        deletedAt: null,
        entryDate: {
          gte: weekStart,
          lte: weekEnd
        }
      },
      include: {
        _count: {
          select: { revisions: true }
        }
      },
      orderBy: { entryDate: 'asc' }
    });

    const totalHours = entries.reduce(
      (sum: number, e: { timeFrom: string; timeTo: string }) => sum + calculateHoursBetween(e.timeFrom, e.timeTo),
      0
    );
    const totalDays = new Set(entries.map((e: { entryDate: string }) => e.entryDate)).size;

    res.json({
      weekStart,
      weekEnd,
      totalHours: Number(totalHours.toFixed(1)),
      totalDays,
      totalTasks: entries.length,
      entries
    });
  } catch (err) {
    logger.error({ err }, 'Error in weekly report');
    res.status(500).json({ error: 'تعذر توليد التقرير الأسبوعي' });
  }
});

// POST /api/reports/weekly/audit-polish?week=YYYY-MM-DD
// Automatically elevates categories, titles, and descriptions of all tasks in the week to rigorous academic engineering standards
router.post('/weekly/audit-polish', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = await resolveTargetUserId(req);
    if (!targetUserId) {
      res.status(403).json({ error: 'غير مصرح لك بتعديل بيانات هذا المتدرب' });
      return;
    }

    let weekStart = (req.query.week as string) || (req.body.week as string);
    if (!weekStart) {
      const latest = await prisma.entry.findFirst({
        where: { userId: targetUserId, deletedAt: null },
        orderBy: { entryDate: 'desc' }
      });
      weekStart = latest ? getWeekStart(latest.entryDate) : getWeekStart(new Date().toISOString().split('T')[0]);
    }
    const weekEnd = getWeekEnd(weekStart);

    const entries = await prisma.entry.findMany({
      where: {
        userId: targetUserId,
        deletedAt: null,
        entryDate: {
          gte: weekStart,
          lte: weekEnd
        }
      },
      orderBy: { entryDate: 'asc' }
    });

    if (entries.length === 0) {
      res.status(400).json({ error: 'لا توجد مهام مسجلة في هذا الأسبوع للتدقيق' });
      return;
    }

    const userApiKey = (req.headers['x-gemini-key'] as string) || (req.body as any)?.apiKey || (req.query.apiKey as string);
    const userModel = (req.headers['x-ai-model'] as string) || (req.body as any)?.model;

    const updatedList = [];

    for (const entry of entries) {
      // Archive previous version to entryRevision before upgrading (Zero Data Loss Guarantee)
      try {
        await prisma.entryRevision.create({
          data: {
            entryId: entry.id,
            title: entry.title,
            category: entry.category,
            description: entry.description,
            timeFrom: entry.timeFrom,
            timeTo: entry.timeTo
          }
        });
      } catch (revErr) {
        logger.warn({ revErr }, 'Non-fatal: failed to archive revision during weekly audit-polish');
      }

      const rewritten = await rewriteEntryAcademically({
        title: entry.title,
        description: entry.description,
        category: entry.category,
        apiKey: userApiKey,
        model: userModel
      });

      // Update entry with executive engineering content
      const updated = await prisma.entry.update({
        where: { id: entry.id },
        data: {
          title: rewritten.title,
          category: rewritten.category,
          description: rewritten.description
        }
      });

      updatedList.push(updated);
    }

    logger.info({ userId: targetUserId, weekStart, count: updatedList.length }, 'Successfully audited and polished week entries');

    res.json({
      message: 'تم تدقيق وإعادة صياغة وترقية تصنيفات مهام الأسبوع بالكامل وفق أعلى المعايير الهندسية',
      updatedCount: updatedList.length,
      entries: updatedList
    });
  } catch (err) {
    logger.error({ err }, 'Error in audit-polish weekly report');
    res.status(500).json({ error: 'تعذر تدقيق وإعادة صياغة مهام الأسبوع' });
  }
});

// POST /api/reports/weekly/translate
// Translates titles, descriptions, and categories of all tasks in the week or custom scope between Arabic and English
router.post('/weekly/translate', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = await resolveTargetUserId(req);
    if (!targetUserId) {
      res.status(403).json({ error: 'غير مصرح لك بتعديل بيانات هذا المتدرب' });
      return;
    }

    const targetLang: 'ar' | 'en' = req.body.targetLang === 'ar' ? 'ar' : 'en';
    let weekStart = (req.query.week as string) || (req.body.week as string);
    const startDate = req.body.startDate as string | undefined;
    const endDate = req.body.endDate as string | undefined;
    const entryIds = req.body.entryIds as number[] | undefined;

    let entries: any[] = [];

    if (Array.isArray(entryIds) && entryIds.length > 0) {
      entries = await prisma.entry.findMany({
        where: {
          id: { in: entryIds },
          userId: targetUserId,
          deletedAt: null
        },
        orderBy: { entryDate: 'asc' }
      });
    } else if (startDate && endDate) {
      entries = await prisma.entry.findMany({
        where: {
          userId: targetUserId,
          deletedAt: null,
          entryDate: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { entryDate: 'asc' }
      });
    } else {
      if (!weekStart) {
        const latest = await prisma.entry.findFirst({
          where: { userId: targetUserId, deletedAt: null },
          orderBy: { entryDate: 'desc' }
        });
        weekStart = latest ? getWeekStart(latest.entryDate) : getWeekStart(new Date().toISOString().split('T')[0]);
      }
      const weekEnd = getWeekEnd(weekStart);

      entries = await prisma.entry.findMany({
        where: {
          userId: targetUserId,
          deletedAt: null,
          entryDate: {
            gte: weekStart,
            lte: weekEnd
          }
        },
        orderBy: { entryDate: 'asc' }
      });
    }

    if (entries.length === 0) {
      res.status(400).json({ error: 'لا توجد مهام مسجلة في هذه الفترة للترجمة' });
      return;
    }

    const userApiKey = (req.headers['x-gemini-key'] as string) || (req.body as any)?.apiKey || (req.query.apiKey as string);
    const userModel = (req.headers['x-ai-model'] as string) || (req.body as any)?.model;

    const categoryMapArToEn: Record<string, string> = {
      'هندسة الشبكات وتراسل البيانات': 'Network Engineering & Data Transmission',
      'شبكات النفاذ والألياف الضوئية (FTTH)': 'Access Networks & Fiber Optics (FTTH)',
      'شبكات الاتصالات اللاسلكية والجيل الخامس (5G)': 'Wireless Telecom & 5G Networks',
      'إدارة الأعطال والتشغيل ومراقبة الأنظمة (NOC)': 'Incident Management, Operations & NOC',
      'أمن المعلومات والأمن السيبراني': 'Information Security & Cybersecurity',
      'الدعم الفني الميداني وصيانة النظم': 'Field Technical Support & Systems Maintenance',
      'تطوير وهندسة البرمجيات والأنظمة': 'Software & Systems Engineering',
      'الحوسبة السحابية وإدارة الخوادم': 'Cloud Computing & Server Administration',
      'الاجتماعات الفنية والتخطيط التشغيلي': 'Technical Meetings & Operational Planning',
      'التوثيق الهندسي وضبط الجودة': 'Engineering Documentation & Quality Control',
      'تطوير / برمجة': 'Software Development',
      'دعم فني': 'Technical Support',
      'اجتماعات': 'Meetings',
      'تدريب وتعلّم': 'Training & Learning',
      'توثيق': 'Documentation',
      'شبكات': 'Networking',
      'أنظمة': 'Systems',
      'أمن سيبراني': 'Cybersecurity',
      'صيانة ودعم فني': 'Maintenance & Technical Support',
      'برمجة وتطوير': 'Software Development',
      'إدارة مشاريع': 'Project Management',
      'قواعد بيانات': 'Databases',
      'أخرى': 'Other'
    };

    const categoryMapEnToAr: Record<string, string> = Object.entries(categoryMapArToEn).reduce((acc, [ar, en]) => {
      acc[en] = ar;
      return acc;
    }, {} as Record<string, string>);

    const updatedList = [];

    for (const entry of entries) {
      // 1. Snapshot revision before modifying (Zero Data Loss Guarantee)
      try {
        await prisma.entryRevision.create({
          data: {
            entryId: entry.id,
            title: entry.title,
            category: entry.category,
            description: entry.description,
            timeFrom: entry.timeFrom,
            timeTo: entry.timeTo
          }
        });
      } catch (revErr) {
        logger.warn({ revErr }, 'Non-fatal: failed to archive revision during weekly translate');
      }

      // 2. Translate Title
      let translatedTitle = entry.title;
      try {
        const titleAiRes = await processTextWithAI({
          text: entry.title,
          action: 'translate',
          targetLang,
          apiKey: userApiKey,
          model: userModel
        });
        const rawTitle = typeof titleAiRes === 'string' ? titleAiRes : (titleAiRes as any)?.result;
        if (rawTitle && typeof rawTitle === 'string') {
          translatedTitle = rawTitle.replace(/^["'«»]+|["'«»]+$/g, '').trim() || entry.title;
        }
      } catch (err) {
        logger.warn({ err, entryId: entry.id }, 'Translation of title fell back to original');
      }

      // 3. Translate Description
      let translatedDesc = entry.description;
      try {
        const descAiRes = await processTextWithAI({
          text: entry.description,
          action: 'translate',
          targetLang,
          apiKey: userApiKey,
          model: userModel
        });
        const rawDesc = typeof descAiRes === 'string' ? descAiRes : (descAiRes as any)?.result;
        if (rawDesc && typeof rawDesc === 'string') {
          translatedDesc = rawDesc.trim() || entry.description;
        }
      } catch (err) {
        logger.warn({ err, entryId: entry.id }, 'Translation of description fell back to original');
      }

      // 4. Elevate title for target language
      translatedTitle = elevateTaskTitle(translatedTitle || entry.title, translatedDesc || entry.description, targetLang === 'ar');

      // 4. Translate Category
      let translatedCategory = entry.category;
      if (targetLang === 'en') {
        translatedCategory = categoryMapArToEn[entry.category] || entry.category;
      } else {
        translatedCategory = categoryMapEnToAr[entry.category] || entry.category;
      }

      // 5. Update Entry
      const updated = await prisma.entry.update({
        where: { id: entry.id },
        data: {
          title: translatedTitle,
          category: translatedCategory,
          description: translatedDesc
        }
      });

      updatedList.push(updated);
    }

    logger.info({ userId: targetUserId, targetLang, count: updatedList.length }, 'Successfully translated weekly report entries');

    res.json({
      message: targetLang === 'en'
        ? `تمت ترجمة محتوى مهام التقرير (${updatedList.length} مهمة) إلى اللغة الإنجليزية بنجاح مع حفظ نسخة احتياطية لكافة السجلات`
        : `تمت ترجمة محتوى مهام التقرير (${updatedList.length} مهمة) إلى اللغة العربية بنجاح مع حفظ نسخة احتياطية لكافة السجلات`,
      updatedCount: updatedList.length,
      entries: updatedList,
      targetLang
    });
  } catch (err) {
    logger.error({ err }, 'Error in translate weekly report');
    res.status(500).json({ error: 'تعذر ترجمة محتوى تقرير الأسبوع' });
  }
});

// GET /api/reports/final
router.get('/final', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = await resolveTargetUserId(req);
    if (!targetUserId) {
      res.status(403).json({ error: 'غير مصرح لك بالوصول لبيانات هذا المتدرب' });
      return;
    }

    const reportData = await buildFinalReportData(targetUserId);
    res.json(reportData);
  } catch (err) {
    logger.error({ err }, 'Error building final report');
    res.status(500).json({ error: 'تعذر تجميع التقرير النهائي' });
  }
});


// GET /api/reports/weekly/export/docx?week=YYYY-MM-DD&lang=ar|en
router.get('/weekly/export/docx', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = await resolveTargetUserId(req);
    if (!targetUserId) {
      res.status(403).json({ error: 'غير مصرح لك بتصدير تقرير هذا المتدرب' });
      return;
    }

    const weekParam = (req.query.week as string) || '';
    const lang = (req.query.lang as 'ar' | 'en') || 'ar';
    const reportData = await buildFinalReportData(targetUserId);

    const buffer = await generateWeeklyDocx(reportData, weekParam, lang);

    const weekObj = reportData.weeks.find((w) => w.weekStart === weekParam) || reportData.weeks[0];
    const weekIdx = weekObj ? weekObj.weekIndex : 1;

    const rawEntity = reportData.profile.entityAddress || (lang === 'en' ? 'COOP' : 'التدريب');
    const safeEntity = rawEntity.replace(/[\\/:*?"<>|\s]/g, '_').slice(0, 30);

    const filename = encodeURIComponent(
      lang === 'en' ? `Week_${weekIdx}_${safeEntity}_Report.docx` : `تقرير_الأسبوع_${weekIdx}_${safeEntity}.docx`
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.send(buffer);
  } catch (err) {
    logger.error({ err }, 'Error exporting weekly DOCX');
    res.status(500).json({ error: 'تعذر تصدير تقرير الأسبوع كـ Word' });
  }
});

// GET /api/reports/export/docx
router.get('/export/docx', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = await resolveTargetUserId(req);
    if (!targetUserId) {
      res.status(403).json({ error: 'غير مصرح لك بتصدير تقرير هذا المتدرب' });
      return;
    }

    const lang = (req.query.lang as 'ar' | 'en') || 'ar';
    const reportData = await buildFinalReportData(targetUserId);

    const onlyActual = req.query.onlyActual !== 'false';
    if (onlyActual) {
      const activeWeeks = reportData.weeks.filter((w) => (w.entries && w.entries.length > 0) || w.totalHours > 0);
      if (activeWeeks.length > 0) {
        reportData.weeks = activeWeeks;
      }
    }

    const buffer = await generateAcademicDocx(reportData, lang);

    const rawEntity = reportData.profile.entityAddress || (lang === 'en' ? 'COOP' : 'التدريب_التعاوني');
    const safeEntity = rawEntity.replace(/[\\/:*?"<>|\s]/g, '_').slice(0, 40);

    const filename = encodeURIComponent(
      lang === 'en' ? `${safeEntity}_Coop_Final_Report.docx` : `تقرير_${safeEntity}_النهائي.docx`
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.send(buffer);
  } catch (err) {
    logger.error({ err }, 'Error exporting DOCX');
    res.status(500).json({ error: 'تعذر تصدير مستند Word' });
  }
});

// GET /api/reports/export/html
router.get('/export/html', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = await resolveTargetUserId(req);
    if (!targetUserId) {
      res.status(403).json({ error: 'غير مصرح لك بتصدير تقرير هذا المتدرب' });
      return;
    }

    const lang = (req.query.lang as 'ar' | 'en') || 'ar';
    const reportData = await buildFinalReportData(targetUserId);

    const onlyActual = req.query.onlyActual !== 'false';
    if (onlyActual) {
      const activeWeeks = reportData.weeks.filter((w) => (w.entries && w.entries.length > 0) || w.totalHours > 0);
      if (activeWeeks.length > 0) {
        reportData.weeks = activeWeeks;
      }
    }

    const html = generateStandaloneHTMLReport(reportData, lang);

    const rawEntity = reportData.profile.entityAddress || (lang === 'en' ? 'COOP' : 'التدريب_التعاوني');
    const safeEntity = rawEntity.replace(/[\\/:*?"<>|\s]/g, '_').slice(0, 40);

    const filename = encodeURIComponent(
      lang === 'en' ? `${safeEntity}_Coop_Final_Report.html` : `تقرير_${safeEntity}_النهائي.html`
    );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.send(html);
  } catch (err) {
    logger.error({ err }, 'Error exporting HTML');
    res.status(500).json({ error: 'تعذر تصدير ملف HTML' });
  }
});

// GET /api/reports/export/presentation (PowerPoint Defense Deck)
router.get('/export/presentation', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = await resolveTargetUserId(req);
    if (!targetUserId) {
      res.status(403).json({ error: 'غير مصرح لك بتصدير عرض هذا المتدرب' });
      return;
    }

    const lang = (req.query.lang as 'ar' | 'en') || 'ar';
    const reportData = await buildFinalReportData(targetUserId);
    const buffer = await generatePresentationBuffer(reportData, lang);

    const rawEntity = reportData.profile.entityAddress || (lang === 'en' ? 'COOP_Defense' : 'مناقشة_التدريب_التعاوني');
    const safeEntity = rawEntity.replace(/[\\/:*?"<>|\s]/g, '_').slice(0, 40);
    const filename = encodeURIComponent(
      lang === 'en' ? `${safeEntity}_Defense_Presentation.pptx` : `عرض_مناقشة_${safeEntity}.pptx`
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.send(buffer);
  } catch (err) {
    logger.error({ err }, 'Error exporting PowerPoint presentation');
    res.status(500).json({ error: 'تعذر تصدير شرائح العرض التقديمي' });
  }
});


// ─── EMERGENCY BACKUP & OFFLINE ARCHIVE ENDPOINTS ────────────────────────────

// GET /api/reports/export/backup/json (Raw JSON database backup)
router.get('/export/backup/json', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = await resolveTargetUserId(req);
    if (!targetUserId) {
      res.status(403).json({ error: 'غير مصرح لك بتصدير هذه النسخة الاحتياطية' });
      return;
    }

    const reportData = await buildFinalReportData(targetUserId);
    const payload = {
      app: 'COOP.Report Emergency Backup Archive',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      student: {
        name: reportData.profile.studentName,
        trainingNumber: reportData.profile.trainingNumber,
        department: reportData.profile.department,
        trainingUnit: reportData.profile.trainingUnit,
        entity: reportData.profile.entityAddress,
        supervisor: reportData.profile.supervisorName
      },
      stats: {
        totalHours: reportData.totalHours,
        requiredHours: reportData.profile.courseHours,
        totalDays: reportData.totalDays,
        totalWeeks: reportData.weeks.length,
        totalEntries: reportData.totalEntries
      },
      profile: reportData.profile,
      weeks: reportData.weeks
    };

    const studentSafe = (reportData.profile.studentName || 'trainee').replace(/[\\/:*?"<>|\s]/g, '_');
    const filename = encodeURIComponent(`نسخة_احتياطية_شاملة_${studentSafe}_${new Date().toISOString().slice(0, 10)}.json`);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.send(JSON.stringify(payload, null, 2));
  } catch (err) {
    logger.error({ err }, 'Error exporting JSON backup');
    res.status(500).json({ error: 'تعذر استخراج النسخة الاحتياطية JSON' });
  }
});

// GET /api/reports/export/backup/csv (Excel Spreadsheet of all daily tasks)
router.get('/export/backup/csv', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = await resolveTargetUserId(req);
    if (!targetUserId) {
      res.status(403).json({ error: 'غير مصرح لك بتصدير هذا الأرشيف' });
      return;
    }

    const reportData = await buildFinalReportData(targetUserId);

    // Build CSV with UTF-8 BOM so Microsoft Excel opens Arabic perfectly without question marks
    const BOM = '\uFEFF';
    let csv = BOM + `الأسبوع,اليوم,التاريخ,من الساعة,إلى الساعة,الساعات,التصنيف التقني,عنوان المهمة,التفاصيل الإجرائية والنتائج\n`;

    reportData.weeks.forEach((w) => {
      w.entries.forEach((e, idx) => {
        const clean = (text?: string) => `"${(text || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
        const dayLabel = `اليوم ${idx + 1}`;
        const row = [
          clean(`الأسبوع ${w.weekIndex}`),
          clean(dayLabel),
          clean(e.entryDate),
          clean(e.timeFrom || '08:00'),
          clean(e.timeTo || '16:00'),
          clean(String(calculateHoursBetween(e.timeFrom, e.timeTo))),
          clean(e.category),
          clean(e.title),
          clean(e.description)
        ];
        csv += row.join(',') + '\n';
      });
    });

    const studentSafe = (reportData.profile.studentName || 'trainee').replace(/[\\/:*?"<>|\s]/g, '_');
    const filename = encodeURIComponent(`سجل_مهام_التدريب_التعاوني_${studentSafe}.csv`);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.send(csv);
  } catch (err) {
    logger.error({ err }, 'Error exporting CSV archive');
    res.status(500).json({ error: 'تعذر استخراج ملف CSV' });
  }
});

// GET /api/reports/export/backup/markdown (Full readable text dossier in Markdown/TXT)
router.get('/export/backup/markdown', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = await resolveTargetUserId(req);
    if (!targetUserId) {
      res.status(403).json({ error: 'غير مصرح لك بتصدير هذا الملف' });
      return;
    }

    const lang = (req.query.lang as 'ar' | 'en') || 'ar';
    const isAr = lang === 'ar';
    const reportData = await buildFinalReportData(targetUserId);

    let md = '';
    if (isAr) {
      md += `# ملف الأرشيف الكامل والشامل للتدريب التعاوني الميداني\n\n`;
      md += `> تم تصدير هذه النسخة الاحتياطية الشاملة بتاريخ: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}\n\n`;
      md += `## بيانات المتدرب والاعتماد الأكاديمي\n`;
      md += `- **اسم المتدرب:** ${reportData.profile.studentName || '—'}\n`;
      md += `- **الرقم التدريبي:** ${reportData.profile.trainingNumber || '—'}\n`;
      md += `- **الكلية / الوحدة التدريبية:** ${reportData.profile.trainingUnit || '—'}\n`;
      md += `- **القسم والتخصص:** ${reportData.profile.department || '—'}\n`;
      md += `- **جهة التدريب:** ${reportData.profile.entityAddress || '—'}\n`;
      md += `- **المشرف الميداني:** ${reportData.profile.supervisorName || reportData.profile.responsibleName || '—'}\n`;
      md += `- **إجمالي الساعات المسجلة:** ${reportData.totalHours} من ${reportData.profile.courseHours || 280} ساعة\n`;
      md += `- **إجمالي أيام التدريب المسجلة:** ${reportData.totalDays} يوم\n\n`;

      md += `---\n\n## الفصل الأول: مقدمة التدريب والأهداف\n`;
      md += (reportData.profile.introText || 'لا توجد مقدمة مسجلة.') + '\n\n';

      md += `---\n\n## الفصل الثاني: نبذة عن جهة التدريب وبيئة العمل\n`;
      md += (reportData.profile.entityIntroText || 'لا توجد نبذة مسجلة.') + '\n\n';

      md += `---\n\n## الفصل الثالث: السجل اليومي للمهام والعمليات الميدانية (الأسابيع الـ 14)\n\n`;
      reportData.weeks.forEach((w) => {
        md += `### الأسبوع ${w.weekIndex} (الفترة: ${w.weekStart} إلى ${w.weekEnd} - الساعات: ${w.totalHours} س)\n\n`;
        if (!w.entries || w.entries.length === 0) {
          md += `*لا توجد مدخلات مسجلة لهذا الأسبوع.*\n\n`;
        } else {
          w.entries.forEach((e, idx) => {
            const entryHours = calculateHoursBetween(e.timeFrom, e.timeTo);
            md += `#### اليوم ${idx + 1} | التاريخ: ${e.entryDate} | الساعات: ${entryHours} س | التصنيف: ${e.category}\n`;
            md += `**عنوان المهمة:** ${e.title}\n\n`;
            md += `**التفاصيل الفنية والنتائج:**\n${e.description}\n\n`;
          });
        }
      });

      md += `---\n\n## الفصل الرابع: المهارات والخبرات المكتسبة\n`;
      md += (reportData.profile.skillsText || 'لا توجد مهارات مسجلة.') + '\n\n';

      md += `---\n\n## الفصل الخامس: التوصيات والخاتمة\n`;
      md += (reportData.profile.conclusionText || 'لا توجد خاتمة مسجلة.') + '\n\n';
    } else {
      md += `# Complete Field Cooperative Training Offline Dossier\n\n`;
      md += `> Exported on: ${new Date().toISOString()}\n\n`;
      md += `## Trainee & Academic Profile\n`;
      md += `- **Trainee Name:** ${reportData.profile.studentName || '—'}\n`;
      md += `- **Student ID:** ${reportData.profile.trainingNumber || '—'}\n`;
      md += `- **Department:** ${reportData.profile.department || '—'}\n`;
      md += `- **Host Organization:** ${reportData.profile.entityAddress || '—'}\n`;
      md += `- **Total Logged Hours:** ${reportData.totalHours} of ${reportData.profile.courseHours || 280} Credit Hours\n\n`;

      md += `---\n\n## Chapter 1: Introduction & Objectives\n`;
      md += (reportData.profile.introText || 'No introduction recorded.') + '\n\n';

      md += `---\n\n## Chapter 2: Host Organization Profile\n`;
      md += (reportData.profile.entityIntroText || 'No profile recorded.') + '\n\n';

      md += `---\n\n## Chapter 3: 14-Week Chronological Activity Log\n\n`;
      reportData.weeks.forEach((w) => {
        md += `### Week ${w.weekIndex} (${w.weekStart} to ${w.weekEnd} - ${w.totalHours} Hours)\n\n`;
        w.entries.forEach((e, idx) => {
          const entryHours = calculateHoursBetween(e.timeFrom, e.timeTo);
          md += `#### Day ${idx + 1} | Date: ${e.entryDate} | ${entryHours} Hours | Category: ${e.category}\n`;
          md += `**Task Title:** ${e.title}\n\n`;
          md += `**Details:**\n${e.description}\n\n`;
        });
      });

      md += `---\n\n## Chapter 4: Acquired Skills & Experiences\n`;
      md += (reportData.profile.skillsText || 'No skills recorded.') + '\n\n';

      md += `---\n\n## Chapter 5: Recommendations & Conclusion\n`;
      md += (reportData.profile.conclusionText || 'No conclusion recorded.') + '\n\n';
    }

    const studentSafe = (reportData.profile.studentName || 'trainee').replace(/[\\/:*?"<>|\s]/g, '_');
    const filename = encodeURIComponent(
      isAr ? `ملف_التدريب_الكامل_${studentSafe}.md` : `${studentSafe}_Coop_Dossier.md`
    );

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.send(md);
  } catch (err) {
    logger.error({ err }, 'Error exporting Markdown dossier');
    res.status(500).json({ error: 'تعذر استخراج ملف التقرير النصي' });
  }
});

export default router;
