const express    = require('express');
const supabase   = require('../config/db');
const requireAuth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');
const router     = express.Router();

// Pull a quantity out of a request no matter how the client shaped it:
// { quantity: 10 }, { quantity: "10" }, a bare number/string body, or ?quantity=10.
// Keeps restock working even if a browser, proxy, or cached bundle sends the
// value in an unexpected form.
function readQuantity(req) {
  const b = req.body;
  let raw;
  if (b && typeof b === 'object' && !Array.isArray(b)) raw = b.quantity;
  else raw = b; // body came through as a bare number or string
  if (raw === undefined || raw === null || raw === '') raw = req.query.quantity;
  return parseInt(raw, 10);
}

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
    let query = supabase.from('products').select('*');
    if (req.query.category) query = query.eq('category', req.query.category);
    if (req.query.featured)  query = query.eq('featured', true);
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, products: data.map(withDisplayStatus) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id — public
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: withDisplayStatus(data) });
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
    // products.id has no identity/sequence default in this Postgres instance
    // (lost during the MySQL -> Supabase port), so the next id is assigned here.
    const { data: maxRow, error: maxErr } = await supabase
      .from('products').select('id').order('id', { ascending: false }).limit(1).maybeSingle();
    if (maxErr) throw maxErr;
    const nextId = (maxRow?.id || 0) + 1;

    const { data, error } = await supabase
      .from('products')
      .insert({
        id: nextId, name, description: description || '', short_desc: short_desc || '', price,
        original_price: original_price || null, category, stock_status: stock_status || 'In Stock',
        stock_quantity: stock_quantity || 0, images: images || [], badge: badge || null, featured: !!featured,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, product: withDisplayStatus(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id — admin only (full edit, including stock_quantity)
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, description, short_desc, price, original_price, category, stock_status, stock_quantity, images, badge, featured } = req.body;
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name, description, short_desc, price, original_price: original_price || null, category,
        stock_status, stock_quantity: stock_quantity || 0, images: images || [], badge: badge || null, featured: !!featured,
      })
      .eq('id', req.params.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: withDisplayStatus(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products/:id/restock — admin or attendant: add to stock (cannot set/edit stock directly)
router.post('/:id/restock', requireAuth, requireRole('admin', 'attendant'), async (req, res) => {
  const quantity = readQuantity(req);
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
  }
  try {
    const { data: product, error: findErr } = await supabase.from('products').select('*').eq('id', req.params.id).maybeSingle();
    if (findErr) throw findErr;
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const previousQty = product.stock_quantity;
    const newQty = previousQty + quantity;
    const { error: updateErr } = await supabase.from('products').update({ stock_quantity: newQty }).eq('id', req.params.id);
    if (updateErr) throw updateErr;

    const { error: logErr } = await supabase.from('restock_log').insert({
      product_id: req.params.id, quantity_added: quantity, previous_qty: previousQty, new_qty: newQty, restocked_by: req.admin.id,
    });
    if (logErr) throw logErr;

    const { data: updated, error: reErr } = await supabase.from('products').select('*').eq('id', req.params.id).single();
    if (reErr) throw reErr;
    res.json({ success: true, product: withDisplayStatus(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/restock-log — admin only, view restock history
router.get('/restock-log/all', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('restock_log')
      .select('*, products(name), admin_users(email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const log = data.map(r => ({ ...r, product_name: r.products?.name, restocked_by_email: r.admin_users?.email }));
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id — admin only
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').delete().eq('id', req.params.id).select();
    if (error) throw error;
    if (!data.length) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
