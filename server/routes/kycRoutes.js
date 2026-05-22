const express = require('express');
const router = express.Router();
const { submitKyc, getMyKycStatus } = require('../controllers/kycController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/submit', upload.single('document'), submitKyc);
router.get('/status', getMyKycStatus);

module.exports = router;
