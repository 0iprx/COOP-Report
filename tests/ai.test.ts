import { describe, expect, it } from 'vitest';
import { checkGrounding, findDropped } from '../server/src/ai/grounding';
import { buildPrompt } from '../server/src/ai/tasks';
import { toDraft, ProviderError, LlmProvider } from '../server/src/ai/types';
import { generateWithChain, setProvidersForTest } from '../server/src/ai/registry';

describe('grounding check', () => {
  const source = 'عملت على استكشاف أعطال الشبكة وفحص الاتصال باستخدام ping مع الفريق لمدة 4 ساعات.';

  it('accepts a rewrite that only reuses source facts', () => {
    const out = 'باشرتُ استكشاف أعطال الشبكة وفحص الاتصال باستخدام أداة ping بالتعاون مع الفريق لمدة 4 ساعات.';
    expect(checkGrounding(out, [source], { checkLatin: true })).toEqual({ ok: true, unsupported: [] });
  });

  it('flags invented tools and figures', () => {
    const out = 'جرى تهيئة منافذ Cisco Catalyst وضبط VLAN 120 ثم فحص الاتصال باستخدام ping.';
    const g = checkGrounding(out, [source], { checkLatin: true });
    expect(g.ok).toBe(false);
    expect(g.unsupported).toEqual(expect.arrayContaining(['cisco', 'catalyst', 'vlan', '120']));
  });

  it('treats Arabic-Indic and Western digits as the same number', () => {
    expect(checkGrounding('استغرق العمل ٤ ساعات و٢٥ دقيقة', ['4 ساعات و25 دقيقة'], { checkLatin: true }).ok).toBe(true);
  });

  it('ignores single-digit list numbers', () => {
    expect(checkGrounding('1. فحص الاتصال 2. التوثيق', ['فحص الاتصال والتوثيق'], { checkLatin: true }).ok).toBe(true);
  });

  it('skips the English-word check when the output is English', () => {
    const g = checkGrounding('I troubleshot the network for 4 hours.', [source], { checkLatin: false });
    expect(g.ok).toBe(true);
  });
});

describe('draft validation', () => {
  it('normalizes a valid model object', () => {
    expect(toDraft({ text: ' نص ', questions: ['سؤال', 3, ''], changes: [] })).toEqual({ text: 'نص', questions: ['سؤال'], changes: [] });
  });
  it('rejects malformed output', () => {
    expect(toDraft({ questions: [] })).toBeNull();
    expect(toDraft('text')).toBeNull();
  });
});

describe('prompt building', () => {
  it('puts the learned style, answers and source in the prompt', () => {
    const { system, user } = buildPrompt(
      'academic_rewrite',
      'فحصت الاتصال',
      { kind: 'entry', lang: 'ar', answers: [{ question: 'ما الأداة؟', answer: 'ping' }] },
      { glossary: [{ term: 'راوتر', preferred: 'موجّه' }], notes: ['أفضّل الجمل القصيرة'], avoidPhrases: [], lengthPreference: 'shorter', examples: [] }
    );
    expect(system).toContain('موجّه');
    expect(system).toContain('أفضّل الجمل القصيرة');
    expect(system).toContain('أقصر');
    expect(user).toContain('<source_text>\nفحصت الاتصال\n</source_text>');
    expect(user).toContain('ping');
  });
  it('asks for English output when translating Arabic', () => {
    const { user } = buildPrompt('translate', 'نص', { kind: 'section', lang: 'ar', targetLang: 'en' }, null);
    expect(user).toContain('<target_language>English</target_language>');
  });
});

describe('provider chain', () => {
  const fake = (id: 'anthropic' | 'openai', behavior: () => Promise<string>): LlmProvider => ({
    id,
    model: `${id}-model`,
    health: async () => ({ ok: true }),
    generate: async () => ({
      draft: { text: await behavior(), questions: [], changes: [] },
      provider: id,
      model: `${id}-model`,
      inputTokens: 1,
      outputTokens: 1,
      latencyMs: 1
    })
  });

  it('retries once on a retryable error, then falls through to the next provider', async () => {
    let calls = 0;
    setProvidersForTest([
      fake('anthropic', async () => {
        calls++;
        throw new ProviderError('anthropic', 'busy', true, 529);
      }),
      fake('openai', async () => 'ok from openai')
    ]);
    const r = await generateWithChain({ system: 's', user: 'u', maxOutputTokens: 10 });
    expect(calls).toBe(2);
    expect(r.provider).toBe('openai');
    expect(r.draft.text).toBe('ok from openai');
  });

  it('reports every failure when no provider answers', async () => {
    setProvidersForTest([
      fake('anthropic', async () => {
        throw new ProviderError('anthropic', 'مفتاح غير صالح', false, 401);
      })
    ]);
    await expect(generateWithChain({ system: 's', user: 'u', maxOutputTokens: 10 })).rejects.toThrow(/مفتاح غير صالح/);
  });

  it('says clearly when nothing is configured', async () => {
    setProvidersForTest([]);
    await expect(generateWithChain({ system: 's', user: 'u', maxOutputTokens: 10 })).rejects.toThrow(/لم تُهيأ/);
  });
});

describe('dropped facts', () => {
  it('finds numbers and terms the rewrite lost', () => {
    const src = 'أنجزت 57 تذكرة عبر نظام MOSS ووصلت إلى 244 تذكرة.';
    expect(findDropped(src, 'أنجزت 57 تذكرة ووصل الإجمالي إلى عدد كبير.', { checkLatin: true })).toEqual(['244', 'moss']);
    expect(findDropped(src, 'عالجت ٥٧ تذكرة في نظام MOSS ليصبح الإجمالي 244 تذكرة.', { checkLatin: true })).toEqual([]);
  });
});
