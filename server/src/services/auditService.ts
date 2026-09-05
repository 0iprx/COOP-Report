import { Request } from 'express';
import { prisma } from '../db.js';
import { logger } from '../logger.js';

interface AuditLogOptions {
  userId?: number | null;
  tenantId?: string;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  metadata?: Record<string, any>;
  req?: Request;
}

/**
 * Sanitizes metadata to strictly remove passwords, tokens, full image blobs
 */
function sanitizeMetadata(meta: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  const forbiddenKeys = ['password', 'passwordHash', 'token', 'refreshToken', 'imageData', 'companyLogo', 'institutionLogo'];

  for (const [key, value] of Object.entries(meta)) {
    if (forbiddenKeys.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 500) {
      sanitized[key] = value.slice(0, 100) + `... [truncated, length: ${value.length}]`;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export async function logAuditEvent({
  userId,
  tenantId = 'default_tenant',
  action,
  entityType,
  entityId,
  metadata = {},
  req
}: AuditLogOptions): Promise<void> {
  try {
    const ipAddress = (req?.headers['x-forwarded-for'] as string) || req?.socket?.remoteAddress || 'unknown';
    const cleanMetadata = sanitizeMetadata(metadata);

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        tenantId,
        action,
        entityType,
        entityId: entityId !== undefined && entityId !== null ? String(entityId) : null,
        metadata: JSON.stringify(cleanMetadata),
        ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : 'unknown'
      }
    });
  } catch (err: any) {
    logger.error({ err: err?.message, action }, 'Failed to record audit log');
  }
}
