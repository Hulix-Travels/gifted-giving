const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Volunteer application model (simplified for now)
const VolunteerApplication = require('../models/VolunteerApplication');

// @route   POST /api/volunteers/apply
// @desc    Submit volunteer application
// @access  Public
router.post('/apply', [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').trim().isLength({ min: 10, max: 15 }).withMessage('Please enter a valid phone number (10-15 digits)'),
  body('age').isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
  body('location').notEmpty().withMessage('Preferred location is required'),
  body('skills').isArray({ min: 1 }).withMessage('At least one skill must be selected'),
  body('skills.*').isIn([
    'teaching', 'medical', 'construction', 'fundraising', 'translation', 
    'counseling', 'sports', 'arts', 'technology', 'cooking', 'administration', 'other'
  ]).withMessage('Invalid skill selected'),
  body('experience').optional().isLength({ max: 500 }).withMessage('Experience description cannot exceed 500 characters'),
  body('availability').notEmpty().withMessage('Availability is required'),
  body('commitment').notEmpty().withMessage('Commitment level is required'),
  body('emergencyContact').trim().isLength({ min: 2, max: 100 }).withMessage('Emergency contact name must be between 2 and 100 characters'),
  body('emergencyPhone').trim().isLength({ min: 10, max: 15 }).withMessage('Please enter a valid emergency contact phone number (10-15 digits)'),
  body('message').isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
  body('agreeToTerms').custom((value) => {
    return value === true || value === 'true' || value === 1;
  }).withMessage('You must agree to the terms and conditions')
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
      firstName,
      lastName,
      email,
      phone,
      age,
      location,
      skills,
      experience,
      availability,
      commitment,
      emergencyContact,
      emergencyPhone,
      message,
      agreeToTerms
    } = req.body;

    // Check if application already exists
    const existingApplication = await VolunteerApplication.findOne({ email });
    if (existingApplication) {
      return res.status(400).json({ message: 'An application with this email already exists' });
    }

    const application = new VolunteerApplication({
      firstName,
      lastName,
      email,
      phone,
      age,
      location,
      skills,
      experience,
      availability,
      commitment,
      emergencyContact,
      emergencyPhone,
      message,
      agreeToTerms
    });

    await application.save();

    res.status(201).json({
      message: 'Volunteer application submitted successfully',
      application: {
        id: application._id,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        age: application.age,
        location: application.location,
        skills: application.skills,
        status: application.status,
        submittedAt: application.createdAt
      }
    });

  } catch (error) {
    console.error('Volunteer application error:', error);
    res.status(500).json({ message: 'Server error during application submission' });
  }
});

// @route   GET /api/volunteers/applications
// @desc    Get all volunteer applications (admin only)
// @access  Private (Admin only)
router.get('/applications', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, location, skills } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    if (location) {
      query.location = location;
    }
    if (skills) {
      query.skills = { $in: skills.split(',') };
    }

    const applications = await VolunteerApplication.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')
      .exec();

    const total = await VolunteerApplication.countDocuments(query);

    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalApplications: total
    });

  } catch (error) {
    console.error('Get volunteer applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/volunteers/applications/:id
// @desc    Get specific volunteer application (admin only)
// @access  Private (Admin only)
router.get('/applications/:id', adminAuth, async (req, res) => {
  try {
    const application = await VolunteerApplication.findById(req.params.id)
      .select('-__v')
      .exec();

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ application });

  } catch (error) {
    console.error('Get volunteer application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/volunteers/applications/:id/status
// @desc    Update application status (admin only)
// @access  Private (Admin only)
router.put('/applications/:id/status', adminAuth, [
  body('status').isIn(['pending', 'reviewed', 'approved', 'rejected']).withMessage('Invalid status'),
  body('notes.admin').optional().isLength({ max: 500 }).withMessage('Admin notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { status, notes } = req.body;

    const application = await VolunteerApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    
    if (notes && notes.admin) {
      application.notes = { ...application.notes, admin: notes.admin };
    }
    
    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application: {
        id: application._id,
        status: application.status,
        reviewedAt: application.reviewedAt,
        notes: application.notes
      }
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/volunteers/stats
// @desc    Get volunteer statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await VolunteerApplication.aggregate([
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          pendingApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          averageAge: { $avg: '$age' },
          ageRange: {
            min: { $min: '$age' },
            max: { $max: '$age' }
          }
        }
      }
    ]);

    const locationStats = await VolunteerApplication.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const skillsStats = await VolunteerApplication.aggregate([
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const commitmentStats = await VolunteerApplication.aggregate([
      {
        $group: {
          _id: '$commitment',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const availabilityStats = await VolunteerApplication.aggregate([
      {
        $group: {
          _id: '$availability',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overall: stats[0] || {
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        averageAge: 0,
        ageRange: { min: 0, max: 0 }
      },
      byLocation: locationStats,
      bySkills: skillsStats,
      byCommitment: commitmentStats,
      byAvailability: availabilityStats
    });

  } catch (error) {
    console.error('Get volunteer stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 