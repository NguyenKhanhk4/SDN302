import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import { ArrowLeft, LayoutList, CalendarPlus, CheckSquare, CalendarDays } from 'lucide-react';

const TeacherSessionsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ sessionDate: '', topic: '', room: '', startTime: '', endTime: '' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!formData.sessionDate) {
      setFormError('Ngày học là bắt buộc.');
      return;
    }
    if (!formData.room?.trim()) {
      setFormError('Phòng học là bắt buộc.');
      return;
    }
    if (!formData.startTime) {
      setFormError('Giờ bắt đầu là bắt buộc.');
      return;
    }
    if (!formData.endTime) {
      setFormError('Giờ kết thúc là bắt buộc.');
      return;
    }
    if (!formData.topic?.trim()) {
      setFormError('Chủ đề là bắt buộc.');
      return;
    }

    try {
      setCreating(true);
      setFormError('');
      setSuccessMessage('');
      
      // Need to parse times into dates for the backend
      const startDateTime = new Date(`${formData.sessionDate}T${formData.startTime}:00`).toISOString();
      const endDateTime = new Date(`${formData.sessionDate}T${formData.endTime}:00`).toISOString();
      
      const user = JSON.parse(localStorage.getItem('user'));
      
      await teacherApi.createSession(classId, {
        sessionDate: formData.sessionDate,
        topic: formData.topic,
        teacherId: user?.profileId || user?._id || user?.id,
        room: formData.room,
        startTime: startDateTime,
        endTime: endDateTime
      });
      
      setSuccessMessage('Tạo buổi học thành công!');
      setFormData({ sessionDate: '', topic: '', room: '', startTime: '', endTime: '' });
      fetchSessions(); // Reload list directly after success
      
    } catch (err) {
      setFormError(err.message || err.error || 'Không thể tạo buổi học. Vui lòng kiểm tra lại thông tin nhập.');
    } finally {
      setCreating(false);
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Các buổi học của lớp</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý các buổi học cho lớp học này.</p>
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

      {/* Create Session Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
            <CalendarPlus size={18} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Tạo buổi học mới</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleCreateSession} className="space-y-4">
            {successMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-200 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                {successMessage}
              </div>
            )}
            {formError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-sm font-medium rounded-xl border border-rose-200 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                {formError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-1">
                <Input
                  label="Ngày học"
                  name="sessionDate"
                  type="date"
                  value={formData.sessionDate}
                  onChange={handleFormChange}
                />
              </div>
              <div className="lg:col-span-1">
                <Input
                  label="Phòng học"
                  name="room"
                  type="text"
                  value={formData.room || ''}
                  onChange={handleFormChange}
                  placeholder="VD: P.101"
                />
              </div>
              <div className="lg:col-span-1">
                <Input
                  label="Giờ bắt đầu"
                  name="startTime"
                  type="time"
                  value={formData.startTime || ''}
                  onChange={handleFormChange}
                />
              </div>
              <div className="lg:col-span-1">
                <Input
                  label="Giờ kết thúc"
                  name="endTime"
                  type="time"
                  value={formData.endTime || ''}
                  onChange={handleFormChange}
                />
              </div>
              <div className="lg:col-span-5 md:col-span-2">
                <Input
                  label="Chủ đề / Nội dung bài học"
                  name="topic"
                  type="text"
                  value={formData.topic}
                  onChange={handleFormChange}
                  placeholder="Nhập nội dung giảng dạy..."
                />
              </div>
            </div>
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={creating}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-70"
              >
                {creating ? 'Đang tạo...' : 'Tạo buổi học'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sessions List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <CalendarDays className="text-slate-400" size={20} />
          <h2 className="text-lg font-bold text-slate-800">Danh sách buổi học</h2>
        </div>
        
        {loading && sessions.length > 0 ? (
           <div className="py-12"><Loading text="Đang cập nhật danh sách..." /></div>
        ) : sessions.length === 0 ? (
          <EmptyState 
            title="Không tìm thấy buổi học" 
            description="Bạn chưa tạo buổi học nào cho lớp học này."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày học</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Chủ đề</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((item, index) => {
                  const id = item._id || item.id;
                  return (
                    <tr key={id || index} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-4 text-sm font-semibold text-slate-800">
                        {formatDate(item.sessionDate || item.date)}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {item.topic || 'Không có'}
                      </td>
                      <td className="p-4 text-sm">
                        <Badge status={item.status || 'SCHEDULED'} />
                      </td>
                      <td className="p-4 text-sm text-right space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity flex justify-end">
                        <button 
                          onClick={() => navigate(`/teacher/classes/${classId}/sessions/${id}/attendance`)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-medium text-xs"
                        >
                          <CheckSquare size={14} />
                          <span>Điểm danh</span>
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
    </div>
  );
};

export default TeacherSessionsPage;
