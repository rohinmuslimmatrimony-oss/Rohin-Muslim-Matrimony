import axios from 'axios';

const isLocalDev = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('10.') ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('172.')
);

const devHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

// In local dev, default to local backend port 5001; in production, use VITE_API_URL or live domain
const rawUrl = isLocalDev 
  ? (import.meta.env.VITE_DEV_API_URL || `http://${devHost}:5001/api`)
  : (import.meta.env.VITE_API_URL || 'https://rohinmuslimmatrimony.com/api');

// 1. Clean the root API server URL (remove trailing slashes and /api if present)
let cleanServerUrl = rawUrl.replace(/\/$/, ''); // Remove trailing slash
if (cleanServerUrl.endsWith('/api')) {
  cleanServerUrl = cleanServerUrl.substring(0, cleanServerUrl.length - 4);
}

export const API_BASE_URL = `${cleanServerUrl}/api`;

// SOCKET_BASE_URL is used for media/image URLs — points to localhost:5001 on dev, production on live
const rawMediaUrl = isLocalDev ? cleanServerUrl : (import.meta.env.VITE_MEDIA_URL || cleanServerUrl);
export const SOCKET_BASE_URL = rawMediaUrl.replace(/\/$/, '');

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
    // If request data is FormData, remove hardcoded Content-Type so browser sets boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
