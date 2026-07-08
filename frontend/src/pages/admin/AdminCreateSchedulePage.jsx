import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';

const TIME_SLOTS = [
  { start: '07:30', end: '09:30', label: 'Ca 1 (07:30 - 09:30)' },
  { start: '09:30', end: '11:30', label: 'Ca 2 (09:30 - 11:30)' },
  { start: '13:30', end: '15:30', label: 'Ca 3 (13:30 - 15:30)' },
  { start: '15:30', end: '17:30', label: 'Ca 4 (15:30 - 17:30)' },
  { start: '18:00', end: '20:00', label: 'Ca 5 (18:00 - 20:00)' },
  { start: '20:00', end: '22:00', label: 'Ca 6 (20:00 - 22:00)' },
];

const AdminCreateSchedulePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    class: '',
    teacher: '',
    dayOfWeek: '1',
    startTime: '',
    endTime: '',
    room: '',
    status: 'ACTIVE'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [classList, setClassList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSchedules, resClasses, resUsers] = await Promise.all([
          adminApi.getSchedules(),
          adminApi.getClasses(),
          adminApi.getUsers({ role: 'TEACHER' })
        ]);

        if (resSchedules.success) {
          setExistingSchedules(resSchedules.data);
        }
        
        if (resClasses.success && resClasses.data) {
          setClassList(resClasses.data);
        }

        if (resUsers.success && resUsers.data) {
          setTeacherList(resUsers.data);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'class':
        if (!value) error = 'Vui lòng chọn lớp học';
        break;
      case 'teacher':
        if (!value) error = 'Vui lòng chọn giáo viên';
        break;
      case 'room':
        if (!value) error = 'Vui lòng chọn phòng học';
        break;
      case 'startTime':
      case 'endTime':
        if (!formData.startTime || !formData.endTime) error = 'Vui lòng chọn khung giờ';
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
  };

  const isSlotTaken = (start, end) => {
    if (!formData.room) return false;
    return existingSchedules.some(sch => {
      // Ignore cancelled schedules
      if (sch.status === 'CANCELLED' || sch.status === 'cancelled') return false;
      return sch.dayOfWeek === formData.dayOfWeek && 
             sch.room?.toLowerCase() === formData.room.trim().toLowerCase() &&
             sch.startTime === start && 
             sch.endTime === end;
    });
  };

  const handleSlotSelect = (start, end) => {
    if (isSlotTaken(start, end)) return;
    setFormData(prev => ({ ...prev, startTime: start, endTime: end }));
    setErrors(prev => ({ ...prev, startTime: '', endTime: '' }));
  };

  const validate = () => {
    const newErrors = {
      class: validateField('class', formData.class),
      teacher: validateField('teacher', formData.teacher),
      room: validateField('room', formData.room),
    };
    
    if (!formData.startTime || !formData.endTime) {
      newErrors.startTime = 'Vui lòng chọn khung giờ';
    }

    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);

    try {
      const response = await adminApi.createSchedule(formData);
      if (response.success) {
        toast.success('Tạo lịch học thành công!');
        setTimeout(() => {
          navigate('/admin/schedules');
        }, 1500);
      } else {
        toast.error(response.message || 'Tạo lịch học thất bại');
      }
    } catch (err) {
      toast.error(err.message || 'Đã xảy ra lỗi khi tạo lịch học');
    } finally {
      setLoading(false);
    }
  };

  const days = [
    { value: '1', label: 'Thứ Hai' },
    { value: '2', label: 'Thứ Ba' },
    { value: '3', label: 'Thứ Tư' },
    { value: '4', label: 'Thứ Năm' },
    { value: '5', label: 'Thứ Sáu' },
    { value: '6', label: 'Thứ Bảy' },
    { value: '0', label: 'Chủ Nhật' }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo Lịch học</h1>
          <p className="text-sm text-gray-500 mt-1">Tạo lịch học mới cho lớp học.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/schedules')}>
          Quay lại Danh sách
        </Button>
      </div>

      {/* Form Card */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="class" className="mb-1 text-sm font-medium text-gray-700">Lớp học <span className="text-red-500">*</span></label>
              <select
                id="class"
                name="class"
                value={formData.class}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white transition-colors ${errors.class ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary'}`}
              >
                <option value="">-- Chọn lớp học --</option>
                {classList.map((cls) => (
                  <option key={cls._id} value={cls.name}>{cls.name}</option>
                ))}
              </select>
              {errors.class && <span className="mt-1 text-xs text-red-500">{errors.class}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="teacher" className="mb-1 text-sm font-medium text-gray-700">Giáo viên <span className="text-red-500">*</span></label>
              <select
                id="teacher"
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white transition-colors ${errors.teacher ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary'}`}
              >
                <option value="">-- Chọn giáo viên --</option>
                {teacherList.map((teach) => (
                  <option key={teach._id} value={teach.fullName}>{teach.fullName}</option>
                ))}
              </select>
              {errors.teacher && <span className="mt-1 text-xs text-red-500">{errors.teacher}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="dayOfWeek" className="mb-1 text-sm font-medium text-gray-700">Thứ trong tuần</label>
              <select
                id="dayOfWeek"
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm bg-white"
              >
                {days.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="room" className="mb-1 text-sm font-medium text-gray-700">Phòng học <span className="text-red-500">*</span></label>
              <select
                id="room"
                name="room"
                value={formData.room}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white transition-colors ${errors.room ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary'}`}
              >
                <option value="">-- Chọn phòng học --</option>
                <option value="Phong A101">Phòng A101</option>
                <option value="Phong A102">Phòng A102</option>
                <option value="Phong B201">Phòng B201</option>
                <option value="Phong B202">Phòng B202</option>
                <option value="Phong C301">Phòng C301</option>
              </select>
              {errors.room && <span className="mt-1 text-xs text-red-500">{errors.room}</span>}
            </div>
          </div>

          {/* Time Slots Grid */}
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700">Khung giờ</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TIME_SLOTS.map((slot) => {
                const taken = isSlotTaken(slot.start, slot.end);
                const selected = formData.startTime === slot.start && formData.endTime === slot.end;
                return (
                  <button
                    key={slot.label}
                    type="button"
                    disabled={taken}
                    onClick={() => handleSlotSelect(slot.start, slot.end)}
                    className={`p-3 text-sm font-medium rounded-xl border transition-all ${
                      taken 
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                        : selected
                        ? 'bg-primary/10 text-primary border-primary ring-2 ring-primary/20'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{slot.label}</span>
                      {taken && <span className="text-xs mt-1 text-red-500/80 font-semibold bg-red-50 px-2 py-0.5 rounded-full">Đã có lớp</span>}
                    </div>
                  </button>
                )
              })}
            </div>
            {errors.startTime && (
              <p className="mt-2 text-sm text-red-500">{errors.startTime}</p>
            )}
          </div>

          <div className="flex flex-col w-1/2">
            <label htmlFor="status" className="mb-1 text-sm font-medium text-gray-700">Trạng thái</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm bg-white"
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end border-t border-gray-100">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="px-8"
            >
              Tạo Lịch học
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminCreateSchedulePage;
