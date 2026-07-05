import { useState, useEffect } from 'react';
import { studentApi } from '../../api/studentApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  Info,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileText
} from 'lucide-react';

const StudentInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab state: 'all', 'unpaid', 'history'
  const [activeTab, setActiveTab] = useState('all');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getInvoices();
      if (res.success) {
        setInvoices(res.data || []);
      } else {
        throw new Error(res.message || 'Không thể tải hóa đơn học phí');
      }
    } catch (err) {
      setError(err.message || err.error || 'Đã xảy ra lỗi khi tải danh sách hóa đơn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoices();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    try {
      const [year, month] = monthStr.split('-');
      return `Tháng ${month}/${year}`;
    } catch {
      return monthStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Đã thanh toán
          </span>
        );
      case 'UNPAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Chưa thanh toán
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Thanh toán một phần
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            <AlertCircle className="h-3 w-3 shrink-0" />
            Quá hạn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100">
            {status}
          </span>
        );
    }
  };

  // Calculations
  const getStats = () => {
    let totalUnpaidAmount = 0;
    let totalPaidAmount = 0;
    let nearestDueDate = null;

    invoices.forEach(inv => {
      totalPaidAmount += inv.paidAmount || 0;
      
      if (inv.status !== 'PAID') {
        const remaining = inv.amount - (inv.paidAmount || 0);
        totalUnpaidAmount += remaining > 0 ? remaining : 0;

        if (inv.dueDate) {
          const dDate = new Date(inv.dueDate);
          if (!nearestDueDate || dDate < nearestDueDate) {
            nearestDueDate = dDate;
          }
        }
      }
    });

    return { totalUnpaidAmount, totalPaidAmount, nearestDueDate };
  };

  const stats = getStats();

  // Filtered invoices
  const getFilteredInvoices = () => {
    switch (activeTab) {
      case 'unpaid':
        return invoices.filter(inv => inv.status !== 'PAID');
      case 'history':
        return invoices.filter(inv => inv.paidAmount > 0);
      default:
        return invoices;
    }
  };

  const filteredInvoices = getFilteredInvoices();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loading text="Đang tải thông tin học phí..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 max-w-xl mx-auto mt-10">
        <p className="font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> Lỗi tải dữ liệu
        </p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={fetchInvoices}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý học phí</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi hóa đơn học phí phát sinh, trạng thái đóng học phí và lịch sử giao dịch.</p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tất cả hóa đơn
          </button>
          <button
            onClick={() => setActiveTab('unpaid')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'unpaid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Chờ thanh toán
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lịch sử thanh toán
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-4 border-l-4 border-l-red-500 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 block font-semibold uppercase">Học phí cần đóng</span>
            <span className="text-xl font-bold text-red-600">{formatCurrency(stats.totalUnpaidAmount)}</span>
            <span className="text-[10px] text-gray-500 block">Tổng dư nợ học phí chưa hoàn thành</span>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-red-500">
            <CreditCard className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 block font-semibold uppercase">Học phí đã hoàn thành</span>
            <span className="text-xl font-bold text-emerald-600">{formatCurrency(stats.totalPaidAmount)}</span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> Đã ghi nhận thanh toán
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
            <DollarSign className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 block font-semibold uppercase">Hạn đóng gần nhất</span>
            <span className="text-xl font-bold text-gray-800">
              {stats.nearestDueDate ? formatDate(stats.nearestDueDate) : 'Không có hạn nợ'}
            </span>
            <span className="text-[10px] text-gray-500 block">Chú ý đóng học đúng thời hạn quy định</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
            <Calendar className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Main List Table */}
      <Card className="overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="py-16 text-center text-gray-400 space-y-3">
            <Info className="h-10 w-10 stroke-1 mx-auto text-gray-300" />
            <p className="text-sm font-medium">Không tìm thấy thông tin hóa đơn nào.</p>
            <p className="text-xs text-gray-400">Nếu bạn mới đăng ký môn học và chưa phát sinh hóa đơn, vui lòng liên hệ bộ phận hỗ trợ.</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-5 w-32">Tháng phát sinh</th>
                    <th className="py-3.5 px-4">Lớp học / Môn học</th>
                    <th className="py-3.5 px-4 w-36">Tổng học phí</th>
                    <th className="py-3.5 px-4 w-36">Đã đóng</th>
                    <th className="py-3.5 px-4 w-36">Còn thiếu</th>
                    <th className="py-3.5 px-4 w-36">Hạn thanh toán</th>
                    <th className="py-3.5 px-4 w-40 text-center">Trạng thái</th>
                    <th className="py-3.5 px-4 w-44">Cập nhật lúc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {filteredInvoices.map((inv) => {
                    const remaining = inv.amount - (inv.paidAmount || 0);
                    return (
                      <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-5 font-bold text-gray-900">{formatMonth(inv.month)}</td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-gray-800 block flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-gray-400" /> {inv.class?.name}
                          </span>
                          <span className="text-[11px] text-gray-400 block font-semibold pl-5.5 uppercase">{inv.class?.subjectName}</span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-gray-800">{formatCurrency(inv.amount)}</td>
                        <td className="py-4 px-4 font-semibold text-emerald-600">
                          {inv.paidAmount > 0 ? formatCurrency(inv.paidAmount) : '-'}
                        </td>
                        <td className="py-4 px-4 font-semibold text-red-500">
                          {remaining > 0 ? formatCurrency(remaining) : '-'}
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" /> {formatDate(inv.dueDate)}
                        </td>
                        <td className="py-4 px-4 text-center">{getStatusBadge(inv.status)}</td>
                        <td className="py-4 px-4 text-xs text-gray-400 font-semibold space-y-1">
                          {inv.paidAmount > 0 ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 className="h-3 w-3 shrink-0" /> Đã nộp học phí
                            </span>
                          ) : null}
                          <span className="block font-normal">{formatDate(inv.updatedAt)}</span>
                          {inv.note && <span className="block text-[10px] text-gray-500 bg-slate-50 p-1 rounded font-normal italic leading-snug">{inv.note}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredInvoices.map((inv) => {
                const remaining = inv.amount - (inv.paidAmount || 0);
                return (
                  <div key={inv._id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                          {formatMonth(inv.month)}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm mt-1">{inv.class?.name}</h4>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase block">{inv.class?.subjectName}</span>
                      </div>
                      {getStatusBadge(inv.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-center border-t border-b border-gray-100 py-2.5 my-2">
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase font-bold block">Học phí</span>
                        <span className="font-bold text-gray-800">{formatCurrency(inv.amount)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase font-bold block">Đã đóng</span>
                        <span className="font-bold text-emerald-600">
                          {inv.paidAmount > 0 ? formatCurrency(inv.paidAmount) : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase font-bold block">Còn thiếu</span>
                        <span className="font-bold text-red-500">
                          {remaining > 0 ? formatCurrency(remaining) : '-'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-y-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-blue-500 shrink-0" /> Hạn đóng: <strong>{formatDate(inv.dueDate)}</strong>
                      </span>
                      <span className="flex items-center gap-1.5 sm:text-right">
                        <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" /> Cập nhật: {formatDate(inv.updatedAt)}
                      </span>
                    </div>

                    {inv.note && (
                      <p className="text-[10px] text-gray-600 bg-slate-50 p-2.5 rounded-lg border border-gray-100 italic leading-relaxed">
                        Ghi chú: {inv.note}
                      </p>
                    )}

                    {inv.paidAmount > 0 && (
                      <div className="text-[10px] text-emerald-700 bg-emerald-50/50 p-2 rounded-xl flex items-center gap-1.5 border border-emerald-100">
                        <ArrowUpRight className="h-4.5 w-4.5 text-emerald-500 shrink-0" /> Lịch sử thanh toán: Giao dịch thành công
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentInvoicesPage;
