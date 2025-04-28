const Payment = require('../models/Payment');
const payHereService = require('../services/payHereService');
const logger = require('../utils/logger');

// Initialize payment process
const initializePayment = async (req, res) => {
  try {
    const { orderId, amount, currency, paymentMethod, customerDetails } = req.body;
    
    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required payment fields' 
      });
    }

    let paymentDetails = {};
    
    // Handle different payment methods
    if (paymentMethod === 'payhere') {
      // Initialize PayHere payment
      const payHereResponse = await payHereService.initializePayment(
        { 
          orderId, 
          amount: parseFloat(amount).toFixed(2) // Ensure proper formatting
        }, 
        customerDetails || {
          name: req.user.username || 'Test User',
          email: req.user.email || 'test@example.com',
          phone: customerDetails?.phone || '0771234567'
        }
      );
      paymentDetails = payHereResponse;

    
    } else if (paymentMethod === 'cod') {
      // Cash On Delivery
      paymentDetails = { status: 'initialized', method: 'cash on delivery' };
    } else {
      // Fallback for other methods
      paymentDetails = { status: 'initialized' };
    }
    
    // Create a new payment record with user ID
    const payment = new Payment({
      orderId,
      userId: req.user._id, // Add the authenticated user's ID
      amount,
      currency: currency || 'LKR',
      paymentMethod,
      status: 'pending',
      paymentDetails,
      customerDetails: customerDetails || {
        userId: req.user._id,
        name: req.user.username,
        email: req.user.email
      }
    });
    
    await payment.save();
    
    res.status(201).json({
      success: true,
      payment: {
        id: payment._id,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        ...paymentDetails
      }
    });
    
  } catch (error) {
    logger.error('Payment initialization error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { transactionId, status } = req.body;
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found' 
      });
    }
    
    // For PayHere payments
    if (payment.paymentMethod === 'payhere' && transactionId) {
      const verificationResult = await payHereService.verifyPayment(transactionId);
      payment.status = verificationResult.status === 'success' ? 'completed' : 'failed';
      payment.paymentDetails = { ...payment.paymentDetails, ...verificationResult };
      payment.transactionId = transactionId;
    } else if (payment.paymentMethod === 'cod') {
      // For COD, we just update the status
      payment.status = status || 'pending';
    } else {
      // For other payment methods or webhook responses
      payment.status = status || 'completed';
      if (transactionId) {
        payment.transactionId = transactionId;
      }
    }
    
    payment.updatedAt = Date.now();
    await payment.save();
    
    // Send payment confirmation to other services if needed
    // This would typically be done via a message queue in a real system
    
    res.json({
      success: true,
      payment: {
        id: payment._id,
        orderId: payment.orderId,
        status: payment.status,
        transactionId: payment.transactionId
      }
    });
    
  } catch (error) {
    logger.error('Payment confirmation error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    
    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found' 
      });
    }
    
    res.json({
      success: true,
      payment
    });
    
  } catch (error) {
    logger.error('Error fetching payment:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get payments by order ID
const getPaymentsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const payments = await Payment.find({ orderId });
    
    res.json({
      success: true,
      count: payments.length,
      payments
    });
    
  } catch (error) {
    logger.error('Error fetching payments by order ID:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};


// Get payment history by customer ID
const getPaymentsByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const payments = await Payment.find({ 'customerDetails.userId': customerId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: payments.length,
      payments
    });
    
  } catch (error) {
    logger.error('Error fetching payments by customer ID:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Payment webhook handler (for PayHere callbacks)
const handlePaymentWebhook = async (req, res) => {
  try {
    const { provider } = req.params; // 'payhere'
    const webhookData = req.body;
    
    logger.info(`Received ${provider} webhook`, webhookData);
    
    if (provider === 'payhere') {
      // Process PayHere webhook notification
      const paymentInfo = payHereService.processWebhookNotification(webhookData);
      
      if (!paymentInfo.isValid) {
        logger.warn('Invalid PayHere webhook signature');
        return res.status(200).json({ success: false, message: 'Invalid signature' });
      }
      
      // Find payment by order ID
      const payment = await Payment.findOne({ orderId: paymentInfo.orderId });
      
      if (payment) {
        // Update payment with transaction details
        payment.status = paymentInfo.status;
        payment.transactionId = paymentInfo.transactionId;
        payment.paymentDetails = { ...payment.paymentDetails, webhookData };
        payment.updatedAt = Date.now();
        
        await payment.save();
        
        logger.info(`Updated payment ${payment._id} status to ${paymentInfo.status}`);
      } else {
        logger.warn(`Payment not found for order ID: ${paymentInfo.orderId}`);
      }
    }
    
    // Always return 200 OK for webhooks
    res.status(200).json({ success: true, received: true });
    
  } catch (error) {
    logger.error('Webhook processing error:', error);
    
    // Still return 200 to acknowledge receipt of webhook
    res.status(200).json({ 
      received: true,
      error: error.message
    });
  }
};

//method to get user payments
const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: payments.length,
      payments
    });
    
  } catch (error) {
    logger.error('Error fetching user payments:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  initializePayment,
  confirmPayment,
  getPaymentById,
  getPaymentsByOrderId,
  getPaymentsByCustomerId,
  handlePaymentWebhook,
  getUserPayments
};