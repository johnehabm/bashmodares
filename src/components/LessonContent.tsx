import { useState, useMemo } from 'react';
import { CheckCircle2, RotateCcw, Award, ChevronLeft, ChevronRight, Layers, Brain } from 'lucide-react';
import type { Lesson } from '../types';
import { useApp } from '../store/AppContext';

// دالة لاستخراج الـ ID من أي رابط يوتيوب وتحويله لـ Embed أوتوماتيك
const getEmbedUrl = (url?: string) => {
  if (!url) return '';
  let videoId = url;

  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  } else if (url.includes('watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  } else if (url.includes('/embed/')) {
    return url;
  } else if (url.includes('youtube.com/shorts/')) {
    videoId = url.split('shorts/')[1]?.split('?')[0];
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
};

export function VideoLesson({ lesson }: { lesson: Lesson }) {
  const { markLessonComplete, isLessonComplete } = useApp();
  const done = isLessonComplete(lesson.id);
  const embedUrl = getEmbedUrl(lesson.videoUrl || (lesson as any).youtubeId);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-ink-200 bg-ink-950 shadow-lg dark:border-white/10">
        <iframe
          className="h-full w-full"
          src={embedUrl}
          title={lesson.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          {lesson.duration && (
            <p className="text-sm font-bold text-ink-500 dark:text-ink-400">
              المدة: {lesson.duration}
            </p>
          )}
        </div>
        {done ? (
          <span className="flex items-center gap-2 rounded-xl bg-brand-100 px-4 py-2 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            <CheckCircle2 className="h-5 w-5" /> مكتمل
          </span>
        ) : (
          <button
            onClick={() => markLessonComplete(lesson.id, lesson.courseId)}
            className="btn-primary py-2.5"
          >
            <CheckCircle2 className="h-5 w-5" />
            تأكيد إكمال الدرس
          </button>
        )}
      </div>
    </div>
  );
}

export function PdfLesson({ lesson }: { lesson: Lesson }) {
  const { markLessonComplete, isLessonComplete } = useApp();
  const done = isLessonComplete(lesson.id);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-ink-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-[#171a36]">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-black text-ink-900 dark:text-white">
            {lesson.title}
          </h3>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
            اضغط الزر أدناه لفتح وتحميل الملخص بصيغة (PDF) في نافذة جديدة
          </p>
        </div>
        <a
          href={(lesson as any).pdfUrl || lesson.videoUrl || lesson.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:shadow-red-500/50"
        >
          فتح الملخص
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
      <div className="flex justify-end">
        {done ? (
          <span className="flex items-center gap-2 rounded-xl bg-brand-100 px-4 py-2 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            <CheckCircle2 className="h-5 w-5" /> مكتمل
          </span>
        ) : (
          <button
            onClick={() => markLessonComplete(lesson.id, lesson.courseId)}
            className="btn-primary py-2.5"
          >
            <CheckCircle2 className="h-5 w-5" />
            تأكيد إكمال الدرس
          </button>
        )}
      </div>
    </div>
  );
}

export function QuizLesson({ lesson }: { lesson: Lesson }) {
  const { markLessonComplete, isLessonComplete } = useApp();
  const done = isLessonComplete(lesson.id);
  const [mode, setMode] = useState<'quiz' | 'flashcards'>('quiz');

  // 🔴 معقم البيانات (Sanitizer): يضمن أن الأسئلة القديمة والجديدة تُقرأ بشكل صحيح دون حدوث انهيار (Crash)
  const questions = useMemo(() => {
    return (lesson.questions || []).map((q: any, idx: number) => {
      // تحويل الاختيارات إذا كانت من النوع القديم (Objects) إلى نصوص عادية
      const normalizedOptions = (q.options || []).map((opt: any) => {
        if (typeof opt === 'object' && opt !== null) {
          return opt.text || '';
        }
        return String(opt);
      });

      // استخراج الإجابة الصحيحة إذا كانت في النظام القديم
      let correctIdx = q.correctOptionIndex;
      if (correctIdx === undefined || correctIdx === null) {
        const foundIdx = (q.options || []).findIndex((o: any) => typeof o === 'object' && o.correct === true);
        correctIdx = foundIdx >= 0 ? foundIdx : 0;
      }

      return {
        ...q,
        qId: idx,
        options: normalizedOptions,
        correctOptionIndex: correctIdx
      };
    });
  }, [lesson.questions]);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const cards = (lesson as any).flashcards ?? [];
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (questions.length === 0 && cards.length === 0) {
    return (
      <div className="rounded-[2rem] border border-ink-200 bg-white p-8 text-center text-ink-500 shadow-sm dark:border-white/10 dark:bg-[#171a36] dark:text-ink-400">
        لا يوجد محتوى لهذا الاختبار بعد. سيقوم المعلم بإضافة الأسئلة قريباً.
      </div>
    );
  }

  const q = questions[current];

  const score = questions.reduce((acc, qq) => {
    return acc + (answers[qq.qId] === qq.correctOptionIndex ? 1 : 0);
  }, 0);

  const scorePercent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passingScore = lesson.passingScore || 50;
  const passed = scorePercent >= passingScore;

  const handleAnswer = (optionIdx: number) => {
    if (selectedOption !== null || !q) return;
    setSelectedOption(optionIdx);
    setAnswers((prev) => ({ ...prev, [q.qId]: optionIdx }));
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
      if (passed) {
        markLessonComplete(lesson.id, lesson.courseId, scorePercent);
      }
    }
  };

  const restart = () => {
    setCurrent(0);
    setAnswers({});
    setShowResult(false);
    setSelectedOption(null);
  };

  const nextCard = () => {
    setFlipped(false);
    setCardIdx((i) => (i + 1) % cards.length);
  };
  const prevCard = () => {
    setFlipped(false);
    setCardIdx((i) => (i - 1 + cards.length) % cards.length);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {questions.length > 0 && cards.length > 0 && (
          <>
            <button
              onClick={() => setMode('quiz')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${mode === 'quiz'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-900/50 dark:text-ink-300'
                }`}
            >
              <Brain className="h-4 w-4" /> اختبار
            </button>
            <button
              onClick={() => setMode('flashcards')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${mode === 'flashcards'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-900/50 dark:text-ink-300'
                }`}
            >
              <Layers className="h-4 w-4" /> بطاقات مراجعة
            </button>
          </>
        )}
      </div>

      {/* Quiz Mode */}
      {mode === 'quiz' && questions.length > 0 && q && !showResult && (
        <div className="rounded-[2rem] border border-ink-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#171a36] sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-ink-500 dark:text-ink-400">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">{current + 1}</span>
              من {questions.length} أسئلة
            </span>
            {done && (
              <span className="flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> مجتاز
              </span>
            )}
          </div>
          <div className="mb-6 h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-900/50">
            <div
              className="h-full rounded-full bg-gradient-to-l from-brand-500 to-brand-400 transition-all duration-500 dark:from-brand-600 dark:to-brand-400"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>

          <h3 className="mt-5 text-xl font-black leading-relaxed text-ink-900 dark:text-white">
            {q.text}
          </h3>

          {q.image && (
            <div className="mt-6 flex w-full justify-center overflow-hidden rounded-2xl border border-ink-100 bg-ink-50 p-2 dark:border-white/5 dark:bg-ink-900/30">
              <img
                src={q.image}
                alt="توضيح للسؤال"
                className="max-h-[350px] w-full rounded-xl object-contain shadow-sm"
              />
            </div>
          )}

          <div className="mt-8 space-y-3">
            {q.options.map((optText: string, optIdx: number) => {
              const isCorrect = q.correctOptionIndex === optIdx;
              const isSelected = selectedOption === optIdx;
              const letters = ['أ', 'ب', 'ج', 'د'];

              let cls = 'border-ink-200 bg-white hover:border-brand-300 dark:border-white/10 dark:bg-ink-900/50';
              if (selectedOption !== null) {
                if (isCorrect)
                  cls = 'border-emerald-500 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-900/20';
                else if (isSelected)
                  cls = 'border-red-500 bg-red-50 dark:border-red-500/50 dark:bg-red-900/20';
                else cls = 'border-ink-200 bg-white opacity-50 dark:border-white/10 dark:bg-ink-900/50';
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleAnswer(optIdx)}
                  disabled={selectedOption !== null}
                  className={`group flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-right transition-all ${cls}`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black transition-colors ${selectedOption !== null && isCorrect ? 'bg-emerald-500 text-white' :
                      selectedOption !== null && isSelected ? 'bg-red-500 text-white' :
                        'bg-ink-100 text-ink-600 group-hover:bg-brand-100 group-hover:text-brand-600 dark:bg-ink-800 dark:text-ink-400'
                    }`}>
                    {letters[optIdx] || optIdx + 1}
                  </span>
                  <span className={`flex-1 text-base font-bold ${selectedOption !== null && isCorrect ? 'text-emerald-900 dark:text-emerald-100' :
                      selectedOption !== null && isSelected ? 'text-red-900 dark:text-red-100' :
                        'text-ink-800 dark:text-ink-100'
                    }`}>
                    {optText}
                  </span>
                  {selectedOption !== null && isCorrect && <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
                  {selectedOption !== null && isSelected && !isCorrect && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400">✕</span>}
                </button>
              );
            })}
          </div>

          {(selectedOption !== null) && (
            <button onClick={nextQuestion} className="btn-primary mt-8 w-full py-3.5 text-base">
              {current < questions.length - 1 ? 'تأكيد والانتقال للسؤال التالي' : 'إنهاء وعرض النتيجة'}
            </button>
          )}
        </div>
      )}

      {/* Result Mode */}
      {mode === 'quiz' && showResult && (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-ink-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-[#171a36] animate-in zoom-in duration-500">
          <div
            className={`mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] ${passed
              ? 'bg-emerald-50 text-emerald-500 shadow-[0_0_40px_-10px_#10b981] dark:bg-emerald-500/10'
              : 'bg-red-50 text-red-500 shadow-[0_0_40px_-10px_#ef4444] dark:bg-red-500/10'
              }`}
          >
            <Award className="h-12 w-12" />
          </div>
          <h3 className="text-3xl font-black text-ink-900 dark:text-white">
            {passed ? 'ألف مبروك! اجتزت الاختبار' : 'للأسف، لم تجتز الاختبار'}
          </h3>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-ink-50 p-6 dark:bg-ink-900/50">
            <div className="flex items-center justify-between font-bold text-ink-700 dark:text-ink-300">
              <span>إجابات صحيحة:</span>
              <span className="text-emerald-600 dark:text-emerald-400">{score} من {questions.length}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-ink-700 dark:text-ink-300">
              <span>النسبة المئوية:</span>
              <span className="text-brand-600 dark:text-brand-400">{scorePercent}%</span>
            </div>
            <div className="flex items-center justify-between border-t border-ink-200 pt-3 text-sm font-bold text-ink-500 dark:border-white/10 dark:text-ink-400">
              <span>نسبة النجاح المطلوبة:</span>
              <span>{passingScore}%</span>
            </div>
          </div>

          {passed && !done && (
            <p className="mt-6 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              تم تسجيل إكمالك للدرس بنجاح، يمكنك الانتقال للدرس التالي.
            </p>
          )}

          <button onClick={restart} className="btn-primary mt-8 py-3 px-8">
            <RotateCcw className="mr-2 h-5 w-5" />
            إعادة الاختبار
          </button>
        </div>
      )}

      {/* Flashcards Mode (للأنظمة القديمة) */}
      {mode === 'flashcards' && cards.length > 0 && (
        <div className="space-y-4">
          <div className="text-center text-sm font-bold text-ink-500 dark:text-ink-400">
            بطاقة {cardIdx + 1} من {cards.length} — اضغط البطاقة لقلبها
          </div>
          <button
            onClick={() => setFlipped((f) => !f)}
            className="relative w-full"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative min-h-[250px] w-full transition-transform duration-700"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border border-ink-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#171a36]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="mb-4 inline-block rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">السؤال</span>
                <p className="text-xl font-black leading-relaxed text-ink-900 dark:text-white">
                  {cards[cardIdx].front}
                </p>
              </div>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-center shadow-lg"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold text-white">الإجابة</span>
                <p className="text-xl font-black leading-relaxed text-white">
                  {cards[cardIdx].back}
                </p>
              </div>
            </div>
          </button>

          <div className="flex items-center justify-between pt-4">
            <button onClick={prevCard} className="btn-outline px-6 py-2.5">
              <ChevronRight className="h-5 w-5" />
              السابق
            </button>
            <button onClick={() => setFlipped((f) => !f)} className="font-bold text-ink-500 hover:text-brand-600 dark:text-ink-400">
              اقلب البطاقة
            </button>
            <button onClick={nextCard} className="btn-outline px-6 py-2.5">
              التالي
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          {!done && (
            <div className="mt-8 flex justify-center border-t border-ink-200 pt-6 dark:border-white/10">
              <button
                onClick={() => markLessonComplete(lesson.id, lesson.courseId)}
                className="btn-primary py-3 px-8"
              >
                <CheckCircle2 className="h-5 w-5" />
                تأكيد إكمال المراجعة
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}