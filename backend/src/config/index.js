const dotenv = require('dotenv');
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pulsespace',
  redisUri: process.env.REDIS_URI || 'redis://127.0.0.1:6379',
  jwtSecret: process.env.JWT_SECRET || 'pulsespace_jwt_secret_key_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'pulsespace_jwt_refresh_secret_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

module.exports = config;
