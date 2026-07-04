import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const AdminCreateSchedulePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    class: 'Lop Toan 10A',
    teacher: 'Nguyen Van Teacher',
    dayOfWeek: '1', // Monday
    startTime: '',
    endTime: '',
    room: 'Phong B201',
    status: 'ACTIVE'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [globalError, setGlobalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.class.trim()) newErrors.class = 'Tên lớp học là bắt buộc';
    if (!formData.teacher.trim()) newErrors.teacher = 'Tên giáo viên là bắt buộc';
    if (!formData.startTime.trim()) newErrors.startTime = 'Giờ bắt đầu là bắt buộc';
    if (!formData.endTime.trim()) newErrors.endTime = 'Giờ kết thúc là bắt buộc';
    if (!formData.room.trim()) newErrors.room = 'Phòng học là bắt buộc';

    // Simple time validation (startTime < endTime)
    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGlobalError('');
    setSuccessMsg('');

    try {
      const response = await adminApi.createSchedule(formData);
      if (response.success) {
        setSuccessMsg('Tạo lịch học thành công! Đang chuyển hướng...');
        setTimeout(() => {
          navigate('/admin/schedules');
        }, 1500);
      } else {
        setGlobalError(response.message || 'Tạo lịch học thất bại');
      }
    } catch (err) {
      setGlobalError(err.message || 'Đã xảy ra lỗi khi tạo lịch học');
    } finally {
      setLoading(false);
    }
  };

  // Mock choices
  const classes = ['Lop Toan 10A', 'Lop Ly 9B', 'Lop Anh 101', 'Lop Toan Demo Huy'];
  const teachers = ['Nguyen Van Teacher', 'Nguyen Thi Manager'];
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="class" className="mb-1 text-sm font-medium text-gray-700">Lớp học</label>
              <select
                id="class"
                name="class"
                value={formData.class}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm bg-white"
              >
                {classes.map((cls, idx) => (
                  <option key={idx} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="teacher" className="mb-1 text-sm font-medium text-gray-700">Giáo viên</label>
              <select
                id="teacher"
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm bg-white"
              >
                {teachers.map((teach, idx) => (
                  <option key={idx} value={teach}>{teach}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <Input
              label="Giờ bắt đầu"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
              error={errors.startTime}
            />

            <Input
              label="Giờ kết thúc"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
              error={errors.endTime}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phòng học"
              name="room"
              placeholder="Ví dụ: Phong B201"
              value={formData.room}
              onChange={handleChange}
              error={errors.room}
            />

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
                <option value="CANCELLED">Đã hủy</option>
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
              Tạo Lịch học
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminCreateSchedulePage;
