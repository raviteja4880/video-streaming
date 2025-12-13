import axios from 'axios';

// Automatically picks backend based on environment
const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://video-streaming-backend-5g76.onrender.com/api'); 

const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handler (for logging)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      'API Error:',
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default api;
