/**
 * Writing tasks. Every task shares one output contract (AiDraft) and one set of
 * ground rules; tasks differ only in what they ask for.
 */

export const TASK_IDS = [
  'academic_rewrite',
  'improve_clarity',
  'fix_grammar',
  'summarize',
  'translate',
  'draft_section',
  'review'
] as const;
export type TaskId = (typeof TASK_IDS)[number];

export const SECTION_KEYS = ['introText', 'entityIntroText', 'skillsText', 'conclusionText'] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  introText: 'المقدمة وأهداف التدريب',
  entityIntroText: 'التعريف بجهة التدريب وطبيعة العمل',
  skillsText: 'المعارف والمهارات المكتسبة',
  conclusionText: 'الخاتمة والتوصيات'
};

export interface TaskContext {
  /** What the text is: a daily entry or a report section. */
  kind: 'entry' | 'section';
  sectionKey?: SectionKey;
  lang: 'ar' | 'en';
  targetLang?: 'ar' | 'en';
  department?: string;
  organization?: string;
  entryTitle?: string;
  entryCategory?: string;
  /** Trainee's own logged entries used as source material (draft_section). */
  sourceNotes?: string[];
  /** Answers the trainee gave to earlier questions. */
  answers?: { question: string; answer: string }[];
}

const GROUND_RULES_AR = `أنت محرر أكاديمي لتقارير التدريب التعاوني الجامعية. تكتب بالعربية الفصحى المعاصرة بأسلوب رسمي واضح.

قواعد لا تُخالف:
1. اكتب فقط ما يدعمه النص المصدر أو السياق أو إجابات المتدرب. لا تضف أجهزة أو برامج أو أدوات أو أرقاماً أو نتائج أو أسماء أو خطوات لم تُذكر.
2. لا تحذف أي معلومة واقعية وردت في المصدر: كل رقم، وكل أداة أو نظام، وكل عطل، وكل بند في قائمة، وكل مصطلح.
3. أبقِ المصطلحات التقنية الإنجليزية كما كتبها المتدرب.
4. إذا كان النص مقسّماً بعناوين في أول السطر مثل «الفترة:» و«الموقع:» و«الإنجاز:» و«المشاكل:» و«الجديد:»، فأبقِ هذه العناوين بنصها وترتيبها وفي أسطر مستقلة، وحسّن الكلام تحت كل عنوان فقط. لا تدمج الأقسام في فقرة واحدة.
5. حافظ على صيغة الكاتب: إن كتب بصيغة المتكلم فاكتب بها، وإن كتب بالمبني للمجهول فاكتب به. لا تحوّل الكلام إلى الغائب («المتدرب»). نوّع بدايات الجمل ولا تبدأ أكثر الجمل بـ«تم».
6. تجنّب الحشو والعبارات الجاهزة والمبالغة.
7. لا رموز تعبيرية، ولا تحيات، ولا تعليق خارج النص.
8. questions: اترك المصفوفة فارغة إذا كان النص كافياً. لا تسأل إلا عن معلومة محددة ينقص النص بدونها شيء واضح، واجعل السؤال خاصاً بهذا النص تحديداً، وبحد أقصى سؤالان.
9. changes: صف بإيجاز التغييرات التي أجريتها فعلاً، ولا تذكر تغييراً لم تفعله.

أعد كائن JSON فقط بالحقول: text (النص المقترح)، questions (مصفوفة نصوص)، changes (مصفوفة نصوص).`;

const GROUND_RULES_EN = `You are an academic editor for university cooperative-training reports. Write clear, formal English.

Rules you never break:
1. Write only what the source text, the context, or the trainee's answers support. Never add devices, software, tools, numbers, results, names or steps that were not stated.
2. Do not drop any factual detail from the source: every number, tool or system, fault, list item and term.
3. Keep technical terms exactly as the trainee wrote them.
4. If the text is split by line-start labels such as "Period:", "Location:", "Accomplishments:", "Challenges:", "New Learnings:", keep those labels verbatim, in order and on their own lines, and improve only the text under each. Do not merge them into one paragraph.
5. Keep the writer's voice (first person or passive); do not switch to "the trainee". Vary sentence openings.
6. No filler or stock phrases, no exaggeration.
7. No emojis, no greetings, no commentary outside the text.
8. questions: leave empty when the text is sufficient. Ask only about a specific missing fact this particular text clearly needs; at most two.
9. changes: briefly describe the changes you actually made; never list one you did not make.

Return only a JSON object with the fields: text, questions (array of strings), changes (array of strings).`;

const TASK_INSTRUCTIONS: Record<TaskId, { ar: string; en: string }> = {
  academic_rewrite: {
    ar: 'أعد صياغة النص بأسلوب أكاديمي مهني يناسب تقرير تدريب تعاوني: فقرات مترابطة، أفعال إجرائية واضحة، ترتيب منطقي للأحداث. حافظ على المعنى والطول التقريبي ما لم يكن المصدر مختصراً جداً.',
    en: 'Rewrite the text in a professional academic style suitable for a co-op training report: connected paragraphs, clear action verbs, logical order. Keep the meaning and roughly the same length unless the source is very short.'
  },
  improve_clarity: {
    ar: 'حسّن وضوح النص وترابطه: رتّب الجمل، أزل التكرار، اربط الأفكار. لا تغيّر المستوى الأكاديمي كثيراً ولا تضف معلومات.',
    en: 'Improve clarity and flow: reorder sentences, remove repetition, connect ideas. Do not change the register much and do not add information.'
  },
  fix_grammar: {
    ar: 'صحّح الأخطاء الإملائية والنحوية وعلامات الترقيم والهمزات فقط. لا تغيّر الأسلوب ولا الصياغة ولا ترتيب الجمل.',
    en: 'Fix spelling, grammar and punctuation only. Do not change style, wording or sentence order.'
  },
  summarize: {
    ar: 'لخّص النص في فقرة واحدة موجزة تحفظ أهم ما أُنجز والأدوات والنتائج المذكورة.',
    en: 'Summarize the text in one short paragraph that keeps the main work done, the tools and the results mentioned.'
  },
  translate: {
    ar: 'ترجم النص ترجمة مهنية أمينة إلى اللغة الهدف، مع الحفاظ على المصطلحات التقنية والأرقام وبنية الفقرات.',
    en: 'Translate the text faithfully and professionally into the target language, keeping technical terms, numbers and paragraph structure.'
  },
  draft_section: {
    ar: 'اكتب مسودة القسم المطلوب من تقرير التدريب اعتماداً فقط على ملاحظات المتدرب المرفقة والسياق. إن لم تكفِ الملاحظات لقسم جيد فاكتب ما تسمح به واطرح أسئلة.',
    en: 'Draft the requested report section using only the trainee notes and context provided. If the notes are not enough for a good section, write what they allow and ask questions.'
  },
  review: {
    ar: 'راجع النص كمحرر: صحّح اللغة وحسّن الترابط باعتدال، وفي changes اذكر أيضاً ملاحظات على ما ينقص النص أكاديمياً (دون أن تضيفه بنفسك).',
    en: 'Review the text as an editor: fix language and improve flow moderately, and in changes also note what the text is missing academically (without adding it yourself).'
  }
};

export interface LearnedProfileForPrompt {
  glossary: { term: string; preferred: string }[];
  notes: string[];
  avoidPhrases: string[];
  lengthPreference: 'shorter' | 'same' | 'longer' | null;
  examples: { before: string; after: string }[];
}

function renderLearning(p: LearnedProfileForPrompt | null, isAr: boolean): string {
  if (!p) return '';
  const lines: string[] = [];
  const h = (ar: string, en: string) => (isAr ? ar : en);
  if (p.notes.length) lines.push(h('ملاحظات المتدرب عن أسلوبه:', 'The trainee’s own style notes:'), ...p.notes.map((n) => `- ${n}`));
  if (p.glossary.length) {
    lines.push(h('مصطلحات يفضّلها المتدرب (استخدم المفضّل دائماً):', 'Preferred terms (always use the preferred form):'));
    lines.push(...p.glossary.map((g) => `- ${g.term} ← ${g.preferred}`));
  }
  if (p.avoidPhrases.length) lines.push(h('عبارات حذفها المتدرب سابقاً، لا تستخدمها:', 'Phrases the trainee removed before; do not use them:'), ...p.avoidPhrases.map((a) => `- ${a}`));
  if (p.lengthPreference === 'shorter') lines.push(h('يفضّل المتدرب صياغة أقصر مما تقترحه عادة.', 'The trainee prefers shorter output than you usually give.'));
  if (p.lengthPreference === 'longer') lines.push(h('يفضّل المتدرب صياغة أكثر تفصيلاً قليلاً.', 'The trainee prefers slightly more detailed output.'));
  if (p.examples.length) {
    lines.push(h('أمثلة على تعديلات المتدرب لاقتراحاتك السابقة (اقتراحك ← ما اعتمده هو). تعلّم منها الأسلوب لا المحتوى:', 'Examples of how the trainee edited your earlier suggestions (yours → what they kept). Learn the style, not the content:'));
    p.examples.slice(-3).forEach((e, i) => {
      lines.push(`<example_${i + 1}>\n${h('اقتراحك', 'yours')}: ${e.before.slice(0, 600)}\n${h('ما اعتمده', 'kept')}: ${e.after.slice(0, 600)}\n</example_${i + 1}>`);
    });
  }
  return lines.length ? `\n\n${h('ما تعلّمته عن هذا المتدرب:', 'What you have learned about this trainee:')}\n${lines.join('\n')}` : '';
}

export function buildPrompt(task: TaskId, text: string, ctx: TaskContext, learned: LearnedProfileForPrompt | null) {
  const outLang = task === 'translate' ? ctx.targetLang || (ctx.lang === 'ar' ? 'en' : 'ar') : ctx.lang;
  const isAr = outLang === 'ar';
  const system = (isAr ? GROUND_RULES_AR : GROUND_RULES_EN) + renderLearning(learned, isAr);

  const parts: string[] = [];
  parts.push(`<task>\n${TASK_INSTRUCTIONS[task][isAr ? 'ar' : 'en']}\n</task>`);
  if (task === 'translate') parts.push(`<target_language>${outLang === 'ar' ? 'Arabic' : 'English'}</target_language>`);

  const ctxLines: string[] = [];
  if (ctx.kind === 'section' && ctx.sectionKey) ctxLines.push(`${isAr ? 'القسم' : 'Section'}: ${SECTION_LABELS[ctx.sectionKey]}`);
  if (ctx.kind === 'entry') ctxLines.push(isAr ? 'النوع: إدخال يومي في سجل التدريب' : 'Type: daily training-log entry');
  if (ctx.entryTitle) ctxLines.push(`${isAr ? 'عنوان الإدخال' : 'Entry title'}: ${ctx.entryTitle}`);
  if (ctx.entryCategory) ctxLines.push(`${isAr ? 'المجال' : 'Area'}: ${ctx.entryCategory}`);
  if (ctx.department) ctxLines.push(`${isAr ? 'تخصص المتدرب' : 'Trainee major'}: ${ctx.department}`);
  if (ctx.organization) ctxLines.push(`${isAr ? 'جهة التدريب' : 'Host organization'}: ${ctx.organization}`);
  if (ctxLines.length) parts.push(`<context>\n${ctxLines.join('\n')}\n</context>`);

  if (ctx.sourceNotes?.length) {
    parts.push(`<trainee_notes>\n${ctx.sourceNotes.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n</trainee_notes>`);
  }
  if (ctx.answers?.length) {
    parts.push(`<trainee_answers>\n${ctx.answers.map((a) => `${isAr ? 'س' : 'Q'}: ${a.question}\n${isAr ? 'ج' : 'A'}: ${a.answer}`).join('\n\n')}\n</trainee_answers>`);
  }
  parts.push(`<source_text>\n${text || (isAr ? '(فارغ)' : '(empty)')}\n</source_text>`);
  return { system, user: parts.join('\n\n') };
}
