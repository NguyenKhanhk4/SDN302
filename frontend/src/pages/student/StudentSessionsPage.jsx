import { useState, useEffect } from 'react';
import { studentApi } from '../../api/studentApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  AlertCircle,
  Search, 
  Filter, 
  Info,
  Percent,
  TrendingUp
} from 'lucide-react';

const StudentSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedAttendance, setSelectedAttendance] = useState('ALL');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getSessions();
      if (res.success) {
        setSessions(res.data || []);
      } else {
        throw new Error(res.message || 'Không thể tải danh sách buổi học');
      }
    } catch (err) {
      setError(err.message || err.error || 'Đã có lỗi xảy ra khi tải danh sách buổi học.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions();
  }, []);

  // Get unique classes for dropdown filter
  const getUniqueClasses = () => {
    const classes = new Set();
    sessions.forEach(sess => {
      if (sess.class?.name) {
        classes.add(sess.class.name);
      }
    });
    return Array.from(classes);
  };

  // Format date to local string
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

  // Get Vietnamese day name
  const getDayOfWeekVi = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      return days[d.getDay()];
    } catch {
      return '';
    }
  };

  // Status badges
  const getSessionStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Sắp diễn ra
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Hoàn thành
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100">
            {status}
          </span>
        );
    }
  };

  // Attendance badges
  const getAttendanceBadge = (att) => {
    if (!att) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
          Chưa điểm danh
        </span>
      );
    }
    switch (att.status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3" /> Có mặt
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="h-3 w-3" /> Đi muộn
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="h-3 w-3" /> Vắng mặt
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
            {att.status}
          </span>
        );
    }
  };

  // Calculate statistics
  const getStats = () => {
    const total = sessions.length;
    const completed = sessions.filter(s => s.status === 'COMPLETED').length;
    const scheduled = sessions.filter(s => s.status === 'SCHEDULED').length;
    
    // Attendance stats
    let present = 0;
    let late = 0;
    let absent = 0;
    let totalAttendanceTaken = 0;

    sessions.forEach(s => {
      if (s.attendance) {
        totalAttendanceTaken++;
        if (s.attendance.status === 'PRESENT') present++;
        else if (s.attendance.status === 'LATE') late++;
        else if (s.attendance.status === 'ABSENT') absent++;
      }
    });

    const attendanceRate = totalAttendanceTaken > 0 
      ? Math.round(((present + late) / totalAttendanceTaken) * 100) 
      : 100;

    return { total, completed, scheduled, present, late, absent, attendanceRate, totalAttendanceTaken };
  };

  const stats = getStats();

  // Filtered sessions
  const filteredSessions = sessions.filter(sess => {
    const matchesSearch = sess.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sess.class?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'ALL' || sess.class?.name === selectedClass;
    const matchesStatus = selectedStatus === 'ALL' || sess.status === selectedStatus;
    
    let matchesAttendance = true;
    if (selectedAttendance !== 'ALL') {
      if (selectedAttendance === 'UNMARKED') {
        matchesAttendance = !sess.attendance;
      } else {
        matchesAttendance = sess.attendance?.status === selectedAttendance;
      }
    }

    return matchesSearch && matchesClass && matchesStatus && matchesAttendance;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loading text="Đang tải danh sách buổi học..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 max-w-xl mx-auto mt-10">
        <p className="font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5" strokeWidth={2} /> Lỗi tải dữ liệu
        </p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={fetchSessions}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý buổi học</h1>
        <p className="text-sm text-gray-500 mt-1">Xem chi tiết các buổi học, nội dung bài học và kết quả điểm danh của em.</p>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-4 border-l-4 border-l-blue-500 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 block font-semibold uppercase">Tổng số buổi học</span>
            <span className="text-2xl font-bold text-gray-800">{stats.total}</span>
            <span className="text-[10px] text-gray-500 block">Số buổi có trong khóa</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
            <BookOpen className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 block font-semibold uppercase">Số buổi đã học</span>
            <span className="text-2xl font-bold text-gray-800">{stats.completed}</span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> Đang tích lũy kiến thức
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-violet-500 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 block font-semibold uppercase">Tỷ lệ đi học</span>
            <span className="text-2xl font-bold text-gray-800">{stats.attendanceRate}%</span>
            <span className="text-[10px] text-gray-500 block">Tính trên số buổi điểm danh</span>
          </div>
          <div className="p-3 bg-violet-50 rounded-xl text-violet-500">
            <Percent className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs text-gray-400 block font-semibold uppercase">Điểm danh chi tiết</span>
            <div className="flex gap-3 text-[11px] font-semibold text-gray-700">
              <span className="text-green-600">Có mặt: {stats.present}</span>
              <span className="text-amber-600">Muộn: {stats.late}</span>
              <span className="text-red-600">Vắng: {stats.absent}</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter controls */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
          <Filter className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Bộ lọc và Tìm kiếm</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Tìm theo chủ đề bài học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/50"
            />
          </div>

          {/* Class filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/50"
            >
              <option value="ALL">Tất cả lớp học</option>
              {getUniqueClasses().map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/50"
            >
              <option value="ALL">Tất cả trạng thái buổi học</option>
              <option value="SCHEDULED">Sắp diễn ra</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          {/* Attendance filter */}
          <div>
            <select
              value={selectedAttendance}
              onChange={(e) => setSelectedAttendance(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/50"
            >
              <option value="ALL">Tất cả kết quả điểm danh</option>
              <option value="PRESENT">Có mặt</option>
              <option value="LATE">Đi muộn</option>
              <option value="ABSENT">Vắng mặt</option>
              <option value="UNMARKED">Chưa điểm danh</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main List / Table Section */}
      <Card className="overflow-hidden">
        {filteredSessions.length === 0 ? (
          <div className="py-16 text-center text-gray-400 space-y-3">
            <Info className="h-10 w-10 stroke-1 mx-auto text-gray-300" />
            <p className="text-sm font-medium">Không tìm thấy buổi học nào thỏa mãn bộ lọc.</p>
            <p className="text-xs text-gray-400">Hãy thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc.</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-5 w-12 text-center">STT</th>
                    <th className="py-3.5 px-4 w-48">Lớp học</th>
                    <th className="py-3.5 px-4 w-36">Thời gian</th>
                    <th className="py-3.5 px-4 w-28">Phòng học</th>
                    <th className="py-3.5 px-4">Nội dung bài học</th>
                    <th className="py-3.5 px-4 w-36 text-center">Buổi học</th>
                    <th className="py-3.5 px-4 w-36 text-center">Điểm danh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {filteredSessions.map((sess, idx) => (
                    <tr key={sess._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5 text-center text-gray-400 font-semibold">{idx + 1}</td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-900 block">{sess.class?.name}</span>
                        <span className="text-[11px] text-blue-600 font-semibold uppercase">{sess.class?.subject}</span>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-blue-500 shrink-0" /> {formatDate(sess.sessionDate)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                          <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" /> {sess.schedule?.startTime} - {sess.schedule?.endTime} ({getDayOfWeekVi(sess.sessionDate)})
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" /> {sess.class?.room || 'Chưa xếp'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {sess.topic ? (
                          <div className="space-y-1">
                            <span className="font-semibold text-gray-800 block leading-snug">{sess.topic}</span>
                            {sess.attendance?.note && (
                              <span className="text-[11px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded italic">
                                Ghi chú điểm danh: {sess.attendance.note}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Chưa có nội dung cập nhật</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">{getSessionStatusBadge(sess.status)}</td>
                      <td className="py-4 px-4 text-center">{getAttendanceBadge(sess.attendance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredSessions.map((sess, idx) => (
                <div key={sess._id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 font-bold"># {idx + 1}</span>
                      <h4 className="font-bold text-gray-900 text-base">{sess.class?.name}</h4>
                      <span className="text-[10px] text-blue-600 font-semibold uppercase">{sess.class?.subject}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {getSessionStatusBadge(sess.status)}
                      {getAttendanceBadge(sess.attendance)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-slate-50 p-2.5 rounded-xl border border-gray-100/50">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-gray-400 uppercase font-bold block">Thời gian</span>
                      <span className="font-bold text-gray-800 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-blue-500 shrink-0" /> {formatDate(sess.sessionDate)}
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 block">
                        {sess.schedule?.startTime} - {sess.schedule?.endTime} ({getDayOfWeekVi(sess.sessionDate)})
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-gray-400 uppercase font-bold block">Phòng học</span>
                      <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" /> {sess.class?.room || 'Chưa xếp'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-400 uppercase font-bold block">Nội dung bài học</span>
                    <p className="text-xs text-gray-800 leading-relaxed font-semibold bg-white p-2.5 rounded border border-gray-100">
                      {sess.topic || <span className="text-gray-400 italic font-normal">Chưa cập nhật</span>}
                    </p>
                    {sess.attendance?.note && (
                      <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-100 italic leading-relaxed">
                        Ghi chú: {sess.attendance.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentSessionsPage;
