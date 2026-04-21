// authRoutes.js
import express from 'express';
import { register, login, getMe, updateProfile, changePassword, getNotifications, markNotificationsRead, seedAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/upload.js';

const router = express.Router();
router.post('/register', register);
router.post('/seed-admin', seedAdmin);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
export default router;
