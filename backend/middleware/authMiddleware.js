const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Property = require('../models/Property');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Check user role
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Not authorized, ${req.user.role} role is not allowed to access this resource` 
      });
    }

    next();
  };
};

// Check if user can manage property
const canManageProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (req.user.role === 'admin' || 
        (req.user.role === 'owner' && property.owner.toString() === req.user._id.toString())) {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized to manage this property' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if user can manage tenant
const canManageTenant = async (req, res, next) => {
  try {
    const tenant = await User.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    if (req.user.role === 'admin' || 
        (req.user.role === 'owner' && tenant.owner.toString() === req.user._id.toString())) {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized to manage this tenant' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  protect, 
  checkRole, 
  canManageProperty, 
  canManageTenant 
}; 