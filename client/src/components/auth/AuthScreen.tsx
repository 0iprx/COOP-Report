import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck, UserCheck, AlertCircle,
  Lock, User, BookOpen, Sparkles,
  Eye, EyeOff, CheckCircle2, KeyRound,
  Copy, Check
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin]             = useState<boolean>(true);
  const [username, setUsername]           = useState<string>('');
  const [password, setPassword]           = useState<string>('');
  const [confirmPassword, setConfirmPass] = useState<string>('');
  const [role, setRole]                   = useState<'trainee' | 'supervisor'>('trainee');
  const [showPw, setShowPw]               = useState<boolean>(false);
  const [copied, setCopied]               = useState<boolean>(false);
  const [genToast, setGenToast]           = useState<boolean>(false);
  const [error, setError]                 = useState<string>('');
  const [loading, setLoading]             = useState<boolean>(false);

  const switchMode = (next: boolean) => {
    setIsLogin(next);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPass('');
    setGenToast(false);
  };

  // Generate strong, cryptographic password
  const generateStrongPassword = () => {
    const charsLower = 'abcdefghijkmnpqrstuvwxyz';
    const charsUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    const symbols = '!@#$%^&*-_+=';
    const all = charsLower + charsUpper + numbers + symbols;

    let pwd = '';
    pwd += charsLower[Math.floor(Math.random() * charsLower.length)];
    pwd += charsUpper[Math.floor(Math.random() * charsUpper.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += symbols[Math.floor(Math.random() * symbols.length)];

    const length = 14;
    const array = new Uint32Array(length - 4);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
      for (let i = 0; i < array.length; i++) {
        pwd += all[array[i] % all.length];
      }
    } else {
      for (let i = 4; i < length; i++) {
        pwd += all[Math.floor(Math.random() * all.length)];
      }
    }

    const shuffled = pwd.split('').sort(() => 0.5 - Math.random()).join('');
    setPassword(shuffled);
    setConfirmPass(shuffled);
    setShowPw(true);
    setCopied(false);
    setGenToast(true);
    setTimeout(() => setGenToast(false), 5000);
  };

  const copyPasswordToClipboard = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API unavailable
      const textArea = document.createElement('textarea');
      textArea.value = password;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
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
        setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل لضمان أمان حسابك');
        return;
      }
      if (password !== confirmPassword) {
        setError('كلمتا المرور غير متطابقتين، يرجى إعادة التحقق');
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

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, text: '', color: 'bg-line' };
    if (password.length < 8) return { score: 33, text: 'قصيرة (أقل من 8 أحرف)', color: 'bg-accent' };
    if (password.length < 12) return { score: 66, text: 'جيدة', color: 'bg-warn' };
    return { score: 100, text: 'قوية ومحمية بنجاح', color: 'bg-ok' };
  };

  const pwStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-bg">
      <div className="w-full max-w-md animate-slide-up">

        {/* ── Brand Header ─────────────────────────────────── */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent text-white shadow-md mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-ink tracking-tight">COOP Report</h1>
          <p className="text-xs text-sub mt-1 font-medium">سجل التدريب التعاوني الأكاديمي والتوثيق اليومي</p>
        </div>

        {/* ── Main Form Card ──────────────────────────────── */}
        <div className="bg-card border border-line rounded-3xl p-6 sm:p-8 shadow-lifted">

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-bg p-1 border border-line mb-6 select-none">
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isLogin
                  ? 'bg-card text-ink shadow-card'
                  : 'text-sub hover:text-ink'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !isLogin
                  ? 'bg-card text-ink shadow-card'
                  : 'text-sub hover:text-ink'
              }`}
            >
              إنشاء حساب جديد
            </button>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h2 className="text-lg font-extrabold text-ink">
              {isLogin ? 'أهلاً بك مجدداً' : 'انضم وابدأ رحلتك التدريبية'}
            </h2>
            <p className="text-xs text-sub mt-0.5">
              {isLogin
                ? 'أدخل اسم المستخدم وكلمة المرور للمتابعة'
                : 'أنشئ حسابك لحفظ إنجازاتك اليومية وتوليد التقارير'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-accent-dim border border-accent/30 text-accent text-xs font-bold flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Generated Password Notification */}
          {genToast && (
            <div className="mb-4 p-3 rounded-xl bg-ok-bg border border-ok/30 text-ok text-xs font-bold flex items-center justify-between gap-2 animate-fade-in shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>تم توليد كلمة مرور قوية وتعبئة التأكيد تلقائياً!</span>
              </div>
              <button
                type="button"
                onClick={copyPasswordToClipboard}
                className="px-2.5 py-1 bg-white border border-ok/30 rounded-lg text-[11px] font-extrabold text-ok hover:bg-ok-bg transition-colors flex items-center gap-1 shadow-sm shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role Selection (Register only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sub">نوع الحساب الأكاديمي</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole('trainee')}
                    className={`p-3.5 rounded-2xl border transition-all text-right flex flex-col justify-between ${
                      role === 'trainee'
                        ? 'border-accent bg-accent/5 ring-1 ring-accent text-ink shadow-sm'
                        : 'border-line bg-bg/40 text-sub hover:border-muted hover:bg-bg'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        role === 'trainee' ? 'bg-accent text-white' : 'bg-line text-sub'
                      }`}>
                        <UserCheck className="w-4 h-4" />
                      </div>
                      {role === 'trainee' && (
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black text-ink">متدرب تعاوني</div>
                      <div className="text-[10px] text-muted">Trainee</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('supervisor')}
                    className={`p-3.5 rounded-2xl border transition-all text-right flex flex-col justify-between ${
                      role === 'supervisor'
                        ? 'border-accent bg-accent/5 ring-1 ring-accent text-ink shadow-sm'
                        : 'border-line bg-bg/40 text-sub hover:border-muted hover:bg-bg'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        role === 'supervisor' ? 'bg-accent text-white' : 'bg-line text-sub'
                      }`}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      {role === 'supervisor' && (
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black text-ink">مشرف تدريبي</div>
                      <div className="text-[10px] text-muted">Supervisor</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Username Input Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-sub">اسم المستخدم</label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-line bg-bg focus-within:border-accent focus-within:bg-card focus-within:ring-2 focus-within:ring-accent-dim transition-all">
                <User className="w-4 h-4 text-muted shrink-0" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: abdullah_coop"
                  className="flex-1 bg-transparent border-0 outline-none text-sm text-ink p-0 placeholder:text-muted"
                  autoComplete="username"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sub">كلمة المرور</label>
                {!isLogin && (
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-[11px] font-extrabold text-accent hover:text-accent-mid flex items-center gap-1 transition-colors py-0.5 px-2 rounded-lg bg-accent/5 hover:bg-accent/10 border border-accent/20"
                    title="توليد كلمة مرور عشوائية قوية وتعبئة حقل التأكيد تلقائياً"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>توليد كلمة مرور قوية</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-line bg-bg focus-within:border-accent focus-within:bg-card focus-within:ring-2 focus-within:ring-accent-dim transition-all">
                <Lock className="w-4 h-4 text-muted shrink-0" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 أحرف على الأقل"
                  className="flex-1 bg-transparent border-0 outline-none text-sm text-ink p-0 placeholder:text-muted"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  dir="ltr"
                  required
                />

                {/* Quick Copy Action if Password is typed */}
                {password && (
                  <button
                    type="button"
                    onClick={copyPasswordToClipboard}
                    className="p-1 text-muted hover:text-ink transition-colors shrink-0"
                    title={copied ? 'تم النسخ!' : 'نسخ كلمة المرور'}
                  >
                    {copied ? <Check className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}

                {/* Show/Hide Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="p-1 text-muted hover:text-ink transition-colors shrink-0"
                  title={showPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator (Register only) */}
              {!isLogin && password && (
                <div className="pt-1 animate-fade-in space-y-1">
                  <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pwStrength.color} transition-all duration-300 rounded-full`}
                      style={{ width: `${pwStrength.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted">
                    <span>مستوى الأمان:</span>
                    <span className="font-bold">{pwStrength.text}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field (Register only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sub">تأكيد كلمة المرور</label>
                <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border bg-bg focus-within:bg-card focus-within:ring-2 focus-within:ring-accent-dim transition-all ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-accent ring-1 ring-accent/30'
                    : confirmPassword && confirmPassword === password
                      ? 'border-ok ring-1 ring-ok/30'
                      : 'border-line focus-within:border-accent'
                }`}>
                  <Lock className="w-4 h-4 text-muted shrink-0" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور"
                    className="flex-1 bg-transparent border-0 outline-none text-sm text-ink p-0 placeholder:text-muted"
                    autoComplete="new-password"
                    dir="ltr"
                    required
                  />
                  {confirmPassword && confirmPassword === password && (
                    <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-accent hover:bg-accent-mid disabled:opacity-50 text-white font-extrabold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.99] text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>جارٍ المعالجة...</span>
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

          {/* Security & Privacy Footer */}
          <div className="mt-6 pt-5 border-t border-line text-[11px] text-muted flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-ok shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              كلمات المرور مشفرة بخوارزمية <strong className="text-sub">bcrypt</strong> بـ 12 جولة حماية. السجلات معزولة تماماً مع نسخ احتياطي رقمي بـ SHA-256.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
