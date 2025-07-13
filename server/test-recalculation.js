const mongoose = require('mongoose');
const Program = require('./models/Program');
const Donation = require('./models/Donation');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gifted-giving', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testRecalculation() {
  try {
    console.log('🔍 Testing program current amount recalculation...\n');

    // Get all programs
    const programs = await Program.find();
    console.log(`Found ${programs.length} programs\n`);

    // Show current amounts
    console.log('📊 Current program amounts:');
    for (const program of programs) {
      console.log(`  ${program.name}: $${program.currentAmount || 0}`);
    }
    console.log('');

    // Calculate expected amounts from donations
    console.log('🧮 Calculating expected amounts from completed donations...');
    for (const program of programs) {
      const totalDonations = await Donation.aggregate([
        {
          $match: {
            program: program._id,
            paymentStatus: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);
      
      const expectedAmount = totalDonations[0]?.totalAmount || 0;
      const currentAmount = program.currentAmount || 0;
      
      console.log(`  ${program.name}:`);
      console.log(`    Current: $${currentAmount}`);
      console.log(`    Expected: $${expectedAmount}`);
      console.log(`    Difference: $${expectedAmount - currentAmount}`);
      console.log('');
    }

    // Run recalculation
    console.log('🔄 Running recalculation...');
    const result = await Program.recalculateCurrentAmounts();
    
    console.log(`✅ Recalculation completed!`);
    console.log(`   Updated ${result.updatedPrograms} programs`);
    
    if (result.details.length > 0) {
      console.log('\n📋 Details:');
      result.details.forEach(detail => {
        console.log(`  ${detail.programName}: $${detail.previousAmount} → $${detail.newAmount} (${detail.difference > 0 ? '+' : ''}$${detail.difference})`);
      });
    }

    // Show final amounts
    console.log('\n📊 Final program amounts:');
    const updatedPrograms = await Program.find();
    for (const program of updatedPrograms) {
      console.log(`  ${program.name}: $${program.currentAmount || 0}`);
    }

  } catch (error) {
    console.error('❌ Error during recalculation test:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testRecalculation(); 