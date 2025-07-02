# Project Store Website

A full-stack MERN application for selling programming/tech projects.

## Features

- Beautiful responsive UI with Material UI v5
- User authentication with JWT
- Shop with filterable products
- Secure manual payment system
- Admin panel for product management
- PDF receipt generation
- User dashboard for purchased items

## Tech Stack

- **Frontend**: React.js, Material UI v5
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Styling**: Material UI, CSS-in-JS

## Project Structure

- `/frontend` - React frontend application
- `/backend` - Node.js Express backend API

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
# Create a .env file with your environment variables
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create a `.env` file in the backend directory with:

```
PORT=5000
MONGODB_URI=mongodb+srv://localhost:27017/project
JWT_SECRET=your_jwt_secret_should_be_secure_and_long
NODE_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Gmail API Configuration for Payment Verification
GMAIL_EMAIL=your_nayapay_linked_email@gmail.com
GMAIL_APP_PASSWORD=app_password 

```

Create a `.env` file in the frontend directory with:

```
REACT_APP_API_URL=http://localhost:5000/api
```
