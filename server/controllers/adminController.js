const User = require('../models/User');
const Profile = require('../models/Profile');
const InterestRequest = require('../models/InterestRequest');
const Message = require('../models/Message');
const Settings = require('../models/Settings');
const KycRequest = require('../models/KycRequest');
const Notification = require('../models/Notification');

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

    // Revenue Calculation from Settings prices
    const settings = await Settings.findOne();
    const premiumPrice = settings?.premiumPrice || 999;
    const elitePrice = settings?.elitePrice || 1999;

    const premiumRevenue = premiumPlanCount * premiumPrice;
    const eliteRevenue = elitePlanCount * elitePrice;
    const totalRevenue = premiumRevenue + eliteRevenue;

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
        revenue: {
          premiumPrice,
          elitePrice,
          premiumRevenue,
          eliteRevenue,
          totalRevenue,
        },
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

const SuccessStory = require('../models/SuccessStory');

// @desc    Get platform settings (pricing & plan features)
// @route   GET /api/admin/settings
// @access  Public
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
    
    if (req.body.freePlanFeatures !== undefined) settings.freePlanFeatures = req.body.freePlanFeatures;
    if (req.body.premiumPlanFeatures !== undefined) settings.premiumPlanFeatures = req.body.premiumPlanFeatures;
    if (req.body.elitePlanFeatures !== undefined) settings.elitePlanFeatures = req.body.elitePlanFeatures;

    // Support contact configurations
    if (req.body.supportPhone !== undefined) settings.supportPhone = req.body.supportPhone;
    if (req.body.supportWhatsApp !== undefined) settings.supportWhatsApp = req.body.supportWhatsApp;
    if (req.body.supportEmail !== undefined) settings.supportEmail = req.body.supportEmail;
    if (req.body.eliteManagerName !== undefined) settings.eliteManagerName = req.body.eliteManagerName;
    if (req.body.eliteManagerPhone !== undefined) settings.eliteManagerPhone = req.body.eliteManagerPhone;

    await settings.save();
    return res.status(200).json({ success: true, data: settings, message: 'Settings updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all success stories (Admin)
// @route   GET /api/admin/success-stories
// @access  Private/Admin
exports.getAllSuccessStories = async (req, res) => {
  try {
    const stories = await SuccessStory.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: stories.length, data: stories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a success story (Admin)
// @route   POST /api/admin/success-stories
// @access  Private/Admin
exports.createSuccessStory = async (req, res) => {
  try {
    const { partnerOne, partnerTwo, story, location, marriageDate, isPublished } = req.body;
    
    if (!partnerOne || !partnerTwo || !story || !location) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    // Process files uploaded via multer
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const newStory = await SuccessStory.create({
      partnerOne,
      partnerTwo,
      story,
      location,
      marriageDate: marriageDate || '',
      images: images,
      image: images.length > 0 ? images[0] : '',
      isPublished: isPublished === 'true' || isPublished === true,
    });

    return res.status(201).json({ success: true, data: newStory, message: 'Success story created successfully.' });
  } catch (error) {
    console.error('CreateSuccessStory Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a success story (Admin)
// @route   PUT /api/admin/success-stories/:id
// @access  Private/Admin
exports.updateSuccessStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    let storyItem = await SuccessStory.findById(storyId);

    if (!storyItem) {
      return res.status(404).json({ success: false, message: 'Success story not found.' });
    }

    const { partnerOne, partnerTwo, story, location, marriageDate, isPublished, existingImages } = req.body;

    let images = [];
    if (existingImages) {
      try {
        images = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
      } catch (err) {
        images = [];
      }
    } else {
      images = storyItem.images || [];
    }

    // Append new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      images = [...images, ...newImages];
    }

    // Prepare update payload
    const updateData = {
      partnerOne: partnerOne !== undefined ? partnerOne : storyItem.partnerOne,
      partnerTwo: partnerTwo !== undefined ? partnerTwo : storyItem.partnerTwo,
      story: story !== undefined ? story : storyItem.story,
      location: location !== undefined ? location : storyItem.location,
      marriageDate: marriageDate !== undefined ? marriageDate : storyItem.marriageDate,
      isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : storyItem.isPublished,
      images: images,
      image: images.length > 0 ? images[0] : '',
    };

    storyItem = await SuccessStory.findByIdAndUpdate(storyId, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, data: storyItem, message: 'Success story updated successfully.' });
  } catch (error) {
    console.error('UpdateSuccessStory Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a success story (Admin)
// @route   DELETE /api/admin/success-stories/:id
// @access  Private/Admin
exports.deleteSuccessStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const storyItem = await SuccessStory.findById(storyId);

    if (!storyItem) {
      return res.status(404).json({ success: false, message: 'Success story not found.' });
    }

    await SuccessStory.findByIdAndDelete(storyId);

    return res.status(200).json({ success: true, message: 'Success story deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a user manually (Offline registration) (Admin)
// @route   POST /api/admin/users/create
// @access  Private/Admin
exports.createOfflineUser = async (req, res) => {
  try {
    const { email, password, plan, profile } = req.body;

    if (!email || !password || !plan || !profile) {
      return res.status(400).json({ success: false, message: 'Email, password, plan, and profile details are required.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    // Setup viewLimit according to selected plan
    let viewLimit = 5;
    if (plan === 'premium') {
      viewLimit = 30;
    } else if (plan === 'elite') {
      viewLimit = 99999;
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: 'user',
      plan,
      viewLimit,
      isManuallyVerified: true
    });

    // Create profile linked to user
    const newProfile = await Profile.create({
      user: user._id,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      height: profile.height || "5'5\"",
      maritalStatus: profile.maritalStatus || 'Never Married',
      motherTongue: profile.motherTongue || 'Urdu',
      religion: profile.religion || 'Islam',
      sect: profile.sect || 'Sunni',
      namazFrequency: profile.namazFrequency || 'Always Praying',
      profession: profile.profession,
      education: profile.education,
      city: profile.city,
      about: profile.about || `Profile for ${profile.name} created by Admin.`,
      phoneNumber: profile.phoneNumber || '+91 98765 43210',
    });

    return res.status(201).json({
      success: true,
      message: 'Offline user and profile created successfully.',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          plan: user.plan,
          isManuallyVerified: user.isManuallyVerified
        },
        profile: newProfile
      }
    });
  } catch (error) {
    console.error('CreateOfflineUser Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all pending interest requests sent by free-tier users
// @route   GET /api/admin/free-interests
// @access  Private/Admin
exports.getFreeTierInterests = async (req, res) => {
  try {
    // Get all pending interest requests
    const allPending = await InterestRequest.find({ status: 'pending' })
      .populate('sender', 'email plan')
      .populate('receiver', 'email plan')
      .sort({ createdAt: -1 });

    // Filter those where the sender is on the free plan
    const freeTierInterests = allPending.filter(
      (req) => req.sender && req.sender.plan === 'free'
    );

    // Enrich with profile details
    const enriched = await Promise.all(
      freeTierInterests.map(async (item) => {
        const senderProfile = await Profile.findOne({ user: item.sender._id }).select('name city profession age profilePhoto');
        const receiverProfile = await Profile.findOne({ user: item.receiver?._id }).select('name city profession age');
        return {
          _id: item._id,
          createdAt: item.createdAt,
          sender: {
            _id: item.sender._id,
            email: item.sender.email,
            plan: item.sender.plan,
            profile: senderProfile,
          },
          receiver: {
            _id: item.receiver?._id,
            email: item.receiver?.email,
            profile: receiverProfile,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    console.error('GetFreeTierInterests Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Dismiss / delete a free-tier interest request
// @route   DELETE /api/admin/free-interests/:id
// @access  Private/Admin
exports.deleteFreeInterest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await InterestRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Interest request not found.' });
    }

    await InterestRequest.findByIdAndDelete(requestId);

    return res.status(200).json({
      success: true,
      message: 'Free-tier interest request dismissed successfully.',
    });
  } catch (error) {
    console.error('DeleteFreeInterest Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all KYC verification requests
// @route   GET /api/admin/kyc
// @access  Private/Admin
exports.getKycRequests = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const filter = status === 'all' ? {} : { status };

    const requests = await KycRequest.find(filter)
      .populate('user', 'email plan isManuallyVerified')
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(
      requests.map(async (item) => {
        const profile = await Profile.findOne({ user: item.user?._id }).select('name city profession age profilePhoto');
        return {
          _id: item._id,
          status: item.status,
          idType: item.idType,
          idNumber: item.idNumber,
          fullNameOnId: item.fullNameOnId,
          documentImage: item.documentImage,
          adminNote: item.adminNote,
          createdAt: item.createdAt,
          reviewedAt: item.reviewedAt,
          user: {
            _id: item.user?._id,
            email: item.user?.email,
            plan: item.user?.plan,
            isManuallyVerified: item.user?.isManuallyVerified,
          },
          profile,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    console.error('GetKycRequests Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Review (approve or reject) a KYC request
// @route   PUT /api/admin/kyc/:id
// @access  Private/Admin
exports.reviewKycRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, adminNote } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Use approve or reject.' });
    }

    const kycRequest = await KycRequest.findById(id).populate('user', 'email');
    if (!kycRequest) {
      return res.status(404).json({ success: false, message: 'KYC request not found.' });
    }

    kycRequest.status = action === 'approve' ? 'approved' : 'rejected';
    kycRequest.adminNote = adminNote || '';
    kycRequest.reviewedAt = new Date();
    await kycRequest.save();

    // If approved, set isManuallyVerified on user
    if (action === 'approve') {
      await User.findByIdAndUpdate(kycRequest.user._id, { isManuallyVerified: true });
    } else {
      // If rejected, unset verification
      await User.findByIdAndUpdate(kycRequest.user._id, { isManuallyVerified: false });
    }

    // Send in-app notification to user
    const profile = await Profile.findOne({ user: kycRequest.user._id }).select('name');
    await Notification.create({
      recipient: kycRequest.user._id,
      sender: req.user.id,
      type: 'kyc_review',
      title: action === 'approve' ? '✅ Identity Verified!' : '❌ KYC Review Update',
      message: action === 'approve'
        ? 'Congratulations! Your identity has been verified. Your profile now shows a verified badge.'
        : `Your KYC submission was not approved. Reason: ${adminNote || 'Please resubmit with a clearer document.'}`,
      url: '/edit-profile'
    });

    // Send push notification
    const sendPushNotification = require('../utils/pushNotifier');
    sendPushNotification(
      kycRequest.user._id.toString(),
      action === 'approve' ? '✅ Identity Verified!' : '❌ KYC Not Approved',
      action === 'approve' ? 'Your profile is now verified!' : `Reason: ${adminNote || 'Please resubmit.'}`,
      '/edit-profile'
    ).catch(err => console.error('KYC push notification error:', err));

    // Emit socket notification
    if (req.io) {
      req.io.to(kycRequest.user._id.toString()).emit('new_notification', {
        title: action === 'approve' ? '✅ Identity Verified!' : '❌ KYC Review Update',
      });
    }

    return res.status(200).json({
      success: true,
      message: `KYC request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
    });
  } catch (error) {
    console.error('ReviewKycRequest Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin suggests a match between two users
// @route   POST /api/admin/suggest-match
// @access  Private/Admin
exports.suggestMatch = async (req, res) => {
  try {
    const { userAId, userBId, message } = req.body;

    if (!userAId || !userBId) {
      return res.status(400).json({ success: false, message: 'Both user IDs are required.' });
    }

    if (userAId === userBId) {
      return res.status(400).json({ success: false, message: 'Cannot suggest a match between the same user.' });
    }

    const profileA = await Profile.findOne({ user: userAId }).select('name');
    const profileB = await Profile.findOne({ user: userBId }).select('name');

    if (!profileA || !profileB) {
      return res.status(404).json({ success: false, message: 'One or both user profiles not found.' });
    }

    const adminMessage = message || 'Our team thinks you could be a great match!';

    // Notify User A about User B
    await Notification.create({
      recipient: userAId,
      sender: req.user.id,
      type: 'admin_match_suggestion',
      title: '💌 Admin Match Suggestion',
      message: `Our team suggests you check out ${profileB.name}'s profile. ${adminMessage}`,
      url: `/profile/${userBId}`
    });

    // Notify User B about User A
    await Notification.create({
      recipient: userBId,
      sender: req.user.id,
      type: 'admin_match_suggestion',
      title: '💌 Admin Match Suggestion',
      message: `Our team suggests you check out ${profileA.name}'s profile. ${adminMessage}`,
      url: `/profile/${userAId}`
    });

    // Push notifications
    const sendPushNotification = require('../utils/pushNotifier');
    sendPushNotification(userAId, '💌 Admin Match Suggestion', `Check out ${profileB.name}'s profile!`, `/profile/${userBId}`).catch(() => {});
    sendPushNotification(userBId, '💌 Admin Match Suggestion', `Check out ${profileA.name}'s profile!`, `/profile/${userAId}`).catch(() => {});

    // Socket notifications
    if (req.io) {
      req.io.to(userAId).emit('new_notification', { title: '💌 Admin Match Suggestion', message: `Check out ${profileB.name}'s profile!` });
      req.io.to(userBId).emit('new_notification', { title: '💌 Admin Match Suggestion', message: `Check out ${profileA.name}'s profile!` });
    }

    return res.status(200).json({
      success: true,
      message: `Match suggested between ${profileA.name} and ${profileB.name} successfully!`,
    });
  } catch (error) {
    console.error('SuggestMatch Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
