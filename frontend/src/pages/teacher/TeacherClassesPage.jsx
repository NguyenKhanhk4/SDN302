import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { Eye, Users, CalendarDays, BookOpen } from 'lucide-react';

const TeacherClassesPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherApi.getMyClasses();
      
      // Handle array or object wrapper
      let classList = [];
      if (Array.isArray(data)) classList = data;
      else if (data && Array.isArray(data.classes)) classList = data.classes;
      else if (data && Array.isArray(data.data)) classList = data.data;
      
      setClasses(classList);
    } catch (err) {
      setError(err.message || err.error || 'Không thể tải danh sách lớp học của bạn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectName = (cls) => {
    if (cls.subjectId && cls.subjectId.name) return cls.subjectId.name;
    if (cls.subject && cls.subject.name) return cls.subject.name;
    if (typeof cls.subject === 'string') return cls.subject;
    return 'Không có';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Đang tải danh sách lớp học..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        <p className="font-medium">Lỗi</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchClasses}
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lớp học của tôi</h1>
          <p className="text-sm text-slate-500 mt-1">Xem các lớp học được phân công cho bạn.</p>
        </div>
        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
          <BookOpen size={24} />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {classes.length === 0 ? (
          <EmptyState 
            title="Không tìm thấy lớp học" 
            description="Bạn chưa được phân công vào lớp học nào."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tên lớp học</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Môn học</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Phòng học</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Số học viên tối đa</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((cls) => {
                  const id = cls._id || cls.id;
                  return (
                    <tr key={id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-4 text-sm font-semibold text-slate-800">{cls.name || cls.className || 'Không xác định'}</td>
                      <td className="p-4 text-sm text-slate-600">{getSubjectName(cls)}</td>
                      <td className="p-4 text-sm text-slate-600">{cls.room || 'Không có'}</td>
                      <td className="p-4 text-sm text-slate-600">{cls.maxStudents || cls.capacity || 'Không có'}</td>
                      <td className="p-4 text-sm">
                        <Badge status={cls.status || 'ACTIVE'} />
                      </td>
                      <td className="p-4 text-sm text-right space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity flex justify-end">
                        <button 
                          onClick={() => navigate(`/teacher/classes/${id}`)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => navigate(`/teacher/classes/${id}/students`)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          title="Học viên"
                        >
                          <Users size={16} />
                        </button>
                        <button 
                          onClick={() => navigate(`/teacher/classes/${id}/sessions`)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          title="Buổi học"
                        >
                          <CalendarDays size={16} />
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

export default TeacherClassesPage;
