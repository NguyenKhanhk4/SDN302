import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const AdminClassStudentsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClassAndStudents = async () => {
      try {
        setLoading(true);
        const classResponse = await adminApi.getClassDetail(classId);
        const studentsResponse = await adminApi.getClassStudents(classId);

        if (classResponse.success && studentsResponse.success) {
          setClassroom(classResponse.data);
          setStudents(studentsResponse.data);
        } else {
          setError(classResponse.message || studentsResponse.message || 'Tải thông tin thất bại');
        }
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi khi tải danh sách học viên');
      } finally {
        setLoading(false);
      }
    };

    fetchClassAndStudents();
  }, [classId]);

  if (loading) {
    return <Loading text="Đang tải danh sách học viên..." />;
  }

  if (error || !classroom) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
          {error || 'Không tìm thấy lớp học'}
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/classes')}>
          Quay lại Lớp học
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Học viên trong lớp</h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách học viên đăng ký lớp: <span className="font-semibold text-gray-800">{classroom.name}</span>
          </p>
        </div>
        <div className="space-x-3">
          <Button variant="outline" onClick={() => navigate(`/admin/classes/${classId}`)}>
            Quay lại Chi tiết
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/classes')}>
            Quay lại Danh sách
          </Button>
        </div>
      </div>

      {/* Students Table Card */}
      <Card>
        {students.length === 0 ? (
          <EmptyState
            title="Chưa có học viên nào đăng ký"
            description="Hiện tại chưa có học viên nào đăng ký vào lớp học này."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Họ và tên</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Địa chỉ Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{student.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone || 'Chưa cập nhật'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge status={student.status} />
                    </td>
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

export default AdminClassStudentsPage;
