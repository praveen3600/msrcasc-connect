const { analyzeResume, recommendJobs, analyzeSkillGap } = require('../services/aiService');

// @desc    Analyze resume text
// @route   POST /api/ai/analyze-resume
// @access  Private
const analyzeResumeHandler = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resume text (minimum 50 characters)',
      });
    }

    const analysis = await analyzeResume(resumeText);

    res.json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get job recommendations based on skills
// @route   POST /api/ai/recommend-jobs
// @access  Private
const recommendJobsHandler = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one skill',
      });
    }

    const recommendations = await recommendJobs(skills);

    res.json({
      success: true,
      count: recommendations.length,
      data: { recommendations },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Analyze skill gap for a job
// @route   POST /api/ai/skill-gap
// @access  Private
const skillGapHandler = async (req, res) => {
  try {
    const { skills, jobId } = req.body;

    if (!skills || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your skills',
      });
    }

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a job ID',
      });
    }

    const analysis = await analyzeSkillGap(skills, jobId);

    res.json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { analyzeResumeHandler, recommendJobsHandler, skillGapHandler };
