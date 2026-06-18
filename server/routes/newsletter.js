const express = require('express');
const router = express.Router();
const NewsletterSubscription = require('../models/NewsletterSubscription');
const emailService = require('../services/emailService');
const { adminAuth } = require('../middleware/auth');
const { parsePagination } = require('../utils/pagination');

const SUBSCRIBE_RESPONSE = {
  message: 'Thank you! If this email is eligible, you will receive our newsletter.'
};

const UNSUBSCRIBE_RESPONSE = {
  message: 'If this email was on our list, it has been removed from future mailings.'
};

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if already subscribed
    const existingSubscription = await NewsletterSubscription.findOne({ email: email.toLowerCase() });
    
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.json(SUBSCRIBE_RESPONSE);
      }

      existingSubscription.isActive = true;
      existingSubscription.subscribedAt = new Date();
      await existingSubscription.save();

      try {
        await emailService.sendNewsletterWelcomeEmail(email);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      return res.json(SUBSCRIBE_RESPONSE);
    }

    // Create new subscription
    const subscription = new NewsletterSubscription({
      email: email.toLowerCase()
    });

    await subscription.save();

    // Send welcome email
    try {
      await emailService.sendNewsletterWelcomeEmail(email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    res.status(201).json(SUBSCRIBE_RESPONSE);
  } catch (error) {
    console.error('Newsletter subscription error:', error);

    if (error.code === 11000) {
      return res.json(SUBSCRIBE_RESPONSE);
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const subscription = await NewsletterSubscription.findOne({ email: email.toLowerCase() });

    if (!subscription || !subscription.isActive) {
      return res.json(UNSUBSCRIBE_RESPONSE);
    }

    subscription.isActive = false;
    await subscription.save();

    res.json(UNSUBSCRIBE_RESPONSE);
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/newsletter/subscribers
// @desc    Get all active subscribers (admin only)
// @access  Private (Admin only)
router.get('/subscribers', adminAuth, async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 50 });
    
    const subscribers = await NewsletterSubscription.find({ isActive: true })
      .sort({ subscribedAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-__v')
      .exec();

    const total = await NewsletterSubscription.countDocuments({ isActive: true });

    res.json({
      subscribers,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalSubscribers: total
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/newsletter/stats
// @desc    Get newsletter statistics (admin only)
// @access  Private (Admin only)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalSubscribers = await NewsletterSubscription.countDocuments({ isActive: true });
    const totalUnsubscribed = await NewsletterSubscription.countDocuments({ isActive: false });
    const newThisMonth = await NewsletterSubscription.countDocuments({
      isActive: true,
      subscribedAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    res.json({
      totalSubscribers,
      totalUnsubscribed,
      newThisMonth,
      totalEmails: totalSubscribers + totalUnsubscribed
    });
  } catch (error) {
    console.error('Get newsletter stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/newsletter/send
// @desc    Send newsletter to all active subscribers (admin only)
// @access  Private (Admin only)
router.post('/send', adminAuth, async (req, res) => {
  try {
    const { subject, content } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }

    // Get all active subscribers
    const subscribers = await NewsletterSubscription.find({ isActive: true });

    if (subscribers.length === 0) {
      return res.status(400).json({ message: 'No active subscribers found' });
    }

    // Send newsletter emails
    const results = await emailService.sendNewsletterEmail(subscribers, subject, content);

    // Update lastEmailSent for all subscribers
    await NewsletterSubscription.updateMany(
      { isActive: true },
      { lastEmailSent: new Date() }
    );

    const successCount = results.filter(r => r.status === 'success').length;
    const failureCount = results.filter(r => r.status === 'failed').length;

    res.json({
      message: `Newsletter sent successfully to ${successCount} subscribers`,
      results: {
        total: subscribers.length,
        success: successCount,
        failed: failureCount,
        details: results
      }
    });
  } catch (error) {
    console.error('Send newsletter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 