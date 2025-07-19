const mongoose = require('mongoose');

const newsletterSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  lastEmailSent: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
newsletterSubscriptionSchema.index({ email: 1 });
newsletterSubscriptionSchema.index({ isActive: 1 });

module.exports = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema); 