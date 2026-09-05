import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { buildFinalReportData } from '../services/reportService.js';
import { generateAcademicDocx, generateWeeklyDocx } from '../services/docxService.js';
import { generateStandaloneHTMLReport } from '../services/htmlReportService.js';
import { generatePresentationBuffer } from '../services/presentationService.js';
import { calculateHoursBetween, getWeekEnd, getWeekStart } from '@coop/shared';
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
      md += `- **إجمالي الساعات المعتمدة:** ${reportData.totalHours} من ${reportData.profile.courseHours || 280} ساعة\n`;
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
