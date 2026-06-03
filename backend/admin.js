require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const createAdmin = async () => {
  try {
    await connectDB();
    
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@buskaro.com',
      password: 'admin4321',
      role: 'admin'
    });
    
    console.log('✅ Admin user created:', admin.email);
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();