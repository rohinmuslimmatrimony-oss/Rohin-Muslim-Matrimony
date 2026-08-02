const User = require('../models/User');
const Profile = require('../models/Profile');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const Transaction = require('../models/Transaction');

// Helper: get quota values from settings for a given plan
const getPlanQuota = async (plan) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  const features =
    plan === 'elite' ? settings.elitePlanFeatures :
    plan === 'premium' ? settings.premiumPlanFeatures :
    settings.freePlanFeatures;
  return {
    quotaProfileViews: features.totalViewLimit ?? 10,
    quotaInterests:    features.totalInterestLimit ?? 5,
    quotaContactViews: features.contactViewLimit ?? 0,
  };
};

// Helper to get plan features
const getPlanFeatures = async (plan) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = {
      freePlanFeatures: { viewFullBio: false, viewContactDetails: false, chat: false, shortlist: false, dailyViewLimit: 5 },
      premiumPlanFeatures: { viewFullBio: true, viewContactDetails: true, chat: true, shortlist: true, dailyViewLimit: 30 },
      elitePlanFeatures: { viewFullBio: true, viewContactDetails: true, chat: true, shortlist: true, dailyViewLimit: 99999 }
    };
  }
  if (plan === 'premium') return settings.premiumPlanFeatures;
  if (plan === 'elite') return settings.elitePlanFeatures;
  return settings.freePlanFeatures;
};

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

  let createdUserId = null;

  try {
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      email: normalizedEmail,
      password,
      role: 'user', // Default is user
      plan: 'free',
      viewLimit: 5,
      viewedProfiles: []
    });

    createdUserId = user._id;

    // Create default profile linked to the user
    const profile = await Profile.create({
      user: user._id,
      name: (name && name.trim()) ? name.trim() : 'Matrimony Member',
      age: age ? parseInt(age) : 25,
      gender: gender || 'male',
      sect: sect || 'Sunni',
      profession: profession || '',
      education: education || '',
      city: (city && city.trim()) ? city.trim() : 'Not Specified',
      about: about || '',
      profileCreatedBy: profileCreatedBy || 'Self',
      maritalStatus: maritalStatus || 'Never Married',
      height: height || '5\'6"',
      motherTongue: motherTongue || 'Urdu',
      namazFrequency: namazFrequency || 'Sometimes',
      phoneNumber: waliContact || '',
      waliContact: waliContact || '',
      familyDetails: {
        fatherOccupation: fatherOccupation || '',
        motherOccupation: motherOccupation || '',
        siblingsCount: siblingsCount ? parseInt(siblingsCount) : 0
      },
      partnerPreferences: {
        ageRange: partnerAgeRange || '20-30',
        sectPreference: partnerSect || 'No Preference',
        educationPreference: partnerEducation || "Doesn't Matter"
      },
      isPhotoPublic: true
    });

    // Set initial quota from free plan settings
    const freeQuota = await getPlanQuota('free');
    user.quotaProfileViews = freeQuota.quotaProfileViews;
    user.quotaInterests    = freeQuota.quotaInterests;
    user.quotaContactViews = freeQuota.quotaContactViews;
    user.viewLimit         = freeQuota.quotaProfileViews;
    await user.save();

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
            Opp. Masjid-E-Al-Huda | Contact: +91 91771 03522 / +91 93902 38812
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
        quotaProfileViews: user.quotaProfileViews,
        quotaInterests:    user.quotaInterests,
        quotaContactViews: user.quotaContactViews,
        viewedCount: 0,
        viewedProfiles: [],
        viewedContacts: [],
        isManuallyVerified: user.isManuallyVerified,
      },
      profile,
    });
  } catch (error) {
    console.error('Register Error:', error);
    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId).catch(() => {});
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check for user
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Get user profile — auto create/repair fallback if missing
    let profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      profile = await Profile.create({
        user: user._id,
        name: user.role === 'admin' ? 'Administrator' : (user.email.split('@')[0] || 'Matrimony Member'),
        gender: 'male',
        age: 25,
        city: 'Not Specified'
      });
    }

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
        quotaProfileViews: user.quotaProfileViews ?? 0,
        quotaInterests:    user.quotaInterests ?? 0,
        quotaContactViews: user.quotaContactViews ?? 0,
        viewedCount: (user.viewedProfiles || []).length,
        viewedProfiles: user.viewedProfiles || [],
        viewedContacts: user.viewedContacts || [],
        isManuallyVerified: user.isManuallyVerified,
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
    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile && user?.role === 'admin') {
      profile = await Profile.create({
        user: user._id,
        name: 'Administrator',
        gender: 'male',
        age: 35,
        city: 'Admin City'
      });
    }

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
        quotaProfileViews: user.quotaProfileViews ?? 0,
        quotaInterests:    user.quotaInterests ?? 0,
        quotaContactViews: user.quotaContactViews ?? 0,
        viewedCount: (user.viewedProfiles || []).length,
        viewedProfiles: user.viewedProfiles || [],
        viewedContacts: user.viewedContacts || [],
        isManuallyVerified: user.isManuallyVerified,
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

    // Reset quota to new plan limits
    const quota = await getPlanQuota(plan);
    user.quotaProfileViews = quota.quotaProfileViews;
    user.quotaInterests    = quota.quotaInterests;
    user.quotaContactViews = quota.quotaContactViews;
    user.viewLimit         = quota.quotaProfileViews;

    // Fresh start: clear viewed history on renew/upgrade
    user.viewedProfiles = [];
    user.viewedContacts = [];

    await user.save();

    // Create a transaction record for mock payments
    if (plan !== 'free') {
      const amount = plan === 'elite' ? 1999 : 999;
      await Transaction.create({
        user: user._id,
        plan: plan,
        amount: amount,
        transactionId: `TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: 'success'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Plan upgraded successfully to: ${plan.toUpperCase()}`,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        viewLimit: user.viewLimit,
        quotaProfileViews: user.quotaProfileViews,
        quotaInterests:    user.quotaInterests,
        quotaContactViews: user.quotaContactViews,
        isManuallyVerified: user.isManuallyVerified,
      }
    });
  } catch (error) {
    console.error('UpgradePlan Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save push subscription keys for Web Push
// @route   POST /api/auth/subscribe
// @access  Private
exports.saveSubscription = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ success: false, message: 'Invalid subscription details' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Avoid duplicate subscriptions
    const exists = user.pushSubscriptions.some(sub => sub.endpoint === endpoint);
    if (!exists) {
      user.pushSubscriptions.push({ endpoint, keys });
      await user.save();
    }

    return res.status(200).json({ success: true, message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('SaveSubscription Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get VAPID public key
// @route   GET /api/auth/vapid-public-key
// @access  Private
exports.getVapidPublicKey = (req, res) => {
  return res.status(200).json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY || ''
  });
};

// @desc    Get current user transactions
// @route   GET /api/auth/transactions
// @access  Private
exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error('GetTransactions Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
