import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Container,
  Paper,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { ShoppingCart, Code, Search, Devices } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await axios.get('/api/products?featured=true&limit=4');
        if (res.data.success) {
          setFeaturedProducts(res.data.products);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          color: 'white',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://source.unsplash.com/random?coding)',
          height: { xs: '400px', md: '500px' },
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          },
        }}
      >
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ maxWidth: { xs: '100%', md: '60%' } }}>
            <Typography
              component="h1"
              variant="h2"
              color="inherit"
              gutterBottom
              sx={{
                fontWeight: 700,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              Supercharge Your Projects
            </Typography>
            <Typography
              variant="h5"
              color="inherit"
              paragraph
              sx={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                mb: 4,
              }}
            >
              Browse and purchase high-quality programming projects.
              From web apps to machine learning models, we've got you covered.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/shop"
                endIcon={<Search />}
                sx={{ fontWeight: 600 }}
              >
                Browse Projects
              </Button>
              <Button
                variant="outlined"
                size="large"
                color="inherit"
                component={RouterLink}
                to={isAuthenticated ? '/dashboard' : '/login'}
                sx={{
                  borderColor: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {isAuthenticated ? 'Dashboard' : 'Login / Sign Up'}
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Container>
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="textPrimary"
            gutterBottom
          >
            Why Choose Project Store?
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="textSecondary"
            paragraph
            sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
          >
            We offer a curated collection of high-quality programming projects
            built by experienced developers using the latest technologies.
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" sx={{ p: 2 }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <Code sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" gutterBottom>
                  Quality Code
                </Typography>
                <Typography color="textSecondary">
                  Well-documented, clean, and maintainable code that follows best practices.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" sx={{ p: 2 }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <Devices sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" gutterBottom>
                  Modern Technologies
                </Typography>
                <Typography color="textSecondary">
                  Projects built with the latest frameworks and libraries, ready for production.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" sx={{ p: 2 }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.success.main,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <ShoppingCart sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" gutterBottom>
                  Instant Access
                </Typography>
                <Typography color="textSecondary">
                  Purchase and download instantly. Get started with your project right away.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Products Section */}
      <Box sx={{ py: 8, backgroundColor: theme.palette.background.default }}>
        <Container>
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="textPrimary"
            gutterBottom
          >
            Featured Projects
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="textSecondary"
            paragraph
            sx={{ mb: 6 }}
          >
            Check out our most popular programming projects
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={4}>
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <Grid item key={product._id} xs={12} sm={6} md={3}>
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
                        <Typography variant="body2" color="textSecondary" paragraph>
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
                        </Box>
                      </CardContent>
                      <CardActions>
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
                          sx={{ ml: 'auto', fontWeight: 700 }}
                        >
                          ${product.price}
                        </Typography>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', width: '100%', py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No featured projects available at the moment.
                  </Typography>
                </Box>
              )}
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to="/shop"
            >
              View All Projects
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box
        sx={{
          py: 8,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.87)' : theme.palette.primary.main,
          color: 'white',
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" gutterBottom>
                Ready to Start Building?
              </Typography>
              <Typography variant="h6" paragraph>
                Explore our collection of projects and find the perfect one for your needs.
                Each project comes with full source code and documentation.
              </Typography>
            </Grid>
            <Grid item xs={12} md={5} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/shop"
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                  fontWeight: 600,
                  px: 4,
                }}
              >
                Browse Projects
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
