const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getUserDocuments,
  deleteDocument,
  getAllDocuments,
  approveDocument,
  rejectDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const upload = require('../config/multer');

// Document routes
router.post('/', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getUserDocuments);
router.delete('/:id', protect, deleteDocument);

// Admin routes
router.get('/admin/documents', protect, isAdmin, getAllDocuments);
router.put('/admin/documents/:id/approve', protect, isAdmin, approveDocument);
router.put('/admin/documents/:id/reject', protect, isAdmin, rejectDocument);

module.exports = router;
