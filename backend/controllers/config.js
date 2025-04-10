// Configuration file for receipt generation
module.exports = {
  receiptConfig: {
    // Colors for receipt styling
    colors: {
      primary: '#3f51b5', // Dark blue
      secondary: '#f5f7ff', // Very light blue
      success: '#4caf50', // Green
      header: '#1a237e', // Darker blue for headers
      text: '#333333', // Dark gray for text
      lightText: '#666666' // Medium gray for secondary text
    },
    
    // Paths for assets
    paths: {
      signatureImage: '../assets/images/signatures/signature.png'
    }
  }
};
