import asyncHandler from 'express-async-handler';
import { User, Enrollment, Course } from '../models/index.js';
import { generateToken, sendSuccess } from '../utils/helpers.js';

// @GET /api/users  (admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20, isActive } = req.query;
  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  sendSuccess(res, { users, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @GET /api/users/:id  (admin)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  sendSuccess(res, user);
});

// @POST /api/users  (admin creates any role)
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, bio, phone } = req.body;
  if (await User.findOne({ email })) { res.status(400); throw new Error('Email already in use'); }
  const user = await User.create({ name, email, password, role: role || 'student', bio, phone });
  sendSuccess(res, {
    _id: user._id, name: user.name, email: user.email,
    role: user.role, isActive: user.isActive,
    token: generateToken(user._id, user.role),
  }, 'User created', 201);
});

// @PUT /api/users/:id  (admin)
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  const { name, email, role, bio, phone, isActive } = req.body;
  user.name = name ?? user.name;
  user.email = email ?? user.email;
  user.role = role ?? user.role;
  user.bio = bio ?? user.bio;
  user.phone = phone ?? user.phone;
  if (isActive !== undefined) user.isActive = isActive;
  if (req.body.password) user.password = req.body.password;
  const updated = await user.save();
  sendSuccess(res, { _id: updated._id, name: updated.name, email: updated.email, role: updated.role, isActive: updated.isActive });
});

// @DELETE /api/users/:id  (admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user._id.toString() === req.user._id.toString()) { res.status(400); throw new Error('Cannot delete yourself'); }
  await user.deleteOne();
  sendSuccess(res, null, 'User deleted');
});

// @GET /api/users/teachers  (admin assigns to courses)
export const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await User.find({ role: 'teacher', isActive: true }).select('name email avatar bio');
  sendSuccess(res, teachers);
});

// @GET /api/users/students  (admin/teacher)
export const getStudents = asyncHandler(async (req, res) => {
  const { courseId } = req.query;
  if (courseId) {
    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'name email avatar lastLogin')
      .sort({ createdAt: -1 });
    return sendSuccess(res, enrollments);
  }
  const students = await User.find({ role: 'student', isActive: true })
    .select('name email avatar lastLogin createdAt')
    .sort({ createdAt: -1 });
  sendSuccess(res, students);
});

// @GET /api/users/:id/activity  (admin)
export const getUserActivity = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.params.id })
    .populate('course', 'title thumbnail')
    .sort({ lastAccessed: -1 });
  sendSuccess(res, enrollments);
});
