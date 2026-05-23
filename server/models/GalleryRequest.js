const mongoose = require('mongoose');

const GalleryRequestSchema = new mongoose.Schema(
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

// Unique index to prevent duplicate gallery requests between the same pair of users
GalleryRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model('GalleryRequest', GalleryRequestSchema);
