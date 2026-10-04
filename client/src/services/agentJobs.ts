import { api } from './api';

export interface AgentJobState {
  status: 'queued' | 'running' | 'done' | 'failed';
  progress: number;
  message: string;
  result?: any;
  error?: string;
}

/**
 * Starts a background agent job (the POST must answer { jobId }) and polls it until it finishes.
 * Long local-model work runs server-side, so the browser never holds a request open for minutes.
 */
export async function runAgentJob(
  start: () => Promise<{ data: { jobId: string } }>,
  onProgress?: (s: AgentJobState) => void,
  signal?: { cancelled: boolean }
): Promise<any> {
  const { data } = await start();
  const jobId = data.jobId;
  for (;;) {
    await new Promise((r) => setTimeout(r, 1500));
    if (signal?.cancelled) throw new Error('cancelled');
    const res = await api.get(`/agent/jobs/${jobId}`);
    const state: AgentJobState = res.data;
    onProgress?.(state);
    if (state.status === 'done') return state.result;
    if (state.status === 'failed') throw new Error(state.error || 'تعذر إكمال المهمة');
  }
}

export function apiErrorMessage(err: any, fallback: string): string {
  return err?.response?.data?.error || (err?.message && err.message !== 'cancelled' ? err.message : '') || fallback;
}
