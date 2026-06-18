const express = require('express');
const { adminAuth } = require('../middleware/auth');
const Donation = require('../models/Donation');
const Program = require('../models/Program');
const VolunteerApplication = require('../models/VolunteerApplication');
const User = require('../models/User');
const NewsletterSubscription = require('../models/NewsletterSubscription');
const SuccessStory = require('../models/SuccessStory');
const Feedback = require('../models/Feedback');
const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin only)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      donationAgg,
      totalPrograms,
      activePrograms,
      volunteerAgg,
      totalDonors,
      newsletterSubscribers,
      pendingStories,
      unreadFeedback,
      recentDonations,
      recentVolunteers,
      recentStories
    ] = await Promise.all([
      Donation.aggregate([
        {
          $group: {
            _id: null,
            totalDonations: { $sum: 1 },
            completedDonations: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
            },
            totalAmount: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, '$amount', 0] }
            },
            pendingDonations: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
            }
          }
        }
      ]),
      Program.countDocuments(),
      Program.countDocuments({ status: 'active' }),
      VolunteerApplication.aggregate([
        {
          $group: {
            _id: null,
            totalApplications: { $sum: 1 },
            pendingApplications: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            approvedApplications: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            }
          }
        }
      ]),
      User.countDocuments({ role: 'donor' }),
      NewsletterSubscription.countDocuments({ isActive: true }),
      SuccessStory.countDocuments({ status: 'pending' }),
      Feedback.countDocuments({ status: 'unread' }),
      Donation.find({ paymentStatus: 'completed' })
        .populate('program', 'name')
        .populate('donor', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      VolunteerApplication.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName email status createdAt')
        .lean(),
      SuccessStory.find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title author status createdAt')
        .lean()
    ]);

    const donations = donationAgg[0] || {
      totalDonations: 0,
      completedDonations: 0,
      totalAmount: 0,
      pendingDonations: 0
    };

    const volunteers = volunteerAgg[0] || {
      totalApplications: 0,
      pendingApplications: 0,
      approvedApplications: 0
    };

    const recentActivity = [
      ...recentDonations.map((d) => ({
        type: 'donation',
        id: d._id,
        title: `$${d.amount} donation`,
        subtitle: d.program?.name || 'Program',
        actor: d.anonymous ? 'Anonymous' : `${d.donor?.firstName || ''} ${d.donor?.lastName || ''}`.trim(),
        date: d.createdAt
      })),
      ...recentVolunteers.map((v) => ({
        type: 'volunteer',
        id: v._id,
        title: 'Volunteer application',
        subtitle: v.status,
        actor: `${v.firstName} ${v.lastName}`,
        date: v.createdAt
      })),
      ...recentStories.map((s) => ({
        type: 'story',
        id: s._id,
        title: s.title || 'Success story',
        subtitle: s.status,
        actor: s.author,
        date: s.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 12);

    res.json({
      message: 'Admin dashboard data',
      stats: {
        totalDonations: donations.completedDonations,
        totalDonationAmount: donations.totalAmount,
        pendingDonations: donations.pendingDonations,
        totalPrograms,
        activePrograms,
        totalVolunteers: volunteers.totalApplications,
        pendingVolunteers: volunteers.pendingApplications,
        approvedVolunteers: volunteers.approvedApplications,
        totalDonors,
        newsletterSubscribers,
        pendingStories,
        unreadFeedback
      },
      recentActivity
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
