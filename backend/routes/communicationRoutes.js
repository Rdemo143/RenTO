const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User'); // Needed to check if participant exists

// @desc    Get or create a conversation
// @route   POST /api/communications/conversations
// @access  Private
// Body should contain: recipientId (ObjectId of the other user)
// And optionally: propertyId (ObjectId of the property, if relevant)
router.post('/conversations', protect, async (req, res) => {
  const { recipientId, propertyId } = req.body;
  const senderId = req.user._id;

  if (!recipientId) {
    return res.status(400).json({ message: 'Recipient ID is required' });
  }

  if (senderId.toString() === recipientId.toString()) {
    return res.status(400).json({ message: 'Cannot create a conversation with yourself' });
  }

  try {
    // Check if recipient exists
    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    const participants = [senderId, recipientId].sort(); // Sort to ensure consistent order for querying

    let query = {
      participants: { $all: participants, $size: participants.length }
    };

    if (propertyId) {
      query.property = propertyId;
    } else {
      // If no propertyId, ensure we look for conversations that also don't have a propertyId
      // or handle general conversations differently based on requirements.
      // For now, if propertyId is null/undefined, we assume it's a general chat not tied to a property.
      query.property = null;
    }

    let conversation = await Conversation.findOne(query);

    if (!conversation) {
      conversation = await Conversation.create({
        participants: participants,
        property: propertyId || null, // Ensure property is explicitly null if not provided
      });
    }

    // Populate participant details (optional, based on frontend needs)
    conversation = await conversation.populate('participants', 'name email role');
    if (conversation.property) {
        conversation = await conversation.populate('property', 'title address');
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Send a message
// @route   POST /api/communications/messages
// @access  Private
// Body should contain: conversationId, content, and optionally attachments
router.post('/messages', protect, async (req, res) => {
  const { conversationId, content, attachments } = req.body;
  const senderId = req.user._id;

  if (!conversationId || !content) {
    return res.status(400).json({ message: 'Conversation ID and content are required' });
  }

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Ensure the sender is part of the conversation
    if (!conversation.participants.map(p => p.toString()).includes(senderId.toString())) {
      return res.status(403).json({ message: 'User not authorized to send messages in this conversation' });
    }

    const newMessage = await Message.create({
      conversationId,
      sender: senderId,
      // receiver might be derivable or explicitly passed if direct within conversation
      content,
      attachments: attachments || [],
      // property could be linked here too if Message model requires it independently of Conversation
    });

    // Update conversation's lastMessage and save
    conversation.lastMessage = newMessage._id;
    await conversation.save();

    // Populate sender details for the new message to be returned
    const populatedMessage = await Message.findById(newMessage._id)
                                      .populate('sender', 'name email role')
                                      .populate('conversationId'); // Optional: populate conversation details too
    
    // TODO: WebSocket event emission for real-time message
    // req.io.to(conversationId).emit('newMessage', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all conversations for the current user
// @route   GET /api/communications/conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name email role') // Populate participant details
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name email role' } // Populate sender of last message
      })
      .populate('property', 'title address photos') // Populate property details if linked
      .sort({ updatedAt: -1 }); // Sort by most recently updated

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get messages for a specific conversation
// @route   GET /api/communications/conversations/:conversationId/messages
// @access  Private
router.get('/conversations/:conversationId/messages', protect, async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  try {
    // First, verify the user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participants.map(p => p.toString()).includes(userId.toString())) {
      return res.status(403).json({ message: 'User not authorized to view these messages' });
    }

    // Fetch messages
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email role') // Populate sender details
      // .populate('receiver', 'name email role') // Optional: if receiver field is used meaningfully
      .sort({ createdAt: 1 }); // Sort by oldest first

    // TODO: Mark messages as read for the current user in this conversation

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
