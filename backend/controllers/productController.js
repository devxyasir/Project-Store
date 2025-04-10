const Product = require('../models/Product');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');
const { deleteCloudinaryImage } = require('./uploadController');

// Helper function to create slug from title
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, technology, featured, limit = 10, page = 1 } = req.query;
    
    const queryObj = {};
    
    // Build filter object
    if (category) {
      const categoryObj = await Category.findOne({ slug: category });
      if (categoryObj) {
        queryObj.category = categoryObj._id;
      }
    }
    
    if (technology) {
      queryObj.technologies = { $in: [technology] };
    }
    
    if (featured === 'true') {
      queryObj.featured = true;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const products = await Product.find(queryObj)
      .populate('category', 'name slug')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await Product.countDocuments(queryObj);
    
    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug');
    
    if (product) {
      // Ensure product price is returned correctly as a number
      // and not combined with buyer count
      const formattedProduct = product.toJSON();
      
      console.log('Serving product with price:', parseFloat(formattedProduct.price), 
                'and buyer count:', formattedProduct.buyerCount);
      
      res.json({
        success: true,
        product: formattedProduct
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single product by ID (for admin editing)
// @route   GET /api/products/id/:id
// @access  Private/Admin
exports.getProductById = async (req, res) => {
  try {
    console.log('Fetching product by ID:', req.params.id);
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');
    
    if (product) {
      // Ensure product price is returned correctly as a number
      // and not combined with buyer count
      const formattedProduct = product.toJSON();
      
      console.log('Product found:', formattedProduct.title, 
                'with price:', parseFloat(formattedProduct.price),
                'and buyer count:', formattedProduct.buyerCount);
      
      res.json({
        success: true,
        product: formattedProduct
      });
    } else {
      console.log('Product not found with ID:', req.params.id);
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      title,
      categoryId,
      description,
      shortDescription,
      price,
      technologies,
      featured,
      imagePaths,
      downloadPath
    } = req.body;

    // Validate required fields
    if (!title || !categoryId || !description || !shortDescription || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check for images
    if (!imagePaths || imagePaths.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one product image'
      });
    }

    // Check for download link
    const downloadLink = req.body.downloadLink;
    if (!downloadLink) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a download link for the product'
      });
    }

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Create slug from title
    const slug = createSlug(title);

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with similar title already exists'
      });
    }

    // Process technologies
    let techArray = [];
    if (typeof technologies === 'string') {
      techArray = technologies.split(',').map(tech => tech.trim());
    } else if (Array.isArray(technologies)) {
      techArray = technologies;
    }

    // Create product
    const product = await Product.create({
      title,
      slug,
      category: categoryId,
      description,
      shortDescription,
      price: parseFloat(price),
      images: imagePaths,
      technologies: techArray,
      downloadLink: downloadLink,
      featured: featured === 'true' || featured === true
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    // Clean up uploaded images if there was an error
    if (req.body.imagePaths) {
      // Delete uploaded images from Cloudinary
      const deletePromises = req.body.imagePaths.map(url => deleteCloudinaryImage(url));
      await Promise.all(deletePromises);
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      title,
      categoryId,
      description,
      shortDescription,
      price,
      technologies,
      featured,
      imagePaths,
      downloadPath
    } = req.body;

    // If title changed, update slug
    let slug = product.slug;
    if (title && title !== product.title) {
      slug = createSlug(title);
      
      // Check if new slug already exists for another product
      const existingProduct = await Product.findOne({ 
        slug, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with similar title already exists'
        });
      }
    }

    // If category changed, check if new category exists
    if (categoryId && categoryId !== product.category.toString()) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Process technologies
    let techArray = product.technologies;
    if (technologies) {
      if (typeof technologies === 'string') {
        techArray = technologies.split(',').map(tech => tech.trim());
      } else if (Array.isArray(technologies)) {
        techArray = technologies;
      }
    }

    // Handle file updates
    const updates = {
      title: title || product.title,
      slug,
      category: categoryId || product.category,
      description: description || product.description,
      shortDescription: shortDescription || product.shortDescription,
      price: price ? parseFloat(price) : product.price,
      technologies: techArray,
      featured: featured !== undefined ? 
        (featured === 'true' || featured === true) : 
        product.featured
    };

    // Update images if new ones uploaded
    if (imagePaths && imagePaths.length > 0) {
      // Delete old images from Cloudinary if new ones are uploaded
      const deletePromises = product.images.map(url => deleteCloudinaryImage(url));
      await Promise.all(deletePromises);
      updates.images = imagePaths;
    }

    // Update download link if provided
    console.log('Download link from request:', req.body.downloadLink);
    if (req.body.downloadLink) {
      updates.downloadLink = req.body.downloadLink;
    } else if (product.downloadLink) {
      // Keep the existing download link if none provided
      updates.downloadLink = product.downloadLink;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Download link is required'
      });
    }

    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('category', 'name slug');

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    // Clean up uploaded images if there was an error
    if (req.body.imagePaths) {
      // Delete uploaded images from Cloudinary
      const deletePromises = req.body.imagePaths.map(url => deleteCloudinaryImage(url));
      await Promise.all(deletePromises);
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete associated images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(url => deleteCloudinaryImage(url));
      await Promise.all(deletePromises);
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Product removed'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get download file for purchased product
// @route   GET /api/products/:productId/download
// @access  Private
exports.downloadProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    
    // Find product
    const product = await Product.findById(productId);
    
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
    
    // Return the download link (will be handled by frontend to initiate download)
    res.json({
      success: true,
      downloadUrl: `/api/uploads/download/${productId}`
    });
  } catch (error) {
    console.error('Download product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
