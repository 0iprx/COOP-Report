import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { enqueueExportJob, getJobStatus, getJobResult } from '../services/jobQueueService.js';
import { generateAcademicDocx, generateWeeklyDocx } from '../services/docxService.js';
import { buildFinalReportData } from '../services/reportService.js';
import { generatePresentationBuffer } from '../services/presentationService.js';
import { logAuditEvent } from '../services/auditService.js';

const router = Router();
router.use(authenticate);

// POST /api/exports/jobs
router.post('/jobs', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, week, lang = 'ar' } = req.body;
    const userId = req.user!.userId;

    if (!type) {
      res.status(400).json({ error: 'نوع المستند المطلوب للتصدير غير محدد' });
      return;
    }

    const jobId = await enqueueExportJob({
      type,
      userId,
      reportData: null,
      params: { week, lang },
      processor: async () => {
        const reportData = await buildFinalReportData(userId);
        if (type === 'weekly_docx') {
          const buffer = await generateWeeklyDocx(reportData, String(week || 1), lang);
          const fileName = `تقرير_الأسبوع_${week}_COOP.docx`;
          return { buffer, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileName };
        } else if (type === 'final_docx') {
          const buffer = await generateAcademicDocx(reportData, lang);
          const fileName = `التقرير_النهائي_${reportData.profile.studentName || 'COOP'}.docx`;
          return { buffer, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileName };
        } else if (type === 'final_pptx') {
          const buffer = await generatePresentationBuffer(reportData, lang);
          const fileName = `عرض_مناقشة_التدريب_التعاوني_${reportData.profile.studentName || 'COOP'}.pptx`;
          return { buffer, mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', fileName };
        }
        throw new Error('نوع تصدير غير مدعوم');
      }
    });

    await logAuditEvent({
      userId,
      tenantId: req.user!.tenantId,
      action: 'EXPORT_JOB_ENQUEUED',
      entityType: 'EXPORT',
      metadata: { type, week, lang, jobId },
      req
    });

    res.json({
      jobId,
      status: 'waiting',
      message: 'تم إدراج مهمة إنشاء المستند في طابور المعالجة بالخلفية بنجاح'
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'فشل في بدء مهمة التصدير' });
  }
});

// GET /api/exports/jobs/:jobId/status
router.get('/jobs/:jobId/status', (req: AuthenticatedRequest, res: Response): void => {
  const { jobId } = req.params;
  const status = getJobStatus(jobId, req.user!.userId);

  if (!status) {
    res.status(404).json({ error: 'المهمة غير موجودة أو انتهت صلاحيتها' });
    return;
  }

  res.json(status);
});

// GET /api/exports/jobs/:jobId/download
router.get('/jobs/:jobId/download', (req: AuthenticatedRequest, res: Response): void => {
  const { jobId } = req.params;
  const result = getJobResult(jobId, req.user!.userId);

  if (!result) {
    res.status(404).json({ error: 'الملف غير متوفر للتحميل أو قيد الإنشاء' });
    return;
  }

  res.setHeader('Content-Type', result.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(result.fileName)}"`);
  res.send(result.buffer);
});

export default router;
