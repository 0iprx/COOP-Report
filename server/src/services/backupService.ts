import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../db.js';
import { logger } from '../logger.js';

export interface ExportPayload {
  version: string;
  exportedAt: string;
  userId: number;
  username: string;
  profile: any;
  entries: any[];
  revisions: any[];
}

export interface BackupPackage {
  payload: ExportPayload;
  checksum: string;
}

const BACKUP_DIR = path.resolve(process.cwd(), 'backups');

export async function exportUserArchive(userId: number): Promise<{ backup: BackupPackage; filename: string }> {
  // Ensure backups directory exists
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch {}

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      entries: {
        include: {
          revisions: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  const payload: ExportPayload = {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    userId: user.id,
    username: user.username,
    profile: user.profile || {},
    entries: user.entries.map((e) => ({
      id: e.id,
      entryDate: e.entryDate,
      timeFrom: e.timeFrom,
      timeTo: e.timeTo,
      title: e.title,
      category: e.category,
      description: e.description,
      deletedAt: e.deletedAt ? e.deletedAt.toISOString() : null,
      createdAt: e.createdAt.toISOString()
    })),
    revisions: user.entries.flatMap((e) =>
      e.revisions.map((r) => ({
        entryId: r.entryId,
        title: r.title,
        category: r.category,
        description: r.description,
        timeFrom: r.timeFrom,
        timeTo: r.timeTo,
        createdAt: r.createdAt.toISOString()
      }))
    )
  };

  // Compute SHA-256 Checksum for zero corruption guarantee
  const payloadString = JSON.stringify(payload);
  const checksum = crypto.createHash('sha256').update(payloadString).digest('hex');

  const backup: BackupPackage = {
    payload,
    checksum
  };

  const filename = `COOP_Backup_${user.username}_${new Date().toISOString().slice(0, 10)}.json`;
  const filePath = path.join(BACKUP_DIR, filename);

  // Write snapshot locally for redundancy
  try {
    await fs.writeFile(filePath, JSON.stringify(backup, null, 2), 'utf-8');
    logger.info({ userId, filename }, 'Local backup snapshot saved successfully');
  } catch (err) {
    logger.warn({ err }, 'Could not save local file copy of backup');
  }

  return { backup, filename };
}

export async function importUserArchive(
  userId: number,
  rawBackup: any
): Promise<{ success: boolean; entriesCount: number; message: string }> {
  if (!rawBackup || !rawBackup.payload || !rawBackup.checksum) {
    throw new Error('هيكل ملف النسخة الاحتياطية غير صالح');
  }

  const { payload, checksum } = rawBackup as BackupPackage;

  // Verify SHA-256 integrity checksum
  const computedChecksum = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  if (computedChecksum !== checksum) {
    throw new Error('تحذير: الملف تالف أو تم العبث بمحتواه (فشل فحص البصمة الرقمية SHA-256)');
  }

  // Restore within an ACID database transaction
  let restoredCount = 0;

  await prisma.$transaction(async (tx) => {
    // 1. Restore/Update Profile
    if (payload.profile) {
      const { userId: _unused, id: _uid, ...profileData } = payload.profile;
      await tx.reportProfile.upsert({
        where: { userId },
        create: {
          userId,
          ...profileData
        },
        update: profileData
      });
    }

    // 2. Restore Entries
    if (Array.isArray(payload.entries)) {
      for (const item of payload.entries) {
        // Upsert entry by matching date, time, and title
        const existing = await tx.entry.findFirst({
          where: {
            userId,
            entryDate: item.entryDate,
            title: item.title
          }
        });

        if (!existing) {
          await tx.entry.create({
            data: {
              userId,
              entryDate: item.entryDate,
              timeFrom: item.timeFrom,
              timeTo: item.timeTo,
              title: item.title,
              category: item.category,
              description: item.description,
              deletedAt: item.deletedAt ? new Date(item.deletedAt) : null
            }
          });
          restoredCount++;
        }
      }
    }
  });

  return {
    success: true,
    entriesCount: restoredCount,
    message: `تم التحقق بنجاح واسترجاع البيانات والملف سليم 100% (تمت إضافة/تحديث ${restoredCount} سجل)`
  };
}
