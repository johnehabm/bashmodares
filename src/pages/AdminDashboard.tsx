import { useState } from 'react';
import {
  Users, BookOpen, Receipt, DollarSign,
  CheckCircle2, XCircle, Search, ShieldAlert,
  PlayCircle, PlusCircle, Trash2, Eye, Lock, Unlock,
  GraduationCap, Bell, LayoutDashboard, FileText, Brain, Save, Plus,
  Image as ImageIcon, Video, Link as LinkIcon, Upload, Target
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { StatusBadge } from '../components/ui';
import { supabase } from '../lib/supabase';

// ==========================================
// 1. قسم نظرة عامة (Overview)
// ==========================================
function OverviewTab() {
  const { users, enrollments, progress } = useApp();
  const students = users.filter((u) => u.role === 'student');
  const pendingEnrollments = enrollments.filter((e) => e.status === 'pending');
  const approvedEnrollments = enrollments.filter((e) => e.status === 'approved');
  const totalRevenue = approvedEnrollments.reduce((sum, enr) => sum + (Number(enr.amount) || 0), 0);
  const totalCompletedLessons = progress.filter(p => p.completed).length;

  return (
    <div className="animate-fade-in space-y-6 sm:space-y-8">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'إجمالي الأرباح', value: `${totalRevenue.toLocaleString()} ج.م`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'إجمالي الطلاب', value: students.length, icon: Users, color: 'text-brand-600', bg: 'bg-brand-50' },
          { title: 'دروس مكتملة', value: totalCompletedLessons, icon: CheckCircle2, color: 'text-[#f01c6d]', bg: 'bg-[#f01c6d]/10' },
          { title: 'طلبات معلقة', value: pendingEnrollments.length, icon: Receipt, color: 'text-gold-600', bg: 'bg-gold-50' }
        ].map((stat, idx) => (
          <div key={idx} className="flex items-center gap-4 rounded-3xl border border-ink-200 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-ink-900 dark:text-white truncate">{stat.value}</p>
              <p className="text-sm font-bold text-ink-500 dark:text-ink-400">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-black text-ink-900 dark:text-white">أحدث طلبات الاشتراك الناجحة</h2>
        <div className="rounded-3xl border border-ink-200 bg-white/70 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-right text-sm whitespace-nowrap min-w-[600px]">
              <thead className="border-b border-ink-200 bg-ink-50/50 dark:border-white/10 dark:bg-white/5">
                <tr>
                  <th className="p-4 font-bold text-ink-600 dark:text-ink-300">الطالب</th>
                  <th className="p-4 font-bold text-ink-600 dark:text-ink-300">الكورس</th>
                  <th className="p-4 font-bold text-ink-600 dark:text-ink-300">المبلغ</th>
                  <th className="p-4 font-bold text-ink-600 dark:text-ink-300">الدفع</th>
                  <th className="p-4 font-bold text-ink-600 dark:text-ink-300">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {approvedEnrollments.slice(-5).reverse().map(enr => (
                  <tr key={enr.id} className="border-b border-ink-100 last:border-0 dark:border-white/5">
                    <td className="p-4 font-bold text-ink-900 dark:text-white">{enr.studentName}</td>
                    <td className="p-4 text-ink-600 dark:text-ink-300 truncate max-w-[150px]">{enr.courseTitle}</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{enr.amount} ج.م</td>
                    <td className="p-4 text-ink-500 dark:text-ink-400">{enr.paymentMethod || 'غير محدد'}</td>
                    <td className="p-4 text-ink-500 dark:text-ink-400">{new Date(enr.createdAt).toLocaleDateString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. قسم إدارة الإيصالات (Enrollments)
// ==========================================
function EnrollmentsTab() {
  const { enrollments, updateEnrollmentStatus } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const filtered = enrollments.filter(e => filter === 'all' ? true : e.status === filter).reverse();

  const handleStatusUpdate = (id: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected') {
      const note = prompt('ما هو سبب الرفض؟ (سيظهر للطالب)');
      if (note !== null) updateEnrollmentStatus(id, status, note);
    } else {
      updateEnrollmentStatus(id, status);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-black text-ink-900 dark:text-white">مراجعة الإيصالات</h2>
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 bg-white/50 dark:bg-[#171a36]/50 p-1 rounded-xl w-max">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`rounded-lg px-4 py-2.5 text-sm font-bold transition-all shrink-0 ${filter === f ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300' : 'text-ink-600 hover:bg-ink-50 dark:text-ink-400 dark:hover:bg-white/5'}`}
              >
                {f === 'all' ? 'الكل' : f === 'pending' ? 'معلق' : f === 'approved' ? 'مقبول' : 'مرفوض'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full py-10 text-center font-bold text-ink-500">لا توجد طلبات هنا.</div>
        ) : (
          filtered.map((enr) => {
            const enrollDate = new Date(enr.createdAt);
            return (
              <div key={enr.id} className="flex flex-col rounded-3xl border border-ink-200 bg-white/70 p-4 sm:p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-ink-900 dark:text-white truncate">{enr.studentName}</h3>
                    <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">بانتظار المراجعة</p>
                  </div>
                  <div className="shrink-0"><StatusBadge status={enr.status} /></div>
                </div>

                <div className="mb-4 space-y-2.5 rounded-2xl bg-ink-50 p-4 text-sm dark:bg-ink-900/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ink-500 dark:text-ink-400 shrink-0">الكورس:</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400 truncate text-left">{enr.courseTitle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500 dark:text-ink-400">الدفع:</span>
                    <span className="font-bold text-ink-900 dark:text-white">{enr.paymentMethod || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500 dark:text-ink-400">الحساب:</span>
                    <span className="font-bold text-ink-900 dark:text-white truncate max-w-[120px]" dir="ltr">{enr.paymentAccount || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-ink-200 pt-3 mt-1 dark:border-ink-700">
                    <span className="text-xs text-ink-500 dark:text-ink-400">التاريخ:</span>
                    <span className="text-xs font-bold text-ink-900 dark:text-white">
                      {enrollDate.toLocaleDateString('ar-EG')} - {enrollDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="mb-4 aspect-video w-full overflow-hidden rounded-2xl border border-ink-100 bg-ink-100 dark:border-white/5 dark:bg-ink-900">
                  {enr.receiptUrl ? (
                    <a href={enr.receiptUrl} target="_blank" rel="noopener noreferrer">
                      <img src={enr.receiptUrl} alt="الإيصال" className="h-full w-full object-cover transition-transform hover:scale-105" />
                    </a>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-bold text-ink-400">بدون صورة إيصال</div>
                  )}
                </div>

                <div className="mt-auto flex gap-3 border-t border-ink-100 pt-4 dark:border-white/5">
                  {enr.status !== 'approved' && (
                    <button onClick={() => handleStatusUpdate(enr.id, 'approved')} className="flex-1 rounded-xl bg-emerald-100 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">قبول</button>
                  )}
                  {enr.status !== 'rejected' && (
                    <button onClick={() => handleStatusUpdate(enr.id, 'rejected')} className="flex-1 rounded-xl bg-red-100 py-3 text-sm font-bold text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">رفض</button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. قسم إدارة الكورسات والمحتوى (Courses)
// ==========================================
function CoursesTab() {
  const { courses, enrollments, addCourse, addLesson, deleteCourse, deleteLesson } = useApp();
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);

  const [newCourse, setNewCourse] = useState({ title: '', description: '', stage: 'primary', grade: '', subject: '', price: '', coverImage: '' });
  const [newLesson, setNewLesson] = useState<{
    title: string; videoUrl: string; type: string; passingScore: number;
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
      const { error } = await supabase.storage.from('receipts').upload(`quizzes/${fileName}`, file);
      if (error) throw error;
      const { data } = supabase.storage.from('receipts').getPublicUrl(`quizzes/${fileName}`);
      const qs = [...newLesson.questions];
      qs[qIdx].image = data.publicUrl;
      setNewLesson({ ...newLesson, questions: qs });
    } catch (err: any) { alert(`حدث خطأ: ${err.message}`); } finally { setUploadingImageIdx(null); }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-black text-ink-900 dark:text-white">الكورسات والمحتوى</h2>
        <button onClick={() => setShowAddCourse(true)} className="btn-primary w-full sm:w-auto justify-center py-3 sm:py-2.5">
          <PlusCircle className="h-5 w-5" /> إضافة كورس
        </button>
      </div>

      {/* نافذة إضافة كورس (Bottom Sheet للموبايل) */}
      {showAddCourse && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setShowAddCourse(false)}></div>
          <div className="relative w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl flex flex-col overflow-hidden rounded-t-[2rem] sm:rounded-3xl bg-white shadow-2xl dark:bg-[#171a36] animate-slide-up sm:animate-fade-in">
            <div className="flex shrink-0 items-center justify-between bg-gradient-to-l from-brand-600 to-brand-800 p-5 sm:p-6 text-white">
              <h3 className="flex items-center gap-3 text-xl font-black"><PlusCircle className="h-6 w-6" /> كورس جديد</h3>
              <button onClick={() => setShowAddCourse(false)} className="rounded-full bg-white/20 p-2"><XCircle className="h-6 w-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-ink-700 dark:text-ink-300">اسم الكورس</label>
                    <input required type="text" className="input-field w-full" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-ink-700 dark:text-ink-300">السعر (ج.م)</label>
                    <input required type="number" className="input-field w-full" value={newCourse.price} onChange={e => setNewCourse({ ...newCourse, price: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-ink-700 dark:text-ink-300">المرحلة الدراسية</label>
                    <select required className="input-field w-full" value={newCourse.stage} onChange={e => setNewCourse({ ...newCourse, stage: e.target.value })}>
                      <option value="primary">الابتدائية</option><option value="preparatory">الإعدادية</option><option value="secondary">الثانوية</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-ink-700 dark:text-ink-300">الصف الدراسي</label>
                    <input required type="text" className="input-field w-full" value={newCourse.grade} onChange={e => setNewCourse({ ...newCourse, grade: e.target.value })} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-bold text-ink-700 dark:text-ink-300">رابط صورة الغلاف</label>
                    <input type="url" className="input-field w-full text-left" dir="ltr" value={newCourse.coverImage} onChange={e => setNewCourse({ ...newCourse, coverImage: e.target.value })} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-bold text-ink-700 dark:text-ink-300">الوصف</label>
                    <textarea required className="input-field w-full min-h-[100px]" value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} />
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-ink-100 dark:border-white/10 flex flex-col sm:flex-row gap-3">
                  <button type="submit" className="btn-primary w-full py-3.5 sm:py-2.5 justify-center"><Save className="mr-2 h-5 w-5" /> حفظ ونشر</button>
                  <button type="button" onClick={() => setShowAddCourse(false)} className="btn-outline w-full py-3.5 sm:py-2.5 justify-center">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {courses.map(course => {
          const courseEnrs = enrollments.filter(e => e.courseId === course.id && e.status === 'approved');
          const courseRevenue = courseEnrs.reduce((sum, e) => sum + Number(e.amount), 0);

          return (
            <div key={course.id} className="overflow-hidden rounded-3xl border border-ink-200 bg-white/70 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              {/* هيدر الكورس (ترتيب عمودي للموبايل) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-100 p-4 sm:p-6 dark:border-white/5">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <img src={course.coverImage} alt={course.title} className="w-full aspect-[2/1] sm:aspect-square sm:w-20 sm:h-20 rounded-2xl object-cover shadow-sm" />
                  <div className="flex flex-col justify-center">
                    <h3 className="text-lg font-black text-ink-900 dark:text-white line-clamp-2">{course.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                      <span className="bg-brand-50 text-brand-700 px-2 py-1 rounded-md dark:bg-brand-900/30 dark:text-brand-300">السعر: {course.price}</span>
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md dark:bg-emerald-900/30 dark:text-emerald-300">الأرباح: {courseRevenue}</span>
                      <span className="bg-ink-100 text-ink-700 px-2 py-1 rounded-md dark:bg-ink-800 dark:text-ink-300">الطلاب: {courseEnrs.length}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => setAddingLessonTo(addingLessonTo === course.id ? null : course.id)} className="flex-1 sm:flex-none justify-center flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 sm:py-2 text-sm font-bold text-brand-700 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400">
                    <PlusCircle className="h-4 w-4" /> المحتوى
                  </button>
                  <button onClick={() => { if (window.confirm('حذف الكورس نهائياً؟')) deleteCourse(course.id); }} className="flex-1 sm:flex-none justify-center flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 sm:py-2 text-sm font-bold text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
                    <Trash2 className="h-4 w-4" /> حذف
                  </button>
                </div>
              </div>

              {/* قسم إضافة محتوى (مصمم للموبايل) */}
              {addingLessonTo === course.id && (
                <div className="bg-brand-50/50 p-4 sm:p-6 border-b border-ink-100 dark:border-white/5 dark:bg-brand-900/10">
                  <div className="mb-4 flex items-center gap-2 text-brand-700 dark:text-brand-300">
                    <Video className="h-5 w-5" /> <h4 className="font-bold">إضافة محتوى جديد</h4>
                  </div>
                  <form onSubmit={(e) => handleAddLesson(course.id, e)} className="space-y-4">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink-600 dark:text-ink-400">العنوان</label>
                        <input required type="text" className="input-field w-full" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink-600 dark:text-ink-400">النوع</label>
                        <select className="input-field w-full" value={newLesson.type} onChange={e => setNewLesson({ ...newLesson, type: e.target.value, videoUrl: '', questions: [] })}>
                          <option value="video">فيديو</option><option value="pdf">ملف PDF</option><option value="quiz">اختبار</option>
                        </select>
                      </div>
                      {newLesson.type !== 'quiz' ? (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-ink-600 dark:text-ink-400">الرابط</label>
                          <input required type="url" className="input-field w-full text-left" dir="ltr" value={newLesson.videoUrl} onChange={e => setNewLesson({ ...newLesson, videoUrl: e.target.value })} />
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-brand-600 dark:text-brand-400">نسبة النجاح (%)</label>
                          <input required type="number" min="1" max="100" className="input-field w-full border-brand-300 bg-brand-50 dark:border-brand-700 dark:bg-brand-900/30" value={newLesson.passingScore} onChange={e => setNewLesson({ ...newLesson, passingScore: Number(e.target.value) })} />
                        </div>
                      )}
                    </div>

                    {/* بناء الاختبار */}
                    {newLesson.type === 'quiz' && (
                      <div className="mt-4 border-t border-brand-200 pt-4 dark:border-brand-800">
                        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                          <h5 className="font-bold flex items-center gap-2"><Brain className="h-5 w-5 text-brand-600" /> أسئلة الاختبار</h5>
                          <button type="button" onClick={() => setNewLesson({ ...newLesson, questions: [...newLesson.questions, { text: '', image: '', options: ['', '', '', ''], correctOptionIndex: 0 }] })} className="btn-primary py-2.5 sm:py-2 text-sm justify-center w-full sm:w-auto"><Plus className="h-4 w-4" /> إضافة سؤال</button>
                        </div>
                        <div className="space-y-4">
                          {newLesson.questions.map((q, qIdx) => (
                            <div key={qIdx} className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-ink-900/50">
                              <div className="mb-4 flex items-center justify-between">
                                <span className="font-black text-brand-600 text-sm">السؤال {qIdx + 1}</span>
                                <button type="button" onClick={() => { const qs = [...newLesson.questions]; qs.splice(qIdx, 1); setNewLesson({ ...newLesson, questions: qs }); }} className="text-red-500 p-1"><Trash2 className="h-5 w-5" /></button>
                              </div>
                              <div className="space-y-4">
                                <input required type="text" placeholder="اكتب السؤال هنا..." className="input-field w-full font-bold" value={q.text} onChange={e => { const qs = [...newLesson.questions]; qs[qIdx].text = e.target.value; setNewLesson({ ...newLesson, questions: qs }); }} />
                                <div className="flex flex-col sm:flex-row gap-3">
                                  {q.image && <img src={q.image} alt="Q" className="h-24 w-full sm:w-24 object-cover rounded-xl" />}
                                  <label className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 p-4 text-xs font-bold text-ink-500 cursor-pointer dark:border-white/10 dark:bg-ink-800">
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) uploadQuestionImage(e.target.files[0], qIdx); }} />
                                    {uploadingImageIdx === qIdx ? 'جاري الرفع...' : <><Upload className="h-5 w-5" /> رفع صورة مساعدة</>}
                                  </label>
                                </div>
                                <div className="grid gap-2 grid-cols-1">
                                  {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className={`flex items-center gap-3 rounded-xl border p-2 pl-3 ${q.correctOptionIndex === optIdx ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-900/20' : 'border-ink-100 dark:border-white/5'}`}>
                                      <input type="radio" name={`correct-${qIdx}`} className="h-5 w-5 accent-emerald-600 shrink-0" checked={q.correctOptionIndex === optIdx} onChange={() => { const qs = [...newLesson.questions]; qs[qIdx].correctOptionIndex = optIdx; setNewLesson({ ...newLesson, questions: qs }); }} />
                                      <input required type="text" placeholder={`اختيار ${optIdx + 1}`} className="flex-1 w-full bg-transparent text-sm font-bold outline-none dark:text-white" value={opt} onChange={e => { const qs = [...newLesson.questions]; qs[qIdx].options[optIdx] = e.target.value; setNewLesson({ ...newLesson, questions: qs }); }} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <button type="submit" className="btn-primary w-full py-3.5 sm:py-2.5 justify-center mt-4"><Save className="mr-2 h-5 w-5" /> حفظ المحتوى</button>
                  </form>
                </div>
              )}

              {/* قائمة الدروس الحالية */}
              <div className="p-4 sm:p-6">
                <h4 className="mb-3 text-sm font-bold text-ink-500 dark:text-ink-400">محتوى الكورس المتاح:</h4>
                {course.lessons && course.lessons.length > 0 ? (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {course.lessons.map((lesson, idx) => (
                      <div key={lesson.id} className="flex items-center justify-between rounded-2xl border border-ink-100 bg-ink-50 p-3 dark:border-white/5 dark:bg-ink-900/50">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-ink-500 shadow-sm dark:bg-[#171a36]"><PlayCircle className="h-5 w-5" /></div>
                          <span className="truncate text-sm font-bold text-ink-900 dark:text-white">{idx + 1}. {lesson.title}</span>
                        </div>
                        <button onClick={() => { if (window.confirm('حذف المحتوى؟')) deleteLesson(course.id, lesson.id); }} className="text-red-500 p-2"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-ink-200 p-6 text-center text-sm font-bold text-ink-400 dark:border-white/10">لا يوجد محتوى حالياً.</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 4. قسم إدارة الطلاب (Students)
// ==========================================
function StudentsTab() {
  const { users, courses, enrollments, progress, resetStudentPassword, toggleStudentAccess, adminEnrollStudent } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [manualCourseId, setManualCourseId] = useState('');

  const students = users.filter((u) => u.role === 'student');
  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.phone?.includes(searchQuery) || s.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const getStudentProgress = (studentId: string, courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course || course.lessons.length === 0) return 0;
    const completed = progress.filter(p => p.userId === studentId && p.courseId === courseId && p.completed).length;
    return Math.round((completed / course.lessons.length) * 100);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black text-ink-900 dark:text-white">إدارة الطلاب</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input type="text" placeholder="بحث بالاسم، الإيميل..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field w-full pr-10 py-3 sm:py-2.5" />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map(student => {
          const isBanned = student.password === '__DISABLED__';
          return (
            <div key={student.id} className="flex flex-col rounded-3xl border border-ink-200 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-black text-brand-600 dark:bg-brand-900/50">{student.name.charAt(0)}</div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate text-base font-bold text-ink-900 dark:text-white">{student.name}</h3>
                  <p className="truncate text-xs text-ink-500" dir="ltr">{student.email}</p>
                </div>
                {isBanned && <ShieldAlert className="h-6 w-6 text-red-500 shrink-0" />}
              </div>
              <button onClick={() => setSelectedStudent(student)} className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 py-3 text-sm font-bold text-ink-700 hover:bg-brand-50 dark:border-white/10 dark:text-ink-300 dark:hover:bg-brand-900/20">
                <Eye className="h-4 w-4" /> عرض وتحكم
              </button>
            </div>
          );
        })}
      </div>

      {/* نافذة تحكم الطالب (Bottom Sheet للموبايل) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}></div>
          <div className="relative w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-xl flex flex-col overflow-hidden rounded-t-[2rem] sm:rounded-3xl bg-white shadow-2xl dark:bg-[#171a36] animate-slide-up sm:animate-fade-in">
            <div className="flex shrink-0 items-center justify-between bg-gradient-to-l from-brand-600 to-brand-800 p-5 sm:p-6 text-white">
              <h2 className="text-xl font-black truncate">{selectedStudent.name}</h2>
              <button onClick={() => setSelectedStudent(null)} className="rounded-full bg-white/20 p-2"><XCircle className="h-6 w-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900/50 dark:bg-brand-900/10">
                <h4 className="mb-3 text-sm font-bold text-ink-900 dark:text-white flex items-center gap-2"><Plus className="h-5 w-5 text-brand-600" /> إضافة كورس للطالب (تفعيل مباشر)</h4>
                <div className="flex flex-col gap-3">
                  <select className="input-field w-full" value={manualCourseId} onChange={(e) => setManualCourseId(e.target.value)}>
                    <option value="">اختر كورس...</option>
                    {courses.filter(c => !enrollments.some(e => e.studentId === selectedStudent.id && e.courseId === c.id)).map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <button onClick={() => { if (manualCourseId) { adminEnrollStudent(selectedStudent.id, manualCourseId); setManualCourseId(''); } }} disabled={!manualCourseId} className="btn-primary w-full justify-center py-3">تفعيل الكورس</button>
                </div>
              </div>

              <h3 className="mb-3 text-lg font-black text-ink-900 dark:text-white">الكورسات الحالية</h3>
              <div className="space-y-3">
                {enrollments.filter(e => e.studentId === selectedStudent.id).length === 0 ? (
                  <div className="text-sm font-bold text-ink-400 text-center py-4 border border-dashed rounded-xl border-ink-200 dark:border-white/10">لا يوجد اشتراكات.</div>
                ) : (
                  enrollments.filter(e => e.studentId === selectedStudent.id).map(enr => {
                    const prog = getStudentProgress(selectedStudent.id, enr.courseId);
                    return (
                      <div key={enr.id} className="rounded-2xl border border-ink-100 bg-ink-50 p-4 dark:border-white/5 dark:bg-ink-900/50">
                        <div className="flex flex-col sm:flex-row gap-2 justify-between mb-3">
                          <span className="font-bold text-sm text-ink-900 dark:text-white">{enr.courseTitle}</span>
                          <StatusBadge status={enr.status} />
                        </div>
                        {enr.status === 'approved' && (
                          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800"><div className="h-full bg-brand-500" style={{ width: `${prog}%` }}></div></div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-ink-100 pt-6 dark:border-white/10">
                <button onClick={() => { const newPass = prompt('الباسوورد الجديد:'); if (newPass) resetStudentPassword(selectedStudent.id, newPass); }} className="flex items-center justify-center gap-2 rounded-xl bg-ink-100 py-3.5 sm:py-3 text-sm font-bold text-ink-700 dark:bg-ink-800 dark:text-ink-300"><Lock className="h-4 w-4" /> تغيير الباسوورد</button>
                <button onClick={() => { if (window.confirm('متأكد من تغيير حالة الحساب؟')) toggleStudentAccess(selectedStudent.id); }} className={`flex items-center justify-center gap-2 rounded-xl py-3.5 sm:py-3 text-sm font-bold text-white ${selectedStudent.password === '__DISABLED__' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                  {selectedStudent.password === '__DISABLED__' ? <><Unlock className="h-4 w-4" /> تفعيل الحساب</> : <><ShieldAlert className="h-4 w-4" /> حظر الطالب</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. قسم إدارة الإشعارات (Announcements)
// ==========================================
function AnnouncementsTab() {
  const { announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement } = useApp();
  const [newAnnouncement, setNewAnnouncement] = useState('');

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl sm:text-2xl font-black text-ink-900 dark:text-white">إدارة الإشعارات</h2>
      <form onSubmit={(e) => { e.preventDefault(); if (newAnnouncement.trim()) { addAnnouncement(newAnnouncement); setNewAnnouncement(''); } }} className="flex flex-col sm:flex-row gap-3 rounded-3xl border border-ink-200 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        <input type="text" value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} placeholder="اكتب إشعاراً للطلاب..." className="input-field w-full flex-1 py-3" required />
        <button type="submit" className="btn-primary w-full sm:w-auto py-3 justify-center"><Bell className="mr-2 h-5 w-5" /> إرسال الإشعار</button>
      </form>
      <div className="space-y-3">
        {announcements.map((ann) => (
          <div key={ann.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-ink-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#171a36]">
            <div className="flex items-start gap-3">
              <div className={`h-3 w-3 mt-1 shrink-0 rounded-full ${ann.active ? 'bg-emerald-500 animate-pulse' : 'bg-ink-300'}`}></div>
              <p className={`font-bold text-sm leading-relaxed ${ann.active ? 'text-ink-900 dark:text-white' : 'text-ink-500 line-through'}`}>{ann.text}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={() => toggleAnnouncement(ann.id)} className={`flex-1 sm:flex-none rounded-xl px-4 py-2.5 text-xs font-bold ${ann.active ? 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'}`}>{ann.active ? 'إيقاف' : 'تفعيل'}</button>
              <button onClick={() => deleteAnnouncement(ann.id)} className="flex-1 sm:flex-none rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 dark:bg-red-900/20">حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 🚀 الملف الرئيسي
// ==========================================
export function AdminDashboard() {
  const { user, enrollments } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollments' | 'courses' | 'students' | 'announcements'>('overview');

  if (user?.role !== 'admin') {
    return <div className="flex min-h-screen items-center justify-center font-bold text-red-500">غير مصرح بالدخول</div>;
  }

  const pendingCount = enrollments.filter((e) => e.status === 'pending').length;

  return (
    <div className="min-h-screen bg-ink-50 font-sans transition-colors duration-500 dark:bg-[#0f1123]">
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-brand-500/10 blur-[150px] dark:bg-brand-600/10"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 space-y-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-ink-900 dark:text-white">
              لوحة <span className="text-brand-600 dark:text-brand-400">التحكم</span>
            </h1>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">إدارة شاملة لجميع بيانات المنصة.</p>
          </div>

          {/* شريط الأقسام مع دعم التمرير الكامل على الموبايل */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 bg-white/50 dark:bg-white/5 p-1.5 rounded-2xl shadow-sm backdrop-blur-md w-max">
              {[
                { id: 'overview', icon: LayoutDashboard, label: 'الرئيسية' },
                { id: 'enrollments', icon: Receipt, label: 'الطلبات', badge: pendingCount },
                { id: 'courses', icon: BookOpen, label: 'الكورسات' },
                { id: 'students', icon: Users, label: 'الطلاب' },
                { id: 'announcements', icon: Bell, label: 'الإشعارات' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 sm:py-2.5 text-sm font-bold transition-all ${activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-ink-600 hover:bg-white dark:text-ink-300 dark:hover:bg-white/10'
                    }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.badge ? (
                    <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#f01c6d] text-[10px] text-white border-2 border-white dark:border-[#0f1123]">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pb-16 sm:pb-10">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'enrollments' && <EnrollmentsTab />}
          {activeTab === 'courses' && <CoursesTab />}
          {activeTab === 'students' && <StudentsTab />}
          {activeTab === 'announcements' && <AnnouncementsTab />}
        </div>
      </div>
    </div>
  );
}