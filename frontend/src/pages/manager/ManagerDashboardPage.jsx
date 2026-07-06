import React, { useState, useEffect } from 'react';
import { managerApi } from '../../api/managerApi';
import { 
  Users, 
  UserCheck, 
  UserX, 
  GraduationCap, 
  BookOpen, 
  CircleDot, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Wallet, 
  Receipt, 
  AlertCircle 
} from 'lucide-react';

const StatCard = ({ title, value, unit, icon: Icon, iconColor = "text-blue-500", colorClass = "text-slate-800", gradientClass = "from-slate-50 to-slate-100 border-slate-200" }) => (
  <div className={`bg-gradient-to-br ${gradientClass} p-5 rounded-2xl border shadow-sm relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}>
    <div className={`absolute -right-2 -top-2 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300 ${iconColor}`}>
      <Icon size={64} />
    </div>
    <div className="text-sm font-medium text-slate-500 mb-1 relative z-10">{title}</div>
    <div className={`flex items-baseline gap-1 mt-1.5 relative z-10`}>
      <span className={`text-3xl font-extrabold tracking-tight ${colorClass}`}>{value}</span>
      {unit && <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">{unit}</span>}
    </div>
  </div>
);

const ManagerDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await managerApi.getDashboard();
        if (res.success) {
          setStats(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Đang tải dữ liệu bảng điều khiển...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-8 pb-8">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-widest text-slate-200 uppercase opacity-90">Bảng điều khiển</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Trang Tổng Quan Quản Lý</h1>
          <p className="text-xs md:text-sm text-indigo-50 max-w-2xl leading-relaxed">
            Tổng quan hoạt động của trung tâm gia sư — học viên, giáo viên, lớp học và tài chính trong một màn hình duy nhất.
          </p>
        </div>
        
        {/* Right floating card on banner */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center gap-4 shadow-lg shrink-0">
          <div className="p-2.5 bg-white/15 rounded-xl text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-200 tracking-wider uppercase">Doanh thu tháng này</div>
            <div className="text-lg md:text-xl font-black text-white mt-0.5 tracking-tight">
              {stats.finance.monthlyRevenue.toLocaleString()} VND
            </div>
          </div>
        </div>
      </div>

      {/* 1. Students Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Thống kê Học viên</h2>
          <p className="text-xs text-slate-500">Tình trạng học viên đang được theo dõi.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard 
            title="Tổng số học viên" 
            value={stats.students.total} 
            icon={Users} 
            iconColor="text-blue-600" 
            colorClass="text-blue-700"
            gradientClass="from-slate-50 to-slate-100 border-slate-200"
          />
          <StatCard 
            title="Học viên đang học" 
            value={stats.students.active} 
            icon={UserCheck} 
            iconColor="text-green-600" 
            colorClass="text-green-700"
            gradientClass="from-emerald-50 to-green-100 border-green-200"
          />
          <StatCard 
            title="Học viên dừng học" 
            value={stats.students.inactive} 
            icon={UserX} 
            iconColor="text-red-600" 
            colorClass="text-red-700"
            gradientClass="from-rose-50 to-red-100 border-red-200"
          />
        </div>
      </div>

      {/* 2. Teachers Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Thống kê Giáo viên</h2>
          <p className="text-xs text-slate-500">Đội ngũ giáo viên của trung tâm.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <StatCard 
            title="Tổng số giáo viên" 
            value={stats.teachers.total} 
            icon={GraduationCap} 
            iconColor="text-purple-600" 
            colorClass="text-purple-700"
            gradientClass="from-purple-50 to-fuchsia-100 border-purple-200"
          />
          <StatCard 
            title="Giáo viên đang dạy" 
            value={stats.teachers.active} 
            icon={UserCheck} 
            iconColor="text-green-600" 
            colorClass="text-green-700"
            gradientClass="from-emerald-50 to-green-100 border-green-200"
          />
        </div>
      </div>

      {/* 3. Classes Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Thống kê Lớp học</h2>
          <p className="text-xs text-slate-500">Tiến độ các lớp đang vận hành.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard 
            title="Tổng số lớp học" 
            value={stats.classes.total} 
            icon={BookOpen} 
            iconColor="text-blue-600" 
            colorClass="text-blue-700"
            gradientClass="from-slate-50 to-slate-100 border-slate-200"
          />
          <StatCard 
            title="Lớp đang diễn ra" 
            value={stats.classes.active} 
            icon={CircleDot} 
            iconColor="text-green-600" 
            colorClass="text-green-700"
            gradientClass="from-emerald-50 to-green-100 border-green-200"
          />
          <StatCard 
            title="Lớp sắp mở" 
            value={stats.classes.upcoming} 
            icon={Calendar} 
            iconColor="text-orange-600" 
            colorClass="text-orange-700"
            gradientClass="from-orange-50 to-amber-100 border-orange-200"
          />
          <StatCard 
            title="Lớp đã bế giảng" 
            value={stats.classes.finished} 
            icon={CheckCircle2} 
            iconColor="text-blue-600" 
            colorClass="text-blue-700"
            gradientClass="from-blue-50 to-indigo-100 border-blue-200"
          />
          <StatCard 
            title="Lớp đã hủy" 
            value={stats.classes.cancelled} 
            icon={XCircle} 
            iconColor="text-red-600" 
            colorClass="text-red-700"
            gradientClass="from-rose-50 to-red-100 border-red-200"
          />
        </div>
      </div>

      {/* 4 & 5. Schedules & Finance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Schedules */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Thống kê Lịch học</h2>
            <p className="text-xs text-slate-500">Lịch dạy được áp dụng trong trung tâm.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard 
              title="Tổng số lịch dạy" 
              value={stats.schedules.total} 
              icon={Calendar} 
              iconColor="text-blue-600" 
              colorClass="text-blue-700"
              gradientClass="from-slate-50 to-slate-100 border-slate-200"
            />
            <StatCard 
              title="Lịch dạy đang áp dụng" 
              value={stats.schedules.active} 
              icon={CheckCircle2} 
              iconColor="text-green-600" 
              colorClass="text-green-700"
              gradientClass="from-emerald-50 to-green-100 border-green-200"
            />
          </div>
        </div>

        {/* Finance */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Thống kê Tài chính</h2>
            <p className="text-xs text-slate-500">Doanh thu và tình trạng hóa đơn.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard 
              title="Tổng số hóa đơn" 
              value={stats.finance.totalInvoices} 
              icon={Receipt} 
              iconColor="text-indigo-600" 
              colorClass="text-indigo-700"
              gradientClass="from-indigo-50 to-violet-100 border-indigo-200"
            />
            <StatCard 
              title="Doanh thu tháng này" 
              value={stats.finance.monthlyRevenue.toLocaleString()} 
              unit="VND"
              icon={Wallet} 
              iconColor="text-green-600" 
              colorClass="text-green-700"
              gradientClass="from-emerald-50 to-green-100 border-green-200"
            />
            <StatCard 
              title="Hóa đơn đã đóng" 
              value={stats.finance.paidInvoices} 
              icon={CheckCircle2} 
              iconColor="text-teal-600" 
              colorClass="text-teal-700"
              gradientClass="from-teal-50 to-emerald-100 border-teal-200"
            />
            <StatCard 
              title="Hóa đơn chưa đóng" 
              value={stats.finance.unpaidInvoices} 
              icon={AlertCircle} 
              iconColor="text-red-600" 
              colorClass="text-red-700"
              gradientClass="from-rose-50 to-red-100 border-red-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;
