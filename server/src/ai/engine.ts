import { computeWordDiff } from '@coop/shared';
import { prisma } from '../db.js';
import { logger } from '../logger.js';
import { checkGrounding, findDropped } from './grounding.js';
import { analyzeText } from '@coop/shared';
import { learnFromDecision, loadLearning, toPromptProfile } from './learning.js';
import { generateWithChain } from './registry.js';
import { buildPrompt, SECTION_KEYS, SectionKey, TaskContext, TaskId } from './tasks.js';
import { ProviderError } from './types.js';

export type Target = { type: 'entry'; id: number; field: 'description' | 'title' } | { type: 'section'; key: SectionKey } | { type: 'free' };

export interface SuggestInput {
  userId: number;
  tenantId?: string;
  task: TaskId;
  text: string;
  target: Target;
  lang: 'ar' | 'en';
  targetLang?: 'ar' | 'en';
  answers?: { question: string; answer: string }[];
}

export class AiUserError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const MAX_SOURCE_CHARS = 12_000;

/** Collects the minimum context needed: the trainee's major and organization, and the entry or notes involved. */
async function buildContext(input: SuggestInput): Promise<{ ctx: TaskContext; extraSources: string[] }> {
  const profile = await prisma.reportProfile.findUnique({
    where: { userId: input.userId },
    select: { department: true, entityAddress: true }
  });
  const ctx: TaskContext = {
    kind: input.target.type === 'entry' ? 'entry' : 'section',
    lang: input.lang,
    targetLang: input.targetLang,
    department: profile?.department || undefined,
    organization: profile?.entityAddress || undefined,
    answers: input.answers?.filter((a) => a.answer?.trim()).slice(0, 5)
  };
  const extraSources: string[] = [];

  if (input.target.type === 'entry') {
    const entry = await prisma.entry.findFirst({ where: { id: input.target.id, userId: input.userId, deletedAt: null } });
    if (!entry) throw new AiUserError('الإدخال غير موجود أو لا تملك صلاحية تعديله', 404);
    ctx.entryTitle = entry.title;
    ctx.entryCategory = entry.category;
    extraSources.push(entry.title, entry.description);
  }

  if (input.target.type === 'section') {
    ctx.sectionKey = input.target.key;
    if (input.task === 'draft_section') {
      // Source material for a section draft: the trainee's own logged work, newest first, capped.
      const entries = await prisma.entry.findMany({
        where: { userId: input.userId, deletedAt: null },
        orderBy: { entryDate: 'asc' },
        select: { entryDate: true, title: true, description: true }
      });
      let budget = 9000;
      const notes: string[] = [];
      for (const e of entries) {
        const line = `${e.entryDate} — ${e.title}: ${e.description.replace(/\s+/g, ' ').slice(0, 400)}`;
        if (budget - line.length < 0) break;
        budget -= line.length;
        notes.push(line);
      }
      ctx.sourceNotes = notes;
      extraSources.push(...notes);
    }
  }
  if (ctx.department) extraSources.push(ctx.department);
  if (ctx.organization) extraSources.push(ctx.organization);
  for (const a of ctx.answers || []) extraSources.push(a.answer);
  return { ctx, extraSources };
}

export async function createSuggestion(input: SuggestInput) {
  const text = (input.text || '').trim();
  if (!text && input.task !== 'draft_section') throw new AiUserError('لا يوجد نص لمعالجته');
  if (text.length > MAX_SOURCE_CHARS) throw new AiUserError(`النص طويل جداً (${text.length} حرف). الحد ${MAX_SOURCE_CHARS} حرف للعملية الواحدة.`);

  const { ctx, extraSources } = await buildContext(input);
  const learned = toPromptProfile(await loadLearning(input.userId));
  const { system, user } = buildPrompt(input.task, text, ctx, learned);
  const outputLang = input.task === 'translate' ? ctx.targetLang || (ctx.lang === 'ar' ? 'en' : 'ar') : ctx.lang;
  const sources = [text, ...extraSources];
  const maxOutputTokens = 8000;

  let result = await generateWithChain({ system, user, maxOutputTokens });
  let grounding = checkGrounding(result.draft.text, sources, { checkLatin: outputLang === 'ar' });
  let attempts = 1;

  // Facts from the source that the draft lost (not checked for summaries, translations and fresh drafts).
  // When the source is mostly English and the output Arabic, English words are expected to change.
  const letters = text.match(/[A-Za-z؀-ۿ]/g) || [];
  const latinShare = letters.length ? letters.filter((c) => /[A-Za-z]/.test(c)).length / letters.length : 0;
  const keepsAllFacts = text && !['summarize', 'translate', 'draft_section'].includes(input.task);
  const droppedOf = (proposal: string) =>
    keepsAllFacts ? findDropped(text, proposal, { checkLatin: outputLang === 'ar' && latinShare < 0.4 }) : [];
  let dropped = droppedOf(result.draft.text);

  // Small local models can drift into another script (e.g. Chinese) on long inputs.
  const FOREIGN_SCRIPT = /[぀-ヿ㐀-鿿가-힯Ѐ-ӿ]/;
  let drifted = FOREIGN_SCRIPT.test(result.draft.text);

  // One corrective pass when the draft added unsupported details, lost source facts or drifted language.
  if ((!grounding.ok || dropped.length || drifted) && result.draft.text) {
    const notes: string[] = [];
    if (drifted) notes.push(outputLang === 'ar' ? 'اكتب بالعربية فقط (مع المصطلحات الإنجليزية كما هي). احتوى اقتراحك السابق على لغة أخرى.' : 'Write in English only. Your previous draft switched to another language.');
    if (outputLang === 'ar') {
      if (!grounding.ok) notes.push(`احتوى اقتراحك على عناصر غير موجودة في المصدر: ${grounding.unsupported.join('، ')}. احذفها، وإن كانت ضرورية فاسأل عنها في questions.`);
      if (dropped.length) notes.push(`أسقط اقتراحك معلومات وردت في المصدر: ${dropped.join('، ')}. أعدها كلها.`);
    } else {
      if (!grounding.ok) notes.push(`Your draft contained items not in the source: ${grounding.unsupported.join(', ')}. Remove them; if they matter, ask in questions.`);
      if (dropped.length) notes.push(`Your draft lost facts from the source: ${dropped.join(', ')}. Put all of them back.`);
    }
    const fix = `\n\n<correction>\n${notes.join('\n')}\n</correction>`;
    try {
      const second = await generateWithChain({ system, user: user + fix, maxOutputTokens });
      const g2 = checkGrounding(second.draft.text, sources, { checkLatin: outputLang === 'ar' });
      const d2 = droppedOf(second.draft.text);
      const drift2 = FOREIGN_SCRIPT.test(second.draft.text);
      attempts = 2;
      const score = (g: number, d: number, x: boolean) => g + d + (x ? 100 : 0);
      if (score(g2.unsupported.length, d2.length, drift2) <= score(grounding.unsupported.length, dropped.length, drifted)) {
        result = { ...second, inputTokens: result.inputTokens + second.inputTokens, outputTokens: result.outputTokens + second.outputTokens };
        grounding = g2;
        dropped = d2;
        drifted = drift2;
      }
    } catch (err) {
      logger.warn({ err: (err as Error).message }, 'Corrective AI pass failed; keeping first draft with warnings');
    }
  }
  if (drifted) {
    throw new AiUserError('لم يتمكن النموذج من صياغة هذا النص بشكل سليم (خرج عن اللغة). جرّب جزءاً أقصر من النص.', 422);
  }

  const targetId = input.target.type === 'entry' ? `${input.target.id}:${input.target.field}` : input.target.type === 'section' ? input.target.key : null;
  const saved = await prisma.aiSuggestion.create({
    data: {
      userId: input.userId,
      task: input.task,
      targetType: input.target.type,
      targetId,
      sourceText: text,
      proposedText: result.draft.text,
      questions: JSON.stringify(result.draft.questions),
      changes: JSON.stringify(result.draft.changes),
      unsupported: JSON.stringify({ added: grounding.unsupported, dropped }),
      provider: result.provider,
      model: result.model.slice(0, 80)
    }
  });

  await prisma.aiUsageLog
    .create({
      data: {
        tenantId: input.tenantId || 'default_tenant',
        userId: input.userId,
        provider: result.provider,
        action: input.task,
        tokensIn: result.inputTokens,
        tokensOut: result.outputTokens,
        costEstimate: 0
      }
    })
    .catch(() => undefined);

  return {
    id: saved.id,
    task: input.task,
    source: text,
    proposed: result.draft.text,
    questions: result.draft.questions,
    changes: result.draft.changes,
    unsupported: grounding.unsupported,
    dropped,
    diff: text ? computeWordDiff(text, result.draft.text) : [],
    provider: result.provider,
    model: result.model,
    attempts,
    latencyMs: result.latencyMs,
    learnedApplied: !!learned
  };
}

/** Accept (optionally with the trainee's own edits) or reject. Accepting writes the text with a revision kept. */
export async function decideSuggestion(userId: number, id: number, decision: 'accepted' | 'rejected', finalText?: string) {
  const s = await prisma.aiSuggestion.findFirst({ where: { id, userId } });
  if (!s) throw new AiUserError('الاقتراح غير موجود', 404);
  if (s.status !== 'pending') throw new AiUserError('تم البت في هذا الاقتراح مسبقاً', 409);

  const final = decision === 'accepted' ? (finalText ?? s.proposedText).trim() : null;
  if (decision === 'accepted' && !final) throw new AiUserError('النص المعتمد فارغ');

  let applied: { type: string; id?: number; key?: string } | null = null;

  if (decision === 'accepted' && s.targetType === 'entry' && s.targetId) {
    const [idStr, field] = s.targetId.split(':');
    const entry = await prisma.entry.findFirst({ where: { id: Number(idStr), userId, deletedAt: null } });
    if (!entry) throw new AiUserError('الإدخال لم يعد موجوداً', 404);
    if (field === 'title' && final!.length > 150) throw new AiUserError('العنوان أطول من 150 حرفاً');
    await prisma.$transaction([
      prisma.entryRevision.create({
        data: { entryId: entry.id, title: entry.title, category: entry.category, description: entry.description, timeFrom: entry.timeFrom, timeTo: entry.timeTo }
      }),
      prisma.entry.update({ where: { id: entry.id }, data: field === 'title' ? { title: final! } : { description: final! } })
    ]);
    applied = { type: 'entry', id: entry.id };
  }

  if (decision === 'accepted' && s.targetType === 'section' && s.targetId && (SECTION_KEYS as readonly string[]).includes(s.targetId)) {
    const key = s.targetId as SectionKey;
    // The previous section text stays in ai_suggestions.source_text, so it can be restored.
    await prisma.reportProfile.upsert({ where: { userId }, create: { userId, [key]: final! }, update: { [key]: final! } });
    applied = { type: 'section', key };
  }

  await prisma.aiSuggestion.update({ where: { id }, data: { status: decision, finalText: final, decidedAt: new Date() } });
  const learning = await learnFromDecision(userId, { task: s.task, proposed: s.proposedText, final, decision });
  return { status: decision, applied, finalText: final, stats: learning.stats };
}

export { ProviderError };

/**
 * Instant check with the lightweight writing library: no model, runs in milliseconds.
 * Stored as a suggestion so accept/reject and learning work exactly like model suggestions.
 */
export async function createLibraryCheck(input: { userId: number; text: string; target: Target }) {
  const text = (input.text || '').trim();
  if (!text) throw new AiUserError('لا يوجد نص لفحصه');
  if (text.length > 40_000) throw new AiUserError('النص طويل جداً للفحص دفعة واحدة');
  const memory = await loadLearning(input.userId);
  const analysis = analyzeText(text, {
    kind: input.target.type === 'entry' ? 'entry' : input.target.type === 'section' ? 'section' : 'free',
    glossary: memory.glossary,
    avoidPhrases: memory.avoidPhrases
  });
  const targetId = input.target.type === 'entry' ? `${input.target.id}:${input.target.field}` : input.target.type === 'section' ? input.target.key : null;
  const saved = await prisma.aiSuggestion.create({
    data: {
      userId: input.userId,
      task: 'library_check',
      targetType: input.target.type,
      targetId,
      sourceText: text,
      proposedText: analysis.fixed,
      questions: JSON.stringify(analysis.questions),
      changes: JSON.stringify(analysis.issues.filter((i) => i.autoFixed).map((i) => i.message)),
      unsupported: JSON.stringify({ added: [], dropped: [] }),
      provider: 'library',
      model: 'arabic-writing-rules'
    }
  });
  return {
    id: saved.id,
    task: 'library_check' as const,
    source: text,
    proposed: analysis.fixed,
    changed: analysis.fixed !== text,
    issues: analysis.issues,
    questions: analysis.questions,
    stats: analysis.stats,
    diff: computeWordDiff(text, analysis.fixed),
    provider: 'library',
    model: 'arabic-writing-rules'
  };
}
