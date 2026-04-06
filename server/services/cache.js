import Redis from 'ioredis';

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hour
  }

  // Initialize Redis connection
  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null; // Stop retrying after 3 attempts
          return Math.min(times * 50, 2000);
        },
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.warn('⚠️  Redis error:', err.message);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('🔌 Redis connection closed');
        this.isConnected = false;
      });

      // Test connection
      await this.client.ping();
    } catch (error) {
      console.warn('⚠️  Redis not available, using in-memory cache fallback');
      this.isConnected = false;
    }
  }

  // Get cached data
  async get(key) {
    try {
      if (!this.isConnected || !this.client) return null;
      
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache GET error:', error.message);
      return null;
    }
  }

  // Set cached data
  async set(key, data, ttl = this.defaultTTL) {
    try {
      if (!this.isConnected || !this.client) return false;
      
      await this.client.setex(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Cache SET error:', error.message);
      return false;
    }
  }

  // Delete cached data
  async del(key) {
    try {
      if (!this.isConnected || !this.client) return false;
      
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Cache DEL error:', error.message);
      return false;
    }
  }

  // Delete multiple keys by pattern
  async delPattern(pattern) {
    try {
      if (!this.isConnected || !this.client) return false;
      
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache DEL pattern error:', error.message);
      return false;
    }
  }

  // Flush all cache
  async flush() {
    try {
      if (!this.isConnected || !this.client) return false;
      
      await this.client.flushdb();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error.message);
      return false;
    }
  }

  // Cache middleware for Express routes
  middleware(ttl = this.defaultTTL) {
    return async (req, res, next) => {
      // Skip cache for non-GET requests
      if (req.method !== 'GET') return next();

      // Generate cache key from URL
      const key = `cache:${req.originalUrl}`;

      try {
        // Try to get from cache
        const cached = await this.get(key);
        if (cached) {
          return res.json(cached);
        }

        // Override res.json to cache the response
        const originalJson = res.json.bind(res);
        res.json = (body) => {
          // Only cache successful responses
          if (res.statusCode === 200) {
            this.set(key, body, ttl);
          }
          return originalJson(body);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error.message);
        next();
      }
    };
  }

  // Invalidate cache by pattern (e.g., 'cache:/api/products*')
  async invalidatePattern(pattern) {
    return this.delPattern(`cache:${pattern}*`);
  }
}

export default new CacheService();
