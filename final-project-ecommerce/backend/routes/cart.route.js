// Purpose: Defines API routes for shopping cart management endpoints
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    mergeCart
} = require('../controllers/cart.controller');

// All cart routes require authentication
router.use(authMiddleware);

// GET /api/cart - Get user's cart
router.get('/', getCart);

// POST /api/cart/add - Add item to cart
router.post('/add', addToCart);

// PUT /api/cart/update - Update cart item quantity
router.put('/update', updateCartItem);

// DELETE /api/cart/remove - Remove item from cart
router.delete('/remove', removeFromCart);

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', clearCart);

// POST /api/cart/merge - Merge local cart with user cart
router.post('/merge', mergeCart);

module.exports = router;