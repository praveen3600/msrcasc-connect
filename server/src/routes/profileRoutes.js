const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createProfile,
  getMyProfile,
  getProfileByUserId,
  getAllProfiles,
} = require('../controllers/profileController');

router.get('/', protect, getAllProfiles);
router.get('/me', protect, getMyProfile);
router.post('/', protect, createProfile);
router.get('/:userId', protect, getProfileByUserId);

module.exports = router;
