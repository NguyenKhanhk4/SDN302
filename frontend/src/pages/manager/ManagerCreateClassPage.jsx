import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ManagerCreateClassPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    subjectId: '',
    teacherId: '',
    maxStudents: 20,
    startDate: '',
    endDate: '',
    status: 'UPCOMING'
  });
  
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, tRes] = await Promise.all([
          managerApi.getSubjects({ status: 'active' }),
          managerApi.getTeachers({ status: 'active' })
        ]);
        // Chức năng của Manager: đọc data.subjects và data.teachers từ backend
        if (subRes.success) setSubjects(subRes.data.subjects || subRes.data || []);
        if (tRes.success) {
          const list = (tRes.data.teachers || tRes.data || []).map(t => ({
            ...t,
            fullName: t.userId?.name || '',
          }));
          setTeachers(list);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên lớp học là bắt buộc';
    if (!formData.subjectId) newErrors.subjectId = 'Môn học là bắt buộc';
    if (!formData.teacherId) newErrors.teacherId = 'Giáo viên là bắt buộc';
    if (Number(formData.maxStudents) <= 0) newErrors.maxStudents = 'Sĩ số tối đa phải lớn hơn 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setGlobalError('');
    try {
      const res = await managerApi.createClass({
        ...formData,
        maxStudents: Number(formData.maxStudents)
      });
      if (res.success) {
        navigate('/manager/classes');
      } else {
        setGlobalError(res.message || 'Tạo lớp học thất bại');
      }
    } catch (err) {
      setGlobalError('Đã xảy ra lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tạo Lớp Học Mới</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate('/manager/classes')}>
          Quay lại
        </Button>
      </div>

      <Card className="p-6">
        {globalError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{globalError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Tên lớp học" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Môn học</label>
              <select name="subjectId" value={formData.subjectId} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.subjectId ? 'border-red-500' : 'border-slate-300'}`}>
                <option value="">-- Chọn môn học --</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              {errors.subjectId && <p className="text-red-500 text-xs">{errors.subjectId}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Giáo viên</label>
              <select name="teacherId" value={formData.teacherId} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.teacherId ? 'border-red-500' : 'border-slate-300'}`}>
                <option value="">-- Chọn giáo viên --</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName}</option>)}
              </select>
              {errors.teacherId && <p className="text-red-500 text-xs">{errors.teacherId}</p>}
            </div>

            <Input label="Phòng học" name="room" value={formData.room} onChange={handleChange} />
            <Input label="Sĩ số tối đa" name="maxStudents" type="number" value={formData.maxStudents} onChange={handleChange} error={errors.maxStudents} />
            
            <Input label="Ngày bắt đầu" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
            <Input label="Ngày kết thúc" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Trạng thái</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="UPCOMING">Sắp khai giảng</option>
              <option value="ACTIVE">Đang học</option>
              <option value="FINISHED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" loading={loading}>
              Lưu lớp học
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ManagerCreateClassPage;
