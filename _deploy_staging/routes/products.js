const express    = require('express');
const db         = require('../config/db');
const requireAuth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');
const router     = express.Router();

// Derive the display stock status from stock_quantity — out-of-stock items
// show as "Restocking Soon" on the storefront instead of "Out of Stock".
function withDisplayStatus(p) {
  const stock_status = p.stock_quantity <= 0 ? 'Restocking Soon' : p.stock_status;
  const images = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
  return { ...p, images, stock_status, inStock: p.stock_quantity > 0 };
}

// GET /api/products — public, supports ?category=skincare&featured=true
router.get('/', async (req, res) => {
  try {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    if (req.query.category) { sql += ' AND category = ?'; params.push(req.query.category); }
    if (req.query.featured)  { sql += ' AND featured = 1'; }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.query(sql, params);
    const products = rows.map(withDisplayStatus);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id — public
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: withDisplayStatus(rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products — admin only
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, description, short_desc, price, original_price, category, stock_status, stock_quantity, images, badge, featured } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO products (name, description, short_desc, price, original_price, category, stock_status, stock_quantity, images, badge, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || '', short_desc || '', price, original_price || null, category, stock_status || 'In Stock', stock_quantity || 0, JSON.stringify(images || []), badge || null, featured ? 1 : 0]
    );
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, product: withDisplayStatus(rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id — admin only (full edit, including stock_quantity)
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, description, short_desc, price, original_price, category, stock_status, stock_quantity, images, badge, featured } = req.body;
  try {
    await db.query(
      `UPDATE products SET name=?, description=?, short_desc=?, price=?, original_price=?, category=?, stock_status=?, stock_quantity=?, images=?, badge=?, featured=?
       WHERE id=?`,
      [name, description, short_desc, price, original_price || null, category, stock_status, stock_quantity || 0, JSON.stringify(images || []), badge || null, featured ? 1 : 0, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: withDisplayStatus(rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products/:id/restock — admin or attendant: add to stock (cannot set/edit stock directly)
router.post('/:id/restock', requireAuth, requireRole('admin', 'attendant'), async (req, res) => {
  const quantity = parseInt(req.body.quantity, 10);
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found' });

    const previousQty = rows[0].stock_quantity;
    const newQty = previousQty + quantity;
    await db.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [newQty, req.params.id]);
    await db.query(
      'INSERT INTO restock_log (product_id, quantity_added, previous_qty, new_qty, restocked_by) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, quantity, previousQty, newQty, req.admin.id]
    );

    const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, product: withDisplayStatus(updated[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/restock-log — admin only, view restock history
router.get('/restock-log/all', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, p.name AS product_name, u.email AS restocked_by_email
       FROM restock_log r
       JOIN products p ON p.id = r.product_id
       LEFT JOIN admin_users u ON u.id = r.restocked_by
       ORDER BY r.created_at DESC`
    );
    res.json({ success: true, log: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id — admin only
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
