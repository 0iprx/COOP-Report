import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { linkSupervisorSchema, calculateHoursBetween } from '@coop/shared';
import { buildFinalReportData } from '../services/reportService.js';
import { logger } from '../logger.js';

const router = Router();
router.use(authenticate);

// POST /api/supervisor/link (Called by Trainee to link their supervisor)
router.post('/link', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = linkSupervisorSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'بيانات غير صالحة' });
      return;
    }

    const { supervisorUsernameOrCode } = parseResult.data;

    // Find supervisor by username
    const supervisor = await prisma.user.findFirst({
      where: {
        username: supervisorUsernameOrCode,
        role: 'supervisor'
      }
    });

    if (!supervisor) {
      res.status(404).json({ error: 'لم يتم العثور على مشرف بهذا الاسم أو الرمز' });
      return;
    }

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { supervisorId: supervisor.id }
    });

    logger.info({ traineeId: req.user!.userId, supervisorId: supervisor.id }, 'Trainee linked to supervisor');

    res.json({
      message: `تم ربط حسابك بنجاح وبشكل فوري مع المشرف: ${supervisor.username}`,
      supervisor: {
        id: supervisor.id,
        username: supervisor.username
      }
    });
  } catch (err) {
    logger.error({ err }, 'Error linking supervisor');
    res.status(500).json({ error: 'تعذر ربط المشرف' });
  }
});

// GET /api/supervisor/trainees (Supervisor only - Live Dashboard Metrics)
router.get('/trainees', requireRole('supervisor'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const trainees = await prisma.user.findMany({
      where: { supervisorId: req.user!.userId },
      select: {
        id: true,
        username: true,
        createdAt: true,
        profile: {
          select: {
            studentName: true,
            trainingNumber: true,
            department: true,
            trainingUnit: true,
            entityAddress: true,
            courseHours: true,
            trainingWeeks: true,
            supervisorNotes: true,
            supervisorRating: true,
            supervisorApproved: true,
            supervisorApprovedAt: true
          }
        },
        entries: {
          where: { deletedAt: null },
          select: {
            timeFrom: true,
            timeTo: true,
            entryDate: true
          },
          orderBy: { entryDate: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const summary = trainees.map((t) => {
      const totalHours = t.entries.reduce((sum, e) => sum + calculateHoursBetween(e.timeFrom, e.timeTo), 0);
      const uniqueDays = new Set(t.entries.map((e) => e.entryDate)).size;
      const lastEntryDate = t.entries[0]?.entryDate || null;
      return {
        id: t.id,
        username: t.username,
        studentName: t.profile?.studentName || t.username,
        trainingNumber: t.profile?.trainingNumber || '',
        department: t.profile?.department || '',
        trainingUnit: t.profile?.trainingUnit || '',
        entityAddress: t.profile?.entityAddress || '',
        courseHours: t.profile?.courseHours || 280,
        trainingWeeks: t.profile?.trainingWeeks || 14,
        supervisorNotes: t.profile?.supervisorNotes || '',
        supervisorRating: t.profile?.supervisorRating || '',
        supervisorApproved: !!t.profile?.supervisorApproved,
        supervisorApprovedAt: t.profile?.supervisorApprovedAt ? t.profile.supervisorApprovedAt.toISOString() : null,
        totalHours: Number(totalHours.toFixed(1)),
        totalDays: uniqueDays,
        totalTasks: t.entries.length,
        lastEntryDate
      };
    });

    res.json({ trainees: summary });
  } catch (err) {
    logger.error({ err }, 'Error listing trainees');
    res.status(500).json({ error: 'تعذر جلب قائمة المتدربين' });
  }
});

// GET /api/supervisor/trainees/:id/report (Supervisor inspects trainee report - Read Only)
router.get(
  '/trainees/:id/report',
  requireRole('supervisor'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const traineeId = Number(req.params.id);

      const isLinked = await prisma.user.findFirst({
        where: { id: traineeId, supervisorId: req.user!.userId }
      });

      if (!isLinked) {
        res.status(403).json({ error: 'غير مصرح: هذا المتدرب غير مرتبط بإشرافك' });
        return;
      }

      const reportData = await buildFinalReportData(traineeId);
      res.json(reportData);
    } catch (err) {
      logger.error({ err }, 'Error viewing trainee report');
      res.status(500).json({ error: 'تعذر جلب تقرير المتدرب' });
    }
  }
);

// POST /api/supervisor/trainees/:id/evaluate (Supervisor evaluates, grades, and approves report)
router.post(
  '/trainees/:id/evaluate',
  requireRole('supervisor'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const traineeId = Number(req.params.id);
      const { notes, rating, approved } = req.body;

      const isLinked = await prisma.user.findFirst({
        where: { id: traineeId, supervisorId: req.user!.userId }
      });

      if (!isLinked) {
        res.status(403).json({ error: 'غير مصرح: هذا المتدرب غير مرتبط بإشرافك' });
        return;
      }

      const updated = await prisma.reportProfile.update({
        where: { userId: traineeId },
        data: {
          supervisorNotes: typeof notes === 'string' ? notes : undefined,
          supervisorRating: typeof rating === 'string' ? rating : undefined,
          supervisorApproved: typeof approved === 'boolean' ? approved : undefined,
          supervisorApprovedAt: approved ? new Date() : null
        }
      });

      res.json({
        message: 'تم حفظ التقييم واعتماد التقرير بنجاح',
        profile: updated
      });
    } catch (err) {
      logger.error({ err }, 'Error evaluating trainee');
      res.status(500).json({ error: 'تعذر حفظ التقييم' });
    }
  }
);

export default router;
