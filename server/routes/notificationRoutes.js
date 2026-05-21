const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  markNotificationsReadFromSender,
  deleteNotification 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/mark-all-read', protect, markAllNotificationsRead);
router.put('/mark-read-sender/:senderId', protect, markNotificationsReadFromSender);
router.put('/mark-read/:id', protect, markNotificationRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
