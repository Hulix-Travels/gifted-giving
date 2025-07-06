const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  // Create a payment intent for a donation
  static async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
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
        description: `Donation to Gifted Giving - ${metadata.programId || 'General Fund'}`,
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

  // Create a price for recurring donations
  static async createPrice(amount, currency = 'usd', interval = 'month', metadata = {}) {
    try {
      const price = await stripe.prices.create({
        unit_amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        recurring: { interval },
        product_data: {
          name: 'Gifted Giving Donation',
          description: 'Recurring donation to support children in need',
          metadata: {
            ...metadata,
            type: 'donation_product'
          }
        },
      });

      return price;
    } catch (error) {
      console.error('Stripe price creation error:', error);
      throw new Error('Failed to create price');
    }
  }

  // Process webhook events
  static async processWebhook(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          return await this.handlePaymentSuccess(event.data.object);
        
        case 'payment_intent.payment_failed':
          return await this.handlePaymentFailure(event.data.object);
        
        case 'invoice.payment_succeeded':
          return await this.handleSubscriptionPayment(event.data.object);
        
        case 'invoice.payment_failed':
          return await this.handleSubscriptionFailure(event.data.object);
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
          return { status: 'ignored' };
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  // Handle successful payment
  static async handlePaymentSuccess(paymentIntent) {
    try {
      console.log(`Processing successful payment: ${paymentIntent.id}`);
      console.log(`Payment amount: ${paymentIntent.amount / 100} ${paymentIntent.currency}`);
      console.log(`Payment method: ${paymentIntent.payment_method_types.join(', ')}`);
      
      // Update donation status in database
      const Donation = require('../models/Donation');
      
      const donation = await Donation.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { 
          paymentStatus: 'completed',
          transactionId: paymentIntent.id,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (donation) {
        console.log(`✅ Payment completed for donation: ${donation._id}`);
        console.log(`💰 Amount: ${donation.amount} ${donation.currency}`);
        
        // TODO: Send confirmation email
        // TODO: Update program statistics
        // TODO: Send notification to admin
      } else {
        console.warn(`⚠️ No donation found for payment intent: ${paymentIntent.id}`);
      }

      return { status: 'success', donation, paymentIntent };
    } catch (error) {
      console.error('❌ Payment success handling error:', error);
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
      // Handle recurring donation payment
      console.log(`Subscription payment received: ${invoice.subscription}`);
      return { status: 'success', subscription: invoice.subscription };
    } catch (error) {
      console.error('Subscription payment handling error:', error);
      throw error;
    }
  }

  // Handle subscription failure
  static async handleSubscriptionFailure(invoice) {
    try {
      console.log(`Subscription payment failed: ${invoice.subscription}`);
      return { status: 'failed', subscription: invoice.subscription };
    } catch (error) {
      console.error('Subscription failure handling error:', error);
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