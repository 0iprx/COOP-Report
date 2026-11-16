import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import * as z from 'zod/v4';
import { LlmProvider, LlmRequest, LlmResult, ProviderError, toDraft } from '../types.js';

const DraftSchema = z.object({
  text: z.string(),
  questions: z.array(z.string()),
  changes: z.array(z.string())
});

type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

/**
 * Claude via the official SDK. Uses structured outputs (schema-validated JSON)
 * and server-side fallbacks so a refusal is retried on a fallback model.
 */
export function createAnthropicProvider(apiKey: string, model: string, effort: Effort): LlmProvider {
  const client = new Anthropic({ apiKey, maxRetries: 2, timeout: 90_000 });

  return {
    id: 'anthropic',
    model,

    async health() {
      try {
        await client.models.retrieve(model);
        return { ok: true };
      } catch (err) {
        if (err instanceof Anthropic.AuthenticationError) return { ok: false, reason: 'مفتاح Anthropic غير صالح' };
        if (err instanceof Anthropic.NotFoundError) return { ok: false, reason: `النموذج ${model} غير متاح لهذا المفتاح` };
        if (err instanceof Anthropic.APIConnectionError) return { ok: false, reason: 'تعذر الاتصال بخدمة Anthropic' };
        if (err instanceof Anthropic.APIError) return { ok: false, reason: `خطأ من Anthropic (${err.status})` };
        return { ok: false, reason: 'خطأ غير متوقع' };
      }
    },

    async generate(req: LlmRequest): Promise<LlmResult> {
      const started = Date.now();
      try {
        const message = await client.beta.messages.parse(
          {
            model,
            max_tokens: req.maxOutputTokens,
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
            system: req.system,
            messages: [{ role: 'user', content: req.user }],
            output_config: { effort, format: betaZodOutputFormat(DraftSchema) }
          },
          { signal: req.signal }
        );

        if (message.stop_reason === 'refusal') {
          throw new ProviderError('anthropic', 'رفض النموذج معالجة هذا النص', false);
        }
        if (message.stop_reason === 'max_tokens') {
          throw new ProviderError('anthropic', 'انقطع الرد قبل اكتماله (النص طويل جداً)', false);
        }
        const draft = toDraft(message.parsed_output);
        if (!draft) throw new ProviderError('anthropic', 'رد غير صالح من النموذج', true);

        return {
          draft,
          provider: 'anthropic',
          model: message.model || model,
          inputTokens: message.usage?.input_tokens ?? 0,
          outputTokens: message.usage?.output_tokens ?? 0,
          latencyMs: Date.now() - started
        };
      } catch (err) {
        if (err instanceof ProviderError) throw err;
        if (err instanceof Anthropic.AuthenticationError) throw new ProviderError('anthropic', 'مفتاح Anthropic غير صالح', false, 401);
        if (err instanceof Anthropic.PermissionDeniedError) throw new ProviderError('anthropic', 'لا يملك المفتاح صلاحية هذا النموذج', false, 403);
        if (err instanceof Anthropic.NotFoundError) throw new ProviderError('anthropic', `النموذج ${model} غير متاح`, false, 404);
        if (err instanceof Anthropic.BadRequestError) throw new ProviderError('anthropic', 'طلب غير مقبول لدى Anthropic', false, 400);
        if (err instanceof Anthropic.RateLimitError) throw new ProviderError('anthropic', 'تم تجاوز حد الطلبات لدى Anthropic', true, 429);
        if (err instanceof Anthropic.InternalServerError) throw new ProviderError('anthropic', 'خطأ مؤقت لدى Anthropic', true, err.status);
        if (err instanceof Anthropic.APIConnectionError) throw new ProviderError('anthropic', 'تعذر الاتصال بخدمة Anthropic', true);
        if (err instanceof Anthropic.APIError) throw new ProviderError('anthropic', `خطأ من Anthropic (${err.status})`, (err.status ?? 0) >= 500, err.status);
        throw new ProviderError('anthropic', 'خطأ غير متوقع عند الاتصال بـ Anthropic', false);
      }
    }
  };
}
