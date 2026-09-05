import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { registerSchema, loginSchema } from '@coop/shared';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import {
  createSession,
  rotateRefreshToken,
  revokeSessionByToken,
  revokeAllSessionsForUser,
  setRefreshCookie,
  clearRefreshCookie,
  COOKIE_NAME
} from '../services/sessionService.js';
import { logAuditEvent } from '../services/auditService.js';
import { logger } from '../logger.js';

const router = Router();

// Register
router.post('/register', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'بيانات غير صالحة' });
      return;
    }

    const { username, password, role } = parseResult.data;

    const existing = await prisma.user.findUnique({
      where: { username }
    });

    if (existing) {
      res.status(400).json({ error: 'اسم المستخدم مسجل مسبقاً، يرجى اختيار اسم آخر' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role,
        tenantId: 'default_tenant'
      }
    });

    // If trainee, initialize default report profile
    if (role === 'trainee') {
      await prisma.reportProfile.create({
        data: {
          userId: user.id,
          tenantId: 'default_tenant',
          entityAddress: '',
          introText:
            'يمثّل التدريب التعاوني حلقة الوصل بين ما يتلقاه الطالب من معارف أكاديمية وبين واقع سوق العمل التقني، إذ يتيح تطبيق المفاهيم النظرية عملياً في بيئة احترافية.',
          entityIntroText: '',
          skillsText:
            'اكتساب مهارات تقنية متقدمة في إدارة وتكوين النظم، تحليل المتطلبات، التوثيق الفني، والعمل الجماعي المؤسسي وفق أفضل الممارسات.',
          conclusionText:
            'في ختام فترة التدريب التعاوني، نتقدم بالشكر والتقدير لجهة التدريب والمشرفين على توفير بيئة تعليمية وعملية متميزة أثرت مسيرتنا المهنية.'
        }
      });
    }

    const deviceInfo = (req.headers['user-agent'] as string) || 'Browser';
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

    const { accessToken, rawRefreshToken } = await createSession({
      userId: user.id,
      deviceInfo,
      ipAddress
    });

    setRefreshCookie(res, rawRefreshToken);

    await logAuditEvent({
      userId: user.id,
      tenantId: user.tenantId,
      action: 'USER_REGISTER',
      entityType: 'USER',
      entityId: user.id,
      metadata: { username: user.username, role: user.role },
      req
    });

    logger.info({ userId: user.id, username: user.username, role: user.role }, 'User registered successfully with hardened session');

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      accessToken,
      token: accessToken, // Backward compatibility
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        tenantId: user.tenantId
      }
    });
  } catch (err: any) {
    logger.error({ err }, 'Registration error');
    res.status(500).json({ error: 'تعذر إتمام التسجيل حالياً، يرجى المحاولة مرة أخرى بعد لحظات' });
  }
});

// Login
router.post('/login', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
      return;
    }

    const { username, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await logAuditEvent({
        userId: user.id,
        tenantId: user.tenantId,
        action: 'LOGIN_FAILED_PASSWORD',
        entityType: 'AUTH',
        metadata: { username },
        req
      });
      res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
      return;
    }

    const deviceInfo = (req.headers['user-agent'] as string) || 'Browser';
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

    const { accessToken, rawRefreshToken } = await createSession({
      userId: user.id,
      deviceInfo,
      ipAddress
    });

    setRefreshCookie(res, rawRefreshToken);

    await logAuditEvent({
      userId: user.id,
      tenantId: user.tenantId,
      action: 'USER_LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      metadata: { username: user.username, role: user.role },
      req
    });

    logger.info({ userId: user.id, username: user.username }, 'User logged in successfully');

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      accessToken,
      token: accessToken, // Backward compatibility
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        supervisorId: user.supervisorId,
        tenantId: user.tenantId
      }
    });
  } catch (err) {
    logger.error({ err }, 'Login error');
    res.status(500).json({ error: 'حدث خطأ في الخادم أثناء تسجيل الدخول' });
  }
});

// Refresh Token with Rotation & Reuse Detection
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawToken = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;

    if (!rawToken) {
      res.status(401).json({ error: 'رمز الجلسة مفقود، يرجى تسجيل الدخول' });
      return;
    }

    const deviceInfo = (req.headers['user-agent'] as string) || 'Browser';
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

    const { accessToken, rawRefreshToken: newRawToken, user } = await rotateRefreshToken({
      rawRefreshToken: rawToken,
      deviceInfo,
      ipAddress
    });

    setRefreshCookie(res, newRawToken);

    res.json({
      accessToken,
      token: accessToken, // Backward compatibility
      user
    });
  } catch (err: any) {
    clearRefreshCookie(res);
    logger.warn({ err: err?.message }, 'Refresh token error');
    res.status(401).json({ error: err?.message || 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول' });
  }
});

// 1-Click Sandbox Demo Login
router.post('/demo', async (req: Request, res: Response): Promise<void> => {
  try {
    let demoUser = await prisma.user.findUnique({ where: { username: 'testdev_demo' } });
    if (!demoUser) {
      const passwordHash = await bcrypt.hash('DemoPass123!@#', 12);
      demoUser = await prisma.user.create({
        data: {
          username: 'testdev_demo',
          passwordHash,
          role: 'trainee',
          tenantId: 'default_tenant'
        }
      });
      await prisma.reportProfile.create({
        data: {
          userId: demoUser.id,
          tenantId: 'default_tenant',
          entityAddress: 'شركة تقنية الحوسبة المتقدمة والحلول السحابية (CloudTech Solutions)',
          introText: 'يعد التدريب التعاوني مرحلة تطبيقية متقدمة تهدف إلى ردم الفجوة بين المعارف النظرية الأكاديمية والممارسات المهنية الميدانية في قطاع تقنية المعلومات، وتطبيق المعايير الهندسية في بيئة تشغيلية حقيقية.',
          entityIntroText: 'تُعد الجهة من المنشآت المتخصصة في تقديم خدمات البنية التحتية والحلول الرقمية وإدارة مراكز البيانات وفق المعايير العالمية مثل ISO/IEC 27001 وإطار عمل ITIL.',
          skillsText: '١. المهارات التقنية: إدارة خوادم لينكس، تكوين شبكات الـ VLAN والتوجيه الشبكي، واستخدام الحاويات (Docker).\\n٢. المهارات التحليلية: تشخيص الأعطال الميدانية واستكشاف الأخطاء وإصلاحها (Troubleshooting).\\n٣. مهارات الحوكمة والتوثيق: صياغة أدلة التشغيل القياسية (SOP)، وإعداد التقارير الفنية الدورية.',
          conclusionText: 'شكلت تجربة التدريب التعاوني إضافة جوهرية لمسيرتي الأكاديمية والمهنية، حيث أتاحت لي التعامل المباشر مع تحديات البنية التحتية الحقيقية وأنظمة الإنتاج الفعلية.'
        }
      });
    }

    const deviceInfo = (req.headers['user-agent'] as string) || 'Browser';
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

    const { accessToken, rawRefreshToken } = await createSession({
      userId: demoUser.id,
      deviceInfo,
      ipAddress
    });

    setRefreshCookie(res, rawRefreshToken);

    res.json({
      message: 'تم تسجيل الدخول بحساب المعاينة والمختبر بنجاح',
      accessToken,
      token: accessToken, // Backward compatibility
      user: {
        id: demoUser.id,
        username: demoUser.username,
        role: demoUser.role,
        tenantId: demoUser.tenantId
      }
    });
  } catch (err) {
    logger.error({ err }, 'Demo login error');
    res.status(500).json({ error: 'تعذر إتمام الدخول التجريبي حالياً' });
  }
});

// Logout (Revoke current session)
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawToken = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
    if (rawToken) {
      await revokeSessionByToken(rawToken);
    }
  } catch (err) {
    // Ignore error
  }
  clearRefreshCookie(res);
  res.json({ message: 'تم تسجيل الخروج بنجاح' });
});

// Logout from all devices
router.post('/logout-all', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await revokeAllSessionsForUser(req.user!.userId);
    clearRefreshCookie(res);

    await logAuditEvent({
      userId: req.user!.userId,
      tenantId: req.user!.tenantId || 'default_tenant',
      action: 'LOGOUT_ALL_DEVICES',
      entityType: 'AUTH',
      entityId: req.user!.userId,
      req
    });

    res.json({ message: 'تم تسجيل الخروج من كافة الأجهزة وإلغاء جميع الجلسات النشطة بنجاح' });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء محاولة تسجيل الخروج من الأجهزة' });
  }
});

// Current user info
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        username: true,
        role: true,
        supervisorId: true,
        tenantId: true,
        supervisor: {
          select: {
            id: true,
            username: true
          }
        },
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'فشل في جلب بيانات المستخدم' });
  }
});

export default router;
