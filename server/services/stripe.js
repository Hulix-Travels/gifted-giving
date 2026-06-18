const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  // Create a payment intent for a donation
  static async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      // Validate Stripe key is configured
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('Stripe secret key is not configured. Please set STRIPE_SECRET_KEY environment variable.');
      }

      // Validate amount
      if (!amount || amount < 0.5) {
        throw new Error('Amount must be at least $0.50');
      }

      console.log(`Creating payment intent for ${amount} ${currency}`);
      console.log('Stripe secret key available:', !!process.env.STRIPE_SECRET_KEY);
      console.log('Metadata:', metadata);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          ...metadata,
          type: 'donation'
        },
        automatic_payment_methods: {
          enabled: true,
        },
        // Enable 3D Secure authentication
        setup_future_usage: 'off_session',
        capture_method: 'automatic',
        // Add description for better tracking
        description: `Donation to Gifted givings - ${metadata.programId || 'General Fund'}`,
      });

      console.log(`✅ Payment intent created: ${paymentIntent.id}`);
      console.log(`🔐 Client secret generated for: ${paymentIntent.id}`);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('❌ Stripe payment intent creation error:', error);
      console.error('Error details:', {
        message: error.message,
        type: error.type,
        code: error.code,
        decline_code: error.decline_code,
        param: error.param
      });
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  // Confirm a payment intent
  static async confirmPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment intent confirmation error:', error);
      throw new Error('Failed to confirm payment');
    }
  }

  // Create a customer
  static async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          ...metadata,
          source: 'gifted-giving'
        }
      });

      return customer;
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      throw new Error('Failed to create customer');
    }
  }

  // Create a subscription for recurring donations
  static async createSubscription(customerId, priceId, metadata = {}) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: {
          ...metadata,
          type: 'recurring_donation'
        },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error) {
      console.error('Stripe subscription creation error:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Helper function to convert frequency to Stripe interval
  static convertFrequencyToStripeInterval(frequency) {
    const frequencyMap = {
      'daily': 'day',
      'weekly': 'week',
      'monthly': 'month',
      'quarterly': 'month', // Stripe doesn't support quarterly, we'll use 3 months interval count
      'yearly': 'year'
    };
    return frequencyMap[frequency] || 'month';
  }

  // Helper function to get interval count for quarterly
  static getIntervalCount(frequency) {
    if (frequency === 'quarterly') {
      return 3; // 3 months
    }
    return 1; // Default interval count
  }

  // Helper function to calculate next payment date
  static calculateNextPaymentDate(frequency) {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() + 1));
      case 'quarterly':
        return new Date(now.setMonth(now.getMonth() + 3));
      case 'yearly':
        return new Date(now.setFullYear(now.getFullYear() + 1));
      default:
        return new Date(now.setMonth(now.getMonth() + 1));
    }
  }

  // Create a price for recurring donations
  static async createPrice(amount, currency = 'usd', frequency = 'monthly', metadata = {}) {
    try {
      const interval = this.convertFrequencyToStripeInterval(frequency);
      const intervalCount = this.getIntervalCount(frequency);
      
      const price = await stripe.prices.create({
        unit_amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        recurring: { 
          interval,
          interval_count: intervalCount
        },
        product_data: {
          name: `Gifted givings Donation (${frequency})`,
          metadata: {
            ...metadata,
            type: 'donation_product',
            frequency: frequency,
            description: `Recurring donation to support children in need (${frequency})`
          }
        },
      });

      return price;
    } catch (error) {
      console.error('Stripe price creation error:', error);
      console.error('Error details:', {
        message: error.message,
        type: error.type,
        code: error.code,
        param: error.param
      });
      throw new Error(`Failed to create price: ${error.message}`);
    }
  }

  // Process webhook events
  static async processWebhook(event) {
    try {
      console.log(`🔄 Processing webhook event: ${event.type}`);
      console.log(`Event ID: ${event.id}`);
      console.log(`Event data:`, JSON.stringify(event.data.object, null, 2));
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('💰 Processing successful payment...');
          return await this.handlePaymentSuccess(event.data.object);
        
        case 'payment_intent.payment_failed':
          console.log('❌ Processing failed payment...');
          return await this.handlePaymentFailure(event.data.object);
        
        case 'invoice.payment_succeeded':
          console.log('🔄 Processing invoice payment...');
          const invoice = event.data.object;
          // Check if this is a subscription invoice or one-time payment
          if (invoice.subscription) {
            return await this.handleSubscriptionPayment(invoice);
          } else {
            // This is a one-time invoice, handle as regular payment
            console.log('💰 Processing one-time invoice payment...');
            if (invoice.payment_intent) {
              const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
              return await this.handlePaymentSuccess(paymentIntent);
            }
          }
          break;
        
        case 'invoice.payment_failed':
          console.log('❌ Processing subscription failure...');
          return await this.handleSubscriptionFailure(event.data.object);
        
        case 'customer.subscription.deleted':
          console.log('🗑️ Processing subscription cancellation...');
          return await this.handleSubscriptionCancellation(event.data.object);
        
        case 'customer.subscription.updated':
          console.log('🔄 Processing subscription update...');
          return await this.handleSubscriptionUpdate(event.data.object);
        
        default:
          console.log(`⚠️ Unhandled event type: ${event.type}`);
          return { status: 'ignored', eventType: event.type };
      }
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  // Send donor confirmation and optional admin alert after a completed donation
  static async sendDonationNotifications(donationId) {
    const Donation = require('../models/Donation');
    const emailService = require('./emailService');

    const populated = await Donation.findById(donationId)
      .populate('donor', 'firstName lastName email')
      .populate('program', 'name category image');

    if (!populated) return;

    if (populated.donor?.email && !populated.anonymous) {
      try {
        await emailService.sendDonationConfirmationEmail(populated);
        console.log(`📧 Donation confirmation sent to ${populated.donor.email}`);
      } catch (emailError) {
        console.error('Failed to send donation confirmation email:', emailError);
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (adminEmail) {
      try {
        await emailService.sendAdminDonationNotification(populated, adminEmail);
        console.log(`📧 Admin donation alert sent to ${adminEmail}`);
      } catch (emailError) {
        console.error('Failed to send admin donation notification:', emailError);
      }
    }
  }

  // Mark an existing donation completed (idempotent) and notify
  static async markDonationCompleted(donation, paymentIntentId) {
    if (donation.paymentStatus === 'completed') {
      return donation;
    }

    donation.paymentStatus = 'completed';
    donation.transactionId = paymentIntentId;
    if (!donation.stripePaymentIntentId) {
      donation.stripePaymentIntentId = paymentIntentId;
    }
    donation.updatedAt = new Date();
    await donation.save();

    await this.sendDonationNotifications(donation._id);
    return donation;
  }

  // Handle successful payment
  static async handlePaymentSuccess(paymentIntent) {
    try {
      console.log(`💰 Processing successful payment: ${paymentIntent.id}`);

      const Donation = require('../models/Donation');

      let donation = await Donation.findOne({ stripePaymentIntentId: paymentIntent.id });

      if (donation) {
        donation = await this.markDonationCompleted(donation, paymentIntent.id);
      } else if (paymentIntent.metadata?.donationId) {
        console.log(`🔍 Trying donation by metadata ID: ${paymentIntent.metadata.donationId}`);
        donation = await Donation.findById(paymentIntent.metadata.donationId);
        if (donation) {
          donation = await this.markDonationCompleted(donation, paymentIntent.id);
        }
      } else {
        console.warn(`⚠️ No donation found for payment intent: ${paymentIntent.id}`);
      }

      return { status: 'success', donation, paymentIntent };
    } catch (error) {
      console.error('❌ Payment success handling error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  // Handle failed payment
  static async handlePaymentFailure(paymentIntent) {
    try {
      const Donation = require('../models/Donation');
      
      const donation = await Donation.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { 
          paymentStatus: 'failed',
          updatedAt: new Date()
        },
        { new: true }
      );

      if (donation) {
        console.log(`Payment failed for donation: ${donation._id}`);
      }

      return { status: 'failed', donation };
    } catch (error) {
      console.error('Payment failure handling error:', error);
      throw error;
    }
  }

  // Handle subscription payment
  static async handleSubscriptionPayment(invoice) {
    try {
      console.log(`🔄 Processing subscription payment: ${invoice.id}`);
      console.log(`Subscription ID: ${invoice.subscription}`);
      console.log(`Amount: ${invoice.amount_paid / 100} ${invoice.currency}`);
      
      const Donation = require('../models/Donation');
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      // Retrieve the subscription to get metadata
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      console.log('Subscription metadata:', subscription.metadata);
      
      // Find the original donation record
      const originalDonationId = subscription.metadata.donationId;
      if (!originalDonationId) {
        console.error('⚠️ No original donation ID found in subscription metadata');
        return { status: 'error', message: 'No original donation ID found' };
      }
      
      const originalDonation = await Donation.findById(originalDonationId);
      if (!originalDonation) {
        console.error(`⚠️ Original donation not found: ${originalDonationId}`);
        return { status: 'error', message: 'Original donation not found' };
      }
      
      console.log(`✅ Found original donation: ${originalDonation._id}`);
      
      // Check if this payment has already been processed (prevent duplicate records)
      const existingDonation = await Donation.findOne({ 
        stripePaymentIntentId: invoice.payment_intent 
      });
      if (existingDonation) {
        console.log(`⚠️ Payment already processed for invoice ${invoice.id}, skipping duplicate record`);
        return { 
          status: 'success', 
          subscription: invoice.subscription,
          donation: existingDonation,
          message: 'Payment already recorded'
        };
      }
      
      // Check if this is the first payment (original donation status is pending)
      const isFirstPayment = originalDonation.paymentStatus === 'pending';
      
      if (isFirstPayment) {
        originalDonation.paymentStatus = 'completed';
        originalDonation.transactionId = invoice.payment_intent;
        originalDonation.stripePaymentIntentId = invoice.payment_intent;
        originalDonation.recurring.totalPayments = 1;
        originalDonation.recurring.nextPaymentDate = this.calculateNextPaymentDate(originalDonation.recurring.frequency);
        await originalDonation.save();
        console.log(`✅ Updated original donation to completed: ${originalDonation._id}`);

        await this.sendDonationNotifications(originalDonation._id);

        return {
          status: 'success',
          subscription: invoice.subscription,
          donation: originalDonation,
          isFirstPayment: true
        };
      }
      
      // This is a subsequent recurring payment - create a new donation record
      const newDonationData = {
        program: originalDonation.program,
        amount: invoice.amount_paid / 100, // Convert from cents
        currency: invoice.currency.toUpperCase(),
        paymentMethod: 'stripe',
        anonymous: originalDonation.anonymous,
        message: originalDonation.message,
        recurring: {
          isRecurring: true,
          frequency: originalDonation.recurring.frequency,
          stripeSubscriptionId: subscription.id,
          originalDonationId: originalDonation._id,
          nextPaymentDate: this.calculateNextPaymentDate(originalDonation.recurring.frequency),
          totalPayments: (originalDonation.recurring.totalPayments || 0) + 1
        },
        paymentStatus: 'completed',
        transactionId: invoice.payment_intent,
        stripePaymentIntentId: invoice.payment_intent
      };
      
      // Add donor if original donation had one
      if (originalDonation.donor) {
        newDonationData.donor = originalDonation.donor;
      }
      
      const newDonation = new Donation(newDonationData);
      await newDonation.save();
      console.log(`✅ Created new donation record for recurring payment: ${newDonation._id}`);

      originalDonation.recurring.totalPayments = (originalDonation.recurring.totalPayments || 0) + 1;
      originalDonation.recurring.nextPaymentDate = this.calculateNextPaymentDate(originalDonation.recurring.frequency);
      await originalDonation.save();

      await this.sendDonationNotifications(newDonation._id);

      return {
        status: 'success', 
        subscription: invoice.subscription,
        donation: newDonation,
        originalDonation: originalDonation
      };
    } catch (error) {
      console.error('❌ Subscription payment handling error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  // Handle subscription failure
  static async handleSubscriptionFailure(invoice) {
    try {
      console.log(`❌ Subscription payment failed: ${invoice.subscription}`);
      const Donation = require('../models/Donation');
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      // Retrieve subscription to get metadata
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const originalDonationId = subscription.metadata.donationId;
      
      if (originalDonationId) {
        const donation = await Donation.findById(originalDonationId);
        if (donation) {
          console.log(`⚠️ Marking subscription as failed for donation: ${donation._id}`);
          // Optionally mark the original donation or create a failure record
        }
      }
      
      return { status: 'failed', subscription: invoice.subscription };
    } catch (error) {
      console.error('Subscription failure handling error:', error);
      throw error;
    }
  }

  // Get subscription details
  static async getSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['customer', 'items.data.price.product']
      });
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw new Error('Failed to retrieve subscription');
    }
  }

  // Cancel a subscription
  static async cancelSubscription(subscriptionId, cancelImmediately = false) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !cancelImmediately
      });
      
      // If canceling immediately, also cancel it
      if (cancelImmediately) {
        await stripe.subscriptions.cancel(subscriptionId);
      }
      
      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Modify subscription (change amount or frequency)
  static async modifySubscription(subscriptionId, newAmount, newFrequency) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Get current subscription item
      const subscriptionItemId = subscription.items.data[0].id;
      
      // Create new price with updated amount and frequency
      const interval = this.convertFrequencyToStripeInterval(newFrequency);
      const intervalCount = this.getIntervalCount(newFrequency);
      
      const newPrice = await stripe.prices.create({
        unit_amount: Math.round(newAmount * 100),
        currency: subscription.currency,
        recurring: {
          interval,
          interval_count: intervalCount
        },
        product_data: {
          name: `Gifted givings Donation (${newFrequency})`,
          metadata: {
            description: `Recurring donation (${newFrequency})`,
            type: 'donation_product'
          }
        }
      });
      
      // Update subscription with new price
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscriptionItemId,
          price: newPrice.id
        }],
        proration_behavior: 'create_prorations' // Prorate the change
      });
      
      // Update metadata
      await stripe.subscriptions.update(subscriptionId, {
        metadata: {
          ...subscription.metadata,
          frequency: newFrequency,
          amount: newAmount.toString()
        }
      });
      
      return updatedSubscription;
    } catch (error) {
      console.error('Error modifying subscription:', error);
      throw new Error('Failed to modify subscription');
    }
  }

  // Reactivate a canceled subscription
  static async reactivateSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });
      
      return subscription;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw new Error('Failed to reactivate subscription');
    }
  }

  // Handle subscription cancellation webhook
  static async handleSubscriptionCancellation(subscription) {
    try {
      console.log(`🗑️ Subscription canceled: ${subscription.id}`);
      const Donation = require('../models/Donation');
      
      const originalDonationId = subscription.metadata.donationId;
      if (!originalDonationId) {
        console.error('⚠️ No original donation ID found in subscription metadata');
        return { status: 'error', message: 'No original donation ID found' };
      }
      
      const donation = await Donation.findById(originalDonationId);
      if (donation) {
        donation.recurring.endDate = new Date(subscription.canceled_at * 1000);
        await donation.save();
        console.log(`✅ Updated donation with cancellation date: ${donation._id}`);
      }
      
      return { status: 'success', subscription: subscription.id };
    } catch (error) {
      console.error('Subscription cancellation handling error:', error);
      throw error;
    }
  }

  // Handle subscription update webhook
  static async handleSubscriptionUpdate(subscription) {
    try {
      console.log(`🔄 Subscription updated: ${subscription.id}`);
      const Donation = require('../models/Donation');
      
      const originalDonationId = subscription.metadata.donationId;
      if (originalDonationId) {
        const donation = await Donation.findById(originalDonationId);
        if (donation) {
          // Update donation if subscription was reactivated
          if (!subscription.cancel_at_period_end && donation.recurring.endDate) {
            donation.recurring.endDate = null;
            await donation.save();
            console.log(`✅ Subscription reactivated for donation: ${donation._id}`);
          }
        }
      }
      
      return { status: 'success', subscription: subscription.id };
    } catch (error) {
      console.error('Subscription update handling error:', error);
      throw error;
    }
  }

  // Refund a payment
  static async refundPayment(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
        reason
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundData);

      // Update donation status
      const Donation = require('../models/Donation');
      await Donation.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        { 
          paymentStatus: 'refunded',
          updatedAt: new Date()
        }
      );

      return refund;
    } catch (error) {
      console.error('Stripe refund error:', error);
      throw new Error('Failed to process refund');
    }
  }

  // Get payment intent details
  static async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Stripe get payment intent error:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }
}

module.exports = StripeService; 