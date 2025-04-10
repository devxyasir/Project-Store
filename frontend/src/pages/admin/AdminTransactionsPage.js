import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Search,
  CheckCircle,
  CancelOutlined,
  Visibility,
  ReceiptLong,
  Delete,
  Warning,
} from '@mui/icons-material';
import axios from 'axios';

const AdminTransactionsPage = () => {
  const theme = useTheme();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const transactionIdFromUrl = queryParams.get('id');
  const verifiedFilterFromUrl = queryParams.get('verified');

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState(verifiedFilterFromUrl || 'all');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [operationSuccessful, setOperationSuccessful] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const ITEMS_PER_PAGE = 10;

  // Initial load
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions
  useEffect(() => {
    if (!transactions.length) {
      setFilteredTransactions([]);
      return;
    }

    // First filter by verification status
    let filtered = [...transactions];
    
    if (verifiedFilter === 'verified') {
      filtered = filtered.filter(transaction => transaction.verified);
    } else if (verifiedFilter === 'pending') {
      filtered = filtered.filter(transaction => !transaction.verified);
    }

    // Then filter by search term
    if (search) {
      filtered = filtered.filter(
        transaction => 
          transaction.txnId.toLowerCase().includes(search.toLowerCase()) ||
          transaction.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          transaction.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
          transaction.product?.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // If transaction ID from URL is provided, highlight that one
    if (transactionIdFromUrl) {
      const transaction = transactions.find(t => t._id === transactionIdFromUrl);
      if (transaction) {
        setTransactionDetails(transaction);
        setDetailsDialogOpen(true);
      }
    }
    
    setFilteredTransactions(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1); // Reset to first page when filters change
  }, [search, verifiedFilter, transactions, transactionIdFromUrl]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/transactions?limit=100');
      
      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setVerifiedFilter(e.target.value);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  // Open verify dialog
  const handleOpenVerifyDialog = (transaction) => {
    setCurrentTransaction(transaction);
    setDialogOpen(true);
  };

  // Close verify dialog
  const handleCloseDialog = () => {
    if (operationSuccessful) {
      fetchTransactions(); // Refresh data if operation was successful
    }
    
    setDialogOpen(false);
    setCurrentTransaction(null);
    setOperationSuccessful(false);
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
    if (operationSuccessful) {
      fetchTransactions(); // Refresh data if operation was successful
    }
    setOperationSuccessful(false);
  };

  // Open transaction details dialog
  const handleOpenDetailsDialog = (transaction) => {
    setTransactionDetails(transaction);
    setDetailsDialogOpen(true);
  };

  // Close transaction details dialog
  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setTransactionDetails(null);
  };

  // Verify transaction
  const handleVerifyTransaction = async () => {
    if (!currentTransaction) return;
    
    try {
      setLoading(true);
      const response = await axios.put(`/api/admin/transactions/${currentTransaction._id}/verify`);
      
      if (response.data.success) {
        setOperationSuccessful(true);
        // Update transaction in state
        setTransactions(prevTransactions => {
          return prevTransactions.map(t => {
            if (t._id === currentTransaction._id) {
              return { ...t, verified: true, verifiedAt: new Date() };
            }
            return t;
          });
        });
      }
    } catch (err) {
      console.error('Error verifying transaction:', err);
      setError('Failed to verify transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    
    try {
      setLoading(true);
      const response = await axios.delete(`/api/admin/transactions/${transactionToDelete._id}`);
      
      if (response.data.success) {
        setOperationSuccessful(true);
        // Remove transaction from state
        setTransactions(prevTransactions => {
          return prevTransactions.filter(t => t._id !== transactionToDelete._id);
        });
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Transactions
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 120,
              bgcolor: theme.palette.primary.main,
              color: 'white',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Transactions
            </Typography>
            <Typography variant="h3">
              {transactions.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 120,
              bgcolor: theme.palette.success.main,
              color: 'white',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Verified
            </Typography>
            <Typography variant="h3">
              {transactions.filter(t => t.verified).length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 120,
              bgcolor: theme.palette.warning.main,
              color: 'white',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Pending
            </Typography>
            <Typography variant="h3">
              {transactions.filter(t => !t.verified).length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by ID, user, or product..."
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
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={verifiedFilter}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="all">All Transactions</MenuItem>
                <MenuItem value="verified">Verified Only</MenuItem>
                <MenuItem value="pending">Pending Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredTransactions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No transactions found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {search 
              ? `No transactions matching "${search}" found.` 
              : verifiedFilter !== 'all' 
                ? `No ${verifiedFilter} transactions found.` 
                : "No transactions in the system."}
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getCurrentPageItems().map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {transaction.txnId}
                    </TableCell>
                    <TableCell>{transaction.user?.name || 'Unknown'}</TableCell>
                    <TableCell>{transaction.product?.title || 'Unknown'}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{transaction.method}</TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell>
                      <Chip
                        icon={transaction.verified ? <CheckCircle /> : <CancelOutlined />}
                        label={transaction.verified ? 'Verified' : 'Pending'}
                        color={transaction.verified ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {!transaction.verified ? (
                        <IconButton
                          color="success"
                          onClick={() => handleOpenVerifyDialog(transaction)}
                          title="Verify Transaction"
                        >
                          <CheckCircle />
                        </IconButton>
                      ) : null}
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDetailsDialog(transaction)}
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(transaction)}
                        title="Delete Transaction"
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

      {/* Verify Transaction Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Verify Transaction</DialogTitle>
        <DialogContent>
          {operationSuccessful ? (
            <Alert
              severity="success"
              icon={<CheckCircle fontSize="inherit" />}
              sx={{ mb: 2 }}
            >
              Transaction verified successfully
            </Alert>
          ) : (
            <>
              <DialogContentText>
                Are you sure you want to verify this transaction?
              </DialogContentText>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Transaction ID:</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {currentTransaction?.txnId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">User:</Typography>
                    <Typography variant="body1">
                      {currentTransaction?.user?.name || 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Amount:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {currentTransaction?.amount ? formatCurrency(currentTransaction.amount) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Product:</Typography>
                    <Typography variant="body1">
                      {currentTransaction?.product?.title || 'Unknown'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {operationSuccessful ? 'Close' : 'Cancel'}
          </Button>
          {!operationSuccessful && (
            <Button
              onClick={handleVerifyTransaction}
              color="success"
              variant="contained"
            >
              Verify
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Transaction Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleCloseDetailsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {transactionDetails && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Transaction Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Transaction ID:</Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                          {transactionDetails.txnId}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Status:</Typography>
                        <Chip
                          icon={transactionDetails.verified ? <CheckCircle /> : <CancelOutlined />}
                          label={transactionDetails.verified ? 'Verified' : 'Pending'}
                          color={transactionDetails.verified ? 'success' : 'warning'}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Created At:</Typography>
                        <Typography variant="body1">
                          {formatDate(transactionDetails.createdAt)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Verified At:</Typography>
                        <Typography variant="body1">
                          {transactionDetails.verifiedAt ? formatDate(transactionDetails.verifiedAt) : 'Not verified yet'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Payment Method:</Typography>
                        <Typography variant="body1">
                          {transactionDetails.method}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Amount:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {formatCurrency(transactionDetails.amount)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      User Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Name:</Typography>
                        <Typography variant="body1">
                          {transactionDetails.user?.name || 'Unknown'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Email:</Typography>
                        <Typography variant="body1">
                          {transactionDetails.user?.email || 'Unknown'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Product Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Title:</Typography>
                        <Typography variant="body1">
                          {transactionDetails.product?.title || 'Unknown'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Price:</Typography>
                        <Typography variant="body1">
                          {transactionDetails.product?.price ? formatCurrency(transactionDetails.product.price) : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>
            Close
          </Button>
          {transactionDetails && !transactionDetails.verified && (
            <Button
              onClick={() => {
                handleCloseDetailsDialog();
                handleOpenVerifyDialog(transactionDetails);
              }}
              color="success"
              variant="contained"
              startIcon={<CheckCircle />}
            >
              Verify Transaction
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Transaction Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          <Box display="flex" alignItems="center">
            <Warning color="error" sx={{ mr: 1 }} />
            Delete Transaction
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction? This will also remove the product from the user's purchases and cannot be undone.
          </DialogContentText>
          {transactionToDelete && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Transaction ID: {transactionToDelete.txnId}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                User: {transactionToDelete.user?.name || 'Unknown'}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Product: {transactionToDelete.product?.title || 'Unknown'}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Amount: {formatCurrency(transactionToDelete.amount)}
              </Typography>
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteTransaction} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTransactionsPage;
