// categoryRoutes.js
import express from 'express';
import asyncHandler from 'express-async-handler';
import { Category } from '../models/index.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const cats = await Category.find({}).populate('parentCategory', 'name');
  res.json(cats);
}));

router.post('/', protect, admin, asyncHandler(async (req, res) => {
  const cat = await Category.create(req.body);
  res.status(201).json(cat);
}));

router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Category deleted' });
}));

export default router;
