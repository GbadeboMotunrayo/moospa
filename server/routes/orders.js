const express    = require('express');
const db         = require('../config/db');
const requireAuth = require('../middleware/auth');
const { sendOrderConfirmation } = require('../config/mailer');
const router     = express.Router();

// POST /api/orders — customer places an order
router.post('/', async (req, res) => {
  const { customer_name, customer_email, customer_phone, delivery_address, delivery_city, delivery_state, items, subtotal, shipping_fee, total } = req.body;
  if (!customer_name || !customer_email || !customer_phone || !delivery_address || !items?.length) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const reference = 'MOO-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    const [orderResult] = await conn.query(
      `INSERT INTO orders (reference, customer_name, customer_email, customer_phone, delivery_address, delivery_city, delivery_state, subtotal, shipping_fee, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [reference, customer_name, customer_email, customer_phone, delivery_address, delivery_city || '', delivery_state || '', subtotal, shipping_fee || 2000, total]
    );
    const orderId = orderResult.insertId;
    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_purchase) VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.id || 0, item.name, item.qty, item.price]
      );
      if (item.id) {
        await conn.query(
          `UPDATE products SET stock_quantity = GREATEST(stock_quantity - ?, 0) WHERE id = ?`,
          [item.qty, item.id]
        );
      }
    }
    await conn.commit();

    // Send confirmation email (non-blocking)
    if (customer_email) {
      sendOrderConfirmation({ customer_name, customer_email, reference, items, total }).catch(console.error);
    }

    res.status(201).json({ success: true, reference, order_id: orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

// GET /api/orders — admin only, list all orders
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY created_at DESC';
    const [orders] = await db.query(sql, params);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/stats — admin only
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [[{ total }]]   = await db.query('SELECT COUNT(*) as total FROM orders');
    const [[{ pending }]] = await db.query("SELECT COUNT(*) as pending FROM orders WHERE status='pending'");
    const [[{ paid }]]    = await db.query("SELECT COUNT(*) as paid FROM orders WHERE status='paid'");
    const [[{ revenue }]] = await db.query("SELECT COALESCE(SUM(total),0) as revenue FROM orders WHERE status IN ('paid','processing','shipped','delivered')");
    res.json({ success: true, stats: { total, pending, paid, revenue } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:ref — admin only, single order with items
router.get('/:ref', requireAuth, async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE reference = ?', [req.params.ref]);
    if (!orders.length) return res.status(404).json({ success: false, message: 'Order not found' });
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orders[0].id]);
    res.json({ success: true, order: { ...orders[0], items } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/orders/:ref/status — admin updates order status
router.put('/:ref/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  const valid = ['pending','paid','processing','shipped','delivered','cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
  try {
    await db.query('UPDATE orders SET status = ? WHERE reference = ?', [status, req.params.ref]);
    res.json({ success: true, message: `Order marked as ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
