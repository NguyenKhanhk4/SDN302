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
    subject: '',
    teacher: '',
    maxStudents: '',
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
        }

        if (resUsers.success && resUsers.data) {
          setTeacherList(resUsers.data);
        }
      } catch (err) {
        console.error('Failed to fetch data for create class form', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Clear error immediately when typing
      if (errors[name]) {
        setErrors(errs => ({ ...errs, [name]: '' }));
      }
      
      // If changing start date and there's an end date error, clear it so onBlur can re-evaluate
      if (name === 'startDate' && errors.endDate) {
         setErrors(errs => ({ ...errs, endDate: '' }));
      }
      
      return newData;
    });
  };

  const validateField = (name, value, currentFormData = formData) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Tên lớp học là bắt buộc';
        else if (value.trim().length > 100) error = 'Tên không quá 100 ký tự';
        break;
      case 'subject':
        if (!value) error = 'Vui lòng chọn môn học';
        break;
      case 'teacher':
        if (!value) error = 'Vui lòng chọn giáo viên';
        break;
      case 'maxStudents':
        const maxSt = parseInt(value, 10);
        if (!value) error = 'Số lượng học viên tối đa là bắt buộc';
        else if (isNaN(maxSt) || maxSt <= 0 || maxSt > 200) error = 'Sĩ số phải từ 1 đến 200';
        break;
      case 'startDate':
        if (!value) error = 'Ngày bắt đầu là bắt buộc';
        break;
      case 'endDate':
        if (!value) error = 'Ngày kết thúc là bắt buộc';
        else if (currentFormData.startDate && new Date(value) < new Date(currentFormData.startDate)) {
          error = 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu';
        }
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

  const validate = () => {
    const newErrors = {
      name: validateField('name', formData.name),
      subject: validateField('subject', formData.subject),
      teacher: validateField('teacher', formData.teacher),
      maxStudents: validateField('maxStudents', formData.maxStudents),
      startDate: validateField('startDate', formData.startDate),
      endDate: validateField('endDate', formData.endDate),
    };
    
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại các thông tin không hợp lệ');
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
            label={<span>Tên lớp học <span className="text-red-500">*</span></span>}
            name="name"
            placeholder="Ví dụ: Lop Toan 10A"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="subject" className="mb-1 text-sm font-medium text-gray-700">Môn học <span className="text-red-500">*</span></label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm bg-white transition-colors ${errors.subject ? 'border-red-500 focus:border-red-500' : 'border-gray-200'}`}
              >
                <option value="">-- Chọn môn học --</option>
                {subjectList.map((sub) => (
                  <option key={sub._id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
              {errors.subject && <span className="mt-1 text-xs text-red-500">{errors.subject}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="teacher" className="mb-1 text-sm font-medium text-gray-700">Giáo viên <span className="text-red-500">*</span></label>
              <select
                id="teacher"
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm bg-white transition-colors ${errors.teacher ? 'border-red-500 focus:border-red-500' : 'border-gray-200'}`}
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
            <Input
              label={<span>Số học viên tối đa <span className="text-red-500">*</span></span>}
              name="maxStudents"
              type="number"
              placeholder="Ví dụ: 15"
              value={formData.maxStudents}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.maxStudents}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={<span>Ngày bắt đầu <span className="text-red-500">*</span></span>}
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.startDate}
            />

            <Input
              label={<span>Ngày kết thúc <span className="text-red-500">*</span></span>}
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              onBlur={handleBlur}
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
