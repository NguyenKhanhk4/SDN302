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
  const [selectedStudent, setSelectedStudent] = useState(null);

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
    const profile = item?.studentId || item;
    
    return {
      name: user?.fullName || user?.name || 'Không xác định',
      email: user?.email || 'Không có',
      phone: user?.phone || 'Không có',
      status: item?.status || 'ACTIVE',
      parentName: profile?.parentName || 'Không có',
      parentPhone: profile?.parentPhone || 'Không có',
      grade: profile?.grade || 'Không rõ',
      school: profile?.school || 'Không rõ'
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
                    <tr 
                      key={item._id || item.id || index} 
                      onClick={() => setSelectedStudent(info)}
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    >
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {info.name.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{info.name}</span>
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

      {/* Modal chi tiết học viên */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">Thông tin chi tiết</h3>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{selectedStudent.name}</h4>
                  <Badge status={selectedStudent.status} className="mt-1" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Học viên</h5>
                  <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100">
                    <p className="text-sm flex justify-between"><span className="text-slate-500">Email:</span> <span className="font-medium text-slate-700">{selectedStudent.email}</span></p>
                    <p className="text-sm flex justify-between"><span className="text-slate-500">Điện thoại:</span> <span className="font-medium text-slate-700">{selectedStudent.phone}</span></p>
                    <p className="text-sm flex justify-between"><span className="text-slate-500">Lớp/Trường:</span> <span className="font-medium text-slate-700">{selectedStudent.grade} - {selectedStudent.school}</span></p>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phụ huynh</h5>
                  <div className="bg-blue-50 p-3 rounded-xl space-y-2 border border-blue-100">
                    <p className="text-sm flex justify-between"><span className="text-blue-600/70">Họ tên:</span> <span className="font-bold text-blue-900">{selectedStudent.parentName}</span></p>
                    <p className="text-sm flex justify-between"><span className="text-blue-600/70">SĐT liên hệ:</span> <span className="font-bold text-blue-900">{selectedStudent.parentPhone}</span></p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClassStudentsPage;
