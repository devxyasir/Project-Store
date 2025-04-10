import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  TextField,
  Paper,
  Alert,
  Breadcrumbs,
  Link,
  useTheme,
} from '@mui/material';
import {
  Delete,
  Add,
  Remove,
  ShoppingBag,
  ArrowForward,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [message, setMessage] = useState({ type: '', text: '' });

  // Handle remove from cart
  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    
    setMessage({
      type: 'success',
      text: 'Item removed from cart'
    });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
  };

  // Handle quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      setMessage({
        type: 'warning',
        text: 'Your cart is empty'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return;
    }
    
    navigate('/checkout');
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    navigate('/shop');
  };

  return (
    <Container>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" component={RouterLink} to="/">
          Home
        </Link>
        <Typography color="text.primary">Cart</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        Your Cart
      </Typography>

      {/* Alert Message */}
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {!isAuthenticated ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" paragraph>
            Please log in to view your cart
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/login"
            sx={{ mr: 2 }}
          >
            Log In
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/register"
          >
            Create Account
          </Button>
        </Paper>
      ) : cartItems.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 60, color: 'grey.500', mb: 2 }} />
          <Typography variant="h5" paragraph>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Browse our collection and add some projects to your cart.
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/shop"
            size="large"
          >
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            {cartItems.map((item) => (
              <Card key={item._id} sx={{ mb: 3, position: 'relative' }}>
                <Grid container>
                  <Grid item xs={12} sm={4}>
                    <CardMedia
                      component="img"
                      image={item.images?.[0] || 'https://source.unsplash.com/random?code'}
                      alt={item.title}
                      sx={{ height: '100%', minHeight: 180 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <CardContent>
                      <Typography variant="h6" component={RouterLink} to={`/product/${item.slug}`} sx={{ color: 'inherit', textDecoration: 'none' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {item.shortDescription}
                      </Typography>
                      <Box sx={{ display: 'flex', mt: 2, alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ mr: 1 }}>
                          Price:
                        </Typography>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                          ${item.price}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item._id, Math.max(1, item.quantity - 1))}
                          sx={{ 
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '4px 0 0 4px'
                          }}
                        >
                          <Remove />
                        </IconButton>
                        <TextField
                          size="small"
                          value={item.quantity}
                          InputProps={{
                            readOnly: true,
                            inputProps: { min: 1, style: { textAlign: 'center' } },
                            sx: { 
                              width: '50px',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 0
                              }
                            }
                          }}
                        />
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          sx={{ 
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '0 4px 4px 0'
                          }}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveItem(item._id)}
                        title="Remove from cart"
                      >
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Grid>
                </Grid>
              </Card>
            ))}
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleContinueShopping}
                startIcon={<ShoppingBag />}
              >
                Continue Shopping
              </Button>
            </Box>
          </Grid>
          
          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {cartItems.map((item) => (
                <Box 
                  key={item._id} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mb: 1.5
                  }}
                >
                  <Typography variant="body2">
                    {item.title} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mb: 3
                }}
              >
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                  Rs. {getTotalPrice().toFixed(2)}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                endIcon={<ArrowForward />}
                onClick={handleProceedToCheckout}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </Button>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  Secure payment processing
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CartPage;
