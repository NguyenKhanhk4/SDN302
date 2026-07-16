import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ManagerEditSchedulePage = () => {
  const navigate = useNavigate();
  const { scheduleId } = useParams();

  const [formData, setFormData] = useState({
    classId: '',
    teacherId: '',
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: '',
    room: '',
    status: 'ACTIVE'
  });
  
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, tRes, sRes] = await Promise.all([
          managerApi.getClasses({ status: 'active' }),
          managerApi.getTeachers({ status: 'active' }),
          managerApi.getScheduleDetail(scheduleId)
        ]);
        
        if (cRes.success) {
          const list = (cRes.data.classes || cRes.data || []);
          setClasses(list);
        }
        if (tRes.success) {
          const list = (tRes.data.teachers || tRes.data || []).map(t => ({
            ...t,
            fullName: t.userId?.name || '',
          }));
          setTeachers(list);
        }

        if (sRes.success) {
          const sch = sRes.data.schedule || sRes.data;
          setFormData({
            classId: sch.classId?._id || sch.classId || '',
            teacherId: sch.teacherId?._id || sch.teacherId || '',
            dayOfWeek: sch.dayOfWeek 
              ? sch.dayOfWeek.charAt(0).toUpperCase() + sch.dayOfWeek.slice(1).toLowerCase() 
              : 'Monday',
            startTime: sch.startTime || '',
            endTime: sch.endTime || '',
            room: sch.room || '',
            status: sch.status ? sch.status.toUpperCase() : 'ACTIVE'
          });
        } else {
          setGlobalError('Không tìm thấy lịch học');
        }
      } catch (err) {
        setGlobalError('Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [scheduleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!formData.startTime) {
      newErrors.startTime = 'Giờ bắt đầu là bắt buộc';
    } else if (!timeRegex.test(formData.startTime)) {
      newErrors.startTime = 'Sai định dạng (HH:MM), VD: 08:30';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Giờ kết thúc là bắt buộc';
    } else if (!timeRegex.test(formData.endTime)) {
      newErrors.endTime = 'Sai định dạng (HH:MM), VD: 14:00';
    }
    if (!formData.classId) newErrors.classId = 'Lớp học là bắt buộc';
    if (!formData.teacherId) newErrors.teacherId = 'Giáo viên là bắt buộc';
    if (!formData.startTime) newErrors.startTime = 'Giờ bắt đầu là bắt buộc';
    if (!formData.endTime) newErrors.endTime = 'Giờ kết thúc là bắt buộc';
    if (!formData.room.trim()) newErrors.room = 'Phòng học là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSaving(true);
    setGlobalError('');
    try {
      const res = await managerApi.updateSchedule(scheduleId, formData);
      if (res.success) {
        alert('Cập nhật lịch học thành công!');
        navigate('/manager/schedules');
      } else {
        setGlobalError(res.message || 'Cập nhật lịch học thất bại');
      }
    } catch (err) {
      setGlobalError('Đã xảy ra lỗi hệ thống');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sửa Lịch Học</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate('/manager/schedules')}>
          Quay lại
        </Button>
      </div>

      <Card className="p-6">
        {globalError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{globalError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Lớp học</label>
            <select name="classId" value={formData.classId} onChange={handleChange} className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer ${errors.classId ? 'border-red-500' : 'border-slate-300'}`}>
              <option value="">-- Chọn lớp học --</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {errors.classId && <p className="text-red-500 text-xs">{errors.classId}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Giáo viên</label>
            <select name="teacherId" value={formData.teacherId} onChange={handleChange} className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer ${errors.teacherId ? 'border-red-500' : 'border-slate-300'}`}>
              <option value="">-- Chọn giáo viên --</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName}</option>)}
            </select>
            {errors.teacherId && <p className="text-red-500 text-xs">{errors.teacherId}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Thứ trong tuần</label>
            <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="1">Thứ Hai</option>
              <option value="2">Thứ Ba</option>
              <option value="3">Thứ Tư</option>
              <option value="4">Thứ Năm</option>
              <option value="5">Thứ Sáu</option>
              <option value="6">Thứ Bảy</option>
              <option value="0">Chủ Nhật</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Giờ bắt đầu" name="startTime" type="time" placeholder="" value={formData.startTime} onChange={handleChange} error={errors.startTime} />
            <Input label="Giờ kết thúc" name="endTime" type="time" placeholder="" value={formData.endTime} onChange={handleChange} error={errors.endTime} />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Trạng thái</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="ACTIVE">Hoạt động</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors shadow-sm shadow-amber-500/20 disabled:opacity-70"
            >
              {saving ? 'Đang lưu...' : 'Cập nhật lịch học'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ManagerEditSchedulePage;