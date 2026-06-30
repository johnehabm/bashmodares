import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: supabaseError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (supabaseError) {
      setError('بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى.');
      return;
    }

    navigate(email.toLowerCase().includes('admin') ? '/admin' : '/dashboard');
  };

  // 🔴 رسالة الواتساب الجاهزة (تأكد من تغيير الرقم للرقم الفعلي)
  const whatsappMessage = encodeURIComponent("مساء الخير، لقد نسيت كلمة المرور الخاصة بحسابي على المنصة وأحتاج للمساعدة.");
  const whatsappLink = `https://wa.me/201210741671?text=${whatsappMessage}`;

  return (
    // 🌟 دعم كامل للوضع المضيء (bg-ink-50) والداكن (dark:bg-[#0f1123])
    <div className="relative flex min-h-[90vh] flex-col items-center justify-center bg-ink-50 overflow-hidden px-4 py-16 selection:bg-brand-500 selection:text-white transition-colors duration-500 dark:bg-[#0f1123]">

      {/* 🌟 إضاءات متوهجة تتكيف مع الوضعين */}
      <div className="absolute top-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none dark:bg-brand-600/20"></div>
      <div className="absolute bottom-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-[#f01c6d]/10 blur-[100px] pointer-events-none dark:bg-[#f01c6d]/20"></div>

      <div className="relative z-10 w-full max-w-md">

        {/* رأس الصفحة */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-ink-200 bg-white text-brand-600 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-brand-400 dark:shadow-[0_0_30px_-5px_rgba(37,99,235,0.3)]">
            <LogIn className="h-8 w-8" />
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink-900 dark:text-white">
            مرحباً بعودتك!
          </h1>
          <p className="mt-3 text-ink-600 dark:text-ink-300">
            سجّل دخولك لمتابعة رحلتك نحو التفوق <Sparkles className="inline h-4 w-4 text-gold-500 dark:text-gold-400" />
          </p>
        </div>

        {/* 🌟 كارت الفورمة الزجاجي (متوافق مع الوضعين) */}
        <div className="rounded-[2rem] border border-ink-200 bg-white/70 p-8 shadow-xl backdrop-blur-xl sm:p-10 dark:border-white/10 dark:bg-white/5 dark:shadow-2xl">

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 backdrop-blur-md dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* حقل الإيميل */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-ink-700 dark:text-ink-300">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-4 pr-12 text-ink-900 placeholder-ink-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder-ink-600"
                  dir="ltr"
                />
              </div>
            </div>

            {/* حقل الباسورد */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-ink-700 dark:text-ink-300">كلمة المرور</label>
                {/* 🔴 زرار نسيت كلمة المرور اللي بيحول للواتساب */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                >
                  نسيت كلمة المرور؟
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-4 pr-12 text-ink-900 placeholder-ink-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder-ink-600"
                  dir="ltr"
                />
              </div>
            </div>

            {/* زرار الدخول */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-brand-600 py-4 text-lg font-bold text-white transition-all hover:bg-brand-500 hover:shadow-[0_0_30px_-5px_#3b82f6] disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  جارٍ الدخول...
                </span>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>
        </div>

        {/* رابط إنشاء الحساب */}
        <p className="mt-8 text-center text-sm font-medium text-ink-500 dark:text-ink-400">
          ليس لديك حساب بعد؟{' '}
          <Link
            to="/register"
            className="font-bold text-brand-600 transition-colors hover:text-brand-700 hover:underline underline-offset-4 dark:text-brand-400 dark:hover:text-brand-300"
          >
            أنشئ حساباً جديداً
          </Link>
        </p>

      </div>
    </div>
  );
}