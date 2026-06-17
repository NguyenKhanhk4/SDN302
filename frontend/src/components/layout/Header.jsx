import React from 'react';

const Header = () => {
  // Parse user info from localStorage if available, otherwise fallback
  const userStr = localStorage.getItem('user');
  let user = null;
  try {
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    console.error("Failed to parse user info");
  }

  const name = user?.name || 'Teacher';
  const role = user?.role || 'TEACHER';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">Teacher Portal</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-500 font-medium capitalize">{role.toLowerCase()}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
          {name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Header;
