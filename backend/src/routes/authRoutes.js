const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// PUT /api/auth/profile - Handles updating username, phone, location, bio, avatar, and password all at once
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, phone, location, bio, avatar, profileImage, password } = req.body;

    // Build update object dynamically
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    
    // Handle avatar / profileImage mapping
    const imageToSave = avatar || profileImage;
    if (imageToSave !== undefined) {
      updateData.avatar = imageToSave;
      updateData.profileImage = imageToSave;
    }

    // Handle password update if provided
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        location: updatedUser.location,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar || updatedUser.profileImage
      }
    });
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating profile' });
  }
});

// PUT /api/auth/profile-image
router.put('/profile-image', protect, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imagePath, avatar: imagePath },
      { new: true }
    );

    res.status(200).json({
      message: 'Profile picture updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error uploading profile picture' });
  }
});

module.exports = router;