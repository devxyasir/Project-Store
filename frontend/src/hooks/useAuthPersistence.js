import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

/**
 * Custom hook to ensure authentication persistence across page reloads
 * This hook will:
 * 1. Periodically refresh the auth token
 * 2. Handle window focus/blur events to check auth status
 * 3. Keep the session alive with a heartbeat request
 */
const useAuthPersistence = () => {
  // Don't destructure getUserProfile as it's not directly accessible
  const { isAuthenticated, user, loading, api } = useAuth();
  const refreshTimerRef = useRef(null);
  const heartbeatTimerRef = useRef(null);
  
  // Set up token refresh based on token expiration time
  useEffect(() => {
    // Don't do anything if still loading or not authenticated
    if (loading || !isAuthenticated) return;
    
    console.log('Setting up authentication persistence for user:', user?._id);
    
    // Clear any existing timers
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    
    // Calculate when to refresh the token (30 minutes before expiration)
    const setupTokenRefresh = () => {
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      if (!tokenExpiration) return;
      
      const expirationTime = parseInt(tokenExpiration, 10);
      const currentTime = Date.now();
      
      // Time until expiration in milliseconds
      const timeToExpiration = expirationTime - currentTime;
      
      // If token expires in less than 30 minutes, refresh now
      // Otherwise, set timer to refresh 30 minutes before expiration
      const refreshTime = Math.max(0, timeToExpiration - (30 * 60 * 1000));
      
      console.log(`Token will be refreshed in ${refreshTime / 60000} minutes`);
      
      refreshTimerRef.current = setTimeout(() => {
        console.log('Refreshing auth token...');
        // Instead of calling getUserProfile directly, make a call to the profile endpoint
        axios.get('/api/auth/profile', { withCredentials: true })
          .then(response => {
            console.log('Token refreshed successfully');
            if (response.data.token) {
              localStorage.setItem('token', response.data.token);
              // Calculate and store new expiration time
              const loginTime = Date.now();
              const expirationTime = loginTime + (7 * 24 * 60 * 60 * 1000);
              localStorage.setItem('tokenExpiration', expirationTime.toString());
            }
          })
          .catch(err => console.error('Token refresh failed:', err));
        
        // Setup the next refresh
        setupTokenRefresh();
      }, refreshTime);
    };
    
    setupTokenRefresh();
    
    // Setup heartbeat to keep the session alive
    heartbeatTimerRef.current = setInterval(() => {
      // Only send heartbeat if authenticated
      if (isAuthenticated && !loading) {
        axios.get('/api/auth/heartbeat', { withCredentials: true })
          .catch(err => console.log('Heartbeat error (non-critical):', err.message));
      }
    }, 15 * 60 * 1000); // Every 15 minutes
    
    // Check authentication on tab/window focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        console.log('Window focused, checking authentication status...');
        // Make a direct API call instead of using getUserProfile
        axios.get('/api/auth/profile', { withCredentials: true })
          .then(response => {
            console.log('Authentication verified on window focus');
            if (response.data.token) {
              localStorage.setItem('token', response.data.token);
              // Update token expiration
              const loginTime = Date.now();
              const expirationTime = loginTime + (7 * 24 * 60 * 60 * 1000);
              localStorage.setItem('tokenExpiration', expirationTime.toString());
            }
          })
          .catch(err => console.log('Auth check on focus failed:', err.message));
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup function
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, loading, user, api]);
  
  return null; // This hook doesn't return anything, it just performs side effects
};

export default useAuthPersistence;
