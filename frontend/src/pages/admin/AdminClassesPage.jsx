import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const AdminClassesPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL'
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getClasses(filters);
        if (response.success) {
          setClasses(response.data);
        } else {
          setError(response.message || 'Tải danh sách lớp học thất bại');
        }
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi khi tải danh sách lớp học');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchClasses();
    }, 150);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Lớp học</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý tất cả các lớp học tại trung tâm gia sư.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/classes/create')}
        >
          Tạo Lớp học
        </Button>
      </div>

      {/* Filter and Table Card */}
      <Card>
        <div className="space-y-4">
          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
            <div>
              <label htmlFor="search" className="sr-only">Tìm kiếm</label>
              <input
                id="search"
                type="text"
                name="search"
                placeholder="Tìm kiếm theo tên lớp, môn học, giáo viên..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="status" className="sr-only">Trạng thái</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="UPCOMING">Sắp diễn ra</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="FINISHED">Đã kết thúc</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Table / Loader / Empty State */}
          {loading ? (
            <Loading text="Đang tải danh sách lớp học..." />
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          ) : classes.length === 0 ? (
            <EmptyState
              title="Không tìm thấy lớp học nào"
              description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy lớp học bạn mong muốn."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên lớp</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Môn học</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giáo viên</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phòng học</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Học viên</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classes.map((cls) => (
                    <tr key={cls._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{cls.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.teacher}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.room}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {cls.currentStudents} / {cls.maxStudents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge status={cls.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => navigate(`/admin/classes/${cls._id}`)}
                          className="text-primary hover:text-primary-hover font-semibold transition-colors"
                        >
                          Chi tiết
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => navigate(`/admin/classes/${cls._id}/students`)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                        >
                          Học viên
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

export default AdminClassesPage;
