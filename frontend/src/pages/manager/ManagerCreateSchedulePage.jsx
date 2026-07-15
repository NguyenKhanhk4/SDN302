import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { ArrowLeft, CalendarPlus } from 'lucide-react';

const ManagerCreateSchedulePage = () => {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, tRes] = await Promise.all([
          managerApi.getClasses({ status: 'active' }),
          managerApi.getTeachers({ status: 'active' })
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
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.classId) newErrors.classId = 'Lớp học là bắt buộc';
    if (!formData.teacherId) newErrors.teacherId = 'Giáo viên là bắt buộc';
    
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
      setGlobalError(err.message || 'Đã xảy ra lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/manager/schedules')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm Lịch học mới</h1>
          <p className="text-sm text-gray-500 mt-1">Lên lịch trình cho lớp học</p>
        </div>
      </div>

      <Card>
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lớp học</label>
              <select 
                name="classId" 
                value={formData.classId} 
                onChange={handleChange} 
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${errors.classId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">-- Chọn lớp học --</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giáo viên</label>
              <select 
                name="teacherId" 
                value={formData.teacherId} 
                onChange={handleChange} 
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${errors.teacherId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">-- Chọn giáo viên --</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName}</option>)}
              </select>
              {errors.teacherId && <p className="text-red-500 text-xs mt-1">{errors.teacherId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thứ trong tuần</label>
              <select 
                name="dayOfWeek" 
                value={formData.dayOfWeek} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="Monday">Thứ Hai</option>
                <option value="Tuesday">Thứ Ba</option>
                <option value="Wednesday">Thứ Tư</option>
                <option value="Thursday">Thứ Năm</option>
                <option value="Friday">Thứ Sáu</option>
                <option value="Saturday">Thứ Bảy</option>
                <option value="Sunday">Chủ Nhật</option>
              </select>
            </div>

            <Input 
              label="Phòng học" 
              name="room" 
              value={formData.room} 
              onChange={handleChange} 
              error={errors.room} 
              placeholder="VD: P.101"
            />

            <Input 
              label="Giờ bắt đầu (HH:MM)" 
              name="startTime" 
              type="text" 
              placeholder="VD: 08:30" 
              value={formData.startTime} 
              onChange={handleChange} 
              error={errors.startTime} 
            />

            <Input 
              label="Giờ kết thúc (HH:MM)" 
              name="endTime" 
              type="text" 
              placeholder="VD: 10:00" 
              value={formData.endTime} 
              onChange={handleChange} 
              error={errors.endTime} 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => navigate('/manager/schedules')} disabled={loading}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="min-w-[140px]">
              {loading ? <Loading size="sm" /> : <><CalendarPlus className="w-4 h-4 mr-2" /> Tạo Lịch học</>}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ManagerCreateSchedulePage;
