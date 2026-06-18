import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, updateStoredUser, clearAuth } from '../../utils/auth';
import ProfileMenu from '../profile/ProfileMenu';

const Header = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(getUser());
  }, []);

  const handleProfileUpdated = (updatedUser) => {
    updateStoredUser(updatedUser);
    setCurrentUser(updatedUser);
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm relative z-40">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">Cổng thông tin {currentUser.role?.toUpperCase() === 'TEACHER' ? 'Giảng viên' : currentUser.role}</h2>
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
