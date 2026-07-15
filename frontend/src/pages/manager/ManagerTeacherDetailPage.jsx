import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Mail, Phone, Calendar, BookOpen, GraduationCap, MapPin, ArrowLeft, Edit } from 'lucide-react';

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return <Badge status="ACTIVE" />;
    case 'inactive':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">Nghỉ việc</span>;
    default:
      return <Badge status={status} />;
  }
};

const ManagerTeacherDetailPage = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeacherDetail();
  }, [teacherId]);

  const fetchTeacherDetail = async () => {
    try {
      setLoading(true);
      const response = await managerApi.getTeacherDetail(teacherId);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Không tìm thấy giáo viên');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải thông tin giáo viên');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Đang tải hồ sơ giáo viên..." />;

  if (error || !data || !data.teacher) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
          {error || 'Không tìm thấy giáo viên'}
        </div>
        <Button variant="outline" onClick={() => navigate('/manager/teachers')}>
          Quay lại Danh sách
        </Button>
      </div>
    );
  }

  const { teacher, classes, schedules } = data;
  const user = teacher.userId || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/manager/teachers')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết Giáo viên</h1>
            <p className="text-sm text-gray-500 mt-1">Xem hồ sơ và lịch giảng dạy</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="primary" onClick={() => navigate(`/manager/teachers/edit/${teacherId}`)}>
            <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa Hồ sơ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Profile */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 flex flex-col items-center justify-center border-b border-gray-100">
              <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600 font-bold text-4xl border-2 border-indigo-100 mb-4">
                {user.name ? user.name.charAt(0).toUpperCase() : 'T'}
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center">{user.name}</h2>
              <p className="text-sm text-gray-500 text-center mb-3">{user.email}</p>
              <div className="flex gap-2">
                {getStatusBadge(teacher.status)}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{user.phone || 'Chưa cập nhật SĐT'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Info & Classes */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-indigo-500 pl-3">Hồ sơ Chuyên môn</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Số năm kinh nghiệm</p>
                <p className="text-base text-gray-900 font-semibold">{teacher.experienceYears || 0} năm</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Mã định danh (ID)</p>
                <p className="text-sm text-gray-900 font-mono">{teacher._id}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500 mb-1">Chuyên môn</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {teacher.specialization && teacher.specialization.length > 0 ? (
                    teacher.specialization.map((spec, index) => (
                      <span key={index} className="px-3 py-1 bg-white border border-gray-200 text-indigo-700 rounded-md text-sm font-medium shadow-sm">
                        {spec}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Chưa cập nhật</span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-emerald-500 pl-3">Các lớp đang giảng dạy</h3>
            {classes && classes.length > 0 ? (
              <div className="space-y-3">
                {classes.map((cls, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-indigo-200 transition-colors bg-white">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        {cls.name?.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{cls.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                          <span>Môn: {cls.subjectId?.name || 'N/A'}</span>
                          <span>•</span>
                          <span>Sĩ số: {cls.currentStudents || 0}/{cls.maxStudents}</span>
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/manager/classes/${cls._id}`)}
                    >
                      Xem lớp
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-sm">Giáo viên này hiện chưa được phân công lớp nào.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerTeacherDetailPage;
