import React, { useState, useEffect } from 'react';
import profileApi from '../../api/profileApi';

const ProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    } else {
      setError(null);
      setSuccessMsg('');
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await profileApi.getMyProfile();
      if (res.success && res.data && res.data.user) {
        const u = res.data.user;
        setFormData({
          fullName: u.fullName || '',
          email: u.email || '',
          role: u.role || '',
          phone: u.phone || '',
          address: u.address || '',
          dateOfBirth: u.dateOfBirth || '',
          gender: u.gender || ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      setError('Tên không được để trống');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg('');
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender
      };
      
      const res = await profileApi.updateMyProfile(payload);
      if (res.success && res.data && res.data.user) {
        setSuccessMsg('Cập nhật thông tin thành công');
        onProfileUpdated(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    const confirmClear = window.confirm('Bạn có chắc muốn xóa các thông tin phụ như số điện thoại, địa chỉ, ngày sinh, giới tính không?');
    if (!confirmClear) return;

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg('');
      const res = await profileApi.clearMyProfile();
      if (res.success && res.data && res.data.user) {
        setSuccessMsg('Đã xóa thông tin phụ');
        const u = res.data.user;
        setFormData(prev => ({
          ...prev,
          phone: u.phone || '',
          address: u.address || '',
          dateOfBirth: u.dateOfBirth || '',
          gender: u.gender || ''
        }));
        onProfileUpdated(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Xóa thông tin thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50">
          <h2 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{successMsg}</div>}
          
          {loading && !formData.email ? (
            <div className="text-center py-4 text-gray-500">Đang tải...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Chỉ xem)</label>
                <input type="text" value={formData.email} disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò (Chỉ xem)</label>
                <input type="text" value={formData.role} disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="Nhập họ tên" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="Ví dụ: 0912345678" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="Địa chỉ thường trú" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white">
                    <option value="">-- Chọn --</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:justify-end gap-3">
          <button 
            onClick={handleClear} 
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 focus:outline-none transition-colors disabled:opacity-50"
          >
            Xóa thông tin phụ
          </button>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors disabled:opacity-50"
            >
              Đóng
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
