const express = require('express');
const router = express.Router();
const { sendInterest, acceptInterest, rejectInterest, getRequests, getConnections, cancelInterest } = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRequests);
router.get('/connections', protect, getConnections);
router.post('/send/:id', protect, sendInterest);
router.put('/accept/:id', protect, acceptInterest);
router.put('/reject/:id', protect, rejectInterest);
router.delete('/cancel/:id', protect, cancelInterest);

module.exports = router;
