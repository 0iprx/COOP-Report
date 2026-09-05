import crypto from 'crypto';
import QRCode from 'qrcode';
import { prisma } from '../db.js';
import { ReportVerificationDTO } from '@coop/shared';

const HMAC_SECRET = process.env.JWT_SECRET || 'coop-report-hmac-verification-secret';
const PUBLIC_VERIFY_HOST = process.env.PUBLIC_VERIFY_HOST || 'https://verify.coop.report';

/**
 * Computes an tamper-proof HMAC verification hash for approved report
 */
export function generateVerificationHash(reportId: number, approvedAt: string | Date, supervisorId: number): string {
  const dateStr = typeof approvedAt === 'string' ? approvedAt : approvedAt.toISOString();
  const rawPayload = `${reportId}:${dateStr}:${supervisorId}`;
  return crypto.createHmac('sha256', HMAC_SECRET).update(rawPayload).digest('hex').slice(0, 32);
}

/**
 * Generates a PNG QR Code Buffer linking to public verification URL
 */
export async function generateVerificationQRCodeBuffer(reportId: number, hash: string): Promise<Buffer> {
  const url = `${PUBLIC_VERIFY_HOST}/${reportId}/${hash}`;
  const qrBuffer = await QRCode.toBuffer(url, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 140,
    color: {
      dark: '#1e293b',
      light: '#ffffff'
    }
  });
  return qrBuffer;
}

/**
 * Masks a student name for privacy: "محمد عبدالله الحربي" -> "مـ*** الحربي"
 */
export function maskStudentName(name: string): string {
  if (!name) return 'متدرب معتمد';
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first.charAt(0)}*** ${last}`;
}

/**
 * Public lookup for report verification
 */
export async function verifyReportByHash(reportId: number, hash: string): Promise<ReportVerificationDTO | null> {
  const profile = await prisma.reportProfile.findUnique({
    where: { userId: reportId },
    include: {
      user: {
        include: { supervisor: true }
      }
    }
  });

  if (!profile || !profile.supervisorApproved || !profile.supervisorApprovedAt) {
    return null;
  }

  const supervisorId = profile.user.supervisorId || 0;
  const expectedHash = generateVerificationHash(reportId, profile.supervisorApprovedAt, supervisorId);

  if (hash !== expectedHash && hash !== profile.verificationHash) {
    return null;
  }

  return {
    valid: true,
    reportId,
    studentNameMasked: maskStudentName(profile.studentName),
    trainingUnit: profile.trainingUnit || 'الجامعة المعتمدة',
    entityAddress: profile.entityAddress || 'جهة التدريب المعتمدة',
    trainingWeeks: profile.trainingWeeks || 14,
    courseHours: profile.courseHours || 280,
    approvedAt: profile.supervisorApprovedAt ? profile.supervisorApprovedAt.toISOString() : null,
    supervisorName: profile.supervisorName || profile.user.supervisor?.username || 'المشرف الأكاديمي',
    status: profile.status || 'approved'
  };
}
