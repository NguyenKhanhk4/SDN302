import axiosClient from './axiosClient';

export const teacherApi = {
  getDashboard: () => {
    return axiosClient.get('/teacher/dashboard');
  },
  
  getMyClasses: () => {
    return axiosClient.get('/teacher/classes');
  },
  
  getClassDetail: (classId) => {
    return axiosClient.get(`/teacher/classes/${classId}`);
  },
  
  getStudentsInClass: (classId) => {
    return axiosClient.get(`/teacher/classes/${classId}/students`);
  },
  
  getSchedules: () => {
    return axiosClient.get('/teacher/schedules');
  },
  
  getSessionsByClass: (classId) => {
    return axiosClient.get(`/teacher/classes/${classId}/sessions`);
  },
  
  createSession: (classId, data) => {
    return axiosClient.post(`/teacher/classes/${classId}/sessions`, data);
  },
  
  getAttendanceBySession: (classId, sessionId) => {
    return axiosClient.get(`/teacher/classes/${classId}/sessions/${sessionId}/attendance`);
  },
  
  takeAttendance: (classId, sessionId, data) => {
    return axiosClient.post(`/teacher/classes/${classId}/sessions/${sessionId}/attendance`, data);
  },

  uploadSessionMaterials: (classId, sessionId, formData) => {
    return axiosClient.post(`/teacher/classes/${classId}/sessions/${sessionId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteSessionMaterial: (classId, sessionId, fileUrl) => {
    return axiosClient.delete(`/teacher/classes/${classId}/sessions/${sessionId}/file`, { data: { fileUrl } });
  },

  getMySubjects: (params) => {
    return axiosClient.get('/teacher/subjects', { params });
  },

};
