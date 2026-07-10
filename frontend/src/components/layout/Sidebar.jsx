import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, CalendarDays, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };
  const menuItems = [
    { name: 'Lịch dạy', path: '/teacher/schedules', icon: CalendarDays },
    { name: 'Giáo trình', path: '/teacher/subjects', icon: BookOpen },
    { name: 'Lớp học của tôi', path: '/teacher/classes', icon: GraduationCap },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 relative overflow-visible z-40`}>
      {/* Decorative blurred background layer */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-blue-600/10 blur-[50px] pointer-events-none"></div>

      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-slate-800 text-slate-400 p-1 rounded-full border border-slate-700 hover:text-white hover:bg-slate-700 z-50 transition-colors shadow-lg"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-6'} border-b border-slate-800/80 relative z-10 transition-all duration-300`}>
        <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <GraduationCap className="h-4 w-4" />
        </div>
        {!isCollapsed && (
          <div onClick={() => navigate('/teacher/classes')} className="cursor-pointer overflow-hidden whitespace-nowrap">
            <h1 className="text-sm font-bold text-white tracking-wide">Ánh Sáng Center</h1>
            <p className="text-[10px] text-blue-400 font-medium">Teacher Portal</p>
          </div>
        )}
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isAttendance = location.pathname.includes('/attendance');
          const isActive = 
            item.path === '/teacher/schedules' 
              ? (location.pathname.startsWith('/teacher/schedules') || isAttendance)
              : item.path === '/teacher/classes'
              ? (location.pathname.startsWith('/teacher/classes') && !isAttendance)
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 shadow-inner' 
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0 mx-1' : 'px-4 mx-2'}`}
              title={isCollapsed ? item.name : undefined}
            >
              <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
                <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {!isCollapsed && <span className="text-sm tracking-wide whitespace-nowrap overflow-hidden">{item.name}</span>}
              </>
            </NavLink>
          );
        })}
      </div>

      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800 relative z-10 transition-all duration-300">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/80 rounded-xl p-4 mb-4 backdrop-blur-sm">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              Mẹo nhỏ
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Điểm danh học viên sau mỗi buổi học để theo dõi tiến độ chính xác.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
