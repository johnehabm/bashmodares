import { useState } from 'react';
import {
  BookOpen, DollarSign, GraduationCap, Users, Image as ImageIcon, FileText,
  PlusCircle, Trash2, Video, Link as LinkIcon, Brain, Plus, Upload, Save, XCircle, PlayCircle, Target
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { supabase } from '../../lib/supabase';

export function AdminCourses() {
  const { courses, enrollments, addCourse, addLesson, deleteCourse, deleteLesson } = useApp();

  const [showAddCourse, setShowAddCourse] = useState(false);
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);

  const [newCourse, setNewCourse] = useState({ title: '', description: '', stage: 'primary', grade: '', subject: '', price: '', coverImage: '' });

  const [newLesson, setNewLesson] = useState<{
    title: string;
    videoUrl: string;
    type: string;
    passingScore: number;
    questions: { text: string; image?: string; options: string[]; correctOptionIndex: number }[];
  }>({ title: '', videoUrl: '', type: 'video', passingScore: 50, questions: [] });

  const [uploadingImageIdx, setUploadingImageIdx] = useState<number | null>(null);

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    addCourse(newCourse);
    setNewCourse({ title: '', description: '', stage: 'primary', grade: '', subject: '', price: '', coverImage: '' });
    setShowAddCourse(false);
  };

  const handleAddLesson = (courseId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (newLesson.type === 'quiz' && newLesson.questions.length === 0) {
      alert('يجب إضافة سؤال واحد على الأقل للاختبار!');
      return;
    }
    addLesson(courseId, newLesson);
    setNewLesson({ title: '', videoUrl: '', type: 'video', passingScore: 50, questions: [] });
    setAddingLessonTo(null);
  };

  const uploadQuestionImage = async (file: File, qIdx: number) => {
    if (!file) return;
    setUploadingImageIdx(qIdx);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `quiz_img_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(`quizzes/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('receipts').getPublicUrl(`quizzes/${fileName}`);

      const qs = [...newLesson.questions];
      qs[qIdx].image = data.publicUrl;
      setNewLesson({ ...newLesson, questions: qs });

    } catch (err: any) {
      alert(`حدث خطأ أثناء رفع الصورة: ${err.message}`);
    } finally {
      setUploadingImageIdx(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-ink-900 dark:text-white">إدارة الكورسات والمحتوى</h2>
        <button
          onClick={() => setShowAddCourse(true)}
          className="btn-primary shadow-lg shadow-brand-500/20"
        >
          <PlusCircle className="h-5 w-5" /> إضافة كورس جديد
        </button>
      </div>

      {showAddCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAddCourse(false)}></div>
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl transition-all dark:bg-[#171a36] animate-in fade-in zoom-in duration-300">

            <div className="flex items-center justify-between bg-gradient-to-l from-brand-600 to-brand-800 px-8 py-6 text-white">
              <h3 className="flex items-center gap-3 text-2xl font-black">
                <PlusCircle className="h-7 w-7" />
                إنشاء كورس جديد
              </h3>
              <button onClick={() => setShowAddCourse(false)} className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-300">
                    <BookOpen className="h-4 w-4 text-brand-500" /> اسم الكورس
                  </label>
                  <input required type="text" placeholder="مثال: مراجعة نهائية في اللغة العربية" className="input-field w-full" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-300">
                    <DollarSign className="h-4 w-4 text-emerald-500" /> السعر (ج.م)
                  </label>
                  <input required type="number" placeholder="أدخل 0 للكورس المجاني" className="input-field w-full" value={newCourse.price} onChange={e => setNewCourse({ ...newCourse, price: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-300">
                    <GraduationCap className="h-4 w-4 text-purple-500" /> المرحلة الدراسية الأساسية
                  </label>
                  <select required className="input-field w-full" value={newCourse.stage} onChange={e => setNewCourse({ ...newCourse, stage: e.target.value })}>
                    <option value="primary">المرحلة الابتدائية</option>
                    <option value="preparatory">المرحلة الإعدادية</option>
                    <option value="secondary">المرحلة الثانوية</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-300">
                    <Users className="h-4 w-4 text-blue-500" /> الصف الدراسي بالتحديد
                  </label>
                  <input required type="text" placeholder="مثال: الصف الرابع الابتدائي" className="input-field w-full" value={newCourse.grade} onChange={e => setNewCourse({ ...newCourse, grade: e.target.value })} />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-300">
                    <ImageIcon className="h-4 w-4 text-gold-500" /> رابط صورة الغلاف
                  </label>
                  <input type="url" placeholder="https://example.com/image.jpg" className="input-field w-full" value={newCourse.coverImage} onChange={e => setNewCourse({ ...newCourse, coverImage: e.target.value })} />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-300">
                    <FileText className="h-4 w-4 text-blue-500" /> وصف الكورس
                  </label>
                  <textarea required placeholder="اكتب وصفاً جذاباً للكورس يشرح محتواه للطلاب..." className="input-field min-h-[100px] w-full resize-none" value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4 border-t border-ink-100 pt-6 dark:border-white/10">
                <button type="button" onClick={() => setShowAddCourse(false)} className="btn-outline px-8">إلغاء</button>
                <button type="submit" className="btn-primary px-8"><Save className="mr-2 h-5 w-5" /> حفظ ونشر الكورس</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {courses.map(course => {
          const courseEnrs = enrollments.filter(e => e.courseId === course.id && e.status === 'approved');
          const courseRevenue = courseEnrs.reduce((sum, e) => sum + Number(e.amount), 0);

          return (
            <div key={course.id} className="overflow-hidden rounded-[2rem] border border-ink-200 bg-white/70 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">

              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 p-6 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <img src={course.coverImage} alt={course.title} className="h-16 w-16 rounded-xl object-cover shadow-sm" />
                  <div>
                    <h3 className="text-xl font-bold text-ink-900 dark:text-white">{course.title}</h3>
                    <div className="mt-1 flex items-center gap-3 text-sm font-bold">
                      <span className="text-brand-600 dark:text-brand-400">السعر: {course.price} ج.م</span>
                      <span className="text-emerald-600 dark:text-emerald-400">الأرباح: {courseRevenue} ج.م</span>
                      <span className="text-ink-500">الطلاب: {courseEnrs.length}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAddingLessonTo(addingLessonTo === course.id ? null : course.id)}
                    className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
                  >
                    <PlusCircle className="h-4 w-4" /> إضافة محتوى
                  </button>
                  <button
                    onClick={() => { if (window.confirm('هل أنت متأكد من حذف الكورس بكل محتوياته وطلباته؟')) deleteCourse(course.id); }}
                    className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    <Trash2 className="h-4 w-4" /> حذف
                  </button>
                </div>
              </div>

              {/* نموذج إضافة محتوى الكورس */}
              {addingLessonTo === course.id && (
                <div className="border-b border-ink-100 bg-brand-50/30 p-6 dark:border-white/5 dark:bg-brand-900/10">
                  <div className="mb-4 flex items-center gap-2 text-brand-700 dark:text-brand-300">
                    <Video className="h-5 w-5" />
                    <h4 className="font-bold">إضافة محتوى لـ ({course.title})</h4>
                  </div>
                  <form onSubmit={(e) => handleAddLesson(course.id, e)}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink-600 dark:text-ink-300">عنوان الدرس / الاختبار</label>
                        <input required type="text" placeholder="مثال: الدرس الأول" className="input-field w-full" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink-600 dark:text-ink-300">نوع المحتوى</label>
                        <select className="input-field w-full" value={newLesson.type} onChange={e => setNewLesson({ ...newLesson, type: e.target.value, videoUrl: '', questions: [] })}>
                          <option value="video">فيديو</option>
                          <option value="pdf">ملف PDF</option>
                          <option value="quiz">اختبار (Quiz)</option>
                        </select>
                      </div>
                    </div>

                    {newLesson.type !== 'quiz' && (
                      <div className="mt-4 space-y-1.5">
                        <label className="flex items-center gap-1 text-xs font-bold text-ink-600 dark:text-ink-300"><LinkIcon className="h-3 w-3" /> رابط الفيديو / الملف</label>
                        <input required type="url" placeholder="Youtube / Drive Link" className="input-field w-full" value={newLesson.videoUrl} onChange={e => setNewLesson({ ...newLesson, videoUrl: e.target.value })} />
                      </div>
                    )}

                    {newLesson.type === 'quiz' && (
                      <div className="mt-6 rounded-2xl border border-brand-200 bg-white p-5 shadow-sm dark:border-brand-900/50 dark:bg-ink-950">

                        {/* 🔴 نسبة النجاح: كارت ضخم وواضح جداً 🔴 */}
                        <div className="mb-6 rounded-2xl border-2 border-brand-500 bg-brand-50 p-6 shadow-md dark:border-brand-500/50 dark:bg-brand-900/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div>
                            <label className="flex items-center gap-2 text-lg font-black text-brand-800 dark:text-brand-300">
                              <Target className="h-6 w-6" /> نسبة النجاح المطلوبة
                            </label>
                            <p className="text-sm font-bold text-brand-600/80 dark:text-brand-400/80 mt-1">
                              النسبة المئوية التي يجب أن يحصل عليها الطالب لاجتياز هذا الاختبار.
                            </p>
                          </div>
                          <div className="flex items-center gap-2 bg-white dark:bg-ink-900 p-2 rounded-xl border border-brand-200 dark:border-brand-800">
                            <input
                              required
                              type="number"
                              min="1"
                              max="100"
                              className="w-16 bg-transparent px-2 py-1 text-center text-2xl font-black text-brand-700 outline-none dark:text-brand-400"
                              value={newLesson.passingScore}
                              onChange={e => setNewLesson({ ...newLesson, passingScore: Number(e.target.value) })}
                            />
                            <span className="text-2xl font-black text-brand-700 dark:text-brand-300">%</span>
                          </div>
                        </div>

                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 pb-4 dark:border-white/5">
                          <div>
                            <h5 className="font-bold text-ink-900 dark:text-white flex items-center gap-2">
                              <Brain className="h-5 w-5 text-brand-600 dark:text-brand-400" /> أسئلة الاختبار
                            </h5>
                            <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">أضف الأسئلة، ارفع صورة (اختياري)، وحدد الإجابة الصحيحة بالضغط على الدائرة.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewLesson({ ...newLesson, questions: [...newLesson.questions, { text: '', image: '', options: ['', '', '', ''], correctOptionIndex: 0 }] })}
                            className="btn-primary py-2 text-sm shadow-md"
                          >
                            <Plus className="mr-1 h-4 w-4" /> إضافة سؤال جديد
                          </button>
                        </div>

                        <div className="space-y-6">
                          {newLesson.questions.map((q, qIdx) => (
                            <div key={qIdx} className="rounded-2xl border border-ink-200 bg-ink-50/50 p-5 dark:border-white/10 dark:bg-ink-900/20">
                              <div className="mb-4 flex items-center justify-between border-b border-ink-200/50 pb-3 dark:border-white/5">
                                <span className="flex items-center gap-2 text-sm font-black text-ink-900 dark:text-white">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-300">{qIdx + 1}</span>
                                  تفاصيل السؤال
                                </span>
                                <button type="button" onClick={() => {
                                  const qs = [...newLesson.questions];
                                  qs.splice(qIdx, 1);
                                  setNewLesson({ ...newLesson, questions: qs });
                                }} className="rounded-lg bg-white p-2 text-red-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-700 dark:bg-ink-950 dark:text-red-400 dark:hover:bg-red-900/30">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                  <input required type="text" placeholder="اكتب نص السؤال هنا..." className="input-field w-full font-bold" value={q.text} onChange={e => {
                                    const qs = [...newLesson.questions];
                                    qs[qIdx].text = e.target.value;
                                    setNewLesson({ ...newLesson, questions: qs });
                                  }} />
                                </div>

                                <div className="md:col-span-2">
                                  <label className="mb-2 block text-xs font-bold text-ink-600 dark:text-ink-300">
                                    صورة توضيحية للسؤال (اختياري)
                                  </label>
                                  <div className="flex flex-wrap items-center gap-4">
                                    {q.image && (
                                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-ink-200 dark:border-white/10">
                                        <img src={q.image} alt="Preview" className="h-full w-full object-cover" />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const qs = [...newLesson.questions];
                                            qs[qIdx].image = '';
                                            setNewLesson({ ...newLesson, questions: qs });
                                          }}
                                          className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 transition-opacity hover:opacity-100"
                                          title="حذف الصورة"
                                        >
                                          <Trash2 className="h-5 w-5" />
                                        </button>
                                      </div>
                                    )}

                                    <div className="relative flex-1">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id={`q-img-${qIdx}`}
                                        onChange={(e) => {
                                          if (e.target.files && e.target.files[0]) {
                                            uploadQuestionImage(e.target.files[0], qIdx);
                                          }
                                        }}
                                      />
                                      <label
                                        htmlFor={`q-img-${qIdx}`}
                                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 bg-white px-4 py-4 text-sm font-bold text-brand-600 transition-all hover:border-brand-400 hover:bg-brand-50 dark:border-brand-900/50 dark:bg-ink-950 dark:text-brand-400 dark:hover:border-brand-500/50"
                                      >
                                        {uploadingImageIdx === qIdx ? (
                                          <span className="animate-pulse">جاري الرفع...</span>
                                        ) : (
                                          <>
                                            <Upload className="h-5 w-5" />
                                            {q.image ? 'تغيير الصورة المرفوعة' : 'رفع صورة من الجهاز'}
                                          </>
                                        )}
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                <div className="md:col-span-2 mt-2">
                                  <label className="mb-2 block text-xs font-bold text-ink-600 dark:text-ink-300">
                                    الاختيارات (حدد الدائرة بجوار الإجابة الصحيحة)
                                  </label>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    {q.options.map((opt, optIdx) => (
                                      <div key={optIdx} className={`flex items-center gap-3 rounded-xl border p-2 pl-3 transition-colors ${q.correctOptionIndex === optIdx ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-900/20' : 'border-ink-200 bg-white dark:border-white/10 dark:bg-ink-950'}`}>
                                        <input
                                          type="radio"
                                          name={`correct-${qIdx}`}
                                          className="h-4 w-4 accent-emerald-600"
                                          checked={q.correctOptionIndex === optIdx}
                                          onChange={() => {
                                            const qs = [...newLesson.questions];
                                            qs[qIdx].correctOptionIndex = optIdx;
                                            setNewLesson({ ...newLesson, questions: qs });
                                          }}
                                        />
                                        <input required type="text" placeholder={`الاختيار ${optIdx + 1}`} className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:font-normal dark:text-white" value={opt} onChange={e => {
                                          const qs = [...newLesson.questions];
                                          qs[qIdx].options[optIdx] = e.target.value;
                                          setNewLesson({ ...newLesson, questions: qs });
                                        }} />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {newLesson.questions.length === 0 && (
                            <div className="rounded-2xl border-2 border-dashed border-ink-200 py-10 text-center dark:border-white/10">
                              <Brain className="mx-auto mb-2 h-8 w-8 text-ink-300 dark:text-ink-600" />
                              <p className="text-sm font-bold text-ink-500 dark:text-ink-400">لا توجد أسئلة بعد، اضغط على (إضافة سؤال جديد) للبدء</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end">
                      <button type="submit" className="btn-primary py-3 px-8 shadow-lg shadow-brand-500/30">
                        <Save className="mr-2 h-5 w-5" /> حفظ المحتوى ونشره
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="p-6">
                <h4 className="mb-3 text-sm font-bold text-ink-500 dark:text-ink-400">محتوى الكورس ({course.lessons?.length || 0} محتوى)</h4>
                {course.lessons && course.lessons.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {course.lessons.map((lesson, idx) => (
                      <div key={lesson.id} className="group flex items-center justify-between rounded-xl border border-ink-100 bg-white p-3 shadow-sm transition-all hover:border-brand-200 hover:shadow-md dark:border-white/5 dark:bg-[#171a36] dark:hover:border-brand-500/30">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500 dark:bg-ink-900 dark:text-ink-400">
                            {lesson.type === 'video' ? <PlayCircle className="h-4 w-4" /> : lesson.type === 'pdf' ? <FileText className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                          </div>
                          <span className="truncate text-sm font-bold text-ink-700 dark:text-ink-200">{idx + 1}. {lesson.title}</span>
                        </div>
                        <button
                          onClick={() => { if (window.confirm('هل أنت متأكد من حذف هذا المحتوى؟')) deleteLesson(course.id, lesson.id); }}
                          className="rounded-lg p-2 text-red-500 opacity-0 transition-all hover:bg-red-50 hover:text-red-700 group-hover:opacity-100 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-ink-400 dark:border-white/10">
                    لا يوجد محتوى حالياً في هذا الكورس.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}