const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    // Optional: A conversation might not always be about a specific property
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  // Timestamps will automatically add createdAt and updatedAt
}, { timestamps: true });

// Ensure unique conversations between the same set of participants regarding the same property (if applicable)
// This might be too restrictive if multiple conversations are desired. 
// For simplicity, we'll allow multiple conversations for now and handle uniqueness in route logic if needed.
// conversationSchema.index({ participants: 1, property: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
