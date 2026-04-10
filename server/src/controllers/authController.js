const crypto = require('crypto');
const User = require('../models/User');
const logger = require('../utils/logger');

const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.generateToken();

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.status(statusCode).cookie('jwt', token, options).json({
    success: true,
    message,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // --- MASS ASSIGNMENT PREVENTION ---
    // Only accept these exact fields. Force role to 'student' if an attacker tries to inject 'admin'.
    let assignedRole = 'student';
    if (role === 'alumni' || role === 'recruiter') {
       assignedRole = role;
    }
    // 'admin' is explicitly stripped out. Must be designated in DB.

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: assignedRole 
    });
    
    // Audit Logging
    logger.info(`[AUDIT] New user registered: ${email} with assigned role: ${assignedRole}`);

    // Stub: Email verification
    const verifyToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });
    
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verifyemail/${verifyToken}`;
    logger.info(`[STUB EMAIL] Verification link for ${user.email}: ${verifyUrl}`);

    sendTokenResponse(user, 201, res, 'Account created successfully. Please check console for verification link.');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

const logout = async (req, res) => {
  res.cookie('jwt', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'User logged out',
  });
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      verificationToken,
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Email verified successfully');
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Return 200 to prevent email enumeration
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
    
    // Stub sending email
    logger.info(`[STUB EMAIL] Password reset link for ${user.email}: ${resetUrl}`);

    res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Email could not be sent' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password reset failed' });
  }
};

module.exports = { register, login, logout, getMe, verifyEmail, forgotPassword, resetPassword };
