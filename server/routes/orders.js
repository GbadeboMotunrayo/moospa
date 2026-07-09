const express    = require('express');
const supabase   = require('../config/db');
const requireAuth = require('../middleware/auth');
const { sendOrderConfirmation } = require('../config/mailer');
const router     = express.Router();

// POST /api/orders — customer places an order
router.post('/', async (req, res) => {
  const { customer_name, customer_email, customer_phone, delivery_address, delivery_city, delivery_state, items, subtotal, shipping_fee, total } = req.body;
  if (!customer_name || !customer_email || !customer_phone || !delivery_address || !items?.length) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  try {
    const reference = 'MOO-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        reference, customer_name, customer_email, customer_phone, delivery_address,
        delivery_city: delivery_city || '', delivery_state: delivery_state || '',
        subtotal, shipping_fee: shipping_fee || 2000, total, status: 'pending',
      })
      .select()
      .single();
    if (orderErr) throw orderErr;

    const orderItems = items.map(item => ({
      order_id: order.id, product_id: item.id || 0, product_name: item.name, quantity: item.qty, price_at_purchase: item.price,
    }));
    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) throw itemsErr;

    for (const item of items) {
      if (item.id) {
        const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', item.id).maybeSingle();
        if (product) {
          const newQty = Math.max(product.stock_quantity - item.qty, 0);
          await supabase.from('products').update({ stock_quantity: newQty }).eq('id', item.id);
        }
      }
    }

    // Send confirmation email (non-blocking)
    if (customer_email) {
      sendOrderConfirmation({ customer_name, customer_email, reference, items, total }).catch(console.error);
    }

    res.status(201).json({ success: true, reference, order_id: order.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders — admin only, list all orders
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase.from('orders').select('*');
    if (status) query = query.eq('status', status);
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, orders: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/stats — admin only
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const count = async (build) => {
      const { count, error } = await build(supabase.from('orders').select('*', { count: 'exact', head: true }));
      if (error) throw error;
      return count;
    };
    const [total, pending, paid] = await Promise.all([
      count(q => q),
      count(q => q.eq('status', 'pending')),
      count(q => q.eq('status', 'paid')),
    ]);
    const { data: revenueRows, error: revErr } = await supabase
      .from('orders')
      .select('total')
      .in('status', ['paid', 'processing', 'shipped', 'delivered']);
    if (revErr) throw revErr;
    const revenue = revenueRows.reduce((sum, o) => sum + Number(o.total), 0);
    res.json({ success: true, stats: { total, pending, paid, revenue } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:ref — admin only, single order with items
router.get('/:ref', requireAuth, async (req, res) => {
  try {
    const { data: order, error: orderErr } = await supabase.from('orders').select('*').eq('reference', req.params.ref).maybeSingle();
    if (orderErr) throw orderErr;
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const { data: items, error: itemsErr } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    if (itemsErr) throw itemsErr;
    res.json({ success: true, order: { ...order, items } });
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
    const { error } = await supabase.from('orders').update({ status }).eq('reference', req.params.ref);
    if (error) throw error;
    res.json({ success: true, message: `Order marked as ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
