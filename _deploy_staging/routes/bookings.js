const express    = require('express');
const db         = require('../config/db');
const requireAuth = require('../middleware/auth');
const { sendBookingConfirmation } = require('../config/mailer');
const router     = express.Router();

// POST /api/bookings — public (customer books a spa session)
router.post('/', async (req, res) => {
  const { customer_name, customer_email, customer_phone, service_id, service_name, service_price, booking_date, booking_time, notes } = req.body;
  if (!customer_name || !customer_phone || !service_name || !booking_date || !booking_time) {
    return res.status(400).json({ success: false, message: 'Name, phone, service, date, and time are required' });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO spa_bookings (customer_name, customer_email, customer_phone, service_id, service_name, service_price, booking_date, booking_time, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [customer_name, customer_email || null, customer_phone, service_id || null, service_name, service_price || null, booking_date, booking_time, notes || null]
    );

    // Send confirmation email if email provided
    if (customer_email) {
      sendBookingConfirmation({ customer_name, customer_email, service_name, booking_date, booking_time }).catch(console.error);
    }

    res.status(201).json({
      success: true,
      message: 'Booking received! We will confirm shortly.',
      booking_id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings — admin only, get all bookings
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, date } = req.query;
    let sql = 'SELECT * FROM spa_bookings WHERE 1=1';
    const params = [];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (date)   { sql += ' AND booking_date = ?'; params.push(date); }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json({ success: true, bookings: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/stats — admin only, quick stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [[{ total }]]    = await db.query('SELECT COUNT(*) as total FROM spa_bookings');
    const [[{ pending }]]  = await db.query("SELECT COUNT(*) as pending FROM spa_bookings WHERE status='pending'");
    const [[{ confirmed }]] = await db.query("SELECT COUNT(*) as confirmed FROM spa_bookings WHERE status='confirmed'");
    const [[{ today }]]    = await db.query("SELECT COUNT(*) as today FROM spa_bookings WHERE DATE(booking_date)=CURDATE()");
    res.json({ success: true, stats: { total, pending, confirmed, today } });
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
    await db.query('UPDATE spa_bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Booking marked as ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
