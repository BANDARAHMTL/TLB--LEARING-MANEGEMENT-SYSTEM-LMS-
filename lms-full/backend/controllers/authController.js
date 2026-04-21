import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { generateToken, sendSuccess } from '../utils/helpers.js';

// @POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student' } = req.body;
  if (await User.findOne({ email })) { res.status(400); throw new Error('Email already registered'); }
  // Allow admin role if no users exist yet (first admin), otherwise only admin can create admin/teacher accounts
  const userCount = await User.countDocuments();
  const allowedRole = userCount === 0 ? role : (req.user?.role === 'admin' ? role : 'student');
  const user = await User.create({ name, email, password, role: allowedRole });
  sendSuccess(res, {
    _id: user._id, name: user.name, email: user.email,
    role: user.role, avatar: user.avatar,
    token: generateToken(user._id, user.role),
  }, 'Registration successful', 201);
});

// @POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401); throw new Error('Invalid email or password');
  }
  if (!user.isActive) { res.status(403); throw new Error('Account is deactivated'); }
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  sendSuccess(res, {
    _id: user._id, name: user.name, email: user.email,
    role: user.role, avatar: user.avatar, bio: user.bio,
    token: generateToken(user._id, user.role),
  }, 'Login successful');
});

// @GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  sendSuccess(res, user);
});

// @PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, bio, phone } = req.body;
  user.name = name || user.name;
  user.bio = bio ?? user.bio;
  user.phone = phone ?? user.phone;
  if (req.file) user.avatar = `/uploads/images/${req.file.filename}`;
  if (req.body.password) {
    if (req.body.password.length < 6) { res.status(400); throw new Error('Password must be at least 6 chars'); }
    user.password = req.body.password;
  }
  const updated = await user.save();
  sendSuccess(res, {
    _id: updated._id, name: updated.name, email: updated.email,
    role: updated.role, avatar: updated.avatar, bio: updated.bio, phone: updated.phone,
  }, 'Profile updated');
});

// @PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(currentPassword))) {
    res.status(400); throw new Error('Current password incorrect');
  }
  user.password = newPassword;
  await user.save();
  sendSuccess(res, null, 'Password changed successfully');
});

// @GET /api/auth/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('notifications');
  sendSuccess(res, user.notifications.sort((a, b) => b.createdAt - a.createdAt));
});

// @PUT /api/auth/notifications/read
export const markNotificationsRead = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $set: { 'notifications.$[].isRead': true } });
  sendSuccess(res, null, 'Notifications marked as read');
});

// @POST /api/auth/seed-admin - Create first admin (development only)
export const seedAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const adminExists = await User.findOne({ role: 'admin' });
  if (adminExists) { res.status(400); throw new Error('Admin already exists'); }
  if (!email || !password) { res.status(400); throw new Error('Email and password required'); }
  const user = await User.create({ name: name || 'Admin', email, password, role: 'admin' });
  sendSuccess(res, {
    _id: user._id, name: user.name, email: user.email,
    role: user.role, avatar: user.avatar,
    token: generateToken(user._id, user.role),
  }, 'Admin account created', 201);
});
