import { describe, it, expect } from 'vitest';
import {
  computeNovelty,
  chooseRewriteStyle,
  formalizeDialect,
  extractTechTerms
} from '../server/src/services/entryInsightService';

const mk = (id: number, entryDate: string, title: string, description: string, category = 'هندسة الشبكات وتراسل البيانات') => ({
  id,
  entryDate,
  title,
  category,
  description
});
const priors = (...entries: ReturnType<typeof mk>[]) => entries.map((entry) => ({ entry }));

const vlan1 = mk(1, '2026-09-01', 'تهيئة VLAN على سويتش Cisco', 'رحت مع المهندس وسويت تهيئة VLAN 10 و VLAN 20 على سويتش Cisco 2960 عشان نفصل الشبكات وبعدين جربنا ping');
const vlan2 = mk(2, '2026-09-02', 'تهيئة VLAN على سويتش ثاني', 'سويت تهيئة VLAN 10 و VLAN 20 على سويتش Cisco 2960 ثاني وجربنا ping');
const cameras = mk(3, '2026-09-03', 'تركيب كاميرات مراقبة', 'ركبت كاميرات Hikvision وربطتها بجهاز NVR وضبطت الإعدادات عبر واجهة الويب');
const trunk = mk(4, '2026-09-04', 'إعداد Trunk بين السويتشات', 'ضبطت منفذ trunk بين سويتشين Cisco 2960 ونقلت VLAN 10 و VLAN 20 مع تفعيل 802.1Q');

describe('Learning novelty against earlier days', () => {
  it('treats the first day as new', () => {
    expect(computeNovelty(vlan1, []).heuristicStatus).toBe('new');
  });

  it('flags a repeat of an earlier task as routine', () => {
    expect(computeNovelty(vlan2, priors(vlan1)).heuristicStatus).toBe('routine');
  });

  it('flags an unrelated topic as new', () => {
    const n = computeNovelty(cameras, priors(vlan1, vlan2));
    expect(n.heuristicStatus).toBe('new');
    expect(n.novelTechTerms).toEqual(expect.arrayContaining(['Hikvision', 'NVR']));
  });

  it('flags work that extends earlier knowledge as reinforced', () => {
    const n = computeNovelty(trunk, priors(vlan1, vlan2, cameras));
    expect(n.heuristicStatus).toBe('reinforced');
    expect(n.topMatches[0].prior.entry.id).toBeLessThanOrEqual(2);
  });
});

describe('Rewrite style selection', () => {
  it('uses STAR for troubleshooting', () => {
    expect(
      chooseRewriteStyle(
        mk(5, 'x', 'حل مشكلة انقطاع الشبكة', 'واجهنا عطل في الراوتر وقمت باستكشاف الخلل وإعادة التشغيل وتحديث الإعدادات حتى عادت الخدمة للعمل في جميع المكاتب بشكل طبيعي')
      )
    ).toBe('star_impact');
  });

  it('uses competencies for learning sessions', () => {
    expect(
      chooseRewriteStyle(
        mk(6, 'x', 'ورشة عن الأمن السيبراني', 'حضرت ورشة شرح فيها المهندس أساسيات الجدران النارية وتعرفت على أنواع الهجمات الشائعة وطرق الحماية منها في بيئة العمل الفعلية والتطبيق عليها')
      )
    ).toBe('academic_competency');
  });
});

describe('Diary phrasing to report phrasing', () => {
  it('converts Saudi colloquial verbs, including with attached و', () => {
    const out = formalizeDialect('اليوم رحت مع المهندس وسويت تهيئة عشان نفصل الشبكات وبعدين خلصت الشغل');
    expect(out).not.toMatch(/رحت|سويت|عشان|بعدين|خلصت/);
    expect(out).toContain('ونفّذت');
    expect(out.startsWith('اليوم')).toBe(false);
  });

  it('does not alter formal words that merely contain a colloquial form', () => {
    expect(formalizeDialect('النظام الذي نعمل فيه')).toBe('النظام الذي نعمل فيه');
  });

  it('extracts technical terms', () => {
    expect(extractTechTerms(trunk.description)).toEqual(expect.arrayContaining(['Cisco', 'VLAN']));
  });
});
