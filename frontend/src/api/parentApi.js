import axiosClient from './axiosClient';

export const parentApi = {
  getProfile: () => {
    return axiosClient.get('/parent/profile');
  },
  getChildren: () => {
    return axiosClient.get('/parent/children');
  },
  getChildClasses: (childId) => {
    return axiosClient.get(`/parent/children/${childId}/classes`);
  },
  getChildSchedules: (childId) => {
    return axiosClient.get(`/parent/children/${childId}/schedules`);
  },
  getChildGrades: (childId) => {
    return axiosClient.get(`/parent/children/${childId}/grades`);
  },
  getChildTeachers: (childId) => {
    return axiosClient.get(`/parent/children/${childId}/teachers`);
  },
  getClassStudents: (classId) => {
    return axiosClient.get(`/parent/classes/${classId}/students`);
  },
  linkChild: (data) => {
    return axiosClient.post('/parent/children/link', data);
  },
};
