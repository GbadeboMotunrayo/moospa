const express    = require('express');
const supabase   = require('../config/db');
const requireAuth = require('../middleware/auth');
const { sendBookingConfirmation } = require('../config/mailer');
const { notifyNewBooking } = require('../telegram/notify');
const router     = express.Router();

// POST /api/bookings — public (customer books a spa session)
router.post('/', async (req, res) => {
  const { customer_name, customer_email, customer_phone, service_id, service_name, service_price, booking_date, booking_time, notes } = req.body;
  if (!customer_name || !customer_phone || !service_name || !booking_date || !booking_time) {
    return res.status(400).json({ success: false, message: 'Name, phone, service, date, and time are required' });
  }
  try {
    const { data, error } = await supabase
      .from('spa_bookings')
      .insert({
        customer_name, customer_email: customer_email || null, customer_phone,
        service_id: service_id || null, service_name, service_price: service_price || null,
        booking_date, booking_time, notes: notes || null, status: 'pending',
      })
      .select()
      .single();
    if (error) throw error;

    // Send confirmation email if email provided
    if (customer_email) {
      sendBookingConfirmation({ customer_name, customer_email, service_name, booking_date, booking_time }).catch(console.error);
    }

    // Alert the owner/staff on Telegram so a booking never sits unseen.
    // Never let a notification hiccup affect the customer's booking response.
    try {
      notifyNewBooking({ customer_name, customer_phone, customer_email, service_name, service_price, booking_date, booking_time, notes });
    } catch (err) {
      console.error('[bookings] notifyNewBooking failed:', err.message);
    }

    res.status(201).json({
      success: true,
      message: 'Booking received! We will confirm shortly.',
      booking_id: data.id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings — admin only, get all bookings
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = supabase.from('spa_bookings').select('*');
    if (status) query = query.eq('status', status);
    if (date)   query = query.eq('booking_date', date);
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, bookings: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/stats — admin only, quick stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const count = async (build) => {
      const { count, error } = await build(supabase.from('spa_bookings').select('*', { count: 'exact', head: true }));
      if (error) throw error;
      return count;
    };
    const today = new Date().toISOString().slice(0, 10);
    const [total, pending, confirmed, todayCount] = await Promise.all([
      count(q => q),
      count(q => q.eq('status', 'pending')),
      count(q => q.eq('status', 'confirmed')),
      count(q => q.eq('booking_date', today)),
    ]);
    res.json({ success: true, stats: { total, pending, confirmed, today: todayCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/bookings/:id/status — admin updates booking status
router.put('/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!valid.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  try {
    const { error } = await supabase.from('spa_bookings').update({ status }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: `Booking marked as ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
