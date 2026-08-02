const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const revertQuotas = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    // Find users created before we deployed the new quota system (before Aug 2, 2026 19:00 UTC)
    // We will set their quotas to 0 so they are forced to upgrade/renew
    const dateLimit = new Date('2026-08-02T19:00:00Z');
    
    const users = await User.find({
      createdAt: { $lt: dateLimit }
    });

    console.log(`Found ${users.length} legacy users. Reverting their quotas to 0...`);

    let updatedCount = 0;
    for (const user of users) {
      user.quotaProfileViews = 0;
      user.quotaInterests = 0;
      user.quotaContactViews = 0;
      
      await user.save();
      updatedCount++;
    }

    console.log(`Successfully reverted quotas to 0 for ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Revert Error:', error);
    process.exit(1);
  }
};

revertQuotas();
