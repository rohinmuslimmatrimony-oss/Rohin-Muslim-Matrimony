const Message = require('../models/Message');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Settings = require('../models/Settings');

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

    // 1. Enforce that sender has chat feature enabled on their plan
    const senderUser = await User.findById(senderId);
    if (!senderUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const planFeatures = await getPlanFeatures(senderUser.plan);
    if (!planFeatures.chat) {
      return res.status(403).json({
        success: false,
        message: 'Messaging is not enabled for your subscription plan. Please upgrade your plan!'
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

    // Handle offline notifications (Web Push & Email) safely in the background
    (async () => {
      try {
        let isReceiverOnline = false;
        if (req.io) {
          const activeSockets = await req.io.in(receiverId).fetchSockets();
          isReceiverOnline = activeSockets.length > 0;
        }

        if (!isReceiverOnline) {
          const receiverUser = await User.findById(receiverId);
          if (receiverUser) {
            const senderName = senderProfile?.name || 'A member';
            
            // 1. Send Web Push
            const sendPushNotification = require('../utils/pushNotifier');
            await sendPushNotification(
              receiverId,
              'New Message 💬',
              `You have received a new message from ${senderName}.`,
              '/interests'
            );

            // 2. Send Email
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f2e8db; border-radius: 12px; background-color: #faf8f5;">
                <h2 style="color: #4f080e; text-align: center; font-family: Georgia, serif;">Assalamu Alaikum!</h2>
                <p style="font-size: 14px; color: #333333; line-height: 1.6;">
                  You have received a new message from <strong>${senderName}</strong> on <strong>Rohin Muslim Matrimony</strong>.
                </p>
                <p style="font-size: 14px; color: #333333; line-height: 1.6;">
                  Please log in to your dashboard to read and reply.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://rohin-muslim-matrimony.onrender.com/interests" style="background-color: #4f080e; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">
                    View Message & Reply
                  </a>
                </div>
                <p style="font-size: 12px; color: #666666; text-align: center; margin-top: 30px; border-top: 1px solid #e6dccf; padding-top: 15px;">
                  <strong>Rohin Muslim Matrimony Office Address:</strong><br>
                  D.No.12-13-86, Abdulkhader Street, Islampet, Vijayawada-1<br>
                  Contact: 7386083446, 7075900448 | Email: shaikhabeebiti@gmail.com
                </p>
              </div>
            `;
            await sendEmail({
              email: receiverUser.email,
              subject: 'New Message Received 💬 - Rohin Muslim Matrimony',
              html: emailHtml
            });
          }
        }
      } catch (err) {
        console.error('Failed to trigger offline message notifications:', err);
      }
    })();

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
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const planFeatures = await getPlanFeatures(currentUser.plan);
    if (!planFeatures.chat) {
      return res.status(403).json({
        success: false,
        message: 'Accessing chat messages is not enabled for your subscription plan.'
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
