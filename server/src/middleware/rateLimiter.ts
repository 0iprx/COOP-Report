import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../logger.js';
import { logAuditEvent } from '../services/auditService.js';

const REDIS_URL = process.env.REDIS_URL?.trim();

// Custom key generator for auth (IP + username from body)
function authKeyGenerator(req: Request): string {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const username = req.body?.username ? String(req.body.username).toLowerCase().trim() : '';
  return `auth_${ip}_${username}`;
}

// User-based key generator for authenticated AI endpoints
function userKeyGenerator(req: any): string {
  if (req.user?.userId) {
    return `user_${req.user.userId}`;
  }
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || 'unknown';
  return `ip_${ip}`;
}

/**
 * 1. Auth Rate Limiter: 5 attempts / 15 minutes per IP + username
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: authKeyGenerator,
  handler: (req: Request, res: Response) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    logger.warn({ ip, path: req.path }, 'Rate limit exceeded on authentication endpoint');
    logAuditEvent({
      action: 'RATE_LIMIT_EXCEEDED_AUTH',
      entityType: 'AUTH',
      metadata: { path: req.path, ip },
      req
    });

    res.status(429).json({
      error: 'تم تجاوز عدد محاولات الدخول المسموح بها. يرجى الانتظار لمدة 15 دقيقة والمحاولة لاحقاً.',
      errorEn: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
      retryAfterMinutes: 15
    });
  }
});

/**
 * 2. AI Quota Limiter: 25 generations / hour per authenticated user
 */
export const aiQuotaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userKeyGenerator,
  handler: (req: any, res: Response) => {
    const userId = req.user?.userId;
    logger.warn({ userId }, 'Rate limit quota exceeded on AI generation endpoint');
    logAuditEvent({
      userId,
      action: 'RATE_LIMIT_EXCEEDED_AI',
      entityType: 'AI',
      metadata: { userId },
      req
    });

    res.status(429).json({
      error: 'لقد استهلكت الحصة المخصصة لعمليات الذكاء الاصطناعي (25 عملية/ساعة). يرجى المحاولة بعد ساعة.',
      errorEn: 'Hourly AI generation quota reached (25 operations/hour). Please try again in an hour.',
      retryAfterMinutes: 60
    });
  }
});

/**
 * 3. General API Ceiling: 300 requests / minute
 */
export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'تم تجاوز الحد الأقصى للطلبات السريعة. يرجى التمهل قليلاً.',
      errorEn: 'Too many requests. Please slow down.',
      retryAfterSeconds: 60
    });
  }
});

// Backward compatibility exports
export const apiLimiter = generalApiLimiter;
export const authLimiter = authRateLimiter;
