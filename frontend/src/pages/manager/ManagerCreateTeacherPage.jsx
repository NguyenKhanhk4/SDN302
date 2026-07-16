import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ManagerCreateTeacherPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experienceYears: 0,
    status: 'ACTIVE'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên là bắt buộc';
    if (!formData.email.trim()) newErrors.email = 'Email là bắt buộc';
    if (Number(formData.experienceYears) < 0) newErrors.experienceYears = 'Số năm kinh nghiệm không hợp lệ';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setGlobalError('');
    try {
      // Split specialization by comma if it's a string
      const specs = formData.specialization.split(',').map(s => s.trim()).filter(Boolean);
      
      const res = await managerApi.createTeacher({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialization: specs,
        experienceYears: Number(formData.experienceYears),
        status: formData.status === 'ACTIVE' ? 'active' : 'inactive'
      });
      
      if (res.success) {
        alert('Thêm giáo viên thành công!');
        navigate('/manager/teachers');
      } else {
        setGlobalError(res.message || 'Thêm giáo viên thất bại');
      }
    } catch (err) {
      setGlobalError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thêm Giáo viên Mới</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate('/manager/teachers')}>
          Quay lại
        </Button>
      </div>

      <Card className="p-6">
        {globalError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{globalError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Tên giáo viên" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
          <Input label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Chuyên môn (cách nhau bởi dấu phẩy)</label>
            <input 
              type="text"
              name="specialization"
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.specialization} 
              onChange={handleChange}
              placeholder="Toán, Lý, Hóa..."
            />
          </div>

          <Input 
            label="Số năm kinh nghiệm" 
            name="experienceYears" 
            type="number" 
            value={formData.experienceYears} 
            onChange={handleChange} 
            error={errors.experienceYears} 
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Trạng thái</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-70"
            >
              {loading ? 'Đang xử lý...' : 'Lưu giáo viên'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ManagerCreateTeacherPage;