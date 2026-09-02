import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { entrySchema } from '@coop/shared';
import { logger } from '../logger.js';

const router = Router();
router.use(authenticate);

// GET /api/entries
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let targetUserId = req.user!.userId;

    // If supervisor requests entries for a linked trainee
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

    const entries = await prisma.entry.findMany({
      where: { userId: targetUserId },
      orderBy: { entryDate: 'desc' }
    });

    res.json({ entries });
  } catch (err) {
    logger.error({ err }, 'Error fetching entries');
    res.status(500).json({ error: 'تعذر جلب الإدخالات' });
  }
});

// POST /api/entries
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = entrySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'بيانات غير صالحة' });
      return;
    }

    const { entryDate, timeFrom, timeTo, title, category, description } = parseResult.data;

    const entry = await prisma.entry.create({
      data: {
        userId: req.user!.userId,
        entryDate,
        timeFrom,
        timeTo,
        title,
        category,
        description
      }
    });

    res.status(201).json({ message: 'تم حفظ الإدخال بنجاح', entry });
  } catch (err) {
    logger.error({ err }, 'Error creating entry');
    res.status(500).json({ error: 'تعذر حفظ الإدخال' });
  }
});

// PUT /api/entries/:id
router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const parseResult = entrySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'بيانات غير صالحة' });
      return;
    }

    // Verify ownership
    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.userId) {
      res.status(404).json({ error: 'الإدخال غير موجود أو لا تملك صلاحية تعديله' });
      return;
    }

    const updated = await prisma.entry.update({
      where: { id },
      data: parseResult.data
    });

    res.json({ message: 'تم تحديث الإدخال بنجاح', entry: updated });
  } catch (err) {
    res.status(500).json({ error: 'تعذر تحديث الإدخال' });
  }
});

// DELETE /api/entries/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.userId) {
      res.status(404).json({ error: 'الإدخال غير موجود أو لا تملك صلاحية حذفه' });
      return;
    }

    await prisma.entry.delete({ where: { id } });
    res.json({ message: 'تم حذف الإدخال بنجاح' });
  } catch (err) {
    res.status(500).json({ error: 'تعذر حذف الإدخال' });
  }
});

export default router;
