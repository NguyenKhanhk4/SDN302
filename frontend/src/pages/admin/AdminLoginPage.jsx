import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { saveAuth } from '../../utils/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

      if (!user || String(user.role).toUpperCase() !== 'ADMIN') {
        setGlobalError('Chỉ tài khoản Admin mới có thể truy cập trang quản trị này');
        setLoading(false);
        return;
      }

      // Lưu token & user info
      saveAuth(token, user);
      
      // Chuyển hướng tới Admin Dashboard
      navigate('/admin/dashboard', { replace: true });

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
          <h2 className="text-2xl font-bold text-gray-900">Tutor Center Admin</h2>
          <p className="mt-2 text-sm text-gray-600">Đăng nhập vào cổng quản trị viên</p>
        </div>

        {globalError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Địa chỉ Email Admin"
            name="email"
            type="email"
            placeholder="admin@gmail.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          
          <Input
            label="Mật khẩu"
            name="password"
            type="password"
            placeholder="Nhập mật khẩu admin"
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
              Đăng nhập Admin
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default AdminLoginPage;
