import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck, UserCheck, AlertCircle,
  Lock, User, BookOpen, Sparkles,
  Eye, EyeOff
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin]               = useState<boolean>(true);
  const [username, setUsername]             = useState<string>('');
  const [password, setPassword]             = useState<string>('');
  const [confirmPassword, setConfirmPass]   = useState<string>('');
  const [role, setRole]                     = useState<'trainee' | 'supervisor'>('trainee');
  const [showPw, setShowPw]                 = useState<boolean>(false);
  const [error, setError]                   = useState<string>('');
  const [loading, setLoading]               = useState<boolean>(false);

  const switchMode = (next: boolean) => {
    setIsLogin(next);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPass('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    if (!isLogin) {
      if (password.length < 8) {
        setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل لضمان الأمان');
        return;
      }
      if (password !== confirmPassword) {
        setError('كلمتا المرور غير متطابقتين، يرجى إعادة المحاولة');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login({ username: username.trim(), password });
      } else {
        await register({ username: username.trim(), password, role });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في المصادقة، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-bg">

      {/* ── Left panel (hero, hidden on mobile) ───────────── */}
      <div className="hidden lg:flex lg:w-[44%] bg-ink text-white flex-col justify-between p-10 relative overflow-hidden">

        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-10 dot-grid pointer-events-none" />

        {/* Accent blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-xl tracking-tight">COOP Report</div>
              <div className="text-xs text-white/50 font-medium">Huawei Tech Saudi</div>
            </div>
          </div>

          <h1 className="text-3xl font-black leading-snug mb-5">
            وثّق رحلتك<br />
            التدريبية بدقة<br />
            <span className="text-accent">واحترافية كاملة</span>
          </h1>

          <p className="text-sm text-white/60 leading-relaxed max-w-xs">
            نظام ذكي لإنشاء تقارير التدريب التعاوني الأكاديمية بمعايير تقنية متكاملة — من التسجيل اليومي إلى التقرير النهائي.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3">
          {[
            'تسجيل يومي مع حفظ تلقائي للمسودة',
            'تنقيح أكاديمي بالذكاء الاصطناعي',
            'تصدير DOCX وPDF وHTML مع فهرسة فعلية',
            'نسخ احتياطية مشفرة بـ SHA-256',
            'واجهة عربية وإنجليزية تلقائية'
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-2.5 text-sm text-white/75">
              <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              </div>
              {feat}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 text-[11px] text-white/35">
          &copy; {new Date().getFullYear()} COOP Report System &mdash; Academic Training Documentation
        </div>
      </div>

      {/* ── Right panel (form) ─────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14">

        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div className="font-black text-lg tracking-tight text-ink">COOP Report</div>
        </div>

        <div className="w-full max-w-sm animate-slide-up">

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-black text-ink tracking-tight">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h2>
            <p className="text-sm text-sub mt-1">
              {isLogin
                ? 'أدخل بياناتك للوصول إلى سجل التدريب'
                : 'انضم وابدأ توثيق رحلتك التدريبية'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-xl bg-bg border border-line p-1 mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`flex-1 py-2 rounded-lg transition-all ${
                isLogin ? 'bg-card text-ink shadow-card' : 'text-muted hover:text-ink'
              }`}
            >
              دخول
            </button>
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`flex-1 py-2 rounded-lg transition-all ${
                !isLogin ? 'bg-card text-ink shadow-card' : 'text-muted hover:text-ink'
              }`}
            >
              حساب جديد
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-accent-dim border border-accent/20 text-accent text-xs font-bold flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role selector (register only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sub">نوع الحساب</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'trainee' as const,    label: 'متدرب',  subLabel: 'Trainee',    icon: <UserCheck className="w-4 h-4" />  },
                    { val: 'supervisor' as const, label: 'مشرف',   subLabel: 'Supervisor', icon: <ShieldCheck className="w-4 h-4" /> }
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setRole(r.val)}
                      className={`p-3.5 rounded-xl border-1.5 text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        role === r.val
                          ? 'border-accent bg-accent-dim text-accent shadow-glow'
                          : 'border-line text-sub hover:border-muted hover:text-ink'
                      }`}
                    >
                      {r.icon}
                      <span>{r.label}</span>
                      <span className="font-medium text-[10px] opacity-60">{r.subLabel}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-sub">اسم المستخدم</label>
              <div className="relative">
                <User className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pr-9"
                  placeholder="مثال: ahmed_huawei"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-sub">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-9 pl-10"
                  placeholder="8 أحرف على الأقل"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isLogin && (
                <div className="h-1.5 rounded-full bg-line overflow-hidden mt-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (password.length / 12) * 100)}%`,
                      background: password.length < 8 ? 'var(--accent)' : password.length < 12 ? 'var(--warn)' : 'var(--ok)'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Confirm password */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sub">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className={`input-field pr-9 ${confirmPassword && confirmPassword !== password ? 'border-accent' : confirmPassword && confirmPassword === password ? 'border-ok' : ''}`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-1 text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  جارٍ المعالجة...
                </span>
              ) : isLogin ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>دخول إلى سجل التدريب</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>إنشاء الحساب وبدء التوثيق</span>
                </>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-7 pt-6 border-t border-line text-[11px] text-muted leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-sub mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-ok" />
              <span>معايير الأمان والخصوصية</span>
            </div>
            كلمات المرور مشفرة بـ bcrypt (12 جولة). سجلات كل مستخدم معزولة تماماً مع نسخ احتياطية محمية بـ SHA-256.
          </div>
        </div>
      </div>
    </div>
  );
};
