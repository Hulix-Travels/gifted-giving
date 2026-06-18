const express = require('express');
const router = express.Router();
const SuccessStory = require('../models/SuccessStory');
const { adminAuth, optionalAuth } = require('../middleware/auth');
const { parsePagination } = require('../utils/pagination');

const isAdmin = (req) => req.user?.role === 'admin';

// GET /api/success-stories — public sees approved only; admin sees all
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10 });

    const query = {};
    if (isAdmin(req)) {
      if (req.query.status) {
        query.status = req.query.status;
      }
    } else {
      query.status = 'approved';
    }

    const total = await SuccessStory.countDocuments(query);
    const stories = await SuccessStory.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      stories,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalStories: total
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stories.' });
  }
});

// GET /api/success-stories/stats — admin only
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const total = await SuccessStory.countDocuments();
    const pending = await SuccessStory.countDocuments({ status: 'pending' });
    const approved = await SuccessStory.countDocuments({ status: 'approved' });
    const rejected = await SuccessStory.countDocuments({ status: 'rejected' });
    const featured = await SuccessStory.countDocuments({ featured: true });

    res.json({
      total,
      pending,
      approved,
      rejected,
      featured
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
});

// POST /api/success-stories — public submission; always pending, never featured
router.post('/', async (req, res) => {
  try {
    const {
      title,
      content,
      author,
      email,
      category,
      rating,
      location,
      image
    } = req.body;

    if (!content || !author) {
      return res.status(400).json({
        message: 'Content and author are required.',
        received: { content: !!content, author: !!author }
      });
    }

    const storyData = {
      content,
      author,
      email,
      category,
      rating,
      location,
      image,
      featured: false,
      status: 'pending'
    };

    if (title) {
      storyData.title = title;
    } else {
      storyData.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
    }

    const story = new SuccessStory(storyData);
    await story.save();

    res.status(201).json({ story });
  } catch (err) {
    console.error('Error creating story:', err);
    res.status(500).json({
      message: 'Failed to create story.',
      error: err.message
    });
  }
});

// PATCH /api/success-stories/:id — admin only
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const {
      title,
      content,
      author,
      email,
      category,
      rating,
      location,
      image,
      featured,
      status
    } = req.body;

    const story = await SuccessStory.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        author,
        email,
        category,
        rating,
        location,
        image,
        featured,
        status
      },
      { new: true }
    );
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json({ story });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update story.' });
  }
});

// PUT /api/success-stories/:id/status — admin only
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be pending, approved, or rejected.' });
    }

    const story = await SuccessStory.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json({ story });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update story status.' });
  }
});

// DELETE /api/success-stories/:id — admin only
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const story = await SuccessStory.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json({ message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete story.' });
  }
});

// GET /api/success-stories/:id — public sees approved only; admin sees any
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (!isAdmin(req) && story.status !== 'approved') {
      return res.status(404).json({ message: 'Story not found' });
    }

    res.json({ story });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch story.' });
  }
});

module.exports = router;
