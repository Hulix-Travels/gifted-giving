const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema({
  title: { type: String, trim: true },
  content: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  category: { type: String, trim: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  location: { type: String, trim: true },
  image: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  }
});

module.exports = mongoose.model('SuccessStory', successStorySchema); 