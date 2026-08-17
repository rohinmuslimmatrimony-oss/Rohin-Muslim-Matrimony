const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const backfill = async () => {
  try {
    const db = mongoose.connection.db;
    const profileCollection = db.collection('profiles');
    
    // Find all profiles that don't have a dob yet
    const profiles = await profileCollection.find({ dob: { $exists: false } }).toArray();
    console.log(`Found ${profiles.length} profiles to backfill.`);

    const today = new Date();
    const currentYear = today.getFullYear();
    
    let updatedCount = 0;
    for (const profile of profiles) {
      if (profile.age) {
        // Calculate approximate DOB: Jan 1st of (CurrentYear - age)
        const dobYear = currentYear - profile.age;
        const dob = new Date(dobYear, 0, 1); // January 1st
        
        await profileCollection.updateOne(
          { _id: profile._id },
          { $set: { dob: dob } }
        );
        updatedCount++;
      }
    }
    
    console.log(`Successfully backfilled ${updatedCount} profiles with estimated DOBs.`);
    process.exit();
  } catch (error) {
    console.error('Error backfilling DOBs:', error);
    process.exit(1);
  }
};

mongoose.connection.once('open', () => {
  console.log('MongoDB Connected');
  backfill();
});
