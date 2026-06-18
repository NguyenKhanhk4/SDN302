import React, { useState, useEffect } from 'react';
import { teacherApi } from '../../api/teacherApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';

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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
        <p className="mt-1 text-sm text-gray-500">Tổng quan về hoạt động giảng dạy của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tổng số lớp học</span>
            <span className="mt-2 text-3xl font-bold text-primary">{totalClasses}</span>
          </div>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tổng số lịch dạy</span>
            <span className="mt-2 text-3xl font-bold text-primary">{totalSchedules}</span>
          </div>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tổng số học viên</span>
            <span className="mt-2 text-3xl font-bold text-primary">{totalStudents}</span>
          </div>
        </Card>

        {totalSessions !== undefined && (
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tổng số buổi học</span>
              <span className="mt-2 text-3xl font-bold text-primary">{totalSessions}</span>
            </div>
          </Card>
        )}
        
        {totalAttendance !== undefined && (
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ điểm danh trung bình</span>
              <span className="mt-2 text-3xl font-bold text-primary">{totalAttendance}</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
