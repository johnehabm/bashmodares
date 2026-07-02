import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, UserPlus, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    if (form.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    // 🔴 كود فحص رقم الموبايل المصري الصارم
    const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egyptianPhoneRegex.test(form.phone)) {
      setError('برجاء إدخال رقم هاتف مصري صحيح يتكون من 11 رقم (يبدأ بـ 010, 011, 012, أو 015)');
      return;
    }

    setLoading(true);

    const { error: supabaseError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          phone_number: form.phone,
        }
      }
    });

    setLoading(false);

    if (supabaseError) {
      setError('حدث خطأ: ' + supabaseError.message);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-soft">
          <UserPlus className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl font-900 text-ink-900 dark:text-white">
          إنشاء حساب
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          انضم إلى البشمدرس وابدأ رحلتك التعليمية
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">الاسم الكامل</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="اسمك الكامل"
                className="input pr-10"
              />
            </div>
          </div>
          <div>
            <label className="label">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input pr-10"
              />
            </div>
          </div>
          <div>
            <label className="label">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="tel"
                maxLength={11} // 🔴 منع كتابة أكثر من 11 رقم
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} // 🔴 منع الحروف والمسافات
                placeholder="01xxxxxxxxx"
                className="input pr-10"
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <label className="label">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="6 أحرف على الأقل"
                className="input pr-10"
              />
            </div>
          </div>
          <div>
            <label className="label">تأكيد كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="password"
                required
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="••••••••"
                className="input pr-10"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
        لديك حساب بالفعل؟{' '}
        <Link to="/login" className="font-bold text-brand-600 hover:underline dark:text-brand-400">
          سجّل الدخول
        </Link>
      </p>
    </div>
  );
}