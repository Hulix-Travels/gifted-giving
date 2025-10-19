const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Program name is required'],
    trim: true,
    maxlength: [100, 'Program name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Program description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  longDescription: {
    type: String,
    required: [true, 'Long description is required']
  },
  category: {
    type: String,
    enum: ['education', 'health', 'nutrition', 'emergency', 'infrastructure', 'disaster', 'water provision', 'human development', 'other'],
    required: [true, 'Program category is required']
  },
  image: {
    type: String,
    required: [true, 'Program image is required']
  },
  gallery: [{
    type: String
  }],
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be greater than 0']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'KES', 'UGX']
  },
  impactMetrics: {
    childrenHelped: {
      type: Number,
      default: 0
    },
    communitiesReached: {
      type: Number,
      default: 0
    },
    schoolsBuilt: {
      type: Number,
      default: 0
    },
    mealsProvided: {
      type: Number,
      default: 0
    },
    medicalCheckups: {
      type: Number,
      default: 0
    }
  },
  targetMetrics: {
    childrenToHelp: {
      type: Number,
      default: 0
    },
    communitiesToReach: {
      type: Number,
      default: 0
    },
    schoolsToBuild: {
      type: Number,
      default: 0
    },
    mealsToProvide: {
      type: Number,
      default: 0
    },
    medicalCheckupsToProvide: {
      type: Number,
      default: 0
    }
  },
  impactPerDollar: {
    children: {
      type: Number,
      default: 0
    },
    communities: {
      type: Number,
      default: 0
    },
    schools: {
      type: Number,
      default: 0
    },
    meals: {
      type: Number,
      default: 0
    },
    checkups: {
      type: Number,
      default: 0
    }
  },
  location: {
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    region: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  duration: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'upcoming'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  donationOptions: [{
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    impact: {
      type: String,
      required: true
    }
  }],
  updates: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    image: String
  }],
  testimonials: [{
    name: {
      type: String,
      required: true
    },
    role: String,
    content: {
      type: String,
      required: true
    },
    image: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Virtual for progress percentage
programSchema.virtual('progressPercentage').get(function() {
  return Math.round((this.currentAmount / this.targetAmount) * 100);
});

// Static method to recalculate current amount for all programs
programSchema.statics.recalculateCurrentAmounts = async function() {
  try {
    const Donation = mongoose.model('Donation');
    
    // Get all programs
    const programs = await this.find();
    const results = [];
    
    for (const program of programs) {
      // Calculate total completed donations for this program
      const totalDonations = await Donation.aggregate([
        {
          $match: {
            program: program._id,
            paymentStatus: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);
      
      const calculatedAmount = totalDonations[0]?.totalAmount || 0;
      const previousAmount = program.currentAmount || 0;
      
      // Update program if amount is different
      if (calculatedAmount !== previousAmount) {
        program.currentAmount = calculatedAmount;
        await program.save();
        
        results.push({
          programId: program._id,
          programName: program.name,
          previousAmount,
          newAmount: calculatedAmount,
          difference: calculatedAmount - previousAmount
        });
        
        console.log(`🔄 Updated ${program.name}: ${previousAmount} → ${calculatedAmount}`);
      }
    }
    
    return {
      message: 'Program current amounts recalculated successfully',
      updatedPrograms: results.length,
      details: results
    };
  } catch (error) {
    console.error('Error recalculating program amounts:', error);
    throw error;
  }
};

// Static method to recalculate current amount for a specific program
programSchema.statics.recalculateCurrentAmount = async function(programId) {
  try {
    const Donation = mongoose.model('Donation');
    
    const program = await this.findById(programId);
    if (!program) {
      throw new Error('Program not found');
    }
    
    // Calculate total completed donations for this program
    const totalDonations = await Donation.aggregate([
      {
        $match: {
          program: program._id,
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const calculatedAmount = totalDonations[0]?.totalAmount || 0;
    const previousAmount = program.currentAmount || 0;
    
    // Update program
    program.currentAmount = calculatedAmount;
    await program.save();
    
    return {
      programId: program._id,
      programName: program.name,
      previousAmount,
      newAmount: calculatedAmount,
      difference: calculatedAmount - previousAmount
    };
  } catch (error) {
    console.error('Error recalculating program amount:', error);
    throw error;
  }
};

// Virtual for days remaining
programSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.duration.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Index for search functionality
programSchema.index({ 
  name: 'text', 
  description: 'text', 
  longDescription: 'text',
  tags: 'text'
});

// Pre-save middleware to generate slug
programSchema.pre('save', function(next) {
  console.log('Pre-save hook:', { name: this.name, isNew: this.isNew, isModified: this.isModified('name') });
  if (this.isNew || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    console.log('Generated slug:', this.slug);
  }
  next();
});

module.exports = mongoose.model('Program', programSchema); 