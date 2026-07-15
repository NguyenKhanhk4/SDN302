import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
  ComposedChart, Area, AreaChart
} from 'recharts';
import { 
  Calendar, Download, TrendingUp, TrendingDown, Users, BookOpen, 
  DollarSign, FileText, Printer, Search, Percent
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { adminApi } from '../../api/adminApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const COLORS = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#14b8a6'];

const MetricCard = ({ title, value, subtext, icon: Icon, trend, isCurrency, isPercentage }) => (
  <Card className="p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">
          {isCurrency 
            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
            : isPercentage
              ? `${value}%`
              : new Intl.NumberFormat('vi-VN').format(value)}
        </h3>
        {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl ${trend > 0 ? 'bg-emerald-100 text-emerald-600' : trend < 0 ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    {trend !== undefined && (
      <div className="mt-4 flex items-center text-sm">
        {trend >= 0 ? (
          <><TrendingUp className="w-4 h-4 text-emerald-500 mr-1" /><span className="text-emerald-500 font-medium">+{trend}%</span></>
        ) : (
          <><TrendingDown className="w-4 h-4 text-rose-500 mr-1" /><span className="text-rose-500 font-medium">{trend}%</span></>
        )}
        <span className="text-slate-400 ml-2">so với kỳ trước</span>
      </div>
    )}
  </Card>
);

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState(null);
  const [advancedData, setAdvancedData] = useState({
    kpis: { netProfit: 0, fillRate: 0, attendanceRate: 0 },
    revenueVsExpense: [],
    topSubjects: []
  });
  const [trendData, setTrendData] = useState([]);
  const [error, setError] = useState(null);
  
  // Filters
  const [dateRange, setDateRange] = useState('this_year');
  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let startDate, endDate;
      const today = new Date();
      const currentYear = today.getFullYear();
      
      if (dateRange === 'this_month') {
        startDate = startOfMonth(today).toISOString();
        endDate = endOfMonth(today).toISOString();
      } else if (dateRange === 'last_month') {
        const lastMonth = subMonths(today, 1);
        startDate = startOfMonth(lastMonth).toISOString();
        endDate = endOfMonth(lastMonth).toISOString();
      } else if (dateRange === 'this_year') {
        startDate = new Date(currentYear, 0, 1).toISOString();
        endDate = new Date(currentYear, 11, 31).toISOString();
      }
      
      const [res, statsRes, trendsRes] = await Promise.all([
        adminApi.getAnalytics({ startDate, endDate }),
        adminApi.getAdvancedStatistics(currentYear),
        adminApi.getEnrollmentTrends(currentYear)
      ]);

      if (res.success) {
        setData(res.data);
      } else {
        throw new Error(res.message);
      }

      if (statsRes.success) {
        setAdvancedData(statsRes.data);
      }
      
      if (trendsRes.success) {
        const formatted = trendsRes.data.map(item => ({
          name: `Th ${item.month}`,
          'Ghi danh mới': item.enrollments
        }));
        setTrendData(formatted);
      }
      
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Export to Excel - Tải báo cáo Tài chính tổng hợp
  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await adminApi.exportRevenueReport();
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bao_cao_tai_chinh_${new Date().getFullYear()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Xuất báo cáo tài chính thành công!');
    } catch (err) {
      toast.error('Lỗi khi tải báo cáo');
    } finally {
      setExporting(false);
    }
  };


  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <Loading text="Đang đồng bộ dữ liệu siêu thống kê..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200">
          <p className="font-bold">Lỗi:</p>
          <p>{error}</p>
          <button onClick={fetchData} className="mt-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="h-24 md:h-20 w-full"></div>

      {/* FIXED Header & Control Bar */}
      <div className="fixed top-16 md:top-16 left-0 md:left-64 right-0 z-[9999] pointer-events-none p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="px-6 pointer-events-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/90 backdrop-blur-xl p-4 md:px-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 transition-all">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                  Thống kê & Phân tích All-in-One
                </h1>
                <p className="text-sm text-slate-500 mt-1">Cập nhật lúc: {format(new Date(), 'HH:mm dd/MM/yyyy')}</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-slate-100 border-none text-sm font-medium text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="this_month">Tháng này</option>
              <option value="last_month">Tháng trước</option>
              <option value="this_year">Năm nay</option>
              <option value="all_time">Tất cả</option>
            </select>
            <Calendar className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
          </div>
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 disabled:opacity-70"
          >
            {exporting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Xuất Báo Cáo KQKD
          </button>
          <button 
            onClick={() => window.print()}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors hidden md:block"
          >
            <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Metrics Zone - 6 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard 
          title="Lợi Nhuận Thuần" 
          value={advancedData.kpis.netProfit || 0} 
          isCurrency 
          icon={DollarSign} 
        />
        <MetricCard 
          title="Tổng Doanh Thu" 
          value={data?.metrics?.totalRevenue || 0} 
          isCurrency 
          icon={TrendingUp} 
          trend={12} 
        />
        <MetricCard 
          title="Nợ Tồn Đọng (Unpaid)" 
          value={data?.metrics?.totalUnpaid || 0} 
          isCurrency 
          icon={FileText} 
        />
        <MetricCard 
          title="Tỷ lệ Tới Lớp" 
          value={advancedData.kpis.attendanceRate || 0} 
          isPercentage
          icon={Percent} 
        />
        <MetricCard 
          title="Tỷ lệ Lấp Đầy Lớp" 
          value={advancedData.kpis.fillRate || 0} 
          isPercentage
          icon={BookOpen} 
        />
        <MetricCard 
          title="Học viên mới" 
          value={data?.metrics?.newStudents || 0} 
          icon={Users} 
          trend={5} 
        />
      </div>

      {/* Charts Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue vs Expense Chart (Main) */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Phân tích Thu - Chi (Năm nay)</h3>
          <div className="h-80">
            {advancedData.revenueVsExpense?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={advancedData.revenueVsExpense} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    formatter={(value) => `${new Intl.NumberFormat('vi-VN').format(value)} đ`}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="revenue" name="Tổng Thu" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="expense" name="Tổng Chi" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Không có dữ liệu thu chi</div>
            )}
          </div>
        </Card>

        {/* Top Subjects Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Môn Học Hot Nhất</h3>
          <div className="h-64">
            {advancedData.topSubjects?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={advancedData.topSubjects}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="students"
                  >
                    {advancedData.topSubjects.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`${value} Học viên`, 'Sĩ số']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu học viên</div>
            )}
          </div>
        </Card>

        {/* Enrollment Trend Chart */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Biểu đồ Tăng trưởng Tuyển sinh</h3>
          <div className="h-80">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="Ghi danh mới" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Không có dữ liệu tuyển sinh</div>
            )}
          </div>
        </Card>
        
        {/* Role Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Tỷ lệ Tài khoản</h3>
          <div className="h-64 mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.roleDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.roleDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
