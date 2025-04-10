import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  Tabs,
  Tab,
  IconButton,
  useTheme,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ShoppingCart,
  Bolt,
  ArrowBack,
  Code,
  Storage,
  Language,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/products/${slug}`);
        
        if (res.data.success) {
          setProduct(res.data.product);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle image change
  const handleImageChange = (index) => {
    setCurrentImage(index);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setMessage({
        type: 'warning',
        text: 'You need to log in to add items to cart.'
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    const result = addToCart(product);
    
    if (result.success) {
      setMessage({
        type: 'success',
        text: 'Product added to cart!'
      });
    } else {
      setMessage({
        type: 'error',
        text: result.message || 'Failed to add product to cart.'
      });
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setMessage({
        type: 'warning',
        text: 'You need to log in to purchase.'
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    const result = addToCart(product);
    
    if (result.success) {
      navigate('/checkout');
    } else {
      if (result.message === 'Item already in cart') {
        // If already in cart, just go to checkout
        navigate('/checkout');
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Failed to process your request.'
        });
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Product not found.'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">
          Home
        </Link>
        <Link color="inherit" href="/shop">
          Shop
        </Link>
        <Typography color="text.primary">{product.title}</Typography>
      </Breadcrumbs>

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

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 2 }}>
            <CardMedia
              component="img"
              image={product.images[currentImage] || 'https://source.unsplash.com/random?code'}
              alt={product.title}
              sx={{ 
                height: 400, 
                objectFit: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </Card>
          <Grid container spacing={1}>
            {product.images.map((image, index) => (
              <Grid item key={index} xs={3}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: index === currentImage ? `2px solid ${theme.palette.primary.main}` : 'none',
                    opacity: index === currentImage ? 1 : 0.7,
                    transition: 'all 0.2s',
                    '&:hover': {
                      opacity: 1,
                    }
                  }}
                  onClick={() => handleImageChange(index)}
                >
                  <CardMedia
                    component="img"
                    image={image}
                    alt={`${product.title} - Image ${index + 1}`}
                    height="80"
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {product.title}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>  
              Rs. {product.price}
            </Typography>
          </Box>
          
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3, 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 0, 0.1)' : 'rgba(255, 255, 0, 0.2)',
              borderRadius: 2,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              {product.buyerCount || 0} users have already bought this project
            </Typography>
          </Paper>
          
          <Typography variant="body1" paragraph>
            {product.shortDescription}
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Technologies:
            </Typography>
            <Box>
              {product.technologies.map((tech, index) => (
                <Chip
                  key={index}
                  label={tech}
                  sx={{ mr: 1, mb: 1 }}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Category:
            </Typography>
            <Chip
              label={product.category?.name || 'Uncategorized'}
              color="secondary"
            />
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={!isAuthenticated}
              >
                Add to Cart
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                startIcon={<Bolt />}
                onClick={handleBuyNow}
                disabled={!isAuthenticated}
              >
                Buy Now
              </Button>
            </Grid>
          </Grid>
          
          {!isAuthenticated && (
            <Alert severity="info" sx={{ mt: 2 }}>
              You need to <Link href="/login">log in</Link> to purchase this project.
            </Alert>
          )}
        </Grid>
      </Grid>

      {/* Product Details Tabs */}
      <Box sx={{ mt: 6 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="product details tabs"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
          }}
        >
          <Tab 
            label="Description" 
            icon={<Language />} 
            iconPosition="start"
          />
          <Tab 
            label="Features" 
            icon={<Code />} 
            iconPosition="start"
          />
          <Tab 
            label="Requirements" 
            icon={<Storage />} 
            iconPosition="start"
          />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" component="div">
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Key Features
          </Typography>
          <ul>
            <li>Complete source code with documentation</li>
            <li>Modern architecture and design patterns</li>
            <li>Responsive and user-friendly interface</li>
            <li>Optimized for performance and scalability</li>
            <li>Easy to customize and extend</li>
            <li>Built with {product.technologies.join(', ')}</li>
          </ul>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            System Requirements
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Minimum Requirements
                </Typography>
                <ul>
                  <li>Node.js 14+ (for Node.js projects)</li>
                  <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                  <li>Basic understanding of {product.technologies[0]}</li>
                  <li>2GB RAM minimum</li>
                </ul>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Recommended
                </Typography>
                <ul>
                  <li>Node.js 16+ (for Node.js projects)</li>
                  <li>4GB RAM or more</li>
                  <li>Knowledge of {product.technologies.join(' and ')}</li>
                  <li>Code editor like VS Code</li>
                </ul>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default ProductPage;
