import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';

const AdminCreateUserPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: 'MALE',
    role: 'STUDENT',
    status: 'ACTIVE'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (name, value) => {
    let error = '';
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Họ và tên là bắt buộc';
        else if (!nameRegex.test(value.trim())) error = 'Họ và tên không được chứa số hoặc ký tự đặc biệt';
        else if (value.trim().length < 2 || value.trim().length > 50) error = 'Họ và tên phải từ 2 đến 50 ký tự';
        break;
      case 'email':
        if (!value.trim()) error = 'Email là bắt buộc';
        else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value)) error = 'Email không hợp lệ';
        break;
      case 'phone':
        if (value.trim() && !phoneRegex.test(value.trim())) error = 'Số điện thoại không hợp lệ (gồm 10 số)';
        break;
      case 'password':
        if (!value) error = 'Mật khẩu là bắt buộc';
        else if (value.length < 6) error = 'Mật khẩu phải có ít nhất 6 ký tự';
        break;
      case 'confirmPassword':
        if (!value) error = 'Vui lòng xác nhận mật khẩu';
        else if (value !== formData.password) error = 'Mật khẩu xác nhận không khớp';
        break;
      case 'role':
        if (!value) error = 'Vai trò là bắt buộc';
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));

    if (name === 'password' && formData.confirmPassword) {
      const confirmError = formData.confirmPassword !== value ? 'Mật khẩu xác nhận không khớp' : '';
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Vui lòng điền đầy đủ thông tin hợp lệ');
      return;
    }

    const roleNames = {
      'TEACHER': 'Giảng viên',
      'STUDENT': 'Học viên',
      'PARENT': 'Phụ huynh',
      'MANAGER': 'Quản lý'
    };

    const confirmMessage = `Bạn có chắc chắn muốn tạo tài khoản vai trò ${roleNames[formData.role]} cho người dùng ${formData.fullName.trim()}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    try {
      const response = await adminApi.createUser(formData);
      if (response.success) {
        toast.success('Thêm người dùng thành công!');
        setTimeout(() => {
          navigate('/admin/users');
        }, 1500);
      } else {
        toast.error(response.message || 'Thêm người dùng thất bại');
      }
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra khi tạo người dùng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">Tạo tài khoản cho giảng viên, học viên, phụ huynh hoặc quản lý.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
          Quay lại danh sách
        </Button>
      </div>

      {/* Form Card */}
      <Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Họ và tên"
            name="fullName"
            placeholder="Nhập họ và tên"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.fullName}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Địa chỉ Email"
              name="email"
              type="email"
              placeholder="nguyenvankhanh@gmail.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              autoComplete="new-password"
            />

            <Input
              label="Số điện thoại"
              name="phone"
              placeholder="Ví dụ: 0901234567"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ngày sinh"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.dateOfBirth}
            />

            <div className="flex flex-col">
              <label htmlFor="gender" className="mb-1 text-sm font-medium text-gray-700">Giới tính</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm bg-white"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mật khẩu"
              name="password"
              type="password"
              placeholder="Mật khẩu ít nhất 6 ký tự"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              autoComplete="new-password"
            />

            <Input
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="role" className="mb-1 text-sm font-medium text-gray-700">Vai trò</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm bg-white"
              >
                <option value="TEACHER">Giảng viên</option>
                <option value="STUDENT">Học viên</option>
                <option value="PARENT">Phụ huynh</option>
                <option value="MANAGER">Quản lý</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="status" className="mb-1 text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm bg-white"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="px-6"
            >
              Tạo tài khoản
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminCreateUserPage;
