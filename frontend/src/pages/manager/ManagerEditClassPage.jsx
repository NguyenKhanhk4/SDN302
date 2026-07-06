import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ManagerEditClassPage = () => {
  const navigate = useNavigate();
  const { classId } = useParams();

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, tRes, classRes] = await Promise.all([
          managerApi.getSubjects({ status: 'active' }),
          managerApi.getTeachers({ status: 'active' }),
          managerApi.getClassDetail(classId)
        ]);
        
        if (subRes.success) setSubjects(subRes.data.subjects || subRes.data || []);
        if (tRes.success) {
          const list = (tRes.data.teachers || tRes.data || []).map(t => ({
            ...t,
            fullName: t.userId?.name || '',
          }));
          setTeachers(list);
        }

        if (classRes.success) {
          const cls = classRes.data.class || classRes.data;
          setFormData({
            name: cls.name || '',
            subjectId: cls.subjectId?._id || cls.subjectId || '',
            teacherId: cls.teacherId?._id || cls.teacherId || '',
            maxStudents: cls.maxStudents || 20,
            startDate: cls.startDate ? cls.startDate.substring(0, 10) : '',
            endDate: cls.endDate ? cls.endDate.substring(0, 10) : '',
            status: cls.status || 'UPCOMING'
          });
        } else {
          setGlobalError('Không tìm thấy lớp học');
        }
      } catch (err) {
        setGlobalError('Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId]);

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
    
    setSaving(true);
    setGlobalError('');
    try {
      const res = await managerApi.updateClass(classId, {
        ...formData,
        maxStudents: Number(formData.maxStudents)
      });
      if (res.success) {
        alert('Cập nhật lớp học thành công!');
        navigate('/manager/classes');
      } else {
        setGlobalError(res.message || 'Cập nhật lớp học thất bại');
      }
    } catch (err) {
      setGlobalError('Đã xảy ra lỗi hệ thống');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sửa Lớp Học</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate('/manager/classes')}>
          Quay lại
        </Button>
      </div>

      <Card className="p-6">
        {globalError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{globalError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Tên lớp học" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Môn học</label>
              <select name="subjectId" value={formData.subjectId} onChange={handleChange} className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer ${errors.subjectId ? 'border-red-500' : 'border-slate-300'}`}>
                <option value="">-- Chọn môn học --</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              {errors.subjectId && <p className="text-red-500 text-xs">{errors.subjectId}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Giáo viên</label>
              <select name="teacherId" value={formData.teacherId} onChange={handleChange} className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer ${errors.teacherId ? 'border-red-500' : 'border-slate-300'}`}>
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
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="UPCOMING">Sắp khai giảng</option>
              <option value="ACTIVE">Đang học</option>
              <option value="FINISHED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors shadow-sm shadow-amber-500/20 disabled:opacity-70"
            >
              {saving ? 'Đang lưu...' : 'Cập nhật lớp học'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ManagerEditClassPage;