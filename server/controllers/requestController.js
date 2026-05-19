const InterestRequest = require('../models/InterestRequest');
const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Send an interest request to a profile
// @route   POST /api/requests/send/:id
// @access  Private
exports.sendInterest = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user.id;

    // Prevent sending interest to yourself
    if (receiverId === senderId) {
      return res.status(400).json({ success: false, message: 'You cannot send an interest request to yourself' });
    }

    // Check if the recipient exists
    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) {
      return res.status(404).json({ success: false, message: 'Receiver profile not found' });
    }

    // Check if a request already exists in either direction
    const existingRequest = await InterestRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'You are already connected with this user' });
      }
      return res.status(400).json({
        success: false,
        message: 'A connection request is already pending or has been processed between you'
      });
    }

    // Create the interest request
    const request = await InterestRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Interest request sent successfully!',
      data: request
    });
  } catch (error) {
    console.error('SendInterest Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept a received interest request
// @route   PUT /api/requests/accept/:id
// @access  Private
exports.acceptInterest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id; // Must be the receiver to accept

    const request = await InterestRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Interest request not found' });
    }

    // Ensure the current user is the one who received the request
    if (request.receiver.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to accept this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    // Update status to accepted
    request.status = 'accepted';
    await request.save();

    // Establish dynamic connection between both profiles
    await Profile.findOneAndUpdate(
      { user: request.sender },
      { $addToSet: { connections: request.receiver } }
    );

    await Profile.findOneAndUpdate(
      { user: request.receiver },
      { $addToSet: { connections: request.sender } }
    );

    return res.status(200).json({
      success: true,
      message: 'Interest request accepted! You are now connected.',
      data: request
    });
  } catch (error) {
    console.error('AcceptInterest Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject / Decline an interest request
// @route   PUT /api/requests/reject/:id
// @access  Private
exports.rejectInterest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;

    const request = await InterestRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Interest request not found' });
    }

    // Ensure the current user is the receiver to reject
    if (request.receiver.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to process this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    // Update status to rejected
    request.status = 'rejected';
    await request.save();

    return res.status(200).json({
      success: true,
      message: 'Interest request declined.',
      data: request
    });
  } catch (error) {
    console.error('RejectInterest Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sent and received requests
// @route   GET /api/requests
// @access  Private
exports.getRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Received pending requests (along with sender profile details)
    const received = await InterestRequest.find({ receiver: userId, status: 'pending' })
      .populate({
        path: 'sender',
        select: 'email isVerified',
      });

    // We also need the profile details of the sender. Let's map over them or populate manually
    const receivedWithProfiles = await Promise.all(
      received.map(async (reqItem) => {
        if (!reqItem.sender) return null;
        const profile = await Profile.findOne({ user: reqItem.sender._id });
        return {
          ...reqItem.toObject(),
          senderProfile: profile,
        };
      })
    );

    // Sent requests (along with receiver profile details)
    const sent = await InterestRequest.find({ sender: userId })
      .populate({
        path: 'receiver',
        select: 'email isVerified',
      });

    const sentWithProfiles = await Promise.all(
      sent.map(async (reqItem) => {
        if (!reqItem.receiver) return null;
        const profile = await Profile.findOne({ user: reqItem.receiver._id });
        return {
          ...reqItem.toObject(),
          receiverProfile: profile,
        };
      })
    );

    return res.status(200).json({
      success: true,
      received: receivedWithProfiles.filter(item => item !== null),
      sent: sentWithProfiles.filter(item => item !== null),
    });
  } catch (error) {
    console.error('GetRequests Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get connected mutual matches
// @route   GET /api/requests/connections
// @access  Private
exports.getConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user's profile
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Get profiles of everyone in connections array
    const connections = await Profile.find({ user: { $in: profile.connections } })
      .populate('user', 'email isVerified');

    return res.status(200).json({
      success: true,
      count: connections.length,
      data: connections,
    });
  } catch (error) {
    console.error('GetConnections Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
