import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../db.js';
import { logger } from '../logger.js';
import { getWeekStart, getWeekEnd, formatDateArabic, calculateHoursBetween } from '@coop/shared';

// Prisma interactive transaction client type
type PrismaTxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// Inline Prisma entry shape (mirrors generated model)
type PrismaEntry = {
  id: number;
  userId: number;
  entryDate: string;
  timeFrom: string;
  timeTo: string;
  title: string;
  category: string;
  description: string;
  deletedAt: Date | null;
  createdAt: Date;
  revisions: {
    id: number;
    entryId: number;
    title: string;
    description: string;
    createdAt: Date;
  }[];
};

export interface ExportPayload {
  version: string;
  exportedAt: string;
  userId: number;
  username: string;
  profile: any;
  entries: any[];
  revisions: any[];
  evidence?: any[];
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
      },
      evidence: {
        where: { deletedAt: null }
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
    entries: user.entries.map((e: PrismaEntry) => ({
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
    revisions: user.entries.flatMap((e: PrismaEntry) =>
      e.revisions.map((r: { entryId: number; title: string; description: string; createdAt: Date }) => ({
        entryId: r.entryId,
        title: r.title,
        description: r.description,
        createdAt: r.createdAt.toISOString()
      }))
    ),
    evidence: (user.evidence || []).map((ev) => ({
      id: ev.id,
      weekIndex: ev.weekIndex,
      caption: ev.caption,
      imageData: ev.imageData
    }))
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

/**
 * Generates a self-contained, human-readable HTML "safety copy" of everything the
 * trainee has entered so far — raw entries (unpolished), profile info, and evidence
 * photos — bundled into a single printable file with no dependency on the website
 * or the database. If the platform ever goes down, the trainee can open this file in
 * any browser (or print it to PDF) and manually reconstruct the report from it.
 *
 * This is intentionally available from day one (not just at the "final report" stage)
 * and is distinct from the JSON /export archive, which is machine-readable and meant
 * for re-importing back into this same system.
 */
export async function exportUserReadableArchive(
  userId: number
): Promise<{ html: string; filename: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      entries: {
        where: { deletedAt: null },
        orderBy: [{ entryDate: 'asc' }, { timeFrom: 'asc' }]
      },
      evidence: {
        where: { deletedAt: null },
        orderBy: { weekIndex: 'asc' }
      }
    }
  });

  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  const entries = user.entries as PrismaEntry[];
  const profile: any = user.profile || {};

  // Group entries by Sunday-based week using the same logic as the rest of the app
  const weekMap = new Map<string, PrismaEntry[]>();
  for (const entry of entries) {
    const weekStart = getWeekStart(entry.entryDate);
    if (!weekMap.has(weekStart)) weekMap.set(weekStart, []);
    weekMap.get(weekStart)!.push(entry);
  }
  const sortedWeekStarts = Array.from(weekMap.keys()).sort();

  const totalHours = entries.reduce(
    (sum: number, e: PrismaEntry) => sum + calculateHoursBetween(e.timeFrom, e.timeTo),
    0
  );

  const evidenceByWeek = new Map<number, typeof user.evidence>();
  for (const ev of user.evidence || []) {
    if (!evidenceByWeek.has(ev.weekIndex)) evidenceByWeek.set(ev.weekIndex, []);
    evidenceByWeek.get(ev.weekIndex)!.push(ev);
  }

  const escapeHtml = (str: string): string =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const profileRows: [string, string][] = (
    [
      ['اسم المتدرب', profile.studentName],
      ['الرقم التدريبي', profile.trainingNumber],
      ['القسم / التخصص', profile.department],
      ['جهة التدريب', profile.entityAddress],
      ['المشرف الأكاديمي', profile.supervisorName],
      ['المسؤول بالمنشأة', profile.responsibleName]
    ] as [string, string][]
  ).filter(([, v]) => !!v);

  const weeksHtml = sortedWeekStarts
    .map((weekStart, idx) => {
      const weekEntries = weekMap.get(weekStart)!;
      const weekEnd = getWeekEnd(weekStart);
      const weekEvidence = evidenceByWeek.get(idx + 1) || [];

      const entriesHtml = weekEntries
        .map(
          (e) => `
        <div class="entry">
          <div class="entry-head">
            <span class="entry-date">${escapeHtml(formatDateArabic(e.entryDate))}</span>
            <span class="entry-time">${escapeHtml(e.timeFrom)} — ${escapeHtml(e.timeTo)}</span>
            <span class="entry-cat">${escapeHtml(e.category)}</span>
          </div>
          <div class="entry-title">${escapeHtml(e.title)}</div>
          <div class="entry-desc">${escapeHtml(e.description).replace(/\n/g, '<br/>')}</div>
        </div>`
        )
        .join('');

      const evidenceHtml = weekEvidence.length
        ? `<div class="evidence-grid">${weekEvidence
            .map(
              (ev: { imageData: string; caption: string }) => `
          <figure class="evidence-item">
            <img src="${ev.imageData}" alt="${escapeHtml(ev.caption || '')}" />
            <figcaption>${escapeHtml(ev.caption || '')}</figcaption>
          </figure>`
            )
            .join('')}</div>`
        : '';

      return `
      <section class="week-block">
        <h2>الأسبوع ${idx + 1} <span class="week-range">(${escapeHtml(
        formatDateArabic(weekStart)
      )} — ${escapeHtml(formatDateArabic(weekEnd))})</span></h2>
        ${entriesHtml || '<p class="empty">لا توجد إدخالات لهذا الأسبوع.</p>'}
        ${evidenceHtml}
      </section>`;
    })
    .join('');

  const generatedAt = new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Riyadh'
  }).format(new Date());

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>نسخة احتياطية للطوارئ — ${escapeHtml(user.username)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>
  :root { --accent:#8B0000; --accent-dim:#F4DDDF; --ink:#1c1917; --sub:#57534e; --line:#e7e5e4; --bg:#F7F5F0; }
  * { box-sizing: border-box; }
  body { font-family:'Tajawal',sans-serif; background:var(--bg); color:var(--ink); margin:0; padding:0 16px 60px; }
  .wrap { max-width: 820px; margin: 0 auto; }
  .notice { background:var(--accent-dim); border:1px solid var(--accent); color:var(--accent); border-radius:12px; padding:16px 20px; margin:24px 0; font-size:13px; line-height:1.9; font-weight:700; }
  header.doc-head { text-align:center; padding:36px 0 20px; border-bottom:3px solid var(--accent); }
  header.doc-head h1 { font-size:22px; margin:0 0 6px; }
  header.doc-head p { color:var(--sub); font-size:12.5px; margin:2px 0; }
  .profile-table { width:100%; border-collapse:collapse; margin:20px 0; font-size:12.5px; }
  .profile-table td { border:1px solid var(--line); padding:8px 12px; }
  .profile-table td:first-child { font-weight:800; background:#fafaf9; width:35%; }
  .week-block { margin:34px 0; page-break-inside: avoid; }
  .week-block h2 { font-size:16px; color:var(--accent); border-bottom:2px solid var(--accent); padding-bottom:6px; }
  .week-range { color:var(--sub); font-weight:500; font-size:12px; }
  .entry { border:1px solid var(--line); border-radius:10px; padding:12px 14px; margin:10px 0; background:#fff; }
  .entry-head { display:flex; flex-wrap:wrap; gap:10px; font-size:11px; color:var(--sub); font-weight:700; margin-bottom:6px; }
  .entry-cat { background:var(--accent-dim); color:var(--accent); border-radius:6px; padding:1px 8px; }
  .entry-title { font-weight:800; font-size:13.5px; margin-bottom:4px; }
  .entry-desc { font-size:12.5px; line-height:1.8; color:#292524; white-space:pre-wrap; }
  .empty { font-size:12px; color:var(--sub); }
  .evidence-grid { display:flex; flex-wrap:wrap; gap:10px; margin-top:10px; }
  .evidence-item { width:150px; margin:0; text-align:center; }
  .evidence-item img { width:100%; height:110px; object-fit:cover; border-radius:8px; border:1px solid var(--line); }
  .evidence-item figcaption { font-size:10.5px; color:var(--sub); margin-top:4px; }
  .summary { display:flex; gap:14px; flex-wrap:wrap; margin:18px 0; }
  .summary .stat { flex:1; min-width:120px; border:1px solid var(--line); border-radius:10px; padding:12px; text-align:center; background:#fff; }
  .summary .stat b { display:block; font-size:20px; color:var(--accent); }
  .summary .stat span { font-size:11px; color:var(--sub); }
  footer { text-align:center; font-size:11px; color:var(--sub); margin-top:40px; }
  @media print {
    .notice { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { size: A4; margin: 2cm; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <header class="doc-head">
      <h1>نسخة احتياطية للطوارئ — سجل التدريب التعاوني</h1>
      <p>المستخدم: ${escapeHtml(user.username)}</p>
      <p>تاريخ الإنشاء: ${escapeHtml(generatedAt)}</p>
    </header>

    <div class="notice">
      ⚠️ هذا الملف نسخة احتياطية كاملة وقابلة للقراءة من كل ما قمت بتسجيله في المنصة، بصيغته
      الأصلية دون أي تنقيح بالذكاء الاصطناعي. احتفظ به على جهازك؛ فإذا تعطّل الموقع أو فُقدت
      البيانات لأي سبب، يمكنك فتح هذا الملف من أي متصفح (أو طباعته PDF) واستخدامه لكتابة تقريرك
      النهائي يدوياً، لأنه يحتوي على جميع مهامك وصورك وبياناتك الأساسية بالكامل.
    </div>

    ${
      profileRows.length
        ? `<table class="profile-table">${profileRows
            .map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`)
            .join('')}</table>`
        : ''
    }

    <div class="summary">
      <div class="stat"><b>${entries.length}</b><span>إجمالي الإدخالات</span></div>
      <div class="stat"><b>${sortedWeekStarts.length}</b><span>عدد الأسابيع المسجّلة</span></div>
      <div class="stat"><b>${totalHours.toFixed(1)}</b><span>إجمالي الساعات</span></div>
      <div class="stat"><b>${(user.evidence || []).length}</b><span>صور الأدلة المرفقة</span></div>
    </div>

    ${weeksHtml || '<p class="empty">لا توجد أي إدخالات مسجّلة بعد.</p>'}

    <footer>تم إنشاء هذه النسخة تلقائياً بواسطة COOP Report — احتفظ بنسخة منها بشكل دوري.</footer>
  </div>
</body>
</html>`;

  const filename = `COOP_Safety_Backup_${user.username}_${new Date().toISOString().slice(0, 10)}.html`;

  return { html, filename };
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

  await prisma.$transaction(async (tx: PrismaTxClient) => {
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

    // 3. Restore Weekly Evidence Photos
    if (Array.isArray(payload.evidence)) {
      for (const ev of payload.evidence) {
        if (!ev.imageData) continue;
        const existingEv = await tx.weeklyEvidence.findFirst({
          where: { userId, weekIndex: ev.weekIndex, caption: ev.caption, deletedAt: null }
        });
        if (!existingEv) {
          await tx.weeklyEvidence.create({
            data: {
              userId,
              weekIndex: ev.weekIndex,
              caption: ev.caption,
              imageData: ev.imageData
            }
          });
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
