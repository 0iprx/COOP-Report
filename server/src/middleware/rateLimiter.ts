import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth routes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'تم تجاوز عدد محاولات الدخول المسموح بها، يرجى الانتظار والمحاولة لاحقاً.'
  }
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute to prevent rate limiting during heavy editing
  standardHeaders: true,
  legacyHeaders: false
});
