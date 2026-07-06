import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import { Receipt, CheckCircle, Wallet, AlertCircle, FilePlus, Check, Pencil, Trash2 } from 'lucide-react';

const Badge = ({ status }) => {
  const styles = {
    PAID: 'bg-green-100 text-green-800',
    UNPAID: 'bg-red-100 text-red-800',
    PARTIAL: 'bg-orange-100 text-orange-800',
    OVERDUE: 'bg-gray-800 text-white',
  };
  const labels = {
    PAID: 'Đã thanh toán',
    UNPAID: 'Chưa thanh toán',
    PARTIAL: 'Thanh toán một phần',
    OVERDUE: 'Quá hạn',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
};

const ManagerInvoicesPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalInvoices: 0, unpaidInvoices: 0, paidInvoices: 0, monthlyRevenue: 0 });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await managerApi.getInvoices({ search, status: statusFilter });
      if (res.success) {
        const list = res.data.invoices || res.data || [];
        setInvoices(list.map(inv => ({
          ...inv,
          studentName: inv.studentId?.userId?.name || '',
          className: inv.classId?.name || '',
          dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
          status: (inv.status || 'unpaid').toUpperCase()
        })));
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Không thể lấy danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này không?')) return;
    try {
      const res = await managerApi.deleteInvoice(id);
      if (res.success) {
        alert('Xóa hóa đơn thành công');
        fetchInvoices();
      } else {
        alert(res.message || 'Xóa thất bại');
      }
    } catch (err) {
      alert('Đã xảy ra lỗi khi xóa');
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xác nhận hóa đơn này đã được thanh toán?')) return;
    try {
      const invoice = invoices.find(inv => inv._id === invoiceId);
      if (!invoice) return;
      const res = await managerApi.markInvoicePaid(invoiceId, { paidAmount: invoice.amount });
      if (res.success) {
        fetchInvoices();
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert('Lỗi khi đánh dấu hóa đơn đã thanh toán');
    }
  };

  const totalInvoices = summary.totalInvoices || 0;
  const unpaid = summary.unpaidInvoices || 0;
  const paid = summary.paidInvoices || 0;
  const revenue = summary.monthlyRevenue || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Hóa đơn</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý học phí và hóa đơn của học viên.</p>
        </div>
        <button 
          onClick={() => navigate('/manager/invoices/create')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20"
        >
          <FilePlus size={18} />
          <span>Tạo Hóa đơn</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 p-4 opacity-10 text-slate-500"><Receipt size={64} /></div>
          <div className="text-sm font-medium text-slate-500 mb-1 relative z-10">Tổng số hóa đơn</div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-700 relative z-10">{loading ? '-' : totalInvoices}</div>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-red-100 p-5 rounded-2xl border border-red-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 p-4 opacity-10 text-red-600"><AlertCircle size={64} /></div>
          <div className="text-sm font-medium text-slate-500 mb-1 relative z-10">Chưa thanh toán / Quá hạn</div>
          <div className="text-3xl font-extrabold tracking-tight text-red-700 relative z-10">{loading ? '-' : unpaid}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-5 rounded-2xl border border-green-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 p-4 opacity-10 text-green-600"><CheckCircle size={64} /></div>
          <div className="text-sm font-medium text-slate-500 mb-1 relative z-10">Đã thanh toán</div>
          <div className="text-3xl font-extrabold tracking-tight text-green-700 relative z-10">{loading ? '-' : paid}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-5 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 p-4 opacity-10 text-blue-600"><Wallet size={64} /></div>
          <div className="text-sm font-medium text-slate-500 mb-1 relative z-10">Doanh thu thực tế (VND)</div>
          <div className="text-3xl font-extrabold tracking-tight text-blue-700 relative z-10">{loading ? '-' : revenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input 
                type="text"
                placeholder="Tìm kiếm theo tháng (YYYY-MM)..." 
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
                <option value="UNPAID">Chưa thanh toán</option>
                <option value="PAID">Đã thanh toán</option>
                <option value="PARTIAL">Thanh toán một phần</option>
                <option value="OVERDUE">Quá hạn</option>
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
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Không tìm thấy hóa đơn nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Học viên</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Lớp học</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tháng</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Số tiền (VND)</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Hạn thanh toán</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 text-sm font-semibold text-slate-800">{inv.studentName}</td>
                    <td className="p-4 text-sm text-slate-600">{inv.className}</td>
                    <td className="p-4 text-sm font-medium text-indigo-600"><span className="bg-indigo-50 px-2 py-1 rounded-md">{inv.month}</span></td>
                    <td className="p-4 text-sm font-bold text-slate-700">{inv.amount?.toLocaleString()}</td>
                    <td className="p-4 text-sm text-slate-600">{inv.dueDate}</td>
                    <td className="p-4 text-sm"><Badge status={inv.status} /></td>
                    <td className="p-4 text-sm text-right space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity flex justify-end">
                      {inv.status !== 'PAID' && (
                        <button 
                          onClick={() => handleMarkPaid(inv._id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          title="Xác nhận thanh toán"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => navigate(`/manager/invoices/edit/${inv._id}`)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                        title="Sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(inv._id)}
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

export default ManagerInvoicesPage;
