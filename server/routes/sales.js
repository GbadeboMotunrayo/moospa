const express = require('express');
const db = require('../config/db');
const requireAuth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

// POST /api/sales — admin or attendant: record a sale (walk-in or online) and reduce stock
router.post('/', requireAuth, requireRole('admin', 'attendant'), async (req, res) => {
  const { product_id, quantity, sale_type, customer_name, customer_phone } = req.body;
  const qty = parseInt(quantity, 10);

  if (!product_id || !qty || qty <= 0) {
    return res.status(400).json({ success: false, message: 'product_id and a positive quantity are required' });
  }
  if (!['walk-in', 'online'].includes(sale_type)) {
    return res.status(400).json({ success: false, message: "sale_type must be 'walk-in' or 'online'" });
  }

  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found' });

    const product = rows[0];
    if (product.stock_quantity < qty) {
      return res.status(400).json({ success: false, message: 'Not enough stock available' });
    }

    const unitPrice = product.price;
    const total = unitPrice * qty;
    const newQty = product.stock_quantity - qty;

    await db.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [newQty, product_id]);
    const [result] = await db.query(
      `INSERT INTO sales (product_id, product_name, quantity, unit_price, total, sale_type, customer_name, customer_phone, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_id, product.name, qty, unitPrice, total, sale_type, customer_name || null, customer_phone || null, req.admin.id]
    );

    const [sale] = await db.query('SELECT * FROM sales WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, sale: sale[0], remaining_stock: newQty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/sales — admin only: list sales, supports ?sale_type=walk-in|online
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    let sql = `SELECT s.*, u.email AS recorded_by_email FROM sales s LEFT JOIN admin_users u ON u.id = s.recorded_by WHERE 1=1`;
    const params = [];
    if (req.query.sale_type) { sql += ' AND s.sale_type = ?'; params.push(req.query.sale_type); }
    sql += ' ORDER BY s.created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json({ success: true, sales: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/sales/stats — admin only: summary totals
router.get('/stats', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const [[totals]] = await db.query(
      `SELECT COUNT(*) AS total_sales, COALESCE(SUM(total),0) AS total_revenue,
              SUM(CASE WHEN sale_type='walk-in' THEN total ELSE 0 END) AS walk_in_revenue,
              SUM(CASE WHEN sale_type='online' THEN total ELSE 0 END) AS online_revenue
       FROM sales`
    );
    res.json({ success: true, stats: totals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
