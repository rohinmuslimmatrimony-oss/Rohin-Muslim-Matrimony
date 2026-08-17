require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('--- Connected to DB ---');
    const admins = await User.find({ role: 'admin' }).select('email name role');
    console.log('Admin accounts in Database:');
    admins.forEach(admin => {
        console.log(`- Email: ${admin.email}`);
    });
    console.log('-----------------------');
    process.exit(0);
  })
  .catch(err => {
    console.error('DB Connection error:', err);
    process.exit(1);
  });
