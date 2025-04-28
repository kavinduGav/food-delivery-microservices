// payment-service/services/emailService.js
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const config = require('../config/config');

// Create reusable transporter
const createTransporter = () => {
  // For development, we'll use a test account
  // In production, you'd use actual SMTP settings from config
  if (config.NODE_ENV === 'development' && !config.EMAIL_HOST) {
    return createTestTransporter();
  }

  // Create a production transporter with actual credentials
  return nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: config.EMAIL_SECURE, // true for 465, false for other ports
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASSWORD,
    },
  });
};

// Create a test account for development
const createTestTransporter = async () => {
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    logger.info('Created test email account', testAccount);

    // Create a test transporter
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    logger.error('Error creating test email transporter:', error);
    throw error;
  }
};

// Send an order confirmation email
const sendOrderConfirmationEmail = async (orderDetails, customerDetails) => {
  try {
    // Create transporter (might be asynchronous for test accounts)
    const transporter = await createTransporter();
    
    // Create email content 
    const { orderId, items, total, deliveryAddress, paymentMethod } = orderDetails;
    const { email, name } = customerDetails;
    
    // Format items for email
    const itemsList = items.map(item => 
      `${item.quantity}x ${item.name} - LKR ${item.price.toFixed(2)}`
    ).join('<br>');
    
    // Build email HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
          <h1 style="color: #0a58ca;">Order Confirmation</h1>
          <p style="font-size: 18px; color: #333;">Thank you for your order!</p>
        </div>
        
        <div style="padding: 20px 0;">
          <p style="font-size: 16px; color: #333;">Hello ${name || 'Customer'},</p>
          <p style="font-size: 16px; color: #333;">Your order has been confirmed and is being processed.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #0a58ca; margin-top: 0;">Order Summary</h2>
            <p style="margin: 8px 0;"><strong>Order ID:</strong> ${orderId}</p>
            <p style="margin: 8px 0;"><strong>Payment Method:</strong> ${
              paymentMethod === 'payhere' ? 'PayHere Online Payment' : 'Cash On Delivery'
            }</p>
            <p style="margin: 8px 0;"><strong>Delivery Address:</strong> ${deliveryAddress}</p>
            
            <h3 style="margin: 15px 0 8px; color: #0a58ca;">Items</h3>
            <div style="margin-bottom: 10px;">
              ${itemsList}
            </div>
            
            <div style="border-top: 1px solid #dee2e6; margin-top: 15px; padding-top: 15px;">
              <p style="font-size: 18px; font-weight: bold; text-align: right;">
                Total: LKR ${total.toFixed(2)}
              </p>
            </div>
          </div>
          
          <p style="font-size: 16px; color: #333;">
            Your food will be prepared with care and delivered to you shortly.
          </p>
          <p style="font-size: 16px; color: #333;">
            Thank you for choosing Food Delivery!
          </p>
        </div>
        
        <div style="border-top: 2px solid #f0f0f0; padding-top: 20px; text-align: center; color: #6c757d; font-size: 14px;">
          <p>If you have any questions, please contact our customer support.</p>
          <p>&copy; ${new Date().getFullYear()} FoodExpress. All rights reserved.</p>
        </div>
      </div>
    `;
    
    // Send email
    const info = await transporter.sendMail({
      from: `"Food Delivery" <${config.EMAIL_FROM || 'noreply@fooddelivery.com'}>`,
      to: email,
      subject: `Order Confirmation #${orderId}`,
      html: htmlContent,
    });
    
    logger.info('Order confirmation email sent', {
      messageId: info.messageId,
      orderId,
      email,
    });
    
    // For development with test email accounts, provide the preview URL
    if (config.NODE_ENV === 'development' && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      logger.info(`Preview URL: ${previewUrl}`);
      return { success: true, previewUrl };
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
};