const User = require('../models/User');
const Profile = require('../models/Profile');
const InterestRequest = require('../models/InterestRequest');
const Message = require('../models/Message');

// @desc    Get Admin dashboard analytics metrics
// @route   GET /api/admin/metrics
// @access  Private/Admin
exports.getMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProfiles = await Profile.countDocuments();
    
    // Plan breakdown
    const freePlanCount = await User.countDocuments({ role: 'user', plan: 'free' });
    const premiumPlanCount = await User.countDocuments({ role: 'user', plan: 'premium' });
    const elitePlanCount = await User.countDocuments({ role: 'user', plan: 'elite' });

    // Male and Female count
    const maleCount = await Profile.countDocuments({ gender: 'male' });
    const femaleCount = await Profile.countDocuments({ gender: 'female' });

    // Connections (Interest Requests)
    const totalRequests = await InterestRequest.countDocuments();
    const acceptedRequests = await InterestRequest.countDocuments({ status: 'accepted' });
    const pendingRequests = await InterestRequest.countDocuments({ status: 'pending' });

    // Total messages exchanged
    const totalMessages = await Message.countDocuments();

    return res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalProfiles,
        planBreakdown: {
          free: freePlanCount,
          premium: premiumPlanCount,
          elite: elitePlanCount,
        },
        genderSplit: {
          male: maleCount,
          female: femaleCount,
        },
        requests: {
          total: totalRequests,
          accepted: acceptedRequests,
          pending: pendingRequests,
        },
        messagesCount: totalMessages,
      },
    });
  } catch (error) {
    console.error('GetMetrics Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List all system users and profiles with plan details
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    // Find all users (excluding sensitive password detail)
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });

    // Bind profile details
    const usersWithProfiles = await Promise.all(
      users.map(async (userItem) => {
        const profile = await Profile.findOne({ user: userItem._id });
        return {
          _id: userItem._id,
          email: userItem.email,
          role: userItem.role,
          plan: userItem.plan,
          viewLimit: userItem.viewLimit,
          viewedCount: userItem.viewedProfiles.length,
          createdAt: userItem.createdAt,
          profile: profile || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: usersWithProfiles.length,
      data: usersWithProfiles,
    });
  } catch (error) {
    console.error('GetAllUsers Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a fake profile and associated user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete an Admin account' });
    }

    // Delete User
    await User.findByIdAndDelete(userId);

    // Delete Profile
    await Profile.findOneAndDelete({ user: userId });

    // Clean up Interest Requests involving this user
    await InterestRequest.deleteMany({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    // Clean up Messages involving this user
    await Message.deleteMany({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    // Remove this user from other user's connections array
    await Profile.updateMany(
      { connections: userId },
      { $pull: { connections: userId } }
    );

    return res.status(200).json({
      success: true,
      message: 'User profile and all associated data deleted successfully',
    });
  } catch (error) {
    console.error('DeleteUser Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change user subscription plan
// @route   PUT /api/admin/users/plan/:id
// @access  Private/Admin
exports.changePlan = async (req, res) => {
  try {
    const userId = req.params.id;
    const { plan } = req.body;

    if (!['free', 'premium', 'elite'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan tier specified' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Apply plan change
    user.plan = plan;
    
    // Automatically set default view limits if changed to Free, or clean it
    if (plan === 'free') {
      user.viewLimit = 5;
    } else if (plan === 'premium') {
      user.viewLimit = 30;
    } else {
      user.viewLimit = 99999; // Essentially unlimited
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `User plan upgraded/changed to: ${plan.toUpperCase()}`,
      data: {
        _id: user._id,
        email: user.email,
        plan: user.plan,
        viewLimit: user.viewLimit
      }
    });
  } catch (error) {
    console.error('ChangePlan Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user's profile views limit manually
// @route   PUT /api/admin/users/limit/:id
// @access  Private/Admin
exports.updateLimit = async (req, res) => {
  try {
    const userId = req.params.id;
    const { viewLimit } = req.body;

    if (viewLimit === undefined || isNaN(viewLimit)) {
      return res.status(400).json({ success: false, message: 'A valid numeric view limit is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.viewLimit = parseInt(viewLimit);
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User profile view limit updated to: ${viewLimit}`,
      data: {
        _id: user._id,
        email: user.email,
        plan: user.plan,
        viewLimit: user.viewLimit
      }
    });
  } catch (error) {
    console.error('UpdateLimit Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all trust and safety reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getAllReports = async (req, res) => {
  try {
    const reports = await require('../models/Report').find()
      .populate('reporter', 'email')
      .populate('reportedUser', 'email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('GetAllReports Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle manual verification badge for a user
// @route   PUT /api/admin/verify/:id
// @access  Private/Admin
exports.verifyUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isManuallyVerified = !user.isManuallyVerified;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User manual verification status set to: ${user.isManuallyVerified}`,
      isManuallyVerified: user.isManuallyVerified
    });
  } catch (error) {
    console.error('VerifyUser Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const Settings = require('../models/Settings');

// @desc    Get platform settings (pricing)
// @route   GET /api/admin/settings
// @access  Public (So frontend can display prices without auth if needed, but we keep it under /api/settings or /api/admin/settings)
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    if (req.body.premiumPrice !== undefined) settings.premiumPrice = req.body.premiumPrice;
    if (req.body.elitePrice !== undefined) settings.elitePrice = req.body.elitePrice;
    if (req.body.paymentGatewayMode !== undefined) settings.paymentGatewayMode = req.body.paymentGatewayMode;

    await settings.save();
    return res.status(200).json({ success: true, data: settings, message: 'Settings updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
