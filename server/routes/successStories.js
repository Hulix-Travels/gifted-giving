const express = require('express');
const router = express.Router();
const SuccessStory = require('../models/SuccessStory');

// GET /api/success-stories - list all stories (optionally paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status; // Filter by status (pending, approved, rejected)
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
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

// POST /api/success-stories - create a new story
router.post('/', async (req, res) => {
  try {
    console.log('Received story submission:', req.body);
    
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
    
    // Validate required fields
    if (!content || !author) {
      console.log('Validation failed - missing content or author');
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
      featured,
      status: status || 'pending' // Default to pending for user submissions
    };
    
    // Add title if provided, otherwise generate one
    if (title) {
      storyData.title = title;
    } else {
      // Generate a title from the first part of content
      storyData.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
    }
    
    console.log('Creating story with data:', storyData);
    
    const story = new SuccessStory(storyData);
    await story.save();
    
    console.log('Story created successfully:', story._id);
    res.status(201).json({ story });
  } catch (err) {
    console.error('Error creating story:', err);
    res.status(500).json({ 
      message: 'Failed to create story.',
      error: err.message 
    });
  }
});

// PATCH /api/success-stories/:id - update a story
router.patch('/:id', async (req, res) => {
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

// DELETE /api/success-stories/:id - delete a story
router.delete('/:id', async (req, res) => {
  try {
    const story = await SuccessStory.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json({ message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete story.' });
  }
});

// PUT /api/success-stories/:id/status - update story status (for admin approval)
router.put('/:id/status', async (req, res) => {
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

// GET /api/success-stories/stats - get statistics (must come before /:id route)
router.get('/stats', async (req, res) => {
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

// GET /api/success-stories/:id - get a single story
router.get('/:id', async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json({ story });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch story.' });
  }
});

module.exports = router; 