import { Router, Request, Response } from 'express';
import { verifyReportByHash } from '../services/verificationService.js';

const router = Router();

/**
 * GET /api/verify/:reportId/:hash
 * Public tamper-proof verification route
 */
router.get('/:reportId/:hash', async (req: Request, res: Response): Promise<void> => {
  try {
    const reportId = parseInt(req.params.reportId);
    const hash = String(req.params.hash || '').trim();

    if (isNaN(reportId) || !hash) {
      res.status(400).json({ valid: false, error: 'معرف التقرير أو رمز التحقق غير صالح' });
      return;
    }

    const verificationResult = await verifyReportByHash(reportId, hash);

    if (!verificationResult) {
      res.status(404).json({
        valid: false,
        error: 'لم يتم العثور على وثيقة معتمدة مطابقة لرمز التحقق هذا، أو قد تم سحب الاعتماد'
      });
      return;
    }

    res.json(verificationResult);
  } catch (err: any) {
    res.status(500).json({ valid: false, error: 'تعذر التحقق من الوثيقة حالياً' });
  }
});

export default router;
