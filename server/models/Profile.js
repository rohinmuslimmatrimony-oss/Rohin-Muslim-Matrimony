const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Core Biodata
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Please provide an age'],
      min: [18, 'Must be at least 18 years old'],
    },
    gender: {
      type: String,
      required: [true, 'Please provide a gender'],
      enum: ['male', 'female'],
    },
    height: {
      type: String,
      default: "5'5\"",
    },
    maritalStatus: {
      type: String,
      default: 'Never Married',
      enum: ['Never Married', 'Divorced', 'Widowed', 'Annulled'],
    },
    motherTongue: {
      type: String,
      default: 'Urdu',
    },
    profileCreatedBy: {
      type: String,
      default: 'Self',
    },
    
    // Religious Background
    religion: {
      type: String,
      default: 'Islam',
    },
    sect: {
      type: String,
      default: 'Sunni',
      enum: ['Sunni', 'Shia', 'Sufi', 'Other', 'No Preference'],
    },
    namazFrequency: {
      type: String,
      default: 'Always Praying',
      enum: ['Always Praying', 'Usually Praying', 'Sometimes Praying', 'Only Jummah', 'Eid Only'],
    },

    // Professional & Location
    profession: {
      type: String,
      default: '',
      trim: true,
    },
    education: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
      trim: true,
    },
    about: {
      type: String,
      default: '',
      maxlength: [1000, 'About cannot be more than 1000 characters'],
    },

    familyDetails: {
      fatherOccupation: { type: String, default: '' },
      motherOccupation: { type: String, default: '' },
      siblingsCount: { type: Number, default: 0 },
      siblingsList: [
        {
          gender: { type: String, enum: ['male', 'female'], required: true },
          relation: { type: String, enum: ['Elder Brother', 'Younger Brother', 'Elder Sister', 'Younger Sister'], required: true },
          maritalStatus: { type: String, enum: ['Married', 'Unmarried'], default: 'Unmarried' },
          occupation: { type: String, default: '' }
        }
      ]
    },

    // Partner Preferences
    partnerPreferences: {
      ageRange: { type: String, default: '18-30' },
      sectPreference: { type: String, default: 'No Preference' },
      educationPreference: { type: String, default: "Doesn't Matter" },
    },

    // Media & Privacy
    profilePhoto: {
      type: String,
      default: '/uploads/default-avatar.png',
    },
    isPhotoPublic: {
      type: Boolean,
      default: true,
    },
    gallery: [{
      type: String,
    }],

    // Contact
    phoneNumber: {
      type: String,
      default: '',
    },
    waliContact: {
      type: String,
      default: '',
    },

    // Social Graph
    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    shortlistedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', ProfileSchema);
