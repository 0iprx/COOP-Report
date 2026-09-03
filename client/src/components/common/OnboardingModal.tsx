import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Bookmark, Check, Calendar, Clock, Building2, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHours?: number;
  initialWeeks?: number;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  initialHours = 280,
  initialWeeks = 14
}) => {
  const queryClient = useQueryClient();
  const [entityAddress, setEntityAddress] = useState<string>('');
  const [courseHours, setCourseHours] = useState<number>(initialHours);
  const [trainingWeeks, setTrainingWeeks] = useState<number>(initialWeeks);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [errorMsg, setErrorMsg] = useState<string>('');

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/profile', {
        entityAddress: entityAddress.trim(),
        courseHours,
        trainingWeeks,
        startDate
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finalReport'] });
      queryClient.invalidateQueries({ queryKey: ['weekly'] });
      sessionStorage.setItem('coop_onboarding_completed', 'true');
      onClose();
    },
    onError: () => {
      setErrorMsg('تعذر حفظ الخطة التدريبية، يرجى المحاولة مرة أخرى');
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityAddress.trim()) {
      setErrorMsg('يرجى إدخال اسم جهة التدريب');
      return;
    }
    setErrorMsg('');
    saveMutation.mutate();
  };

  const handleDismiss = () => {
    sessionStorage.setItem('coop_onboarding_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in no-print" dir="rtl">
      <div className="bg-card border border-line rounded-2xl p-6 sm:p-7 shadow-2xl max-w-lg w-full space-y-5">
        <div className="flex items-start justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent-dim text-accent flex items-center justify-center font-bold shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-ink">مرحباً بك في سجل التدريب التعاوني</h3>
              <p className="text-xs text-sub">لنبدأ بإعداد خطتك الأكاديمية (يمكنك تعديلها بأي وقت)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-sub hover:text-ink rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-accent-dim text-accent text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          <div className="space-y-1.5">
            <label className="text-sub flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-accent" />
              <span>جهة التدريب (الشركة / الهيئة / الوزارة):</span>
            </label>
            <input
              type="text"
              value={entityAddress}
              onChange={(e) => setEntityAddress(e.target.value)}
              placeholder="مثال: شركة أرامكو السعودية / هيئة الاتصالات / بنك الراجحي"
              className="w-full p-2.5 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-xs font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sub flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-ok" />
                <span>ساعات المقرر المطلوبة (ساعة):</span>
              </label>
              <input
                type="number"
                min="10"
                max="2000"
                value={courseHours}
                onChange={(e) => setCourseHours(parseInt(e.target.value) || 280)}
                className="w-full p-2.5 bg-bg border border-ok/30 rounded-xl focus:outline-none focus:border-ok text-xs font-black text-ok"
              />
              <div className="flex gap-1 pt-1">
                {[280, 350, 400].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setCourseHours(hrs)}
                    className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                      courseHours === hrs ? 'bg-ok text-white border-ok' : 'bg-bg text-sub border-line hover:border-ok'
                    }`}
                  >
                    {hrs} س
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sub flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <span>عدد أسابيع الخطة:</span>
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={trainingWeeks}
                onChange={(e) => setTrainingWeeks(parseInt(e.target.value) || 14)}
                className="w-full p-2.5 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-xs font-extrabold"
              />
              <div className="flex gap-1 pt-1">
                {[10, 12, 14, 16].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setTrainingWeeks(w)}
                    className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                      trainingWeeks === w ? 'bg-accent text-white border-accent' : 'bg-bg text-sub border-line hover:border-accent'
                    }`}
                  >
                    {w} أسبوع
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sub flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sub" />
              <span>تاريخ بدء التدريب التعاوني:</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2.5 bg-bg border border-line rounded-xl focus:outline-none focus:border-accent text-xs font-medium"
            />
          </div>

          <div className="pt-3 border-t border-line flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-4 py-2 text-xs font-bold text-sub hover:text-ink rounded-xl bg-bg border border-line transition-colors"
            >
              تخطي والضبط لاحقاً
            </button>

            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-5 py-2 text-xs font-bold text-white bg-accent hover:bg-accent/90 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saveMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ وبدء التوثيق'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
