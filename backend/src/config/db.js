const mongoose = require('mongoose');
const config = require('./index');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    logger.warn(`MongoDB Connection Failed (${err.message}). Application running with fallback mode if enabled.`);
  }
};

module.exports = connectDB;
