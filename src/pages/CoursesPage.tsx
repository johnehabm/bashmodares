import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, BookOpen } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { EmptyState } from '../components/ui';

export function CoursesPage() {
  const { courses } = useApp();
  const [stage, setStage] = useState<'all' | 'primary' | 'preparatory'>('all');

  const filtered =
    stage === 'all' ? courses : courses.filter((c) => c.stage === stage);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <h1 className="section-title">الكورسات</h1>
        <p className="mt-2 text-ink-500 dark:text-ink-400">
          اختر الكورس المناسب لمرحلتك الدراسية
        </p>
      </div>

      <div className="mb-8 flex items-center gap-2">
        <Filter className="h-4 w-4 text-ink-400" />
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'primary', label: 'ابتدائي' },
            { key: 'preparatory', label: 'إعدادي' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStage(f.key as typeof stage)}
              className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-colors ${
                stage === f.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="لا توجد كورسات"
          description="لم تُضف كورسات في هذه المرحلة بعد."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="card group overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
                <span className="absolute right-3 top-3 badge bg-white/90 text-ink-800 backdrop-blur">
                  {course.stage === 'primary' ? 'ابتدائي' : 'إعدادي'}
                </span>
                <div className="absolute bottom-3 right-3 left-3">
                  <p className="text-xs font-bold text-white/80">{course.grade}</p>
                  <h3 className="line-clamp-1 text-base font-900 text-white">
                    {course.title}
                  </h3>
                </div>
              </div>
              <div className="p-5">
                <p className="line-clamp-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                  {course.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-xl font-900 text-brand-600 dark:text-brand-400">
                    {course.price} ج.م
                  </span>
                  <span className="text-xs font-bold text-ink-400">
                    {course.lessons.length} درس
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
