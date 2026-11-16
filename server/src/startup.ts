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

    // 2. Schema changes go through reviewed migrations only.
    //    `prisma db push --accept-data-loss` used to run here on every boot and could
    //    drop columns in production. Now nothing changes the schema unless
    //    DB_AUTO_MIGRATE=true, and even then only `migrate deploy` runs, which applies
    //    the committed, additive migration files and never drops data on its own.
    const schemaPath = path.resolve(process.cwd(), 'server/prisma/schema.prisma');
    const altSchemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
    const targetSchema = fs.existsSync(schemaPath) ? schemaPath : altSchemaPath;

    if (process.env.DB_AUTO_MIGRATE === 'true' && fs.existsSync(targetSchema)) {
      const prismaEnv = { ...process.env, DATABASE_URL: dbUrl };
      // An existing database created by the old `db push` has tables but no migration
      // history. Mark the baseline (0_init, identical to that schema) as already applied
      // so `migrate deploy` only runs the newer, additive migrations.
      const [hist] = await prisma.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = '_prisma_migrations'`;
      const [users] = await prisma.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'`;
      if (Number(hist?.n ?? 0) === 0 && Number(users?.n ?? 0) > 0) {
        logger.info('Existing database without migration history: marking baseline 0_init as applied.');
        execSync(`npx prisma migrate resolve --applied 0_init --schema="${targetSchema}"`, { stdio: 'inherit', timeout: 60000, env: prismaEnv });
      }
      logger.info({ targetSchema }, 'DB_AUTO_MIGRATE=true: applying committed migrations (prisma migrate deploy)');
      execSync(`npx prisma migrate deploy --schema="${targetSchema}"`, {
        stdio: 'inherit',
        timeout: 60000,
        env: { ...process.env, DATABASE_URL: dbUrl }
      });
      logger.info('Migrations applied.');
    } else {
      logger.info('Schema is not modified at startup (set DB_AUTO_MIGRATE=true to run prisma migrate deploy).');
    }
  } catch (err: any) {
    logger.warn({ err: err?.message }, 'Database connection test or schema sync skipped. The server will continue running.');
  }
}
