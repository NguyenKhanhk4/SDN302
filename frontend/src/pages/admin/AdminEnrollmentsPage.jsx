import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Loading from '../../components/common/Loading';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, FileText, User, BookOpen, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const AdminEnrollmentsPage = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    // Add debounce for search
    const timer = setTimeout(() => {
      fetchEnrollments();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterClass, filterDate, filterStatus]);

  const fetchClasses = async () => {
    try {
      const res = await adminApi.getClasses();
      if (res.success) {
        setClasses(res.data?.classes || res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterClass) params.classId = filterClass;
      if (filterDate) params.date = filterDate;
      if (filterStatus) params.status = filterStatus;

      const res = await adminApi.getEnrollments(params);
      if (res.success) {
        setEnrollments(res.data);
      }
    } catch (err) {
      toast.error('Không thể tải danh sách tuyển sinh');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setApproving(id);
      const res = await adminApi.updateEnrollmentStatus(id, status);
      if (res.success) {
        toast.success(`Đã cập nhật trạng thái thành ${status}`);
        fetchEnrollments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setApproving(null);
    }
  };

  const confirmUpdateStatus = (enroll, status) => {
    const actionName = status === 'APPROVED' ? 'duyệt' : 'từ chối';
    const studentName = enroll.studentId?.name || 'học viên này';
    
    if (window.confirm(`Bạn chắc chắn muốn ${actionName} học viên ${studentName}?`)) {
      handleUpdateStatus(enroll._id, status);
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'PENDING':
      case 'Pending':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 font-semibold text-xs border border-amber-200"><Clock className="w-3.5 h-3.5" /> Chờ duyệt</span>;
      case 'APPROVED':
      case 'Approved':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold text-xs border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt</span>;
      case 'CANCELLED':
      case 'REJECTED':
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold text-xs border border-red-200"><XCircle className="w-3.5 h-3.5" /> Từ chối</span>;
      default:
        return status;
    }
  };

  if (loading && enrollments.length === 0) return <Loading text="Đang tải dữ liệu..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            Quản Lý Tuyển Sinh
          </h1>
          <p className="text-sm text-slate-500 mt-1">Duyệt và quản lý yêu cầu đăng ký học của học viên</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên học viên..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          />
        </div>
        <div className="min-w-[160px]">
          <select 
            value={filterClass} 
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
          >
            <option value="">Tất cả khóa học</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <div className="min-w-[160px]">
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
          />
        </div>
        <div className="min-w-[160px]">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="CANCELLED">Từ chối</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold">Học viên</th>
                <th className="px-6 py-4 font-semibold">Khóa học đăng ký</th>
                <th className="px-6 py-4 font-semibold">Ngày đăng ký</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.length > 0 ? enrollments.map((enroll, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={enroll._id} 
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 p-2 rounded-xl transition-colors"
                      onClick={() => navigate(`/admin/users/${enroll.studentId?._id}`)}
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-indigo-600 hover:text-indigo-700">{enroll.studentId?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{enroll.studentId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div 
                      className="flex flex-col cursor-pointer hover:bg-slate-100 p-2 rounded-xl transition-colors"
                      onClick={() => navigate(`/admin/classes/${enroll.classId?._id}`)}
                    >
                      <span className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        {enroll.classId?.name || 'Class N/A'}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">
                        Môn: {enroll.classId?.subjectId?.name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(enroll.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(enroll.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {approving === enroll._id && <span className="text-xs text-slate-400">Đang lưu...</span>}
                      {(!enroll.status || enroll.status.toUpperCase() === 'PENDING') && (
                        <>
                          <button
                            onClick={() => confirmUpdateStatus(enroll, 'APPROVED')}
                            disabled={approving === enroll._id}
                            className="inline-flex items-center justify-center px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => confirmUpdateStatus(enroll, 'CANCELLED')}
                            disabled={approving === enroll._id}
                            className="inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      {enroll.status?.toUpperCase() === 'APPROVED' && (
                        <button
                          onClick={() => confirmUpdateStatus(enroll, 'CANCELLED')}
                          disabled={approving === enroll._id}
                          className="inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                      )}
                      {(enroll.status?.toUpperCase() === 'CANCELLED' || enroll.status?.toUpperCase() === 'REJECTED') && (
                        <button
                          onClick={() => confirmUpdateStatus(enroll, 'APPROVED')}
                          disabled={approving === enroll._id}
                          className="inline-flex items-center justify-center px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                        >
                          Duyệt
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    {loading ? 'Đang tải dữ liệu...' : 'Chưa có đăng ký tuyển sinh nào phù hợp.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEnrollmentsPage;
