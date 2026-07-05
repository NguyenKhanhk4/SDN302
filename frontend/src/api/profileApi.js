import axiosClient from './axiosClient';

const profileApi = {
  getMyProfile: () => {
    return axiosClient.get('/profile/me');
  },
  
  updateMyProfile: (data) => {
    return axiosClient.put('/profile/me', data);
  },
  
  clearMyProfile: () => {
    return axiosClient.patch('/profile/me/clear');
  },

  changePassword: (data) => {
    return axiosClient.put('/profile/me/password', data);
  },

  updateAvatar: (data) => {
    return axiosClient.put('/profile/me/avatar', data);
  }
};

export default profileApi;
