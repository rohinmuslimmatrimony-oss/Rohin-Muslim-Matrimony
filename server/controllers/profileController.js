const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Get all profiles with advanced search filters
// @route   GET /api/profiles
// @access  Private
exports.getProfiles = async (req, res) => {
  try {
    const myProfile = await Profile.findOne({ user: req.user.id });
    if (!myProfile) {
      return res.status(404).json({ success: false, message: 'Please create a profile first' });
    }

    const defaultOppositeGender = myProfile.gender === 'male' ? 'female' : 'male';
    const query = { user: { $ne: req.user.id } };
    const { gender, city, profession, ageMin, ageMax, sect, maritalStatus } = req.query;

    if (gender) query.gender = gender;
    else query.gender = defaultOppositeGender;

    if (city && city.trim() !== '') query.city = { $regex: city.trim(), $options: 'i' };
    if (profession && profession.trim() !== '') query.profession = { $regex: profession.trim(), $options: 'i' };
    if (sect && sect.trim() !== '' && sect !== 'All') query.sect = sect;
    if (maritalStatus && maritalStatus.trim() !== '') query.maritalStatus = maritalStatus;

    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin) query.age.$gte = parseInt(ageMin);
      if (ageMax) query.age.$lte = parseInt(ageMax);
    }

    // Retrieve profiles
    let profiles = await Profile.find(query)
      .populate('user', 'email role plan isManuallyVerified')
      .sort({ createdAt: -1 });

    // Apply photo privacy rules
    profiles = profiles.map(profile => {
      const pData = profile.toObject();
      const isConnected = profile.connections.includes(req.user.id);
      if (!pData.isPhotoPublic && !isConnected && req.user.role !== 'admin') {
        pData.profilePhoto = '/uploads/blurred-avatar.png'; // Mock a blurred image response
        pData.gallery = [];
      }
      return pData;
    });

    return res.status(200).json({
      success: true,
      count: profiles.length,
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

    if (!isAdmin && !isOwnProfile) {
      const hasViewedBefore = viewer.viewedProfiles.includes(targetUserId);

      if (!hasViewedBefore) {
        if (viewer.plan === 'free' && viewer.viewedProfiles.length >= viewer.viewLimit) {
          return res.status(403).json({
            success: false,
            message: `Profile view limit reached (${viewer.viewLimit} profiles). Upgrade your plan to unlock more matches!`,
            limitExceeded: true,
          });
        }

        if (viewer.plan === 'premium' && viewer.viewedProfiles.length >= 30) {
          return res.status(403).json({
            success: false,
            message: 'You have reached your daily Premium limit of 30 profiles. Upgrade to Elite for unlimited access!',
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
    const profileData = profile.toObject();

    // Photo Privacy
    if (!profileData.isPhotoPublic && !isConnected && !isAdmin && !isOwnProfile) {
      profileData.profilePhoto = '/uploads/blurred-avatar.png';
      profileData.gallery = [];
    }

    // Free Tier Masking
    if (viewer.plan === 'free' && !isOwnProfile && !isAdmin) {
      profileData.locked = true;
      profileData.about = '🔒 Detailed profile description is locked. Upgrade your subscription plan to unlock full details!';
      profileData.education = '🔒 Locked (Premium feature)';
      profileData.profession = '🔒 Locked (Premium feature)';
      profileData.sect = '🔒 Locked';
      profileData.familyDetails = { fatherOccupation: '🔒 Locked', motherOccupation: '🔒 Locked', siblingsCount: 0 };
      profileData.phoneNumber = '🔒 Locked (Premium feature)';
      if (profileData.user) {
        profileData.user.email = '🔒 Locked';
      }
    } else {
      profileData.locked = false;
      if (!isConnected && !isAdmin && !isOwnProfile) {
        profileData.phoneNumber = '🔒 Connected connection required';
        if (profileData.user) {
          profileData.user.email = '🔒 Connected connection required';
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: profileData,
      isConnected,
      viewedCount: viewer.viewedProfiles.length,
      viewLimit: viewer.viewLimit,
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
      partnerAgeRange, partnerSect, partnerEducation
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (age) updateData.age = parseInt(age);
    if (gender) updateData.gender = gender;
    if (sect) updateData.sect = sect;
    if (profession) updateData.profession = profession;
    if (education) updateData.education = education;
    if (city) updateData.city = city;
    if (about) updateData.about = about;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (height) updateData.height = height;
    if (maritalStatus) updateData.maritalStatus = maritalStatus;
    if (motherTongue) updateData.motherTongue = motherTongue;
    if (namazFrequency) updateData.namazFrequency = namazFrequency;
    if (isPhotoPublic !== undefined) updateData.isPhotoPublic = isPhotoPublic === 'true' || isPhotoPublic === true;

    // Handle nested objects
    updateData.familyDetails = {
      fatherOccupation: fatherOccupation || profile.familyDetails.fatherOccupation,
      motherOccupation: motherOccupation || profile.familyDetails.motherOccupation,
      siblingsCount: siblingsCount ? parseInt(siblingsCount) : profile.familyDetails.siblingsCount,
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

    // Must be premium or elite to shortlist
    const currentUser = await User.findById(currentUserId);
    if (!currentUser || (currentUser.plan !== 'premium' && currentUser.plan !== 'elite')) {
      return res.status(403).json({ success: false, message: 'Shortlisting requires a Premium or Elite plan.' });
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
