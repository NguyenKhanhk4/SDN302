import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

const formatSessionDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const day = weekdays[date.getDay()];
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${day} ${d}/${m}/${y}`;
};

const getSlot = (startTime, endTime) => {
  if (startTime === '07:30' && endTime === '09:30') return 'Ca 1 (07:30 - 09:30)';
  if (startTime === '09:30' && endTime === '11:30') return 'Ca 2 (09:30 - 11:30)';
  if (startTime === '14:00' && endTime === '16:00') return 'Ca 3 (14:00 - 16:00)';
  if (startTime === '16:00' && endTime === '18:00') return 'Ca 4 (16:00 - 18:00)';
  if (startTime === '18:00' && endTime === '20:00') return 'Ca 5 (18:00 - 20:00)';
  if (startTime && endTime) return `${startTime} - ${endTime}`;
  return '-';
};

const renderStatusBadge = (status) => {
  switch (status) {
    case 'FUTURE':
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">Tương lai</span>;
    case 'NOT_YET':
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Chưa điểm danh</span>;
    case 'COMPLETED':
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">Đã điểm danh</span>;
    case 'CANCELLED':
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">Đã hủy</span>;
    default:
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{status}</span>;
  }
};

const renderActionButton = (status, sessionId, classId, navigate) => {
  if (status === 'FUTURE') {
    return (
      <Button variant="outline" disabled className="!py-1.5 !px-3 !text-xs opacity-50 cursor-not-allowed">
        Chưa đến ngày
      </Button>
    );
  }
  if (status === 'CANCELLED') {
    return null;
  }
  
  const text = status === 'COMPLETED' ? 'Xem/Sửa điểm danh' : 'Điểm danh';
  return (
    <Button 
      variant={status === 'COMPLETED' ? "outline" : "secondary"} 
      onClick={() => navigate(`/teacher/classes/${classId}/sessions/${sessionId}/attendance`)}
      className="!py-1.5 !px-3 !text-xs text-primary hover:text-primary-hover hover:bg-blue-50 border border-primary/20"
    >
      {text}
    </Button>
  );
};

const TeacherSessionsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userStr = localStorage.getItem('user');
  const lecturerName = userStr ? JSON.parse(userStr).fullName || JSON.parse(userStr).name || '-' : '-';

  useEffect(() => {
    fetchSessions();
  }, [classId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherApi.getSessionsByClass(classId);
      
      let sessionList = [];
      if (Array.isArray(data)) sessionList = data;
      else if (data && Array.isArray(data.sessions)) sessionList = data.sessions;
      else if (data && Array.isArray(data.data)) sessionList = data.data;
      
      setSessions(sessionList);
    } catch (err) {
      setError(err.message || err.error || 'Không thể tải danh sách buổi học. Vui lòng thử lại.');
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Các buổi học của lớp</h1>
          <p className="mt-1 text-sm text-gray-500">Danh sách buổi học được tạo tự động theo lịch học của lớp.</p>
        </div>
        <div className="space-x-3">
          <Button variant="outline" onClick={() => navigate(`/teacher/classes/${classId}`)}>
            &larr; Chi tiết lớp học
          </Button>
          <Button variant="secondary" onClick={() => navigate('/teacher/classes')}>
            Tất cả lớp học
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
          <p className="font-medium">Lỗi khi tải danh sách buổi học</p>
          <p className="text-sm">{error}</p>
          <button onClick={fetchSessions} className="mt-2 text-sm underline focus:outline-none">Thử lại</button>
        </div>
      )}

      {/* Sessions List Table */}
      <Card className="w-full p-0 overflow-hidden border-t-4 border-t-primary shadow-sm">
        <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Danh sách buổi học</h2>
        </div>
        
        {loading && sessions.length > 0 ? (
           <div className="py-8"><Loading text="Đang cập nhật danh sách..." /></div>
        ) : sessions.length === 0 ? (
          <EmptyState 
            title="Chưa có buổi học" 
            description="Chưa có buổi học nào được tạo cho lớp này."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50/30">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No.</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Slot</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lecturer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Attendance Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sessions.map((item, index) => {
                  const id = item._id || item.id;
                  const startTime = item.scheduleId?.startTime;
                  const endTime = item.scheduleId?.endTime;
                  const room = item.scheduleId?.room || item.classId?.room || '-';
                  const className = item.classId?.name || '-';
                  
                  return (
                    <tr key={id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {formatSessionDate(item.sessionDate || item.date)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-orange-50 text-orange-700 border border-orange-100">
                          {getSlot(startTime, endTime)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {room}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {lecturerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {className}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(item.attendanceStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {renderActionButton(item.attendanceStatus, id, classId, navigate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeacherSessionsPage;
