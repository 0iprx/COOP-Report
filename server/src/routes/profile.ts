import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { profileSchema } from '@coop/shared';
import { logAuditEvent } from '../services/auditService.js';
import { logger } from '../logger.js';

const router = Router();
router.use(authenticate);

// GET /api/profile
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let targetUserId = req.user!.userId;

    if (req.query.traineeId && req.user!.role === 'supervisor') {
      const traineeId = Number(req.query.traineeId);
      const isLinked = await prisma.user.findFirst({
        where: { id: traineeId, supervisorId: req.user!.userId }
      });
      if (!isLinked) {
        res.status(403).json({ error: 'المتدرب غير مرتبط بحسابك' });
        return;
      }
      targetUserId = traineeId;
    }

    let profile = await prisma.reportProfile.findUnique({
      where: { userId: targetUserId }
    });

    if (!profile) {
      profile = await prisma.reportProfile.create({
        data: {
          userId: targetUserId,
          entityAddress: 'هواوي السعودية (Huawei Tech Saudi)'
        }
      });
    }

    res.json({ profile });
  } catch (err) {
    logger.error({ err }, 'Error fetching profile');
    res.status(500).json({ error: 'تعذر جلب بيانات التقرير' });
  }
});

// PUT /api/profile
router.put('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = profileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'بيانات غير صالحة' });
      return;
    }

    const updated = await prisma.reportProfile.upsert({
      where: { userId: req.user!.userId },
      create: {
        userId: req.user!.userId,
        ...parseResult.data
      },
      update: parseResult.data
    });

    await logAuditEvent({
      userId: req.user!.userId,
      tenantId: req.user!.tenantId,
      action: 'REPORT_PROFILE_UPDATED',
      entityType: 'REPORT_PROFILE',
      entityId: req.user!.userId,
      req
    });

    res.json({ message: 'تم حفظ بيانات التقرير بنجاح', profile: updated });
  } catch (err) {
    logger.error({ err }, 'Error updating profile');
    res.status(500).json({ error: 'تعذر حفظ بيانات التقرير' });
  }
});

export default router;
