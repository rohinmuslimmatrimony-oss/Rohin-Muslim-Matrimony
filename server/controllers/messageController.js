const Message = require('../models/Message');
const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Send a message to a connected user
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    // 1. Enforce that sender is on a paid plan (Premium or Elite)
    const senderUser = await User.findById(senderId);
    if (!senderUser || (senderUser.plan !== 'premium' && senderUser.plan !== 'elite')) {
      return res.status(403).json({
        success: false,
        message: 'Messaging requires a Premium or Elite subscription. Please upgrade your plan!'
      });
    }

    // 2. Enforce that they are mutually connected
    const senderProfile = await Profile.findOne({ user: senderId });
    if (!senderProfile || !senderProfile.connections.includes(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'You can only message profiles you are connected with.'
      });
    }

    // Create message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('SendMessage Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get chat history between current user and a connected user
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const chatPartnerId = req.params.userId;
    const currentUserId = req.user.id;

    // Enforce paid plan
    const currentUser = await User.findById(currentUserId);
    if (!currentUser || (currentUser.plan !== 'premium' && currentUser.plan !== 'elite')) {
      return res.status(403).json({
        success: false,
        message: 'Accessing chat messages requires a Premium or Elite subscription.'
      });
    }

    // Fetch messages where either user is the sender/receiver
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: chatPartnerId },
        { sender: chatPartnerId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 }); // Sort in ascending order for smooth timeline

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('GetMessages Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
