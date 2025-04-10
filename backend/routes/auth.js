const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { registerUser, loginUser, getUserProfile, logoutUser, heartbeat } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  registerUser
);

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  loginUser
);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   POST /api/auth/logout
// @desc    Logout user and clear cookies
// @access  Public
router.post('/logout', logoutUser);

// @route   GET /api/auth/heartbeat
// @desc    Heartbeat to keep session alive
// @access  Private
router.get('/heartbeat', protect, heartbeat);

module.exports = router;
