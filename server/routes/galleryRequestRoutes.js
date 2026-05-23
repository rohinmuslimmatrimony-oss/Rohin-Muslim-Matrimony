const express = require('express');
const router = express.Router();
const { sendGalleryRequest, getGalleryRequests, acceptGalleryRequest, rejectGalleryRequest } = require('../controllers/galleryRequestController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getGalleryRequests);
router.post('/send/:id', protect, sendGalleryRequest);
router.put('/accept/:id', protect, acceptGalleryRequest);
router.put('/reject/:id', protect, rejectGalleryRequest);

module.exports = router;
