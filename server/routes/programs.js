const express = require('express');
const { body, validationResult } = require('express-validator');
const Program = require('../models/Program');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/programs
// @desc    Get all programs with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      status = 'active',
      featured,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (featured === 'true') query.featured = true;
    if (search) {
      query.$text = { $search: search };
    }

    console.log('Programs query:', query);
    console.log('Status filter:', status);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const programs = await Program.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    console.log('Found programs:', programs.length);
    console.log('Program statuses:', programs.map(p => ({ name: p.name, status: p.status })));

    const total = await Program.countDocuments(query);

    res.json({
      programs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalPrograms: total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/programs/:id
// @desc    Get specific program details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    res.json({ program });

  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/programs/slug/:slug
// @desc    Get program by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const program = await Program.findOne({ slug: req.params.slug })
      .populate('createdBy', 'firstName lastName');

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    res.json({ program });

  } catch (error) {
    console.error('Get program by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/programs
// @desc    Create a new program
// @access  Private (Admin only)
router.post('/', [
  adminAuth,
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
  body('description').isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('longDescription').isLength({ min: 50 }).withMessage('Long description must be at least 50 characters'),
  body('category').isIn(['education', 'health', 'nutrition', 'emergency', 'infrastructure', 'other']),
  body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be greater than 0'),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'KES', 'UGX']),
  body('location.country').notEmpty().withMessage('Country is required'),
  body('duration.startDate').isISO8601().withMessage('Valid start date is required'),
  body('duration.endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const programData = {
      ...req.body,
      createdBy: req.user.id
    };

    console.log('Received program data:', programData);
    console.log('Program name:', programData.name);

    // Generate slug as a workaround in case pre-save hook fails
    if (programData.name) {
      programData.slug = programData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      console.log('Generated slug in route:', programData.slug);
    }

    const program = new Program(programData);
    console.log('Program instance created, slug:', program.slug);
    await program.save();
    console.log('Program saved successfully, final slug:', program.slug);

    await program.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      message: 'Program created successfully',
      program
    });

  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({ message: 'Server error during program creation' });
  }
});

// @route   PUT /api/programs/:id
// @desc    Update a program
// @access  Private (Admin only)
router.put('/:id', [
  adminAuth,
  body('name').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().isLength({ min: 10, max: 1000 }),
  body('longDescription').optional().isLength({ min: 50 }),
  body('category').optional().isIn(['education', 'health', 'nutrition', 'emergency', 'infrastructure', 'other']),
  body('targetAmount').optional().isFloat({ min: 1 }),
  body('status').optional().isIn(['active', 'completed', 'paused', 'upcoming'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        program[key] = req.body[key];
      }
    });

    await program.save();
    await program.populate('createdBy', 'firstName lastName');

    res.json({
      message: 'Program updated successfully',
      program
    });

  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({ message: 'Server error during program update' });
  }
});

// @route   PUT /api/programs/:id/metrics
// @desc    Update program metrics (impact and current amounts)
// @access  Private (Admin only)
router.put('/:id/metrics', [
  adminAuth,
  body('currentAmount').optional().isFloat({ min: 0 }),
  body('impactMetrics').optional().isObject(),
  body('impactMetrics.childrenHelped').optional().isInt({ min: 0 }),
  body('impactMetrics.communitiesReached').optional().isInt({ min: 0 }),
  body('impactMetrics.schoolsBuilt').optional().isInt({ min: 0 }),
  body('impactMetrics.mealsProvided').optional().isInt({ min: 0 }),
  body('impactMetrics.medicalCheckups').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Update current amount if provided
    if (req.body.currentAmount !== undefined) {
      program.currentAmount = req.body.currentAmount;
    }

    // Update impact metrics if provided
    if (req.body.impactMetrics) {
      if (!program.impactMetrics) {
        program.impactMetrics = {};
      }
      
      Object.keys(req.body.impactMetrics).forEach(key => {
        if (req.body.impactMetrics[key] !== undefined) {
          program.impactMetrics[key] = req.body.impactMetrics[key];
        }
      });
    }

    await program.save();
    await program.populate('createdBy', 'firstName lastName');

    res.json({
      message: 'Program metrics updated successfully',
      program
    });

  } catch (error) {
    console.error('Update program metrics error:', error);
    res.status(500).json({ message: 'Server error during metrics update' });
  }
});

// @route   DELETE /api/programs/:id
// @desc    Delete a program
// @access  Private (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    await Program.findByIdAndDelete(req.params.id);

    res.json({ message: 'Program deleted successfully' });

  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({ message: 'Server error during program deletion' });
  }
});

// @route   GET /api/programs/categories
// @desc    Get all program categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Program.distinct('category');
    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/programs/featured
// @desc    Get featured programs
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const programs = await Program.find({ 
      featured: true, 
      status: 'active' 
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({ programs });

  } catch (error) {
    console.error('Get featured programs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/programs/stats/overview
// @desc    Get program statistics
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Program.aggregate([
      {
        $group: {
          _id: null,
          totalPrograms: { $sum: 1 },
          totalTargetAmount: { $sum: '$targetAmount' },
          totalCurrentAmount: { $sum: '$currentAmount' },
          avgProgress: { $avg: { $divide: ['$currentAmount', '$targetAmount'] } }
        }
      }
    ]);

    const categoryStats = await Program.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$currentAmount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const statusStats = await Program.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overall: stats[0] || {
        totalPrograms: 0,
        totalTargetAmount: 0,
        totalCurrentAmount: 0,
        avgProgress: 0
      },
      byCategory: categoryStats,
      byStatus: statusStats
    });

  } catch (error) {
    console.error('Get program stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/programs/recalculate-amounts
// @desc    Recalculate current amounts for all programs based on completed donations
// @access  Private (Admin only)
router.post('/recalculate-amounts', adminAuth, async (req, res) => {
  try {
    const result = await Program.recalculateCurrentAmounts();
    
    res.json({
      message: 'Program amounts recalculated successfully',
      ...result
    });

  } catch (error) {
    console.error('Recalculate amounts error:', error);
    res.status(500).json({ message: 'Server error during recalculation' });
  }
});

// @route   POST /api/programs/:id/recalculate-amount
// @desc    Recalculate current amount for a specific program based on completed donations
// @access  Private (Admin only)
router.post('/:id/recalculate-amount', adminAuth, async (req, res) => {
  try {
    const result = await Program.recalculateCurrentAmount(req.params.id);
    
    res.json({
      message: 'Program amount recalculated successfully',
      ...result
    });

  } catch (error) {
    console.error('Recalculate amount error:', error);
    if (error.message === 'Program not found') {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.status(500).json({ message: 'Server error during recalculation' });
  }
});

module.exports = router; 