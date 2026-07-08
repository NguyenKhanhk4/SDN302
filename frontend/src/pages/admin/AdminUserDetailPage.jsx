import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Mail, Phone, MapPin, Calendar, User as UserIcon, GraduationCap, Briefcase, Info, BookOpen, Clock, AlertTriangle } from 'lucide-react';

const getRoleLabel = (role) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN': return 'Quản trị viên';
    case 'MANAGER': return 'Quản lý';
    case 'TEACHER': return 'Giáo viên';
    case 'STUDENT': return 'Học viên';
    case 'PARENT': return 'Phụ huynh';
    default: return role;
  }
};

const getStatusLabel = (status) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE': return 'Hoạt động';
    case 'INACTIVE': return 'Không hoạt động';
    case 'BANNED': return 'Bị khóa';
    default: return status;
  }
};

const getRoleColor = (role) => {
  switch (role?.toUpperCase()) {
    case 'TEACHER': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
    case 'STUDENT': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'PARENT': return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'MANAGER': return 'bg-purple-100 text-purple-800 border border-purple-200';
    default: return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

const AdminUserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUserDetail(userId);
      if (response.success) {
        setUser(response.data);
      } else {
        setError(response.message || 'Không tìm thấy người dùng');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      setSuccessMsg('');
      const response = await adminApi.updateUserStatus(userId, newStatus);
      if (response.success) {
        setSuccessMsg(`Cập nhật trạng thái người dùng thành "${getStatusLabel(newStatus)}" thành công!`);
        fetchUserDetail();
      } else {
        setError(response.message || 'Cập nhật trạng thái người dùng thất bại');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi cập nhật trạng thái người dùng');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setDeleting(true);
      setError('');
      setSuccessMsg('');
      const response = await adminApi.deleteUser(userId);
      if (response.success) {
        setSuccessMsg('Xóa người dùng thành công! Đang quay lại danh sách...');
        setTimeout(() => {
          navigate('/admin/users');
        }, 1500);
      } else {
        setError(response.message || 'Xóa người dùng thất bại');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi xóa người dùng');
    } finally {
      setDeleting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      setError('');
      setSuccessMsg('');
      const response = await adminApi.updateUserPassword(userId, newPassword);
      if (response.success) {
        setSuccessMsg('Đổi mật khẩu thành công!');
        setShowPasswordModal(false);
        setNewPassword('');
      } else {
        setError(response.message || 'Đổi mật khẩu thất bại');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi đổi mật khẩu');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <Badge status="ACTIVE" />;
      case 'INACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">Không hoạt động</span>;
      case 'BANNED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">Bị khóa</span>;
      default:
        return <Badge status={status} />;
    }
  };

  if (loading) return <Loading text="Đang tải hồ sơ người dùng..." />;

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
          {error || 'Không tìm thấy người dùng'}
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
          Quay lại Danh sách
        </Button>
      </div>
    );
  }

  const profile = user.profile || {};
  const isStudent = user.role === 'STUDENT';
  const isTeacher = user.role === 'TEACHER';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ Người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">Xem chi tiết và quản lý thông tin tài khoản.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => navigate('/admin/users')}>
            Quay lại Danh sách
          </Button>
          <Button variant="primary" onClick={() => navigate(`/admin/users/${userId}/edit`)}>
            Chỉnh sửa Hồ sơ
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-medium flex items-center gap-2">
          <Info className="w-5 h-5 text-green-500" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Profile */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 flex flex-col items-center justify-center border-b border-gray-100">
              <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center text-primary font-bold text-4xl border-2 border-primary/20 mb-4">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center">{user.fullName}</h2>
              <p className="text-sm text-gray-500 text-center mb-3">{user.email}</p>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
                {getStatusBadge(user.status)}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{user.phone || 'Chưa cập nhật SĐT'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác Nhanh</p>
                <div className="flex flex-col gap-2">
                  {user.status === 'ACTIVE' ? (
                    <Button 
                      variant="outline" 
                      className="w-full justify-center !text-amber-600 !border-amber-200 hover:!bg-amber-50"
                      onClick={() => handleUpdateStatus('INACTIVE')}
                      disabled={updating}
                    >
                      Tạm ngưng hoạt động
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full justify-center !text-emerald-600 !border-emerald-200 hover:!bg-emerald-50"
                      onClick={() => handleUpdateStatus('ACTIVE')}
                      disabled={updating}
                    >
                      Kích hoạt lại
                    </Button>
                  )}

                  {user.status !== 'BANNED' && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-center !text-red-600 !border-red-200 hover:!bg-red-50"
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn KHÓA tài khoản này?')) {
                          handleUpdateStatus('BANNED');
                        }
                      }}
                      disabled={updating}
                    >
                      Khóa tài khoản
                    </Button>
                  )}

                  <Button 
                    variant="danger" 
                    className="w-full justify-center mt-2"
                    onClick={handleDeleteUser}
                    disabled={deleting}
                  >
                    Xóa vĩnh viễn
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 bg-gray-50/50">
              <button
                className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'general' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('general')}
              >
                <UserIcon className="w-4 h-4" /> Thông tin Cá nhân
              </button>
              {(isStudent || isTeacher || user.role === 'PARENT') && (
                <button
                  className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'profile' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <Briefcase className="w-4 h-4" /> 
                  {isStudent ? 'Hồ sơ Học tập' : isTeacher ? 'Hồ sơ Chuyên môn' : 'Danh sách Học viên'}
                </button>
              )}
            </div>

            {/* Tabs Content */}
            <div className="p-6">
              {activeTab === 'general' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Account Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-primary pl-3">Thông tin Tài khoản</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">ID Người dùng</p>
                        <p className="text-sm text-gray-900 font-mono bg-white px-2 py-1 border border-gray-200 rounded-md inline-block">{user._id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Email đăng nhập</p>
                        <p className="text-base text-gray-900 font-medium">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Mật khẩu</p>
                        <div className="flex items-center gap-3">
                          <p className="text-base tracking-widest text-gray-900 font-medium mt-1">••••••••</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="!py-1 !text-xs !bg-white"
                            onClick={() => setShowPasswordModal(true)}
                          >
                            Đổi mật khẩu
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Trạng thái hoạt động</p>
                        <div className="mt-1">
                          {getStatusBadge(user.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Demographic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-primary pl-3">Thông tin Nhân khẩu học</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Họ và tên đầy đủ</p>
                        <p className="text-base text-gray-900 font-medium">{user.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Giới tính</p>
                        <p className="text-base text-gray-900">
                          {user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : user.gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Ngày sinh</p>
                        <p className="text-base text-gray-900">
                          {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Địa chỉ cư trú</p>
                        <p className="text-base text-gray-900 flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                          {user.address || 'Chưa cập nhật địa chỉ'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && isStudent && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-emerald-500 pl-3">Hồ sơ Học tập & Phụ huynh</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div className="md:col-span-2 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-4 transition-all hover:shadow-sm">
                      <div className="p-3 bg-amber-100 text-amber-600 rounded-full shrink-0">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-amber-800 mb-1">Phụ huynh liên kết</p>
                        {user.linkedParent ? (
                          <div>
                            <p 
                              className="text-base text-gray-900 font-bold hover:text-amber-600 cursor-pointer underline decoration-amber-300 underline-offset-4 transition-colors inline-block"
                              onClick={() => {
                                navigate(`/admin/users/${user.linkedParent._id}`);
                                window.scrollTo(0,0);
                              }}
                            >
                              {user.linkedParent.name}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1.5">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {user.linkedParent.phone}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic mt-1">Học viên này chưa được liên kết với phụ huynh nào.</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Đang học Khối/Lớp</p>
                      <p className="text-base text-gray-900 font-semibold">{profile.grade || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Trường học</p>
                      <p className="text-base text-gray-900 flex items-center gap-2 font-semibold">
                        <GraduationCap className="w-4 h-4 text-emerald-500 shrink-0" />
                        {profile.school || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && isTeacher && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-indigo-500 pl-3">Hồ sơ Chuyên môn</h3>
                  <div className="grid grid-cols-1 gap-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Số năm kinh nghiệm</p>
                        <p className="text-base text-gray-900 font-bold">{profile.experienceYears || 0} năm</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Môn chuyên môn</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.specialization?.length > 0 ? (
                            profile.specialization.map((spec, index) => (
                              <span key={index} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold border border-indigo-100">
                                {spec}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">Chưa cập nhật</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Giới thiệu bản thân (Bio)</p>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {profile.bio || 'Chưa có thông tin giới thiệu.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && user.role === 'PARENT' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-amber-500 pl-3">Thông tin Phụ huynh</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Nghề nghiệp</p>
                      <p className="text-base text-gray-900 font-semibold">{profile.occupation || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-amber-500 pl-3 mt-6">Danh sách Học viên (Con cái)</h3>
                  
                  {user.linkedStudents && user.linkedStudents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.linkedStudents.map((student, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all group"
                          onClick={() => {
                            navigate(`/admin/users/${student._id}`);
                            window.scrollTo(0,0);
                          }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">{student.name}</p>
                              <p className="text-xs text-emerald-600 font-medium mt-0.5">Học viên</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600 mt-3 pt-3 border-t border-emerald-200/50">
                            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-gray-400" /> Lớp {student.grade || '?'}</span>
                            <span className="flex items-center gap-1 truncate"><GraduationCap className="w-3.5 h-3.5 text-gray-400" /> {student.school || '?'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                     <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <UserIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">Phụ huynh này chưa được liên kết với học viên nào.</p>
                     </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Thay đổi Mật khẩu</h3>
            <form onSubmit={handleChangePassword}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Nhập ít nhất 6 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                  }}
                  disabled={isChangingPassword}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Đang lưu...' : 'Lưu mật khẩu'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetailPage;
