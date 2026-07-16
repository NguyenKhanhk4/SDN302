import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import { BookOpen, Pencil, Ban } from 'lucide-react';

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

const ManagerSubjectsPage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await managerApi.getSubjects({ search, status: statusFilter });
      if (res.success) {
        const list = res.data.subjects || res.data || [];
        setSubjects(list.map(s => ({
          ...s,
          status: (s.status || 'active').toUpperCase(),
        })));
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Không thể lấy danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn dừng hoạt động môn học này không?')) return;
    try {
      const res = await managerApi.updateSubject(id, { status: 'inactive' });
      if (res.success) {
        alert('Dừng hoạt động môn học thành công');
        fetchSubjects();
      } else {
        alert(res.message || 'Dừng hoạt động thất bại');
      }
    } catch (err) {
      alert('Đã xảy ra lỗi khi dừng hoạt động');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Môn học</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách môn học và học phí của các khóa học.</p>
        </div>
        <button 
          onClick={() => navigate('/manager/subjects/create')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20"
        >
          <BookOpen size={18} />
          <span>Thêm Môn học</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input 
                type="text"
                placeholder="Tìm kiếm theo tên môn, mô tả..." 
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
                <option value="INACTIVE">Ngừng giảng dạy</option>
              </select>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Không tìm thấy môn học nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Môn học</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Khối lớp</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Học phí</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Mô tả chi tiết</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 text-sm font-semibold text-slate-800">{sub.name}</td>
                    <td className="p-4 text-sm text-slate-600">{sub.gradeLevel}</td>
                    <td className="p-4 text-sm text-slate-600">{sub.defaultTuitionFee?.toLocaleString()} VND</td>
                    <td className="p-4 text-sm"><Badge status={sub.status} /></td>
                    <td className="p-4 text-sm text-slate-600 truncate max-w-xs">{sub.description}</td>
                    <td className="p-4 text-sm text-right space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      {sub.status !== 'inactive' && sub.status !== 'INACTIVE' && (
                        <>
                          <button 
                            onClick={() => navigate(`/manager/subjects/edit/${sub._id}`)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                            title="Sửa"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(sub._id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            title="Dừng hoạt động"
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

export default ManagerSubjectsPage;
