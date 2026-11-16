import { prisma } from '../db.js';
import { LearnedProfileForPrompt } from './tasks.js';

/**
 * The learner: a small per-trainee memory built from their own decisions.
 * - Every accepted suggestion the trainee edited becomes a style example.
 * - Phrases the trainee deletes from suggestions are remembered as "avoid".
 * - The length of what they keep vs. what was proposed sets a length preference.
 * - Glossary and notes are written by the trainee and can be edited any time.
 * Nothing here is sent anywhere except inside that trainee's own prompts.
 */

export interface LearningData {
  glossary: { term: string; preferred: string }[];
  notes: string[];
  avoidPhrases: string[];
  lengthRatios: number[];
  examples: { before: string; after: string; task: string; at: string }[];
  stats: { accepted: number; acceptedAsIs: number; edited: number; rejected: number };
}

const EMPTY: LearningData = {
  glossary: [],
  notes: [],
  avoidPhrases: [],
  lengthRatios: [],
  examples: [],
  stats: { accepted: 0, acceptedAsIs: 0, edited: 0, rejected: 0 }
};

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export async function loadLearning(userId: number): Promise<LearningData> {
  const row = await prisma.aiLearningProfile.findUnique({ where: { userId } });
  if (!row) return clone(EMPTY);
  try {
    return { ...clone(EMPTY), ...JSON.parse(row.data) };
  } catch {
    return clone(EMPTY);
  }
}

async function saveLearning(userId: number, data: LearningData): Promise<void> {
  const json = JSON.stringify(data);
  await prisma.aiLearningProfile.upsert({ where: { userId }, create: { userId, data: json }, update: { data: json } });
}

export function toPromptProfile(d: LearningData): LearnedProfileForPrompt | null {
  const ratios = d.lengthRatios.slice(-8);
  const avg = ratios.length >= 3 ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 1;
  const lengthPreference = ratios.length < 3 ? null : avg < 0.8 ? 'shorter' : avg > 1.2 ? 'longer' : 'same';
  const empty = !d.glossary.length && !d.notes.length && !d.avoidPhrases.length && !d.examples.length && !lengthPreference;
  if (empty) return null;
  return {
    glossary: d.glossary.slice(0, 40),
    notes: d.notes.slice(0, 10),
    avoidPhrases: d.avoidPhrases.slice(-20),
    lengthPreference,
    examples: d.examples.slice(-3).map(({ before, after }) => ({ before, after }))
  };
}

/** Splits text into short clauses so we can see which ones the trainee deleted. */
function clauses(text: string): string[] {
  return text
    .split(/[.،,؛;:!?؟\n]+/)
    .map((c) => c.trim().replace(/\s+/g, ' '))
    .filter((c) => c.split(' ').length >= 2 && c.split(' ').length <= 8);
}

export async function learnFromDecision(
  userId: number,
  d: { task: string; proposed: string; final: string | null; decision: 'accepted' | 'rejected' }
): Promise<LearningData> {
  const data = await loadLearning(userId);
  if (d.decision === 'rejected') {
    data.stats.rejected++;
  } else {
    data.stats.accepted++;
    const final = (d.final ?? d.proposed).trim();
    const proposed = d.proposed.trim();
    if (final === proposed) {
      data.stats.acceptedAsIs++;
    } else {
      data.stats.edited++;
      data.examples.push({ before: proposed.slice(0, 1200), after: final.slice(0, 1200), task: d.task, at: new Date().toISOString() });
      data.examples = data.examples.slice(-10);
      const kept = final.replace(/\s+/g, ' ');
      for (const c of clauses(proposed)) {
        if (!kept.includes(c) && !data.avoidPhrases.includes(c)) data.avoidPhrases.push(c);
      }
      data.avoidPhrases = data.avoidPhrases.slice(-30);
    }
    if (proposed.length > 40) {
      data.lengthRatios.push(Math.round((final.length / proposed.length) * 100) / 100);
      data.lengthRatios = data.lengthRatios.slice(-12);
    }
  }
  await saveLearning(userId, data);
  return data;
}

export async function updateLearningByUser(
  userId: number,
  patch: Partial<Pick<LearningData, 'glossary' | 'notes' | 'avoidPhrases'>> & { reset?: boolean }
): Promise<LearningData> {
  const data = patch.reset ? clone(EMPTY) : await loadLearning(userId);
  if (patch.glossary) {
    data.glossary = patch.glossary
      .map((g) => ({ term: String(g.term || '').trim().slice(0, 80), preferred: String(g.preferred || '').trim().slice(0, 80) }))
      .filter((g) => g.term && g.preferred)
      .slice(0, 60);
  }
  if (patch.notes) data.notes = patch.notes.map((n) => String(n).trim().slice(0, 300)).filter(Boolean).slice(0, 15);
  if (patch.avoidPhrases) data.avoidPhrases = patch.avoidPhrases.map((n) => String(n).trim().slice(0, 120)).filter(Boolean).slice(0, 30);
  await saveLearning(userId, data);
  return data;
}
