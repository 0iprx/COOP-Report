import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// Sanitize DATABASE_URL by removing any accidental surrounding quotes or whitespace from PaaS editors
let dbUrl = process.env.DATABASE_URL?.trim();
if (dbUrl) {
  dbUrl = dbUrl.replace(/^["']|["']$/g, '').trim();
  process.env.DATABASE_URL = dbUrl;
}

export const prisma = new PrismaClient({
  datasources: dbUrl ? { db: { url: dbUrl } } : undefined
});
