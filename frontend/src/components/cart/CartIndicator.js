import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { useCart } from '../../contexts/CartContext';

/**
 * A debug component that shows the current cart status
 * This helps verify that cart persistence is working correctly
 */
const CartIndicator = () => {
  const { cartItems, getCartCount } = useCart();
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        position: 'fixed',
        bottom: 16,
        right: 16,
        padding: 2,
        zIndex: 1000,
        opacity: 0.85,
        maxWidth: 300,
        display: process.env.NODE_ENV === 'development' ? 'block' : 'none'
      }}
    >
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        Cart Status 
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
        <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
          Items in cart:
        </Typography>
        <Chip 
          label={getCartCount()}
          color={getCartCount() > 0 ? "success" : "default"}
          size="small"
        />
      </Box>
      {cartItems.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Items will persist for 1 day via cookies
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CartIndicator;
