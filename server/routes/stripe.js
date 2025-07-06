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
  body('recurring.frequency').optional().isIn(['monthly', 'quarterly', 'yearly'])
], async (req, res) => {
  try {
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

    console.log('Processing payment intent for amount:', amount, currency);

    // Create donation record first
    const donationData = {
      program: programId,
      amount,
      currency: currency.toUpperCase(),
      paymentMethod: 'stripe',
      anonymous: req.user ? anonymous : true, // Force anonymous if not authenticated
      message,
      recurring,
      paymentStatus: 'pending'
    };

    // Add donor if authenticated
    if (req.user) {
      donationData.donor = req.user.id;
    }

    console.log('Creating donation record:', donationData);

    const donation = new Donation(donationData);
    await donation.save();

    console.log('Donation created:', donation._id);

    // Create Stripe payment intent
    const metadata = {
      donationId: donation._id.toString(),
      programId,
      anonymous: donationData.anonymous.toString(),
      recurring: recurring.isRecurring.toString()
    };

    if (req.user) {
      metadata.userId = req.user.id;
    }

    console.log('Creating Stripe payment intent with metadata:', metadata);

    const paymentIntent = await StripeService.createPaymentIntent(
      amount,
      currency,
      metadata
    );

    console.log('Payment intent created:', paymentIntent.paymentIntentId);

    // Update donation with Stripe payment intent ID
    donation.stripePaymentIntentId = paymentIntent.paymentIntentId;
    await donation.save();

    const response = {
      message: 'Payment intent created successfully',
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      donationId: donation._id
    };

    console.log('Sending response:', { ...response, clientSecret: '***' });

    res.json(response);

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
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
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

module.exports = router; 