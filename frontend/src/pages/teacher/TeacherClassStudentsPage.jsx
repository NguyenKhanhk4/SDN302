import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { ArrowLeft, Users, LayoutList } from 'lucide-react';

const TeacherClassStudentsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherApi.getStudentsInClass(classId);
      
      // Handle array or object wrapper depending on backend standard
      let studentList = [];
      if (Array.isArray(data)) studentList = data;
      else if (data && Array.isArray(data.students)) studentList = data.students;
      else if (data && Array.isArray(data.data)) studentList = data.data;
      
      setStudents(studentList);
    } catch (err) {
      setError(err.message || err.error || 'Không thể tải danh sách học viên. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getStudentInfo = (item) => {
    // Navigate safely through nested structure: item.studentId.userId
    // Also include fallbacks in case backend flattens the response
    const user = item?.studentId?.userId || item?.studentId || item?.userId || item?.student || item;
    return {
      name: user?.fullName || user?.name || 'Không xác định',
      email: user?.email || 'Không có',
      phone: user?.phone || 'Không có',
      status: item?.status || 'ACTIVE'
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Đang tải danh sách học viên..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        <p className="font-medium">Lỗi</p>
        <p className="text-sm">{error}</p>
        <div className="mt-4 flex space-x-4">
          <button 
            onClick={fetchStudents}
            className="text-sm font-medium text-red-700 hover:text-red-800 underline focus:outline-none"
          >
            Thử lại
          </button>
          <button 
            onClick={() => navigate('/teacher/classes')}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 underline focus:outline-none"
          >
            Quay lại danh sách lớp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Học viên</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách học viên trong lớp học này.</p>
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
        {students.length === 0 ? (
          <EmptyState 
            title="Không tìm thấy học viên" 
            description="Hiện tại chưa có học viên nào tham gia lớp học này."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tên học viên</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((item, index) => {
                  const info = getStudentInfo(item);
                  return (
                    <tr key={item._id || item.id || index} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {info.name.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{info.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{info.email}</td>
                      <td className="p-4 text-sm text-slate-600">{info.phone}</td>
                      <td className="p-4 text-sm">
                        <Badge status={info.status} />
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

export default TeacherClassStudentsPage;
