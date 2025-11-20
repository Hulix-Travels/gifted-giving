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

  // Handle successful payment
  static async handlePaymentSuccess(paymentIntent) {
    try {
      console.log(`💰 Processing successful payment: ${paymentIntent.id}`);
      console.log(`💵 Payment amount: ${paymentIntent.amount / 100} ${paymentIntent.currency}`);
      console.log(`💳 Payment method: ${paymentIntent.payment_method_types.join(', ')}`);
      console.log(`📝 Payment metadata:`, paymentIntent.metadata);
      
      // Update donation status in database
      const Donation = require('../models/Donation');
      const Program = require('../models/Program');
      
      console.log(`🔍 Looking for donation with payment intent ID: ${paymentIntent.id}`);
      
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
        console.log(`📊 Program ID: ${donation.program}`);
        
        // Update program current amount and impact metrics
        const program = await Program.findById(donation.program);
        if (program && program.impactPerDollar) {
          // Calculate impact based on donation amount and impact per dollar
          const impact = program.impactPerDollar;
          const children = Math.floor(donation.amount * (impact.children || 0));
          const communities = Math.floor(donation.amount * (impact.communities || 0));
          const schools = Math.floor(donation.amount * (impact.schools || 0));
          const meals = Math.floor(donation.amount * (impact.meals || 0));
          const checkups = Math.floor(donation.amount * (impact.checkups || 0));
          
          const programUpdate = await Program.findByIdAndUpdate(donation.program, {
            $inc: { 
              currentAmount: donation.amount,
              'impactMetrics.childrenHelped': children,
              'impactMetrics.communitiesReached': communities,
              'impactMetrics.schoolsBuilt': schools,
              'impactMetrics.mealsProvided': meals,
              'impactMetrics.medicalCheckups': checkups
            }
          }, { new: true });
          
          console.log(`✅ Updated program current amount and impact metrics for donation ${donation._id}`);
          console.log(`📈 Program current amount: ${programUpdate?.currentAmount || 'Unknown'}`);
          console.log(`👥 Impact added: ${children} children, ${communities} communities, ${schools} schools, ${meals} meals, ${checkups} checkups`);
        } else {
          // Just update current amount if no impact per dollar data
          const programUpdate = await Program.findByIdAndUpdate(donation.program, {
            $inc: { currentAmount: donation.amount }
          }, { new: true });
          
          console.log(`✅ Updated program current amount for donation ${donation._id}`);
          console.log(`📈 Program current amount: ${programUpdate?.currentAmount || 'Unknown'}`);
        }
        
        // TODO: Send confirmation email
        // TODO: Send notification to admin
      } else {
        console.warn(`⚠️ No donation found for payment intent: ${paymentIntent.id}`);
        console.warn(`🔍 Searched for stripePaymentIntentId: ${paymentIntent.id}`);
        
        // Let's also try to find by metadata
        if (paymentIntent.metadata && paymentIntent.metadata.donationId) {
          console.log(`🔍 Trying to find donation by metadata ID: ${paymentIntent.metadata.donationId}`);
          const donationByMetadata = await Donation.findById(paymentIntent.metadata.donationId);
          if (donationByMetadata) {
            console.log(`✅ Found donation by metadata: ${donationByMetadata._id}`);
            // Update this donation
            donationByMetadata.paymentStatus = 'completed';
            donationByMetadata.transactionId = paymentIntent.id;
            donationByMetadata.updatedAt = new Date();
            await donationByMetadata.save();
            
            // Update program current amount and impact metrics
            const program = await Program.findById(donationByMetadata.program);
            if (program && program.impactPerDollar) {
              // Calculate impact based on donation amount and impact per dollar
              const impact = program.impactPerDollar;
              const children = Math.floor(donationByMetadata.amount * (impact.children || 0));
              const communities = Math.floor(donationByMetadata.amount * (impact.communities || 0));
              const schools = Math.floor(donationByMetadata.amount * (impact.schools || 0));
              const meals = Math.floor(donationByMetadata.amount * (impact.meals || 0));
              const checkups = Math.floor(donationByMetadata.amount * (impact.checkups || 0));
              
              await Program.findByIdAndUpdate(donationByMetadata.program, {
                $inc: { 
                  currentAmount: donationByMetadata.amount,
                  'impactMetrics.childrenHelped': children,
                  'impactMetrics.communitiesReached': communities,
                  'impactMetrics.schoolsBuilt': schools,
                  'impactMetrics.mealsProvided': meals,
                  'impactMetrics.medicalCheckups': checkups
                }
              });
              
              console.log(`✅ Updated program metrics via metadata: ${children} children, ${communities} communities, ${schools} schools, ${meals} meals, ${checkups} checkups`);
            } else {
              // Just update current amount if no impact per dollar data
              await Program.findByIdAndUpdate(donationByMetadata.program, {
                $inc: { currentAmount: donationByMetadata.amount }
              });
            }
            
            console.log(`✅ Updated donation via metadata: ${donationByMetadata._id}`);
            return { status: 'success', donation: donationByMetadata, paymentIntent };
          }
        }
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
      const Program = require('../models/Program');
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
      
      // Check if this is the first payment (original donation status is pending)
      const isFirstPayment = originalDonation.paymentStatus === 'pending';
      
      if (isFirstPayment) {
        // Update the original donation record as completed
        originalDonation.paymentStatus = 'completed';
        originalDonation.transactionId = invoice.payment_intent;
        originalDonation.stripePaymentIntentId = invoice.payment_intent;
        originalDonation.recurring.totalPayments = 1;
        originalDonation.recurring.nextPaymentDate = this.calculateNextPaymentDate(originalDonation.recurring.frequency);
        await originalDonation.save();
        console.log(`✅ Updated original donation to completed: ${originalDonation._id}`);
        
        // Update program current amount and impact metrics for first payment
        const program = await Program.findById(originalDonation.program);
        if (program && program.impactPerDollar) {
          const impact = program.impactPerDollar;
          const amount = originalDonation.amount;
          const children = Math.floor(amount * (impact.children || 0));
          const communities = Math.floor(amount * (impact.communities || 0));
          const schools = Math.floor(amount * (impact.schools || 0));
          const meals = Math.floor(amount * (impact.meals || 0));
          const checkups = Math.floor(amount * (impact.checkups || 0));
          
          await Program.findByIdAndUpdate(originalDonation.program, {
            $inc: { 
              currentAmount: amount,
              'impactMetrics.childrenHelped': children,
              'impactMetrics.communitiesReached': communities,
              'impactMetrics.schoolsBuilt': schools,
              'impactMetrics.mealsProvided': meals,
              'impactMetrics.medicalCheckups': checkups
            }
          });
          
          console.log(`✅ Updated program metrics for first payment`);
        } else {
          await Program.findByIdAndUpdate(originalDonation.program, {
            $inc: { currentAmount: originalDonation.amount }
          });
        }
        
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
      
      // Update the original donation's total payments count
      originalDonation.recurring.totalPayments = (originalDonation.recurring.totalPayments || 0) + 1;
      originalDonation.recurring.nextPaymentDate = this.calculateNextPaymentDate(originalDonation.recurring.frequency);
      await originalDonation.save();
      
      // Update program current amount and impact metrics
      const program = await Program.findById(originalDonation.program);
      if (program && program.impactPerDollar) {
        const impact = program.impactPerDollar;
        const amount = newDonation.amount;
        const children = Math.floor(amount * (impact.children || 0));
        const communities = Math.floor(amount * (impact.communities || 0));
        const schools = Math.floor(amount * (impact.schools || 0));
        const meals = Math.floor(amount * (impact.meals || 0));
        const checkups = Math.floor(amount * (impact.checkups || 0));
        
        await Program.findByIdAndUpdate(originalDonation.program, {
          $inc: { 
            currentAmount: amount,
            'impactMetrics.childrenHelped': children,
            'impactMetrics.communitiesReached': communities,
            'impactMetrics.schoolsBuilt': schools,
            'impactMetrics.mealsProvided': meals,
            'impactMetrics.medicalCheckups': checkups
          }
        });
        
        console.log(`✅ Updated program metrics: ${children} children, ${communities} communities, etc.`);
      } else {
        await Program.findByIdAndUpdate(originalDonation.program, {
          $inc: { currentAmount: newDonation.amount }
        });
      }
      
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
      // First, retrieve the subscription to check its status
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Check if subscription is already canceled
      if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
        console.log(`Subscription ${subscriptionId} is already canceled (status: ${subscription.status})`);
        // Return the existing subscription - it's already canceled
        return subscription;
      }
      
      // If subscription is already set to cancel at period end and we're not canceling immediately
      if (subscription.cancel_at_period_end && !cancelImmediately) {
        console.log(`Subscription ${subscriptionId} is already set to cancel at period end`);
        return subscription;
      }
      
      // Update subscription to cancel
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !cancelImmediately
      });
      
      // If canceling immediately, also cancel it
      if (cancelImmediately) {
        await stripe.subscriptions.cancel(subscriptionId);
        // Retrieve the canceled subscription
        return await stripe.subscriptions.retrieve(subscriptionId);
      }
      
      return updatedSubscription;
    } catch (error) {
      // Check if error is due to subscription already being canceled
      if (error.type === 'StripeInvalidRequestError' && 
          error.message && 
          error.message.includes('canceled subscription')) {
        console.log(`Subscription ${subscriptionId} is already canceled`);
        // Try to retrieve the subscription to return it
        try {
          return await stripe.subscriptions.retrieve(subscriptionId);
        } catch (retrieveError) {
          throw new Error('Subscription is already canceled and cannot be retrieved');
        }
      }
      console.error('Error canceling subscription:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  // Modify subscription (change amount or frequency)
  static async modifySubscription(subscriptionId, newAmount, newFrequency) {
    try {
      // First, retrieve the subscription to check its status
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Check if subscription is already canceled
      if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
        console.log(`Cannot modify subscription ${subscriptionId} - it is already canceled (status: ${subscription.status})`);
        throw new Error(`Cannot modify subscription: subscription is already canceled (status: ${subscription.status})`);
      }
      
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
        proration_behavior: 'create_prorations', // Prorate the change
        metadata: {
          ...subscription.metadata,
          frequency: newFrequency,
          amount: newAmount.toString()
        }
      });
      
      return updatedSubscription;
    } catch (error) {
      // Check if error is due to subscription already being canceled
      if (error.type === 'StripeInvalidRequestError' && 
          error.message && 
          error.message.includes('canceled subscription')) {
        console.log(`Cannot modify subscription ${subscriptionId} - it is already canceled`);
        throw new Error('Cannot modify subscription: subscription is already canceled');
      }
      
      // If it's our own error (from the status check), re-throw it
      if (error.message && error.message.includes('Cannot modify subscription')) {
        throw error;
      }
      
      console.error('Error modifying subscription:', error);
      throw new Error(`Failed to modify subscription: ${error.message}`);
    }
  }

  // Reactivate a canceled subscription
  static async reactivateSubscription(subscriptionId) {
    try {
      // First, retrieve the subscription to check its status
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Check if subscription is already fully canceled (cannot be reactivated)
      if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
        console.log(`Cannot reactivate subscription ${subscriptionId} - it is already canceled (status: ${subscription.status})`);
        throw new Error(`Cannot reactivate subscription: subscription is already canceled (status: ${subscription.status}). Canceled subscriptions cannot be reactivated.`);
      }
      
      // If subscription is not set to cancel at period end, it's already active
      if (!subscription.cancel_at_period_end) {
        console.log(`Subscription ${subscriptionId} is already active`);
        return subscription;
      }
      
      // Reactivate the subscription
      const reactivatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });
      
      return reactivatedSubscription;
    } catch (error) {
      // Check if error is due to subscription already being canceled
      if (error.type === 'StripeInvalidRequestError' && 
          error.message && 
          error.message.includes('canceled subscription')) {
        console.log(`Cannot reactivate subscription ${subscriptionId} - it is already canceled`);
        throw new Error('Cannot reactivate subscription: subscription is already canceled. Canceled subscriptions cannot be reactivated.');
      }
      
      // If it's our own error (from the status check), re-throw it
      if (error.message && error.message.includes('Cannot reactivate subscription')) {
        throw error;
      }
      
      console.error('Error reactivating subscription:', error);
      throw new Error(`Failed to reactivate subscription: ${error.message}`);
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