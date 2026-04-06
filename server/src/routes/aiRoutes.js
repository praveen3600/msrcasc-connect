const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  analyzeResumeHandler,
  recommendJobsHandler,
  skillGapHandler,
} = require('../controllers/aiController');

router.post('/analyze-resume', protect, analyzeResumeHandler);
router.post('/recommend-jobs', protect, recommendJobsHandler);
router.post('/skill-gap', protect, skillGapHandler);

module.exports = router;
