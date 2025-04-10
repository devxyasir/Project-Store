const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify token and protect routes
exports.protect = async (req, res, next) => {
  let token;

  console.log('Checking authentication...');
  console.log('Headers auth:', req.headers.authorization ? 'Present' : 'Not present');
  console.log('Cookies:', req.cookies ? 'Present' : 'Not present');
  
  // First check if token exists in cookies (preferred method for security)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('Found token in cookies');
  }
  // Then check headers as fallback
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Found token in authorization header');
  }

  // Check if token exists
  if (!token) {
    console.log('No token found, authentication failed');
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully for user ID:', decoded.id);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log('User not found in database:', decoded.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Set a new token cookie with extended expiration to keep the session alive
    // This implements a sliding session that extends with activity
    const refreshedToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
    
    res.cookie('token', refreshedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
      path: '/'
    });
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Middleware to check if user is admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as an admin'
    });
  }
};
