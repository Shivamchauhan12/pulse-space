const jwt = require('jsonwebtoken');
const config = require('../config');
const redisService = require('../services/redis.service');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, token missing' });
  }

  try {
    // Check if token is blacklisted in Redis
    const isBlacklisted = await redisService.get(`bl_${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, error: 'Token has been revoked/logged out' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Not authorized, token invalid or expired' });
  }
};

module.exports = { protect };
