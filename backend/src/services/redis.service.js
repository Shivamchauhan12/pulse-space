const Redis = require('ioredis');
const config = require('../config');
const logger = require('../config/logger');

class RedisService {
  constructor() {
    this.useFallback = false;
    this.fallbackStore = new Map();

    try {
      this.client = new Redis(config.redisUri, {
        maxRetriesPerRequest: 1,
        retryStrategy() {
          return null; // Don't hang if Redis isn't running locally
        }
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected successfully');
        this.useFallback = false;
      });

      this.client.on('error', (err) => {
        if (!this.useFallback) {
          logger.warn(`Redis unavailable (${err.message}). Falling back to in-memory store.`);
          this.useFallback = true;
        }
      });
    } catch (e) {
      this.useFallback = true;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    if (this.useFallback) {
      this.fallbackStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
      return 'OK';
    }
    try {
      return await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (e) {
      this.fallbackStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
      return 'OK';
    }
  }

  async get(key) {
    if (this.useFallback) {
      const item = this.fallbackStore.get(key);
      if (!item) return null;
      if (Date.now() > item.expiresAt) {
        this.fallbackStore.delete(key);
        return null;
      }
      return item.value;
    }
    try {
      const val = await this.client.get(key);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      const item = this.fallbackStore.get(key);
      return item ? item.value : null;
    }
  }

  async del(key) {
    if (this.useFallback) {
      this.fallbackStore.delete(key);
      return 1;
    }
    try {
      return await this.client.del(key);
    } catch (e) {
      this.fallbackStore.delete(key);
      return 1;
    }
  }
}

module.exports = new RedisService();
