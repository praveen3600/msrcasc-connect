const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createJob,
  getAllJobs,
  getJobById,
  applyToJob,
  getApplicants,
} = require('../controllers/jobController');

router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.post('/:id/apply', protect, authorize('student', 'alumni'), applyToJob);
router.get('/:id/applicants', protect, authorize('recruiter', 'admin'), getApplicants);

module.exports = router;
