const Notification = require('../models/Notification');
const Profile = require('../models/Profile');

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    const senderIds = notifications.map(n => n.sender);
    const profiles = await Profile.find({ user: { $in: senderIds } }).select('user name profilePhoto');

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.user.toString()] = p;
    });

    const notificationsWithSenderProfile = notifications.map(n => {
      const senderProfile = profileMap[n.sender.toString()];
      return {
        ...n.toObject(),
        senderName: senderProfile ? senderProfile.name : 'Matrimony Member',
        senderPhoto: senderProfile ? senderProfile.profilePhoto : '/uploads/default-avatar.png'
      };
    });

    return res.status(200).json({
      success: true,
      count: notificationsWithSenderProfile.length,
      data: notificationsWithSenderProfile
    });
  } catch (error) {
    console.error('GetNotifications Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark a specific notification as read
// @route   PUT /api/notifications/mark-read/:id
// @access  Private
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this notification' });
    }

    notification.isRead = true;
    await notification.save();

    if (req.io) {
      req.io.to(req.user.id).emit('notifications_updated');
    }

    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('MarkNotificationRead Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications for logged-in user as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    if (req.io) {
      req.io.to(req.user.id).emit('notifications_updated');
    }

    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('MarkAllNotificationsRead Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all message notifications from a specific sender as read
// @route   PUT /api/notifications/mark-read-sender/:senderId
// @access  Private
exports.markNotificationsReadFromSender = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, sender: req.params.senderId, isRead: false },
      { $set: { isRead: true } }
    );

    if (req.io) {
      req.io.to(req.user.id).emit('notifications_updated');
    }

    return res.status(200).json({ success: true, message: 'Notifications from sender marked as read' });
  } catch (error) {
    console.error('MarkNotificationsReadFromSender Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a specific notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this notification' });
    }

    await notification.deleteOne();

    if (req.io) {
      req.io.to(req.user.id).emit('notifications_updated');
    }

    return res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('DeleteNotification Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
