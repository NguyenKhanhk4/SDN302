import { useState, useEffect } from 'react';
import { studentApi } from '../../api/studentApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Info,
  CalendarDays
} from 'lucide-react';

const StudentSchedulesPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab state: 'today', 'week', 'month', 'upcoming'
  const [activeTab, setActiveTab] = useState('week');
  
  // Date states for navigations
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonthDate, setSelectedMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetching all sessions to filter locally
      const res = await studentApi.getSessions();
      if (res.success) {
        setSessions(res.data || []);
      } else {
        throw new Error(res.message || 'Không thể tải lịch học');
      }
    } catch (err) {
      setError(err.message || err.error || 'Đã có lỗi xảy ra khi tải lịch học.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions();
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

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // ────────────────────────────────────────────────────────
  // TODAY SCHEDULE LOGIC
  // ────────────────────────────────────────────────────────
  const getTodaySessions = () => {
    const today = new Date();
    return sessions.filter(sess => isSameDay(new Date(sess.sessionDate), today));
  };

  // ────────────────────────────────────────────────────────
  // WEEK SCHEDULE LOGIC
  // ────────────────────────────────────────────────────────
  const getWeekDays = (date) => {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday-start
    const monday = new Date(current.setDate(diff));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const weekDays = getWeekDays(currentDate);
  const startOfWeekStr = formatDate(weekDays[0]);
  const endOfWeekStr = formatDate(weekDays[6]);

  const getSessionsForDate = (date) => {
    return sessions.filter(sess => isSameDay(new Date(sess.sessionDate), date));
  };

  // ────────────────────────────────────────────────────────
  // MONTH SCHEDULE LOGIC
  // ────────────────────────────────────────────────────────
  const getMonthDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startDayOfWeek = firstDay.getDay();
    if (startDayOfWeek === 0) startDayOfWeek = 7; // Mon = 1, Sun = 7
    
    const days = [];
    
    // Padding from prev month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i > 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i + 1);
      days.push({ date: d, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }
    
    // Padding for next month to complete the 42 cells grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedMonthDate);
    newDate.setMonth(selectedMonthDate.getMonth() + direction);
    setSelectedMonthDate(newDate);
  };

  const monthDays = getMonthDays(selectedMonthDate);
  const currentMonthLabel = selectedMonthDate.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric'
  });

  // ────────────────────────────────────────────────────────
  // UPCOMING SCHEDULE LOGIC
  // ────────────────────────────────────────────────────────
  const getUpcomingSessions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions.filter(sess => {
      const sessDate = new Date(sess.sessionDate);
      return sessDate >= today && sess.status === 'SCHEDULED';
    });
  };

  const getSessionStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-100 text-blue-800">Sắp diễn ra</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-green-100 text-green-800">Hoàn thành</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-red-100 text-red-800">Đã hủy</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getDayOfWeekVi = (dayIndex) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[dayIndex];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loading text="Đang tải lịch học..." />
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
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch học</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi thời khóa biểu hàng ngày, hàng tuần hoặc hàng tháng.</p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'today' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Theo tuần
          </button>
          <button
            onClick={() => setActiveTab('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Theo tháng
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upcoming' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sắp diễn ra
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 1: TODAY VIEW */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'today' && (
        <Card>
          <div className="border-b border-gray-100 pb-4 mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-blue-500 h-5 w-5" /> Lịch học hôm nay ({formatDate(new Date())})
            </h2>
            <span className="text-xs text-gray-500 font-medium">Hôm nay: {getDayOfWeekVi(new Date().getDay())}</span>
          </div>

          {getTodaySessions().length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <Info className="h-8 w-8 stroke-1 mx-auto text-gray-300" />
              <p className="text-sm font-medium">Hôm nay em không có lịch học nào.</p>
              <p className="text-xs text-gray-400">Hãy chọn tab "Theo tuần" hoặc "Sắp diễn ra" để xem lịch các ngày khác.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getTodaySessions().map((sess) => (
                <div key={sess._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-gray-100 rounded-xl hover:shadow-sm transition-all border-l-4 border-l-blue-500">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {sess.class?.subject || 'Môn học'}
                      </span>
                      {getSessionStatusBadge(sess.status)}
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{sess.class?.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><User className="h-3.5 w-3.5" /> Giảng viên: {sess.class?.teacherName}</p>
                    {sess.topic && <p className="text-xs text-gray-600 italic bg-white p-2 rounded border border-gray-50">Chủ đề: {sess.topic}</p>}
                  </div>
                  <div className="flex sm:flex-col items-start sm:items-end gap-x-4 gap-y-1 shrink-0 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5 font-bold text-gray-800 sm:text-sm">
                      <Clock className="h-4 w-4 text-blue-500" /> {sess.schedule?.startTime} - {sess.schedule?.endTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400" /> Phòng {sess.class?.room || 'Chưa xếp'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 2: WEEK VIEW */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'week' && (
        <div className="space-y-4">
          {/* Week Selector Header */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <span className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" /> Tuần: {startOfWeekStr} - {endOfWeekStr}
            </span>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day, idx) => {
              const daySessions = getSessionsForDate(day);
              const isToday = isSameDay(day, new Date());
              return (
                <Card key={idx} className={`p-4 flex flex-col justify-between min-h-[300px] hover:shadow-md transition-shadow ${isToday ? 'border-2 border-blue-500 shadow-sm' : ''}`}>
                  <div>
                    {/* Day Title */}
                    <div className="border-b border-gray-100 pb-2 mb-3 flex justify-between items-center">
                      <span className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                        {getDayOfWeekVi(day.getDay())}
                      </span>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600'
                      }`}>
                        {day.getDate()}
                      </span>
                    </div>

                    {/* Day Sessions List */}
                    <div className="space-y-3">
                      {daySessions.length === 0 ? (
                        <p className="text-[10px] text-gray-400 italic text-center py-6">Không có lịch học</p>
                      ) : (
                        daySessions.map((sess) => (
                          <div key={sess._id} className="p-2.5 bg-slate-50 border border-gray-100 rounded-lg space-y-1.5 hover:bg-slate-100/80 transition-colors">
                            <h4 className="font-bold text-gray-800 text-[11px] leading-tight line-clamp-2" title={sess.class?.name}>
                              {sess.class?.name}
                            </h4>
                            <div className="text-[9px] text-gray-500 space-y-0.5">
                              <p className="flex items-center gap-1 font-bold text-gray-700">
                                <Clock className="h-3 w-3 text-blue-500 shrink-0" /> {sess.schedule?.startTime} - {sess.schedule?.endTime}
                              </p>
                              <p className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-gray-400 shrink-0" /> P. {sess.class?.room || 'Chưa xếp'}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-1 pt-0.5">
                              <span className="text-[8px] font-semibold text-blue-700 truncate" title={sess.class?.subject}>
                                {sess.class?.subject}
                              </span>
                              {getSessionStatusBadge(sess.status)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 3: MONTH VIEW */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Month Calendar Grid */}
          <div className="lg:col-span-2 space-y-4">
            {/* Month selector */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <span className="font-bold text-gray-800 capitalize text-sm md:text-base">
                {currentMonthLabel}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Calendar grid */}
            <Card className="p-4">
              {/* Mon-Sun Calendar Header */}
              <div className="grid grid-cols-7 gap-1 text-center border-b border-gray-100 pb-2 mb-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((h, i) => (
                  <span key={i} className="text-xs font-bold text-gray-400 uppercase py-1">{h}</span>
                ))}
              </div>

              {/* Grid cells */}
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((cell, idx) => {
                  const cellSessions = getSessionsForDate(cell.date);
                  const isCellToday = isSameDay(cell.date, new Date());
                  const isCellSelected = isSameDay(cell.date, selectedDate);
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(cell.date)}
                      className={`min-h-[56px] p-1 flex flex-col justify-between items-center rounded-lg border transition-all text-center relative focus:outline-none ${
                        cell.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 text-gray-300'
                      } ${
                        isCellSelected ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm z-10' : 'border-gray-100'
                      } ${
                        isCellToday && !isCellSelected ? 'bg-blue-50/40 text-blue-600 font-bold border-blue-200' : ''
                      }`}
                    >
                      {/* Date number */}
                      <span className={`text-xs ${isCellToday ? 'font-bold' : ''}`}>{cell.date.getDate()}</span>
                      
                      {/* Indicators for sessions */}
                      {cellSessions.length > 0 && (
                        <div className="flex gap-0.5 justify-center w-full pb-1">
                          {cellSessions.slice(0, 3).map((sess) => (
                            <span 
                              key={sess._id} 
                              className={`w-1.5 h-1.5 rounded-full ${
                                sess.status === 'CANCELLED' ? 'bg-red-400' : 
                                sess.status === 'COMPLETED' ? 'bg-green-400' : 'bg-blue-500'
                              }`} 
                            />
                          ))}
                          {cellSessions.length > 3 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Selected Date Session Details Sidebar */}
          <div>
            <Card className="h-full flex flex-col">
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Chi tiết lịch học</h3>
                <p className="text-xs text-gray-400 mt-1 font-semibold">
                  Ngày {formatDate(selectedDate)} ({getDayOfWeekVi(selectedDate.getDay())})
                </p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] pr-1">
                {getSessionsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-12 text-gray-400 space-y-2">
                    <Info className="h-6 w-6 stroke-1 mx-auto text-gray-300" />
                    <p className="text-xs">Không có lịch học trong ngày này.</p>
                  </div>
                ) : (
                  getSessionsForDate(selectedDate).map((sess) => (
                    <div key={sess._id} className="p-3 bg-slate-50 border border-gray-100 rounded-xl space-y-2 hover:bg-slate-100 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded truncate" title={sess.class?.subject}>
                          {sess.class?.subject}
                        </span>
                        {getSessionStatusBadge(sess.status)}
                      </div>
                      <h4 className="font-bold text-gray-800 text-xs leading-snug">
                        {sess.class?.name}
                      </h4>
                      <div className="text-[10px] text-gray-500 space-y-1">
                        <p className="flex items-center gap-1 font-bold text-gray-700">
                          <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" /> {sess.schedule?.startTime} - {sess.schedule?.endTime}
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" /> Phòng {sess.class?.room || 'Chưa xếp'}
                        </p>
                        <p className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-gray-400 shrink-0" /> GV: {sess.class?.teacherName}
                        </p>
                      </div>
                      {sess.topic && (
                        <p className="text-[10px] text-gray-600 bg-white p-2 rounded border border-gray-100 italic leading-relaxed">
                          Chủ đề: {sess.topic}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 4: UPCOMING SESSIONS VIEW */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'upcoming' && (
        <Card>
          <div className="border-b border-gray-100 pb-4 mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-blue-500 h-5 w-5" /> Các buổi học sắp diễn ra
            </h2>
            <span className="text-xs text-gray-500 font-medium">Tổng số: {getUpcomingSessions().length} buổi</span>
          </div>

          {getUpcomingSessions().length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <Info className="h-8 w-8 stroke-1 mx-auto text-gray-300" />
              <p className="text-sm font-medium">Không có buổi học sắp diễn ra nào.</p>
              <p className="text-xs text-gray-400">Nếu bạn đã kết thúc toàn bộ khóa học, hoặc chưa có lịch phân công mới, vui lòng liên hệ trung tâm.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {getUpcomingSessions().map((sess) => (
                <div key={sess._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 border border-gray-100 rounded-xl hover:shadow-sm transition-all border-l-4 border-l-blue-500">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {sess.class?.subject || 'Môn học'}
                      </span>
                      {getSessionStatusBadge(sess.status)}
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{sess.class?.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><User className="h-3.5 w-3.5" /> Giảng viên: {sess.class?.teacherName}</p>
                    {sess.topic && <p className="text-xs text-gray-600 italic bg-white p-2 rounded border border-gray-50">Chủ đề: {sess.topic}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 md:flex md:flex-col items-start md:items-end gap-x-4 gap-y-1 shrink-0 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5 font-bold text-blue-600 md:text-sm">
                      <Calendar className="h-4 w-4" /> {formatDate(sess.sessionDate)}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-gray-800 md:text-sm">
                      <Clock className="h-4 w-4" /> {sess.schedule?.startTime} - {sess.schedule?.endTime}
                    </span>
                    <span className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="h-4 w-4 text-gray-400" /> Phòng {sess.class?.room || 'Chưa xếp'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default StudentSchedulesPage;
