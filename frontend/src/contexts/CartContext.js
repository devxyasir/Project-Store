import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import Cookies from 'js-cookie';

// Create Cart Context
const CartContext = createContext();

// Cookie name for cart storage
const CART_COOKIE_NAME = 'user_cart';

// Cookie expiry in days
const COOKIE_EXPIRY = 1; // 1 day

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize cart from cookies and localStorage (for backward compatibility)
  useEffect(() => {
    // First try to get cart from cookies
    const cookieCart = Cookies.get(CART_COOKIE_NAME);
    
    if (cookieCart) {
      try {
        setCartItems(JSON.parse(cookieCart));
        console.log('Cart loaded from cookies', JSON.parse(cookieCart));
      } catch (err) {
        console.error('Error parsing cookie cart:', err);
        setCartItems([]);
      }
    } else {
      // Fallback to localStorage for backward compatibility
      const savedCart = localStorage.getItem('cart');
      
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
          console.log('Cart loaded from localStorage', parsedCart);
          
          // Migrate from localStorage to cookies
          Cookies.set(CART_COOKIE_NAME, savedCart, { expires: COOKIE_EXPIRY, path: '/' });
        } catch (err) {
          console.error('Error parsing localStorage cart:', err);
          setCartItems([]);
        }
      }
    }
  }, []);

  // Save cart to both cookies and localStorage when it changes
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const cartJson = JSON.stringify(cartItems);
      // Save to both cookies and localStorage for redundancy
      Cookies.set(CART_COOKIE_NAME, cartJson, { expires: COOKIE_EXPIRY, path: '/' });
      localStorage.setItem('cart', cartJson);
      console.log('Cart saved with items:', cartItems.length);
    } else {
      // Clear storage if cart is empty
      Cookies.remove(CART_COOKIE_NAME, { path: '/' });
      localStorage.removeItem('cart');
      console.log('Cart is empty, storage cleared');
    }
  }, [cartItems]);

  // Add item to cart - now works without authentication
  const addToCart = (product) => {
    setError(null);
    
    // Check if item already exists in cart
    const itemExists = cartItems.find(item => item._id === product._id);
    
    if (itemExists) {
      // Instead of just showing an error, update quantity
      updateQuantity(product._id, itemExists.quantity + 1);
      return { success: true, message: 'Item quantity updated in cart' };
    }
    
    // Create a normalized product with price as a fixed number
    const normalizedProduct = {
      ...product,
      price: parseFloat(product.price), // Ensure price is a number
      quantity: 1
    };
    
    // Log the normalized price for debugging
    console.log('Adding product to cart with normalized price:', normalizedProduct.price);
    
    // Add item to cart with quantity 1
    setCartItems(prevItems => [...prevItems, normalizedProduct]);
    
    // Log the operation for debugging
    console.log('Added to cart:', product.name || product.title);
    
    return { success: true, message: 'Item added to cart' };
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      // Ensure price is always treated as a number
      const price = parseFloat(item.price);
      const quantity = parseInt(item.quantity || 1);
      
      // Log the calculation for debugging
      console.log(`Calculating price for ${item.title}: ${price} * ${quantity} = ${price * quantity}`);
      
      return total + (price * quantity);
    }, 0);
  };

  // Get cart items count
  const getCartCount = () => {
    return cartItems.length;
  };

  // Context value
  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
