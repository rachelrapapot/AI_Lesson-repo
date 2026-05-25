import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { LessonEditorPage } from './pages/LessonEditorPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { StudentLessonPage } from './pages/StudentLessonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAuthStore } from './store/authStore';
import { UserRole } from './types';

function DefaultRedirect() {
  const user = useAuthStore((s) => s.user);
  const target = user?.role === UserRole.TEACHER ? '/dashboard' : '/student';
  return <Navigate to={target} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lessons/new"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                      <LessonEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lessons/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                      <LessonEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                      <StudentDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/lessons/:id"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                      <StudentLessonPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<DefaultRedirect />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
