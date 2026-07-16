import React, { useState, useEffect } from 'react';
import { managerApi } from '../../api/managerApi';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/Card';
import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, Calendar, Banknote, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow"
  >
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
  </motion.div>
);

const ManagerDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await managerApi.getDashboard();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      toast.error('Không thể lấy dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng quan trung tâm</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi các chỉ số hoạt động và số liệu thống kê mới nhất.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng học viên" 
          value={stats.students.total} 
          subtext={`${stats.students.active} đang hoạt động`}
          icon={Users} 
          colorClass="bg-blue-50 text-blue-600"
          delay={0.1}
        />
        <StatCard 
          title="Tổng giáo viên" 
          value={stats.teachers.total} 
          subtext={`${stats.teachers.active} đang giảng dạy`}
          icon={GraduationCap} 
          colorClass="bg-indigo-50 text-indigo-600"
          delay={0.2}
        />
        <StatCard 
          title="Tổng lớp học" 
          value={stats.classes.total} 
          subtext={`${stats.classes.active} đang diễn ra`}
          icon={BookOpen} 
          colorClass="bg-emerald-50 text-emerald-600"
          delay={0.3}
        />
        <StatCard 
          title="Tổng lịch học" 
          value={stats.schedules.total} 
          subtext={`${stats.schedules.active} lịch đang active`}
          icon={Calendar} 
          colorClass="bg-amber-50 text-amber-600"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Status Details */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Trạng thái Lớp học
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-slate-700">Sắp khai giảng</span>
              </div>
              <span className="font-bold text-slate-900">{stats.classes.upcoming}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-slate-700">Đang diễn ra</span>
              </div>
              <span className="font-bold text-slate-900">{stats.classes.active}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-slate-700">Đã hoàn thành</span>
              </div>
              <span className="font-bold text-slate-900">{stats.classes.finished}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-slate-700">Đã hủy</span>
              </div>
              <span className="font-bold text-slate-900">{stats.classes.cancelled}</span>
            </div>
          </div>
        </Card>

        {/* Subject Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            Thống kê Môn học
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
              <p className="text-sm font-medium text-purple-800 mb-1">Tổng số Môn học</p>
              <h4 className="text-2xl font-bold text-purple-600">
                {stats.subjects?.total || 0}
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-sm font-medium text-blue-800 mb-1">Đang giảng dạy</p>
                <h4 className="text-xl font-bold text-blue-600">{stats.subjects?.active || 0}</h4>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-sm font-medium text-slate-700 mb-1">Ngừng giảng dạy</p>
                <h4 className="text-xl font-bold text-slate-600">{stats.subjects?.inactive || 0}</h4>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;
