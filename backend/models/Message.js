const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true, 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  property: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property' 
  },
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'other']
    },
    url: String,
    public_id: String, 
    name: String
  }],
  isPropertyChat: {
    type: Boolean,
    default: false 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  readAt: {
    type: Date
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Index for faster queries
messageSchema.index({ conversationId: 1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ property: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
