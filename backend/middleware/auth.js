const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user - using decoded.id which is how the token is created in authController.js
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if user is an owner
const isOwner = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Owner privileges required.' });
  }
};

// Middleware to check if user is a tenant
const isTenant = (req, res, next) => {
  if (req.user && req.user.role === 'tenant') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Tenant privileges required.' });
  }
};

module.exports = {
  auth,
  isOwner,
  isTenant
}; 