const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Profile = require('./models/Profile');
const InterestRequest = require('./models/InterestRequest');
const Message = require('./models/Message');
const Report = require('./models/Report');

dotenv.config();

// Base Admin User
const usersData = [
  {
    email: 'admin@matrimony.com',
    password: 'admin123',
    role: 'admin',
    plan: 'elite',
    viewLimit: 99999,
    isManuallyVerified: true
  }
];

// Helper for random selection
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomAge = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomHeight = () => `5'${Math.floor(Math.random() * 11) + 1}"`;

const maleNames = ['Zayd Khan', 'Fahad Qureshi', 'Riza Hussein', 'Aamir Ali', 'Bilal Ahmed', 'Tariq Mehmood', 'Danish Syed', 'Imran Shaikh', 'Kashif Raza', 'Hassan Jafri', 'Omar Farooq', 'Saad Siddiqui', 'Reza Haider', 'Arif Malik', 'Nabeel Baig', 'Yusuf Pathan', 'Salman Chisti', 'Zakir Hussain', 'Faisal Nawaz', 'Ibrahim Mirza'];
const femaleNames = ['Aisha Siddiqui', 'Yasmin Naqvi', 'Sara Ahmed', 'Fatima Ali', 'Zoya Khan', 'Sana Mirza', 'Mariam Jafri', 'Nida Shaikh', 'Hina Raza', 'Zahra Syed', 'Farah Baig', 'Amina Qureshi', 'Rabia Malik', 'Bushra Farooq', 'Madiha Nawaz', 'Sadia Chisti', 'Khadija Pathan', 'Noreen Mehmood', 'Samira Hussain', 'Ayesha Tariq'];
const cities = ['Hyderabad', 'Vijayawada', 'Guntur', 'Kurnool', 'Visakhapatnam', 'Warangal', 'Karimnagar', 'Nizamabad', 'Bangalore', 'Chennai', 'Mumbai', 'Lucknow', 'Delhi', 'Pune'];
const sects = ['Sunni', 'Shia', 'Sufi', 'Other', 'No Preference'];
const professions = ['Software Engineer', 'Medical Doctor', 'Business Owner', 'High School Teacher', 'Civil Engineer', 'Govt Employee', 'Graphic Designer', 'Architect', 'Chartered Accountant', 'Data Analyst', 'Bank Manager'];
const motherTongues = ['Urdu', 'Telugu', 'Hindi', 'English'];
const educations = ['B.Tech in CS', 'MBBS, MD', 'B.Com, MBA', 'M.Sc, B.Ed', 'CA', 'B.Arch', 'BBA', 'BCA'];
const maritalStatuses = ['Never Married', 'Never Married', 'Never Married', 'Divorced', 'Widowed']; // Weighted towards Never Married
const namazFrequencies = ['Always Praying', 'Usually Praying', 'Sometimes Praying', 'Only Jummah'];
const plans = ['free', 'premium', 'elite'];

// Generate 40 Mock Profiles (20 Male, 20 Female)
for (let i = 0; i < 40; i++) {
  const isMale = i < 20;
  const name = isMale ? maleNames[i] : femaleNames[i - 20];
  const gender = isMale ? 'male' : 'female';
  const email = `${name.toLowerCase().replace(' ', '.')}@gmail.com`;
  const age = isMale ? getRandomAge(25, 38) : getRandomAge(21, 32);
  const plan = getRandom(plans);
  const isManuallyVerified = Math.random() > 0.3; // 70% chance of being verified

  let viewLimit = 5;
  if (plan === 'premium') viewLimit = 30;
  if (plan === 'elite') viewLimit = 99999;

  usersData.push({
    email,
    password: 'password123',
    role: 'user',
    plan,
    viewLimit,
    isManuallyVerified,
    profile: {
      name,
      age,
      gender,
      sect: getRandom(sects),
      height: getRandomHeight(),
      maritalStatus: getRandom(maritalStatuses),
      motherTongue: getRandom(motherTongues),
      namazFrequency: getRandom(namazFrequencies),
      profession: getRandom(professions),
      education: getRandom(educations),
      city: getRandom(cities),
      about: `Assalamu Alaikum! I am ${name}. I am a practicing Muslim who balances deen and dunya. Looking for a compatible life partner who shares similar values. Family is very important to me.`,
      phoneNumber: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
      profilePhoto: '',
      isPhotoPublic: Math.random() > 0.2, // 80% public
      familyDetails: { 
        fatherOccupation: getRandom(['Businessman', 'Retired Govt Officer', 'Doctor', 'Teacher', 'Farmer']), 
        motherOccupation: getRandom(['Homemaker', 'Teacher', 'Govt Employee']), 
        siblingsCount: getRandomAge(0, 4) 
      },
      partnerPreferences: { 
        ageRange: isMale ? `${age - 5}-${age - 1}` : `${age + 1}-${age + 5}`, 
        sectPreference: getRandom(['Sunni', 'Shia', 'No Preference', 'Other']), 
        educationPreference: getRandom(["Doesn't Matter", 'Graduate', 'Post Graduate', 'Professional']) 
      }
    }
  });
}

const seedDatabase = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/muslim-matrimony';
    console.log('Connecting to database for seeding...');
    await mongoose.connect(connString);

    // Clean DB
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Profile.deleteMany({});
    await InterestRequest.deleteMany({});
    await Message.deleteMany({});
    await Report.deleteMany({});

    console.log(`Seeding ${usersData.length} users and profiles...`);

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

    console.log('Database seeded successfully with massive data for testing!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
