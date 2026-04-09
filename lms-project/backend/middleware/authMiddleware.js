import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// @desc    Protect route for admin only
export const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as admin. Admin access required.');
  }
});

// @desc    Protect route for instructor/teacher (and admin)
export const instructor = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === 'instructor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as instructor. Instructor or Admin access required.');
  }
});

// @desc    Protect route for student
export const student = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as student. Student access required.');
  }
});

// @desc    Protect route for student or instructor or admin
export const studentOrInstructor = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === 'student' || req.user.role === 'instructor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized. Access denied.');
  }
});
