import React, { useState, useRef, useEffect } from 'react';
import ProfileModal from './ProfileModal';

const ProfileMenu = ({ user, onLogout, onProfileUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    setIsModalOpen(true);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    if (onLogout) onLogout();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 focus:outline-none hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{user?.name || user?.fullName || 'Người dùng'}</p>
          <p className="text-xs text-gray-500 font-medium">{user?.role?.toUpperCase() === 'TEACHER' ? 'Giảng viên' : user?.role}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm hover:bg-blue-200 transition-colors">
          {getInitial(user?.name || user?.fullName)}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-40 animate-fade-in">
          <div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl flex-shrink-0">
              {getInitial(user?.name || user?.fullName)}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-gray-800 truncate" title={user?.name || user?.fullName}>
                {user?.name || user?.fullName || 'Người dùng'}
              </p>
              <p className="text-xs text-gray-500 truncate" title={user?.email}>
                {user?.email || 'Chưa có email'}
              </p>
              <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-semibold text-blue-700 bg-blue-100 rounded-full">
                {user?.role?.toUpperCase() || 'USER'}
              </span>
            </div>
          </div>
          
          <div className="py-1">
            <button 
              onClick={handleProfileClick}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Xem / Chỉnh sửa hồ sơ
            </button>
            <button 
              onClick={handleLogoutClick}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onProfileUpdated={onProfileUpdated}
      />
    </div>
  );
};

export default ProfileMenu;
