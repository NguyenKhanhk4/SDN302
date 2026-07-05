import { useState, useEffect } from 'react';
import profileApi from '../../api/profileApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { 
  User, 
  Lock, 
  Camera, 
  Mail, 
  GraduationCap, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const StudentProfilePage = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  // User Profile Form State
  const [userForm, setUserForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: ''
  });
  
  // Readonly fields from student profile
  const [studentInfo, setStudentInfo] = useState({
    email: '',
    role: '',
    grade: '',
    school: '',
    parentName: '',
    parentPhone: ''
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');

  const loadProfileData = async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg('');
      
      const res = await profileApi.getMyProfile();
      if (res.success && res.data) {
        const u = res.data.user;
        const p = res.data.profile || {};
        
        setUserForm({
          fullName: u.fullName || '',
          phone: u.phone || '',
          address: u.address || '',
          dateOfBirth: u.dateOfBirth || '',
          gender: u.gender || ''
        });

        setStudentInfo({
          email: u.email || '',
          role: u.role || 'Học sinh',
          grade: p.grade || 'Chưa cập nhật',
          school: p.school || 'Chưa cập nhật',
          parentName: p.parentName || 'N/A',
          parentPhone: p.parentPhone || 'N/A'
        });

        if (u.avatar) {
          setAvatarPreview(u.avatar);
          setAvatarBase64(u.avatar);
        }
      }
    } catch (err) {
      setError(err.message || err.error || 'Không thể tải thông tin hồ sơ của bạn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfileData();
  }, []);
  const handleUserFormChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
    if (error) setError(null);
    if (successMsg) setSuccessMsg('');
  };

  const handlePasswordFormChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    if (error) setError(null);
    if (successMsg) setSuccessMsg('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const saveProfileInfo = async (e) => {
    e.preventDefault();
    if (!userForm.fullName.trim()) {
      setError('Họ và tên không được để trống.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg('');
      
      const res = await profileApi.updateMyProfile(userForm);
      if (res.success && res.data && res.data.user) {
        setSuccessMsg('Cập nhật hồ sơ thành công!');
        
        // Update stored user
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const newUser = { ...storedUser, ...res.data.user };
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Dispatch global event for sync
        window.dispatchEvent(new Event('profileUpdated'));
      }
    } catch (err) {
      setError(err.message || err.error || 'Cập nhật hồ sơ thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Vui lòng điền đầy đủ các thông tin mật khẩu.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg('');
      
      const res = await profileApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (res.success) {
        setSuccessMsg('Đổi mật khẩu thành công!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError(err.message || err.error || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Kích thước ảnh đại diện phải nhỏ hơn 2MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setAvatarBase64(reader.result);
        if (error) setError(null);
        if (successMsg) setSuccessMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAvatar = async () => {
    if (!avatarBase64) {
      setError('Vui lòng chọn một hình ảnh trước.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg('');
      
      const res = await profileApi.updateAvatar({ avatar: avatarBase64 });
      if (res.success && res.data && res.data.user) {
        setSuccessMsg('Cập nhật ảnh đại diện thành công!');
        
        // Update stored user
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const newUser = { ...storedUser, ...res.data.user };
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Dispatch global event
        window.dispatchEvent(new Event('profileUpdated'));
      }
    } catch (err) {
      setError(err.message || err.error || 'Không thể lưu ảnh đại diện.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !studentInfo.email) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loading text="Đang tải thông tin cá nhân..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý hồ sơ cá nhân</h1>
        <p className="text-sm text-gray-500 mt-1">Xem, cập nhật thông tin cá nhân, đổi mật khẩu và đổi ảnh đại diện của bạn.</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold">Lỗi:</span> {error}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-2.5">
          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{successMsg}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs on Left */}
        <div className="md:col-span-1 space-y-2">
          <button
            onClick={() => { setActiveTab('info'); setError(null); setSuccessMsg(''); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-2.5 transition-all ${
              activeTab === 'info' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-100'
            }`}
          >
            <User className="h-4 w-4" /> Thông tin hồ sơ
          </button>
          
          <button
            onClick={() => { setActiveTab('password'); setError(null); setSuccessMsg(''); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-2.5 transition-all ${
              activeTab === 'password' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-100'
            }`}
          >
            <Lock className="h-4 w-4" /> Đổi mật khẩu
          </button>

          <button
            onClick={() => { setActiveTab('avatar'); setError(null); setSuccessMsg(''); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-2.5 transition-all ${
              activeTab === 'avatar' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-100'
            }`}
          >
            <Camera className="h-4 w-4" /> Ảnh đại diện
          </button>
        </div>

        {/* Content Area on Right */}
        <div className="md:col-span-3">
          {/* Tab 1: Info */}
          {activeTab === 'info' && (
            <Card>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5">Thông tin tài khoản</h2>
              
              <form onSubmit={saveProfileInfo} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Readonly Fields first */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Địa chỉ Email (Chỉ xem)</label>
                    <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 flex items-center gap-2">
                      <Mail className="h-4 w-4" /> {studentInfo.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Vai trò tài khoản (Chỉ xem)</label>
                    <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> {studentInfo.role}
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Họ và tên *</label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={userForm.fullName} 
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                      placeholder="Nhập họ tên đầy đủ"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Số điện thoại</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={userForm.phone} 
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                      placeholder="Nhập số điện thoại liên hệ"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ngày sinh</label>
                    <input 
                      type="date" 
                      name="dateOfBirth"
                      value={userForm.dateOfBirth} 
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Giới tính</label>
                    <select 
                      name="gender"
                      value={userForm.gender} 
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800 bg-white"
                    >
                      <option value="">-- Chọn --</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Địa chỉ thường trú</label>
                  <input 
                    type="text" 
                    name="address"
                    value={userForm.address} 
                    onChange={handleUserFormChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                    placeholder="Nhập địa chỉ nhà của học sinh"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Học vấn & Phụ huynh</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-sm text-gray-600">
                    <div>
                      <span className="text-xs text-gray-400 block">Lớp & Trường học</span>
                      <span className="font-semibold text-gray-800">{studentInfo.grade} - {studentInfo.school}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Phụ huynh liên hệ</span>
                      <span className="font-semibold text-gray-800">{studentInfo.parentName} ({studentInfo.parentPhone})</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" /> {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* Tab 2: Change Password */}
          {activeTab === 'password' && (
            <Card>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5">Đổi mật khẩu tài khoản</h2>
              
              <form onSubmit={savePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mật khẩu hiện tại *</label>
                  <div className="relative">
                    <input 
                      type={showPassword.current ? 'text' : 'password'} 
                      name="currentPassword"
                      value={passwordForm.currentPassword} 
                      onChange={handlePasswordFormChange}
                      className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                      placeholder="Nhập mật khẩu hiện tại của bạn"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mật khẩu mới *</label>
                  <div className="relative">
                    <input 
                      type={showPassword.new ? 'text' : 'password'} 
                      name="newPassword"
                      value={passwordForm.newPassword} 
                      onChange={handlePasswordFormChange}
                      className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                      placeholder="Tối thiểu 6 ký tự"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Xác nhận mật khẩu mới *</label>
                  <div className="relative">
                    <input 
                      type={showPassword.confirm ? 'text' : 'password'} 
                      name="confirmPassword"
                      value={passwordForm.confirmPassword} 
                      onChange={handlePasswordFormChange}
                      className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                      placeholder="Xác nhận lại mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" /> {loading ? 'Đang thực hiện...' : 'Cập nhật mật khẩu'}
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* Tab 3: Avatar */}
          {activeTab === 'avatar' && (
            <Card>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5">Cập nhật ảnh đại diện</h2>
              
              <div className="flex flex-col items-center justify-center space-y-6 py-6">
                {/* Image Preview Container */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50 bg-blue-50 flex items-center justify-center text-blue-600 text-4xl font-extrabold shadow-inner relative z-10">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      userForm.fullName.charAt(0).toUpperCase() || 'S'
                    )}
                  </div>
                  
                  {/* Hover Upload Trigger Icon */}
                  <label htmlFor="avatar-file" className="absolute bottom-1.5 right-1.5 z-20 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-md transition-colors">
                    <Camera className="h-4 w-4" />
                    <input 
                      type="file" 
                      id="avatar-file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="text-center max-w-sm">
                  <p className="text-sm font-semibold text-gray-700">Chọn ảnh đại diện mới</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Định dạng hỗ trợ: JPG, PNG. Dung lượng tối đa 2MB. Ảnh sẽ được tự động đồng bộ trên thanh điều hướng sau khi lưu.
                  </p>
                </div>

                {avatarBase64 && (
                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => {
                        const u = JSON.parse(localStorage.getItem('user') || '{}');
                        setAvatarPreview(u.avatar || '');
                        setAvatarBase64(u.avatar || '');
                        setError(null);
                        setSuccessMsg('');
                      }}
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Hủy chọn
                    </button>
                    <button
                      onClick={saveAvatar}
                      disabled={loading}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" /> {loading ? 'Đang cập nhật...' : 'Lưu ảnh đại diện'}
                    </button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
