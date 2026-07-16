import axiosClient from './axiosClient';

export const studentApi = {
  getDashboard: () => {
    return axiosClient.get('/student/dashboard');
  },
  getClasses: () => {
    return axiosClient.get('/student/classes');
  },
  getSessions: (params) => {
    return axiosClient.get('/student/sessions', { params });
  },
  getInvoices: () => {
    return axiosClient.get('/student/invoices');
  },
  getSupportRequests: () => {
    return axiosClient.get('/student/support');
  },
  createSupportRequest: (data) => {
    return axiosClient.post('/student/support', data);
  },
  getGrades: () => {
    return axiosClient.get('/student/grades');
  },
};
