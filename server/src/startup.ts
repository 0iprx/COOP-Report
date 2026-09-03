import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { prisma, resolveDatabaseUrl } from './db.js';
import { logger } from './logger.js';

export async function syncDatabaseSchema(): Promise<void> {
  const dbUrl = resolveDatabaseUrl();

  if (!dbUrl) {
    logger.warn('No database connection information found (DB_HOST/DB_USER/DB_PASSWORD or DATABASE_URL).');
    return;
  }

  process.env.DATABASE_URL = dbUrl;
  logger.info('Checking database connection and schema synchronization...');

  try {
    // 1. Test database connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database server is reachable.');

    // 2. Automatically sync schema
    const schemaPath = path.resolve(process.cwd(), 'server/prisma/schema.prisma');
    const altSchemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
    const targetSchema = fs.existsSync(schemaPath) ? schemaPath : altSchemaPath;

    if (fs.existsSync(targetSchema)) {
      logger.info({ targetSchema }, 'Running automatic prisma db push...');
      execSync(`npx prisma db push --schema="${targetSchema}" --skip-generate --accept-data-loss`, {
        stdio: 'inherit',
        timeout: 30000,
        env: {
          ...process.env,
          DATABASE_URL: dbUrl
        }
      });
      logger.info('Database schema synchronized successfully (all tables are ready).');
    }
  } catch (err: any) {
    logger.warn({ err: err?.message }, 'Database connection test or schema sync skipped. The server will continue running.');
  }
}
