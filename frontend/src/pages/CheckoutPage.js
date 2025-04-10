import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  useTheme,
} from '@mui/material';
import {
  // Payment, // Removed unused import
  ReceiptLong,
  ArrowForward,
  ArrowBack,
  Check,
  AccountBalance,
  CloudDownload,
  Launch,
  ShoppingCart,
} from '@mui/icons-material';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast-styles.css';

const steps = ['Review Order', 'Select Payment Method', 'Complete Payment', 'Download Receipt'];

const CheckoutPage = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  // Get auth context with authHeaders for API calls
  const { isAuthenticated, loading: authLoading, authHeaders } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [transactionResult, setTransactionResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isJazzCashToNayaPay, setIsJazzCashToNayaPay] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderAmount, setSenderAmount] = useState('');
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState({});

  // Fetch available payment methods from the API - enhanced with better error handling
  // Using useCallback to memoize the function for dependency array
  const fetchAvailablePaymentMethods = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Get token for authorization header as a backup to cookies
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      // Use the public 'active-payment-methods' endpoint instead of the admin-only 'payment-methods' endpoint
      const response = await axios.get('/api/settings/active-payment-methods', { headers });
      
      if (response.data.success) {
        setAvailablePaymentMethods(response.data.paymentMethods || {});
      } else {
        console.error('Failed to fetch payment methods:', response.data.message);
        setError('Unable to load payment methods. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError('Failed to connect to the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout', message: 'Please login to continue checkout' } });
      return;
    }

    if (cartItems.length === 0) {
      navigate('/shop');
      return;
    }
    
    // Fetch available payment methods when component mounts
    fetchAvailablePaymentMethods();
  }, [isAuthenticated, cartItems, navigate, authLoading, fetchAvailablePaymentMethods]);

  // Handle next step
  const handleNext = () => {
    // For first step (Review Order), proceed directly
    if (activeStep === 0) {
      setActiveStep((prevStep) => prevStep + 1);
      return;
    }

    // For second step (Select Payment Method), validate payment method selection
    if (activeStep === 1) {
      if (!paymentMethod) {
        setError('Please select a payment method');
        return;
      }

      // Initialize payment with selected method
      handleInitializePayment();
      return;
    }

    // For third step (Complete Payment), validate transaction ID
    if (activeStep === 2) {
      if (!transactionId) {
        setValidationErrors({ transactionId: 'Transaction ID is required' });
        return;
      }

      // Process payment with transaction ID
      handleProcessPayment();
      return;
    }

    // For last step, redirect to downloads page
    if (activeStep === 3) {
      navigate('/purchases');
    }
  };

  // Handle back button
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  // Handle receipt download with option to view
  const handleDownloadReceipt = async (viewOnly = false) => {
    if (!transactionResult || !transactionResult._id) {
      toast.error("Transaction information is missing", { 
        position: "top-center",
        style: {
          background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '10px',
          padding: '16px'
        }
      });
      return;
    }
    
    try {
      // Create the API URL - make sure to use a full URL
      // First check if it's a relative or absolute path
      let apiUrl = '';
      if (process.env.REACT_APP_API_URL) {
        // If we have an API URL from env, use it with proper formatting
        apiUrl = `${process.env.REACT_APP_API_URL}`;
        if (!apiUrl.endsWith('/')) apiUrl += '/';
        apiUrl += `api/payments/receipt/${transactionResult._id}`;
      } else {
        // Fallback to relative path if no API URL specified
        apiUrl = `/api/payments/receipt/${transactionResult._id}`;
      }
      
      console.log('Receipt URL:', apiUrl);
      
      if (viewOnly) {
        // Open receipt in a new tab for viewing
        const newWindow = window.open(apiUrl, '_blank', 'noopener,noreferrer');
        if (newWindow) newWindow.opener = null;
        
        toast.success("Opening receipt in a new tab", { 
          position: "top-center",
          style: {
            background: 'linear-gradient(to right, #00b09b, #96c93d)',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '10px',
            padding: '16px'
          }
        });
        return;
      }
      
      // Otherwise download the file
      // Get the receipt file
      const response = await axios.get(apiUrl, {
        responseType: 'blob',
        headers: authHeaders,
        withCredentials: true
      });
      
      // Check if we got a valid PDF response
      if (response.data && response.data.size > 0) {
        // Create a download link for the PDF
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `receipt-${transactionResult._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Receipt downloaded successfully", { 
          position: "top-center",
          style: {
            background: 'linear-gradient(to right, #00b09b, #96c93d)',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '10px',
            padding: '16px'
          }
        });
      } else {
        throw new Error('Received empty response when downloading receipt');
      }
    } catch (error) {
      console.error('Error handling receipt:', error);
      toast.error("Failed to access receipt. Please try again later.", { 
        position: "top-center",
        style: {
          background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '10px',
          padding: '16px'
        }
      });
    }
  };
  
  // Handle viewing the receipt in a new tab
  const handleViewReceipt = () => {
    handleDownloadReceipt(true);
  };
  
  // Handle view project link - ensure all URLs open in a new tab
  const handleViewProject = async () => {
    if (!transactionResult) {
      toast.error("Transaction information is missing", { 
        position: "top-center",
        style: {
          background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '10px',
          padding: '16px'
        }
      });
      return;
    }
    
    try {
      console.log('Handling view project with transaction:', transactionResult);
      
      // PRIORITY 1: Direct downloadLink from product
      if (transactionResult.product && transactionResult.product.downloadLink) {
        console.log('Using product direct download link:', transactionResult.product.downloadLink);
        const newWindow = window.open(transactionResult.product.downloadLink, '_blank', 'noopener,noreferrer');
        if (newWindow) newWindow.opener = null;
        
        toast.success("Opening project in a new tab", { 
          position: "top-center",
          style: {
            background: 'linear-gradient(to right, #00b09b, #96c93d)',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '10px',
            padding: '16px'
          }
        });
        return;
      }
      
      // PRIORITY 2: External URL directly on transaction
      if (transactionResult.downloadUrl) {
        // If it's a full external URL
        if (transactionResult.downloadUrl.startsWith('http')) {
          console.log('Opening external URL from transaction:', transactionResult.downloadUrl);
          const newWindow = window.open(transactionResult.downloadUrl, '_blank', 'noopener,noreferrer');
          if (newWindow) newWindow.opener = null;
          
          toast.success("Opening project in a new tab", { 
            position: "top-center",
            style: {
              background: 'linear-gradient(to right, #00b09b, #96c93d)',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '10px',
              padding: '16px'
            }
          });
          return;
        }
        
        // If it's our API endpoint URL
        if (transactionResult.downloadUrl.includes('/api/payments/download/')) {
          try {
            console.log('Fetching external URL from API endpoint...');
            // Extract the secure token
            const secureToken = transactionResult.downloadUrl.split('/').pop();
            
            // Call our API to get the actual external URL
            const response = await axios.get(`/api/payments/download/${secureToken}`, {
              headers: authHeaders
            });
            
            if (response.data && response.data.success && response.data.downloadUrl) {
              console.log('Got external URL from API:', response.data.downloadUrl);
              // Open the external URL in a new tab
              const newWindow = window.open(response.data.downloadUrl, '_blank', 'noopener,noreferrer');
              if (newWindow) newWindow.opener = null;
              
              toast.success("Opening project in a new tab", { 
                position: "top-center",
                style: {
                  background: 'linear-gradient(to right, #00b09b, #96c93d)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  padding: '16px'
                }
              });
              return;
            } else {
              throw new Error('Invalid response from API');
            }
          } catch (apiError) {
            console.error('Error fetching download URL:', apiError);
            throw apiError;
          }
        }
      }
      
      // FALLBACK: No download link available
      console.error('No download link available in transaction result:', transactionResult);
      toast.error("Project link is not available", { 
        position: "top-center",
        style: {
          background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '10px',
          padding: '16px'
        }
      });
    } catch (error) {
      console.error('Error handling project link:', error);
      toast.error("Failed to access project. Please try again later.", { 
        position: "top-center",
        style: {
          background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '10px',
          padding: '16px'
        }
      });
    }
  };
  
  // Handle payment method selection
  const handlePaymentMethodChange = (event) => {
    const selectedMethod = event.target.value;
    setPaymentMethod(selectedMethod);
    
    // Check if JazzCash to NayaPay is selected
    const isJazzCashNayaPay = selectedMethod === 'JazzCashToNayaPay';
    setIsJazzCashToNayaPay(isJazzCashNayaPay);
    
    console.log(`Selected payment method: ${selectedMethod}. Is JazzCashToNayaPay: ${isJazzCashNayaPay}`);
    
    // Reset validation fields when payment method changes
    setTransactionId('');
    setSenderName('');
    
    // Reset validation errors
    setValidationErrors({});
    setError('');
    
    // If JazzCashToNayaPay and we have cart items, pre-fill the amount field
    if (isJazzCashNayaPay && cartItems.length > 0) {
      const total = getTotalPrice();
      setSenderAmount(total.toString());
      console.log('Pre-filled sender amount:', total);
    } else {
      setSenderAmount('');
    }
  };

  // Handle transaction ID input
  const handleTransactionIdChange = (event) => {
    setTransactionId(event.target.value);
    if (validationErrors.transactionId) {
      setValidationErrors({ ...validationErrors, transactionId: '' });
    }
  };

  // Handle sender name input
  const handleSenderNameChange = (event) => {
    setSenderName(event.target.value);
    if (validationErrors.senderName) {
      setValidationErrors({ ...validationErrors, senderName: '' });
    }
  };
  
  // Handle sender amount input
  const handleSenderAmountChange = (event) => {
    const value = event.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setSenderAmount(value);
      if (validationErrors.senderAmount) {
        setValidationErrors({ ...validationErrors, senderAmount: '' });
      }
    }
  };

  // Initialize payment - enhanced with better cookie handling
  const handleInitializePayment = async () => {
    if (cartItems.length === 0) return;
    
    // Validate payment method is selected
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }
    
    setLoading(true);
    setError('');
    setValidationErrors({});
    
    try {
      // Get the total price of all items in cart
      const totalPrice = getTotalPrice();
      
      // Collect all product IDs in the cart
      const productIds = cartItems.map(item => item.productId || item._id);
      
      // For this implementation, we'll use the first product
      const productId = productIds[0];
      
      if (!productId) {
        console.error('Product ID is missing from cart items', cartItems);
        setError('Unable to find product ID. Please try again or contact support.');
        setLoading(false);
        return;
      }
      
      console.log('Initializing payment with:', { 
        productId, 
        paymentMethod,
        totalAmount: totalPrice
      });
      
      // Get token for authorization header as a backup to cookies
      const token = localStorage.getItem('token');
      const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      // Use axios directly with both cookie and token authentication
      const response = await axios.post('/api/payments/initialize', {
        productId,
        paymentMethod,
      }, {
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        withCredentials: true // Critical for sending cookies
      });
      
      if (response.data.success) {
        console.log('Payment initialization successful:', response.data);
        setPaymentInfo(response.data.paymentInfo);
        
        // If it's JazzCashToNayaPay, prefill the sender amount
        if (isJazzCashToNayaPay && response.data.paymentInfo) {
          setSenderAmount(response.data.paymentInfo.amount.toString());
          console.log('Pre-filled amount for JazzCash to NayaPay:', response.data.paymentInfo.amount);
        }
        
        setActiveStep((prevStep) => prevStep + 1);
      } else {
        setError(response.data.message || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Payment initialization error:', err.response?.data || err.message);
      
      // Check for auth errors and redirect to login if needed
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        // Save current checkout state to localStorage for after login
        localStorage.setItem('redirectAfterLogin', '/checkout');
        // Redirect after a short delay
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(err.response?.data?.message || 'Failed to initialize payment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Process payment - enhanced with better cookie handling
  const handleProcessPayment = async () => {
    if (!paymentInfo) return;
    
    // Clear any existing messages
    setError('');
    setSuccessMessage('');
    
    // Show loading message
    setError('Verifying your payment... Please wait.');
    
    // Validate form inputs for JazzCash to NayaPay
    if (isJazzCashToNayaPay) {
      const errors = {};
      
      if (!senderName.trim()) {
        errors.senderName = 'Sender name is required';
      }
      
      if (!transactionId.trim()) {
        errors.transactionId = 'Transaction ID is required';
      }
      
      if (!senderAmount) {
        errors.senderAmount = 'Amount is required';
      } else if (parseFloat(senderAmount) !== parseFloat(paymentInfo.amount)) {
        errors.senderAmount = 'Amount must match the product price';
      }
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Processing payment with data:', {
        productId: paymentInfo.productId,
        paymentMethod: paymentInfo.method,
        transactionId,
        senderName: isJazzCashToNayaPay ? senderName : undefined
      });
      
      // Get token for authorization header as a backup to cookies
      const token = localStorage.getItem('token');
      const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      // Use axios directly with both cookie and token authentication
      const response = await axios.post('/api/payments/verify', {
        productId: paymentInfo.productId,
        method: paymentInfo.method,
        txnId: transactionId,
        amount: paymentInfo.amount,
        // Include additional fields for JazzCash to NayaPay verification
        senderName: isJazzCashToNayaPay ? senderName : undefined,
        senderAmount: isJazzCashToNayaPay ? senderAmount : undefined
      }, {
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        withCredentials: true // Critical for sending cookies
      });
      
      if (response.data.success) {
        console.log('Payment verification successful:', response.data);
        
        // Clear error message and set success message
        setError('');
        setSuccessMessage('Payment verified successfully! Your purchase is complete.');
        
        // First set transaction result and update local data
        setTransactionResult(response.data.transaction);
        clearCart(); 
        
        // Update local storage to track purchases
        const currentPurchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
        currentPurchases.push({
          productId: paymentInfo.productId,
          date: new Date().toISOString(),
          method: paymentInfo.method
        });
        localStorage.setItem('userPurchases', JSON.stringify(currentPurchases));
        
        // Show beautiful success toast notification with enhanced styling
        // and use the onClose callback to redirect after toast is done
        toast.success(
          <div className="success-animation">
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>Payment Successful! 🎉</div>
            <div>Your purchase has been completed successfully.</div>
            <div style={{ marginTop: '8px', fontSize: '14px' }}>Redirecting to purchases page...</div>
          </div>, {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: false, // Prevent early dismissal
          pauseOnHover: true,
          draggable: false, // Prevent dragging to ensure message is fully seen
          style: {
            background: 'linear-gradient(to right, #00b09b, #96c93d)',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '10px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          },
          progressStyle: {
            background: 'rgba(255, 255, 255, 0.7)'
          },
          // When toast closes (either by timeout or click), navigate to purchases
          onClose: () => {
            navigate('/purchases');
          }
        });
        
        // Show success step
        setActiveStep((prevStep) => prevStep + 1);
      } else {
        // Show prominent error message
        const errorMsg = response.data.message || 'Payment verification failed';
        
        // Set error and clear success message
        setError(errorMsg);
        setSuccessMessage('');
        
        // Show beautiful error toast notification with enhanced styling
        toast.error(
          <div className="error-animation">
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>Verification Failed</div>
            <div>{errorMsg}</div>
          </div>, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
    } catch (err) {
      console.error('Payment processing error:', err.response?.data || err.message);
      
      // Check for auth errors and redirect to login if needed
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        // Save current checkout state to localStorage for after login
        localStorage.setItem('redirectAfterLogin', '/checkout');
        // Redirect after a short delay
        setTimeout(() => navigate('/login'), 1500);
      } else {
        const errorMsg = err.response?.data?.message || 'Payment verification failed. Please try again.';
        
        // Set error in the prominent message bar and clear success message
        setError(errorMsg);
        setSuccessMessage('');
        
        // Show beautiful error toast notification with enhanced styling
        toast.error(
          <div className="error-animation">
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>Verification Failed</div>
            <div>{errorMsg}</div>
          </div>, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // This duplicate function is removed since we already have a better handleDownloadReceipt function above
  
  // Check if JazzCash to NayaPay is available
  useEffect(() => {
    if (Object.keys(availablePaymentMethods).length > 0) {
      const hasJazzCashToNayaPay = Object.keys(availablePaymentMethods).includes('JazzCashToNayaPay');
      console.log('JazzCash to NayaPay available:', hasJazzCashToNayaPay);
      
      if (hasJazzCashToNayaPay) {
        // Add explicit logging for JazzCash to NayaPay details
        console.log('JazzCash to NayaPay details:', availablePaymentMethods['JazzCashToNayaPay']);
      }
    }
  }, [availablePaymentMethods]);
  
  // Debug cart items and reset payment method if needed
  useEffect(() => {
    if (cartItems.length > 0) {
      console.log('Cart items for checkout:', cartItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  // Render step content based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          // Review Order
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {cartItems.map((item) => (
              <Card key={item._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Box
                        component="img"
                        src={item.images?.[0] || 'https://source.unsplash.com/random?code'}
                        alt={item.title}
                        sx={{ 
                          width: '100%', 
                          height: 100, 
                          objectFit: 'cover',
                          borderRadius: 1 
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={9}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          ${(parseFloat(item.price) * parseInt(item.quantity || 1)).toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Quantity: {item.quantity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Price: ${parseFloat(item.price).toFixed(2)} each
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Rs. {parseFloat(getTotalPrice()).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        );
      
      case 1:
        return (
          // Select Payment Method
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Payment Method
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup
                name="paymentMethod"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                {/* Dynamically render available payment methods */}
                {Object.keys(availablePaymentMethods).map((method) => (
                  <Paper
                    key={method}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: paymentMethod === method ? 
                        `2px solid ${theme.palette.primary.main}` : 
                        `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                    }}
                  >
                    <FormControlLabel
                      value={method}
                      control={<Radio />}
                      label={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle1">{method}</Typography>
                          </Box>
                          {method === 'JazzCashToNayaPay' && (
                            <Typography variant="caption" color="text.secondary" sx={{ pl: 4 }}>
                              (If you're sending money from JazzCash to NayaPay)
                            </Typography>
                          )}
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                  />
                </Paper>
                ))}
              </RadioGroup>
            </FormControl>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              You will be redirected to make a manual payment in the next step. 
              Please have your payment app ready.
            </Alert>
          </Box>
        );
      
      case 2:
        return (
          // Complete Payment
          <Box>
            <Typography variant="h6" gutterBottom>
              Complete Your Payment
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {paymentInfo && (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Please make a payment using your {paymentInfo.method} account to continue.
                </Alert>
                
                <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Payment Amount:
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        ${paymentInfo.amount}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Payment Method:
                      </Typography>
                      <Typography variant="h6">
                        {paymentInfo.method}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Send Payment To:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {paymentInfo.recipientName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Account Number:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {paymentInfo.recipientNumber}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
                
                {/* Direct Error/Success Messages */}
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ my: 2, fontSize: '1rem' }}
                    variant="filled"
                  >
                    {error}
                  </Alert>
                )}
                
                {successMessage && (
                  <Alert 
                    severity="success" 
                    sx={{ my: 2, fontSize: '1rem' }}
                    variant="filled"
                  >
                    {successMessage}
                  </Alert>
                )}
                
                <Typography variant="subtitle1" gutterBottom>
                  After making the payment, enter the transaction ID below:
                </Typography>
                
                <TextField
                  fullWidth
                  label="Transaction ID"
                  value={transactionId}
                  onChange={handleTransactionIdChange}
                  error={!!validationErrors.transactionId}
                  helperText={validationErrors.transactionId}
                  placeholder="Enter the transaction ID from your payment app"
                  margin="normal"
                  required
                  sx={{ mb: 2 }}
                />
                
                {/* Additional fields for JazzCash to NayaPay verification */}
                {isJazzCashToNayaPay && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
                    <Typography variant="subtitle1" gutterBottom color="info.dark">
                      JazzCash to NayaPay Transfer Verification
                    </Typography>
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Please provide the exact sender name and amount as shown in the NayaPay confirmation email.
                    </Alert>
                    
                    <TextField
                      fullWidth
                      label="Sender Name"
                      value={senderName}
                      onChange={handleSenderNameChange}
                      error={!!validationErrors.senderName}
                      helperText={validationErrors.senderName || "Enter the exact name shown as 'Source Acc. Title' in the confirmation email"}
                      placeholder="e.g., John Smith"
                      margin="normal"
                      required
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Amount Sent (PKR)"
                      value={senderAmount}
                      onChange={handleSenderAmountChange}
                      error={!!validationErrors.senderAmount}
                      helperText={validationErrors.senderAmount || "Enter the exact amount shown in the confirmation email"}
                      placeholder="e.g., 500"
                      margin="normal"
                      required
                      sx={{ mb: 2 }}
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    />
                  </Box>
                )}
                
                {error && (
                  <Alert severity="error" sx={{ mt: 3, mb: 3 }}>
                    {error}
                  </Alert>
                )}
                
                <Alert severity="warning" sx={{ mt: 3 }}>
                  Please enter the correct transaction ID. Incorrect IDs will delay your purchase verification.
                </Alert>
              </Box>
            )}
          </Box>
        );
      
      case 3:
        return (
          // Download Receipt
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Successful!
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 4,
                px: 3,
                background: 'linear-gradient(135deg, #d4fc79, #96e6a1)',
                borderRadius: 3,
                mb: 4,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                animation: 'fadeIn 0.5s ease-in-out'
              }}
            >
              <Check sx={{ 
                fontSize: 70, 
                color: '#2e7d32', 
                mb: 2,
                animation: 'pulse 1.5s infinite'
              }} />
              <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold' }} gutterBottom>
                Your payment has been processed successfully!
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#2e7d32', mt: 1 }}>
                Your purchase is now ready to use
              </Typography>
            </Box>
            
            <style jsx global>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }
            `}</style>
            
            {transactionResult && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Access your purchase:
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      startIcon={<Launch />}
                      onClick={handleViewProject}
                      sx={{ mb: 2, mt: 2 }}
                    >
                      Open Project in New Tab
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      size="large"
                      startIcon={<CloudDownload />}
                      sx={{ mt: 1 }}
                      onClick={handleViewProject}
                    >
                      Download Project Files
                    </Button>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Your receipt:
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      size="large"
                      startIcon={<Launch />}
                      onClick={handleViewReceipt}
                      sx={{ mt: 2, mb: 2 }}
                    >
                      View Receipt
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      size="large"
                      startIcon={<ReceiptLong />}
                      onClick={handleDownloadReceipt}
                      sx={{ mb: 2 }}
                    >
                      Download Receipt
                    </Button>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                      Save your receipt for your records
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body1" paragraph>
                You can access your purchases anytime from your dashboard.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={() => navigate('/purchases')}
                  sx={{ px: 3, py: 1.2, borderRadius: 2, fontWeight: 'bold' }}
                >
                  View My Purchases
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/')}
                  sx={{ px: 3, py: 1.2, borderRadius: 2, fontWeight: 'bold' }}
                >
                  Continue Shopping
                </Button>
              </Box>
            </Box>
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };

  if (authLoading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading checkout...</Typography>
      </Container>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please login to continue with checkout
        </Alert>
        <Button variant="contained" color="primary" onClick={() => navigate('/login', { state: { from: '/checkout' } })}>Login</Button>
      </Container>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Your cart is empty
        </Alert>
        <Button variant="contained" color="primary" onClick={() => navigate('/shop')}>Continue Shopping</Button>
      </Container>
    );
  }
  


  return (
    <Container maxWidth="md">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">
          Home
        </Link>
        <Link color="inherit" href="/cart">
          Cart
        </Link>
        <Typography color="text.primary">Checkout</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
        Checkout
      </Typography>

      {/* Prominent Error Message Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 4, fontSize: '1rem', padding: '10px 16px' }}
          variant="filled"
        >
          {error}
        </Alert>
      )}
      
      {/* Prominent Success Message Display */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 4, fontSize: '1rem', padding: '10px 16px' }}
          variant="filled"
        >
          {successMessage}
        </Alert>
      )}

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 5 }} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        {getStepContent(activeStep)}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          startIcon={<ArrowBack />}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={loading}
          endIcon={activeStep === steps.length - 1 ? null : <ArrowForward />}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : activeStep === steps.length - 1 ? (
            'Finish'
          ) : activeStep === 2 ? (
            'Verify Payment'
          ) : activeStep === 1 ? (
            'Continue to Payment'
          ) : (
            'Next'
          )}
        </Button>
      </Box>
      {/* React Toastify Container */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName={"toast-container"}
        bodyClassName={"toast-body"}
        theme="colored"
      />
    </Container>
  );
};

export default CheckoutPage;
