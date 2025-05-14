const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const paymentRoutes = require('./routes/payment');
const paymentVerificationRoutes = require('./routes/payment-verification');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const settingsRoutes = require('./routes/settingsRoutes');
const contactRoutes = require('./routes/contact');

// Import models
const Settings = require('./models/Settings');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// CORS Configuration - Simplified for development
app.use(cors({
  origin: true, // Allow requests from any origin in development
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));

// Handle OPTIONS preflight requests
app.options('*', cors());

// Add explicit CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Configure cookie parser with secret key for signed cookies
app.use(cookieParser(process.env.COOKIE_SECRET || 'projectstore_cookie_secret')); // Parse cookies

// Static files for uploads and receipts
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directories if they don't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
const receiptsDir = path.join(__dirname, 'uploads/receipts');

if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(receiptsDir)) {
  console.log('Creating receipts directory');
  fs.mkdirSync(receiptsDir, { recursive: true });
}

// Serve static uploads directory directly for receipts with proper headers
app.use('/api/payments/receipt', (req, res, next) => {
  // Log request details to help with debugging
  console.log('Static receipts request for:', req.path);
  
  // Only handle PDF files to avoid conflicts with the API route
  if (req.path.endsWith('.pdf')) {
    // Add custom headers for PDFs
    express.static(path.join(__dirname, 'uploads/receipts'), {
      setHeaders: (res, filepath) => {
        console.log('Serving static receipt file:', filepath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filepath)}"`);
      }
    })(req, res, next);
  } else {
    next();
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
// Combine both payment route sets under the same base path
const combinedPaymentRouter = express.Router();

// Mount payment routes without their individual prefixes
app.use('/api/payments', [paymentRoutes, paymentVerificationRoutes]);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Server Error', error: err.message });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Initialize payment methods
    try {
      console.log('Initializing payment methods...');
      await Settings.ensurePaymentMethodsExist();
      console.log('Payment methods initialized successfully');
    } catch (error) {
      console.error('Error initializing payment methods:', error);
    }
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
