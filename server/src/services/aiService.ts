import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../logger.js';

const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim().replace(/^["']|["']$/g, '');
const geminiKey = process.env.GEMINI_API_KEY?.trim().replace(/^["']|["']$/g, '');
const groqKey = process.env.GROQ_API_KEY?.trim().replace(/^["']|["']$/g, '');
const openaiKey = process.env.OPENAI_API_KEY?.trim().replace(/^["']|["']$/g, '');

let anthropicClient: Anthropic | null = null;
if (anthropicKey) {
  try {
    anthropicClient = new Anthropic({ apiKey: anthropicKey });
    logger.info('Anthropic Claude AI initialized.');
  } catch (e) {
    logger.warn('Failed to initialize Anthropic client.');
  }
}

export type AIAction = 'polish' | 'spellcheck' | 'summarize' | 'translate' | 'audit_all';

interface ProcessRequest {
  text: string;
  action: AIAction;
  targetLang?: 'ar' | 'en';
  context?: string;
}

export async function processTextWithAI({
  text,
  action,
  targetLang = 'ar',
  context = ''
}: ProcessRequest): Promise<{ result: string; mode: 'llm' | 'fallback' }> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { result: '', mode: 'fallback' };
  }

  // 1. Try LLM Providers (Claude -> Gemini -> Groq -> OpenAI)
  try {
    const llmResult = await callAvailableLLM(trimmed, action, targetLang, context);
    if (llmResult) {
      return { result: llmResult, mode: 'llm' };
    }
  } catch (err: any) {
    logger.warn({ err: err?.message }, 'External LLM call failed or unavailable. Using smart academic engine.');
  }

  // 2. Intelligent Built-in Academic Linguistic Engine & Translation API
  const result = await executeBuiltInEngine(trimmed, action, targetLang);
  return { result, mode: 'fallback' };
}

/**
 * Calls available LLMs if keys are present
 */
async function callAvailableLLM(
  text: string,
  action: AIAction,
  targetLang: 'ar' | 'en',
  context: string
): Promise<string | null> {
  const systemPrompt = `أنت مهندس ومستشار أكاديمي خبير في توثيق ومراجعة تقارير التدريب التعاوني الميداني لطلاب الجامعات والكليات التقنية.
قواعد لغوية وفنية حاسمة يجب الالتزام بها دون استثناء:
1. ممنوع منعاً باتاً استخدام العبارات الإنشائية المستهلكة أو المبتذلة أو مقدمات الذكاء الاصطناعي النمطية (مثل: "مما لا شك فيه"، "في إطار السعي الدؤوب"، "انطلاقاً من حرصنا"، "بأبهى حلة"، "يسرني ويشرفني"، "يشكل جسراً حيوياً").
2. استخدم لغة هندسية وتقنية رصينة ومباشرة تعتمد على الأفعال الإجرائية الملموسة (تهيئة، فحص، تكوين، اختبار، تحليل، توثيق، استكشاف الأعطال وإصلاحها).
3. حافظ على المصطلحات التقنية العالمية الشائعة بالإنجليزية بين قوسين (مثل Active Directory, Docker, VLAN, Firewall, Switch, Patch Panel) بدقة دون تعريب ركيك.
4. اذكر الحقائق والخطوات التنفيذية والنتائج بأسلوب علمي موضوعي بعيد تماماً عن التضخيم أو الحشو البلاغي.
5. أعد فقط النص المعالج المطلوب دون أي تحيات أو اعتذارات أو تعليقات خارجية.`;

  let userPrompt = '';
  switch (action) {
    case 'polish':
      userPrompt = `أعد صياغة وتدقيق النص التالي بأسلوب مهني وهندسي رفيع يناسب تقرير تدريب تعاوني جامعي رسمي، مع التخلص التام من أي حشو أو ركاكة، والتركيز على الخطوات الإجرائية والأدوات المستخدمة والنتائج المتحققة. أعد النص المصاغ فقط:\n\n${text}`;
      break;
    case 'spellcheck':
      userPrompt = `صحّح كافة الأخطاء الإملائية والنحوية وعلامات الترقيم والهمزات وضبط المصطلحات الفنية في النص التالي بدقة لغوية فائقة. أعد النص المصحح فقط:\n\n${text}`;
      break;
    case 'summarize':
      userPrompt = `لخّص النص التالي في نقاط فنية مركزة وموجزة (Executive Summary) تبرز الأنشطة الميدانية والمهام التقنية المنفذة بوضوح. أعد الملخص فقط:\n\n${text}`;
      break;
    case 'translate':
      if (targetLang === 'en') {
        userPrompt = `Translate the following Arabic field training record into precise, professional, technical academic English suitable for an engineering co-op report. Preserve technical acronyms and factual metrics. Output ONLY the translated text:\n\n${text}`;
      } else {
        userPrompt = `ترجم النص التالي إلى لغة عربية فنية وتقنية رصينة ومباشرة تناسب تقريراً هندسياً رسمياً، مع إبقاء المصطلحات التقنية الشائعة بين قوسين. أعد النص المترجم فقط:\n\n${text}`;
      }
      break;
    case 'audit_all':
      userPrompt = `قم بمراجعة وتدقيق شامل للنص التالي (لغوياً، نحوياً، وهندسياً) للتأكد من خلوه من أي ركاكة أو أسلوب آلي نمطي. أعد النص بعد المراجعة فقط:\n\n${text}`;
      break;
  }

  if (context) {
    userPrompt = `[سياق النص: ${context}]\n\n` + userPrompt;
  }

  // A. Anthropic
  if (anthropicClient) {
    try {
      const res = await anthropicClient.messages.create(
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1800,
          temperature: 0.25,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        },
        { timeout: 10000 }
      );
      const block = res.content[0];
      if (block && block.type === 'text') return block.text.trim();
    } catch (e: any) {
      logger.warn({ err: e?.message }, 'Anthropic provider error or timeout');
    }
  }

  // B. Google Gemini
  if (geminiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
            }
          ]
        })
      });
      if (res.ok) {
        const data: any = await res.json();
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) return content.trim();
      }
    } catch (e: any) {
      logger.warn({ err: e?.message }, 'Gemini provider error or timeout');
    }
  }

  // C. Groq
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.25
        })
      });
      if (res.ok) {
        const data: any = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return content.trim();
      }
    } catch (e: any) {
      logger.warn({ err: e?.message }, 'Groq provider error or timeout');
    }
  }

  // D. OpenAI
  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.25
        })
      });
      if (res.ok) {
        const data: any = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return content.trim();
      }
    } catch (e: any) {
      logger.warn({ err: e?.message }, 'OpenAI provider error or timeout');
    }
  }

  return null;
}

/**
 * Built-in zero-dependency translation & academic language engine
 */
async function executeBuiltInEngine(text: string, action: AIAction, targetLang: 'ar' | 'en'): Promise<string> {
  // Translation: Use zero-config high-accuracy web translation endpoint
  if (action === 'translate') {
    const translated = await translateWithWebAPI(text, targetLang);
    if (translated) return translated;
  }

  if (action === 'spellcheck') {
    return applyArabicSpellCorrections(text);
  }

  if (action === 'polish') {
    return polishArabicText(text);
  }

  if (action === 'summarize') {
    return summarizeText(text);
  }

  if (action === 'audit_all') {
    return polishArabicText(applyArabicSpellCorrections(text));
  }

  return text;
}

/**
 * Free instant translation API with multi-chunk support and MyMemory fallback
 */
async function translateWithWebAPI(text: string, targetLang: 'ar' | 'en'): Promise<string | null> {
  const clean = text.trim();
  if (!clean) return '';

  // If text is short, translate directly
  if (clean.length <= 400) {
    const single = await fetchSingleChunkTranslation(clean, targetLang);
    if (single) return single;
  }

  // Split into paragraphs for long texts
  const paragraphs = clean.split(/\n\s*\n/);
  const translatedParagraphs: string[] = [];

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) {
      translatedParagraphs.push('');
      continue;
    }

    if (trimmedPara.length <= 400) {
      const trans = await fetchSingleChunkTranslation(trimmedPara, targetLang);
      translatedParagraphs.push(trans || trimmedPara);
    } else {
      // Split by sentences if a single paragraph is very long
      const sentences = trimmedPara.match(/[^.!?،؟\n]+[.!?،؟\n]*/g) || [trimmedPara];
      const translatedSentences: string[] = [];
      for (const sent of sentences) {
        const s = sent.trim();
        if (!s) continue;
        const trans = await fetchSingleChunkTranslation(s, targetLang);
        translatedSentences.push(trans || s);
      }
      translatedParagraphs.push(translatedSentences.join(' '));
    }
  }

  const result = translatedParagraphs.join('\n\n').trim();
  return result || null;
}

/**
 * Tries Google GTX first, then MyMemory Translate API
 */
async function fetchSingleChunkTranslation(chunk: string, targetLang: 'ar' | 'en'): Promise<string | null> {
  if (!chunk.trim()) return '';

  // 1. Google GTX
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(chunk)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data: any = await res.json();
      if (Array.isArray(data?.[0])) {
        const fullTranslation = data[0]
          .map((c: any) => (Array.isArray(c) && c[0] ? c[0] : ''))
          .join('')
          .trim();
        if (fullTranslation) return fullTranslation;
      }
    }
  } catch {
    // Continue to fallback
  }

  // 2. MyMemory Translate API
  try {
    const langpair = targetLang === 'en' ? 'ar|en' : 'en|ar';
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${langpair}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data: any = await res.json();
      const translated = data?.responseData?.translatedText?.trim();
      if (translated && !translated.startsWith('MYMEMORY WARNING')) {
        return translated;
      }
    }
  } catch {
    // Continue
  }

  return null;
}

/**
 * Academic elevation for Arabic report logs and sections
 */
function polishArabicText(input: string): string {
  let s = applyArabicSpellCorrections(input);

  // Common phrases elevation
  const phraseReplacements: Array<[RegExp, string]> = [
    // Casual work phrases
    [/اليوم قمت بالعمل على/gu, 'إنجاز وتنفيذ المهام التشغيلية الخاصة بـ'],
    [/اليوم قمت بـ/gu, 'تم تنفيذ وإنجاز'],
    [/قمت بالعمل على/gu, 'تنفيذ المهام التقنية المتعلقة بـ'],
    [/قمت بعمل/gu, 'تنفيذ وإنجاز'],
    [/سويت/gu, 'تم إنجاز'],
    [/عملت على/gu, 'تنفيذ ومتابعة'],
    [/اشتغلت على/gu, 'مباشرة وإدارة أعمال'],
    [/حضرت اجتماع/gu, 'المشاركة الفعالة في جلسة العمل والتنسيق الفني'],
    [/رحت اجتماع/gu, 'حضور الاجتماع التنسيقي'],
    [/فهمت/gu, 'استيعاب وتطبيق المعارف الخاصة بـ'],
    [/تعلمت كيف/gu, 'اكتساب المهارة العملية في'],
    [/تعلمت/gu, 'اكتساب وتطبيق المهارات المتخصصة في'],
    [/صلحت المشكلة/gu, 'استكشاف الخلل التقني وتحليله ومعالجته بنجاح'],
    [/صلحت/gu, 'معالجة وتصحيح'],
    [/حليت المشكلة/gu, 'تشخيص الخلل الفني وتطبيق الحل الهندسي الملائم'],
    [/شفت/gu, 'متابعة ورصد العمليات التشغيلية'],
    [/راقبت/gu, 'رصد وتحليل مؤشرات الأداء'],
    [/جربت/gu, 'إجراء الاختبارات والتحقق العملي من كفاءة التشغيل'],
    [/بشكل كويس|بشكل ممتاز/gu, 'وفق أعلى المعايير المهنية المعتمدة'],
    [/كلمت المشرف/gu, 'التنسيق والمراجعة المباشرة مع المشرف الميداني'],
    [/تأكدت من/gu, 'التحقق البرمجي والتشغيلي من سلامة']
  ];

  for (const [re, rep] of phraseReplacements) {
    s = s.replace(re, rep);
  }

  // If text is very concise (e.g., "شبكة" or "العمل على الشبكة"), expand with academic context
  if (s.trim().split(/\s+/).length <= 4 && /شبك|برمج|سيرفر|نظام|أمن/gu.test(s)) {
    if (/شبك/gu.test(s) && !/إعداد|تهيئة|فحص/gu.test(s)) {
      s = `${s}، والتحقق من كفاءة الربط واستقرار حركة البيانات وفق المعايير الفنية.`;
    }
  }

  return s;
}

/**
 * Executive Academic Summarizer
 */
function summarizeText(text: string): string {
  const sentences = text
    .split(/(?<=[.!?؟\n])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (sentences.length === 1) {
    const s = sentences[0];
    const cleaned = s
      .replace(/^(اليوم|في هذا اليوم|خلال اليوم)\s*/gu, '')
      .replace(/^(قمت بالعمل على|قمت بعمل|قمت بـ|عملت على|اشتغلت على|سويت)\s*/gu, '');
    return `موجز الإنجاز: إتمام وإنجاز أعمال ${cleaned} والتحقق من كفاءة الأداء الفني والتشغيلي.`;
  }

  // Select key informative sentences
  const keySentences = sentences.filter(s =>
    /\d+|تنفيذ|تطوير|إنجاز|شبكة|نظام|تحليل|مشروع|اجتماع|تدريب|حل|إعداد|اختبار/gu.test(s)
  );

  const selected = keySentences.length > 0 ? keySentences.slice(0, 3) : sentences.slice(0, 2);
  return `موجز الإنجاز:\n• ` + selected.join('\n• ');
}

/**
 * Orthographic & Spelling rules (Hamzat, Ta' Marbuta, punctuation)
 */
function applyArabicSpellCorrections(input: string): string {
  let s = input;

  const rules: Array<[RegExp, string]> = [
    // Punctuation spacing
    [/\s+([،,؛;:!?.؟])/g, '$1'],
    [/([،,؛;:!?.؟])(?=[^\s\d])/gu, '$1 '],

    // Common spelling errors in formal Arabic
    [/\bانشاءالله\b/gu, 'إن شاء الله'],
    [/(?<![\u0600-\u06FF])ايظا(?![\u0600-\u06FF])/gu, 'أيضاً'],
    [/(?<![\u0600-\u06FF])هاذا(?![\u0600-\u06FF])/gu, 'هذا'],
    [/(?<![\u0600-\u06FF])هاذه(?![\u0600-\u06FF])/gu, 'هذه'],
    [/(?<![\u0600-\u06FF])هاؤلاء(?![\u0600-\u06FF])/gu, 'هؤلاء'],
    [/(?<![\u0600-\u06FF])لاكن(?![\u0600-\u06FF])/gu, 'لكن'],
    [/(?<![\u0600-\u06FF])ذالك(?![\u0600-\u06FF])/gu, 'ذلك'],
    [/(?<![\u0600-\u06FF])اللذي(?![\u0600-\u06FF])/gu, 'الذي'],
    [/(?<![\u0600-\u06FF])اللتي(?![\u0600-\u06FF])/gu, 'التي'],
    [/(?<![\u0600-\u06FF])اللذين(?![\u0600-\u06FF])/gu, 'الذين'],
    [/(?<![\u0600-\u06FF])مسؤل(?![\u0600-\u06FF])/gu, 'مسؤول'],
    [/(?<![\u0600-\u06FF])شؤن(?![\u0600-\u06FF])/gu, 'شؤون'],
    [/(?<![\u0600-\u06FF])رئيسيئ(?![\u0600-\u06FF])/gu, 'رئيسي'],

    // Common Hamzat
    [/(?<![\u0600-\u06FF])اعداد(?![\u0600-\u06FF])/gu, 'إعداد'],
    [/(?<![\u0600-\u06FF])انجاز(?![\u0600-\u06FF])/gu, 'إنجاز'],
    [/(?<![\u0600-\u06FF])ادارة(?![\u0600-\u06FF])/gu, 'إدارة'],
    [/(?<![\u0600-\u06FF])اشراف(?![\u0600-\u06FF])/gu, 'إشراف'],
    [/(?<![\u0600-\u06FF])ارسال(?![\u0600-\u06FF])/gu, 'إرسال'],
    [/(?<![\u0600-\u06FF])اتمام(?![\u0600-\u06FF])/gu, 'إتمام'],
    [/(?<![\u0600-\u06FF])امكانية(?![\u0600-\u06FF])/gu, 'إمكانية']
  ];

  for (const [regex, replacement] of rules) {
    s = s.replace(regex, replacement);
  }

  return s;
}
