import { describe, it, expect } from 'vitest';
import { getWeekStart } from '../shared/src/index';
import { PERIODIC_WEEKS, periodicWeeksFor } from '../client/src/components/final/periodicWeeks';

describe('periodic reports split by week', () => {
  it('keys every week by its Sunday start and puts each ticket day inside its week', () => {
    for (const w of PERIODIC_WEEKS) {
      expect(getWeekStart(w.weekStart)).toBe(w.weekStart);
      for (const t of w.tickets) expect(getWeekStart(t.date)).toBe(w.weekStart);
    }
  });

  it('keeps the documented period-1 total of 244 tickets', () => {
    const p1 = PERIODIC_WEEKS.filter((w) => w.period === 1).flatMap((w) => w.tickets);
    expect(p1.reduce((s, t) => s + t.count, 0)).toBe(244);
  });

  it('covers weeks 4 to 10 for a start date of 2026-09-02', () => {
    const base = new Date(`${getWeekStart('2026-09-02')}T00:00:00Z`).getTime();
    const idx = PERIODIC_WEEKS.map((w) => Math.round((new Date(`${w.weekStart}T00:00:00Z`).getTime() - base) / 604800000) + 1);
    expect(idx).toEqual([4, 5, 6, 7, 8, 9, 10]);
  });

  it('applies only to the trainee whose log holds the imported periodic entries', () => {
    expect(periodicWeeksFor(['زيارة موقع', 'اجتماع']).size).toBe(0);
    expect(periodicWeeksFor(['التعرف على بيئة تشغيل FTTH وتصنيف التذاكر التشغيلية']).size).toBe(7);
  });
});
