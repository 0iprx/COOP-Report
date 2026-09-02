import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { aiProcessSchema, computeWordDiff } from '@coop/shared';
import { processTextWithAI } from '../services/aiService.js';
import { logger } from '../logger.js';

const router = Router();
router.use(authenticate);

// POST /api/ai/process
router.post('/process', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = aiProcessSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'بيانات غير صالحة' });
      return;
    }

    const { text, action, targetLang, context } = parseResult.data;

    logger.info(
      { userId: req.user!.userId, action, targetLang, textLength: text.length },
      'Processing text with AI service'
    );

    const { result, mode } = await processTextWithAI({
      text,
      action,
      targetLang,
      context
    });

    // Compute visual diff between original and modified text
    const diff = computeWordDiff(text, result);

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

export default router;
