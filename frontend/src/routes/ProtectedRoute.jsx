import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ requiredRole, children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    const redirectPath = requiredRole === 'ADMIN' ? '/admin/login' : '/login';
    return <Navigate to={redirectPath} replace />;
  }

  let authorized = false;

  try {
    const user = JSON.parse(userStr);
    if (!requiredRole || String(user.role).toUpperCase() === String(requiredRole).toUpperCase()) {
      authorized = true;
    }
  } catch (error) {
    console.error("Failed to verify protected route role", error);
  }

  if (!authorized) {
    const redirectPath = requiredRole === 'ADMIN' ? '/admin/login' : '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
