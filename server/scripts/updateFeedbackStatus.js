require('dotenv').config({ path: require('path').resolve(__dirname, '../config.env') });
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');

async function updateFeedbackStatus() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gifted-giving');
  const result = await Feedback.updateMany(
    { status: { $exists: false } },
    { $set: { status: 'unread' } }
  );
  console.log(`Updated ${result.modifiedCount} feedback documents.`);
  await mongoose.disconnect();
}

updateFeedbackStatus().catch(err => {
  console.error(err);
  process.exit(1);
}); 