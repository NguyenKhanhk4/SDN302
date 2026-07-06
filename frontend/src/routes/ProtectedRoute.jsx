import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ requiredRole, children }) => {
  // Bỏ đăng nhập: luôn cho phép truy cập
  return children ? children : <Outlet />;
};

export default ProtectedRoute;