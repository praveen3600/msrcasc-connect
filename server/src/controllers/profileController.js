const Profile = require('../models/Profile');
const User = require('../models/User');
const logger = require('../utils/logger');

// Helper to mask sensitive data
const maskPII = (profile, requesterRole, isOwner) => {
  if (requesterRole === 'admin' || requesterRole === 'recruiter' || isOwner) {
    return profile;
  }

  const masked = profile.toObject ? profile.toObject() : { ...profile };
  
  if (masked.phone) {
    masked.phone = masked.phone.replace(/.(?=.{4})/g, 'X');
  }
  
  if (masked.email) {
    const [name, domain] = masked.email.split('@');
    masked.email = `${name[0]}${new Array(name.length).join('*')}@${domain}`;
  }
  
  return masked;
};

// @desc    Create or update profile
// @route   POST /api/profiles
// @access  Private
const createProfile = async (req, res) => {
  try {
    const {
      bio, department, skills, projects, resumeURL,
      cgpa, company, designation, linkedin, github,
      phone, graduationYear,
    } = req.body;

    const profileData = {
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      bio,
      department,
      skills: skills || [],
      projects: projects || [],
      resumeURL,
      cgpa,
      company,
      designation,
      linkedin,
      github,
      phone,
      graduationYear,
    };

    let profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileData },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      profile = await Profile.create(profileData);
    }

    res.status(profile ? 200 : 201).json({
      success: true,
      message: profile ? 'Profile updated' : 'Profile created',
      data: { profile },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/profiles/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please create one.',
      });
    }

    res.json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get profile by user ID
// @route   GET /api/profiles/:userId
// @access  Private
const getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    const isOwner = req.user._id.toString() === profile.user.toString();
    const maskedProfile = maskPII(profile, req.user.role, isOwner);

    // Audit Logging for privileged views
    if ((req.user.role === 'admin' || req.user.role === 'recruiter') && !isOwner) {
      logger.info(`[AUDIT] Sensitive profile viewed: User ${req.user._id} (${req.user.role}) viewed profile of User ${profile.user}`);
    }

    res.json({
      success: true,
      data: { profile: maskedProfile },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all profiles (with optional role filter)
// @route   GET /api/profiles
// @access  Private
const getAllProfiles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.department) filter.department = req.query.department;

    const profiles = await Profile.find(filter).sort({ createdAt: -1 });

    const maskedProfiles = profiles.map(p => {
      const isOwner = req.user._id.toString() === p.user.toString();
      return maskPII(p, req.user.role, isOwner);
    });

    res.json({
      success: true,
      count: maskedProfiles.length,
      data: { profiles: maskedProfiles },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createProfile, getMyProfile, getProfileByUserId, getAllProfiles };
