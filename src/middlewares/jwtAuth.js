const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Authentication Middleware
const authenticateJWT = async (req, res, next) => {
  try {
    // Get token from headers
    let token;
    
    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check X-Auth-Token header
    else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }
    // Check query parameter
    else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked. Please try again later.'
      });
    }

    // Add user to request object
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    console.error('JWT Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Optional JWT Authentication Middleware (doesn't fail if no token)
const optionalJWT = async (req, res, next) => {
  try {
    // Get token from headers
    let token;
    
    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check X-Auth-Token header
    else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }
    // Check query parameter
    else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return next(); // Continue without authentication
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (user && user.isActive && !user.isLocked) {
      // Add user to request object if valid
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified
      };
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Email Verification Required Middleware
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication required.'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required. Please verify your email address.'
    });
  }

  next();
};

module.exports = {
  authenticateJWT,
  optionalJWT,
  requireEmailVerification
};