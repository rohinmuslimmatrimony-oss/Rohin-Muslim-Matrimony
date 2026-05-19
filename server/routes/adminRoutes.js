const express = require('express');
const router = express.Router();
const { getMetrics, getAllUsers, deleteUser, changePlan, updateLimit, getAllReports, verifyUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes under this admin router to protect and authorize only administrators
router.use(protect);
router.use(authorize('admin'));

router.get('/metrics', getMetrics);
router.get('/users', getAllUsers);
router.put('/users/plan/:id', changePlan);
router.put('/users/limit/:id', updateLimit);
router.delete('/users/:id', deleteUser);
router.get('/reports', getAllReports);
router.put('/verify/:id', verifyUser);

const { getSettings, updateSettings } = require('../controllers/adminController');
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
