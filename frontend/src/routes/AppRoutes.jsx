import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../components/layout/AuthLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ManagerLayout from '../components/layout/ManagerLayout';
import TeacherLayout from '../components/layout/TeacherLayout';
import StudentLayout from '../components/layout/StudentLayout';
import ParentLayout from '../components/layout/ParentLayout';
import ProtectedRoute from './ProtectedRoute';

import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminEnrollmentsPage from '../pages/admin/AdminEnrollmentsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminCreateUserPage from '../pages/admin/AdminCreateUserPage';
import AdminEditUserPage from '../pages/admin/AdminEditUserPage';
import AdminUserDetailPage from '../pages/admin/AdminUserDetailPage';
import AdminClassesPage from '../pages/admin/AdminClassesPage';
import AdminCreateClassPage from '../pages/admin/AdminCreateClassPage';
import AdminClassDetailPage from '../pages/admin/AdminClassDetailPage';
import AdminClassStudentsPage from '../pages/admin/AdminClassStudentsPage';
import AdminSchedulesPage from '../pages/admin/AdminSchedulesPage';
import AdminCreateSchedulePage from '../pages/admin/AdminCreateSchedulePage';
import AdminFinancePage from '../pages/admin/AdminFinancePage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';

import ManagerDashboardPage from '../pages/manager/ManagerDashboardPage';
import ManagerStudentsPage from '../pages/manager/ManagerStudentsPage';
import ManagerParentsPage from '../pages/manager/ManagerParentsPage';

import ManagerTeachersPage from '../pages/manager/ManagerTeachersPage';
import ManagerCreateTeacherPage from '../pages/manager/ManagerCreateTeacherPage';
import ManagerEditTeacherPage from '../pages/manager/ManagerEditTeacherPage';

import ManagerSubjectsPage from '../pages/manager/ManagerSubjectsPage';
import ManagerEditSubjectPage from '../pages/manager/ManagerEditSubjectPage';

import ManagerClassesPage from '../pages/manager/ManagerClassesPage';
import ManagerEditClassPage from '../pages/manager/ManagerEditClassPage';

import ManagerSchedulesPage from '../pages/manager/ManagerSchedulesPage';
import ManagerEditSchedulePage from '../pages/manager/ManagerEditSchedulePage';

import ManagerInvoicesPage from '../pages/manager/ManagerInvoicesPage';
import ManagerCreateInvoicePage from '../pages/manager/ManagerCreateInvoicePage';
import ManagerEditInvoicePage from '../pages/manager/ManagerEditInvoicePage';

import TeacherSubjectsPage from '../pages/teacher/TeacherSubjectsPage';
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

import ParentDashboardPage from '../pages/parent/ParentDashboardPage';
import ParentProfilePage from '../pages/parent/ParentProfilePage';

import { getUser, getToken } from '../utils/auth';

/**
 * Component chuyển hướng từ "/" về dashboard đúng role,
 * hoặc về /login nếu chưa đăng nhập.
 */
const RootRedirect = () => {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const roleDashboards = {
    admin: '/admin/dashboard',
    manager: '/manager/dashboard',
    teacher: '/teacher/schedules',
    student: '/student/dashboard',
    parent: '/parent/dashboard',
    accountant: '/accountant/dashboard',
  };

  const role = user.role ? String(user.role).trim().toLowerCase() : '';
  const target = roleDashboards[role] || '/login';
  console.log('RootRedirect: role is', role, 'navigating to', target);
  return <Navigate to={target} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Homepage */}
      <Route path="/" element={<HomePage />} />

      {/* Auth routes — Login */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
      </Route>

      {/* Admin routes — Protected */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="enrollments" element={<AdminEnrollmentsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/create" element={<AdminCreateUserPage />} />
          <Route path="users/edit/:userId" element={<AdminEditUserPage />} />
          <Route path="users/:userId" element={<AdminUserDetailPage />} />
          <Route path="classes" element={<AdminClassesPage />} />
          <Route path="classes/create" element={<AdminCreateClassPage />} />
          <Route path="classes/:classId" element={<AdminClassDetailPage />} />
          <Route path="classes/:classId/students" element={<AdminClassStudentsPage />} />
          <Route path="schedules" element={<AdminSchedulesPage />} />
          <Route path="schedules/create" element={<AdminCreateSchedulePage />} />
          <Route path="finance" element={<AdminFinancePage />} />
          <Route path="reports" element={<AdminReportsPage />} />
        </Route>
      </Route>

      {/* Manager routes — Protected */}
      <Route element={<ProtectedRoute requiredRole="manager" />}>
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboardPage />} />

          <Route path="students" element={<ManagerStudentsPage />} />
          <Route path="parents" element={<ManagerParentsPage />} />

          <Route path="teachers" element={<ManagerTeachersPage />} />
          <Route path="teachers/create" element={<ManagerCreateTeacherPage />} />
          <Route path="teachers/edit/:teacherId" element={<ManagerEditTeacherPage />} />

          <Route path="subjects" element={<ManagerSubjectsPage />} />
          <Route path="subjects/edit/:subjectId" element={<ManagerEditSubjectPage />} />

          <Route path="classes" element={<ManagerClassesPage />} />
          <Route path="classes/edit/:classId" element={<ManagerEditClassPage />} />

          <Route path="schedules" element={<ManagerSchedulesPage />} />
          <Route path="schedules/edit/:scheduleId" element={<ManagerEditSchedulePage />} />

          <Route path="invoices" element={<ManagerInvoicesPage />} />
          <Route path="invoices/create" element={<ManagerCreateInvoicePage />} />
          <Route path="invoices/edit/:invoiceId" element={<ManagerEditInvoicePage />} />
        </Route>
      </Route>

      {/* Teacher routes — Protected */}
      <Route element={<ProtectedRoute requiredRole="teacher" />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate to="schedules" replace />} />
          <Route path="subjects" element={<TeacherSubjectsPage />} />
          <Route path="classes" element={<TeacherClassesPage />} />
          <Route path="classes/:classId" element={<TeacherClassDetailPage />} />
          <Route path="classes/:classId/students" element={<TeacherClassStudentsPage />} />
          <Route path="schedules" element={<TeacherSchedulesPage />} />
          <Route path="classes/:classId/sessions" element={<TeacherSessionsPage />} />
          <Route path="classes/:classId/sessions/:sessionId/attendance" element={<TeacherAttendancePage />} />
        </Route>
      </Route>

      {/* Student Routes */}
      <Route element={<ProtectedRoute requiredRole="student" />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="classes" element={<StudentClassesPage />} />
          <Route path="schedules" element={<StudentSchedulesPage />} />
          <Route path="sessions" element={<StudentSessionsPage />} />
          <Route path="invoices" element={<StudentInvoicesPage />} />
          <Route path="support" element={<StudentSupportPage />} />
        </Route>
      </Route>

      {/* Parent Routes */}
      <Route element={<ProtectedRoute requiredRole="parent" />}>
        <Route path="/parent" element={<ParentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ParentDashboardPage />} />
          <Route path="profile" element={<ParentProfilePage />} />
        </Route>
      </Route>

      {/* Catch all — redirect to homepage */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;