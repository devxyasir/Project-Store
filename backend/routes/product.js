const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getProducts, 
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  downloadProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const { 
  uploadProductImages,
  verifyPurchase 
} = require('../controllers/uploadController');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', getProducts);

// @route   GET /api/products/id/:id
// @desc    Get product by ID (for admin editing)
// @access  Private/Admin
router.get('/id/:id', [protect, admin], getProductById);

// @route   GET /api/products/:slug
// @desc    Get single product by slug
// @access  Public
router.get('/:slug', getProductBySlug);

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Admin
router.post(
  '/',
  [
    protect,
    admin,
    uploadProductImages
  ],
  createProduct
);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put(
  '/:id',
  [
    protect,
    admin,
    uploadProductImages
  ],
  updateProduct
);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', [protect, admin], deleteProduct);

// @route   GET /api/products/:productId/download
// @desc    Verify purchase and get download link
// @access  Private
router.get('/:productId/download', protect, downloadProduct);

// @route   GET /api/products/:productId/verify-purchase
// @desc    Verify purchase before allowing download
// @access  Private
router.get('/:productId/verify-purchase', protect, verifyPurchase);

module.exports = router;
