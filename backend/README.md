# Project Store Backend API

This is the backend API for the Project Store application built with Node.js, Express, and MongoDB.

## Overview

The Project Store backend provides a RESTful API that handles user authentication, product management, payment processing, and admin functionality. It uses MongoDB as the database with Mongoose for object modeling.

## Features

- **User Authentication**: JWT-based authentication system
- **Product Management**: CRUD operations for products
- **Category Management**: Organization of products by categories
- **Manual Payment System**: Support for transaction verification
- **PDF Receipt Generation**: Dynamic creation of purchase receipts
- **Admin API**: Endpoints for administrative tasks
- **Role-Based Access Control**: User and admin role separation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. Navigate to the project root directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables by creating a `.env` file in the project root with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/project-store
   JWT_SECRET=your_jwt_secret_key_change_in_production
   NODE_ENV=development
   ```

4. Make sure MongoDB is running (if using local installation)

5. Start the server:
   ```
   npm run server
   ```

The API will be available at [http://localhost:5000](http://localhost:5000).

## Project Structure

```
backend/
├── controllers/     # Request handlers
│   ├── authController.js
│   ├── productController.js
│   ├── categoryController.js
│   ├── paymentController.js
│   └── adminController.js
├── middleware/      # Express middleware
│   └── auth.js      # Authentication middleware
├── models/          # MongoDB Mongoose models
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Transaction.js
│   └── Receipt.js
├── routes/          # API routes
│   ├── auth.js
│   ├── product.js
│   ├── category.js
│   ├── payment.js
│   └── admin.js
├── uploads/         # Uploaded files and receipts
├── utils/           # Utility functions
│   └── generateToken.js
└── server.js        # Entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:slug` - Get a single product
- `POST /api/products` - Create a product (admin only)
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get a single category
- `POST /api/categories` - Create a category (admin only)
- `PUT /api/categories/:id` - Update a category (admin only)
- `DELETE /api/categories/:id` - Delete a category (admin only)

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/process` - Process payment
- `GET /api/payments/purchases` - Get user purchases
- `GET /api/payments/receipts` - Get user receipts
- `GET /api/payments/receipt/:filename` - Download receipt
- `GET /api/payments/download/:secureUrl` - Download product

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/users/:id` - Get a specific user (admin only)
- `PUT /api/admin/users/:id/role` - Update user role (admin only)
- `GET /api/admin/transactions` - Get all transactions (admin only)
- `PUT /api/admin/transactions/:id/verify` - Verify a transaction (admin only)
- `GET /api/admin/settings/payment-methods` - Get payment method settings (admin only)
- `PUT /api/admin/settings/payment-methods` - Update payment method settings (admin only)

## Authentication

The API uses JSON Web Tokens (JWT) for authentication. To access protected routes, include the JWT token in the request headers:

```
Authorization: Bearer <your_token>
```

## Data Models

### User
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `role`: String (enum: 'user', 'admin', default: 'user')
- `purchases`: Array of Transaction IDs
- `createdAt`: Date

### Product
- `title`: String (required)
- `slug`: String (required, unique)
- `category`: Category ID (reference)
- `description`: String (required)
- `shortDescription`: String (required)
- `price`: Number (required)
- `images`: Array of Strings
- `technologies`: Array of Strings
- `downloadLink`: String (required)
- `buyers`: Array of User IDs
- `featured`: Boolean (default: false)
- `createdAt`: Date

### Category
- `name`: String (required, unique)
- `slug`: String (required, unique)
- `description`: String
- `createdAt`: Date

### Transaction
- `user`: User ID (reference)
- `product`: Product ID (reference)
- `method`: String (enum: 'NayaPay', 'JazzCash', 'Easypaisa')
- `txnId`: String (required, unique)
- `amount`: Number (required)
- `verified`: Boolean (default: false)
- `downloadUrl`: String
- `createdAt`: Date
- `verifiedAt`: Date

### Receipt
- `user`: User ID (reference)
- `transaction`: Transaction ID (reference)
- `product`: Product ID (reference)
- `pdfUrl`: String (required)
- `createdAt`: Date

## Error Handling

The API returns appropriate HTTP status codes along with JSON responses:

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Development

To run the server in development mode with automatic restart on file changes:

```
npm run dev
```

## Production Deployment

For production deployment, make sure to set appropriate environment variables:

```
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_random_secret
```

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- PDFKit for PDF generation
