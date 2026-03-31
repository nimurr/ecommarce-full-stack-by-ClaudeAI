import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Page from '../models/Page.js';
import config from '../config/config.js';

dotenv.config();

const defaultPages = [
  {
    title: 'About Us',
    slug: 'about',
    type: 'about',
    content: `Welcome to ElectroMart, your number one source for all things electronics. We're dedicated to giving you the very best of electronic gadgets, with a focus on quality, customer service, and uniqueness.

Founded in 2024, ElectroMart has come a long way from its beginnings. We now serve customers all over Bangladesh and are thrilled to be a part of the growing eCommerce community.

We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.

ElectroMart is here to help you find the perfect electronics for your needs. We offer a wide selection of products from top brands, competitive prices, and excellent customer service.`,
    excerpt: 'Learn more about ElectroMart - Your trusted electronics store',
    isActive: true,
    displayOrder: 1,
  },
  {
    title: 'Contact Us',
    slug: 'contact',
    type: 'contact',
    content: `We'd love to hear from you! Whether you have a question about our products, need assistance with an order, or just want to say hello, feel free to reach out to us.

Our customer service team is available to assist you during business hours. We strive to respond to all inquiries within 24 hours.

Visit our store or contact us using the information below.`,
    excerpt: 'Get in touch with ElectroMart',
    isActive: true,
    displayOrder: 2,
    contactInfo: {
      email: 'support@electromart.com',
      phone: '+880-123-456-7890',
      address: {
        street: '123 Tech Street, Dhanmondi',
        city: 'Dhaka',
        state: 'Dhaka Division',
        zipCode: '1209',
        country: 'Bangladesh',
      },
    },
  },
  {
    title: 'Frequently Asked Questions',
    slug: 'faq',
    type: 'faq',
    content: `Find answers to commonly asked questions about ElectroMart, our products, and services.`,
    excerpt: 'Get quick answers to common questions',
    isActive: true,
    displayOrder: 3,
    faqs: [
      {
        question: 'How do I place an order?',
        answer: 'Simply browse our products, add items to your cart, and proceed to checkout. You can checkout as a guest or create an account for faster checkout in the future.',
        order: 1,
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept Cash on Delivery (COD) and online payments through credit/debit cards and mobile banking services like bKash, Nagad, and Rocket.',
        order: 2,
      },
      {
        question: 'How long does delivery take?',
        answer: 'Delivery typically takes 3-7 business days within Bangladesh. Dhaka deliveries are usually faster (1-3 days), while other cities may take slightly longer.',
        order: 3,
      },
      {
        question: 'Can I return a product?',
        answer: 'Yes, we offer a 7-day return policy for most products. The product must be in its original condition with all packaging and accessories.',
        order: 4,
      },
      {
        question: 'Do you offer warranty on products?',
        answer: 'Yes, all our products come with manufacturer warranty. The warranty period varies by product and brand, typically ranging from 1 to 2 years.',
        order: 5,
      },
    ],
  },
  {
    title: 'Shipping Information',
    slug: 'shipping',
    type: 'shipping',
    content: `We offer shipping services throughout Bangladesh. Our goal is to get your products to you as quickly and safely as possible.

**Shipping Rates:**
- Dhaka: ৳60
- Other Cities: ৳120
- Free shipping on orders over ৳1000

**Delivery Time:**
- Dhaka: 1-3 business days
- Other Cities: 3-7 business days

**Tracking Your Order:**
Once your order is shipped, you'll receive a tracking number via SMS and email. You can use this to track your order's progress.

**Shipping Restrictions:**
Some products may have shipping restrictions due to size, weight, or manufacturer policies.`,
    excerpt: 'Learn about our shipping rates and delivery times',
    isActive: true,
    displayOrder: 4,
  },
  {
    title: 'Returns & Refunds',
    slug: 'returns',
    type: 'returns',
    content: `We want you to be completely satisfied with your purchase. If you're not happy with your order, we're here to help.

**Return Policy:**
- 7 days return policy for most products
- Product must be in original condition with all packaging
- Original invoice/receipt required
- Some products may not be eligible for return (e.g., opened software, personal care items)

**How to Return:**
1. Contact our customer service within 7 days of delivery
2. Provide your order number and reason for return
3. Pack the product securely with all accessories
4. Our courier will pick up the product from your address

**Refund Process:**
- Refunds are processed within 7-10 business days after we receive the returned product
- Refund will be issued to the original payment method
- For COD orders, refund will be made via bank transfer or mobile banking

**Exchange:**
We also offer exchange for defective or damaged products. Contact us within 7 days of delivery for exchange requests.`,
    excerpt: 'Our 7-day return policy and refund process',
    isActive: true,
    displayOrder: 5,
  },
  {
    title: 'Warranty Policy',
    slug: 'warranty',
    type: 'warranty',
    content: `All products sold at ElectroMart come with manufacturer warranty. Here's what you need to know:

**Warranty Coverage:**
- All products are covered by manufacturer warranty
- Warranty period varies by product (typically 1-2 years)
- Warranty covers manufacturing defects only
- Physical damage, water damage, and normal wear & tear are not covered

**Warranty Claim Process:**
1. Contact the manufacturer's service center with your warranty card and invoice
2. Or contact our customer service for assistance
3. Product will be inspected by authorized service center
4. If covered under warranty, repair or replacement will be done free of charge

**Important Notes:**
- Keep your invoice and warranty card safe
- Register your product with the manufacturer if required
- Unauthorized repairs void the warranty
- Some brands require online registration for warranty activation

**Extended Warranty:**
For some products, we offer extended warranty options. Ask our customer service for details.`,
    excerpt: 'Understanding your product warranty',
    isActive: true,
    displayOrder: 6,
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy',
    type: 'privacy',
    content: `At ElectroMart, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.

**Information We Collect:**
- Personal information (name, email, phone number, address) when you place an order
- Payment information (processed securely by payment gateways)
- Browsing data and cookies for website functionality

**How We Use Your Information:**
- Process and deliver your orders
- Send order confirmations and updates
- Respond to your inquiries and provide customer support
- Send promotional emails (with your consent)
- Improve our website and services

**Information Sharing:**
We do not sell or rent your personal information. We may share your information with:
- Delivery partners to fulfill your orders
- Payment processors to process payments
- Legal authorities when required by law

**Data Security:**
We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.

**Your Rights:**
- Access your personal information
- Correct inaccurate information
- Request deletion of your information
- Opt-out of promotional communications

**Cookies:**
We use cookies to enhance your browsing experience. You can disable cookies in your browser settings, but some features may not work properly.

**Contact Us:**
If you have questions about this Privacy Policy, please contact us at privacy@electromart.com`,
    excerpt: 'How we protect and use your personal information',
    isActive: true,
    displayOrder: 7,
    metaTitle: 'Privacy Policy - ElectroMart',
    metaDescription: 'Learn how ElectroMart collects, uses, and protects your personal information',
  },
  {
    title: 'Terms of Service',
    slug: 'terms',
    type: 'terms',
    content: `Welcome to ElectroMart. By accessing and using our website, you agree to be bound by these Terms of Service.

**1. Acceptance of Terms**
By using this website, you agree to comply with and be bound by these terms and conditions of use.

**2. Use of Website**
You agree to use this website only for lawful purposes and in accordance with these terms.

**3. Product Information**
We strive to provide accurate product descriptions and images, but we do not guarantee that all information is accurate, complete, or current.

**4. Pricing**
All prices are in Bangladeshi Taka (BDT). We reserve the right to change prices without notice.

**5. Orders and Payment**
- We reserve the right to refuse or cancel any order
- Payment must be made in full before delivery
- For COD orders, please keep exact change ready

**6. Delivery**
We will deliver products to the address provided during checkout. Delivery times are estimates and not guaranteed.

**7. Returns and Refunds**
Returns and refunds are subject to our Return & Refund Policy.

**8. Limitation of Liability**
ElectroMart shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.

**9. Modifications to Terms**
We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.

**10. Governing Law**
These terms shall be governed by and construed in accordance with the laws of Bangladesh.

**Contact Information:**
For questions about these Terms of Service, please contact us at legal@electromart.com`,
    excerpt: 'Terms and conditions for using ElectroMart',
    isActive: true,
    displayOrder: 8,
    metaTitle: 'Terms of Service - ElectroMart',
    metaDescription: 'Read our terms and conditions for using ElectroMart services',
  },
];

const seedPages = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB Connected');

    // Clear existing pages
    await Page.deleteMany({});
    console.log('🗑️  Cleared existing pages');

    // Create default pages
    const createdPages = await Page.insertMany(defaultPages);
    console.log(`✅ Created ${createdPages.length} pages`);

    console.log('\n✅ Pages seeded successfully!');
    console.log('\n📋 Created Pages:');
    createdPages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.title} (/page/${page.slug})`);
    });
    console.log('\n🌐 Access pages at:');
    console.log('   http://localhost:5173/page/about');
    console.log('   http://localhost:5173/page/contact');
    console.log('   http://localhost:5173/page/faq');
    console.log('   http://localhost:5173/page/shipping');
    console.log('   http://localhost:5173/page/returns');
    console.log('   http://localhost:5173/page/warranty');
    console.log('   http://localhost:5173/page/privacy');
    console.log('   http://localhost:5173/page/terms');
    console.log('\n========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pages:', error.message);
    process.exit(1);
  }
};

seedPages();
