const mongoose = require('mongoose');

const volunteerApplicationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Must be at least 18 years old'],
    max: [100, 'Age cannot exceed 100']
  },
  location: {
    type: String,
    required: [true, 'Preferred location is required'],
    enum: ['local', 'nairobi', 'kampala', 'dar-es-salaam', 'kigali', 'other']
  },
  skills: [{
    type: String,
    required: true,
    enum: [
      'teaching', 
      'medical', 
      'construction', 
      'fundraising', 
      'translation', 
      'counseling',
      'sports',
      'arts',
      'technology',
      'cooking',
      'administration',
      'other'
    ]
  }],
  experience: {
    type: String,
    trim: true,
    maxlength: [500, 'Experience description cannot exceed 500 characters']
  },
  availability: {
    type: String,
    required: [true, 'Availability is required'],
    enum: ['fulltime', 'parttime', 'shortterm', 'flexible', 'weekends', 'evenings']
  },
  commitment: {
    type: String,
    required: [true, 'Commitment level is required'],
    enum: ['high', 'medium', 'low', 'flexible']
  },
  emergencyContact: {
    type: String,
    required: [true, 'Emergency contact name is required'],
    trim: true,
    maxlength: [100, 'Emergency contact name cannot exceed 100 characters']
  },
  emergencyPhone: {
    type: String,
    required: [true, 'Emergency contact phone is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  agreeToTerms: {
    type: Boolean,
    required: [true, 'Terms agreement is required'],
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  notes: {
    admin: String,
    applicant: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for full name
volunteerApplicationSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for efficient queries
volunteerApplicationSchema.index({ email: 1 });
volunteerApplicationSchema.index({ status: 1 });
volunteerApplicationSchema.index({ createdAt: -1 });
volunteerApplicationSchema.index({ location: 1 });
volunteerApplicationSchema.index({ skills: 1 });

module.exports = mongoose.model('VolunteerApplication', volunteerApplicationSchema); 