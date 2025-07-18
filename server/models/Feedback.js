const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, trim: true },
  feedback: { type: String, required: true, trim: true },
  status: { type: String, enum: ['unread', 'read', 'addressed'], default: 'unread' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema); 