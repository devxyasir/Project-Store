const Settings = require('../models/Settings');
const { validationResult } = require('express-validator');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Admin
exports.getSettings = async (req, res) => {
  try {
    // Only admins can access settings
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access settings'
      });
    }

    const settings = await Settings.getSettings();
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get payment method settings
// @route   GET /api/settings/payment-methods
// @access  Admin
exports.getPaymentMethodSettings = async (req, res) => {
  try {
    // Only admins can access settings
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access settings'
      });
    }

    const settings = await Settings.getSettings();
    
    res.json({
      success: true,
      paymentMethods: settings.paymentMethods
    });
  } catch (error) {
    console.error('Get payment method settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get active payment methods for checkout
// @route   GET /api/settings/active-payment-methods
// @access  Public
exports.getActivePaymentMethods = async (req, res) => {
  try {
    console.log('Getting active payment methods');
    
    // Use our helper method to ensure all payment methods exist
    const settings = await Settings.ensurePaymentMethodsExist();
    
    // Filter only enabled payment methods for public use
    const activePaymentMethods = {};
    
    Object.entries(settings.paymentMethods).forEach(([method, config]) => {
      if (config.enabled) {
        console.log(`Payment method ${method} is enabled:`, config);
        activePaymentMethods[method] = {
          name: method,
          accountDetails: config.accountDetails
        };
      }
    });
    
    // Explicitly log if JazzCashToNayaPay is available
    const hasJazzCashToNayaPay = !!activePaymentMethods['JazzCashToNayaPay'];
    console.log('JazzCashToNayaPay available:', hasJazzCashToNayaPay);
    if (hasJazzCashToNayaPay) {
      console.log('JazzCashToNayaPay details:', activePaymentMethods['JazzCashToNayaPay']);
    }
    
    res.json({
      success: true,
      paymentMethods: activePaymentMethods
    });
  } catch (error) {
    console.error('Get active payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update payment method settings
// @route   PUT /api/settings/payment-methods
// @access  Admin
exports.updatePaymentMethodSettings = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Only admins can update settings
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update settings'
      });
    }

    const { paymentMethods } = req.body;
    
    if (!paymentMethods) {
      return res.status(400).json({
        success: false,
        message: 'Payment method settings are required'
      });
    }
    
    const settings = await Settings.getSettings();
    
    // Update the payment methods
    settings.paymentMethods = paymentMethods;
    settings.updatedAt = Date.now();
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Payment method settings updated successfully',
      paymentMethods: settings.paymentMethods
    });
  } catch (error) {
    console.error('Update payment method settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
