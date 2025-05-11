const User = require('../models/User');
const OTP = require('../models/OTP');
const generateId = require('../utils/generateId');
const sendEmail = require('../utils/emailService');

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, aadhar, homeState, district, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if aadhar is already registered
    user = await User.findOne({ aadhar });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User with this Aadhar number already exists'
      });
    }

    // Generate unique worker ID
    const workerId = generateId(homeState);

    // Create user
    user = await User.create({
      name,
      email,
      phone,
      aadhar,
      homeState,
      district,
      password,
      workerId
    });

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to database
    await OTP.create({
      email,
      otp
    });

    // Send OTP to user's email
    await sendEmail({
      email,
      subject: 'Welcome to TN Migrant Worker Portal - Registration Successful',
      message: `
Hello ${name},

Welcome to the Tamil Nadu Migrant Worker Portal!

Your registration details:
- Worker ID: ${workerId}
- Email: ${email}

To complete your registration, please verify your email with this OTP: ${otp}
This OTP is valid for 10 minutes.

After verification, you can log in and:
1. Upload your identification documents
2. Update your profile with skills and experience
3. Search for job opportunities
4. Check eligibility for government schemes

If you need any assistance, please contact our support team.

Regards,
TN Migrant Worker Portal Team
      `,
      additionalInfo: {
        'Verification token': otp.substring(0, 10),
        'Worker ID': workerId
      }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully! Please verify your email.',
      workerId
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Email not verified. Please verify your email first.'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    // Get user data without password
    const userData = await User.findById(user._id);

    res.status(200).json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists for this email
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update user's email verification status
    await User.findOneAndUpdate(
      { email },
      { isEmailVerified: true }
    );

    // Delete the OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    next(error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    await OTP.create({
      email,
      otp
    });

    // Send OTP to user's email
    await sendEmail({
      email,
      subject: 'New Email Verification OTP - TN Migrant Worker Portal',
      message: `
Hello,

You have requested a new OTP for your TN Migrant Worker Portal account.

Your new verification code is: ${otp}

This OTP is valid for 10 minutes. Please enter this code on the verification page to complete your registration.

If you did not request this OTP, please ignore this email.

Regards,
TN Migrant Worker Portal Team
      `,
      additionalInfo: {
        'Verification token': otp.substring(0, 10)
      }
    });

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully!'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
};
