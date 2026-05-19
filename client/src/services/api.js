import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 1. Clean the root server URL (remove trailing slashes and /api if present)
let cleanServerUrl = rawUrl.replace(/\/$/, ''); // Remove trailing slash
if (cleanServerUrl.endsWith('/api')) {
  cleanServerUrl = cleanServerUrl.substring(0, cleanServerUrl.length - 4);
}

export const SOCKET_BASE_URL = cleanServerUrl || 'http://localhost:5000';
export const API_BASE_URL = `${SOCKET_BASE_URL}/api`;

// Create custom axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically inject the JWT token
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

// Response interceptor to handle authorization expiration automatically
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect if token is expired/invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      
      // Only redirect if we are not on public pages
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
