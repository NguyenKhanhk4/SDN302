import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { ArrowLeft, CheckSquare, Save, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { downloadFile, getFileUrl } from '../../utils/fileUtils';

const SuccessToast = ({ message, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed top-6 right-6 z-[200] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-600/30 min-w-[280px]">
        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-sm">Thành công!</p>
          <p className="text-emerald-100 text-xs mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  );
};

const TeacherAttendancePage = () => {
  const { classId, sessionId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [attendanceForm, setAttendanceForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [classInfo, setClassInfo] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  const [materialFiles, setMaterialFiles] = useState([]);
  const [uploadingMaterials, setUploadingMaterials] = useState(false);
  const materialInputRef = React.useRef(null);

  useEffect(() => {
    fetchData();
  }, [classId, sessionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage('');

      const [studentsData, attendanceData, classRes, sessionsRes] = await Promise.all([
        teacherApi.getStudentsInClass(classId),
        teacherApi.getAttendanceBySession(classId, sessionId).catch(err => {
          console.warn("No existing attendance found or handled expected error:", err);
          return { attendances: [] };
        }),
        teacherApi.getClassDetail(classId).catch(() => null),
        teacherApi.getSessionsByClass(classId).catch(() => null)
      ]);

      if (classRes) {
        setClassInfo(classRes.data || classRes);
      }

      if (sessionsRes) {
        const sessionList = Array.isArray(sessionsRes) ? sessionsRes 
          : (sessionsRes.sessions || sessionsRes.data || []);
        const currentSession = sessionList.find(s => (s._id || s.id) === sessionId);
        if (currentSession) setSessionInfo(currentSession);
      }

      let studentList = [];
      if (Array.isArray(studentsData)) studentList = studentsData;
      else if (studentsData?.students) studentList = studentsData.students;
      else if (studentsData?.data) studentList = studentsData.data;

      setStudents(studentList);

      let existingAttList = [];
      if (Array.isArray(attendanceData)) existingAttList = attendanceData;
      else if (attendanceData?.attendances) existingAttList = attendanceData.attendances;
      else if (attendanceData?.data) existingAttList = attendanceData.data;

      const attMap = {};
      existingAttList.forEach(att => {
        const sId = att.studentId?._id || att.studentId || att.student;
        if (sId) {
          attMap[sId] = {
            status: att.status || 'PRESENT',
            note: att.note || ''
          };
        }
      });

      const initialForm = {};
      studentList.forEach(item => {
        const sId = item?.studentId?._id || item?.studentId || item?._id || item?.id;
        if (sId) {
          const existing = attMap[sId];
          initialForm[sId] = {
            status: existing ? existing.status : null,
            note: existing ? existing.note : ''
          };
        }
      });

      setAttendanceForm(initialForm);
    } catch (err) {
      setError(err.message || err.error || 'Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getStudentInfo = (item) => {
    const user = item?.studentId?.userId || item?.studentId || item?.userId || item?.student || item;
    const sId = item?.studentId?._id || item?.studentId || item?._id || item?.id;
    return {
      id: sId,
      name: user?.fullName || user?.name || 'Không xác định',
      email: user?.email || 'Không có'
    };
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceForm(prev => {
      const currentStatus = prev[studentId]?.status;
      const newStatus = currentStatus === status ? null : status;
      return {
        ...prev,
        [studentId]: { ...prev[studentId], status: newStatus }
      };
    });
    if (successMessage) setSuccessMessage('');
  };

  const handleNoteChange = (studentId, note) => {
    setAttendanceForm(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], note }
    }));
    if (successMessage) setSuccessMessage('');
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');
      setToast(null);

      const attendances = Object.keys(attendanceForm).map(sId => ({
        studentId: sId,
        status: attendanceForm[sId].status,
        note: attendanceForm[sId].note
      }));

      await teacherApi.takeAttendance(classId, sessionId, { attendances });
      
      const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
      setToast({ message: `Đã lưu điểm danh: ${presentCount}/${attendances.length} học sinh có mặt` });
      setSuccessMessage('Lưu thông tin điểm danh thành công!');
      
      await fetchData();
      setTimeout(() => {
        navigate(`/teacher/classes/${classId}/sessions`);
      }, 1500);
    } catch (err) {
      setError(err.message || err.error || 'Không thể lưu điểm danh. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadMaterials = async (e) => {
    e.preventDefault();
    if (materialFiles.length === 0) return;

    try {
      setUploadingMaterials(true);
      const formData = new FormData();
      materialFiles.forEach(file => {
        formData.append('materials', file);
      });

      const res = await teacherApi.uploadSessionMaterials(classId, sessionId, formData);
      if (res.success) {
        setToast({ message: 'Đã tải lên tài liệu buổi học' });
        setMaterialFiles([]);
        if (materialInputRef.current) materialInputRef.current.value = '';
        fetchData();
      }
    } catch (err) {
      setError('Lỗi khi tải lên tài liệu: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingMaterials(false);
    }
  };

  const handleDeleteMaterial = async (fileUrl) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    try {
      const res = await teacherApi.deleteSessionMaterial(classId, sessionId, fileUrl);
      if (res.success) {
        setToast({ message: 'Đã xóa tài liệu' });
        fetchData();
      }
    } catch (err) {
      setError('Lỗi khi xóa tài liệu: ' + (err.response?.data?.message || err.message));
    }
  };

  const getFileName = (pathStr) => {
    if (!pathStr) return '';
    const parts = pathStr.split(/[\/\\]/);
    return parts[parts.length - 1];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Đang tải dữ liệu điểm danh..." />
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <SuccessToast
          message={toast.message}
          onDone={() => setToast(null)}
        />
      )}
      <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <span className="cursor-pointer hover:text-blue-500 transition-colors" onClick={() => navigate('/teacher/classes')}>Lớp học</span>
            <span>›</span>
            <span className="cursor-pointer hover:text-blue-500 transition-colors" onClick={() => navigate(`/teacher/classes/${classId}/sessions`)}>
              {classInfo?.name || 'Chi tiết lớp'}
            </span>
            <span>›</span>
            <span className="text-blue-600 font-semibold">Điểm danh</span>
          </p>

          <button 
            onClick={() => navigate(`/teacher/classes/${classId}/sessions`)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Quay lại</span>
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Điểm danh <span className="text-slate-300">|</span> 
            <span className="text-blue-600">{classInfo?.name || '...'}</span>
          </h1>
          {sessionInfo && (
            <div className="mt-2 text-sm text-slate-600 font-medium">
              <p>Chủ đề: <span className="text-slate-800">{sessionInfo.topic || 'Chưa có chủ đề'}</span></p>
              <p className="text-xs text-slate-500 mt-0.5">
                Ngày: {new Date(sessionInfo.sessionDate || sessionInfo.date).toLocaleDateString('vi-VN')}
                {sessionInfo.room && ` - Phòng: ${sessionInfo.room}`}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          Tài liệu buổi học
        </h2>
        
        {sessionInfo?.materials && sessionInfo.materials.length > 0 ? (
          <div className="space-y-2 mb-4">
            {sessionInfo.materials.map((mat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-sm font-medium text-slate-700 truncate">{getFileName(mat)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadFile(getFileUrl(mat), getFileName(mat))}
                    className="px-3 py-1.5 text-xs font-bold bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors shrink-0"
                  >
                    Tải về
                  </button>
                  <button 
                    onClick={() => handleDeleteMaterial(mat)}
                    className="px-3 py-1.5 text-xs font-bold bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors shrink-0"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic mb-4">Chưa có tài liệu nào cho buổi học này.</p>
        )}

        <form onSubmit={handleUploadMaterials} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
          <input 
            type="file" 
            ref={materialInputRef}
            multiple 
            onChange={(e) => setMaterialFiles(Array.from(e.target.files))}
            className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
          />
          <button 
            type="submit"
            disabled={uploadingMaterials || materialFiles.length === 0}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shrink-0"
          >
            {uploadingMaterials ? 'Đang tải lên...' : 'Tải lên tài liệu'}
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-start gap-3">
          <AlertCircle className="text-rose-500 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-sm">Lỗi</p>
            <p className="text-sm mt-1">{error}</p>
            <button onClick={fetchData} className="mt-2 text-sm font-medium text-rose-800 hover:underline focus:outline-none">Thử lại</button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-3">
          <UserCheck className="text-emerald-500" size={20} />
          <p className="font-semibold text-sm">{successMessage}</p>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
            <CheckSquare size={18} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Danh sách học viên</h2>
        </div>

        {students.length === 0 ? (
          <EmptyState 
            title="Không có học viên" 
            description="Không có học viên nào trong lớp này để thực hiện điểm danh."
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-16">STT</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Học viên</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((item, index) => {
                    const info = getStudentInfo(item);
                    if (!info.id) return null;
                    
                    const formRow = attendanceForm[info.id] || { status: 'PRESENT', note: '' };

                    return (
                      <tr key={info.id || index} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="p-4 text-sm text-slate-600">{index + 1}</td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shadow-inner">
                              {info.name.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{info.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {info.email}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusChange(info.id, 'ABSENT')}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                formRow.status === 'ABSENT' 
                                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm opacity-100' 
                                  : 'bg-white text-slate-400 border-slate-200 hover:text-rose-400 hover:border-rose-200 opacity-60'
                              }`}
                            >
                              ABSENT
                            </button>
                            <button
                              onClick={() => handleStatusChange(info.id, 'PRESENT')}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                formRow.status === 'PRESENT' 
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm opacity-100' 
                                  : 'bg-white text-slate-400 border-slate-200 hover:text-emerald-400 hover:border-emerald-200 opacity-60'
                              }`}
                            >
                              PRESENT
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            placeholder="Nhập ghi chú thêm..."
                            value={formRow.note}
                            onChange={(e) => handleNoteChange(info.id, e.target.value)}
                            className="w-full text-sm border border-slate-300 rounded-xl py-2 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all placeholder:text-slate-400"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end p-6 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={handleSaveAttendance} 
                disabled={saving || students.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Đang lưu...
                  </span>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Lưu điểm danh</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendancePage;
