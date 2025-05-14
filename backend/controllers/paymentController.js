const Transaction = require('../models/Transaction');
const Receipt = require('../models/Receipt');
const User = require('../models/User');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PaymentVerificationService = require('../services/paymentVerificationService');
const { validationResult } = require('express-validator');

// Helper to generate secure download URL
const generateSecureUrl = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Helper to ensure uploads directory exists
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// @desc    Initialize payment (before transaction ID is entered)
// @route   POST /api/payments/initialize
// @access  Private
exports.initializePayment = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId, paymentMethod } = req.body;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get settings to check enabled payment methods
    const settings = await Settings.getSettings();
    const paymentMethods = settings.paymentMethods || {};
    
    // Check if the requested payment method exists and is enabled
    if (!paymentMethods[paymentMethod] || !paymentMethods[paymentMethod].enabled) {
      return res.status(400).json({
        success: false,
        message: 'The selected payment method is not available'
      });
    }
    
    // Get payment account details from settings
    const paymentDetails = {};
    Object.entries(paymentMethods).forEach(([method, config]) => {
      if (config.enabled) {
        paymentDetails[method] = config.accountDetails;
      }
    });

    // Log payment details for debugging
    console.log('Payment details for method', paymentMethod, ':', paymentDetails[paymentMethod]);
    
    // Default recipient values in case account details are incomplete
    const defaultRecipient = {
      name: 'Project Store',
      number: '03000000000'
    };
    
    // Special handling for different payment methods
    const methodDetails = paymentDetails[paymentMethod] || {};
    
    // Construct response
    const paymentResponse = {
      success: true,
      paymentInfo: {
        productId,
        productTitle: product.title,
        amount: product.price,
        method: paymentMethod
      }
    };
    
    // Add recipient details if they exist
    if (methodDetails.name) {
      paymentResponse.paymentInfo.recipientName = methodDetails.name;
    } else {
      paymentResponse.paymentInfo.recipientName = defaultRecipient.name;
    }
    
    if (methodDetails.number) {
      paymentResponse.paymentInfo.recipientNumber = methodDetails.number;
    } else {
      paymentResponse.paymentInfo.recipientNumber = defaultRecipient.number;
    }
    
    // Add RAAST ID for JazzCash to NayaPay if available
    if (paymentMethod === 'JazzCashToNayaPay' && methodDetails.raastId) {
      paymentResponse.paymentInfo.raastId = methodDetails.raastId;
    }
    
    res.json(paymentResponse);
  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Process payment after transaction ID is entered
// @route   POST /api/payments/process
// @access  Private
exports.processPayment = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('Processing payment request:', req.body);

    const { productId, paymentMethod, transactionId, amount, senderName, senderAmount } = req.body;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify the expected amount matches the product price
    const expectedAmount = parseFloat(amount || product.price);
    if (expectedAmount !== product.price) {
      return res.status(400).json({
        success: false,
        message: 'The payment amount does not match the product price'
      });
    }

    // Use the payment verification service to verify the payment
    const verificationService = new PaymentVerificationService(
      process.env.GMAIL_EMAIL, 
      process.env.GMAIL_APP_PASSWORD
    );
    
    // Initialize verification result variable
    let verificationResult;
    
    // Check if this is a JazzCash to NayaPay transfer
    if (paymentMethod === 'JazzCashToNayaPay') {
      // For JazzCash to NayaPay transfers, we need to validate the sender name and amount
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
      
      // Make sure the payment amount matches the expected amount
      if (parseFloat(senderAmount) !== parseFloat(expectedAmount)) {
        return res.status(400).json({
          success: false,
          message: 'The payment amount does not match the expected amount'
        });
      }
      
      // Call verification service with extra parameters
      console.log('Verifying JazzCash to NayaPay payment with transaction ID:', transactionId);
      verificationResult = await verificationService.verifyPayment(
        paymentMethod,
        transactionId,
        expectedAmount,
        userId,
        productId,
        senderName // Pass the sender name for verification
      );
    } else {
      // Standard payment verification for other methods
      console.log('Verifying standard payment with method:', paymentMethod);
      verificationResult = await verificationService.verifyPayment(
        paymentMethod,
        transactionId,
        expectedAmount,
        userId,
        productId
      );
    }

    if (!verificationResult.success) {
      return res.status(400).json(verificationResult);
    }

    // Get the transaction data from the verification result
    const transaction = verificationResult.transaction;
    if (!transaction) {
      return res.status(500).json({
        success: false,
        message: 'Transaction verification succeeded but record not found'
      });
    }

    // Generate secure download URL if not already set
    if (!transaction.downloadUrl) {
      const secureUrl = generateSecureUrl();
      const downloadUrl = `/api/payments/download/${secureUrl}`;
      
      // Update the transaction with download URL
      transaction.downloadUrl = downloadUrl;
      await transaction.save();
    }

    // Update user purchases if not already updated
    const user = await User.findById(userId);
    if (!user.purchases.includes(transaction._id)) {
      await User.findByIdAndUpdate(userId, {
        $push: { purchases: transaction._id }
      });
    }

    // Generate receipt - ensure the directory exists
    const uploadsDir = path.join(__dirname, '../uploads/receipts');
    ensureDirectoryExists(uploadsDir);
    
    // IMPORTANT: Use transaction ID as the base filename for consistency
    // This ensures the receipt can be found when downloaded later
    const receiptFilename = `receipt-${transaction._id}.pdf`;
    const receiptPath = path.join(uploadsDir, receiptFilename);
    
    console.log('Generating receipt at path:', receiptPath);
    
    // Create PDF receipt
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(receiptPath);
    
    // Create a promise to wait for the file to finish writing
    const writePromise = new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    doc.pipe(writeStream);
    
    // Add receipt content
    doc.fontSize(20).text('PROJECT STORE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Payment Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Transaction ID: ${transactionId}`);
    doc.moveDown();
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.moveDown();
    doc.text(`Product: ${product.title}`);
    doc.moveDown();
    doc.text(`Amount: PKR ${product.price}`);
    doc.moveDown();
    doc.text(`Payment Method: ${paymentMethod}`);
    doc.moveDown();
    doc.text('Thank you for your purchase!');
    doc.moveDown(2);
    doc.text('Project Store');
    
    doc.end();
    
    // Wait for the PDF to be written
    writeStream.on('finish', async () => {
      try {
        // Create receipt record
        const receipt = await Receipt.create({
          user: userId,
          transaction: transaction._id,
          product: productId,
          pdfUrl: `/api/payments/receipt/${receiptFilename}`
        });
        
        // Update the transaction with receipt info in case needed
        await Transaction.findByIdAndUpdate(transaction._id, {
          receipt: receipt._id
        });
      } catch (err) {
        console.error('Receipt creation error:', err);
      }
    });

    res.status(201).json({
      success: true,
      transaction: {
        _id: transaction._id,
        downloadUrl: transaction.downloadUrl,
        product: {
          _id: product._id,
          title: product.title
        }
      }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all user purchases
// @route   GET /api/payments/purchases
// @access  Private
exports.getUserPurchases = async (req, res) => {
  try {
    console.log('Getting purchases for user:', req.user._id);
    
    const purchases = await Transaction.find({ 
      user: req.user._id,
      verified: true
    })
      .populate('product', 'title images shortDescription price downloadLink')
      .sort({ createdAt: -1 });

    console.log(`Found ${purchases.length} verified purchases for user`);
    
    // Check if any purchases are missing download links
    const purchasesWithMissingLinks = purchases.filter(p => 
      !p.downloadUrl || (p.product && !p.product.downloadLink)
    );
    
    if (purchasesWithMissingLinks.length > 0) {
      console.log(`Warning: ${purchasesWithMissingLinks.length} purchases missing download links`);
    }

    res.json({
      success: true,
      count: purchases.length,
      purchases
    });
  } catch (error) {
    console.error('Get purchases error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user receipts
// @route   GET /api/payments/receipts
// @access  Private
exports.getUserReceipts = async (req, res) => {
  try {
    console.log('Getting receipts for user:', req.user._id);
    
    const receipts = await Receipt.find({ user: req.user._id })
      .populate('product', 'title')
      .populate('transaction', 'txnId amount method createdAt')
      .sort({ createdAt: -1 });

    console.log(`Found ${receipts.length} receipts for user`);
    
    // If no receipts, also search for transactions for this user
    // This helps identify if there are purchases without receipts
    if (receipts.length === 0) {
      const transactions = await Transaction.find({
        user: req.user._id,
        verified: true
      })
        .populate('product', 'title')
        .sort({ createdAt: -1 });
      
      console.log(`Found ${transactions.length} verified transactions for user`);
      
      // If there are transactions but no receipts, we may need to generate receipts
      if (transactions.length > 0) {
        console.log('Warning: User has transactions but no receipts');
      }
    }

    res.json({
      success: true,
      count: receipts.length,
      receipts
    });
  } catch (error) {
    console.error('Get receipts error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Download receipt
// @route   GET /api/payments/receipt/:filename
// @access  Private
exports.downloadReceipt = async (req, res) => {
  try {
    console.log('Receipt download requested for:', req.params.filename);
    
    // Default receipt path
    let receiptPath = path.join(__dirname, '../uploads/receipts', req.params.filename);
    
    // Direct file access - check all possible locations
    const possiblePaths = [
      path.join(__dirname, '../uploads/receipts', req.params.filename),
      path.join(__dirname, 'uploads/receipts', req.params.filename),
      path.join(__dirname, '../uploads/receipts', req.params.filename.toLowerCase()),
      path.join(__dirname, '../../uploads/receipts', req.params.filename),
      path.join(process.cwd(), 'backend/uploads/receipts', req.params.filename),
      path.join(process.cwd(), 'uploads/receipts', req.params.filename),
    ];
    
    // Try all possible paths
    let fileExists = false;
    
    for (const testPath of possiblePaths) {
      console.log('Checking path:', testPath);
      if (fs.existsSync(testPath)) {
        console.log('Receipt file found at:', testPath);
        receiptPath = testPath;
        fileExists = true;
        break;
      }
    }
    
    // If we found the file, verify it has content
    if (fileExists) {
      const stats = fs.statSync(receiptPath);
      console.log('Found receipt file size:', stats.size, 'bytes');
      
      // If file exists with content, serve it immediately
      if (stats.size > 0) {
        console.log('Serving existing receipt file:', receiptPath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
        return fs.createReadStream(receiptPath).pipe(res);
      } else {
        console.error('Receipt file exists but is empty');
        fileExists = false;
      }
    }
    
    // If file doesn't exist or is empty, try to regenerate it
    console.log('Receipt file needs regeneration');
    
    // Extract transaction ID from filename
    let transactionId = null;
    if (req.params.filename.startsWith('receipt-')) {
      transactionId = req.params.filename.replace('receipt-', '').replace('.pdf', '');
      console.log('Extracted transaction ID:', transactionId);
    } else {
      console.error('Invalid receipt filename format (does not start with "receipt-")');
      return res.status(404).json({
        success: false,
        message: 'Invalid receipt filename format'
      });
    }
    
    if (!transactionId) {
      console.error('Failed to extract valid transaction ID from filename');
      return res.status(404).json({
        success: false,
        message: 'Invalid receipt filename format'
      });
    }
    
    // Try to find the transaction
    let transaction = null;
    try {
      // First try direct ID match
      transaction = await Transaction.findById(transactionId).populate('product');
      
      if (!transaction) {
        // If not found, try looking for transaction with this ID in txnId field
        transaction = await Transaction.findOne({ txnId: transactionId }).populate('product');
        console.log('Checked for transaction by txnId, found:', transaction ? 'Yes' : 'No');
      }
    } catch (err) {
      console.error('Error finding transaction:', err.message);
    }
    
    // If transaction not found or user is not authorized
    if (!transaction) {
      console.error('Transaction not found with ID:', transactionId);
      return res.status(404).json({
        success: false,
        message: 'Transaction not found for receipt generation'
      });
    }
    
    // Check if user is authorized
    if (transaction.user && transaction.user.toString() !== req.user._id.toString()) {
      console.error('User not authorized to access this transaction');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this receipt'
      });
    }
    
    // At this point, we have a valid transaction and authorized user
    // Make sure the receipt directory exists
    ensureDirectoryExists(path.dirname(receiptPath));
    
    // Load complete user data if needed
    const user = req.user.name ? req.user : await User.findById(req.user._id);
    
    // Regenerate the receipt
    console.log('Regenerating receipt...');
    const regenerated = await regenerateReceipt(transaction, user, receiptPath);
    console.log('Receipt regeneration result:', regenerated ? 'Success' : 'Failed');
    
    // Check if regeneration worked
    if (!fs.existsSync(receiptPath) || fs.statSync(receiptPath).size === 0) {
      console.error('Failed to regenerate receipt or file is empty');
      return res.status(500).json({
        success: false,
        message: 'Receipt could not be generated'
      });
    }
    
    // Serve the regenerated file
    console.log('Serving regenerated receipt file:', receiptPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
    
    // Use fs.createReadStream instead of res.download to better handle errors
    const fileStream = fs.createReadStream(receiptPath);
    fileStream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming file'
        });
      }
    });
    
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Download receipt error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Helper function to regenerate receipt files if missing
async function regenerateReceipt(transaction, user, receiptPath) {
  try {
    console.log('Regenerating receipt for transaction:', transaction._id, 'to path:', receiptPath);
    
    // Make sure directory exists
    const dir = path.dirname(receiptPath);
    ensureDirectoryExists(dir);
    console.log('Receipt directory confirmed:', dir);
    
    // Load product data
    let product = null;
    if (transaction.product) {
      // Check if product is already populated
      if (typeof transaction.product === 'object' && transaction.product !== null && transaction.product.title) {
        product = transaction.product;
        console.log('Using already populated product data');
      } else {
        // Need to populate product
        product = await Product.findById(transaction.product);
        console.log('Loaded product data from database');
      }
    }
    
    if (!product) {
      console.error('Product not found for transaction:', transaction._id);
      // Create a placeholder product to prevent failure
      product = {
        title: 'Unknown Product',
        price: transaction.amount || 0
      };
      console.log('Created placeholder product data');
    }
    
    // Prepare user data
    if (!user.name || !user.email) {
      user = await User.findById(user._id || transaction.user);
      console.log('Loaded complete user data');
    }
    
    // Create PDF receipt with custom options for a beautiful design
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      layout: 'portrait',
      info: {
        Title: 'Payment Receipt',
        Author: 'Project Store',
        Subject: `Receipt for Transaction ${transaction.txnId || transaction._id}`,
        Keywords: 'receipt, payment, project store',
      }
    });
    
    // Handle any IO errors
    try {
      fs.accessSync(dir, fs.constants.W_OK);
      console.log('Directory is writable');
    } catch (err) {
      console.error('Directory is not writable:', err.message);
      throw new Error('Cannot write to receipt directory: ' + err.message);
    }
    
    const writeStream = fs.createWriteStream(receiptPath);
    console.log('Created write stream for receipt file');
    
    // Wait for PDF to finish
    const promise = new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log('PDF write stream finished');
        resolve();
      });
      writeStream.on('error', (err) => {
        console.error('PDF write stream error:', err);
        reject(err);
      });
    });
    
    doc.pipe(writeStream);
    
    // Define colors for a professional look with improved contrast
    const primaryColor = '#f0f6ff'; // Very light blue-white background
    const secondaryColor = '#ffffff'; // Pure white background
    const accentColor = '#e8f0fe';    // Light blue-white accent
    const textColor = '#000000';      // Pure black for all main text
    const lightTextColor = '#000000'; // Black for all text including secondary
    
    // Add a beautiful colored header background
    doc.fillColor(primaryColor)
       .rect(0, 0, doc.page.width, 120)
       .fill();
    
    // Add company logo/name with shadow effect
    doc.fillColor('#000000')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('PROJECT STORE', 50, 40, { align: 'center' });
    
    // Add receipt title
    doc.fillColor('#000000')
       .fontSize(16)
       .font('Helvetica')
       .text('PAYMENT RECEIPT', 50, 75, { align: 'center' });
    
    // Add a curved accent bar
    doc.fillColor(accentColor)
       .roundedRect(50, 120, doc.page.width - 100, 30, 10)
       .fill();
    
    // Add receipt number and date in the accent bar
    const receiptNumber = transaction.txnId || transaction._id.toString().substring(0, 8);
    doc.fillColor('#000000')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(`Receipt: #${receiptNumber}`, 60, 130, { align: 'left' });
    
    const formattedDate = new Date(transaction.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.text(`Date: ${formattedDate}`, doc.page.width - 180, 130, { align: 'right' });
    
    // Add a light background for the main content area
    doc.fillColor(secondaryColor)
       .roundedRect(50, 160, doc.page.width - 100, 300, 5)
       .fill();
    
    // Add customer information section
    doc.fillColor(textColor)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Customer Information', 70, 180);
    
    doc.fillColor(lightTextColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Name:', 70, 210)
       .text('Email:', 70, 230);
    
    doc.fillColor(textColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(user.name || 'Customer', 150, 210)
       .text(user.email || 'Not provided', 150, 230);
    
    // Add payment information section
    doc.fillColor(textColor)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Payment Information', 70, 260);
    
    doc.fillColor(lightTextColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Transaction ID:', 70, 290)
       .text('Payment Method:', 70, 310)
       .text('Payment Date:', 70, 330);
    
    doc.fillColor(textColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(transaction.txnId || transaction._id, 150, 290)
       .text(transaction.method || 'Online Payment', 150, 310)
       .text(new Date(transaction.createdAt).toLocaleString(), 150, 330);
    
    // Add order details section
    doc.fillColor(textColor)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Order Details', 70, 360);
    
    // Create table header with light background for black text
    doc.fillColor('#e8f0fe') // Very light blue-white background
       .roundedRect(70, 390, doc.page.width - 140, 30, 5) // Taller with more rounded corners
       .fill();
    
    doc.fillColor('#000000') // Black text on light background
       .fontSize(12) // Slightly larger font size
       .font('Helvetica-Bold')
       .text('Description', 80, 398) // Adjusted y-position for better centering
       .text('Price', doc.page.width - 150, 400, { align: 'right' });
    
    // Product item with improved background contrast
    doc.fillColor('#e8eaf6') // Lighter blue background for product details
       .roundedRect(70, 420, doc.page.width - 160, 50, 5) // Taller box with more rounded corners
       .fill();
    
    doc.fillColor('#000000') // Pure black text on light background for maximum readability
       .fontSize(12) // Larger font size for better readability
       .font('Helvetica-Bold') // Make product title bold for emphasis
       .text(product.title, 80, 438) // Adjusted position for better centering in box
       .text(`PKR ${(transaction.amount || product.price || 0).toFixed(2)}`, doc.page.width - 170, 438, { align: 'right' });
    
    // Total section with light background
    doc.fillColor('#e8f0fe') // Light blue-white background
       .roundedRect(doc.page.width - 200, 465, 130, 40, 8) // Taller with more rounded corners
       .fill();
    
    doc.fillColor('#000000') // Black text for total amount
       .fontSize(16) // Even larger font size for better emphasis and readability
       .font('Helvetica-Bold')
       .text('TOTAL:', doc.page.width - 190, 478) // Adjusted position for vertical centering
       .text(`PKR ${(transaction.amount || product.price || 0).toFixed(2)}`, doc.page.width - 90, 478, { align: 'right' });
    
    // Add a thank you message
    doc.fillColor(textColor)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Thank you for your purchase!', 50, 520, { align: 'center' });
    
    // Add payment notes or terms & conditions
    doc.fillColor(lightTextColor)
       .fontSize(9)
       .font('Helvetica')
       .text('Note: This is an official receipt for your payment. Please keep it for your records.', 50, 550, { align: 'center' });
    
    // Add a stylish signature for Mujahid
    const lineWidth = 170;
    const lineX = 100;
    const lineY = 610;
    
    // Draw the signature line
    doc.moveTo(lineX, lineY).lineTo(lineX + lineWidth, lineY).stroke();
    
    // Add the stylish signature above the line
    doc.fillColor('#1a237e') // Deep blue color for signature
       .font('Helvetica-Oblique') // Italic style for signature
       .fontSize(24) // Larger size for signature
       .text('Mujahid', lineX + 20, lineY - 30, { 
          characterSpacing: 2, // Add spacing between characters for style
          stroke: true, // Add stroke for more stylish look
          strokeWidth: 0.2,
          strokeColor: '#3949ab' // Slightly lighter blue for stroke
       });
    
    // Add the signature text below the line
    doc.fillColor(textColor) // Use black text
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Authorized Signature', lineX + 30, lineY + 10);
    
    // Add footer with light border
    doc.fillColor('#f0f6ff') // Very light blue-white
       .rect(0, doc.page.height - 50, doc.page.width, 50)
       .fill();
    
    // Add copyright and website information
    doc.fillColor('#000000') // Black text
       .fontSize(10)
       .font('Helvetica')
       .text(`PROJECT STORE  ${new Date().getFullYear()} | www.projectstore.com | support@projectstore.com`, 50, doc.page.height - 35, { align: 'center' });
    
    // End the document
    doc.end();
    console.log('PDF document ended');
    
    // Wait for writing to finish
    await promise;
    console.log('PDF writing completed');
    
    // Verify file exists and has content
    if (fs.existsSync(receiptPath)) {
      const stats = fs.statSync(receiptPath);
      console.log('Receipt file created successfully, size:', stats.size, 'bytes');
      
      if (stats.size === 0) {
        console.error('Receipt file is empty');
        return false;
      }
    } else {
      console.error('Receipt file was not created');
      return false;
    }
    
    // Check if receipt record exists, if not create one
    let existingReceipt = null;
    try {
      existingReceipt = await Receipt.findOne({
        transaction: transaction._id
      });
    } catch (err) {
      console.error('Error checking for existing receipt:', err);
    }
    
    if (!existingReceipt) {
      try {
        const receipt = new Receipt({
          user: user._id,
          product: product._id || transaction.product,
          transaction: transaction._id,
          pdfUrl: `/api/payments/receipt/receipt-${transaction._id}.pdf`
        });
        
        await receipt.save();
        console.log('Created missing receipt record:', receipt._id);
      } catch (err) {
        console.error('Error creating receipt record:', err);
        // Don't fail the whole process if we can't create the record
      }
    } else {
      console.log('Receipt record already exists:', existingReceipt._id);
    }
    
    return true;
  } catch (error) {
    console.error('Error regenerating receipt:', error.message, error.stack);
    return false;
  }
};

// @desc    Get receipt data in JSON format
// @route   GET /api/payments/receipt-data/:transactionId
// @access  Private
exports.getReceiptData = async (req, res) => {
  try {
    const transactionId = req.params.transactionId;
    console.log('Getting receipt data for transaction ID:', transactionId);
    
    // Try multiple approaches to find the transaction
    let transaction = null;
    
    // First try direct MongoDB ObjectId lookup
    try {
      transaction = await Transaction.findById(transactionId)
        .populate('product', 'title price')
        .populate('user', 'name email');
      
      if (transaction) {
        console.log('Found transaction by MongoDB ID lookup');
      }
    } catch (err) {
      console.log('Transaction not found by ID, will try other methods');
    }
    
    // If not found by ID, try finding by purchase ID in the user's purchases
    if (!transaction) {
      console.log('Looking for transaction in user purchases');
      const user = await User.findById(req.user._id).populate('purchases');
      
      if (user && user.purchases && user.purchases.length > 0) {
        // Find the purchase that matches this ID or has this in the download URL
        const foundPurchase = user.purchases.find(p => 
          p._id.toString() === transactionId || 
          (p.downloadUrl && p.downloadUrl.includes(transactionId))
        );
        
        if (foundPurchase) {
          transaction = await Transaction.findById(foundPurchase._id)
            .populate('product', 'title price')
            .populate('user', 'name email');
          
          if (transaction) {
            console.log('Found transaction from user purchases');
          }
        } else {
          console.log('No matching purchase found in user purchases');
        }
      } else {
        console.log('User has no purchases');
      }
    }
    
    // Check if we found a transaction
    if (!transaction) {
      console.error('No transaction found with ID:', transactionId);
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Check if user owns this transaction
    if (transaction.user && transaction.user._id && transaction.user._id.toString() !== req.user._id.toString()) {
      console.error('User not authorized to access transaction. Transaction user:', transaction.user._id, 'Request user:', req.user._id);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this transaction'
      });
    }
    
    // Find receipt if it exists
    const receipt = await Receipt.findOne({ transaction: transaction._id });
    if (!receipt) {
      console.log('No receipt found for transaction, generating data from transaction');
    }
    
    // Format receipt data for display
    const receiptData = {
      transactionId: transaction.txnId || 'N/A',
      purchaseDate: transaction.createdAt,
      product: transaction.product ? transaction.product.title : 'Unknown Product',
      price: transaction.product ? transaction.product.price : 0,
      amount: transaction.amount,
      paymentMethod: transaction.method,
      customerName: req.user.name,
      customerEmail: req.user.email,
      receiptId: receipt ? receipt._id : transaction._id, // Use transaction ID as fallback
      pdfUrl: receipt ? receipt.pdfUrl : null
    };
    
    console.log('Returning receipt data for transaction');
    
    return res.json({
      success: true,
      receiptData
    });
  } catch (error) {
    console.error('Get receipt data error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Download product
// @route   GET /api/payments/download/:secureUrl
// @access  Private
exports.downloadProduct = async (req, res) => {
  try {
    console.log('Download request received for secure URL:', req.params.secureUrl);
    
    // Find transaction with this secure URL
    const transaction = await Transaction.findOne({ 
      downloadUrl: `/api/payments/download/${req.params.secureUrl}`,
      verified: true
    }).populate('product');
    
    if (!transaction) {
      console.error('No transaction found with secure URL:', req.params.secureUrl);
      return res.status(404).json({
        success: false,
        message: 'Invalid download link'
      });
    }
    
    console.log('Found transaction:', transaction._id, 'for product:', transaction.product._id);
    
    // Check if user owns this transaction
    if (transaction.user.toString() !== req.user._id.toString()) {
      console.error('User not authorized to access download. Transaction user:', transaction.user, 'Request user:', req.user._id);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this product'
      });
    }
    
    // Check if the product has a valid download link
    if (!transaction.product.downloadLink) {
      console.error('Product has no download link:', transaction.product._id);
      return res.status(404).json({
        success: false,
        message: 'Product download link is not available. Please contact support.'
      });
    }
    
    // Simply return the external URL to the client - DO NOT redirect
    // The frontend will handle opening this URL in a new tab
    return res.json({
      success: true,
      downloadUrl: transaction.product.downloadLink,
      productTitle: transaction.product.title
    });
  } catch (error) {
    console.error('Download product error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
