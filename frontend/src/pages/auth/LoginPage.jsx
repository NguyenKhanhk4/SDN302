import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { saveAuth, getUser } from '../../utils/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Nếu đã đăng nhập, redirect về dashboard đúng role
  const existingUser = getUser();
  if (existingUser && localStorage.getItem('token')) {
    const roleDashboards = {
      admin: '/admin/dashboard',
      manager: '/manager/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
      parent: '/parent/dashboard',
      accountant: '/accountant/dashboard',
    };
    const target = roleDashboards[existingUser.role] || '/';
    navigate(target, { replace: true });
    return null;
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
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
        parent: '/parent/dashboard',
        accountant: '/accountant/dashboard',
      };

      const role = String(user.role).toLowerCase();
      const target = roleDashboards[role] || '/login';
      navigate(target, { replace: true });

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
            label="Địa chỉ Email"
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
        </form>
      </div>
    </Card>
  );
};

export default LoginPage;
