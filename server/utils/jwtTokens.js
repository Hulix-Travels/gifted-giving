const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('./jwtSecret');

const ACCESS_TOKEN_TTL = '7d';

function generateAccessToken(user) {
  const userId = user._id || user.id;
  return jwt.sign(
    { userId, tv: user.tokenVersion ?? 0 },
    getJwtSecret(),
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

function isTokenSessionValid(user, decoded) {
  const expected = user.tokenVersion ?? 0;
  const tokenVersion = decoded.tv ?? 0;
  return tokenVersion === expected;
}

module.exports = {
  generateAccessToken,
  isTokenSessionValid,
  ACCESS_TOKEN_TTL
};
