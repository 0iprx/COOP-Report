import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { prisma } from '../db.js';

const router = Router();
router.use(authenticate);
// Accessible by supervisor or admin
router.use(requireRole('supervisor'));

/**
 * GET /api/admin/audit-logs
 * Read-only paginated audit logs with filters
 */
router.post('/audit-logs', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.body?.page) || 1);
    const limit = Math.min(100, Math.max(10, parseInt(req.body?.limit) || 25));
    const actionFilter = req.body?.action ? String(req.body.action) : undefined;
    const userIdFilter = req.body?.userId ? parseInt(req.body.userId) : undefined;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (actionFilter) where.action = { contains: actionFilter };
    if (userIdFilter) where.userId = userIdFilter;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { username: true }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    const formatted = logs.map((l: any) => ({
      id: l.id,
      tenantId: l.tenantId,
      userId: l.userId,
      username: l.user?.username || 'نظام / زائر',
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      metadata: l.metadata ? JSON.parse(l.metadata) : null,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt.toISOString()
    }));

    res.json({
      logs: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل في استرجاع سجلات التدقيق الأمني' });
  }
});

/**
 * GET /api/admin/ai-usage
 * Aggregated AI token metrics & cost estimates
 */
router.get('/ai-usage', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [recentLogs, providerStats] = await Promise.all([
      prisma.aiUsageLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          user: { select: { username: true } }
        }
      }),
      prisma.aiUsageLog.groupBy({
        by: ['provider'],
        _sum: {
          tokensIn: true,
          tokensOut: true,
          costEstimate: true
        },
        _count: {
          id: true
        }
      })
    ]);

    res.json({
      recentLogs: recentLogs.map((l: any) => ({
        id: l.id,
        username: l.user.username,
        provider: l.provider,
        action: l.action,
        tokensIn: l.tokensIn,
        tokensOut: l.tokensOut,
        costEstimate: l.costEstimate,
        createdAt: l.createdAt.toISOString()
      })),
      providerStats: providerStats.map((s: any) => ({
        provider: s.provider,
        totalCalls: s._count.id,
        totalTokensIn: s._sum.tokensIn || 0,
        totalTokensOut: s._sum.tokensOut || 0,
        totalCostEstimateUsd: (s._sum.costEstimate || 0).toFixed(4)
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل في استرجاع إحصائيات استهلاك الذكاء الاصطناعي' });
  }
});

export default router;
