import React, { useState, useEffect } from 'react';
import { teacherApi } from '../../api/teacherApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { BookOpen, Calendar, Users, ClipboardList, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
const TeacherDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherApi.getDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.message || err.error || 'Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Đang tải bảng điều khiển của bạn..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        <p className="font-medium">Lỗi</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchDashboard}
          className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline focus:outline-none"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Fallbacks for data to ensure 0 is displayed instead of blank
  const data = dashboardData || {};
  const totalClasses = data.totalClasses || 0;
  const totalSchedules = data.totalSchedules || 0;
  const totalStudents = data.totalStudents || 0;
  
  // Optional extra stats if backend provides them
  const totalSessions = data.totalSessions;
  const totalAttendance = data.totalAttendance;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-500/10 mb-8">
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-widest text-slate-200 uppercase opacity-90">Bảng điều khiển</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Trang Tổng Quan Giáo Viên</h1>
          <p className="text-xs md:text-sm text-indigo-50 max-w-2xl leading-relaxed mt-1">Tổng quan về hoạt động giảng dạy của bạn.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Link to="/teacher/classes" className="bg-gradient-to-br from-blue-50 to-indigo-100 p-5 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-300 block cursor-pointer">
          <div className="absolute -right-2 -top-2 p-4 opacity-10 text-blue-600 group-hover:scale-110 transition-transform"><BookOpen size={64} /></div>
          <div className="text-sm font-medium text-slate-500 mb-1 relative z-10">Tổng số lớp học</div>
          <div className="text-3xl font-extrabold tracking-tight text-blue-700 relative z-10">{totalClasses}</div>
        </Link>
        
        <Link to="/teacher/schedules" className="bg-gradient-to-br from-emerald-50 to-green-100 p-5 rounded-2xl border border-green-200 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-300 block cursor-pointer">
          <div className="absolute -right-2 -top-2 p-4 opacity-10 text-green-600 group-hover:scale-110 transition-transform"><Calendar size={64} /></div>
          <div className="text-sm font-medium text-slate-500 mb-1 relative z-10">Tổng số lịch dạy</div>
          <div className="text-3xl font-extrabold tracking-tight text-green-700 relative z-10">{totalSchedules}</div>
        </Link>
        
        <Link to="/teacher/classes" className="bg-gradient-to-br from-purple-50 to-fuchsia-100 p-5 rounded-2xl border border-purple-200 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-300 block cursor-pointer">
          <div className="absolute -right-2 -top-2 p-4 opacity-10 text-purple-600 group-hover:scale-110 transition-transform"><Users size={64} /></div>
          <div className="text-sm font-medium text-slate-500 mb-1 relative z-10">Tổng số học viên</div>
          <div className="text-3xl font-extrabold tracking-tight text-purple-700 relative z-10">{totalStudents}</div>
        </Link>

        {totalSessions !== undefined && (
          <Link to="/teacher/sessions" className="bg-gradient-to-br from-orange-50 to-amber-100 p-5 rounded-2xl border border-orange-200 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-300 block cursor-pointer">
            <div className="absolute -right-2 -top-2 p-4 opacity-10 text-orange-600 group-hover:scale-110 transition-transform"><ClipboardList size={64} /></div>
            <div className="text-sm font-medium text-slate-500 mb-1 relative z-10">Tổng số buổi học</div>
            <div className="text-3xl font-extrabold tracking-tight text-orange-700 relative z-10">{totalSessions}</div>
          </Link>
        )}
        
        {totalAttendance !== undefined && (
          <Link to="/teacher/attendance" className="bg-gradient-to-br from-teal-50 to-emerald-100 p-5 rounded-2xl border border-teal-200 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-300 block cursor-pointer">
            <div className="absolute -right-2 -top-2 p-4 opacity-10 text-teal-600 group-hover:scale-110 transition-transform"><CheckCircle size={64} /></div>
            <div className="text-sm font-medium text-slate-500 mb-1 relative z-10">Tỷ lệ điểm danh trung bình</div>
            <div className="text-3xl font-extrabold tracking-tight text-teal-700 relative z-10">{totalAttendance}</div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
