// db.js — MongoDB connection and seed data
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product  = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/etherx-shop';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);
    await seed();
  } catch (err) {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  }
}

async function seed() {
  const catCount = await Category.countDocuments();
  if (catCount > 0) return; // already seeded

  // ── Categories
  const cats = await Category.insertMany([
    { name: 'Audio',     slug: 'audio',     description: 'Headphones, earbuds, speakers',        item_count: 48 },
    { name: 'Wearables', slug: 'wearables', description: 'Smartwatches and fitness bands',        item_count: 32 },
    { name: 'Cases',     slug: 'cases',     description: 'Phone and tablet protective cases',     item_count: 96 },
    { name: 'Chargers',  slug: 'chargers',  description: 'Cables, hubs and charging pads',        item_count: 24 },
    { name: 'Displays',  slug: 'displays',  description: 'Monitors and screen accessories',       item_count: 18 },
    { name: 'Keyboards', slug: 'keyboards', description: 'Mechanical and wireless keyboards',     item_count: 14 },
  ]);

  // ── Products
  await Product.insertMany([
    // Featured
    { brand:'Apple', name:'AirPods Pro (2nd Gen)', description:'Industry-leading Active Noise Cancellation with Adaptive Transparency. Up to 30 hours total listening time with case.', price:249, old_price:null, rating:5, review_count:2840, tag:'hot', category_slug:'audio', stock:85, image_url:'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80', is_featured:true, is_new_arrival:false },
    { brand:'Apple', name:'Apple Watch Ultra 2', description:'The most rugged and capable Apple Watch ever. Precision dual-frequency GPS, Action button, and up to 60 hours of battery life.', price:799, old_price:999, rating:5, review_count:1290, tag:'sale', category_slug:'wearables', stock:40, image_url:'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80', is_featured:true, is_new_arrival:false },
    { brand:'Apple', name:'MagSafe Charger 15W', description:'Attach magnetically and charge wirelessly at up to 15W. Compatible with iPhone 12 and later.', price:39, old_price:null, rating:4, review_count:5100, tag:'new', category_slug:'chargers', stock:200, image_url:'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80', is_featured:true, is_new_arrival:false },
    { brand:'Apple', name:'iPad Air M2 11"', description:'Supercharged by the M2 chip. Available in five gorgeous finishes. Compatible with Apple Pencil Pro and Magic Keyboard.', price:599, old_price:null, rating:5, review_count:3400, tag:'new', category_slug:'displays', stock:60, image_url:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80', is_featured:true, is_new_arrival:false },
    { brand:'Beats', name:'Studio Pro Headphones', description:'Next-level sound and convenience with personalized spatial audio, Lossless Audio via USB-C, and 40-hour battery.', price:349, old_price:449, rating:4, review_count:890, tag:'sale', category_slug:'audio', stock:55, image_url:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', is_featured:true, is_new_arrival:false },
    { brand:'Apple', name:'MacBook Air 13" M3', description:'Strikingly thin design, M3 chip, 18-hour battery, and up to 24GB of memory.', price:1299, old_price:null, rating:5, review_count:2100, tag:'new', category_slug:'displays', stock:30, image_url:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80', is_featured:true, is_new_arrival:false },
    { brand:'Apple', name:'iPhone 15 Pro Case', description:'Precision-crafted MagSafe case for iPhone 15 Pro. Raised edges protect the camera and display.', price:59, old_price:null, rating:4, review_count:7600, tag:'hot', category_slug:'cases', stock:150, image_url:'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80', is_featured:true, is_new_arrival:false },
    { brand:'Belkin', name:'MagSafe 3-in-1 Stand', description:'Charges iPhone, Apple Watch, and AirPods simultaneously. Compact and sleek for your desk.', price:149, old_price:179, rating:4, review_count:640, tag:'sale', category_slug:'chargers', stock:70, image_url:'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&q=80', is_featured:true, is_new_arrival:false },
    // New Arrivals
    { brand:'Apple', name:'Apple Pencil Pro', description:'Squeeze and double tap for entirely new ways to interact with Apple Pencil. Supports hover and barrel roll.', price:129, old_price:null, rating:5, review_count:1890, tag:'new', category_slug:'displays', stock:90, image_url:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80', is_featured:false, is_new_arrival:true },
    { brand:'Nomad', name:'Sport Band Ultra', description:'Silicone sport band with stainless steel hardware. Sweat-resistant and built for every workout.', price:59, old_price:null, rating:4, review_count:430, tag:'new', category_slug:'wearables', stock:120, image_url:'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=400&q=80', is_featured:false, is_new_arrival:true },
    { brand:'JBL', name:'Flip 6 Speaker', description:'Powerful JBL Pro Sound, IP67 waterproof, and 12 hours of playtime. PartyBoost ready.', price:129, old_price:149, rating:4, review_count:2200, tag:'hot', category_slug:'audio', stock:80, image_url:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80', is_featured:false, is_new_arrival:true },
    { brand:'Apple', name:'HomePod mini', description:'Room-filling sound from a tiny but mighty speaker. Intercom, Siri, and smart home hub built in.', price:99, old_price:null, rating:5, review_count:3100, tag:'new', category_slug:'audio', stock:65, image_url:'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80', is_featured:false, is_new_arrival:true },
    // Additional
    { brand:'Apple', name:'Magic Keyboard with Touch ID', description:'Comfortable and precise keyboard with Touch ID. Compatible with Mac models with Apple silicon.', price:99, old_price:null, rating:5, review_count:4200, tag:null, category_slug:'keyboards', stock:110, image_url:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80', is_featured:false, is_new_arrival:false },
    { brand:'Apple', name:'AirTag 4-Pack', description:'Keep track of and find your items alongside friends and devices in the Find My app.', price:99, old_price:129, rating:4, review_count:8900, tag:'sale', category_slug:'wearables', stock:200, image_url:'https://images.unsplash.com/photo-1618434487047-5e5cf5a8f2a1?w=400&q=80', is_featured:false, is_new_arrival:false },
    { brand:'Logitech', name:'MX Keys Mini', description:'Compact illuminated keyboard designed for Mac. Smart backlighting and easy switch between 3 devices.', price:99, old_price:null, rating:4, review_count:1800, tag:null, category_slug:'keyboards', stock:75, image_url:'https://images.unsplash.com/photo-1601445638532-1a0e7af3c8ac?w=400&q=80', is_featured:false, is_new_arrival:false },
    { brand:'Anker', name:'45W USB-C Charging Cable', description:'Nylon-braided USB-C cable supporting 45W fast charging. Certified MFi for Apple devices.', price:19, old_price:null, rating:4, review_count:12400, tag:null, category_slug:'chargers', stock:300, image_url:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80', is_featured:false, is_new_arrival:false },
  ]);

  console.log(`✅  Database seeded: ${cats.length} categories, 16 products`);
}

module.exports = { connectDB };
