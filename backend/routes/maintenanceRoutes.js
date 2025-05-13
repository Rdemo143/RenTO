const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/authMiddleware');
const Maintenance = require('../models/Maintenance');

// Get all maintenance requests (filtered by role)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'tenant') {
      query.tenant = req.user._id;
    } else if (req.user.role === 'owner') {
      query.owner = req.user._id;
    }

    const requests = await Maintenance.find(query)
      .populate('property', 'title address')
      .populate('tenant', 'name email')
      .sort('-createdAt');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new maintenance request
router.post('/', protect, checkRole(['tenant']), async (req, res) => {
  try {
    const { property, description, priority } = req.body;
    const request = new Maintenance({
      property,
      tenant: req.user._id,
      description,
      priority,
      status: 'pending'
    });

    const savedRequest = await request.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update maintenance request status
router.patch('/:id/status', protect, checkRole(['owner', 'admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Maintenance.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    request.status = status;
    if (status === 'completed') {
      request.completedAt = Date.now();
    }

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add comment to maintenance request
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { comment } = req.body;
    const request = await Maintenance.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    request.comments.push({
      user: req.user._id,
      text: comment,
      createdAt: Date.now()
    });

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get maintenance request by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id)
      .populate('property', 'title address')
      .populate('tenant', 'name email')
      .populate('comments.user', 'name role');

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 