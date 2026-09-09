import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { saveOfflineEntry, getPendingEntries, syncPendingEntries } from '../../services/offlineSync';
import { useLanguage } from '../../context/LanguageContext';
import { ENTRY_CATEGORIES, EntryDTO, DiffChunk, inferProfessionalCategory, elevateTaskTitle } from '@coop/shared';
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
  Edit3,
  Mic,
  MicOff
} from 'lucide-react';
import { DiffModal } from '../common/DiffModal';
import { BatchRewriteModal } from '../common/BatchRewriteModal';

const DRAFT_KEY = 'coop_entry_draft_v2';

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'شبكات النفاذ والألياف الضوئية (FTTH)': 'Access Networks & FTTH',
  'شبكات الاتصالات اللاسلكية والجيل الخامس (5G)': 'Wireless Networks & 5G/LTE',
  'أمن المعلومات والأمن السيبراني': 'Information Security & Cybersecurity',
  'إدارة الخوادم ومراكز البيانات': 'Server & Data Center Administration',
  'عمليات ومراقبة الشبكة (NOC)': 'Network Operations Center (NOC)',
  'تطوير البرمجيات والأنظمة': 'Software & Systems Development',
  'الحوسبة السحابية والبنية التحتية': 'Cloud Computing & Infrastructure',
  'الذكاء الاصطناعي وتحليل البيانات': 'Artificial Intelligence & Data Analysis',
  'الدعم الفني والتشغيل الميداني': 'Technical Support & Field Operations',
  'إدارة المشاريع الهندسية والتوثيق': 'Engineering Project Management & Documentation',
  'تطوير / برمجة': 'Development / Programming',
  'اجتماعات': 'Meetings',
  'تدريب وتعلّم': 'Training & Learning',
  'توثيق': 'Documentation',
  'دعم فني': 'Technical Support',
  'أخرى': 'Other'
};

export const DailyLogTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { lang, isAr, t } = useLanguage();

  // Form State
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [timeFrom, setTimeFrom] = useState<string>('08:00');
  const [timeTo, setTimeTo] = useState<string>('16:00');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>(ENTRY_CATEGORIES[0]);
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [draftRestoredNotice, setDraftRestoredNotice] = useState<boolean>(false);

  // Modal States
  const [batchModalOpen, setBatchModalOpen] = useState<boolean>(false);
  const [diffModalOpen, setDiffModalOpen] = useState<boolean>(false);
  const [diffTitle, setDiffTitle] = useState<string>('');
  const [originalText, setOriginalText] = useState<string>('');
  const [improvedText, setImprovedText] = useState<string>('');
  const [diffChunks, setDiffChunks] = useState<DiffChunk[]>([]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const toggleVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('متصفحك لا يدعم الإملاء الصوتي المباشر. يُرجى استخدام متصفح Chrome أو Edge أو Safari.', 'Browser does not support voice speech recognition.'));
      return;
    }

    if (isRecording) {
      if ((window as any)._coopSpeechRec) {
        (window as any)._coopSpeechRec.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isAr ? 'ar-SA' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setDescription((prev) => (prev ? prev.trim() + ' ' + text.trim() : text.trim()));
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      (window as any)._coopSpeechRec = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };


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

  // Offline pending entries count & syncing state
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const checkPending = async () => {
    const list = await getPendingEntries();
    setPendingCount(list.length);
  };

  useEffect(() => {
    checkPending();
    const handler = () => checkPending();
    window.addEventListener('coop:offline-changed', handler);
    window.addEventListener('online', handler);
    return () => {
      window.removeEventListener('coop:offline-changed', handler);
      window.removeEventListener('online', handler);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncPendingEntries();
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      showToast(t(`تمت مزامنة ${res.success} سجل بنجاح!`, `Synced ${res.success} logs successfully!`));
    } catch {
      showToast(t('فشلت المزامنة، يرجى التحقق من اتصالك بالإنترنت', 'Sync failed, please check connection'), 'error');
    } finally {
      setIsSyncing(false);
      checkPending();
    }
  };

  // Restore autosaved draft on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.description || parsed.title) {
          setTitle(parsed.title || '');
          setDescription(parsed.description || '');
          if (parsed.isCustomCategory || (parsed.category && !ENTRY_CATEGORIES.includes(parsed.category))) {
            setIsCustomCategory(true);
            setCustomCategory(parsed.category || '');
          } else if (parsed.category) {
            setIsCustomCategory(false);
            setCategory(parsed.category);
          }
          if (parsed.entryDate) setEntryDate(parsed.entryDate);
          if (parsed.timeFrom) setTimeFrom(parsed.timeFrom);
          if (parsed.timeTo) setTimeTo(parsed.timeTo);
          setDraftRestoredNotice(true);
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  }, []);

  // Autosave draft to localStorage
  useEffect(() => {
    if (!editingEntryId) {
      const draft = {
        title,
        description,
        category: isCustomCategory ? customCategory : category,
        isCustomCategory,
        entryDate,
        timeFrom,
        timeTo
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [title, description, category, isCustomCategory, customCategory, entryDate, timeFrom, timeTo, editingEntryId]);

  // Fetch all active entries
  const { data: entriesData, isLoading } = useQuery({
    queryKey: ['entries'],
    queryFn: async () => {
      const res = await api.get('/entries');
      return res.data;
    }
  });

  // Fetch trash entries
  const { data: trashData } = useQuery({
    queryKey: ['entries-trash'],
    queryFn: async () => {
      const res = await api.get('/entries/trash');
      return res.data;
    }
  });

  // Create mutation with offline fallback
  const createMutation = useMutation({
    mutationFn: async (newEntry: any) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        await saveOfflineEntry(newEntry);
        return { offline: true };
      }
      try {
        const res = await api.post('/entries', newEntry);
        return res.data;
      } catch (err: any) {
        // If network error (offline or server unreachable), safely stash locally in IndexedDB
        if (!err.response) {
          await saveOfflineEntry(newEntry);
          return { offline: true };
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      resetForm();
      localStorage.removeItem(DRAFT_KEY);
      if (data?.offline) {
        checkPending();
        showToast(t('تم الحفظ محلياً في وضع عدم الاتصال! ستتم المزامنة تلقائياً فور عودة الشبكة.', 'Saved offline! Will sync automatically once reconnected.'));
      } else {
        showToast(t('تم تسجيل وحفظ إنجاز اليوم بنجاح!', 'Task saved successfully!'));
      }
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || t('حدث خطأ أثناء حفظ الإدخال', 'Failed to save entry'));
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
      resetForm();
      showToast(t('تم تحديث الإدخال وحفظ نسخة جديدة في سجل المراجعات!', 'Entry updated successfully!'));
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || t('حدث خطأ أثناء تحديث الإدخال', 'Failed to update entry'));
    }
  });

  // Soft delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/entries/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['entries-trash'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
    },
    onError: () => {
      showToast(t('تعذر حذف الإدخال، يرجى المحاولة مرة أخرى', 'Failed to delete entry'), 'error');
    }
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post(`/entries/${id}/restore`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['entries-trash'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      showToast(t('تمت استعادة الإدخال بنجاح إلى جدول المهام!', 'Entry restored successfully!'));
    },
    onError: () => {
      showToast(t('تعذر استعادة الإدخال', 'Failed to restore entry'), 'error');
    }
  });

  // Rollback revision mutation
  const rollbackMutation = useMutation({
    mutationFn: async ({ entryId, revId }: { entryId: number; revId: number }) => {
      const res = await api.post(`/entries/${entryId}/revisions/${revId}/rollback`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      setRevisionsModalOpen(false);
      showToast(t('تم التراجع عن التعديل واستعادة النسخة السابقة بنجاح!', 'Rolled back to previous revision!'));
    },
    onError: () => {
      showToast(t('تعذر التراجع عن التعديل', 'Failed to roll back'), 'error');
    }
  });

  const resetForm = () => {
    setEditingEntryId(null);
    setTitle('');
    setDescription('');
    setCategory(ENTRY_CATEGORIES[0]);
    setIsCustomCategory(false);
    setCustomCategory('');
    setFormError('');
  };

  const handleStartEdit = (entry: any) => {
    setEditingEntryId(entry.id);
    setEntryDate(entry.entryDate);
    setTimeFrom(entry.timeFrom || '08:00');
    setTimeTo(entry.timeTo || '16:00');
    setTitle(entry.title);
    if (entry.category && !ENTRY_CATEGORIES.includes(entry.category)) {
      setIsCustomCategory(true);
      setCustomCategory(entry.category);
    } else {
      setIsCustomCategory(false);
      setCategory(entry.category || ENTRY_CATEGORIES[0]);
    }
    setDescription(entry.description);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleOpenRevisions = async (entry: any) => {
    setActiveEntryForRevisions(entry);
    setRevisionsModalOpen(true);
    
    // Instant cache fallback to ensure zero data loss & instant rendering
    const cacheKey = `coop_entry_revs_${entry.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setEntryRevisionsList(JSON.parse(cached));
      } catch {}
    }

    try {
      const res = await api.get(`/entries/${entry.id}/revisions`);
      const revs = res.data.revisions || [];
      setEntryRevisionsList(revs);
      localStorage.setItem(cacheKey, JSON.stringify(revs));
    } catch {
      if (!cached) {
        showToast(t('تعذر تحميل سجل التعديلات من الخادم', 'Failed to load revisions from server'), 'error');
      }
    }
  };

  // One-click Engineering Elevation & Auto-Categorization
  const handleAutoElevate = () => {
    if (!description.trim() && !title.trim()) {
      showToast(t('يرجى كتابة تفاصيل المهمة أو العنوان أولاً لاقتراح التصنيف الهندسي', 'Please write task details first to suggest classification'), 'error');
      return;
    }
    const suggestedCat = inferProfessionalCategory(description, title);
    if (suggestedCat) {
      setIsCustomCategory(false);
      setCategory(suggestedCat);
    }
    if (title.trim()) {
      const elevatedTitle = elevateTaskTitle(title, description);
      if (elevatedTitle) setTitle(elevatedTitle);
    }
    showToast(t(`تم اقتراح التصنيف الهندسي والترقية: ${suggestedCat}`, `Engineering classification suggested: ${suggestedCat}`), 'success');
  };

  // Submit Handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError(t('يرجى كتابة عنوان مختصر لليوم', 'Please enter a task title'));
      return;
    }
    if (isCustomCategory && !customCategory.trim()) {
      setFormError(t('يرجى كتابة اسم التصنيف المخصص أو اختيار تصنيف من القائمة', 'Please enter a custom category name'));
      return;
    }
    if (!description.trim()) {
      setFormError(t('يرجى كتابة تفاصيل المهام المنفذة', 'Please enter task details'));
      return;
    }

    setFormError('');

    let finalCategory = isCustomCategory ? customCategory.trim() : category.trim();
    if ((!finalCategory || finalCategory === 'تدريب وتعلّم' || finalCategory === 'أخرى') && (description || title)) {
      const suggested = inferProfessionalCategory(description, title);
      if (suggested && suggested !== 'تدريب وتعلّم') {
        finalCategory = suggested;
      }
    }

    let finalTitle = title.trim();
    const elevated = elevateTaskTitle(finalTitle, description);
    if (elevated && finalTitle !== elevated && finalTitle.length < 25) {
      finalTitle = elevated;
    }

    const payload = {
      entryDate,
      timeFrom,
      timeTo,
      title: finalTitle,
      category: finalCategory,
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
      setFormError(t('يرجى كتابة تفاصيل الإنجاز أولاً لمعالجتها بالذكاء الاصطناعي', 'Please enter description first to use AI tools'));
      return;
    }
    setFormError('');
    setAiLoading(true);

    const actionTitles: Record<string, string> = {
      polish: t('تنقيح وصياغة أكاديمية رصينة', 'Academic Polishing & Refinement'),
      spellcheck: t('تصحيح إملائي ونحوي دقيق', 'Grammar & Spell Check'),
      summarize: t('اختصار وإيجاز مع حفظ الأرقام والإنجازات', 'Concise Technical Summary'),
      translate: t('ترجمة فورية للإنجليزية الأكاديمية', 'Academic English Translation')
    };

    const activeCat = isCustomCategory ? (customCategory.trim() || 'أخرى') : category;

    try {
      const res = await api.post('/ai/process', {
        text: description,
        action,
        targetLang: action === 'translate' ? 'en' : 'ar',
        context: `Task: ${title} | Category: ${activeCat}`
      });

      setDiffTitle(actionTitles[action] || t('معالجة النص', 'Text Processing'));
      setOriginalText(description);
      setImprovedText(res.data.result);
      setDiffChunks(res.data.diff || []);
      setDiffModalOpen(true);
    } catch {
      setFormError(t('تعذر معالجة النص بالذكاء الاصطناعي، يرجى المحاولة مرة أخرى', 'AI processing failed, please try again'));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Draft Restored Banner */}
      {draftRestoredNotice && (
        <div className="p-3.5 rounded-xl bg-ok-bg border border-ok/30 text-ok text-xs font-bold flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t('تم استرجاع مسودتك المكتوبة تلقائياً لحمايتها من أي ضياع أو إغلاق مفاجئ.', 'Your saved draft was automatically restored.')}</span>
          </div>
          <button
            onClick={() => setDraftRestoredNotice(false)}
            className="text-sub hover:text-ink text-xs font-normal"
          >
            {t('إغلاق', 'Dismiss')}
          </button>
        </div>
      )}

      {/* Input Card */}
      <div className="bg-card border border-line rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            <h2 className="text-base font-extrabold text-ink">
              {editingEntryId ? t('تعديل الإنجاز اليومي', 'Edit Daily Task') : t('إضافة إنجاز يومي جديد', 'Add New Daily Task')}
            </h2>
            {editingEntryId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-sub hover:text-accent underline mx-2"
              >
                ({t('إلغاء التعديل والعودة للإضافة', 'Cancel edit & return to add')})
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {trashData?.entries && trashData.entries.length > 0 && (
              <button
                type="button"
                onClick={() => setTrashModalOpen(true)}
                className="px-3 py-1 text-xs font-bold text-accent bg-accent-dim hover:bg-accent-dim/80 rounded-xl border border-accent/20 transition-colors flex items-center gap-1.5"
                title={t('سلة المحذوفات الآمنة', 'Safe Trash Archive')}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{t(`سلة المحذوفات (${trashData.entries.length})`, `Trash (${trashData.entries.length})`)}</span>
              </button>
            )}
            <span className="text-xs text-sub hidden sm:inline">{t('حفظ فوري للمسودة مفعل', 'Autosave active')}</span>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>
                {t(
                  `لديك ${pendingCount} سجلات ميدانية محفوظة محلياً بانتظار المزامنة`,
                  `You have ${pendingCount} offline field logs pending server sync`
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors text-xs disabled:opacity-50"
            >
              {isSyncing ? t('جارٍ المزامنة...', 'Syncing...') : t('مزامنة الآن', 'Sync Now')}
            </button>
          </div>
        )}

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
              <label className="block text-xs font-bold text-sub">{t('التاريخ', 'Date')}</label>
              <div className="relative">
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">{t('من الساعة', 'From')}</label>
              <div className="relative">
                <input
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">{t('إلى الساعة', 'To')}</label>
              <div className="relative">
                <input
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink"
                  required
                />
              </div>
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sub">{t('عنوان اليوم (مختصر ودقيق)', 'Task Title (Concise & Accurate)')}</label>
                <button
                  type="button"
                  onClick={handleAutoElevate}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 bg-accent/10 hover:bg-accent/20 px-2.5 py-0.5 rounded-lg border border-accent/25 transition-all shadow-2xs"
                  title={t('اقتراح تصنيف وترقية أكاديمية فورية بناءً على محتوى اليوم', 'Auto-infer engineering domain & title')}
                >
                  <Sparkles className="w-3 h-3 text-accent" />
                  <span>{t('التدقيق والترقية الأكاديمية الفورية', 'Auto-Elevate & Suggest Category')}</span>
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('مثال: تهيئة أجهزة توجيه الشبكة والتحقق من التوصيلات', 'e.g. Network router configuration and link verification')}
                className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sub">{t('التصنيف الفني', 'Technical Category')}</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCategory(!isCustomCategory);
                    if (!isCustomCategory && !customCategory) {
                      setCustomCategory('');
                    }
                  }}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
                >
                  {isCustomCategory ? t('← قائمة التصنيفات', '← Preset Categories') : t('+ كتابة تصنيف مخصص', '+ Custom Category')}
                </button>
              </div>

              {isCustomCategory ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder={t('اكتب تصنيفاً مخصصاً (مثال: أمن سيبراني، ذكاء اصطناعي...)', 'e.g. Cyber Security, AI, DevOps...')}
                    className="w-full px-3 py-2 text-sm bg-bg border border-accent rounded-xl focus:outline-none focus:ring-1 focus:ring-accent text-ink font-bold"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(false);
                      setCategory(ENTRY_CATEGORIES[0]);
                    }}
                    className="px-2.5 py-2 text-xs font-bold text-sub hover:text-ink bg-bg hover:bg-line border border-line rounded-xl shrink-0 transition-colors"
                    title={t('العودة للتصنيفات الجاهزة', 'Return to presets')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomCategory(true);
                        setCustomCategory('');
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-ink font-bold"
                    required
                  >
                    <optgroup label={isAr ? 'مجالات هندسية وتخصصية' : 'Engineering & Specialized'}>
                      {ENTRY_CATEGORIES.slice(0, 10).map((cat) => (
                        <option key={cat} value={cat}>
                          {isAr ? cat : (CATEGORY_TRANSLATIONS[cat] || cat)}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={isAr ? 'تصنيفات عامة' : 'General Categories'}>
                      {ENTRY_CATEGORIES.slice(10).map((cat) => (
                        <option key={cat} value={cat}>
                          {isAr ? cat : (CATEGORY_TRANSLATIONS[cat] || cat)}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__custom__">{t('+ كتابة تصنيف مخصص...', '+ Custom category...')}</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Description & AI Toolbar */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-bold text-sub">{t('تفاصيل الإنجاز والمهام المنفذة', 'Task Details & Accomplishments')}</label>
                
                {/* Cutting-Edge Voice Dictation Button */}
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isRecording
                      ? 'bg-accent text-white animate-pulse shadow-sm ring-2 ring-accent/30'
                      : 'bg-bg text-sub hover:text-accent border border-line hover:border-accent/40'
                  }`}
                  title={isRecording ? t('جارٍ الاستماع... انقر للإيقاف', 'Listening... Click to stop') : t('إملاء صوتي مباشر عبر المايكروفون', 'Voice Dictation via Microphone')}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5 text-white" /> : <Mic className="w-3.5 h-3.5 text-accent" />}
                  <span>{isRecording ? t('جارٍ الاستماع...', 'Listening...') : t('إملاء صوتي', 'Voice')}</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-sub">
                <span>
                  {description.trim() ? description.trim().split(/\s+/).length : 0} {t('كلمة', 'words')}
                </span>
                <span>•</span>
                <span>{t('حفظ فوري للمسودة مفعل', 'Draft autosaved')}</span>
              </div>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder={t('اشرح ما أنجزته بدقة، والبرمجيات أو الأجهزة التي تعاملت معها، والتحديات الفنية التي تم حلها...', 'Explain in detail what you accomplished, software/hardware tools used, and technical solutions...')}
              className="w-full p-3 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent leading-relaxed text-ink"
              required
            />

            {/* AI Enhancement Toolbar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-sub flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>{t('أدوات الذكاء الاصطناعي:', 'AI Tools:')}</span>
              </span>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAIAction('polish')}
                className="px-2.5 py-1 text-xs font-bold text-accent bg-accent-dim hover:bg-accent-dim/80 rounded-lg transition-colors flex items-center gap-1"
                title={t('تحسين الأسلوب ليصبح أكاديمياً رسمياً', 'Refine text to sound professional and academic')}
              >
                <Sparkles className="w-3 h-3" />
                <span>{t('تنقيح أكاديمي', 'AI Polish')}</span>
              </button>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAIAction('spellcheck')}
                className="px-2.5 py-1 text-xs font-bold text-ok bg-ok-bg hover:bg-ok-bg/80 rounded-lg transition-colors flex items-center gap-1"
                title={t('تصحيح إملائي ونحوي وتدقيق الهمزات', 'Check spelling and grammar')}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{t('تصحيح إملائي', 'Spellcheck')}</span>
              </button>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAIAction('summarize')}
                className="px-2.5 py-1 text-xs font-bold text-ink bg-bg hover:bg-line rounded-lg transition-colors border border-line flex items-center gap-1"
                title={t('اختصار وإيجاز مع حفظ الأرقام والإنجازات', 'Summarize key metrics and achievements')}
              >
                <FileText className="w-3 h-3" />
                <span>{t('اختصار وإيجاز', 'Summarize')}</span>
              </button>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAIAction('translate')}
                className="px-2.5 py-1 text-xs font-bold text-sub bg-bg hover:bg-line rounded-lg transition-colors border border-line flex items-center gap-1"
                title={t('ترجمة فورية للإنجليزية', 'Translate to English')}
              >
                <Languages className="w-3 h-3" />
                <span>{t('ترجمة للإنجليزية', 'Translate')}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full sm:w-auto px-6 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm text-sm flex items-center justify-center gap-2"
            >
              {editingEntryId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>
                {createMutation.isPending || updateMutation.isPending
                  ? t('جارٍ الحفظ...', 'Saving...')
                  : editingEntryId
                  ? t('تحديث الإدخال وحفظ تعديل جديد', 'Update Task')
                  : t('حفظ الإدخال اليومي', 'Save Daily Task')}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Entries List */}
      <div className="bg-card border border-line rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            <h3 className="text-base font-extrabold text-ink">{t('سجل المهام اليومية الموثقة', 'Logged Daily Tasks')}</h3>
            <span className="text-xs font-bold text-sub">
              ({entriesData?.entries?.length || 0} {t('إدخال مسجّل', 'logged entries')})
            </span>
          </div>

          {entriesData?.entries && entriesData.entries.length > 0 && (
            <button
              type="button"
              onClick={() => setBatchModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 rounded-xl border border-accent/25 transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs"
              title={t('إعادة صياغة وهيكلة جميع السجلات اليومية أكاديمياً بدون اختلاق', 'Academic batch restructuring')}
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>{t('إعادة صياغة وترتيب السجلات أكاديمياً (شامل)', 'Batch Academic Rewrite')}</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-sub text-sm">{t('جارٍ تحميل السجلات...', 'Loading tasks...')}</div>
        ) : !entriesData?.entries?.length ? (
          <div className="text-center py-12 text-sub text-sm">
            {t('لا توجد إدخالات مسجلة بعد. استخدم النموذج أعلاه لتوثيق إنجاز أول يوم تدريبي لك.', 'No entries logged yet. Use the form above to record your first day of training.')}
          </div>
        ) : (
          <div className="divide-y divide-line">
            {entriesData.entries.map((entry: any) => (
              <div key={entry.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                <div className="space-y-1.5 flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-extrabold text-ink">{entry.entryDate}</span>
                    <span className="text-sub">({entry.timeFrom} - {entry.timeTo})</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-accent-dim text-accent">
                      {isAr ? entry.category : (CATEGORY_TRANSLATIONS[entry.category] || entry.category)}
                    </span>
                    {entry._count?.revisions > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ok-bg text-ok">
                        {entry._count.revisions} {t('تعديلات محفوظة', 'revisions saved')}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-ink">{entry.title}</h4>
                  <p className="text-xs text-sub leading-relaxed whitespace-pre-wrap">{entry.description}</p>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-start pt-1 sm:pt-0 border-t border-line/40 sm:border-0 w-full sm:w-auto justify-end">
                  {/* Edit button */}
                  <button
                    onClick={() => handleStartEdit(entry)}
                    className="p-2 text-sub hover:text-accent rounded-lg hover:bg-bg transition-colors"
                    title={t('تعديل وتحديث هذا الإدخال', 'Edit task')}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Revision History button */}
                  <button
                    onClick={() => handleOpenRevisions(entry)}
                    className="p-2 text-sub hover:text-ok rounded-lg hover:bg-bg transition-colors"
                    title={t('سجل التعديلات والنسخ السابقة', 'Revision history')}
                  >
                    <History className="w-4 h-4" />
                  </button>

                  {/* Soft Delete */}
                  <button
                    onClick={() => {
                      deleteMutation.mutate(entry.id, {
                        onSuccess: () => {
                          showToast(t('تم نقل الإدخال إلى سلة المحذوفات بنجاح (يمكن استعادته بأي وقت)', 'Moved to trash safely (can be restored anytime)'), 'success');
                        }
                      });
                    }}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-sub hover:text-accent rounded-lg hover:bg-bg transition-colors"
                    title={t('نقل لسلة المحذوفات بأمان', 'Move to trash')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trash Modal */}
      {trashModalOpen && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-line rounded-2xl p-6 shadow-2xl max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden text-start">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
                <Archive className="w-5 h-5 text-accent" />
                <span>{t('سلة المحذوفات الآمنة', 'Safe Trash Archive')}</span>
              </h3>
              <button
                onClick={() => setTrashModalOpen(false)}
                className="p-1 rounded-lg text-sub hover:text-ink hover:bg-line transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 flex-1 divide-y divide-line">
              {!trashData?.entries?.length ? (
                <div className="text-center py-8 text-sub text-xs">{t('سلة المحذوفات فارغة تماماً.', 'Trash is empty.')}</div>
              ) : (
                trashData.entries.map((entry: any) => (
                  <div key={entry.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-xs text-ink">{entry.title}</div>
                      <div className="text-[11px] text-sub">{entry.entryDate} &middot; {entry.category}</div>
                    </div>
                    <button
                      onClick={() => restoreMutation.mutate(entry.id)}
                      disabled={restoreMutation.isPending}
                      className="px-3 py-1.5 rounded-xl bg-ok-bg text-ok hover:bg-ok-bg/80 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('استعادة', 'Restore')}</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-line flex justify-end">
              <button
                onClick={() => setTrashModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-bg hover:bg-line text-xs font-bold text-ink transition-colors"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revisions History Modal */}
      {revisionsModalOpen && activeEntryForRevisions && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-line rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-start">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
                  <History className="w-5 h-5 text-accent" />
                  <span>{t('سجل التعديلات والنسخ المحفوظة (أمان البيانات 100%)', 'Revision Vault & Zero Data Loss History')}</span>
                </h3>
                <p className="text-[11px] text-sub font-medium">
                  {t('تاريخ المهمة:', 'Task Date:')} <strong className="text-ink">{activeEntryForRevisions.entryDate}</strong> — {entryRevisionsList.length > 0 ? `${entryRevisionsList.length} ${t('نسخة مسجلة في الأرشيف', 'version(s) archived')}` : t('النسخة الأصلية الأساسية', 'Original Baseline Version')}
                </p>
              </div>
              <button
                onClick={() => setRevisionsModalOpen(false)}
                className="p-1 rounded-lg text-sub hover:text-ink hover:bg-line transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 flex-1 space-y-4">
              {/* Current Active Entry State */}
              <div className="p-4 rounded-xl border border-ok/30 bg-ok-bg/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-black text-ok">
                    <span className="w-2 h-2 rounded-full bg-ok animate-pulse"></span>
                    {t('النسخة الحالية النشطة في قاعدة البيانات', 'Current Active Version in Database')}
                  </span>
                  <span className="text-[10px] font-bold text-sub">
                    {activeEntryForRevisions.timeFrom} - {activeEntryForRevisions.timeTo} | {activeEntryForRevisions.category}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-ink">{activeEntryForRevisions.title}</h4>
                <p className="text-xs text-ink/90 leading-relaxed whitespace-pre-wrap bg-card/60 p-3 rounded-lg border border-line/40">
                  {activeEntryForRevisions.description}
                </p>
              </div>

              {/* Revision History Stream */}
              <div className="space-y-2.5">
                <div className="text-xs font-black text-sub uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-accent" />
                  <span>{t('النسخ السابقة المحفوظة (يمكنك استعادة أي منها بأمان):', 'Archived Prior Revisions (Safe Rollback Available):')}</span>
                </div>

                {!entryRevisionsList?.length ? (
                  <div className="text-center py-6 px-4 rounded-xl border border-dashed border-line bg-bg text-sub text-xs space-y-1">
                    <p className="font-bold text-ink">
                      {t('هذه هي النسخة الأساسية الأولى المحفوظة بأمان في قاعدة البيانات.', 'This is the initial baseline version stored safely in the database.')}
                    </p>
                    <p className="text-[11px] text-sub">
                      {t('أي تعديل تجريه لاحقاً على هذه المهمة سيتم أرشفته تلقائياً هنا مع التوقيت الدقيق لإمكانية استرجاعه في أي لحظة.', 'Any subsequent edits will automatically be archived here with exact timestamps for instant rollback.')}
                    </p>
                  </div>
                ) : (
                  entryRevisionsList.map((rev, idx) => {
                    const isSameAsCurrent = rev.title === activeEntryForRevisions.title && rev.description === activeEntryForRevisions.description;
                    return (
                      <div key={rev.id || idx} className="p-3.5 rounded-xl border border-line bg-bg space-y-2 hover:border-accent/40 transition-colors">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-accent-dim text-accent">
                              #{entryRevisionsList.length - idx}
                            </span>
                            <span className="font-extrabold text-ink">{rev.title}</span>
                            {rev.createdAt && (
                              <span className="text-[10px] text-muted hidden sm:inline">
                                ({new Date(rev.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })})
                              </span>
                            )}
                          </div>
                          {!isSameAsCurrent && (
                            <button
                              onClick={() => rollbackMutation.mutate({ entryId: activeEntryForRevisions.id, revId: rev.id })}
                              disabled={rollbackMutation.isPending}
                              className="px-3 py-1 text-[11px] font-bold rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors flex items-center gap-1 shrink-0 shadow-xs"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>{rollbackMutation.isPending ? t('جارٍ الاسترجاع...', 'Restoring...') : t('استعادة هذه النسخة', 'Restore this version')}</span>
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-sub leading-relaxed whitespace-pre-wrap bg-card p-2.5 rounded-lg border border-line/50">
                          {rev.description}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-line flex items-center justify-between">
              <span className="text-[11px] text-ok font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('بياناتك محفوظة ومحمية تلقائياً في السيرفر', 'All data securely preserved on server')}
              </span>
              <button
                onClick={() => setRevisionsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-bg hover:bg-line text-xs font-bold text-ink transition-colors"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Diff Modal */}
      <DiffModal
        isOpen={diffModalOpen}
        onClose={() => setDiffModalOpen(false)}
        actionTitle={diffTitle}
        originalText={originalText}
        improvedText={improvedText}
        diffChunks={diffChunks}
        onAccept={() => {
          setDescription(improvedText);
          setDiffModalOpen(false);
          showToast(t('تم تطبيق التعديلات الذكية بنجاح!', 'AI improvements applied successfully!'));
        }}
      />

      {/* Batch Academic Rewrite Modal */}
      <BatchRewriteModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        totalEntries={entriesData?.entries?.length || 0}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['entries'] });
          showToast(t('تمت إعادة صياغة وترتيب السجلات أكاديمياً بنجاح!', 'Entries academically restructured successfully!'));
        }}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 z-50 animate-fade-in text-white ${
            toast.type === 'error' ? 'bg-warn' : 'bg-ok'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};
