import express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, getTeachers, getStudents, getUserActivity } from '../controllers/userController.js';
import { protect, admin, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.route('/').get(admin, getAllUsers).post(admin, createUser);
router.get('/teachers', teacher, getTeachers);
router.get('/students', teacher, getStudents);
router.route('/:id').get(admin, getUserById).put(admin, updateUser).delete(admin, deleteUser);
router.get('/:id/activity', admin, getUserActivity);
export default router;
