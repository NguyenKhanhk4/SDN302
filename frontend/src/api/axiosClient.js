import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle responses globally (e.g. logouts on 401)
axiosClient.interceptors.response.use(
  (response) => {
    // Only return data to keep it clean
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Automatically logout on 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use window.location to force a full redirect and remount
      window.location.href = '/login';
    }
    
    // Handle error formatting nicely
    throw error.response?.data || error;
  }
);

export default axiosClient;
