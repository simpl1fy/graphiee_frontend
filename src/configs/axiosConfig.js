import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 seconds timeout
});

// // Request interceptor for adding auth tokens if needed
// api.interceptors.request.use(
//   (config) => {
//     // Add auth token if available
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for handling common errors
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Handle common errors like 401, 403, etc.
//     if (error.response?.status === 401) {
//       // Redirect to login or refresh token
//       console.log('Unauthorized, redirecting to login...');
//       // window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

export default api;