import express from 'express';
import {
  uploadMaterial,
  getCourseMaterials,
  deleteMaterial,
  createQuiz,
  getCourseQuizzes,
  updateQuiz,
  deleteQuiz,
  createAssignment,
  getCourseAssignments,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  getTeacherStats,
} from '../controllers/teacherController.js';
import { protect, instructor } from '../middleware/authMiddleware.js';

const router = express.Router();

// All teacher routes require authentication and instructor role
router.use(protect, instructor);

// Materials
router.post('/courses/:courseId/materials', uploadMaterial);
router.get('/courses/:courseId/materials', getCourseMaterials);
router.delete('/materials/:materialId', deleteMaterial);

// Quizzes
router.post('/courses/:courseId/quizzes', createQuiz);
router.get('/courses/:courseId/quizzes', getCourseQuizzes);
router.put('/quizzes/:quizId', updateQuiz);
router.delete('/quizzes/:quizId', deleteQuiz);

// Assignments
router.post('/courses/:courseId/assignments', createAssignment);
router.get('/courses/:courseId/assignments', getCourseAssignments);
router.put('/assignments/:assignmentId', updateAssignment);
router.delete('/assignments/:assignmentId', deleteAssignment);

// Submissions
router.get('/assignments/:assignmentId/submissions', getAssignmentSubmissions);
router.put('/assignments/:assignmentId/submissions/:studentId', gradeSubmission);

// Stats
router.get('/stats', getTeacherStats);

export default router;
