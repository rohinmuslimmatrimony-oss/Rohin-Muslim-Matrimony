const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentConfig } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/config', getPaymentConfig);
router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);

module.exports = router;
