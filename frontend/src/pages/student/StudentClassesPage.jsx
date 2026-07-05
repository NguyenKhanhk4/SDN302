import { useState, useEffect } from 'react';
import { studentApi } from '../../api/studentApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { 
  BookOpen, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  AlertCircle
} from 'lucide-react';

const StudentClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getClasses();
      if (res.success) {
        setClasses(res.data || []);
      } else {
        throw new Error(res.message || 'Không thể tải danh sách lớp học');
      }
    } catch (err) {
      setError(err.message || err.error || 'Đã có lỗi xảy ra khi tải danh sách lớp học.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClasses();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getDayOfWeekVi = (day) => {
    const days = {
      'Monday': 'Thứ Hai',
      'Tuesday': 'Thứ Ba',
      'Wednesday': 'Thứ Tư',
      'Thursday': 'Thứ Năm',
      'Friday': 'Thứ Sáu',
      'Saturday': 'Thứ Bảy',
      'Sunday': 'Chủ Nhật'
    };
    return days[day] || day;
  };

  const getClassStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Chờ khai giảng</span>;
      case 'ongoing':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Đang học</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Hoàn thành</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Đã hủy</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loading text="Đang tải danh sách lớp học..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 max-w-xl mx-auto mt-10">
        <p className="font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> Lỗi tải dữ liệu
        </p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={fetchClasses}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lớp học của tôi</h1>
        <p className="text-sm text-gray-500 mt-1">Danh sách tất cả các lớp học bạn đang tham gia, giảng viên phụ trách, môn học và lịch học chi tiết.</p>
      </div>

      {classes.length === 0 ? (
        <Card className="py-12 text-center max-w-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-gray-50 rounded-full text-gray-400">
              <BookOpen className="h-10 w-10 stroke-1" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Bạn chưa tham gia lớp học nào</h3>
            <p className="text-sm text-gray-500 max-w-sm">Liên hệ với Quản trị viên hoặc Trung tâm nếu bạn đã đăng ký nhưng chưa thấy lớp hiển thị ở đây.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {classes.map((cls) => (
            <Card key={cls._id} className="hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between border-t-4 border-blue-500">
              <div className="space-y-5">
                {/* Header Section */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                      {cls.subject?.gradeLevel ? `Khối ${cls.subject.gradeLevel}` : 'Môn học'}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-2">{cls.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{cls.subject?.name}</p>
                  </div>
                  {getClassStatusBadge(cls.status)}
                </div>

                {/* Subject Description if available */}
                {cls.subject?.description && (
                  <p className="text-xs text-gray-500 bg-slate-50 p-2.5 rounded-lg italic">
                    {cls.subject.description}
                  </p>
                )}

                {/* Class Details */}
                <div className="grid grid-cols-2 gap-4 pt-2 text-sm text-gray-600">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 block font-semibold uppercase">Phòng học</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400" /> {cls.room || 'Chưa xếp'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 block font-semibold uppercase">Thời gian khóa học</span>
                    <span className="font-medium text-gray-800 text-xs">
                      {formatDate(cls.startDate)} - {formatDate(cls.endDate)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 block font-semibold uppercase">Tổng số buổi</span>
                    <span className="font-semibold text-gray-800">
                      {cls.totalSessions} buổi
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 block font-semibold uppercase">Học viên tối đa</span>
                    <span className="font-semibold text-gray-800">
                      {cls.maxStudents} học sinh
                    </span>
                  </div>
                </div>

                {/* Teacher Info */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Giảng viên phụ trách</h4>
                  {cls.teacher ? (
                    <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-gray-100">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                        {cls.teacher.avatar ? (
                          <img src={cls.teacher.avatar} alt={cls.teacher.name} className="w-full h-full object-cover" />
                        ) : (
                          cls.teacher.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {/* Info */}
                      <div className="text-xs space-y-1 min-w-0 flex-1">
                        <p className="font-bold text-gray-800 truncate">{cls.teacher.name}</p>
                        {cls.teacher.specialization?.length > 0 && (
                          <p className="text-gray-500 font-medium truncate">Chuyên môn: {cls.teacher.specialization.join(', ')}</p>
                        )}
                        <div className="flex flex-col sm:flex-row gap-x-3 gap-y-0.5 text-gray-400 font-medium pt-1">
                          {cls.teacher.email && (
                            <span className="flex items-center gap-1 truncate"><Mail className="h-3 w-3" /> {cls.teacher.email}</span>
                          )}
                          {cls.teacher.phone && (
                            <span className="flex items-center gap-1 whitespace-nowrap"><Phone className="h-3 w-3" /> {cls.teacher.phone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-center gap-1.5 font-medium">
                      <User className="h-4 w-4" /> Lớp học đang được cập nhật giảng viên phụ trách.
                    </p>
                  )}
                </div>

                {/* Schedule Info */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Lịch học hàng tuần</h4>
                  {cls.schedules && cls.schedules.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {cls.schedules.map((sched) => (
                        <div key={sched._id} className="px-3 py-2 bg-blue-50/50 hover:bg-blue-50 text-blue-800 rounded-lg text-xs font-medium border border-blue-100 flex items-center gap-2 transition-all">
                          <Calendar className="h-3.5 w-3.5 text-blue-600" />
                          <span>{getDayOfWeekVi(sched.dayOfWeek)}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          <span>{sched.startTime} - {sched.endTime}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Chưa xếp lịch học cố định.</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentClassesPage;
