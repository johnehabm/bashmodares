import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  Lock,
  CheckCircle2,
  PlayCircle,
  FileText,
  Brain,
  Clock,
  BookOpen,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { EnrollmentFlow } from '../components/EnrollmentFlow';
import { VideoLesson, PdfLesson, QuizLesson } from '../components/LessonContent';
import { EmptyState } from '../components/ui';
import type { Lesson } from '../types';

const lessonIcon = (type: Lesson['type']) => {
  switch (type) {
    case 'video':
      return <PlayCircle className="h-4 w-4" />;
    case 'pdf':
      return <FileText className="h-4 w-4" />;
    case 'quiz':
      return <Brain className="h-4 w-4" />;
  }
};

export function CourseDetailPage() {
  const { courseId = '' } = useParams();

  // 🔴 ضفنا createEnrollment هنا عشان نستخدمها للكورسات المجانية
  const { courses, user, enrollments, isLessonComplete, isLessonUnlocked, createEnrollment } = useApp();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="الكورس غير موجود"
          action={<Link to="/courses" className="btn-primary">العودة للكورسات</Link>}
        />
      </div>
    );
  }

  const lessons = [...course.lessons].sort((a, b) => a.order - b.order);
  const enrollment = enrollments.find(
    (e) => e.studentId === user?.id && e.courseId === courseId,
  );
  const isApproved = enrollment?.status === 'approved';
  const activeLesson = lessons.find((l) => l.id === activeLessonId) ?? null;

  const completedCount = lessons.filter((l) => isLessonComplete(l.id)).length;
  const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-ink-400">
        <Link to="/courses" className="hover:text-brand-600">الكورسات</Link>
        <ArrowRight className="h-3.5 w-3.5" />
        <span className="font-bold text-ink-600 dark:text-ink-300">{course.title}</span>
      </div>

      {/* Course header */}
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-ink-950 p-8 text-white sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <span className="badge bg-white/15 text-white backdrop-blur">
              {course.stage === 'primary' ? 'ابتدائي' : 'إعدادي'} · {course.grade}
            </span>
            <h1 className="mt-3 font-display text-3xl font-900 sm:text-4xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-brand-100">{course.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" /> {course.instructor}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> {lessons.length} درس
              </span>
              <span className="font-display text-xl font-900 text-gold-300">
                {Number(course.price) === 0 ? 'مجاناً' : `${course.price} ج.م`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Not enrolled */}
      {user && !enrollment && (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-900 text-ink-900 dark:text-white">
              محتوى الكورس
            </h2>
            <div className="space-y-2">
              {lessons.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3 dark:border-ink-800 dark:bg-ink-900"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-400 dark:bg-ink-800">
                    {lessonIcon(l.type)}
                  </div>
                  <span className="flex-1 text-sm font-bold text-ink-600 dark:text-ink-300">
                    {l.title}
                  </span>
                  <Lock className="h-4 w-4 text-ink-300 dark:text-ink-600" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-4 text-xl font-900 text-ink-900 dark:text-white">التسجيل</h2>

            {/* 🔴 التعديل السحري: لو الكورس مجاني، نعرض زرار اشتراك مباشر بدون إيصال */}
            {Number(course.price) === 0 ? (
              <div className="card overflow-hidden p-0 text-center">
                <div className="bg-brand-50 p-6 dark:bg-brand-900/10">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 shadow-sm dark:bg-brand-500/20 dark:text-brand-300">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-900 text-ink-900 dark:text-white">
                    كورس مجاني بالكامل!
                  </h3>
                  <p className="text-sm font-medium text-ink-600 dark:text-ink-400">
                    هذا الكورس متاح كهدية للطلاب. لا حاجة لرفع أي إيصالات، يمكنك البدء في التعلم فوراً.
                  </p>
                </div>
                <div className="p-6">
                  <button
                    onClick={() => createEnrollment({ courseId: course.id })}
                    className="btn-primary w-full text-base py-3"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    اشترك وابدأ التعلم الآن
                  </button>
                </div>
              </div>
            ) : (
              /* لو الكورس بفلوس، نعرض نافذة الإيصال العادية */
              <EnrollmentFlow courseId={course.id} price={course.price} />
            )}
          </div>
        </div>
      )}

      {/* Pending enrollment */}
      {user && enrollment?.status === 'pending' && (
        <div className="card flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100 text-gold-600 dark:bg-gold-900/40 dark:text-gold-300">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-900 text-ink-900 dark:text-white">طلبك قيد المراجعة</h3>
            <p className="text-sm text-ink-500 dark:text-ink-400">
              تم استلام إيصالك. سيتم تفعيل الكورس فور موافقة الأدمن.
            </p>
          </div>
        </div>
      )}

      {/* Rejected enrollment */}
      {user && enrollment?.status === 'rejected' && (
        <div className="card flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
            <Lock className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-900 text-ink-900 dark:text-white">تم رفض الإيصال</h3>
            <p className="text-sm text-ink-500 dark:text-ink-400">
              {enrollment.reviewerNote || 'يرجى التواصل مع الأدمن لإعادة التسجيل.'}
            </p>
          </div>
        </div>
      )}

      {/* Approved — full course view */}
      {isApproved && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {activeLesson ? (
              <div className="animate-fade-in">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-900 text-ink-900 dark:text-white">
                  {lessonIcon(activeLesson.type)}
                  {activeLesson.title}
                </h2>
                {activeLesson.type === 'video' && <VideoLesson lesson={activeLesson} />}
                {activeLesson.type === 'pdf' && <PdfLesson lesson={activeLesson} />}
                {activeLesson.type === 'quiz' && <QuizLesson lesson={activeLesson} />}
              </div>
            ) : (
              <div>
                {/* Progress overview */}
                <div className="card mb-6 p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-900 text-ink-900 dark:text-white">تقدمك في الكورس</h3>
                    <span className="font-display text-2xl font-900 text-brand-600 dark:text-brand-400">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-brand-500 to-gold-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
                    أكملت {completedCount} من {lessons.length} دروس
                  </p>
                </div>

                {/* Start prompt */}
                <div className="card flex flex-col items-center gap-4 p-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                    <PlayCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-900 text-ink-900 dark:text-white">
                      ابدأ الدرس الأول
                    </h3>
                    <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                      الدروس متسلسلة — أكمل الحالي لفتح التالي
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveLessonId(lessons[0]?.id ?? null)}
                    className="btn-primary"
                  >
                    <PlayCircle className="h-4 w-4" />
                    ابدأ الآن
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — lessons list */}
          <div>
            <h3 className="mb-4 text-lg font-900 text-ink-900 dark:text-white">
              دروس الكورس
            </h3>
            <div className="space-y-2">
              {lessons.map((l, idx) => {
                const unlocked = isLessonUnlocked(l.id, course.id);
                const complete = isLessonComplete(l.id);
                const isActive = activeLessonId === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => unlocked && setActiveLessonId(l.id)}
                    disabled={!unlocked}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-right transition-all ${isActive
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : unlocked
                          ? 'border-ink-200 bg-white hover:border-brand-300 dark:border-ink-800 dark:bg-ink-900'
                          : 'border-ink-200 bg-ink-50 opacity-60 dark:border-ink-800 dark:bg-ink-900/50'
                      }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${complete
                          ? 'bg-brand-600 text-white'
                          : unlocked
                            ? 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
                            : 'bg-ink-100 text-ink-300 dark:bg-ink-800 dark:text-ink-600'
                        }`}
                    >
                      {complete ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : unlocked ? (
                        lessonIcon(l.type)
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`truncate text-sm font-bold ${unlocked ? 'text-ink-800 dark:text-ink-100' : 'text-ink-400'}`}>
                        {l.title}
                      </p>
                      <p className="text-xs text-ink-400">
                        {l.type === 'video' ? 'فيديو' : l.type === 'pdf' ? 'ملخص' : 'اختبار'}
                        {l.duration ? ` · ${l.duration}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-900 text-ink-300 dark:text-ink-600">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Not logged in */}
      {!user && (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-900 text-ink-900 dark:text-white">محتوى الكورس</h2>
            <div className="space-y-2">
              {lessons.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3 dark:border-ink-800 dark:bg-ink-900"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-400 dark:bg-ink-800">
                    {lessonIcon(l.type)}
                  </div>
                  <span className="flex-1 text-sm font-bold text-ink-600 dark:text-ink-300">{l.title}</span>
                  <Lock className="h-4 w-4 text-ink-300 dark:text-ink-600" />
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6 text-center">
            <h3 className="font-900 text-ink-900 dark:text-white">سجّل للوصول للكورس</h3>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
              أنشئ حسابًا أو سجّل الدخول للتسجيل في هذا الكورس.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link to="/register" className="btn-primary w-full">إنشاء حساب</Link>
              <Link to="/login" className="btn-outline w-full">تسجيل الدخول</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}