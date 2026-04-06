const Profile = require('../models/Profile');
const User = require('../models/User');

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

// @desc    Get all profiles (with optional role filter)
// @route   GET /api/profiles
// @access  Private
const getAllProfiles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.department) filter.department = req.query.department;

    const profiles = await Profile.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: profiles.length,
      data: { profiles },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createProfile, getMyProfile, getProfileByUserId, getAllProfiles };
