const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'alumni', 'recruiter', 'admin'],
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        techStack: { type: [String], default: [] },
        link: { type: String, default: '' },
      },
    ],
    resumeURL: {
      type: String,
      default: '',
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },
    company: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
    github: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    graduationYear: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Profile', profileSchema);
