import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

/**
 * Resolves the MySQL connection URL either from individual environment variables
 * (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME / MYSQL_*)
 * or from a single DATABASE_URL fallback.
 */
export function resolveDatabaseUrl(): string {
  const host = (process.env.DB_HOST || process.env.MYSQL_HOST || process.env.MYSQLHOST || '').trim().replace(/^["']|["']$/g, '');
  const user = (process.env.DB_USER || process.env.MYSQL_USER || process.env.MYSQLUSER || '').trim().replace(/^["']|["']$/g, '');
  const password = (process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || '').trim().replace(/^["']|["']$/g, '');
  const port = (process.env.DB_PORT || process.env.MYSQL_PORT || process.env.MYSQLPORT || '3306').trim().replace(/^["']|["']$/g, '');
  const database = (process.env.DB_NAME || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || '').trim().replace(/^["']|["']$/g, '');

  // If individual fields are provided, assemble clean connection URL
  if (host && user && database) {
    const encodedUser = encodeURIComponent(user);
    const encodedPassword = encodeURIComponent(password);
    return `mysql://${encodedUser}:${encodedPassword}@${host}:${port}/${database}`;
  }

  // Fallback to DATABASE_URL
  const rawUrl = (process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, '');
  return rawUrl;
}

const activeDbUrl = resolveDatabaseUrl();
if (activeDbUrl) {
  process.env.DATABASE_URL = activeDbUrl;
}

export const prisma = new PrismaClient({
  datasources: activeDbUrl ? { db: { url: activeDbUrl } } : undefined
});
