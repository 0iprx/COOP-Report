import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from './logger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import entriesRoutes from './routes/entries.js';
import profileRoutes from './routes/profile.js';
import reportsRoutes from './routes/reports.js';
import aiRoutes from './routes/ai.js';
import supervisorRoutes from './routes/supervisor.js';
import backupRoutes from './routes/backup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security & Parsing Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false // Allows rich report previews, print styles, and Google fonts
  })
);

app.use(
  cors({
    origin: true, // Mirrors request origin (allows localhost, cranl.net, and custom domains)
    credentials: true
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiter on API
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'COOP Report API', timestamp: new Date().toISOString() });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/backup', backupRoutes);

// Serve Frontend Static Files (Vite SPA)
const clientDistCandidates = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../../../client/dist')
];
const clientDistPath = clientDistCandidates.find((p) => fs.existsSync(p));

if (clientDistPath) {
  logger.info({ clientDistPath }, 'Serving static frontend assets');
  app.use(express.static(clientDistPath));

  // SPA fallback for all non-API GET routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  logger.warn('Frontend client/dist directory not found');
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled application error');
  res.status(500).json({ error: 'حدث خطأ غير متوقع في الخادم' });
});

// Bind to 0.0.0.0 so containerized environments (Cranl/Docker) can route external traffic
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`COOP Report Server running on http://0.0.0.0:${PORT}`);
});

export default app;
