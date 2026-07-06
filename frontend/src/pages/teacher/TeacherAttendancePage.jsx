import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { ArrowLeft, CheckSquare, Save, UserCheck, AlertCircle } from 'lucide-react';

const TeacherAttendancePage = () => {
  const { classId, sessionId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [attendanceForm, setAttendanceForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [classId, sessionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage('');

      // Fetch students and existing attendance in parallel
      const [studentsData, attendanceData] = await Promise.all([
        teacherApi.getStudentsInClass(classId),
        teacherApi.getAttendanceBySession(classId, sessionId).catch(err => {
          // If 404 or no attendance yet, gracefully handle it
          console.warn("No existing attendance found or handled expected error:", err);
          return { attendances: [] };
        })
      ]);

      // Normalize students array
      let studentList = [];
      if (Array.isArray(studentsData)) studentList = studentsData;
      else if (studentsData?.students) studentList = studentsData.students;
      else if (studentsData?.data) studentList = studentsData.data;

      setStudents(studentList);

      // Normalize attendance array
      let existingAttList = [];
      if (Array.isArray(attendanceData)) existingAttList = attendanceData;
      else if (attendanceData?.attendances) existingAttList = attendanceData.attendances;
      else if (attendanceData?.data) existingAttList = attendanceData.data;

      // Build dictionary of existing attendance for quick lookup
      const attMap = {};
      existingAttList.forEach(att => {
        // Handle different structures of studentId from backend
        const sId = att.studentId?._id || att.studentId || att.student;
        if (sId) {
          attMap[sId] = {
            status: att.status || 'PRESENT',
            note: att.note || ''
          };
        }
      });

      // Initialize form state using student list as the source of truth
      const initialForm = {};
      studentList.forEach(item => {
        const sId = item?.studentId?._id || item?.studentId || item?._id || item?.id;
        if (sId) {
          const existing = attMap[sId];
          initialForm[sId] = {
            status: existing ? existing.status : 'PRESENT', // Default PRESENT
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
    setAttendanceForm(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
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

      // Build array of attendance objects for the API
      const attendances = Object.keys(attendanceForm).map(sId => ({
        studentId: sId,
        status: attendanceForm[sId].status,
        note: attendanceForm[sId].note
      }));

      await teacherApi.takeAttendance(classId, sessionId, { attendances });
      
      setSuccessMessage('Lưu thông tin điểm danh thành công!');
      
      // Reload data to ensure synchronization
      await fetchData();
    } catch (err) {
      setError(err.message || err.error || 'Không thể lưu điểm danh. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSaving(false);
    }
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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Điểm danh</h1>
          <p className="text-sm text-slate-500 mt-1">Thực hiện hoặc xem lại điểm danh cho buổi học này.</p>
        </div>
        <button 
          onClick={() => navigate(`/teacher/classes/${classId}/sessions`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Danh sách buổi học</span>
        </button>
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
                          <select
                            value={formRow.status}
                            onChange={(e) => handleStatusChange(info.id, e.target.value)}
                            className={`text-sm font-medium border rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors cursor-pointer outline-none appearance-none ${
                              formRow.status === 'PRESENT' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' :
                              formRow.status === 'ABSENT' ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' :
                              formRow.status === 'LATE' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' :
                              'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                            }`}
                          >
                            <option value="PRESENT">✅ Có mặt</option>
                            <option value="ABSENT">❌ Vắng mặt</option>
                            <option value="LATE">⏱️ Đi muộn</option>
                            <option value="EXCUSED">📝 Có phép</option>
                          </select>
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
