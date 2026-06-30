import { useState, useMemo } from 'react';
import {
  Users, BookOpen, Receipt, DollarSign,
  CheckCircle2, XCircle, Search, ShieldAlert,
  PlayCircle, PlusCircle, Trash2, Eye, Lock, Unlock,
  GraduationCap, Bell, LayoutDashboard, FileText, Brain, Save, Plus,
  Image as ImageIcon, Video, Link as LinkIcon, Upload
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { StatusBadge } from '../components/ui';
import { supabase } from '../lib/supabase';

export function AdminDashboard() {
  const {
    user, courses, enrollments, users, progress, announcements,
    updateEnrollmentStatus, addCourse, addLesson, deleteCourse, deleteLesson,
    resetStudentPassword, toggleStudentAccess, addAnnouncement, toggleAnnouncement, deleteAnnouncement,
    adminEnrollStudent
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'enrollments' | 'courses' | 'students' | 'announcements'>('overview');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollmentFilter, setEnrollmentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [manualCourseId, setManualCourseId] = useState('');

  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', stage: 'primary', grade: '', subject: '', price: '', coverImage: '' });
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);

  const [newLesson, setNewLesson] = useState<{
    title: string;
    videoUrl: string;
    type: string;
    questions: { text: string; image?: string; options: string[]; correctOptionIndex: number }[];
  }>({ title: '', videoUrl: '', type: 'video', questions: [] });

  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [uploadingImageIdx, setUploadingImageIdx] = useState<number | null>(null);

  if (user?.role !== 'admin') {
    return <div className="flex min-h-screen items-center justify-center font-bold text-red-500">غير مصرح لك بالدخول</div>;
  }

  const students = users.filter((u) => u.role === 'student');
  const pendingEnrollments = enrollments.filter((e) => e.status === 'pending');
  const approvedEnrollments = enrollments.filter((e) => e.status === 'approved');

  const totalRevenue = approvedEnrollments.reduce((sum, enr) => sum + (Number(enr.amount) || 0), 0);
  const totalCompletedLessons = progress.filter(p => p.completed).length;

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone?.includes(searchQuery) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(e => enrollmentFilter === 'all' ? true : e.status === enrollmentFilter).reverse();

  const getStudentProgress = (studentId: string, courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course || course.lessons.length === 0) return 0;
    const completedInCourse = progress.filter(p => p.userId === studentId && p.courseId === courseId && p.completed).length;
    return Math.round((completedInCourse / course.lessons.length) * 100);
  };

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
    setNewLesson({ title: '', videoUrl: '', type: 'video', questions: [] });
    setAddingLessonTo(null);
  };

  const handleStatusUpdate = (id: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected') {
      const note = prompt('ما هو سبب الرفض؟ (سيظهر للطالب)');
      if (note !== null) updateEnrollmentStatus(id, status, note);
    } else {
      updateEnrollmentStatus(id, status);
    }
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
    <div className="min-h-screen bg-ink-50 font-sans transition-colors duration-500 dark:bg-[#0f1123]">
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-brand-500/10 blur-[150px] dark:bg-brand-600/10"></div>
      <div className="pointer-events-none absolute left-0 top-1/3 h-[500px] w-[500px] rounded-full bg-[#f01c6d]/5 blur-[120px] dark:bg-[#f01c6d]/10"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-black text-ink-900 dark:text-white">
              لوحة <span className="text-brand-600 dark:text-brand-400">التحكم</span>
            </h1>
            <p className="mt-2 text-ink-500 dark:text-ink-400">نظرة شاملة وتحكم كامل في جميع أقسام المنصة.</p>
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl bg-white/50 p-2 shadow-sm backdrop-blur-md dark:bg-white/5">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'نظرة عامة' },
              { id: 'enrollments', icon: Receipt, label: 'الطلبات', badge: pendingEnrollments.length },
              { id: 'courses', icon: BookOpen, label: 'إدارة الكورسات' },
              { id: 'students', icon: Users, label: 'الطلاب' },
              { id: 'announcements', icon: Bell, label: 'الإشعارات' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-ink-600 hover:bg-white dark:text-ink-300 dark:hover:bg-white/10'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.badge ? (
                  <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#f01c6d] text-[10px] text-white">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* 1: Overview */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in space-y-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'إجمالي الأرباح', value: `${totalRevenue.toLocaleString()} ج.م`, icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                { title: 'إجمالي الطلاب', value: students.length, icon: Users, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-500/10' },
                { title: 'دروس مكتملة', value: totalCompletedLessons, icon: CheckCircle2, color: 'text-[#f01c6d]', bg: 'bg-[#f01c6d]/10' },
                { title: 'طلبات معلقة', value: pendingEnrollments.length, icon: Receipt, color: 'text-gold-600 dark:text-gold-400', bg: 'bg-gold-50 dark:bg-gold-500/10' }
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center gap-4 rounded-[2rem] border border-ink-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/5">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-ink-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm font-bold text-ink-500 dark:text-ink-400">{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="mb-4 text-xl font-black text-ink-900 dark:text-white">أحدث طلبات الاشتراك الناجحة</h2>
              <div className="overflow-hidden rounded-[2rem] border border-ink-200 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="border-b border-ink-200 bg-ink-50/50 dark:border-white/10 dark:bg-white/5">
                      <tr>
                        <th className="p-4 font-bold text-ink-600 dark:text-ink-300">الطالب</th>
                        <th className="p-4 font-bold text-ink-600 dark:text-ink-300">الكورس</th>
                        <th className="p-4 font-bold text-ink-600 dark:text-ink-300">المبلغ</th>
                        <th className="p-4 font-bold text-ink-600 dark:text-ink-300">طريقة الدفع</th>
                        <th className="p-4 font-bold text-ink-600 dark:text-ink-300">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedEnrollments.slice(-5).reverse().map(enr => (
                        <tr key={enr.id} className="border-b border-ink-100 last:border-0 dark:border-white/5">
                          <td className="p-4 font-bold text-ink-900 dark:text-white">{enr.studentName}</td>
                          <td className="p-4 text-ink-600 dark:text-ink-300">{enr.courseTitle}</td>
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
        )}

        {/* 2: Enrollments */}
        {activeTab === 'enrollments' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-ink-900 dark:text-white">مراجعة الإيصالات</h2>
              <div className="flex gap-2 rounded-xl bg-white p-1 shadow-sm dark:bg-[#171a36]">
                {['all', 'pending', 'approved', 'rejected'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setEnrollmentFilter(filter as any)}
                    className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${enrollmentFilter === filter
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300'
                      : 'text-ink-600 hover:bg-ink-50 dark:text-ink-400 dark:hover:bg-white/5'
                      }`}
                  >
                    {filter === 'all' ? 'الكل' : filter === 'pending' ? 'معلق' : filter === 'approved' ? 'مقبول' : 'مرفوض'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEnrollments.length === 0 ? (
                <div className="col-span-full py-10 text-center text-ink-500">لا توجد طلبات في هذا القسم.</div>
              ) : (
                filteredEnrollments.map((enr) => {
                  const enrollDate = new Date(enr.createdAt);

                  return (
                    <div key={enr.id} className="flex flex-col rounded-[2rem] border border-ink-200 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-ink-900 dark:text-white">{enr.studentName}</h3>
                          <p className="text-xs text-ink-500 dark:text-ink-400">بانتظار المراجعة</p>
                        </div>
                        <StatusBadge status={enr.status} />
                      </div>

                      <div className="mb-4 space-y-2 rounded-xl bg-ink-50 p-3 text-sm dark:bg-ink-900/50">
                        <div className="flex items-center justify-between">
                          <span className="text-ink-500 dark:text-ink-400">الكورس المطلوب:</span>
                          <span className="font-bold text-brand-600 dark:text-brand-400 line-clamp-1 max-w-[150px] text-left">{enr.courseTitle}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-ink-500 dark:text-ink-400">وسيلة الدفع:</span>
                          <span className="font-bold text-ink-900 dark:text-white">{enr.paymentMethod || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-ink-500 dark:text-ink-400">رقم / حساب التحويل:</span>
                          <span className="font-bold text-ink-900 dark:text-white" dir="ltr">{enr.paymentAccount || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-ink-200 pt-2 dark:border-ink-700">
                          <span className="text-ink-500 dark:text-ink-400">وقت الإرسال:</span>
                          <span className="font-bold text-ink-900 dark:text-white">
                            {enrollDate.toLocaleDateString('ar-EG')} - {enrollDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl border border-ink-100 bg-ink-50 dark:border-white/5 dark:bg-ink-900/50">
                        {enr.receiptUrl ? (
                          <a href={enr.receiptUrl} target="_blank" rel="noopener noreferrer">
                            <img src={enr.receiptUrl} alt="الإيصال" className="h-full w-full object-cover transition-transform hover:scale-105" />
                          </a>
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-bold text-ink-400">
                            بدون إيصال (مجانياً أو يدوياً)
                          </div>
                        )}
                      </div>

                      <div className="mt-auto flex gap-2 border-t border-ink-100 pt-4 dark:border-white/5">
                        {enr.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusUpdate(enr.id, 'approved')}
                            className="flex-1 rounded-xl bg-emerald-100 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                          >
                            قبول
                          </button>
                        )}
                        {enr.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusUpdate(enr.id, 'rejected')}
                            className="flex-1 rounded-xl bg-red-100 py-2 text-sm font-bold text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                          >
                            رفض
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 3: Courses */}
        {activeTab === 'courses' && (
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

                    {addingLessonTo === course.id && (
                      <div className="border-b border-ink-100 bg-brand-50/50 p-6 dark:border-white/5 dark:bg-brand-900/10">
                        <div className="mb-4 flex items-center gap-2 text-brand-700 dark:text-brand-300">
                          <Video className="h-5 w-5" />
                          <h4 className="font-bold">إضافة محتوى لـ ({course.title})</h4>
                        </div>
                        <form onSubmit={(e) => handleAddLesson(course.id, e)}>
                          <div className="grid gap-4 md:grid-cols-3">
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

                            {newLesson.type !== 'quiz' && (
                              <div className="space-y-1.5">
                                <label className="flex items-center gap-1 text-xs font-bold text-ink-600 dark:text-ink-300"><LinkIcon className="h-3 w-3" /> رابط الفيديو / الملف</label>
                                <input required type="url" placeholder="Youtube / Drive Link" className="input-field w-full" value={newLesson.videoUrl} onChange={e => setNewLesson({ ...newLesson, videoUrl: e.target.value })} />
                              </div>
                            )}
                          </div>

                          {newLesson.type === 'quiz' && (
                            <div className="mt-6 border-t border-brand-200/50 pt-6 dark:border-brand-900/50">
                              <div className="mb-4 flex items-center justify-between">
                                <div>
                                  <h5 className="font-bold text-ink-900 dark:text-white flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-brand-600 dark:text-brand-400" /> أسئلة الاختبار
                                  </h5>
                                  <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">أضف الأسئلة، ارفع صورة (اختياري)، وحدد الإجابة الصحيحة بالضغط على الدائرة.</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setNewLesson({ ...newLesson, questions: [...newLesson.questions, { text: '', image: '', options: ['', '', '', ''], correctOptionIndex: 0 }] })}
                                  className="btn-outline py-2 text-xs"
                                >
                                  <Plus className="mr-1 h-4 w-4" /> إضافة سؤال جديد
                                </button>
                              </div>

                              <div className="space-y-4">
                                {newLesson.questions.map((q, qIdx) => (
                                  <div key={qIdx} className="rounded-[1.5rem] border border-ink-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-ink-900/50">
                                    <div className="mb-4 flex items-center justify-between">
                                      <span className="flex items-center gap-2 font-black text-brand-600 dark:text-brand-400">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs dark:bg-brand-900/50">{qIdx + 1}</span>
                                        السؤال
                                      </span>
                                      <button type="button" onClick={() => {
                                        const qs = [...newLesson.questions];
                                        qs.splice(qIdx, 1);
                                        setNewLesson({ ...newLesson, questions: qs });
                                      }} className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30">
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
                                              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 px-4 py-4 text-sm font-bold text-ink-500 transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-white/10 dark:bg-ink-900/50 dark:text-ink-400 dark:hover:border-brand-500/50"
                                            >
                                              {uploadingImageIdx === qIdx ? (
                                                <span className="animate-pulse text-brand-600 dark:text-brand-400">جاري الرفع...</span>
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

                                      {q.options.map((opt, optIdx) => (
                                        <div key={optIdx} className={`flex items-center gap-3 rounded-xl border p-2 pl-3 transition-colors ${q.correctOptionIndex === optIdx ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-500/50 dark:bg-emerald-900/20' : 'border-ink-100 dark:border-white/5'}`}>
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
                                ))}
                                {newLesson.questions.length === 0 && (
                                  <div className="rounded-xl border border-dashed border-brand-200 py-8 text-center text-sm font-bold text-brand-600 dark:border-brand-900/50 dark:text-brand-400">
                                    اضغط على زر (إضافة سؤال جديد) للبدء في بناء الاختبار
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-6 flex justify-end">
                            <button type="submit" className="btn-primary py-2.5 shadow-md"><Save className="mr-2 h-4 w-4" /> حفظ المحتوى ونشره</button>
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
        )}

        {/* 4: Students */}
        {activeTab === 'students' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-ink-900 dark:text-white">إدارة الطلاب</h2>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الإيميل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field w-72 pr-10"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map(student => {
                const studentEnrollments = enrollments.filter(e => e.studentId === student.id && e.status === 'approved');
                const isBanned = student.password === '__DISABLED__';

                return (
                  <div key={student.id} className="group flex flex-col rounded-[2rem] border border-ink-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-md dark:border-white/10 dark:bg-white/5">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-black text-brand-600 dark:bg-brand-900/50 dark:text-brand-300">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h3 className="truncate text-lg font-bold text-ink-900 dark:text-white">{student.name}</h3>
                        <p className="truncate text-xs text-ink-500 dark:text-ink-400">{student.email}</p>
                      </div>
                      {isBanned && <span title="محظور"><ShieldAlert className="h-5 w-5 text-red-500" /></span>}
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-2 text-center text-sm">
                      <div className="rounded-xl bg-ink-50 py-2 dark:bg-ink-900/50">
                        <span className="block font-black text-ink-900 dark:text-white">{studentEnrollments.length}</span>
                        <span className="text-xs text-ink-500">كورسات</span>
                      </div>
                      <div className="rounded-xl bg-ink-50 py-2 dark:bg-ink-900/50">
                        <span className="block font-black text-brand-600 dark:text-brand-400">
                          {progress.filter(p => p.userId === student.id && p.completed).length}
                        </span>
                        <span className="text-xs text-ink-500">دروس مكتملة</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setManualCourseId('');
                      }}
                      className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 py-2.5 text-sm font-bold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:border-white/10 dark:text-ink-300 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
                    >
                      <Eye className="h-4 w-4" /> عرض وتحكم
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* المودال الشامل لبروفايل الطالب */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}></div>
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl dark:bg-[#171a36]">

              <div className="bg-gradient-to-l from-brand-600 to-brand-800 p-8 text-white">
                <button onClick={() => setSelectedStudent(null)} className="absolute left-6 top-6 rounded-full bg-white/20 p-2 hover:bg-white/30"><XCircle className="h-6 w-6" /></button>
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-3xl font-black backdrop-blur-md">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black">{selectedStudent.name}</h2>
                    <p className="opacity-80">{selectedStudent.email} | {selectedStudent.phone}</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-900/50 dark:bg-brand-900/10">
                  <h4 className="mb-3 font-bold text-ink-900 dark:text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-brand-600 dark:text-brand-400" /> إضافة كورس للطالب (مباشرة)
                  </h4>
                  <div className="flex gap-3">
                    <select
                      className="input-field flex-1"
                      value={manualCourseId}
                      onChange={(e) => setManualCourseId(e.target.value)}
                    >
                      <option value="">اختر كورس من القائمة...</option>
                      {courses.filter(c => !enrollments.some(e => e.studentId === selectedStudent.id && e.courseId === c.id)).map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (manualCourseId) {
                          adminEnrollStudent(selectedStudent.id, manualCourseId);
                          setManualCourseId('');
                        }
                      }}
                      disabled={!manualCourseId}
                      className="btn-primary"
                    >
                      إضافة وتفعيل
                    </button>
                  </div>
                </div>

                <h3 className="mb-4 text-xl font-black text-ink-900 dark:text-white">الكورسات المشترك بها</h3>
                <div className="max-h-[250px] space-y-4 overflow-y-auto pr-2">
                  {enrollments.filter(e => e.studentId === selectedStudent.id).length === 0 ? (
                    <p className="text-ink-500">لم يشترك في أي كورس بعد.</p>
                  ) : (
                    enrollments.filter(e => e.studentId === selectedStudent.id).map(enr => {
                      const prog = getStudentProgress(selectedStudent.id, enr.courseId);
                      return (
                        <div key={enr.id} className="rounded-xl border border-ink-200 p-4 dark:border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-ink-900 dark:text-white">{enr.courseTitle}</span>
                            <StatusBadge status={enr.status} />
                          </div>
                          {enr.status === 'approved' && (
                            <div>
                              <div className="mb-1 flex justify-between text-xs text-ink-500">
                                <span>نسبة الإنجاز</span>
                                <span>{prog}%</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                                <div className="h-full bg-brand-500" style={{ width: `${prog}%` }}></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-ink-100 pt-6 dark:border-white/10">
                  <button
                    onClick={() => {
                      const newPass = prompt('أدخل كلمة المرور الجديدة للطالب:');
                      if (newPass) resetStudentPassword(selectedStudent.id, newPass);
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-ink-100 py-3 text-sm font-bold text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"
                  >
                    <Lock className="h-4 w-4" /> تغيير الباسوورد
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من تغيير حالة حساب هذا الطالب؟')) toggleStudentAccess(selectedStudent.id);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-colors ${selectedStudent.password === '__DISABLED__' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {selectedStudent.password === '__DISABLED__' ? <><Unlock className="h-4 w-4" /> تفعيل الحساب</> : <><ShieldAlert className="h-4 w-4" /> حظر الطالب</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5: Announcements */}
        {activeTab === 'announcements' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-black text-ink-900 dark:text-white">إدارة الإشعارات</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newAnnouncement.trim()) {
                  addAnnouncement(newAnnouncement);
                  setNewAnnouncement('');
                }
              }}
              className="flex gap-4 rounded-[2rem] border border-ink-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
            >
              <input
                type="text"
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                placeholder="اكتب إشعاراً جديداً ليظهر للطلاب..."
                className="input-field flex-1"
                required
              />
              <button type="submit" className="btn-primary shrink-0"><Bell className="mr-2 h-4 w-4" /> إرسال الإشعار</button>
            </form>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#171a36]">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${ann.active ? 'bg-emerald-500 animate-pulse' : 'bg-ink-300'}`}></div>
                    <p className={`font-bold ${ann.active ? 'text-ink-900 dark:text-white' : 'text-ink-500 line-through'}`}>{ann.text}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAnnouncement(ann.id)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-bold ${ann.active ? 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'}`}
                    >
                      {ann.active ? 'إيقاف' : 'تفعيل'}
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}