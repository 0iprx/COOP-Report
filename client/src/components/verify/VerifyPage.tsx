import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Building, Clock, Award, Calendar, ExternalLink } from 'lucide-react';
import axios from 'axios';

interface VerificationData {
  reportId: number;
  studentNameMasked: string;
  trainingEntity: string;
  department: string;
  trainingWeeks: number;
  courseHours: number;
  status: string;
  supervisorApproved: boolean;
  supervisorRating: string;
  approvedAt: string | null;
  verificationHash: string;
  issuedAt: string;
}

export const VerifyPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VerificationData | null>(null);

  useEffect(() => {
    // Extract reportId and hash from path: /verify/:reportId/:hash
    const path = window.location.pathname.startsWith('/verify/')
      ? window.location.pathname
      : window.location.hash.replace('#', '');
    const parts = path.split('/').filter(Boolean);
    const reportId = parts[1];
    const hash = parts[2];

    if (!reportId || !hash) {
      setError('رابط التحقق غير مكتمل أو غير صالح');
      setLoading(false);
      return;
    }

    axios
      .get(`/api/verify/${reportId}/${hash}`)
      .then((res) => {
        setData(res.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'تعذر التحقق من صحة الوثيقة. قد تكون غير معتمدة أو تم تعديل الرابط.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-tajawal" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">جارٍ التحقق من التوقيع الرقمي للوثيقة الأكاديمية...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-tajawal" dir="rtl">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-white">فشل التحقق الرقمي</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            العودة للرئيسية
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 flex items-center justify-center font-tajawal" dir="rtl">
      <div className="max-w-lg w-full bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Top Gold Badge */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-bold">
            وثيقة تدريب تعاوني معتمدة رسمياً وموثقة رقمياً
          </span>
          <h1 className="text-xl font-black text-white">شهادة اعتماد تقرير التدريب التعاوني</h1>
          <p className="text-xs text-slate-400">
            تم التحقق بنجاح من صحة التوقيع الرقمي الصادر عبر منصة COOP.Report
          </p>
        </div>

        {/* Verification Summary Card */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <span className="text-slate-400">اسم المتدرب (المحمي):</span>
            <span className="text-white font-bold font-mono text-sm">{data.studentNameMasked}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>جهة التدريب:</span>
            </span>
            <span className="text-emerald-300 font-bold">{data.trainingEntity || 'غير محدد'}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <span className="text-slate-400">القسم / الإدارة:</span>
            <span className="text-slate-200 font-medium">{data.department || 'عام'}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>ساعات التدريب المعتمدة:</span>
            </span>
            <span className="text-white font-bold">{data.courseHours} ساعة تدريبية ({data.trainingWeeks} أسابيع)</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              <span>التقييم الإشرافي:</span>
            </span>
            <span className="text-emerald-400 font-black px-2 py-0.5 bg-emerald-500/10 rounded-md">
              {data.supervisorRating || 'ممتاز'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>تاريخ الاعتماد:</span>
            </span>
            <span className="text-slate-300 font-mono text-[11px]">
              {data.approvedAt ? new Date(data.approvedAt).toLocaleDateString('ar-SA') : 'معتمد'}
            </span>
          </div>
        </div>

        {/* Digital Signature Hash */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 space-y-1">
          <span className="text-[10px] text-slate-500 block font-mono">بصمة التوقيع الرقمي (HMAC-SHA256):</span>
          <div className="text-[11px] text-slate-400 font-mono break-all select-all">
            {data.verificationHash}
          </div>
        </div>

        <div className="pt-2 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-bold"
          >
            <span>الانتقال إلى منصة COOP.Report</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
