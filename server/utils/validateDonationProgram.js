const Program = require('../models/Program');

async function validateDonationProgram(programId) {
  const program = await Program.findById(programId);
  if (!program) {
    const error = new Error('Program not found');
    error.statusCode = 404;
    throw error;
  }
  if (program.status !== 'active') {
    const error = new Error('This program is not currently accepting donations');
    error.statusCode = 400;
    throw error;
  }
  return program;
}

module.exports = validateDonationProgram;
