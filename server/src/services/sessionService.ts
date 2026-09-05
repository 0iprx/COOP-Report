import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { prisma } from '../db.js';
import { logger } from '../logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'coop-report-super-secure-jwt-key-8374928374';
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_DAYS = 14;
export const COOKIE_NAME = 'coop_refresh_token';

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
  tenantId: string;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function setRefreshCookie(res: Response, rawToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    path: '/api/auth'
  });
}

export function clearRefreshCookie(res: Response) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/api/auth'
  });
}

/**
 * Creates a new session family or rotates inside existing family
 */
export async function createSession({
  userId,
  deviceInfo,
  ipAddress,
  familyId
}: {
  userId: number;
  deviceInfo?: string;
  ipAddress?: string;
  familyId?: string;
}): Promise<{ accessToken: string; rawRefreshToken: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(rawRefreshToken);
  const sessionFamily = familyId || crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      refreshTokenHash: tokenHash,
      familyId: sessionFamily,
      deviceInfo: deviceInfo || 'Unknown Device',
      ipAddress: ipAddress || 'Unknown IP',
      expiresAt,
      isRevoked: false
    }
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    username: user.username,
    role: user.role,
    tenantId: user.tenantId
  });

  return { accessToken, rawRefreshToken };
}

/**
 * Rotates an existing refresh token with reuse detection
 */
export async function rotateRefreshToken({
  rawRefreshToken,
  deviceInfo,
  ipAddress
}: {
  rawRefreshToken: string;
  deviceInfo?: string;
  ipAddress?: string;
}) {
  const tokenHash = hashToken(rawRefreshToken);

  const existingSession = await prisma.session.findFirst({
    where: { refreshTokenHash: tokenHash },
    include: { user: true }
  });

  // Security Check 1: Token not found
  if (!existingSession) {
    logger.warn({ ipAddress }, 'Refresh token attempted with non-existent token');
    throw new Error('رمز الجلسة غير صالح');
  }

  // Security Check 2: REUSE DETECTION! Token was already revoked or rotated
  if (existingSession.isRevoked) {
    logger.error(
      { userId: existingSession.userId, familyId: existingSession.familyId, ipAddress },
      'SECURITY ALERT: Reused/Replayed refresh token detected! Invalidating all sessions in family.'
    );
    // Invalidate entire session family to protect against stolen cookie replay
    await prisma.session.updateMany({
      where: { familyId: existingSession.familyId },
      data: { isRevoked: true }
    });
    throw new Error('تم الكشف عن نشاط جلسة مشبوه، تم إلغاء كافة الجلسات لسلامة حسابك');
  }

  // Security Check 3: Token expired
  if (new Date() > existingSession.expiresAt) {
    await prisma.session.update({
      where: { id: existingSession.id },
      data: { isRevoked: true }
    });
    throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً');
  }

  // Revoke current used token
  await prisma.session.update({
    where: { id: existingSession.id },
    data: { isRevoked: true }
  });

  // Issue next token in same family
  const nextRawToken = crypto.randomBytes(40).toString('hex');
  const nextHash = hashToken(nextRawToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId: existingSession.userId,
      refreshTokenHash: nextHash,
      familyId: existingSession.familyId,
      deviceInfo: deviceInfo || existingSession.deviceInfo,
      ipAddress: ipAddress || existingSession.ipAddress,
      expiresAt,
      isRevoked: false
    }
  });

  const accessToken = generateAccessToken({
    userId: existingSession.user.id,
    username: existingSession.user.username,
    role: existingSession.user.role,
    tenantId: existingSession.user.tenantId
  });

  return {
    accessToken,
    rawRefreshToken: nextRawToken,
    user: {
      id: existingSession.user.id,
      username: existingSession.user.username,
      role: existingSession.user.role,
      tenantId: existingSession.user.tenantId
    }
  };
}

/**
 * Revokes the specific refresh token session
 */
export async function revokeSessionByToken(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken);
  await prisma.session.updateMany({
    where: { refreshTokenHash: tokenHash },
    data: { isRevoked: true }
  });
}

/**
 * Revokes all active sessions for a user (logout of all devices)
 */
export async function revokeAllSessionsForUser(userId: number) {
  await prisma.session.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true }
  });
  logger.info({ userId }, 'All sessions revoked for user across all devices');
}
