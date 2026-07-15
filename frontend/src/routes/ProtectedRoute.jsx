import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getUser } from '../utils/auth';

/**
 * ProtectedRoute — Kiểm tra đăng nhập và quyền role.
 * - Chưa đăng nhập → redirect /login
 * - Sai role → redirect về dashboard đúng role
 */
const ProtectedRoute = ({ requiredRole, children }) => {
  const token = getToken();
  const user = getUser();

  // Chưa đăng nhập
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role nếu có yêu cầu
  if (requiredRole && String(user.role).trim().toLowerCase() !== String(requiredRole).trim().toLowerCase()) {
    console.log('ProtectedRoute: Role mismatch!', user.role, 'vs required:', requiredRole);
    // Redirect về dashboard đúng role của user
    const roleDashboards = {
      admin: '/admin/dashboard',
      manager: '/manager/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
      parent: '/parent/dashboard',
    };
    const role = user.role ? String(user.role).trim().toLowerCase() : '';
    const target = roleDashboards[role] || '/login';
    console.log('ProtectedRoute: Redirecting to', target);
    return <Navigate to={target} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;