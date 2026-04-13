import express from 'express';
import {
  getMyCourses,
  getCourseProgress,
  getCourseMaterials,
  downloadMaterial,
  getCourseQuizzes,
  getQuiz,
  submitQuiz,
  getQuizResult,
  getCourseAssignments,
  getAssignment,
  submitAssignment,
  getMySubmissions,
} from '../controllers/studentController.js';
import { protect, student } from '../middleware/authMiddleware.js';

const router = express.Router();

// All student routes require authentication and student role
router.use(protect, student);

// Courses
router.get('/my-courses', getMyCourses);
router.get('/courses/:courseId/progress', getCourseProgress);

// Materials
router.get('/courses/:courseId/materials', getCourseMaterials);
router.get('/materials/:materialId/download', downloadMaterial);

// Quizzes
router.get('/courses/:courseId/quizzes', getCourseQuizzes);
router.get('/quizzes/:quizId', getQuiz);
router.post('/quizzes/:quizId/submit', submitQuiz);
router.get('/quizzes/:quizId/result', getQuizResult);

// Assignments
router.get('/courses/:courseId/assignments', getCourseAssignments);
router.get('/assignments/:assignmentId', getAssignment);
router.post('/assignments/:assignmentId/submit', submitAssignment);

// Submissions
router.get('/my-submissions', getMySubmissions);

export default router;
