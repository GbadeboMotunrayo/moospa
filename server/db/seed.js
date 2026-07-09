// Run: node server/db/seed.js
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const PRODUCTS = [
  { name: 'Glow Booster Serum', short_desc: 'Vitamin C brightening serum for a radiant glow', description: 'Our Glow Booster Serum combines stabilized Vitamin C with niacinamide and hyaluronic acid to deliver intense hydration while brightening your complexion.', price: 15000, original_price: 18000, category: 'skincare', stock_status: 'In Stock', badge: 'Best Seller', rating: 4.8, review_count: 124, featured: 1, images: JSON.stringify(['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop']), ingredients: 'Water, Ascorbic Acid (15%), Niacinamide (5%), Hyaluronic Acid, Glycerin', specs: null },
  { name: 'Yoni Tightening Gel', short_desc: 'Premium intimate wellness gel for confidence', description: 'Formulated with natural botanicals to support intimate wellness. pH-balanced and gynaecologically tested.', price: 12000, original_price: null, category: 'skincare', stock_status: 'In Stock', badge: null, rating: 4.6, review_count: 89, featured: 1, images: JSON.stringify(['https://images.unsplash.com/photo-1512207736139-c78cdd0eff85?w=600&h=600&fit=crop']), ingredients: 'Aloe Barbadensis, Witch Hazel Extract, Chamomile Extract, Glycerin', specs: null },
  { name: 'Luxury Massage Oil', short_desc: 'Sensual rose and jasmine body massage oil', description: 'A deeply moisturizing blend of sweet almond, jojoba, and argan oils infused with rose and jasmine essential oils.', price: 10000, original_price: 12500, category: 'skincare', stock_status: 'In Stock', badge: 'Sale', rating: 4.9, review_count: 203, featured: 1, images: JSON.stringify(['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop']), ingredients: 'Sweet Almond Oil, Jojoba Oil, Argan Oil, Rose Extract, Jasmine Essential Oil', specs: null },
  { name: 'Body Scrub Deluxe', short_desc: 'Brown sugar and shea butter exfoliating scrub', description: 'Indulge in our luxurious body scrub with organic brown sugar crystals and nourishing shea butter.', price: 8500, original_price: null, category: 'skincare', stock_status: 'In Stock', badge: null, rating: 4.7, review_count: 67, featured: 0, images: JSON.stringify(['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop']), ingredients: 'Organic Brown Sugar, Shea Butter, Coconut Oil, Vitamin E', specs: null },
  { name: 'Brightening Face Cream', short_desc: 'SPF 30 brightening day cream for all skin tones', description: 'A rich nourishing day cream with SPF 30 protection and kojic acid to even skin tone.', price: 14000, original_price: null, category: 'skincare', stock_status: 'In Stock', badge: 'New', rating: 4.5, review_count: 34, featured: 0, images: JSON.stringify(['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop']), ingredients: 'Water, Glycerin, Kojic Acid, Turmeric Extract, SPF 30 Filter, Shea Butter', specs: null },
  { name: 'Waist Beads Set', short_desc: 'Handcrafted African waist beads in premium glass', description: 'Celebrate your femininity with our handcrafted waist beads. Each set comes with 3 strands.', price: 6000, original_price: null, category: 'skincare', stock_status: 'In Stock', badge: null, rating: 4.5, review_count: 43, featured: 0, images: JSON.stringify(['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop']), ingredients: null, specs: null },
  { name: 'Rabbit Vibrator Premium', short_desc: 'Luxury dual-stimulation vibrator, 10 modes', description: 'Premium body-safe silicone with whisper-quiet motor. 10 vibration patterns, USB rechargeable, waterproof.', price: 28000, original_price: 35000, category: 'sextoys', stock_status: 'In Stock', badge: 'Discreet', rating: 4.9, review_count: 156, featured: 1, images: JSON.stringify(['https://images.unsplash.com/photo-1576091160550-112173f7f869?w=600&h=600&fit=crop']), ingredients: null, specs: 'Medical-grade silicone | 10 modes | USB-C | IPX7 Waterproof' },
  { name: 'Wand Massager', short_desc: 'Professional-grade wand with 20 intensity levels', description: 'Powerful personal massager with 20 vibration intensities. Flexible neck, whisper quiet, USB-C rechargeable.', price: 22000, original_price: null, category: 'sextoys', stock_status: 'In Stock', badge: null, rating: 4.7, review_count: 98, featured: 0, images: JSON.stringify(['https://images.unsplash.com/photo-1576091160550-112173f7f869?w=600&h=600&fit=crop']), ingredients: null, specs: 'ABS + Silicone | 20 modes | USB-C | IPX6 Waterproof' },
];

async function seed() {
  try {
    console.log('Seeding House of Moo database...\n');
    const email = process.env.ADMIN_EMAIL || 'admin@moo.com';
    const password = process.env.ADMIN_PASSWORD || 'moo2026';
    const hash = await bcrypt.hash(password, 12);
    await db.query(
      'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)',
      [email, hash, 'House of Moo Admin', 'admin']
    );
    console.log(`Admin: ${email} / ${password}`);
    for (const p of PRODUCTS) {
      await db.query(
        `INSERT INTO products (name,short_desc,description,price,original_price,category,stock_status,stock_quantity,images,badge,rating,review_count,featured,ingredients,specs)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE price=VALUES(price)`,
        [p.name,p.short_desc,p.description,p.price,p.original_price,p.category,p.stock_status,p.stock_quantity ?? 20,p.images,p.badge,p.rating,p.review_count,p.featured,p.ingredients,p.specs]
      );
    }
    console.log(`Seeded ${PRODUCTS.length} products\nDone!`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}
seed();
