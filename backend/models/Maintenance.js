const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
maintenanceSchema.index({ property: 1, status: 1 });
maintenanceSchema.index({ tenant: 1, status: 1 });
maintenanceSchema.index({ createdAt: -1 });

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

module.exports = Maintenance; 