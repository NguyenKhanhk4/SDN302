import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Loading from '../../components/common/Loading';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, FileText, User, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminEnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getEnrollments();
      if (res.success) {
        setEnrollments(res.data);
      }
    } catch (err) {
      toast.error('Không thể tải danh sách tuyển sinh');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setApproving(id);
      const res = await adminApi.approveEnrollment(id);
      if (res.success) {
        toast.success('Duyệt thành công!');
        fetchEnrollments();
      }
    } catch (err) {
      toast.error('Lỗi khi duyệt đăng ký');
    } finally {
      setApproving(null);
    }
  };

  if (loading) return <Loading text="Đang tải dữ liệu..." />;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 font-semibold text-xs border border-amber-200"><Clock className="w-3.5 h-3.5" /> Chờ duyệt</span>;
      case 'Approved':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold text-xs border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold text-xs border border-red-200"><XCircle className="w-3.5 h-3.5" /> Từ chối</span>;
      default:
        return status;
    }
  };

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
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{enroll.studentId?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{enroll.studentId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-slate-400" />
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
                    {enroll.status === 'Pending' && (
                      <button
                        onClick={() => handleApprove(enroll._id)}
                        disabled={approving === enroll._id}
                        className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                      >
                        {approving === enroll._id ? 'Đang duyệt...' : 'Duyệt'}
                      </button>
                    )}
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    Chưa có đăng ký tuyển sinh nào.
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
