import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, updateStoredUser, clearAuth } from '../../utils/auth';
import ProfileMenu from '../profile/ProfileMenu';

const Header = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(getUser());

    const handleProfileUpdate = () => {
      setCurrentUser(getUser());
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleProfileUpdated = (updatedUser) => {
    updateStoredUser(updatedUser);
    setCurrentUser(updatedUser);
    window.dispatchEvent(new Event('profileUpdated'));
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (!currentUser) return null;

  const getRoleTitle = () => {
    const roleUpper = currentUser.role?.toUpperCase();
    if (roleUpper === 'TEACHER') return 'Giảng viên';
    if (roleUpper === 'STUDENT') return 'Học sinh';
    return currentUser.role;
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm relative z-40">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">Cổng thông tin {getRoleTitle()}</h2>
      </div>
      
      <div className="flex items-center">
        <ProfileMenu 
          user={currentUser} 
          onLogout={handleLogout} 
          onProfileUpdated={handleProfileUpdated} 
        />
      </div>
    </header>
  );
};

export default Header;
