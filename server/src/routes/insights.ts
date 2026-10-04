import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { insightAgentLimiter } from '../middleware/rateLimiter.js';
import { analyzeEntry, analyzeAllEntries, loadInsightsForUser, hashEntrySource } from '../services/entryInsightService.js';
import { startAgentJob } from '../services/agentJobService.js';
import { logger } from '../logger.js';

const router = Router();
router.use(authenticate);

// GET /api/insights — all analyses of the current user (or a linked trainee for supervisors)
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let targetUserId = req.user!.userId;
    if (req.query.traineeId && req.user!.role === 'supervisor') {
      const traineeId = Number(req.query.traineeId);
      const isLinked = await prisma.user.findFirst({ where: { id: traineeId, supervisorId: req.user!.userId } });
      if (!isLinked) {
        res.status(403).json({ error: 'المتدرب غير مرتبط بحسابك' });
        return;
      }
      targetUserId = traineeId;
    }
    const insights = await loadInsightsForUser(targetUserId);
    res.json({ insights: Array.from(insights.values()) });
  } catch (err) {
    logger.error({ err }, 'Error fetching entry insights');
    res.status(500).json({ error: 'تعذر جلب تحليلات اليوميات' });
  }
});

function agentOptions(req: AuthenticatedRequest) {
  return {
    apiKey: (req.headers['x-gemini-key'] as string) || undefined,
    model: (req.headers['x-ai-model'] as string) || undefined,
    waitForLocal: true
  };
}

// POST /api/insights/analyze/:entryId — background job: analyse one entry against all earlier entries
router.post('/analyze/:entryId', insightAgentLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const entryId = Number(req.params.entryId);
  if (!Number.isInteger(entryId) || entryId <= 0) {
    res.status(400).json({ error: 'معرّف الإدخال غير صالح' });
    return;
  }
  const exists = await prisma.entry.findFirst({ where: { id: entryId, userId: req.user!.userId, deletedAt: null } });
  if (!exists) {
    res.status(404).json({ error: 'الإدخال غير موجود أو لا تملك صلاحية تحليله' });
    return;
  }
  const userId = req.user!.userId;
  const tenantId = req.user!.tenantId || 'default_tenant';
  const opts = agentOptions(req);
  const job = startAgentJob(userId, `insight:${entryId}`, async (r) => {
    r.progress(10, 'جارٍ قراءة السجلات السابقة وتحليل اليوم');
    const insight = await analyzeEntry(userId, entryId, tenantId, opts);
    await recordAgentUsage(userId, tenantId, insight.mode, 'entry_insight', insight.correctedText.length);
    return { insight };
  });
  res.status(202).json({ jobId: job.id });
});

// POST /api/insights/analyze-all { scope: 'missing' | 'all' } — background job over the whole log
router.post('/analyze-all', insightAgentLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const scope = req.body?.scope === 'all' ? 'all' : 'missing';
  const entryIds: number[] = Array.isArray(req.body?.entryIds)
    ? req.body.entryIds.map(Number).filter((n: number) => Number.isInteger(n) && n > 0).slice(0, 500)
    : [];
  const userId = req.user!.userId;
  const tenantId = req.user!.tenantId || 'default_tenant';
  const opts = agentOptions(req);
  // A scoped run (one week) must not block, or be blocked by, the whole-log run
  const job = startAgentJob(userId, entryIds.length ? `insight:set:${entryIds.join(',')}` : 'insight:all', async (r) => {
    const summary = await analyzeAllEntries(
      userId,
      tenantId,
      scope,
      opts,
      (done, total, label) => {
        r.progress(total ? (done / total) * 100 : 100, total ? `${done}/${total} ${label}` : 'لا توجد يوميات تحتاج تحليلاً');
      },
      entryIds
    );
    await recordAgentUsage(userId, tenantId, 'llm', 'entry_insight_batch', summary.analyzed * 800);
    return summary;
  });
  res.status(202).json({ jobId: job.id });
});

async function recordAgentUsage(userId: number, tenantId: string, mode: string, action: string, outChars: number) {
  try {
    await prisma.aiUsageLog.create({
      data: {
        tenantId,
        userId,
        provider: mode === 'llm' ? 'LocalAgent' : 'AcademicEngine',
        action,
        tokensIn: 0,
        tokensOut: Math.round(outChars / 3.5)
      }
    });
  } catch {
    // usage logging is non-critical
  }
}

// POST /api/insights/:entryId/apply — copy the corrected text into the entry.
// The previous text is archived as a revision first, so nothing is ever lost.
router.post('/:entryId/apply', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const entryId = Number(req.params.entryId);
    const entry = await prisma.entry.findFirst({ where: { id: entryId, userId: req.user!.userId, deletedAt: null } });
    const insight = await prisma.entryInsight.findUnique({ where: { entryId } });
    if (!entry || !insight || insight.userId !== req.user!.userId) {
      res.status(404).json({ error: 'لا يوجد تحليل محفوظ لهذا الإدخال' });
      return;
    }
    const applyTitle = req.body?.applyTitle !== false && insight.correctedTitle.trim().length >= 2;
    const newTitle = applyTitle ? insight.correctedTitle.trim().slice(0, 150) : entry.title;
    const newDescription = insight.correctedText.trim();
    if (newDescription.length < 5) {
      res.status(400).json({ error: 'النص المصحح قصير جداً ولا يمكن تطبيقه' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.entryRevision.create({
        data: {
          entryId: entry.id,
          title: entry.title,
          category: entry.category,
          description: entry.description,
          timeFrom: entry.timeFrom,
          timeTo: entry.timeTo
        }
      });
      const e = await tx.entry.update({ where: { id: entry.id }, data: { title: newTitle, description: newDescription } });
      // The analysis now describes the current text, so it is no longer stale
      await tx.entryInsight.update({
        where: { entryId: entry.id },
        data: { sourceHash: hashEntrySource(newTitle, newDescription) }
      });
      return e;
    });

    res.json({ message: 'تم تطبيق النص المصحح وحفظ النص السابق في سجل التعديلات', entry: updated });
  } catch (err) {
    logger.error({ err }, 'Error applying corrected entry text');
    res.status(500).json({ error: 'تعذر تطبيق النص المصحح' });
  }
});

export default router;
