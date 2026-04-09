import express from 'express';
import asyncHandler from 'express-async-handler';
import { Review } from '../models/index.js';
import Course from '../models/Course.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/course/:courseId', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ course: req.params.courseId })
    .populate('user', 'name avatar');
  res.json(reviews);
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  const { courseId, rating, comment } = req.body;
  const existing = await Review.findOne({ user: req.user._id, course: courseId });
  if (existing) { res.status(400); throw new Error('Already reviewed'); }
  const review = await Review.create({ user: req.user._id, course: courseId, rating, comment });
  // Update course rating
  const reviews = await Review.find({ course: courseId });
  const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  await Course.findByIdAndUpdate(courseId, { rating: avg, numReviews: reviews.length });
  res.status(201).json(review);
}));

export default router;
