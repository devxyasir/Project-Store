import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Visibility,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [sortOrder, setSortOrder] = useState({ field: 'createdAt', direction: 'desc' });

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter and sort products
    let result = [...products];
    
    // Apply search filter
    if (search) {
      result = result.filter(
        product => 
          product.title.toLowerCase().includes(search.toLowerCase()) || 
          product.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortOrder.field];
      let bValue = b[sortOrder.field];
      
      // Handle string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredProducts(result);
    setTotalPages(Math.ceil(result.length / ITEMS_PER_PAGE));
    
    // Reset to first page when filter changes
    setCurrentPage(1);
  }, [products, search, sortOrder]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products?limit=100');
      
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    setSortOrder(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      const response = await axios.delete(`/api/products/${productToDelete._id}`);
      
      if (response.data.success) {
        // Remove product from state
        setProducts(products.filter(product => product._id !== productToDelete._id));
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again later.');
    }
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Products Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          component={RouterLink}
          to="/admin/products/add"
          sx={{ mr: 2 }}
        >
          Add New Product
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          component={RouterLink}
          to="/admin/products/new"
        >
          Add Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary" align="right">
              {filteredProducts.length} products found
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredProducts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            {search ? `No products matching "${search}" found.` : "Start by adding a new product."}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={RouterLink}
            to="/admin/products/new"
          >
            Add Product
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('title')}>
                      Title
                      {sortOrder.field === 'title' && (
                        sortOrder.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('price')}>
                      Price
                      {sortOrder.field === 'price' && (
                        sortOrder.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>Buyers</TableCell>
                  <TableCell>Featured</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getCurrentPageItems().map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>{product.category?.name || 'Uncategorized'}</TableCell>
                    <TableCell>Rs. {product.price}</TableCell>
                    <TableCell>{product.buyers?.length || 0}</TableCell>
                    <TableCell>
                      <Chip 
                        color={product.featured ? 'primary' : 'default'} 
                        size="small" 
                        label={product.featured ? 'Featured' : 'Not Featured'} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        component={RouterLink} 
                        to={`/product/${product.slug}`} 
                        color="primary"
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        component={RouterLink}
                        to={`/admin/products/edit/${product._id}`}
                        color="secondary"
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteClick(product)} 
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the product "{productToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProductsPage;
