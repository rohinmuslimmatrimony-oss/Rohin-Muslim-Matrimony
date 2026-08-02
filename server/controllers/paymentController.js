const crypto = require('crypto');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');

// Lazy / safe Razorpay SDK loader (so missing npm package won't crash Express startup)
let RazorpaySDK = null;
try {
  RazorpaySDK = require('razorpay');
} catch (e) {
  // SDK not installed, will use native REST API
}

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || !RazorpaySDK) {
    return null;
  }

  try {
    return new RazorpaySDK({
      key_id: keyId,
      key_secret: keySecret
    });
  } catch (err) {
    return null;
  }
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

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If payment gateway mode is mock or live keys missing, fallback to mock mode
    if (mode === 'mock' || !keyId || !keySecret) {
      return res.status(200).json({
        success: true,
        mode: 'mock',
        plan,
        amount: price,
        message: 'Mock payment gateway active'
      });
    }

    const amountInPaise = Math.round(price * 100);
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${req.user._id.toString().slice(-6)}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        plan: plan
      }
    };

    let order = null;

    // Try creating order via Razorpay SDK first
    const rzp = getRazorpayInstance();
    if (rzp) {
      try {
        order = await rzp.orders.create(options);
      } catch (sdkErr) {
        console.warn('Razorpay SDK order creation error, trying REST API:', sdkErr.message);
      }
    }

    // Direct REST API fallback (works even if SDK package is not installed)
    if (!order) {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const apiRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(options)
      });
      const data = await apiRes.json();
      if (!apiRes.ok || !data.id) {
        throw new Error(data.error?.description || 'Razorpay order creation failed');
      }
      order = data;
    }

    return res.status(200).json({
      success: true,
      mode: 'live',
      order,
      keyId: keyId,
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
      const planConfig = plan === 'elite' ? settings.elitePlanFeatures : settings.premiumPlanFeatures;
      user.quotaProfileViews = planConfig?.totalViewLimit || 100;
      user.quotaInterests = planConfig?.totalInterestLimit || 30;
      user.quotaContactViews = planConfig?.totalContactViewsLimit || 10;
      user.viewedProfiles = [];
      user.viewedContacts = [];
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

      user.plan = plan;
      const planConfig = plan === 'elite' ? settings.elitePlanFeatures : settings.premiumPlanFeatures;
      user.quotaProfileViews = planConfig?.totalViewLimit || 100;
      user.quotaInterests = planConfig?.totalInterestLimit || 30;
      user.quotaContactViews = planConfig?.totalContactViewsLimit || 10;
      user.viewedProfiles = [];
      user.viewedContacts = [];
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
