import { useState, useEffect } from 'react';
import {
  Users, BookOpen, Receipt, DollarSign, CheckCircle2, XCircle, Search, ShieldAlert,
  PlayCircle, PlusCircle, Trash2, Eye, Lock, Unlock, GraduationCap, Bell, LayoutDashboard,
  FileText, Brain, Save, Plus, Image as ImageIcon, Video, Link as LinkIcon, Upload, Target,
  Edit3, EyeOff, Phone, ArrowUp, ArrowDown, Download
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { StatusBadge } from '../components/ui';
import { supabase } from '../lib/supabase';

// ==========================================
// 1. Overview
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
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'إجمالي الأرباح', value: `${totalRevenue.toLocaleString()} ج.م`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'إجمالي الطلاب', value: students.length, icon: Users, color: 'text-brand-600', bg: 'bg-brand-50' },
          { title: 'دروس مكتملة', value: totalCompletedLessons, icon: CheckCircle2, color: 'text-[#f01c6d]', bg: 'bg-[#f01c6d]/10' },
          { title: 'طلبات معلقة', value: pendingEnrollments.length, icon: Receipt, color: 'text-gold-600', bg: 'bg-gold-50' }
        ].map((stat, idx) => (
          <div key={idx} className="flex items-center gap-4 rounded-3xl sm:rounded-[2rem] border border-ink-200 bg-white/70 p-4 sm:p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl ${stat.bg}${stat.color}`}>
              <stat.icon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xl sm:text-2xl font-black text-ink-900 dark:text-white">{stat.value}</p>
              <p className="truncate text-xs sm:text-sm font-bold text-ink-500 dark:text-ink-400">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg sm:text-xl font-black text-ink-900 dark:text-white">أحدث طلبات الاشتراك الناجحة</h2>
        <div className="overflow-hidden rounded-3xl sm:rounded-[2rem] border border-ink-200 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full min-w-[600px] whitespace-nowrap text-right text-sm">
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
// 2. Enrollments
// ==========================================
function EnrollmentsTab() {
  const { enrollments, updateEnrollmentStatus, deleteEnrollments } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const activeEnrollments = enrollments.filter((e: any) => !e.isArchived);
  const filtered = activeEnrollments.filter((e: any) => filter === 'all' ? true : e.status === filter).reverse();

  useEffect(() => {
    setSelectedIds([]);
  }, [filter]);

  const handleStatusUpdate = (id: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected') {
      const note = prompt('ما هو سبب الرفض؟ (سيظهر للطالب)');
      if (note !== null) updateEnrollmentStatus(id, status, note);
    } else {
      updateEnrollmentStatus(id, status);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(e => e.id));
    }
  };

  const handleBulkDelete = async () => {
    const isApprovedSelected = selectedIds.some(id => enrollments.find(e => e.id === id)?.status === 'approved');
    const msg = isApprovedSelected
      ? `سيتم مسح الإيصالات المرفوضة نهائياً، وسيتم (أرشفة) الإيصالات المقبولة وإخفائها من هنا مع مسح الصورة لتوفير المساحة (دون طرد الطلاب من الكورسات).\n\nهل أنت متأكد؟`
      : `هل أنت متأكد من مسح (${selectedIds.length}) إيصال نهائياً؟`;

    if (window.confirm(msg)) {
      await deleteEnrollments(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-xl sm:text-2xl font-black text-ink-900 dark:text-white">مراجعة الإيصالات</h2>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {filtered.length > 0 && (
            <div className="flex items-center gap-3 bg-white dark:bg-[#171a36] p-1.5 rounded-xl shadow-sm border border-ink-100 dark:border-white/5">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-ink-700 dark:text-ink-300 px-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 accent-brand-600 rounded"
                />
                تحديد الكل
              </label>

              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" /> مسح / أرشفة ({selectedIds.length})
                </button>
              )}
            </div>
          )}

          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex w-max gap-2 rounded-xl bg-white p-1.5 shadow-sm dark:bg-[#171a36] border border-ink-100 dark:border-white/5">
              {['all', 'pending', 'approved', 'rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`rounded-lg px-4 py-2 text-sm font-bold transition-all shrink-0 ${filter === f ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300' : 'text-ink-600 hover:bg-ink-50 dark:text-ink-400 dark:hover:bg-white/5'
                    }`}
                >
                  {f === 'all' ? 'الكل' : f === 'pending' ? 'معلق' : f === 'approved' ? 'مقبول' : 'مرفوض'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full py-10 text-center text-sm font-bold text-ink-500">لا توجد طلبات هنا.</div>
        ) : (
          filtered.map((enr) => {
            const enrollDate = new Date(enr.createdAt);
            const statusText = enr.status === 'pending' ? 'بانتظار المراجعة' : enr.status === 'approved' ? 'مقبول' : 'مرفوض';

            return (
              <div key={enr.id} className={`flex flex-col rounded-[2rem] border p-4 sm:p-5 shadow-sm backdrop-blur-xl transition-all ${selectedIds.includes(enr.id) ? 'border-brand-500 bg-brand-50/30 dark:border-brand-500/50 dark:bg-brand-900/10' : 'border-ink-200 bg-white/70 dark:border-white/10 dark:bg-white/5'}`}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 overflow-hidden w-full">
                    <div className="pt-1 shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(enr.id)}
                        onChange={() => toggleSelection(enr.id)}
                        className="h-5 w-5 accent-brand-600 rounded border-ink-300 cursor-pointer shadow-sm"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="truncate font-bold text-ink-900 dark:text-white">{enr.studentName}</h3>
                      <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">{statusText}</p>
                    </div>
                  </div>
                  <div className="shrink-0"><StatusBadge status={enr.status} /></div>
                </div>

                <div className="mb-4 space-y-2 rounded-xl bg-ink-50 p-4 text-sm dark:bg-ink-900/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ink-500 dark:text-ink-400 shrink-0">الكورس المطلوب:</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400 truncate">{enr.courseTitle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500 dark:text-ink-400 shrink-0">طريقة الدفع:</span>
                    <span className="font-bold text-ink-900 dark:text-white">{enr.paymentMethod || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ink-500 dark:text-ink-400 shrink-0">الحساب:</span>
                    <span className="font-bold text-ink-900 dark:text-white truncate max-w-[120px]" dir="ltr">{enr.paymentAccount || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-ink-200 pt-3 mt-2 dark:border-ink-700">
                    <span className="text-xs text-ink-500 dark:text-ink-400">التاريخ:</span>
                    <span className="text-xs font-bold text-ink-900 dark:text-white">
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
                    <div className="flex h-full items-center justify-center text-xs font-bold text-ink-400">بدون إيصال</div>
                  )}
                </div>

                <div className="mt-auto flex gap-3 border-t border-ink-100 pt-4 dark:border-white/5">
                  {enr.status !== 'approved' && (
                    <button onClick={() => handleStatusUpdate(enr.id, 'approved')} className="flex-1 rounded-xl bg-emerald-100 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">قبول</button>
                  )}
                  {enr.status !== 'rejected' && (
                    <button onClick={() => handleStatusUpdate(enr.id, 'rejected')} className="flex-1 rounded-xl bg-red-100 py-2.5 text-sm font-bold text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">رفض</button>
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
// 3. Courses
// ==========================================
function CoursesTab() {
  const { courses, enrollments, addCourse, addLesson, deleteCourse, deleteLesson, updateCourse, updateLesson, toggleCoursePublish, reorderLesson } = useApp();

  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  const [newCourse, setNewCourse] = useState({ title: '', description: '', stage: 'primary', grade: '', subject: '', price: '', coverImage: '' });
  const [newLesson, setNewLesson] = useState<{
    title: string; videoUrl: string; type: string; passingScore: number; questions: { text: string; image?: string; options: string[]; correctOptionIndex: number }[];
  }>({ title: '', videoUrl: '', type: 'video', passingScore: 50, questions: [] });

  const [uploadingImageIdx, setUploadingImageIdx] = useState<number | null>(null);

  const openEditCourse = (course: any) => {
    setNewCourse({ title: course.title, description: course.description, stage: course.stage, grade: course.grade, subject: course.subject || '', price: course.price, coverImage: course.coverImage });
    setEditingCourseId(course.id);
    setShowAddCourse(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourseId) {
      updateCourse(editingCourseId, newCourse);
    } else {
      addCourse(newCourse);
    }
    setNewCourse({ title: '', description: '', stage: 'primary', grade: '', subject: '', price: '', coverImage: '' });
    setShowAddCourse(false);
    setEditingCourseId(null);
  };

  const openEditLesson = (courseId: string, lesson: any) => {
    setNewLesson({ title: lesson.title, videoUrl: lesson.videoUrl, type: lesson.type, passingScore: lesson.passingScore || 50, questions: lesson.questions || [] });
    setAddingLessonTo(courseId);
    setEditingLessonId(lesson.id);
  };

  const handleSaveLesson = (courseId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (newLesson.type === 'quiz' && newLesson.questions.length === 0) {
      alert('يجب إضافة سؤال واحد على الأقل للاختبار!');
      return;
    }
    if (editingLessonId) {
      updateLesson(courseId, editingLessonId, newLesson);
    } else {
      addLesson(courseId, newLesson);
    }
    setNewLesson({ title: '', videoUrl: '', type: 'video', passingScore: 50, questions: [] });
    setAddingLessonTo(null);
    setEditingLessonId(null);
  };

  const uploadQuestionImage = async (file: File, qIdx: number) => {
    if (!file) return;
    setUploadingImageIdx(qIdx);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `quiz_img_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(`quizzes/${fileName}`, file);
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
    <div className="animate-fade-in space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-black text-ink-900 dark:text-white">إدارة الكورسات والمحتوى</h2>
        <button onClick={() => { setEditingCourseId(null); setNewCourse({ title: '', description: '', stage: 'primary', grade: '', subject: '', price: '', coverImage: '' }); setShowAddCourse(true); }} className="btn-primary w-full sm:w-auto justify-center py-3 shadow-lg shadow-brand-500/20">
          <PlusCircle className="h-5 w-5" /> إضافة كورس جديد
        </button>
      </div>

      {showAddCourse && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAddCourse(false)}></div>
          <div className="relative w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-3xl flex flex-col overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] bg-white shadow-2xl transition-all dark:bg-[#171a36]">
            <div className="flex shrink-0 items-center justify-between bg-gradient-to-l from-brand-600 to-brand-800 px-6 py-5 text-white">
              <h3 className="flex items-center gap-3 text-xl sm:text-2xl font-black"><Edit3 className="h-6 w-6 sm:h-7 sm:w-7" /> {editingCourseId ? 'تعديل بيانات الكورس' : 'إنشاء كورس جديد'}</h3>
              <button onClick={() => setShowAddCourse(false)} className="rounded-full bg-white/10 p-2 hover:bg-white/20"><XCircle className="h-6 w-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSaveCourse} className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-300"><BookOpen className="h-4 w-4 text-brand-500" /> اسم الكورس</label>
                    {/* 🔴 إضافة dir="auto" واسم الكورس */}
                    <input required type="text" dir="auto" className="input-field w-full text-start" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-300"><DollarSign className="h-4 w-4 text-emerald-500" /> السعر (ج.م)</label>
                    <input required type="number" className="input-field w-full" value={newCourse.price} onChange={e => setNewCourse({ ...newCourse, price: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-300"><GraduationCap className="h-4 w-4 text-purple-500" /> المرحلة الدراسية</label>
                    <select required className="input-field w-full" value={newCourse.stage} onChange={e => setNewCourse({ ...newCourse, stage: e.target.value })}>
                      <option value="primary">المرحلة الابتدائية</option>
                      <option value="preparatory">المرحلة الإعدادية</option>
                      <option value="secondary">المرحلة الثانوية</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-300"><Users className="h-4 w-4 text-blue-500" /> الصف الدراسي</label>
                    <input required type="text" className="input-field w-full" value={newCourse.grade} onChange={e => setNewCourse({ ...newCourse, grade: e.target.value })} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-300"><ImageIcon className="h-4 w-4 text-gold-500" /> رابط صورة الغلاف</label>
                    <input type="url" className="input-field w-full" dir="ltr" value={newCourse.coverImage} onChange={e => setNewCourse({ ...newCourse, coverImage: e.target.value })} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-ink-700 dark:text-ink-300"><FileText className="h-4 w-4 text-blue-500" /> وصف الكورس</label>
                    {/* 🔴 إضافة dir="auto" لوصف الكورس */}
                    <textarea required dir="auto" className="input-field min-h-[100px] w-full text-start" value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-ink-100 pt-6 dark:border-white/10">
                  <button type="submit" className="btn-primary w-full sm:w-auto py-3 sm:px-8 justify-center"><Save className="mr-2 h-5 w-5" /> حفظ التغييرات</button>
                  <button type="button" onClick={() => setShowAddCourse(false)} className="btn-outline w-full sm:w-auto py-3 sm:px-8 justify-center">إلغاء</button>
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
          const isDraft = (course as any).isPublished === false;

          const sortedLessons = course.lessons ? [...course.lessons].sort((a, b) => a.order - b.order) : [];

          return (
            <div key={course.id} className={`overflow-hidden rounded-[2rem] border transition-all ${isDraft ? 'border-ink-200 bg-ink-50/50 grayscale-[20%] dark:border-white/5 dark:bg-white/5' : 'border-brand-200 bg-white/70 shadow-sm backdrop-blur-xl dark:border-brand-500/20 dark:bg-white/5'}`}>
              <div className="flex flex-col sm:flex-row gap-4 justify-between border-b border-ink-100 p-5 sm:p-6 dark:border-white/5">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto relative">

                  {isDraft && (
                    <div className="absolute -top-3 -right-3 z-10 flex items-center gap-1 rounded-bl-xl rounded-tr-xl bg-ink-800 px-3 py-1 text-xs font-bold text-white shadow-md">
                      <EyeOff className="h-3 w-3" /> مسودة (مخفي)
                    </div>
                  )}

                  <img src={course.coverImage} alt={course.title} className="w-full aspect-[2/1] sm:aspect-square sm:w-20 sm:h-20 rounded-2xl object-cover shadow-sm" />
                  <div className="flex flex-col justify-center">
                    <h3 dir="auto" className="text-lg sm:text-xl font-bold text-ink-900 dark:text-white line-clamp-2 text-start">{course.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold">
                      <span className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-md dark:bg-brand-900/30 dark:text-brand-300">السعر: {course.price}</span>
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md dark:bg-emerald-900/30 dark:text-emerald-300">الأرباح: {courseRevenue}</span>
                      <span className="bg-ink-100 text-ink-700 px-2.5 py-1 rounded-md dark:bg-ink-800 dark:text-ink-300">الطلاب: {courseEnrs.length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                  <button onClick={() => toggleCoursePublish(course.id, !isDraft)} title={isDraft ? "نشر الكورس للطلاب" : "إخفاء الكورس (مسودة)"} className={`flex items-center justify-center p-2.5 sm:p-2 rounded-xl text-sm font-bold transition-colors ${isDraft ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300'}`}>
                    {isDraft ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => openEditCourse(course)} title="تعديل بيانات الكورس" className="flex items-center justify-center p-2.5 sm:p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => { setAddingLessonTo(addingLessonTo === course.id ? null : course.id); setEditingLessonId(null); setNewLesson({ title: '', videoUrl: '', type: 'video', passingScore: 50, questions: [] }); }} className="flex-1 sm:flex-none justify-center flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 sm:py-2 text-sm font-bold text-brand-700 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400">
                    <PlusCircle className="h-4 w-4" /> إضافة محتوى
                  </button>
                  <button onClick={() => { if (window.confirm('متأكد من حذف الكورس نهائياً بكل محتوياته؟')) deleteCourse(course.id); }} className="flex items-center justify-center p-2.5 sm:p-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {addingLessonTo === course.id && (
                <div className="border-b border-ink-100 bg-brand-50/50 p-5 sm:p-6 dark:border-white/5 dark:bg-brand-900/10">
                  <div className="mb-4 flex items-center gap-2 text-brand-700 dark:text-brand-300">
                    <Video className="h-5 w-5" />
                    <h4 className="font-bold text-sm sm:text-base">{editingLessonId ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}</h4>
                  </div>
                  <form onSubmit={(e) => handleSaveLesson(course.id, e)}>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink-600 dark:text-ink-300">عنوان المحتوى</label>
                        {/* 🔴 إضافة dir="auto" لعنوان الدرس */}
                        <input required type="text" dir="auto" className="input-field w-full py-2.5 text-start" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink-600 dark:text-ink-300">نوع المحتوى</label>
                        <select className="input-field w-full py-2.5" value={newLesson.type} onChange={e => setNewLesson({ ...newLesson, type: e.target.value, videoUrl: '', questions: [] })}>
                          <option value="video">فيديو</option>
                          <option value="pdf">ملف PDF</option>
                          <option value="quiz">اختبار (Quiz)</option>
                        </select>
                      </div>

                      {newLesson.type !== 'quiz' ? (
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1 text-xs font-bold text-ink-600 dark:text-ink-300"><LinkIcon className="h-3 w-3" /> الرابط</label>
                          <input required type="url" dir="ltr" className="input-field w-full py-2.5 text-left" value={newLesson.videoUrl} onChange={e => setNewLesson({ ...newLesson, videoUrl: e.target.value })} />
                        </div>
                      ) : (
                        <div className="space-y-1.5 rounded-xl border-2 border-brand-500 bg-brand-50 p-2 shadow-sm dark:border-brand-500/50 dark:bg-brand-900/20">
                          <label className="flex items-center gap-1 text-xs font-bold text-brand-700 dark:text-brand-300"><Target className="h-4 w-4" /> نسبة النجاح (%)</label>
                          <input required type="number" min="1" max="100" className="input-field w-full border-none bg-transparent font-black text-brand-700 focus:ring-0 dark:text-brand-300 py-1" value={newLesson.passingScore} onChange={e => setNewLesson({ ...newLesson, passingScore: Number(e.target.value) })} />
                        </div>
                      )}
                    </div>

                    {newLesson.type === 'quiz' && (
                      <div className="mt-6 border-t border-brand-200/50 pt-6 dark:border-brand-900/50">
                        <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                          <h5 className="font-bold text-ink-900 dark:text-white flex items-center gap-2"><Brain className="h-5 w-5 text-brand-600" /> أسئلة الاختبار</h5>
                          <button type="button" onClick={() => setNewLesson({ ...newLesson, questions: [...newLesson.questions, { text: '', image: '', options: ['', '', '', ''], correctOptionIndex: 0 }] })} className="btn-primary py-2.5 text-sm w-full sm:w-auto justify-center"><Plus className="h-4 w-4" /> إضافة سؤال</button>
                        </div>

                        <div className="space-y-4">
                          {newLesson.questions.map((q, qIdx) => (
                            <div key={qIdx} className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-ink-900/50">
                              <div className="mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2 font-black text-brand-600"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs">{qIdx + 1}</span> السؤال</span>
                                <button type="button" onClick={() => { const qs = [...newLesson.questions]; qs.splice(qIdx, 1); setNewLesson({ ...newLesson, questions: qs }); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-5 w-5" /></button>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                  {/* 🔴 إضافة dir="auto" لنص السؤال */}
                                  <input required type="text" dir="auto" placeholder="اكتب نص السؤال..." className="input-field w-full font-bold py-3 text-start" value={q.text} onChange={e => { const qs = [...newLesson.questions]; qs[qIdx].text = e.target.value; setNewLesson({ ...newLesson, questions: qs }); }} />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="mb-2 block text-xs font-bold text-ink-600 dark:text-ink-300">صورة توضيحية (اختياري)</label>
                                  <div className="flex flex-col sm:flex-row items-center gap-3">
                                    {q.image && (
                                      <div className="relative h-24 w-full sm:w-24 shrink-0 overflow-hidden rounded-xl"><img src={q.image} alt="Preview" className="h-full w-full object-cover" /><button type="button" onClick={() => { const qs = [...newLesson.questions]; qs[qIdx].image = ''; setNewLesson({ ...newLesson, questions: qs }); }} className="absolute inset-0 flex items-center justify-center bg-black/60 text-white"><Trash2 className="h-5 w-5" /></button></div>
                                    )}
                                    <div className="relative flex-1 w-full">
                                      <input type="file" accept="image/*" className="hidden" id={`q-img-${qIdx}`} onChange={(e) => { if (e.target.files && e.target.files[0]) uploadQuestionImage(e.target.files[0], qIdx); }} />
                                      <label htmlFor={`q-img-${qIdx}`} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 px-4 py-4 text-sm font-bold text-ink-500 hover:border-brand-400 dark:border-white/10 dark:bg-ink-900/50">
                                        {uploadingImageIdx === qIdx ? <span className="animate-pulse">جاري الرفع...</span> : <><Upload className="h-5 w-5" /> {q.image ? 'تغيير الصورة' : 'رفع صورة'}</>}
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className={`flex items-center gap-3 rounded-xl border p-2 pl-3 ${q.correctOptionIndex === optIdx ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-900/20' : 'border-ink-100 dark:border-white/5'}`}>
                                      <input type="radio" name={`correct-${qIdx}`} className="h-5 w-5 accent-emerald-600 shrink-0" checked={q.correctOptionIndex === optIdx} onChange={() => { const qs = [...newLesson.questions]; qs[qIdx].correctOptionIndex = optIdx; setNewLesson({ ...newLesson, questions: qs }); }} />
                                      {/* 🔴 إضافة dir="auto" للاختيارات */}
                                      <input required type="text" dir="auto" placeholder={`الاختيار ${optIdx + 1}`} className="flex-1 w-full bg-transparent text-sm font-bold outline-none dark:text-white text-start" value={opt} onChange={e => { const qs = [...newLesson.questions]; qs[qIdx].options[optIdx] = e.target.value; setNewLesson({ ...newLesson, questions: qs }); }} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <button type="submit" className="btn-primary w-full sm:w-auto py-3 sm:py-2.5 justify-center"><Save className="mr-2 h-4 w-4" /> حفظ التعديلات</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="p-5 sm:p-6">
                <h4 className="mb-3 text-sm font-bold text-ink-500 dark:text-ink-400">محتوى الكورس</h4>
                {sortedLessons.length > 0 ? (
                  <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {sortedLessons.map((lesson, idx) => (
                      <div key={lesson.id} className="flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50 p-3 shadow-sm dark:border-white/5 dark:bg-[#171a36]">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-ink-500 dark:bg-ink-900"><PlayCircle className="h-4 w-4" /></div>
                          <span dir="auto" className="truncate text-sm font-bold text-ink-700 dark:text-ink-200 text-start">{idx + 1}. {lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 bg-white dark:bg-ink-900 rounded-lg shadow-sm border border-ink-200 dark:border-white/10 p-0.5">
                          <button onClick={() => reorderLesson(course.id, lesson.id, 'up')} disabled={idx === 0} className="p-1.5 text-ink-400 hover:text-ink-900 disabled:opacity-30 dark:hover:text-white"><ArrowUp className="h-3.5 w-3.5" /></button>
                          <button onClick={() => reorderLesson(course.id, lesson.id, 'down')} disabled={idx === sortedLessons.length - 1} className="p-1.5 text-ink-400 hover:text-ink-900 disabled:opacity-30 dark:hover:text-white"><ArrowDown className="h-3.5 w-3.5" /></button>
                          <div className="w-[1px] h-4 bg-ink-200 dark:bg-white/10 mx-1"></div>
                          <button onClick={() => openEditLesson(course.id, lesson)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit3 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => { if (window.confirm('حذف المحتوى؟')) deleteLesson(course.id, lesson.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-ink-400 dark:border-white/10 font-bold text-sm">لا يوجد محتوى مضاف حتى الآن.</div>
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
// 4. Students
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

  const handleExportExcel = () => {
    if (filteredStudents.length === 0) {
      alert("لا يوجد طلاب للتصدير!");
      return;
    }

    const dataToExport = filteredStudents.map(s => ({
      "الاسم": s.name,
      "رقم الموبايل": s.phone || 'غير مسجل',
      "البريد الإلكتروني": s.email,
      "تاريخ التسجيل": new Date(s.createdAt).toLocaleDateString('ar-EG')
    }));

    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
    const csvContent = "\uFEFF" + headers + '\n' + rows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `طلاب_المنصة_${new Date().toLocaleDateString('ar-EG')}.csv`;
    link.click();
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-black text-ink-900 dark:text-white">إدارة الطلاب</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button onClick={handleExportExcel} className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-emerald-600 px-5 py-3 sm:py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-colors">
            <Download className="h-4 w-4" /> تصدير لـ Excel
          </button>

          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input type="text" placeholder="ابحث بالاسم، الايميل، أو الموبايل..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field w-full pr-10 py-3 sm:py-2.5" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map(student => {
          const isBanned = student.password === '__DISABLED__';
          return (
            <div key={student.id} className="group flex flex-col rounded-[2rem] border border-ink-200 bg-white/70 p-5 sm:p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-black text-brand-600 dark:bg-brand-900/50">{student.name.charAt(0)}</div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate text-base sm:text-lg font-bold text-ink-900 dark:text-white">{student.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-ink-600 dark:text-ink-400">
                    <Phone className="h-3 w-3" />
                    <span dir="ltr" className="font-bold">{student.phone || 'بدون رقم'}</span>
                  </div>
                  <p className="truncate text-xs text-ink-400 mt-0.5" dir="ltr">{student.email}</p>
                </div>
                {isBanned && <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />}
              </div>
              <button onClick={() => setSelectedStudent(student)} className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 py-3 sm:py-2.5 text-sm font-bold text-ink-700 hover:bg-brand-50 dark:border-white/10 dark:text-ink-300 dark:hover:bg-brand-900/20">
                <Eye className="h-4 w-4" /> عرض وتحكم
              </button>
            </div>
          );
        })}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}></div>
          <div className="relative w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-xl flex flex-col overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] bg-white shadow-2xl dark:bg-[#171a36]">
            <div className="bg-gradient-to-l from-brand-600 to-brand-800 p-6 text-white flex shrink-0 items-center justify-between">
              <div className="overflow-hidden pr-2">
                <h2 className="text-xl sm:text-2xl font-black truncate">{selectedStudent.name}</h2>
                <p className="text-sm opacity-80" dir="ltr">{selectedStudent.phone || selectedStudent.email}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="rounded-full bg-white/20 p-2"><XCircle className="h-6 w-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-8">
              <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-4 sm:p-5 dark:border-brand-900/50 dark:bg-brand-900/10">
                <h4 className="mb-3 font-bold text-sm text-ink-900 dark:text-white flex items-center gap-2"><Plus className="h-5 w-5 text-brand-600" /> إضافة كورس (مباشرة)</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select className="input-field w-full sm:flex-1 py-3 sm:py-2.5" value={manualCourseId} onChange={(e) => setManualCourseId(e.target.value)}>
                    <option value="">اختر كورس...</option>
                    {courses.filter(c => !enrollments.some(e => e.studentId === selectedStudent.id && e.courseId === c.id)).map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <button onClick={() => { if (manualCourseId) { adminEnrollStudent(selectedStudent.id, manualCourseId); setManualCourseId(''); } }} disabled={!manualCourseId} className="btn-primary w-full sm:w-auto py-3 sm:py-2.5 justify-center">إضافة</button>
                </div>
              </div>

              <h3 className="mb-4 text-lg font-black text-ink-900 dark:text-white">الكورسات المشترك بها</h3>
              <div className="space-y-3">
                {enrollments.filter(e => e.studentId === selectedStudent.id).length === 0 ? (
                  <div className="text-sm font-bold text-ink-400 text-center py-4 border border-dashed rounded-xl border-ink-200 dark:border-white/10">لا يوجد اشتراكات.</div>
                ) : (
                  enrollments.filter(e => e.studentId === selectedStudent.id).map(enr => {
                    const prog = getStudentProgress(selectedStudent.id, enr.courseId);
                    return (
                      <div key={enr.id} className="rounded-xl border border-ink-200 p-4 dark:border-white/10 bg-ink-50 dark:bg-ink-900/50">
                        <div className="flex flex-col sm:flex-row justify-between gap-2 mb-3">
                          <span className="font-bold text-sm text-ink-900 dark:text-white">{enr.courseTitle}</span>
                          <StatusBadge status={enr.status} />
                        </div>
                        {enr.status === 'approved' && (
                          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800"><div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${prog}%` }}></div></div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-ink-100 pt-6 dark:border-white/10">
                <button onClick={() => { const newPass = prompt('الباسوورد الجديد:'); if (newPass) resetStudentPassword(selectedStudent.id, newPass); }} className="flex items-center justify-center gap-2 rounded-xl bg-ink-100 py-3.5 sm:py-3 text-sm font-bold text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300">
                  <Lock className="h-4 w-4" /> باسوورد جديد
                </button>

                <button onClick={() => { if (window.confirm('متأكد من تغيير الحالة؟')) toggleStudentAccess(selectedStudent.id); }} className={`flex items-center justify-center gap-2 rounded-xl py-3.5 sm:py-3 text-sm font-bold text-white transition-colors ${selectedStudent.password === '__DISABLED__' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
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
// 5. Announcements
// ==========================================
function AnnouncementsTab() {
  const { announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement } = useApp();
  const [newAnnouncement, setNewAnnouncement] = useState('');

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl sm:text-2xl font-black text-ink-900 dark:text-white">إدارة الإشعارات</h2>
      <form onSubmit={(e) => { e.preventDefault(); if (newAnnouncement.trim()) { addAnnouncement(newAnnouncement); setNewAnnouncement(''); } }} className="flex flex-col sm:flex-row gap-3 rounded-[2rem] border border-ink-200 bg-white/70 p-5 sm:p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <input type="text" value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} placeholder="اكتب إشعاراً جديداً ليظهر للطلاب..." className="input-field w-full flex-1 py-3" required />
        <button type="submit" className="btn-primary w-full sm:w-auto shrink-0 py-3 justify-center"><Bell className="mr-2 h-4 w-4" /> إرسال الإشعار</button>
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
// Main Dashboard
// ==========================================
export function AdminDashboard() {
  const { user, enrollments } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollments' | 'courses' | 'students' | 'announcements'>('overview');

  if (user?.role !== 'admin') {
    return <div className="flex min-h-screen items-center justify-center font-bold text-red-500">غير مصرح لك بالدخول</div>;
  }

  const pendingCount = enrollments.filter((e) => e.status === 'pending').length;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-ink-50 font-sans transition-colors duration-500 dark:bg-[#0f1123]">
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-brand-500/10 blur-[150px] dark:bg-brand-600/10"></div>
      <div className="pointer-events-none absolute left-0 top-1/3 h-[500px] w-[500px] rounded-full bg-[#f01c6d]/5 blur-[120px] dark:bg-[#f01c6d]/10"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-ink-900 dark:text-white">
              لوحة <span className="text-brand-600 dark:text-brand-400">التحكم</span>
            </h1>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">نظرة شاملة وتحكم كامل في جميع أقسام المنصة.</p>
          </div>

          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 w-screen sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex w-max gap-2 rounded-2xl bg-white/50 p-1.5 shadow-sm backdrop-blur-md dark:bg-white/5">
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
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-3 sm:py-2.5 text-sm font-bold transition-all ${activeTab === tab.id
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
        </div>

        <div className="pb-16 sm:pb-8">
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