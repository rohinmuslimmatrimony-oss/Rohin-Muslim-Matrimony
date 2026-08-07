const express = require('express');
const router = express.Router();
const { 
  getProfiles, 
  getProfileById, 
  updateMyProfile, 
  toggleShortlist, 
  getProfileVisitors, 
  getContactViewers, 
  getDailyRecommendations, 
  recordRecommendationView,
  getMyHandpickedMatches,
  actionHandpickedMatch,
  uploadGalleryPhotos,
  deleteGalleryPhoto,
  setMainProfilePhoto
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const handleGalleryUpload = (req, res, next) => {
  upload.array('photos', 5)(req, res, function (err) {
    if (err) {
      console.error('Gallery upload multer error:', err);
      return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
    }
    next();
  });
};

router.get('/', protect, getProfiles);
router.get('/visitors', protect, getProfileVisitors);
router.get('/contact-viewers', protect, getContactViewers);
router.get('/daily-recommendations', protect, getDailyRecommendations);
router.post('/daily-recommendations/view/:id', protect, recordRecommendationView);
router.get('/handpicked', protect, getMyHandpickedMatches);
router.post('/handpicked/:id/action', protect, actionHandpickedMatch);
router.post('/gallery', protect, handleGalleryUpload, uploadGalleryPhotos);
router.delete('/gallery', protect, deleteGalleryPhoto);
router.put('/gallery/set-main', protect, setMainProfilePhoto);

router.get('/:id', protect, getProfileById);
router.put('/my-profile', protect, upload.single('profilePhoto'), updateMyProfile);
router.post('/shortlist/:id', protect, toggleShortlist);

module.exports = router;
