import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { motion } from 'framer-motion';
import { 
  BarChart3, Download, TrendingUp, PieChart as PieChartIcon, 
  DollarSign, Percent, Users 
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Line, ComposedChart, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts';
import Loading from '../../components/common/Loading';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const StatCard = ({ title, value, unit, icon, color, delay }) => {
  const colorClasses = {
    indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50', blur: 'bg-indigo-500/10' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', blur: 'bg-emerald-500/10' },
    blue: { text: 'text-blue-600', bg: 'bg-blue-50', blur: 'bg-blue-500/10' },
    violet: { text: 'text-violet-600', bg: 'bg-violet-50', blur: 'bg-violet-500/10' }
  };
  
  const c = colorClasses[color] || colorClasses.indigo;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${c.blur} rounded-full blur-3xl -mr-10 -mt-10`} />
      <div className="flex items-center justify-between relative z-10">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-2">{title}</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black ${c.text} tracking-tight`}>{value}</span>
            {unit && <span className="text-sm font-bold text-slate-400">{unit}</span>}
          </div>
        </div>
        <div className={`w-14 h-14 rounded-2xl ${c.bg} ${c.text} flex items-center justify-center shadow-inner`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const AdminReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [statistics, setStatistics] = useState({
    kpis: { totalRevenue: 0, totalExpense: 0, netProfit: 0, fillRate: 0, attendanceRate: 0 },
    revenueVsExpense: [],
    topSubjects: []
  });
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendsRes] = await Promise.all([
        adminApi.getAdvancedStatistics(),
        adminApi.getEnrollmentTrends()
      ]);

      if (statsRes.success) {
        setStatistics(statsRes.data);
      }
      
      if (trendsRes.success) {
        const formatted = trendsRes.data.map(item => ({
          name: `Th ${item.month}`,
          'Ghi danh mới': item.enrollments
        }));
        setTrendData(formatted);
      }
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu thống kê');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      toast.success('Xuất file Excel thành công!');
    } catch (err) {
      toast.error('Lỗi khi tải báo cáo');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  if (loading) return <Loading text="Đang phân tích dữ liệu..." />;

  const { kpis, revenueVsExpense, topSubjects } = statistics;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Thống Kê & Phân Tích
          </h1>
          <p className="text-sm text-slate-500 mt-1">Bảng điều khiển phân tích tài chính, tuyển sinh và đào tạo</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Lợi Nhuận Năm" 
          value={formatCurrency(kpis.netProfit)} 
          unit="đ" 
          icon={<DollarSign className="w-7 h-7" />} 
          color="indigo" 
          delay={0.1} 
        />
        <StatCard 
          title="Tổng Thu Hóa Đơn" 
          value={formatCurrency(kpis.totalRevenue)} 
          unit="đ" 
          icon={<TrendingUp className="w-7 h-7" />} 
          color="emerald" 
          delay={0.2} 
        />
        <StatCard 
          title="Tỷ lệ Tới Lớp" 
          value={kpis.attendanceRate} 
          unit="%" 
          icon={<Percent className="w-7 h-7" />} 
          color="blue" 
          delay={0.3} 
        />
        <StatCard 
          title="Tỷ lệ Lấp Đầy" 
          value={kpis.fillRate} 
          unit="%" 
          icon={<Users className="w-7 h-7" />} 
          color="violet" 
          delay={0.4} 
        />
      </div>

      {/* Analytics Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expense Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Phân tích Thu - Chi (Năm nay)</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueVsExpense} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  formatter={(value) => `${formatCurrency(value)} đ`}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="revenue" name="Tổng Thu" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="expense" name="Tổng Chi (Lương)" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Subjects Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-800">Top Môn Học Hot</h2>
          </div>
          <div className="h-[250px] w-full mt-4">
            {topSubjects.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topSubjects}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="students"
                  >
                    {topSubjects.map((entry, index) => (
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
        </motion.div>
      </div>

      {/* Analytics Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (Old) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Biểu Đồ Tăng Trưởng (Tuyển sinh)</h2>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="Ghi danh mới" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Export Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-500/20 flex flex-col justify-between text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
              <Download className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Trích Xuất Báo Cáo</h2>
            <p className="text-sm text-indigo-200 leading-relaxed mb-8">
              Tải xuống tệp Excel chi tiết về tình hình tài chính, doanh thu và chi phí lương của toàn bộ hệ thống trong năm nay.
            </p>
          </div>
          
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="relative z-10 w-full py-4 bg-white hover:bg-indigo-50 text-indigo-600 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {exporting ? (
              <span className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
            ) : (
              'Tải Báo Cáo Doanh Thu'
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
