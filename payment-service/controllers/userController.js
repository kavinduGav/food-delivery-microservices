// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    // Check if user ID matches the authenticated user
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own account'
      });
    }
    
    const { username, email, password, profilePicture } = req.body;
    const updateData = {};
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (profilePicture) updateData.profilePicture = profilePicture;
    
    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
    
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    // Check if user ID matches the authenticated user
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own account'
      });
    }
    
    // Delete user
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User has been deleted'
    });
    
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};