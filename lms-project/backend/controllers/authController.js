import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @desc    Register new student
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const user = await User.create({ name, email, phone, password, role: 'student' });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    token: generateToken(user._id),
  });
});

// @desc    Register teacher/instructor
// @route   POST /api/auth/register-teacher
export const registerTeacher = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const user = await User.create({ name, email, phone, password, role: 'instructor' });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    token: generateToken(user._id),
  });
});

// @desc    Register admin (requires admin secret)
// @route   POST /api/auth/register-admin
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, phone, password, adminSecret } = req.body;

  if (adminSecret !== process.env.ADMIN_SECRET) {
    res.status(401);
    throw new Error('Invalid admin secret key');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, phone, password, role: 'admin', isVerified: true });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    token: generateToken(user._id),
  });
});

// @desc    Login user
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ $or: [{ email }, { phone: email }] });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      wallet: user.wallet,
      enrolledCourses: user.enrolledCourses,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('enrolledCourses', 'title thumbnail slug')
    .populate('wishlist', 'title thumbnail slug price');
  res.json(user);
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const token = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();
  // TODO: Send email with token
  res.json({ message: 'Password reset email sent' });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }
  
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ message: 'Password reset successful', token: generateToken(user._id) });
});
