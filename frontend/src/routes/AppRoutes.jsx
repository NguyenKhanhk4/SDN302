import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../components/layout/AuthLayout';
import TeacherLayout from '../components/layout/TeacherLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

import LoginPage from '../pages/auth/LoginPage';
import TeacherDashboardPage from '../pages/teacher/TeacherDashboardPage';
import TeacherClassesPage from '../pages/teacher/TeacherClassesPage';
import TeacherClassDetailPage from '../pages/teacher/TeacherClassDetailPage';
import TeacherClassStudentsPage from '../pages/teacher/TeacherClassStudentsPage';
import TeacherSchedulesPage from '../pages/teacher/TeacherSchedulesPage';
import TeacherSessionsPage from '../pages/teacher/TeacherSessionsPage';
import TeacherAttendancePage from '../pages/teacher/TeacherAttendancePage';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminCreateUserPage from '../pages/admin/AdminCreateUserPage';
import AdminUserDetailPage from '../pages/admin/AdminUserDetailPage';
import AdminEditUserPage from '../pages/admin/AdminEditUserPage';
import AdminClassesPage from '../pages/admin/AdminClassesPage';
import AdminCreateClassPage from '../pages/admin/AdminCreateClassPage';
import AdminClassDetailPage from '../pages/admin/AdminClassDetailPage';
import AdminClassStudentsPage from '../pages/admin/AdminClassStudentsPage';
import AdminSchedulesPage from '../pages/admin/AdminSchedulesPage';
import AdminCreateSchedulePage from '../pages/admin/AdminCreateSchedulePage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminEnrollmentsPage from '../pages/admin/AdminEnrollmentsPage';
import AdminSubjectsPage from '../pages/admin/AdminSubjectsPage';
import AdminFinancePage from '../pages/admin/AdminFinancePage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';

const RootRedirect = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  let redirectTo;
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (String(user.role).toUpperCase() === 'ADMIN') {
        redirectTo = "/admin/dashboard";
      } else {
        redirectTo = "/teacher/dashboard";
      }
    } catch (e) {
      console.error(e);
      redirectTo = "/login";
    }
  } else {
    redirectTo = "/login";
  }

  return <Navigate to={redirectTo} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root Route redirect based on auth status and role */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          localStorage.getItem('token') ? <RootRedirect /> : <LoginPage />
        } />
        <Route path="/admin/login" element={
          localStorage.getItem('token') ? <RootRedirect /> : <AdminLoginPage />
        } />
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

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="ADMIN">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/create" element={<AdminCreateUserPage />} />
        <Route path="users/:userId" element={<AdminUserDetailPage />} />
        <Route path="users/:userId/edit" element={<AdminEditUserPage />} />
        <Route path="classes" element={<AdminClassesPage />} />
        <Route path="classes/create" element={<AdminCreateClassPage />} />
        <Route path="classes/:classId" element={<AdminClassDetailPage />} />
        <Route path="classes/:classId/students" element={<AdminClassStudentsPage />} />
        <Route path="schedules" element={<AdminSchedulesPage />} />
        <Route path="schedules/create" element={<AdminCreateSchedulePage />} />
        <Route path="enrollments" element={<AdminEnrollmentsPage />} />
        <Route path="subjects" element={<AdminSubjectsPage />} />
        <Route path="finance" element={<AdminFinancePage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

