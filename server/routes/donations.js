const express = require('express');
const { body, validationResult } = require('express-validator');
const Donation = require('../models/Donation');
const Program = require('../models/Program');
const { auth, optionalAuth } = require('../middleware/auth');
const emailService = require('../services/emailService');
const router = express.Router();

const NodeCache = require('node-cache');
const statsCache = new NodeCache({ stdTTL: 20 }); // 20 seconds TTL

// Utility to deeply convert Mongoose docs to plain JS objects
function deepToObject(doc) {
  if (Array.isArray(doc)) {
    return doc.map(deepToObject);
  }
  if (doc && typeof doc.toObject === 'function') {
    const plain = doc.toObject();
    for (const key in plain) {
      plain[key] = deepToObject(plain[key]);
    }
    return plain;
  }
  if (doc && typeof doc === 'object') {
    const plain = {};
    for (const key in doc) {
      plain[key] = deepToObject(doc[key]);
    }
    return plain;
  }
  return doc;
}

// @route   POST /api/donations
// @desc    Create a new donation
// @access  Private
router.post('/', [
  optionalAuth,
  body('programId').isMongoId().withMessage('Valid program ID is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'KES', 'UGX']),
  body('paymentMethod').isIn(['stripe', 'paypal', 'bank_transfer', 'check', 'cash']),
  body('anonymous').optional().isBoolean(),
  body('message').optional().isLength({ max: 500 }),
  body('recurring.isRecurring').optional().isBoolean(),
  body('recurring.frequency').optional().isIn(['monthly', 'quarterly', 'yearly'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const {
      programId,
      amount,
      currency = 'USD',
      paymentMethod,
      anonymous = false,
      message,
      recurring = { isRecurring: false, frequency: 'monthly' }
    } = req.body;

    // Check if program exists
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Check if program is active
    if (program.status !== 'active') {
      return res.status(400).json({ message: 'This program is not currently accepting donations' });
    }

    // Create donation
    const donationData = {
      program: programId,
      amount,
      currency,
      paymentMethod,
      anonymous: req.user ? anonymous : true, // Force anonymous if not authenticated
      message,
      recurring
    };

    // Add donor if authenticated
    if (req.user) {
      donationData.donor = req.user.id;
    }

    const donation = new Donation(donationData);
    await donation.save();

    // Populate program details
    await donation.populate('program', 'name category image');

    // Send donation confirmation email if user is authenticated
    if (req.user) {
      try {
        await donation.populate('donor', 'firstName lastName email');
        await emailService.sendDonationConfirmationEmail(donation);
      } catch (emailError) {
        console.error('Failed to send donation confirmation email:', emailError);
        // Don't fail the donation if email fails
      }
    }

    res.status(201).json({
      message: 'Donation created successfully',
      donation: {
        id: donation._id,
        amount: donation.amount,
        currency: donation.currency,
        paymentMethod: donation.paymentMethod,
        paymentStatus: donation.paymentStatus,
        program: donation.program,
        anonymous: donation.anonymous,
        message: donation.message,
        recurring: donation.recurring,
        createdAt: donation.createdAt
      }
    });

  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ message: 'Server error during donation creation' });
  }
});

// @route   GET /api/donations
// @desc    Get user's donation history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { donor: req.user.id };
    if (status) {
      query.paymentStatus = status;
    }

    const donations = await Donation.find(query)
      .populate('program', 'name category image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Donation.countDocuments(query);

    res.json({
      donations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalDonations: total
    });

  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations/all
// @desc    Get all donations (Admin only)
// @access  Private (Admin only)
router.get('/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { page = 1, limit = 50, status, programId } = req.query;
    
    const query = {};
    if (status) {
      query.paymentStatus = status;
    }
    if (programId) {
      query.program = programId;
    }

    const donations = await Donation.find(query)
      .populate('program', 'name category image')
      .populate('donor', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Donation.countDocuments(query);

    res.json({
      donations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalDonations: total
    });

  } catch (error) {
    console.error('Get all donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations/:id
// @desc    Get specific donation details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('program', 'name category image description')
      .populate('donor', 'firstName lastName email');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user owns this donation or is admin
    if (donation.donor._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ donation });

  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/donations/:id/status
// @desc    Update donation payment status
// @access  Private (Admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'completed', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Only allow status updates if user is admin or the donation belongs to them
    if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    donation.paymentStatus = status;
    await donation.save();

    // Invalidate stats cache if status is completed
    if (status === 'completed') {
      statsCache.del('donations_stats_overview');
      statsCache.del('programs_stats_overview');
    }

    res.json({
      message: 'Donation status updated successfully',
      donation: {
        id: donation._id,
        paymentStatus: donation.paymentStatus,
        updatedAt: donation.updatedAt
      }
    });

  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations/stats/overview
// @desc    Get donation statistics
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    // Check cache first
    const cached = statsCache.get('donations_stats_overview');
    if (cached) {
      return res.json(cached);
    }

    // Get comprehensive stats for admin dashboard
    const comprehensiveStats = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedDonations: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, '$amount', 0] }
          },
          pendingDonations: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          },
          failedDonations: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyStats = await Donation.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: '$amount' },
          monthlyDonations: { $sum: 1 }
        }
      }
    ]);

    const stats = comprehensiveStats[0] || {
      totalDonations: 0,
      totalAmount: 0,
      completedDonations: 0,
      completedAmount: 0,
      pendingDonations: 0,
      failedDonations: 0
    };

    const monthly = monthlyStats[0] || {
      monthlyRevenue: 0,
      monthlyDonations: 0
    };
    
    // Get recent donations
    const recentDonations = await Donation.find({ paymentStatus: 'completed' })
      .populate('program', 'name category')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(); // Ensure plain JS objects for caching

    // Get top programs by donations
    const topPrograms = await Donation.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: '$program',
          totalAmount: { $sum: '$amount' },
          donationCount: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 }
    ]);

    // Populate program details for top programs
    let topProgramsWithDetails = await Program.populate(topPrograms, {
      path: '_id',
      select: 'name category image'
    });
    // Ensure plain JS objects for caching
    if (Array.isArray(topProgramsWithDetails)) {
      topProgramsWithDetails = topProgramsWithDetails.map(item => (item && typeof item.toObject === 'function' ? item.toObject() : item));
    }

    const response = {
      stats: {
        ...stats,
        monthlyRevenue: monthly.monthlyRevenue,
        monthlyDonations: monthly.monthlyDonations,
        avgDonation: stats.totalDonations > 0 ? stats.totalAmount / stats.totalDonations : 0
      },
      recentDonations: deepToObject(recentDonations),
      topPrograms: deepToObject(topProgramsWithDetails)
    };

    // Cache the result
    statsCache.set('donations_stats_overview', response);

    res.json(response);

  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations/program/:programId
// @desc    Get donations for a specific program
// @access  Public
router.get('/program/:programId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { programId } = req.params;

    // Check if program exists
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    const donations = await Donation.find({ 
      program: programId,
      paymentStatus: 'completed'
    })
      .populate('donor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Donation.countDocuments({ 
      program: programId,
      paymentStatus: 'completed'
    });

    res.json({
      donations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalDonations: total
    });

  } catch (error) {
    console.error('Get program donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 