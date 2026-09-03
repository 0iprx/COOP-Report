import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { WeeklyEvidenceDTO } from '@coop/shared';
import {
  Camera,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  Loader2,
  ShieldCheck
} from 'lucide-react';

interface Props {
  weekIndex: number;
  traineeId?: number;
  readOnly?: boolean;
}

export const WeeklyEvidenceSection: React.FC<Props> = ({ weekIndex, traineeId, readOnly = false }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [caption, setCaption] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [selectedImageForZoom, setSelectedImageForZoom] = useState<WeeklyEvidenceDTO | null>(null);

  // Fetch photos for this week (traineeId passed only when supervisor is inspecting)
  const { data: evidenceData, isLoading } = useQuery<{ evidence: WeeklyEvidenceDTO[] }>({
    queryKey: ['weeklyEvidence', weekIndex, traineeId],
    queryFn: async () => {
      const url = traineeId
        ? `/evidence?weekIndex=${weekIndex}&traineeId=${traineeId}`
        : `/evidence?weekIndex=${weekIndex}`;
      const res = await api.get(url);
      return res.data;
    }
  });

  const photos = evidenceData?.evidence || [];

  // Add photo mutation
  const addMutation = useMutation({
    mutationFn: async ({ caption, imageData }: { caption: string; imageData: string }) => {
      const res = await api.post('/evidence', {
        weekIndex,
        caption,
        imageData
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyEvidence', weekIndex] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      setIsAdding(false);
      setCaption('');
      setPreviewImage(null);
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'تعذر حفظ الصورة التوثيقية');
    }
  });

  // Delete photo mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/evidence/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyEvidence', weekIndex] });
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      if (selectedImageForZoom) setSelectedImageForZoom(null);
    }
  });

  // Client-side high-res image compression (max 1280px, ~120KB)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('يرجى اختيار ملف صورة صالح (JPEG أو PNG أو WEBP)');
      return;
    }

    setCompressing(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1280;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPreviewImage(compressedDataUrl);
        }
        setCompressing(false);
      };
      img.onerror = () => {
        setErrorMsg('تعذر معالجة ملف الصورة');
        setCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewImage) {
      setErrorMsg('يرجى اختيار صورة أولاً');
      return;
    }
    if (!caption.trim()) {
      setErrorMsg('يرجى كتابة تعليق يوضح محتوى الصورة التوثيقية');
      return;
    }
    addMutation.mutate({ caption: caption.trim(), imageData: previewImage });
  };

  return (
    <div className="bg-card border border-line rounded-2xl p-5 space-y-4 shadow-sm" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent-dim text-accent flex items-center justify-center font-bold shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-ink flex items-center gap-2">
              <span>الصور التوثيقية والأدلة الميدانية</span>
              <span className="text-[11px] font-bold text-sub">({photos.length} من 4 صور)</span>
            </h3>
            <p className="text-[11px] text-sub">
              توثيق لبيئة العمل، المعامل، ومراكز البيانات لتضمينها تلقائياً في تقاريرك وعرض الـ PowerPoint
            </p>
          </div>
        </div>

        {!readOnly && !isAdding && photos.length < 4 && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-1.5 bg-bg hover:bg-line text-ink border border-line rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-accent" />
            <span>إرفاق صورة للأسبوع {weekIndex}</span>
          </button>
        )}
      </div>

      {/* Security & Confidentiality Advisory Badge */}
      <div className="p-3 rounded-xl bg-accent-dim/30 border border-accent/20 text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-ink">
          <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
          <span>ضوابط أمن وسرية المعلومات:</span>
        </div>
        <p className="text-[11px] text-sub leading-relaxed">
          يجب أن تقتصر الصور التوثيقية على البيئة الميدانية العامة (مثل: مراكز البيانات، قاعات التدريب، المعامل، خوادم السيرفرات، كبائن الشبكات، أو شهادات الورش). يُحظر نهائياً إرفاق أي صور تكشف بيانات عملاء، كلمات مرور، أو مستندات سرية للجهة.
        </p>
      </div>

      {/* Add Photo Form Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 bg-bg border border-line rounded-xl space-y-3.5 animate-fade-in text-xs">
          <div className="flex items-center justify-between font-bold text-ink border-b border-line pb-2">
            <span className="flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-accent" />
              <span>إرفاق صورة توثيقية جديدة للأسبوع {weekIndex}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setPreviewImage(null);
                setCaption('');
                setErrorMsg('');
              }}
              className="text-sub hover:text-ink text-[11px]"
            >
              إلغاء
            </button>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-accent-dim text-accent text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Image Selector & Canvas Preview */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {!previewImage ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={compressing}
                className="w-full border-2 border-dashed border-line hover:border-accent rounded-xl p-6 text-center space-y-2 bg-card/60 transition-colors"
              >
                {compressing ? (
                  <div className="flex flex-col items-center gap-2 text-sub">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    <span>جارٍ معالجة وضغط الصورة بدقة عالية...</span>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-sub mx-auto" />
                    <div className="font-bold text-ink">انقر لاختيار صورة من جهازك أو التقاطها بالكاميرا</div>
                    <div className="text-[11px] text-sub">يدعم JPG / PNG (يتم الضغط والتحسين الذاتي للأبعاد فورياً)</div>
                  </>
                )}
              </button>
            ) : (
              <div className="relative border border-line rounded-xl overflow-hidden bg-card p-2 flex flex-col sm:flex-row items-center gap-3">
                <img
                  src={previewImage}
                  alt="معاينة"
                  className="w-32 h-24 object-cover rounded-lg border border-line shrink-0"
                />
                <div className="flex-1 space-y-1 text-right">
                  <div className="font-bold text-ink text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ok" />
                    <span>تم تجهيز الصورة وضغطها بنجاح</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-accent font-bold hover:underline"
                  >
                    تغيير الصورة
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Caption Input */}
          <div className="space-y-1">
            <label className="text-sub font-bold block text-[11px]">
              التعليق والوصف الأكاديمي للصورة:
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="مثال: تفقد خوادم مركز البيانات وتوصيلات كبائن الألياف الضوئية"
              className="w-full p-2.5 bg-card border border-line rounded-xl focus:outline-none focus:border-accent text-xs font-medium"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setPreviewImage(null);
                setCaption('');
              }}
              className="px-3.5 py-1.5 text-sub hover:text-ink font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending || !previewImage}
              className="px-4 py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
            >
              {addMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جارٍ الحفظ...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>حفظ الصورة في الأسبوع {weekIndex}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Photos Gallery */}
      {isLoading ? (
        <div className="text-center py-6 text-sub text-xs">جارٍ تحميل الصور التوثيقية...</div>
      ) : photos.length === 0 && !isAdding ? (
        <div className="p-4 border border-line rounded-xl text-center text-xs text-sub bg-bg/40">
          لم يتم إرفاق صور توثيقية لهذا الأسبوع حتى الآن.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group border border-line rounded-xl overflow-hidden bg-bg/50 hover:border-accent/40 transition-all flex flex-col justify-between"
            >
              <div
                onClick={() => setSelectedImageForZoom(photo)}
                className="cursor-pointer overflow-hidden aspect-video relative bg-ink/5"
              >
                <img
                  src={photo.imageData}
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-ink/70 text-white text-[9px] font-bold">
                  انقر للتكبير
                </span>
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                <p className="text-ink text-[11px] font-bold leading-snug line-clamp-2">
                  {photo.caption}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-line text-[10px] text-sub">
                  <span>الأسبوع {photo.weekIndex}</span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذه الصورة التوثيقية؟')) {
                          deleteMutation.mutate(photo.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-1 text-sub hover:text-accent rounded transition-colors"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {selectedImageForZoom && (
        <div
          className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImageForZoom(null)}
        >
          <div
            className="bg-card border border-line rounded-2xl max-w-2xl w-full p-4 space-y-3 shadow-2xl animate-fade-in text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <span className="text-xs font-bold text-ink">
                صورة توثيقية — الأسبوع {selectedImageForZoom.weekIndex}
              </span>
              <button
                type="button"
                onClick={() => setSelectedImageForZoom(null)}
                className="text-sub hover:text-ink text-xs font-bold px-2 py-1"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-line bg-black/40 flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedImageForZoom.imageData}
                alt={selectedImageForZoom.caption}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>

            <p className="text-xs font-bold text-ink leading-relaxed">
              {selectedImageForZoom.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
