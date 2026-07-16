import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { ArrowLeft, Users, Plus, X } from 'lucide-react';

const ManagerClassStudentsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Students Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClassAndStudents = async () => {
    try {
      setLoading(true);
      const classResponse = await managerApi.getClassDetail(classId);
      const studentsResponse = await managerApi.getClassStudents(classId);

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

  useEffect(() => {
    fetchClassAndStudents();
  }, [classId]);

  const openAddModal = async () => {
    setIsAddModalOpen(true);
    setSelectedStudentIds([]);
    setSearchQuery('');
    try {
      const res = await managerApi.getStudents({ limit: 1000 });
      if (res.success) {
        setAllStudents(res.data.students || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectAll = (e, filtered) => {
    if (e.target.checked) {
      const newIds = [...new Set([...selectedStudentIds, ...filtered.map(s => s._id)])];
      setSelectedStudentIds(newIds);
    } else {
      const filteredIds = filtered.map(s => s._id);
      setSelectedStudentIds(prev => prev.filter(id => !filteredIds.includes(id)));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddStudents = async () => {
    if (selectedStudentIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 học viên');
      return;
    }
    setSubmitting(true);
    try {
      const res = await managerApi.addStudentToClass(classId, { studentIds: selectedStudentIds });
      if (res.success) {
        alert(res.message || 'Thêm học viên thành công');
        setIsAddModalOpen(false);
        fetchClassAndStudents();
      } else {
        alert(res.message || 'Thêm thất bại');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Lỗi hệ thống');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !classroom) {
    return <Loading text="Đang tải danh sách học viên..." />;
  }

  if (error || !classroom) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
          {error || 'Không tìm thấy lớp học'}
        </div>
        <Button variant="outline" onClick={() => navigate('/manager/classes')}>
          Quay lại Lớp học
        </Button>
      </div>
    );
  }

  // Filter students for modal that are not already in the class
  const existingStudentIds = students.map(s => s.studentProfileId);
  let availableStudents = allStudents.filter(s => !existingStudentIds.includes(s._id));
  if (searchQuery) {
    availableStudents = availableStudents.filter(s => 
      s.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/manager/classes')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Học viên trong lớp</h1>
            <p className="text-sm text-gray-500 mt-1">
              Danh sách học viên đăng ký lớp: <span className="font-semibold text-gray-800">{classroom.name}</span>
            </p>
          </div>
        </div>
        {classroom.status !== 'cancelled' && classroom.status !== 'completed' && (
          <Button variant="primary" onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" /> Thêm Học viên
          </Button>
        )}
      </div>

      {/* Students Table Card */}
      <Card>
        {students.length === 0 ? (
          <EmptyState
            title="Chưa có học viên nào đăng ký"
            description="Hiện tại chưa có học viên nào đăng ký vào lớp học này."
            icon={<Users className="w-12 h-12 text-gray-400" />}
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{student?.userId?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student?.userId?.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student?.parentPhone || 'Chưa cập nhật'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge status={student?.status || 'active'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                       <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/manager/students/${student.studentProfileId}`)}
                      >
                        Hồ sơ
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Students Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-gray-900">Thêm học viên vào lớp</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-100 shrink-0">
              <input 
                type="text" 
                placeholder="Tìm kiếm học viên theo tên, email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                  <tr>
                    <th className="px-6 py-3 w-10">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                        checked={availableStudents.length > 0 && availableStudents.every(s => selectedStudentIds.includes(s._id))}
                        onChange={(e) => handleSelectAll(e, availableStudents)}
                      />
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Họ và tên</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {availableStudents.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500 text-sm">
                        Không có học viên nào phù hợp (hoặc tất cả đã có trong lớp).
                      </td>
                    </tr>
                  ) : (
                    availableStudents.map(student => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <input 
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                            checked={selectedStudentIds.includes(student._id)}
                            onChange={() => handleSelectOne(student._id)}
                          />
                        </td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{student.userId?.name || 'N/A'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{student.userId?.email || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between rounded-b-2xl shrink-0">
              <span className="text-sm text-gray-600">Đã chọn: <strong>{selectedStudentIds.length}</strong> học viên</span>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
                <Button variant="primary" onClick={handleAddStudents} disabled={submitting || selectedStudentIds.length === 0}>
                  {submitting ? 'Đang thêm...' : 'Xác nhận Thêm'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerClassStudentsPage;
