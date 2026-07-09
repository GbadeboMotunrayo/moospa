const express = require('express');
const supabase = require('../config/db');
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
    const { data: product, error: findErr } = await supabase.from('products').select('*').eq('id', product_id).maybeSingle();
    if (findErr) throw findErr;
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.stock_quantity < qty) {
      return res.status(400).json({ success: false, message: 'Not enough stock available' });
    }

    const unitPrice = product.price;
    const total = unitPrice * qty;
    const newQty = product.stock_quantity - qty;

    const { error: updateErr } = await supabase.from('products').update({ stock_quantity: newQty }).eq('id', product_id);
    if (updateErr) throw updateErr;

    const { data: sale, error: saleErr } = await supabase
      .from('sales')
      .insert({
        product_id, product_name: product.name, quantity: qty, unit_price: unitPrice, total,
        sale_type, customer_name: customer_name || null, customer_phone: customer_phone || null, recorded_by: req.admin.id,
      })
      .select()
      .single();
    if (saleErr) throw saleErr;

    res.status(201).json({ success: true, sale, remaining_stock: newQty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/sales — admin only: list sales, supports ?sale_type=walk-in|online
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    let query = supabase.from('sales').select('*, admin_users(email)');
    if (req.query.sale_type) query = query.eq('sale_type', req.query.sale_type);
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    const sales = data.map(s => ({ ...s, recorded_by_email: s.admin_users?.email }));
    res.json({ success: true, sales });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/sales/stats — admin only: summary totals
router.get('/stats', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('sales').select('total, sale_type');
    if (error) throw error;
    const totals = data.reduce((acc, s) => {
      acc.total_sales += 1;
      acc.total_revenue += Number(s.total);
      if (s.sale_type === 'walk-in') acc.walk_in_revenue += Number(s.total);
      if (s.sale_type === 'online') acc.online_revenue += Number(s.total);
      return acc;
    }, { total_sales: 0, total_revenue: 0, walk_in_revenue: 0, online_revenue: 0 });
    res.json({ success: true, stats: totals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
