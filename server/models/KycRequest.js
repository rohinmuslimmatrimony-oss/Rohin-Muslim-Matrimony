const mongoose = require('mongoose');

const KycRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One KYC request per user at a time
    },
    fullNameOnId: {
      type: String,
      required: true,
      trim: true,
    },
    idType: {
      type: String,
      enum: ['aadhaar', 'pan', 'passport', 'voter_id', 'driving_license'],
      required: true,
    },
    idNumber: {
      type: String,
      default: '',
    },
    documentImage: {
      type: String, // file path like /uploads/kyc/kyc-xxxx.jpg
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('KycRequest', KycRequestSchema);
