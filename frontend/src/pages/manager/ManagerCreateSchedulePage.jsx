import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

  const [formData, setFormData] = useState({
    classId: '',
    teacherId: '',
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: '',
    room: '',
    status: 'ACTIVE'
  });
    status: 'ACTIVE'
  });
  
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, tRes] = await Promise.all([
          managerApi.getClasses({ status: 'active' }),
          managerApi.getTeachers({ status: 'active' })
        ]);
        // Chức năng của Manager: đọc data từ backend
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
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.classId) newErrors.classId = 'Lớp học là bắt buộc';
    if (!formData.teacherId) newErrors.teacherId = 'Giáo viên là bắt buộc';
    if (!formData.startTime) newErrors.startTime = 'Giờ bắt đầu là bắt buộc';
    if (!formData.endTime) newErrors.endTime = 'Giờ kết thúc là bắt buộc';
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
    if (!formData.teacherId) newErrors.teacherId = 'Giáo viên là bắt buộc';
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!formData.startTime) {
      newErrors.startTime = 'Giờ bắt đầu là bắt buộc';
    try {
      const res = await managerApi.createSchedule(formData);
      newErrors.endTime = 'Giờ kết thúc là bắt buộc';
    } else if (!timeRegex.test(formData.endTime)) {
      newErrors.endTime = 'Sai định dạng (HH:MM), VD: 14:00';
    }
    if (!formData.room.trim()) newErrors.room = 'Phòng học là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setGlobalError('');
    try {
      const res = await managerApi.createSchedule(formData);
      if (res.success) {
        navigate('/manager/schedules');
      } else {
        setGlobalError(res.message || 'Tạo lịch học thất bại');
      }
    } catch (err) {
      setGlobalError('Đã xảy ra lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
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
              <option value="">-- Chọn lớp học --</option>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Thứ trong tuần</label>
            <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="Monday">Thứ Hai</option>
              <option value="Tuesday">Thứ Ba</option>
              <option value="Wednesday">Thứ Tư</option>
              <option value="Thursday">Thứ Năm</option>
              <option value="Friday">Thứ Sáu</option>
              <option value="Saturday">Thứ Bảy</option>
              <option value="Sunday">Chủ Nhật</option>
            </select>
          </div>
            {errors.teacherId && <p className="text-red-500 text-xs">{errors.teacherId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Giờ bắt đầu (24h)" name="startTime" type="text" placeholder="08:30" value={formData.startTime} onChange={handleChange} error={errors.startTime} />
            <Input label="Giờ kết thúc (24h)" name="endTime" type="text" placeholder="10:00" value={formData.endTime} onChange={handleChange} error={errors.endTime} />
          </div>
              <option value="Tuesday">Thứ Ba</option>
              <option value="Wednesday">Thứ Tư</option>
              <option value="Thursday">Thứ Năm</option>
              <option value="Friday">Thứ Sáu</option>
              <option value="Saturday">Thứ Bảy</option>
              <option value="Sunday">Chủ Nhật</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Giờ bắt đầu (24h)" name="startTime" type="text" placeholder="08:30" value={formData.startTime} onChange={handleChange} error={errors.startTime} />
            <Input label="Giờ kết thúc (24h)" name="endTime" type="text" placeholder="10:00" value={formData.endTime} onChange={handleChange} error={errors.endTime} />
          </div>

          <Input label="Phòng học" name="room" value={formData.room} onChange={handleChange} error={errors.room} />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Trạng thái</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ACTIVE">Hoạt động</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" loading={loading}>
              Lưu lịch học
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ManagerCreateSchedulePage;
