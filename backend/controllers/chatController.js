const Message = require('../models/Message');
const User = require('../models/User');
const Conversation = require('../models/Conversation'); // Added Conversation model
const { getIO } = require('../config/socket');

// Controller function to get or create a conversation
exports.getOrCreateConversation = async (req, res) => {
  // recipientId should be the other user's ID
  // propertyId is optional
  const { recipientId, propertyId } = req.body;
  const senderId = req.user._id; // Logged-in user

  if (!recipientId) {
    return res.status(400).json({ message: 'Recipient ID is required' });
  }

  if (senderId.toString() === recipientId.toString()) {
    return res.status(400).json({ message: 'Cannot create a conversation with yourself' });
  }

  try {
    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    // Ensure participants are always in the same order (e.g., sorted alphabetically by ID)
    // to make querying for existing conversations consistent.
    const participants = [senderId, recipientId].sort();

    let query = {
      participants: { $all: participants, $size: participants.length },
      // If propertyId is provided, include it in the query
      // If not, query for conversations where property is null or not set
      property: propertyId || null 
    };

    let conversation = await Conversation.findOne(query)
      .populate('participants', 'name email role profilePicture')
      .populate('property', 'title address');

    if (!conversation) {
      conversation = new Conversation({
        participants: participants,
        property: propertyId || null,
      });
      await conversation.save();
      // Re-populate after save to get consistent output
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email role profilePicture')
        .populate('property', 'title address');
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    res.status(500).json({ message: 'Server error creating/finding conversation', error: error.message });
  }
};

// Get all conversations for the current user
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name email role profilePicture') // Populate participant details
      .populate({
        path: 'lastMessage',
        populate: { 
          path: 'sender', 
          select: 'name email role profilePicture' 
        } // Populate sender of last message
      })
      .populate('property', 'title address photos') // Populate property details if linked
      .sort({ updatedAt: -1 }); // Sort by most recently updated (due to new messages)

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all messages for a specific conversation
exports.getMessagesForConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify the user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participants.map(p => p.toString()).includes(userId.toString())) {
      return res.status(403).json({ message: 'User not authorized to view these messages' });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email role profilePicture')
      // .populate('attachments') // If attachments need more details populated
      .sort({ createdAt: 1 }); // Typically, messages are shown oldest to newest

    // Future enhancement: Implement pagination for messages
    // Future enhancement: Mark messages as read for the current user upon fetching
    // (Could be done here or in a separate markAsRead call triggered by frontend)

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages for conversation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    // Expect conversationId, content. attachments and propertyId are optional for the message itself.
    const { conversationId, content, attachments } = req.body;
    const senderId = req.user._id;

    if (!conversationId || !content) {
      return res.status(400).json({ message: 'Conversation ID and content are required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Ensure the sender is a participant in this conversation
    if (!conversation.participants.map(p => p.toString()).includes(senderId.toString())) {
      return res.status(403).json({ message: 'Sender is not a participant in this conversation' });
    }

    const message = new Message({
      conversationId: conversation._id,
      sender: senderId,
      // receiver is implicitly defined by conversation participants. 
      // If needed for specific notifications, it could be derived or passed.
      content,
      attachments: attachments || [],
      // property association is primarily through the Conversation model.
      // If Message.property is still relevant, ensure it's set, e.g., from conversation.property
      property: conversation.property || null, 
      // isPropertyChat can be derived from whether conversation.property exists
      isPropertyChat: !!conversation.property 
    });

    await message.save();

    // Update the conversation's lastMessage and save it
    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now(); // Manually trigger update for sorting by activity
    await conversation.save();

    // Populate sender info for real-time updates and response
    await message.populate('sender', 'name email role profilePicture');
    // Optionally populate other fields like attachments or conversation info if needed by frontend immediately

    // Emit the message through socket.io to the conversation room
    const io = getIO();
    // The room name could be the conversationId itself
    io.to(conversationId.toString()).emit('new_message', message);
    
    // Also, for each participant in the conversation (excluding the sender),
    // emit an event to their specific user room if they are connected, to update their conversation list UI.
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== senderId.toString()) {
        // This event signals that a conversation they are part of has a new message.
        // The client can then re-fetch conversations or update the specific one.
        io.to(participantId.toString()).emit('conversation_updated', {
          conversationId: conversation._id,
          lastMessage: message
        });
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const currentUser = req.user._id;

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        recipient: currentUser,
        read: false
      },
      {
        $set: { read: true, readAt: new Date() }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read', error: error.message });
  }
};

// Delete messages
exports.deleteMessages = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const currentUser = req.user._id;

    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { deletedFor: currentUser } }
    );

    res.json({ message: 'Messages deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting messages', error: error.message });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const currentUser = req.user._id;

    const count = await Message.countDocuments({
      recipient: currentUser,
      read: false,
      deletedFor: { $ne: currentUser }
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Error getting unread count', error: error.message });
  }
}; 