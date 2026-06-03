require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const updateAdminPassword = async () => {
  try {
    await connectDB();
    
    const admin = await User.findOne({ email: 'admin@buskaro.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }
    
    // Update password
    admin.password = 'admin4321';
    await admin.save();
    
    // Verify it works
    const isMatch = await admin.matchPassword('admin4321');
    
    if (isMatch) {
      console.log('✅ Admin password updated successfully!');
      console.log('   Email: admin@buskaro.com');
      console.log('   Password: admin4321');
      console.log('   Role: admin');
    } else {
      console.log('❌ Password update failed');
    }
    
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateAdminPassword();
