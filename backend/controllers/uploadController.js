const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('../config/cloudinary');

// Configure Multer for memory storage (for Cloudinary uploads)
const storage = multer.memoryStorage();

// Create a Datauri parser to convert Buffer to string
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();

// Format the file data for Cloudinary
const formatBufferTo64 = (file) => {
  return parser.format(path.extname(file.originalname).toString(), file.buffer);
};

// Image file filter
const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create multer upload instances (memory storage for Cloudinary)
const uploadImages = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).array('images', 10); // Max 10 images

// Export the uploadImages middleware for route use
exports.uploadImages = uploadImages;

// Middleware to handle image uploads to Cloudinary
exports.uploadProductImages = (req, res, next) => {
  uploadImages(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Unknown error occurred during upload'
      });
    }
    
    // Upload images to Cloudinary if files exist
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => {
          // Format the image data for upload
          const fileData = formatBufferTo64(file);
          
          // Add better logging for debugging
          console.log(`Uploading image: ${file.originalname}, size: ${file.size} bytes`);
          
          // Upload to cloudinary with enhanced options for reliability
          return cloudinary.uploader.upload(fileData.content, {
            folder: 'project-store/products',
            resource_type: 'image',
            timeout: 120000, // 2 minute timeout for larger images
            quality: 'auto', // Automatically optimize image quality
            fetch_format: 'auto', // Auto-select the best format
            eager: { quality: 'auto', fetch_format: 'auto' } // Add transformations to optimize delivery
          });
        });
        
        // Wait for all uploads to complete
        const uploadResults = await Promise.all(uploadPromises);
        
        // Add cloudinary URLs to request body
        req.body.imagePaths = uploadResults.map(result => result.secure_url);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error uploading images to cloud storage',
          error: error.message
        });
      }
    }
    
    next();
  });
};

// Verify purchase before accessing download link
exports.verifyPurchase = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    
    // Find product and check if user has purchased it
    const product = await require('../models/Product').findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if user has purchased the product
    const hasPurchased = product.buyers.some(buyer => 
      buyer.toString() === userId.toString()
    );
    
    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: 'You have not purchased this product'
      });
    }
    
    // Return the download link
    res.status(200).json({
      success: true,
      downloadLink: product.downloadLink
    });
    
  } catch (error) {
    console.error('Error verifying purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying purchase'
    });
  }
};

// Standalone image upload handler for frontend direct use
exports.handleImageUpload = (req, res) => {
  uploadImages(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Unknown error occurred during upload'
      });
    }
    
    // No images uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }
    
    try {
      // Upload images to Cloudinary with improved timeout and options
      const uploadPromises = req.files.map(file => {
        // Format the image data for upload
        const fileData = formatBufferTo64(file);
        
        // Add better logging for debugging
        console.log(`Uploading image: ${file.originalname}, size: ${file.size} bytes`);
        
        // Upload to cloudinary with extended timeout and improved options
        return cloudinary.uploader.upload(fileData.content, {
          folder: 'project-store/products',
          resource_type: 'image',
          timeout: 120000, // 2 minute timeout for larger images
          quality: 'auto', // Automatically optimize image quality
          fetch_format: 'auto', // Auto-select the best format
          eager: { quality: 'auto', fetch_format: 'auto' } // Add transformations to optimize delivery
        });
      });
      
      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);
      
      // Return the cloudinary URLs
      res.status(200).json({
        success: true,
        urls: uploadResults.map(result => result.secure_url)
      });
    } catch (error) {
      console.error('Error uploading images to Cloudinary:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading images to cloud storage',
        error: error.message
      });
    }
  });
};

// Helper function to delete images from Cloudinary
exports.deleteCloudinaryImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary')) return false;
    
    // Extract the public_id from the Cloudinary URL
    const parts = imageUrl.split('/');
    const fileName = parts[parts.length - 1].split('.')[0];
    const folderPath = parts[parts.length - 2];
    const publicId = `${folderPath}/${fileName}`;
    
    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

// Handler for downloaded files
exports.getDownloadFile = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    
    // Find product and check if user has purchased it
    const product = await require('../models/Product').findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if user has purchased the product
    const hasPurchased = product.buyers.some(buyer => 
      buyer.toString() === userId.toString()
    );
    
    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: 'You have not purchased this product'
      });
    }
    
    // Redirect to the download link
    res.redirect(product.downloadLink);
    
  } catch (error) {
    console.error('Error handling download:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing download'
    });
  }
};
