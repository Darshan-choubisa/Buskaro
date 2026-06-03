const mongoose = require('mongoose');
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const listCollections = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:');
  for (let coll of collections) {
    const count = await mongoose.connection.db.collection(coll.name).countDocuments();
    console.log(`- ${coll.name}: ${count}`);
  }
  process.exit();
};

listCollections();
