const mongoose = require('mongoose');

const FeatureSchema = new mongoose.Schema({
  viewFullBio: { type: Boolean, default: false },
  viewContactDetails: { type: Boolean, default: false },
  chat: { type: Boolean, default: false },
  shortlist: { type: Boolean, default: false },
  totalViewLimit: { type: Number, default: 10 },
  totalInterestLimit: { type: Number, default: 5 },
  profileBoost: { type: Boolean, default: false },
  advancedFilters: { type: Boolean, default: false },
  contactViewLimit: { type: Number, default: 0 },
  totalRecommendationLimit: { type: Number, default: 10 }
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
        totalViewLimit: 10,
        totalInterestLimit: 5,
        profileBoost: false,
        advancedFilters: false,
        contactViewLimit: 0,
        totalRecommendationLimit: 10
      })
    },
    premiumPlanFeatures: {
      type: FeatureSchema,
      default: () => ({
        viewFullBio: true,
        viewContactDetails: true,
        chat: true,
        shortlist: true,
        totalViewLimit: 100,
        totalInterestLimit: 50,
        profileBoost: true,
        advancedFilters: true,
        contactViewLimit: 30,
        totalRecommendationLimit: 30
      })
    },
    elitePlanFeatures: {
      type: FeatureSchema,
      default: () => ({
        viewFullBio: true,
        viewContactDetails: true,
        chat: true,
        shortlist: true,
        totalViewLimit: 99999,
        totalInterestLimit: 99999,
        profileBoost: true,
        advancedFilters: true,
        contactViewLimit: 99999,
        totalRecommendationLimit: 99999
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
