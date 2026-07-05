import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const AdminClassDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getClassDetail(classId);
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

    fetchClassDetail();
  }, [classId]);

  if (loading) {
    return <Loading text="Đang tải chi tiết lớp học..." />;
  }

  if (error || !classroom) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
          {error || 'Không tìm thấy lớp học'}
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/classes')}>
          Quay lại Danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết Lớp học</h1>
          <p className="text-sm text-gray-500 mt-1">Xem chi tiết cấu hình và trạng thái của lớp học.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/classes')}>
          Quay lại Danh sách
        </Button>
      </div>

      {/* Detail Card */}
      <Card>
        <div className="space-y-6">
          {/* Header block with Class Name */}
          <div className="border-b border-gray-100 pb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{classroom.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Môn học: <span className="font-semibold text-gray-700">{classroom.subject}</span></p>
            </div>
            <Badge status={classroom.status} />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Giáo viên</span>
              <span className="text-sm font-semibold text-gray-800 mt-1 block">{classroom.teacher}</span>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Phòng học</span>
              <span className="text-sm text-gray-800 mt-1 block">{classroom.room}</span>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Sĩ số</span>
              <span className="text-sm font-semibold text-gray-800 mt-1 block">
                {classroom.currentStudents} / {classroom.maxStudents} (Tối đa)
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Thời gian học</span>
              <span className="text-sm text-gray-800 mt-1 block">
                {classroom.startDate} &mdash; {classroom.endDate}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="border-t border-gray-100 pt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/classes/${classroom._id}/students`)}
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              Xem danh sách học viên
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminClassDetailPage;
