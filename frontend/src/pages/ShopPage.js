import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Divider,
  Paper,
  useTheme,
  IconButton,
  Alert,
} from '@mui/material';
import { Search, ShoppingCart, Add, FilterList } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const ShopPage = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // State for products and filters
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: queryParams.get('category') || '',
    technology: queryParams.get('technology') || '',
    search: queryParams.get('search') || '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build query string based on filters
        let queryString = `?page=${currentPage}`;
        if (filters.category) queryString += `&category=${filters.category}`;
        if (filters.technology) queryString += `&technology=${filters.technology}`;
        if (filters.search) queryString += `&search=${filters.search}`;

        const res = await axios.get(`/api/products${queryString}`);
        
        if (res.data.success) {
          setProducts(res.data.products);
          setTotalPages(res.data.totalPages);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load products. Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, currentPage]);

  // Fetch categories and technologies for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch categories
        const categoryRes = await axios.get('/api/categories');
        if (categoryRes.data.success) {
          setCategories(categoryRes.data.categories);
        }

        // In a real app, technologies would come from an API
        // For now, we'll use a static list
        setTechnologies([
          'React', 'Angular', 'Vue', 'Node.js', 'Express', 
          'MongoDB', 'MySQL', 'PostgreSQL', 'Python', 'Django',
          'Flask', 'Java', 'Spring Boot', 'PHP', 'Laravel',
          'TensorFlow', 'PyTorch', 'React Native', 'Flutter'
        ]);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
    
    // Update URL query params
    const newParams = new URLSearchParams(location.search);
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    navigate(`${location.pathname}?${newParams.toString()}`);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
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

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      category: '',
      technology: '',
      search: '',
    });
    navigate(location.pathname);
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Project Marketplace
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Browse our collection of high-quality programming projects
        </Typography>
      </Box>

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

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
          <Button 
            size="small" 
            onClick={handleClearFilters} 
            sx={{ ml: 'auto' }}
          >
            Clear All
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search Projects"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category.slug}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Technology</InputLabel>
              <Select
                label="Technology"
                name="technology"
                value={filters.technology}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Technologies</MenuItem>
                {technologies.map((tech) => (
                  <MenuItem key={tech} value={tech.toLowerCase()}>
                    {tech}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Product Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {products.length > 0 ? (
              products.map((product) => (
                <Grid item key={product._id} xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={product.images[0] || 'https://source.unsplash.com/random?code'}
                      alt={product.title}
                      height="200"
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {product.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {product.shortDescription}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        {product.technologies.slice(0, 3).map((tech, index) => (
                          <Chip
                            key={index}
                            label={tech}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                        {product.technologies.length > 3 && (
                          <Chip
                            label={`+${product.technologies.length - 3}`}
                            size="small"
                            sx={{ mb: 1 }}
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 0, 0.1)' : 'rgba(255, 255, 0, 0.2)',
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                          {product.buyerCount || 0} users have already bought this project
                        </Typography>
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                      <Button
                        size="small"
                        color="primary"
                        component={RouterLink}
                        to={`/product/${product.slug}`}
                      >
                        View Details
                      </Button>
                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{ fontWeight: 700 }}
                      >
                        ${product.price}
                      </Typography>
                      <IconButton
                        color="primary"
                        onClick={() => handleAddToCart(product)}
                        size="small"
                        sx={{ 
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark,
                          }
                        }}
                      >
                        <Add />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', width: '100%', py: 4 }}>
                <Typography variant="h6" color="textSecondary">
                  No products found matching your criteria.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClearFilters}
                  sx={{ mt: 2 }}
                >
                  Clear Filters
                </Button>
              </Box>
            )}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ShopPage;
