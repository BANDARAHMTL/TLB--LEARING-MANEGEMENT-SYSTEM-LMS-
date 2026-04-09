// orderRoutes.js
import express from 'express';
import { createOrder, getMyOrders, updateOrderToPaid } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.put('/:id/pay', protect, updateOrderToPaid);

export default router;
