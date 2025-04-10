const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import User model (adjust path as needed based on your project structure)
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

/**
 * Function to update a user to admin role by email
 * @param {string} email - The email of the user to update
 */
const updateUserToAdmin = async (email) => {
  try {
    // Validate email format
    if (!email || !email.includes('@')) {
      console.error('Please provide a valid email address');
      process.exit(1);
    }

    // Find the user by email and update role
    const user = await User.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`User ${user.name} (${user.email}) has been updated to admin role`);
    console.log('User details:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      updatedAt: user.updatedAt
    });

  } catch (error) {
    console.error('Error updating user role:', error.message);
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.log('Usage: node updateUserToAdmin.js user@example.com');
  process.exit(1);
}

// Execute the function
updateUserToAdmin(email);
