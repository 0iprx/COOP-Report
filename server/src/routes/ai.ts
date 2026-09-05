import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { aiProcessSchema, organizationLookupSchema, computeWordDiff } from '@coop/shared';
import { processTextWithAI } from '../services/aiService.js';
import { lookupAndSynthesizeOrganization } from '../services/organizationSearchService.js';
import { aiQuotaLimiter } from '../middleware/rateLimiter.js';
import { getCached, setCached } from '../services/cacheService.js';
import { prisma } from '../db.js';
import { logger } from '../logger.js';

const router = Router();
router.use(authenticate);

// Helper to record AI usage log
async function recordUsage({
  tenantId = 'default_tenant',
  userId,
  provider,
  action,
  textLength,
  resultLength
}: {
  tenantId?: string;
  userId: number;
  provider: string;
  action: string;
  textLength: number;
  resultLength: number;
}) {
  try {
    const tokensIn = Math.round(textLength / 3.5);
    const tokensOut = Math.round(resultLength / 3.5);
    // Estimated blended cost (~$0.50 per 1M tokens)
    const costEstimate = (tokensIn * 0.0000005) + (tokensOut * 0.0000015);

    await prisma.aiUsageLog.create({
      data: {
        tenantId,
        userId,
        provider,
        action,
        tokensIn,
        tokensOut,
        costEstimate
      }
    });
  } catch (err) {
    // Non-critical logging error
  }
}

// POST /api/ai/organization-lookup (Cached)
router.post('/organization-lookup', aiQuotaLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = organizationLookupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'اسم جهة التدريب مطلوب' });
      return;
    }

    const { organizationName, department } = parseResult.data;
    const cacheKey = `cache:org:${organizationName.toLowerCase().trim()}_${(department || '').toLowerCase().trim()}`;

    // 1. Read-through cache check
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      logger.info({ organizationName }, 'Serving organization lookup from read-through cache');
      res.json(cached);
      return;
    }

    logger.info(
      { userId: req.user!.userId, organizationName, department },
      'Received request for organization academic lookup and synthesis'
    );

    const lookupResult = await lookupAndSynthesizeOrganization(organizationName, department);

    // Save to 7-day cache
    await setCached(cacheKey, lookupResult, 7 * 24 * 60 * 60);

    await recordUsage({
      tenantId: req.user!.tenantId,
      userId: req.user!.userId,
      provider: lookupResult.source.includes('Claude')
        ? 'Claude'
        : lookupResult.source.includes('Gemini')
        ? 'Gemini'
        : lookupResult.source.includes('Llama')
        ? 'Groq'
        : 'AcademicEngine',
      action: 'ORG_LOOKUP',
      textLength: organizationName.length,
      resultLength: lookupResult.entityOverview.length
    });

    res.json(lookupResult);
  } catch (err: any) {
    logger.error({ err }, 'Error in organization academic lookup');
    res.status(500).json({ error: err?.message || 'تعذر استرجاع بيانات جهة التدريب وصياغتها' });
  }
});

// POST /api/ai/process (Synchronous)
router.post('/process', aiQuotaLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = aiProcessSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'بيانات غير صالحة' });
      return;
    }

    const { text, action, targetLang, context } = parseResult.data;

    const { result, mode } = await processTextWithAI({
      text,
      action,
      targetLang,
      context
    });

    const diff = computeWordDiff(text, result);

    await recordUsage({
      tenantId: req.user!.tenantId,
      userId: req.user!.userId,
      provider: mode === 'llm' ? 'ExternalLLM' : 'AcademicEngine',
      action,
      textLength: text.length,
      resultLength: result.length
    });

    res.json({
      original: text,
      result,
      action,
      mode,
      diff
    });
  } catch (err) {
    logger.error({ err }, 'Error in AI processing');
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة النص بالذكاء الاصطناعي' });
  }
});

// POST /api/ai/stream-process (Server-Sent Events streaming)
router.post('/stream-process', aiQuotaLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = aiProcessSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'بيانات غير صالحة' });
      return;
    }

    const { text, action, targetLang, context } = parseResult.data;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.write(`data: ${JSON.stringify({ type: 'start', action })}\n\n`);

    const { result, mode } = await processTextWithAI({
      text,
      action,
      targetLang,
      context
    });

    // Stream out words progressively for visual smooth SSE experience
    const words = result.split(/(\s+)/);
    let buffer = '';

    for (let i = 0; i < words.length; i++) {
      buffer += words[i];
      if (i % 3 === 0 || i === words.length - 1) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', chunk: buffer })}\n\n`);
        buffer = '';
        await new Promise(r => setTimeout(r, 20));
      }
    }

    const diff = computeWordDiff(text, result);
    res.write(`data: ${JSON.stringify({ type: 'done', fullResult: result, mode, diff })}\n\n`);
    res.end();

    await recordUsage({
      tenantId: req.user!.tenantId,
      userId: req.user!.userId,
      provider: mode === 'llm' ? 'ExternalLLM' : 'AcademicEngine',
      action,
      textLength: text.length,
      resultLength: result.length
    });
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'حدث خطأ أثناء بث المعالجة الذكية' })}\n\n`);
    res.end();
  }
});

export default router;
