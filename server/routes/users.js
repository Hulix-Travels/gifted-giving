const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Donation = require('../models/Donation');
const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/donations
// @desc    Get user's donation history
// @access  Private
router.get('/donations', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const donations = await Donation.find({ donor: req.user.id })
      .populate('program', 'name category image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Donation.countDocuments({ donor: req.user.id });

    res.json({
      donations,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalDonations: total
    });

  } catch (error) {
    console.error('Get user donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get donation statistics
    const donationStats = await Donation.aggregate([
      { $match: { donor: user._id, paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalDonations: { $sum: 1 },
          avgDonation: { $avg: '$amount' }
        }
      }
    ]);

    // Get donations by month for the last 12 months
    const monthlyDonations = await Donation.aggregate([
      { $match: { donor: user._id, paymentStatus: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Get favorite programs
    const favoritePrograms = await Donation.aggregate([
      { $match: { donor: user._id, paymentStatus: 'completed' } },
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

    // Populate program details
    const favoriteProgramsWithDetails = await User.populate(favoritePrograms, {
      path: '_id',
      select: 'name category image',
      model: 'Program'
    });

    res.json({
      user: {
        totalDonated: user.totalDonated,
        donationCount: user.donationCount,
        lastDonationDate: user.lastDonationDate
      },
      donationStats: donationStats[0] || {
        totalAmount: 0,
        totalDonations: 0,
        avgDonation: 0
      },
      monthlyDonations,
      favoritePrograms: favoriteProgramsWithDetails
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 