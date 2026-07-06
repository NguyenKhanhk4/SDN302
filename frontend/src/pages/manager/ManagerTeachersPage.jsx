import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import { Eye, Pencil, Trash2, Plus } from 'lucide-react';

const Badge = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-red-100 text-red-800',
  };
  const labels = {
    ACTIVE: 'Hoạt động',
    INACTIVE: 'Không hoạt động',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
};

const ManagerTeachersPage = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await managerApi.getTeachers({ search, status: statusFilter });
      if (res.success) {
        const list = res.data.teachers || res.data || [];
        setTeachers(list.map(t => ({
          ...t,
          fullName: t.userId?.name || '',
          email: t.userId?.email || '',
          phone: t.phoneNumber || '',
          subjects: t.specialization || [],
          experienceYears: t.experienceYears || 0,
          status: t.userId?.isActive === false ? 'INACTIVE' : 'ACTIVE',
        })));
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Không thể lấy danh sách giáo viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTeachers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giáo viên này không?')) return;
    try {
      const res = await managerApi.deleteTeacher(id);
      if (res.success) {
        alert('Xóa giáo viên thành công');
        fetchTeachers();
      } else {
        alert(res.message || 'Xóa thất bại');
      }
    } catch (err) {
      alert('Đã xảy ra lỗi khi xóa');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Giáo viên</h1>
          <p className="text-sm text-slate-500 mt-1">Xem thông tin hồ sơ và phân công giảng dạy của giáo viên.</p>
        </div>
        <button 
          onClick={() => navigate('/manager/teachers/create')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20"
        >
          <Plus size={18} />
          <span>Thêm Giáo viên</span>
        </button>
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
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
              </select>
            </div>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Không tìm thấy giáo viên nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Giáo viên</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Chuyên môn</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kinh nghiệm</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 text-sm font-semibold text-slate-800">{teacher.fullName}</td>
                    <td className="p-4 text-sm text-slate-600">{teacher.email}</td>
                    <td className="p-4 text-sm text-slate-600">{teacher.phone}</td>
                    <td className="p-4 text-sm text-slate-600">{teacher.subjects.join(', ')}</td>
                    <td className="p-4 text-sm text-slate-600">{teacher.experienceYears} năm</td>
                    <td className="p-4 text-sm"><Badge status={teacher.status} /></td>
                    <td className="p-4 text-sm text-right space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate(`/manager/teachers/${teacher._id}`)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => navigate(`/manager/teachers/edit/${teacher._id}`)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                        title="Sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(teacher._id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Xóa"
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
    </div>
  );
};

export default ManagerTeachersPage;
