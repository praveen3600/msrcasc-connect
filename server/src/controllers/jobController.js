const Job = require('../models/Job');
const logger = require('../utils/logger');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (recruiter, admin)
const createJob = async (req, res) => {
  try {
    const { title, company, description, skillsRequired, location, type, salary, deadline } = req.body;

    const jobData = {
      title,
      company,
      description,
      skillsRequired: skillsRequired || [],
      location,
      type,
      salary,
      deadline,
      postedBy: req.user._id,
    };

    const job = await Job.create(jobData);

    logger.info(`[AUDIT] Job posted by ${req.user._id} (${req.user.role}): ${job._id} - ${title}`);

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: { job },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all jobs (with filters)
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.company) filter.company = { $regex: req.query.company, $options: 'i' };
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { company: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      data: { jobs },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email')
      .populate('applicants.user', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    res.json({
      success: true,
      data: { job },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Apply to a job
// @route   POST /api/jobs/:id/apply
// @access  Private (student, alumni)
const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // --- IDOR & VISIBILITY PROTECTION ---
    if (!job.isActive) {
      logger.warn(`[SECURITY] Unauthorized application attempt on inactive job ${req.params.id} by user ${req.user._id}`);
      return res.status(403).json({
        success: false,
        message: 'This job is no longer accepting applications',
      });
    }

    // Check if already applied
    const alreadyApplied = job.applicants.some(
      (app) => app.user.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job',
      });
    }

    job.applicants.push({ user: req.user._id });
    await job.save();

    logger.info(`[AUDIT] User ${req.user._id} applied to job ${job._id}`);

    res.json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get applicants for a job
// @route   GET /api/jobs/:id/applicants
// @access  Private (recruiter who posted, admin)
const getApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('applicants.user', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Only poster or admin can see applicants
    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applicants for this job',
      });
    }

    res.json({
      success: true,
      count: job.applicants.length,
      data: { applicants: job.applicants },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createJob, getAllJobs, getJobById, applyToJob, getApplicants };
