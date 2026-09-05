import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { linkSupervisorSchema, calculateHoursBetween } from '@coop/shared';
import { buildFinalReportData } from '../services/reportService.js';
import { generateVerificationHash } from '../services/verificationService.js';
import { logAuditEvent } from '../services/auditService.js';
import { logger } from '../logger.js';

const router = Router();
router.use(authenticate);

// POST /api/supervisor/link (Called by Trainee to link supervisor)
router.post('/link', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = linkSupervisorSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'بيانات غير صالحة' });
      return;
    }

    const { supervisorUsernameOrCode } = parseResult.data;

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

    await logAuditEvent({
      userId: req.user!.userId,
      tenantId: req.user!.tenantId,
      action: 'TRAINEE_LINK_SUPERVISOR',
      entityType: 'SUPERVISOR',
      entityId: supervisor.id,
      metadata: { supervisorUsername: supervisor.username },
      req
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

// POST /api/supervisor/submit-report (Called by Trainee to submit their report for review)
router.post('/submit-report', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.reportProfile.findUnique({ where: { userId } });

    if (!profile) {
      res.status(404).json({ error: 'ملف التقرير غير موجود' });
      return;
    }

    const fromStatus = profile.status || 'draft';
    const toStatus = 'submitted';

    await prisma.$transaction([
      prisma.reportProfile.update({
        where: { userId },
        data: { status: toStatus }
      }),
      prisma.reportStatusHistory.create({
        data: {
          reportId: userId,
          actorId: userId,
          fromStatus,
          toStatus,
          note: 'قام المتدرب بإرسال التقرير النهائي للاعتماد والمراجعة'
        }
      })
    ]);

    await logAuditEvent({
      userId,
      tenantId: req.user!.tenantId,
      action: 'REPORT_SUBMITTED_FOR_REVIEW',
      entityType: 'REPORT',
      entityId: userId,
      req
    });

    res.json({ message: 'تم إرسال التقرير للمشرف الأكاديمي بنجاح، وهو الآن قيد المراجعة', status: toStatus });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر إرسال التقرير للمراجعة' });
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
            supervisorApprovedAt: true,
            status: true,
            verificationHash: true
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

    const summary = trainees.map((t: any) => {
      const totalHours = t.entries.reduce((sum: number, e: any) => sum + calculateHoursBetween(e.timeFrom, e.timeTo), 0);
      const uniqueDays = new Set(t.entries.map((e: any) => e.entryDate)).size;
      const lastEntryDate = t.entries[0]?.entryDate || null;
      const targetHours = t.profile?.courseHours || 280;
      const completionPercent = Math.min(100, Math.round((totalHours / targetHours) * 100));

      let daysSinceLastLog: number | null = null;
      if (lastEntryDate) {
        const last = new Date(lastEntryDate).getTime();
        const now = Date.now();
        daysSinceLastLog = Math.max(0, Math.floor((now - last) / (1000 * 60 * 60 * 24)));
      }

      return {
        id: t.id,
        username: t.username,
        studentName: t.profile?.studentName || t.username,
        trainingNumber: t.profile?.trainingNumber || '',
        department: t.profile?.department || '',
        trainingUnit: t.profile?.trainingUnit || '',
        entityAddress: t.profile?.entityAddress || '',
        courseHours: targetHours,
        trainingWeeks: t.profile?.trainingWeeks || 14,
        supervisorNotes: t.profile?.supervisorNotes || '',
        supervisorRating: t.profile?.supervisorRating || '',
        supervisorApproved: !!t.profile?.supervisorApproved,
        supervisorApprovedAt: t.profile?.supervisorApprovedAt ? t.profile.supervisorApprovedAt.toISOString() : null,
        status: t.profile?.status || 'draft',
        verificationHash: t.profile?.verificationHash || null,
        totalHours: Number(totalHours.toFixed(1)),
        totalDays: uniqueDays,
        totalTasks: t.entries.length,
        completionPercent,
        daysSinceLastLog,
        lastEntryDate
      };
    });

    res.json({ trainees: summary });
  } catch (err) {
    logger.error({ err }, 'Error listing trainees');
    res.status(500).json({ error: 'تعذر جلب قائمة المتدربين' });
  }
});

// GET /api/supervisor/analytics (Supervisor Analytics Overview)
router.get('/analytics', requireRole('supervisor'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const supervisorId = req.user!.userId;
    const trainees = await prisma.user.findMany({
      where: { supervisorId },
      include: {
        profile: true,
        entries: { where: { deletedAt: null } }
      }
    });

    const totalStudents = trainees.length;
    let pendingReviews = 0;
    let approvedCount = 0;
    let totalLoggedHours = 0;
    let overdueCount = 0;

    for (const t of trainees) {
      if (t.profile?.status === 'submitted' || t.profile?.status === 'under_review') {
        pendingReviews++;
      }
      if (t.profile?.supervisorApproved) {
        approvedCount++;
      }
      const hours = t.entries.reduce((sum: number, e: any) => sum + calculateHoursBetween(e.timeFrom, e.timeTo), 0);
      totalLoggedHours += hours;

      const latestDate = t.entries[0]?.entryDate;
      if (latestDate) {
        const days = Math.floor((Date.now() - new Date(latestDate).getTime()) / (1000 * 3600 * 24));
        if (days > 7) overdueCount++;
      } else {
        overdueCount++;
      }
    }

    res.json({
      totalStudents,
      pendingReviews,
      approvedCount,
      totalLoggedHours: Math.round(totalLoggedHours),
      overdueCount
    });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل في استرجاع تحليلات المشرف' });
  }
});

// GET /api/supervisor/trainees/:id/report
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
      const comments = await prisma.reportSectionComment.findMany({
        where: { reportId: traineeId },
        orderBy: { createdAt: 'desc' }
      });
      const history = await prisma.reportStatusHistory.findMany({
        where: { reportId: traineeId },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        ...reportData,
        comments,
        statusHistory: history
      });
    } catch (err) {
      logger.error({ err }, 'Error viewing trainee report');
      res.status(500).json({ error: 'تعذر جلب تقرير المتدرب' });
    }
  }
);

// POST /api/supervisor/trainees/:id/comments (Add Section Inline Comment)
router.post(
  '/trainees/:id/comments',
  requireRole('supervisor'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const traineeId = Number(req.params.id);
      const { sectionKey, comment } = req.body;

      if (!sectionKey || !comment?.trim()) {
        res.status(400).json({ error: 'القسم والملاحظة مطلوبان' });
        return;
      }

      const created = await prisma.reportSectionComment.create({
        data: {
          reportId: traineeId,
          supervisorId: req.user!.userId,
          sectionKey,
          comment: comment.trim()
        }
      });

      res.status(201).json({ message: 'تمت إضافة ملاحظة المشرف بنجاح', comment: created });
    } catch (err: any) {
      res.status(500).json({ error: 'تعذر إضافة الملاحظة' });
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
      const { notes, rating, approved, status } = req.body;

      const isLinked = await prisma.user.findFirst({
        where: { id: traineeId, supervisorId: req.user!.userId }
      });

      if (!isLinked) {
        res.status(403).json({ error: 'غير مصرح: هذا المتدرب غير مرتبط بإشرافك' });
        return;
      }

      const approvedAtDate = approved ? new Date() : null;
      let verificationHash: string | null = null;

      if (approved && approvedAtDate) {
        verificationHash = generateVerificationHash(traineeId, approvedAtDate, req.user!.userId);
      }

      const currentProfile = await prisma.reportProfile.findUnique({ where: { userId: traineeId } });
      const fromStatus = currentProfile?.status || 'draft';
      const toStatus = status || (approved ? 'approved' : 'under_review');

      const [updated] = await prisma.$transaction([
        prisma.reportProfile.update({
          where: { userId: traineeId },
          data: {
            supervisorNotes: typeof notes === 'string' ? notes : undefined,
            supervisorRating: typeof rating === 'string' ? rating : undefined,
            supervisorApproved: typeof approved === 'boolean' ? approved : undefined,
            supervisorApprovedAt: approvedAtDate,
            verificationHash,
            status: toStatus
          }
        }),
        prisma.reportStatusHistory.create({
          data: {
            reportId: traineeId,
            actorId: req.user!.userId,
            fromStatus,
            toStatus,
            note: approved ? `تم اعتماد التقرير وتوليد رمز التحقق الأمني الرقمي (${rating || 'معتمد'})` : 'تحديث حالة مراجعة التقرير'
          }
        })
      ]);

      await logAuditEvent({
        userId: req.user!.userId,
        tenantId: req.user!.tenantId,
        action: approved ? 'REPORT_OFFICIALLY_APPROVED' : 'REPORT_EVALUATION_UPDATED',
        entityType: 'REPORT',
        entityId: traineeId,
        metadata: { rating, approved, status: toStatus },
        req
      });

      res.json({
        message: approved ? 'تم اعتماد التقرير رسمياً وتوليد رمز التحقق الموثق بنجاح' : 'تم حفظ التقييم والملاحظات بنجاح',
        profile: updated
      });
    } catch (err) {
      logger.error({ err }, 'Error evaluating trainee');
      res.status(500).json({ error: 'تعذر حفظ التقييم' });
    }
  }
);

export default router;
