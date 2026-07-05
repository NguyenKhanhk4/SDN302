import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Summary counts
  const [summary, setSummary] = useState({
    total: 0,
    teachers: 0,
    students: 0,
    parents: 0,
    managers: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    role: 'ALL',
    status: 'ALL'
  });

  // Fetch summary once
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await adminApi.getUsers({ role: 'ALL', status: 'ALL', search: '' });
        if (response.success) {
          const allUsers = response.data;
          setSummary({
            total: allUsers.length,
            teachers: allUsers.filter(u => u.role === 'TEACHER').length,
            students: allUsers.filter(u => u.role === 'STUDENT').length,
            parents: allUsers.filter(u => u.role === 'PARENT').length,
            managers: allUsers.filter(u => u.role === 'MANAGER').length
          });
        }
      } catch (err) {
        console.error('Failed to load summary counts', err);
      }
    };
    fetchSummary();
  }, []);

  // Fetch filtered users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getUsers(filters);
        if (response.success) {
          setUsers(response.data);
        } else {
          setError(response.message || 'Failed to fetch users');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading users');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchUsers();
    }, 150); // Small debounce for search input

    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'TEACHER': return 'bg-indigo-100 text-indigo-800';
      case 'STUDENT': return 'bg-emerald-100 text-emerald-800';
      case 'PARENT': return 'bg-amber-100 text-amber-800';
      case 'MANAGER': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role?.toUpperCase()) {
      case 'TEACHER': return 'Giảng viên';
      case 'STUDENT': return 'Học viên';
      case 'PARENT': return 'Phụ huynh';
      case 'MANAGER': return 'Quản lý';
      default: return role;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <Badge status="ACTIVE" />;
      case 'INACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Ngừng hoạt động</span>;
      case 'BANNED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Bị khóa</span>;
      default:
        return <Badge status={status} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản giảng viên, học viên, phụ huynh và quản lý.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/users/create')}
        >
          Thêm người dùng
        </Button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng số</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{summary.total}</span>
          </div>
        </Card>
        <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Giảng viên</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{summary.teachers}</span>
          </div>
        </Card>
        <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Học viên</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{summary.students}</span>
          </div>
        </Card>
        <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phụ huynh</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{summary.parents}</span>
          </div>
        </Card>
        <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quản lý</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{summary.managers}</span>
          </div>
        </Card>
      </div>

      {/* Filter and Table Card */}
      <Card>
        <div className="space-y-4">
          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
            <div>
              <label htmlFor="search" className="sr-only">Search</label>
              <input
                id="search"
                type="text"
                name="search"
                placeholder="Tìm theo tên, email, sđt..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="role" className="sr-only">Role</label>
              <select
                id="role"
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="TEACHER">Giảng viên</option>
                <option value="STUDENT">Học viên</option>
                <option value="PARENT">Phụ huynh</option>
                <option value="MANAGER">Quản lý</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="sr-only">Status</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
                <option value="BANNED">Bị khóa</option>
              </select>
            </div>
          </div>

          {/* Table / Loader / Empty State */}
          {loading ? (
            <Loading text="Đang tải danh sách..." />
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              title="Không tìm thấy người dùng"
              description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm kiếm."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Họ và tên</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Điện thoại</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vai trò</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{user.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                          className="text-primary hover:text-primary-hover font-semibold transition-colors"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
