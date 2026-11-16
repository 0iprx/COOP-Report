/**
 * Shared types for the unified AI layer.
 *
 * Every provider returns the same structured output (AiDraft). The engine never
 * writes into user content: it stores a suggestion that the user accepts,
 * edits or rejects.
 */

export type ProviderId = 'local' | 'anthropic' | 'openai' | 'gemini' | 'groq';

/** The single output contract every task asks the model to fill. */
export interface AiDraft {
  /** The proposed text. Empty when the model needs answers first. */
  text: string;
  /** Short questions for the trainee when the source lacks needed detail. */
  questions: string[];
  /** One-line notes describing what changed (for the review screen). */
  changes: string[];
}

export interface LlmRequest {
  system: string;
  user: string;
  maxOutputTokens: number;
  signal?: AbortSignal;
}

export interface LlmResult {
  draft: AiDraft;
  provider: ProviderId;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

export interface ProviderStatus {
  id: ProviderId;
  configured: boolean;
  model: string | null;
  ok: boolean | null;
  reason?: string;
  checkedAt?: string;
}

export class ProviderError extends Error {
  constructor(
    public provider: ProviderId,
    message: string,
    public retryable: boolean,
    public status?: number
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export interface LlmProvider {
  id: ProviderId;
  model: string;
  /** Verifies the key and the model id without generating text. */
  health(): Promise<{ ok: boolean; reason?: string }>;
  generate(req: LlmRequest): Promise<LlmResult>;
}

/** Validates and normalizes an untrusted model JSON object into an AiDraft. */
export function toDraft(raw: unknown): AiDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.text !== 'string') return null;
  const strArr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').map((s) => s.trim()).filter(Boolean) : []);
  return { text: o.text.trim(), questions: strArr(o.questions).slice(0, 5), changes: strArr(o.changes).slice(0, 8) };
}

/** JSON schema of AiDraft, for providers that accept a schema. */
export const AI_DRAFT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    text: { type: 'string' },
    questions: { type: 'array', items: { type: 'string' } },
    changes: { type: 'array', items: { type: 'string' } }
  },
  required: ['text', 'questions', 'changes'],
  additionalProperties: false
} as const;
