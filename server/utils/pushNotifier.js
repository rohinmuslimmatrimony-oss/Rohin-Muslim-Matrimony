const webpush = require('web-push');
const User = require('../models/User');

// Configure web-push VAPID details
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:shaikhabeebiti@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Send a web push notification to all registered devices of a user
 * @param {string} userId - ID of the recipient user
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @param {string} url - Action URL on click
 */
const sendPushNotification = async (userId, title, body, url = '/interests') => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return;
    }

    const payload = JSON.stringify({ title, body, url });

    const pushPromises = user.pushSubscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, payload);
      } catch (err) {
        // If subscription is no longer active (404 or 410), delete it
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log(`Removing expired push subscription endpoint: ${subscription.endpoint}`);
          await User.findByIdAndUpdate(userId, {
            $pull: { pushSubscriptions: { endpoint: subscription.endpoint } }
          });
        } else {
          console.error('Failed to deliver push notification:', err);
        }
      }
    });

    await Promise.all(pushPromises);
  } catch (error) {
    console.error('sendPushNotification Error:', error);
  }
};

module.exports = sendPushNotification;
