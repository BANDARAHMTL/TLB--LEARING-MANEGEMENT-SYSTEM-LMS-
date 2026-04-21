// authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { User } from '../models/index.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;
  if (!token) { res.status(401); throw new Error('Not authorized, no token'); }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive) { res.status(401); throw new Error('Account inactive or not found'); }
    next();
  } catch (e) {
    res.status(401);
    throw new Error('Not authorized, token invalid');
  }
});

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role '${req.user.role}' is not authorized for this route`);
  }
  next();
};

export const admin = authorize('admin');
export const teacher = authorize('admin', 'teacher');
export const student = authorize('admin', 'teacher', 'student');
