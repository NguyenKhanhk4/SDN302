import React, { useState } from 'react';
import { Search, Bell, LogOut, X, Mail, Phone, BadgeCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import profileApi from '../../api/profileApi';

const Header = () => {
  const navigate = useNavigate();
  const [showUserInfo, setShowUserInfo] = useState(false);

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

  const name = user?.fullName || user?.name || 'Người dùng';
  const role = user?.role || 'STUDENT';
  
  const roleDisplayMap = {
    ADMIN: 'Quản trị viên',
    MANAGER: 'Quản lý',
    TEACHER: 'Giảng viên',
    STUDENT: 'Học sinh',
    PARENT: 'Phụ huynh',
  };
  const roleDisplay = roleDisplayMap[role.toUpperCase()] || role;

  const getPortalTitle = (userRole) => {
    switch (String(userRole).toUpperCase()) {
      case 'ADMIN': return 'Cổng quản trị viên';
      case 'MANAGER': return 'Cổng quản lý';
      case 'TEACHER': return 'Cổng giảng viên';
      case 'STUDENT': return 'Cổng học sinh';
      case 'PARENT': return 'Cổng phụ huynh';
      default: return 'Cổng thông tin';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  return (
    <>
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-6 sticky top-0 z-30 transition-all shadow-sm">
        {/* Left side: Page Title / Badge */}
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-blue-50/80 text-blue-700 text-xs font-bold tracking-wide rounded-full border border-blue-100/50 shadow-sm shadow-blue-500/5">
            {getPortalTitle(role)}
          </span>
        </div>

        {/* Middle: Search bar */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-slate-200/60 rounded-full bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 shadow-inner"
              placeholder="Tìm kiếm..."
            />
          </div>
        </div>

        {/* Right side: Notifications, User Info & Logout */}
        <div className="flex items-center gap-5">
          {/* Notifications Bell */}
          <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50/50 hover:bg-blue-50 rounded-full border border-slate-200/60 shadow-sm">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"></span>
          </button>

          {/* User Profile */}
          <div 
            onClick={() => setShowUserInfo(true)}
            className="flex items-center gap-3 pl-3 border-l border-slate-200/60 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20 ring-2 ring-white">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden md:block leading-tight">
              <p className="text-sm font-bold text-slate-800">{name}</p>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{roleDisplay}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/80 border border-rose-100 hover:bg-rose-500 hover:border-rose-500 hover:text-white text-rose-600 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* User Info Modal */}
      {showUserInfo && (
        <UserInfoModal 
          user={user} 
          name={name} 
          roleDisplay={roleDisplay} 
          onClose={() => setShowUserInfo(false)} 
        />
      )}
    </>
  );
};

const UserInfoModal = ({ user, name, roleDisplay, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Update via API
      await profileApi.updateMyProfile(formData);
      
      // Update local storage
      const updatedUser = { ...user, ...formData, name: formData.fullName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      window.location.reload(); // Reload to reflect changes across app
    } catch (err) {
      alert('Có lỗi xảy ra khi cập nhật!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 pb-6 relative">
          <div className="h-20 w-20 rounded-2xl bg-white p-1 absolute -top-10 shadow-lg left-6">
            <div className="w-full h-full rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-inner">
              {formData.fullName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="pt-12">
            <div className="flex justify-between items-start mb-1">
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="text-xl font-bold text-slate-800 border-b-2 border-blue-500 focus:outline-none w-full mr-2"
                  placeholder="Họ và tên"
                />
              ) : (
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {name}
                  <BadgeCheck className="h-5 w-5 text-blue-500" />
                </h3>
              )}
              
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Cập nhật
                </button>
              )}
            </div>
            
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-6">{roleDisplay}</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="overflow-hidden w-full">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm text-slate-800 font-medium truncate">{user?.email || 'Không có'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="overflow-hidden w-full">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="text-sm font-medium text-slate-800 w-full bg-white border border-slate-200 rounded px-2 py-1 mt-1 focus:outline-none focus:border-blue-500"
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <p className="text-sm text-slate-800 font-medium truncate">{user?.phone || 'Chưa cập nhật'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="overflow-hidden w-full">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="text-sm font-medium text-slate-800 w-full bg-white border border-slate-200 rounded px-2 py-1 mt-1 focus:outline-none focus:border-blue-500"
                      placeholder="Nhập địa chỉ"
                    />
                  ) : (
                    <p className="text-sm text-slate-800 font-medium truncate">{user?.address || 'Chưa cập nhật'}</p>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
