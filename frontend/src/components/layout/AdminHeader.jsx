import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  let user = null;
  
  try {
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    console.error("Failed to parse user info in AdminHeader", error);
  }

  const name = user?.name || 'Người quản lý';
  const roleDisplay = user?.role || 'manager';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm z-30 transition-all duration-200">
      {/* Left Area: Trang Quản lý Toggle */}
      <div className="flex items-center">
        {/* Mobile Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] font-semibold px-5 py-2.5 rounded-full border border-[#C7D2FE] flex items-center gap-2 shadow-sm transition-all text-xs md:hidden"
        >
          {/* Hamburger Menu Icon */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Trang Quản lý
        </button>

        {/* Desktop Static Pill */}
        <div className="hidden md:flex bg-[#EEF2FF] text-[#4F46E5] font-bold px-5 py-2.5 rounded-full border border-[#C7D2FE] items-center gap-2 shadow-sm text-xs select-none">
          Trang Quản lý
        </div>
      </div>

      {/* Center Area: Search Input */}
      <div className="hidden md:flex items-center w-full max-w-md mx-4 bg-[#F8FAFC] border border-gray-200 rounded-full px-5 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-200">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Tìm học viên, lớp học, hóa đơn..."
          className="bg-transparent text-xs text-gray-700 outline-none w-full placeholder-gray-400 ml-2.5"
        />
      </div>

      {/* Right Area: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications Button */}
        <button className="relative p-2.5 bg-[#F8FAFC] border border-gray-200 rounded-full text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all focus:outline-none">
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        {/* Profile Info Badge */}
        <div className="flex items-center gap-3 bg-[#F8FAFC] border border-gray-200 px-4 py-1.5 rounded-full">
          <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-indigo-200 uppercase">
            {name.charAt(0)}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[11px] font-bold text-gray-800 leading-tight">{name}</p>
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">{roleDisplay}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="border border-[#FCA5A5] bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] px-4 py-2 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
