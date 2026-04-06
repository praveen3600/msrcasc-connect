const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMessages,
  getConversations,
  getChatUsers,
} = require('../controllers/messageController');

router.get('/conversations/list', protect, getConversations);
router.get('/users/list', protect, getChatUsers);
router.get('/:userId', protect, getMessages);

module.exports = router;
