import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { Calendar as CalendarIcon, Clock, MapPin, CalendarDays, BookOpen } from 'lucide-react';

import SLOT_CONFIG from '../../utils/slotConfig';
import { getCurrentYear, getWeekOptions, getWeekDates, getCurrentWeekNumber } from '../../utils/weekUtils';

const TeacherSchedulesPage = () => {
  const navigate = useNavigate();

  const currentYear = getCurrentYear();
  const currentWeek = getCurrentWeekNumber();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const weekOptions = getWeekOptions(selectedYear);
  const weekDates = getWeekDates(selectedYear, selectedWeek);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherApi.getSchedules();
      
      let scheduleList = [];
      if (Array.isArray(data)) scheduleList = data;
      else if (data && Array.isArray(data.schedules)) scheduleList = data.schedules;
      else if (data && Array.isArray(data.data)) scheduleList = data.data;
      
      const activeSchedules = scheduleList.filter(s => s.status === 'ACTIVE' || s.status === 'active' || !s.status);
      setSchedules(activeSchedules);
    } catch (err) {
      setError(err.message || err.error || 'Không thể tải lịch dạy của bạn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClassClick = async (schedule, dayDateStr) => {
    if (actionLoading) return;

    try {
      setActionLoading(true);
      const classId = schedule?.classId?._id || schedule?.classId || schedule?.class?.id;
      const scheduleId = schedule?._id || schedule?.id;
      
      const data = await teacherApi.getSessionsByClass(classId).catch(err => {
         console.warn("Lỗi khi tải session, có thể api chưa implement hoặc trả lỗi:", err);
         return { sessions: [], data: [] };
      });
      
      let sessionList = [];
      if (Array.isArray(data)) sessionList = data;
      else if (data && Array.isArray(data.sessions)) sessionList = data.sessions;
      else if (data && Array.isArray(data.data)) sessionList = data.data;

      const existingSession = sessionList.find(s => {
        if (!s.sessionDate) return false;
        const sDateObj = new Date(s.sessionDate);
        const sYear = sDateObj.getFullYear();
        const sMonth = String(sDateObj.getMonth() + 1).padStart(2, '0');
        const sDay = String(sDateObj.getDate()).padStart(2, '0');
        const sDate = `${sYear}-${sMonth}-${sDay}`;
        
        const matchDate = sDate === dayDateStr;
        
        if (s.scheduleId) {
          const sIdStr = typeof s.scheduleId === 'object' ? s.scheduleId._id : s.scheduleId;
          return matchDate && sIdStr === scheduleId;
        }
        return matchDate;
      });

      if (existingSession) {
        navigate(`/teacher/classes/${classId}/sessions/${existingSession._id || existingSession.id}/attendance`);
      } else {
        const [year, month, day] = dayDateStr.split('-');
        const createRes = await teacherApi.createSession(classId, {
          scheduleId: scheduleId,
          sessionDate: dayDateStr,
          topic: `Buổi học ngày ${day}/${month}/${year}`
        });

        const newSessionId = createRes?.data?._id || createRes?._id || createRes?.data?.session?._id;
        if (newSessionId) {
           navigate(`/teacher/classes/${classId}/sessions/${newSessionId}/attendance`);
        } else {
           alert("Tạo session thành công nhưng không lấy được ID. Vui lòng kiểm tra lại danh sách buổi học.");
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.message || err.error || "Không thể khởi tạo hoặc lấy thông tin buổi học.");
    } finally {
      setActionLoading(false);
    }
  };

  const getClassName = (item) => {
    if (item?.classId?.name) return item.classId.name;
    if (item?.class?.name) return item.class.name;
    if (typeof item?.classId === 'string') return item.classId;
    return 'Lớp học không xác định';
  };

  const normalizeDayOfWeek = (day) => {
    if (typeof day === 'number') return day;
    const map = {
      'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
      'friday': 5, 'saturday': 6, 'sunday': 0
    };
    return map[day.toLowerCase()] !== undefined ? map[day.toLowerCase()] : -1;
  };

  const renderScheduleCell = (slot, day) => {
    const cellSchedules = schedules.filter(s => {
      const sDay = normalizeDayOfWeek(s.dayOfWeek);
      if (sDay !== day.dayOfWeek) return false;
      return s.startTime === slot.startTime || s.startTime?.startsWith(slot.startTime.substring(0, 2));
    });

    if (cellSchedules.length === 0) {
      return <td key={`${slot.slot}-${day.dayOfWeek}`} className="border border-gray-200 p-2 min-h-[100px]"></td>;
    }

    return (
      <td key={`${slot.slot}-${day.dayOfWeek}`} className="border border-slate-200 p-2 align-top bg-white min-h-[120px] transition-all hover:bg-slate-50/50">
        {cellSchedules.map((s, idx) => (
          <div 
            key={idx}
            onClick={() => handleClassClick(s, day.isoDate)}
            className={`p-3 mb-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all group ${actionLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="font-bold text-sm text-blue-900 mb-1.5 group-hover:text-blue-700 transition-colors">{getClassName(s)}</div>
            <div className="text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1.5 bg-white/60 w-fit px-1.5 py-0.5 rounded-md">
               <MapPin size={12} className="text-rose-500" />
               {s.room || s?.classId?.room || 'N/A'}
            </div>
            <div className="text-[11px] font-medium text-slate-600 mb-2 flex items-center gap-1.5 bg-white/60 w-fit px-1.5 py-0.5 rounded-md">
               <Clock size={12} className="text-amber-500" />
               {s.startTime || 'N/A'} - {s.endTime || 'N/A'}
            </div>
            <div className="flex justify-between items-center mt-2">
              <Badge status="Not yet" className="!text-[9px] !px-1.5 !py-0.5" />
              <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <BookOpen size={10} />
              </div>
            </div>
          </div>
        ))}
      </td>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Đang tải lịch dạy..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        <p className="font-medium">Lỗi</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchSchedules}
          className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline focus:outline-none"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lịch dạy của tôi</h1>
          <p className="text-sm text-slate-500 mt-1">Lịch giảng dạy của bạn hiển thị theo tuần.</p>
        </div>
        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
          <CalendarDays size={24} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Bộ lọc Week/Year */}
        <div className="flex flex-wrap items-center gap-4 p-5 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            <label className="text-sm font-medium text-slate-600">Năm:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setSelectedWeek(1);
              }}
              className="bg-transparent border-none text-sm font-semibold text-slate-800 focus:ring-0 cursor-pointer outline-none"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            <label className="text-sm font-medium text-slate-600">Tuần:</label>
            <select 
              value={selectedWeek} 
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-transparent border-none text-sm font-semibold text-slate-800 focus:ring-0 cursor-pointer outline-none w-56 truncate"
            >
              {weekOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto">
            <button 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-sm font-medium rounded-xl transition-all shadow-sm"
              onClick={() => {
                setSelectedYear(currentYear);
                setSelectedWeek(currentWeek);
              }}
            >
              <CalendarIcon size={16} />
              <span>Tuần hiện tại</span>
            </button>
          </div>
        </div>

        {/* Bảng Timetable */}
        {schedules.length === 0 ? (
          <EmptyState 
            title="Không tìm thấy lịch dạy" 
            description="Bạn chưa được phân công lịch giảng dạy nào đang hoạt động."
          />
        ) : (
          <div className="overflow-x-auto p-5">
            <table className="w-full border-collapse border border-slate-200 text-sm bg-white rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr>
                  <th className="bg-slate-50 border border-slate-200 p-3 text-center text-slate-500 font-semibold w-24">Slot</th>
                  {weekDates.map(day => (
                    <th key={day.dayOfWeek} className="bg-slate-50 border border-slate-200 p-3 text-center w-[12%]">
                      <div className="font-bold text-slate-800">{day.label}</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">{day.displayDate}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SLOT_CONFIG.map(slot => (
                  <tr key={slot.slot} className="group">
                    <td className="border border-slate-200 p-3 text-center bg-slate-50/50 group-hover:bg-slate-50 transition-colors">
                      <div className="font-bold text-slate-700">{slot.label}</div>
                      <div className="text-[11px] text-slate-500 font-medium mt-1">{slot.startTime}</div>
                    </td>
                    {weekDates.map(day => renderScheduleCell(slot, day))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSchedulesPage;
