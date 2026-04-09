import express from 'express';
import {
  getCourses, getCourseBySlug, createCourse,
  updateCourse, deleteCourse, getFeaturedCourses,
} from '../controllers/courseController.js';
import { protect, instructor, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', getCourses);
router.get('/featured', getFeaturedCourses);
router.get('/:slug', getCourseBySlug);
router.post('/', protect, instructor, createCourse);
router.put('/:id', protect, instructor, updateCourse);
router.delete('/:id', protect, admin, deleteCourse);

export default router;
