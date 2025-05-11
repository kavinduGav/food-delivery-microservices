const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController.js');
const orderController = require('../controllers/orderController');

const { isCustomer, isRestaurantAdmin } = require('../middleware/auth.js');

// Cart routes
router.get('/cart', isCustomer, cartController.getCart);
router.post('/cart/add', isCustomer, cartController.addToCart);
router.put('/cart/update', isCustomer, cartController.updateCartItem);
router.delete('/cart/item/:menuItemId', isCustomer, cartController.removeFromCart);
router.delete('/cart', isCustomer, cartController.clearCart);

// Order routes
router.post('/orders', isCustomer, orderController.createOrder);
router.get('/orders', isCustomer, orderController.getUserOrders);
router.get('/orders/:id', isCustomer, orderController.getOrderById);
router.put('/orders/:id/cancel', isCustomer, orderController.cancelOrder);
router.get('/orders/:id/track', isCustomer, orderController.trackOrder);
router.put('/orders/:id/updateStatus', isRestaurantAdmin, orderController.updateOrderStatus);
router.get('/orders/restaurant/:id', isRestaurantAdmin, orderController.getOrdersByRestaurant);

module.exports = router;