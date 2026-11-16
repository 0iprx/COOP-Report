import fs from 'node:fs';
import path from 'node:path';
// node-llama-cpp is optional: it is not a deploy dependency. Install it only on a host
// that will actually run a model (npm i node-llama-cpp in server/). Loaded on first use.
type Llama = any;
type LlamaContext = any;
type LlamaModel = any;
type LlamaJsonSchemaGrammar<_T> = any;
const RUNTIME_MODULE = 'node-llama-cpp';
async function loadRuntime(): Promise<any> {
  try {
    return await import(RUNTIME_MODULE);
  } catch {
    throw new Error('مكتبة تشغيل النموذج غير مثبتة على الخادم (node-llama-cpp)');
  }
}
import { logger } from '../../logger.js';
import { AI_DRAFT_JSON_SCHEMA, LlmProvider, LlmRequest, LlmResult, ProviderError, toDraft } from '../types.js';

/**
 * A model that runs inside this server process (llama.cpp via node-llama-cpp).
 * No external service and no per-request cost: the text never leaves the server.
 *
 * The model loads once, on first use, and requests are served one at a time.
 * Output is constrained by a JSON-schema grammar, so it always matches AiDraft.
 */

interface Loaded {
  llama: Llama;
  model: LlamaModel;
  context: LlamaContext;
  grammar: LlamaJsonSchemaGrammar<any>;
}

export interface LocalModelInfo {
  state: 'idle' | 'loading' | 'ready' | 'error';
  backend?: string;
  gpuLayers?: number;
  loadMs?: number;
  error?: string;
}

export function createLocalProvider(modelPath: string, opts: { contextSize: number; gpu: boolean; threads?: number }): LlmProvider & { info(): LocalModelInfo } {
  const name = path.basename(modelPath).replace(/-0000\d-of-0000\d/, '').replace(/\.gguf$/i, '');
  let loading: Promise<Loaded> | null = null;
  const info: LocalModelInfo = { state: 'idle' };
  let queue: Promise<unknown> = Promise.resolve();

  const load = () => {
    if (loading) return loading;
    info.state = 'loading';
    const started = Date.now();
    loading = (async () => {
      const { getLlama } = await loadRuntime();
      const llama = await getLlama({ gpu: opts.gpu ? 'auto' : false });
      const model = await llama.loadModel({ modelPath, gpuLayers: opts.gpu ? 'auto' : 0 });
      const context = await model.createContext({ contextSize: opts.contextSize, sequences: 1, threads: opts.threads });
      const grammar = await llama.createGrammarForJsonSchema(AI_DRAFT_JSON_SCHEMA as any);
      info.state = 'ready';
      info.backend = llama.gpu ? String(llama.gpu) : 'cpu';
      info.gpuLayers = model.gpuLayers;
      info.loadMs = Date.now() - started;
      logger.info({ model: name, backend: info.backend, gpuLayers: info.gpuLayers, loadMs: info.loadMs }, 'Local AI model loaded');
      return { llama, model, context, grammar };
    })().catch((err) => {
      info.state = 'error';
      info.error = String(err?.message || err);
      loading = null;
      logger.error({ err: info.error }, 'Local AI model failed to load');
      throw err;
    });
    return loading;
  };

  return {
    id: 'local',
    model: name,
    info: () => ({ ...info }),

    async health() {
      if (!fs.existsSync(modelPath)) return { ok: false, reason: `ملف النموذج غير موجود على الخادم (${path.basename(modelPath)})` };
      if (info.state === 'error') return { ok: false, reason: `تعذر تحميل النموذج: ${info.error}` };
      return { ok: true };
    },

    generate(req: LlmRequest): Promise<LlmResult> {
      // Serialize: one context sequence, one generation at a time.
      const run = async (): Promise<LlmResult> => {
        if (!fs.existsSync(modelPath)) throw new ProviderError('local', 'ملف النموذج غير موجود على الخادم', false, 503);
        let loaded: Loaded;
        let LlamaChatSession: any;
        try {
          loaded = await load();
          ({ LlamaChatSession } = await loadRuntime());
        } catch (err: any) {
          throw new ProviderError('local', `تعذر تحميل النموذج المحلي: ${err?.message || err}`, false, 503);
        }
        const started = Date.now();
        const sequence = loaded.context.getSequence();
        const session = new LlamaChatSession({ contextSequence: sequence, systemPrompt: req.system });
        try {
          const inputTokens = loaded.model.tokenize(req.system + '\n' + req.user).length;
          if (inputTokens + req.maxOutputTokens > opts.contextSize + 2000) {
            throw new ProviderError('local', 'النص أطول مما يتسع له النموذج المحلي دفعة واحدة', false, 413);
          }
          const out = await session.prompt(req.user, {
            grammar: loaded.grammar,
            maxTokens: Math.min(req.maxOutputTokens, Math.max(512, opts.contextSize - inputTokens - 64)),
            temperature: 0.2,
            signal: req.signal
          });
          let parsed: unknown = null;
          try {
            parsed = loaded.grammar.parse(out);
          } catch {
            parsed = null;
          }
          const draft = toDraft(parsed);
          if (!draft) throw new ProviderError('local', 'رد غير مكتمل من النموذج المحلي (ربما النص طويل جداً)', false);
          return {
            draft,
            provider: 'local',
            model: name,
            inputTokens,
            outputTokens: loaded.model.tokenize(out).length,
            latencyMs: Date.now() - started
          };
        } catch (err: any) {
          if (err instanceof ProviderError) throw err;
          if (err?.name === 'AbortError') throw new ProviderError('local', 'أُلغي الطلب', false);
          throw new ProviderError('local', `خطأ أثناء التوليد المحلي: ${err?.message || err}`, false);
        } finally {
          session.dispose({ disposeSequence: true });
        }
      };
      const p = queue.then(run, run);
      queue = p.catch(() => undefined);
      return p;
    }
  };
}
