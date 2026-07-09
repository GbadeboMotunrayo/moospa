// Loads the real storefront catalog (src/data/products.js) into the products table,
// using the same ids as the frontend so checkout/restock/sales stay in sync.
// Run: node server/db/seed_catalog.js
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/db');

async function seed() {
  try {
    const { PRODUCTS } = await import('../../src/data/products.js');
    console.log(`Loading ${PRODUCTS.length} catalog products...`);
    for (const p of PRODUCTS) {
      await db.query(
        `INSERT INTO products (id,name,short_desc,description,price,original_price,category,stock_status,stock_quantity,images,badge,rating,review_count,featured,ingredients,specs)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           name=VALUES(name), short_desc=VALUES(short_desc), description=VALUES(description),
           price=VALUES(price), original_price=VALUES(original_price), category=VALUES(category),
           images=VALUES(images), badge=VALUES(badge), rating=VALUES(rating), review_count=VALUES(review_count),
           featured=VALUES(featured), ingredients=VALUES(ingredients)`,
        [
          p.id, p.name, p.shortDesc, p.fullDesc, p.price, p.originalPrice, p.category,
          'In Stock', 5, JSON.stringify(p.images || [p.mainImage]), p.badge, p.rating,
          p.reviewCount, p.featured ? 1 : 0, p.ingredients, null
        ]
      );
    }
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}
seed();
