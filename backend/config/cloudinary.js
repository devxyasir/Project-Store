const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables directly to make sure they're available
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Log Cloudinary configuration for debugging (without showing the full secret)
console.log('Cloudinary Configuration:');
console.log('- Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('- API key exists:', !!process.env.CLOUDINARY_API_KEY);
console.log('- API secret exists:', !!process.env.CLOUDINARY_API_SECRET);

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
