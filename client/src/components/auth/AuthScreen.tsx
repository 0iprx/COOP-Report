import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, AlertCircle, Lock, User, Sparkles } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<'trainee' | 'supervisor'>('trainee');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    if (!isLogin) {
      if (password.length < 8) {
        setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
        return;
      }
      if (password !== confirmPassword) {
        setError('كلمتا المرور غير متطابقتين');
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
      const msg = err.response?.data?.error || 'حدث خطأ في المصادقة، يرجى المحاولة مرة أخرى';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-dim text-accent text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>التدريب التعاوني — Huawei Tech Saudi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">COOP Report</h1>
          <p className="text-sm text-sub mt-1">سجل التوثيق اليومي وإعداد التقارير الأكاديمية الرسمية</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Mode Switcher */}
          <div className="flex border border-line rounded-xl p-1 mb-6 bg-bg">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                isLogin ? 'bg-card text-ink shadow-sm' : 'text-sub hover:text-ink'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !isLogin ? 'bg-card text-ink shadow-sm' : 'text-sub hover:text-ink'
              }`}
            >
              إنشاء حساب جديد
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-accent-dim border border-accent/20 text-accent text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sub">نوع الحساب</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('trainee')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      role === 'trainee'
                        ? 'border-accent bg-accent-dim/30 text-accent'
                        : 'border-line text-sub hover:border-ink'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>متدرب (Trainee)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('supervisor')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      role === 'supervisor'
                        ? 'border-accent bg-accent-dim/30 text-accent'
                        : 'border-line text-sub hover:border-ink'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>مشرف (Supervisor)</span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-sub">اسم المستخدم</label>
              <div className="relative">
                <User className="w-4 h-4 text-sub absolute right-3 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pr-9 pl-3 py-2.5 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim text-ink"
                  placeholder="مثال: ahmed_huawei"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-sub">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-sub absolute right-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-9 pl-3 py-2.5 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim text-ink"
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sub">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-sub absolute right-3 top-3.5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 text-sm bg-bg border border-line rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim text-ink"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>جارٍ المعالجة...</span>
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

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-line text-[11px] text-sub leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-ink mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-ok" />
              <span>معايير الأمان والتشفير</span>
            </div>
            تُشفّر كلمات المرور بخوارزمية bcrypt الصارمة (12 جولة تشفير) مع عزل كامل لسجلات كل مستخدم لضمان خصوصية البيانات الأكاديمية والمهنية.
          </div>
        </div>
      </div>
    </div>
  );
};
