// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');
const config = require('../config/config');

// ---- Specific routes need to come before generic pattern routes ----

// PayHere return and cancel URLs (no protection needed)
router.get('/payhere/return', (req, res) => {
  // Redirect to frontend success page
  res.redirect(`${config.FRONTEND_URL}/payment/success?order_id=${req.query.order_id}`);
});

router.get('/payhere/cancel', (req, res) => {
  // Redirect to frontend cancel page
  res.redirect(`${config.FRONTEND_URL}/payment/cancel?order_id=${req.query.order_id}`);
});

// Webhook routes (no protection needed)
router.post('/webhook/:provider', paymentController.handlePaymentWebhook);

// Generic webhook endpoint for any provider not requiring specific processing
router.post('/webhook', (req, res) => {
  console.log('Generic webhook received:', req.body);
  res.status(200).json({ received: true });
});

// Get payments by order ID (protected)
router.get('/order/:orderId', protect, paymentController.getPaymentsByOrderId);

// User payments history endpoint (protected)
// Uncommented this route to enable user payment history
router.get('/user', protect, paymentController.getUserPayments);

// Initialize a payment (protected)
router.post('/initialize', protect, paymentController.initializePayment);

// Confirm a payment (protected)
router.put('/confirm/:paymentId', protect, paymentController.confirmPayment);

// Get payment by ID (protected)
// This generic pattern route should come last
router.get('/:paymentId', protect, paymentController.getPaymentById);

module.exports = router;