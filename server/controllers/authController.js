const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

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

    // Send transactional welcome email safely in the background
    sendEmail({
      email: user.email,
      subject: 'Welcome to Rohin Muslim Matrimony! 🕌✨',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f2e8db; border-radius: 12px; background-color: #faf8f5;">
          <h2 style="color: #4f080e; text-align: center; font-family: Georgia, serif;">Assalamu Alaikum, ${profile.name}!</h2>
          <p style="font-size: 14px; color: #333333; line-height: 1.6;">
            Thank you for registering with <strong>Rohin Muslim Matrimony</strong> – the most trusted, secure, and premium matrimonial platform.
          </p>
          <p style="font-size: 14px; color: #333333; line-height: 1.6;">
            We are dedicated to helping you find your ideal life partner under Halal values. Here are your account details:
          </p>
          <div style="background-color: #4f080e; color: #ffffff; padding: 15px; border-radius: 8px; font-weight: bold; text-align: center; margin: 20px 0;">
            Registered Email: ${user.email}
          </div>
          <p style="font-size: 14px; color: #333333; line-height: 1.6;">
            Please log in to your dashboard to complete your profile verification and start searching verified profiles!
          </p>
          <p style="font-size: 12px; color: #666666; text-align: center; margin-top: 30px; border-top: 1px solid #e6dccf; padding-top: 15px;">
            <strong>Rohin Muslim Matrimony Office Address:</strong><br>
            D.No.12-13-86, Abdulkhader Street, Islampet, Vijayawada-1<br>
            Contact: 7386083446, 7075900448 | Email: shaikhabeebiti@gmail.com
          </p>
        </div>
      `
    }).catch(err => console.error('Failed to trigger email asynchronously:', err));

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
