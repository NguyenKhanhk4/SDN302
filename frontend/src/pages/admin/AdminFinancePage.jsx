import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Loading from '../../components/common/Loading';
import { motion } from 'framer-motion';
import { Banknote, CreditCard, Receipt, FileSignature, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminFinancePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices'); // invoices | payrolls
  
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

  const handlePayInvoice = async (id) => {
    try {
      // For demo, pay fully
      const invoice = invoices.find(i => i._id === id);
      if (!invoice) return;
      
      const res = await adminApi.payInvoice(id, {
        amountPaid: invoice.totalAmount,
        paymentMethod: 'TRANSFER',
        notes: 'Đã thanh toán nhanh'
      });
      if (res.success) {
        toast.success('Thanh toán hóa đơn thành công!');
        fetchData();
      }
    } catch (err) {
      toast.error('Lỗi khi thanh toán');
    }
  };

  if (loading && invoices.length === 0 && payrolls.length === 0) return <Loading text="Đang tải dữ liệu..." />;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Banknote className="w-6 h-6 text-indigo-500" />
            Tài Chính & Kế Toán
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý hóa đơn thu học phí và lương giảng viên</p>
        </div>
      </div>

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

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">Mã HĐ / Học viên</th>
                  <th className="px-6 py-4 font-semibold">Hạn thanh toán</th>
                  <th className="px-6 py-4 font-semibold">Tổng tiền</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.length > 0 ? invoices.map((inv, idx) => (
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
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {new Date(inv.dueDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-indigo-600">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      {inv.status === 'UNPAID' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold text-xs border border-red-200">Chưa thanh toán</span>
                      ) : inv.status === 'PARTIAL' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 font-semibold text-xs border border-amber-200">Đã cọc</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold text-xs border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Đã thu đủ</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status !== 'PAID' && (
                        <button
                          onClick={() => handlePayInvoice(inv._id)}
                          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                        >
                          Thu Tiền
                        </button>
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
                          <p className="text-sm font-bold text-slate-800">{pr.teacherId?.name || 'Unknown'}</p>
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
    </div>
  );
};

export default AdminFinancePage;
