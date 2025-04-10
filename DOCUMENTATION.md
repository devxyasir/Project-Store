# Project Store Documentation

## Overview

Project Store is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application that serves as a marketplace for programming and technical projects. The platform allows users to browse, purchase, and download programming projects securely.

## Project Structure

The project follows a modular architecture with separate frontend and backend implementations:

```
Project Store/
├── backend/             # Node.js & Express backend
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # MongoDB Mongoose models
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded files and receipts
│   └── utils/           # Utility functions
├── frontend/            # React frontend
│   ├── public/          # Static assets
│   └── src/             # React source code
│       ├── components/  # Reusable UI components
│       ├── contexts/    # React context providers
│       ├── pages/       # Page components
│       └── utils/       # Utility functions
└── .env                 # Environment variables
```

## Features

1. **User Authentication**
   - JWT-based authentication
   - User registration and login
   - Protected routes for authenticated users

2. **Product Management**
   - Browse products with filtering options
   - Detailed product pages
   - Featured products on the homepage

3. **Shopping Cart**
   - Add/remove products
   - Calculate total price
   - Persistent cart storage

4. **Checkout System**
   - Manual payment methods (NayaPay, JazzCash, Easypaisa)
   - Transaction ID verification
   - PDF receipts generation

5. **User Dashboard**
   - View purchased projects
   - Access download links
   - View and download receipts

6. **Admin Panel**
   - Manage products and categories
   - User management with role assignment
   - Process and verify transactions
   - Configure payment method settings

## Backend API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:slug` - Get a single product
- `POST /api/products` - Create a product (admin)
- `PUT /api/products/:id` - Update a product (admin)
- `DELETE /api/products/:id` - Delete a product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get a single category
- `POST /api/categories` - Create a category (admin)
- `PUT /api/categories/:id` - Update a category (admin)
- `DELETE /api/categories/:id` - Delete a category (admin)

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/process` - Process payment
- `GET /api/payments/purchases` - Get user purchases
- `GET /api/payments/receipts` - Get user receipts
- `GET /api/payments/receipt/:filename` - Download receipt
- `GET /api/payments/download/:secureUrl` - Download product

### Admin
- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/users/:id` - Get a specific user (admin)
- `PUT /api/admin/users/:id/role` - Update user role (admin)
- `GET /api/admin/transactions` - Get all transactions (admin)
- `PUT /api/admin/transactions/:id/verify` - Verify a transaction (admin)
- `GET /api/admin/settings/payment-methods` - Get payment method settings (admin)
- `PUT /api/admin/settings/payment-methods` - Update payment method settings (admin)

## Frontend Routes

### Public Routes
- `/` - Homepage
- `/shop` - Browse products
- `/product/:slug` - Product details
- `/login` - User login
- `/register` - User registration

### Protected User Routes
- `/cart` - Shopping cart
- `/checkout` - Payment checkout
- `/dashboard` - User dashboard
- `/purchases` - Purchased products
- `/receipts` - Transaction receipts

### Protected Admin Routes
- `/admin` - Admin dashboard
- `/admin/products` - Manage products
- `/admin/categories` - Manage categories
- `/admin/users` - Manage users
- `/admin/transactions` - Manage transactions
- `/admin/settings` - Application settings

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- PDFKit

### Frontend
- React.js
- React Router
- Material UI v5
- Axios
- Context API

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
1. Navigate to the project root
2. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key_change_in_production
   NODE_ENV=development
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the backend server:
   ```
   npm run server
   ```

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the React development server:
   ```
   npm start
   ```

### Running Both Concurrently
```
npm run dev
```

## Deployment

### Backend
The backend can be deployed to services like Heroku, Railway, or a VPS.

### Frontend
The React frontend can be deployed to Netlify, Vercel, or GitHub Pages.
