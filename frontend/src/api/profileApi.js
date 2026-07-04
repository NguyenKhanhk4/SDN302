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
  }
};

export default profileApi;
