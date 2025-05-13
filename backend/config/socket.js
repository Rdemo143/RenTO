const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);

    // Join user's personal room
    socket.join(socket.user._id.toString());

    // Handle private messages
    socket.on('private_message', async (data) => {
      const { recipientId, message } = data;
      
      // Save message to database
      const newMessage = new Message({
        sender: socket.user._id,
        recipient: recipientId,
        content: message
      });
      await newMessage.save();

      // Emit to recipient
      io.to(recipientId).emit('new_message', {
        sender: socket.user._id,
        content: message,
        timestamp: new Date()
      });
    });

    // Handle property chat room
    socket.on('join_property_chat', (propertyId) => {
      socket.join(`property_${propertyId}`);
    });

    // Handle property chat messages
    socket.on('property_message', async (data) => {
      const { propertyId, message } = data;
      
      // Save message to database
      const newMessage = new Message({
        sender: socket.user._id,
        property: propertyId,
        content: message,
        isPropertyChat: true
      });
      await newMessage.save();

      // Emit to all users in property chat
      io.to(`property_${propertyId}`).emit('new_property_message', {
        sender: socket.user._id,
        content: message,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
}; 