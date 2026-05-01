import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Workouts
export const generatePlan = (data) => api.post('/workouts/generate', data);
export const getMyPlans = () => api.get('/workouts');
export const getPlan = (id) => api.get(`/workouts/${id}`);
export const deletePlan = (id) => api.delete(`/workouts/${id}`);

// User
export const getProfile = () => api.get('/user/profile');
export const updateProfile = (data) => api.put('/user/profile', data);
export const sendChat = (message) => api.post('/user/chat', { message });
export const getChatHistory = () => api.get('/user/chat/history');

export default api;
