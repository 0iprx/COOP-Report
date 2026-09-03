import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ENTRY_CATEGORIES, EntryDTO, DiffChunk } from '@coop/shared';
import {
  Calendar,
  Clock,
  Tag,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  FileText,
  Languages,
  AlertCircle,
  RotateCcw,
  History,
  Archive,
  Check,
  X,
  Edit3
} from 'lucide-react';
import { DiffModal } from '../common/DiffModal';

const DRAFT_KEY = 'coop_entry_draft_v2';

export const DailyLogTab: React.FC = () => {
  const queryClient = useQueryClient();

  // Form State
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [timeFrom, setTimeFrom] = useState<string>('08:00');
  const [timeTo, setTimeTo] = useState<string>('16:00');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>(ENTRY_CATEGORIES[0]);
  const [description, setDescription] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [draftRestoredNotice, setDraftRestoredNotice] = useState<boolean>(false);

  // Modal States
  const [diffModalOpen, setDiffModalOpen] = useState<boolean>(false);
  const [diffTitle, setDiffTitle] = useState<string>('');
  const [originalText, setOriginalText] = useState<string>('');
  const [improvedText, setImprovedText] = useState<string>('');
  const [diffChunks, setDiffChunks] = useState<DiffChunk[]>([]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Trash & Revisions Modal States
  const [trashModalOpen, setTrashModalOpen] = useState<boolean>(false);
  const [revisionsModalOpen, setRevisionsModalOpen] = useState<boolean>(false);
  const [activeEntryForRevisions, setActiveEntryForRevisions] = useState<EntryDTO | null>(null);
  const [entryRevisionsList, setEntryRevisionsList] = useState<any[]>([]);

  // In-app non-blocking toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Auto-save & Restore Draft (Zero Data Loss on typing)
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title || parsed.description) {
          setTitle(parsed.title || '');
          setDescription(parsed.description || '');
          if (parsed.entryDate) setEntryDate(parsed.entryDate);
          if (parsed.timeFrom) setTimeFrom(parsed.timeFrom);
          if (parsed.timeTo) setTimeTo(parsed.timeTo);
          if (parsed.category) setCategory(parsed.category);
          setDraftRestoredNotice(true);
          setTimeout(() => setDraftRestoredNotice(false), 5000);
        }
      }
    } catch {}
  }, []);

  // Debounced auto-save to localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      if (title.trim() || description.trim()) {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ entryDate, timeFrom, timeTo, title, category, description })
        );
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [entryDate, timeFrom, timeTo, title, category, description]);

  // Fetch entries
  const { data: entriesData, isLoading } = useQuery<{ entries: EntryDTO[] }>({
    queryKey: ['entries'],
    queryFn: async () => {
      const res = await api.get('/entries');
      return res.data;
    }
  });

  // Fetch soft-deleted trash
  const { data: trashData } = useQuery<{ entries: EntryDTO[] }>({
    queryKey: ['entriesTrash'],
    queryFn: async () => {
      const res = await api.get('/backup/trash');
      return res.data;
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newEntry: any) => {
      const res = await api.post('/entries', newEntry);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      setTitle('');
      setDescription('');
      setFormError('');
      localStorage.removeItem(DRAFT_KEY);
      showToast('تمت إضافة وتوثيق المهمة بنجاح', 'success');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await api.put(`/entries/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      setEditingEntryId(null);
      setTitle('');
      setDescription('');
      setFormError('');
      localStorage.removeItem(DRAFT_KEY);
      showToast('تم تحديث الإدخال وحفظ نسخة سابقة تلقائياً في سجل الإصدارات', 'success');
    }
  });

  // Soft delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['entriesTrash'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
    }
  });

  // Restore from trash mutation
  const restoreMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/backup/restore/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['entriesTrash'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
    }
  });

  // Start editing existing entry
  const handleStartEdit = (entry: EntryDTO) => {
    setEditingEntryId(entry.id);
    setEntryDate(entry.entryDate);
    setTimeFrom(entry.timeFrom);
    setTimeTo(entry.timeTo);
    setTitle(entry.title);
    setCategory(entry.category);
    setDescription(entry.description);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('تم تحميل بيانات الإدخال في النموذج للتعديل', 'success');
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setTitle('');
    setDescription('');
    setFormError('');
  };

  // View entry revisions
  const handleOpenRevisions = async (entry: EntryDTO) => {
    setActiveEntryForRevisions(entry);
    try {
      const res = await api.get(`/backup/revisions/${entry.id}`);
      setEntryRevisionsList(res.data.revisions || []);
      setRevisionsModalOpen(true);
    } catch {
      showToast('تعذر جلب سجل التعديلات', 'error');
    }
  };

  // Revert to revision
  const handleRevertToRevision = async (revisionId: number) => {
    if (!activeEntryForRevisions) return;
    try {
      await api.post(`/backup/revert/${activeEntryForRevisions.id}/${revisionId}`);
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      setRevisionsModalOpen(false);
      showToast('تم استرجاع النسخة السابقة بنجاح', 'success');
    } catch {
      showToast('تعذر استرجاع النسخة', 'error');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('يرجى كتابة عنوان اليوم وتفاصيل الإنجاز');
      return;
    }
    setFormError('');
    const payload = {
      entryDate,
      timeFrom,
      timeTo,
      title: title.trim(),
      category,
      description: description.trim()
    };

    if (editingEntryId) {
      updateMutation.mutate({ id: editingEntryId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // AI action handler
  const handleAIAction = async (action: 'polish' | 'spellcheck' | 'summarize' | 'translate') => {
    if (!description.trim()) {
      setFormError('يرجى كتابة تفاصيل الإنجاز أولاً لمعالجتها بالذكاء الاصطناعي');
      return;
    }
    setFormError('');
    setAiLoading(true);

    const actionTitles: Record<string, string> = {
      polish: 'تنقيح وصياغة أكاديمية رصينة',
      spellcheck: 'تصحيح إملائي ونحوي دقيق',
      summarize: 'اختصار وإيجاز مع حفظ الأرقام والإنجازات',
      translate: 'ترجمة فورية للإنجليزية الأكاديمية'
    };

    try {
      const res = await api.post('/ai/process', {
        text: description,
        action,
        targetLang: action === 'translate' ? 'en' : 'ar',
        context: `عنوان اليوم: ${title} | التصنيف: ${category}`
      });

      setDiffTitle(actionTitles[action] || 'معالجة النص');
      setOriginalText(description);
      setImprovedText(res.data.result);
      setDiffChunks(res.data.diff || []);
      setDiffModalOpen(true);
    } catch {
      setFormError('تعذر معالجة النص بالذكاء الاصطناعي، يرجى المحاولة مرة أخرى');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Draft Restored Banner */}
      {draftRestoredNotice && (
        <div className="p-3.5 rounded-xl bg-ok-bg border border-ok/30 text-ok text-xs font-bold flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>تم استرجاع مسودتك المكتوبة تلقائياً لحمايتها من أي ضياع أو إغلاق مفاجئ.</span>
          </div>
          <button
            onClick={() => setDraftRestoredNotice(false)}
            className="text-sub hover:text-ink text-xs font-normal"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Input Card */}
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            <h2 className="text-base font-extrabold text-ink">
              {editingEntryId ? 'تعديل الإنجاز اليومي' : 'إضافة إنجاز يومي جديد'}
            </h2>
            {editingEntryId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-sub hover:text-accent underline mr-2"
              >
                (إلغاء التعديل والعودة للإضافة)
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {trashData?.entries && trashData.entries.length > 0 && (
              <button
                type="button"
                onClick={() => setTrashModalOpen(true)}
                className="px-3 py-1 text-xs font-bold text-accent bg-accent-dim hover:bg-accent-dim/80 rounded-xl border border-accent/20 transition-colors flex items-center gap-1.5"
                title="سلة المحذوفات الآمنة"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>سلة المحذوفات ({trashData.entries.length})</span>
              </button>
            )}
            <span className="text-xs text-sub hidden sm:inline">حفظ فوري للمسودة مفعل</span>
          </div>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-accent-dim border border-accent/20 text-accent text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Date & Times Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">التاريخ</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-sub absolute right-3 top-3" />
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">من الساعة</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-sub absolute right-3 top-3" />
                <input
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">إلى الساعة</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-sub absolute right-3 top-3" />
                <input
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-sub">عنوان اليوم (مختصر ودقيق)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: تهيئة أجهزة توجيه الشبكة والتحقق من التوصيلات"
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sub">التصنيف</label>
                <span className="text-[10px] text-muted">اختر أو اكتب تصنيفاً مخصصاً</span>
              </div>
              <div className="relative">
                <Tag className="w-4 h-4 text-sub absolute right-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  list="category-suggestions"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="اختر أو اكتب تصنيفاً مخصصاً..."
                  className="w-full pr-9 pl-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent"
                  required
                />
                <datalist id="category-suggestions">
                  {ENTRY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              {/* Quick Preset Tags */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {ENTRY_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      category === cat
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-bg hover:bg-line text-sub border border-line'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description & AI Toolbar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-sub">تفاصيل الإنجاز والمهام المنفذة</label>
              <span className="text-[11px] text-sub">يُحفظ تلقائياً كمسودة أثناء الكتابة</span>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="اشرح ما أنجزته بدقة، والبرمجيات أو الأجهزة التي تعاملت معها، والتحديات الفنية التي تم حلها..."
              className="w-full p-3 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent leading-relaxed"
              required
            />

            {/* AI Enhancement Toolbar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-sub flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>أدوات الذكاء الاصطناعي:</span>
              </span>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAIAction('polish')}
                className="px-2.5 py-1 text-xs font-bold text-accent bg-accent-dim hover:bg-accent-dim/80 rounded-lg transition-colors flex items-center gap-1"
                title="تحسين الأسلوب ليصبح أكاديمياً رسمياً"
              >
                <Sparkles className="w-3 h-3" />
                <span>تنقيح أكاديمي</span>
              </button>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAIAction('spellcheck')}
                className="px-2.5 py-1 text-xs font-bold text-ok bg-ok-bg hover:bg-ok-bg/80 rounded-lg transition-colors flex items-center gap-1"
                title="تصحيح إملائي ونحوي وتدقيق الهمزات"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>تصحيح إملائي</span>
              </button>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAIAction('summarize')}
                className="px-2.5 py-1 text-xs font-bold text-ink bg-bg hover:bg-line rounded-lg transition-colors border border-line flex items-center gap-1"
                title="اختصار وإيجاز مع حفظ الأرقام والإنجازات"
              >
                <FileText className="w-3 h-3" />
                <span>اختصار وإيجاز</span>
              </button>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAIAction('translate')}
                className="px-2.5 py-1 text-xs font-bold text-sub bg-bg hover:bg-line rounded-lg transition-colors border border-line flex items-center gap-1"
                title="ترجمة فورية للإنجليزية"
              >
                <Languages className="w-3 h-3" />
                <span>ترجمة للإنجليزية</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-6 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm text-sm flex items-center gap-2"
            >
              {editingEntryId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>
                {createMutation.isPending || updateMutation.isPending
                  ? 'جارٍ الحفظ...'
                  : editingEntryId
                  ? 'تحديث الإدخال وحفظ تعديل جديد'
                  : 'حفظ الإدخال اليومي'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Entries List */}
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            <h3 className="text-base font-extrabold text-ink">سجل الإدخالات المعتمدة</h3>
          </div>
          <span className="text-xs font-bold text-sub">
            {entriesData?.entries?.length || 0} إدخال مسجّل
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-sub text-sm">جارٍ تحميل السجلات...</div>
        ) : !entriesData?.entries?.length ? (
          <div className="text-center py-12 text-sub text-sm">
            لا توجد إدخالات مسجلة بعد. استخدم النموذج أعلاه لتوثيق إنجاز أول يوم تدريبي لك.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {entriesData.entries.map((entry: any) => (
              <div key={entry.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-extrabold text-ink">{entry.entryDate}</span>
                    <span className="text-sub">({entry.timeFrom} - {entry.timeTo})</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-accent-dim text-accent">
                      {entry.category}
                    </span>
                    {entry._count?.revisions > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ok-bg text-ok">
                        {entry._count.revisions} تعديلات محفوظة
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-ink">{entry.title}</h4>
                  <p className="text-xs text-sub leading-relaxed whitespace-pre-wrap">{entry.description}</p>
                </div>

                <div className="flex items-center gap-1">
                  {/* Edit button */}
                  <button
                    onClick={() => handleStartEdit(entry)}
                    className="p-2 text-sub hover:text-accent rounded-lg hover:bg-bg transition-colors"
                    title="تعديل وتحديث هذا الإدخال"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Revision History button */}
                  <button
                    onClick={() => handleOpenRevisions(entry)}
                    className="p-2 text-sub hover:text-ok rounded-lg hover:bg-bg transition-colors"
                    title="سجل التعديلات والنسخ السابقة"
                  >
                    <History className="w-4 h-4" />
                  </button>

                  {/* Soft Delete */}
                  <button
                    onClick={() => {
                      deleteMutation.mutate(entry.id, {
                        onSuccess: () => {
                          showToast('تم نقل الإدخال إلى سلة المحذوفات بنجاح (يمكن استعادته بأي وقت)', 'success');
                        }
                      });
                    }}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-sub hover:text-accent rounded-lg hover:bg-bg transition-colors"
                    title="نقل لسلة المحذوفات بأمان"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trash Modal (سلة المحذوفات) */}
      {trashModalOpen && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-line rounded-2xl p-6 shadow-2xl max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
                <Archive className="w-5 h-5 text-accent" />
                <span>سلة المحذوفات الآمنة (يمكن استرجاع أي إدخال)</span>
              </h3>
              <button onClick={() => setTrashModalOpen(false)} className="text-sub hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto space-y-3 flex-1 divide-y divide-line">
              {!trashData?.entries?.length ? (
                <div className="text-center py-8 text-sub text-xs">سلة المحذوفات فارغة حالياً.</div>
              ) : (
                trashData.entries.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-ink">{item.title}</div>
                      <div className="text-sub text-[11px]">{item.entryDate} | {item.category}</div>
                    </div>
                    <button
                      onClick={() => {
                        restoreMutation.mutate(item.id);
                        if (trashData.entries.length <= 1) setTrashModalOpen(false);
                      }}
                      className="px-3 py-1.5 bg-ok text-white font-bold rounded-lg hover:bg-ok/90 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>استرجاع</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revision History Modal (سجل التعديلات) */}
      {revisionsModalOpen && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-line rounded-2xl p-6 shadow-2xl max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
                <History className="w-5 h-5 text-ok" />
                <span>سجل النسخ السابقة للإدخال</span>
              </h3>
              <button onClick={() => setRevisionsModalOpen(false)} className="text-sub hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto space-y-4 flex-1">
              {!entryRevisionsList.length ? (
                <div className="text-center py-8 text-sub text-xs">لا توجد تعديلات سابقة مسجلة لهذا الإدخال.</div>
              ) : (
                entryRevisionsList.map((rev) => (
                  <div key={rev.id} className="p-3 bg-bg border border-line rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-sub font-bold text-[11px]">
                      <span>تاريخ النسخة: {new Date(rev.createdAt).toLocaleString('ar-SA')}</span>
                      <button
                        onClick={() => handleRevertToRevision(rev.id)}
                        className="px-2.5 py-1 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-1 font-bold"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>استرجاع هذه النسخة</span>
                      </button>
                    </div>
                    <div className="font-bold text-ink">{rev.title}</div>
                    <p className="text-sub leading-relaxed whitespace-pre-wrap">{rev.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Diff Modal */}
      <DiffModal
        isOpen={diffModalOpen}
        actionTitle={diffTitle}
        originalText={originalText}
        improvedText={improvedText}
        diffChunks={diffChunks}
        onAccept={() => {
          setDescription(improvedText);
          setDiffModalOpen(false);
        }}
        onClose={() => setDiffModalOpen(false)}
      />

      {/* Floating In-App Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[90%] text-center animate-slide-up">
          <div
            className={`px-5 py-2.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-ink text-white'
                : 'bg-accent text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-4 h-4 text-ok shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
