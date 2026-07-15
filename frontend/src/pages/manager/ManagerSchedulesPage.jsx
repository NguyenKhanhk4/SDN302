import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import { CalendarPlus, Pencil, Trash2 } from 'lucide-react';

const Badge = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  const labels = {
    ACTIVE: 'Hoạt động',
    CANCELLED: 'Đã hủy',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
};
const getDayName = (dayOfWeek) => {
  if (dayOfWeek === undefined || dayOfWeek === null) return 'Không xác định';
  const days = {
    '0': 'Chủ Nhật',
    '1': 'Thứ Hai',
    '2': 'Thứ Ba',
    '3': 'Thứ Tư',
    '4': 'Thứ Năm',
    '5': 'Thứ Sáu',
    '6': 'Thứ Bảy'
  };
  return days[dayOfWeek.toString()] || 'Không xác định';
};

const ManagerSchedulesPage = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await managerApi.getSchedules({ search, status: statusFilter });
      if (res.success) {
        const list = res.data.schedules || res.data || [];
        setSchedules(list.map(s => ({
          ...s,
          className: s.classId?.name || '',
          teacherName: s.teacherId?.userId?.name || '',
          status: (s.status || 'active').toUpperCase(),
        })));
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Không thể lấy danh sách lịch học / lịch dạy');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch học này không?')) return;
    try {
      const res = await managerApi.deleteSchedule(id);
      if (res.success) {
        alert('Xóa lịch học thành công');
        fetchSchedules();
      } else {
        alert(res.message || 'Xóa thất bại');
      }
    } catch (err) {
      alert('Đã xảy ra lỗi khi xóa');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSchedules();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Lịch học / Lịch dạy</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý lịch học và lịch dạy của các lớp học.</p>
        </div>
        <button 
          onClick={() => navigate('/manager/schedules/create')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20"
        >
          <CalendarPlus size={18} />
          <span>Tạo Lịch học</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input 
                type="text"
                placeholder="Tìm kiếm theo phòng..." 
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
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Không tìm thấy lịch học nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Lớp học</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Giáo viên</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Thứ trong tuần</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Giờ bắt đầu</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Giờ kết thúc</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Phòng học</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((sch) => (
                  <tr key={sch._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 text-sm font-semibold text-slate-800">{sch.className}</td>
                    <td className="p-4 text-sm text-slate-600">{sch.teacherName}</td>
                    <td className="p-4 text-sm font-medium text-blue-600">{getDayName(sch.dayOfWeek)}</td>
                    <td className="p-4 text-sm text-slate-600">{sch.startTime}</td>
                    <td className="p-4 text-sm text-slate-600">{sch.endTime}</td>
                    <td className="p-4 text-sm text-slate-600">{sch.room}</td>
                    <td className="p-4 text-sm"><Badge status={sch.status} /></td>
                    <td className="p-4 text-sm text-right space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate(`/manager/schedules/edit/${sch._id}`)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                        title="Sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(sch._id)}
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

export default ManagerSchedulesPage;
