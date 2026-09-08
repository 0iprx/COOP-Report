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

  if (clean.length <= 400) {
    const single = await fetchSingleChunkTranslation(clean, targetLang);
    if (single) return single;
  }

  const paragraphs = clean.split(/\n\s*\n/);
  const translatedParagraphs: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) continue;
    const trans = await fetchSingleChunkTranslation(para, targetLang);
    translatedParagraphs.push(trans || para);
  }

  return translatedParagraphs.length > 0 ? translatedParagraphs.join('\n\n') : null;
}

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
  } catch {}

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
  } catch {}

  return null;
}

/**
 * Advanced Multi-Stage Academic Engineering Transformer for Arabic Field Logs
 * Upgrades raw student diaries into publication-grade institutional engineering reports.
 */
function polishArabicText(input: string): string {
  if (!input || !input.trim()) return '';

  let s = applyArabicSpellCorrections(input);

  // 1. Structural cleanup: Remove raw dashes/separators
  s = s.replace(/^[ \t]*[-_=]{3,}[ \t]*$/gm, '\n');

  // 2. Fix inverted RTL bullet points (e.g., "ONT *", "UTP *", "OLT *")
  s = s.replace(/([A-Za-z0-9\u0600-\u06FF\s]+)\s*\*\s*$/gm, '• $1');
  s = s.replace(/^\s*[\*\-]\s+/gm, '• ');

  // 3. Technical Acronyms & Terminology Dictionary with official Arabic expansions
  const techMap: Array<[RegExp, string]> = [
    [/(?<![\u0600-\u06FF])FTTH(?![\u0600-\u06FF])/gi, 'شبكات الألياف الضوئية للمنازل (FTTH)'],
    [/(?<![\u0600-\u06FF])ONT(?![\u0600-\u06FF])/gi, 'أجهزة الطرفيات الضوئية للمشتركين (ONT)'],
    [/(?<![\u0600-\u06FF])OLT(?![\u0600-\u06FF])/gi, 'مقاسم النفاذ الضوئي الرئيسية (OLT)'],
    [/(?<![\u0600-\u06FF])ODN(?![\u0600-\u06FF])/gi, 'شبكة التوزيع الضوئي (ODN)'],
    [/(?<![\u0600-\u06FF])ODB(?![\u0600-\u06FF])/gi, 'صناديق التوزيع الضوئي الفرعية (ODB)'],
    [/(?<![\u0600-\u06FF])UTP(?![\u0600-\u06FF])/gi, 'كوابل الشبكة النحاسية المزدوجة (UTP)'],
    [/(?<![\u0600-\u06FF])Trouble Ticket(s)?(?![\u0600-\u06FF])/gi, 'تذاكر الصيانة وبلاغات الأعطال الفنية (Trouble Tickets)'],
    [/(?<![\u0600-\u06FF])High Temp(?![\u0600-\u06FF])/gi, 'إنذارات ارتفاع درجات الحرارة (High Temperature)'],
    [/(?<![\u0600-\u06FF])Alarms(?![\u0600-\u06FF])/gi, 'إنذارات ومؤشرات الشبكة (Network Alarms)'],
    [/(?<![\u0600-\u06FF])Access Team(?![\u0600-\u06FF])/gi, 'فريق شبكات النفاذ (Access Team)'],
    [/(?<![\u0600-\u06FF])team access(?![\u0600-\u06FF])/gi, 'فريق شبكات النفاذ (Access Team)'],
    [/(?<![\u0600-\u06FF])AAA(?![\u0600-\u06FF])/gi, 'منظومة التوثيق والتحكم بالنفاذ (AAA)'],
    [/(?<![\u0600-\u06FF])Authentication(?![\u0600-\u06FF])/gi, 'المصادقة والتوثيق الأمني (Authentication)'],
    [/(?<![\u0600-\u06FF])Configurations?(?![\u0600-\u06FF])/gi, 'الإعدادات وضبط التكوين (Configurations)'],
    [/(?<![\u0600-\u06FF])Patching(?![\u0600-\u06FF])/gi, 'الربط التبادلي وتثبيت التحديثات (Patching)'],
    [/(?<![\u0600-\u06FF])Red Team(?![\u0600-\u06FF])/gi, 'فريق الهجوم السيبراني والاختراق الأخلاقي (Red Team)'],
    [/(?<![\u0600-\u06FF])Blue Team(?![\u0600-\u06FF])/gi, 'فريق الدفاع السيبراني والاستجابة للتهديدات (Blue Team)'],
    [/(?<![\u0600-\u06FF])Cyber Security(?![\u0600-\u06FF])/gi, 'الأمن السيبراني (Cyber Security)'],
    [/(?<![\u0600-\u06FF])5G(?![\u0600-\u06FF])/gi, 'شبكات الجيل الخامس (5G)']
  ];

  for (const [re, rep] of techMap) {
    // Only replace if the expansion isn't already there
    if (!s.includes(rep)) {
      s = s.replace(re, rep);
    }
  }

  // 4. Transform informal diary phrases into formal institutional engineering actions
  const engineeringTransitions: Array<[RegExp, string]> = [
    [/(?<![\u0600-\u06FF])بدأت فترة التدريب في الساعة ([\d:]+)\s*(صباحاً|مساءً)?\s*بالتعرف على المهندس ([^\n،.]+)/gu, 'مباشرة المهام الميدانية في تمام الساعة $1 $2 برفقة المهندس $3، والبدء في تنفيذ الأنشطة التالية:'],
    [/(?<![\u0600-\u06FF])بدأت فترة التدريب بالتعرف على(?![\u0600-\u06FF])/gu, 'انطلاق الأعمال التشغيلية الميدانية والبدء في تنفيذ'],
    [/(?<![\u0600-\u06FF])تم خلال الفترة التعرف على(?![\u0600-\u06FF])/gu, 'دراسة وتحليل'],
    [/(?<![\u0600-\u06FF])تم الانتقال إلى ([^\n،.]+)\s*مع المهندس ([^\n،.]+)/gu, 'الانضمام الميداني إلى $1 تحت إشراف المهندس $2 لمباشرة الأعمال الفنية'],
    [/(?<![\u0600-\u06FF])تم أيضاً توضيح موقع ([^\n،.]+)\s*ودوره/gu, 'فحص وتحليل منظومة $1 وبيان دورها التشغيلي'],
    [/(?<![\u0600-\u06FF])تم التعرف على ارتباطه بعملية(?![\u0600-\u06FF])/gu, 'التحقق من التكامل الفني مع إجراءات'],
    [/(?<![\u0600-\u06FF])التعرف بشكل أكبر على(?![\u0600-\u06FF])/gu, 'المشاركة العملية والميدانية في أعمال'],
    [/(?<![\u0600-\u06FF])تم التعامل مع إحدى التذاكر(?![\u0600-\u06FF])/gu, 'معالجة وتصنيف بلاغات الأعطال الفنية وتطبيق إجراءات الحل'],
    [/(?<![\u0600-\u06FF])تم التعرف على بعض الأدوات والمكونات المستخدمة في ([^\n،.]+)\s*ومن أمثلتها:?/gu, 'المعاينة والتحقق العملي من المكونات والأدوات المستخدمة في $1، والتي شملت:'],
    [/(?<![\u0600-\u06FF])اليوم قمت بالعمل على(?![\u0600-\u06FF])/gu, 'إنجاز وتنفيذ المهام التشغيلية لـ'],
    [/(?<![\u0600-\u06FF])اليوم قمت بـ(?![\u0600-\u06FF])/gu, 'تنفيذ وإنجاز'],
    [/(?<![\u0600-\u06FF])قمت بالعمل على(?![\u0600-\u06FF])/gu, 'تنفيذ المهام التقنية لـ'],
    [/(?<![\u0600-\u06FF])قمت بعمل(?![\u0600-\u06FF])/gu, 'تنفيذ وتطبيق'],
    [/(?<![\u0600-\u06FF])سويت(?![\u0600-\u06FF])/gu, 'تم تنفيذ وتكوين'],
    [/(?<![\u0600-\u06FF])سوينا(?![\u0600-\u06FF])/gu, 'تم تنفيذ وإنجاز'],
    [/(?<![\u0600-\u06FF])عملت على(?![\u0600-\u06FF])/gu, 'مباشرة ومتابعة'],
    [/(?<![\u0600-\u06FF])اشتغلت على(?![\u0600-\u06FF])/gu, 'إدارة وتنفيذ مهام'],
    [/(?<![\u0600-\u06FF])حضرت اجتماع(?![\u0600-\u06FF])/gu, 'المشاركة الفعالة في جلسة التنسيق والعمل الفني'],
    [/(?<![\u0600-\u06FF])فهمت(?![\u0600-\u06FF])/gu, 'استيعاب وتطبيق المعايير الخاصة بـ'],
    [/(?<![\u0600-\u06FF])تعلمت كيف(?![\u0600-\u06FF])/gu, 'اكتساب المهارة الإجرائية في'],
    [/(?<![\u0600-\u06FF])صلحت المشكلة(?![\u0600-\u06FF])/gu, 'استكشاف الخلل الفني وتشخيصه ومعالجته بنجاح'],
    [/(?<![\u0600-\u06FF])حليت المشكلة(?![\u0600-\u06FF])/gu, 'تطبيق الحل الهندسي الملائم واستعادة الخدمة'],
    [/(?<![\u0600-\u06FF])شفت(?![\u0600-\u06FF])/gu, 'معاينة وفحص'],
    [/(?<![\u0600-\u06FF])شيكت على(?![\u0600-\u06FF])/gu, 'التدقيق والتحقق من كفاءة'],
    [/(?<![\u0600-\u06FF])راقبت(?![\u0600-\u06FF])/gu, 'رصد وتحليل مؤشرات الأداء الخاصة بـ'],
    [/(?<![\u0600-\u06FF])جربت(?![\u0600-\u06FF])/gu, 'إجراء الاختبارات والتحقق التشغيلي من']
  ];

  for (const [re, rep] of engineeringTransitions) {
    s = s.replace(re, rep);
  }

  // 5. Structure into elegant procedural sections
  const lines = s.split('\n').map(l => l.trim()).filter(Boolean);
  const formattedSections: string[] = [];
  let inBulletList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is a bullet item
    if (line.startsWith('•') || line.startsWith('-')) {
      const cleanBullet = line.replace(/^[•\-]\s*/, '').trim();
      formattedSections.push(`• ${cleanBullet}`);
      inBulletList = true;
      continue;
    }

    // Check if line is a subsection header (e.g., "بعد الساعة 02:00 ظهراً : قسم ...")
    if (/^(في تمام الساعة|بعد الساعة|الساعة|قسم|فريق|مرحلة|محور|منظومة)\s*[\d:]*.*:?$/i.test(line) && line.length < 80) {
      if (inBulletList) {
        formattedSections.push('');
        inBulletList = false;
      }
      const title = line.replace(/:$/, '').trim();
      formattedSections.push(`\n**${title}:**`);
      continue;
    }

    // Normal narrative line
    if (inBulletList) {
      formattedSections.push('');
      inBulletList = false;
    }

    formattedSections.push(line);
  }

  let result = formattedSections.join('\n').replace(/\n{3,}/g, '\n\n').trim();

  // Ensure trailing punctuation
  if (result && !/[.!?؟•]$/.test(result)) {
    result += '.';
  }

  return result;
}

/**
 * Intelligent Academic Executive Summarizer
 * Extracts operational scope, key milestones, and tools without repetitive clichés.
 */
function summarizeText(text: string): string {
  if (!text || !text.trim()) return '';

  const clean = text.replace(/^[ \t]*[-_=]{3,}[ \t]*$/gm, '').trim();

  // 1. Extract technical domains
  const domains: string[] = [];
  if (/FTTH|ألياف|fiber|ONT|OLT|ODN|ODB/i.test(clean)) domains.push('شبكات الألياف الضوئية (FTTH)');
  if (/Access|نفاذ|VLAN|سويتش|switch|راوتر|router/i.test(clean)) domains.push('هندسة شبكات النفاذ (Access Networks)');
  if (/Alarm|إنذار|حرارة|رطوبة|تذكرة|Trouble|SLA/i.test(clean)) domains.push('إدارة إنذارات الشبكة وبلاغات الأعطال');
  if (/AAA|Authentication|توثيق|مشترك|رسوم/i.test(clean)) domains.push('خوادم التوثيق وإدارة المشتركين (AAA)');
  if (/5G|جيل خامس|لاسلكي|تغطية/i.test(clean)) domains.push('شبكات الجيل الخامس (5G)');
  if (/أمن|security|Red Team|Blue Team|ثغر|firewall/i.test(clean)) domains.push('الأمن السيبراني وتقييم المخاطر');
  if (/سيرفر|خادم|لينكس|linux|windows|vmware|docker/i.test(clean)) domains.push('إدارة البنية التحتية والأنظمة');

  // 2. Extract actionable engineering procedures
  const procedures: string[] = [];
  if (/Alarms?|إنذار|حرارة|رطوبة/i.test(clean)) {
    procedures.push('رصد مؤشرات الإنذارات الحرارية والبيئية وتطبيق معايير تصعيد تذاكر الصيانة (Trouble Tickets)');
  }
  if (/Access|صلاحيات|أبواب/i.test(clean)) {
    procedures.push('متابعة إجراءات التصريح والدخول للمواقع الفنية والتحقق من الجاهزية التشغيلية');
  }
  if (/FTTH|ONT|OLT|ODN/i.test(clean)) {
    procedures.push('المعاينة الميدانية لمكونات التراسل الضوئي (ONT, OLT, ODN) وتمديدات كوابل الألياف');
  }
  if (/AAA|Authentication|خدمة/i.test(clean)) {
    procedures.push('تدقيق ارتباط خوادم AAA بعمليات مصادقة المستخدمين ومطابقة صلاحيات الخدمة');
  }
  if (/5G|Configurations|Patching/i.test(clean)) {
    procedures.push('فحص أوضاع تغطية 5G وإجراء ضبط التكوينات وأعمال الربط التبادلي (Patching)');
  }
  if (/Red Team|Blue Team/i.test(clean)) {
    procedures.push('التعرف على المفاهيم الأساسية لفرق الدفاع والهجوم السيبراني وتأمين الأنظمة');
  }

  // 3. Extract tool acronyms
  const tools: string[] = [];
  const matches = clean.match(/\b(ONT|OLT|ODN|ODB|UTP|AAA|FTTH|5G|SLA|VLAN|Trouble Ticket)\b/gi) || [];
  const uniqueTools = Array.from(new Set(matches.map(m => m.toUpperCase())));

  // Build authentic multi-dimensional summary
  const summaryLines: string[] = ['موجز النشاط والإنجاز الميداني:'];

  if (domains.length > 0) {
    summaryLines.push(`• النطاق التشغيلي: ${domains.slice(0, 3).join('، ')}.`);
  }

  if (procedures.length > 0) {
    summaryLines.push(`• أبرز المهام المنفذة:\n  - ${procedures.join('\n  - ')}.`);
  } else {
    // Fallback if no specific pattern matched: pick first 2 meaningful sentences
    const sentences = clean.split(/[.\n]/).map(s => s.trim()).filter(s => s.length > 20);
    if (sentences.length > 0) {
      summaryLines.push(`• المهام المنفذة: ${sentences.slice(0, 2).join('، ')}.`);
    }
  }

  if (uniqueTools.length > 0) {
    summaryLines.push(`• التقنيات والأدوات الموظفة: ${uniqueTools.join(', ')}.`);
  }

  return summaryLines.join('\n');
}

/**
 * Comprehensive Orthographic & Spelling rules (Hamzat, Ta' Marbuta, Tanween, Grammatical Rules)
 */
function applyArabicSpellCorrections(input: string): string {
  let s = input;

  const rules: Array<[RegExp, string]> = [
    // Punctuation spacing
    [/\s+([،,؛;:!?.؟])/g, '$1'],
    [/([،,؛;:!?.؟])(?=[^\s\d])/gu, '$1 '],

    // Common spelling errors in formal Arabic
    [/(?<![\u0600-\u06FF])انشاءالله(?![\u0600-\u06FF])/gu, 'إن شاء الله'],
    [/(?<![\u0600-\u06FF])ان شاء الله(?![\u0600-\u06FF])/gu, 'إن شاء الله'],
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
    [/(?<![\u0600-\u06FF])فنيئ(?![\u0600-\u06FF])/gu, 'فني'],
    [/(?<![\u0600-\u06FF])تائكيد(?![\u0600-\u06FF])/gu, 'تأكيد'],
    [/(?<![\u0600-\u06FF])تائهيل(?![\u0600-\u06FF])/gu, 'تأهيل'],

    // Essential Hamzat al-Qat' (إ words)
    [/(?<![\u0600-\u06FF])اعداد(?![\u0600-\u06FF])/gu, 'إعداد'],
    [/(?<![\u0600-\u06FF])اعدادات(?![\u0600-\u06FF])/gu, 'إعدادات'],
    [/(?<![\u0600-\u06FF])انجاز(?![\u0600-\u06FF])/gu, 'إنجاز'],
    [/(?<![\u0600-\u06FF])انجازات(?![\u0600-\u06FF])/gu, 'إنجازات'],
    [/(?<![\u0600-\u06FF])ادارة(?![\u0600-\u06FF])/gu, 'إدارة'],
    [/(?<![\u0600-\u06FF])اداري(?![\u0600-\u06FF])/gu, 'إداري'],
    [/(?<![\u0600-\u06FF])اشراف(?![\u0600-\u06FF])/gu, 'إشراف'],
    [/(?<![\u0600-\u06FF])ارسال(?![\u0600-\u06FF])/gu, 'إرسال'],
    [/(?<![\u0600-\u06FF])اتمام(?![\u0600-\u06FF])/gu, 'إتمام'],
    [/(?<![\u0600-\u06FF])امكانية(?![\u0600-\u06FF])/gu, 'إمكانية'],
    [/(?<![\u0600-\u06FF])انشاء(?![\u0600-\u06FF])/gu, 'إنشاء'],
    [/(?<![\u0600-\u06FF])انهاء(?![\u0600-\u06FF])/gu, 'إنهاء'],
    [/(?<![\u0600-\u06FF])الغاء(?![\u0600-\u06FF])/gu, 'إلغاء'],
    [/(?<![\u0600-\u06FF])اجراء(?![\u0600-\u06FF])/gu, 'إجراء'],
    [/(?<![\u0600-\u06FF])اجراءات(?![\u0600-\u06FF])/gu, 'إجراءات'],
    [/(?<![\u0600-\u06FF])ادخال(?![\u0600-\u06FF])/gu, 'إدخال'],
    [/(?<![\u0600-\u06FF])اخراج(?![\u0600-\u06FF])/gu, 'إخراج'],
    [/(?<![\u0600-\u06FF])اصلاح(?![\u0600-\u06FF])/gu, 'إصلاح'],
    [/(?<![\u0600-\u06FF])اسناد(?![\u0600-\u06FF])/gu, 'إسناد'],
    [/(?<![\u0600-\u06FF])اضافي(?![\u0600-\u06FF])/gu, 'إضافي'],
    [/(?<![\u0600-\u06FF])اضافية(?![\u0600-\u06FF])/gu, 'إضافية'],
    [/(?<![\u0600-\u06FF])الكتروني(?![\u0600-\u06FF])/gu, 'إلكتروني'],
    [/(?<![\u0600-\u06FF])الكترونية(?![\u0600-\u06FF])/gu, 'إلكترونية'],
    [/(?<![\u0600-\u06FF])ارشادات(?![\u0600-\u06FF])/gu, 'إرشادات'],
    [/(?<![\u0600-\u06FF])ارشادي(?![\u0600-\u06FF])/gu, 'إرشادي'],
    [/(?<![\u0600-\u06FF])اشعار(?![\u0600-\u06FF])/gu, 'إشعار'],
    [/(?<![\u0600-\u06FF])اشعارات(?![\u0600-\u06FF])/gu, 'إشعارات'],

    // Essential Hamzat al-Wasl corrections (words mistakenly written with إ)
    [/(?<![\u0600-\u06FF])إجتماع(?![\u0600-\u06FF])/gu, 'اجتماع'],
    [/(?<![\u0600-\u06FF])إجتماعات(?![\u0600-\u06FF])/gu, 'اجتماعات'],
    [/(?<![\u0600-\u06FF])إستكشاف(?![\u0600-\u06FF])/gu, 'استكشاف'],
    [/(?<![\u0600-\u06FF])إختبار(?![\u0600-\u06FF])/gu, 'اختبار'],
    [/(?<![\u0600-\u06FF])إختبارات(?![\u0600-\u06FF])/gu, 'اختبارات'],
    [/(?<![\u0600-\u06FF])إستخدام(?![\u0600-\u06FF])/gu, 'استخدام'],
    [/(?<![\u0600-\u06FF])إسترجاع(?![\u0600-\u06FF])/gu, 'استرجاع'],
    [/(?<![\u0600-\u06FF])إتصال(?![\u0600-\u06FF])/gu, 'اتصال'],
    [/(?<![\u0600-\u06FF])إعتماد(?![\u0600-\u06FF])/gu, 'اعتماد'],
    [/(?<![\u0600-\u06FF])إستيعاب(?![\u0600-\u06FF])/gu, 'استيعاب'],
    [/(?<![\u0600-\u06FF])إستقرار(?![\u0600-\u06FF])/gu, 'استقرار'],
    [/(?<![\u0600-\u06FF])إستجابة(?![\u0600-\u06FF])/gu, 'استجابة'],

    // Tanween al-Fath corrections
    [/(?<![\u0600-\u06FF])ايضا(?![\u0600-\u06FF])/gu, 'أيضاً'],
    [/(?<![\u0600-\u06FF])فورا(?![\u0600-\u06FF])/gu, 'فوراً'],
    [/(?<![\u0600-\u06FF])تلقائيا(?![\u0600-\u06FF])/gu, 'تلقائياً'],
    [/(?<![\u0600-\u06FF])دوريا(?![\u0600-\u06FF])/gu, 'دورياً'],
    [/(?<![\u0600-\u06FF])نهائيا(?![\u0600-\u06FF])/gu, 'نهائياً'],
    [/(?<![\u0600-\u06FF])جزئيا(?![\u0600-\u06FF])/gu, 'جزئياً'],
    [/(?<![\u0600-\u06FF])كليا(?![\u0600-\u06FF])/gu, 'كلياً'],
    [/(?<![\u0600-\u06FF])رسميا(?![\u0600-\u06FF])/gu, 'رسمياً'],
    [/(?<![\u0600-\u06FF])عمليا(?![\u0600-\u06FF])/gu, 'عملياً'],
    [/(?<![\u0600-\u06FF])فعليا(?![\u0600-\u06FF])/gu, 'فعلياً'],
    [/(?<![\u0600-\u06FF])يوميا(?![\u0600-\u06FF])/gu, 'يومياً'],
    [/(?<![\u0600-\u06FF])اسبوعيا(?![\u0600-\u06FF])/gu, 'أسبوعياً'],
    [/(?<![\u0600-\u06FF])أسبوعيا(?![\u0600-\u06FF])/gu, 'أسبوعياً'],
    [/(?<![\u0600-\u06FF])شهريا(?![\u0600-\u06FF])/gu, 'شهرياً'],
    [/(?<![\u0600-\u06FF])سنويا(?![\u0600-\u06FF])/gu, 'سنوياً'],
    [/(?<![\u0600-\u06FF])شكرا(?![\u0600-\u06FF])/gu, 'شكراً'],
    [/(?<![\u0600-\u06FF])جدا(?![\u0600-\u06FF])/gu, 'جداً'],

    // Common Ta' Marbuta vs Ha' mistakes
    [/(?<![\u0600-\u06FF])تقنيه(?![\u0600-\u06FF])/gu, 'تقنية'],
    [/(?<![\u0600-\u06FF])شبكه(?![\u0600-\u06FF])/gu, 'شبكة'],
    [/(?<![\u0600-\u06FF])صيانه(?![\u0600-\u06FF])/gu, 'صيانة'],
    [/(?<![\u0600-\u06FF])برمجه(?![\u0600-\u06FF])/gu, 'برمجة'],
    [/(?<![\u0600-\u06FF])بنيه(?![\u0600-\u06FF])/gu, 'بنية'],
    [/(?<![\u0600-\u06FF])حمايه(?![\u0600-\u06FF])/gu, 'حماية'],
    [/(?<![\u0600-\u06FF])منشأه(?![\u0600-\u06FF])/gu, 'منشأة'],
    [/(?<![\u0600-\u06FF])كفاءه(?![\u0600-\u06FF])/gu, 'كفاءة'],
    [/(?<![\u0600-\u06FF])جلسه(?![\u0600-\u06FF])/gu, 'جلسة'],
    [/(?<![\u0600-\u06FF])كتابه(?![\u0600-\u06FF])/gu, 'كتابة'],
    [/(?<![\u0600-\u06FF])لوحه(?![\u0600-\u06FF])/gu, 'لوحة'],
    [/(?<![\u0600-\u06FF])شاشه(?![\u0600-\u06FF])/gu, 'شاشة'],
    [/(?<![\u0600-\u06FF])قاعده(?![\u0600-\u06FF])/gu, 'قاعدة'],
    [/(?<![\u0600-\u06FF])مهمه(?![\u0600-\u06FF])/gu, 'مهمة'],
    [/(?<![\u0600-\u06FF])اسبوعيه(?![\u0600-\u06FF])/gu, 'أسبوعية'],
    [/(?<![\u0600-\u06FF])أسبوعيه(?![\u0600-\u06FF])/gu, 'أسبوعية'],
    [/(?<![\u0600-\u06FF])يوميه(?![\u0600-\u06FF])/gu, 'يومية'],
    [/(?<![\u0600-\u06FF])نهائيه(?![\u0600-\u06FF])/gu, 'نهائية'],
    [/(?<![\u0600-\u06FF])فتره(?![\u0600-\u06FF])/gu, 'فترة'],
    [/(?<![\u0600-\u06FF])خطه(?![\u0600-\u06FF])/gu, 'خطة'],
    [/(?<![\u0600-\u06FF])دوره(?![\u0600-\u06FF])/gu, 'دورة'],
    [/(?<![\u0600-\u06FF])خبره(?![\u0600-\u06FF])/gu, 'خبرة'],
    [/(?<![\u0600-\u06FF])تجربه(?![\u0600-\u06FF])/gu, 'تجربة'],
    [/(?<![\u0600-\u06FF])طريقه(?![\u0600-\u06FF])/gu, 'طريقة'],
    [/(?<![\u0600-\u06FF])صوره(?![\u0600-\u06FF])/gu, 'صورة'],
    [/(?<![\u0600-\u06FF])بيئه(?![\u0600-\u06FF])/gu, 'بيئة'],
    [/(?<![\u0600-\u06FF])معاينه(?![\u0600-\u06FF])/gu, 'معاينة'],
    [/(?<![\u0600-\u06FF])مشاركه(?![\u0600-\u06FF])/gu, 'مشاركة'],

    // Yaa vs Alif Maqsura (علي and الي removed to protect proper names)
    [/(?<![\u0600-\u06FF])حتي(?![\u0600-\u06FF])/gu, 'حتى'],
    [/(?<![\u0600-\u06FF])مستوي(?![\u0600-\u06FF])/gu, 'مستوى'],
    [/(?<![\u0600-\u06FF])اخري(?![\u0600-\u06FF])/gu, 'أخرى'],
    [/(?<![\u0600-\u06FF])اعلي(?![\u0600-\u06FF])/gu, 'أعلى'],
    [/(?<![\u0600-\u06FF])ادني(?![\u0600-\u06FF])/gu, 'أدنى'],
    [/(?<![\u0600-\u06FF])لدا(?![\u0600-\u06FF])/gu, 'لدى']
  ];

  for (const [regex, replacement] of rules) {
    s = s.replace(regex, replacement);
  }

  return s;
}
