const express     = require('express');
const supabase    = require('../config/db');
const requireAuth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');
const router      = express.Router();

// Fallback pricing used until db/spa_services.sql has been run in Supabase,
// so the Spa page keeps working even before the table exists. Same values as the seed.
const DEFAULT_SERVICES = [
  ['Relaxation Massage',    'Massage',  '60 min', 30000, 'A full-body Swedish massage that melts away tension and stress using warm oils and long, flowing strokes.', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop', true],
  ['Hot Stone Massage',     'Massage',  '90 min', 60000, 'Heated basalt stones placed on key energy points while therapist massages muscles with warm oil. Deeply therapeutic.', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&h=400&fit=crop', true],
  ['Aromatherapy Massage',  'Massage',  '60 min', 60000, 'Essential oil blends chosen for your mood: relaxation, energy, or romance. A truly sensory experience.', 'https://images.unsplash.com/photo-1608196840522-33f1b59e4ced?w=600&h=400&fit=crop', false],
  ['Deep Tissue Massage',   'Massage',  '75 min', 40000, 'Targets deeper layers of muscle and connective tissue. Ideal for chronic pain, knots, and muscle tightness.', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop', false],
  ['Waist to Head Massage', 'Massage',  '60 min', 20000, 'A full upper-body massage from waist to head, easing tension across the back, shoulders, neck and scalp.', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop', false],
  ['Luxury Facial',         'Facial',   '60 min', 30000, 'A customized facial using premium products: cleanse, exfoliate, steam, mask, and moisturize for glowing skin.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop', true],
  ['Collagen Facial',       'Facial',   '60 min', 20000, 'A collagen-infused facial that boosts skin elasticity and firmness, leaving your face plump, smooth and youthful.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop', false],
  ['Brightening Facial',    'Facial',   '45 min', 7000,  'Targets hyperpigmentation and dull skin with Vitamin C infused treatments and a brightening enzyme mask.', 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=400&fit=crop', false],
  ['Exfoliating Body Scrub','Treatment','45 min', 30000, 'A full-body exfoliation that sloughs away dead skin and buffs away dullness, leaving skin soft, smooth and glowing.', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop', false],
  ['Moroccan Body Scrub',   'Treatment','60 min', 50000, 'A traditional Moroccan-style scrub using natural black soap and exfoliating gloves to deeply cleanse and renew the skin.', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop', false],
  ['Basic Pedicure',        'Nails',    '45 min', 10000, 'A classic pedicure: soak, nail shaping, cuticle care and polish for clean, well-groomed feet.', 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=400&fit=crop', false],
  ['Jelly Pedicure',        'Nails',    '60 min', 25000, 'A luxurious jelly-soak pedicure that softens and hydrates the feet before shaping, cuticle care and polish.', 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=400&fit=crop', false],
  ['Manicure',              'Nails',    '30 min', 5000,  'A classic manicure: nail shaping, cuticle care and polish for neat, healthy-looking hands.', 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=400&fit=crop', false],
  ['Couples Spa Package',   'Package',  '120 min',100000,'For two. Side-by-side massage, facial, and champagne service in our private couples suite. Unforgettable.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop', true],
].map(([name, category, duration, price, description, image, popular], i) => ({
  id: -(i + 1), name, category, duration, price, description, image, popular, active: true,
}));

// GET /api/spa-services — public, active services for the storefront Spa page
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('spa_services').select('*').eq('active', true).order('id');
    if (error) throw error;
    if (!data.length) return res.json({ success: true, services: DEFAULT_SERVICES, fallback: true });
    res.json({ success: true, services: data });
  } catch (err) {
    res.json({ success: true, services: DEFAULT_SERVICES, fallback: true });
  }
});

// GET /api/spa-services/all — admin, includes hidden services
router.get('/all', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('spa_services').select('*').order('id');
    if (error) throw error;
    res.json({ success: true, services: data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Spa services table not found — run server/db/spa_services.sql in Supabase. (' + err.message + ')' });
  }
});

// POST /api/spa-services — admin, add a service
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, category, duration, price, description, image, popular } = req.body;
  if (!name || price === undefined || price === '') {
    return res.status(400).json({ success: false, message: 'Service name and price are required' });
  }
  try {
    const { data, error } = await supabase
      .from('spa_services')
      .insert({
        name: String(name).trim(),
        category: category ? String(category).trim() : 'Massage',
        duration: duration ? String(duration).trim() : '60 min',
        price: Number(price),
        description: description || '',
        image: image || '',
        popular: !!popular,
        active: true,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, service: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/spa-services/:id — admin, update any field (price included)
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, category, duration, price, description, image, popular, active } = req.body;
  const patch = { updated_at: new Date().toISOString() };
  if (name !== undefined) patch.name = String(name).trim();
  if (category !== undefined) patch.category = String(category).trim();
  if (duration !== undefined) patch.duration = String(duration).trim();
  if (price !== undefined && price !== '') patch.price = Number(price);
  if (description !== undefined) patch.description = description;
  if (image !== undefined) patch.image = image;
  if (popular !== undefined) patch.popular = !!popular;
  if (active !== undefined) patch.active = !!active;
  try {
    const { data, error } = await supabase.from('spa_services').update(patch).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, service: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/spa-services/:id — admin
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { error } = await supabase.from('spa_services').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
