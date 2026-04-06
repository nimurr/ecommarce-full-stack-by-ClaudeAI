import mongoose from 'mongoose';

// Enable MongoDB query profiling for slow queries
mongoose.set('debug', (collection, method, query, doc) => {
  if (process.env.NODE_ENV === 'development') {
    // console.log(`📊 MongoDB: ${collection}.${method}`, JSON.stringify(query).substring(0, 200));
  }
});

// Connection pool optimization
const optimizeConnection = () => {
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected with optimized settings');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🔌 MongoDB disconnected');
  });
};

// Create indexes for frequently queried fields
const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    if (!db) {
      console.warn('⚠️  Database not ready for index creation');
      return;
    }

    console.log('🔍 Creating optimized indexes...');

    // Products indexes
    await db.collection('products').createIndex({ slug: 1 }, { unique: true });
    await db.collection('products').createIndex({ active: 1, category: 1 });
    await db.collection('products').createIndex({ active: 1, featured: 1 });
    await db.collection('products').createIndex({ active: 1, createdAt: -1 });
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    await db.collection('products').createIndex({ category: 1, price: 1 });
    await db.collection('products').createIndex({ brand: 1, active: 1 });

    // Orders indexes
    await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    await db.collection('orders').createIndex({ user: 1, createdAt: -1 });
    await db.collection('orders').createIndex({ orderStatus: 1, createdAt: -1 });
    await db.collection('orders').createIndex({ paymentStatus: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });

    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });

    // Categories indexes
    await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
    await db.collection('categories').createIndex({ active: 1, parent: 1 });

    // Reviews indexes
    await db.collection('reviews').createIndex({ product: 1, approved: 1 });
    await db.collection('reviews').createIndex({ user: 1 });

    // Notifications indexes
    await db.collection('notifications').createIndex({ type: 1, isRead: 1, createdAt: -1 });

    console.log('✅ Indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

export { optimizeConnection, createIndexes };
