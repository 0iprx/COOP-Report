import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { getAgentJob } from '../services/agentJobService.js';
import { getLocalEngineStatus, warmUpLocalEngine } from '../services/localLlmService.js';

const router = Router();
router.use(authenticate);

// GET /api/agent/status — state of the built-in AI model (download/load progress)
router.get('/status', (req: AuthenticatedRequest, res: Response): void => {
  warmUpLocalEngine();
  res.json({ local: getLocalEngineStatus() });
});

// GET /api/agent/jobs/:id — progress / result of a background agent job
router.get('/jobs/:id', (req: AuthenticatedRequest, res: Response): void => {
  const job = getAgentJob(req.params.id, req.user!.userId);
  if (!job) {
    res.status(404).json({ error: 'المهمة غير موجودة أو انتهت صلاحيتها' });
    return;
  }
  res.json({
    id: job.id,
    kind: job.kind,
    status: job.status,
    progress: job.progress,
    message: job.message,
    result: job.status === 'done' ? job.result : undefined,
    error: job.error
  });
});

export default router;
