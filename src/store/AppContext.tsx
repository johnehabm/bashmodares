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
  const [progress, setProgress] = useState<LessonProgress[]>(persisted.progress ?? []);
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const loadRealData = async () => {
      const { data: dbCourses } = await supabase.from('courses').select('*');
      const { data: dbLessons } = await supabase.from('lessons').select('*').order('order', { ascending: true });
      const { data: dbAnnouncements } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      const { data: dbUsers } = await supabase.from('users').select('*');
      const { data: dbEnrollments } = await supabase.from('enrollments').select('*');

      if (dbAnnouncements) setAnnouncements(dbAnnouncements.map((a: any) => ({ id: String(a.id), text: a.text, active: a.active, createdAt: String(a.created_at) })));
      if (dbUsers) setUsers(dbUsers.map((u: any) => ({ id: String(u.id), name: u.name, email: u.email, phone: u.phone, role: u.role, password: u.password, activeDeviceId: u.active_device_id, createdAt: u.created_at } as User)));

      let formattedCourses: Course[] = [];
      if (dbCourses) {
        formattedCourses = dbCourses.map((c: any) => {
          const courseLessons = dbLessons ? dbLessons.filter(l => String(l.course_id) === String(c.id)).map(l => ({
            id: String(l.id), courseId: String(l.course_id), title: l.title || '', description: l.description || '',
            videoUrl: l.video_url || '', order: l.order || 1, type: l.type || 'video', passingScore: l.passing_score || 50, questions: l.questions || []
          })) : [];
          return { id: String(c.id), title: String(c.title || ''), description: String(c.description || ''), stage: c.stage || 'secondary', grade: String(c.grade || ''), subject: String(c.subject || ''), instructor: String(c.instructor || 'مستر عماد'), price: Number(c.price) || 0, coverImage: String(c.image_url || ''), imageUrl: String(c.image_url || ''), lessons: courseLessons as any, createdAt: String(c.created_at || new Date().toISOString()) } as any;
        });
        setCourses(formattedCourses);
      }

      if (dbEnrollments) {
        setEnrollments(dbEnrollments.map((e: any) => {
          const relatedCourse = formattedCourses.find(c => c.id === String(e.course_id));
          return { id: String(e.id), studentId: String(e.student_id), studentName: e.student_name, courseId: String(e.course_id), courseTitle: relatedCourse?.title || 'كورس محذوف', status: e.status, receiptUrl: String(e.receipt_url || ''), paymentMethod: String(e.payment_method || ''), paymentAccount: String(e.payment_account || ''), amount: relatedCourse?.price || 0, createdAt: String(e.created_at) } as any;
        }));
      }
    };
    loadRealData();
  }, []);

  // 🔴 النظام المحكم لمنع مشاركة الحسابات
  useEffect(() => {
    const handleSession = async (session: any) => {
      setIsAuthLoading(true);

      if (!session) {
        setUser(null);
        setIsAuthLoading(false);
        return;
      }

      // 1. توليد أو جلب بصمة الجهاز الحالي
      const localDeviceId = localStorage.getItem('bashmodares_device_id') || crypto.randomUUID();
      if (!localStorage.getItem('bashmodares_device_id')) {
        localStorage.setItem('bashmodares_device_id', localDeviceId);
      }

      // 2. البحث عن بيانات الطالب في الداتا بيز
      let { data: dbUser } = await supabase.from('users').select('*').eq('id', session.user.id).single();

      // 3. 🚨 الحل السحري: لو الطالب مش موجود (حساب جديد)، ضيفه فوراً واحفظ بصمة جهازه
      if (!dbUser) {
        const newUser = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || 'طالب جديد',
          email: session.user.email,
          role: 'student',
          active_device_id: localDeviceId // 👈 حفظ البصمة لأول مرة
        };

        await supabase.from('users').insert([newUser]);
        dbUser = newUser;
      }

      // 4. التحقق من البصمة لمنع المشاركة
      if (dbUser) {
        if (dbUser.role === 'admin') {
          // الأدمن مسموح له يدخل من أي جهاز
          setUser({ id: session.user.id, name: dbUser.name, email: dbUser.email, role: dbUser.role, activeDeviceId: dbUser.active_device_id, createdAt: dbUser.created_at } as User);
        }
        else if (dbUser.active_device_id && dbUser.active_device_id !== localDeviceId) {
          // 🚨 لو بصمة الجهاز في الداتا بيز مختلفة عن الجهاز اللي بيحاول يدخل -> اطرده!
          alert("⚠️ عذراً! تم فتح هذا الحساب من جهاز آخر. لا يمكن مشاركة الحساب لضمان أمان المحتوى.");
          await supabase.auth.signOut();
          setUser(null);
        }
        else {
          // تحديث البصمة لو كانت فاضية (حالة نادرة)
          if (!dbUser.active_device_id) {
            await supabase.from('users').update({ active_device_id: localDeviceId }).eq('id', session.user.id);
          }
          // السماح بالدخول
          setUser({ id: session.user.id, name: dbUser.name, email: dbUser.email, role: dbUser.role, activeDeviceId: localDeviceId, createdAt: dbUser.created_at } as User);
        }
      }

      setIsAuthLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

    const { data: dbData } = await supabase.from('enrollments').insert({
      student_id: user.id, student_name: user.name, course_id: data.courseId, status: initialStatus,
      receipt_url: data.receiptUrl || '', payment_method: data.paymentMethod || (isFree ? 'مجانياً' : ''), payment_account: data.paymentAccount || ''
    }).select();

    if (dbData && dbData.length > 0) {
      setEnrollments((prev) => [...prev, {
        id: String(dbData[0].id), studentId: user.id, studentName: user.name, courseId: data.courseId, courseTitle: course.title,
        status: initialStatus, receiptUrl: data.receiptUrl || '', paymentMethod: data.paymentMethod, paymentAccount: data.paymentAccount, amount: Number(course.price), createdAt: dbData[0].created_at
      } as any]);
      alert(isFree ? "تم تفعيل الكورس المجاني بنجاح!" : "تم إرسال الإيصال بنجاح للمراجعة!");
    }
  };

  const adminEnrollStudent: AppState['adminEnrollStudent'] = async (studentId, courseId) => {
    const student = users.find(u => u.id === studentId);
    const course = courses.find(c => c.id === courseId);
    if (!student || !course) return;

    const { data: dbData } = await supabase.from('enrollments').insert({
      student_id: student.id, student_name: student.name, course_id: courseId, status: 'approved', receipt_url: '', payment_method: 'إضافة يدوية', payment_account: 'الإدارة'
    }).select();

    if (dbData && dbData.length > 0) {
      setEnrollments((prev) => [...prev, { id: String(dbData[0].id), studentId: student.id, studentName: student.name, courseId: courseId, courseTitle: course.title, status: 'approved', receiptUrl: '', paymentMethod: 'إضافة يدوية', paymentAccount: 'الإدارة', amount: Number(course.price), createdAt: dbData[0].created_at } as any]);
      alert(`تم إضافة الكورس بنجاح للطالب "${student.name}"`);
    }
  };

  const updateEnrollmentStatus: AppState['updateEnrollmentStatus'] = async (id, status, note) => {
    await supabase.from('enrollments').update({ status }).eq('id', id);
    setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, status, reviewerNote: note } : e));
  };

  const markLessonComplete: AppState['markLessonComplete'] = (lessonId, courseId, quizScore) => {
    if (!user) return;
    setProgress((prev) => {
      if (prev.find((p) => p.userId === user.id && p.lessonId === lessonId)) {
        return prev.map((p) => p.lessonId === lessonId && p.userId === user.id ? { ...p, completed: true, completedAt: new Date().toISOString(), quizScore } : p);
      }
      return [...prev, { userId: user.id, lessonId, courseId, completed: true, completedAt: new Date().toISOString(), quizScore }];
    });
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
    const { data } = await supabase.from('courses').insert({
      title: courseData.title, description: courseData.description, stage: courseData.stage, grade: courseData.grade,
      subject: courseData.subject, instructor: courseData.instructor || 'مستر عماد', price: Number(courseData.price), image_url: courseData.coverImage
    }).select().single();
    if (data) setCourses(prev => [...prev, { id: String(data.id), title: data.title, description: data.description, stage: data.stage, grade: data.grade, subject: data.subject, instructor: data.instructor, price: data.price, coverImage: data.image_url, imageUrl: data.image_url, lessons: [], createdAt: data.created_at } as any]);
  };

  const addLesson: AppState['addLesson'] = async (courseId, lesson: any) => {
    const nextOrder = courses.find(c => c.id === courseId)?.lessons.length ? courses.find(c => c.id === courseId)!.lessons.length + 1 : 1;
    const { data } = await supabase.from('lessons').insert({
      course_id: courseId, title: lesson.title, video_url: lesson.videoUrl, order: nextOrder, type: lesson.type, passing_score: lesson.passingScore, questions: lesson.questions || []
    }).select().single();
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

  const value: AppState = {
    theme, toggleTheme, user, setUser, isAuthLoading, logout, courses, enrollments, progress, announcements, users,
    createEnrollment, updateEnrollmentStatus, markLessonComplete, isLessonComplete, isLessonUnlocked,
    addCourse, addLesson, deleteLesson, deleteCourse, resetStudentPassword, toggleStudentAccess,
    addAnnouncement, toggleAnnouncement, deleteAnnouncement, removeRejectedEnrollment, adminEnrollStudent
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}