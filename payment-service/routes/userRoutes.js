// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// User routes
router.post('/update/:id', protect, updateUser);
router.delete('/delete/:id', protect, deleteUser);

module.exports = router;