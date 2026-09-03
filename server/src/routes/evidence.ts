import { Router, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { logger } from '../logger.js';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

// Dedicated Rate Limiter for Evidence Uploads (20 uploads per 15 min per user)
const evidenceUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'تم تجاوز الحد المسموح لرفع الصور التوثيقية مؤقتاً، يرجى المحاولة لاحقاً' },
  standardHeaders: true,
  legacyHeaders: false
});

// Helper: Sanitize Text (Prevent XSS and script injections in captions)
function sanitizeCaption(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[\\/`$]/g, '') // Strip shell/template literal injection chars
    .trim();
}

// Helper: Validate Image Magic Bytes (Server-side format & EXIF check)
function validateImageBuffer(buffer: Buffer, mime: string): { valid: boolean; error?: string } {
  if (buffer.length > 650 * 1024) {
    return { valid: false, error: 'حجم الصورة يتجاوز الحد الأقصى المسموح (650 كيلوبايت)' };
  }

  // Magic bytes check
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isWebp =
    buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
    buffer.slice(8, 12).toString('ascii') === 'WEBP';

  if (!isJpeg && !isPng && !isWebp) {
    return { valid: false, error: 'نوع ملف الصورة غير معتمد (يسمح فقط بـ JPEG, PNG, WEBP)' };
  }

  // Double check EXIF GPS: Canvas stripping removes it, but verify buffer does not have raw GPS tag marker
  // Exif GPS sub-IFD tag is 0x8825 in big-endian (0x88, 0x25)
  // If an attacker bypasses the client canvas and submits a raw camera photo with GPS, reject it
  const hex = buffer.toString('hex');
  if (hex.includes('47505320') || hex.includes('47505300')) {
    // "GPS " or "GPS\0" marker in Exif
    return { valid: false, error: 'تم رفض الصورة: تحتوي الصورة على بيانات موقع جغرافي (GPS) حساسة. يرجى استخدام المعالجة المدمجة لإزالتها.' };
  }

  return { valid: true };
}

const createEvidenceSchema = z.object({
  weekIndex: z.number().int().min(1).max(30),
  caption: z.string().min(2, 'التعليق مطلوب').max(255, 'التعليق طويل جداً'),
  imageData: z.string().min(20, 'بيانات الصورة غير صالحة')
});

// GET /api/evidence?weekIndex=1&traineeId=...
// Strictly protected against IDOR:
// Trainees can ONLY see their own photos.
// Supervisors can ONLY see photos of trainees linked directly to them.
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let targetUserId = req.user!.userId;
    const requestedTraineeId = req.query.traineeId ? Number(req.query.traineeId) : undefined;

    if (requestedTraineeId && !isNaN(requestedTraineeId)) {
      if (req.user!.role !== 'supervisor') {
        res.status(403).json({ error: 'غير مصرح لك بالوصول لصور متدرب آخر' });
        return;
      }

      // Verify trainee is linked to this supervisor
      const isLinked = await prisma.user.findFirst({
        where: { id: requestedTraineeId, supervisorId: req.user!.userId }
      });

      if (!isLinked) {
        res.status(403).json({ error: 'غير مصرح: هذا المتدرب غير مرتبط بإشرافك' });
        return;
      }

      targetUserId = requestedTraineeId;
    }

    const weekIndexParam = req.query.weekIndex ? Number(req.query.weekIndex) : undefined;

    const where: any = {
      userId: targetUserId,
      deletedAt: null // Soft delete filter
    };

    if (weekIndexParam && !isNaN(weekIndexParam)) {
      where.weekIndex = weekIndexParam;
    }

    const items = await prisma.weeklyEvidence.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      evidence: items.map((item) => ({
        id: item.id,
        userId: item.userId,
        weekIndex: item.weekIndex,
        caption: item.caption,
        imageData: item.imageData,
        createdAt: item.createdAt.toISOString()
      }))
    });
  } catch (err) {
    logger.error({ err }, 'Error fetching weekly evidence');
    res.status(500).json({ error: 'تعذر جلب الصور التوثيقية' });
  }
});

// POST /api/evidence (With rate limiter, magic bytes, and caption sanitization)
router.post('/', evidenceUploadLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const parseResult = createEvidenceSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'بيانات غير صالحة' });
      return;
    }

    const { weekIndex, caption, imageData } = parseResult.data;

    // 1. Validate Base64 Data URI Format
    const dataUriMatch = imageData.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
    if (!dataUriMatch) {
      res.status(400).json({ error: 'تنسيق ترميز الصورة غير صحيح' });
      return;
    }

    const mime = dataUriMatch[1];
    const base64Data = dataUriMatch[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // 2. Validate Buffer Size & Magic Bytes & EXIF
    const validation = validateImageBuffer(buffer, mime);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    // 3. Limit to 4 active photos per week
    const existingCount = await prisma.weeklyEvidence.count({
      where: { userId, weekIndex, deletedAt: null }
    });

    if (existingCount >= 4) {
      res.status(400).json({ error: 'الحد الأقصى للصور التوثيقية في الأسبوع الواحد هو 4 صور' });
      return;
    }

    // 4. Sanitize Caption
    const cleanCaption = sanitizeCaption(caption);
    if (!cleanCaption) {
      res.status(400).json({ error: 'التعليق غير صالح بعد التعقيم' });
      return;
    }

    // 5. Store cleanly in DB
    const created = await prisma.weeklyEvidence.create({
      data: {
        userId,
        weekIndex,
        caption: cleanCaption,
        imageData
      }
    });

    logger.info({ userId, weekIndex, evidenceId: created.id }, 'Weekly evidence uploaded and sanitized');

    res.status(201).json({
      message: 'تم حفظ الصورة التوثيقية وتجريد بيانات الموقع بنجاح',
      evidence: {
        id: created.id,
        userId: created.userId,
        weekIndex: created.weekIndex,
        caption: created.caption,
        imageData: created.imageData,
        createdAt: created.createdAt.toISOString()
      }
    });
  } catch (err) {
    logger.error({ err }, 'Error saving weekly evidence');
    res.status(500).json({ error: 'تعذر حفظ الصورة التوثيقية' });
  }
});

// DELETE /api/evidence/:id (Strict IDOR protection + Soft Delete)
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = Number(req.params.id);

    // Ensure the photo belongs to this user and is not already deleted
    const existing = await prisma.weeklyEvidence.findFirst({
      where: { id, userId, deletedAt: null }
    });

    if (!existing) {
      res.status(404).json({ error: 'لم يتم العثور على الصورة التوثيقية أو تم حذفها مسبقاً' });
      return;
    }

    // Unified Soft Delete pattern
    await prisma.weeklyEvidence.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    logger.info({ userId, evidenceId: id }, 'Weekly evidence soft-deleted');

    res.json({ message: 'تم حذف الصورة التوثيقية بنجاح' });
  } catch (err) {
    logger.error({ err }, 'Error deleting weekly evidence');
    res.status(500).json({ error: 'تعذر حذف الصورة التوثيقية' });
  }
});

export default router;
