const express = require('express');
const router = express.Router();
const SuccessStory = require('../models/SuccessStory');

// GET /api/success-stories - list all stories (optionally paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await SuccessStory.countDocuments();
    const stories = await SuccessStory.find()
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
    const { title, content, author, image, featured } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }
    const story = new SuccessStory({ title, content, author, image, featured });
    await story.save();
    res.status(201).json({ story });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create story.' });
  }
});

// PATCH /api/success-stories/:id - update a story
router.patch('/:id', async (req, res) => {
  try {
    const { title, content, author, image, featured } = req.body;
    const story = await SuccessStory.findByIdAndUpdate(
      req.params.id,
      { title, content, author, image, featured },
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

module.exports = router; 