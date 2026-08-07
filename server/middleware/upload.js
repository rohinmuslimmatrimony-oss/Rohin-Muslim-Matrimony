const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique name: userId + timestamp + extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|webp|gif|bmp|jfif|heic|avif/i;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = file.mimetype && (file.mimetype.startsWith('image/') || filetypes.test(file.mimetype));

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only valid image files (JPG, PNG, WEBP, etc.) are allowed!'));
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per photo
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
