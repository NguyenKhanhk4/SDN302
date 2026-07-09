import React, { useState, useEffect } from 'react';
import { parentApi } from '../../api/parentApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Heart,
  Baby
} from 'lucide-react';

const ParentProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await parentApi.getProfile();
      if (res.success && res.data) {
        setProfileData(res.data);
      } else {
        throw new Error(res.message || 'Không thể tải thông tin hồ sơ');
      }
    } catch (err) {
      setError(err.message || err.error || 'Có lỗi xảy ra khi tải hồ sơ phụ huynh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loading text="Đang tải thông tin hồ sơ..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        <p className="font-medium">Lỗi tải dữ liệu</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchProfile}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const {
    address = '',
    occupation = '',
    phoneNumber = '',
    userId = {},
    children = []
  } = profileData || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header Profile Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Hồ sơ cá nhân</h1>
          <p className="text-sm text-slate-400 mt-1">Thông tin chi tiết tài khoản Phụ huynh</p>
        </div>
        <span className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 fill-indigo-100" /> Phụ huynh
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card: Avatar & Basic Information Summary */}
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center p-6 border border-slate-100 shadow-sm">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg shadow-indigo-500/20">
              {userId.name ? userId.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <h3 className="font-bold text-slate-800 text-lg mt-4 leading-tight">{userId.name || 'Phụ huynh'}</h3>
            <p className="text-xs text-indigo-600 font-semibold mt-1 tracking-wider uppercase">Tài khoản liên kết</p>
            
            <div className="mt-6 pt-6 border-t border-slate-50 text-left space-y-3.5 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">{userId.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{phoneNumber || userId.phone || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Details Panel */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
              <User className="text-indigo-600 h-5 w-5" /> Thông tin chi tiết
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Họ và tên</span>
                <p className="font-bold text-slate-800 text-sm">{userId.name || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nghề nghiệp</span>
                <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  {occupation || 'Chưa cập nhật'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Số điện thoại liên hệ</span>
                <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {phoneNumber || 'Chưa cập nhật'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Địa chỉ email liên kết</span>
                <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {userId.email || 'N/A'}
                </p>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Địa chỉ thường trú</span>
                <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {address || 'Chưa cập nhật'}
                </p>
              </div>
            </div>
          </Card>

          {/* Children Connected */}
          <Card className="p-6 border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
              <Baby className="text-indigo-600 h-5 w-5" /> Con em liên kết ({children.length})
            </h4>

            {children.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-4">Chưa có thông tin con em liên kết với tài khoản này.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {children.map((child, index) => (
                  <div key={child._id || index} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs">
                        {child.name ? child.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{child.name || 'Học sinh'}</p>
                        <p className="text-xs text-slate-400">{child.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParentProfilePage;
