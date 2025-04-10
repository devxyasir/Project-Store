const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getUsers,
  getUserById,
  updateUserRole,
  getTransactions,
  verifyTransaction,
  getPaymentMethodSettings,
  updatePaymentMethodSettings,
  deleteTransaction,
  deleteUser,
  deleteUserProductPurchase
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// Apply protect and admin middleware to all routes
router.use(protect, admin);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', getUsers);

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/users/:id', getUserById);

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put(
  '/users/:id/role',
  [
    check('role', 'Role is required').isIn(['user', 'admin'])
  ],
  updateUserRole
);

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user and all associated data
// @access  Private/Admin
router.delete('/users/:id', deleteUser);

// @route   DELETE /api/admin/users/:userId/products/:productId
// @desc    Delete a specific product purchase for a user
// @access  Private/Admin
router.delete('/users/:userId/products/:productId', deleteUserProductPurchase);

// @route   GET /api/admin/transactions
// @desc    Get all transactions
// @access  Private/Admin
router.get('/transactions', getTransactions);

// @route   PUT /api/admin/transactions/:id/verify
// @desc    Verify transaction
// @access  Private/Admin
router.put('/transactions/:id/verify', verifyTransaction);

// @route   DELETE /api/admin/transactions/:id
// @desc    Delete a transaction
// @access  Private/Admin
router.delete('/transactions/:id', deleteTransaction);

// @route   GET /api/admin/settings/payment-methods
// @desc    Get payment methods settings
// @access  Private/Admin
router.get('/settings/payment-methods', getPaymentMethodSettings);

// @route   PUT /api/admin/settings/payment-methods
// @desc    Update payment method settings
// @access  Private/Admin
router.put(
  '/settings/payment-methods',
  [
    check('method', 'Method is required').isIn(['NayaPay', 'JazzCash', 'Easypaisa']),
    check('enabled', 'Enabled status is required').isBoolean(),
    check('name', 'Name is required').not().isEmpty(),
    check('number', 'Number is required').not().isEmpty()
  ],
  updatePaymentMethodSettings
);

module.exports = router;
