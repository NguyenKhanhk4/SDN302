import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

import SLOT_CONFIG from '../../utils/slotConfig';
import { getCurrentYear, getWeekOptions, getWeekDates, getCurrentWeekNumber } from '../../utils/weekUtils';

const normalizeTime = (time) => {
  if (!time) return '';
  const parts = time.split(':');
  if (parts.length >= 2) {
    let h = parts[0];
    let m = parts[1];
    if (h.length === 1) h = '0' + h;
    return `${h}:${m}`;
  }
  return time;
};

const findSlotForSchedule = (schedule) => {
  if (!schedule.startTime || !schedule.endTime) return null;
  const nStart = normalizeTime(schedule.startTime);
  const nEnd = normalizeTime(schedule.endTime);

  const exactMatch = SLOT_CONFIG.find(s => s.startTime === nStart && s.endTime === nEnd);
  if (exactMatch) return exactMatch;

  const partialMatch = SLOT_CONFIG.find(s => s.startTime === nStart);
  if (partialMatch) return partialMatch;

  return null;
};

const TeacherSchedulesPage = () => {
  const navigate = useNavigate();

  const currentYear = getCurrentYear();
  const currentWeek = getCurrentWeekNumber();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingCardId, setLoadingCardId] = useState(null);

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
      
      activeSchedules.forEach(s => {
        if (!findSlotForSchedule(s)) {
          console.warn("Schedule does not match configured slots", s);
        }
      });
      
      setSchedules(activeSchedules);
    } catch (err) {
      setError(err.message || err.error || 'Không thể tải lịch dạy của bạn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClassClick = async (schedule, dayDateStr) => {
    const cardId = `${schedule._id}-${dayDateStr}`;
    if (loadingCardId) return;

    try {
      setLoadingCardId(cardId);
      
      const classId = typeof schedule.classId === 'object' ? schedule.classId._id : schedule.classId;
      const scheduleId = schedule._id;
      
      const data = await teacherApi.getSessionsByClass(classId).catch(err => {
         console.warn("Lỗi khi tải session:", err);
         return { data: [] };
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
        navigate(`/teacher/classes/${classId}/sessions/${existingSession._id}/attendance?from=schedule`);
      } else {
        alert("Không tìm thấy buổi học tương ứng. Vui lòng kiểm tra lịch học của lớp.");
      }
    } catch (err) {
      console.error(err);
      alert("Không thể mở điểm danh. Vui lòng thử lại.");
    } finally {
      setLoadingCardId(null);
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
      const matchedSlot = findSlotForSchedule(s);
      return matchedSlot && matchedSlot.slot === slot.slot;
    });

    if (cellSchedules.length === 0) {
      return <td key={`${slot.slot}-${day.dayOfWeek}`} className="border border-gray-200 p-2 min-h-[140px]"></td>;
    }

    return (
      <td key={`${slot.slot}-${day.dayOfWeek}`} className="border border-gray-200 p-2 align-top bg-white min-h-[140px]">
        {cellSchedules.map((s, idx) => {
          const cardId = `${s._id}-${day.isoDate}`;
          const isThisCardLoading = loadingCardId === cardId;
          
          return (
          <div 
            key={idx}
            onClick={() => handleClassClick(s, day.isoDate)}
            className={`p-2 mb-2 rounded border bg-blue-50 border-blue-200 shadow-sm cursor-pointer hover:bg-blue-100 hover:shadow transition-all ${loadingCardId ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="font-semibold text-sm text-blue-900 mb-1">{getClassName(s)}</div>
            <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
               {s.room || s?.classId?.room || 'N/A'}
            </div>
            <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               {findSlotForSchedule(s)?.startTime || normalizeTime(s.startTime) || 'N/A'} - {findSlotForSchedule(s)?.endTime || normalizeTime(s.endTime) || 'N/A'}
            </div>
            {isThisCardLoading && (
              <div className="mt-1">
                <Badge status="Đang mở..." className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700" />
              </div>
            )}
          </div>
        )})}
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lịch dạy của tôi</h1>
        <p className="mt-1 text-sm text-gray-500">Lịch giảng dạy của bạn hiển thị theo tuần.</p>
      </div>

      <Card className="w-full">
        {/* Bộ lọc Week/Year */}
        <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Năm:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setSelectedWeek(1); // Reset to week 1 when year changes
              }}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Tuần:</label>
            <select 
              value={selectedWeek} 
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            >
              {weekOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto">
            <Button 
              variant="outline" 
              className="!py-1.5 !text-sm"
              onClick={() => {
                setSelectedYear(currentYear);
                setSelectedWeek(currentWeek);
              }}
            >
              Tuần hiện tại
            </Button>
          </div>
        </div>

        {/* Bảng Timetable */}
        {schedules.length === 0 ? (
          <EmptyState 
            title="Không có lịch dạy trong tuần này." 
            description="Bạn chưa được phân công lịch giảng dạy nào đang hoạt động."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200 text-sm">
              <thead>
                <tr>
                  <th className="bg-blue-50 border border-gray-200 p-2 text-center text-blue-800 w-20">Slot</th>
                  {weekDates.map(day => (
                    <th key={day.dayOfWeek} className="bg-blue-50 border border-gray-200 p-2 text-center w-[12%]">
                      <div className="font-bold text-blue-900">{day.label}</div>
                      <div className="text-xs text-blue-700 font-normal">{day.displayDate}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SLOT_CONFIG.map(slot => (
                  <tr key={slot.slot}>
                    <td className="border border-gray-200 p-2 text-center bg-gray-50">
                      <div className="font-semibold text-gray-700">{slot.label}</div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">{slot.startTime} - {slot.endTime}</div>
                    </td>
                    {weekDates.map(day => renderScheduleCell(slot, day))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeacherSchedulesPage;
