import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { Order } from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @desc    Get all users
// @route   GET /api/admin/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(filter);

  res.json({
    users,
    totalUsers: total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});

// @desc    Get single user
// @route   GET /api/admin/users/:userId
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user);
});

// @desc    Create user (any role)
// @route   POST /api/admin/users
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  if (!['student', 'instructor', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role. Must be student, instructor, or admin');
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    isVerified: true,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    message: 'User created successfully',
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:userId
export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, phone, role, isVerified } = req.body;

  const user = await User.findById(req.params.userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }

  if (role && !['student', 'instructor', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  if (role) user.role = role;
  if (isVerified !== undefined) user.isVerified = isVerified;

  await user.save();

  res.json({
    message: 'User updated successfully',
    user: user.toObject({ getters: true, virtuals: true }),
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot delete your own admin account');
  }

  await User.findByIdAndDelete(req.params.userId);

  res.json({ message: 'User deleted successfully' });
});

// @desc    Get all courses
// @route   GET /api/admin/courses
export const getAllCourses = asyncHandler(async (req, res) => {
  const { category, status, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;

  const courses = await Course.find(filter)
    .populate('instructor', 'name email')
    .populate('category', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Course.countDocuments(filter);

  res.json({
    courses,
    totalCourses: total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});

// @desc    Create course (admin)
// @route   POST /api/admin/courses
export const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, instructor, price } = req.body;

  if (!title || !description || !instructor) {
    res.status(400);
    throw new Error('Title, description, and instructor are required');
  }

  const instructorExists = await User.findById(instructor);
  if (!instructorExists || instructorExists.role !== 'instructor') {
    res.status(400);
    throw new Error('Invalid instructor ID');
  }

  const course = await Course.create({
    title,
    description,
    category,
    instructor,
    price: price || 0,
  });

  res.status(201).json(course);
});

// @desc    Update course
// @route   PUT /api/admin/courses/:courseId
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  Object.assign(course, req.body);
  await course.save();

  res.json(course);
});

// @desc    Delete course
// @route   DELETE /api/admin/courses/:courseId
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.courseId);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.json({ message: 'Course deleted successfully' });
});

// @desc    Get all orders
// @route   GET /api/admin/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (status) filter.paymentStatus = status;

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('courses.course', 'title')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments(filter);

  res.json({
    orders,
    totalOrders: total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:orderId
export const updateOrder = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;

  const order = await Order.findById(req.params.orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!['pending', 'completed', 'failed', 'refunded'].includes(paymentStatus)) {
    res.status(400);
    throw new Error('Invalid payment status');
  }

  order.paymentStatus = paymentStatus;
  await order.save();

  res.json({
    message: 'Order updated successfully',
    order,
  });
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const students = await User.countDocuments({ role: 'student' });
  const instructors = await User.countDocuments({ role: 'instructor' });
  const admins = await User.countDocuments({ role: 'admin' });

  const totalCourses = await Course.countDocuments();
  const totalOrders = await Order.countDocuments();
  const completedOrders = await Order.countDocuments({ paymentStatus: 'completed' });
  const totalRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  res.json({
    users: {
      total: totalUsers,
      students,
      instructors,
      admins,
    },
    courses: totalCourses,
    orders: {
      total: totalOrders,
      completed: completedOrders,
    },
    revenue: totalRevenue[0]?.total || 0,
  });
});
