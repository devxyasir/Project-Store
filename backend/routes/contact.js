const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const contactController = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/contact
// @desc    Submit a contact form
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('subject', 'Subject is required').not().isEmpty(),
    check('message', 'Message is required').not().isEmpty()
  ],
  contactController.createContact
);

// @route   GET /api/contact
// @desc    Get all contacts (with pagination)
// @access  Admin only
router.get('/', protect, admin, contactController.getAllContacts);

// @route   GET /api/contact/stats
// @desc    Get contact statistics
// @access  Admin only
router.get('/stats', protect, admin, contactController.getContactStats);

// @route   GET /api/contact/:id
// @desc    Get contact by ID
// @access  Admin only
router.get('/:id', protect, admin, contactController.getContactById);

// @route   PUT /api/contact/:id/status
// @desc    Update contact status
// @access  Admin only
router.put('/:id/status', protect, admin, contactController.updateContactStatus);

// @route   POST /api/contact/:id/respond
// @desc    Respond to a contact message
// @access  Admin only
router.post('/:id/respond', protect, admin, contactController.respondToContact);

// @route   DELETE /api/contact/:id
// @desc    Delete a contact
// @access  Admin only
router.delete('/:id', protect, admin, contactController.deleteContact);

module.exports = router;
