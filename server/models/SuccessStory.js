const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  author: { type: String, trim: true },
  image: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false }
});

module.exports = mongoose.model('SuccessStory', successStorySchema); 