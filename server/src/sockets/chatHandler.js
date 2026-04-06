const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

let io;
const onlineUsers = new Map(); // userId -> socketId

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // JWT authentication middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.userId}`);

    // Track online user
    onlineUsers.set(socket.userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));

    // ─── SEND MESSAGE ───
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, content } = data;

        // Save message to DB
        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          content,
        });

        // Populate sender info
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name avatar')
          .populate('receiver', 'name avatar');

        // Update or create conversation
        let conversation = await Conversation.findOne({
          participants: { $all: [socket.userId, receiverId] },
        });

        if (conversation) {
          conversation.lastMessage = message._id;
          await conversation.save();
        } else {
          conversation = await Conversation.create({
            participants: [socket.userId, receiverId],
            lastMessage: message._id,
          });
        }

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', populatedMessage);
        }

        // Confirm to sender
        socket.emit('messageSent', populatedMessage);
      } catch (error) {
        socket.emit('messageError', { message: error.message });
      }
    });

    // ─── TYPING INDICATOR ───
    socket.on('typing', ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', { userId: socket.userId });
      }
    });

    socket.on('stopTyping', ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userStoppedTyping', { userId: socket.userId });
      }
    });

    // ─── DISCONNECT ───
    socket.on('disconnect', () => {
      console.log(`🔴 User disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initializeSocket, getIO };
