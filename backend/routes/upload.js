const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { 
  getDownloadFile, 
  uploadImages,
  handleImageUpload 
} = require('../controllers/uploadController');

// @route   GET /api/uploads/download/:productId
// @desc    Download a purchased product file
// @access  Private (must have purchased the product)
router.get('/download/:productId', protect, getDownloadFile);

// @route   POST /api/uploads/images
// @desc    Upload images to Cloudinary
// @access  Private/Admin
router.post('/images', [protect, admin], handleImageUpload);

module.exports = router;
