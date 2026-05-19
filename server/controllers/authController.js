const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');

// Helper to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_123456', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user & create initial profile
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { 
    email, password, name, age, gender, profession, education, city, about, sect,
    profileCreatedBy, maritalStatus, height, motherTongue, namazFrequency,
    waliContact, fatherOccupation, motherOccupation, siblingsCount,
    partnerAgeRange, partnerSect, partnerEducation
  } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: 'user', // Default is user
      plan: 'free',
      viewLimit: 5,
      viewedProfiles: []
    });

    // Create default profile linked to the user
    const profile = await Profile.create({
      user: user._id,
      name: name || 'Matrimony Member',
      age: age || 25,
      gender: gender || 'male',
      sect: sect || 'Sunni',
      profession: profession || 'Business',
      education: education || 'Graduate',
      city: city || 'Hyderabad',
      about: about || 'Assalamu Alaikum, I am looking for a suitable partner.',
      profileCreatedBy: profileCreatedBy || 'Self',
      maritalStatus: maritalStatus || 'Never Married',
      height: height || '5\'6"',
      motherTongue: motherTongue || 'Urdu',
      namazFrequency: namazFrequency || 'Usually Praying',
      waliContact: waliContact || '',
      familyDetails: {
        fatherOccupation: fatherOccupation || '',
        motherOccupation: motherOccupation || '',
        siblingsCount: siblingsCount ? parseInt(siblingsCount) : 0
      },
      partnerPreferences: {
        ageRange: partnerAgeRange || '',
        sectPreference: partnerSect || 'No Preference',
        educationPreference: partnerEducation || "Doesn't Matter"
      }
    });

    // Generate JWT
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        viewLimit: user.viewLimit,
      },
      profile,
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Get user profile
    const profile = await Profile.findOne({ user: user._id });

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        viewLimit: user.viewLimit,
      },
      profile,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get currently logged-in user profile & status
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const profile = await Profile.findOne({ user: req.user.id });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        viewLimit: user.viewLimit,
      },
      profile,
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upgrade user subscription plan manually (Mock checkout payment)
// @route   PUT /api/auth/upgrade
// @access  Private
exports.upgradePlan = async (req, res) => {
  const { plan } = req.body;
  if (!['free', 'premium', 'elite'].includes(plan)) {
    return res.status(400).json({ success: false, message: 'Invalid subscription plan selected' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    user.plan = plan;
    // Set default view limits
    if (plan === 'free') {
      user.viewLimit = 5;
    } else if (plan === 'premium') {
      user.viewLimit = 30;
    } else {
      user.viewLimit = 99999;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Plan upgraded successfully to: ${plan.toUpperCase()}`,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        viewLimit: user.viewLimit,
      }
    });
  } catch (error) {
    console.error('UpgradePlan Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
