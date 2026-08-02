const express     = require('express');
const multer      = require('multer');
const supabase    = require('../config/db');
const requireAuth = require('../middleware/auth');
const router      = express.Router();

const BUCKET = 'product-images';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')),
});

// POST /api/upload — stores product photos in Supabase Storage
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
  try {
    const ext = (req.file.originalname.match(/\.[^.]+$/) || [''])[0];
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (uploadErr) throw uploadErr;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    res.json({ success: true, url: data.publicUrl, path });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
