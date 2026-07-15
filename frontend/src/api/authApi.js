import axiosClient from './axiosClient';

export const authApi = {
  login: (data) => {
    return axiosClient.post('/auth/login', data);
  },
  googleLogin: (idToken) => {
    return axiosClient.post('/auth/google', { idToken });
  },
  googleRegister: (data) => {
    return axiosClient.post('/auth/google/register', data);
  }
};
