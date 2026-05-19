const mongoose = require('mongoose');

const InterestRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevent duplicate interest requests between the same users in the same direction if pending
InterestRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model('InterestRequest', InterestRequestSchema);
