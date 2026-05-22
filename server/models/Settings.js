const mongoose = require('mongoose');

const FeatureSchema = new mongoose.Schema({
  viewFullBio: { type: Boolean, default: false },
  viewContactDetails: { type: Boolean, default: false },
  chat: { type: Boolean, default: false },
  shortlist: { type: Boolean, default: false },
  dailyViewLimit: { type: Number, default: 5 },
  dailyInterestLimit: { type: Number, default: 3 },
  profileBoost: { type: Boolean, default: false },
  advancedFilters: { type: Boolean, default: false },
  contactViewLimit: { type: Number, default: 0 }
});

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
    },
    freePlanFeatures: {
      type: FeatureSchema,
      default: () => ({
        viewFullBio: false,
        viewContactDetails: false,
        chat: false,
        shortlist: false,
        dailyViewLimit: 5,
        dailyInterestLimit: 3,
        profileBoost: false,
        advancedFilters: false,
        contactViewLimit: 0
      })
    },
    premiumPlanFeatures: {
      type: FeatureSchema,
      default: () => ({
        viewFullBio: true,
        viewContactDetails: true,
        chat: true,
        shortlist: true,
        dailyViewLimit: 30,
        dailyInterestLimit: 30,
        profileBoost: true,
        advancedFilters: true,
        contactViewLimit: 50
      })
    },
    elitePlanFeatures: {
      type: FeatureSchema,
      default: () => ({
        viewFullBio: true,
        viewContactDetails: true,
        chat: true,
        shortlist: true,
        dailyViewLimit: 99999,
        dailyInterestLimit: 99999,
        profileBoost: true,
        advancedFilters: true,
        contactViewLimit: 99999
      })
    },
    // Support Contact Configuration
    supportPhone: {
      type: String,
      default: '+91 99999 99999',
    },
    supportWhatsApp: {
      type: String,
      default: '+919999999999',
    },
    supportEmail: {
      type: String,
      default: 'support@rohinmatrimony.com',
    },
    eliteManagerName: {
      type: String,
      default: 'Rohin Support Team',
    },
    eliteManagerPhone: {
      type: String,
      default: '+91 99999 99999',
    },
  },
  { timestamps: true }
);

// We only ever need ONE settings document
module.exports = mongoose.model('Settings', SettingsSchema);
