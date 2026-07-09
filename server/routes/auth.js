const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../config/db');
const router   = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM admin_users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({ success: true, token, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/verify — check if token is still valid
router.post('/verify', require('../middleware/auth'), (req, res) => {
  res.json({ success: true, admin: req.admin });
});

const { requireRole } = require('../middleware/auth');

// POST /api/auth/staff — admin only, create a sales attendant login
router.post('/staff', require('../middleware/auth'), requireRole('admin'), async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  try {
    const hash = await bcrypt.hash(password, 12);
    await db.query(
      'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, hash, name || 'Sales Attendant', 'attendant']
    );
    res.status(201).json({ success: true, message: 'Attendant account created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/staff — admin only, list staff accounts
router.get('/staff', require('../middleware/auth'), requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, email, name, role, created_at FROM admin_users ORDER BY created_at DESC');
    res.json({ success: true, staff: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/auth/staff/:id — admin only, remove an attendant account
router.delete('/staff/:id', require('../middleware/auth'), requireRole('admin'), async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM admin_users WHERE id = ? AND role = 'attendant'", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Attendant not found' });
    res.json({ success: true, message: 'Attendant removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
