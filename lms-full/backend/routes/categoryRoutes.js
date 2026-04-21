// categoryRoutes.js
import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/combinedController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
const r = express.Router();
r.get('/', getCategories);
r.post('/', protect, admin, createCategory);
r.put('/:id', protect, admin, updateCategory);
r.delete('/:id', protect, admin, deleteCategory);
export default r;
