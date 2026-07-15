import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { ArrowLeft, UserPlus } from 'lucide-react';

const ManagerCreateStudentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    grade: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await managerApi.createStudent(formData);
      if (response.success) {
        navigate('/manager/students');
      } else {
        setError(response.message || 'Lỗi khi tạo học viên');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/manager/students')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm Học viên mới</h1>
          <p className="text-sm text-gray-500 mt-1">Điền thông tin để tạo hồ sơ học viên</p>
        </div>
      </div>

      <Card>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Họ và tên"
              name="fullName"
              placeholder="Nhập họ và tên đầy đủ"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="Nhập địa chỉ email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Khối lớp"
              name="grade"
              placeholder="Ví dụ: 10, 11, 12"
              value={formData.grade}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => navigate('/manager/students')} disabled={loading}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="min-w-[140px]">
              {loading ? <Loading size="sm" /> : <><UserPlus className="w-4 h-4 mr-2" /> Tạo Học viên</>}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ManagerCreateStudentPage;
