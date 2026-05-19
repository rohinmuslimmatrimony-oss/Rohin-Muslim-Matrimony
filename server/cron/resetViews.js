const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables (path relative to cron directory)
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const resetDailyViews = async () => {
  try {
    console.log('--- CRON JOB: Daily View Reset Started ---');
    console.log('Connecting to database...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Database connected successfully.');

    // Clear viewedProfiles array for all user accounts
    const result = await User.updateMany(
      { role: 'user' },
      { $set: { viewedProfiles: [] } }
    );

    console.log(`Successfully reset daily views for ${result.modifiedCount} users.`);
    console.log('--- CRON JOB: Daily View Reset Completed ---');
    
    // Disconnect gracefully
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('CRON Error Resetting Views:', error);
    process.exit(1);
  }
};

// Execute
resetDailyViews();
