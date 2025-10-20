const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists (robust for production deploys)
const uploadDir = path.join(__dirname, '../uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  // If directory creation fails, surface a clear error later when handling upload
  console.error('Failed to ensure uploads directory exists:', e);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// POST /api/upload
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  // Build absolute URL for cross-domain frontends
  const configuredBase = process.env.API_BASE_URL;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const baseUrl = configuredBase || `${protocol}://${host}`;
  const url = `${baseUrl}/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router; 