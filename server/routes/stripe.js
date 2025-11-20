const express = require('express');
const { body, validationResult } = require('express-validator');
const StripeService = require('../services/stripe');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Donation = require('../models/Donation');
const { auth, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/stripe/create-payment-intent
// @desc    Create a Stripe payment intent for donation
// @access  Private
router.post('/create-payment-intent', [
  optionalAuth,
  body('amount').isFloat({ min: 0.5 }).withMessage('Amount must be at least $0.50'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp', 'kes', 'ugx']),
  body('programId').isMongoId().withMessage('Valid program ID is required'),
  body('anonymous').optional().isBoolean(),
  body('message').optional().isLength({ max: 500 }),
  body('recurring.isRecurring').optional().isBoolean(),
  body('recurring.frequency').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
], async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is not configured');
      return res.status(500).json({ 
        message: 'Payment system is not configured. Please contact support.',
        error: 'Stripe secret key missing'
      });
    }

    console.log('Payment intent request received:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const {
      amount,
      currency = 'usd',
      programId,
      anonymous = false,
      message,
      recurring = { isRecurring: false, frequency: 'monthly' }
    } = req.body;

    console.log('Processing payment for amount:', amount, currency);
    console.log('Recurring donation:', recurring.isRecurring, 'Frequency:', recurring.frequency);

    // If recurring, create subscription; otherwise create one-time payment intent
    if (recurring.isRecurring) {
      // RECURRING DONATION - Create Subscription
      // Require authentication for recurring donations
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Authentication required for recurring donations. Please log in to set up a recurring donation.'
        });
      }

      console.log('Creating recurring donation subscription...');
      
      // Get or create Stripe customer (user must be authenticated at this point)
      let customer;
      const customerEmail = req.user.email;
      const customerName = `${req.user.firstName} ${req.user.lastName}`;
      
      try {
        // Try to find existing customer
        const customers = await stripe.customers.list({
          email: customerEmail,
          limit: 1
        });
        
        if (customers.data.length > 0) {
          customer = customers.data[0];
          console.log('Found existing Stripe customer:', customer.id);
        } else {
          // Create new customer
          customer = await StripeService.createCustomer(
            customerEmail,
            customerName,
            { 
              userId: req.user?.id || null,
              programId: programId
            }
          );
          console.log('Created new Stripe customer:', customer.id);
        }
      } catch (error) {
        console.error('Error managing customer:', error);
        throw new Error('Failed to set up customer for recurring donation');
      }

      // Create donation record first (user is authenticated for recurring donations)
      const donationData = {
        program: programId,
        amount,
        currency: currency.toUpperCase(),
        paymentMethod: 'stripe',
        anonymous: anonymous || false, // Recurring donations cannot be anonymous
        message,
        recurring: {
          ...recurring,
          nextPaymentDate: StripeService.calculateNextPaymentDate(recurring.frequency)
        },
        paymentStatus: 'pending',
        donor: req.user.id // Required for recurring donations
      };

      const donation = new Donation(donationData);
      await donation.save();
      console.log('Initial donation record created:', donation._id);

      // Create price for subscription
      const price = await StripeService.createPrice(
        amount,
        currency,
        recurring.frequency,
        {
          donationId: donation._id.toString(),
          programId,
          anonymous: donationData.anonymous.toString()
        }
      );
      console.log('Stripe price created:', price.id);

      // Create subscription
      const subscription = await StripeService.createSubscription(
        customer.id,
        price.id,
        {
          donationId: donation._id.toString(),
          programId,
          anonymous: donationData.anonymous.toString(),
          frequency: recurring.frequency,
          userId: req.user?.id || null
        }
      );

      console.log('Subscription created:', subscription.id);

      // Update donation with subscription ID
      donation.recurring.stripeSubscriptionId = subscription.id;
      donation.recurring.originalDonationId = donation._id;
      await donation.save();

      // Get client secret from the invoice's payment intent
      const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;
      
      if (!clientSecret) {
        throw new Error('Failed to get client secret from subscription');
      }

      return res.json({
        message: 'Subscription created successfully',
        clientSecret: clientSecret,
        paymentIntentId: subscription.latest_invoice?.payment_intent?.id,
        subscriptionId: subscription.id,
        donationId: donation._id,
        isSubscription: true
      });

    } else {
      // ONE-TIME DONATION - Create Payment Intent
      console.log('Creating one-time payment intent...');
      console.log('Amount:', amount, 'Type:', typeof amount);
      console.log('Currency:', currency);
      console.log('Program ID:', programId);
      
      // Ensure amount is a number
      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      if (isNaN(numericAmount) || numericAmount < 0.5) {
        return res.status(400).json({ 
          message: 'Amount must be at least $0.50',
          error: 'Invalid amount'
        });
      }
      
    const donationData = {
      program: programId,
      amount: numericAmount,
      currency: currency.toUpperCase(),
      paymentMethod: 'stripe',
        anonymous: req.user ? anonymous : true,
      message,
      recurring,
      paymentStatus: 'pending'
    };

    if (req.user) {
      donationData.donor = req.user.id;
    }

    const donation = new Donation(donationData);
    await donation.save();
    console.log('Donation created:', donation._id);

    const metadata = {
      donationId: donation._id.toString(),
      programId,
      anonymous: donationData.anonymous.toString(),
        recurring: 'false'
    };

    if (req.user) {
      metadata.userId = req.user.id;
    }

    console.log('Creating payment intent with:', {
      amount: numericAmount,
      currency,
      metadata
    });

    const paymentIntent = await StripeService.createPaymentIntent(
      numericAmount,
      currency,
      metadata
    );

    donation.stripePaymentIntentId = paymentIntent.paymentIntentId;
    await donation.save();

      return res.json({
      message: 'Payment intent created successfully',
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
        donationId: donation._id,
        isSubscription: false
      });
    }

  } catch (error) {
    console.error('Create payment intent error:', error);
    console.error('Error stack:', error.stack);
    
    // Send a proper error response
    res.status(500).json({ 
      message: 'Failed to create payment intent',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   POST /api/stripe/webhook
// @desc    Handle Stripe webhook events
// @access  Public
// Note: This route must NOT have body parsing middleware applied before it
// The raw body is already handled in index.js before this route is reached
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const result = await StripeService.processWebhook(event);
    res.json({ received: true, result });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   POST /api/stripe/confirm-payment
// @desc    Confirm a payment intent
// @access  Private
router.post('/confirm-payment', [
  auth,
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { paymentIntentId } = req.body;

    // Verify the payment intent belongs to the user
    const donation = await Donation.findOne({
      stripePaymentIntentId: paymentIntentId,
      donor: req.user.id
    });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const paymentIntent = await StripeService.confirmPaymentIntent(paymentIntentId);

    res.json({
      message: 'Payment confirmed successfully',
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
});

// @route   POST /api/stripe/create-subscription
// @desc    Create a recurring donation subscription
// @access  Private
router.post('/create-subscription', [
  auth,
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp', 'kes', 'ugx']),
  body('interval').isIn(['month', 'quarter', 'year']).withMessage('Invalid interval'),
  body('programId').isMongoId().withMessage('Valid program ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { amount, currency = 'usd', interval, programId } = req.body;

    // Create or get customer
    let customer;
    try {
      customer = await StripeService.createCustomer(
        req.user.email,
        `${req.user.firstName} ${req.user.lastName}`,
        { userId: req.user.id }
      );
    } catch (error) {
      // Customer might already exist, try to retrieve
      const customers = await stripe.customers.list({
        email: req.user.email,
        limit: 1
      });
      customer = customers.data[0];
    }

    // Create price for subscription
    const price = await StripeService.createPrice(
      amount,
      currency,
      interval,
      { programId, userId: req.user.id }
    );

    // Create subscription
    const subscription = await StripeService.createSubscription(
      customer.id,
      price.id,
      { programId, userId: req.user.id }
    );

    res.json({
      message: 'Subscription created successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      }
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
});

// @route   GET /api/stripe/webhook-test
// @desc    Test webhook endpoint accessibility
// @access  Public
router.get('/webhook-test', (req, res) => {
  console.log('🧪 Webhook test endpoint accessed');
  res.json({ 
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET
  });
});

// @route   POST /api/stripe/webhook-test
// @desc    Test webhook processing
// @access  Public
// Note: Raw body parsing is handled in index.js for webhook routes
router.post('/webhook-test', (req, res) => {
  console.log('🧪 Webhook test POST received');
  console.log('Headers:', req.headers);
  console.log('Body length:', req.body.length);
  res.json({ 
    message: 'Webhook test POST received successfully',
    timestamp: new Date().toISOString(),
    bodyLength: req.body.length
  });
});

// @route   GET /api/stripe/payment-intent/:id
// @desc    Get payment intent details
// @access  Private
router.get('/payment-intent/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify the payment intent belongs to the user
    const donation = await Donation.findOne({
      stripePaymentIntentId: id,
      donor: req.user.id
    });

    if (!donation) {
      return res.status(404).json({ message: 'Payment intent not found' });
    }

    const paymentIntent = await StripeService.getPaymentIntent(id);

    res.json({
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        created: paymentIntent.created
      }
    });

  } catch (error) {
    console.error('Get payment intent error:', error);
    res.status(500).json({ message: 'Failed to retrieve payment intent' });
  }
});

// @route   POST /api/stripe/refund
// @desc    Refund a payment
// @access  Private (Admin only)
router.post('/refund', [
  auth,
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('reason').optional().isIn(['duplicate', 'fraudulent', 'requested_by_customer'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;

    const refund = await StripeService.refundPayment(paymentIntentId, amount, reason);

    res.json({
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason
      }
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
});

// @route   GET /api/stripe/subscription/:subscriptionId
// @desc    Get subscription details
// @access  Private
router.get('/subscription/:subscriptionId', auth, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    // Verify subscription belongs to user
    const donation = await Donation.findOne({
      'recurring.stripeSubscriptionId': subscriptionId,
      donor: req.user.id
    });
    
    if (!donation) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    const subscription = await StripeService.getSubscription(subscriptionId);
    
    res.json({
      subscription,
      donation: {
        id: donation._id,
        amount: donation.amount,
        frequency: donation.recurring.frequency,
        totalPayments: donation.recurring.totalPayments,
        nextPaymentDate: donation.recurring.nextPaymentDate
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Failed to retrieve subscription' });
  }
});

// @route   GET /api/stripe/subscriptions
// @desc    Get all subscriptions for the user
// @access  Private
router.get('/subscriptions', auth, async (req, res) => {
  try {
    const donations = await Donation.find({
      donor: req.user.id,
      'recurring.isRecurring': true,
      'recurring.stripeSubscriptionId': { $exists: true, $ne: null }
    }).populate('program', 'name category image').sort({ createdAt: -1 });
    
    // Get subscription details from Stripe for each
    const subscriptions = await Promise.all(
      donations.map(async (donation) => {
        try {
          const subscription = await StripeService.getSubscription(donation.recurring.stripeSubscriptionId);
          return {
            donation: {
              id: donation._id,
              program: donation.program,
              amount: donation.amount,
              frequency: donation.recurring.frequency,
              totalPayments: donation.recurring.totalPayments,
              nextPaymentDate: donation.recurring.nextPaymentDate,
              createdAt: donation.createdAt
            },
            subscription: {
              id: subscription.id,
              status: subscription.status,
              cancel_at_period_end: subscription.cancel_at_period_end,
              current_period_end: subscription.current_period_end,
              current_period_start: subscription.current_period_start
            }
          };
        } catch (error) {
          console.error(`Error fetching subscription ${donation.recurring.stripeSubscriptionId}:`, error);
          return {
            donation: {
              id: donation._id,
              program: donation.program,
              amount: donation.amount,
              frequency: donation.recurring.frequency,
              totalPayments: donation.recurring.totalPayments,
              nextPaymentDate: donation.recurring.nextPaymentDate,
              createdAt: donation.createdAt
            },
            subscription: null,
            error: 'Failed to fetch subscription details'
          };
        }
      })
    );
    
    // Filter out canceled subscriptions and subscriptions that failed to fetch
    const activeSubscriptions = subscriptions.filter(sub => {
      // Exclude if subscription is null (failed to fetch)
      if (!sub.subscription) {
        return false;
      }
      // Exclude canceled subscriptions
      if (sub.subscription.status === 'canceled') {
        return false;
      }
      return true;
    });
    
    res.json({ subscriptions: activeSubscriptions });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Failed to retrieve subscriptions' });
  }
});

// @route   POST /api/stripe/subscription/:subscriptionId/cancel
// @desc    Cancel a subscription
// @access  Private
router.post('/subscription/:subscriptionId/cancel', [
  auth,
  body('cancelImmediately').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    const { subscriptionId } = req.params;
    const { cancelImmediately = false } = req.body;
    
    // Verify subscription belongs to user
    const donation = await Donation.findOne({
      'recurring.stripeSubscriptionId': subscriptionId,
      donor: req.user.id
    });
    
    if (!donation) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    const subscription = await StripeService.cancelSubscription(subscriptionId, cancelImmediately);
    
    // Update donation record
    if (cancelImmediately) {
      donation.recurring.endDate = new Date();
    }
    await donation.save();
    
    res.json({
      message: cancelImmediately ? 'Subscription canceled immediately' : 'Subscription will be canceled at period end',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
});

// @route   POST /api/stripe/subscription/:subscriptionId/modify
// @desc    Modify a subscription (change amount or frequency)
// @access  Private
router.post('/subscription/:subscriptionId/modify', [
  auth,
  body('amount').optional().isFloat({ min: 0.5 }).withMessage('Amount must be at least $0.50'),
  body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    const { subscriptionId } = req.params;
    const { amount, frequency } = req.body;
    
    // Verify subscription belongs to user
    const donation = await Donation.findOne({
      'recurring.stripeSubscriptionId': subscriptionId,
      donor: req.user.id
    });
    
    if (!donation) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    if (!amount && !frequency) {
      return res.status(400).json({ message: 'Must provide amount or frequency to modify' });
    }
    
    const newAmount = amount || donation.amount;
    const newFrequency = frequency || donation.recurring.frequency;
    
    const subscription = await StripeService.modifySubscription(
      subscriptionId,
      newAmount,
      newFrequency
    );
    
    // Update donation record
    donation.amount = newAmount;
    donation.recurring.frequency = newFrequency;
    donation.recurring.nextPaymentDate = StripeService.calculateNextPaymentDate(newFrequency);
    await donation.save();
    
    res.json({
      message: 'Subscription modified successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status
      },
      donation: {
        amount: donation.amount,
        frequency: donation.recurring.frequency,
        nextPaymentDate: donation.recurring.nextPaymentDate
      }
    });
  } catch (error) {
    console.error('Modify subscription error:', error);
    res.status(500).json({ message: 'Failed to modify subscription' });
  }
});

// @route   POST /api/stripe/subscription/:subscriptionId/reactivate
// @desc    Reactivate a canceled subscription
// @access  Private
router.post('/subscription/:subscriptionId/reactivate', auth, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    // Verify subscription belongs to user
    const donation = await Donation.findOne({
      'recurring.stripeSubscriptionId': subscriptionId,
      donor: req.user.id
    });
    
    if (!donation) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    const subscription = await StripeService.reactivateSubscription(subscriptionId);
    
    // Update donation record
    donation.recurring.endDate = null;
    await donation.save();
    
    res.json({
      message: 'Subscription reactivated successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end
      }
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({ message: 'Failed to reactivate subscription' });
  }
});

module.exports = router; 