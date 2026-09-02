import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { DiffModal } from '../common/DiffModal';

export const DailyLogTab: React.FC = () => {
  const queryClient = useQueryClient();

  // Form State
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [timeFrom, setTimeFrom] = useState<string>('08:00');
  const [timeTo, setTimeTo] = useState<string>('16:00');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>(ENTRY_CATEGORIES[0]);
  const [description, setDescription] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // AI Diff Modal State
  const [diffModalOpen, setDiffModalOpen] = useState<boolean>(false);
  const [diffTitle, setDiffTitle] = useState<string>('');
  const [originalText, setOriginalText] = useState<string>('');
  const [improvedText, setImprovedText] = useState<string>('');
  const [diffChunks, setDiffChunks] = useState<DiffChunk[]>([]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Fetch entries
  const { data: entriesData, isLoading } = useQuery<{ entries: EntryDTO[] }>({
    queryKey: ['entries'],
    queryFn: async () => {
      const res = await api.get('/entries');
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
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('يرجى كتابة عنوان اليوم وتفاصيل الإنجاز');
      return;
    }
    setFormError('');
    createMutation.mutate({
      entryDate,
      timeFrom,
      timeTo,
      title: title.trim(),
      category,
      description: description.trim()
    });
  };

  // Run AI action on description
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
      {/* Input Card */}
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            <h2 className="text-base font-extrabold text-ink">إضافة إنجاز يومي جديد</h2>
          </div>
          <span className="text-xs text-sub">التاريخ الحالي: {entryDate}</span>
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

            <div className="space-y-1">
              <label className="block text-xs font-bold text-sub">التصنيف</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-sub absolute right-3 top-3" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent appearance-none"
                >
                  {ENTRY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description & AI Toolbar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-sub">تفاصيل الإنجاز والمهام المنفذة</label>
              <span className="text-[11px] text-sub">يُستخدم هذا النص مباشرة في التقرير النهائي</span>
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
                <span>أدوات الذكاء الاصطناعي واللغويات:</span>
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
              disabled={createMutation.isPending}
              className="px-6 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{createMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ الإدخال اليومي'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Entries List */}
      <div className="bg-card border border-line rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            <h3 className="text-base font-extrabold text-ink">سجل الإدخالات السابقة</h3>
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
            {entriesData.entries.map((entry) => (
              <div key={entry.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-extrabold text-ink">{entry.entryDate}</span>
                    <span className="text-sub">({entry.timeFrom} - {entry.timeTo})</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-accent-dim text-accent">
                      {entry.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-ink">{entry.title}</h4>
                  <p className="text-xs text-sub leading-relaxed whitespace-pre-wrap">{entry.description}</p>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الإدخال؟')) {
                      deleteMutation.mutate(entry.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="p-2 text-sub hover:text-accent rounded-lg hover:bg-bg transition-colors"
                  title="حذف الإدخال"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
};
