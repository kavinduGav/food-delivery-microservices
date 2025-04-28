// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, signin, google, getCurrentUser, signout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Auth routes
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', google);
router.get('/me', protect, getCurrentUser);
router.get('/signout', signout);
router.get('/test-auth', protect, (req, res) => {
    res.json({ 
      success: true, 
      message: 'Authentication successful', 
      user: req.user 
    });
  });

module.exports = router;