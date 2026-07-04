import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const getRoleLabel = (role) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN': return 'Quản trị viên';
    case 'MANAGER': return 'Quản lý';
    case 'TEACHER': return 'Giáo viên';
    case 'STUDENT': return 'Học sinh';
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

const AdminUserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  useEffect(() => {
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

    fetchUserDetail();
  }, [userId]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      setSuccessMsg('');
      const response = await adminApi.updateUserStatus(userId, newStatus);
      if (response.success) {
        setSuccessMsg(`Cập nhật trạng thái người dùng thành "${getStatusLabel(newStatus)}" thành công!`);
        // Reload user details
        const detailRes = await adminApi.getUserDetail(userId);
        if (detailRes.success) {
          setUser(detailRes.data);
        }
      } else {
        setError(response.message || 'Cập nhật trạng thái người dùng thất bại');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi cập nhật trạng thái người dùng');
    } finally {
      setUpdating(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'TEACHER': return 'bg-indigo-100 text-indigo-800';
      case 'STUDENT': return 'bg-emerald-100 text-emerald-800';
      case 'PARENT': return 'bg-amber-100 text-amber-800';
      case 'MANAGER': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <Badge status="ACTIVE" />;
      case 'INACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Không hoạt động</span>;
      case 'BANNED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Bị khóa</span>;
      default:
        return <Badge status={status} />;
    }
  };

  if (loading) {
    return <Loading text="Đang tải thông tin người dùng..." />;
  }

  if (error || !user) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
          {error || 'Không tìm thấy người dùng'}
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
          Quay lại Danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết Người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý hồ sơ và trạng thái tài khoản của người dùng.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="primary" onClick={() => navigate(`/admin/users/${userId}/edit`)}>
            Chỉnh sửa
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/users')}>
            Quay lại Danh sách
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 bg-green-50 text-green-600 rounded-lg border border-green-100 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Detail Card */}
      <Card>
        <div className="space-y-6">
          {/* User Meta */}
          <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border border-primary/20">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{user.fullName}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Vai trò</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Trạng thái</span>
              <div className="mt-1">{getStatusBadge(user.status)}</div>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Số điện thoại</span>
              <span className="text-sm text-gray-900 mt-1 block">{user.phone || 'Chưa cập nhật'}</span>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Ngày tham gia</span>
              <span className="text-sm text-gray-900 mt-1 block">
                {new Date(user.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-3">
            {user.status !== 'ACTIVE' && (
              <Button
                variant="primary"
                onClick={() => handleUpdateStatus('ACTIVE')}
                loading={updating}
              >
                Kích hoạt
              </Button>
            )}

            {user.status === 'ACTIVE' && (
              <Button
                variant="outline"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
                onClick={() => handleUpdateStatus('INACTIVE')}
                loading={updating}
              >
                Ngưng hoạt động
              </Button>
            )}

            {user.status !== 'BANNED' && (
              <Button
                variant="danger"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleUpdateStatus('BANNED')}
                loading={updating}
              >
                Khóa tài khoản
              </Button>
            )}

            <Button
              variant="danger"
              className="bg-rose-600 hover:bg-rose-700 text-white ml-auto"
              onClick={handleDeleteUser}
              loading={deleting}
            >
              Xóa tài khoản
            </Button>
          </div>

        </div>
      </Card>
    </div>
  );
};

export default AdminUserDetailPage;
