const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getCategories, 
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', getCategories);

// @route   GET /api/categories/:slug
// @desc    Get single category by slug
// @access  Public
router.get('/:slug', getCategoryBySlug);

// @route   POST /api/categories
// @desc    Create a category
// @access  Private/Admin
router.post(
  '/',
  [
    protect,
    admin,
    [
      check('name', 'Category name is required').not().isEmpty()
    ]
  ],
  createCategory
);

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.put(
  '/:id',
  [
    protect,
    admin
  ],
  updateCategory
);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete('/:id', [protect, admin], deleteCategory);

module.exports = router;
