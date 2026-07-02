import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lớp học của tôi</h1>
        <p className="mt-1 text-sm text-gray-500">Xem các lớp học được phân công cho bạn.</p>
      </div>

      <Card className="w-full">
        {classes.length === 0 ? (
          <EmptyState 
            title="Không tìm thấy lớp học" 
            description="Bạn chưa được phân công vào lớp học nào."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên lớp học</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng học</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học viên</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classes.map((cls) => {
                  const id = cls._id || cls.id;
                  return (
                    <tr key={id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{cls.name || cls.className || 'Không xác định'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{getSubjectName(cls)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{cls.room || 'Không có'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{cls.maxStudents || cls.capacity || 'Không có'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={cls.status || 'ACTIVE'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex justify-end items-center">
                        <Button 
                          variant="outline" 
                          onClick={() => navigate(`/teacher/classes/${id}`)}
                          className="!py-1.5 !px-3 !text-xs"
                        >
                          Xem chi tiết
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => navigate(`/teacher/classes/${id}/students`)}
                          className="!py-1.5 !px-3 !text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          Học viên
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => navigate(`/teacher/classes/${id}/sessions`)}
                          className="!py-1.5 !px-3 !text-xs text-green-600 hover:text-green-800 hover:bg-green-50"
                        >
                          Buổi học
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

export default TeacherClassesPage;
