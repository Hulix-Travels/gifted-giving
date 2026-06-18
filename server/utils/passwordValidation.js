const { body } = require('express-validator');

const PASSWORD_RULES = body('password')
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be 8–128 characters long')
  .matches(/[A-Za-z]/)
  .withMessage('Password must contain at least one letter')
  .matches(/\d/)
  .withMessage('Password must contain at least one number');

module.exports = { PASSWORD_RULES };
