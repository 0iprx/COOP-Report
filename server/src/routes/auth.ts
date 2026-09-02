import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { registerSchema, loginSchema } from '@coop/shared';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { logger } from '../logger.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'coop-report-super-secure-jwt-key-8374928374';

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
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
        role
      }
    });

    // If trainee, initialize default report profile
    if (role === 'trainee') {
      await prisma.reportProfile.create({
        data: {
          userId: user.id,
          entityAddress: 'هواوي السعودية (Huawei Tech Saudi)',
          introText:
            'يمثّل التدريب التعاوني حلقة الوصل بين ما يتلقاه الطالب من معارف أكاديمية وبين واقع سوق العمل التقني، إذ يتيح تطبيق المفاهيم النظرية عملياً في بيئة احترافية.',
          entityIntroText:
            'تعد شركة هواوي السعودية من الشركات الرائدة عالمياً في تقديم حلول شبكات الاتصالات والبنية التحتية لتقنية المعلومات والاتصالات والأجهزة الذكية.',
          skillsText:
            'اكتساب مهارات تقنية متقدمة في إدارة وتكوين الشبكات، تحليل النظم البرمجية، التوثيق الفني، والعمل الجماعي المؤسسي وفق أفضل الممارسات.',
          conclusionText:
            'في ختام فترة التدريب التعاوني، نتقدم بالشكر والتقدير لشركة هواوي والكلية على توفير بيئة تعليمية وعملية متميزة أثرت مسيرتنا المهنية.'
        }
      });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    logger.info({ userId: user.id, username: user.username, role: user.role }, 'User registered successfully');

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    logger.error({ err }, 'Registration error');
    res.status(500).json({ error: 'حدث خطأ في الخادم أثناء إنشاء الحساب' });
  }
});

// Login
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
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
      res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    logger.info({ userId: user.id, username: user.username }, 'User logged in successfully');

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        supervisorId: user.supervisorId
      }
    });
  } catch (err) {
    logger.error({ err }, 'Login error');
    res.status(500).json({ error: 'حدث خطأ في الخادم أثناء تسجيل الدخول' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'تم تسجيل الخروج بنجاح' });
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
