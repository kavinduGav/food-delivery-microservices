const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get user profile
router.get('/me', auth, authController.getMe);

// Verify token
router.get('/verify', auth, authController.verifyToken);

// In auth-service/src/routes/users.js
router.put('/:userId/role', auth, authController.updateUserRole);

module.exports = router;