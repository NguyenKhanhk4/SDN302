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

  // Subjects Management
  getSubjects: (params) => {
    return axiosClient.get('/subject', { params });
  },
  createSubject: (data) => {
    return axiosClient.post('/subject', data);
  },
  updateSubject: (id, data) => {
    return axiosClient.put(`/subject/${id}`, data);
  },
  deleteSubject: (id) => {
    return axiosClient.delete(`/subject/${id}`);
  },
  deleteSubjectFile: (id, fileData) => {
    return axiosClient.delete(`/subject/${id}/file`, { data: fileData });
  },
  uploadSubjectMaterials: (id, formData) => {
    return axiosClient.post(`/subject/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};
