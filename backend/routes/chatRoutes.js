const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getOrCreateConversation,
  getUserConversations,       // Added
  getMessagesForConversation, // Added
  sendMessage,
  markAsRead,
  deleteMessages,
  getUnreadCount
} = require('../controllers/chatController');

// Get or create a new conversation
router.post('/conversations', protect, getOrCreateConversation);

// Get all conversations for the current user
router.get('/conversations', protect, getUserConversations);

// Get all messages for a specific conversation
router.get('/conversations/:conversationId/messages', protect, getMessagesForConversation);

// Send a new message (route remains /send for now, but logically part of a conversation)
router.post('/send', protect, sendMessage);

// Mark messages as read
router.put('/read', protect, markAsRead);

// Delete messages
router.delete('/delete', protect, deleteMessages);

// Get unread message count (may need refactoring later for per-conversation unread count)
router.get('/unread', protect, getUnreadCount);

module.exports = router;