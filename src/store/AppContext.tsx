import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Course, Enrollment, EnrollmentStatus, LessonProgress, User, Announcement } from '../types';
import { supabase } from '../lib/supabase';

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthLoading: boolean;
  logout: () => void;
  courses: Course[];
  enrollments: Enrollment[];
  progress: LessonProgress[];
  announcements: Announcement[];
  users: User[];
  createEnrollment: (data: { courseId: string; receiptUrl?: string; paymentMethod?: string; paymentAccount?: string; }) => void;
  adminEnrollStudent: (studentId: string, courseId: string) => void;
  updateEnrollmentStatus: (id: string, status: EnrollmentStatus, note?: string) => void;
  markLessonComplete: (lessonId: string, courseId: string, quizScore?: number) => void;
  isLessonComplete: (lessonId: string) => boolean;
  isLessonUnlocked: (lessonId: string, courseId: string) => boolean;
  addCourse: (course: any) => void;
  addLesson: (courseId: string, lesson: any) => void;
  deleteLesson: (courseId: string, lessonId: string) => void;
  deleteCourse: (courseId: string) => void;
  resetStudentPassword: (userId: string, newPassword: string) => void;
  toggleStudentAccess: (userId: string) => void;
  addAnnouncement: (text: string) => void;
  toggleAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  removeRejectedEnrollment: (enrollmentId: string) => void;
  resetStudentDevice: (userId: string) => void;
  updateCourse: (courseId: string, updates: any) => Promise<void>;
  updateLesson: (courseId: string, lessonId: string, updates: any) => Promise<void>;
  toggleCoursePublish: (courseId: string, currentStatus: boolean) => Promise<void>;
  deleteEnrollments: (ids: string[]) => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);
const STORAGE_KEY = 'bashmodares_state_v1';

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const [theme, setTheme] = useState<'light' | 'dark'>(persisted.theme ?? 'light');
  const [user, setUser] = useState<User | null>(persisted.user ?? null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const loadRealData = async () => {
      const { data: dbCourses } = await supabase.from('courses').select('*');
      const { data: dbLessons } = await supabase.from('lessons').select('*').order('order', { ascending: true });
      const { data: dbAnnouncements } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      const { data: dbUsers } = await supabase.from('users').select('*');
      const { data: dbEnrollments } = await supabase.from('enrollments').select('*');
      const { data: dbProgress } = await supabase.from('progress').select('*');

      if (dbAnnouncements) setAnnouncements(dbAnnouncements.map((a: any) => ({ id: String(a.id), text: a.text, active: a.active, createdAt: String(a.created_at) })));
      if (dbUsers) setUsers(dbUsers.map((u: any) => ({ id: String(u.id), name: u.name, email: u.email, phone: u.phone, role: u.role, password: u.password, activeDeviceId: u.active_device_id, createdAt: u.created_at } as User)));

      if (dbProgress) {
        setProgress(dbProgress.map((p: any) => ({ userId: String(p.user_id), lessonId: String(p.lesson_id), courseId: String(p.course_id), completed: p.completed, quizScore: p.quiz_score, completedAt: String(p.completed_at) })));
      } else {
        setProgress([]);
      }

      let formattedCourses: Course[] = [];
      if (dbCourses) {
        formattedCourses = dbCourses.map((c: any) => {
          const courseLessons = dbLessons ? dbLessons.filter(l => String(l.course_id) === String(c.id)).map(l => ({
            id: String(l.id), courseId: String(l.course_id), title: l.title || '', description: l.description || '', videoUrl: l.video_url || '', order: l.order || 1, type: l.type || 'video', passingScore: l.passing_score || 50, questions: l.questions || []
          })) : [];

          const isPublishedValue = c.is_published !== false;

          return { id: String(c.id), title: String(c.title || ''), description: String(c.description || ''), stage: c.stage || 'secondary', grade: String(c.grade || ''), subject: String(c.subject || ''), instructor: String(c.instructor || 'مستر عماد'), price: Number(c.price) || 0, coverImage: String(c.image_url || ''), imageUrl: String(c.image_url || ''), lessons: courseLessons as any, createdAt: String(c.created_at || new Date().toISOString()), isPublished: isPublishedValue } as any;
        });
        setCourses(formattedCourses);
      }

      if (dbEnrollments) {
        setEnrollments(dbEnrollments.map((e: any) => {
          const relatedCourse = formattedCourses.find(c => c.id === String(e.course_id));
          return {
            id: String(e.id), studentId: String(e.student_id), studentName: e.student_name, courseId: String(e.course_id), courseTitle: relatedCourse?.title || 'كورس محذوف', status: e.status, receiptUrl: String(e.receipt_url || ''), paymentMethod: String(e.payment_method || ''), paymentAccount: String(e.payment_account || ''), amount: relatedCourse?.price || 0, createdAt: String(e.created_at),
            isArchived: e.is_archived === true // 🔴 ربط حالة الأرشفة من الداتا بيز
          } as any;
        }));
      } else {
        setEnrollments([]);
      }
    };

    const handleSession = async (session: any, event: string) => {
      setIsAuthLoading(true);

      if (!session) {
        setUser(null);
        await loadRealData();
        setIsAuthLoading(false);
        return;
      }

      const localDeviceId = localStorage.getItem('bashmodares_device_id') || crypto.randomUUID();
      if (!localStorage.getItem('bashmodares_device_id')) {
        localStorage.setItem('bashmodares_device_id', localDeviceId);
      }

      let { data: dbUser } = await supabase.from('users').select('*').eq('id', session.user.id).single();

      if (!dbUser) {
        const newUser = { id: session.user.id, name: session.user.user_metadata?.full_name || 'طالب جديد', email: session.user.email, role: 'student', active_device_id: localDeviceId };
        await supabase.from('users').insert([newUser]);
        dbUser = newUser;
      }

      if (dbUser) {
        if (dbUser.role === 'admin') {
          setUser({ id: session.user.id, name: dbUser.name, email: dbUser.email, role: dbUser.role, activeDeviceId: dbUser.active_device_id, createdAt: dbUser.created_at } as User);
          await loadRealData();
        }
        else {
          if (!dbUser.active_device_id || event === 'SIGNED_IN') {
            await supabase.from('users').update({ active_device_id: localDeviceId }).eq('id', session.user.id);
            dbUser.active_device_id = localDeviceId;
          }

          if (dbUser.active_device_id !== localDeviceId) {
            alert("⚠️ تم تسجيل الدخول من جهاز آخر، لذلك تم إنهاء جلستك من هنا.");
            await supabase.auth.signOut();
            setUser(null);
            await loadRealData();
          }
          else {
            setUser({ id: session.user.id, name: dbUser.name, email: dbUser.email, role: dbUser.role, activeDeviceId: localDeviceId, createdAt: dbUser.created_at } as User);
            await loadRealData();
          }
        }
      }
      setIsAuthLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session, 'INITIAL_SESSION'));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => { handleSession(session, event); });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || user.role === 'admin') return;
    const localDeviceId = localStorage.getItem('bashmodares_device_id');
    const interval = setInterval(async () => {
      const { data } = await supabase.from('users').select('active_device_id').eq('id', user.id).single();
      if (data && data.active_device_id && data.active_device_id !== localDeviceId) {
        await supabase.auth.signOut();
        setUser(null);
        alert("⚠️ تم تسجيل الدخول من حسابك في جهاز آخر. سيتم الخروج من هذه الجلسة الآن لحماية الحساب.");
        window.location.href = '/auth';
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, progress, user }));
  }, [theme, progress, user]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  const logout = async () => { await supabase.auth.signOut(); setUser(null); };

  const createEnrollment: AppState['createEnrollment'] = async (data) => {
    if (!user) return;
    const course = courses.find((c) => c.id === data.courseId);
    if (!course) return;
    const isFree = Number(course.price) === 0;
    const initialStatus = isFree ? 'approved' : 'pending';
    const { data: dbData } = await supabase.from('enrollments').insert({ student_id: user.id, student_name: user.name, course_id: data.courseId, status: initialStatus, receipt_url: data.receiptUrl || '', payment_method: data.paymentMethod || (isFree ? 'مجانياً' : ''), payment_account: data.paymentAccount || '' }).select();
    if (dbData && dbData.length > 0) {
      setEnrollments((prev) => [...prev, { id: String(dbData[0].id), studentId: user.id, studentName: user.name, courseId: data.courseId, courseTitle: course.title, status: initialStatus, receiptUrl: data.receiptUrl || '', paymentMethod: data.paymentMethod, paymentAccount: data.paymentAccount, amount: Number(course.price), createdAt: dbData[0].created_at, isArchived: false } as any]);
      alert(isFree ? "تم تفعيل الكورس المجاني بنجاح!" : "تم إرسال الإيصال بنجاح للمراجعة!");
    }
  };

  const adminEnrollStudent: AppState['adminEnrollStudent'] = async (studentId, courseId) => {
    const student = users.find(u => u.id === studentId);
    const course = courses.find(c => c.id === courseId);
    if (!student || !course) return;
    const { data: dbData } = await supabase.from('enrollments').insert({ student_id: student.id, student_name: student.name, course_id: courseId, status: 'approved', receipt_url: '', payment_method: 'إضافة يدوية', payment_account: 'الإدارة' }).select();
    if (dbData && dbData.length > 0) {
      setEnrollments((prev) => [...prev, { id: String(dbData[0].id), studentId: student.id, studentName: student.name, courseId: courseId, courseTitle: course.title, status: 'approved', receiptUrl: '', paymentMethod: 'إضافة يدوية', paymentAccount: 'الإدارة', amount: Number(course.price), createdAt: dbData[0].created_at, isArchived: false } as any]);
      alert(`تم إضافة الكورس بنجاح للطالب "${student.name}"`);
    }
  };

  const updateEnrollmentStatus: AppState['updateEnrollmentStatus'] = async (id, status, note) => {
    await supabase.from('enrollments').update({ status }).eq('id', id);
    setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, status, reviewerNote: note } : e));
  };

  const markLessonComplete: AppState['markLessonComplete'] = async (lessonId, courseId, quizScore) => {
    if (!user) return;
    setProgress((prev) => {
      if (prev.find((p) => p.userId === user.id && p.lessonId === lessonId)) {
        return prev.map((p) => p.lessonId === lessonId && p.userId === user.id ? { ...p, completed: true, completedAt: new Date().toISOString(), quizScore } : p);
      }
      return [...prev, { userId: user.id, lessonId, courseId, completed: true, completedAt: new Date().toISOString(), quizScore }];
    });
    await supabase.from('progress').upsert({ user_id: user.id, lesson_id: lessonId, course_id: courseId, completed: true, quiz_score: quizScore, completed_at: new Date().toISOString() }, { onConflict: 'user_id, lesson_id' });
  };

  const isLessonComplete: AppState['isLessonComplete'] = (lessonId) => { return user ? progress.some((p) => p.userId === user.id && p.lessonId === lessonId && p.completed) : false; };
  const isLessonUnlocked: AppState['isLessonUnlocked'] = (lessonId, courseId) => {
    if (!user) return false;
    const course = courses.find((c) => c.id === courseId);
    if (!course) return false;
    const lessons = [...course.lessons].sort((a, b) => a.order - b.order);
    const idx = lessons.findIndex((l) => l.id === lessonId);
    if (idx === 0) return true;
    return isLessonComplete(lessons[idx - 1].id);
  };

  const addCourse: AppState['addCourse'] = async (courseData: any) => {
    try {
      const { data, error } = await supabase.from('courses').insert({
        title: courseData.title, description: courseData.description, stage: courseData.stage,
        grade: courseData.grade, subject: courseData.subject, instructor: courseData.instructor || 'مستر عماد',
        price: Number(courseData.price), image_url: courseData.coverImage, is_published: true
      }).select().single();

      if (error) { alert(`⚠️ الداتا بيز رفضت الإضافة: ${error.message}`); return; }

      if (data) {
        setCourses(prev => [...prev, { id: String(data.id), title: data.title, description: data.description, stage: data.stage, grade: data.grade, subject: data.subject, instructor: data.instructor, price: data.price, coverImage: data.image_url, imageUrl: data.image_url, lessons: [], createdAt: data.created_at, isPublished: true } as any]);
        alert("✅ تم إضافة الكورس بنجاح!");
      }
    } catch (err: any) { alert(`⚠️ خطأ: ${err.message}`); }
  };

  const addLesson: AppState['addLesson'] = async (courseId, lesson: any) => {
    const nextOrder = courses.find(c => c.id === courseId)?.lessons.length ? courses.find(c => c.id === courseId)!.lessons.length + 1 : 1;
    const { data, error } = await supabase.from('lessons').insert({ course_id: courseId, title: lesson.title, video_url: lesson.videoUrl, order: nextOrder, type: lesson.type, passing_score: lesson.passingScore, questions: lesson.questions || [] }).select().single();
    if (error) { alert(`⚠️ خطأ في المحتوى: ${error.message}`); return; }
    if (data) {
      const newLesson = { id: String(data.id), courseId: String(data.course_id), title: data.title, videoUrl: data.video_url, order: data.order, type: data.type, passingScore: data.passing_score, questions: data.questions };
      setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, lessons: [...c.lessons, newLesson as any] } : c));
    }
  };

  const deleteLesson: AppState['deleteLesson'] = async (courseId, lessonId) => {
    await supabase.from('lessons').delete().eq('id', lessonId);
    setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) } : c));
  };

  const deleteCourse: AppState['deleteCourse'] = async (courseId) => {
    await supabase.from('lessons').delete().eq('course_id', courseId);
    await supabase.from('enrollments').delete().eq('course_id', courseId);
    await supabase.from('courses').delete().eq('id', courseId);
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  const resetStudentPassword: AppState['resetStudentPassword'] = async (userId, newPassword) => {
    await supabase.rpc('update_user_password', { target_user_id: userId, new_password: newPassword });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, password: newPassword } : u)));
  };

  const toggleStudentAccess: AppState['toggleStudentAccess'] = async (userId) => {
    const userObj = users.find(u => u.id === userId);
    if (!userObj) return;
    const newPassword = userObj.password === '__DISABLED__' ? 'reset123' : '__DISABLED__';
    await supabase.rpc('update_user_password', { target_user_id: userId, new_password: newPassword });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, password: newPassword } : u)));
  };

  const addAnnouncement: AppState['addAnnouncement'] = async (text) => {
    const { data } = await supabase.from('announcements').insert({ text, active: true }).select().single();
    if (data) setAnnouncements((prev) => [{ id: String(data.id), text: data.text, active: data.active, createdAt: data.created_at }, ...prev]);
  };

  const toggleAnnouncement: AppState['toggleAnnouncement'] = async (id) => {
    const ann = announcements.find((a) => a.id === id);
    if (!ann) return;
    await supabase.from('announcements').update({ active: !ann.active }).eq('id', id);
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  };

  const deleteAnnouncement: AppState['deleteAnnouncement'] = async (id) => {
    await supabase.from('announcements').delete().eq('id', id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const removeRejectedEnrollment: AppState['removeRejectedEnrollment'] = async (id) => {
    await supabase.from('enrollments').delete().eq('id', id);
    setEnrollments((prev) => prev.filter((e) => e.id !== id));
  };

  const resetStudentDevice: AppState['resetStudentDevice'] = async (userId) => {
    await supabase.from('users').update({ active_device_id: null }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, activeDeviceId: undefined } : u)));
    alert('تم فك ارتباط جهاز الطالب بنجاح!');
  };

  const updateCourse: AppState['updateCourse'] = async (courseId, updates) => {
    const { error } = await supabase.from('courses').update({
      title: updates.title, description: updates.description, stage: updates.stage,
      grade: updates.grade, price: Number(updates.price), image_url: updates.coverImage
    }).eq('id', courseId);

    if (error) { alert(`⚠️ خطأ في التعديل: ${error.message}`); return; }
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...updates, coverImage: updates.coverImage, imageUrl: updates.coverImage } : c));
    alert('✅ تم تحديث بيانات الكورس بنجاح!');
  };

  const updateLesson: AppState['updateLesson'] = async (courseId, lessonId, updates) => {
    const { error } = await supabase.from('lessons').update({
      title: updates.title, video_url: updates.videoUrl, type: updates.type,
      passing_score: updates.passingScore, questions: updates.questions
    }).eq('id', lessonId);

    if (error) { alert(`⚠️ خطأ في تحديث المحتوى: ${error.message}`); return; }
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, lessons: c.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l) } : c));
    alert('✅ تم تحديث المحتوى بنجاح!');
  };

  const toggleCoursePublish: AppState['toggleCoursePublish'] = async (courseId, currentStatus) => {
    try {
      const newStatus = !currentStatus;

      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, isPublished: newStatus } : c));

      const { data, error } = await supabase.from('courses')
        .update({ is_published: newStatus })
        .eq('id', courseId)
        .select();

      if (error || !data || data.length === 0) {
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, isPublished: currentStatus } : c));
        alert(`⚠️ الداتا بيز رفضت التعديل! تأكد من تشغيل كود الـ SQL الأخير لفتح صلاحيات التعديل للمسؤول.`);
      }

    } catch (err: any) {
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, isPublished: currentStatus } : c));
      alert(`⚠️ خطأ: ${err.message}`);
    }
  };

  // 🔴 الدالة الخارقة للأرشفة والمسح الذكي
  const deleteEnrollments: AppState['deleteEnrollments'] = async (ids) => {
    try {
      // فصلنا الإيصالات المرفوضة عن المقبولة
      const enrollmentsToProcess = enrollments.filter(e => ids.includes(e.id));
      const approvedIds = enrollmentsToProcess.filter(e => e.status === 'approved').map(e => e.id);
      const otherIds = enrollmentsToProcess.filter(e => e.status !== 'approved').map(e => e.id);

      // 1. مسح المرفوض/المعلق مسح نهائي من الداتا بيز
      if (otherIds.length > 0) {
        await supabase.from('enrollments').delete().in('id', otherIds);
      }

      // 2. المقبول بيتعمله أرشفة ومسح لصورته فقط! (لحماية الكورس)
      if (approvedIds.length > 0) {
        await supabase.from('enrollments').update({ is_archived: true, receipt_url: '' }).in('id', approvedIds);
      }

      // تحديث السيستم قدامك عشان يختفوا
      setEnrollments((prev) => prev.map(e => {
        if (approvedIds.includes(e.id)) return { ...e, isArchived: true, receiptUrl: '' } as any;
        return e;
      }).filter(e => !otherIds.includes(e.id)));

      alert('✅ تم تنظيف الإيصالات بنجاح! (تم أرشفة الإيصالات المقبولة لضمان بقاء الطلاب في الكورسات، وتم مسح المرفوض نهائياً).');
    } catch (err: any) {
      alert(`⚠️ خطأ: ${err.message}`);
    }
  };

  const value: AppState = {
    theme, toggleTheme, user, setUser, isAuthLoading, logout, courses, enrollments, progress, announcements, users,
    createEnrollment, updateEnrollmentStatus, markLessonComplete, isLessonComplete, isLessonUnlocked,
    addCourse, addLesson, deleteLesson, deleteCourse, resetStudentPassword, toggleStudentAccess,
    addAnnouncement, toggleAnnouncement, deleteAnnouncement, removeRejectedEnrollment, adminEnrollStudent, resetStudentDevice,
    updateCourse, updateLesson, toggleCoursePublish, deleteEnrollments
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}