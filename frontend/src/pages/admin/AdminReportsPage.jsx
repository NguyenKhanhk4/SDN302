import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { motion } from 'framer-motion';
import { BarChart3, Download, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const AdminReportsPage = () => {
  const [trendData, setTrendData] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    try {
      const res = await adminApi.getEnrollmentTrends();
      if (res.success) {
        const formatted = res.data.map(item => ({
          name: `Th ${item.month}`,
          'Ghi danh mới': item.enrollments
        }));
        setTrendData(formatted);
      }
    } catch (err) {
      console.error(err);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Báo Cáo & Phân Tích
          </h1>
          <p className="text-sm text-slate-500 mt-1">Phân tích xu hướng phát triển và trích xuất báo cáo hệ thống</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <PieChartIcon className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Báo Cáo Doanh Thu (Excel)</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              Xuất tệp báo cáo chi tiết bao gồm tất cả các khoản thu từ học phí và chi phí trả lương giảng viên trong năm, phục vụ quyết toán.
            </p>
          </div>
          
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-[0_4px_15px_rgb(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {exporting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Download className="w-5 h-5" />
                Tải Báo Cáo Xuống
              </>
            )}
          </button>
        </motion.div>

        {/* Analytics Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Biểu Đồ Tăng Trưởng</h2>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#F1F5F9' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Ghi danh mới" fill="#6366F1" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
