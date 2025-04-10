const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  verifyPayment,
  getTransactionById,
  getUserTransactions
} = require('../controllers/paymentVerificationController');

// @route   POST /api/payments/verify
// @desc    Verify a payment transaction
// @access  Private
router.post('/verify', protect, verifyPayment);

// @route   GET /api/payments/transaction/:txnId
// @desc    Get transaction details by ID
// @access  Private
router.get('/transaction/:txnId', protect, getTransactionById);

// @route   GET /api/payments/user-transactions
// @desc    Get all transactions for a user
// @access  Private
router.get('/user-transactions', protect, getUserTransactions);

module.exports = router;
