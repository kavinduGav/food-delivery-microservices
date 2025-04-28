// Note: You'll need to install the stripe package
// npm install stripe

const dotenv = require('dotenv');
dotenv.config();

// In a real scenario, this would come from your .env file
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'your_test_key';
const stripe = require('stripe')(STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, currency = 'lkr') => {
  try {
    // For sandbox/development purposes only
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: currency,
      payment_method_types: ['card'],
    });
    
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Stripe service error:', error);
    throw new Error(`Payment processing error: ${error.message}`);
  }
};

const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      status: paymentIntent.status,
      details: paymentIntent,
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw new Error(`Payment confirmation error: ${error.message}`);
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
};