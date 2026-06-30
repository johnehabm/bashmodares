import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type {
  Course,
  Enrollment,
  EnrollmentStatus,
  LessonProgress,
  User,
  Announcement,
} from '../types';
import { supabase } from '../lib/supabase';

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  courses: Course[];
  enrollments: Enrollment[];
  progress: LessonProgress[];
  announcements: Announcement[];
  users: User[];
  createEnrollment: (data: {
    courseId: string;
    receiptUrl?: string;
    receiptFileName?: string;
    paymentMethod?: string;
    paymentAccount?: string;
  }) => void;
  adminEnrollStudent: (studentId: string, courseId: string) => void;
  updateEnrollmentStatus: (
    id: string,
    status: EnrollmentStatus,
    note?: string,
  ) => void;
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

interface PersistedState {
  theme: 'light' | 'dark';
  progress: LessonProgress[];
  user?: User | null;
}

function loadState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = loadState();
  const [theme, setTheme] = useState<'light' | 'dark'>(persisted.theme ?? 'light');
  const [user, setUser] = useState<User | null>(persisted.user ?? null);
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

      if (dbAnnouncements) {
        setAnnouncements(dbAnnouncements.map((a: any) => ({
          id: String(a.id),
          text: a.text,
          active: a.active,
          createdAt: String(a.created_at || new Date().toISOString())
        })));
      }

      let formattedCourses: Course[] = [];

      if (dbCourses) {
        formattedCourses = dbCourses.map((c: any) => {
          const courseLessons = dbLessons
            ? dbLessons.filter(l => String(l.course_id) === String(c.id)).map(l => ({
              id: String(l.id),
              courseId: String(l.course_id),
              title: l.title || '',
              description: l.description || '',
              videoUrl: l.video_url || '',
              order: l.order || 1,
              type: l.type || 'video',
              passingScore: l.passing_score || 50, // 🔴 سحب نسبة النجاح
              questions: l.questions || []
            }))
            : [];

          return {
            id: String(c.id),
            title: String(c.title || ''),
            description: String(c.description || ''),
            stage: (c.stage || 'secondary') as any,
            grade: String(c.grade || ''),
            subject: String(c.subject || ''),
            instructor: String(c.instructor || 'مستر عماد'),
            price: Number(c.price) || 0,
            coverImage: String(c.image_url || 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800'),
            imageUrl: String(c.image_url || ''),
            lessons: courseLessons as any,
            createdAt: String(c.created_at || new Date().toISOString())
          } as any;
        });
        setCourses(formattedCourses);
      }

      const { data: dbUsers } = await supabase.from('users').select('*');
      if (dbUsers) {
        const formattedUsers = dbUsers.map((u: any) => ({
          id: String(u.id),
          name: u.name || 'طالب',
          email: u.email || '',
          phone: u.phone || '',
          role: u.role || 'student',
          password: u.password || '',
          createdAt: u.created_at || new Date().toISOString()
        } as User));
        setUsers(formattedUsers);
      }

      const { data: dbEnrollments } = await supabase.from('enrollments').select('*');
      if (dbEnrollments) {
        const formattedEnrollments = dbEnrollments.map((e: any) => {
          const relatedCourse = formattedCourses.find(c => c.id === String(e.course_id));
          return {
            id: String(e.id),
            studentId: String(e.student_id),
            studentName: e.student_name || 'طالب غير معروف',
            courseId: String(e.course_id),
            courseTitle: relatedCourse ? relatedCourse.title : 'كورس غير معروف',
            status: e.status || 'pending',
            receiptUrl: String(e.receipt_url || ''),
            paymentMethod: String(e.payment_method || ''),
            paymentAccount: String(e.payment_account || ''),
            amount: relatedCourse ? relatedCourse.price : 0,
            createdAt: String(e.created_at || new Date().toISOString())
          } as any;
        });
        setEnrollments(formattedEnrollments);
      }
    };

    loadRealData();
  }, []);

  useEffect(() => {
    const fetchAndSetUser = async (sessionUser: any) => {
      const { data } = await supabase.from('users').select('role').eq('id', sessionUser.id).single();
      const actualRole = data?.role || 'student';

      setUser({
        id: sessionUser.id,
        name: sessionUser.user_metadata?.full_name || 'طالب',
        email: sessionUser.email || '',
        phone: sessionUser.user_metadata?.phone_number || '',
        role: actualRole as 'student' | 'admin',
        password: '',
        createdAt: sessionUser.created_at,
      } as User);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchAndSetUser(session.user);
      } else {
        setUser(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        fetchAndSetUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    const state: PersistedState = { theme, progress, user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [theme, progress, user]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const createEnrollment: AppState['createEnrollment'] = async (data) => {
    if (!user) return;
    const course = courses.find((c) => c.id === data.courseId);
    if (!course) return;

    const isFree = Number(course.price) === 0;
    const initialStatus = isFree ? 'approved' : 'pending';

    const { data: dbData, error } = await supabase
      .from('enrollments')
      .insert({
        student_id: user.id,
        student_name: user.name,
        course_id: data.courseId,
        status: initialStatus,
        receipt_url: data.receiptUrl || '',
        payment_method: data.paymentMethod || (isFree ? 'مجانياً' : ''),
        payment_account: data.paymentAccount || ''
      })
      .select();

    if (error) {
      alert(`حصل خطأ: ${error.message}`);
      return;
    }

    const insertedRow = dbData && dbData.length > 0 ? dbData[0] : null;

    const enr: any = {
      id: insertedRow ? String(insertedRow.id) : Date.now().toString(),
      studentId: user.id,
      studentName: user.name,
      courseId: data.courseId,
      courseTitle: course.title,
      status: initialStatus,
      receiptUrl: data.receiptUrl || '',
      paymentMethod: data.paymentMethod || (isFree ? 'مجانياً' : ''),
      paymentAccount: data.paymentAccount || '',
      amount: Number(course.price) || 0,
      createdAt: insertedRow ? insertedRow.created_at : new Date().toISOString(),
    };

    setEnrollments((prev) => [...prev, enr]);

    if (isFree) {
      alert("🎉 مبروك! تم تفعيل الكورس المجاني بنجاح، تقدر تبدأ مذاكرة دلوقتي.");
    } else {
      alert("تم إرسال الإيصال للإدارة للمراجعة، سيتم تفعيل الكورس قريباً!");
    }
  };

  const adminEnrollStudent: AppState['adminEnrollStudent'] = async (studentId, courseId) => {
    const student = users.find(u => u.id === studentId);
    const course = courses.find(c => c.id === courseId);
    if (!student || !course) return;

    const { data: dbData, error } = await supabase
      .from('enrollments')
      .insert({
        student_id: student.id,
        student_name: student.name,
        course_id: courseId,
        status: 'approved',
        receipt_url: '',
        payment_method: 'إضافة يدوية من الإدارة',
        payment_account: 'الإدارة'
      })
      .select();

    if (error) {
      alert(`حصل خطأ أثناء الإضافة: ${error.message}`);
      return;
    }

    const insertedRow = dbData && dbData.length > 0 ? dbData[0] : null;

    const enr: any = {
      id: insertedRow ? String(insertedRow.id) : Date.now().toString(),
      studentId: student.id,
      studentName: student.name,
      courseId: courseId,
      courseTitle: course.title,
      status: 'approved',
      receiptUrl: '',
      paymentMethod: 'إضافة يدوية من الإدارة',
      paymentAccount: 'الإدارة',
      amount: Number(course.price) || 0,
      createdAt: insertedRow ? insertedRow.created_at : new Date().toISOString(),
    };

    setEnrollments((prev) => [...prev, enr]);
    alert(`تم بنجاح إضافة كورس "${course.title}" للطالب "${student.name}"`);
  };

  const updateEnrollmentStatus: AppState['updateEnrollmentStatus'] = async (id, status, note) => {
    const { error } = await supabase
      .from('enrollments')
      .update({ status: status })
      .eq('id', id);

    if (error) {
      alert(`خطأ في تحديث الحالة: ${error.message}`);
      return;
    }

    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status, reviewedAt: new Date().toISOString(), reviewerNote: note } : e
      )
    );
  };

  const markLessonComplete: AppState['markLessonComplete'] = (lessonId, courseId, quizScore) => {
    if (!user) return;
    setProgress((prev) => {
      const existing = prev.find((p) => p.userId === user.id && p.lessonId === lessonId);
      if (existing) {
        return prev.map((p) =>
          p.lessonId === lessonId && p.userId === user.id
            ? { ...p, completed: true, completedAt: new Date().toISOString(), quizScore }
            : p
        );
      }
      return [...prev, { userId: user.id, lessonId, courseId, completed: true, completedAt: new Date().toISOString(), quizScore }];
    });
  };

  const isLessonComplete: AppState['isLessonComplete'] = (lessonId) => {
    if (!user) return false;
    return progress.some((p) => p.userId === user.id && p.lessonId === lessonId && p.completed);
  };

  const isLessonUnlocked: AppState['isLessonUnlocked'] = (lessonId, courseId) => {
    if (!user) return false;
    const course = courses.find((c) => c.id === courseId);
    if (!course) return false;
    const lessons = [...course.lessons].sort((a, b) => a.order - b.order);
    const idx = lessons.findIndex((l) => l.id === lessonId);
    if (idx === 0) return true;
    const prev = lessons[idx - 1];
    return isLessonComplete(prev.id);
  };

  const addCourse: AppState['addCourse'] = async (courseData: any) => {
    const { data, error } = await supabase.from('courses').insert({
      title: courseData.title,
      description: courseData.description,
      stage: courseData.stage,
      grade: courseData.grade,
      subject: courseData.subject,
      instructor: courseData.instructor || 'مستر عماد',
      price: Number(courseData.price),
      image_url: courseData.imageUrl || courseData.coverImage || ''
    }).select().single();

    if (error) {
      alert(`حصل خطأ في حفظ الكورس: ${error.message}`);
      return;
    }

    setCourses(prev => [...prev, {
      id: String(data.id),
      title: String(data.title || ''),
      description: String(data.description || ''),
      stage: (data.stage || 'secondary') as any,
      grade: String(data.grade || ''),
      subject: String(data.subject || ''),
      instructor: String(data.instructor || 'مستر عماد'),
      price: Number(data.price) || 0,
      coverImage: String(data.image_url || ''),
      imageUrl: String(data.image_url || ''),
      lessons: [] as any,
      createdAt: String(data.created_at || new Date().toISOString())
    } as any]);
    alert("تمت إضافة الكورس بنجاح!");
  };

  const addLesson: AppState['addLesson'] = async (courseId, lesson: any) => {
    const course = courses.find(c => c.id === courseId);
    const nextOrder = course ? course.lessons.length + 1 : 1;

    const { data, error } = await supabase.from('lessons').insert({
      course_id: courseId,
      title: lesson.title,
      description: lesson.description || '',
      video_url: lesson.videoUrl || lesson.fileUrl || lesson.youtubeId || '',
      order: nextOrder,
      type: lesson.type || 'video',
      passing_score: lesson.passingScore || 50, // 🔴 حفظ نسبة النجاح
      questions: lesson.questions || []
    }).select().single();

    if (error) {
      alert(`حصل خطأ أثناء إضافة الدرس: ${error.message}`);
      return;
    }

    const newLesson = {
      id: String(data.id),
      courseId: String(data.course_id),
      title: String(data.title || ''),
      description: String(data.description || ''),
      videoUrl: String(data.video_url || ''),
      order: Number(data.order || 1),
      type: data.type || 'video',
      passingScore: Number(data.passing_score) || 50,
      questions: data.questions || []
    };

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return { ...c, lessons: [...c.lessons, newLesson as any] };
      })
    );
    alert("تم إضافة المحتوى بنجاح للطلاب!");
  };

  const deleteLesson: AppState['deleteLesson'] = async (courseId, lessonId) => {
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
    if (error) {
      alert(`حصل خطأ أثناء حذف الدرس: ${error.message}`);
      return;
    }
    setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) } : c));
  };

  const deleteCourse: AppState['deleteCourse'] = async (courseId) => {
    const { error: lessonsError } = await supabase.from('lessons').delete().eq('course_id', courseId);
    if (lessonsError) {
      alert(`مشكلة في حذف دروس الكورس: ${lessonsError.message}`);
      return;
    }

    const { error: enrollmentsError } = await supabase.from('enrollments').delete().eq('course_id', courseId);
    if (enrollmentsError) {
      alert(`مشكلة في حذف اشتراكات الكورس: ${enrollmentsError.message}`);
      return;
    }

    const { error: courseError } = await supabase.from('courses').delete().eq('id', courseId);
    if (courseError) {
      alert(`حصل خطأ أثناء حذف الكورس نفسه: ${courseError.message}`);
      return;
    }

    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    alert("تم حذف الكورس وكل محتوياته بنجاح!");
  };

  const resetStudentPassword: AppState['resetStudentPassword'] = async (userId, newPassword) => {
    const { error } = await supabase.rpc('update_user_password', {
      target_user_id: userId,
      new_password: newPassword
    });

    if (error) {
      alert(`حصل خطأ أثناء تغيير كلمة المرور: ${error.message}`);
      return;
    }

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, password: newPassword } : u)));
    alert("تم تغيير كلمة المرور للطالب بنجاح!");
  };

  const toggleStudentAccess: AppState['toggleStudentAccess'] = async (userId) => {
    const userObj = users.find(u => u.id === userId);
    if (!userObj) return;

    const newPassword = userObj.password === '__DISABLED__' ? 'reset123' : '__DISABLED__';

    const { error } = await supabase.rpc('update_user_password', {
      target_user_id: userId,
      new_password: newPassword
    });

    if (error) {
      alert(`حصل خطأ أثناء تغيير حالة الطالب: ${error.message}`);
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPassword } : u))
    );

    alert(newPassword === '__DISABLED__' ? "تم حظر الطالب بنجاح ولن يتمكن من الدخول!" : "تم إلغاء الحظر، كلمة مروره الآن هي: reset123");
  };

  const addAnnouncement: AppState['addAnnouncement'] = async (text) => {
    const { data, error } = await supabase.from('announcements').insert({ text, active: true }).select().single();
    if (error) {
      alert(`حصل خطأ: ${error.message}`);
      return;
    }
    setAnnouncements((prev) => [{ id: String(data.id), text: data.text, active: data.active, createdAt: data.created_at }, ...prev]);
  };

  const toggleAnnouncement: AppState['toggleAnnouncement'] = async (id) => {
    const ann = announcements.find((a) => a.id === id);
    if (!ann) return;
    const { error } = await supabase.from('announcements').update({ active: !ann.active }).eq('id', id);
    if (error) {
      alert(`حصل خطأ: ${error.message}`);
      return;
    }
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  };

  const deleteAnnouncement: AppState['deleteAnnouncement'] = async (id) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) {
      alert(`حصل خطأ: ${error.message}`);
      return;
    }
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const removeRejectedEnrollment: AppState['removeRejectedEnrollment'] = async (enrollmentId) => {
    const { error } = await supabase.from('enrollments').delete().eq('id', enrollmentId);
    if (error) {
      alert(`حصل خطأ أثناء إزالة الطلب: ${error.message}`);
      return;
    }
    setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
    alert("تم إزالة الطلب المرفوض! سيظهر الكورس الآن لتتمكن من التسجيل فيه مجدداً ورفع إيصال جديد.");
  };

  const value: AppState = {
    theme, toggleTheme, user, setUser, logout, courses, enrollments, progress, announcements, users,
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