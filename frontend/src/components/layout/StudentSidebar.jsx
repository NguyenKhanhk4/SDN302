import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const StudentSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const menuItems = [
    { name: 'Thông tin cá nhân', path: '/student/dashboard' },
    { name: 'Lớp học của tôi', path: '/student/classes' },
    { name: 'Lịch học của tôi', path: '/student/schedules' },
    { name: 'Danh sách buổi học', path: '/student/sessions' },
    { name: 'Học phí của tôi', path: '/student/invoices' },
    { name: 'Yêu cầu & Hỗ trợ', path: '/student/support' },
    { name: 'Hồ sơ cá nhân', path: '/student/profile' },
  ];

  const checkIsActive = (path) => {
    return pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-sidebar text-white flex flex-col h-full border-r border-gray-800">
      <div onClick={() => window.location.href = '/student/dashboard'} className="h-16 flex items-center px-6 border-b border-gray-800 cursor-pointer">
        <h1 className="text-xl font-bold tracking-wider text-white">Ánh Sáng Center</h1>
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

export default StudentSidebar;
