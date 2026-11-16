import { LlmProvider, LlmRequest, LlmResult, ProviderError, ProviderId, toDraft } from '../types.js';

/**
 * OpenAI and Groq share the chat-completions wire format.
 * The model id always comes from configuration; nothing is guessed here.
 */
export function createOpenAiCompatibleProvider(
  id: Extract<ProviderId, 'openai' | 'groq'>,
  apiKey: string,
  model: string
): LlmProvider {
  const base = id === 'openai' ? 'https://api.openai.com/v1' : 'https://api.groq.com/openai/v1';
  const label = id === 'openai' ? 'OpenAI' : 'Groq';
  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  return {
    id,
    model,

    async health() {
      try {
        const res = await fetch(`${base}/models/${encodeURIComponent(model)}`, { headers, signal: AbortSignal.timeout(8000) });
        if (res.ok) return { ok: true };
        if (res.status === 401) return { ok: false, reason: `مفتاح ${label} غير صالح` };
        if (res.status === 404) return { ok: false, reason: `النموذج ${model} غير متاح لدى ${label}` };
        return { ok: false, reason: `خطأ من ${label} (${res.status})` };
      } catch {
        return { ok: false, reason: `تعذر الاتصال بخدمة ${label}` };
      }
    },

    async generate(req: LlmRequest): Promise<LlmResult> {
      const started = Date.now();
      let res: Response;
      try {
        res = await fetch(`${base}/chat/completions`, {
          method: 'POST',
          headers,
          signal: req.signal ?? AbortSignal.timeout(90_000),
          body: JSON.stringify({
            model,
            max_tokens: req.maxOutputTokens,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: req.system },
              { role: 'user', content: req.user }
            ]
          })
        });
      } catch {
        throw new ProviderError(id, `تعذر الاتصال بخدمة ${label}`, true);
      }
      if (!res.ok) {
        const retryable = res.status === 429 || res.status >= 500;
        const msg = res.status === 401 ? `مفتاح ${label} غير صالح` : res.status === 429 ? `تم تجاوز حد الطلبات لدى ${label}` : `خطأ من ${label} (${res.status})`;
        throw new ProviderError(id, msg, retryable, res.status);
      }
      const json: any = await res.json().catch(() => null);
      const content: string | undefined = json?.choices?.[0]?.message?.content;
      const finish: string | undefined = json?.choices?.[0]?.finish_reason;
      if (finish === 'length') throw new ProviderError(id, 'انقطع الرد قبل اكتماله (النص طويل جداً)', false);
      let parsed: unknown = null;
      try {
        parsed = content ? JSON.parse(content) : null;
      } catch {
        parsed = null;
      }
      const draft = toDraft(parsed);
      if (!draft) throw new ProviderError(id, `رد غير صالح من ${label}`, true);
      return {
        draft,
        provider: id,
        model: json?.model || model,
        inputTokens: json?.usage?.prompt_tokens ?? 0,
        outputTokens: json?.usage?.completion_tokens ?? 0,
        latencyMs: Date.now() - started
      };
    }
  };
}
