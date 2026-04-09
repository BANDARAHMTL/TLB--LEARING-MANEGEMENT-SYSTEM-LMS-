import asyncHandler from 'express-async-handler';
import { Order } from '../models/index.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Create order / enroll
// @route   POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { courseIds, paymentMethod } = req.body;
  const courses = await Course.find({ _id: { $in: courseIds } });
  if (!courses.length) { res.status(404); throw new Error('No courses found'); }

  const orderItems = courses.map((c) => ({ course: c._id, price: c.discountPrice || c.price }));
  const totalAmount = orderItems.reduce((sum, i) => sum + i.price, 0);

  const order = await Order.create({
    user: req.user._id,
    courses: orderItems,
    totalAmount,
    paymentMethod: totalAmount === 0 ? 'free' : paymentMethod,
    paymentStatus: totalAmount === 0 ? 'completed' : 'pending',
  });

  // If free or wallet-paid, auto-enroll
  if (order.paymentStatus === 'completed') {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { enrolledCourses: { $each: courseIds } },
    });
    await Course.updateMany({ _id: { $in: courseIds } }, { $inc: { enrolledStudents: 1 } });
  }

  res.status(201).json(order);
});

// @desc    Get my orders
// @route   GET /api/orders/myorders
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('courses.course', 'title thumbnail slug');
  res.json(orders);
});

// @desc    Update order to paid (Stripe webhook)
// @route   PUT /api/orders/:id/pay
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  order.paymentStatus = 'completed';
  order.stripePaymentIntentId = req.body.paymentIntentId;
  await order.save();
  const courseIds = order.courses.map((i) => i.course);
  await User.findByIdAndUpdate(order.user, {
    $addToSet: { enrolledCourses: { $each: courseIds } },
  });
  await Course.updateMany({ _id: { $in: courseIds } }, { $inc: { enrolledStudents: 1 } });
  res.json(order);
});
