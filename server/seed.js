const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Profile = require('./models/Profile');
const InterestRequest = require('./models/InterestRequest');
const Message = require('./models/Message');
const Report = require('./models/Report');

dotenv.config();

const usersData = [
  {
    email: 'admin@matrimony.com',
    password: 'admin123',
    role: 'admin',
    plan: 'elite',
    viewLimit: 99999,
    isManuallyVerified: true
  },
  // Male Profiles
  {
    email: 'zayd.khan@gmail.com',
    password: 'password123',
    role: 'user',
    plan: 'free',
    viewLimit: 5,
    isManuallyVerified: false,
    profile: {
      name: 'Zayd Khan',
      age: 27,
      gender: 'male',
      sect: 'Sunni',
      height: "5'10\"",
      maritalStatus: 'Never Married',
      motherTongue: 'Urdu',
      namazFrequency: 'Always Praying',
      profession: 'Senior Software Engineer',
      education: 'B.Tech in Computer Science',
      city: 'Hyderabad',
      about: 'Assalamu Alaikum. I am a practicing Muslim, career-focused, and love to travel. Looking for an educated, family-oriented partner who values both Islamic and modern principles.',
      phoneNumber: '+91 99887 76655',
      profilePhoto: '',
      isPhotoPublic: true,
      familyDetails: { fatherOccupation: 'Retired Banker', motherOccupation: 'Homemaker', siblingsCount: 2 },
      partnerPreferences: { ageRange: '22-26', sectPreference: 'Sunni', educationPreference: 'Graduate' }
    }
  },
  {
    email: 'riza.hussein@gmail.com',
    password: 'password123',
    role: 'user',
    plan: 'premium',
    viewLimit: 30,
    isManuallyVerified: true,
    profile: {
      name: 'Riza Hussein',
      age: 29,
      gender: 'male',
      sect: 'Shia',
      height: "6'0\"",
      maritalStatus: 'Never Married',
      motherTongue: 'Hindi',
      namazFrequency: 'Usually Praying',
      profession: 'Medical Doctor (MD)',
      education: 'MBBS, MD Pediatrics',
      city: 'Lucknow',
      about: 'Assalamu Alaikum, I am a pediatric resident. Dedicated to my work and family. I enjoy reading, hiking, and Islamic history. Looking for a compassionate partner to share life with.',
      phoneNumber: '+91 98480 22338',
      profilePhoto: '',
      isPhotoPublic: true,
      familyDetails: { fatherOccupation: 'Doctor', motherOccupation: 'Teacher', siblingsCount: 1 },
      partnerPreferences: { ageRange: '24-28', sectPreference: 'Shia', educationPreference: 'Post Graduate' }
    }
  },
  {
    email: 'fahad.qureshi@gmail.com',
    password: 'password123',
    role: 'user',
    plan: 'elite',
    viewLimit: 99999,
    isManuallyVerified: true,
    profile: {
      name: 'Fahad Qureshi',
      age: 31,
      gender: 'male',
      sect: 'Sunni',
      height: "5'11\"",
      maritalStatus: 'Divorced',
      motherTongue: 'Urdu',
      namazFrequency: 'Always Praying',
      profession: 'Business Consultant',
      education: 'MBA in Finance',
      city: 'Mumbai',
      about: 'Assalamu Alaikum. I run an advisory firm in Mumbai. Balanced individual with a deep love for family. I seek a supportive partner who is educated, understanding, and practicing.',
      phoneNumber: '+91 88776 65544',
      profilePhoto: '',
      isPhotoPublic: false, // Elite user, keeps photo private!
      familyDetails: { fatherOccupation: 'Businessman', motherOccupation: 'Homemaker', siblingsCount: 3 },
      partnerPreferences: { ageRange: '25-30', sectPreference: 'No Preference', educationPreference: "Doesn't Matter" }
    }
  },
  // Female Profiles
  {
    email: 'aisha.siddiqui@gmail.com',
    password: 'password123',
    role: 'user',
    plan: 'free',
    viewLimit: 5,
    isManuallyVerified: false,
    profile: {
      name: 'Aisha Siddiqui',
      age: 24,
      gender: 'female',
      sect: 'Sunni',
      height: "5'4\"",
      maritalStatus: 'Never Married',
      motherTongue: 'Urdu',
      namazFrequency: 'Always Praying',
      profession: 'Graphic Designer',
      education: 'Bachelor of Fine Arts',
      city: 'Hyderabad',
      about: 'Assalamu Alaikum. I am creative, cheerful, and family-oriented. I practice my prayers and am looking for a partner who is gentle, loving, and keeps a halal lifestyle.',
      phoneNumber: '+91 77665 54433',
      profilePhoto: '',
      isPhotoPublic: false, // Free female user, photo is blurred to public
      familyDetails: { fatherOccupation: 'Govt Employee', motherOccupation: 'Homemaker', siblingsCount: 1 },
      partnerPreferences: { ageRange: '26-30', sectPreference: 'Sunni', educationPreference: 'Professional' }
    }
  },
  {
    email: 'yasmin.naqvi@gmail.com',
    password: 'password123',
    role: 'user',
    plan: 'premium',
    viewLimit: 30,
    isManuallyVerified: true,
    profile: {
      name: 'Yasmin Naqvi',
      age: 26,
      gender: 'female',
      sect: 'Shia',
      height: "5'6\"",
      maritalStatus: 'Never Married',
      motherTongue: 'Hindi',
      namazFrequency: 'Usually Praying',
      profession: 'High School Teacher',
      education: 'M.Sc in Chemistry, B.Ed',
      city: 'Delhi',
      about: 'Assalamu Alaikum. I am an optimistic educator. I believe in mutual respect and emotional understanding. Seeking an educated, kind-hearted gentleman with strong moral character.',
      phoneNumber: '+91 91234 56789',
      profilePhoto: '',
      isPhotoPublic: false, // Private photo
      familyDetails: { fatherOccupation: 'Engineer', motherOccupation: 'Teacher', siblingsCount: 2 },
      partnerPreferences: { ageRange: '27-32', sectPreference: 'Shia', educationPreference: 'Post Graduate' }
    }
  },
  {
    email: 'sara.ahmed@gmail.com',
    password: 'password123',
    role: 'user',
    plan: 'elite',
    viewLimit: 99999,
    isManuallyVerified: true,
    profile: {
      name: 'Sara Ahmed',
      age: 28,
      gender: 'female',
      sect: 'Sunni',
      height: "5'5\"",
      maritalStatus: 'Never Married',
      motherTongue: 'English',
      namazFrequency: 'Always Praying',
      profession: 'Chartered Accountant (CA)',
      education: 'CA, B.Com',
      city: 'Bangalore',
      about: 'Assalamu Alaikum. I work at a multinational firm in Bangalore. Love dining out, reading, and learning new things. Looking for an ambitious, religious and respectful life partner.',
      phoneNumber: '+91 96543 21098',
      profilePhoto: '',
      isPhotoPublic: true,
      familyDetails: { fatherOccupation: 'CEO', motherOccupation: 'Homemaker', siblingsCount: 0 },
      partnerPreferences: { ageRange: '29-35', sectPreference: 'Sunni', educationPreference: 'CA/MBA/MD' }
    }
  }
];

const seedDatabase = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/muslim-matrimony';
    console.log('Connecting to database for seeding...');
    await mongoose.connect(connString);

    // Clean DB
    console.log('Clearing database collections...');
    await User.deleteMany({});
    await Profile.deleteMany({});
    await InterestRequest.deleteMany({});
    await Message.deleteMany({});
    await Report.deleteMany({});

    console.log('Seeding new user and profile data...');

    for (const data of usersData) {
      // Create user with plan and viewLimit
      const user = await User.create({
        email: data.email,
        password: data.password,
        role: data.role,
        plan: data.plan,
        viewLimit: data.viewLimit,
        isManuallyVerified: data.isManuallyVerified || false,
        viewedProfiles: []
      });

      // If user has profile data, create it
      if (data.profile) {
        await Profile.create({
          user: user._id,
          ...data.profile
        });
      }
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
