import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Loading from '../../components/common/Loading';
import { motion } from 'framer-motion';
import { 
  Users, GraduationCap, Calendar, Banknote, 
  TrendingUp, Download, CheckCircle2, FileText, BarChart3
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, unit, icon, color, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl -mr-10 -mt-10`} />
      <div className="flex items-center justify-between relative z-10">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-2">{title}</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-black text-${color}-600 tracking-tight`}>{value}</span>
            {unit && <span className="text-sm font-bold text-slate-400">{unit}</span>}
          </div>
        </div>
        <div className={`w-14 h-14 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center shadow-inner`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // We will fetch dashboard stats and trend data in parallel
        const [statsRes, trendsRes] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getEnrollmentTrends()
        ]);
        
        if (statsRes.success) setStats(statsRes.data);
        if (trendsRes.success) {
          // Map to short month names for the chart
          const formatted = trendsRes.data.map(item => ({
            name: `Th ${item.month}`,
            'Ghi danh': item.enrollments
          }));
          setTrendData(formatted);
        }
      } catch (err) {
        toast.error('Lỗi khi tải dữ liệu trang tổng quan');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExportRevenue = async () => {
    try {
      setExporting(true);
      const res = await adminApi.exportRevenueReport();
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `revenue_report_${new Date().getFullYear()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Xuất báo cáo doanh thu thành công!');
    } catch (err) {
      toast.error('Lỗi khi xuất báo cáo');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <Loading text="Đang tải dữ liệu..." />;
  }

  const userStats = stats?.users || { students: 0, activeStudents: 0, teachers: 0 };
  const classStats = stats?.classes || { totalClasses: 0, activeClasses: 0 };
  const financeStats = stats?.finance || { monthlyRevenue: 0 };
  const formattedRevenue = new Intl.NumberFormat('vi-VN').format(financeStats.monthlyRevenue);

  return (
    <div className="space-y-8 pb-10">
      
      {/* Top Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 md:p-12 shadow-2xl shadow-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] -mr-40 -mt-40 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-bold text-white tracking-wider uppercase">Hệ thống ổn định</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Chào mừng trở lại, <br/><span className="text-indigo-200">Quản trị viên</span>
          </h1>
          <p className="mt-4 text-indigo-100 max-w-lg font-medium">
            Tất cả số liệu, học viên, lịch học và tài chính của trung tâm đều được cập nhật theo thời gian thực (Real-time).
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-white text-center shadow-lg">
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">DOANH THU THÁNG NÀY</p>
            <div className="text-3xl font-black">{formattedRevenue} đ</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Học Viên" 
          value={userStats.students} 
          icon={<Users className="w-7 h-7" />} 
          color="blue" 
          delay={0.1} 
        />
        <StatCard 
          title="Lớp Đang Mở" 
          value={classStats.activeClasses} 
          icon={<GraduationCap className="w-7 h-7" />} 
          color="emerald" 
          delay={0.2} 
        />
        <StatCard 
          title="Giáo Viên" 
          value={userStats.teachers} 
          icon={<FileText className="w-7 h-7" />} 
          color="violet" 
          delay={0.3} 
        />
        <StatCard 
          title="Lượt Ghi Danh (Tháng)" 
          value={trendData.length > 0 ? trendData[trendData.length - 1]['Ghi danh'] : 0} 
          icon={<TrendingUp className="w-7 h-7" />} 
          color="amber" 
          delay={0.4} 
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Xu Hướng Ghi Danh
              </h2>
              <p className="text-sm text-slate-500 mt-1">Số lượng học viên đăng ký mới trong năm nay</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area type="monotone" dataKey="Ghi danh" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorEnroll)" activeDot={{ r: 6, fill: '#4F46E5', stroke: '#fff', strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Action Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none" />
          
          <div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Download className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Báo Cáo Nhanh</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Xuất tệp Excel tổng hợp doanh thu theo từng tháng để phục vụ công tác kế toán và kiểm toán.
            </p>
          </div>

          <button 
            onClick={handleExportRevenue}
            disabled={exporting}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {exporting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Xuất Excel Doanh Thu
              </>
            )}
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
