const express     = require('express');
const cloudinary  = require('cloudinary').v2;
const multer      = require('multer');
const requireAuth = require('../middleware/auth');
const router      = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')),
});

// POST /api/upload
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'house-of-moo/products', transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }] },
        (err, r) => err ? reject(err) : resolve(r)
      ).end(req.file.buffer);
    });
    res.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
