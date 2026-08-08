const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    plan: {
      type: String,
      enum: ['free', 'premium', 'elite'],
      default: 'free',
    },
    // Legacy field kept for backward compat (admin UI may reference it)
    viewLimit: {
      type: Number,
      default: 10,
    },
    // ── Quota-Based Plan System ──────────────────────────────────────
    // Remaining quota counts per plan cycle.
    // Decremented on each action, reset to 0 on plan renew/upgrade.
    quotaProfileViews: {
      type: Number,
      default: 10,   // Free default
    },
    quotaInterests: {
      type: Number,
      default: 5,    // Free default
    },
    quotaContactViews: {
      type: Number,
      default: 0,    // Free default (no contact access)
    },
    // ─────────────────────────────────────────────────────────────────
    viewedProfiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    viewedRecommendations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    viewedRecommendationsDate: {
      type: String, // stored as 'YYYY-MM-DD', used to reset list each day
      default: '',
    },
    dailyRecommendationsBatch: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dailyRecommendationsBatchDate: {
      type: String, // stored as 'YYYY-MM-DD', tracks when current batch was generated
      default: '',
    },
    viewedContacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isManuallyVerified: {
      type: Boolean,
      default: false,
    },
    pushSubscriptions: [
      {
        endpoint: { type: String, required: true },
        keys: {
          p256dh: { type: String, required: true },
          auth: { type: String, required: true }
        }
      }
    ],
    resetPasswordOtp: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
