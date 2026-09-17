const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { email, phone, password, confirmPassword } = req.body;

    if (!email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all fields (email, phone, password, confirm password).'
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    const cleanPhone = phone.trim();
    if (cleanPhone.length < 7 || !/^[0-9+\-\s()]+$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number.'
      });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match. Please check and try again.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in instead.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email: normalizedEmail,
      phone: cleanPhone,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Redirecting to dashboard...',
      token: generateToken(newUser._id),
      user: {
        id: newUser._id,
        username: newUser.username || newUser.email.split('@')[0],
        email: newUser.email,
        phone: newUser.phone,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Registration Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again later.'
    });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        field: "email",
        message: "Please enter your email."
      });
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      return res.status(400).json({
        success: false,
        field: "password",
        message: "Please enter your password."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        field: "email",
        message: "Invalid email."
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        field: "password",
        message: "Invalid password."
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        username: user.username || user.email.split("@")[0],
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage || ''
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login. Please try again later."
    });
  }
};

// @desc    Update authenticated user profile
// @route   PUT /api/auth/profile
// @access  Private (JWT Protected)
const updateProfile = async (req, res) => {
  try {
    const { username, email, phone } = req.body;
    const cleanUsername = username?.trim();
    const normalizedEmail = email?.trim().toLowerCase();
    const cleanPhone = phone?.trim();

    if (!cleanUsername || !normalizedEmail || !cleanPhone) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and phone number are required.'
      });
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3-30 characters using only letters, numbers, and underscores.'
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (cleanPhone.length < 7 || !/^[0-9+\-\s()]+$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number.'
      });
    }

    const emailOwner = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user._id }
    });

    if (emailOwner) {
      return res.status(400).json({
        success: false,
        message: 'That email address is already in use.'
      });
    }

    const usernameOwner = await User.findOne({
      username: cleanUsername,
      _id: { $ne: req.user._id }
    });

    if (usernameOwner) {
      return res.status(400).json({
        success: false,
        message: 'That username is already in use.'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username: cleanUsername, email: normalizedEmail, phone: cleanPhone },
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Account details updated successfully.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage || '',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update account details.'
    });
  }
};

// @desc    Upload/update profile picture
// @route   PUT /api/auth/profile-image
// @access  Private (JWT Protected)
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file.'
      });
    }

    const imagePath = `/uploads/profile-images/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imagePath },
      { new: true }
    ).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Upload Profile Image Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture.'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  uploadProfileImage
};