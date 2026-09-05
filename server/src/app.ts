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
import evidenceRoutes from './routes/evidence.js';
import testdevRoutes from './routes/testdev.js';
import adminRoutes from './routes/admin.js';
import exportsRoutes from './routes/exports.js';
import verifyRoutes from './routes/verify.js';
import { syncDatabaseSchema } from './startup.js';

// Process Crash Shields (prevents container crashes from unexpected async rejections)
process.setMaxListeners(0);
process.on('uncaughtException', (err) => {
  console.error('Shielded uncaughtException:', err?.stack || err?.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Shielded unhandledRejection:', (reason as any)?.stack || reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Trust reverse proxy (CranL, Cloudflare, Nginx) - fixes rate-limiting and client IP resolution
app.set('trust proxy', 1);

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

// Health check endpoints for Cranl load balancer & monitors
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({ status: 'ok', name: 'COOP Report API', timestamp: new Date().toISOString() });
});

// General Rate Limiter on API routes
app.use('/api', apiLimiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/testdev', testdevRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/exports', exportsRoutes);
app.use('/api/verify', verifyRoutes);

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
  app.use(
    express.static(clientDistPath, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, no-cache, s-maxage=600, stale-while-revalidate=120');
        }
      }
    })
  );

  // SPA fallback for all non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    // Prevent serving index.html for missing asset files (avoids MIME type mismatches)
    if (req.path.startsWith('/assets/') || /\.(css|js|png|jpg|jpeg|gif|svg|ico|json|woff2?|ttf|eot)$/i.test(req.path)) {
      return res.status(404).type('text/plain').send('Asset not found');
    }
    res.setHeader('Cache-Control', 'public, no-cache, s-maxage=600, stale-while-revalidate=120');
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
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`COOP Report Server running on http://0.0.0.0:${PORT}`);
  // Automatically sync database tables on container startup
  syncDatabaseSchema().catch((err) => {
    logger.warn({ err }, 'Schema sync error on startup');
  });
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM. Closing server gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT. Closing server gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
