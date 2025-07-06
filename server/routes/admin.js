const express = require('express');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin only)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // TODO: Implement dashboard statistics
    res.json({
      message: 'Admin dashboard data',
      stats: {
        totalDonations: 0,
        totalPrograms: 0,
        totalVolunteers: 0,
        recentActivity: []
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 