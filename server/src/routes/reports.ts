import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { buildFinalReportData } from '../services/reportService.js';
import { generateAcademicDocx } from '../services/docxService.js';
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

    const reportData = await buildFinalReportData(targetUserId);
    const buffer = await generatePresentationBuffer(reportData);

    const rawEntity = reportData.profile.entityAddress || 'COOP_Defense';
    const safeEntity = rawEntity.replace(/[\\/:*?"<>|\s]/g, '_').slice(0, 40);
    const filename = encodeURIComponent(`عرض_مناقشة_${safeEntity}.pptx`);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.send(buffer);
  } catch (err) {
    logger.error({ err }, 'Error exporting PowerPoint presentation');
    res.status(500).json({ error: 'تعذر تصدير شرائح العرض التقديمي' });
  }
});

export default router;
