import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { ArrowLeft, Save } from 'lucide-react';

const ManagerEditStudentPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    grade: '',
    schoolName: '',
    parentPhone: '',
    status: 'active',
  });

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const res = await managerApi.getStudentDetail(studentId);
      if (res.success && res.data && res.data.student) {
        const s = res.data.student;
        setFormData({
          fullName: s.userId?.name || '',
          grade: s.grade || '',
          schoolName: s.school || '',
          parentPhone: s.parentPhone || '',
          status: s.status || 'active',
        });
      } else {
        setError('Không tìm thấy học viên');
      }
    } catch (err) {
      setError(err.message || 'Lỗi tải thông tin học viên');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const res = await managerApi.updateStudent(studentId, formData);
      if (res.success) {
        setSuccess('Cập nhật học viên thành công');
        setTimeout(() => navigate(`/manager/students/${studentId}`), 1000);
      } else {
        setError(res.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi hệ thống');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="Đang tải dữ liệu học viên..." />;

  if (error && !formData.fullName) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        <Button onClick={() => navigate('/manager/students')}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(`/manager/students/${studentId}`)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa Học viên</h1>
          <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin chi tiết của học viên</p>
        </div>
      </div>

      <Card>
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Họ và tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <Input
              label="Khối lớp"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
            />
            <Input
              label="Trường học"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
            />
            <Input
              label="SĐT Phụ huynh"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleChange}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="active">Đang học</option>
                <option value="inactive">Đã dừng học</option>
                <option value="reserved">Bảo lưu</option>
                <option value="finished">Đã học xong</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => navigate(`/manager/students/${studentId}`)} disabled={saving}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? <Loading size="sm" /> : <><Save className="w-4 h-4 mr-2" /> Lưu Thay Đổi</>}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ManagerEditStudentPage;
