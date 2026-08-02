const mongoose = require('mongoose');
const User = require('./models/User');
const Settings = require('./models/Settings');
const dotenv = require('dotenv');

dotenv.config();

const migrateQuotas = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    const settings = await Settings.findOne();
    if (!settings) {
      console.log('No settings found. Exiting.');
      process.exit(1);
    }

    const plans = {
      free: settings.freePlanFeatures,
      premium: settings.premiumPlanFeatures,
      elite: settings.elitePlanFeatures
    };

    const users = await User.find({
      $or: [
        { quotaProfileViews: { $exists: false } },
        { quotaInterests: { $exists: false } },
        { quotaContactViews: { $exists: false } },
      ]
    });

    console.log(`Found ${users.length} users missing quotas. Starting migration...`);

    let updatedCount = 0;
    for (const user of users) {
      const planConfig = plans[user.plan] || plans.free;
      
      user.quotaProfileViews = planConfig.totalViewLimit || 10;
      user.quotaInterests = planConfig.totalInterestLimit || 5;
      user.quotaContactViews = planConfig.totalContactViewsLimit || 2;
      
      await user.save();
      updatedCount++;
    }

    console.log(`Successfully updated ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration Error:', error);
    process.exit(1);
  }
};

migrateQuotas();
