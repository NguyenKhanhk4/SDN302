import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import { Eye, Users, PlusCircle, Pencil, Ban } from 'lucide-react';

const Badge = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-800',
    UPCOMING: 'bg-orange-100 text-orange-800',
    FINISHED: 'bg-slate-100 text-slate-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  const labels = {
    ACTIVE: 'Đang học',
    UPCOMING: 'Sắp khai giảng',
    FINISHED: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
};

const ManagerClassesPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await managerApi.getClasses({ search, status: statusFilter });
      if (res.success) {
        const list = res.data.classes || res.data || [];
        setClasses(list);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Không thể lấy danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClasses();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy/dừng hoạt động lớp học này không?')) return;
    try {
      const res = await managerApi.updateClass(id, { status: 'cancelled' });
      if (res.success) {
        alert('Hủy lớp học thành công');
        fetchClasses();
      } else {
        alert(res.message || 'Hủy thất bại');
      }
    } catch (err) {
      alert('Đã xảy ra lỗi khi hủy lớp');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Lớp học</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý các lớp học và phân công giáo viên giảng dạy.</p>
        </div>
        <button 
          onClick={() => navigate('/manager/classes/create')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20"
        >
          <PlusCircle size={18} />
          <span>Thêm Lớp học</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input 
                type="text"
                placeholder="Tìm kiếm theo tên lớp, phòng học..." 
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
                <option value="UPCOMING">Sắp khai giảng</option>
                <option value="ACTIVE">Đang học</option>
                <option value="FINISHED">Đã hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : classes.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Không tìm thấy lớp học nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tên lớp</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Môn học</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Phòng học</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Khai giảng</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Số lượng</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((cls) => (
                  <tr key={cls._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 text-sm font-semibold text-slate-800">{cls.name}</td>
                    <td className="p-4 text-sm text-slate-600">{cls.subjectId?.name || 'N/A'}</td>
                    <td className="p-4 text-sm text-slate-600">{cls.room || 'N/A'}</td>
                    <td className="p-4 text-sm text-slate-600">{cls.startDate ? new Date(cls.startDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td className="p-4 text-sm text-slate-600">
                      <span className="font-medium text-slate-800">{cls.currentStudents || 0}</span>
                      <span className="text-slate-400">/{cls.maxStudents}</span>
                    </td>
                    <td className="p-4 text-sm"><Badge status={cls.status} /></td>
                    <td className="p-4 text-sm text-right space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate(`/manager/classes/${cls._id}`)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => navigate(`/manager/classes/${cls._id}/students`)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        title="Học viên"
                      >
                        <Users size={16} />
                      </button>
                      {cls.status !== 'cancelled' && cls.status !== 'CANCELLED' && (
                        <>
                          <button 
                            onClick={() => navigate(`/manager/classes/edit/${cls._id}`)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                            title="Sửa"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cls._id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            title="Hủy lớp"
                          >
                            <Ban size={16} />
                          </button>
                        </>
                      )}
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

export default ManagerClassesPage;
