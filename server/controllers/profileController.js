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

// @desc    Get single profile details (with plan & privacy checks)
// @route   GET /api/profiles/:id
// @access  Private
exports.getProfileById = async (req, res) => {
  try {
    const rawId = req.params.id;
    const currentUserId = req.user.id;

    const viewer = await User.findById(currentUserId);
    if (!viewer) {
      return res.status(404).json({ success: false, message: 'Viewer account not found' });
    }

    if (!viewer.viewedProfiles) {
      viewer.viewedProfiles = [];
    }

    // Resolve profile by User ID or Profile _id
    let profile = await Profile.findOne({ user: rawId }).populate('user', 'email role plan isManuallyVerified');
    if (!profile) {
      profile = await Profile.findById(rawId).populate('user', 'email role plan isManuallyVerified');
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const targetUserId = (profile.user?._id ? profile.user._id : profile.user).toString();
    const isAdmin = viewer.role === 'admin';
    const isOwnProfile = targetUserId === currentUserId.toString();
    const planFeatures = await getPlanFeatures(viewer.plan);

    if (!isAdmin && !isOwnProfile) {
      const hasViewedBefore = viewer.viewedProfiles.some(
        (id) => id && id.toString() === targetUserId
      );

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

    const isConnected = profile.connections && profile.connections.some(c => c.toString() === currentUserId.toString());

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
        if (!viewer.viewedContacts) viewer.viewedContacts = [];
        const hasViewedContactBefore = viewer.viewedContacts.some(id => id && id.toString() === targetUserId);
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

// @desc    Get dynamic daily recommendations based on partner preferences and plan limits
// @route   GET /api/profiles/daily-recommendations
// @access  Private
exports.getDailyRecommendations = async (req, res) => {
  try {
    const myProfile = await Profile.findOne({ user: req.user.id });
    if (!myProfile) {
      return res.status(404).json({ success: false, message: 'Please create a profile first' });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Determine dynamic limit based on setting controls
    const planFeatures = await getPlanFeatures(currentUser.plan);
    const limit = planFeatures.dailyRecommendationLimit || 5;

    const oppositeGender = myProfile.gender === 'male' ? 'female' : 'male';

    // Exclude connected users, sent requests, and already viewed recommendations
    const excludedUserIds = [
      req.user.id,
      ...(myProfile.connections || [])
    ];

    // Exclude viewed daily recommendations
    if (currentUser.viewedRecommendations && currentUser.viewedRecommendations.length > 0) {
      excludedUserIds.push(...currentUser.viewedRecommendations.map(id => id.toString()));
    }

    // Query candidates of opposite gender
    let candidates = await Profile.find({
      user: { $nin: excludedUserIds },
      gender: oppositeGender
    }).populate('user', 'email role plan isManuallyVerified');

    // Parse partner preferences
    const prefAge = myProfile.partnerPreferences?.ageRange || '18-35';
    const prefSect = myProfile.partnerPreferences?.sectPreference || 'No Preference';
    const prefEdu = myProfile.partnerPreferences?.educationPreference || "Doesn't Matter";

    let minAge = 18;
    let maxAge = 80;
    if (prefAge && prefAge.includes('-')) {
      const parts = prefAge.split('-');
      minAge = parseInt(parts[0]) || 18;
      maxAge = parseInt(parts[1]) || 80;
    }

    // Map candidates to add matchDetails and matchScore
    const scoredCandidates = candidates.map(candidate => {
      const candObj = candidate.toObject();

      // 1. Age match
      const ageMatch = candObj.age >= minAge && candObj.age <= maxAge;
      
      // 2. Sect match
      const sectMatch = prefSect === 'No Preference' || 
                        prefSect.toLowerCase() === 'open to all' || 
                        (candObj.sect && candObj.sect.toLowerCase() === prefSect.toLowerCase());

      // 3. Education match
      const eduMatch = prefEdu === "Doesn't Matter" || 
                       prefEdu.toLowerCase() === 'any' || 
                       (candObj.education && candObj.education.toLowerCase().includes(prefEdu.toLowerCase()));

      // 4. City location match
      const cityMatch = candObj.city && myProfile.city && 
                        candObj.city.toLowerCase() === myProfile.city.toLowerCase();

      // 5. Mother Tongue match
      const tongueMatch = candObj.motherTongue && myProfile.motherTongue && 
                          candObj.motherTongue.toLowerCase() === myProfile.motherTongue.toLowerCase();

      let score = 0;
      if (ageMatch) score++;
      if (sectMatch) score++;
      if (eduMatch) score++;
      if (cityMatch) score++;
      if (tongueMatch) score++;

      candObj.matchDetails = {
        age: { label: `Age Range (${minAge}-${maxAge} Yrs)`, matched: ageMatch, value: `${candObj.age} yrs` },
        sect: { label: `Sect (${prefSect})`, matched: sectMatch, value: candObj.sect || 'Not Specified' },
        education: { label: `Education Preferred (${prefEdu})`, matched: eduMatch, value: candObj.education || 'Not Specified' },
        city: { label: `Same Location (${myProfile.city})`, matched: cityMatch, value: candObj.city || 'Not Specified' },
        motherTongue: { label: `Same Mother Tongue (${myProfile.motherTongue})`, matched: tongueMatch, value: candObj.motherTongue || 'Not Specified' }
      };
      candObj.matchScore = score;
      return candObj;
    });

    // Exclude admins (populated in candidate.user.role)
    const filteredCandidates = scoredCandidates.filter(c => c.user && c.user.role !== 'admin');

    // Sort by matchScore descending, then by planWeight (Elite > Premium > Free)
    filteredCandidates.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      const getPlanWeight = (plan) => {
        if (plan === 'elite') return 3;
        if (plan === 'premium') return 2;
        return 1;
      };
      return getPlanWeight(b.user.plan) - getPlanWeight(a.user.plan);
    });

    // Limit to the dynamic plan recommendation limit
    const dailyRecommendations = filteredCandidates.slice(0, limit);

    // Apply photo privacy rules
    const visitorReqs = await GalleryRequest.find({
      sender: req.user.id,
      status: 'accepted'
    }).select('receiver');
    const allowedGalleryUserIds = visitorReqs.map(r => r.receiver.toString());

    const finalRecommendations = dailyRecommendations.map(profile => {
      const isConnected = profile.connections && profile.connections.some(c => c.toString() === req.user.id);
      const targetUserId = profile.user?._id?.toString() || profile.user?.toString();
      const hasGalleryAccess = isConnected || allowedGalleryUserIds.includes(targetUserId);

      const photoPrivacy = profile.privacySettings?.photo || (profile.isPhotoPublic ? 'all' : 'hidden');
      let photoVisible = true;

      if (photoPrivacy === 'premium_elite') {
        const viewerPlan = currentUser.plan;
        photoVisible = (viewerPlan === 'premium' || viewerPlan === 'elite' || isConnected || hasGalleryAccess);
      } else if (photoPrivacy === 'connections') {
        photoVisible = (isConnected || hasGalleryAccess);
      } else if (photoPrivacy === 'hidden') {
        photoVisible = hasGalleryAccess;
      }

      if (!photoVisible) {
        profile.profilePhoto = '/uploads/blurred-avatar.png';
        profile.gallery = [];
      }
      return profile;
    });

    return res.status(200).json({
      success: true,
      count: finalRecommendations.length,
      limit,
      data: finalRecommendations
    });
  } catch (error) {
    console.error('GetDailyRecommendations Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record daily recommendation view (swiped/skipped)
// @route   POST /api/profiles/daily-recommendations/view/:id
// @access  Private
exports.recordRecommendationView = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.viewedRecommendations) {
      user.viewedRecommendations = [];
    }

    if (!user.viewedRecommendations.includes(targetUserId)) {
      user.viewedRecommendations.push(targetUserId);
      await user.save();
    }

    return res.status(200).json({ success: true, message: 'Recommendation view recorded' });
  } catch (error) {
    console.error('RecordRecommendationView Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

