import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';
import { Review } from '../models/index.js';

// @desc    Get all courses (with filters)
// @route   GET /api/courses
export const getCourses = asyncHandler(async (req, res) => {
  const { category, level, search, sort, page = 1, limit = 12, language, minPrice, maxPrice } = req.query;
  const query = { isPublished: true };

  if (category) query.category = category;
  if (level) query.level = level;
  if (language) query.language = language;
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
    { tags: { $in: [new RegExp(search, 'i')] } },
  ];
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortOptions = {
    default: {},
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    popular: { enrolledStudents: -1 },
  };

  const totalCourses = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('instructor', 'name avatar')
    .populate('category', 'name')
    .sort(sortOptions[sort] || {})
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    courses,
    page: Number(page),
    pages: Math.ceil(totalCourses / limit),
    total: totalCourses,
  });
});

// @desc    Get single course
// @route   GET /api/courses/:slug
export const getCourseBySlug = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug })
    .populate('instructor', 'name avatar bio')
    .populate('category', 'name slug');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json(course);
});

// @desc    Create course
// @route   POST /api/courses
export const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create({ ...req.body, instructor: req.user._id });
  res.status(201).json(course);
});

// @desc    Update course
// @route   PUT /api/courses/:id
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  Object.assign(course, req.body);
  await course.save();
  res.json(course);
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  await course.deleteOne();
  res.json({ message: 'Course removed' });
});

// @desc    Get featured courses
// @route   GET /api/courses/featured
export const getFeaturedCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ isFeatured: true, isPublished: true })
    .populate('instructor', 'name avatar')
    .populate('category', 'name')
    .limit(8);
  res.json(courses);
});
