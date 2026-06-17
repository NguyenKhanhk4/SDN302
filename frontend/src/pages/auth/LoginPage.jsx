import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { saveAuth } from '../../utils/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

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
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
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

      // Theo cấu trúc API chung, token và user thường nằm trong response, hoặc response.data
      const user = response.user;
      const token = response.token;

      if (!user || String(user.role).toUpperCase() !== 'TEACHER') {
        setGlobalError('Only teacher account can access this portal');
        setLoading(false);
        return;
      }

      // Lưu token & user info
      saveAuth(token, user);
      
      // Chuyển hướng tới Dashboard
      navigate('/teacher/dashboard', { replace: true });

    } catch (err) {
      setGlobalError(err.message || err.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <div className="p-2">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Tutor Center</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your teacher account</p>
        </div>

        {globalError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="teacher@gmail.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
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
              Login
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default LoginPage;
