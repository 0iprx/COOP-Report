import { createPortal } from 'react-dom';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Sparkles,
  AlignLeft,
  SpellCheck,
  ListCollapse,
  Languages,
  PenLine,
  MessageSquareText,
  AlertTriangle,
  Check,
  Loader2,
  RotateCcw,
  GitCompare,
  Brain,
  Zap,
  CircleCheck,
  CircleDot
} from 'lucide-react';
import { api } from '../../services/api';

export type AssistantTarget =
  | { type: 'section'; key: 'introText' | 'entityIntroText' | 'skillsText' | 'conclusionText' }
  | { type: 'entry'; id: number; field?: 'description' | 'title' };

type TaskId = 'library_check' | 'academic_rewrite' | 'improve_clarity' | 'fix_grammar' | 'summarize' | 'translate' | 'draft_section' | 'review';

interface Suggestion {
  id: number;
  task: TaskId;
  source: string;
  proposed: string;
  questions: string[];
  changes: string[];
  unsupported?: string[];
  dropped?: string[];
  issues?: { kind: string; message: string; excerpt?: string; autoFixed: boolean }[];
  stats?: { words: number; sentences: number; avgSentenceWords: number; fixesApplied: number };
  changed?: boolean;
  diff: { type: 'same' | 'added' | 'removed'; value: string }[];
  provider: string;
  model: string;
  learnedApplied?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  target: AssistantTarget;
  title: string;
  text: string;
  lang: 'ar' | 'en';
  onApplied: (finalText: string) => void;
  onOpenMemory?: () => void;
}

const TASKS: { id: TaskId; label: string; hint: string; icon: React.ReactNode; sectionOnly?: boolean; needsText?: boolean }[] = [
  { id: 'academic_rewrite', label: 'صياغة أكاديمية', hint: 'أسلوب تقرير رسمي دون إضافة معلومات', icon: <Sparkles className="w-4 h-4" />, needsText: true },
  { id: 'improve_clarity', label: 'تحسين الوضوح', hint: 'ترتيب الجمل وإزالة التكرار', icon: <AlignLeft className="w-4 h-4" />, needsText: true },
  { id: 'fix_grammar', label: 'تدقيق لغوي فقط', hint: 'الإملاء والنحو والترقيم دون تغيير الأسلوب', icon: <SpellCheck className="w-4 h-4" />, needsText: true },
  { id: 'summarize', label: 'إيجاز', hint: 'فقرة واحدة تحفظ أهم ما أُنجز', icon: <ListCollapse className="w-4 h-4" />, needsText: true },
  { id: 'translate', label: 'ترجمة', hint: 'ترجمة أمينة مع حفظ المصطلحات', icon: <Languages className="w-4 h-4" />, needsText: true },
  { id: 'draft_section', label: 'كتابة مسودة من سجلك', hint: 'من إدخالاتك اليومية فقط، مع أسئلة عمّا ينقص', icon: <PenLine className="w-4 h-4" />, sectionOnly: true },
  { id: 'review', label: 'مراجعة وملاحظات', hint: 'تحسين خفيف وملاحظات عمّا ينقص النص', icon: <MessageSquareText className="w-4 h-4" />, needsText: true }
];

export const AssistantPanel: React.FC<Props> = ({ open, onClose, target, title, text, lang, onApplied, onOpenMemory }) => {
  const [phase, setPhase] = useState<'choose' | 'loading' | 'review' | 'saving'>('choose');
  const [task, setTask] = useState<TaskId | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [edited, setEdited] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showDiff, setShowDiff] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  const status = useQuery<{ available: boolean; configured: boolean; providers: { id: string; configured: boolean; ok: boolean | null; reason?: string; model: string | null }[] }>({
    queryKey: ['aiStatus'],
    queryFn: async () => (await api.get('/ai/v2/status')).data,
    enabled: open,
    staleTime: 5 * 60_000
  });

  useEffect(() => {
    if (!open) return;
    setPhase('choose');
    setTask(null);
    setSuggestion(null);
    setEdited('');
    setAnswers({});
    setShowDiff(false);
    setError('');
    const t = setTimeout(() => dialogRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const availableTasks = useMemo(
    () => TASKS.filter((t) => (t.sectionOnly ? target.type === 'section' : true)).map((t) => ({ ...t, disabled: !!t.needsText && !text.trim() })),
    [target.type, text]
  );

  if (!open) return null;

  const run = async (taskId: TaskId, withAnswers = false) => {
    setTask(taskId);
    setPhase('loading');
    setError('');
    try {
      const answerList =
        withAnswers && suggestion
          ? suggestion.questions.map((q, i) => ({ question: q, answer: answers[i] || '' })).filter((a) => a.answer.trim())
          : undefined;
      const res = await api.post('/ai/v2/suggest', {
        task: taskId,
        text,
        lang,
        targetLang: taskId === 'translate' ? (lang === 'ar' ? 'en' : 'ar') : undefined,
        target: target.type === 'section' ? target : { type: 'entry', id: target.id, field: target.field || 'description' },
        answers: answerList
      });
      setSuggestion(res.data);
      setEdited(res.data.proposed);
      setAnswers({});
      setPhase('review');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'تعذر الحصول على اقتراح. حاول مرة أخرى.');
      setPhase(suggestion ? 'review' : 'choose');
    }
  };

  const runCheck = async () => {
    setTask('library_check');
    setPhase('loading');
    setError('');
    try {
      const res = await api.post('/ai/v2/check', {
        text,
        target: target.type === 'section' ? target : { type: 'entry', id: target.id, field: target.field || 'description' }
      });
      setSuggestion(res.data);
      setEdited(res.data.proposed);
      setAnswers({});
      setPhase('review');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'تعذر فحص النص.');
      setPhase('choose');
    }
  };

  const decide = async (decision: 'accepted' | 'rejected') => {
    if (!suggestion) return;
    setPhase('saving');
    setError('');
    try {
      const res = await api.post(`/ai/v2/suggestions/${suggestion.id}/decide`, {
        decision,
        finalText: decision === 'accepted' ? edited : undefined
      });
      if (decision === 'accepted') onApplied(res.data.finalText);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'تعذر حفظ القرار.');
      setPhase('review');
    }
  };

  const unavailable = status.data && !status.data.available;
  const taskLabel = TASKS.find((t) => t.id === task)?.label;

  return createPortal(
    <div className="ai-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className="ai-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-panel-title"
        tabIndex={-1}
        dir="rtl"
      >
        <div className="ai-panel-head">
          <div className="min-w-0">
            <p className="ai-panel-kicker">مساعد الكتابة</p>
            <h2 id="ai-panel-title" className="ai-panel-title">
              {title}
              {taskLabel && phase !== 'choose' ? <span className="ai-panel-task"> · {taskLabel}</span> : null}
            </h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="إغلاق">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="ai-panel-body">
          {status.isLoading && (
            <p className="ai-muted">
              <Loader2 className="w-4 h-4 animate-spin inline-block" aria-hidden="true" /> جارٍ التحقق من خدمة الذكاء الاصطناعي...
            </p>
          )}


          {error && (
            <div className="ai-alert is-error" role="alert">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          )}

          {phase === 'choose' && (
            <>
              <p className="ai-muted">اختر ما تريده. لن يتغيّر نصك إلا بعد أن تراجع الاقتراح وتعتمده.</p>
              <button type="button" className="ai-task is-featured" disabled={!text.trim()} onClick={runCheck}>
                <span className="ai-task-icon" aria-hidden="true">
                  <Zap className="w-5 h-5" />
                </span>
                <span className="min-w-0">
                  <span className="ai-task-label">فحص فوري</span>
                  <span className="ai-task-hint">
                    {text.trim() ? 'الإملاء والترقيم ومصطلحاتك والأسلوب والأقسام الناقصة، في أقل من ثانية' : 'اكتب نصاً أولاً'}
                  </span>
                </span>
              </button>
              {!unavailable && !status.isLoading && (
              <>
              <p className="ai-group-label">إعادة الصياغة بالنموذج</p>
              <div className="ai-task-grid">
                {availableTasks.map((t) => (
                  <button key={t.id} type="button" className="ai-task" disabled={t.disabled || status.isLoading || !!unavailable} onClick={() => run(t.id)}>
                    <span className="ai-task-icon" aria-hidden="true">{t.icon}</span>
                    <span className="min-w-0">
                      <span className="ai-task-label">{t.label}</span>
                      <span className="ai-task-hint">{t.disabled ? 'اكتب نصاً أولاً' : t.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
              </>
              )}
            </>
          )}

          {phase === 'loading' && (
            <div className="ai-loading" role="status">
              <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
              <p>يكتب المساعد اقتراحه ويتحقق من أنه لا يضيف معلومات غير موجودة في نصك...</p>
            </div>
          )}

          {(phase === 'review' || phase === 'saving') && suggestion && (
            <>
              {(suggestion.unsupported?.length ?? 0) > 0 && (
                <div className="ai-alert is-warn" role="alert">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <p>
                    في الاقتراح عناصر لم ترد في نصك: <bdi dir="ltr">{suggestion.unsupported!.join('، ')}</bdi>. احذفها أو تأكد من صحتها قبل الاعتماد.
                  </p>
                </div>
              )}

              {(suggestion.dropped?.length ?? 0) > 0 && (
                <div className="ai-alert is-warn" role="alert">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <p>
                    أسقط الاقتراح معلومات كانت في نصك: <bdi dir="ltr">{suggestion.dropped!.join('، ')}</bdi>. أعدها قبل الاعتماد.
                  </p>
                </div>
              )}

              <div className="ai-field">
                <div className="ai-field-head">
                  <label htmlFor="ai-proposed" className="ai-label">
                    النص المقترح (يمكنك تعديله قبل الاعتماد)
                  </label>
                  {suggestion.source && (
                    <button type="button" className="btn-ghost btn-sm" onClick={() => setShowDiff((v) => !v)} aria-pressed={showDiff}>
                      <GitCompare className="w-4 h-4" aria-hidden="true" />
                      <span>{showDiff ? 'إخفاء الفروقات' : 'مقارنة بالأصل'}</span>
                    </button>
                  )}
                </div>
                {showDiff ? (
                  <div className="ai-diff" dir={lang === 'ar' && suggestion.task !== 'translate' ? 'rtl' : 'auto'}>
                    {suggestion.diff.map((c, i) => (
                      <span key={i} className={c.type === 'added' ? 'is-add' : c.type === 'removed' ? 'is-del' : undefined}>
                        {c.value}
                      </span>
                    ))}
                  </div>
                ) : (
                  <textarea
                    id="ai-proposed"
                    className="ai-textarea"
                    dir="auto"
                    value={edited}
                    onChange={(e) => setEdited(e.target.value)}
                    rows={Math.min(16, Math.max(6, Math.ceil(edited.length / 70)))}
                  />
                )}
              </div>

              {suggestion.issues && (
                <div className="ai-field">
                  {suggestion.issues.length === 0 ? (
                    <p className="ai-ok">
                      <CircleCheck className="w-4 h-4" aria-hidden="true" /> لم يجد الفحص ما يحتاج تعديلاً.
                    </p>
                  ) : (
                    <>
                      {suggestion.issues.some((i) => i.autoFixed) && (
                        <>
                          <span className="ai-label">صُحّح في النص المقترح</span>
                          <ul className="ai-issues">
                            {suggestion.issues.filter((i) => i.autoFixed).map((i, k) => (
                              <li key={k} className="is-fixed">
                                <CircleCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                                <span>{i.message}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {suggestion.issues.some((i) => !i.autoFixed) && (
                        <>
                          <span className="ai-label">يحتاج قرارك</span>
                          <ul className="ai-issues">
                            {suggestion.issues.filter((i) => !i.autoFixed).map((i, k) => (
                              <li key={k}>
                                <CircleDot className="w-4 h-4 shrink-0" aria-hidden="true" />
                                <span>
                                  {i.message}
                                  {i.excerpt && (
                                    <>
                                      {' '}
                                      <mark className="ai-excerpt">{i.excerpt}</mark>
                                    </>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {!suggestion.issues && suggestion.changes.length > 0 && (
                <div className="ai-field">
                  <span className="ai-label">ما الذي تغيّر</span>
                  <ul className="ai-changes">
                    {suggestion.changes.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {suggestion.task === 'library_check' && suggestion.questions.length > 0 && (
                <div className="ai-field ai-questions">
                  <span className="ai-label">ما ينقص النص (أضفه بنفسك في المربع أعلاه)</span>
                  <ul className="ai-changes">
                    {suggestion.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {suggestion.task !== 'library_check' && suggestion.questions.length > 0 && (
                <div className="ai-field ai-questions">
                  <span className="ai-label">أسئلة لتحسين الصياغة دون اختراع تفاصيل</span>
                  {suggestion.questions.map((q, i) => (
                    <div key={i} className="ai-q">
                      <label htmlFor={`ai-q-${i}`}>{q}</label>
                      <input
                        id={`ai-q-${i}`}
                        className="input-field"
                        value={answers[i] || ''}
                        onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-ghost"
                    disabled={phase === 'saving' || !Object.values(answers).some((a) => a.trim())}
                    onClick={() => run(suggestion.task, true)}
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>أعد الكتابة بإجاباتي</span>
                  </button>
                </div>
              )}

              <p className="ai-meta">
                <bdi dir="ltr">
                  {suggestion.provider === 'library' ? 'فحص محلي' : `${suggestion.provider} · ${suggestion.model}`}
                </bdi>
                {suggestion.stats && (
                  <>
                    <span aria-hidden="true"> · </span>
                    <span>
                      {suggestion.stats.words} كلمة، متوسط الجملة {suggestion.stats.avgSentenceWords} كلمة
                    </span>
                  </>
                )}
                {suggestion.learnedApplied && (
                  <>
                    <span aria-hidden="true"> · </span>
                    <span>طُبّق ما تعلّمه المساعد من تعديلاتك</span>
                  </>
                )}
              </p>
            </>
          )}
        </div>

        <div className="ai-panel-foot">
          {onOpenMemory && (
            <button type="button" className="btn-ghost btn-sm" onClick={onOpenMemory}>
              <Brain className="w-4 h-4" aria-hidden="true" />
              <span>ما تعلّمه المساعد</span>
            </button>
          )}
          <div className="ai-foot-actions">
            {(phase === 'review' || phase === 'saving') && suggestion ? (
              <>
                <button type="button" className="btn-ghost" disabled={phase === 'saving'} onClick={() => decide('rejected')}>
                  رفض
                </button>
                <button type="button" className="btn-primary" disabled={phase === 'saving' || !edited.trim()} onClick={() => decide('accepted')}>
                  {phase === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Check className="w-4 h-4" aria-hidden="true" />}
                  <span>اعتماد</span>
                </button>
              </>
            ) : (
              <button type="button" className="btn-ghost" onClick={onClose}>
                إغلاق
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
