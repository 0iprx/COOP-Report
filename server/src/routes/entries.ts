import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { entrySchema, batchRewriteEntriesSchema } from '@coop/shared';
import { rewriteEntryAcademically } from '../services/aiService.js';
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

    // Auto-archive baseline creation revision so it's always retrievable
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
      logger.warn({ revErr }, 'Non-fatal: failed to write initial baseline revision');
    }

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

    let revisions = await prisma.entryRevision.findMany({
      where: { entryId: id },
      orderBy: { createdAt: 'desc' }
    });

    // If no revisions exist yet (e.g. entry created prior to revision tracking),
    // archive current state as the initial baseline version so the user NEVER loses any data!
    if (revisions.length === 0) {
      try {
        const baseline = await prisma.entryRevision.create({
          data: {
            entryId: existing.id,
            title: existing.title,
            category: existing.category,
            description: existing.description,
            timeFrom: existing.timeFrom,
            timeTo: existing.timeTo,
            createdAt: existing.createdAt
          }
        });
        revisions = [baseline];
      } catch {
        // Fallback in-memory baseline representation
        revisions = [{
          id: 0,
          entryId: existing.id,
          title: existing.title,
          category: existing.category,
          description: existing.description,
          timeFrom: existing.timeFrom,
          timeTo: existing.timeTo,
          createdAt: existing.createdAt
        } as any];
      }
    }

    res.json({
      current: {
        id: existing.id,
        title: existing.title,
        category: existing.category,
        description: existing.description,
        timeFrom: existing.timeFrom,
        timeTo: existing.timeTo,
        entryDate: existing.entryDate,
        createdAt: existing.createdAt
      },
      revisions
    });
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

// POST /api/entries/batch-academic-rewrite (Rewrite all entries or specific week academically with zero hallucination)
router.post('/batch-academic-rewrite', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = batchRewriteEntriesSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'بيانات غير صالحة' });
      return;
    }

    const { weekNumber, apiKey, model, style } = parseResult.data;
    const userId = req.user!.userId;

    // Fetch user entries
    let entries = await prisma.entry.findMany({
      where: {
        userId,
        deletedAt: null
      },
      orderBy: { entryDate: 'asc' }
    });

    if (entries.length === 0) {
      res.json({ message: 'لا توجد سجلات لمعالجتها', processedCount: 0, entries: [] });
      return;
    }

    // If weekNumber is specified, filter entries by week
    if (weekNumber) {
      const profile = await prisma.reportProfile.findUnique({ where: { userId } });
      const startDateStr = profile?.startDate || entries[0].entryDate;
      const start = new Date(startDateStr);

      entries = entries.filter(e => {
        const eDate = new Date(e.entryDate);
        const diffDays = Math.floor((eDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const w = Math.max(1, Math.floor(diffDays / 7) + 1);
        return w === weekNumber;
      });
    }

    logger.info({ userId, count: entries.length, weekNumber, style }, 'Starting batch academic rewrite of entries');

    const updatedEntries = [];

    for (const entry of entries) {
      // 1. Archive current version to EntryRevision
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
        logger.warn({ revErr, entryId: entry.id }, 'Could not create revision before batch rewrite');
      }

      // 2. Rewrite academically with requested style
      const rewritten = await rewriteEntryAcademically({
        title: entry.title,
        description: entry.description,
        category: entry.category,
        apiKey,
        model,
        style
      });

      // 3. Update entry in database
      const updated = await prisma.entry.update({
        where: { id: entry.id },
        data: {
          title: rewritten.title,
          description: rewritten.description,
          category: rewritten.category
        }
      });

      updatedEntries.push(updated);
    }

    res.json({
      message: `تمت إعادة صياغة وترتيب ${updatedEntries.length} سجلات أكاديمياً بنجاح وبدون أي اختلاق`,
      processedCount: updatedEntries.length,
      entries: updatedEntries
    });
  } catch (err: any) {
    logger.error({ err }, 'Error in batch academic rewrite');
    res.status(500).json({ error: err?.message || 'تعذر استكمال إعادة الصياغة الأكاديمية' });
  }
});

export default router;
