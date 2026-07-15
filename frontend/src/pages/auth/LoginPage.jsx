import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { saveAuth, getUser } from '../../utils/auth';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const LoginPage = ({ onSwitchToRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleTempToken, setGoogleTempToken] = useState(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setGlobalError('');
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const response = await authApi.googleLogin(idToken);
      if (response.success) {
        if (response.isNewUser) {
          setGoogleTempToken(response.idToken);
          setShowRoleModal(true);
        } else {
          const { token, user } = response;
          saveAuth(token, user);
          
          const roleDashboards = {
            admin: '/admin/dashboard',
            manager: '/manager/dashboard',
            teacher: '/teacher/schedules',
            student: '/student/dashboard',
            parent: '/parent/dashboard',
          };

          const role = String(user.role).toLowerCase();
          const target = roleDashboards[role] || '/';
          window.location.href = target;
        }
      }
    } catch (err) {
      console.error('Google login error', err);
      setGlobalError(err.message || err.error || 'Đăng nhập Google thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role) => {
    try {
      setLoading(true);
      setGlobalError('');
      const response = await authApi.googleRegister({ idToken: googleTempToken, role });
      if (response.success) {
        const { token, user } = response;
        saveAuth(token, user);
        
        const roleDashboards = {
          admin: '/admin/dashboard',
          manager: '/manager/dashboard',
          teacher: '/teacher/schedules',
          student: '/student/dashboard',
          parent: '/parent/dashboard',
        };

        const target = roleDashboards[role] || '/';
        window.location.href = target;
      }
    } catch (err) {
      console.error('Google register error', err);
      setGlobalError(err.message || err.error || 'Đăng ký lỗi');
      setShowRoleModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Nếu đã đăng nhập, redirect về dashboard đúng role
  const existingUser = getUser();
  if (existingUser && localStorage.getItem('token')) {
    const roleDashboards = {
      admin: '/admin/dashboard',
      manager: '/manager/dashboard',
      teacher: '/teacher/schedules',
      student: '/student/dashboard',
      parent: '/parent/dashboard',
    };
    const role = existingUser.role ? String(existingUser.role).trim().toLowerCase() : '';
    const target = roleDashboards[role] || '/';
    console.log('LoginPage: user already logged in with role', role, 'navigating to', target);
    return <Navigate to={target} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Xóa lỗi field tương ứng khi người dùng gõ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (globalError) setGlobalError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email là bắt buộc';
    if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGlobalError('');
    
    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password
      });

      const user = response.user;
      const token = response.token;

      if (!user || !token) {
        setGlobalError('Không tìm thấy thông tin tài khoản');
        setLoading(false);
        return;
      }

      // Lưu token & user info
      saveAuth(token, user);
      
      // Chuyển hướng tới Dashboard thích hợp theo role
      const roleDashboards = {
        admin: '/admin/dashboard',
        manager: '/manager/dashboard',
        teacher: '/teacher/schedules',
        student: '/student/dashboard',
        parent: '/parent/dashboard',
      };

      const role = String(user.role).toLowerCase();
      const target = roleDashboards[role] || '/';
      // Force a full page reload to clear any stale state or transition bugs
      window.location.href = target;

    } catch (err) {
      setGlobalError(err.message || err.error || 'Email hoặc mật khẩu không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <div className="p-2">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Trung tâm Gia sư</h2>
          <p className="mt-2 text-sm text-gray-600">Đăng nhập vào tài khoản của bạn</p>
        </div>

        {globalError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="tai-khoan@gmail.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          
          <Input
            label="Mật khẩu"
            name="password"
            type="password"
            placeholder="Nhập mật khẩu của bạn"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              Đăng nhập
            </Button>
          </div>

          <div className="text-right mb-4">
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors">Quên mật khẩu?</a>
          </div>

          <div className="relative flex items-center justify-center mt-6 mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative px-4 bg-white text-sm text-slate-500">hoặc</div>
          </div>

          <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all flex justify-center items-center gap-3 disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Đăng nhập bằng Google
          </button>

          <div className="text-center mt-6">
            <span className="text-slate-600 text-sm">Bạn chưa có tài khoản? </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (onSwitchToRegister) onSwitchToRegister();
                else navigate('/register');
              }}
              className="text-blue-600 font-bold hover:underline text-sm"
            >
              Đăng ký ngay
            </button>
          </div>
        </form>
      </div>

      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl relative">
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Bạn là ai?</h3>
            <p className="text-center text-sm text-slate-500 mb-6">
              Vui lòng chọn vai trò để hoàn tất đăng ký tài khoản.
            </p>
            <div className="space-y-3">
              <button
                disabled={loading}
                onClick={() => handleRoleSelect('student')}
                className="w-full p-3 rounded-xl border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-700 font-bold transition-all disabled:opacity-50"
              >
                🎓 Tôi là Học sinh
              </button>
              <button
                disabled={loading}
                onClick={() => handleRoleSelect('parent')}
                className="w-full p-3 rounded-xl border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700 font-bold transition-all disabled:opacity-50"
              >
                👨‍👩‍👧 Tôi là Phụ huynh
              </button>
            </div>
            <button
              disabled={loading}
              onClick={() => setShowRoleModal(false)}
              className="w-full mt-4 p-2 text-sm text-slate-400 hover:text-slate-600 font-medium disabled:opacity-50"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default LoginPage;
