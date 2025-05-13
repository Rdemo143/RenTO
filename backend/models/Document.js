const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['lease', 'contract', 'invoice', 'receipt', 'other'],
    required: true
  },
  file: {
    url: String,
    public_id: String,
    originalName: String,
    mimeType: String,
    size: Number
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit', 'delete'],
      default: 'view'
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'signed', 'expired'],
    default: 'draft'
  },
  signatures: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    signedAt: Date,
    signatureData: String
  }],
  expiryDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
documentSchema.index({ property: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ status: 1 });

module.exports = mongoose.model('Document', documentSchema); 