import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { ArrowLeft, LayoutList, CheckSquare, CalendarDays, X, Users, BookOpen, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const SessionDetailModal = ({ session, onClose, onAttendance }) => {
  if (!session) return null;

  const { attendanceSummary = {}, topic, sessionDate, room, startTime, endTime, status, attendanceStatus } = session;
  const { total = 0, recorded = 0, present = 0, absent = 0 } = attendanceSummary;
  const notRecorded = recorded === 0;

  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const statusColors = {
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    FUTURE: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  const statusLabels = {
    SCHEDULED: 'Đã lên lịch',
    COMPLETED: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy',
    FUTURE: 'Sắp diễn ra',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Chi tiết buổi học</p>
            <h2 className="text-white text-lg font-bold">{topic || 'Chưa có chủ đề'}</h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày học</p>
                <p className="text-sm font-semibold text-slate-800">{formatDate(sessionDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giờ học</p>
                <p className="text-sm font-semibold text-slate-800">{formatTime(startTime)} – {formatTime(endTime)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phòng học</p>
                <p className="text-sm font-semibold text-slate-800">{room || 'Chưa xếp'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColors[attendanceStatus || status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {statusLabels[attendanceStatus || status] || status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Điểm danh</h3>
            </div>

            {notRecorded ? (
              <div className="flex items-center gap-3 text-amber-600 bg-amber-50 rounded-xl p-3 border border-amber-200">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Chưa có dữ liệu điểm danh cho buổi học này.</p>
                  <p className="text-xs text-amber-500 mt-0.5">Lớp có <strong>{total}</strong> học sinh đã đăng ký.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                  <p className="text-2xl font-extrabold text-slate-800">{total}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">Học sinh lớp</p>
                </div>
                <div className="text-center bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <p className="text-2xl font-extrabold text-blue-700">{recorded}</p>
                  <p className="text-[10px] text-blue-500 font-medium mt-1">Đã ghi</p>
                </div>
                <div className="text-center bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <p className="text-2xl font-extrabold text-emerald-700">{present}</p>
                  </div>
                  <p className="text-[10px] text-emerald-600 font-medium">Có mặt</p>
                </div>
                <div className="text-center bg-red-50 rounded-xl p-3 border border-red-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                    <p className="text-2xl font-extrabold text-red-600">{absent}</p>
                  </div>
                  <p className="text-[10px] text-red-500 font-medium">Vắng mặt</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">
              Đóng
            </button>
            <button
              onClick={onAttendance}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <LayoutList className="h-4 w-4" />
              Chi tiết / Điểm danh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeacherSessionsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchData();
  }, [classId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [classRes, sessionsRes] = await Promise.all([
        teacherApi.getClassDetail(classId),
        teacherApi.getSessionsByClass(classId),
      ]);

      const cls = classRes?.data || classRes;
      setClassInfo(cls);

      let sessionList = [];
      if (Array.isArray(sessionsRes)) sessionList = sessionsRes;
      else if (sessionsRes && Array.isArray(sessionsRes.sessions)) sessionList = sessionsRes.sessions;
      else if (sessionsRes && Array.isArray(sessionsRes.data)) sessionList = sessionsRes.data;
      
      setSessions(sessionList);
    } catch (err) {
      setError(err.message || err.error || 'Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Đang tải danh sách buổi học..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div>
          <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
            <span className="cursor-pointer hover:text-blue-500 transition-colors" onClick={() => navigate('/teacher/classes')}>Lớp học của tôi</span>
            <span>›</span>
            <span className="text-slate-600 font-semibold">{classInfo?.name || '...'}</span>
            <span>›</span>
            <span className="text-blue-600 font-semibold">Danh sách buổi học</span>
          </p>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Các buổi học –
            <span className="text-blue-600">{classInfo?.name || '...'}</span>
          </h1>

          <div className="flex items-center gap-3 mt-2">
            {classInfo?.subjectId?.name && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                <BookOpen className="h-3 w-3" />
                {classInfo.subjectId.name}
              </span>
            )}
            {classInfo?.subjectId?.gradeLevel && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
                Khối {classInfo.subjectId.gradeLevel}
              </span>
            )}
            <span className="text-xs text-slate-400">{sessions.length} buổi học</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={() => navigate(`/teacher/classes/${classId}`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Chi tiết lớp học</span>
          </button>
          <button 
            onClick={() => navigate('/teacher/classes')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-xl transition-colors"
          >
            <LayoutList size={16} />
            <span>Tất cả lớp học</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <CalendarDays className="text-slate-400" size={20} />
          <h2 className="text-lg font-bold text-slate-800">Danh sách buổi học</h2>
          <span className="ml-auto text-xs text-slate-400 font-medium">{sessions.length} buổi</span>
        </div>
        
        {error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : loading && sessions.length > 0 ? (
           <div className="py-12"><Loading text="Đang cập nhật danh sách..." /></div>
        ) : sessions.length === 0 ? (
          <EmptyState 
            title="Không tìm thấy buổi học" 
            description="Hệ thống chưa tạo buổi học nào cho lớp học này."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-16">STT</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày học</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Chủ đề</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tài liệu
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Điểm danh
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right rounded-tr-xl">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((item, index) => {
                  const id = item._id || item.id;
                  const { attendanceSummary = {} } = item;
                  const { total = 0, recorded = 0, present = 0, absent = 0 } = attendanceSummary;

                  return (
                    <tr 
                      key={id || index} 
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      onClick={() => setSelectedSession(item)}
                    >
                      <td className="p-4 text-sm font-bold text-slate-500 text-center">
                        {index + 1}
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-800">
                        {formatDate(item.sessionDate || item.date)}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {item.topic || <span className="text-slate-400 italic">Chưa có chủ đề</span>}
                      </td>
                      <td className="p-4 text-sm">
                        {item.materials && item.materials.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                            <BookOpen className="h-3 w-3" /> {item.materials.length} file
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">0 file</span>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {(attendanceSummary.recorded || 0) === 0 ? (
                          <span className="text-slate-400 italic text-xs">Chưa điểm danh</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                              <CheckCircle className="h-3 w-3" /> {present} có mặt
                            </span>
                            <span className="text-slate-400 text-xs">/ {total} học sinh</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        <Badge status={item.attendanceStatus || item.status || 'SCHEDULED'} />
                      </td>
                      <td className="p-4 text-sm text-right space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/teacher/classes/${classId}/sessions/${id}/attendance`);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-medium text-xs"
                        >
                          <LayoutList size={14} />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onAttendance={() => {
            const id = selectedSession._id || selectedSession.id;
            navigate(`/teacher/classes/${classId}/sessions/${id}/attendance`);
            setSelectedSession(null);
          }}
        />
      )}
    </div>
  );
};

export default TeacherSessionsPage;
