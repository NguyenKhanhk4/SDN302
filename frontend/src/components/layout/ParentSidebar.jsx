import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, Users } from 'lucide-react';

const ParentSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const menuItems = [
    { name: 'Bảng điều khiển', path: '/parent/dashboard', icon: LayoutDashboard },
    { name: 'Hồ sơ cá nhân', path: '/parent/profile', icon: User },
  ];

  const checkIsActive = (path) => {
    return pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 relative overflow-hidden z-40">
      {/* Decorative blurred background layer */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-indigo-600/10 blur-[50px] pointer-events-none"></div>

      <div onClick={() => window.location.href = '/parent/dashboard'} className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 relative z-10 cursor-pointer">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <Users className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">Ánh Sáng Center</h1>
          <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Parent Portal</p>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto relative z-10">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = checkIsActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20 shadow-inner' 
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border border-transparent'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
              )}
              <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-sm tracking-wide">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 relative z-10">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/80 rounded-xl p-4 mb-4 backdrop-blur-sm">
          <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Đồng hành cùng con
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Theo dõi thường xuyên kết quả học tập và chuyên cần của các con để giúp con học tốt hơn.
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white hover:border-transparent transition-all duration-200 shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default ParentSidebar;
