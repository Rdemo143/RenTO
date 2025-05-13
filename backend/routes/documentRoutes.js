const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  uploadDocument,
  getPropertyDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  addSignature
} = require('../controllers/documentController');

// Configure multer for file upload
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Document routes
router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/property/:propertyId', protect, getPropertyDocuments);
router.get('/:documentId', protect, getDocument);
router.put('/:documentId', protect, updateDocument);
router.delete('/:documentId', protect, deleteDocument);
router.post('/:documentId/sign', protect, addSignature);

module.exports = router; 