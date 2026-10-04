import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { insightAgentLimiter } from '../middleware/rateLimiter.js';
import { startAgentJob } from '../services/agentJobService.js';
import {
  generatePeriodReport,
  getPeriodReport,
  listPeriods,
  listVersions,
  retryEnglishEdition
} from '../services/periodReportService.js';
import { generatePeriodReportDocx, generatePeriodReportPptx } from '../services/periodReportExportService.js';
import { buildFinalReportData } from '../services/reportService.js';
import { logger } from '../logger.js';
import { PeriodType } from '@coop/shared';

const router = Router();
router.use(authenticate);

function agentOptions(req: AuthenticatedRequest) {
  return {
    apiKey: (req.headers['x-gemini-key'] as string) || undefined,
    model: (req.headers['x-ai-model'] as string) || undefined,
    waitForLocal: true
  };
}

function parseType(v: unknown): PeriodType | null {
  return v === 'weekly' || v === 'monthly' ? v : null;
}

// GET /api/period-reports/periods — weeks and months that have entries, with latest version numbers
router.get('/periods', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.json(await listPeriods(req.user!.userId));
  } catch (err) {
    logger.error({ err }, 'Error listing report periods');
    res.status(500).json({ error: 'تعذر جلب فترات التقارير' });
  }
});

// GET /api/period-reports/:type/:key/versions — version history (newest first)
router.get('/:type/:key/versions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const type = parseType(req.params.type);
  if (!type) {
    res.status(400).json({ error: 'نوع التقرير غير صالح' });
    return;
  }
  try {
    res.json({ versions: await listVersions(req.user!.userId, type, req.params.key) });
  } catch (err) {
    logger.error({ err }, 'Error listing period report versions');
    res.status(500).json({ error: 'تعذر جلب نسخ التقرير' });
  }
});

// POST /api/period-reports/:type/:key/generate — background job creating a new version (AR + EN)
router.post('/:type/:key/generate', insightAgentLimiter, (req: AuthenticatedRequest, res: Response): void => {
  const type = parseType(req.params.type);
  if (!type) {
    res.status(400).json({ error: 'نوع التقرير غير صالح' });
    return;
  }
  const key = String(req.params.key);
  const userId = req.user!.userId;
  const tenantId = req.user!.tenantId || 'default_tenant';
  const opts = agentOptions(req);
  const job = startAgentJob(userId, `period:${type}:${key}`, async (r) => ({
    report: await generatePeriodReport(userId, tenantId, type, key, opts, r)
  }));
  res.status(202).json({ jobId: job.id });
});

// POST /api/period-reports/:id/retry-en — rebuild only the English edition of a version
router.post('/:id/retry-en', insightAgentLimiter, (req: AuthenticatedRequest, res: Response): void => {
  const id = Number(req.params.id);
  const userId = req.user!.userId;
  const opts = agentOptions(req);
  const job = startAgentJob(userId, `period-en:${id}`, async (r) => {
    r.progress(20, 'إعداد النسخة الإنجليزية');
    return { report: await retryEnglishEdition(userId, id, opts) };
  });
  res.status(202).json({ jobId: job.id });
});

// GET /api/period-reports/:id — one version with both language editions
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const report = await getPeriodReport(req.user!.userId, Number(req.params.id)).catch(() => null);
  if (!report) {
    res.status(404).json({ error: 'التقرير غير موجود' });
    return;
  }
  res.json({ report });
});

// GET /api/period-reports/:id/export/:format?lang=ar|en — Word or PowerPoint
router.get('/:id/export/:format', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lang = req.query.lang === 'en' ? 'en' : 'ar';
    const format = req.params.format;
    const report = await getPeriodReport(req.user!.userId, Number(req.params.id));
    const content = lang === 'en' ? report?.contentEn : report?.contentAr;
    if (!report || !content) {
      res.status(404).json({ error: lang === 'en' ? 'النسخة الإنجليزية غير متوفرة لهذا الإصدار' : 'التقرير غير موجود' });
      return;
    }
    const { profile } = await buildFinalReportData(req.user!.userId);
    const base = `${report.periodType === 'weekly' ? 'Weekly' : 'Monthly'}_Report_${report.periodKey}_v${report.version}_${lang}`;

    if (format === 'docx') {
      const buf = await generatePeriodReportDocx(content, report.stats, profile, lang);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${base}.docx"`);
      res.send(buf);
      return;
    }
    if (format === 'pptx') {
      const buf = await generatePeriodReportPptx(content, report.stats, profile, lang);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.setHeader('Content-Disposition', `attachment; filename="${base}.pptx"`);
      res.send(buf);
      return;
    }
    res.status(400).json({ error: 'صيغة التصدير غير مدعومة' });
  } catch (err) {
    logger.error({ err }, 'Error exporting period report');
    res.status(500).json({ error: 'تعذر تصدير التقرير' });
  }
});

export default router;
