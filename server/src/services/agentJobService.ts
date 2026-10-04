import crypto from 'node:crypto';
import { logger } from '../logger.js';

/**
 * In-process background jobs for the AI agent. Local-model work can take minutes, longer than
 * most reverse proxies keep an HTTP request open, so long tasks run here and the client polls.
 * Results that matter are persisted to the database by the task itself; the job only tracks progress.
 */

export type AgentJobStatus = 'queued' | 'running' | 'done' | 'failed';

export interface AgentJob {
  id: string;
  userId: number;
  kind: string;
  status: AgentJobStatus;
  progress: number;
  message: string;
  result?: unknown;
  error?: string;
  createdAt: number;
  finishedAt?: number;
}

export interface JobReporter {
  progress(percent: number, message?: string): void;
}

const jobs = new Map<string, AgentJob>();

setInterval(() => {
  const cutoff = Date.now() - 6 * 3600 * 1000;
  for (const [id, job] of jobs) if (job.createdAt < cutoff) jobs.delete(id);
}, 30 * 60 * 1000).unref();

export function startAgentJob(userId: number, kind: string, task: (r: JobReporter) => Promise<unknown>): AgentJob {
  // One running job of the same kind per user: return it instead of starting a duplicate
  for (const job of jobs.values()) {
    if (job.userId === userId && job.kind === kind && (job.status === 'queued' || job.status === 'running')) return job;
  }

  const job: AgentJob = {
    id: crypto.randomUUID(),
    userId,
    kind,
    status: 'queued',
    progress: 0,
    message: '',
    createdAt: Date.now()
  };
  jobs.set(job.id, job);

  const reporter: JobReporter = {
    progress(percent, message) {
      job.progress = Math.max(0, Math.min(100, Math.round(percent)));
      if (message !== undefined) job.message = message;
    }
  };

  setImmediate(async () => {
    job.status = 'running';
    try {
      job.result = await task(reporter);
      job.status = 'done';
      job.progress = 100;
    } catch (err: any) {
      job.status = 'failed';
      job.error = err?.message || 'تعذر إكمال المهمة';
      logger.warn({ err: job.error, kind }, 'Agent job failed');
    } finally {
      job.finishedAt = Date.now();
    }
  });

  return job;
}

export function getAgentJob(id: string, userId: number): AgentJob | null {
  const job = jobs.get(id);
  return job && job.userId === userId ? job : null;
}
