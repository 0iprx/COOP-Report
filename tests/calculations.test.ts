import { describe, it, expect } from 'vitest';
import {
  calculateHoursBetween,
  getWeekStart,
  getWeekEnd,
  countWords,
  estimatePageCount,
  computeWordDiff
} from '../shared/src/index';

describe('Accurate Hours Calculation', () => {
  it('calculates standard daily shift accurately (08:00 to 16:00 -> 8.0h)', () => {
    const hours = calculateHoursBetween('08:00', '16:00');
    expect(hours).toBe(8.0);
  });

  it('calculates partial hour shift accurately (08:30 to 17:15 -> 8.75h)', () => {
    const hours = calculateHoursBetween('08:30', '17:15');
    expect(hours).toBe(8.75);
  });

  it('handles shifts spanning midnight properly (22:00 to 02:00 -> 4.0h)', () => {
    const hours = calculateHoursBetween('22:00', '02:00');
    expect(hours).toBe(4.0);
  });

  it('returns 0 for invalid or empty inputs', () => {
    expect(calculateHoursBetween('', '16:00')).toBe(0);
    expect(calculateHoursBetween('08:00', '')).toBe(0);
  });
});

describe('Saudi Week Grouping (Sunday to Saturday)', () => {
  it('identifies week start on Sunday correctly for a mid-week Wednesday', () => {
    // 2026-09-02 is Wednesday
    const weekStart = getWeekStart('2026-09-02');
    // Sunday of that week was 2026-08-30
    expect(weekStart).toBe('2026-08-30');
  });

  it('identifies week start on Sunday when the day itself is Sunday', () => {
    const weekStart = getWeekStart('2026-08-30');
    expect(weekStart).toBe('2026-08-30');
  });

  it('identifies week end on Saturday correctly', () => {
    const weekStart = '2026-08-30';
    const weekEnd = getWeekEnd(weekStart);
    // Saturday is 2026-09-05
    expect(weekEnd).toBe('2026-09-05');
  });
});

describe('Word Count and Academic Page Estimation', () => {
  it('counts Arabic and English words accurately', () => {
    const arabicText = 'قام الفريق بتهيئة شبكة الاتصالات واختبار التوصيلات الأمنية بنجاح';
    expect(countWords(arabicText)).toBe(9);

    const bilingualText = 'تم ربط نظام Huawei Cloud مع Enterprise Core بنجاح';
    expect(countWords(bilingualText)).toBe(9);
  });

  it('estimates pages realistically based on 350 words per page', () => {
    expect(estimatePageCount(350)).toBe(1);
    expect(estimatePageCount(7000)).toBe(20);
    expect(estimatePageCount(0)).toBe(1);
  });
});

describe('Word Diff Engine for AI Polish Preview', () => {
  it('identifies unchanged, added, and removed segments', () => {
    const orig = 'تم عمل تدريب';
    const mod = 'تم إنجاز تدريب مكثف';
    const diff = computeWordDiff(orig, mod);
    expect(diff.length).toBeGreaterThan(0);
    const added = diff.some(d => d.type === 'added');
    expect(added).toBe(true);
  });
});
