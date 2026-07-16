import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { ArrowLeft, BookPlus } from 'lucide-react';

const ManagerCreateSubjectPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    gradeLevel: '',
    description: '',
    defaultTuitionFee: '',
    status: 'active',
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
      const dataToSubmit = {
        ...formData,
        defaultTuitionFee: Number(formData.defaultTuitionFee)
      };
      const response = await managerApi.createSubject(dataToSubmit);
      if (response.success) {
        navigate('/manager/subjects');
      } else {
        setError(response.message || 'Lỗi khi tạo môn học');
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
          onClick={() => navigate('/manager/subjects')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm Môn học mới</h1>
          <p className="text-sm text-gray-500 mt-1">Điền thông tin để tạo môn học mới</p>
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
              label="Tên môn học"
              name="name"
              placeholder="VD: Toán học, Ngữ văn..."
              value={formData.name}
              onChange={handleChange}
              required
            />
            <div className="flex flex-col">
              <label htmlFor="gradeLevel" className="mb-1 text-sm font-medium text-gray-700">Khối lớp <span className="text-red-500">*</span></label>
              <select
                id="gradeLevel"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-50/50 border-gray-200 text-gray-700"
              >
                <option value="" disabled>-- Chọn khối lớp --</option>
                <option value="Tất cả khối lớp">Tất cả khối lớp</option>
                <option value="Khối 10">Khối 10</option>
                <option value="Khối 11">Khối 11</option>
                <option value="Khối 12">Khối 12</option>
                <option value="Luyện thi Đại học">Luyện thi Đại học</option>
                <option value="IELTS">IELTS</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Input
                label="Học phí (VNĐ/tháng)"
                name="defaultTuitionFee"
                type="number"
                placeholder="Nhập số tiền..."
                value={formData.defaultTuitionFee}
                onChange={handleChange}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
              <textarea
                name="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Nhập mô tả về môn học..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => navigate('/manager/subjects')} disabled={loading}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="min-w-[140px]">
              {loading ? <Loading size="sm" /> : <><BookPlus className="w-4 h-4 mr-2" /> Tạo Môn học</>}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ManagerCreateSubjectPage;
