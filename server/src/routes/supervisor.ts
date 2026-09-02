import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { linkSupervisorSchema } from '@coop/shared';
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
      res.status(404).json({ error: 'لم يتم العثور على مشرف بهذا الاسم' });
      return;
    }

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { supervisorId: supervisor.id }
    });

    logger.info({ traineeId: req.user!.userId, supervisorId: supervisor.id }, 'Trainee linked to supervisor');

    res.json({
      message: `تم ربط حسابك بنجاح مع المشرف: ${supervisor.username}`,
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

// GET /api/supervisor/trainees (Supervisor only)
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
            supervisorNotes: true
          }
        },
        _count: {
          select: { entries: true }
        }
      }
    });

    res.json({ trainees });
  } catch (err) {
    logger.error({ err }, 'Error listing trainees');
    res.status(500).json({ error: 'تعذر جلب قائمة المتدربين' });
  }
});

// GET /api/supervisor/trainees/:id/report (Supervisor inspects trainee report)
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

// POST /api/supervisor/trainees/:id/notes (Supervisor adds supervisory notes)
router.post(
  '/trainees/:id/notes',
  requireRole('supervisor'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const traineeId = Number(req.params.id);
      const { notes } = req.body;

      const isLinked = await prisma.user.findFirst({
        where: { id: traineeId, supervisorId: req.user!.userId }
      });

      if (!isLinked) {
        res.status(403).json({ error: 'غير مصرح: هذا المتدرب غير مرتبط بإشرافك' });
        return;
      }

      await prisma.reportProfile.update({
        where: { userId: traineeId },
        data: { supervisorNotes: String(notes || '') }
      });

      res.json({ message: 'تم حفظ ملاحظات المشرف بنجاح' });
    } catch (err) {
      logger.error({ err }, 'Error saving supervisor notes');
      res.status(500).json({ error: 'تعذر حفظ ملاحظات المشرف' });
    }
  }
);

export default router;
