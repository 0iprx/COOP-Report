import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import { logger } from '../logger.js';

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB raw limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export interface ProcessedImageResult {
  dataUrl: string;
  format: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Validates image buffer via magic bytes, rejects SVGs, and re-encodes via Sharp
 */
export async function sanitizeAndProcessImage(buffer: Buffer): Promise<ProcessedImageResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error('الملف فارغ أو غير موجود');
  }

  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new Error(`حجم الصورة يتجاوز الحد الأقصى المسموح به (${MAX_IMAGE_BYTES / (1024 * 1024)} ميجابايت)`);
  }

  // 1. Magic-byte sniffing using file-type
  const detectedType = await fileTypeFromBuffer(buffer);
  if (!detectedType) {
    throw new Error('نوع الملف غير معروف أو تالف');
  }

  // Strict SVG rejection (XSS vector prevention)
  if (detectedType.mime.includes('svg') || detectedType.ext === 'xml') {
    logger.warn({ mime: detectedType.mime }, 'Blocked SVG upload attempt for image evidence');
    throw new Error('صيغة SVG غير مسموح بها كشواهد ميدانية لدواعي الأمان والحماية');
  }

  if (!ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
    logger.warn({ mime: detectedType.mime }, 'Blocked invalid image type');
    throw new Error('نوع الصورة غير مدعوم. الصيغ المقبولة فقط: JPG, PNG, WebP');
  }

  try {
    // 2. Re-encode through Sharp (strips EXIF, clears malicious payloads, normalizes to WebP)
    const pipeline = sharp(buffer)
      .rotate() // Auto-orient based on EXIF before stripping
      .resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 82 }); // Normalize to optimized WebP

    const outputBuffer = await pipeline.toBuffer();
    const metadata = await sharp(outputBuffer).metadata();

    const dataUrl = `data:image/webp;base64,${outputBuffer.toString('base64')}`;

    return {
      dataUrl,
      format: 'webp',
      width: metadata.width || 0,
      height: metadata.height || 0,
      sizeBytes: outputBuffer.length
    };
  } catch (err: any) {
    logger.error({ err: err?.message }, 'Failed to re-encode image with sharp');
    throw new Error('فشلت معالجة الصورة وفحص أمانها');
  }
}

/**
 * Parses base64 data URL into buffer and verifies
 */
export async function sanitizeDataUrlImage(dataUrl: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  const match = dataUrl.match(/^data:image\/[a-zA-Z0-9+.-]+;base64,(.+)$/);
  if (!match || !match[1]) {
    return dataUrl;
  }

  const buffer = Buffer.from(match[1], 'base64');
  const result = await sanitizeAndProcessImage(buffer);
  return result.dataUrl;
}
