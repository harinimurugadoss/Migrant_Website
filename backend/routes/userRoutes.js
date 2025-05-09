const express = require('express');
const router = express.Router();
const {
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  getAllWorkers,
  approveWorker,
  rejectWorker
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// User routes
router.get('/me', protect, getCurrentUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Admin routes
router.get('/admin/workers', protect, isAdmin, getAllWorkers);
router.put('/admin/workers/:id/approve', protect, isAdmin, approveWorker);
router.put('/admin/workers/:id/reject', protect, isAdmin, rejectWorker);

module.exports = router;
