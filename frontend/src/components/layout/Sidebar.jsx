import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const from = searchParams.get('from');

  const isScheduleFlow = pathname.includes('/attendance') && from === 'schedule';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Bảng điều khiển', path: '/teacher/dashboard' },
    { name: 'Lớp học của tôi', path: '/teacher/classes' },
    { name: 'Lịch dạy', path: '/teacher/schedules' },
  ];

  const checkIsActive = (path) => {
    if (path === '/teacher/schedules') {
      return pathname === '/teacher/schedules' || isScheduleFlow;
    }
    if (path === '/teacher/classes') {
      return pathname.startsWith('/teacher/classes') && !isScheduleFlow;
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-sidebar text-white flex flex-col h-full border-r border-gray-800">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wider text-white">Trung tâm Gia sư</h1>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = checkIsActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary text-white font-medium shadow-sm' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.name}
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 rounded-lg hover:bg-red-400/20 hover:text-red-300 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
