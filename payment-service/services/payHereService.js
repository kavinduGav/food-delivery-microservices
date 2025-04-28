// payment-service/services/payHereService.js
const crypto = require('crypto');
const config = require('../config/config');
const logger = require('../utils/logger');

// PayHere API URLs (sandbox vs production)
const PAYHERE_CHECKOUT_URL = config.NODE_ENV === 'production' 
  ? 'https://www.payhere.lk/pay/checkout' 
  : 'https://sandbox.payhere.lk/pay/checkout';

// Generate hash for PayHere payment initialization
const generateHash = (orderId, amount, currency, merchantId, merchantSecret) => {
  const hashString = `${merchantId}${orderId}${amount}${currency}${merchantSecret}`;
  return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
};

// Generate hash for PayHere webhook verification
const generateHashForWebhook = (merchantId, orderId, amount, currency, statusCode) => {
  const hashString = `${merchantId}${orderId}${amount}${currency}${statusCode}${config.PAYHERE_SECRET}`;
  return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
};

// Initialize PayHere payment
const initializePayment = (orderDetails, customerDetails) => {
  try {
    const { orderId, amount } = orderDetails;
    const merchantId = config.PAYHERE_MERCHANT_ID;
    const merchantSecret = config.PAYHERE_SECRET;
    const currency = 'LKR';
    
    // Format amount properly to 2 decimal places
    const formattedAmount = parseFloat(amount).toFixed(2);
    
    // Generate hash for PayHere
    const hash = generateHash(orderId, formattedAmount, currency, merchantId, merchantSecret);
    
    // Construct PayHere payment data
    const payHereData = {
      sandbox: true, // Always include for testing
      merchant_id: merchantId,
      return_url: `${config.FRONTEND_URL}/payment/success`,
      cancel_url: `${config.FRONTEND_URL}/payment/cancel`,
      notify_url: `${config.BASE_URL}/api/payments/webhook/payhere`,
      order_id: orderId,
      items: 'Food Order Payment',
      amount: formattedAmount,
      currency: currency,
      hash: hash,
      first_name: customerDetails.name?.split(' ')[0] || 'Customer',
      last_name: customerDetails.name?.split(' ').slice(1).join(' ') || '',
      email: customerDetails.email || 'customer@example.com', // Provide default values
      phone: customerDetails.phone || '0771234567',
      address: customerDetails.address || 'Test Address',
      city: customerDetails.city || 'Colombo',
      country: 'Sri Lanka'
    };
    
    console.log('Generated PayHere data:', payHereData);
    console.log('Calculated hash:', hash);
    
    return {
      redirectUrl: PAYHERE_CHECKOUT_URL,
      paymentData: payHereData
    };
  } catch (error) {
    logger.error('PayHere initialization error:', error);
    throw new Error(`PayHere initialization error: ${error.message}`);
  }
};

// This function is not using API token - it relies on webhook for verification
const processWebhookNotification = (webhookData) => {
  try {
    const { 
      merchant_id, 
      order_id, 
      payment_id, 
      payhere_amount, 
      payhere_currency, 
      status_code, 
      md5sig 
    } = webhookData;
    
    // Verify the notification is authentic using the MD5 hash
    const expectedHash = generateHashForWebhook(
      merchant_id, 
      order_id, 
      payhere_amount, 
      payhere_currency, 
      status_code
    );
    
    // Check if hash matches
    const hashValid = md5sig === expectedHash;
    
    // Parse status
    // PayHere status codes: 2 = success, 0 = pending, -1 = canceled, -2 = failed
    let status;
    switch (parseInt(status_code)) {
      case 2:
        status = 'completed';
        break;
      case 0:
        status = 'pending';
        break;
      case -1:
      case -2:
        status = 'failed';
        break;
      default:
        status = 'unknown';
    }
    
    return {
      isValid: hashValid,
      transactionId: payment_id,
      orderId: order_id,
      amount: payhere_amount,
      currency: payhere_currency,
      status: status,
      paymentMethod: 'payhere',
      rawData: webhookData
    };
  } catch (error) {
    logger.error('PayHere webhook processing error:', error);
    throw new Error(`PayHere webhook processing error: ${error.message}`);
  }
};

module.exports = {
  initializePayment,
  processWebhookNotification,
  generateHash,
  generateHashForWebhook
};