const express = require('express');
const crypto  = require('crypto');
const https   = require('https');
const db      = require('../config/db');
const router  = express.Router();

// POST /api/paystack/initialize
router.post('/initialize', async (req, res) => {
  const { email, amount, reference, metadata } = req.body;
  if (!email || !amount) return res.status(400).json({ success: false, message: 'Email and amount required' });
  const data = JSON.stringify({
    email,
    amount: Math.round(amount * 100),
    reference: reference || ('MOO-' + Date.now()),
    callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirmation`,
    metadata: metadata || {},
  });
  const options = {
    hostname: 'api.paystack.co', port: 443, path: '/transaction/initialize', method: 'POST',
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json', 'Content-Length': data.length },
  };
  const req2 = https.request(options, r => {
    let body = '';
    r.on('data', c => body += c);
    r.on('end', () => {
      try { const p = JSON.parse(body); res.json({ success: p.status, data: p.data }); }
      catch { res.status(500).json({ success: false, message: 'Paystack parse error' }); }
    });
  });
  req2.on('error', e => res.status(500).json({ success: false, message: e.message }));
  req2.write(data); req2.end();
});

// POST /api/paystack/verify/:reference
router.post('/verify/:reference', async (req, res) => {
  const options = {
    hostname: 'api.paystack.co', port: 443,
    path: `/transaction/verify/${encodeURIComponent(req.params.reference)}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  };
  const req2 = https.request(options, r => {
    let body = '';
    r.on('data', c => body += c);
    r.on('end', async () => {
      try {
        const { data } = JSON.parse(body);
        if (data.status === 'success') {
          await db.query("UPDATE orders SET status='paid', paystack_ref=? WHERE reference=?", [data.reference, data.reference]);
        }
        res.json({ success: true, status: data.status, data });
      } catch { res.status(500).json({ success: false, message: 'Verification failed' }); }
    });
  });
  req2.on('error', e => res.status(500).json({ success: false, message: e.message }));
  req2.end();
});

// POST /api/paystack/webhook — raw body, verified via HMAC
router.post('/webhook', (req, res) => {
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(req.body).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) return res.status(400).send('Invalid signature');
  const event = JSON.parse(req.body);
  if (event.event === 'charge.success') {
    const ref = event.data.reference;
    db.query("UPDATE orders SET status='paid', paystack_ref=? WHERE reference=?", [ref, ref]).catch(console.error);
  }
  res.sendStatus(200);
});

module.exports = router;
