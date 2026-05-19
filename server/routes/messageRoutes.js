const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect); // Ensure all messaging operations require valid logged-in token

router.post('/', sendMessage);
router.get('/:userId', getMessages);

module.exports = router;
