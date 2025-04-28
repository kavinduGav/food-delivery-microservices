// payment-service/config/config.js
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const config = {
  // Server configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://admin:admin1234@cluster0.tayveae.mongodb.net/food_delivery_payment_db?retryWrites=true&w=majority',
  
  // JWT Authentication
  JWT_SECRET: process.env.JWT_SECRET || '35bdba807fbd504850d82daaa1cd4d920ddec97ee33a52f4c9ceac29aa5f2095',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '30d',
  
  // PayHere Configuration
  PAYHERE_MERCHANT_ID: process.env.PAYHERE_MERCHANT_ID || '1230287',
  PAYHERE_SECRET: process.env.PAYHERE_SECRET || 'MTg5OTM5ODQ1MTM4NjMyMzg1MTcyNDc0Njg3ODMyNDUxNDk3NjYz',
  PAYHERE_API_TOKEN: process.env.PAYHERE_API_TOKEN || 'your_payhere_api_token',

   // Email Configuration
   EMAIL_HOST: process.env.EMAIL_HOST,
   EMAIL_PORT: process.env.EMAIL_PORT || 587,
   EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
   EMAIL_USER: process.env.EMAIL_USER,
   EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
   EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@fooddelivery.com',
  
  // Application URLs
  BASE_URL: process.env.BASE_URL || 'http://localhost:3001',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // CORS settings
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Payment settings
  DEFAULT_CURRENCY: 'LKR',
  
  // Other settings
  API_VERSION: 'v1'
};

// Validate required configuration
const requiredConfig = [
  'MONGODB_URI',
  'JWT_SECRET'
];

// In production, ensure all required config values are set
if (config.NODE_ENV === 'production') {
  requiredConfig.forEach((key) => {
    if (!config[key]) {
      throw new Error(`Missing required config: ${key}`);
    }
  });
}

module.exports = config;