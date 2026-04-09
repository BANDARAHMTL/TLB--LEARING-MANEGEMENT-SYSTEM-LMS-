// userRoutes.js
import express from 'express';
import { updateProfile, toggleWishlist, getAllUsers, markNotificationsRead } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', protect, admin, getAllUsers);
router.put('/profile', protect, updateProfile);
router.post('/wishlist/:courseId', protect, toggleWishlist);
router.put('/notifications/read', protect, markNotificationsRead);

export default router;
