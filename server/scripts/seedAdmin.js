const mongoose = require('mongoose');
require('dotenv').config({ path: '../config.env' });

const User = require('../models/User');

const DEFAULT_ADMIN_EMAIL = 'admin@giftedgivings.com';

async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gifted-giving';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

function resolveSeedPassword() {
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (password) {
    return password;
  }
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ ADMIN_SEED_PASSWORD is required in production.');
    process.exit(1);
  }
  console.warn('⚠️  ADMIN_SEED_PASSWORD not set — using a development default. Change it after first login.');
  return 'Admin123!';
}

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin user seeding...');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      console.log('   If you want to create a new admin, delete the existing one first.');
      return;
    }

    const password = resolveSeedPassword();
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: DEFAULT_ADMIN_EMAIL,
      password,
      role: 'admin',
      isEmailVerified: true,
      phone: '+1234567890',
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '12345',
        country: 'USA'
      },
      preferences: {
        newsletter: true,
        emailNotifications: true,
        smsNotifications: false
      }
    };

    console.log('👤 Creating admin user...');
    console.log('📧 Email:', adminData.email);

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('📋 Admin Details:');
    console.log('   ID:', admin._id);
    console.log('   Name:', admin.fullName);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Created:', admin.createdAt);
    console.log('\n🔐 Password was set from ADMIN_SEED_PASSWORD (never logged).');
    console.log('⚠️  Change the password immediately after first login.');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

async function createCustomAdmin() {
  try {
    console.log('\n🎯 Create Custom Admin User');
    console.log('Enter admin details (or press Enter for defaults):');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

    const firstName = await question('First Name (default: Admin): ') || 'Admin';
    const lastName = await question('Last Name (default: User): ') || 'User';
    const email = await question(`Email (default: ${DEFAULT_ADMIN_EMAIL}): `) || DEFAULT_ADMIN_EMAIL;
    const password = await question('Password (leave blank to use ADMIN_SEED_PASSWORD): ') || resolveSeedPassword();
    const phone = await question('Phone (optional): ') || '';

    rl.close();

    const existingAdmin = await User.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log('❌ User with this email already exists:', email);
      return;
    }

    const adminData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: 'admin',
      isEmailVerified: true,
      phone,
      preferences: {
        newsletter: true,
        emailNotifications: true,
        smsNotifications: false
      }
    };

    console.log('\n👤 Creating custom admin user...');
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Custom admin user created successfully!');
    console.log('📋 Admin Details:');
    console.log('   Name:', admin.fullName);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('⚠️  Password was not logged. Change it after first login.');
  } catch (error) {
    console.error('❌ Error creating custom admin:', error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();

    const args = process.argv.slice(2);

    if (args.includes('--custom')) {
      await createCustomAdmin();
    } else {
      await seedAdmin();
    }

    console.log('\n✅ Admin seeding completed successfully');
  } catch (error) {
    console.error('❌ Admin seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedAdmin, createCustomAdmin };
