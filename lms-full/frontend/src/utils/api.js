import axios from 'axios';
const API = axios.create({ baseURL: '/api', withCredentials: true });
API.interceptors.request.use(cfg => {
  const u = JSON.parse(localStorage.getItem('lmsUser') || 'null');
  if (u?.token) cfg.headers.Authorization = `Bearer ${u.token}`;
  return cfg;
});
API.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) { localStorage.removeItem('lmsUser'); window.location.href = '/login'; }
  return Promise.reject(err);
});
export const authAPI = { login: d => API.post('/auth/login', d), register: d => API.post('/auth/register', d), getMe: () => API.get('/auth/me'), updateProfile: d => API.put('/auth/profile', d), changePassword: d => API.put('/auth/change-password', d), getNotifications: () => API.get('/auth/notifications'), markNotifsRead: () => API.put('/auth/notifications/read') };
export const userAPI = { getAll: p => API.get('/users', { params: p }), getById: id => API.get(`/users/${id}`), create: d => API.post('/users', d), update: (id, d) => API.put(`/users/${id}`, d), delete: id => API.delete(`/users/${id}`), getTeachers: () => API.get('/users/teachers'), getStudents: p => API.get('/users/students', { params: p }), getActivity: id => API.get(`/users/${id}/activity`) };
export const courseAPI = { getAll: p => API.get('/courses', { params: p }), getById: id => API.get(`/courses/${id}`), create: d => API.post('/courses', d), update: (id, d) => API.put(`/courses/${id}`, d), delete: id => API.delete(`/courses/${id}`), addSection: (id, d) => API.post(`/courses/${id}/sections`, d), deleteSection: (id, sid) => API.delete(`/courses/${id}/sections/${sid}`), addMaterial: (id, sid, d) => API.post(`/courses/${id}/sections/${sid}/materials`, d), deleteMaterial: (id, sid, mid) => API.delete(`/courses/${id}/sections/${sid}/materials/${mid}`) };
export const categoryAPI = { getAll: () => API.get('/categories'), create: d => API.post('/categories', d), update: (id, d) => API.put(`/categories/${id}`, d), delete: id => API.delete(`/categories/${id}`) };
export const enrollmentAPI = { enroll: d => API.post('/enrollments', d), getMy: () => API.get('/enrollments/my'), getAll: p => API.get('/enrollments/all', { params: p }), updateProgress: d => API.put('/enrollments/progress', d), unenroll: id => API.delete(`/enrollments/${id}`) };
export const quizAPI = { create: d => API.post('/quizzes', d), getCourseQuizzes: cid => API.get(`/quizzes/course/${cid}`), getById: id => API.get(`/quizzes/${id}`), update: (id, d) => API.put(`/quizzes/${id}`, d), delete: id => API.delete(`/quizzes/${id}`), submit: d => API.post('/quizzes/submit', d), getMyAttempts: id => API.get(`/quizzes/${id}/my-attempts`), getResults: id => API.get(`/quizzes/${id}/results`) };
export const assignmentAPI = { create: d => API.post('/assignments', d), getCourseAssignments: cid => API.get(`/assignments/course/${cid}`), getById: id => API.get(`/assignments/${id}`), update: (id, d) => API.put(`/assignments/${id}`, d), delete: id => API.delete(`/assignments/${id}`), submit: (id, d) => API.post(`/assignments/${id}/submit`, d), getSubmissions: id => API.get(`/assignments/${id}/submissions`), grade: (id, d) => API.put(`/assignments/submissions/${id}/grade`, d) };
export const analyticsAPI = { admin: () => API.get('/analytics/admin'), teacher: () => API.get('/analytics/teacher'), student: () => API.get('/analytics/student') };
export default API;
