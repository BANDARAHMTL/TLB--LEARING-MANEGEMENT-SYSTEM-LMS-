// authRoutes.js
import express from 'express';
import { register, registerTeacher, registerAdmin, login, getMe, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/register', register);
router.post('/register-teacher', registerTeacher);
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;
