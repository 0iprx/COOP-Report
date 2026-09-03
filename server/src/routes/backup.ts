import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { exportUserArchive, exportUserReadableArchive, importUserArchive } from '../services/backupService.js';
import { prisma } from '../db.js';
import { logger } from '../logger.js';

const router = Router();
router.use(authenticate);

// GET /api/backup/export
router.get('/export', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { backup, filename } = await exportUserArchive(req.user!.userId);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (err: any) {
    logger.error({ err }, 'Error exporting backup');
    res.status(500).json({ error: err.message || 'تعذر تصدير النسخة الاحتياطية' });
  }
});

// GET /api/backup/export-readable
// Human-readable, self-contained HTML "safety copy" of every entry, the trainee's
// profile, and evidence photos — usable even if the site itself is down. Meant to be
// downloaded regularly from day one, not just when the final report is being built.
router.get('/export-readable', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { html, filename } = await exportUserReadableArchive(req.user!.userId);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.send(html);
  } catch (err: any) {
    logger.error({ err }, 'Error exporting readable safety backup');
    res.status(500).json({ error: err.message || 'تعذر تصدير النسخة الاحتياطية القابلة للقراءة' });
  }
});

// POST /api/backup/import
router.post('/import', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawBackup = req.body;
    const result = await importUserArchive(req.user!.userId, rawBackup);
    res.json(result);
  } catch (err: any) {
    logger.error({ err }, 'Error importing backup');
    res.status(400).json({ error: err.message || 'فشل استيراد النسخة الاحتياطية' });
  }
});

// GET /api/backup/trash (List soft-deleted entries)
router.get('/trash', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const deletedEntries = await prisma.entry.findMany({
      where: {
        userId: req.user!.userId,
        deletedAt: { not: null }
      },
      orderBy: { deletedAt: 'desc' }
    });

    res.json({ entries: deletedEntries });
  } catch (err) {
    res.status(500).json({ error: 'تعذر جلب سلة المحذوفات' });
  }
});

// POST /api/backup/restore/:id (Restore soft-deleted entry)
router.post('/restore/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.userId) {
      res.status(404).json({ error: 'الإدخال غير موجود' });
      return;
    }

    const restored = await prisma.entry.update({
      where: { id },
      data: { deletedAt: null }
    });

    res.json({ message: 'تم استرجاع الإدخال بنجاح', entry: restored });
  } catch (err) {
    res.status(500).json({ error: 'تعذر استرجاع الإدخال' });
  }
});

// GET /api/backup/revisions/:entryId (Get history revisions of an entry)
router.get('/revisions/:entryId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const entryId = Number(req.params.entryId);

    const entry = await prisma.entry.findUnique({
      where: { id: entryId }
    });

    if (!entry || entry.userId !== req.user!.userId) {
      res.status(404).json({ error: 'الإدخال غير موجود' });
      return;
    }

    const revisions = await prisma.entryRevision.findMany({
      where: { entryId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ revisions });
  } catch (err) {
    res.status(500).json({ error: 'تعذر جلب سجل التعديلات' });
  }
});

// POST /api/backup/revert/:entryId/:revisionId (Revert to an earlier revision)
router.post('/revert/:entryId/:revisionId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const entryId = Number(req.params.entryId);
    const revisionId = Number(req.params.revisionId);

    const entry = await prisma.entry.findUnique({ where: { id: entryId } });
    if (!entry || entry.userId !== req.user!.userId) {
      res.status(404).json({ error: 'الإدخال غير موجود' });
      return;
    }

    const revision = await prisma.entryRevision.findUnique({ where: { id: revisionId } });
    if (!revision || revision.entryId !== entryId) {
      res.status(404).json({ error: 'النسخة التاريخية غير موجودة' });
      return;
    }

    // Save current as a revision before reverting
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

    // Update with historical version
    const updated = await prisma.entry.update({
      where: { id: entryId },
      data: {
        title: revision.title,
        category: revision.category,
        description: revision.description,
        timeFrom: revision.timeFrom,
        timeTo: revision.timeTo
      }
    });

    res.json({ message: 'تم استرجاع النسخة السابقة بنجاح', entry: updated });
  } catch (err) {
    res.status(500).json({ error: 'تعذر استرجاع النسخة السابقة' });
  }
});

export default router;
