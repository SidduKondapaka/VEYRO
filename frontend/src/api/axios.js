import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('veyro_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token expiry handling & HTML response prevention
api.interceptors.response.use(
  (response) => {
    // If backend is remote/offline and Vercel returns index.html for /api requests, reject so caller catches it
    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
      return Promise.reject(new Error('API returned HTML instead of JSON. Backend may not be configured.'));
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on login/auth routes, clear storage
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('veyro_token');
        localStorage.removeItem('veyro_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
