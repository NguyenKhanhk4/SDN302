import { useState, useEffect } from 'react';
import { studentApi } from '../../api/studentApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { 
  Send, 
  History, 
  MessageSquare, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar,
  BookOpen,
  Info
} from 'lucide-react';

const StudentSupportPage = () => {
  // Support requests list
  const [requests, setRequests] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [type, setType] = useState('LEAVE');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [classId, setClassId] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both requests history and classes in parallel
      const [reqRes, classRes] = await Promise.all([
        studentApi.getSupportRequests(),
        studentApi.getClasses()
      ]);

      if (reqRes.success) {
        setRequests(reqRes.data || []);
      } else {
        throw new Error(reqRes.message || 'Không thể tải lịch sử yêu cầu');
      }

      if (classRes.success) {
        setClasses(classRes.data || []);
        // Set default class if available
        if (classRes.data?.length > 0) {
          setClassId(classRes.data[0]._id);
        }
      }
    } catch (err) {
      setError(err.message || err.error || 'Đã xảy ra lỗi khi tải dữ liệu hỗ trợ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setSubmitError('Vui lòng điền đầy đủ tiêu đề và nội dung.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      const postData = {
        type,
        title,
        content,
        classId: type === 'LEAVE' ? classId : undefined,
        sessionDate: type === 'LEAVE' ? sessionDate : undefined,
      };

      const res = await studentApi.createSupportRequest(postData);
      if (res.success) {
        setSubmitSuccess(true);
        setTitle('');
        setContent('');
        setSessionDate('');
        
        // Refresh requests history list
        const updatedReqs = await studentApi.getSupportRequests();
        if (updatedReqs.success) {
          setRequests(updatedReqs.data || []);
        }
      } else {
        throw new Error(res.message || 'Gửi yêu cầu thất bại');
      }
    } catch (err) {
      setSubmitError(err.message || err.error || 'Đã xảy ra lỗi khi gửi yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRequestTypeBadge = (reqType) => {
    switch (reqType) {
      case 'LEAVE':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-50 text-red-700 border border-red-100">Nghỉ học</span>;
      case 'FEEDBACK':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-100">Phản hồi</span>;
      case 'CONTACT':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-100">Liên hệ QL</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-50 text-gray-700 border border-gray-100">{reqType}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <Clock className="h-3 w-3" /> Chờ duyệt
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
            <CheckCircle2 className="h-3 w-3" /> Đã duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            <XCircle className="h-3 w-3" /> Từ chối
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <CheckCircle2 className="h-3 w-3" /> Đã giải quyết
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100">
            {status}
          </span>
        );
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loading text="Đang tải dữ liệu hỗ trợ..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 max-w-xl mx-auto mt-10">
        <p className="font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> Lỗi tải dữ liệu
        </p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Yêu cầu & Hỗ trợ</h1>
        <p className="text-sm text-gray-500 mt-1">Gửi yêu cầu nghỉ học, ý kiến phản hồi hoặc nhắn trực tiếp quản lý trung tâm.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Support Request Form */}
        <div className="lg:col-span-2">
          <Card className="p-5 h-full">
            <div className="border-b border-gray-100 pb-3 mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" /> Tạo yêu cầu mới
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase">Loại yêu cầu</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'LEAVE', name: 'Nghỉ học' },
                    { id: 'FEEDBACK', name: 'Phản hồi' },
                    { id: 'CONTACT', name: 'Liên hệ QL' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                        type === t.id 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leave request extra fields */}
              {type === 'LEAVE' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-100">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Lớp nghỉ học</label>
                    {classes.length === 0 ? (
                      <span className="text-xs text-red-500 block">Em chưa tham gia lớp học nào</span>
                    ) : (
                      <select
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {classes.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Ngày nghỉ học</label>
                    <input
                      type="date"
                      value={sessionDate}
                      required={type === 'LEAVE'}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase">Tiêu đề</label>
                <input
                  type="text"
                  placeholder={
                    type === 'LEAVE' ? 'Ví dụ: Xin nghỉ học ngày...' : 
                    type === 'FEEDBACK' ? 'Ví dụ: Phản hồi về chất lượng phòng học...' : 'Ví dụ: Cần cấp lại bảng điểm...'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/50"
                  required
                />
              </div>

              {/* Content text area */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase">Nội dung chi tiết</label>
                <textarea
                  rows={5}
                  placeholder={
                    type === 'LEAVE' ? 'Ví dụ: Do em bị sốt cao đột ngột nên xin phép được nghỉ học buổi hôm nay...' : 
                    type === 'FEEDBACK' ? 'Hãy viết ý kiến đóng góp của em ở đây...' : 'Viết nội dung câu hỏi hoặc yêu cầu gửi quản lý...'
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/50"
                  required
                />
              </div>

              {/* Feedback messages */}
              {submitError && (
                <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 text-xs bg-green-50 text-green-600 rounded-lg border border-green-100 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Gửi yêu cầu hỗ trợ thành công! Đang chờ quản lý phản hồi.
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all focus:outline-none flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
              >
                {submitting ? 'Đang gửi...' : (
                  <>
                    <Send className="h-4 w-4" /> Gửi yêu cầu hỗ trợ
                  </>
                )}
              </button>
            </form>
          </Card>
        </div>

        {/* Support Request History List */}
        <div className="lg:col-span-3">
          <Card className="p-5 h-full flex flex-col">
            <div className="border-b border-gray-100 pb-3 mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <History className="h-5 w-5 text-blue-500" /> Lịch sử yêu cầu & phản hồi
              </h2>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[520px] pr-1">
              {requests.length === 0 ? (
                <div className="py-24 text-center text-gray-400 space-y-3">
                  <Info className="h-10 w-10 stroke-1 mx-auto text-gray-300" />
                  <p className="text-sm font-medium">Em chưa gửi yêu cầu hỗ trợ nào.</p>
                  <p className="text-xs text-gray-400">Các yêu cầu xin nghỉ học, phản hồi về dịch vụ của em sẽ được ghi nhận tại đây.</p>
                </div>
              ) : (
                requests.map((req) => (
                  <div 
                    key={req._id} 
                    className="p-4 bg-slate-50 border border-gray-100 rounded-2xl space-y-3 hover:bg-slate-100/50 transition-all hover:shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {getRequestTypeBadge(req.type)}
                        <span className="text-[10px] text-gray-400 font-semibold">{formatDate(req.createdAt)}</span>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-bold text-gray-900 text-sm leading-snug">{req.title}</h4>
                      
                      {/* Leave request details */}
                      {req.type === 'LEAVE' && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-blue-700 font-semibold bg-blue-50/50 px-2 py-1 rounded">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" /> Lớp: {req.classId?.name || 'Đã xóa'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> Ngày nghỉ: {formatDate(req.sessionDate)}
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-gray-600 leading-relaxed font-semibold bg-white p-2.5 rounded-xl border border-gray-100/60 whitespace-pre-line">
                        {req.content}
                      </p>
                    </div>

                    {/* Reply section from Manager */}
                    {req.reply ? (
                      <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-xl space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-800 uppercase tracking-wide">
                          <UserCheck className="h-3.5 w-3.5 text-blue-600" /> Phản hồi từ Quản lý:
                        </div>
                        <p className="text-xs text-blue-900 leading-relaxed font-medium whitespace-pre-line pl-0.5">
                          {req.reply}
                        </p>
                      </div>
                    ) : (
                      req.status === 'PENDING' && (
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold pl-0.5">
                          <Info className="h-3.5 w-3.5 text-gray-300" /> Hệ thống đang chuyển tiếp yêu cầu đến bộ phận Quản lý xử lý.
                        </div>
                      )
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentSupportPage;
