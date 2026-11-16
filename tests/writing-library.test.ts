import { describe, expect, it } from 'vitest';
import { analyzeText } from '../shared/src/writing/analyze';

describe('Arabic writing checker', () => {
  it('fixes unambiguous spelling and punctuation without touching facts', () => {
    const a = analyzeText('عملت على استكشاف اعطال الشبكه , وفحص الاتصال الى الخادم باستخدام ping لمدة 4 ساعات', { kind: 'free' });
    expect(a.fixed).toBe('عملت على استكشاف أعطال الشبكة، وفحص الاتصال إلى الخادم باستخدام ping لمدة 4 ساعات.');
    expect(a.issues.filter((i) => i.kind === 'spelling').map((i) => i.replacement)).toEqual(expect.arrayContaining(['أعطال', 'الشبكة', 'إلى']));
  });

  it('applies the trainee glossary', () => {
    const a = analyzeText('ضبطت الراوتر الرئيسي.', { kind: 'free', glossary: [{ term: 'الراوتر', preferred: 'الموجّه' }] });
    expect(a.fixed).toBe('ضبطت الموجّه الرئيسي.');
  });

  it('flags filler and exaggeration but does not rewrite them', () => {
    const a = analyzeText('مما لا شك فيه أن العمل أُنجز بنجاح تام.', { kind: 'free' });
    expect(a.fixed).toContain('مما لا شك فيه');
    expect(a.issues.map((i) => i.kind)).toEqual(expect.arrayContaining(['filler', 'exaggeration']));
  });

  it('asks about missing sections in a structured entry', () => {
    const a = analyzeText('الفترة: صباحًا | الموقع: قسم FTTH\n\nالإنجاز: معالجة 18 تذكرة.', { kind: 'entry' });
    expect(a.questions).toEqual(['هل واجهت مشكلة؟ وكيف تعاملت معها؟', 'ما الذي تعلّمته من عمل اليوم؟']);
  });

  it('asks for detail when an unstructured entry is too short', () => {
    expect(analyzeText('فحصت الاتصال', { kind: 'entry' }).questions.length).toBe(2);
  });

  it('notices overuse of «تم» and mixed voice', () => {
    const t = 'تم فحص الخادم. تم ضبط المنفذ. تم توثيق النتائج. تم إغلاق التذكرة. راجعتُ السجلات وقام المتدرب بالمتابعة.';
    expect(analyzeText(t, { kind: 'free' }).issues.map((i) => i.kind)).toEqual(expect.arrayContaining(['tam', 'voice']));
  });

  it('flags inconsistent acronyms but not ordinary English words', () => {
    const kinds = analyzeText('ربطت خدمة FTTH ثم راجعت ftth and The router and the switch.', { kind: 'free' }).issues.filter((i) => i.kind === 'consistency');
    expect(kinds).toHaveLength(1);
    expect(kinds[0].message).toContain('FTTH');
  });

  it('is fast', () => {
    const t = 'عملت على استكشاف اعطال الشبكه وفحص الاتصال. '.repeat(400);
    const t0 = performance.now();
    analyzeText(t, { kind: 'section' });
    expect(performance.now() - t0).toBeLessThan(500);
  });
});
