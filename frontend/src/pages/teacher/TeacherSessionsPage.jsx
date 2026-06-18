import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import { formatDate } from '../../utils/formatDate';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const TeacherSessionsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ sessionDate: '', topic: '' });
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
    if (!formData.topic.trim()) {
      setFormError('Chủ đề là bắt buộc.');
      return;
    }

    try {
      setCreating(true);
      setFormError('');
      setSuccessMessage('');
      
      await teacherApi.createSession(classId, {
        sessionDate: formData.sessionDate,
        topic: formData.topic
      });
      
      setSuccessMessage('Tạo buổi học thành công!');
      setFormData({ sessionDate: '', topic: '' });
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Các buổi học của lớp</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý các buổi học cho lớp học này.</p>
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

      {/* Create Session Form */}
      <Card title="Tạo buổi học mới" className="mb-8 border-l-4 border-l-primary shadow-sm">
        <form onSubmit={handleCreateSession} className="space-y-4">
          {successMessage && (
            <div className="p-3 bg-green-50 text-green-700 text-sm font-medium rounded border border-green-200">
              {successMessage}
            </div>
          )}
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded border border-red-200">
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Ngày học"
              name="sessionDate"
              type="date"
              value={formData.sessionDate}
              onChange={handleFormChange}
            />
            <Input
              label="Chủ đề / Nội dung bài học"
              name="topic"
              type="text"
              placeholder="VD: Ôn tập đại số"
              value={formData.topic}
              onChange={handleFormChange}
            />
          </div>
          <div className="pt-2">
            <Button type="submit" variant="primary" loading={creating}>
              Tạo buổi học
            </Button>
          </div>
        </form>
      </Card>

      {/* Sessions List Table */}
      <Card title="Danh sách buổi học" className="w-full">
        {loading && sessions.length > 0 ? (
           <div className="py-8"><Loading text="Đang cập nhật danh sách..." /></div>
        ) : sessions.length === 0 ? (
          <EmptyState 
            title="Không tìm thấy buổi học" 
            description="Bạn chưa tạo buổi học nào cho lớp học này."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày học</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chủ đề</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((item, index) => {
                  const id = item._id || item.id;
                  return (
                    <tr key={id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(item.sessionDate || item.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{item.topic || 'Không có'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={item.status || 'SCHEDULED'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="secondary" 
                          onClick={() => navigate(`/teacher/classes/${classId}/sessions/${id}/attendance`)}
                          className="!py-1.5 !px-3 !text-xs text-primary hover:text-primary-hover hover:bg-blue-50 border border-primary/20"
                        >
                          Điểm danh
                        </Button>
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
