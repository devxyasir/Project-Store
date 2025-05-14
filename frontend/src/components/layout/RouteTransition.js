import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Preloader from './Preloader';

// Component that tracks route changes and shows preloader during transitions
const RouteTransition = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Monitor location changes to trigger preloader
  useEffect(() => {
    const showPreloader = () => {
      setIsLoading(true);
      
      // Simulate minimum loading time for better UX (at least 1500ms)
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    };
    
    showPreloader();
  }, [location]);

  return (
    <>
      {isLoading && <Preloader />}
      {children}
    </>
  );
};

export default RouteTransition;
