const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');

// Initialize Razorpay instance lazily or safely
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['premium', 'elite'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    // Get dynamic pricing from Settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const price = plan === 'elite' ? (settings.elitePrice || 1999) : (settings.premiumPrice || 999);
    const mode = settings.paymentGatewayMode || process.env.PAYMENT_GATEWAY_MODE || 'live';

    // If payment gateway mode is mock, return mock order indicator
    if (mode === 'mock') {
      return res.status(200).json({
        success: true,
        mode: 'mock',
        plan,
        amount: price,
        message: 'Mock payment gateway active'
      });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      // Fallback to mock mode if keys are missing
      console.warn('Razorpay keys missing in .env. Falling back to mock mode.');
      return res.status(200).json({
        success: true,
        mode: 'mock',
        plan,
        amount: price,
        message: 'Razorpay credentials not configured, falling back to mock payment'
      });
    }

    const amountInPaise = price * 100;
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${req.user._id.toString().slice(-6)}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        plan: plan
      }
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      mode: 'live',
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan,
      amount: price
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order'
    });
  }
};

// @desc    Verify Razorpay Payment & Upgrade Plan
// @route   POST /api/payment/verify-payment
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    if (!['premium', 'elite'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const price = plan === 'elite' ? (settings.elitePrice || 1999) : (settings.premiumPrice || 999);

    // If Mock Payment
    if (!razorpay_signature || !razorpay_order_id) {
      user.plan = plan;
      user.viewLimit = plan === 'elite' ? 99999 : 30;
      await user.save();

      await Transaction.create({
        user: user._id,
        plan: plan,
        amount: price,
        transactionId: `TXN_MOCK_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: 'success'
      });

      return res.status(200).json({
        success: true,
        message: `Plan upgraded successfully to ${plan.toUpperCase()}!`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          viewLimit: user.viewLimit
        }
      });
    }

    // Verify Live Razorpay Signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Server payment key secret missing' });
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('Razorpay Signature Verification Failed!');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed! Invalid signature.'
      });
    }

    // Payment Verified Successfully! Upgrade User Plan
    user.plan = plan;
    user.viewLimit = plan === 'elite' ? 99999 : 30;
    await user.save();

    // Create Transaction Record
    await Transaction.create({
      user: user._id,
      plan: plan,
      amount: price,
      transactionId: razorpay_payment_id,
      status: 'success'
    });

    return res.status(200).json({
      success: true,
      message: `Payment successful! Upgraded to ${plan.toUpperCase()} plan.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        viewLimit: user.viewLimit
      }
    });
  } catch (error) {
    console.error('Razorpay Payment Verification Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
};

// @desc    Get Razorpay public configuration
// @route   GET /api/payment/config
// @access  Public / Private
exports.getPaymentConfig = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    const mode = settings?.paymentGatewayMode || process.env.PAYMENT_GATEWAY_MODE || 'live';
    
    return res.status(200).json({
      success: true,
      mode: mode,
      keyId: mode === 'live' ? process.env.RAZORPAY_KEY_ID : null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
