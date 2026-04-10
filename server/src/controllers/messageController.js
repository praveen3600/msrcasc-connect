const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc    Get conversation history with a specific user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Mark unread messages as read
    await Message.updateMany(
      {
        sender: req.params.userId,
        receiver: req.user._id,
        read: false,
      },
      { read: true }
    );

    res.json({
      success: true,
      count: messages.length,
      data: { messages },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations/list
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatar role')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: conversations.length,
      data: { conversations },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get list of users available to chat with
// @route   GET /api/messages/users/list
// @access  Private
const getChatUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
    }).select('name role avatar');

    res.json({
      success: true,
      count: users.length,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getMessages, getConversations, getChatUsers };
