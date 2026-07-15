import React, { useState, useEffect } from 'react';
import { parentApi } from '../../api/parentApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { toast } from 'react-hot-toast';
import { 
  User, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  Award,
  BookMarked
} from 'lucide-react';

const ParentDashboardPage = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [childDetailLoading, setChildDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  // Child data states
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [grades, setGrades] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  // Classmates lookup state
  const [selectedClassForClassmates, setSelectedClassForClassmates] = useState(null);
  const [classmates, setClassmates] = useState([]);
  const [classmatesLoading, setClassmatesLoading] = useState(false);
  
  // Tab control
  const [activeTab, setActiveTab] = useState('classes');

  // Add child link states
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  const [relationship, setRelationship] = useState('other');
  const [submitting, setSubmitting] = useState(false);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await parentApi.getChildren();
      if (res.success && res.data) {
        setChildren(res.data);
        if (res.data.length > 0) {
          setSelectedChild(res.data[0]);
        }
      } else {
        throw new Error(res.message || 'Không thể tải danh sách con');
      }
    } catch (err) {
      setError(err.message || err.error || 'Có lỗi xảy ra khi tải danh sách con em.');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildDetails = async (childUserId) => {
    if (!childUserId) return;
    try {
      setChildDetailLoading(true);
      setSelectedClassForClassmates(null);
      setClassmates([]);
      
      const [classesRes, schedulesRes, gradesRes, teachersRes] = await Promise.all([
        parentApi.getChildClasses(childUserId),
        parentApi.getChildSchedules(childUserId),
        parentApi.getChildGrades(childUserId),
        parentApi.getChildTeachers(childUserId)
      ]);

      if (classesRes.success) setClasses(classesRes.data || []);
      if (schedulesRes.success) setSchedules(schedulesRes.data || []);
      if (gradesRes.success) setGrades(gradesRes.data || []);
      if (teachersRes.success) setTeachers(teachersRes.data || []);
      
    } catch (err) {
      console.error("Error fetching child details:", err);
    } finally {
      setChildDetailLoading(false);
    }
  };

  const fetchClassmates = async (classId) => {
    try {
      setClassmatesLoading(true);
      const res = await parentApi.getClassStudents(classId);
      if (res.success) {
        setClassmates(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching classmates:", err);
    } finally {
      setClassmatesLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild && selectedChild.userId) {
      fetchChildDetails(selectedChild.userId._id);
    }
  }, [selectedChild]);

  const handleSelectClassmates = (c) => {
    setSelectedClassForClassmates(c);
    fetchClassmates(c.id || c.classId);
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!childEmail) return;
    try {
      setSubmitting(true);
      const res = await parentApi.linkChild({ email: childEmail, relationship });
      if (res.success) {
        toast.success(res.message || 'Liên kết con em thành công!');
        setIsLinkModalOpen(false);
        setChildEmail('');
        setRelationship('other');
        await fetchChildren();
      } else {
        toast.error(res.message || 'Không thể liên kết con em.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi liên kết con em.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getDayName = (dayStr) => {
    const days = {
      '0': 'Chủ Nhật',
      '1': 'Thứ Hai',
      '2': 'Thứ Ba',
      '3': 'Thứ Tư',
      '4': 'Thứ Năm',
      '5': 'Thứ Sáu',
      '6': 'Thứ Bảy',
    };
    return days[dayStr] || dayStr;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loading text="Đang tải thông tin phụ huynh..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        <p className="font-medium">Lỗi tải dữ liệu</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchChildren}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Kính chào Phụ huynh!</h1>
        <p className="mt-2 text-indigo-100 max-w-xl">
          Chào mừng quý phụ huynh đến với Cổng quản lý học tập. Dưới đây là thông tin chi tiết về các con em đang theo học tại trung tâm.
        </p>
      </div>

      {children.length === 0 ? (
        <Card className="text-center py-16 text-gray-500">
          <GraduationCap className="h-16 w-16 mx-auto stroke-1 text-gray-400 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold">Chưa liên kết học sinh</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            Hồ sơ phụ huynh của quý vị hiện tại chưa được liên kết với bất kỳ học sinh nào tại trung tâm.
          </p>
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
          >
            Liên kết con em ngay
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left panel: list of children */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex justify-between items-center pl-1">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Danh sách con em</h3>
              <button
                onClick={() => setIsLinkModalOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                title="Liên kết thêm con"
              >
                + Thêm con
              </button>
            </div>
            <div className="space-y-2">
              {children.map((child) => {
                const childUser = child.userId || {};
                const isSelected = selectedChild && selectedChild._id === child._id;
                return (
                  <button
                    key={child._id}
                    onClick={() => setSelectedChild(child)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 border ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-md shadow-indigo-500/5' 
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {childUser.name ? childUser.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{childUser.name || 'Học sinh'}</p>
                        <p className="text-xs opacity-80 mt-0.5">Khối {child.grade || 'N/A'}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Brief Student Bio */}
            {selectedChild && (
              <Card className="bg-slate-50/50 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thông tin tóm tắt</h4>
                <div className="space-y-3 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Trường học</span>
                    <span className="font-bold text-slate-800">{selectedChild.school || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Địa chỉ Email</span>
                    <span className="font-bold text-slate-800 break-all">{selectedChild.userId?.email || 'N/A'}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right panel: child details (tabs) */}
          <div className="lg:col-span-3 space-y-6">
            {childDetailLoading ? (
              <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-slate-100">
                <Loading text="Đang tải thông tin chi tiết học sinh..." />
              </div>
            ) : (
              <>
                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-200 bg-white p-1.5 rounded-2xl shadow-sm gap-2">
                  {[
                    { id: 'classes', name: 'Lớp học', icon: BookOpen },
                    { id: 'schedules', name: 'Lịch học', icon: Calendar },
                    { id: 'grades', name: 'Kết quả học tập', icon: Award },
                    { id: 'teachers', name: 'Giảng viên', icon: User },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSelectedClassForClassmates(null);
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.name}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                {activeTab === 'classes' && (
                  <div className="space-y-4">
                    {classes.length === 0 ? (
                      <Card className="text-center py-12 text-gray-400">Không tìm thấy thông tin lớp học.</Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {classes.map((cls) => (
                          <Card key={cls.id} className="hover:shadow-md transition-all border border-slate-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-50 text-indigo-600">
                                  {cls.subjectName}
                                </span>
                                <h4 className="text-lg font-bold text-gray-800 mt-2">{cls.className}</h4>
                              </div>
                              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                cls.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {cls.status === 'active' ? 'Đang học' : 'Sắp diễn ra'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-50 text-xs text-gray-600">
                              <div>
                                <span className="text-slate-400">Giảng viên</span>
                                <p className="font-bold text-slate-800 mt-0.5">{cls.teacherName || 'Chưa xếp'}</p>
                              </div>
                              <div>
                                <span className="text-slate-400">Phòng học</span>
                                <p className="font-bold text-slate-800 mt-0.5">Phòng {cls.room || 'Chưa xếp'}</p>
                              </div>
                              <div>
                                <span className="text-slate-400">Thời gian học</span>
                                <p className="font-bold text-slate-800 mt-0.5">{formatDate(cls.startDate)} - {formatDate(cls.endDate)}</p>
                              </div>
                              <div>
                                <span className="text-slate-400">Học phí định mức</span>
                                <p className="font-bold text-indigo-600 mt-0.5">{formatCurrency(cls.subjectTuitionFee)}/buổi</p>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                              <span className="text-[11px] text-gray-400 italic">
                                Sĩ số tối đa: {cls.maxStudents} học viên
                              </span>
                              <button 
                                onClick={() => handleSelectClassmates(cls)}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                              >
                                <Users className="h-3.5 w-3.5" /> Bạn cùng lớp
                              </button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Classmates Section */}
                    {selectedClassForClassmates && (
                      <Card className="border border-indigo-100 bg-indigo-50/5 mt-6 animate-slide-in">
                        <div className="flex justify-between items-center border-b border-slate-200/60 pb-3 mb-4">
                          <h4 className="font-bold text-slate-800 flex items-center gap-2">
                            <Users className="text-indigo-600 h-5 w-5" /> Bạn cùng học lớp {selectedClassForClassmates.className}
                          </h4>
                          <button 
                            onClick={() => setSelectedClassForClassmates(null)}
                            className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                          >
                            Đóng
                          </button>
                        </div>

                        {classmatesLoading ? (
                          <div className="flex justify-center py-8">
                            <Loading text="Đang tải danh sách..." />
                          </div>
                        ) : classmates.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4">Không tìm thấy học sinh nào khác.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {classmates.map((std) => (
                              <div key={std.studentId} className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center gap-3">
                                <div className="h-8 w-8 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center font-bold text-xs">
                                  {std.name ? std.name.charAt(0).toUpperCase() : 'S'}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-xs text-slate-800 truncate">{std.name}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">Khối {std.grade || 'N/A'} - {std.school || 'N/A'}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    )}
                  </div>
                )}

                {activeTab === 'schedules' && (
                  <Card>
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                      <Calendar className="text-indigo-600 h-5 w-5" />
                      <h4 className="font-bold text-slate-800">Thời khóa biểu hàng tuần</h4>
                    </div>

                    {schedules.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">Không có lịch học nào được xếp.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-semibold text-xs uppercase">
                              <th className="py-3 px-2">Ngày học</th>
                              <th className="py-3 px-2">Lớp học</th>
                              <th className="py-3 px-2">Phòng học</th>
                              <th className="py-3 px-2">Thời gian</th>
                              <th className="py-3 px-2">Giảng viên</th>
                              <th className="py-3 px-2">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {schedules.map((sc) => {
                              const tName = (sc.teacherId && sc.teacherId.userId) ? sc.teacherId.userId.name : 'N/A';
                              return (
                                <tr key={sc._id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3.5 px-2 font-bold text-slate-800">{getDayName(sc.dayOfWeek)}</td>
                                  <td className="py-3.5 px-2 font-semibold text-slate-700">{sc.classId?.name || 'N/A'}</td>
                                  <td className="py-3.5 px-2 text-slate-600">Phòng {sc.room || 'N/A'}</td>
                                  <td className="py-3.5 px-2 font-bold text-indigo-600">{sc.startTime} - {sc.endTime}</td>
                                  <td className="py-3.5 px-2 text-slate-500">{tName}</td>
                                  <td className="py-3.5 px-2">
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                      sc.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {sc.status === 'active' ? 'Hoạt động' : 'Hủy bỏ'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                )}

                {activeTab === 'grades' && (
                  <Card>
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                      <Award className="text-indigo-600 h-5 w-5" />
                      <h4 className="font-bold text-slate-800">Kết quả học tập & Điểm số</h4>
                    </div>

                    {grades.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">Chưa cập nhật điểm số nào.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-semibold text-xs uppercase">
                              <th className="py-3 px-2">Môn học / Lớp</th>
                              <th className="py-3 px-2">Cột điểm</th>
                              <th className="py-3 px-2">Điểm số</th>
                              <th className="py-3 px-2">Nhận xét của giảng viên</th>
                              <th className="py-3 px-2">Ngày nhập</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {grades.map((gr) => (
                              <tr key={gr._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-2">
                                  <span className="font-bold text-slate-800 block">{gr.classId?.name || 'N/A'}</span>
                                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{gr.classId?.subjectId?.name || 'N/A'}</span>
                                </td>
                                <td className="py-4 px-2 font-medium text-slate-600">{gr.title || 'Bài kiểm tra'}</td>
                                <td className="py-4 px-2">
                                  <span className={`text-base font-black px-2.5 py-1 rounded-lg ${
                                    gr.value >= 8.0 
                                      ? 'bg-green-50 text-green-600 border border-green-100' 
                                      : gr.value >= 5.0 
                                      ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                      : 'bg-red-50 text-red-600 border border-red-100'
                                  }`}>
                                    {gr.value}
                                  </span>
                                </td>
                                <td className="py-4 px-2 text-slate-600 max-w-xs truncate" title={gr.comment}>
                                  {gr.comment || 'Không có nhận xét'}
                                </td>
                                <td className="py-4 px-2 text-slate-400 text-xs">{formatDate(gr.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                )}

                {activeTab === 'teachers' && (
                  <div className="space-y-4">
                    {teachers.length === 0 ? (
                      <Card className="text-center py-12 text-gray-400">Không tìm thấy giáo viên phụ trách dạy con.</Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {teachers.map((tc) => {
                          const info = tc.teacherInfo || {};
                          const userObj = info.userId || {};
                          return (
                            <Card key={info._id} className="hover:shadow-md transition-all border border-slate-100">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base shadow-inner">
                                  {userObj.name ? userObj.name.charAt(0).toUpperCase() : 'G'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-bold text-slate-800 truncate text-base">{userObj.name || 'Giáo viên'}</h4>
                                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">{info.specialization || 'Chưa xếp môn dạy'}</p>
                                </div>
                              </div>

                              <div className="mt-6 pt-4 border-t border-slate-50 space-y-2 text-xs text-slate-600">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{userObj.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{info.phoneNumber || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <BookMarked className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Kinh nghiệm: {info.experienceYears || 0} năm giảng dạy</span>
                                </div>
                              </div>

                              {tc.classes && tc.classes.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-50">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Lớp đang dạy con</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {tc.classes.map((cl, i) => (
                                      <span key={i} className="px-2 py-1 bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-lg text-[10px] font-semibold text-slate-600 border border-slate-100 transition-colors">
                                        {cl.className} ({cl.subjectName})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal: Liên kết con em */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Liên kết tài khoản con em</h3>
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setChildEmail('');
                  setRelationship('other');
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                Đóng
              </button>
            </div>
            
            <form onSubmit={handleLinkSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email của học sinh</label>
                <input
                  type="email"
                  required
                  placeholder="vi_du@gmail.com"
                  value={childEmail}
                  onChange={(e) => setChildEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Mối quan hệ</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 bg-white"
                >
                  <option value="father">Cha</option>
                  <option value="mother">Mẹ</option>
                  <option value="guardian">Người giám hộ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsLinkModalOpen(false);
                    setChildEmail('');
                    setRelationship('other');
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Đang liên kết...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboardPage;
