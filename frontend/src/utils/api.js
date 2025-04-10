import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Always send cookies with requests
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // For network errors, don't redirect
    if (!error.response) {
      console.log('Network error - possibly offline');
      return Promise.reject(error);
    }
    
    // Only handle 401 unauthorized errors for API endpoints, not static assets
    if (error.response && error.response.status === 401 && 
        !error.config.url.includes('/static/')) {
      
      console.log('Authentication error - session may have expired');
      
      // Don't immediately redirect to login if we're trying to refresh a token
      // or access the profile endpoint (to prevent redirect loops)
      if (!error.config.url.includes('/auth/profile') && 
          !error.config.url.includes('/auth/refresh')) {
        // Clear token from storage
        localStorage.removeItem('token');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('tokenExpiration');
        localStorage.removeItem('userId');
        
        // If we're not already on the login page, redirect there
        if (!window.location.pathname.includes('/login')) {
          console.log('Redirecting to login page...');
          // Store the current URL to redirect back after login
          localStorage.setItem('redirectAfterLogin', window.location.pathname);
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
