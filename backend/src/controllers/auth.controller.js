const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const redisService = require('../services/redis.service');
const { addNotificationJob } = require('../services/queue.service');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  const refreshToken = jwt.sign({ id: userId }, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiresIn });
  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token in Redis
    await redisService.set(`rf_${user._id}`, refreshToken, 7 * 24 * 3600);

    // Trigger async welcome notification job via BullMQ
    addNotificationJob('sendWelcomeEmail', { userId: user._id, email: user.email, name: user.name });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await redisService.set(`rf_${user._id}`, refreshToken, 7 * 24 * 3600);

    user.isOnline = true;
    user.lastActive = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Refresh token required' });
    }

    const decoded = jwt.verify(token, config.jwtRefreshSecret);
    const storedToken = await redisService.get(`rf_${decoded.id}`);

    if (!storedToken || storedToken !== token) {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
    }

    const newTokens = generateTokens(decoded.id);
    await redisService.set(`rf_${decoded.id}`, newTokens.refreshToken, 7 * 24 * 3600);

    res.json({
      success: true,
      data: newTokens
    });
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.token;
    if (token) {
      // Add current access token to Redis blacklist for remaining TTL (15 mins)
      await redisService.set(`bl_${token}`, 'true', 15 * 60);
    }
    await redisService.del(`rf_${req.user._id}`);

    await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastActive: new Date() });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};

module.exports = { register, login, refreshToken, logout, getMe };
