import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../components/layout/AuthLayout';
import TeacherLayout from '../components/layout/TeacherLayout';
import StudentLayout from '../components/layout/StudentLayout';
import ProtectedRoute from './ProtectedRoute';

import LoginPage from '../pages/auth/LoginPage';
import HomePage from '../pages/HomePage';
import TeacherDashboardPage from '../pages/teacher/TeacherDashboardPage';
import TeacherClassesPage from '../pages/teacher/TeacherClassesPage';
import TeacherClassDetailPage from '../pages/teacher/TeacherClassDetailPage';
import TeacherClassStudentsPage from '../pages/teacher/TeacherClassStudentsPage';
import TeacherSchedulesPage from '../pages/teacher/TeacherSchedulesPage';
import TeacherSessionsPage from '../pages/teacher/TeacherSessionsPage';
import TeacherAttendancePage from '../pages/teacher/TeacherAttendancePage';

import StudentDashboardPage from '../pages/student/StudentDashboardPage';
import StudentProfilePage from '../pages/student/StudentProfilePage';
import StudentClassesPage from '../pages/student/StudentClassesPage';
import StudentSchedulesPage from '../pages/student/StudentSchedulesPage';
import StudentSessionsPage from '../pages/student/StudentSessionsPage';
import StudentInvoicesPage from '../pages/student/StudentInvoicesPage';
import StudentSupportPage from '../pages/student/StudentSupportPage';

const AppRoutes = () => {
  const getLoginRedirect = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role?.toUpperCase() === 'TEACHER') {
          return <Navigate to="/teacher/dashboard" replace />;
        } else if (user.role?.toUpperCase() === 'STUDENT') {
          return <Navigate to="/student/dashboard" replace />;
        }
      } catch {
        return <LoginPage />;
      }
    }
    return <LoginPage />;
  };

  return (
    <Routes>
      {/* Root Route redirect based on auth status */}
      {/* Public Home Route */}
      <Route path="/" element={<HomePage />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={getLoginRedirect()} />
      </Route>

      {/* Teacher Routes */}
      <Route path="/teacher" element={
        <ProtectedRoute requiredRole="TEACHER">
          <TeacherLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboardPage />} />
        <Route path="classes" element={<TeacherClassesPage />} />
        <Route path="classes/:classId" element={<TeacherClassDetailPage />} />
        <Route path="classes/:classId/students" element={<TeacherClassStudentsPage />} />
        <Route path="classes/:classId/sessions" element={<TeacherSessionsPage />} />
        <Route path="classes/:classId/sessions/:sessionId/attendance" element={<TeacherAttendancePage />} />
        <Route path="schedules" element={<TeacherSchedulesPage />} />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute requiredRole="STUDENT">
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="classes" element={<StudentClassesPage />} />
        <Route path="schedules" element={<StudentSchedulesPage />} />
        <Route path="sessions" element={<StudentSessionsPage />} />
        <Route path="invoices" element={<StudentInvoicesPage />} />
        <Route path="support" element={<StudentSupportPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
