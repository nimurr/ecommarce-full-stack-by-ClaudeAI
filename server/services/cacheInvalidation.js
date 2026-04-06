import cacheService from './cache.js';

// Cache invalidation helpers
export const invalidateCache = {
  // Products cache
  products: async () => {
    await cacheService.invalidatePattern('/api/products*');
    await cacheService.invalidatePattern('/api/categories*');
    console.log('🗑️  Products cache invalidated');
  },

  // Orders cache
  orders: async () => {
    await cacheService.invalidatePattern('/api/orders*');
    await cacheService.invalidatePattern('/api/dashboard*');
    console.log('🗑️  Orders cache invalidated');
  },

  // Users cache
  users: async () => {
    await cacheService.invalidatePattern('/api/users*');
    console.log('🗑️  Users cache invalidated');
  },

  // Reviews cache
  reviews: async () => {
    await cacheService.invalidatePattern('/api/reviews*');
    await cacheService.invalidatePattern('/api/products*');
    console.log('🗑️  Reviews cache invalidated');
  },

  // Settings cache
  settings: async () => {
    await cacheService.invalidatePattern('/api/settings*');
    console.log('🗑️  Settings cache invalidated');
  },

  // Dashboard cache
  dashboard: async () => {
    await cacheService.invalidatePattern('/api/dashboard*');
    console.log('🗑️  Dashboard cache invalidated');
  },

  // All cache
  all: async () => {
    await cacheService.flush();
    console.log('🗑️  All cache invalidated');
  },
};

export default invalidateCache;
