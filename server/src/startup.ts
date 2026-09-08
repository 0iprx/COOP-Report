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
    // 1. Test database connection with auto-recovery on Windows
    try {
      await prisma.$queryRaw`SELECT 1`;
      logger.info('Database server is reachable.');
    } catch (connErr: any) {
      if (process.platform === 'win32' && fs.existsSync('C:\\xampp\\mysql\\bin\\mysqld.exe')) {
        logger.warn('MySQL connection failed, attempting to auto-start XAMPP mysqld...');
        try {
          const { spawn } = await import('node:child_process');
          const child = spawn('C:\\xampp\\mysql\\bin\\mysqld.exe', ['--defaults-file=C:\\xampp\\mysql\\bin\\my.ini', '--standalone'], {
            detached: true,
            stdio: 'ignore'
          });
          child.unref();
          // Give MySQL a brief moment to bind to port
          await new Promise((resolve) => setTimeout(resolve, 2500));
          await prisma.$queryRaw`SELECT 1`;
          logger.info('Successfully auto-started MySQL and confirmed connection.');
        } catch (autoStartErr: any) {
          logger.warn({ autoStartErr: autoStartErr?.message }, 'Could not automatically start MySQL service.');
        }
      } else {
        throw connErr;
      }
    }

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
