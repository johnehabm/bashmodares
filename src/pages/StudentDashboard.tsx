import { useState, useEffect, useRef, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Lock,
  TrendingUp,
  GraduationCap,
  ArrowLeft,
  BookMarked,
  Award,
  Sparkles,
  PlayCircle,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { EmptyState, StatusBadge } from '../components/ui';
import { Certificate } from '../components/Certificate';

// --- مكون الأنيميشن عند التمرير (Scroll Reveal) ---
function Reveal({ children, delay = 0, className = "" }: { children: ReactNode, delay?: number, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1, rootMargin: '50px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// --- مكون العداد التفاعلي (Animated Counter) ---
function AnimatedCounter({ end, duration = 1500 }: { end: number, duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          setCount(Math.floor(progress * end));
          if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <span ref={ref}>{count}</span>;
}

export function StudentDashboard() {
  const { user, courses, enrollments, progress, isLessonComplete, removeRejectedEnrollment } = useApp();
  const [certificateData, setCertificateData] = useState<{ courseTitle: string } | null>(null);

  if (!user) return null;

  // 🔴 السطر السحري لاستبعاد الكورسات المخفية من الترشيحات
  const visibleCourses = courses.filter((c: any) => c.isPublished !== false);

  const myEnrollments = enrollments.filter((e) => e.studentId === user.id);
  const approvedEnrollments = myEnrollments.filter((e) => e.status === 'approved');
  const pendingEnrollments = myEnrollments.filter((e) => e.status === 'pending');

  const getProgress = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course || course.lessons.length === 0) return 0;
    const done = course.lessons.filter((l) => isLessonComplete(l.id)).length;
    return Math.round((done / course.lessons.length) * 100);
  };

  const totalCompleted = progress.filter((p) => p.userId === user.id && p.completed).length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-50 pb-20 pt-8 transition-colors duration-500 dark:bg-[#0f1123]">

      {/* 🌟 إضاءات سينمائية في الخلفية */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-brand-500/10 blur-[150px] transition-colors duration-700 dark:bg-brand-600/15"></div>
      <div className="pointer-events-none absolute left-0 top-1/3 h-[500px] w-[500px] rounded-full bg-[#f01c6d]/5 blur-[120px] transition-colors duration-700 dark:bg-[#f01c6d]/10"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4">

        {/* 🌟 الترحيب (Welcome Header) */}
        <div className="mb-10 flex flex-col gap-2">
          <Reveal delay={100}>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-ink-200 bg-white/50 px-4 py-1.5 text-sm font-bold text-ink-600 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-white/5 dark:text-ink-300">
              <Sparkles className="h-4 w-4 text-gold-500" />
              مرحباً بعودتك يا بطل
            </div>
          </Reveal>
          <Reveal delay={200}>
            <h1 className="font-display text-4xl font-black text-ink-900 transition-colors dark:text-white md:text-5xl">
              أهلاً، <span className="bg-gradient-to-l from-brand-600 to-brand-400 bg-clip-text text-transparent dark:from-white dark:to-ink-300">{user.name}</span>
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-1 text-lg text-ink-500 transition-colors dark:text-ink-400">
              جاهز تكمل رحلة التفوق النهاردة؟
            </p>
          </Reveal>
        </div>

        {/* 🌟 الإحصائيات (Stats Glass Cards) */}
        <div className="mb-12 grid gap-5 sm:grid-cols-3">
          {[
            { title: 'كورسات نشطة', value: approvedEnrollments.length, icon: BookMarked, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-500/10', glow: 'hover:shadow-brand-500/30 dark:hover:shadow-brand-500/20' },
            { title: 'قيد المراجعة', value: pendingEnrollments.length, icon: Clock, color: 'text-gold-600 dark:text-gold-400', bg: 'bg-gold-50 dark:bg-gold-500/10', glow: 'hover:shadow-gold-500/30 dark:hover:shadow-gold-500/20' },
            { title: 'دروس مكتملة', value: totalCompleted, icon: CheckCircle2, color: 'text-[#f01c6d]', bg: 'bg-[#f01c6d]/10 dark:bg-[#f01c6d]/20', glow: 'hover:shadow-[#f01c6d]/30 dark:hover:shadow-[#f01c6d]/20' }
          ].map((stat, idx) => (
            <Reveal key={idx} delay={(idx + 1) * 150}>
              <div className={`group relative overflow-hidden rounded-[2rem] border border-ink-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10 ${stat.glow}`}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${stat.bg} ${stat.color}`}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-ink-900 transition-colors dark:text-white">
                      <AnimatedCounter end={stat.value} />
                    </p>
                    <p className="mt-1 text-sm font-bold text-ink-500 transition-colors dark:text-ink-400">{stat.title}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* 🌟 كورساتي (My Courses) */}
        <div className="mb-16">
          <Reveal delay={200}>
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-black text-ink-900 transition-colors dark:text-white">
              <GraduationCap className="h-7 w-7 text-brand-600 dark:text-brand-400" />
              كورساتي الحالية
            </h2>
          </Reveal>

          {myEnrollments.length === 0 ? (
            <Reveal delay={300}>
              <div className="rounded-[2rem] border border-ink-200 bg-white/70 p-10 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/5">
                <EmptyState
                  icon={<BookOpen className="h-10 w-10" />}
                  title="لم تسجل في أي كورس بعد"
                  description="ابدأ رحلتك الآن، تصفح الكورسات المتاحة وسجل في الكورس المناسب لك."
                  action={
                    <Link to="/courses" className="btn-primary mt-4">
                      تصفح الكورسات
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  }
                />
              </div>
            </Reveal>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myEnrollments.map((enr, idx) => {
                const course = courses.find((c) => c.id === enr.courseId);
                if (!course) return null;
                const prog = getProgress(course.id);
                return (
                  <Reveal key={enr.id} delay={idx * 150}>
                    <div className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-ink-200 bg-white/70 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:shadow-brand-500/10">

                      {/* Course Image */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute right-4 top-4">
                          <StatusBadge status={enr.status} />
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="line-clamp-2 text-lg font-black text-white drop-shadow-md">
                            {course.title}
                          </h3>
                          <p className="mt-1 text-sm font-bold text-white/80">{course.grade}</p>
                        </div>
                      </div>

                      {/* Course Content & Actions */}
                      <div className="flex flex-1 flex-col p-6">
                        {enr.status === 'approved' ? (
                          <div className="flex flex-1 flex-col justify-between">
                            <div className="mb-6">
                              <div className="mb-2 flex items-center justify-between text-sm font-bold">
                                <span className="text-ink-600 transition-colors dark:text-ink-300">نسبة الإنجاز</span>
                                <span className="text-brand-600 transition-colors dark:text-brand-400">
                                  <AnimatedCounter end={prog} />%
                                </span>
                              </div>
                              <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100 transition-colors dark:bg-ink-900/50">
                                <div
                                  className="h-full rounded-full bg-gradient-to-l from-brand-500 to-brand-400 transition-all duration-1000 ease-out dark:from-brand-600 dark:to-brand-400"
                                  style={{ width: `${prog}%` }}
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Link
                                to={`/courses/${course.id}`}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-500 hover:shadow-[0_0_20px_-5px_#3b82f6] active:scale-[0.98]"
                              >
                                <PlayCircle className="h-4 w-4" />
                                متابعة التعلم
                              </Link>

                              {prog === 100 && (
                                <button
                                  onClick={() => setCertificateData({ courseTitle: course.title })}
                                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold-500/50 bg-gradient-to-r from-gold-500/10 to-gold-600/10 py-3.5 text-sm font-bold text-gold-600 transition-all hover:bg-gold-500/20 active:scale-[0.98] dark:text-gold-400"
                                >
                                  <Award className="h-4 w-4" />
                                  استلام الشهادة
                                </button>
                              )}
                            </div>
                          </div>
                        ) : enr.status === 'pending' ? (
                          <div className="flex h-full items-center justify-center rounded-xl bg-gold-50 px-4 py-6 text-center text-sm font-bold text-gold-700 transition-colors dark:bg-gold-500/10 dark:text-gold-400">
                            <div>
                              <Clock className="mx-auto mb-2 h-6 w-6 animate-pulse opacity-80" />
                              في انتظار موافقة الإدارة لتفعيل الكورس
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center rounded-xl bg-red-50 px-4 py-5 text-center text-sm font-bold text-red-700 transition-colors dark:bg-red-500/10 dark:text-red-400">
                            <Lock className="mb-2 h-6 w-6 opacity-80" />
                            <span className="mb-1">تم رفض الإيصال من الإدارة</span>
                            <span className="mb-4 text-xs font-medium opacity-80">يرجى التأكد من البيانات والمحاولة مرة أخرى</span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الطلب المرفوض لإعادة التسجيل؟')) {
                                  removeRejectedEnrollment(enr.id);
                                }
                              }}
                              className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md active:scale-95 dark:bg-red-500/80 dark:hover:bg-red-500"
                            >
                              <RotateCcw className="h-4 w-4" />
                              إعادة التسجيل
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>

        {/* 🌟 اقتراحات كورسات (Browse more) */}
        <div>
          <Reveal delay={200}>
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-black text-ink-900 transition-colors dark:text-white">
              <TrendingUp className="h-7 w-7 text-[#f01c6d]" />
              كورسات قد تهمك
            </h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleCourses /* 🔴 استخدام الكورسات المرئية فقط هنا */
              .filter((c) => !myEnrollments.some((e) => e.courseId === c.id))
              .slice(0, 4)
              .map((course, idx) => (
                <Reveal key={course.id} delay={idx * 150}>
                  <Link
                    to={`/courses/${course.id}`}
                    className="group relative block overflow-hidden rounded-[2rem] border border-ink-200 bg-white/70 p-0 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#f01c6d]/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:shadow-[#f01c6d]/10"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="line-clamp-2 text-sm font-black text-white">
                          {course.title}
                        </h3>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-white/70">{course.grade}</span>
                          <span className="rounded-lg bg-white/20 px-2 py-1 text-xs font-black text-gold-400 backdrop-blur-md">
                            {course.price} ج.م
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
          </div>
        </div>

      </div>

      {/* مودال الشهادة */}
      {certificateData && (
        <Certificate
          studentName={user.name}
          courseTitle={certificateData.courseTitle}
          onClose={() => setCertificateData(null)}
        />
      )}
    </div>
  );
}