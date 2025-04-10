const GmailAPI = require('../utils/gmailApi');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * Payment verification service
 * Handles verification of payments from NayaPay, JazzCash, and EasyPaisa
 * by checking transaction details in emails
 */
class PaymentVerificationService {
  constructor(gmailEmail, gmailAppPassword) {
    this.gmailAPI = new GmailAPI(gmailEmail, gmailAppPassword);
    this.initialized = false;
  }

  /**
   * Initialize the payment verification service
   */
  init() {
    this.initialized = this.gmailAPI.initialize();
    return this.initialized;
  }

  /**
   * Verify a payment transaction by checking email
   * @param {string} paymentMethod - NayaPay, JazzCash, or EasyPaisa
   * @param {string} userProvidedTxnId - Transaction ID provided by the user
   * @param {number} expectedAmount - Expected amount to verify
   * @param {string} userId - User ID making the payment
   * @param {string} productId - Product ID being purchased
   * @param {string} senderAccount - Sender account name for JazzCash to NayaPay transfers
   * @returns {Promise<Object>} - Verification result
   */
  async verifyPayment(paymentMethod, userProvidedTxnId, expectedAmount, userId, productId, senderAccount = null) {
    try {
      if (!this.initialized) {
        await this.init();
      }
      
      // Validate payment method for JazzCash to NayaPay
      if (paymentMethod === 'JazzCashToNayaPay' && !senderAccount) {
        return {
          success: false,
          message: 'Sender account name is required for JazzCash to NayaPay transfers',
          errorType: 'MISSING_SENDER_ACCOUNT'
        };
      }
      
      // Step 1: Check if transaction ID already exists
      const existingTransaction = await Transaction.findOne({ txnId: userProvidedTxnId });
      if (existingTransaction) {
        return {
          success: false,
          message: 'This transaction ID has already been used',
          errorType: 'DUPLICATE_TRANSACTION',
          existingTransaction
        };
      }
      
      // Step 2: Search for payment emails with the specific transaction ID
      console.log(`Verifying payment for transaction ID: ${userProvidedTxnId}, amount: ${expectedAmount}, method: ${paymentMethod}`);
      
      // Pass the transaction ID and expected amount for more targeted search
      const emails = await this.gmailAPI.searchPaymentEmails(paymentMethod, 7, userProvidedTxnId, expectedAmount);
      
      if (!emails || emails.length === 0) {
        console.log('No matching emails found');
        return {
          success: false,
          message: `No ${paymentMethod} payment confirmation found for transaction ID ${userProvidedTxnId}`,
          errorType: 'NO_EMAILS_FOUND'
        };
      }
      
      // Step 3: Process emails to find matching transaction
      let matchingTransaction = null;
      let foundTxnId = false;
      
      for (const email of emails) {
        console.log(`Processing email with subject: ${email.subject}`);
        const details = this.gmailAPI.extractTransactionDetails(email.body, paymentMethod);
        
        if (!details.valid) {
          console.log('Email content not valid for transaction details');
          continue;
        }
        
        // Verify transaction ID match
        console.log(`Comparing txn IDs: ${details.txnId} vs ${userProvidedTxnId}`);
        
        const txnIdMatch = details.txnId.trim().toLowerCase() === userProvidedTxnId.trim().toLowerCase();
        if (txnIdMatch) {
          foundTxnId = true;
        } else {
          continue; // Try the next email if this one doesn't match
        }
        
        // For JazzCash to NayaPay, verify sender and receiver account names
        if (paymentMethod === 'JazzCashToNayaPay') {
          if (!details.sender) {
            return {
              success: false,
              message: 'Sender account name not found in email',
              errorType: 'MISSING_SENDER_INFO'
            };
          }
          
          if (!details.receiver) {
            return {
              success: false,
              message: 'Receiver account name not found in email',
              errorType: 'MISSING_RECEIVER_INFO'
            };
          }
          
          // Verify sender account name matches exactly (case-sensitive)
          if (details.sender.trim() !== senderAccount.trim()) {
            return {
              success: false,
              message: `Sender account name mismatch. Expected: ${senderAccount}, Found: ${details.sender}`,
              errorType: 'SENDER_ACCOUNT_MISMATCH'
            };
          }
          
          // Verify Raast ID exists
          if (!details.raastId) {
            return {
              success: false,
              message: 'Raast ID not found in email',
              errorType: 'MISSING_RAAST_ID'
            };
          }
          
          // Verify transaction time exists
          if (!details.time) {
            return {
              success: false,
              message: 'Transaction time not found in email',
              errorType: 'MISSING_TRANSACTION_TIME'
            };
          }
        }
        
        // Verify amount match - allow a small tolerance (0.01) for rounding errors
        console.log(`Comparing amounts: ${details.amount} vs ${expectedAmount}`);
        const amountDiff = Math.abs(parseFloat(details.amount) - parseFloat(expectedAmount));
        const isAmountValid = amountDiff < 0.01;
        
        // Verify currency is PKR
        const isCurrencyValid = details.currency === 'PKR';
        
        console.log(`Amount valid: ${isAmountValid}, Currency valid: ${isCurrencyValid}`);
        
        if (isAmountValid && isCurrencyValid) {
          matchingTransaction = {
            ...details,
            emailDate: email.date
          };
          break;
        } else {
          return {
            success: false,
            message: 'Amount or currency mismatch',
            errorType: 'AMOUNT_MISMATCH',
            details
          };
        }
      }
      
      if (foundTxnId && matchingTransaction) {
        // Step 4: Create and save the verified transaction
        const product = await Product.findById(productId);
        if (!product) {
          return {
            success: false,
            message: 'Product not found',
            errorType: 'PRODUCT_NOT_FOUND'
          };
        }
        
        const user = await User.findById(userId);
        if (!user) {
          return {
            success: false,
            message: 'User not found',
            errorType: 'USER_NOT_FOUND'
          };
        }
        
        console.log('Creating transaction record in database...');
        try {
          // Create the transaction
          const transaction = new Transaction({
            user: userId,
            product: productId,
            method: paymentMethod,
            txnId: userProvidedTxnId,
            amount: expectedAmount,
            verified: true,
            verifiedAt: new Date(),
            senderAccount: paymentMethod === 'JazzCashToNayaPay' ? details.sender : null,
            receiverAccount: paymentMethod === 'JazzCashToNayaPay' ? details.receiver : null,
            raastId: paymentMethod === 'JazzCashToNayaPay' ? details.raastId : null,
            transactionTime: paymentMethod === 'JazzCashToNayaPay' ? details.time : null
          });
          
          await transaction.save();
          console.log('Transaction saved:', transaction._id);
          
          // Add product to user's purchases if not already there
          const userIdStr = userId.toString();
          const buyersArray = product.buyers || [];
          
          // Make sure buyers exists and is an array
          if (!Array.isArray(product.buyers)) {
            product.buyers = [];
          }
          
          // Check if user already owns this product
          const userAlreadyOwnsProduct = buyersArray.some(id => id.toString() === userIdStr);
          
          if (!userAlreadyOwnsProduct) {
            console.log('Adding user to product buyers list');
            product.buyers.push(userId);
            await product.save();
            console.log('Product buyers list updated');
          } else {
            console.log('User already owns this product');
          }
          
          // Return the transaction data
          const transactionData = await Transaction.findById(transaction._id)
            .populate('user', 'name email')
            .populate('product', 'title price images');
          return {
            success: true,
            message: 'Payment successfully verified',
            transaction: transactionData
          };
        } catch (error) {
          console.error('Error saving transaction:', error);
          throw error;
        }
      } else if (foundTxnId) {
        return {
          success: false,
          message: 'Transaction ID found but verification failed',
          errorType: 'VERIFICATION_FAILED'
        };
      } else {
        return {
          success: false,
          message: `Transaction ID not found in recent ${paymentMethod} emails`,
          errorType: 'TXNID_NOT_FOUND'
        };
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: `Error verifying payment: ${error.message}`,
        errorType: 'SERVER_ERROR'
      };
    }
  }
  
  /**
   * Get transaction details by ID
   * @param {string} txnId - Transaction ID to look up
   * @returns {Promise<Object>} - Transaction details
   */
  async getTransactionById(txnId) {
    try {
      const transaction = await Transaction.findOne({ txnId })
        .populate('user', 'name email')
        .populate('product', 'title price images');
        
      if (!transaction) {
        return {
          success: false,
          message: 'Transaction not found'
        };
      }
      
      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('Error getting transaction:', error);
      return {
        success: false,
        message: `Error retrieving transaction: ${error.message}`
      };
    }
  }
}

module.exports = PaymentVerificationService;
