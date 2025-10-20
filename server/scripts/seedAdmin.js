const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../config.env' });

const User = require('../models/User');

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

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin user seeding...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      console.log('   If you want to create a new admin, delete the existing one first.');
      return;
    }
    
    // Admin user data
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@giftedgivings.com',
      password: 'Admin123!', // Change this to a secure password
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
    console.log('🔑 Password:', adminData.password);
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    
    // Create admin user
    const admin = new User(adminData);
    await admin.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📋 Admin Details:');
    console.log('   ID:', admin._id);
    console.log('   Name:', admin.fullName);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Created:', admin.createdAt);
    
    console.log('\n🔐 Login Credentials:');
    console.log('   Email: admin@giftedgivings.com');
    console.log('   Password: Admin123!');
    console.log('\n⚠️  SECURITY WARNING:');
    console.log('   1. Change the password immediately after first login');
    console.log('   2. Update the email to your actual admin email');
    console.log('   3. Consider enabling 2FA for additional security');
    
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
    const email = await question('Email (default: admin@giftedgivings.com): ') || 'admin@giftedgivings.com';
    const password = await question('Password (default: Admin123!): ') || 'Admin123!';
    const phone = await question('Phone (optional): ') || '';
    
    rl.close();
    
    // Check if admin with this email already exists
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
    
  } catch (error) {
    console.error('❌ Error creating custom admin:', error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    
    // Check command line arguments
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

// Handle command line arguments
if (require.main === module) {
  main();
}

module.exports = { seedAdmin, createCustomAdmin };
