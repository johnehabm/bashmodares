import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Filter, Search, PlayCircle, Users } from 'lucide-react';
import { useApp } from '../store/AppContext';

export function CoursesPage() {
  const { courses } = useApp() || { courses: [] };

  // 1. تعريف الكورسات المرئية (إلغاء المسودة)
  const visibleCourses = courses.filter((c: any) => c.isPublished !== false);

  const [filter, setFilter] = useState<'all' | 'primary' | 'preparatory' | 'secondary'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 🔴 2. التعديل السحري: استخدام (visibleCourses) بدل (courses)
  const safeCourses = Array.isArray(visibleCourses) ? visibleCourses : [];

  const filteredCourses = safeCourses.filter((course) => {
    if (!course) return false;

    const matchStage = filter === 'all' || course.stage === filter;
    const safeTitle = course.title || '';
    const safeSubject = course.subject || '';

    const matchSearch = safeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      safeSubject.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStage && matchSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-black text-ink-900 dark:text-white">الكورسات</h1>
        <p className="mt-2 text-ink-500 dark:text-ink-400">اختر الكورس المناسب لمرحلتك الدراسية</p>
      </div>

      <div className="mb-8 flex flex-col-reverse items-center justify-between gap-4 md:flex-row">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="ابحث عن كورس أو مادة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full py-3 pr-12"
          />
        </div>

        <div className="flex w-full items-center justify-end gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0" dir="rtl">
          <Filter className="ml-2 h-5 w-5 shrink-0 text-ink-400" />
          {[
            { id: 'all', label: 'الكل' },
            { id: 'primary', label: 'ابتدائي' },
            { id: 'preparatory', label: 'إعدادي' },
            { id: 'secondary', label: 'ثانوي' }
          ].map((stage) => (
            <button
              key={stage.id}
              onClick={() => setFilter(stage.id as any)}
              className={`shrink-0 rounded-full px-6 py-2.5 text-sm font-bold transition-all ${filter === stage.id
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                : 'bg-white text-ink-600 hover:bg-ink-50 dark:bg-[#171a36] dark:text-ink-300 dark:hover:bg-white/5'
                }`}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id || ''}`}
              className="group flex flex-col overflow-hidden rounded-[2rem] border border-ink-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#171a36]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-ink-100 dark:bg-ink-800">
                <img
                  src={course.coverImage || course.imageUrl || 'https://via.placeholder.com/400x300'}
                  alt={course.title || 'كورس'}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white backdrop-blur-md">
                    <PlayCircle className="h-5 w-5" />
                    عرض التفاصيل
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center justify-between">
                  {course.subject && (
                    <span className="rounded-lg bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                      {course.subject}
                    </span>
                  )}
                  {course.grade && (
                    <span className="text-xs font-bold text-ink-500 dark:text-ink-400">
                      {course.grade}
                    </span>
                  )}
                </div>
                <h3 className="mb-2 text-lg font-black leading-tight text-ink-900 line-clamp-2 dark:text-white">
                  {course.title}
                </h3>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-ink-100 dark:border-white/10">
                  <div className="flex items-center gap-2 text-sm font-bold text-ink-600 dark:text-ink-300">
                    <Users className="h-4 w-4 text-ink-400" />
                    {course.instructor}
                  </div>
                  <span className="text-lg font-black text-brand-600 dark:text-brand-400">
                    {Number(course.price) === 0 ? 'مجانياً' : `${course.price} ج.م`}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-ink-200 bg-white/50 py-20 text-center dark:border-white/5 dark:bg-[#171a36]/50">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-ink-50 dark:bg-ink-900/50">
            <BookOpen className="h-10 w-10 text-ink-400" />
          </div>
          <h3 className="mb-2 text-xl font-black text-ink-900 dark:text-white">لا توجد كورسات</h3>
          <p className="text-ink-500 dark:text-ink-400">لم تُضف كورسات في هذا القسم بعد.</p>
        </div>
      )}
    </div>
  );
}