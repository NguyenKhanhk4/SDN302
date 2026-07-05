import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';

const AdminCreateClassPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    subject: 'Toan Nang Cao',
    teacher: 'Nguyen Van Teacher',
    room: 'Phong B201',
    maxStudents: '15',
    startDate: '',
    endDate: '',
    status: 'UPCOMING'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [subjectList, setSubjectList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSubjects, resUsers] = await Promise.all([
          adminApi.getSubjects(),
          adminApi.getUsers({ role: 'TEACHER' })
        ]);

        if (resSubjects.success && resSubjects.data) {
          setSubjectList(resSubjects.data);
          if (resSubjects.data.length > 0) {
            setFormData(prev => ({ ...prev, subject: resSubjects.data[0].name }));
          }
        }

        if (resUsers.success && resUsers.data) {
          setTeacherList(resUsers.data);
          if (resUsers.data.length > 0) {
            setFormData(prev => ({ ...prev, teacher: resUsers.data[0].fullName }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch data for create class form', err);
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

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên lớp học là bắt buộc';
    if (!formData.subject.trim()) newErrors.subject = 'Môn học là bắt buộc';
    if (!formData.teacher.trim()) newErrors.teacher = 'Giáo viên là bắt buộc';
    
    const maxSt = parseInt(formData.maxStudents);
    if (!formData.maxStudents) {
      newErrors.maxStudents = 'Số lượng học viên tối đa là bắt buộc';
    } else if (isNaN(maxSt) || maxSt <= 0) {
      newErrors.maxStudents = 'Số lượng học viên tối đa phải lớn hơn 0';
    }

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
      const response = await adminApi.createClass(formData);
      if (response.success) {
        toast.success('Tạo lớp học thành công!');
        setTimeout(() => {
          navigate('/admin/classes');
        }, 1500);
      } else {
        toast.error(response.message || 'Tạo lớp học thất bại');
      }
    } catch (err) {
      toast.error(err.message || 'Đã xảy ra lỗi khi tạo lớp học');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo Lớp học</h1>
          <p className="text-sm text-gray-500 mt-1">Tạo một lớp học mới và phân công giáo viên.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/classes')}>
          Quay lại Danh sách
        </Button>
      </div>

      {/* Form Card */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên lớp học"
            name="name"
            placeholder="Ví dụ: Lop Toan 10A"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="subject" className="mb-1 text-sm font-medium text-gray-700">Môn học</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm bg-white"
              >
                {subjectList.length === 0 && <option value="">Đang tải môn học...</option>}
                {subjectList.map((sub) => (
                  <option key={sub._id} value={sub.name}>{sub.name}</option>
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
                {teacherList.length === 0 && <option value="">Đang tải giáo viên...</option>}
                {teacherList.map((teach) => (
                  <option key={teach._id} value={teach.fullName}>{teach.fullName}</option>
                ))}
              </select>
            </div>
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

            <Input
              label="Số học viên tối đa"
              name="maxStudents"
              type="number"
              placeholder="Ví dụ: 15"
              value={formData.maxStudents}
              onChange={handleChange}
              error={errors.maxStudents}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              error={errors.startDate}
            />

            <Input
              label="Ngày kết thúc"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              error={errors.endDate}
            />
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
              <option value="UPCOMING">Sắp diễn ra</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="FINISHED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="px-6"
            >
              Tạo Lớp học
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminCreateClassPage;
