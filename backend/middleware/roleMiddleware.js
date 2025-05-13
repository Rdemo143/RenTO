const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin has access to everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has any of the required roles
    if (roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
  };
};

// Specific role checks
const isAdmin = checkRole('admin');
const isOwner = checkRole('owner', 'admin');
const isTenant = checkRole('tenant', 'admin');

// Property management permissions
const canManageProperty = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Admin can manage all properties
  if (req.user.role === 'admin') {
    return next();
  }

  // Owner can only manage their own properties
  if (req.user.role === 'owner') {
    if (req.params.propertyId) {
      // Check if the property belongs to the owner
      // This assumes you have a property model with an owner field
      Property.findById(req.params.propertyId)
        .then(property => {
          if (!property) {
            return res.status(404).json({ message: 'Property not found' });
          }
          if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied: Not the property owner' });
          }
          next();
        })
        .catch(err => res.status(500).json({ message: 'Server error' }));
    } else {
      next();
    }
  } else {
    res.status(403).json({ message: 'Access denied: Insufficient permissions' });
  }
};

// Tenant management permissions
const canManageTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Admin can manage all tenants
  if (req.user.role === 'admin') {
    return next();
  }

  // Owner can only manage tenants of their properties
  if (req.user.role === 'owner') {
    if (req.params.tenantId) {
      // Check if the tenant is associated with any of the owner's properties
      // This assumes you have a lease or similar model that connects tenants to properties
      Lease.findOne({ tenant: req.params.tenantId })
        .populate('property')
        .then(lease => {
          if (!lease) {
            return res.status(404).json({ message: 'Tenant not found' });
          }
          if (lease.property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied: Not the property owner' });
          }
          next();
        })
        .catch(err => res.status(500).json({ message: 'Server error' }));
    } else {
      next();
    }
  } else {
    res.status(403).json({ message: 'Access denied: Insufficient permissions' });
  }
};

module.exports = {
  checkRole,
  isAdmin,
  isOwner,
  isTenant,
  canManageProperty,
  canManageTenant
}; 