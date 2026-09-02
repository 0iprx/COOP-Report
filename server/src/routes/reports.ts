import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { buildFinalReportData } from '../services/reportService.js';
import { generateAcademicDocx } from '../services/docxService.js';
import { generateStandaloneHTMLReport } from '../services/htmlReportService.js';
import { calculateHoursBetween, getWeekEnd, getWeekStart } from '@coop/shared';
import { logger } from '../logger.js';

const router = Router();
router.use(authenticate);

// GET /api/reports/weekly?week=YYYY-MM-DD
router.get('/weekly', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let targetUserId = req.user!.userId;
    if (req.query.traineeId && req.user!.role === 'supervisor') {
      targetUserId = Number(req.query.traineeId);
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
        entryDate: {
          gte: weekStart,
          lte: weekEnd
        }
      },
      orderBy: { entryDate: 'asc' }
    });

    const totalHours = entries.reduce((sum, e: { timeFrom: string; timeTo: string }) => sum + calculateHoursBetween(e.timeFrom, e.timeTo), 0);
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
    let targetUserId = req.user!.userId;
    if (req.query.traineeId && req.user!.role === 'supervisor') {
      targetUserId = Number(req.query.traineeId);
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
    let targetUserId = req.user!.userId;
    if (req.query.traineeId && req.user!.role === 'supervisor') {
      targetUserId = Number(req.query.traineeId);
    }

    const lang = (req.query.lang as 'ar' | 'en') || 'ar';
    const reportData = await buildFinalReportData(targetUserId);

    const buffer = await generateAcademicDocx(reportData, lang);

    const filename = encodeURIComponent(
      lang === 'en' ? 'Huawei_Coop_Final_Report.docx' : 'تقرير_التدريب_التعاوني_هواوي.docx'
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
    let targetUserId = req.user!.userId;
    if (req.query.traineeId && req.user!.role === 'supervisor') {
      targetUserId = Number(req.query.traineeId);
    }

    const lang = (req.query.lang as 'ar' | 'en') || 'ar';
    const reportData = await buildFinalReportData(targetUserId);

    const html = generateStandaloneHTMLReport(reportData, lang);

    const filename = encodeURIComponent(
      lang === 'en' ? 'Huawei_Coop_Final_Report.html' : 'تقرير_التدريب_التعاوني_هواوي.html'
    );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.send(html);
  } catch (err) {
    logger.error({ err }, 'Error exporting HTML');
    res.status(500).json({ error: 'تعذر تصدير ملف HTML' });
  }
});

export default router;
