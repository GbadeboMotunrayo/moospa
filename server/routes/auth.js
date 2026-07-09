const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const supabase = require('../config/db');
const router   = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  try {
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
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
    const { error } = await supabase
      .from('admin_users')
      .insert({ email, password_hash: hash, name: name || 'Sales Attendant', role: 'attendant' });
    if (error) {
      if (error.code === '23505') { // unique_violation
        return res.status(409).json({ success: false, message: 'An account with this email already exists' });
      }
      throw error;
    }
    res.status(201).json({ success: true, message: 'Attendant account created' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/staff — admin only, list staff accounts
router.get('/staff', require('../middleware/auth'), requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, staff: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/auth/staff/:id — admin only, remove an attendant account
router.delete('/staff/:id', require('../middleware/auth'), requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', req.params.id)
      .eq('role', 'attendant')
      .select();
    if (error) throw error;
    if (!data.length) return res.status(404).json({ success: false, message: 'Attendant not found' });
    res.json({ success: true, message: 'Attendant removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
