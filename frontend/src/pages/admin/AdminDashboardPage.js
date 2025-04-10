import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Link,
  useTheme,
} from '@mui/material';
import {
  People,
  ShoppingBag,
  Category,
  Receipt,
  ArrowUpward,
  ArrowDownward,
  AccountCircle,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    categories: 0,
    transactions: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // In a real application, you would have an API endpoint for dashboard stats
      // For now, we'll use the existing endpoints to get the data we need
      
      // Get users count
      const usersResponse = await axios.get('/api/admin/users');
      
      // Get products count
      const productsResponse = await axios.get('/api/products');
      
      // Get categories count
      const categoriesResponse = await axios.get('/api/categories');
      
      // Get transactions
      const transactionsResponse = await axios.get('/api/admin/transactions?limit=5');
      
      setStats({
        users: usersResponse.data.count || 0,
        products: productsResponse.data.total || 0,
        categories: categoriesResponse.data.count || 0,
        transactions: transactionsResponse.data.total || 0,
      });
      
      setRecentTransactions(transactionsResponse.data.transactions || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -24,
                  right: -24,
                  opacity: 0.2,
                  fontSize: '8rem',
                  transform: 'rotate(15deg)',
                }}
              >
                <People fontSize="inherit" />
              </Box>
              <Typography variant="h5" component="div" gutterBottom>
                Users
              </Typography>
              <Typography variant="h3" component="div" sx={{ mt: 'auto' }}>
                {stats.users}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                backgroundColor: theme.palette.secondary.main,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -24,
                  right: -24,
                  opacity: 0.2,
                  fontSize: '8rem',
                  transform: 'rotate(15deg)',
                }}
              >
                <ShoppingBag fontSize="inherit" />
              </Box>
              <Typography variant="h5" component="div" gutterBottom>
                Products
              </Typography>
              <Typography variant="h3" component="div" sx={{ mt: 'auto' }}>
                {stats.products}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                backgroundColor: theme.palette.success.main,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -24,
                  right: -24,
                  opacity: 0.2,
                  fontSize: '8rem',
                  transform: 'rotate(15deg)',
                }}
              >
                <Category fontSize="inherit" />
              </Box>
              <Typography variant="h5" component="div" gutterBottom>
                Categories
              </Typography>
              <Typography variant="h3" component="div" sx={{ mt: 'auto' }}>
                {stats.categories}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                backgroundColor: theme.palette.warning.main,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -24,
                  right: -24,
                  opacity: 0.2,
                  fontSize: '8rem',
                  transform: 'rotate(15deg)',
                }}
              >
                <Receipt fontSize="inherit" />
              </Box>
              <Typography variant="h5" component="div" gutterBottom>
                Transactions
              </Typography>
              <Typography variant="h3" component="div" sx={{ mt: 'auto' }}>
                {stats.transactions}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recentTransactions.length > 0 ? (
              <List disablePadding>
                {recentTransactions.map((transaction) => (
                  <React.Fragment key={transaction._id}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemIcon>
                        {transaction.verified ? (
                          <ArrowUpward sx={{ color: 'success.main' }} />
                        ) : (
                          <ArrowDownward sx={{ color: 'error.main' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1">
                            <Link
                              component={RouterLink}
                              to={`/admin/transactions?id=${transaction._id}`}
                              color="inherit"
                              sx={{ fontWeight: 500 }}
                            >
                              {transaction.product?.title}
                            </Link>
                          </Typography>
                        }
                        secondary={`${formatDate(transaction.createdAt)} • ${transaction.method} • $${transaction.amount}`}
                      />
                      <Typography
                        variant="body2"
                        color={transaction.verified ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 500 }}
                      >
                        {transaction.verified ? 'Verified' : 'Pending'}
                      </Typography>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No recent transactions found.
                </Typography>
              </Box>
            )}
            
            <Box sx={{ textAlign: 'right', mt: 2 }}>
              <Link component={RouterLink} to="/admin/transactions" variant="body2">
                View All Transactions
              </Link>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Admin Profile
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountCircle sx={{ fontSize: 60, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h5">{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" paragraph>
              You have full administrative rights to manage products, categories, users, and transactions.
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List disablePadding>
              <ListItem sx={{ px: 0 }}>
                <Link component={RouterLink} to="/admin/products/new" variant="body2">
                  Add New Product
                </Link>
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <Link component={RouterLink} to="/admin/categories/new" variant="body2">
                  Add New Category
                </Link>
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <Link component={RouterLink} to="/admin/transactions?verified=false" variant="body2">
                  View Pending Transactions
                </Link>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;
