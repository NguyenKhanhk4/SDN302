import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, GraduationCap, Contact, BookText, Calendar, Receipt } from 'lucide-react';

const ManagerSidebar = () => {
  const menuItems = [
    { path: '/manager/students', label: 'Học viên', icon: Users },
    { path: '/manager/teachers', label: 'Giáo viên', icon: GraduationCap },
    { path: '/manager/subjects', label: 'Môn học', icon: BookText },
    { path: '/manager/classes', label: 'Lớp học', icon: BookOpen },
    { path: '/manager/schedules', label: 'Lịch học', icon: Calendar },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex border-r border-slate-800 relative overflow-hidden z-40">
      {/* Decorative blurred background layer */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-blue-600/10 blur-[50px] pointer-events-none"></div>

      {/* Logo Header */}
      <div onClick={() => window.location.href = '/manager/students'} className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80 relative z-10 cursor-pointer">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <GraduationCap className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">Ánh Sáng Center</h1>
          <p className="text-[10px] text-blue-400 font-medium">Manager Portal</p>
        </div>
      </div>

      {/* Menu items */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 shadow-inner' 
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
                  <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="text-sm tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Tip Card & Footer */}
      <div className="p-4 border-t border-slate-800 relative z-10">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/80 rounded-xl p-4 mb-4 backdrop-blur-sm">
          <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            Mẹo nhỏ
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Theo dõi tiến độ học tập và thông tin học viên thường xuyên.
          </p>
        </div>
        <div className="text-[10px] text-slate-500 text-center font-medium tracking-wide">
          &copy; 2026 Ánh Sáng Center
        </div>
      </div>
    </aside>
  );
};

export default ManagerSidebar;
