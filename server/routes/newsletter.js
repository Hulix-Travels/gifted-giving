const express = require('express');
const router = express.Router();
const NewsletterSubscription = require('../models/NewsletterSubscription');
const emailService = require('../services/emailService');

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
        return res.status(400).json({ message: 'You are already subscribed to our newsletter' });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = new Date();
        await existingSubscription.save();
        return res.json({ message: 'Welcome back! Your newsletter subscription has been reactivated' });
      }
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

    res.status(201).json({ message: 'Successfully subscribed to our newsletter!' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This email is already subscribed' });
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
    
    if (!subscription) {
      return res.status(404).json({ message: 'Email not found in our subscription list' });
    }

    if (!subscription.isActive) {
      return res.status(400).json({ message: 'You are already unsubscribed' });
    }

    subscription.isActive = false;
    await subscription.save();

    res.json({ message: 'Successfully unsubscribed from our newsletter' });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/newsletter/subscribers
// @desc    Get all active subscribers (admin only)
// @access  Private
router.get('/subscribers', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const subscribers = await NewsletterSubscription.find({ isActive: true })
      .sort({ subscribedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
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
// @access  Private
router.get('/stats', async (req, res) => {
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
// @access  Private
router.post('/send', async (req, res) => {
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