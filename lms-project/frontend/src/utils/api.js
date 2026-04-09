import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Attach JWT token from localStorage
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('lmsUser') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
};

// Course endpoints
export const courseAPI = {
  getAll: (params) => API.get('/courses', { params }),
  getFeatured: () => API.get('/courses/featured'),
  getBySlug: (slug) => API.get(`/courses/${slug}`),
  create: (data) => API.post('/courses', data),
  update: (id, data) => API.put(`/courses/${id}`, data),
  delete: (id) => API.delete(`/courses/${id}`),
};

// User endpoints
export const userAPI = {
  updateProfile: (data) => API.put('/users/profile', data),
  toggleWishlist: (courseId) => API.post(`/users/wishlist/${courseId}`),
  markNotificationsRead: () => API.put('/users/notifications/read'),
};

// Order endpoints
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: () => API.get('/orders/myorders'),
  pay: (id, data) => API.put(`/orders/${id}/pay`, data),
};

// Category endpoints
export const categoryAPI = {
  getAll: () => API.get('/categories'),
};

// Review endpoints
export const reviewAPI = {
  getByCourse: (courseId) => API.get(`/reviews/course/${courseId}`),
  create: (data) => API.post('/reviews', data),
};

export default API;
