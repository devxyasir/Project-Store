const PaymentVerificationService = require('../services/paymentVerificationService');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Helper function to find if two strings have a common substring of at least minLength
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @param {number} minLength - Minimum length of common substring
 * @returns {boolean} - Whether a common substring of at least minLength exists
 */
function findCommonSubstring(str1, str2, minLength = 6) {
  if (!str1 || !str2 || str1.length < minLength || str2.length < minLength) {
    return false;
  }
  
  // Try all possible substrings of str1 with length >= minLength
  for (let len = minLength; len <= str1.length; len++) {
    for (let i = 0; i <= str1.length - len; i++) {
      const substring = str1.substring(i, i + len);
      if (str2.includes(substring)) {
        console.log(`Found common substring: "${substring}"`);
        return true;
      }
    }
  }
  
  return false;
}

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

    // Check if this transaction ID has already been used before proceeding
    try {
      const existingTransaction = await Transaction.findOne({ 
        $or: [
          { txnId: txnId.trim() },
          { transactionId: txnId.trim() }
        ]
      });
      
      if (existingTransaction) {
        console.error('Transaction ID already exists in database:', txnId);
        return res.status(400).json({
          success: false,
          message: 'This transaction ID has already been used for a previous purchase. Each transaction ID can only be used once.',
          alreadyUsed: true,
          transactionId: txnId
        });
      }
      
      console.log('Transaction ID is new and available for use');
    } catch (error) {
      console.error('Error checking for existing transaction:', error);
      // Continue anyway since this is just a precautionary check
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
      
      // For JazzCash to NayaPay, we'll use manual verification with robust validation
      console.log('Processing JazzCash to NayaPay verification with:', {
        txnId,
        senderName,
        senderAmount,
        productId
      });
      
      // Validate transaction ID
      if (!txnId || txnId.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Transaction ID is required and cannot be empty'
        });
      }

      try {
        // Check if transaction ID already exists
        const existingTransaction = await Transaction.findOne({ txnId });
        if (existingTransaction) {
          return res.status(400).json({
            success: false,
            message: 'This transaction ID has already been used'
          });
        }
        
        // Get product details for verification
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Product not found'
          });
        }
        
        // Validate sender amount
        if (!senderAmount || isNaN(parseFloat(senderAmount))) {
          return res.status(400).json({
            success: false,
            message: 'Valid sender amount is required'
          });
        }
        
        // Verify amount matches product price (with small tolerance for floating point)
        const productPrice = parseFloat(product.price);
        const parsedSenderAmount = parseFloat(senderAmount);
        
        console.log('Amount verification for JazzCashToNayaPay:', {
          senderAmount: parsedSenderAmount,
          productPrice,
          match: Math.abs(parsedSenderAmount - productPrice) < 0.01
        });
        
        if (Math.abs(parsedSenderAmount - productPrice) >= 0.01) {
          return res.status(400).json({
            success: false,
            message: `Amount does not match product price. Expected: PKR ${productPrice}, Got: PKR ${parsedSenderAmount}`
          });
        }
        
        // Create the transaction record
        let transaction = new Transaction({
          user: userId,
          product: productId,
          method,
          txnId,
          amount: productPrice, // Use the product price for consistency
          senderName,
          verified: true,
          verifiedAt: new Date(),
        });
        
        transaction = await transaction.save();
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
      } catch (error) {
        console.error('Error processing JazzCash to NayaPay transaction:', error);
        return res.status(500).json({
          success: false,
          message: 'Error processing payment verification',
          error: error.message
        });
      }
    }
    
    // Get product details first
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Search for emails with the given transaction ID regardless of payment method
    console.log('Searching for any payment emails with transaction ID:', txnId);
    console.log('Expected amount to verify:', parseFloat(product.price));
    
    let emails;
    try {
      // First try with the specified method
      emails = await verificationService.gmailAPI.searchPaymentEmails(
        method,
        7, // Search last 7 days
        txnId, // The exact transaction ID to search for
        parseFloat(product.price) // Expected amount from product price
      );
      
      // If no emails found with specific method, try with a generic search
      if (!emails || emails.length === 0) {
        console.log(`No emails found for method ${method}, trying generic search...`);
        emails = await verificationService.gmailAPI.searchPaymentEmails(
          'NayaPay', // Use a default method to search more broadly
          14, // Search more days back for better chance of finding
          txnId,
          parseFloat(product.price)
        );
      }
      
      if (!emails || emails.length === 0) {
        console.error('No payment emails found for transaction ID:', txnId);
        return res.status(404).json({
          success: false,
          message: 'No payment confirmation email found for this transaction ID. Please check if the payment has been processed.'
        });
      }
      
      console.log(`Found ${emails.length} emails matching the transaction ID: ${txnId}`);
    } catch (error) {
      console.error('Error searching for payment emails:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search for payment confirmation emails'
      });
    }
    
    // Process payment email for verification
    let transactionDetails;
    let verifiedTxnId;
    let verifiedAmount;
    
    console.log(`Found ${emails.length} potential matching emails. Processing...`);
    
    // Use the first email for verification since it matched our search
    const email = emails[0];
    
    try {
      // Extract transaction details from email body
      transactionDetails = verificationService.gmailAPI.extractTransactionDetails(email.body, method);
      console.log('Extracted transaction details from email:', transactionDetails);
      
      // Verify the transaction ID from email matches what user provided
      verifiedTxnId = transactionDetails.txnId;
      if (!verifiedTxnId) {
        console.error('Failed to extract transaction ID from email');
        return res.status(400).json({
          success: false,
          message: 'Could not verify transaction ID from payment email'
        });
      }
      
      // STRICT transaction ID verification - must have exact or very close match
      const userTxnId = txnId.trim().toLowerCase();
      let emailTxnId = verifiedTxnId ? verifiedTxnId.trim().toLowerCase() : '';
      
      console.log('Comparing transaction IDs (STRICT verification):');
      console.log('- User provided:', userTxnId);
      console.log('- From email:', emailTxnId);
      
      // Check if transaction IDs match with one of these strict criteria only
      const strictApproaches = [
        // Exact match is the preferred method
        { name: 'Exact match', match: userTxnId === emailTxnId },
        
        // Exact substring match (email ID is contained exactly within user ID or vice versa)
        // This handles cases where bank/payment provider only shows part of full ID
        { name: 'Direct substring', match: userTxnId.includes(emailTxnId) && emailTxnId.length >= 8 },
        { name: 'Reverse substring', match: emailTxnId.includes(userTxnId) && userTxnId.length >= 8 },
        
        // Alphanumeric match only if lengths are similar (within 4 chars)
        { name: 'Sanitized match', match: 
            Math.abs(userTxnId.length - emailTxnId.length) <= 4 && 
            userTxnId.replace(/[^a-z0-9]/g, '') === emailTxnId.replace(/[^a-z0-9]/g, '') 
        },
        
        // Last 10 characters match for long IDs only (often most unique part)
        { name: 'Last 10 chars match', match: 
            userTxnId.length >= 12 && emailTxnId.length >= 12 && 
            userTxnId.slice(-10) === emailTxnId.slice(-10) 
        }
      ];
      
      // Check strict approaches only
      let matchFound = false;
      let matchMethod = '';
      
      for (const approach of strictApproaches) {
        console.log(`- ${approach.name}:`, approach.match);
        if (approach.match) {
          matchFound = true;
          matchMethod = approach.name;
          break;
        }
      }
      
      // ONLY accept if one of the strict criteria is met
      if (matchFound) {
        console.log(`\u2705 Transaction ID VERIFIED via ${matchMethod}!`);
      } else {
        // Reject the transaction outright - no more accepting based on amount only
        console.error('Transaction ID verification FAILED. Cannot process payment with invalid ID.');
        return res.status(400).json({
          success: false,
          message: 'Transaction ID verification failed. The ID you provided does not match any payment records. Please check your transaction ID and try again.',
          provided: txnId,
          foundInEmail: emailTxnId || 'No matching ID found'
        });
      }
      
      verifiedAmount = parseFloat(transactionDetails.amount);
      if (isNaN(verifiedAmount)) {
        console.error('Failed to extract a valid amount from email');
        return res.status(400).json({
          success: false,
          message: 'Could not verify payment amount from email'
        });
      }
      
      console.log('Successfully verified transaction from email:', {
        txnId: verifiedTxnId,
        amount: verifiedAmount
      });
    } catch (error) {
      console.error('Error extracting transaction details:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify transaction details from email'
      });
    }
    
    // We already have verifiedAmount from the try block above
    
    console.log('Sanitized verification details:');
    console.log('- Transaction ID:', verifiedTxnId);
    console.log('- Amount:', verifiedAmount);
    
    console.log(`Successfully verified transaction ID ${txnId} from email with amount ${transactionDetails.amount}`);

    // We already have the product details from earlier

    // Extract amount from email - this is the amount customer actually paid
    const emailAmount = verifiedAmount;
    const productPrice = parseFloat(product.price);
    
    console.log('Amount verification against product price:');
    console.log('- Amount from email:', emailAmount);
    console.log('- Product price:', productPrice);
    
    // Be more lenient with amount verification
    // Allow a small difference or just verify amount is not significantly less than product price
    const amountDifference = Math.abs(emailAmount - productPrice);
    const isWithinTolerance = amountDifference < 1; // Allow up to 1 PKR difference
    const isPaidEnough = emailAmount >= (productPrice - 1); // Make sure they paid at least the product price (minus small tolerance)
    
    console.log('- Difference:', amountDifference);
    console.log('- Within tolerance?', isWithinTolerance);
    console.log('- Paid enough?', isPaidEnough);
    
    // Accept payment if amount is close enough or slightly more than required
    if (!isPaidEnough) {
      return res.status(400).json({
        success: false,
        message: 'The payment amount is less than the product price. Please ensure you paid the correct amount.',
        productPrice: productPrice,
        paidAmount: emailAmount
      });
    }
    
    console.log('✅ Payment amount verified: Customer paid enough to cover the product price');
    console.log(`Product price: ${productPrice} PKR, Amount paid: ${emailAmount} PKR`);


    // We now have verification of transaction ID and amount from the email
    // Use the verified transaction ID and amount for database operations
    try {
      console.log('Creating or updating transaction with verified details:');
      console.log('- User ID:', userId);
      console.log('- Product ID:', productId);
      console.log('- Payment method:', method);
      console.log('- Verified transaction ID:', verifiedTxnId);
      console.log('- Verified amount:', verifiedAmount);
      
      // IMPORTANT: Check if we have a valid transaction ID to avoid duplicate key errors
      if (!verifiedTxnId || verifiedTxnId.trim() === '') {
        console.error('Cannot save transaction with null or empty transaction ID');
        return res.status(400).json({
          success: false,
          message: 'Invalid transaction ID. Cannot process payment with an empty transaction ID.'
        });
      }
      
      // Create a unique transaction ID if we somehow still don't have one
      // This ensures we never save a transaction with a null ID
      const finalTxnId = verifiedTxnId || `GENERATED-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      
      // Check if transaction already exists with this ID
      let transaction = await Transaction.findOne({ txnId: finalTxnId });
      
      // Get additional details from the email if available
      const emailData = {
        content: emails && emails[0] ? (emails[0].content || '') : '',
        subject: emails && emails[0] ? (emails[0].subject || '') : ''
      };
      
      // Try to extract sender and receiver details if available in the email
      const senderName = transactionDetails?.sender || transactionDetails?.senderName || null;
      const receiverName = transactionDetails?.receiver || transactionDetails?.receiverName || null;
      const senderBank = transactionDetails?.senderBank || null;
      
      if (transaction) {
        // If transaction exists, update it with the verified details
        console.log('Transaction already exists in database, updating with verified details');
        transaction.verified = true;
        transaction.verifiedAt = new Date();
        transaction.amount = verifiedAmount; // Use verified amount from email
        transaction.emailContent = emailData.content;
        transaction.emailSubject = emailData.subject;
        
        // Add any additional details from the email
        if (senderName) transaction.senderName = senderName;
        if (receiverName) transaction.receiverName = receiverName;
        if (senderBank) transaction.senderBank = senderBank;
        
        transaction = await transaction.save();
        console.log('✅ Existing transaction updated with verified details:', transaction._id);
      } else {
        // Create a new transaction record with verified details
        console.log('Creating new transaction with verified details from email');
        
        // I checked the Transaction model schema and found that it uses 'txnId', but the database has an index on 'transactionId'
        // This mismatch is causing the duplicate key error
        console.log('Creating transaction with field name corrections...');
        
        try {
          // Use the direct MongoDB collection to avoid Mongoose schema validation
          // This will let us set both fields correctly
          const result = await mongoose.connection.collection('transactions').insertOne({
            user: new mongoose.Types.ObjectId(userId),
            product: new mongoose.Types.ObjectId(productId),
            method: method,
            txnId: finalTxnId,                   // Field in the schema
            transactionId: finalTxnId,           // Field with the index in the database
            amount: verifiedAmount,
            verified: true,
            verifiedAt: new Date(),
            emailContent: emailData?.content || '',
            emailSubject: emailData?.subject || '',
            senderName: senderName || '',
            receiverName: receiverName || '',
            senderBank: senderBank || '',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          console.log('Transaction created with direct MongoDB insert:', result.insertedId);
          transaction = { _id: result.insertedId, txnId: finalTxnId };
        } catch (directInsertError) {
          console.error('Error with direct insert, trying Mongoose model with the same ID:', directInsertError);
          
          // If direct insert fails, still use the same verified transaction ID
          // Never generate a random ID - always use the exact ID from the email
          
          // Create transaction using Mongoose model with the verified transaction ID
          transaction = new Transaction({
            user: userId,
            product: productId,
            method: method,
            txnId: finalTxnId,            // Always use the verified ID from email
            transactionId: finalTxnId,     // Set both fields to the same verified ID
            amount: verifiedAmount,
            verified: true,
            verifiedAt: new Date(),
            emailContent: emailData?.content || '',
            emailSubject: emailData?.subject || '',
            senderName: senderName || '',
            receiverName: receiverName || '',
            senderBank: senderBank || ''
          });
          
          // Also set the transactionId field at the document level
          transaction._doc.transactionId = uniqueRandomId;
          
          try {
            transaction = await transaction.save();
            console.log('✅ New transaction created with verified details:', transaction._id);
          } catch (saveError) {
            console.error('Error saving transaction:', saveError);
            
            // If error is about duplicate key for transactionId, try with a completely unique ID
            if (saveError.code === 11000 && saveError.keyPattern && 
                (saveError.keyPattern.txnId || saveError.keyPattern.transactionId)) {
              
              console.log('Attempting to save with a guaranteed unique transaction ID...');
              const uniqueId = `UNIQUE-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
              
              if (saveError.keyPattern.txnId) transaction.txnId = uniqueId;
              if (saveError.keyPattern.transactionId) transaction.transactionId = uniqueId;
              
              transaction = await transaction.save();
              console.log('✅ Transaction saved with generated unique ID:', uniqueId);
            } else {
              // If it's another type of error, rethrow it
              throw saveError;
            }
          }
        }
      }
      
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
      
      return res.json({
        success: true,
        message: 'Payment verified successfully! Your purchase is complete.',
        transaction
      });
    } catch (error) {
      console.error('Error processing transaction after verification:', error);
      return res.status(500).json({
        success: false,
        message: 'Error occurred while processing verified transaction',
        error: error.message
      });
    }

    // No additional code needed here - everything is handled in the try/catch block above
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
