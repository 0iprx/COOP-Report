import crypto from 'crypto';
import { logger } from '../logger.js';
import { ExportJobStatusDTO } from '@coop/shared';

export interface ExportJobPayload {
  jobId: string;
  type: 'weekly_docx' | 'final_docx' | 'final_pptx' | 'final_pdf';
  userId: number;
  reportData: any;
  params: Record<string, any>;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  attempts: number;
  maxAttempts: number;
  resultBuffer?: Buffer;
  mimeType?: string;
  fileName?: string;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

// In-memory job registry
const jobStore = new Map<string, ExportJobPayload>();

// Periodic cleanup of completed jobs older than 1 hour
setInterval(() => {
  const oneHourAgo = Date.now() - 3600 * 1000;
  for (const [id, job] of jobStore.entries()) {
    if (job.createdAt < oneHourAgo) {
      jobStore.delete(id);
    }
  }
}, 15 * 60 * 1000);

/**
 * Enqueues an export job for background processing
 */
export async function enqueueExportJob({
  type,
  userId,
  reportData,
  params,
  processor
}: {
  type: 'weekly_docx' | 'final_docx' | 'final_pptx' | 'final_pdf';
  userId: number;
  reportData: any;
  params: Record<string, any>;
  processor: () => Promise<{ buffer: Buffer; mimeType: string; fileName: string }>;
}): Promise<string> {
  const jobId = `job_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

  const job: ExportJobPayload = {
    jobId,
    type,
    userId,
    reportData,
    params,
    status: 'waiting',
    progress: 10,
    attempts: 0,
    maxAttempts: 3,
    createdAt: Date.now()
  };

  jobStore.set(jobId, job);

  // Execute asynchronously off the main loop (microtask / setImmediate)
  setImmediate(async () => {
    await processJobWithRetries(jobId, processor);
  });

  return jobId;
}

async function processJobWithRetries(
  jobId: string,
  processor: () => Promise<{ buffer: Buffer; mimeType: string; fileName: string }>
) {
  const job = jobStore.get(jobId);
  if (!job) return;

  while (job.attempts < job.maxAttempts) {
    try {
      job.attempts++;
      job.status = 'active';
      job.progress = 30 + job.attempts * 15;

      logger.info({ jobId, attempt: job.attempts, type: job.type }, 'Processing background export job');

      const result = await processor();

      job.status = 'completed';
      job.progress = 100;
      job.resultBuffer = result.buffer;
      job.mimeType = result.mimeType;
      job.fileName = result.fileName;
      job.completedAt = Date.now();

      logger.info({ jobId, type: job.type }, 'Background export job completed successfully');
      return;
    } catch (err: any) {
      logger.warn({ jobId, attempt: job.attempts, err: err?.message }, 'Export job attempt failed');
      job.error = err?.message || 'خطأ غير معروف أثناء توليد المستند';

      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed';
        job.progress = 0;
        logger.error({ jobId, err: err?.message }, 'Background export job permanently failed after max retries');
        return;
      }

      // Exponential backoff wait (e.g. 500ms, 1000ms)
      await new Promise(res => setTimeout(res, 500 * Math.pow(2, job.attempts - 1)));
    }
  }
}

/**
 * Gets current job status
 */
export function getJobStatus(jobId: string, requestUserId: number): ExportJobStatusDTO | null {
  const job = jobStore.get(jobId);
  if (!job || job.userId !== requestUserId) {
    return null;
  }

  return {
    jobId: job.jobId,
    status: job.status,
    progress: job.progress,
    downloadUrl: job.status === 'completed' ? `/api/exports/jobs/${jobId}/download` : undefined,
    error: job.error
  };
}

/**
 * Retrieves the generated document buffer
 */
export function getJobResult(jobId: string, requestUserId: number) {
  const job = jobStore.get(jobId);
  if (!job || job.userId !== requestUserId || job.status !== 'completed' || !job.resultBuffer) {
    return null;
  }

  return {
    buffer: job.resultBuffer,
    mimeType: job.mimeType || 'application/octet-stream',
    fileName: job.fileName || 'export.docx'
  };
}
