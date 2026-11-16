import { logger } from '../logger.js';
import { createAnthropicProvider } from './providers/anthropic.js';
import { createGeminiProvider } from './providers/gemini.js';
import { createLocalProvider } from './providers/local.js';
import { createOpenAiCompatibleProvider } from './providers/openaiCompatible.js';
import { LlmProvider, LlmRequest, LlmResult, ProviderError, ProviderId, ProviderStatus } from './types.js';

const env = (k: string) => (process.env[k] || '').trim().replace(/^["']|["']$/g, '') || undefined;

/**
 * Builds the provider chain from environment variables.
 * A provider joins the chain only when both its key and its model are set;
 * Claude has a documented default model, the others must be configured.
 */
function buildProviders(): { chain: LlmProvider[]; statuses: ProviderStatus[] } {
  const effortRaw = env('AI_EFFORT');
  const effort = (['low', 'medium', 'high', 'xhigh', 'max'].includes(effortRaw || '') ? effortRaw : 'high') as
    | 'low' | 'medium' | 'high' | 'xhigh' | 'max';

  const defs: Record<ProviderId, { key?: string; model?: string; make: (k: string, m: string) => LlmProvider }> = {
    // Model running inside this server process. "key" is the GGUF file path; no API key, no cost per request.
    local: {
      key: env('LOCAL_AI_MODEL_PATH'),
      model: env('LOCAL_AI_MODEL_PATH') ? 'local-gguf' : undefined,
      make: (modelPath) =>
        createLocalProvider(modelPath, {
          contextSize: Number(env('LOCAL_AI_CONTEXT')) || 8192,
          gpu: env('LOCAL_AI_GPU') !== 'false',
          threads: Number(env('LOCAL_AI_THREADS')) || undefined
        })
    },
    anthropic: { key: env('ANTHROPIC_API_KEY'), model: env('ANTHROPIC_MODEL') || 'claude-opus-5-5', make: (k, m) => createAnthropicProvider(k, m, effort) },
    openai: { key: env('OPENAI_API_KEY'), model: env('OPENAI_MODEL'), make: (k, m) => createOpenAiCompatibleProvider('openai', k, m) },
    gemini: { key: env('GEMINI_API_KEY'), model: env('GEMINI_MODEL'), make: (k, m) => createGeminiProvider(k, m) },
    groq: { key: env('GROQ_API_KEY'), model: env('GROQ_MODEL'), make: (k, m) => createOpenAiCompatibleProvider('groq', k, m) }
  };

  // Default: the self-hosted model only. Paid APIs join only if listed explicitly here.
  const order = (env('AI_PROVIDER_ORDER') || 'local')
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is ProviderId => s in defs);

  const chain: LlmProvider[] = [];
  const statuses: ProviderStatus[] = [];
  for (const id of order) {
    const d = defs[id];
    if (d.key && d.model) {
      chain.push(d.make(d.key, d.model));
      statuses.push({ id, configured: true, model: chain[chain.length - 1].model, ok: null });
    } else {
      statuses.push({
        id,
        configured: false,
        model: d.model || null,
        ok: false,
        reason: id === 'local' ? 'لم يُحدد مسار ملف النموذج (LOCAL_AI_MODEL_PATH)' : !d.key ? 'لا يوجد مفتاح' : 'لم يُحدد اسم النموذج'
      });
    }
  }
  return { chain, statuses };
}

let state = buildProviders();
logger.info({ providers: state.statuses.map((s) => `${s.id}:${s.configured ? s.model : 'off'}`) }, 'AI providers configured');

/** For tests: rebuild from the current environment. */
export function reloadProviders(): void {
  state = buildProviders();
}

/** For tests: inject a provider chain directly. */
export function setProvidersForTest(chain: LlmProvider[]): void {
  state = { chain, statuses: chain.map((p) => ({ id: p.id, configured: true, model: p.model, ok: null })) };
}

export const hasAnyProvider = () => state.chain.length > 0;

let lastHealth: { at: number; statuses: ProviderStatus[] } | null = null;

export async function providerStatuses(force = false): Promise<ProviderStatus[]> {
  if (!force && lastHealth && Date.now() - lastHealth.at < 5 * 60_000) return lastHealth.statuses;
  const checked = await Promise.all(
    state.statuses.map(async (s) => {
      if (!s.configured) return s;
      const p = state.chain.find((c) => c.id === s.id)!;
      const h = await p.health();
      return { ...s, ok: h.ok, reason: h.reason, checkedAt: new Date().toISOString() };
    })
  );
  lastHealth = { at: Date.now(), statuses: checked };
  return checked;
}

/**
 * Runs the request through the chain: each provider gets one retry on a
 * retryable error, then the next provider is tried. The caller sees which
 * provider answered, or every failure reason if none did.
 */
export async function generateWithChain(req: LlmRequest): Promise<LlmResult> {
  if (state.chain.length === 0) {
    throw new ProviderError('anthropic', 'لم تُهيأ أي خدمة ذكاء اصطناعي على الخادم', false, 503);
  }
  const failures: string[] = [];
  for (const provider of state.chain) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await provider.generate(req);
      } catch (err) {
        const pe = err instanceof ProviderError ? err : new ProviderError(provider.id, 'خطأ غير متوقع', false);
        logger.warn({ provider: provider.id, attempt, status: pe.status, retryable: pe.retryable, msg: pe.message }, 'AI provider call failed');
        if (pe.retryable && attempt === 1) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }
        failures.push(`${provider.id}: ${pe.message}`);
        break;
      }
    }
  }
  throw new ProviderError(state.chain[0].id, `تعذر الحصول على رد من خدمات الذكاء الاصطناعي (${failures.join(' | ')})`, false, 502);
}
