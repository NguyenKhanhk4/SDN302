import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const AdminEditUserPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'STUDENT'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getUserDetail(userId);
        if (response.success && response.data) {
          const user = response.data;
          setFormData({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'STUDENT'
          });
        } else {
          setGlobalError(response.message || 'Không tìm thấy người dùng');
        }
      } catch (err) {
        setGlobalError(err.message || 'Đã xảy ra lỗi khi tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Họ và tên là bắt buộc';
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.role) newErrors.role = 'Vai trò là bắt buộc';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setGlobalError('');
    setSuccessMsg('');

    try {
      const response = await adminApi.updateUser(userId, formData);
      if (response.success) {
        setSuccessMsg('Cập nhật thông tin người dùng thành công!');
        setTimeout(() => {
          navigate(`/admin/users/${userId}`);
        }, 1500);
      } else {
        setGlobalError(response.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      setGlobalError(err.message || 'Đã xảy ra lỗi khi lưu thông tin người dùng');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Đang tải thông tin người dùng..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">Cập nhật hồ sơ thông tin cho tài khoản người dùng.</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/admin/users/${userId}`)}>
          Hủy bỏ
        </Button>
      </div>

      {/* Form Card */}
      <Card>
        {globalError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-medium">
            {globalError}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg border border-green-100 text-sm font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Họ và tên"
            name="fullName"
            placeholder="Nhập họ và tên"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Địa chỉ Email"
              name="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="Số điện thoại"
              name="phone"
              placeholder="Ví dụ: 0901234567"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
            />
          </div>

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

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              className="px-6"
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminEditUserPage;
