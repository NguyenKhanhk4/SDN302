import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Eye, Edit, Trash2, Users, UserCheck, UserX, UserMinus, GraduationCap, X, Plus } from 'lucide-react';

const Badge = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    finished: 'bg-blue-100 text-blue-800',
  };
  const labels = {
    active: 'Đang học',
    inactive: 'Dừng học',
    reserved: 'Bảo lưu',
    finished: 'Đã học xong',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
};

const ManagerStudentsPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [summary, setSummary] = useState({ totalStudents: 0, activeStudents: 0, inactiveStudents: 0, reservedStudents: 0, finishedStudents: 0 });

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await managerApi.getStudents({ search, status: statusFilter });
      if (res.success) {
        setStudents(res.data.students || []);
        if (res.data.summary) setSummary(res.data.summary);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Không thể lấy danh sách học viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
      setSelectedIds([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(students.map(s => s._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const openClassModal = async () => {
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 học viên');
      return;
    }
    setIsClassModalOpen(true);
    try {
      const res = await managerApi.getClasses({ status: 'active' });
      if (res.success) {
        setClasses(res.data.classes || res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToClass = async () => {
    if (!selectedClassId) {
      alert('Vui lòng chọn lớp học');
      return;
    }
    setSubmitting(true);
    try {
      const res = await managerApi.addStudentToClass(selectedClassId, { studentIds: selectedIds });
      if (res.success) {
        alert(res.message || 'Đã thêm học viên vào lớp thành công');
        setIsClassModalOpen(false);
        setSelectedIds([]);
      } else {
        alert(res.message || 'Thêm thất bại');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Lỗi hệ thống');
    } finally {
      setSubmitting(false);
    }
  };

  const total = summary.totalStudents;
  const active = summary.activeStudents;
  const inactive = summary.inactiveStudents;
  const reserved = summary.reservedStudents;
  const finished = summary.finishedStudents;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Học viên</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý thông tin hồ sơ và kết quả học tập của học viên trung tâm.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={openClassModal} disabled={selectedIds.length === 0}>
            <Plus className="w-4 h-4 mr-2" /> Thêm vào Lớp ({selectedIds.length})
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Users size={48} /></div>
          <div className="text-sm font-medium text-slate-500 mb-1 relative z-10">Tổng số</div>
          <div className="text-3xl font-bold text-slate-800 relative z-10">{loading ? '-' : total}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-5 rounded-2xl border border-green-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><UserCheck size={48} className="text-green-600" /></div>
          <div className="text-sm font-medium text-green-600 mb-1 relative z-10">Đang học</div>
          <div className="text-3xl font-bold text-green-700 relative z-10">{loading ? '-' : active}</div>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-red-100 p-5 rounded-2xl border border-red-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><UserX size={48} className="text-red-600" /></div>
          <div className="text-sm font-medium text-red-600 mb-1 relative z-10">Dừng học</div>
          <div className="text-3xl font-bold text-red-700 relative z-10">{loading ? '-' : inactive}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 p-5 rounded-2xl border border-yellow-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><UserMinus size={48} className="text-yellow-600" /></div>
          <div className="text-sm font-medium text-yellow-600 mb-1 relative z-10">Bảo lưu</div>
          <div className="text-3xl font-bold text-yellow-700 relative z-10">{loading ? '-' : reserved}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-5 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><GraduationCap size={48} className="text-blue-600" /></div>
          <div className="text-sm font-medium text-blue-600 mb-1 relative z-10">Đã học xong</div>
          <div className="text-3xl font-bold text-blue-700 relative z-10">{loading ? '-' : finished}</div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
              />
            </div>
            <div className="w-full md:w-56">
              <select
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="active">Đang học</option>
                <option value="inactive">Dừng học</option>
                <option value="reserved">Bảo lưu</option>
                <option value="finished">Đã học xong</option>
              </select>
            </div>
          </form>
        </div>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Không tìm thấy học viên nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="p-4 w-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={students.length > 0 && selectedIds.length === students.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Học viên</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">SĐT Phụ huynh</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trường</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Khối Lớp</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedIds.includes(student._id)}
                        onChange={() => handleSelectOne(student._id)}
                      />
                    </td>
                    <td className="p-4 text-sm font-semibold text-slate-800">{student.userId?.name || 'N/A'}</td>
                    <td className="p-4 text-sm text-slate-600">{student.userId?.email || ''}</td>
                    <td className="p-4 text-sm text-slate-600">{student.parentPhone || ''}</td>
                    <td className="p-4 text-sm text-slate-600">{student.school || ''}</td>
                    <td className="p-4 text-sm text-slate-600">{student.grade ? `Khối ${student.grade}` : ''}</td>
                    <td className="p-4 text-sm"><Badge status={student.status || 'active'} /></td>
                    <td className="p-4 text-sm text-right space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/manager/students/${student._id}`)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/manager/students/edit/${student._id}`)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Bạn có chắc chắn muốn xóa học viên này? Thao tác không thể phục hồi!')) {
                            try {
                              const res = await managerApi.deleteStudent(student._id);
                              if (res.success) {
                                fetchStudents();
                              } else {
                                alert(res.message || 'Xóa thất bại');
                              }
                            } catch (err) {
                              alert('Lỗi khi xóa');
                            }
                          }
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        title="Xóa học viên"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Class Selection Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Thêm vào Lớp học</h3>
              <button 
                onClick={() => setIsClassModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Bạn đã chọn <strong>{selectedIds.length}</strong> học viên. Vui lòng chọn lớp học để thêm vào:
              </p>
              <div>
                <select 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                >
                  <option value="">-- Chọn lớp học --</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <Button variant="outline" onClick={() => setIsClassModalOpen(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleAddToClass} disabled={submitting || !selectedClassId}>
                {submitting ? 'Đang thêm...' : 'Xác nhận Thêm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default ManagerStudentsPage;
