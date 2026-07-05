import { useState, useEffect } from 'react';
import { studentApi } from '../../api/studentApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { 
  User, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  DollarSign, 
  Megaphone, 
  Clock, 
  MapPin, 
  AlertCircle,
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react';

const StudentDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getDashboard();
      if (res.success) {
        setDashboardData(res.data);
      } else {
        throw new Error(res.message || 'Không thể tải dữ liệu');
      }
    } catch (err) {
      setError(err.message || err.error || 'Đã có lỗi xảy ra khi tải dữ liệu bảng điều khiển.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();

    const handleProfileUpdate = () => {
      fetchDashboardData();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loading text="Đang tải bảng điều khiển học sinh..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        <p className="font-medium">Lỗi tải dữ liệu</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const {
    profile = {},
    classCount = 0,
    upcomingSessions = [],
    attendanceStats = {},
    tuition = {},
    announcements = []
  } = dashboardData || {};

  const user = profile.user || {};
  const student = profile.student || {};
  const unpaidInvoices = tuition.unpaidInvoices || [];
  const remainingTuition = tuition.remainingAmount || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Xin chào, {user.fullName}!</h1>
        <p className="mt-2 text-blue-100 max-w-xl">
          Chào mừng em quay trở lại học tập. Hãy theo dõi thời khóa biểu và hoàn thành các nhiệm vụ học tập nhé!
        </p>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Enrolled Classes Card */}
        <Card className="hover:shadow-md transition-all border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Lớp đang tham gia</span>
              <span className="mt-2 text-4xl font-bold text-gray-900">{classCount} <span className="text-lg font-normal text-gray-500">lớp</span></span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
        </Card>

        {/* Attendance Rate Card */}
        <Card className="hover:shadow-md transition-all border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ chuyên cần</span>
              <span className="mt-2 text-4xl font-bold text-gray-900">
                {attendanceStats.rate}%
              </span>
              <span className="text-xs text-gray-400 mt-1">Đã học: {attendanceStats.total || 0} buổi</span>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <CheckSquare className="h-6 w-6" />
            </div>
          </div>
        </Card>

        {/* Tuition Due Card */}
        <Card className="hover:shadow-md transition-all border-l-4 border-amber-500">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Học phí còn nợ</span>
              <span className={`mt-2 text-2xl font-bold ${remainingTuition > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {formatCurrency(remainingTuition)}
              </span>
              <span className="text-xs text-gray-400 mt-1">Chưa thanh toán: {unpaidInvoices.length} hóa đơn</span>
            </div>
            <div className={`p-3 rounded-xl ${remainingTuition > 0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Profile & Announcements Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="border-b border-gray-100 pb-4 mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <User className="text-blue-600 h-5 w-5" /> Thông tin cá nhân
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">Học sinh</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-400 uppercase">Họ và Tên</span>
                <p className="font-medium text-gray-900 text-base">{user.fullName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-400 uppercase">Địa chỉ Email</span>
                <p className="font-medium text-gray-900 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400" /> {user.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-400 uppercase">Số điện thoại</span>
                <p className="font-medium text-gray-900 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400" /> {user.phone || 'Chưa cập nhật'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-400 uppercase">Giới tính / Ngày sinh</span>
                <p className="font-medium text-gray-900">
                  {user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : 'Khác'} ({formatDate(user.dateOfBirth)})
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-400 uppercase">Khối lớp / Trường học</span>
                <p className="font-medium text-gray-900 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-gray-400" /> Lớp {student.grade || 'N/A'} - {student.school || 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-400 uppercase">Địa chỉ thường trú</span>
                <p className="font-medium text-gray-900 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400" /> {user.address || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin Phụ huynh liên hệ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-gray-400">Họ tên phụ huynh</span>
                  <p className="font-medium text-gray-800">{student.parentName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Số điện thoại liên hệ</span>
                  <p className="font-medium text-gray-800 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400" /> {student.parentPhone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Announcements Card */}
        <div>
          <Card className="h-full flex flex-col">
            <div className="border-b border-gray-100 pb-4 mb-4 flex items-center gap-2">
              <Megaphone className="text-indigo-600 h-5 w-5" />
              <h2 className="text-xl font-bold text-gray-800">Thông báo mới nhất</h2>
            </div>
            
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] pr-2">
              {announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Megaphone className="h-8 w-8 stroke-1 mb-2" />
                  <p className="text-sm">Không có thông báo nào</p>
                </div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann._id} className="p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-gray-100">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-gray-900 text-sm leading-snug">{ann.title}</h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatDate(ann.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1.5 line-clamp-3 leading-relaxed">{ann.content}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Schedules & Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <Card>
          <div className="border-b border-gray-100 pb-4 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600 h-5 w-5" />
            <h2 className="text-xl font-bold text-gray-800">Buổi học sắp tới</h2>
          </div>

          <div className="space-y-4">
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Không có buổi học sắp tới nào được lên lịch.
              </div>
            ) : (
              upcomingSessions.map((session) => (
                <div key={session._id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-gray-100">
                  {/* Date Badge */}
                  <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-50 text-blue-600 rounded-xl font-bold shadow-sm shrink-0">
                    <span className="text-xs font-normal">T.</span>
                    <span className="text-lg leading-none">{new Date(session.sessionDate).getMonth() + 1}</span>
                  </div>
                  {/* Session Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 truncate text-sm">{session.classId?.name || 'Lớp học'}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDate(session.sessionDate)}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Phòng {session.classId?.room || 'Chưa xếp'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Detailed Attendance breakdown */}
        <Card>
          <div className="border-b border-gray-100 pb-4 mb-4 flex items-center gap-2">
            <CheckSquare className="text-green-600 h-5 w-5" />
            <h2 className="text-xl font-bold text-gray-800">Chi tiết điểm danh</h2>
          </div>

          <div className="flex flex-col justify-between h-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-center">
              <div className="bg-green-50/60 p-4 rounded-xl border border-green-100">
                <span className="block text-2xl font-black text-green-600">{attendanceStats.present || 0}</span>
                <span className="text-xs text-gray-500 font-semibold">Có mặt</span>
              </div>
              
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100">
                <span className="block text-2xl font-black text-amber-600">{attendanceStats.late || 0}</span>
                <span className="text-xs text-gray-500 font-semibold">Đi muộn</span>
              </div>

              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                <span className="block text-2xl font-black text-blue-600">{attendanceStats.excused || 0}</span>
                <span className="text-xs text-gray-500 font-semibold">Có phép</span>
              </div>

              <div className="bg-red-50/60 p-4 rounded-xl border border-red-100">
                <span className="block text-2xl font-black text-red-600">{attendanceStats.absent || 0}</span>
                <span className="text-xs text-gray-500 font-semibold">Vắng mặt</span>
              </div>
            </div>

            {/* Visual breakdown bar */}
            <div className="space-y-2 pt-4">
              <div className="text-xs font-semibold text-gray-500 flex justify-between">
                <span>Biểu đồ tỷ lệ</span>
                <span>{attendanceStats.rate}% thành tích tốt</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full flex overflow-hidden">
                {attendanceStats.total > 0 ? (
                  <>
                    <div 
                      className="bg-green-500 h-full transition-all" 
                      style={{ width: `${(attendanceStats.present / attendanceStats.total) * 100}%` }}
                      title={`Có mặt: ${attendanceStats.present}`}
                    />
                    <div 
                      className="bg-amber-400 h-full transition-all" 
                      style={{ width: `${(attendanceStats.late / attendanceStats.total) * 100}%` }}
                      title={`Đi muộn: ${attendanceStats.late}`}
                    />
                    <div 
                      className="bg-blue-400 h-full transition-all" 
                      style={{ width: `${(attendanceStats.excused / attendanceStats.total) * 100}%` }}
                      title={`Có phép: ${attendanceStats.excused}`}
                    />
                    <div 
                      className="bg-red-400 h-full transition-all" 
                      style={{ width: `${(attendanceStats.absent / attendanceStats.total) * 100}%` }}
                      title={`Vắng: ${attendanceStats.absent}`}
                    />
                  </>
                ) : (
                  <div className="bg-gray-300 w-full h-full rounded-full" />
                )}
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed text-right italic">
                * Tỷ lệ chuyên cần được tính dựa trên số buổi có mặt, đi muộn và nghỉ có phép chia cho tổng số buổi.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tuition Unpaid Invoices */}
      {unpaidInvoices.length > 0 && (
        <Card className="border border-red-100 bg-red-50/10">
          <div className="border-b border-red-100 pb-4 mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Hóa đơn học phí chưa hoàn thành
            </h2>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 animate-pulse">
              Cần thanh toán
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-semibold uppercase text-xs">
                  <th className="py-3 px-2">Lớp học</th>
                  <th className="py-3 px-2">Tháng</th>
                  <th className="py-3 px-2">Số tiền</th>
                  <th className="py-3 px-2">Đã đóng</th>
                  <th className="py-3 px-2">Hạn nộp</th>
                  <th className="py-3 px-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {unpaidInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-red-50/20 transition-colors">
                    <td className="py-3.5 px-2 font-bold text-gray-800">{inv.classId?.name || 'N/A'}</td>
                    <td className="py-3.5 px-2 font-medium text-gray-600">{inv.month}</td>
                    <td className="py-3.5 px-2 font-bold text-gray-900">{formatCurrency(inv.amount)}</td>
                    <td className="py-3.5 px-2 text-green-600 font-medium">{formatCurrency(inv.paidAmount)}</td>
                    <td className="py-3.5 px-2 text-gray-500 font-medium">{formatDate(inv.dueDate)}</td>
                    <td className="py-3.5 px-2">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        inv.status === 'OVERDUE' 
                          ? 'bg-red-100 text-red-800' 
                          : inv.status === 'PARTIAL' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {inv.status === 'OVERDUE' ? 'Quá hạn' : inv.status === 'PARTIAL' ? 'Đóng một phần' : 'Chưa đóng'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentDashboardPage;
