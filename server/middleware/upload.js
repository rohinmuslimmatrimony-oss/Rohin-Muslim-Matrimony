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
  // Broad regex for image types
  const filetypes = /jpeg|jpg|png|webp|gif|bmp|jfif|heic|heif|avif|tiff|svg/i;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const isImageMime = file.mimetype && (file.mimetype.startsWith('image/') || filetypes.test(file.mimetype) || file.mimetype === 'application/octet-stream');

  if (isImageMime || extname || !path.extname(file.originalname)) {
    return cb(null, true);
  } else {
    cb(new Error('Only valid image files (JPG, PNG, WEBP, etc.) are allowed!'));
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 25 * 1024 * 1024, // 25MB per photo for high-res phone cameras
    fieldSize: 25 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
