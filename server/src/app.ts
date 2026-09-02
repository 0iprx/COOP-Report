import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { logger } from './logger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import entriesRoutes from './routes/entries.js';
import profileRoutes from './routes/profile.js';
import reportsRoutes from './routes/reports.js';
import aiRoutes from './routes/ai.js';
import supervisorRoutes from './routes/supervisor.js';
import backupRoutes from './routes/backup.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false // Allows rich report previews and print styles
  })
);

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiter
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'COOP Report API', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/backup', backupRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled application error');
  res.status(500).json({ error: 'حدث خطأ غير متوقع في الخادم' });
});

app.listen(PORT, () => {
  logger.info(`COOP Report Server running on http://localhost:${PORT}`);
});

export default app;
