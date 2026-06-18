const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { adminAuth } = require('../middleware/auth');
const { parsePagination } = require('../utils/pagination');

// POST /api/feedback — public submission
router.post('/', async (req, res) => {
  try {
    const { name, email, feedback } = req.body;
    if (!feedback || typeof feedback !== 'string' || !feedback.trim()) {
      return res.status(400).json({ message: 'Feedback is required.' });
    }
    const fb = new Feedback({ name, email, feedback });
    await fb.save();
    res.status(201).json({ message: 'Feedback received. Thank you!' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save feedback.' });
  }
});

// GET /api/feedback — admin only
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10 });
    const total = await Feedback.countDocuments();
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({
      feedback,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalFeedback: total
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch feedback.' });
  }
});

// PATCH /api/feedback/:id — admin only
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['unread', 'read', 'addressed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const fb = await Feedback.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!fb) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ feedback: fb });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update feedback status.' });
  }
});

module.exports = router;
