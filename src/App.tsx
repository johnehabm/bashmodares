import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { ReactNode } from 'react';

// 1. مكون حماية المسارات (بيعمل شاشة تحميل شيك لحد ما يتأكد من حالة الدخول)
function RequireAuth({ children, role }: { children: ReactNode; role?: 'student' | 'admin' }) {
  const { user } = useApp();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // بنسأل الداتا بيز بهدوء، وبندي للمتصفح كسر من الثانية عشان يلحق يحط بياناتك
    supabase.auth.getSession().then(() => {
      setTimeout(() => setIsChecking(false), 300);
    });
  }, []);

  if (isChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent shadow-soft"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// 2. مكون التوجيه الذكي (لو إنت مسجل دخول وفتحت صفحة اللوجين، يوديك الداشبورد فوراً)
function RedirectIfAuth({ children }: { children: ReactNode }) {
  const { user } = useApp();

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />

        {/* طبقنا التوجيه الذكي على صفحات التسجيل والدخول */}
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <LoginPage />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuth>
              <RegisterPage />
            </RedirectIfAuth>
          }
        />

        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />

        {/* مسارات الداشبورد المحمية */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth role="student">
              <StudentDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}