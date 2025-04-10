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
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Create a `.env` file in the frontend directory with:

```
REACT_APP_API_URL=http://localhost:5000/api
```
