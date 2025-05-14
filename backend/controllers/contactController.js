const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');

// Create a new contact submission
exports.createContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    const newContact = new Contact({
      name,
      email,
      subject,
      message
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      contact: newContact
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting contact form',
      error: error.message
    });
  }
};

// Get all contacts (admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || null;
    
    // Build query based on status filter
    const query = {};
    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalContacts = await Contact.countDocuments(query);
    const totalPages = Math.ceil(totalContacts / limit);

    res.status(200).json({
      success: true,
      contacts,
      pagination: {
        currentPage: page,
        totalPages,
        totalContacts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving contacts',
      error: error.message
    });
  }
};

// Get a single contact by ID (admin only)
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Error getting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving contact',
      error: error.message
    });
  }
};

// Update contact status (admin only)
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['unread', 'read', 'responded'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    contact.status = status;
    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Contact status updated successfully',
      contact
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contact status',
      error: error.message
    });
  }
};

// Respond to a contact message (admin only)
exports.respondToContact = async (req, res) => {
  try {
    const { responseText } = req.body;
    
    if (!responseText) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }

    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    contact.adminResponse = {
      text: responseText,
      respondedBy: req.user._id,
      respondedAt: Date.now()
    };
    contact.status = 'responded';
    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Response sent successfully',
      contact
    });
  } catch (error) {
    console.error('Error responding to contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while responding to contact',
      error: error.message
    });
  }
};

// Delete a contact (admin only)
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting contact',
      error: error.message
    });
  }
};

// Get contact statistics for dashboard (admin only)
exports.getContactStats = async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const unreadContacts = await Contact.countDocuments({ status: 'unread' });
    const readContacts = await Contact.countDocuments({ status: 'read' });
    const respondedContacts = await Contact.countDocuments({ status: 'responded' });
    
    // Get contacts received in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentContacts = await Contact.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    res.status(200).json({
      success: true,
      stats: {
        total: totalContacts,
        unread: unreadContacts,
        read: readContacts,
        responded: respondedContacts,
        recentContacts
      }
    });
  } catch (error) {
    console.error('Error getting contact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving contact statistics',
      error: error.message
    });
  }
};
