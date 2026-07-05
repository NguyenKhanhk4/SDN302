import { NavLink, useNavigate } from 'react-router-dom';

import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, 
  Calendar, FileText, Banknote, BarChart3, LogOut 
} from 'lucide-react';

const AdminSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  const menuItems = [
    { name: 'Tổng quan', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Tuyển sinh', path: '/admin/enrollments', icon: <FileText className="w-5 h-5" /> },
    { name: 'Người dùng', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Giáo trình', path: '/admin/subjects', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Lớp học', path: '/admin/classes', icon: <GraduationCap className="w-5 h-5" /> },
    { name: 'Lịch học', path: '/admin/schedules', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Tài chính', path: '/admin/finance', icon: <Banknote className="w-5 h-5" /> },
    { name: 'Thống kê', path: '/admin/reports', icon: <BarChart3 className="w-5 h-5" /> }
  ];

  return (
    <>
      {/* Backdrop overlay for mobile only */}
      <div
        className={`fixed inset-0 bg-black/45 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar container */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#111827] text-white flex flex-col z-40 border-r border-[#1F2937]/50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with School Logo and Title */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#1F2937]/50">
          <div className="flex items-center gap-3">
            {/* Blue Circle Icon with Graduation Cap */}
            <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center border border-blue-400/20 shadow-lg shadow-blue-500/10">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            
            {/* Titles */}
            <div className="text-left">
              <h1 className="text-sm font-bold text-white leading-tight">Tutor Center</h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">Quản lý Trung tâm</p>
            </div>
          </div>

          {/* Close button - Mobile only */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors focus:outline-none md:hidden p-1.5 hover:bg-gray-800 rounded-lg"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Navigation Items */}
        <div className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#2563EB] text-white font-bold shadow-lg shadow-blue-500/20'
                    : 'text-[#9CA3AF] hover:bg-gray-800/40 hover:text-white font-semibold'
                }`
              }
            >
              {item.icon}
              <span className="text-xs tracking-wide">{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Logout area at the bottom */}
        <div className="p-4 border-t border-[#1F2937]/50 bg-[#0E131F]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-red-400 bg-red-500/10 rounded-xl hover:bg-red-500/15 hover:text-red-300 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
