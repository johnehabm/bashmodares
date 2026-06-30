import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, LayoutDashboard, Shield, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { user, logout, announcements } = useApp(); // 🔴 استدعاء الإشعارات
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 🔴 حالات قائمة الإشعارات
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';
  const activeAnnouncements = announcements.filter((a) => a.active); // فلترة المفعل فقط

  // تتبع حالة النزول بالصفحة لإضافة تأثيرات بصرية
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🔴 إغلاق قائمة الإشعارات عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'الرئيسية', to: '/' },
    { label: 'الكورسات', to: '/courses' },
    { label: 'كيف يعمل؟', to: '/#how-it-works' },
    { label: 'تواصل معنا', to: '/#contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path.includes('#')) {
      return location.hash === path.substring(path.indexOf('#'));
    }
    return location.pathname === path && !location.hash;
  };

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-7xl px-4 transition-all duration-300">

      <div
        className={`flex items-center justify-between gap-4 rounded-[2rem] border transition-all duration-500 ${scrolled
            ? 'border-ink-200/50 bg-white/70 py-2.5 pl-3 pr-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/70 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]'
            : 'border-white/20 bg-white/40 py-3 pl-4 pr-6 shadow-sm backdrop-blur-lg dark:border-white/5 dark:bg-ink-900/30'
          }`}
      >
        <Link to="/" className="shrink-0 transition-transform hover:scale-105">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.to);
            const baseClass = `relative rounded-2xl px-4 py-2 text-sm font-bold transition-all duration-300 overflow-hidden group`;
            const activeClass = active
              ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10'
              : 'text-ink-700 hover:text-brand-600 dark:text-ink-200 dark:hover:text-brand-400 hover:bg-ink-100/50 dark:hover:bg-white/5';

            return link.to.includes('#') ? (
              <a key={link.to} href={link.to} className={`${baseClass} ${activeClass}`}>
                <span className="relative z-10">{link.label}</span>
              </a>
            ) : (
              <Link key={link.to} to={link.to} className={`${baseClass} ${activeClass}`}>
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* 🔴 أيقونة الجرس والقائمة المنسدلة (تظهر فقط للمسجلين) */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-600 transition-colors hover:bg-ink-200 dark:bg-white/5 dark:text-ink-300 dark:hover:bg-white/10"
                aria-label="الإشعارات"
              >
                <Bell className="h-5 w-5" />
                {activeAnnouncements.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white dark:ring-[#0f1123]">
                    {activeAnnouncements.length}
                  </span>
                )}
              </button>

              {/* 🔴 تصميم قائمة الإشعارات الزجاجية */}
              {showNotifications && (
                <div className="absolute left-0 top-14 w-[320px] origin-top-left rounded-[2rem] border border-ink-200/50 bg-white/95 p-5 shadow-2xl backdrop-blur-xl transition-all dark:border-white/10 dark:bg-ink-950/95 sm:w-[380px]">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-black text-ink-900 dark:text-white">الإشعارات</h3>
                    <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                      {activeAnnouncements.length} جديد
                    </span>
                  </div>

                  <div className="flex max-h-[350px] flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
                    {activeAnnouncements.length > 0 ? (
                      activeAnnouncements.map((ann) => (
                        <div key={ann.id} className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4 transition-colors hover:border-brand-200 dark:border-white/5 dark:bg-white/5 dark:hover:border-brand-500/30">
                          <p className="text-sm font-bold leading-relaxed text-ink-800 dark:text-ink-100">
                            {ann.text}
                          </p>
                          <span className="mt-2 block text-xs font-medium text-ink-400">
                            {new Date(ann.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-ink-400">
                        <Bell className="mb-3 h-10 w-10 opacity-20" />
                        <p className="text-sm font-bold">لا توجد إشعارات حالياً</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="hidden h-6 w-px bg-ink-200 dark:bg-white/10 sm:block"></div>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="flex items-center gap-2 rounded-2xl bg-brand-50 px-5 py-2 text-sm font-bold text-brand-700 transition-all hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
              >
                {isAdmin ? <Shield className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                {isAdmin ? 'الإدارة' : 'لوحتي'}
              </Link>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-ink-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                aria-label="تسجيل الخروج"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-2xl px-5 py-2.5 text-sm font-bold text-ink-700 transition-all hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-white/5"
              >
                دخول
              </Link>
              <Link
                to="/register"
                className="rounded-2xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-brand-500/50"
              >
                حساب جديد
              </Link>
            </div>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-ink-700 transition-all hover:bg-ink-100 lg:hidden dark:text-ink-200 dark:hover:bg-white/5"
            aria-label="القائمة"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute left-4 right-4 top-20 z-40 rounded-[2rem] border border-ink-200/50 bg-white/95 p-5 shadow-2xl backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-ink-950/95">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              const activeClass = active
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/5';

              return link.to.includes('#') ? (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-5 py-3 text-sm font-bold transition-all ${activeClass}`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-5 py-3 text-sm font-bold transition-all ${activeClass}`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="my-2 h-px bg-ink-200 dark:bg-white/10" />

            {user ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-brand-50 px-5 py-3 text-sm font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                >
                  {isAdmin ? <Shield className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                  {isAdmin ? 'لوحة التحكم' : 'لوحتي'}
                </Link>
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 w-full">
                  <LogOut className="h-4 w-4" /> تسجيل الخروج
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-2xl border border-ink-200 px-5 py-3 text-sm font-bold text-ink-700 dark:border-white/10 dark:text-ink-200">
                  <UserIcon className="h-4 w-4" /> دخول
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-2xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/30">
                  إنشاء حساب
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}