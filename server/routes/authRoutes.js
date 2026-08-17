const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  upgradePlan, 
  saveSubscription, 
  getVapidPublicKey, 
  getMyTransactions, 
  changePassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  updateEmail
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.put('/upgrade', protect, upgradePlan);
router.post('/subscribe', protect, saveSubscription);
router.get('/vapid-public-key', protect, getVapidPublicKey);
router.get('/transactions', protect, getMyTransactions);
router.put('/change-password', protect, changePassword);
router.put('/update-email', protect, updateEmail);

module.exports = router;
