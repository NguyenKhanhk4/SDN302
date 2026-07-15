import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../api/adminApi';
import Loading from '../../components/common/Loading';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, CreditCard, Receipt, FileSignature, CheckCircle2, X, Search, Filter, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'CREDIT_CARD', label: 'Thẻ tín dụng' },
  { value: 'OTHER', label: 'Khác' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'UNPAID', label: 'Chưa thanh toán' },
  { value: 'PARTIAL', label: 'Đã cọc' },
  { value: 'PAID', label: 'Đã thu đủ' },
  { value: 'OVERDUE', label: 'Quá hạn' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const AdminFinancePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices'); // invoices | payrolls

  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Payment modal state
  const [payModal, setPayModal] = useState(null); // null or invoice object
  const [payForm, setPayForm] = useState({
    amountPaid: 0,
    paymentMethod: 'BANK_TRANSFER',
    transactionId: '',
    notes: ''
  });
  const [paying, setPaying] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'invoices') {
        const res = await adminApi.getInvoices();
        if (res.success) setInvoices(res.data);
      } else {
        const res = await adminApi.getPayrolls();
        if (res.success) setPayrolls(res.data);
      }
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu tài chính');
    } finally {
      setLoading(false);
    }
  };

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    let result = invoices;
    if (filterStatus) {
      result = result.filter(inv => inv.status === filterStatus);
    }
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(inv =>
        (inv.studentId?.name || '').toLowerCase().includes(keyword) ||
        (inv.studentId?.email || '').toLowerCase().includes(keyword)
      );
    }
    return result;
  }, [invoices, filterStatus, searchText]);

  // Open payment modal
  const openPayModal = (invoice) => {
    setPayModal(invoice);
    setPayForm({
      amountPaid: invoice.totalAmount || invoice.amount || 0,
      paymentMethod: 'BANK_TRANSFER',
      transactionId: '',
      notes: ''
    });
  };

  const handlePayInvoice = async () => {
    if (!payModal) return;
    if (payForm.amountPaid <= 0) {
      toast.error('Số tiền phải lớn hơn 0');
      return;
    }

    try {
      setPaying(true);
      const res = await adminApi.payInvoice(payModal._id, {
        amountPaid: payForm.amountPaid,
        paymentMethod: payForm.paymentMethod,
        transactionId: payForm.transactionId || undefined,
        notes: payForm.notes || undefined
      });
      if (res.success) {
        toast.success('Thanh toán hóa đơn thành công!');
        setPayModal(null);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi thanh toán');
    } finally {
      setPaying(false);
    }
  };

  const handleCalculateAllPayrolls = async () => {
    try {
      setLoading(true);
      const res = await adminApi.calculateAllPayrolls();
      if (res.success) {
        toast.success(res.message || 'Chốt lương tháng này thành công!');
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi chốt lương');
      setLoading(false);
    }
  };

  if (loading && invoices.length === 0 && payrolls.length === 0) return <Loading text="Đang tải dữ liệu..." />;
  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'UNPAID':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold text-xs border border-red-200">Chưa thanh toán</span>;
      case 'PARTIAL':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 font-semibold text-xs border border-amber-200">Đã cọc</span>;
      case 'PAID':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold text-xs border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Đã thu đủ</span>;
      case 'OVERDUE':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-semibold text-xs border border-orange-200">Quá hạn</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-semibold text-xs border border-slate-200"><Ban className="w-3.5 h-3.5" /> Đã hủy</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-semibold text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Banknote className="w-6 h-6 text-indigo-500" />
            Quản Lý Tài Chính
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý hóa đơn thu học phí và lương giảng viên</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-2xl w-max">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'invoices' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            Hóa Đơn Thu
          </button>
          <button
            onClick={() => setActiveTab('payrolls')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'payrolls' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            Bảng Lương
          </button>
        </div>

        {activeTab === 'payrolls' && (
          <button
            onClick={handleCalculateAllPayrolls}
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-sm font-bold rounded-xl shadow-sm transition-all border border-indigo-100 hover:border-transparent disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Chốt lương tự động'}
          </button>
        )}
      </div>

      {/* Filters for invoices */}
      {activeTab === 'invoices' && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên học viên..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <div className="min-w-[160px]">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">Mã HĐ / Học viên</th>
                  <th className="px-6 py-4 font-semibold">Lớp học</th>
                  <th className="px-6 py-4 font-semibold">Hạn thanh toán</th>
                  <th className="px-6 py-4 font-semibold">Tổng tiền</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length > 0 ? filteredInvoices.map((inv, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={inv._id}
                    className="hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">#{inv._id.substring(18).toUpperCase()}</p>
                          <p className="text-xs text-slate-500">{inv.studentId?.name || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">{inv.classId?.name || '—'}</p>
                      <p className="text-xs text-slate-400">{inv.classId?.subjectId?.name || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-indigo-600">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(inv.status)}
                    </td>
                  </motion.tr>
                )) : (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    {loading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu phù hợp.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payrolls' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">Giảng viên</th>
                  <th className="px-6 py-4 font-semibold">Kỳ lương</th>
                  <th className="px-6 py-4 font-semibold">Số ca dạy</th>
                  <th className="px-6 py-4 font-semibold">Tổng lương</th>
                  <th className="px-6 py-4 font-semibold text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrolls.length > 0 ? payrolls.map((pr, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={pr._id}
                    className="hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
                          <FileSignature className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{pr.teacherId?.userId?.name || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      Tháng {pr.month}/{pr.year}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                      {pr.totalSessions} ca
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-600">
                      {formatCurrency(pr.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {pr.status === 'DRAFT' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs">Bản Nháp</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold text-xs border border-emerald-200">Đã chốt</span>
                      )}
                    </td>
                  </motion.tr>
                )) : (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Chưa có dữ liệu.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {payModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !paying && setPayModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Thu Tiền Hóa Đơn</h2>
                  <p className="text-xs text-slate-500 mt-0.5">#{payModal._id.substring(18).toUpperCase()} — {payModal.studentId?.name || 'Unknown'}</p>
                </div>
                <button
                  onClick={() => !paying && setPayModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Info */}
              <div className="px-6 pt-4 pb-2">
                <div className="flex items-center justify-between bg-indigo-50 rounded-2xl p-4">
                  <div>
                    <p className="text-xs text-indigo-400 font-medium">Tổng hóa đơn</p>
                    <p className="text-xl font-black text-indigo-600">{formatCurrency(payModal.totalAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-indigo-400 font-medium">Trạng thái</p>
                    {getStatusBadge(payModal.status)}
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số tiền thu <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    max={payModal.totalAmount}
                    value={payForm.amountPaid}
                    onChange={(e) => setPayForm(prev => ({ ...prev, amountPaid: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phương thức thanh toán</label>
                  <select
                    value={payForm.paymentMethod}
                    onChange={(e) => setPayForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mã giao dịch <span className="text-slate-400 font-normal">(không bắt buộc)</span></label>
                  <input
                    type="text"
                    placeholder="Ví dụ: TXN-2026-001"
                    value={payForm.transactionId}
                    onChange={(e) => setPayForm(prev => ({ ...prev, transactionId: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ghi chú <span className="text-slate-400 font-normal">(không bắt buộc)</span></label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú thêm..."
                    value={payForm.notes}
                    onChange={(e) => setPayForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => !paying && setPayModal(null)}
                  disabled={paying}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handlePayInvoice}
                  disabled={paying || payForm.amountPaid <= 0}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paying ? 'Đang xử lý...' : `Xác nhận thu ${formatCurrency(payForm.amountPaid)}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminFinancePage;
