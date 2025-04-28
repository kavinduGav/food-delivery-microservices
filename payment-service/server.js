const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payments', paymentRoutes);


// Basic route for testing
app.get('/', (req, res) => {
  res.send('Payment Service is running');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});