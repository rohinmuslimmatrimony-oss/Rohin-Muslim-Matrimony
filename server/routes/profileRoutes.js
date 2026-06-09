const express = require('express');
const router = express.Router();
const { getProfiles, getProfileById, updateMyProfile, toggleShortlist, getProfileVisitors, getContactViewers, getDailyRecommendations, recordRecommendationView } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getProfiles);
router.get('/visitors', protect, getProfileVisitors);
router.get('/contact-viewers', protect, getContactViewers);
router.get('/daily-recommendations', protect, getDailyRecommendations);
router.post('/daily-recommendations/view/:id', protect, recordRecommendationView);
router.get('/:id', protect, getProfileById);
router.put('/my-profile', protect, upload.single('profilePhoto'), updateMyProfile);
router.post('/shortlist/:id', protect, toggleShortlist);

module.exports = router;
