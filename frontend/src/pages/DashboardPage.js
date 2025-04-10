import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
} from '@mui/material';
import {
  ShoppingBag,
  Receipt,
  Settings,
  ArrowForward,
  Person,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecentPurchases();
    }
  }, [isAuthenticated]);

  const fetchRecentPurchases = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/payments/purchases?limit=3');
      
      if (response.data.success) {
        setRecentPurchases(response.data.purchases);
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError('Failed to load recent purchases. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <Alert severity="warning">
          You need to be logged in to view your dashboard.
        </Alert>
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Log In
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={4}>
        {/* User Profile Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 60,
                  height: 60,
                  mr: 2,
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">{user?.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List component="nav" disablePadding>
              <ListItemButton component={RouterLink} to="/dashboard">
                <ListItemIcon>
                  <DashboardIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
              <ListItemButton component={RouterLink} to="/purchases">
                <ListItemIcon>
                  <ShoppingBag color="primary" />
                </ListItemIcon>
                <ListItemText primary="My Purchases" />
              </ListItemButton>
              <ListItemButton component={RouterLink} to="/receipts">
                <ListItemIcon>
                  <Receipt color="primary" />
                </ListItemIcon>
                <ListItemText primary="Receipts" />
              </ListItemButton>
              <ListItemButton>
                <ListItemIcon>
                  <Settings color="primary" />
                </ListItemIcon>
                <ListItemText primary="Account Settings" />
              </ListItemButton>
            </List>
          </Paper>
        </Grid>

        {/* Dashboard Content */}
        <Grid item xs={12} md={8}>
          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                }}
              >
                <ShoppingBag sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h5" gutterBottom>
                  My Projects
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {loading ? <CircularProgress size={30} color="inherit" /> : recentPurchases.length}
                </Typography>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/purchases"
                  size="small"
                  sx={{
                    mt: 2,
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                    },
                  }}
                  endIcon={<ArrowForward />}
                >
                  View All
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: theme.palette.secondary.main,
                  color: 'white',
                }}
              >
                <Person sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h5" gutterBottom>
                  Account Type
                </Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                  {user?.role || 'User'}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    mt: 2,
                    bgcolor: 'white',
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                    },
                  }}
                  endIcon={<ArrowForward />}
                >
                  Manage Account
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Purchases */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Purchases
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : recentPurchases.length > 0 ? (
              <Grid container spacing={2}>
                {recentPurchases.map((purchase) => (
                  <Grid item xs={12} key={purchase._id}>
                    <Card sx={{ display: 'flex', height: '100%' }}>
                      <CardActionArea
                        component={RouterLink}
                        to={`/product/${purchase.product.slug}`}
                        sx={{ display: 'flex', alignItems: 'stretch', height: '100%' }}
                      >
                        <CardMedia
                          component="img"
                          sx={{ width: 100 }}
                          image={purchase.product.images?.[0] || 'https://source.unsplash.com/random?code'}
                          alt={purchase.product.title}
                        />
                        <CardContent sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" component="div">
                            {purchase.product.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Purchased on: {new Date(purchase.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                            ${purchase.amount}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  You haven't made any purchases yet.
                </Typography>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/shop"
                  sx={{ mt: 2 }}
                >
                  Browse Projects
                </Button>
              </Box>
            )}

            {recentPurchases.length > 0 && (
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button
                  component={RouterLink}
                  to="/purchases"
                  endIcon={<ArrowForward />}
                >
                  View All Purchases
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
