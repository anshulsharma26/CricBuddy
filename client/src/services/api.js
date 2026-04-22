import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add a request interceptor to include the auth token in headers
api.interceptors.request.use(
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

export const authService = {
  signup: (userData) => api.post('/auth/signup', userData),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const profileService = {
  getMe: () => api.get('/profile/me'),
  updateMe: (userData) => api.put('/profile/me', userData),
  getNearby: (params) => api.get('/profile/nearby', { params }),
  uploadProfilePic: (formData) => api.post('/profile/upload-profile-pic', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export const matchService = {
  create: (matchData) => api.post('/matches', matchData),
  getAll: () => api.get('/matches'),
  getNearby: (params) => api.get('/matches/nearby', { params }),
  join: (id) => api.post(`/matches/${id}/join`),
};

export const chatService = {
  sendMessage: (message, history) => api.post('/chat', { message, history }),
};

export default api;
