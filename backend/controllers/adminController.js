const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Receipt = require('../models/Receipt');
const { validationResult } = require('express-validator');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'purchases',
        populate: {
          path: 'product',
          select: 'title price'
        }
      });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { role } = req.body;
    
    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }
    
    // Check if user exists
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }
    
    // Update user role
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
exports.getTransactions = async (req, res) => {
  try {
    const { verified, limit = 10, page = 1 } = req.query;
    
    const queryObj = {};
    
    if (verified === 'true') {
      queryObj.verified = true;
    } else if (verified === 'false') {
      queryObj.verified = false;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const transactions = await Transaction.find(queryObj)
      .populate('user', 'name email')
      .populate('product', 'title price')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await Transaction.countDocuments(queryObj);
    
    res.json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Verify transaction
// @route   PUT /api/admin/transactions/:id/verify
// @access  Private/Admin
exports.verifyTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    if (transaction.verified) {
      return res.status(400).json({
        success: false,
        message: 'Transaction already verified'
      });
    }
    
    // Update transaction
    transaction.verified = true;
    transaction.verifiedAt = Date.now();
    await transaction.save();
    
    // Update user purchases
    await User.findByIdAndUpdate(transaction.user, {
      $push: { purchases: transaction._id }
    });
    
    // Update product buyers
    await Product.findByIdAndUpdate(transaction.product, {
      $push: { buyers: transaction.user }
    });
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Verify transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get payment methods settings
// @route   GET /api/admin/settings/payment-methods
// @access  Private/Admin
exports.getPaymentMethodSettings = async (req, res) => {
  try {
    // In a real app, this would come from a settings collection in the database
    // For simplicity, we'll use hardcoded values
    const paymentMethods = {
      NayaPay: {
        enabled: true,
        name: 'Project Store',
        number: '03001234567'
      },
      JazzCash: {
        enabled: true,
        name: 'Project Store',
        number: '03001234567'
      },
      Easypaisa: {
        enabled: true,
        name: 'Project Store',
        number: '03001234567'
      }
    };
    
    res.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update payment method settings
// @route   PUT /api/admin/settings/payment-methods
// @access  Private/Admin
exports.updatePaymentMethodSettings = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { method, enabled, name, number } = req.body;
    
    // Validate method
    if (!['NayaPay', 'JazzCash', 'Easypaisa'].includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }
    
    // In a real app, this would update a settings collection in the database
    // For simplicity, we'll just return a success response
    
    res.json({
      success: true,
      message: `${method} settings updated`,
      paymentMethod: {
        method,
        enabled,
        name,
        number
      }
    });
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/admin/transactions/:id
// @access  Private/Admin
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    const userId = transaction.user;
    const productId = transaction.product;
    
    // Delete receipts associated with this transaction
    await Receipt.deleteMany({ transaction: transaction._id });
    
    // Remove transaction from user's purchases
    await User.findByIdAndUpdate(userId, {
      $pull: { purchases: transaction._id }
    });
    
    // Remove user from product's buyers list
    await Product.findByIdAndUpdate(productId, {
      $pull: { buyers: userId }
    });
    
    // Delete the transaction
    await transaction.deleteOne();
    
    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete a user and all associated data
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find all transactions for this user
    const transactions = await Transaction.find({ user: userId });
    
    // Delete all receipts associated with user's transactions
    for (const transaction of transactions) {
      await Receipt.deleteMany({ transaction: transaction._id });
    }
    
    // Delete all transactions made by this user
    await Transaction.deleteMany({ user: userId });
    
    // Remove user from all products' buyers lists
    await Product.updateMany(
      { buyers: userId },
      { $pull: { buyers: userId } }
    );
    
    // Delete the user
    await user.deleteOne();
    
    res.json({
      success: true,
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete a specific product purchase for a user
// @route   DELETE /api/admin/users/:userId/products/:productId
// @access  Private/Admin
exports.deleteUserProductPurchase = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    // Find transactions matching this user and product
    const transactions = await Transaction.find({
      user: userId,
      product: productId
    });
    
    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No purchase record found for this user and product'
      });
    }
    
    // Delete receipts associated with these transactions
    for (const transaction of transactions) {
      await Receipt.deleteMany({ transaction: transaction._id });
      
      // Remove transaction from user's purchases
      await User.findByIdAndUpdate(userId, {
        $pull: { purchases: transaction._id }
      });
    }
    
    // Delete the transactions
    await Transaction.deleteMany({
      user: userId,
      product: productId
    });
    
    // Remove user from product's buyers list
    await Product.findByIdAndUpdate(productId, {
      $pull: { buyers: userId }
    });
    
    res.json({
      success: true,
      message: 'Product purchase deleted successfully for user',
      count: transactions.length
    });
  } catch (error) {
    console.error('Delete user product purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
