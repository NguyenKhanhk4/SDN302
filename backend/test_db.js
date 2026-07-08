const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI_ATLAS);
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  for (let u of users) {
    console.log(`Email: ${u.email}, Role: "${u.role}"`);
  }
  process.exit(0);
})();
