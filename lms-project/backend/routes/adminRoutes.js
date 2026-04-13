import express from 'express';
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getAllOrders,
  updateOrder,
  getDashboardStats,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, admin);

// Users management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUser);
router.post('/users', createUser);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Courses management
router.get('/courses', getAllCourses);
router.post('/courses', createCourse);
router.put('/courses/:courseId', updateCourse);
router.delete('/courses/:courseId', deleteCourse);

// Orders management
router.get('/orders', getAllOrders);
router.put('/orders/:orderId', updateOrder);

// Dashboard stats
router.get('/stats', getDashboardStats);

export default router;
