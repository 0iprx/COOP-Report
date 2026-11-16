import { LlmProvider, LlmRequest, LlmResult, ProviderError, toDraft } from '../types.js';

/** Google Gemini over its REST API. The model id comes from GEMINI_MODEL. */
export function createGeminiProvider(apiKey: string, model: string): LlmProvider {
  const base = 'https://generativelanguage.googleapis.com/v1beta';
  // The key travels in a header, not in the URL, so it never lands in proxy logs.
  const headers = { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' };

  return {
    id: 'gemini',
    model,

    async health() {
      try {
        const res = await fetch(`${base}/models/${encodeURIComponent(model)}`, { headers, signal: AbortSignal.timeout(8000) });
        if (res.ok) return { ok: true };
        if (res.status === 400 || res.status === 403) return { ok: false, reason: 'مفتاح Gemini غير صالح' };
        if (res.status === 404) return { ok: false, reason: `النموذج ${model} غير متاح لدى Gemini` };
        return { ok: false, reason: `خطأ من Gemini (${res.status})` };
      } catch {
        return { ok: false, reason: 'تعذر الاتصال بخدمة Gemini' };
      }
    },

    async generate(req: LlmRequest): Promise<LlmResult> {
      const started = Date.now();
      let res: Response;
      try {
        res = await fetch(`${base}/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          headers,
          signal: req.signal ?? AbortSignal.timeout(90_000),
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: req.system }] },
            contents: [{ role: 'user', parts: [{ text: req.user }] }],
            generationConfig: {
              maxOutputTokens: req.maxOutputTokens,
              // JSON mode only; the shape is specified in the prompt and validated by toDraft
              responseMimeType: 'application/json'
            }
          })
        });
      } catch {
        throw new ProviderError('gemini', 'تعذر الاتصال بخدمة Gemini', true);
      }
      if (!res.ok) {
        const retryable = res.status === 429 || res.status >= 500;
        const msg = res.status === 429 ? 'تم تجاوز حد الطلبات لدى Gemini' : res.status === 404 ? `النموذج ${model} غير متاح لدى Gemini` : `خطأ من Gemini (${res.status})`;
        throw new ProviderError('gemini', msg, retryable, res.status);
      }
      const json: any = await res.json().catch(() => null);
      const cand = json?.candidates?.[0];
      if (cand?.finishReason === 'SAFETY' || json?.promptFeedback?.blockReason) {
        throw new ProviderError('gemini', 'رفض النموذج معالجة هذا النص', false);
      }
      if (cand?.finishReason === 'MAX_TOKENS') throw new ProviderError('gemini', 'انقطع الرد قبل اكتماله (النص طويل جداً)', false);
      const text: string = (cand?.content?.parts || []).map((p: any) => p?.text || '').join('');
      let parsed: unknown = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = null;
      }
      const draft = toDraft(parsed);
      if (!draft) throw new ProviderError('gemini', 'رد غير صالح من Gemini', true);
      return {
        draft,
        provider: 'gemini',
        model: json?.modelVersion || model,
        inputTokens: json?.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: json?.usageMetadata?.candidatesTokenCount ?? 0,
        latencyMs: Date.now() - started
      };
    }
  };
}
