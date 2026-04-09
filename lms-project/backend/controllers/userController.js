import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  const { name, bio, phone, language } = req.body;
  user.name = name || user.name;
  user.bio = bio || user.bio;
  user.phone = phone || user.phone;
  user.language = language || user.language;
  if (req.file) user.avatar = req.file.path;
  if (req.body.password) user.password = req.body.password;
  const updated = await user.save();
  res.json({
    _id: updated._id, name: updated.name, email: updated.email,
    avatar: updated.avatar, bio: updated.bio, role: updated.role,
  });
});

// @desc    Toggle wishlist
// @route   POST /api/users/wishlist/:courseId
export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const courseId = req.params.courseId;
  const idx = user.wishlist.indexOf(courseId);
  if (idx === -1) {
    user.wishlist.push(courseId);
  } else {
    user.wishlist.splice(idx, 1);
  }
  await user.save();
  res.json({ wishlist: user.wishlist });
});

// @desc    Get all users (Admin)
// @route   GET /api/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Mark notifications as read
// @route   PUT /api/users/notifications/read
export const markNotificationsRead = asyncHandler(async (req, res) => {
  await User.updateOne(
    { _id: req.user._id },
    { $set: { 'notifications.$[].isRead': true } }
  );
  res.json({ message: 'Notifications marked as read' });
});
