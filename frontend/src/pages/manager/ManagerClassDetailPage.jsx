import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { ArrowLeft, Users, Calendar, MapPin, Edit } from 'lucide-react';

const ManagerClassDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClassDetail();
  }, [classId]);

  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      const response = await managerApi.getClassDetail(classId);
      if (response.success) {
        setClassroom(response.data);
      } else {
        setError(response.message || 'Không tìm thấy lớp học');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải thông tin lớp học');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Đang tải chi tiết lớp học..." />;

  if (error || !classroom) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
          {error || 'Không tìm thấy lớp học'}
        </div>
        <Button variant="outline" onClick={() => navigate('/manager/classes')}>
          Quay lại Danh sách
        </Button>
      </div>
    );
  }

  const subject = classroom.subjectId || {};
  const teacher = classroom.teacherId?.userId || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/manager/classes')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết Lớp học</h1>
            <p className="text-sm text-gray-500 mt-1">Thông tin cấu hình lớp và giáo viên</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => navigate(`/manager/classes/edit/${classId}`)}>
          <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
        </Button>
      </div>

      <Card>
        <div className="space-y-6">
          <div className="border-b border-gray-100 pb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{classroom.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Môn học: <span className="font-semibold text-gray-700">{subject.name || 'N/A'}</span></p>
            </div>
            <Badge status={classroom.status === 'active' ? 'ACTIVE' : classroom.status === 'upcoming' ? 'UPCOMING' : 'INACTIVE'} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Giáo viên phụ trách</span>
                <span className="text-sm font-semibold text-gray-800 mt-1 block">{teacher.name || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Phòng học</span>
                <span className="text-sm text-gray-800 mt-1 block font-medium">{classroom.room || 'Chưa xếp phòng'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Sĩ số (Hiện tại / Tối đa)</span>
                <span className="text-sm font-bold text-gray-800 mt-1 block">
                  {classroom.currentStudents} / {classroom.maxStudents || '?'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Thời gian đào tạo</span>
                <span className="text-sm text-gray-800 mt-1 block font-medium">
                  {classroom.startDate ? new Date(classroom.startDate).toLocaleDateString('vi-VN') : '?'} 
                  {' '}→{' '} 
                  {classroom.endDate ? new Date(classroom.endDate).toLocaleDateString('vi-VN') : '?'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ManagerClassDetailPage;
