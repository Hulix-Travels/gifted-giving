const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      // Donor is required only if not anonymous
      return !this.anonymous;
    }
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: [true, 'Program is required']
  },
  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [0.5, 'Donation amount must be at least $0.50']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'KES', 'UGX']
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank_transfer', 'check', 'cash'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String
  },
  stripePaymentIntentId: String,
  paypalOrderId: String,
  anonymous: {
    type: Boolean,
    default: false
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    nextPaymentDate: Date,
    endDate: Date,
    totalPayments: {
      type: Number,
      default: 0
    },
    stripeSubscriptionId: {
      type: String,
      default: null
    },
    originalDonationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      default: null
    }
  },
  designation: {
    type: String,
    enum: ['general', 'specific', 'emergency'],
    default: 'general'
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  impact: {
    childrenHelped: {
      type: Number,
      default: 0
    },
    mealsProvided: {
      type: Number,
      default: 0
    },
    schoolSupplies: {
      type: Number,
      default: 0
    },
    medicalCheckups: {
      type: Number,
      default: 0
    }
  },
  taxReceipt: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedDate: Date,
    receiptNumber: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  },
  notes: {
    admin: String,
    donor: String
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

// Index for efficient queries
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ program: 1, createdAt: -1 });
donationSchema.index({ paymentStatus: 1 });
donationSchema.index({ transactionId: 1 });

// Virtual for formatted amount
donationSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Pre-save: track prior status and handle new completed donations
donationSchema.pre('save', async function(next) {
  if (!this.isNew) {
    const existing = await this.constructor.findById(this._id).select('paymentStatus').lean();
    this._priorPaymentStatus = existing?.paymentStatus;
  }

  if (this.isNew && this.paymentStatus === 'completed') {
    try {
      const User = mongoose.model('User');
      const Program = mongoose.model('Program');
      
      // Update user donation stats only if donor exists (not anonymous)
      if (this.donor) {
        await User.findByIdAndUpdate(this.donor, {
          $inc: { 
            totalDonated: this.amount,
            donationCount: 1
          },
          lastDonationDate: new Date()
        });
      }
      
      // Update program current amount
      await Program.findByIdAndUpdate(this.program, {
        $inc: { currentAmount: this.amount }
      });

      // Update program impact metrics based on impactPerDollar
      const programDoc = await Program.findById(this.program);
      if (programDoc && programDoc.impactPerDollar) {
        const impact = programDoc.impactPerDollar;
        const children = Math.floor(this.amount * (impact.children || 0));
        const communities = Math.floor(this.amount * (impact.communities || 0));
        const schools = Math.floor(this.amount * (impact.schools || 0));
        const meals = Math.floor(this.amount * (impact.meals || 0));
        const checkups = Math.floor(this.amount * (impact.checkups || 0));
        await Program.findByIdAndUpdate(this.program, {
          $inc: {
            'impactMetrics.childrenHelped': children,
            'impactMetrics.communitiesReached': communities,
            'impactMetrics.schoolsBuilt': schools,
            'impactMetrics.mealsProvided': meals,
            'impactMetrics.medicalCheckups': checkups
          }
        });
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }
  next();
});

// Post-save: handle status transitions (pending → completed, etc.)
donationSchema.post('save', async function(doc) {
  if (this.isNew || this._priorPaymentStatus === undefined) {
    return;
  }

  const prior = this._priorPaymentStatus;
  const current = doc.paymentStatus;

  if (prior === current) {
    return;
  }

  try {
    const User = mongoose.model('User');
    const Program = mongoose.model('Program');

    if (prior !== 'completed' && current === 'completed') {
      if (doc.donor) {
        await User.findByIdAndUpdate(doc.donor, {
          $inc: {
            totalDonated: doc.amount,
            donationCount: 1
          },
          lastDonationDate: new Date()
        });
      }

      await Program.findByIdAndUpdate(doc.program, {
        $inc: { currentAmount: doc.amount }
      });

      const programDoc = await Program.findById(doc.program);
      if (programDoc?.impactPerDollar) {
        const impact = programDoc.impactPerDollar;
        await Program.findByIdAndUpdate(doc.program, {
          $inc: {
            'impactMetrics.childrenHelped': Math.floor(doc.amount * (impact.children || 0)),
            'impactMetrics.communitiesReached': Math.floor(doc.amount * (impact.communities || 0)),
            'impactMetrics.schoolsBuilt': Math.floor(doc.amount * (impact.schools || 0)),
            'impactMetrics.mealsProvided': Math.floor(doc.amount * (impact.meals || 0)),
            'impactMetrics.medicalCheckups': Math.floor(doc.amount * (impact.checkups || 0))
          }
        });
      }

      console.log(`✅ Donation ${doc._id} marked completed — stats updated`);
    } else if (prior === 'completed' && current !== 'completed') {
      if (doc.donor) {
        await User.findByIdAndUpdate(doc.donor, {
          $inc: {
            totalDonated: -doc.amount,
            donationCount: -1
          }
        });
      }

      await Program.findByIdAndUpdate(doc.program, {
        $inc: { currentAmount: -doc.amount }
      });

      console.log(`🔄 Donation ${doc._id} reverted from completed — stats reversed`);
    }
  } catch (error) {
    console.error('Error updating stats in post-save:', error);
  }
});

// Static method to get donation statistics
donationSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $match: { paymentStatus: 'completed' }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalDonations: { $sum: 1 },
        avgDonation: { $avg: '$amount' }
      }
    }
  ]);
  
  return stats[0] || { totalAmount: 0, totalDonations: 0, avgDonation: 0 };
};

// Static method to get donations by date range
donationSchema.statics.getDonationsByDateRange = async function(startDate, endDate) {
  return await this.find({
    createdAt: { $gte: startDate, $lte: endDate },
    paymentStatus: 'completed'
  }).populate('donor', 'firstName lastName email')
    .populate('program', 'name category');
};

module.exports = mongoose.model('Donation', donationSchema); 