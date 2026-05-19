const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    premiumPrice: {
      type: Number,
      default: 999,
    },
    elitePrice: {
      type: Number,
      default: 1999,
    },
    paymentGatewayMode: {
      type: String,
      enum: ['mock', 'live'],
      default: 'mock',
    }
  },
  { timestamps: true }
);

// We only ever need ONE settings document
module.exports = mongoose.model('Settings', SettingsSchema);
