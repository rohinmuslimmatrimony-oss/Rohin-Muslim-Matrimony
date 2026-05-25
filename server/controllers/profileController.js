const Profile = require('../models/Profile');
const User = require('../models/User');
const Settings = require('../models/Settings');
const GalleryRequest = require('../models/GalleryRequest');
const mongoose = require('mongoose');

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

// @desc    Get all profiles with advanced search filters
// @route   GET /api/profiles
// @access  Private
exports.getProfiles = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const myProfile = await Profile.findOne({ user: req.user.id });
    if (!myProfile) {
      return res.status(404).json({ success: false, message: 'Please create a profile first' });
    }

    const { gender, city, profession, ageMin, ageMax, sect, maritalStatus, page = 1, limit = 6, shortlisted } = req.query;

    const isShortlistedQuery = shortlisted === 'true';

    const query = { 
      user: { $ne: new mongoose.Types.ObjectId(req.user.id) },
      $and: [
        { 'privacySettings.profile': { $ne: 'hidden' } },
        {
          $or: [
            { 'privacySettings.profile': { $exists: false } },
            { 'privacySettings.profile': 'all' },
            {
              $and: [
                { 'privacySettings.profile': 'connections' },
                { connections: new mongoose.Types.ObjectId(req.user.id) }
              ]
            }
          ]
        }
      ]
    };

    if (isShortlistedQuery) {
      // Show all shortlisted profiles regardless of gender
      query.shortlistedBy = new mongoose.Types.ObjectId(req.user.id);
    } else {
      const defaultOppositeGender = myProfile.gender === 'male' ? 'female' : 'male';
      if (gender) query.gender = gender;
      else query.gender = defaultOppositeGender;

      const planFeatures = await getPlanFeatures(currentUser ? currentUser.plan : 'free');

      if (planFeatures.advancedFilters) {
        if (city && city.trim() !== '') query.city = { $regex: city.trim(), $options: 'i' };
        if (profession && profession.trim() !== '') query.profession = { $regex: profession.trim(), $options: 'i' };
        if (sect && sect.trim() !== '' && sect !== 'All') query.sect = sect;
        if (maritalStatus && maritalStatus.trim() !== '') query.maritalStatus = maritalStatus;
      }

      if (ageMin || ageMax) {
        query.age = {};
        if (ageMin) query.age.$gte = parseInt(ageMin);
        if (ageMax) query.age.$lte = parseInt(ageMax);
      }
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = isShortlistedQuery ? 100 : Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    // Get total matching count
    const totalCount = await Profile.countDocuments(query);

    // Retrieve profiles with Profile Boost sorting (Elite > Premium > Free)
    // Admin users are excluded from all search results
    let profiles = await Profile.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      // Exclude admin accounts from appearing in search results
      { $match: { 'user.role': { $ne: 'admin' } } },
      {
        $addFields: {
          planWeight: {
            $switch: {
              branches: [
                { case: { $eq: ['$user.plan', 'elite'] }, then: 3 },
                { case: { $eq: ['$user.plan', 'premium'] }, then: 2 },
                { case: { $eq: ['$user.plan', 'free'] }, then: 1 }
              ],
              default: 0
            }
          }
        }
      },
      { $sort: { planWeight: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          planWeight: 0,
          'user.password': 0,
          'user.viewedProfiles': 0,
          'user.pushSubscriptions': 0,
          'user.interestsSentToday': 0,
          'user.viewedContacts': 0
        }
      }
    ]);

    // Map _id to ObjectId since aggregate returns plain objects
    profiles = profiles.map(p => {
      p.id = p._id.toString();
      if (p.user) {
        p.user.id = p.user._id.toString();
      }
      return p;
    });

    // Fetch accepted gallery requests where current user is sender
    const acceptedGalleryReqs = await GalleryRequest.find({
      sender: req.user.id,
      status: 'accepted'
    }).select('receiver');
    const allowedGalleryUserIds = acceptedGalleryReqs.map(r => r.receiver.toString());

    // Apply photo privacy rules
    profiles = profiles.map(profile => {
      const isConnected = profile.connections && profile.connections.some(c => c.toString() === req.user.id);
      const targetUserId = profile.user?._id?.toString() || profile.user?.toString();
      const hasGalleryAccess = isConnected || allowedGalleryUserIds.includes(targetUserId);

      // Check new photo privacy settings
      const photoPrivacy = profile.privacySettings?.photo || (profile.isPhotoPublic ? 'all' : 'hidden');
      let photoVisible = true;

      if (photoPrivacy === 'premium_elite') {
        const viewerPlan = currentUser ? currentUser.plan : 'free';
        photoVisible = (viewerPlan === 'premium' || viewerPlan === 'elite' || isConnected || hasGalleryAccess);
      } else if (photoPrivacy === 'connections') {
        photoVisible = (isConnected || hasGalleryAccess);
      } else if (photoPrivacy === 'hidden') {
        photoVisible = hasGalleryAccess;
      }

      if (!photoVisible && req.user.role !== 'admin') {
        profile.profilePhoto = '/uploads/blurred-avatar.png';
        profile.gallery = [];
      }
      return profile;
    });

    return res.status(200).json({
      success: true,
      count: profiles.length,
      total: totalCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum)
      },
      data: profiles,
    });
  } catch (error) {
    console.error('GetProfiles Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single profile by ID (Enforces view limits & masks content for Free tier)
// @route   GET /api/profiles/:id
// @access  Private
exports.getProfileById = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const viewer = await User.findById(currentUserId);
    if (!viewer) {
      return res.status(404).json({ success: false, message: 'Viewer account not found' });
    }

    const isAdmin = viewer.role === 'admin';
    const isOwnProfile = targetUserId === currentUserId;
    const planFeatures = await getPlanFeatures(viewer.plan);

    if (!isAdmin && !isOwnProfile) {
      const hasViewedBefore = viewer.viewedProfiles.includes(targetUserId);

      if (!hasViewedBefore) {
        const currentViews = viewer.viewedProfiles.length;
        const allowedViews = planFeatures.dailyViewLimit;
        
        if (currentViews >= allowedViews) {
          return res.status(403).json({
            success: false,
            message: `Profile view limit reached (${allowedViews} profiles). Upgrade your plan to unlock more matches!`,
            limitExceeded: true,
          });
        }

        viewer.viewedProfiles.push(targetUserId);
        await viewer.save();
      }
    }

    const profile = await Profile.findOne({ user: targetUserId })
      .populate('user', 'email role plan isManuallyVerified');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const isConnected = profile.connections.includes(currentUserId);

    // Enforce profile privacy settings
    if (!isOwnProfile && !isAdmin) {
      const profilePrivacy = profile.privacySettings?.profile || 'all';
      if (profilePrivacy === 'hidden') {
        return res.status(403).json({ success: false, message: 'This profile is set to private by the owner.' });
      }
      if (profilePrivacy === 'connections' && !isConnected) {
        return res.status(403).json({ success: false, message: 'This profile is only visible to mutual connections.' });
      }
    }

    const profileData = profile.toObject();

    // Fetch gallery request status
    const galleryReq = await GalleryRequest.findOne({
      sender: currentUserId,
      receiver: targetUserId
    });
    const galleryRequestStatus = galleryReq ? galleryReq.status : null;
    const hasGalleryAccess = isConnected || galleryRequestStatus === 'accepted';

    // Photo Privacy
    let photoVisible = true;
    if (!isOwnProfile && !isAdmin) {
      const photoPrivacy = profileData.privacySettings?.photo || (profileData.isPhotoPublic ? 'all' : 'hidden');
      if (photoPrivacy === 'premium_elite') {
        const viewerPlan = viewer ? viewer.plan : 'free';
        photoVisible = (viewerPlan === 'premium' || viewerPlan === 'elite' || isConnected || hasGalleryAccess);
      } else if (photoPrivacy === 'connections') {
        photoVisible = (isConnected || hasGalleryAccess);
      } else if (photoPrivacy === 'hidden') {
        photoVisible = hasGalleryAccess;
      }
    }

    if (!photoVisible) {
      profileData.profilePhoto = '/uploads/blurred-avatar.png';
      profileData.gallery = [];
    }

    // Dynamic Masking based on plan features & privacy settings
    if (!isOwnProfile && !isAdmin) {
      if (!planFeatures.viewFullBio) {
        profileData.locked = true;
        profileData.about = '🔒 Detailed profile description is locked. Upgrade your subscription plan to unlock full details!';
        profileData.education = '🔒 Locked (Premium feature)';
        profileData.profession = '🔒 Locked (Premium feature)';
        profileData.annualIncome = '🔒 Locked (Premium feature)';
        profileData.sect = '🔒 Locked';
        profileData.familyDetails = { fatherOccupation: '🔒 Locked', motherOccupation: '🔒 Locked', siblingsCount: 0 };
      } else {
        profileData.locked = false;
      }

      // Check contact privacy rules
      let contactAllowed = false;
      if (planFeatures.viewContactDetails) {
        const mobilePrivacy = profileData.privacySettings?.mobile || 'all_paid';
        if (mobilePrivacy === 'all_paid') {
          contactAllowed = true;
        } else if (mobilePrivacy === 'community_paid') {
          const viewerProfile = await Profile.findOne({ user: currentUserId });
          if (viewerProfile && viewerProfile.sect === profileData.sect) {
            contactAllowed = true;
          }
        } else if (mobilePrivacy === 'contacted_paid') {
          contactAllowed = isConnected;
        }
      }

      if (!contactAllowed) {
        profileData.phoneNumber = '🔒 Contact details locked (requires connection or matching privacy settings)';
        profileData.waliContact = '🔒 Wali Contact locked';
        if (profileData.user) {
          profileData.user.email = '🔒 Email locked';
        }
      } else {
        // They are allowed by plan and connection. Now check contactViewLimit.
        const hasViewedContactBefore = viewer.viewedContacts.includes(targetUserId);
        if (!hasViewedContactBefore) {
          const contactLimit = planFeatures.contactViewLimit || 10;
          if (viewer.viewedContacts.length >= contactLimit) {
            profileData.phoneNumber = `🔒 Contact Limit Reached (${contactLimit} views). Upgrade to Elite!`;
            profileData.waliContact = `🔒 Contact Limit Reached`;
            if (profileData.user) profileData.user.email = `🔒 Contact Limit Reached`;
          } else {
            viewer.viewedContacts.push(targetUserId);
            await viewer.save();
          }
        }
      }
    } else {
      profileData.locked = false;
    }

    return res.status(200).json({
      success: true,
      data: profileData,
      isConnected,
      galleryRequestStatus,
      viewedCount: viewer.viewedProfiles.length,
      viewLimit: planFeatures.dailyViewLimit,
      plan: viewer.plan
    });
  } catch (error) {
    console.error('GetProfileById Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/profiles/my-profile
// @access  Private
exports.updateMyProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const { 
      name, age, gender, sect, profession, education, city, about, phoneNumber,
      height, maritalStatus, motherTongue, namazFrequency, isPhotoPublic,
      fatherOccupation, motherOccupation, siblingsCount,
      partnerAgeRange, partnerSect, partnerEducation,
      waliContact, annualIncome, privacySettings
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (age) updateData.age = parseInt(age);
    if (gender) updateData.gender = gender;
    if (sect) updateData.sect = sect;
    if (profession !== undefined) updateData.profession = profession;
    if (annualIncome !== undefined) updateData.annualIncome = annualIncome;
    if (education !== undefined) updateData.education = education;
    if (city) updateData.city = city;
    if (about !== undefined) updateData.about = about;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (waliContact !== undefined) updateData.waliContact = waliContact;
    if (height) updateData.height = height;
    if (maritalStatus) updateData.maritalStatus = maritalStatus;
    if (motherTongue) updateData.motherTongue = motherTongue;
    if (namazFrequency) updateData.namazFrequency = namazFrequency;

    let parsedPrivacySettings = undefined;
    if (privacySettings !== undefined) {
      try {
        parsedPrivacySettings = typeof privacySettings === 'string'
          ? JSON.parse(privacySettings)
          : privacySettings;
      } catch (err) {
        console.error('Failed to parse privacySettings in profile update:', err);
      }
    }

    if (parsedPrivacySettings !== undefined) {
      updateData.privacySettings = {
        mobile: parsedPrivacySettings.mobile || (profile.privacySettings && profile.privacySettings.mobile) || 'all_paid',
        photo: parsedPrivacySettings.photo || (profile.privacySettings && profile.privacySettings.photo) || 'all',
        horoscope: parsedPrivacySettings.horoscope || (profile.privacySettings && profile.privacySettings.horoscope) || 'all',
        profile: parsedPrivacySettings.profile || (profile.privacySettings && profile.privacySettings.profile) || 'all'
      };
      // Keep isPhotoPublic in sync
      updateData.isPhotoPublic = (updateData.privacySettings.photo === 'all' || updateData.privacySettings.photo === 'premium_elite');
    } else if (isPhotoPublic !== undefined) {
      const isPublic = isPhotoPublic === 'true' || isPhotoPublic === true;
      updateData.isPhotoPublic = isPublic;
      const currentPrivacy = profile.privacySettings || { mobile: 'all_paid', photo: 'all', horoscope: 'all', profile: 'all' };
      updateData.privacySettings = {
        ...currentPrivacy,
        photo: isPublic ? 'all' : 'hidden'
      };
    }

    // Parse siblingsList if sent (it might be a JSON string due to multipart/form-data upload format)
    let parsedSiblingsList = undefined;
    if (req.body.siblingsList !== undefined) {
      try {
        parsedSiblingsList = typeof req.body.siblingsList === 'string'
          ? JSON.parse(req.body.siblingsList)
          : req.body.siblingsList;
      } catch (err) {
        console.error('Failed to parse siblingsList in profile update:', err);
      }
    }

    // Handle nested objects
    updateData.familyDetails = {
      fatherOccupation: fatherOccupation !== undefined ? fatherOccupation : profile.familyDetails.fatherOccupation,
      motherOccupation: motherOccupation !== undefined ? motherOccupation : profile.familyDetails.motherOccupation,
      siblingsCount: parsedSiblingsList !== undefined ? parsedSiblingsList.length : (siblingsCount ? parseInt(siblingsCount) : profile.familyDetails.siblingsCount),
      siblingsList: parsedSiblingsList !== undefined ? parsedSiblingsList : profile.familyDetails.siblingsList
    };

    updateData.partnerPreferences = {
      ageRange: partnerAgeRange || profile.partnerPreferences.ageRange,
      sectPreference: partnerSect || profile.partnerPreferences.sectPreference,
      educationPreference: partnerEducation || profile.partnerPreferences.educationPreference,
    };

    if (req.file) {
      updateData.profilePhoto = `/uploads/${req.file.filename}`;
    }

    profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('user', 'email role plan isManuallyVerified');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    console.error('UpdateMyProfile Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Shortlist / Bookmark a profile
// @route   POST /api/profiles/shortlist/:id
// @access  Private
exports.toggleShortlist = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    // Check plan features
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const planFeatures = await getPlanFeatures(currentUser.plan);
    if (!planFeatures.shortlist) {
      return res.status(403).json({ success: false, message: 'Shortlisting is not enabled for your subscription plan. Please upgrade!' });
    }

    const profile = await Profile.findOne({ user: targetUserId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const isShortlisted = profile.shortlistedBy.includes(currentUserId);

    if (isShortlisted) {
      profile.shortlistedBy.pull(currentUserId);
    } else {
      profile.shortlistedBy.push(currentUserId);
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      isShortlisted: !isShortlisted,
      message: isShortlisted ? 'Removed from shortlist' : 'Added to shortlist'
    });
  } catch (error) {
    console.error('ToggleShortlist Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get profiles of users who visited the logged-in user's profile
// @route   GET /api/profiles/visitors
// @access  Private
exports.getProfileVisitors = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    // Find all non-admin users whose viewedProfiles contains currentUserId
    const visitors = await User.find({ viewedProfiles: currentUserId, role: { $ne: 'admin' } }).select('_id');
    const visitorIds = visitors.map(v => v._id);
    const visitorProfiles = await Profile.find({ user: { $in: visitorIds } })
      .populate('user', 'email role plan isManuallyVerified');
    
    return res.status(200).json({
      success: true,
      count: visitorProfiles.length,
      data: visitorProfiles
    });
  } catch (error) {
    console.error('GetProfileVisitors Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get profiles of users who viewed the logged-in user's contact details
// @route   GET /api/profiles/contact-viewers
// @access  Private
exports.getContactViewers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    // Find all non-admin users whose viewedContacts contains currentUserId
    const viewers = await User.find({ viewedContacts: currentUserId, role: { $ne: 'admin' } }).select('_id');
    const viewerIds = viewers.map(v => v._id);
    const contactViewerProfiles = await Profile.find({ user: { $in: viewerIds } })
      .populate('user', 'email role plan isManuallyVerified');
    
    return res.status(200).json({
      success: true,
      count: contactViewerProfiles.length,
      data: contactViewerProfiles
    });
  } catch (error) {
    console.error('GetContactViewers Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

