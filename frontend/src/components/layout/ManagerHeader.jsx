import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut } from 'lucide-react';
import { clearAuth } from '../../utils/auth';

const ManagerHeader = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-6 sticky top-0 z-30 transition-all">
      {/* Left side: Page Title / Badge */}
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 bg-blue-50/80 text-blue-700 text-xs font-bold tracking-wide rounded-full border border-blue-100/50 shadow-sm shadow-blue-500/5">
          Trang Quản lý
        </span>
      </div>

      {/* Middle: Search bar */}
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-slate-200/60 rounded-full bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 shadow-inner"
            placeholder="Tìm học viên, lớp học, hóa đơn..."
          />
        </div>
      </div>

      {/* Right side: Notifications, User Info & Logout */}
      <div className="flex items-center gap-5">
        {/* Notifications Bell */}
        <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50/50 hover:bg-blue-50 rounded-full border border-slate-200/60 shadow-sm">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200/60">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20 ring-2 ring-white">
            {user?.name?.charAt(0) || 'M'}
          </div>
          <div className="text-left hidden md:block leading-tight">
            <p className="text-sm font-bold text-slate-800">{user?.name || 'Người quản lý'}</p>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{user?.role || 'manager'}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/80 border border-rose-100 hover:bg-rose-500 hover:border-rose-500 hover:text-white text-rose-600 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default ManagerHeader;
