const express = require('express');
const router = express.Router();
const { 
  getMetrics, 
  getAllUsers, 
  deleteUser, 
  changePlan, 
  updateLimit, 
  getAllReports, 
  verifyUser,
  getSettings, 
  updateSettings,
  getAllSuccessStories,
  createSuccessStory,
  updateSuccessStory,
  deleteSuccessStory,
  createOfflineUser,
  getFreeTierInterests,
  deleteFreeInterest,
  getKycRequests,
  reviewKycRequest,
  suggestMatch
} = require('../controllers/adminController');


const { protect, authorize } = require('../middleware/auth');

// Protect all routes under this admin router to protect and authorize only administrators
router.use(protect);
router.use(authorize('admin'));

router.get('/metrics', getMetrics);
router.get('/users', getAllUsers);
router.post('/users/create', createOfflineUser);
router.put('/users/plan/:id', changePlan);
router.put('/users/limit/:id', updateLimit);
router.delete('/users/:id', deleteUser);
router.get('/reports', getAllReports);
router.put('/verify/:id', verifyUser);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

const upload = require('../middleware/upload');

// Success stories CRUD
router.get('/success-stories', getAllSuccessStories);
router.post('/success-stories', upload.array('images', 5), createSuccessStory);
router.put('/success-stories/:id', upload.array('images', 5), updateSuccessStory);
router.delete('/success-stories/:id', deleteSuccessStory);

// Free-tier interest management
router.get('/free-interests', getFreeTierInterests);
router.delete('/free-interests/:id', deleteFreeInterest);

// KYC Verification management
router.get('/kyc', getKycRequests);
router.put('/kyc/:id', reviewKycRequest);

// Admin Match Suggestion
router.post('/suggest-match', suggestMatch);

module.exports = router;
