const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { 
  getSettings, 
  getPaymentMethodSettings, 
  getActivePaymentMethods, 
  updatePaymentMethodSettings 
} = require('../controllers/settingsController');

// All routes start with /api/settings
// Get all settings (admin only)
router.get('/', protect, admin, getSettings);

// Get payment method settings (admin only)
router.get('/payment-methods', protect, admin, getPaymentMethodSettings);

// Get active payment methods (public)
router.get('/active-payment-methods', getActivePaymentMethods);

// Update payment method settings (admin only)
router.put('/payment-methods', protect, admin, updatePaymentMethodSettings);

module.exports = router;
