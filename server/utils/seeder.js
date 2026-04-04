import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root
const result = dotenv.config({ path: path.join(__dirname, '../../.env') });

// Force reload of MONGODB_URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/electronics_ecommerce';

const sampleCategories = [
  { name: 'Smartphones', slug: 'smartphones', description: 'Latest smartphones from top brands', featured: true },
  { name: 'Laptops', slug: 'laptops', description: 'Powerful laptops for work and gaming', featured: true },
  { name: 'Audio', slug: 'audio', description: 'Headphones, earbuds, and speakers', featured: true },
  { name: 'Smartwatch', slug: 'smartwatch', description: 'Wearable technology and fitness trackers', featured: true },
  { name: 'Tablets', slug: 'tablets', description: 'Tablets and e-readers', featured: false },
  { name: 'Cameras', slug: 'cameras', description: 'Digital cameras and accessories', featured: false },
  { name: 'Gaming', slug: 'gaming', description: 'Gaming consoles and accessories', featured: true },
  { name: 'Accessories', slug: 'accessories', description: 'Chargers, cables, and more', featured: false },
];

const sampleProducts = [
  {
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    description: 'The ultimate iPhone with titanium design, A17 Pro chip, and advanced camera system.',
    shortDescription: 'Apple\'s flagship smartphone with titanium design',
    price: 159999,
    originalPrice: 179999,
    stock: 25,
    features: ['A17 Pro chip', '6.7" Super Retina XDR display', '48MP Main camera', 'Titanium design'],
    specifications: { 'Display': '6.7-inch', 'Storage': '256GB', 'RAM': '8GB', 'Battery': '4422 mAh' },
    warranty: '1 Year Apple Warranty',
    featured: true,
    rating: 4.8,
    numReviews: 124,
    mainImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop',
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    description: 'Premium Android smartphone with S Pen, AI features, and 200MP camera.',
    shortDescription: 'Samsung\'s most powerful smartphone',
    price: 149999,
    originalPrice: 169999,
    stock: 30,
    features: ['Snapdragon 8 Gen 3', '200MP camera', 'S Pen included', 'AI features'],
    specifications: { 'Display': '6.8-inch AMOLED', 'Storage': '512GB', 'RAM': '12GB', 'Battery': '5000 mAh' },
    warranty: '1 Year Samsung Warranty',
    featured: true,
    rating: 4.7,
    numReviews: 98,
    mainImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop',
  },
  {
    name: 'MacBook Pro 16" M3 Max',
    brand: 'Apple',
    description: 'Professional laptop with M3 Max chip, stunning Liquid Retina XDR display.',
    shortDescription: 'Most powerful MacBook Pro ever',
    price: 349999,
    originalPrice: 399999,
    stock: 15,
    features: ['M3 Max chip', '16" Liquid Retina XDR', '36GB RAM', '1TB SSD'],
    specifications: { 'Processor': 'M3 Max', 'RAM': '36GB', 'Storage': '1TB SSD', 'Display': '16.2"' },
    warranty: '1 Year Apple Warranty',
    featured: true,
    rating: 4.9,
    numReviews: 67,
    mainImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
  },
  {
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    description: 'Industry-leading noise canceling wireless headphones with exceptional sound quality.',
    shortDescription: 'Best-in-class noise canceling headphones',
    price: 34999,
    originalPrice: 39999,
    stock: 50,
    features: ['Industry-leading NC', '30-hour battery', 'LDAC audio', 'Multipoint connection'],
    specifications: { 'Type': 'Over-ear', 'Battery': '30 hours', 'Connectivity': 'Bluetooth 5.2', 'Weight': '250g' },
    warranty: '1 Year Sony Warranty',
    featured: true,
    rating: 4.8,
    numReviews: 234,
    mainImage: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&h=500&fit=crop',
  },
  {
    name: 'Apple Watch Series 9',
    brand: 'Apple',
    description: 'Advanced health and fitness companion with S9 chip and double tap gesture.',
    shortDescription: 'Most advanced Apple Watch',
    price: 49999,
    originalPrice: 54999,
    stock: 40,
    features: ['S9 chip', 'Double tap gesture', 'Blood oxygen sensor', 'ECG app'],
    specifications: { 'Display': '45mm Retina', 'Battery': '18 hours', 'Water Resistance': '50m', 'GPS': 'Yes' },
    warranty: '1 Year Apple Warranty',
    featured: true,
    rating: 4.7,
    numReviews: 156,
    mainImage: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&h=500&fit=crop',
  },
  {
    name: 'iPad Pro 12.9" M2',
    brand: 'Apple',
    description: 'Ultimate iPad experience with M2 chip and ProMotion display.',
    shortDescription: 'Most powerful iPad Pro',
    price: 129999,
    originalPrice: 149999,
    stock: 20,
    features: ['M2 chip', '12.9" Liquid Retina XDR', 'ProMotion', 'Apple Pencil support'],
    specifications: { 'Display': '12.9"', 'Processor': 'M2', 'Storage': '256GB', 'Connectivity': 'Wi-Fi 6E' },
    warranty: '1 Year Apple Warranty',
    featured: true,
    rating: 4.8,
    numReviews: 89,
    mainImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop',
  },
  {
    name: 'PlayStation 5',
    brand: 'Sony',
    description: 'Next-gen gaming console with ultra-high speed SSD and ray tracing.',
    shortDescription: 'Next-gen gaming console',
    price: 69999,
    originalPrice: 79999,
    stock: 10,
    features: ['Custom SSD', 'Ray tracing', '4K gaming', 'DualSense controller'],
    specifications: { 'CPU': 'AMD Zen 2', 'GPU': 'AMD RDNA 2', 'Storage': '825GB SSD', 'Resolution': 'Up to 8K' },
    warranty: '1 Year Sony Warranty',
    featured: true,
    rating: 4.9,
    numReviews: 312,
    mainImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&h=500&fit=crop',
  },
  {
    name: 'AirPods Pro 2nd Gen',
    brand: 'Apple',
    description: 'Active noise cancellation with adaptive transparency and personalized spatial audio.',
    shortDescription: 'Premium wireless earbuds',
    price: 24999,
    originalPrice: 27999,
    stock: 60,
    features: ['Active NC', 'Adaptive transparency', 'Spatial audio', 'MagSafe charging'],
    specifications: { 'Type': 'In-ear', 'Battery': '6 hours (30 with case)', 'Chip': 'H2', 'Water Resistance': 'IPX4' },
    warranty: '1 Year Apple Warranty',
    featured: true,
    rating: 4.7,
    numReviews: 278,
    mainImage: 'https://images.unsplash.com/photo-1603351154351-5cf99bc75467?w=500&h=500&fit=crop',
  },
  {
    name: 'Dell XPS 15',
    brand: 'Dell',
    description: 'Premium Windows laptop with stunning InfinityEdge display.',
    shortDescription: 'Premium Windows laptop',
    price: 189999,
    originalPrice: 219999,
    stock: 18,
    features: ['Intel i9 13th Gen', '15.6" OLED display', '32GB RAM', '1TB SSD'],
    specifications: { 'Processor': 'Intel i9-13900H', 'RAM': '32GB', 'Storage': '1TB SSD', 'Display': '15.6" OLED' },
    warranty: '1 Year Dell Warranty',
    featured: true,
    rating: 4.6,
    numReviews: 145,
    mainImage: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=500&h=500&fit=crop',
  },
  {
    name: 'Samsung Galaxy Tab S9',
    brand: 'Samsung',
    description: 'Premium Android tablet with S Pen and AMOLED display.',
    shortDescription: 'Premium Android tablet',
    price: 89999,
    originalPrice: 99999,
    stock: 25,
    features: ['Snapdragon 8 Gen 2', '11" AMOLED display', 'S Pen included', 'IP68 water resistant'],
    specifications: { 'Display': '11" AMOLED', 'Processor': 'Snapdragon 8 Gen 2', 'Storage': '256GB', 'Battery': '8400 mAh' },
    warranty: '1 Year Samsung Warranty',
    featured: false,
    rating: 4.6,
    numReviews: 78,
    mainImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop',
  },
  {
    name: 'Canon EOS R6 Mark II',
    brand: 'Canon',
    description: 'Professional mirrorless camera with advanced autofocus.',
    shortDescription: 'Professional mirrorless camera',
    price: 279999,
    originalPrice: 299999,
    stock: 8,
    features: ['24.2MP Full-Frame', '4K 60fps video', 'In-body stabilization', 'Dual pixel AF'],
    specifications: { 'Sensor': '24.2MP Full-Frame', 'Video': '4K 60fps', 'Mount': 'Canon RF', 'Weight': '588g' },
    warranty: '1 Year Canon Warranty',
    featured: false,
    rating: 4.8,
    numReviews: 56,
    mainImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop',
  },
  {
    name: 'JBL Flip 6',
    brand: 'JBL',
    description: 'Portable Bluetooth speaker with powerful sound and deep bass.',
    shortDescription: 'Portable Bluetooth speaker',
    price: 12999,
    originalPrice: 14999,
    stock: 100,
    features: ['IP67 waterproof', '12 hours battery', 'PartyBoost', 'Deep bass'],
    specifications: { 'Type': 'Portable', 'Battery': '12 hours', 'Connectivity': 'Bluetooth 5.1', 'Water Resistance': 'IP67' },
    warranty: '1 Year JBL Warranty',
    featured: false,
    rating: 4.5,
    numReviews: 189,
    mainImage: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'Admin',
      email: 'nimurnerob404@gmail.com',
      phone: '01708784404',
      password: 'nerob404A@',
      role: 'admin',
      verified: true,
    });
    console.log('   ✓ Admin created: nimurnerob404@gmail.com / nerob404A@');

    // Create sample user
    console.log('👤 Creating sample user...');
    const user = await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      phone: '01987654321',
      password: 'user123',
      role: 'user',
      verified: true,
    });
    console.log('   ✓ User created: user@example.com / user123');

    // Create categories
    console.log('📁 Creating categories...');
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`   ✓ Created ${createdCategories.length} categories`);

    // Map categories to products
    const categoryMap = {
      'Smartphones': createdCategories.find(c => c.name === 'Smartphones')._id,
      'Laptops': createdCategories.find(c => c.name === 'Laptops')._id,
      'Audio': createdCategories.find(c => c.name === 'Audio')._id,
      'Smartwatch': createdCategories.find(c => c.name === 'Smartwatch')._id,
      'Tablets': createdCategories.find(c => c.name === 'Tablets')._id,
      'Gaming': createdCategories.find(c => c.name === 'Gaming')._id,
      'Cameras': createdCategories.find(c => c.name === 'Cameras')._id,
    };

    // Assign categories to products
    sampleProducts[0].category = categoryMap['Smartphones']; // iPhone
    sampleProducts[1].category = categoryMap['Smartphones']; // Samsung
    sampleProducts[2].category = categoryMap['Laptops']; // MacBook
    sampleProducts[3].category = categoryMap['Audio']; // Sony Headphones
    sampleProducts[4].category = categoryMap['Smartwatch']; // Apple Watch
    sampleProducts[5].category = categoryMap['Tablets']; // iPad
    sampleProducts[6].category = categoryMap['Gaming']; // PS5
    sampleProducts[7].category = categoryMap['Audio']; // AirPods
    sampleProducts[8].category = categoryMap['Laptops']; // Dell XPS
    sampleProducts[9].category = categoryMap['Tablets']; // Samsung Tab
    sampleProducts[10].category = categoryMap['Cameras']; // Canon
    sampleProducts[11].category = categoryMap['Audio']; // JBL

    // Create products
    console.log('📦 Creating products...');
    const createdProducts = [];
    for (const product of sampleProducts) {
      const created = await Product.create(product);
      createdProducts.push(created);
    }
    console.log(`   ✓ Created ${createdProducts.length} products`);

    // Update category products array
    for (const category of createdCategories) {
      const categoryProducts = createdProducts
        .filter(p => p.category.toString() === category._id.toString())
        .map(p => p._id);

      category.products = categoryProducts;
      await category.save();
    }

    console.log('\n✅ ========================================');
    console.log('   DATABASE SEEDED SUCCESSFULLY!');
    console.log('========================================');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('   ┌─────────────────────────────────────────┐');
    console.log('   │ ADMIN:                                  │');
    console.log('   │ Email:    nimurnerob404@gmail.com       │');
    console.log('   │ Password: nerob404A@                    │');
    console.log('   ├─────────────────────────────────────────┤');
    console.log('   │ USER:                                   │');
    console.log('   │ Email:    user@example.com              │');
    console.log('   │ Password: user123                       │');
    console.log('   └─────────────────────────────────────────┘');
    console.log('\n🌐 ACCESS URLS:');
    console.log('   • Customer Site: http://localhost:5173');
    console.log('   • Admin Dashboard: http://localhost:5174');
    console.log('   • API: http://localhost:5000/api');
    console.log('\n========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
    console.error('\nPlease check:');
    console.error('1. MongoDB is running (mongod)');
    console.error('2. MONGODB_URI in .env is correct');
    console.error('3. You have internet connection (for external images)\n');
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
