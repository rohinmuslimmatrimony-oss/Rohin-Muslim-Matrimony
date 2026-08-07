const mongoose = require('mongoose');

const HandpickedMatchSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    suggestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      default: 'Our matchmaking team personally recommends this profile based on matching preferences and family background.',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    statusA: {
      type: String,
      enum: ['pending', 'viewed', 'interested', 'connected', 'declined'],
      default: 'pending',
    },
    statusB: {
      type: String,
      enum: ['pending', 'viewed', 'interested', 'connected', 'declined'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find user matches
HandpickedMatchSchema.index({ userA: 1, expiresAt: 1 });
HandpickedMatchSchema.index({ userB: 1, expiresAt: 1 });

module.exports = mongoose.model('HandpickedMatch', HandpickedMatchSchema);
