// Purpose: Defines API routes for order management and retrieval endpoints
const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrderById,
    getUserOrders
} = require('../controllers/orders.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *               - cardNumber
 *               - cardHolder
 *               - cardExpiry
 *               - cardCVV
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               shippingAddress:
 *                 type: string
 *               cardNumber:
 *                 type: string
 *               cardHolder:
 *                 type: string
 *               cardExpiry:
 *                 type: string
 *               cardCVV:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authMiddleware, createOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/:id', authMiddleware, getOrderById);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all user orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get('/', authMiddleware, getUserOrders);

module.exports = router;
