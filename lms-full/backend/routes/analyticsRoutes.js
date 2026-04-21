import express from 'express';
import { getAdminAnalytics, getTeacherAnalytics, getStudentAnalytics } from '../controllers/combinedController.js';
import { protect, admin, teacher } from '../middleware/authMiddleware.js';
const r = express.Router();
r.use(protect);
r.get('/admin', admin, getAdminAnalytics);
r.get('/teacher', teacher, getTeacherAnalytics);
r.get('/student', getStudentAnalytics);
export default r;
