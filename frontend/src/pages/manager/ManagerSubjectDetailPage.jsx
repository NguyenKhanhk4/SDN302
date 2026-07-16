import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import { ArrowLeft, Edit, BookOpen } from 'lucide-react';

const ManagerSubjectDetailPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjectDetail();
  }, [subjectId]);

  const fetchSubjectDetail = async () => {
    try {
      setLoading(true);
      const res = await managerApi.getSubjectDetail(subjectId);
      if (res.success) {
        setSubject(res.data);
      } else {
        setError('Không tìm thấy môn học');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Đang tải dữ liệu môn học..." />;

  if (error || !subject) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        <Button onClick={() => navigate('/manager/subjects')}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/manager/subjects')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết Môn học</h1>
          </div>
        </div>
        <Button variant="primary" onClick={() => navigate(`/manager/subjects/edit/${subjectId}`)}>
          <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
        </Button>
      </div>

      <Card>
        <div className="flex items-start gap-4 p-4 border-b border-gray-100">
          <div className="w-16 h-16 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BookOpen size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{subject.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge status={subject.status === 'active' ? 'ACTIVE' : 'INACTIVE'} />
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm font-medium text-gray-600">Khối {subject.gradeLevel}</span>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Mã môn học (ID)</p>
            <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded inline-block">{subject._id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Học phí</p>
            <p className="text-base text-gray-900 font-bold">{subject.defaultTuitionFee?.toLocaleString('vi-VN')} đ / tháng</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500 mb-1">Mô tả chi tiết</p>
            <div className="p-4 bg-gray-50 rounded-lg text-gray-700 text-sm whitespace-pre-wrap">
              {subject.description || 'Chưa có mô tả'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ManagerSubjectDetailPage;
