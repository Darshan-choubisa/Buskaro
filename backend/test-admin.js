require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const testLogin = async () => {
  try {
    await connectDB();
    
    // Check if admin exists
    const admin = await User.findOne({ email: 'admin@buskaro.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }
    
    console.log('✅ Admin user found:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Name: ${admin.name}`);
    
    // Test password matching
    const passwordMatch = await admin.matchPassword('admin4321');
    console.log(`   Password matches: ${passwordMatch ? '✅ YES' : '❌ NO'}`);
    
    if (!passwordMatch) {
      console.log('\n⚠️  Password does NOT match. The admin account may have been created with a different password.');
    }
    
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testLogin();
