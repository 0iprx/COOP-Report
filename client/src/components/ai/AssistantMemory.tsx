import { createPortal } from 'react-dom';
import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, Loader2, Brain } from 'lucide-react';
import { api } from '../../services/api';

interface Memory {
  glossary: { term: string; preferred: string }[];
  notes: string[];
  avoidPhrases: string[];
  lengthRatios: number[];
  examples: { before: string; after: string; task: string; at: string }[];
  stats: { accepted: number; acceptedAsIs: number; edited: number; rejected: number };
}

/** Shows the trainee everything the assistant has learned about their writing, and lets them edit or reset it. */
export const AssistantMemory: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<{ memory: Memory }>({
    queryKey: ['aiMemory'],
    queryFn: async () => (await api.get('/ai/v2/memory')).data,
    enabled: open
  });
  const [notes, setNotes] = useState('');
  const [glossary, setGlossary] = useState<{ term: string; preferred: string }[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!data) return;
    setNotes(data.memory.notes.join('\n'));
    setGlossary(data.memory.glossary);
    setAvoid(data.memory.avoidPhrases);
  }, [data]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const save = async (reset = false) => {
    setSaving(true);
    setMsg('');
    try {
      const body = reset
        ? { reset: true }
        : { notes: notes.split('\n').map((n) => n.trim()).filter(Boolean), glossary: glossary.filter((g) => g.term.trim() && g.preferred.trim()), avoidPhrases: avoid };
      const res = await api.put('/ai/v2/memory', body);
      qc.setQueryData(['aiMemory'], res.data);
      setMsg(reset ? 'تم مسح ما تعلّمه المساعد.' : 'تم الحفظ.');
    } catch {
      setMsg('تعذر الحفظ.');
    } finally {
      setSaving(false);
    }
  };

  const s = data?.memory.stats;
  const ratios = data?.memory.lengthRatios || [];
  const avgRatio = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : null;

  return createPortal(
    <div className="ai-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ai-panel" role="dialog" aria-modal="true" aria-labelledby="ai-mem-title" dir="rtl">
        <div className="ai-panel-head">
          <div>
            <p className="ai-panel-kicker">مساعد الكتابة</p>
            <h2 id="ai-mem-title" className="ai-panel-title">ما تعلّمه عنك</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="إغلاق">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="ai-panel-body">
          {isLoading || !data ? (
            <p className="ai-muted">
              <Loader2 className="w-4 h-4 animate-spin inline-block" aria-hidden="true" /> جارٍ التحميل...
            </p>
          ) : (
            <>
              <p className="ai-muted">
                يتعلّم المساعد من قراراتك فقط: ما تعتمده كما هو، وما تعدّله قبل الاعتماد، وما ترفضه. هذه المعلومات تخصّك وحدك، وتُرسل ضمن طلباتك أنت فقط.
              </p>

              <dl className="ai-stats">
                <div><dt>اعتمدتها كما هي</dt><dd>{s!.acceptedAsIs}</dd></div>
                <div><dt>عدّلتها ثم اعتمدتها</dt><dd>{s!.edited}</dd></div>
                <div><dt>رفضتها</dt><dd>{s!.rejected}</dd></div>
                <div>
                  <dt>طول ما تعتمده</dt>
                  <dd>{avgRatio === null || ratios.length < 3 ? 'لم يتضح بعد' : avgRatio < 0.8 ? 'أقصر من المقترح' : avgRatio > 1.2 ? 'أطول من المقترح' : 'قريب من المقترح'}</dd>
                </div>
              </dl>

              <div className="ai-field">
                <label htmlFor="ai-notes" className="ai-label">ملاحظاتك عن أسلوبك (سطر لكل ملاحظة)</label>
                <textarea
                  id="ai-notes"
                  className="ai-textarea"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: أفضّل الجمل القصيرة. أكتب بصيغة المتكلم المفرد."
                />
              </div>

              <div className="ai-field">
                <span className="ai-label">مصطلحاتك المفضّلة</span>
                {glossary.map((g, i) => (
                  <div key={i} className="ai-gloss-row">
                    <label className="sr-only" htmlFor={`g-t-${i}`}>المصطلح</label>
                    <input id={`g-t-${i}`} className="input-field" value={g.term} placeholder="بدلاً من" onChange={(e) => setGlossary((l) => l.map((x, k) => (k === i ? { ...x, term: e.target.value } : x)))} />
                    <label className="sr-only" htmlFor={`g-p-${i}`}>المفضّل</label>
                    <input id={`g-p-${i}`} className="input-field" value={g.preferred} placeholder="استخدم" onChange={(e) => setGlossary((l) => l.map((x, k) => (k === i ? { ...x, preferred: e.target.value } : x)))} />
                    <button type="button" className="icon-btn" aria-label="حذف المصطلح" onClick={() => setGlossary((l) => l.filter((_, k) => k !== i))}>
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-ghost btn-sm" onClick={() => setGlossary((l) => [...l, { term: '', preferred: '' }])}>
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>إضافة مصطلح</span>
                </button>
              </div>

              {avoid.length > 0 && (
                <div className="ai-field">
                  <span className="ai-label">عبارات حذفتها من اقتراحات سابقة (لن يستخدمها)</span>
                  <ul className="ai-chips">
                    {avoid.map((a, i) => (
                      <li key={i}>
                        <span>{a}</span>
                        <button type="button" aria-label={`إزالة: ${a}`} onClick={() => setAvoid((l) => l.filter((_, k) => k !== i))}>
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.memory.examples.length > 0 && (
                <p className="ai-muted">
                  <Brain className="w-4 h-4 inline-block" aria-hidden="true" /> يحتفظ المساعد بآخر {data.memory.examples.length} من تعديلاتك أمثلةً على أسلوبك.
                </p>
              )}
              {msg && <p className="ai-muted" role="status">{msg}</p>}
            </>
          )}
        </div>

        <div className="ai-panel-foot">
          <button type="button" className="btn-ghost btn-sm" disabled={saving} onClick={() => window.confirm('مسح كل ما تعلّمه المساعد عنك؟') && save(true)}>
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>مسح الذاكرة</span>
          </button>
          <div className="ai-foot-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>إغلاق</button>
            <button type="button" className="btn-primary" disabled={saving || !data} onClick={() => save(false)}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              <span>حفظ</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
