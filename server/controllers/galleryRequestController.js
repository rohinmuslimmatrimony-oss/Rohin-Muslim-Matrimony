const GalleryRequest = require('../models/GalleryRequest');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

// @desc    Send a request to view a user's private photos
// @route   POST /api/gallery-requests/send/:id
// @access  Private
exports.sendGalleryRequest = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user.id;

    // Prevent requesting access to yourself
    if (receiverId === senderId) {
      return res.status(400).json({ success: false, message: 'You cannot request photo access from yourself' });
    }

    // Check if the recipient exists
    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) {
      return res.status(404).json({ success: false, message: 'Receiver profile not found' });
    }

    // Check if a request already exists
    const existingRequest = await GalleryRequest.findOne({
      sender: senderId,
      receiver: receiverId
    });

    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'You already have access to this user\'s gallery' });
      }
      return res.status(400).json({ success: false, message: 'A photo access request is already pending or has been declined' });
    }

    // Create the gallery request
    const request = await GalleryRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

    const senderProfile = await Profile.findOne({ user: senderId });
    const receiverProfile = await Profile.findOne({ user: receiverId });

    // Create notification in DB
    const notification = await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: 'gallery_request_sent',
      title: 'Photo Access Request 📷',
      message: `${senderProfile?.name || 'Someone'} requested access to view your private photos.`,
      url: '/activity'
    });

    const populatedNotification = {
      ...notification.toObject(),
      senderName: senderProfile ? senderProfile.name : 'Matrimony Member',
      senderPhoto: senderProfile ? senderProfile.profilePhoto : '/uploads/default-avatar.png'
    };

    // Emit real-time notification via Socket.io
    if (req.io) {
      req.io.to(receiverId).emit('receive_gallery_request', {
        senderId,
        senderName: senderProfile?.name || 'Someone',
        message: `${senderProfile?.name || 'A user'} requested access to view your private photos! 📷`
      });
      req.io.to(receiverId).emit('new_notification', populatedNotification);
      req.io.to(senderId).emit('gallery_requests_updated');
      req.io.to(receiverId).emit('gallery_requests_updated');
    }

    // Trigger Web Push notification if push notifier is available
    try {
      const sendPushNotification = require('../utils/pushNotifier');
      sendPushNotification(
        receiverId,
        'Photo Access Request 📷',
        `${senderProfile?.name || 'Someone'} requested access to view your private photos!`,
        '/activity'
      ).catch(err => console.error('Failed to trigger galleryRequest push notification:', err));
    } catch (err) {}

    // Send email notification
    sendEmail({
      email: receiverUser.email,
      subject: 'Photo Access Request! 📷 - Rohin Muslim Matrimony',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f2e8db; border-radius: 12px; background-color: #faf8f5;">
          <h2 style="color: #4f080e; text-align: center; font-family: Georgia, serif;">Assalamu Alaikum, ${receiverProfile?.name || 'Member'}!</h2>
          <p style="font-size: 14px; color: #333333; line-height: 1.6;">
            A member, <strong>${senderProfile?.name || 'someone'}</strong>, has requested access to view your private photos on <strong>Rohin Muslim Matrimony</strong>.
          </p>
          <p style="font-size: 14px; color: #333333; line-height: 1.6;">
            You can log into your dashboard to review this request and decide whether to approve it.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://rohin-muslim-matrimony.onrender.com/activity" style="background-color: #4f080e; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">
              View Request
            </a>
          </div>
        </div>
      `
    }).catch(err => console.error('Failed to trigger galleryRequest email:', err));

    return res.status(201).json({
      success: true,
      message: 'Photo access request sent successfully!',
      data: request
    });
  } catch (error) {
    console.error('SendGalleryRequest Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sent and received gallery requests
// @route   GET /api/gallery-requests
// @access  Private
exports.getGalleryRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Received requests (along with sender profile details)
    const received = await GalleryRequest.find({ receiver: userId })
      .populate({
        path: 'sender',
        select: 'email plan',
      });

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

    // Sent requests
    const sent = await GalleryRequest.find({ sender: userId })
      .populate({
        path: 'receiver',
        select: 'email',
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
    console.error('GetGalleryRequests Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept a received gallery request
// @route   PUT /api/gallery-requests/accept/:id
// @access  Private
exports.acceptGalleryRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id; // Must be the receiver to accept

    const request = await GalleryRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Ensure current user is the one who received the request
    if (request.receiver.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to accept this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    // Update status to accepted
    request.status = 'accepted';
    await request.save();

    // Mark previous notifications as read
    await Notification.updateMany(
      { recipient: userId, sender: request.sender, type: 'gallery_request_sent', isRead: false },
      { $set: { isRead: true } }
    );

    const senderUser = await User.findById(request.sender);
    const senderProfile = await Profile.findOne({ user: request.sender });
    const receiverProfile = await Profile.findOne({ user: request.receiver });

    // Notify the sender that their request was accepted
    const notification = await Notification.create({
      recipient: request.sender,
      sender: userId,
      type: 'gallery_request_accepted',
      title: 'Photo Access Granted! 📷',
      message: `${receiverProfile?.name || 'Someone'} accepted your photo access request!`,
      url: `/profile/${userId}`
    });

    const populatedNotification = {
      ...notification.toObject(),
      senderName: receiverProfile ? receiverProfile.name : 'Matrimony Member',
      senderPhoto: receiverProfile ? receiverProfile.profilePhoto : '/uploads/default-avatar.png'
    };

    // Emit real-time notification via Socket.io
    if (req.io) {
      req.io.to(request.sender.toString()).emit('receive_gallery_accept', {
        receiverId: userId,
        receiverName: receiverProfile?.name || 'Someone',
        message: `${receiverProfile?.name || 'A user'} accepted your photo access request! 📷`
      });
      req.io.to(request.sender.toString()).emit('new_notification', populatedNotification);
      req.io.to(request.sender.toString()).emit('gallery_requests_updated');
      req.io.to(userId).emit('gallery_requests_updated');
    }

    // Trigger Web Push notification if push notifier is available
    try {
      const sendPushNotification = require('../utils/pushNotifier');
      sendPushNotification(
        request.sender.toString(),
        'Photo Access Granted! 📷',
        `${receiverProfile?.name || 'Someone'} accepted your photo access request!`,
        `/profile/${userId}`
      ).catch(err => console.error('Failed to trigger galleryAccept push notification:', err));
    } catch (err) {}

    // Send email notification
    if (senderUser) {
      sendEmail({
        email: senderUser.email,
        subject: 'Photo Access Approved! 📷 - Rohin Muslim Matrimony',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f2e8db; border-radius: 12px; background-color: #faf8f5;">
            <h2 style="color: #4f080e; text-align: center; font-family: Georgia, serif;">Assalamu Alaikum, ${senderProfile?.name || 'Member'}!</h2>
            <p style="font-size: 14px; color: #333333; line-height: 1.6;">
              Great news! <strong>${receiverProfile?.name || 'Member'}</strong> has approved your request to view their private photos on <strong>Rohin Muslim Matrimony</strong>.
            </p>
            <p style="font-size: 14px; color: #333333; line-height: 1.6;">
              You can now visit their profile and view their uploaded photos.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://rohin-muslim-matrimony.onrender.com/profile/${userId}" style="background-color: #4f080e; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">
                View Profile Photos
              </a>
            </div>
          </div>
        `
      }).catch(err => console.error('Failed to trigger galleryAccept email:', err));
    }

    return res.status(200).json({
      success: true,
      message: 'Photo access request accepted!',
      data: request
    });
  } catch (error) {
    console.error('AcceptGalleryRequest Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject / Decline a received gallery request
// @route   PUT /api/gallery-requests/reject/:id
// @access  Private
exports.rejectGalleryRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;

    const request = await GalleryRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Ensure current user is the receiver to reject
    if (request.receiver.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to decline this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    // Update status to rejected
    request.status = 'rejected';
    await request.save();

    if (req.io) {
      req.io.to(request.sender.toString()).emit('gallery_requests_updated');
      req.io.to(userId).emit('gallery_requests_updated');
    }

    return res.status(200).json({
      success: true,
      message: 'Photo access request declined.',
      data: request
    });
  } catch (error) {
    console.error('RejectGalleryRequest Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
