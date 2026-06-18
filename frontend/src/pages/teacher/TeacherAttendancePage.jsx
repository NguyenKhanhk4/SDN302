import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

const normalizeAttendanceStatus = (status) => {
  if (status === "PRESENT" || status === "ABSENT") {
    return status;
  }
  return "";
};

const getStatusButtonClass = (currentStatus, buttonStatus) => {
  const isActive = currentStatus === buttonStatus;

  const baseClass =
    "px-4 py-2 rounded-lg border text-sm transition font-medium";

  if (buttonStatus === "PRESENT") {
    return isActive
      ? `${baseClass} bg-green-100 text-green-700 border-green-300 font-semibold opacity-100`
      : `${baseClass} bg-gray-50 text-gray-400 border-gray-200 opacity-50 hover:opacity-80`;
  }

  if (buttonStatus === "ABSENT") {
    return isActive
      ? `${baseClass} bg-red-100 text-red-700 border-red-300 font-semibold opacity-100`
      : `${baseClass} bg-gray-50 text-gray-400 border-gray-200 opacity-50 hover:opacity-80`;
  }

  return baseClass;
};

const TeacherAttendancePage = () => {
  const { classId, sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const from = searchParams.get('from');
  const isFromSchedule = from === 'schedule';

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
            status: normalizeAttendanceStatus(att.status),
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
            status: existing && existing.status ? existing.status : '', // Default empty
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
      const attendances = [];
      for (const sId of Object.keys(attendanceForm)) {
        const formRow = attendanceForm[sId];
        if (!formRow.status) {
          throw new Error("Vui lòng chọn trạng thái điểm danh cho tất cả học viên.");
        }
        attendances.push({
          studentId: sId,
          status: formRow.status,
          note: formRow.note
        });
      }

      await teacherApi.takeAttendance(classId, sessionId, { attendances });
      
      // Reload data to ensure synchronization FIRST
      await fetchData();
      
      setSuccessMessage('Đã điểm danh xong');
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        setSuccessMessage((current) => current === 'Đã điểm danh xong' ? '' : current);
      }, 3000);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Điểm danh</h1>
          <p className="mt-1 text-sm text-gray-500">Thực hiện hoặc xem lại điểm danh cho buổi học này.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            if (isFromSchedule) {
              navigate('/teacher/schedules');
            } else {
              navigate(`/teacher/classes/${classId}/sessions`);
            }
          }}
        >
          {isFromSchedule ? "← Quay lại lịch dạy" : "← Quay lại danh sách buổi học"}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
          <p className="font-medium">Lỗi</p>
          <p className="text-sm">{error}</p>
          <button onClick={fetchData} className="mt-2 text-sm underline focus:outline-none">Thử lại</button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      <Card className="w-full">
        {students.length === 0 ? (
          <EmptyState 
            title="Không có học viên" 
            description="Không có học viên nào trong lớp này để thực hiện điểm danh."
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 mb-6">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên học viên</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((item, index) => {
                    const info = getStudentInfo(item);
                    if (!info.id) return null;
                    
                    const formRow = attendanceForm[info.id] || { status: '', note: '' };

                    return (
                      <tr key={info.id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{info.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{info.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(info.id, "PRESENT")}
                              className={getStatusButtonClass(formRow.status, "PRESENT")}
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(info.id, "ABSENT")}
                              className={getStatusButtonClass(formRow.status, "ABSENT")}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            placeholder="Ghi chú thêm (nếu có)..."
                            value={formRow.note}
                            onChange={(e) => handleNoteChange(info.id, e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button 
                variant="primary" 
                onClick={handleSaveAttendance} 
                loading={saving}
                disabled={students.length === 0}
              >
                Lưu điểm danh
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeacherAttendancePage;
