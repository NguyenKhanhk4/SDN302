import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../components/layout/AuthLayout';
import ManagerLayout from '../components/layout/ManagerLayout';
import TeacherLayout from '../components/layout/TeacherLayout';
import ProtectedRoute from './ProtectedRoute';

import LoginPage from '../pages/auth/LoginPage';

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

import TeacherDashboardPage from '../pages/teacher/TeacherDashboardPage';
import TeacherClassesPage from '../pages/teacher/TeacherClassesPage';
import TeacherClassDetailPage from '../pages/teacher/TeacherClassDetailPage';
import TeacherClassStudentsPage from '../pages/teacher/TeacherClassStudentsPage';
import TeacherSchedulesPage from '../pages/teacher/TeacherSchedulesPage';
import TeacherSessionsPage from '../pages/teacher/TeacherSessionsPage';
import TeacherAttendancePage from '../pages/teacher/TeacherAttendancePage';

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
    teacher: '/teacher/dashboard',
    student: '/student/dashboard',
    parent: '/parent/dashboard',
    accountant: '/accountant/dashboard',
  };

  const target = roleDashboards[user.role] || '/login';
  return <Navigate to={target} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth routes — Login */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
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
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          <Route path="classes" element={<TeacherClassesPage />} />
          <Route path="classes/:classId" element={<TeacherClassDetailPage />} />
          <Route path="classes/:classId/students" element={<TeacherClassStudentsPage />} />
          <Route path="schedules" element={<TeacherSchedulesPage />} />
          <Route path="sessions" element={<TeacherSessionsPage />} />
          <Route path="attendance" element={<TeacherAttendancePage />} />
        </Route>
      </Route>

      {/* Catch all — redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;