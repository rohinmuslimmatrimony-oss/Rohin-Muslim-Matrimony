const InterestRequest = require('../models/InterestRequest');
const Profile = require('../models/Profile');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const Notification = require('../models/Notification');

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

    // Send email notification to the recipient asynchronously
    const senderProfile = await Profile.findOne({ user: senderId });
    const receiverProfile = await Profile.findOne({ user: receiverId });

    // Create notification in DB
    const notification = await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: 'interest_sent',
      title: 'New Interest Received! 💖',
      message: `${senderProfile?.name || 'Someone'} is interested in your profile.`,
      url: '/interests'
    });

    const populatedNotification = {
      ...notification.toObject(),
      senderName: senderProfile ? senderProfile.name : 'Matrimony Member',
      senderPhoto: senderProfile ? senderProfile.profilePhoto : '/uploads/default-avatar.png'
    };

    // Emit real-time notification via Socket.io
    if (req.io) {
      req.io.to(receiverId).emit('receive_interest_notification', {
        senderId,
        senderName: senderProfile?.name || 'Someone',
        message: `${senderProfile?.name || 'A user'} is interested in your profile! 💖`
      });
      req.io.to(receiverId).emit('new_notification', populatedNotification);
      req.io.to(senderId).emit('interests_updated');
      req.io.to(receiverId).emit('interests_updated');
    }

    // Trigger Web Push notification
    const sendPushNotification = require('../utils/pushNotifier');
    sendPushNotification(
      receiverId,
      'New Interest Expressed 💖',
      `${senderProfile?.name || 'Someone'} is interested in your profile!`,
      '/interests'
    ).catch(err => console.error('Failed to trigger sendInterest push notification:', err));

    sendEmail({
      email: receiverUser.email,
      subject: 'New Interest Received! 💖 - Rohin Muslim Matrimony',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f2e8db; border-radius: 12px; background-color: #faf8f5;">
          <h2 style="color: #4f080e; text-align: center; font-family: Georgia, serif;">Assalamu Alaikum, ${receiverProfile?.name || 'Member'}!</h2>
          <p style="font-size: 14px; color: #333333; line-height: 1.6;">
            A new member, <strong>${senderProfile?.name || 'someone'}</strong>, has expressed interest in your profile on <strong>Rohin Muslim Matrimony</strong>.
          </p>
          <p style="font-size: 14px; color: #333333; line-height: 1.6;">
            You can log into your dashboard to review their details, accept their connection, and start chatting!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://rohin-muslim-matrimony.onrender.com/interests" style="background-color: #4f080e; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">
              View Pending Interests
            </a>
          </div>
        </div>
      `
    }).catch(err => console.error('Failed to trigger sendInterest email:', err));

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

    // Notify the sender that their interest request was accepted
    const senderUser = await User.findById(request.sender);
    const senderProfile = await Profile.findOne({ user: request.sender });
    const receiverProfile = await Profile.findOne({ user: request.receiver });

    // Create notification in DB
    const notification = await Notification.create({
      recipient: request.sender,
      sender: userId,
      type: 'interest_accepted',
      title: 'Interest Accepted! 🎉',
      message: `${receiverProfile?.name || 'Someone'} accepted your interest request!`,
      url: '/interests'
    });

    const populatedNotification = {
      ...notification.toObject(),
      senderName: receiverProfile ? receiverProfile.name : 'Matrimony Member',
      senderPhoto: receiverProfile ? receiverProfile.profilePhoto : '/uploads/default-avatar.png'
    };

    // Emit real-time notification via Socket.io
    if (req.io) {
      req.io.to(request.sender.toString()).emit('receive_interest_accept', {
        receiverId: userId,
        receiverName: receiverProfile?.name || 'Someone',
        message: `${receiverProfile?.name || 'A user'} accepted your interest request! 🎉`
      });
      req.io.to(request.sender.toString()).emit('new_notification', populatedNotification);
      req.io.to(request.sender.toString()).emit('interests_updated');
      req.io.to(userId).emit('interests_updated');
    }

    // Trigger Web Push notification
    const sendPushNotification = require('../utils/pushNotifier');
    sendPushNotification(
      request.sender.toString(),
      'Interest Accepted! 🎉',
      `${receiverProfile?.name || 'Someone'} accepted your interest request!`,
      '/interests'
    ).catch(err => console.error('Failed to trigger acceptInterest push notification:', err));

    if (senderUser) {
      sendEmail({
        email: senderUser.email,
        subject: 'Interest Accepted! 🎉 - Rohin Muslim Matrimony',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f2e8db; border-radius: 12px; background-color: #faf8f5;">
            <h2 style="color: #4f080e; text-align: center; font-family: Georgia, serif;">Assalamu Alaikum, ${senderProfile?.name || 'Member'}!</h2>
            <p style="font-size: 14px; color: #333333; line-height: 1.6;">
              Great news! <strong>${receiverProfile?.name || 'Member'}</strong> has accepted your interest request on <strong>Rohin Muslim Matrimony</strong>.
            </p>
            <p style="font-size: 14px; color: #333333; line-height: 1.6;">
              You are now connected! You can now start communicating directly in the chat tab and view their contact details.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://rohin-muslim-matrimony.onrender.com/interests" style="background-color: #4f080e; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">
                Start Chatting Now
              </a>
            </div>
          </div>
        `
      }).catch(err => console.error('Failed to trigger acceptInterest email:', err));
    }

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

    if (req.io) {
      req.io.to(request.sender.toString()).emit('interests_updated');
      req.io.to(userId).emit('interests_updated');
    }

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

// @desc    Cancel / Withdraw a sent interest request
// @route   DELETE /api/requests/cancel/:id
// @access  Private
exports.cancelInterest = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user.id;

    // Find the pending request
    const request = await InterestRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Pending interest request not found'
      });
    }

    await InterestRequest.deleteOne({ _id: request._id });

    if (req.io) {
      req.io.to(senderId).emit('interests_updated');
      req.io.to(receiverId).emit('interests_updated');
    }

    return res.status(200).json({
      success: true,
      message: 'Interest request withdrawn successfully.'
    });
  } catch (error) {
    console.error('CancelInterest Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

