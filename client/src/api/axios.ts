import axios, { type InternalAxiosRequestConfig } from 'axios';

// API Base URL (loads from Vite environmental variables, falling back to local port)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically inject JWT token from localStorage into Authorization headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 500 server crashes globally and redirect to /500 error landing page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 500) {
      window.location.href = '/500';
    }
    return Promise.reject(error);
  }
);

export default api;
