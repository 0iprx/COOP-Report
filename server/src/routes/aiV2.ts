import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { aiQuotaLimiter } from '../middleware/rateLimiter.js';
import { prisma } from '../db.js';
import { logger } from '../logger.js';
import { AiUserError, createLibraryCheck, createSuggestion, decideSuggestion } from '../ai/engine.js';
import { loadLearning, updateLearningByUser } from '../ai/learning.js';
import { hasAnyProvider, providerStatuses } from '../ai/registry.js';
import { SECTION_KEYS, TASK_IDS } from '../ai/tasks.js';
import { ProviderError } from '../ai/types.js';

const router = Router();
router.use(authenticate);

const suggestSchema = z.object({
  task: z.enum(TASK_IDS),
  text: z.string().max(20000).default(''),
  lang: z.enum(['ar', 'en']).default('ar'),
  targetLang: z.enum(['ar', 'en']).optional(),
  target: z.discriminatedUnion('type', [
    z.object({ type: z.literal('entry'), id: z.number().int().positive(), field: z.enum(['description', 'title']).default('description') }),
    z.object({ type: z.literal('section'), key: z.enum(SECTION_KEYS) }),
    z.object({ type: z.literal('free') })
  ]),
  answers: z.array(z.object({ question: z.string().max(400), answer: z.string().max(2000) })).max(5).optional()
});

const decideSchema = z.object({
  decision: z.enum(['accepted', 'rejected']),
  finalText: z.string().max(20000).optional()
});

const memorySchema = z.object({
  glossary: z.array(z.object({ term: z.string().max(80), preferred: z.string().max(80) })).max(60).optional(),
  notes: z.array(z.string().max(300)).max(15).optional(),
  avoidPhrases: z.array(z.string().max(120)).max(30).optional(),
  reset: z.boolean().optional()
});

function sendError(res: Response, err: unknown, fallback: string) {
  if (err instanceof AiUserError) return res.status(err.status).json({ error: err.message });
  if (err instanceof ProviderError) return res.status(err.status === 503 ? 503 : 502).json({ error: err.message, provider: err.provider });
  logger.error({ err }, fallback);
  return res.status(500).json({ error: fallback });
}

// GET /api/ai/v2/status — which providers are configured and actually reachable
router.get('/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const providers = await providerStatuses(req.query.refresh === '1');
    res.json({ available: providers.some((p) => p.ok), configured: hasAnyProvider(), providers });
  } catch (err) {
    sendError(res, err, 'تعذر فحص خدمات الذكاء الاصطناعي');
  }
});

// POST /api/ai/v2/suggest — produce a suggestion; never writes into user content
router.post('/suggest', aiQuotaLimiter, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = suggestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message || 'طلب غير صالح' });
  if (!hasAnyProvider()) return res.status(503).json({ error: 'لم تُهيأ أي خدمة ذكاء اصطناعي على الخادم بعد' });
  try {
    const out = await createSuggestion({ ...parsed.data, userId: req.user!.userId, tenantId: req.user!.tenantId });
    res.json(out);
  } catch (err) {
    sendError(res, err, 'تعذر إنشاء الاقتراح');
  }
});

// POST /api/ai/v2/check — instant writing check with the built-in library (no model, always available)
const checkSchema = z.object({
  text: z.string().max(40000),
  target: suggestSchema.shape.target
});
router.post('/check', async (req: AuthenticatedRequest, res: Response) => {
  const parsed = checkSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message || 'طلب غير صالح' });
  try {
    res.json(await createLibraryCheck({ userId: req.user!.userId, text: parsed.data.text, target: parsed.data.target }));
  } catch (err) {
    sendError(res, err, 'تعذر فحص النص');
  }
});

// POST /api/ai/v2/suggestions/:id/decide — accept (optionally edited) or reject
router.post('/suggestions/:id/decide', async (req: AuthenticatedRequest, res: Response) => {
  const parsed = decideSchema.safeParse(req.body);
  const id = Number(req.params.id);
  if (!parsed.success || !Number.isInteger(id)) return res.status(400).json({ error: 'طلب غير صالح' });
  try {
    res.json(await decideSuggestion(req.user!.userId, id, parsed.data.decision, parsed.data.finalText));
  } catch (err) {
    sendError(res, err, 'تعذر حفظ القرار');
  }
});

// GET /api/ai/v2/suggestions — recent suggestions (history and restore points)
router.get('/suggestions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rows = await prisma.aiSuggestion.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { id: true, task: true, targetType: true, targetId: true, status: true, provider: true, model: true, createdAt: true, decidedAt: true }
    });
    res.json({ suggestions: rows });
  } catch (err) {
    sendError(res, err, 'تعذر جلب سجل الاقتراحات');
  }
});

// GET/PUT /api/ai/v2/memory — what the assistant has learned; fully visible and editable by the trainee
router.get('/memory', async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ memory: await loadLearning(req.user!.userId) });
  } catch (err) {
    sendError(res, err, 'تعذر جلب ذاكرة المساعد');
  }
});

router.put('/memory', async (req: AuthenticatedRequest, res: Response) => {
  const parsed = memorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'بيانات غير صالحة' });
  try {
    res.json({ memory: await updateLearningByUser(req.user!.userId, parsed.data) });
  } catch (err) {
    sendError(res, err, 'تعذر حفظ ذاكرة المساعد');
  }
});

export default router;
