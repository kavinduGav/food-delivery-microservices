// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

// Register new user
exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with that email or username already exists'
      });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || 'customer'
    });
    
    await user.save();
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Return user without password
    user.password = undefined;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
    
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login user
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Remove password from response
    user.password = undefined;
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
    
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Google authentication
exports.google = async (req, res) => {
  try {
    const { email, name, photo } = req.body;
    
    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      // Generate random password
      const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      // Create new user
      user = new User({
        username: name.split(' ').join('').toLowerCase() + Math.random().toString(36).slice(-8),
        email,
        password,
        profilePicture: photo
      });
      
      await user.save();
    }
    
    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Remove password from response
    user.password = undefined;
    
    res.status(200).json({
      success: true,
      token,
      user
    });
    
  } catch (error) {
    logger.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
    
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Sign out
exports.signout = (req, res) => {
  res.status(200).json({ message: 'Signout successful' });
};