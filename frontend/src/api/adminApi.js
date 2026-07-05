import axiosClient from './axiosClient';

export const adminApi = {
  // 1. Dashboard
  getDashboard: () => {
    return axiosClient.get('/admin/dashboard');
  },

  // 2. User Management
  getUsers: (params) => {
    return axiosClient.get('/admin/users', { params });
  },

  getUserDetail: (userId) => {
    return axiosClient.get(`/admin/users/${userId}`);
  },

  createUser: (userData) => {
    return axiosClient.post('/admin/users', userData);
  },

  updateUserStatus: (userId, status) => {
    return axiosClient.patch(`/admin/users/${userId}/status`, { status });
  },

  updateUser: (userId, userData) => {
    return axiosClient.patch(`/admin/users/${userId}`, userData);
  },

  deleteUser: (userId) => {
    return axiosClient.delete(`/admin/users/${userId}`);
  },

  // 3. Class Management
  getClasses: (params) => {
    return axiosClient.get('/admin/classes', { params });
  },

  getClassDetail: (classId) => {
    return axiosClient.get(`/admin/classes/${classId}`);
  },

  createClass: (classData) => {
    return axiosClient.post('/admin/classes', classData);
  },

  getClassStudents: (classId) => {
    return axiosClient.get(`/admin/classes/${classId}/students`);
  },

  // 4. Schedule Management
  getSchedules: (params) => {
    return axiosClient.get('/admin/schedules', { params });
  },

  createSchedule: (scheduleData) => {
    return axiosClient.post('/admin/schedules', scheduleData);
  },

  // 5. Enrollments (Phase 2)
  getEnrollments: (params) => {
    return axiosClient.get('/enrollment', { params });
  },
  approveEnrollment: (id) => {
    return axiosClient.put(`/enrollment/${id}/approve`);
  },
  updateEnrollmentStatus: (id, status) => {
    return axiosClient.put(`/enrollment/${id}/status`, { status });
  },

  // 6. Subjects (Phase 1)
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
  },

  // 7. Finance & Payroll (Phase 3)
  getInvoices: () => {
    return axiosClient.get('/finance/invoices');
  },
  getPayrolls: () => {
    return axiosClient.get('/finance/payrolls');
  },
  payInvoice: (id, data) => {
    return axiosClient.post(`/finance/invoice/${id}/pay`, data);
  },
  calculatePayroll: (data) => {
    return axiosClient.post('/finance/payroll/calculate', data);
  },
  calculateAllPayrolls: () => {
    return axiosClient.post('/finance/payroll/calculate-all');
  },

  // 8. Reports (Phase 4)
  getEnrollmentTrends: (year) => {
    return axiosClient.get(`/report/trends/enrollment${year ? `?year=${year}` : ''}`);
  },
  exportRevenueReport: (year) => {
    return axiosClient.get(`/report/export/revenue${year ? `?year=${year}` : ''}`, {
      responseType: 'blob'
    });
  }
};
