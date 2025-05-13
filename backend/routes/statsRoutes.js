const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Property = require('../models/Property');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/stats
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const [
      propertyCount,
      tenantCount,
      averageRating
    ] = await Promise.all([
      Property.countDocuments({ status: 'available' }),
      User.countDocuments({ role: 'tenant' }),
      Property.aggregate([
        { $match: { averageRating: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$averageRating' } } }
      ])
    ]);

    const satisfactionRate = averageRating[0]?.avg 
      ? Math.round((averageRating[0].avg / 5) * 100) 
      : 95; // Default to 95% if no ratings

    // Base stats
    const stats = {
      properties: propertyCount || 3,
      tenants: tenantCount || 5,
      revenue: 2500,
      maintenance: 2,
    };

    // Add role-specific mock data
    if (req.user.role === 'owner') {
      stats.recentApplications = [
        {
          id: '1',
          tenant: { name: 'John Doe' },
          property: { title: 'Modern Apartment' },
          status: 'pending'
        },
        {
          id: '2',
          tenant: { name: 'Jane Smith' },
          property: { title: 'Luxury Condo' },
          status: 'approved'
        }
      ];
      
      stats.recentMaintenance = [
        {
          id: '1',
          title: 'Leaking Faucet',
          property: { title: 'Modern Apartment' },
          priority: 'medium'
        },
        {
          id: '2',
          title: 'Broken AC',
          property: { title: 'Luxury Condo' },
          priority: 'high'
        }
      ];
    } 
    
    if (req.user.role === 'tenant') {
      stats.lease = {
        property: { title: 'Luxury Apartment' },
        monthlyRent: 1200,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01')
      };
      
      stats.recentPayments = [
        {
          id: '1',
          amount: 1200,
          date: new Date('2023-06-01'),
          status: 'paid'
        },
        {
          id: '2',
          amount: 1200,
          date: new Date('2023-07-01'),
          status: 'pending'
        }
      ];
    }

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 