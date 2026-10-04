import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { logger } from '../logger.js';

/**
 * Built-in local language model — the site's own AI agent, with no API key and no external AI service.
 *
 * An open-weights instruction model (Qwen2.5, strong Arabic + English) runs inside the Node process via
 * llama.cpp. The model file is downloaded once into MODELS_DIR and reused; the size is chosen from the
 * memory actually available to the container:
 *   >= 3.5 GB  -> Qwen2.5-3B-Instruct  (Q4_K_M, ~2.1 GB)   "strong"
 *   >= 1.8 GB  -> Qwen2.5-1.5B-Instruct (Q4_K_M, ~1.1 GB)  "light"
 *   otherwise  -> disabled; callers fall back to the rule-based academic engine.
 *
 * Environment overrides:
 *   LOCAL_LLM=auto|strong|light|off   (default auto)
 *   LOCAL_LLM_MODEL=<hf: uri or local .gguf path>
 *   MODELS_DIR=<directory for model files>  (mount a persistent volume here in production)
 *   LOCAL_LLM_PRELOAD=false            (do not start downloading/loading at boot)
 */

type Tier = 'strong' | 'light';

const MODEL_URIS: Record<Tier, string> = {
  strong: 'hf:Qwen/Qwen2.5-3B-Instruct-GGUF/qwen2.5-3b-instruct-q4_k_m.gguf',
  light: 'hf:Qwen/Qwen2.5-1.5B-Instruct-GGUF/qwen2.5-1.5b-instruct-q4_k_m.gguf'
};

export type LocalEngineState = 'disabled' | 'idle' | 'downloading' | 'loading' | 'ready' | 'error';

interface EngineStatus {
  state: LocalEngineState;
  tier: Tier | null;
  model: string | null;
  availableMemoryGb: number;
  downloadedBytes: number;
  totalBytes: number;
  error?: string;
}

const status: EngineStatus = {
  state: 'idle',
  tier: null,
  model: null,
  availableMemoryGb: 0,
  downloadedBytes: 0,
  totalBytes: 0
};

let llama: any = null;
let model: any = null;
let context: any = null;
let sequence: any = null;
let initPromise: Promise<boolean> | null = null;
let queue: Promise<unknown> = Promise.resolve();

/** Memory limit of this container (cgroup aware), falling back to the host total */
function detectAvailableMemoryBytes(): number {
  let limit = os.totalmem();
  const candidates = ['/sys/fs/cgroup/memory.max', '/sys/fs/cgroup/memory/memory.limit_in_bytes'];
  for (const file of candidates) {
    try {
      const raw = fs.readFileSync(file, 'utf8').trim();
      const n = Number(raw);
      if (raw !== 'max' && Number.isFinite(n) && n > 0 && n < limit) limit = n;
    } catch {
      // not running under cgroups
    }
  }
  return limit;
}

function pickTier(): Tier | null {
  const mode = (process.env.LOCAL_LLM || 'auto').trim().toLowerCase();
  if (mode === 'off' || mode === 'false' || mode === '0') return null;
  if (mode === 'strong' || mode === 'light') return mode;
  const gb = detectAvailableMemoryBytes() / 1024 ** 3;
  if (gb >= 3.5) return 'strong';
  if (gb >= 1.8) return 'light';
  return null;
}

export function getLocalEngineStatus(): EngineStatus {
  status.availableMemoryGb = Number((detectAvailableMemoryBytes() / 1024 ** 3).toFixed(1));
  return { ...status };
}

async function initEngine(): Promise<boolean> {
  const tier = pickTier();
  status.availableMemoryGb = Number((detectAvailableMemoryBytes() / 1024 ** 3).toFixed(1));
  if (!tier && !process.env.LOCAL_LLM_MODEL) {
    status.state = 'disabled';
    logger.info({ memGb: status.availableMemoryGb }, 'Local AI engine disabled (not enough memory or LOCAL_LLM=off)');
    return false;
  }

  status.tier = tier || 'strong';
  const uri = process.env.LOCAL_LLM_MODEL?.trim() || MODEL_URIS[status.tier];
  status.model = uri;
  const modelsDir = path.resolve(process.env.MODELS_DIR?.trim() || path.resolve(process.cwd(), 'models'));

  try {
    const { getLlama, resolveModelFile } = await import('node-llama-cpp');
    fs.mkdirSync(modelsDir, { recursive: true });

    status.state = 'downloading';
    const modelPath: string = await resolveModelFile(uri, {
      directory: modelsDir,
      cli: false,
      onProgress: ({ totalSize, downloadedSize }) => {
        status.totalBytes = totalSize;
        status.downloadedBytes = downloadedSize;
      }
    });

    status.state = 'loading';
    llama = await getLlama({ gpu: 'auto' });
    model = await llama.loadModel({ modelPath });
    context = await model.createContext({ contextSize: { max: 8192 }, sequences: 1 });
    sequence = context.getSequence();
    status.state = 'ready';
    logger.info({ uri, tier: status.tier }, 'Local AI engine ready');
    return true;
  } catch (err: any) {
    status.state = 'error';
    status.error = err?.message || String(err);
    logger.warn({ err: status.error }, 'Local AI engine failed to start; rule-based engine will be used');
    initPromise = null; // allow a later retry
    return false;
  }
}

/** Starts downloading / loading the model in the background (non-blocking) */
export function warmUpLocalEngine(): void {
  if (process.env.LOCAL_LLM_PRELOAD === 'false') return;
  if (!initPromise) initPromise = initEngine();
}

export function isLocalEngineReady(): boolean {
  return status.state === 'ready';
}

export interface LocalGenerateOptions {
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  jsonSchema?: Record<string, unknown>;
  /** Wait for the model if it is still downloading/loading (background jobs only) */
  waitForReady?: boolean;
}

/**
 * Generates a completion with the local model. Requests are serialised because one context is shared.
 * Returns null when the engine is not available, so callers can fall back.
 */
export async function generateLocal(
  systemPrompt: string,
  userPrompt: string,
  opts: LocalGenerateOptions = {}
): Promise<string | null> {
  if (!initPromise) initPromise = initEngine();
  if (status.state !== 'ready') {
    if (!opts.waitForReady) return null;
    const ok = await initPromise;
    if (!ok) return null;
  }

  const run = async (): Promise<string | null> => {
    const { LlamaChatSession } = await import('node-llama-cpp');
    await sequence.clearHistory();
    const session = new LlamaChatSession({ contextSequence: sequence, systemPrompt, autoDisposeSequence: false });
    const signal = AbortSignal.timeout(opts.timeoutMs ?? 180000);
    try {
      const grammar = opts.jsonSchema ? await llama.createGrammarForJsonSchema(opts.jsonSchema) : undefined;
      const answer: string = await session.prompt(userPrompt, {
        maxTokens: opts.maxTokens ?? 1500,
        temperature: opts.temperature ?? 0.2,
        grammar,
        signal,
        stopOnAbortSignal: true
      });
      return answer?.trim() || null;
    } finally {
      session.dispose({ disposeSequence: false });
    }
  };

  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  try {
    return await next;
  } catch (err: any) {
    logger.warn({ err: err?.message }, 'Local AI generation failed');
    return null;
  }
}
