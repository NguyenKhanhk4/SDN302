import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Eye, Edit, Trash2, UserPlus } from 'lucide-react';

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

const ManagerParentsPage = () => {
  const navigate = useNavigate();
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchParents = async () => {
    try {
      setLoading(true);
      const res = await managerApi.getParents({ search, status: statusFilter });
      if (res.success) {
        // Chức năng của Manager: đọc data.parents từ backend thật
        const list = res.data.parents || res.data || [];
        // Map backend fields sang FE display
        setParents(list.map(p => ({
          ...p,
          fullName: p.userId?.name || p.fullName || '',
          email: p.userId?.email || p.email || '',
          phone: p.parentPhone || p.phone || '',
          childrenCount: p.childrenCount || 0,
          status: p.userId?.isActive === false ? 'INACTIVE' : (p.status?.toUpperCase() || 'ACTIVE'),
        })));
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Không thể lấy danh sách phụ huynh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchParents();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Phụ huynh</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý hồ sơ phụ huynh và mối quan hệ liên kết học viên.</p>
        </div>
        <button 
          onClick={() => navigate('/manager/parents/create')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20"
        >
          <UserPlus size={18} />
          <span>Thêm Phụ huynh</span>
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
        ) : parents.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Không tìm thấy phụ huynh nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Phụ huynh</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Vai trò</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Số con liên kết</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parents.map((parent) => (
                  <tr key={parent._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 text-sm font-semibold text-slate-800">{parent.fullName}</td>
                    <td className="p-4 text-sm text-slate-600">{parent.email}</td>
                    <td className="p-4 text-sm text-slate-600">{parent.phone}</td>
                    <td className="p-4 text-sm text-slate-600">
                      {parent.relationship === 'Father' ? 'Cha' : parent.relationship === 'Mother' ? 'Mẹ' : parent.relationship === 'Guardian' ? 'Người giám hộ' : parent.relationship || 'Người giám hộ'}
                    </td>
                    <td className="p-4 text-sm text-slate-600">{parent.childrenCount}</td>
                    <td className="p-4 text-sm"><Badge status={parent.status} /></td>
                    <td className="p-4 text-sm text-right space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate(`/manager/parents/${parent._id}`)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
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

export default ManagerParentsPage;
