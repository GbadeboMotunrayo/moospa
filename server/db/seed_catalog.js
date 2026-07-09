// Loads the real storefront catalog (src/data/products.js) into the products table,
// using the same ids as the frontend so checkout/restock/sales stay in sync.
// Run: node server/db/seed_catalog.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const supabase = require('../config/db');

async function seed() {
  try {
    const { PRODUCTS } = await import('../../src/data/products.js');
    console.log(`Loading ${PRODUCTS.length} catalog products...`);
    const rows = PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      short_desc: p.shortDesc,
      description: p.fullDesc,
      price: p.price,
      original_price: p.originalPrice,
      category: p.category,
      stock_status: p.inStock === false ? 'Restocking Soon' : 'In Stock',
      stock_quantity: p.inStock === false ? 0 : 5,
      images: p.images || [p.mainImage],
      badge: p.badge,
      rating: p.rating,
      review_count: p.reviewCount,
      featured: !!p.featured,
      ingredients: p.ingredients || null,
      specs: null,
    }));
    const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}
seed();
