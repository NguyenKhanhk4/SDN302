// Chức năng của Manager: API client kết nối Backend thật cho Manager frontend
// (Đã chuyển từ mock data sang axiosClient thật)
import axiosClient from './axiosClient';

export const managerApi = {
  // Dashboard
  getDashboard: () => axiosClient.get('/manager/dashboard'),

  // Students
  getStudents: (params = {}) => axiosClient.get('/manager/students', { params }),
  getStudentDetail: (studentId) => axiosClient.get(`/manager/students/${studentId}`),
  createStudent: (data) => axiosClient.post('/manager/students', data),
  updateStudent: (studentId, data) => axiosClient.put(`/manager/students/${studentId}`, data),
  deleteStudent: (studentId) => axiosClient.delete(`/manager/students/${studentId}`),

  // Parents
  getParents: (params = {}) => axiosClient.get('/manager/parents', { params }),
  getParentDetail: (parentId) => axiosClient.get(`/manager/parents/${parentId}`),
  createParent: (data) => axiosClient.post('/manager/parents', data),
  getParentStudents: (parentId) => axiosClient.get(`/manager/parents/${parentId}/students`),
  linkParentStudent: (parentId, data) => axiosClient.post(`/manager/parents/${parentId}/students`, data),

  // Teachers
  getTeachers: (params = {}) => axiosClient.get('/manager/teachers', { params }),
  getTeacherDetail: (teacherId) => axiosClient.get(`/manager/teachers/${teacherId}`),
  createTeacher: (data) => axiosClient.post('/manager/teachers', data),
  updateTeacher: (teacherId, data) => axiosClient.put(`/manager/teachers/${teacherId}`, data),
  deleteTeacher: (teacherId) => axiosClient.delete(`/manager/teachers/${teacherId}`),
  
  // Subjects
  getSubjects: (params = {}) => axiosClient.get('/manager/subjects', { params }),
  getSubjectDetail: (subjectId) => axiosClient.get(`/manager/subjects/${subjectId}`),
  createSubject: (data) => axiosClient.post('/manager/subjects', data),
  updateSubject: (subjectId, data) => axiosClient.put(`/manager/subjects/${subjectId}`, data),
  deleteSubject: (subjectId) => axiosClient.delete(`/manager/subjects/${subjectId}`),
  
  // Classes
  getClasses: (params = {}) => axiosClient.get('/manager/classes', { params }),
  getClassDetail: (classId) => axiosClient.get(`/manager/classes/${classId}`),
  createClass: (data) => axiosClient.post('/manager/classes', data),
  updateClass: (classId, data) => axiosClient.put(`/manager/classes/${classId}`, data),
  deleteClass: (classId) => axiosClient.delete(`/manager/classes/${classId}`),
  getClassStudents: (classId) => axiosClient.get(`/manager/classes/${classId}/students`),
  addStudentToClass: (classId, data) => axiosClient.post(`/manager/classes/${classId}/students`, data),
  
  // Schedules
  getSchedules: (params = {}) => axiosClient.get('/manager/schedules', { params }),
  getScheduleDetail: (scheduleId) => axiosClient.get(`/manager/schedules/${scheduleId}`),
  createSchedule: (data) => axiosClient.post('/manager/schedules', data),
  updateSchedule: (scheduleId, data) => axiosClient.put(`/manager/schedules/${scheduleId}`, data),
  deleteSchedule: (scheduleId) => axiosClient.delete(`/manager/schedules/${scheduleId}`),
  
  // Invoices
  getInvoices: (params = {}) => axiosClient.get('/manager/invoices', { params }),
  getInvoiceDetail: (invoiceId) => axiosClient.get(`/manager/invoices/${invoiceId}`),
  createInvoice: (data) => axiosClient.post('/manager/invoices', data),
  updateInvoice: (invoiceId, data) => axiosClient.put(`/manager/invoices/${invoiceId}`, data),
  deleteInvoice: (invoiceId) => axiosClient.delete(`/manager/invoices/${invoiceId}`),
  markInvoicePaid: (invoiceId, data) => axiosClient.patch(`/manager/invoices/${invoiceId}/pay`, data),
};
