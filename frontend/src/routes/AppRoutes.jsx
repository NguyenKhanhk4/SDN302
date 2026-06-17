import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../components/layout/AuthLayout';
import TeacherLayout from '../components/layout/TeacherLayout';
import ProtectedRoute from './ProtectedRoute';

import LoginPage from '../pages/auth/LoginPage';
import TeacherDashboardPage from '../pages/teacher/TeacherDashboardPage';
import TeacherClassesPage from '../pages/teacher/TeacherClassesPage';
import TeacherClassDetailPage from '../pages/teacher/TeacherClassDetailPage';
import TeacherClassStudentsPage from '../pages/teacher/TeacherClassStudentsPage';
import TeacherSchedulesPage from '../pages/teacher/TeacherSchedulesPage';
import TeacherSessionsPage from '../pages/teacher/TeacherSessionsPage';
import TeacherAttendancePage from '../pages/teacher/TeacherAttendancePage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root Route redirect based on auth status */}
      <Route path="/" element={
        localStorage.getItem('token') ? <Navigate to="/teacher/dashboard" replace /> : <Navigate to="/login" replace />
      } />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          localStorage.getItem('token') ? <Navigate to="/teacher/dashboard" replace /> : <LoginPage />
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

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
