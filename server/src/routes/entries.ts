import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { entrySchema } from '@coop/shared';
import { logger } from '../logger.js';

const router = Router();
router.use(authenticate);

// GET /api/entries (only active non-deleted entries)
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

    const entries = await prisma.entry.findMany({
      where: {
        userId: targetUserId,
        deletedAt: null
      },
      include: {
        _count: {
          select: { revisions: true }
        }
      },
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

// PUT /api/entries/:id (records revision history for zero data loss)
router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const parseResult = entrySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'بيانات غير صالحة' });
      return;
    }

    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.userId) {
      res.status(404).json({ error: 'الإدخال غير موجود أو لا تملك صلاحية تعديله' });
      return;
    }

    // Save previous state to revisions table before modifying
    await prisma.entryRevision.create({
      data: {
        entryId: existing.id,
        title: existing.title,
        category: existing.category,
        description: existing.description,
        timeFrom: existing.timeFrom,
        timeTo: existing.timeTo
      }
    });

    const updated = await prisma.entry.update({
      where: { id },
      data: parseResult.data
    });

    res.json({ message: 'تم تحديث الإدخال وحفظ نسخة تاريخية في الأرشيف', entry: updated });
  } catch (err) {
    res.status(500).json({ error: 'تعذر تحديث الإدخال' });
  }
});

// DELETE /api/entries/:id (Soft delete: marked with deletedAt so it's safely restorable)
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.userId) {
      res.status(404).json({ error: 'الإدخال غير موجود أو لا تملك صلاحية حذفه' });
      return;
    }

    // Soft delete
    await prisma.entry.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'تم نقل الإدخال إلى سلة المحذوفات بأمان ويمكنك استعادته في أي وقت' });
  } catch (err) {
    res.status(500).json({ error: 'تعذر حذف الإدخال' });
  }
});

// GET /api/entries/:id/revisions (Fetch previous versions for this entry)
router.get('/:id/revisions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.userId) {
      res.status(404).json({ error: 'الإدخال غير موجود أو لا تملك صلاحية الوصول إليه' });
      return;
    }

    const revisions = await prisma.entryRevision.findMany({
      where: { entryId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ revisions });
  } catch (err) {
    logger.error({ err }, 'Error fetching entry revisions');
    res.status(500).json({ error: 'تعذر جلب سجل التعديلات' });
  }
});

// POST /api/entries/:id/revisions/:revId/rollback (Rollback to a specific past version)
router.post('/:id/revisions/:revId/rollback', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const revId = Number(req.params.revId);

    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.userId) {
      res.status(404).json({ error: 'الإدخال غير موجود أو لا تملك صلاحية تعديله' });
      return;
    }

    const targetRevision = await prisma.entryRevision.findFirst({
      where: { id: revId, entryId: id }
    });

    if (!targetRevision) {
      res.status(404).json({ error: 'النسخة التاريخية المطلوبة غير موجودة' });
      return;
    }

    // Save current entry state as a new revision before rolling back (so rollback itself can be undone)
    await prisma.entryRevision.create({
      data: {
        entryId: existing.id,
        title: existing.title,
        category: existing.category,
        description: existing.description,
        timeFrom: existing.timeFrom,
        timeTo: existing.timeTo
      }
    });

    // Update entry with target revision content
    const updated = await prisma.entry.update({
      where: { id },
      data: {
        title: targetRevision.title,
        category: targetRevision.category,
        description: targetRevision.description,
        timeFrom: targetRevision.timeFrom,
        timeTo: targetRevision.timeTo
      }
    });

    res.json({ message: 'تم التراجع واستعادة النسخة السابقة بنجاح', entry: updated });
  } catch (err) {
    logger.error({ err }, 'Error rolling back entry revision');
    res.status(500).json({ error: 'تعذر التراجع عن التعديل واستعادة النسخة' });
  }
});

export default router;
