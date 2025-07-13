const mongoose = require('mongoose');
const Donation = require('./models/Donation');
const Program = require('./models/Program');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

const sampleDonations = [
  {
    amount: 100,
    currency: 'USD',
    paymentMethod: 'stripe',
    paymentStatus: 'completed',
    anonymous: false,
    message: 'Happy to support education!',
    recurring: { isRecurring: false, frequency: 'monthly' },
    designation: 'general',
    impact: {
      childrenHelped: 1,
      mealsProvided: 0,
      schoolSupplies: 1,
      medicalCheckups: 0
    },
    createdAt: new Date('2024-01-15')
  },
  {
    amount: 250,
    currency: 'USD',
    paymentMethod: 'paypal',
    paymentStatus: 'completed',
    anonymous: true,
    message: 'Keep up the great work!',
    recurring: { isRecurring: true, frequency: 'monthly' },
    designation: 'specific',
    impact: {
      childrenHelped: 2,
      mealsProvided: 0,
      schoolSupplies: 2,
      medicalCheckups: 0
    },
    createdAt: new Date('2024-02-20')
  },
  {
    amount: 500,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'completed',
    anonymous: false,
    message: 'Supporting health initiatives',
    recurring: { isRecurring: false, frequency: 'monthly' },
    designation: 'specific',
    impact: {
      childrenHelped: 5,
      mealsProvided: 0,
      schoolSupplies: 0,
      medicalCheckups: 5
    },
    createdAt: new Date('2024-03-10')
  },
  {
    amount: 75,
    currency: 'USD',
    paymentMethod: 'stripe',
    paymentStatus: 'completed',
    anonymous: false,
    message: 'For nutrition programs',
    recurring: { isRecurring: true, frequency: 'monthly' },
    designation: 'specific',
    impact: {
      childrenHelped: 1,
      mealsProvided: 30,
      schoolSupplies: 0,
      medicalCheckups: 0
    },
    createdAt: new Date('2024-04-05')
  },
  {
    amount: 300,
    currency: 'USD',
    paymentMethod: 'check',
    paymentStatus: 'pending',
    anonymous: false,
    message: 'Education is key',
    recurring: { isRecurring: false, frequency: 'monthly' },
    designation: 'general',
    impact: {
      childrenHelped: 3,
      mealsProvided: 0,
      schoolSupplies: 3,
      medicalCheckups: 0
    },
    createdAt: new Date('2024-05-12')
  },
  {
    amount: 150,
    currency: 'USD',
    paymentMethod: 'stripe',
    paymentStatus: 'completed',
    anonymous: true,
    message: 'Supporting children in need',
    recurring: { isRecurring: false, frequency: 'monthly' },
    designation: 'general',
    impact: {
      childrenHelped: 2,
      mealsProvided: 0,
      schoolSupplies: 2,
      medicalCheckups: 0
    },
    createdAt: new Date('2024-06-01')
  },
  {
    amount: 400,
    currency: 'USD',
    paymentMethod: 'paypal',
    paymentStatus: 'completed',
    anonymous: false,
    message: 'Health and nutrition support',
    recurring: { isRecurring: true, frequency: 'quarterly' },
    designation: 'specific',
    impact: {
      childrenHelped: 4,
      mealsProvided: 60,
      schoolSupplies: 0,
      medicalCheckups: 2
    },
    createdAt: new Date('2024-06-15')
  },
  {
    amount: 50,
    currency: 'USD',
    paymentMethod: 'stripe',
    paymentStatus: 'failed',
    anonymous: false,
    message: 'Small contribution',
    recurring: { isRecurring: false, frequency: 'monthly' },
    designation: 'general',
    impact: {
      childrenHelped: 1,
      mealsProvided: 0,
      schoolSupplies: 1,
      medicalCheckups: 0
    },
    createdAt: new Date('2024-06-20')
  },
  {
    amount: 200,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'completed',
    anonymous: false,
    message: 'Education for all',
    recurring: { isRecurring: false, frequency: 'monthly' },
    designation: 'specific',
    impact: {
      childrenHelped: 2,
      mealsProvided: 0,
      schoolSupplies: 2,
      medicalCheckups: 0
    },
    createdAt: new Date('2024-07-01')
  },
  {
    amount: 350,
    currency: 'USD',
    paymentMethod: 'stripe',
    paymentStatus: 'completed',
    anonymous: true,
    message: 'Supporting the cause',
    recurring: { isRecurring: true, frequency: 'monthly' },
    designation: 'general',
    impact: {
      childrenHelped: 3,
      mealsProvided: 30,
      schoolSupplies: 1,
      medicalCheckups: 1
    },
    createdAt: new Date('2024-07-10')
  }
];

async function seedDonations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('Admin user not found. Please run seed-programs.js first.');
      process.exit(1);
    }

    // Get programs
    const programs = await Program.find();
    if (programs.length === 0) {
      console.error('No programs found. Please run seed-programs.js first.');
      process.exit(1);
    }

    // Clear existing donations
    await Donation.deleteMany({});
    console.log('Cleared existing donations');

    // Create sample donations
    const donations = sampleDonations.map((donation, index) => {
      const donationData = {
        ...donation,
        program: programs[index % programs.length]._id // Distribute across programs
      };
      
      // For anonymous donations, ensure anonymous is true and don't set donor
      if (donation.anonymous) {
        donationData.anonymous = true;
        // Don't set donor field for anonymous donations
      } else {
        // For non-anonymous donations, set donor and ensure anonymous is false
        donationData.donor = adminUser._id;
        donationData.anonymous = false;
      }
      
      return donationData;
    });

    await Donation.insertMany(donations);
    console.log(`Created ${donations.length} sample donations`);

    // Display donation stats
    const stats = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedDonations: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, '$amount', 0] }
          },
          pendingDonations: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          },
          failedDonations: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);

    console.log('\nDonation Statistics:');
    console.log(`Total Donations: ${stats[0]?.totalDonations || 0}`);
    console.log(`Total Amount: $${stats[0]?.totalAmount || 0}`);
    console.log(`Completed Donations: ${stats[0]?.completedDonations || 0}`);
    console.log(`Completed Amount: $${stats[0]?.completedAmount || 0}`);
    console.log(`Pending Donations: ${stats[0]?.pendingDonations || 0}`);
    console.log(`Failed Donations: ${stats[0]?.failedDonations || 0}`);

    console.log('\nSample donations created successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding donations:', error);
    process.exit(1);
  }
}

seedDonations(); 