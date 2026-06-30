export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'admin';
  password?: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  fileUrl?: string;
  youtubeId?: string;
  duration?: string;
  order: number;
  type: 'video' | 'pdf' | 'quiz' | string;
  passingScore?: number; // 🔴 ضيف السطر ده هنا
  questions?: {
    text: string;
    image?: string;
    options: string[];
    correctOptionIndex: number;
  }[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  stage: 'primary' | 'preparatory' | 'secondary' | string;
  grade: string;
  subject: string;
  instructor: string;
  price: number;
  coverImage: string;
  imageUrl?: string;
  lessons: Lesson[];
  createdAt: string;
}

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected';

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  status: EnrollmentStatus;
  receiptUrl: string;
  amount: number;
  paymentMethod?: string;  // 🔴 الإضافة اللي هتحل الإيرور
  paymentAccount?: string; // 🔴 الإضافة اللي هتحل الإيرور
  reviewerNote?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface LessonProgress {
  userId: string;
  lessonId: string;
  courseId: string;
  completed: boolean;
  completedAt?: string;
  quizScore?: number;
}

export interface Announcement {
  id: string;
  text: string;
  active: boolean;
  createdAt: string;
}