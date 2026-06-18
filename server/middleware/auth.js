const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../utils/jwtSecret');
const { isTokenSessionValid } = require('../utils/jwtTokens');

async function resolveUserFromToken(token) {
  if (!token) {
    return { status: 401, message: 'No token, authorization denied' };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch {
    return { status: 401, message: 'Token is not valid' };
  }

  const user = await User.findById(decoded.userId).select('-password');
  if (!user) {
    return { status: 401, message: 'Token is not valid' };
  }

  if (!isTokenSessionValid(user, decoded)) {
    return { status: 401, message: 'Session expired. Please log in again.' };
  }

  return { user };
}

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const result = await resolveUserFromToken(token);

    if (result.user) {
      req.user = result.user;
      return next();
    }

    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return next();
    }

    const result = await resolveUserFromToken(token);
    if (result.user) {
      req.user = result.user;
    }

    next();
  } catch {
    next();
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const result = await resolveUserFromToken(token);

    if (!result.user) {
      return res.status(result.status).json({ message: result.message });
    }

    if (result.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    req.user = result.user;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { auth, optionalAuth, adminAuth, resolveUserFromToken };
