import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

// Configure global axios defaults to include credentials
axios.defaults.withCredentials = true;

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Always include credentials (cookies)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to ensure proper headers for all requests
api.interceptors.request.use(function (config) {
  // Add or modify headers as needed for each request
  config.headers = {
    ...config.headers,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  return config;
});

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenRefreshing, setTokenRefreshing] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Setup axios interceptors for authentication
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = api.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor for handling 401 errors
    const responseInterceptor = api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh already
        if (error.response?.status === 401 && !originalRequest._retry && user) {
          try {
            // Mark as retried to prevent infinite loops
            originalRequest._retry = true;
            
            // Check token validity and refresh if needed
            await refreshTokenStatus();
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
            return api(originalRequest);
          } catch (refreshError) {
            // If refresh fails, logout
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [user]);

  // Initialize auth state from localStorage
  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize authentication - enhanced for persistence
  const initializeAuth = async () => {
    const token = localStorage.getItem('token');
    console.log('Initializing auth with token:', token ? 'Token exists' : 'No token');
    
    // Always attempt to load user profile first, even without a token.
    // This is crucial for cookie-based authentication persistence.
    try {
      console.log('Attempting to load user profile regardless of token status...');
      await getUserProfile();
      
      // If getUserProfile succeeds but we had no token, it means we've authenticated via cookies
      // The getUserProfile function will have set the user state if successful
      
    } catch (profileError) {
      console.log('Initial profile attempt failed, checking token...');
      
      // Only try token-based auth if profile fetch failed and we have a token
      if (token) {
        try {
          // Check if token is expired
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          console.log('Token expiration check:', {
            currentTime,
            tokenExp: decoded.exp,
            isExpired: decoded.exp < currentTime,
            timeRemaining: decoded.exp - currentTime
          });
          
          if (decoded.exp < currentTime) {
            // Token is expired, try to silently refresh it
            console.log('Token expired, attempting silent refresh');
            try {
              // Try to get a new token using HTTP-only cookies
              await getUserProfile();
            } catch (refreshError) {
              console.log('Silent refresh failed, logging out');
              logout();
            }
          } else {
            // Valid token, set it and try getUserProfile again
            console.log('Token valid, setting auth headers and retrying profile fetch');
            // Set token in axios defaults
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Also set in global axios for any components not using our api instance
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            try {
              // Try to load user profile with the token set
              await getUserProfile();
            } catch (secondProfileError) {
              console.error('Profile fetch failed even with valid token:', secondProfileError);
              setLoading(false);
            }
          }
        } catch (tokenError) {
          // Invalid token, try to use cookies instead of immediately logging out
          console.error('Token validation error:', tokenError);
          
          try {
            // Try to get a new token using HTTP-only cookies
            await getUserProfile();
          } catch (finalError) {
            console.log('All authentication attempts failed');
            logout();
          }
        }
      } else {
        console.log('No token available and profile fetch failed - user is not authenticated');
        setLoading(false);
      }
    }
  };
  
  // Check and refresh token status
  const refreshTokenStatus = async () => {
    if (tokenRefreshing) return;
    
    setTokenRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // If token is about to expire (less than 1 hour)
      if (decoded.exp - currentTime < 3600) {
        // Here you would typically call a refresh token API
        // For now we'll just check if token is valid with profile API
        await getUserProfile();
      }
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    } finally {
      setTokenRefreshing(false);
    }
  };

  // Get user profile - improved for persistent authentication
  const getUserProfile = async () => {
    try {
      console.log('Fetching user profile with credentials');
      // Use axios directly to ensure cookies are sent
      const res = await axios.get('/api/auth/profile', {
        withCredentials: true // Important: ensures cookies are sent with the request
      });
      
      console.log('Profile response successful:', res.data);
      
      if (res.data.success) {
        // Successfully authenticated
        setUser(res.data.user);
        
        // If we received a fresh token from the server, update it
        if (res.data.token) {
          console.log('Received fresh token from server - updating local storage and auth headers');
          localStorage.setItem('token', res.data.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
          axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        } else {
          // If no new token was provided but we have a stored one, keep using it
          const existingToken = localStorage.getItem('token');
          if (existingToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
            axios.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
          }
        }
        setError(null); // Clear any previous errors
        return true; // Indicate successful authentication
      } else {
        console.log('Profile response indicated failure:', res.data.message);
        setError(res.data.message);
        throw new Error(res.data.message); // Throw error to be caught below
      }
    } catch (err) {
      console.error('Get profile error:', err.message, err.response?.status);
      // For network errors, we want to be more resilient and not log out immediately
      if (!err.response) {
        console.log('Network error - not logging out immediately');
        setError('Network error - please check your connection');
        throw err; // Rethrow for initializeAuth to handle
      }
      
      // Only logout if it's a genuine authentication error
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(err.response?.data?.message || 'Authentication failed');
        throw err; // Rethrow for initializeAuth to handle
      } else {
        // For other errors, don't automatically logout
        setError(err.response?.data?.message || 'Failed to load user profile');
        throw err; // Rethrow for initializeAuth to handle
      }
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use direct axios call with full URL to avoid any path configuration issues
      const res = await axios({
        method: 'post',
        url: 'http://localhost:5000/api/auth/register',
        data: userData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      });
      
      if (res.data.success) {
        // Save token to localStorage
        localStorage.setItem('token', res.data.token);
        
        // Set token in API instance defaults
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Also set in global axios for any components not using our api instance
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Set user
        setUser(res.data.user);
        
        // Store login timestamp
        localStorage.setItem('loginTime', Date.now().toString());
        
        return { success: true };
      } else {
        setError(res.data.message);
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Login user - improved for persistent authentication
  const login = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use direct axios call with full URL to avoid any path configuration issues
      const res = await axios({
        method: 'post',
        url: 'http://localhost:5000/api/auth/login',
        data: userData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      });
      
      if (res.data.success) {
        console.log('Login successful, setting up authentication state');
        
        // Save token to localStorage with secure handling
        localStorage.setItem('token', res.data.token);
        
        // Set token in API instance defaults
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Also set in global axios for any components not using our api instance
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Set user in state
        setUser(res.data.user);
        
        // Store login timestamp and expiration time
        const loginTime = Date.now();
        localStorage.setItem('loginTime', loginTime.toString());
        
        // Calculate and store token expiration time (7 days)
        const expirationTime = loginTime + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiration', expirationTime.toString());
        
        // Store user ID for additional verification
        localStorage.setItem('userId', res.data.user._id);
        
        return { success: true };
      } else {
        setError(res.data.message);
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout user - improved to clear HTTP-only cookies
  const logout = async () => {
    try {
      // Call logout endpoint to clear HTTP-only cookies
      await axios.post('/api/auth/logout', {}, { withCredentials: true })
        .catch(err => console.log('Logout endpoint error (continuing anyway):', err.message));
    } catch (e) {
      console.log('Error during logout API call (continuing anyway):', e.message);
    } finally {
      // Remove all auth-related items from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('loginTime');
      localStorage.removeItem('tokenExpiration');
      localStorage.removeItem('userId');
      
      // Remove token from API instance defaults
      delete api.defaults.headers.common['Authorization'];
      
      // Also remove from global axios
      delete axios.defaults.headers.common['Authorization'];
      
      // Reset user and error states
      setUser(null);
      setError(null);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    refreshTokenStatus,
    api
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
