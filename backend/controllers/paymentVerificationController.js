const PaymentVerificationService = require('../services/paymentVerificationService');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const dotenv = require('dotenv');

dotenv.config();

// Initialize the payment verification service with Gmail credentials
const verificationService = new PaymentVerificationService(
  process.env.GMAIL_EMAIL,
  process.env.GMAIL_APP_PASSWORD
);

/**
 * Verify a payment transaction
 * @route POST /api/payments/verify
 * @access Private
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { method, txnId, productId, senderName, senderAmount } = req.body;
    const userId = req.user._id; // Note: MongoDB ObjectId

    // Validate required fields
    if (!method || !txnId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Payment method, transaction ID, and product ID are required'
      });
    }

    // Validate payment method
    const validMethods = ['NayaPay', 'JazzCash', 'Easypaisa', 'JazzCashToNayaPay'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }
    
    // For JazzCash to NayaPay, we need sender name
    if (method === 'JazzCashToNayaPay') {
      if (!senderName) {
        return res.status(400).json({
          success: false,
          message: 'Sender name is required for JazzCash to NayaPay transfers'
        });
      }
      
      if (!senderAmount) {
        return res.status(400).json({
          success: false,
          message: 'Sender amount is required for JazzCash to NayaPay transfers'
        });
      }
      
      // For JazzCash to NayaPay, we'll use manual verification
      console.log('Processing JazzCash to NayaPay verification with:', {
        txnId,
        senderName,
        senderAmount,
        productId
      });
      
      // Check if transaction ID already exists
      const existingTransaction = await Transaction.findOne({ txnId });
      if (existingTransaction) {
        return res.status(400).json({
          success: false,
          message: 'This transaction ID has already been used'
        });
      }
      
      // Create a verified transaction directly (manual verification)
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Verify amount matches product price
      if (parseFloat(senderAmount) !== parseFloat(product.price)) {
        console.log(`Amount mismatch: Expected: ${product.price}, Got: ${senderAmount}`);
        return res.status(400).json({
          success: false,
          message: `Amount does not match product price. Expected: PKR ${product.price}, Got: PKR ${senderAmount}`
        });
      }
      
      // Create the transaction record
      const transaction = new Transaction({
        user: userId,
        product: productId,
        method,
        txnId,
        amount: product.price,
        senderName,
        verified: true,
        verifiedAt: new Date(),
      });
      
      await transaction.save();
      console.log('JazzCash to NayaPay transaction created:', transaction._id);
      
      // Update product's buyers list if user isn't already a buyer
      if (!product.buyers || !product.buyers.includes(userId)) {
        // Initialize buyers array if it doesn't exist
        if (!product.buyers) {
          product.buyers = [];
        }
        
        // Add the user to the buyers list
        product.buyers.push(userId);
        await product.save();
        console.log(`User ${userId} added to buyers list for product ${productId}`);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully! Your purchase is complete.',
        transaction
      });
    }
    
    // For other payment methods, use email verification
    // Initialize the API if it's not already initialized
    if (!verificationService.initialized) {
      await verificationService.init();
    }
    
    // Access searchPaymentEmails through the gmailAPI property
    const emails = await verificationService.gmailAPI.searchPaymentEmails(
      method,
      7, // Search last 7 days
      txnId,
      req.body.amount
    );

    if (emails.length === 0) {
      console.log(`No matching payment email found for method: ${method}, txnId: ${txnId}`);
      return res.status(400).json({
        success: false,
        message: 'No matching payment found. Please check your transaction ID and try again.'
      });
    }

    // Extract transaction details from the email
    const transactionDetails = verificationService.gmailAPI.extractTransactionDetails(emails[0].body, method);

    // Verify transaction details
    if (!transactionDetails) {
      return res.status(400).json({
        success: false,
        message: 'Failed to extract transaction details from email'
      });
    }

    // Verify transaction ID
    if (transactionDetails.txnId !== txnId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID does not match',
        expected: txnId,
        found: transactionDetails.txnId
      });
    }

    // Verify amount if available
    if (transactionDetails.amount && parseFloat(transactionDetails.amount) !== parseFloat(req.body.amount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount does not match',
        expected: req.body.amount,
        found: transactionDetails.amount
      });
    }

    // Create or update transaction record
    const transaction = await Transaction.findOneAndUpdate(
      { txnId },
      {
        user: userId,
        product: productId,
        method,
        txnId,
        amount: req.body.amount,
        verified: true,
        verifiedAt: new Date(),
        emailContent: emails[0].content,
        emailSubject: emails[0].subject
      },
      { upsert: true, new: true }
    );
    
    // Update product's buyers list if user isn't already a buyer
    const product = await Product.findById(productId);
    if (product && (!product.buyers || !product.buyers.includes(userId))) {
      // Initialize buyers array if it doesn't exist
      if (!product.buyers) {
        product.buyers = [];
      }
      
      // Add the user to the buyers list
      product.buyers.push(userId);
      await product.save();
      console.log(`User ${userId} added to buyers list for product ${productId}`);
    }

    // Log successful transaction
    console.log(`Transaction verified successfully for user: ${userId}, product: ${productId}, method: ${method}`);
    
    res.json({
      success: true,
      message: 'Payment verified successfully! Your purchase is complete.',
      transaction
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

/**
 * Get transaction details by ID
 * @route GET /api/payments/transaction/:txnId
 * @access Private
 */
exports.getTransactionById = async (req, res) => {
  try {
    const { txnId } = req.params;
    
    if (!txnId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }
    
    const result = await verificationService.getTransactionById(txnId);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
};

/**
 * Get all transactions for a user
 * @route GET /api/payments/user-transactions
 * @access Private
 */
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const transactions = await Transaction.find({ user: userId })
      .populate('product', 'title price images')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Error getting user transactions:', error);
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
};
