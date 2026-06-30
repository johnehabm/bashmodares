import { Link } from 'react-router-dom';
import { Phone, Mail, GraduationCap, Heart, MapPin, ChevronLeft } from 'lucide-react';
import { Logo } from './Logo';
import { PAYMENT_NUMBER, INSTRUCTOR_NAME } from '../data/mockData';

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-ink-200/60 bg-white pt-16 dark:border-white/5 dark:bg-[#0f1123]">

      {/* 🌟 إضاءات خلفية خفيفة (Glow Effects) */}
      <div className="absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/10 blur-[120px] pointer-events-none dark:bg-brand-600/20"></div>
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/3 translate-y-1/3 rounded-full bg-gold-500/10 blur-[100px] pointer-events-none dark:bg-[#f01c6d]/15"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8">
        <div className="grid gap-12 md:grid-cols-12">

          {/* القسم الأول: اللوجو والوصف والسوشيال ميديا */}
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-600 dark:text-ink-400">
              منصة تعليمية متطورة، تعتمد على أحدث أساليب الشرح التفاعلي والتقييم المستمر لضمان التفوق وتأسيس جيل قادر على المنافسة.
            </p>

            {/* 🔴 أزرار السوشيال ميديا للمستر */}
            <div className="mt-8 flex items-center gap-4">
              <a
                href="https://wa.me/201210741671" // 🔴 رابط واتساب المستر
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 bg-ink-50 text-[#25D366] transition-all hover:-translate-y-1 hover:border-[#25D366]/50 hover:bg-[#25D366]/10 hover:shadow-[0_0_20px_-5px_#25D366] dark:border-white/5 dark:bg-white/5"
                title="واتساب"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.591 5.52 0 10.002-4.48 10.002-10.001 0-5.52-4.482-10.002-10.002-10.002-5.521 0-10.002 4.482-10.002 10.002 0 1.868.502 3.551 1.487 5.166l-.995 3.636 3.738-.988z" /></svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=100064737780173&rdid=yjIMMg8Sotizxg9D&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18iSz2bCpN%2F#" // 🔴 رابط فيسبوك المستر
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 bg-ink-50 text-[#1877F2] transition-all hover:-translate-y-1 hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 hover:shadow-[0_0_20px_-5px_#1877F2] dark:border-white/5 dark:bg-white/5"
                title="فيسبوك"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
              </a>
              <a
                href="https://www.youtube.com/@%D8%A7%D9%84%D8%A8%D8%B4%D9%85%D8%AF%D8%B1%D8%B3" // 🔴 رابط يوتيوب المستر
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 bg-ink-50 text-[#FF0000] transition-all hover:-translate-y-1 hover:border-[#FF0000]/50 hover:bg-[#FF0000]/10 hover:shadow-[0_0_20px_-5px_#FF0000] dark:border-white/5 dark:bg-white/5"
                title="يوتيوب"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
          </div>

          {/* القسم الثاني: روابط سريعة */}
          <div className="md:col-span-3">
            <h3 className="mb-6 text-lg font-black text-ink-900 dark:text-white relative inline-block">
              روابط سريعة
              <span className="absolute -bottom-2 right-0 h-1 w-1/2 rounded-full bg-brand-500"></span>
            </h3>
            <ul className="space-y-4 text-sm font-bold">
              {[
                { name: 'الرئيسية', to: '/' },
                { name: 'الكورسات المتاحة', to: '/courses' },
                { name: 'إنشاء حساب جديد', to: '/register' },
                { name: 'تسجيل الدخول', to: '/login' }
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-2 text-ink-600 transition-colors hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-400"
                  >
                    <ChevronLeft className="h-4 w-4 text-brand-500/0 transition-all group-hover:text-brand-500" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* القسم الثالث: تواصل معنا */}
          <div className="md:col-span-4">
            <h3 className="mb-6 text-lg font-black text-ink-900 dark:text-white relative inline-block">
              معلومات التواصل
              <span className="absolute -bottom-2 right-0 h-1 w-1/2 rounded-full bg-gold-500"></span>
            </h3>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-4 text-ink-600 dark:text-ink-300">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">رقم الهاتف</p>
                  <p className="mt-1 font-display tracking-wider" dir="ltr">{PAYMENT_NUMBER}</p>
                </div>
              </li>
              <li className="flex items-start gap-4 text-ink-600 dark:text-ink-300">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">البريد الإلكتروني</p>
                  <p className="mt-1 tracking-wider" dir="ltr">info@bashmodares.com</p>
                </div>
              </li>
              <li className="flex items-start gap-4 text-ink-600 dark:text-ink-300">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">المحاضر</p>
                  <p className="mt-1 tracking-wider">{INSTRUCTOR_NAME}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* الشريط السفلي (حقوق النشر واسم المصمم) */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-ink-200/60 pt-8 sm:flex-row dark:border-white/10">
          <p className="text-sm font-bold text-ink-500 dark:text-ink-400">
            © {new Date().getFullYear()} البشمدرس — جميع الحقوق محفوظة.
          </p>

          {/* 🔴 زرار المطور (John Ehab) المربوط بالانستجرام */}
          <div className="group flex items-center gap-2 rounded-2xl border border-ink-200 bg-white/50 px-5 py-2.5 shadow-sm backdrop-blur-md transition-all hover:border-brand-200 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10">
            <span className="text-xs font-bold text-ink-500 dark:text-ink-400">
              made by
            </span>
            <a
              href="https://instagram.com/j.o.h.n_e.h.a.b" // 🔴 حط رابط حسابك في انستجرام هنا بدل johnehab
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-l from-brand-600 to-gold-500 bg-clip-text text-sm font-black tracking-wider text-transparent transition-all hover:opacity-80 dark:from-brand-400 dark:to-gold-400"
              title="زيارة حساب المصمم"
            >
              JOHN EHAB
            </a>
            <Heart className="h-4 w-4 animate-pulse fill-red-500 text-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}