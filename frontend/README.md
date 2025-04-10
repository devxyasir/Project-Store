# Project Store Frontend

This is the frontend part of the Project Store application built with React.js and Material UI.

## Overview

The Project Store frontend provides a modern and responsive user interface for browsing, purchasing, and managing programming projects. It includes both user-facing pages and an admin panel for site management.

## Features

- **Responsive Design**: Built with Material UI v5 for a fully responsive experience across devices
- **Dark/Light Theme**: Toggle between dark and light modes
- **User Authentication**: JWT-based login and registration
- **Product Browsing**: Filter products by category, technology, and search terms
- **Shopping Cart**: Add products to cart and proceed to checkout
- **Manual Payment System**: Support for multiple payment methods
- **User Dashboard**: View purchases, download projects, and access receipts
- **Admin Panel**: Comprehensive admin interface for site management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```
   npm start
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
frontend/
├── public/             # Static assets
└── src/
    ├── components/     # Reusable UI components
    │   ├── layout/     # Layout components (Header, Footer, etc.)
    │   └── ui/         # UI components
    ├── contexts/       # React context providers
    │   ├── AuthContext.js     # Authentication state
    │   ├── CartContext.js     # Shopping cart state
    │   └── ThemeContext.js    # Theme state
    ├── pages/          # Page components
    │   ├── admin/      # Admin pages
    │   └── ...         # User-facing pages
    ├── utils/          # Utility functions
    ├── App.js          # Main App component with routing
    └── index.js        # Entry point
```

## Available Scripts

- `npm start` - Run the app in development mode
- `npm test` - Run tests
- `npm run build` - Build the app for production
- `npm run eject` - Eject from Create React App

## Main Routes

### Public Routes
- `/` - Homepage
- `/shop` - Browse all projects
- `/product/:slug` - Product detail page
- `/login` - Login page
- `/register` - Registration page

### Protected User Routes
- `/cart` - Shopping cart
- `/checkout` - Payment checkout
- `/dashboard` - User dashboard
- `/purchases` - Purchased projects
- `/receipts` - Transaction receipts

### Protected Admin Routes
- `/admin` - Admin dashboard
- `/admin/products` - Manage products
- `/admin/categories` - Manage categories
- `/admin/users` - Manage users
- `/admin/transactions` - Manage transactions
- `/admin/settings` - Application settings

## State Management

The application uses React Context API for state management:

- **AuthContext**: Manages user authentication state
- **CartContext**: Manages shopping cart state
- **ThemeContext**: Manages theme preferences

## APIs and Services

The frontend communicates with the backend API using Axios. API calls are centralized in the `utils/api.js` file.

## Building for Production

To build the application for production:

```
npm run build
```

This creates an optimized production build in the `build` folder that can be deployed to any static hosting service.

## Technologies Used

- React.js
- React Router
- Material UI v5
- Axios
- JWT for authentication
