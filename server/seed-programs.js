const mongoose = require('mongoose');
const Program = require('./models/Program');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

const samplePrograms = [
  {
    name: 'Education Fund',
    description: 'Sponsor school supplies, uniforms, and tuition for children who would otherwise go without an education.',
    longDescription: 'Our Education Fund program provides comprehensive support to children in need, ensuring they have access to quality education. This includes school supplies, uniforms, tuition fees, and additional educational resources. Our program has helped over 5,000 children attend school last year, with a 95% success rate in keeping children in school.',
    category: 'education',
    image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1523240794102-9c5fba122163?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
    ],
    targetAmount: 50000,
    currentAmount: 12500,
    currency: 'USD',
    impactMetrics: {
      childrenHelped: 5000,
      communitiesReached: 25,
      schoolsBuilt: 3,
      mealsProvided: 0,
      medicalCheckups: 0
    },
    location: {
      country: 'Kenya',
      region: 'Nairobi',
      city: 'Nairobi'
    },
    duration: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    },
    status: 'active',
    priority: 'high',
    tags: ['education', 'children', 'school', 'tuition'],
    featured: true,
    donationOptions: [
      {
        amount: 25,
        description: 'Monthly Education Support',
        impact: 'Provides school supplies for one child for a month'
      },
      {
        amount: 100,
        description: 'Quarterly Education Package',
        impact: 'Covers tuition and supplies for one child for three months'
      },
      {
        amount: 500,
        description: 'Annual Education Scholarship',
        impact: 'Provides full education support for one child for a year'
      }
    ]
  },
  {
    name: 'Health Kits Program',
    description: 'Provide medical checkups, vaccinations, and essential medicines to keep children healthy.',
    longDescription: 'Our Health Kits Program ensures that children in underserved communities have access to basic healthcare. Each health kit includes essential medicines, first aid supplies, and access to medical checkups. We work with local healthcare providers to deliver comprehensive care to children who would otherwise go without medical attention.',
    category: 'health',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
    ],
    targetAmount: 30000,
    currentAmount: 8500,
    currency: 'USD',
    impactMetrics: {
      childrenHelped: 2000,
      communitiesReached: 15,
      schoolsBuilt: 0,
      mealsProvided: 0,
      medicalCheckups: 2000
    },
    location: {
      country: 'Uganda',
      region: 'Kampala',
      city: 'Kampala'
    },
    duration: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    },
    status: 'active',
    priority: 'high',
    tags: ['health', 'medical', 'vaccination', 'checkup'],
    featured: true,
    donationOptions: [
      {
        amount: 50,
        description: 'Health Kit for One Child',
        impact: 'Provides complete health kit including medicines and checkup'
      },
      {
        amount: 200,
        description: 'Family Health Package',
        impact: 'Provides health kits for an entire family of four'
      },
      {
        amount: 1000,
        description: 'Community Health Initiative',
        impact: 'Funds health kits for an entire community of 20 children'
      }
    ]
  },
  {
    name: 'Nutrition Program',
    description: 'Deliver daily meals and nutrition education to combat childhood hunger and malnutrition.',
    longDescription: 'Our Nutrition Program addresses the critical issue of childhood hunger and malnutrition. We provide daily nutritious meals to children in need, along with nutrition education for families. The program includes meal planning, cooking classes, and ongoing support to ensure sustainable nutrition practices.',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
    ],
    targetAmount: 40000,
    currentAmount: 18200,
    currency: 'USD',
    impactMetrics: {
      childrenHelped: 3000,
      communitiesReached: 20,
      schoolsBuilt: 0,
      mealsProvided: 3000,
      medicalCheckups: 0
    },
    location: {
      country: 'Kenya',
      region: 'Mombasa',
      city: 'Mombasa'
    },
    duration: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    },
    status: 'active',
    priority: 'medium',
    tags: ['nutrition', 'meals', 'hunger', 'malnutrition'],
    featured: true,
    donationOptions: [
      {
        amount: 100,
        description: 'Monthly Nutrition Support',
        impact: 'Provides daily meals for one child for a month'
      },
      {
        amount: 300,
        description: 'Quarterly Nutrition Package',
        impact: 'Provides meals and nutrition education for three months'
      },
      {
        amount: 1200,
        description: 'Annual Nutrition Program',
        impact: 'Provides comprehensive nutrition support for one year'
      }
    ]
  }
];

async function seedPrograms() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create an admin user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@giftedgiving.org',
        password: 'admin123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('Created admin user');
    }

    // Clear existing programs
    await Program.deleteMany({});
    console.log('Cleared existing programs');

    // Create sample programs with slugs
    const programs = samplePrograms.map(program => ({
      ...program,
      slug: program.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      createdBy: adminUser._id
    }));

    await Program.insertMany(programs);
    console.log(`Created ${programs.length} sample programs`);

    // Display created programs
    const createdPrograms = await Program.find().populate('createdBy', 'firstName lastName');
    console.log('\nCreated programs:');
    createdPrograms.forEach(program => {
      console.log(`- ${program.name} (${program.category}) - $${program.currentAmount}/${program.targetAmount}`);
    });

    console.log('\nDatabase seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedPrograms(); 