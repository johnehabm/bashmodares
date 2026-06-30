import type {
  Course,
  User,
  Enrollment,
  LessonProgress,
  Announcement,
} from '../types';

export const PAYMENT_NUMBER = '01210741671';
export const INSTRUCTOR_NAME = 'مستر عماد عادل';

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    text: 'تنبيه: امتحان الشهر الأول سيُعقد يوم السبت القادم الساعة 10 صباحًا — راجعوا ملخصات الدروس!',
    active: true,
    createdAt: '2025-09-01T10:00:00Z',
  },
];

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    name: 'مستر عماد عادل',
    email: 'admin@bashmodares.com',
    role: 'admin',
    password: 'admin123',
    createdAt: '2025-08-01T00:00:00Z',
  },
  {
    id: 'student-1',
    name: 'أحمد محمد',
    email: 'student@bashmodares.com',
    phone: '01000000000',
    role: 'student',
    password: 'student123',
    createdAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'student-2',
    name: 'سارة خالد',
    email: 'sara@example.com',
    phone: '01111111111',
    role: 'student',
    password: 'sara123',
    createdAt: '2025-09-05T00:00:00Z',
  },
];

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'الرياضيات للصف السادس الابتدائي',
    stage: 'primary',
    grade: 'السادس الابتدائي',
    description:
      'منهج الرياضيات الكامل للصف السادس الابتدائي — من الأعداد والعمليات حتى الهندسة والقياس. دروس متسلسلة مع فيديوهات شارحة، ملخصات PDF، واختبارات تفاعلية.',
    price: 250,
    coverImage:
      'https://images.pexels.com/photos/2076624/pexels-photo-2076624.jpeg?auto=compress&cs=tinysrgb&w=900',
    instructor: INSTRUCTOR_NAME,
    createdAt: '2025-08-15T00:00:00Z',
    lessons: [
      {
        id: 'l-1-1',
        courseId: 'course-1',
        title: 'الدرس 1: الأعداد والقيمة المنزلية',
        type: 'video',
        order: 1,
        duration: '18:30',
        youtubeId: 'dQw4w9WgXcQ',
      },
      {
        id: 'l-1-2',
        courseId: 'course-1',
        title: 'الدرس 2: ملخص الأعداد والقيمة المنزلية',
        type: 'pdf',
        order: 2,
        pdfUrl: 'https://drive.google.com/file/d/example1/view',
      },
      {
        id: 'l-1-3',
        courseId: 'course-1',
        title: 'اختبار: الأعداد والقيمة المنزلية',
        type: 'quiz',
        order: 3,
        passingScore: 60,
        questions: [
          {
            id: 'q-1-1',
            text: 'ما القيمة المنزلية للرقم 5 في العدد 3527؟',
            options: [
              { id: 'a', text: 'الآحاد', correct: false },
              { id: 'b', text: 'العشرات', correct: false },
              { id: 'c', text: 'المئات', correct: true },
              { id: 'd', text: 'الآلاف', correct: false },
            ],
            explanation: 'الرقم 5 في خانة المئات، قيمته 500.',
          },
          {
            id: 'q-1-2',
            text: 'اكتب العدد ثلاثة آلاف ومئتان وخمسة وأربعون بالأرقام.',
            options: [
              { id: 'a', text: '3245', correct: true },
              { id: 'b', text: '3425', correct: false },
              { id: 'c', text: '3542', correct: false },
              { id: 'd', text: '3254', correct: false },
            ],
          },
          {
            id: 'q-1-3',
            text: 'ما أكبر عدد من ثلاث خانات؟',
            options: [
              { id: 'a', text: '900', correct: false },
              { id: 'b', text: '999', correct: true },
              { id: 'c', text: '99', correct: false },
              { id: 'd', text: '1000', correct: false },
            ],
          },
        ],
        flashcards: [
          {
            id: 'f-1-1',
            front: 'ما هي القيمة المنزلية؟',
            back: 'هي قيمة الرقم حسب موضعه في العدد (آحاد، عشرات، مئات...).',
          },
          {
            id: 'f-1-2',
            front: 'الفرق بين القيمة المنزلية والقيمة الرقمية؟',
            back: 'القيمة المنزلية تعتمد على الموقع، أما القيمة الرقمية فهي قيمة الرقم نفسه.',
          },
        ],
      },
      {
        id: 'l-1-4',
        courseId: 'course-1',
        title: 'الدرس 4: جمع وطرح الأعداد الكبيرة',
        type: 'video',
        order: 4,
        duration: '22:10',
        youtubeId: 'dQw4w9WgXcQ',
      },
      {
        id: 'l-1-5',
        courseId: 'course-1',
        title: 'الدرس 5: ملخص الجمع والطرح',
        type: 'pdf',
        order: 5,
        pdfUrl: 'https://drive.google.com/file/d/example2/view',
      },
      {
        id: 'l-1-6',
        courseId: 'course-1',
        title: 'اختبار: الجمع والطرح',
        type: 'quiz',
        order: 6,
        passingScore: 60,
        questions: [
          {
            id: 'q-2-1',
            text: 'كم يساوي 4567 + 2331؟',
            options: [
              { id: 'a', text: '6898', correct: true },
              { id: 'b', text: '6798', correct: false },
              { id: 'c', text: '6888', correct: false },
              { id: 'd', text: '6890', correct: false },
            ],
          },
          {
            id: 'q-2-2',
            text: 'كم يساوي 8000 - 3456؟',
            options: [
              { id: 'a', text: '4544', correct: true },
              { id: 'b', text: '4644', correct: false },
              { id: 'c', text: '4444', correct: false },
              { id: 'd', text: '4554', correct: false },
            ],
          },
        ],
        flashcards: [
          {
            id: 'f-2-1',
            front: 'ماذا نفعل عند الجمع فوق 9 في خانة؟',
            back: 'نحمل (carry) الواحد إلى الخانة الأعلى.',
          },
        ],
      },
    ],
  },
  {
    id: 'course-2',
    title: 'الجبر للصف الأول الإعدادي',
    stage: 'preparatory',
    grade: 'الأول الإعدادي',
    description:
      'أساسيات الجبر للصف الأول الإعدادي — المعادلات، المتباينات، والدوال. شرح مبسط مع أمثلة محلولة واختبارات لقياس فهمك.',
    price: 300,
    coverImage:
      'https://images.pexels.com/photos/6238018/pexels-photo-6238018.jpeg?auto=compress&cs=tinysrgb&w=900',
    instructor: INSTRUCTOR_NAME,
    createdAt: '2025-08-20T00:00:00Z',
    lessons: [
      {
        id: 'l-2-1',
        courseId: 'course-2',
        title: 'الدرس 1: مقدمة في المعادلات',
        type: 'video',
        order: 1,
        duration: '25:00',
        youtubeId: 'dQw4w9WgXcQ',
      },
      {
        id: 'l-2-2',
        courseId: 'course-2',
        title: 'الدرس 2: ملخص المعادلات الخطية',
        type: 'pdf',
        order: 2,
        pdfUrl: 'https://drive.google.com/file/d/example3/view',
      },
      {
        id: 'l-2-3',
        courseId: 'course-2',
        title: 'اختبار: المعادلات الخطية',
        type: 'quiz',
        order: 3,
        passingScore: 60,
        questions: [
          {
            id: 'q-3-1',
            text: 'ما حل المعادلة 2x + 5 = 11؟',
            options: [
              { id: 'a', text: 'x = 3', correct: true },
              { id: 'b', text: 'x = 4', correct: false },
              { id: 'c', text: 'x = 2', correct: false },
              { id: 'd', text: 'x = 6', correct: false },
            ],
            explanation: '2x = 11 - 5 = 6، إذن x = 3.',
          },
          {
            id: 'q-3-2',
            text: 'ما حل المعادلة 3x - 7 = 14؟',
            options: [
              { id: 'a', text: 'x = 5', correct: false },
              { id: 'b', text: 'x = 7', correct: true },
              { id: 'c', text: 'x = 6', correct: false },
              { id: 'd', text: 'x = 8', correct: false },
            ],
          },
          {
            id: 'q-3-3',
            text: 'إذا كان x + 4 = 10 فإن x = ؟',
            options: [
              { id: 'a', text: '14', correct: false },
              { id: 'b', text: '6', correct: true },
              { id: 'c', text: '40', correct: false },
              { id: 'd', text: '5', correct: false },
            ],
          },
        ],
        flashcards: [
          {
            id: 'f-3-1',
            front: 'ما هي المعادلة الخطية؟',
            back: 'معادلة من الدرجة الأولى فيها متغير واحد بأس 1.',
          },
          {
            id: 'f-3-2',
            front: 'كيف نحل المعادلة ax + b = c؟',
            back: 'نطرح b من الطرفين ثم نقسم على a.',
          },
        ],
      },
      {
        id: 'l-2-4',
        courseId: 'course-2',
        title: 'الدرس 4: المتباينات',
        type: 'video',
        order: 4,
        duration: '20:15',
        youtubeId: 'dQw4w9WgXcQ',
      },
    ],
  },
  {
    id: 'course-3',
    title: 'الهندسة والقياس للصف الثاني الإعدادي',
    stage: 'preparatory',
    grade: 'الثاني الإعدادي',
    description:
      'الهندسة، المساحات، والحجوم للصف الثاني الإعدادي. دروس مرئية مع رسومات توضيحية وملخصات واختبارات تطبيقية.',
    price: 280,
    coverImage:
      'https://images.pexels.com/photos/814466/pexels-photo-814466.jpeg?auto=compress&cs=tinysrgb&w=900',
    instructor: INSTRUCTOR_NAME,
    createdAt: '2025-08-25T00:00:00Z',
    lessons: [
      {
        id: 'l-3-1',
        courseId: 'course-3',
        title: 'الدرس 1: مساحة المثلث',
        type: 'video',
        order: 1,
        duration: '15:40',
        youtubeId: 'dQw4w9WgXcQ',
      },
      {
        id: 'l-3-2',
        courseId: 'course-3',
        title: 'الدرس 2: ملخص المساحات',
        type: 'pdf',
        order: 2,
        pdfUrl: 'https://drive.google.com/file/d/example4/view',
      },
      {
        id: 'l-3-3',
        courseId: 'course-3',
        title: 'اختبار: المساحات',
        type: 'quiz',
        order: 3,
        passingScore: 60,
        questions: [
          {
            id: 'q-4-1',
            text: 'ما مساحة مثلث قاعدته 10 سم وارتفاعه 6 سم؟',
            options: [
              { id: 'a', text: '60 سم²', correct: false },
              { id: 'b', text: '30 سم²', correct: true },
              { id: 'c', text: '16 سم²', correct: false },
              { id: 'd', text: '20 سم²', correct: false },
            ],
            explanation: 'المساحة = ½ × القاعدة × الارتفاع = ½ × 10 × 6 = 30.',
          },
          {
            id: 'q-4-2',
            text: 'ما مساحة دائرة نصف قطرها 7 سم (π = 22/7)؟',
            options: [
              { id: 'a', text: '154 سم²', correct: true },
              { id: 'b', text: '44 سم²', correct: false },
              { id: 'c', text: '22 سم²', correct: false },
              { id: 'd', text: '49 سم²', correct: false },
            ],
          },
        ],
        flashcards: [
          {
            id: 'f-4-1',
            front: 'قانون مساحة المثلث؟',
            back: '½ × القاعدة × الارتفاع.',
          },
          {
            id: 'f-4-2',
            front: 'قانون مساحة الدائرة؟',
            back: 'π × نق².',
          },
        ],
      },
    ],
  },
];

export const mockEnrollments: Enrollment[] = [
  {
    id: 'enr-1',
    studentId: 'student-1',
    studentName: 'أحمد محمد',
    courseId: 'course-1',
    courseTitle: 'الرياضيات للصف السادس الابتدائي',
    status: 'approved',
    receiptUrl:
      'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=600',
    receiptFileName: 'receipt_ahmed.jpg',
    amount: 250,
    createdAt: '2025-09-02T12:00:00Z',
    reviewedAt: '2025-09-02T15:00:00Z',
  },
  {
    id: 'enr-2',
    studentId: 'student-2',
    studentName: 'سارة خالد',
    courseId: 'course-2',
    courseTitle: 'الجبر للصف الأول الإعدادي',
    status: 'pending',
    receiptUrl:
      'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=600',
    receiptFileName: 'receipt_sara.jpg',
    amount: 300,
    createdAt: '2025-09-06T09:30:00Z',
  },
];

export const mockProgress: LessonProgress[] = [
  {
    userId: 'student-1',
    lessonId: 'l-1-1',
    courseId: 'course-1',
    completed: true,
    completedAt: '2025-09-03T10:00:00Z',
  },
  {
    userId: 'student-1',
    lessonId: 'l-1-2',
    courseId: 'course-1',
    completed: true,
    completedAt: '2025-09-03T11:00:00Z',
  },
  {
    userId: 'student-1',
    lessonId: 'l-1-3',
    courseId: 'course-1',
    completed: true,
    completedAt: '2025-09-03T12:00:00Z',
    quizScore: 100,
  },
];
