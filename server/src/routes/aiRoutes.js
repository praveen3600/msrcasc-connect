const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(aiLimiter); // Apply AI specific limits to all routes in this router
const {
  analyzeResumeHandler,
  recommendJobsHandler,
  skillGapHandler,
} = require('../controllers/aiController');

router.post('/analyze-resume', protect, analyzeResumeHandler);
router.post('/recommend-jobs', protect, recommendJobsHandler);
router.post('/skill-gap', protect, skillGapHandler);

module.exports = router;
