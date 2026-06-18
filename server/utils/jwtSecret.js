/**
 * Returns JWT secret from environment. In production, missing JWT_SECRET is fatal.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }

  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  JWT_SECRET is not set. Using insecure development-only fallback.');
  }

  return 'dev-only-insecure-secret-do-not-use-in-production';
}

module.exports = { getJwtSecret };
