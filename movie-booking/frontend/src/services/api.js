import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000/api`;
  }

  return 'http://localhost:5000/api';
};

const API_URL = getApiBaseUrl();

const api = axios.create({ baseURL: API_URL });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-handle expired/invalid token globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');

// Movies
export const getMovies = (params) => api.get('/movies', { params });
export const getMovieById = (id) => api.get(`/movies/${id}`);
export const createMovie = (data) => api.post('/movies', data);
export const updateMovie = (id, data) => api.put(`/movies/${id}`, data);
export const deleteMovie = (id) => api.delete(`/movies/${id}`);
export const getAdminMovies = () => api.get('/movies/admin/all');

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/my');
export const getOccupiedSeats = (params) => api.get('/bookings/occupied', { params });
export const getAllBookings = () => api.get('/bookings/all');
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
export const getStats = () => api.get('/bookings/stats');

// Payments
export const createPayment = (data) => api.post('/payments', data);
export const getMyPayments = () => api.get('/payments/my');

export default api;
