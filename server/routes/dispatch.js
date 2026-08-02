const express     = require('express');
const supabase    = require('../config/db');
const requireAuth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');
const router      = express.Router();

// Fallback pricing used until db/dispatch_zones.sql has been run in Supabase,
// so checkout keeps working even before the table exists. Same values as the seed.
const DEFAULT_ZONES = [
  ['Agege', 2000], ['Ajeromi-Ifelodun', 4500], ['Alimosho', 2500], ['Amuwo-Odofin', 5000],
  ['Apapa', 5000], ['Badagry', 7000], ['Epe', 8000], ['Eti-Osa', 6000],
  ['Ibeju-Lekki', 8000], ['Ifako-Ijaiye', 2000], ['Ikeja', 3000], ['Ikorodu', 5500],
  ['Kosofe', 4000], ['Lagos Island', 5000], ['Lagos Mainland', 4500], ['Mushin', 3500],
  ['Ojo', 4500], ['Oshodi-Isolo', 3500], ['Shomolu', 4000], ['Surulere', 4000],
].map(([lga, price], i) => ({ id: -(i + 1), lga, price, active: true, category: 'Lagos' }));

// GET /api/dispatch — public, active zones for checkout
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('dispatch_zones').select('*').eq('active', true).order('lga');
    if (error) throw error;
    if (!data.length) return res.json({ success: true, zones: DEFAULT_ZONES, fallback: true });
    res.json({ success: true, zones: data });
  } catch (err) {
    res.json({ success: true, zones: DEFAULT_ZONES, fallback: true });
  }
});

// GET /api/dispatch/all — admin, includes inactive zones
router.get('/all', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('dispatch_zones').select('*').order('lga');
    if (error) throw error;
    res.json({ success: true, zones: data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Dispatch table not found — run server/db/dispatch_zones.sql in Supabase. (' + err.message + ')' });
  }
});

// POST /api/dispatch — admin, add a zone
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { lga, price, category } = req.body;
  if (!lga || price === undefined || price === '') {
    return res.status(400).json({ success: false, message: 'Area name and price are required' });
  }
  try {
    const { data, error } = await supabase
      .from('dispatch_zones')
      .insert({ lga: String(lga).trim(), price: Number(price), active: true, category: category === 'Outside Lagos' ? 'Outside Lagos' : 'Lagos' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, zone: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/dispatch/:id — admin, update price/name/active
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { lga, price, active, category } = req.body;
  const patch = { updated_at: new Date().toISOString() };
  if (lga !== undefined) patch.lga = String(lga).trim();
  if (price !== undefined && price !== '') patch.price = Number(price);
  if (active !== undefined) patch.active = !!active;
  if (category !== undefined) patch.category = category === 'Outside Lagos' ? 'Outside Lagos' : 'Lagos';
  try {
    const { data, error } = await supabase.from('dispatch_zones').update(patch).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, zone: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/dispatch/:id — admin
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { error } = await supabase.from('dispatch_zones').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
