const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  initializePayment,
  processPayment,
  getUserPurchases,
  getUserReceipts,
  downloadReceipt,
  downloadProduct,
  getReceiptData
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// @route   POST /api/payments/initialize
// @desc    Initialize payment
// @access  Private
router.post(
  '/initialize',
  [
    protect,
    [
      check('productId', 'Product ID is required').not().isEmpty(),
      check('paymentMethod', 'Payment method is required').isIn(['NayaPay', 'JazzCash', 'Easypaisa', 'JazzCashToNayaPay'])
    ]
  ],
  initializePayment
);

// @route   POST /api/payments/process
// @desc    Process payment
// @access  Private
router.post(
  '/process',
  [
    protect,
    [
      check('productId', 'Product ID is required').not().isEmpty(),
      check('paymentMethod', 'Payment method is required').isIn(['NayaPay', 'JazzCash', 'Easypaisa', 'JazzCashToNayaPay']),
      check('transactionId', 'Transaction ID is required').not().isEmpty()
    ]
  ],
  processPayment
);

// @route   GET /api/payments/purchases
// @desc    Get all user purchases
// @access  Private
router.get('/purchases', protect, getUserPurchases);

// @route   GET /api/payments/receipts
// @desc    Get user receipts
// @access  Private
router.get('/receipts', protect, getUserReceipts);

// @route   GET /api/payments/receipt/:filename
// @desc    Download receipt
// @access  Private
router.get('/receipt/:filename', protect, downloadReceipt);

// @route   GET /api/payments/receipt-data/:transactionId
// @desc    Get receipt data in JSON format
// @access  Private
router.get('/receipt-data/:transactionId', protect, getReceiptData);

// @route   GET /api/payments/download/:secureUrl
// @desc    Download product
// @access  Private
router.get('/download/:secureUrl', protect, downloadProduct);

module.exports = router;
